import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, FunnelChart, Funnel, LabelList,
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, GitBranch, Mail, Users } from "lucide-react";

const TYPE_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
const fmt = v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toLocaleString()}`;

const PIPELINE_STAGES = [
  "discovered", "researching", "outreach_pending", "outreach_sent",
  "responded", "negotiating", "contracted", "active", "completed"
];

const STAGE_COLORS_LIST = [
  "#94a3b8","#60a5fa","#818cf8","#a78bfa","#f59e0b","#f97316","#34d399","#10b981","#14b8a6"
];

export default function DealPerformanceCharts({ partnerships = [] }) {
  const { data: sequences = [] } = useQuery({
    queryKey: ["sequences-for-analytics"],
    queryFn: () => base44.entities.OutreachSequence.list("-created_date", 200),
  });
  const { data: emails = [] } = useQuery({
    queryKey: ["emails-for-analytics"],
    queryFn: () => base44.entities.OutreachEmail.list("-created_date", 300),
  });

  // ── 1. Conversion Funnel (count per stage, drop-off rate) ────────────────────
  const funnelData = useMemo(() => {
    return PIPELINE_STAGES.map((stage, i) => {
      const count = partnerships.filter(p => {
        const idx = PIPELINE_STAGES.indexOf(p.status);
        return idx >= i; // still in pipeline at this stage or beyond
      }).length;
      return {
        name: stage.replace(/_/g, " "),
        value: count,
        fill: STAGE_COLORS_LIST[i],
      };
    }).filter(d => d.value > 0);
  }, [partnerships]);

  // ── 2. Avg Deal Value by Partnership Type ────────────────────────────────────
  const valueByType = useMemo(() => {
    const map = {};
    partnerships.filter(p => p.partnership_type && p.deal_value > 0).forEach(p => {
      if (!map[p.partnership_type]) map[p.partnership_type] = { total: 0, count: 0, won: 0 };
      map[p.partnership_type].total += p.deal_value;
      map[p.partnership_type].count++;
      if (p.status === "completed") map[p.partnership_type].won++;
    });
    return Object.entries(map).map(([type, d]) => ({
      type: type.replace(/_/g, " "),
      avgValue: Math.round(d.total / d.count),
      winRate: Math.round((d.won / d.count) * 100),
      count: d.count,
    })).sort((a, b) => b.avgValue - a.avgValue);
  }, [partnerships]);

  // ── 3. Deal Velocity: avg days from created → completed per month ────────────
  const velocityData = useMemo(() => {
    const byMonth = {};
    partnerships
      .filter(p => p.status === "completed" && p.created_date && p.updated_date)
      .forEach(p => {
        const d = new Date(p.updated_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key]) byMonth[key] = { month: key, days: [], value: [] };
        const cycledays = Math.max(0, Math.round((new Date(p.updated_date) - new Date(p.created_date)) / (1000 * 60 * 60 * 24)));
        byMonth[key].days.push(cycledays);
        byMonth[key].value.push(p.deal_value || 0);
      });
    return Object.values(byMonth)
      .map(m => ({
        month: m.month,
        avgDays: Math.round(m.days.reduce((s, v) => s + v, 0) / m.days.length),
        avgValue: Math.round(m.value.reduce((s, v) => s + v, 0) / m.value.length),
        closedDeals: m.days.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-9);
  }, [partnerships]);

  // ── 4. Outreach impact: deals with emails/sequences vs none → win rate ───────
  const outreachImpact = useMemo(() => {
    const emailsByPartnership = {};
    emails.forEach(e => {
      if (e.partnership_id) {
        emailsByPartnership[e.partnership_id] = (emailsByPartnership[e.partnership_id] || 0) + 1;
      }
    });
    const seqByPartnership = new Set(sequences.filter(s => s.partnership_id).map(s => s.partnership_id));

    const groups = {
      "Sequence + Email": { total: 0, won: 0, totalValue: 0 },
      "Email Only":       { total: 0, won: 0, totalValue: 0 },
      "No Outreach":      { total: 0, won: 0, totalValue: 0 },
    };

    partnerships.forEach(p => {
      const hasSeq = seqByPartnership.has(p.id);
      const hasEmail = (emailsByPartnership[p.id] || 0) > 0;
      const key = hasSeq ? "Sequence + Email" : hasEmail ? "Email Only" : "No Outreach";
      groups[key].total++;
      if (p.status === "completed") groups[key].won++;
      groups[key].totalValue += p.deal_value || 0;
    });

    return Object.entries(groups)
      .filter(([, d]) => d.total > 0)
      .map(([strategy, d]) => ({
        strategy,
        winRate: Math.round((d.won / d.total) * 100),
        avgValue: d.won > 0 ? Math.round(d.totalValue / d.total) : 0,
        deals: d.total,
      }));
  }, [partnerships, emails, sequences]);

  // ── 5. Match Score vs Deal Value scatter data ────────────────────────────────
  const scatterData = useMemo(() => {
    return partnerships
      .filter(p => p.match_score > 0 && p.deal_value > 0)
      .map(p => ({
        score: p.match_score,
        value: p.deal_value,
        status: p.status,
        z: p.status === "completed" ? 8 : p.status === "churned" ? 4 : 6,
      }));
  }, [partnerships]);

  if (partnerships.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> Performance Visualizations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Conversion rates, deal velocity, avg values, and outreach strategy impact</p>
      </div>

      {/* Row 1: Funnel + Outreach Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Conversion Funnel */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-violet-500" /> Pipeline Conversion Funnel
            </CardTitle>
            <p className="text-[11px] text-slate-400">Deals remaining at each stage</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(val, _, { payload }) => {
                    const total = funnelData[0]?.value || 1;
                    const pct = Math.round((val / total) * 100);
                    return [`${val} deals (${pct}% of top)`, "Count"];
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#94a3b8" }}>
                  {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outreach Strategy Impact */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-500" /> Outreach Strategy Impact
            </CardTitle>
            <p className="text-[11px] text-slate-400">Win rate & avg value by outreach method used</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={outreachImpact} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="strategy" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(val, name) => name === "winRate" ? [`${val}%`, "Win Rate"] : name === "avgValue" ? [fmt(val), "Avg Deal Value"] : [val, name]}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="winRate" name="winRate" radius={[6, 6, 0, 0]} fill="#6366F1" opacity={0.85} />
                <Line yAxisId="right" type="monotone" dataKey="avgValue" name="avgValue" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Deal Velocity + Avg Value by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Deal Velocity */}
        {velocityData.length > 1 && (
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Deal Velocity
              </CardTitle>
              <p className="text-[11px] text-slate-400">Avg days to close & deal value for completed deals by month</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="d" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(val, name) => name === "avgDays" ? [`${val} days`, "Avg Close Time"] : name === "avgValue" ? [fmt(val), "Avg Deal Value"] : [val, "Closed Deals"]}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Area yAxisId="right" type="monotone" dataKey="avgValue" name="avgValue" fill="#d1fae5" stroke="#10b981" strokeWidth={2} fillOpacity={0.4} />
                  <Line yAxisId="left" type="monotone" dataKey="avgDays" name="avgDays" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Avg Value + Win Rate by Type */}
        {valueByType.length > 0 && (
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" /> Avg Value & Win Rate by Type
              </CardTitle>
              <p className="text-[11px] text-slate-400">Which partnership types drive the most value</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={valueByType} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(val, name) => name === "avgValue" ? [fmt(val), "Avg Deal Value"] : [`${val}%`, "Win Rate"]}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="avgValue" name="avgValue" radius={[6, 6, 0, 0]}>
                    {valueByType.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} opacity={0.85} />)}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="winRate" name="winRate" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 4, fill: "#EC4899" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 3: Match Score vs Deal Value scatter */}
      {scatterData.length > 2 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Match Score vs Deal Value</CardTitle>
            <p className="text-[11px] text-slate-400">Do higher AI match scores correlate with higher value deals?</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="score" name="Match Score" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Match Score", position: "insideBottom", offset: -2, fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="value" name="Deal Value" type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <ZAxis dataKey="z" range={[30, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(val, name) => name === "Deal Value" ? [fmt(val), name] : [val, name]}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Scatter
                  data={scatterData.filter(d => d.status === "completed")}
                  fill="#10b981" opacity={0.75} name="Completed"
                />
                <Scatter
                  data={scatterData.filter(d => d.status === "churned")}
                  fill="#f87171" opacity={0.65} name="Churned"
                />
                <Scatter
                  data={scatterData.filter(d => !["completed","churned"].includes(d.status))}
                  fill="#818cf8" opacity={0.55} name="In Progress"
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
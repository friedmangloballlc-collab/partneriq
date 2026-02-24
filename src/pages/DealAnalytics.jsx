import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, DollarSign, Handshake, CheckCircle2, XCircle,
  BarChart3, Target, Clock, Award, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STAGE_COLORS = {
  discovered:      "#94a3b8",
  researching:     "#60a5fa",
  outreach_pending:"#818cf8",
  outreach_sent:   "#a78bfa",
  responded:       "#f59e0b",
  negotiating:     "#f97316",
  contracted:      "#34d399",
  active:          "#10b981",
  completed:       "#14b8a6",
  churned:         "#f87171",
};

const TYPE_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

const PRIORITY_ORDER = ["p0", "p1", "p2", "p3"];

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <Card className="border-slate-200/60">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />{trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DealAnalytics() {
  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ["partnerships-analytics-page"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 500),
  });

  // ── Derived stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = partnerships.length;
    const active = partnerships.filter(p => p.status === "active").length;
    const completed = partnerships.filter(p => p.status === "completed").length;
    const churned = partnerships.filter(p => p.status === "churned").length;
    const pipeline = partnerships.filter(p => !["completed", "churned"].includes(p.status));
    const totalValue = partnerships.reduce((s, p) => s + (p.deal_value || 0), 0);
    const completedValue = partnerships.filter(p => p.status === "completed").reduce((s, p) => s + (p.deal_value || 0), 0);
    const pipelineValue = pipeline.reduce((s, p) => s + (p.deal_value || 0), 0);
    const avgDealValue = total > 0 ? Math.round(partnerships.filter(p => p.deal_value > 0).reduce((s, p) => s + p.deal_value, 0) / partnerships.filter(p => p.deal_value > 0).length) : 0;
    const winRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const churnRate = total > 0 ? Math.round((churned / total) * 100) : 0;
    const avgMatchScore = (() => {
      const withScore = partnerships.filter(p => p.match_score > 0);
      return withScore.length > 0 ? Math.round(withScore.reduce((s, p) => s + p.match_score, 0) / withScore.length) : 0;
    })();
    return { total, active, completed, churned, pipeline: pipeline.length, totalValue, completedValue, pipelineValue, avgDealValue, winRate, churnRate, avgMatchScore };
  }, [partnerships]);

  // ── Stage breakdown ──────────────────────────────────────────────────────────
  const stageData = useMemo(() => {
    const counts = {};
    partnerships.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts)
      .map(([status, count]) => ({
        stage: status.replace(/_/g, " "),
        count,
        value: partnerships.filter(p => p.status === status).reduce((s, p) => s + (p.deal_value || 0), 0),
        fill: STAGE_COLORS[status] || "#94a3b8",
      }))
      .sort((a, b) => b.count - a.count);
  }, [partnerships]);

  // ── Partnership type breakdown ───────────────────────────────────────────────
  const typeData = useMemo(() => {
    const counts = {};
    partnerships.forEach(p => { if (p.partnership_type) counts[p.partnership_type] = (counts[p.partnership_type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => ({ name: type.replace(/_/g, " "), value: count })).sort((a, b) => b.value - a.value);
  }, [partnerships]);

  // ── Priority breakdown ───────────────────────────────────────────────────────
  const priorityData = useMemo(() => {
    return PRIORITY_ORDER.map(priority => {
      const group = partnerships.filter(p => p.priority === priority);
      return {
        priority: priority.toUpperCase(),
        count: group.length,
        totalValue: group.reduce((s, p) => s + (p.deal_value || 0), 0),
        avgMatchScore: group.length > 0 ? Math.round(group.filter(p => p.match_score > 0).reduce((s, p) => s + (p.match_score || 0), 0) / (group.filter(p => p.match_score > 0).length || 1)) : 0,
      };
    }).filter(d => d.count > 0);
  }, [partnerships]);

  // ── Monthly trend (created_date grouping) ────────────────────────────────────
  const monthlyTrend = useMemo(() => {
    const byMonth = {};
    partnerships.forEach(p => {
      if (!p.created_date) return;
      const d = new Date(p.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { month: key, deals: 0, value: 0, completed: 0 };
      byMonth[key].deals++;
      byMonth[key].value += p.deal_value || 0;
      if (p.status === "completed") byMonth[key].completed++;
    });
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).slice(-9);
  }, [partnerships]);

  // ── Top deals ────────────────────────────────────────────────────────────────
  const topDeals = useMemo(() => {
    return [...partnerships]
      .filter(p => p.deal_value > 0)
      .sort((a, b) => b.deal_value - a.deal_value)
      .slice(0, 8);
  }, [partnerships]);

  // ── Match score distribution ─────────────────────────────────────────────────
  const matchDist = useMemo(() => {
    const buckets = [
      { range: "90–100", min: 90, max: 100 },
      { range: "70–89",  min: 70, max: 89 },
      { range: "50–69",  min: 50, max: 69 },
      { range: "< 50",   min: 0,  max: 49 },
    ];
    return buckets.map(b => ({
      range: b.range,
      count: partnerships.filter(p => p.match_score >= b.min && p.match_score <= b.max).length,
    }));
  }, [partnerships]);

  const fmt = v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BarChart3 className="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" /> Deal Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Aggregated performance across all {stats.total} partnership deals</p>
        </div>
        <Link to={createPageUrl("Partnerships")}>
          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-colors">
            ← Back to Pipeline
          </Badge>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pipeline Value" value={fmt(stats.pipelineValue)} sub="Active deals" icon={DollarSign} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Closed Revenue" value={fmt(stats.completedValue)} sub="Completed deals" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.completed} of ${stats.total} deals`} icon={Target} color="bg-blue-50 text-blue-600" />
        <StatCard label="Avg Deal Value" value={fmt(stats.avgDealValue)} sub="Across all deals" icon={TrendingUp} color="bg-amber-50 text-amber-600" />
        <StatCard label="Active Deals" value={stats.active} sub="In-flight" icon={Handshake} color="bg-violet-50 text-violet-600" />
        <StatCard label="Churn Rate" value={`${stats.churnRate}%`} sub={`${stats.churned} churned`} icon={XCircle} color="bg-red-50 text-red-500" />
        <StatCard label="Avg Match Score" value={stats.avgMatchScore > 0 ? `${stats.avgMatchScore}/100` : "—"} sub="AI match quality" icon={Award} color="bg-teal-50 text-teal-600" />
        <StatCard label="In Pipeline" value={stats.pipeline} sub="Not yet closed" icon={Clock} color="bg-slate-100 text-slate-600" />
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 1 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Deal Volume & Value Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(val, name) => name === "value" ? [fmt(val), "Value"] : [val, name]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="deals" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} name="Deals" />
                <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 3" name="Completed" />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="value" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Stage Funnel + Type Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Deals by Pipeline Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stageData} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "#64748b", textTransform: "capitalize" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#94a3b8" }}>
                  {stageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Partnership Types</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {typeData.length > 0 ? (
              <>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {typeData.map((t, i) => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                      <span className="text-xs text-slate-600 capitalize flex-1">{t.name}</span>
                      <span className="text-xs font-bold text-slate-800">{t.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 py-8 mx-auto">No type data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority breakdown + Match score dist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Deal Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <div className="space-y-3">
                {priorityData.map(p => (
                  <div key={p.priority} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[11px] font-bold">{p.priority}</Badge>
                      <span className="text-xs font-bold text-slate-700">{p.count} deals</span>
                    </div>
                    <div className="flex gap-4 text-[11px] text-slate-500">
                      <span>Total Value: <strong className="text-slate-700">{fmt(p.totalValue)}</strong></span>
                      {p.avgMatchScore > 0 && <span>Avg Match: <strong className="text-indigo-700">{p.avgMatchScore}%</strong></span>}
                    </div>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (p.count / stats.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-8 text-center">No priority data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Match Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={matchDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {matchDist.map((_, i) => <Cell key={i} fill={["#10b981", "#6366f1", "#f59e0b", "#f87171"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Deals Table */}
      {topDeals.length > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Top Deals by Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Deal", "Brand × Talent", "Type", "Stage", "Match", "Value"].map(h => (
                      <th key={h} className="text-left pb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topDeals.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 text-xs font-semibold text-slate-800 max-w-[160px] truncate">{d.title}</td>
                      <td className="py-3 px-2 text-xs text-slate-500">{d.brand_name}{d.talent_name ? ` × ${d.talent_name}` : ""}</td>
                      <td className="py-3 px-2">
                        {d.partnership_type && <Badge variant="outline" className="text-[10px] capitalize">{d.partnership_type.replace(/_/g, " ")}</Badge>}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-medium capitalize text-slate-600">{d.status?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3 px-2">
                        {d.match_score ? <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{d.match_score}%</Badge> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-2 text-xs font-bold text-emerald-700">{fmt(d.deal_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
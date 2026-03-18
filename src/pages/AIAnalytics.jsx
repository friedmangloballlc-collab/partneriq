import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Clock, Zap, AlertCircle } from "lucide-react";
import { format, subDays, startOfDay, parseISO, isAfter } from "date-fns";

// ── Colours ─────────────────────────────────────────────────────────────────
const PROVIDER_COLORS = {
  deepseek: "#6366F1",
  anthropic: "#8B5CF6",
  gemini: "#10B981",
  groq: "#F59E0B",
};
const FALLBACK_COLOR = "#94A3B8";

const CHART_COLORS = [
  "#6366F1", "#8B5CF6", "#10B981", "#F59E0B",
  "#EC4899", "#3B82F6", "#14B8A6", "#F97316",
  "#EF4444", "#A78BFA",
];

// ── Supabase query helpers ───────────────────────────────────────────────────
async function fetchTodayLogs() {
  const todayStart = startOfDay(new Date()).toISOString();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id, created_at, agent, provider, model, fallback_used, batch_mode, latency_ms, prompt_length, input_tokens, output_tokens, estimated_cost_usd")
    .gte("created_at", todayStart)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchLast30DaysLogs() {
  const since = subDays(new Date(), 30).toISOString();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id, created_at, agent, provider, model, fallback_used, batch_mode, latency_ms, prompt_length, input_tokens, output_tokens, estimated_cost_usd")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchRecentLogs() {
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id, created_at, agent, provider, model, fallback_used, latency_ms, estimated_cost_usd")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

// ── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Card className="border-slate-200/60">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Custom tooltip shared across charts ──────────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      {label && <p className="text-slate-500 text-xs mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color ?? entry.fill }} className="font-medium">
          {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Provider pie label ───────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AIAnalytics() {
  const {
    data: todayLogs = [],
    isLoading: loadingToday,
    error: todayError,
  } = useQuery({ queryKey: ["ai_usage_logs_today"], queryFn: fetchTodayLogs });

  const {
    data: allLogs = [],
    isLoading: loadingAll,
    error: allError,
  } = useQuery({ queryKey: ["ai_usage_logs_30d"], queryFn: fetchLast30DaysLogs });

  const {
    data: recentLogs = [],
    isLoading: loadingRecent,
    error: recentError,
  } = useQuery({ queryKey: ["ai_usage_logs_recent"], queryFn: fetchRecentLogs });

  const isLoading = loadingToday || loadingAll || loadingRecent;
  const hasError = todayError || allError || recentError;

  // ── Summary card computations ──────────────────────────────────────────────
  const totalRequestsToday = todayLogs.length;

  const totalCostToday = useMemo(
    () => todayLogs.reduce((sum, r) => sum + (r.estimated_cost_usd ?? 0), 0),
    [todayLogs]
  );

  const avgLatency = useMemo(() => {
    const rows = allLogs.filter(r => r.latency_ms != null);
    if (!rows.length) return 0;
    return Math.round(rows.reduce((s, r) => s + r.latency_ms, 0) / rows.length);
  }, [allLogs]);

  // cache hit rate = rows where fallback_used is false (cache was used means primary model responded)
  // Interpreting "cache hit rate" as the proportion of requests that did NOT fall back
  const cacheHitRate = useMemo(() => {
    if (!allLogs.length) return 0;
    const hits = allLogs.filter(r => !r.fallback_used).length;
    return ((hits / allLogs.length) * 100).toFixed(1);
  }, [allLogs]);

  // ── Bar chart: requests per agent (top 10) ─────────────────────────────────
  const agentBarData = useMemo(() => {
    const counts = {};
    allLogs.forEach(r => {
      if (r.agent) counts[r.agent] = (counts[r.agent] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, requests]) => ({ name, requests }));
  }, [allLogs]);

  // ── Pie chart: provider distribution ──────────────────────────────────────
  const providerPieData = useMemo(() => {
    const counts = {};
    allLogs.forEach(r => {
      if (r.provider) counts[r.provider] = (counts[r.provider] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allLogs]);

  // ── Line chart: daily requests over last 30 days ───────────────────────────
  const dailyLineData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    const counts = {};
    allLogs.forEach(r => {
      const day = format(parseISO(r.created_at), "yyyy-MM-dd");
      counts[day] = (counts[day] || 0) + 1;
    });
    return days.map(day => ({
      date: format(parseISO(day), "MMM d"),
      requests: counts[day] ?? 0,
    }));
  }, [allLogs]);

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Loading usage data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-slate-200/60 animate-pulse">
              <CardContent className="pt-5 pb-5 h-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <p className="text-base font-medium">Failed to load AI usage data</p>
        <p className="text-sm text-slate-400">
          {(todayError || allError || recentError)?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Usage metrics and cost breakdown for all AI agents
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Activity}
          label="Total Requests Today"
          value={totalRequestsToday.toLocaleString()}
          sub="since midnight"
          color="indigo"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Cost Today"
          value={`$${totalCostToday.toFixed(4)}`}
          sub="estimated USD"
          color="emerald"
        />
        <SummaryCard
          icon={Clock}
          label="Avg Latency (30d)"
          value={`${avgLatency.toLocaleString()} ms`}
          sub="across all agents"
          color="amber"
        />
        <SummaryCard
          icon={Zap}
          label="Cache Hit Rate (30d)"
          value={`${cacheHitRate}%`}
          sub="requests without fallback"
          color="violet"
        />
      </div>

      {/* Charts row 1: bar + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: requests per agent */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Requests per Agent (Top 10, last 30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentBarData.length === 0 ? (
              <EmptyState message="No agent data available" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={agentBarData}
                  margin={{ top: 4, right: 12, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="requests" name="Requests" radius={[4, 4, 0, 0]}>
                    {agentBarData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart: provider distribution */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              Provider Distribution (last 30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {providerPieData.length === 0 ? (
              <EmptyState message="No provider data available" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={providerPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                      label={PieLabel}
                    >
                      {providerPieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={PROVIDER_COLORS[entry.name?.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const { name, value } = payload[0].payload;
                        const total = providerPieData.reduce((s, r) => s + r.value, 0);
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                            <p className="font-semibold capitalize">{name}</p>
                            <p className="text-slate-500">{value} requests ({((value / total) * 100).toFixed(1)}%)</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {providerPieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: PROVIDER_COLORS[entry.name?.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-slate-600 capitalize">{entry.name}</span>
                      <span className="text-xs text-slate-400">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line chart: daily requests */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Daily Requests — Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={dailyLineData}
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748B" }}
                interval={Math.floor(dailyLineData.length / 8)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#6366F1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent requests table */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Recent Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentLogs.length === 0 ? (
            <div className="px-6 py-8">
              <EmptyState message="No recent requests found" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Latency</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fallback</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                    >
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {row.created_at ? format(parseISO(row.created_at), "MMM d, HH:mm:ss") : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700 max-w-[160px] truncate">
                        {row.agent ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.provider ? (
                          <Badge
                            variant="outline"
                            className="capitalize text-[10px] px-2 py-0.5"
                            style={{
                              borderColor: PROVIDER_COLORS[row.provider?.toLowerCase()] ?? "#94A3B8",
                              color: PROVIDER_COLORS[row.provider?.toLowerCase()] ?? "#64748B",
                              backgroundColor: `${PROVIDER_COLORS[row.provider?.toLowerCase()] ?? "#94A3B8"}15`,
                            }}
                          >
                            {row.provider}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">
                        {row.latency_ms != null ? `${row.latency_ms.toLocaleString()} ms` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">
                        {row.estimated_cost_usd != null ? `$${row.estimated_cost_usd.toFixed(5)}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {row.fallback_used ? (
                          <Badge className="bg-amber-50 text-amber-700 text-[10px] border-amber-200">Yes</Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border-emerald-200">No</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

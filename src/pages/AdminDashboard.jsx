/**
 * AdminDashboard.jsx
 *
 * Platform-wide admin intelligence view (Section 11).
 * Queries Supabase directly for aggregate statistics across all tables.
 * Only accessible to users with role = 'admin' (enforced via routePermissions).
 */
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { format, subMonths, parseISO } from "date-fns";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, DollarSign, Users, Database, BarChart3,
  Brain, Handshake, Award, ArrowUpRight, Activity, AlertCircle,
} from "lucide-react";

// ── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#3B82F6", "#F97316", "#14B8A6"];

// ── Stat card ─────────────────────────────────────────────────────────────────
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

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Data fetchers ──────────────────────────────────────────────────────────────
async function fetchPartnerships() {
  const { data, error } = await supabase
    .from("partnerships")
    .select("id, created_at, deal_value, status, partnership_type, initiated_by");
  if (error) throw error;
  return data ?? [];
}

async function fetchRateBenchmarks() {
  const { data, error } = await supabase
    .from("rate_benchmarks")
    .select("platform, tier, niche, avg_rate, sample_size");
  if (error) throw error;
  return data ?? [];
}

async function fetchDataRoomEntries() {
  const { data, error } = await supabase
    .from("data_room_entries")
    .select("id, user_id, created_at, platform, tier, niche, deal_value, status");
  if (error) throw error;
  return data ?? [];
}

async function fetchProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, onboarding_completed, created_at");
  if (error) throw error;
  return data ?? [];
}

async function fetchDealScores() {
  const { data, error } = await supabase
    .from("deal_scores")
    .select("id, score, created_at");
  if (error) throw error;
  return data ?? [];
}

async function fetchAiUsageLogs() {
  const since = subMonths(new Date(), 3).toISOString();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id, created_at, provider, agent, latency_ms, estimated_cost_usd, input_tokens, output_tokens")
    .gte("created_at", since);
  if (error) throw error;
  return data ?? [];
}

async function fetchSubscriptions() {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("id, plan_id, status, created_at");
  if (error) throw error;
  return data ?? [];
}

async function fetchSubscriptionPlans() {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, price_monthly, price_yearly");
  if (error) throw error;
  return data ?? [];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n?.toFixed(0) ?? 0}`;
}

function buildMonthlyDeals(partnerships) {
  const buckets = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const key = format(subMonths(now, i), "MMM yyyy");
    buckets[key] = { month: key, count: 0, value: 0 };
  }
  partnerships.forEach(p => {
    const key = format(parseISO(p.created_at), "MMM yyyy");
    if (buckets[key]) {
      buckets[key].count++;
      buckets[key].value += p.deal_value ?? 0;
    }
  });
  return Object.values(buckets);
}

function buildScoreHistogram(scores) {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${i * 10 + 9}`,
    count: 0,
  }));
  scores.forEach(s => {
    const idx = Math.min(Math.floor((s.score ?? 0) / 10), 9);
    buckets[idx].count++;
  });
  return buckets;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: partnerships = [], isLoading: loadingP } = useQuery({
    queryKey: ["admin-partnerships"],
    queryFn: fetchPartnerships,
  });
  const { data: rateBenchmarks = [] } = useQuery({
    queryKey: ["admin-rate-benchmarks"],
    queryFn: fetchRateBenchmarks,
  });
  const { data: dataRoomEntries = [] } = useQuery({
    queryKey: ["admin-data-room-entries"],
    queryFn: fetchDataRoomEntries,
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: fetchProfiles,
  });
  const { data: dealScores = [] } = useQuery({
    queryKey: ["admin-deal-scores"],
    queryFn: fetchDealScores,
  });
  const { data: aiLogs = [] } = useQuery({
    queryKey: ["admin-ai-usage-logs"],
    queryFn: fetchAiUsageLogs,
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: fetchSubscriptions,
  });
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: fetchSubscriptionPlans,
  });

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalDeals = partnerships.length;
  const totalValue = partnerships.reduce((s, p) => s + (p.deal_value ?? 0), 0);

  // Monthly growth: compare current month to last month
  const monthlyDeals = useMemo(() => buildMonthlyDeals(partnerships), [partnerships]);
  const lastTwo = monthlyDeals.slice(-2);
  const growthRate = lastTwo.length === 2 && lastTwo[0].count > 0
    ? (((lastTwo[1].count - lastTwo[0].count) / lastTwo[0].count) * 100).toFixed(1)
    : null;

  // GMV over time (line chart)
  const gmvOverTime = useMemo(() => {
    return monthlyDeals.map(m => ({ ...m, gmv: m.value }));
  }, [monthlyDeals]);

  // Deals by user type (pie)
  const dealsByType = useMemo(() => {
    const map = {};
    partnerships.forEach(p => {
      const key = p.initiated_by ?? p.partnership_type ?? "unknown";
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [partnerships]);

  // Three-sided: direct vs agency-brokered
  const directDeals = partnerships.filter(p =>
    p.partnership_type !== "agency_brokered" && p.initiated_by !== "agency"
  ).length;
  const agencyDeals = partnerships.filter(p =>
    p.partnership_type === "agency_brokered" || p.initiated_by === "agency"
  ).length;

  // Rate benchmarks: avg by platform
  const rateByPlatform = useMemo(() => {
    const map = {};
    rateBenchmarks.forEach(r => {
      if (!map[r.platform]) map[r.platform] = { total: 0, count: 0 };
      map[r.platform].total += r.avg_rate ?? 0;
      map[r.platform].count++;
    });
    return Object.entries(map).map(([platform, v]) => ({
      platform,
      avg_rate: v.count ? Math.round(v.total / v.count) : 0,
    }));
  }, [rateBenchmarks]);

  // Data Room health
  const uniqueDataRoomUsers = new Set(dataRoomEntries.map(e => e.user_id)).size;
  const totalProfiles = profiles.length;
  const dataRoomCoverage = totalProfiles > 0
    ? ((uniqueDataRoomUsers / totalProfiles) * 100).toFixed(1)
    : 0;
  const avgEntriesPerUser = uniqueDataRoomUsers > 0
    ? (dataRoomEntries.length / uniqueDataRoomUsers).toFixed(1)
    : 0;

  // Deal score histogram
  const scoreHistogram = useMemo(() => buildScoreHistogram(dealScores), [dealScores]);

  // AI usage
  const totalAiCalls = aiLogs.length;
  const avgLatencyMs = aiLogs.length
    ? Math.round(aiLogs.reduce((s, l) => s + (l.latency_ms ?? 0), 0) / aiLogs.length)
    : 0;
  const totalCostUsd = aiLogs.reduce((s, l) => s + (l.estimated_cost_usd ?? 0), 0);
  const costByProvider = useMemo(() => {
    const map = {};
    aiLogs.forEach(l => {
      const key = l.provider ?? "unknown";
      map[key] = (map[key] ?? 0) + (l.estimated_cost_usd ?? 0);
    });
    return Object.entries(map).map(([name, cost]) => ({ name, cost: parseFloat(cost.toFixed(4)) }));
  }, [aiLogs]);

  // User acquisition
  const usersByRole = useMemo(() => {
    const map = {};
    profiles.forEach(p => {
      const key = p.role ?? "unknown";
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }, [profiles]);
  const onboardingRate = totalProfiles > 0
    ? ((profiles.filter(p => p.onboarding_completed).length / totalProfiles) * 100).toFixed(1)
    : 0;

  // Revenue by plan
  const planMap = useMemo(() => {
    const m = {};
    subscriptionPlans.forEach(p => { m[p.id] = p; });
    return m;
  }, [subscriptionPlans]);
  const revenueByPlan = useMemo(() => {
    const map = {};
    subscriptions
      .filter(s => s.status === "active")
      .forEach(s => {
        const plan = planMap[s.plan_id];
        const key = plan?.name ?? s.plan_id ?? "Unknown";
        const mrr = plan?.price_monthly ?? 0;
        map[key] = (map[key] ?? 0) + mrr;
      });
    return Object.entries(map).map(([plan, mrr]) => ({ plan, mrr }));
  }, [subscriptions, planMap]);
  const totalMrr = revenueByPlan.reduce((s, r) => s + r.mrr, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;

  if (loadingP) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading platform intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-red-100 text-red-700 border-0 text-[10px] uppercase tracking-wider">Admin Only</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Intelligence Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide analytics across all users, deals, AI usage, and revenue.</p>
      </div>

      {/* ── Section 1: Platform-wide Deal Volume ──────────────────────────────── */}
      <section>
        <SectionHeading icon={Handshake} title="Platform-wide Deal Volume" subtitle="All partnerships across the platform" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Deals" value={totalDeals.toLocaleString()} icon={Handshake} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Total Deal Value" value={fmtCurrency(totalValue)} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
          <StatCard
            label="Monthly Growth"
            value={growthRate !== null ? `${growthRate > 0 ? "+" : ""}${growthRate}%` : "—"}
            sub="vs previous month"
            icon={TrendingUp}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="3-Sided Deals"
            value={`${directDeals} / ${agencyDeals}`}
            sub="Direct vs Agency-brokered"
            icon={BarChart3}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart: deals by month */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Deals by Month (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyDeals} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.split(" ")[0]} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart: deals by user type */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Deals by Type / Initiator</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {dealsByType.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs">No type data yet</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dealsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dealsByType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 2: Platform GMV Over Time ─────────────────────────────────── */}
      <section>
        <SectionHeading icon={TrendingUp} title="Platform GMV Over Time" subtitle="Gross Merchandise Value (deal_value) per month" />
        <Card className="border-slate-200/60">
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={gmvOverTime} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.split(" ")[0]} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtCurrency(v)} />
                <Tooltip formatter={v => fmtCurrency(v)} />
                <Line type="monotone" dataKey="gmv" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── Section 3: Real-time Market Rates ─────────────────────────────────── */}
      <section>
        <SectionHeading icon={BarChart3} title="Real-time Market Rates" subtitle="Average rate per platform from rate_benchmarks" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Avg Rate by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              {rateByPlatform.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs">No benchmark data yet</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rateByPlatform} layout="vertical" margin={{ top: 0, right: 24, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="platform" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                    <Bar dataKey="avg_rate" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Benchmark Sample Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {rateBenchmarks.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">No data</p>
                )}
                {rateBenchmarks.slice(0, 20).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 capitalize">{r.platform}</span>
                      <Badge variant="outline" className="text-[10px] py-0">{r.tier}</Badge>
                      {r.niche && <Badge variant="outline" className="text-[10px] py-0 bg-indigo-50 text-indigo-600 border-indigo-100">{r.niche}</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-800">{fmtCurrency(r.avg_rate ?? 0)}</p>
                      <p className="text-[10px] text-slate-400">{r.sample_size ?? 0} samples</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 4: Data Room Health ───────────────────────────────────────── */}
      <section>
        <SectionHeading icon={Database} title="Data Room Health" subtitle="Coverage and usage of data room entries" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Data Room Coverage" value={`${dataRoomCoverage}%`} sub="of users with entries" icon={Database} color="bg-teal-50 text-teal-600" />
          <StatCard label="Total Entries" value={dataRoomEntries.length.toLocaleString()} icon={Database} color="bg-blue-50 text-blue-600" />
          <StatCard label="Avg Entries/User" value={avgEntriesPerUser} icon={BarChart3} color="bg-violet-50 text-violet-600" />
          <StatCard label="Users with Data Rooms" value={uniqueDataRoomUsers.toLocaleString()} icon={Users} color="bg-rose-50 text-rose-600" />
        </div>
      </section>

      {/* ── Section 5: Deal Score Distribution ───────────────────────────────── */}
      <section>
        <SectionHeading icon={Award} title="Deal Score Distribution" subtitle="Histogram of all deal scores (0–100 scale)" />
        <Card className="border-slate-200/60">
          <CardContent className="pt-5">
            {dealScores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs">No deal scores recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreHistogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Deals" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Section 6: AI Accuracy Dashboard ─────────────────────────────────── */}
      <section>
        <SectionHeading icon={Brain} title="AI Accuracy Dashboard" subtitle="Usage from the last 90 days (ai_usage_logs)" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total AI Calls" value={totalAiCalls.toLocaleString()} icon={Brain} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Avg Latency" value={`${avgLatencyMs}ms`} icon={Activity} color="bg-slate-100 text-slate-600" />
          <StatCard label="Total Cost" value={`$${totalCostUsd.toFixed(4)}`} icon={DollarSign} color="bg-amber-50 text-amber-600" />
          <StatCard label="Providers" value={costByProvider.length} icon={BarChart3} color="bg-purple-50 text-purple-600" />
        </div>
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Cost Breakdown by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            {costByProvider.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs">No AI usage logs found</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={costByProvider} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={v => `$${v}`} />
                  <Bar dataKey="cost" fill="#6366F1" radius={[4, 4, 0, 0]} name="Cost (USD)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Section 7: User Acquisition ───────────────────────────────────────── */}
      <section>
        <SectionHeading icon={Users} title="User Acquisition" subtitle="Registered users by role and onboarding status" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users" value={totalProfiles.toLocaleString()} icon={Users} color="bg-indigo-50 text-indigo-600" />
          <StatCard
            label="Onboarding Rate"
            value={`${onboardingRate}%`}
            sub="completed onboarding"
            icon={TrendingUp}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard label="Roles" value={usersByRole.length} sub="distinct platform roles" icon={BarChart3} color="bg-amber-50 text-amber-600" />
        </div>
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={usersByRole} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                  {usersByRole.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── Section 8: Revenue Intelligence ──────────────────────────────────── */}
      <section>
        <SectionHeading icon={DollarSign} title="Revenue Intelligence" subtitle="Subscription MRR by plan (active subs only)" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total MRR" value={fmtCurrency(totalMrr)} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Active Subscriptions" value={activeSubscriptions.toLocaleString()} icon={TrendingUp} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Plans" value={subscriptionPlans.length} icon={BarChart3} color="bg-purple-50 text-purple-600" />
        </div>
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">MRR by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByPlan.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs">No active subscriptions found</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByPlan} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="plan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtCurrency(v)} />
                  <Tooltip formatter={v => fmtCurrency(v)} />
                  <Bar dataKey="mrr" radius={[4, 4, 0, 0]} name="MRR">
                    {revenueByPlan.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

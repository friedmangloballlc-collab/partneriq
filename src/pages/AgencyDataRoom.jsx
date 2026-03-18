import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, TrendingUp, Users, Award, Plus, BarChart3,
  Sparkles, ArrowUpRight, ArrowDownRight, Minus, Building2,
  Briefcase, Percent, UserCheck,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${(n || 0).toFixed(0)}`;

function computeAgencyScore(entries) {
  if (!entries.length) return { score: 0, breakdown: {} };
  const totalRevenue   = entries.reduce((s, e) => s + (e.performance_metrics?.fee_earned || 0), 0);
  const totalManaged   = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
  const volumePts      = Math.min(entries.length * 5, 25);
  const revenuePts     = Math.min(Math.floor(totalRevenue / 5_000) * 2, 30);
  const clients        = new Set(entries.map((e) => e.brand_name).filter(Boolean)).size;
  const clientPts      = Math.min(clients * 4, 25);
  const recencyDays    = entries.length
    ? Math.max(0, (Date.now() - new Date(entries[0].created_at).getTime()) / 86_400_000)
    : 365;
  const recencyPts     = Math.max(0, 20 - Math.floor(recencyDays / 30) * 2);
  const score          = Math.min(100, volumePts + revenuePts + clientPts + recencyPts);
  return {
    score: Math.round(score),
    breakdown: { volume: volumePts, revenue: revenuePts, clients: clientPts, recency: recencyPts },
  };
}

function buildRevenueTrajectory(entries) {
  const byMonth = {};
  entries.forEach((e) => {
    const d   = new Date(e.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const fee = e.performance_metrics?.fee_earned || 0;
    if (!byMonth[key]) byMonth[key] = { revenue: 0, managed: 0 };
    byMonth[key].revenue += fee;
    byMonth[key].managed += (e.deal_value || 0);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([month, { revenue, managed }]) => ({
      month: month.slice(5),
      revenue,
      managed,
    }));
}

// ── sub-components ────────────────────────────────────────────────────────────

function ScoreGauge({ score }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  const ring  = score >= 70 ? "border-emerald-400" : score >= 40 ? "border-amber-400" : "border-rose-400";
  return (
    <div className={`relative w-28 h-28 rounded-full border-8 ${ring} flex flex-col items-center justify-center`}>
      <span className={`text-3xl font-black ${color}`}>{score}</span>
      <span className="text-xs text-slate-400 font-semibold">/ 100</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, colorBg, colorIcon }) {
  return (
    <Card className="border-slate-200/60 hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorBg}`}>
            <Icon className={`w-5 h-5 ${colorIcon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const CAMPAIGN_TYPES = ["Influencer Marketing", "Brand Sponsorship", "Content Production", "Event Activation", "Affiliate Program", "UGC Campaign", "PR & Seeding", "Other"];
const PLATFORMS      = ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Twitch", "Multi-Platform", "Podcast", "Other"];

const EMPTY_FORM = {
  title: "",
  brand_name: "",
  talent_names: "",
  deal_type: "",
  platform: "",
  deal_value: "",
  fee_earned: "",
  fee_percent: "",
  start_date: "",
  end_date: "",
  deliverables: "",
  notes: "",
  status: "completed",
};

export default function AgencyDataRoom() {
  const qc = useQueryClient();
  const [tab, setTab]               = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  // ── data fetching ──────────────────────────────────────────────────────────
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["data-room-agency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .select("*")
        .eq("room_type", "agency_engagements")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // ── mutations ──────────────────────────────────────────────────────────────
  const addEntry = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .insert({ ...payload, room_type: "agency_engagements", entry_type: "engagement" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-room-agency"] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = entries.reduce((s, e) => s + (e.performance_metrics?.fee_earned || 0), 0);
    const totalManaged = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
    const clients      = new Set(entries.map((e) => e.brand_name).filter(Boolean));
    const allTalents   = new Set();
    entries.forEach((e) => {
      if (e.talent_name) {
        e.talent_name.split(",").forEach((t) => allTalents.add(t.trim()));
      }
    });
    const avgFeeRate   = totalManaged > 0 ? (totalRevenue / totalManaged) * 100 : 0;
    return {
      totalRevenue,
      totalManaged,
      clientCount: clients.size,
      talentCount: allTalents.size,
      avgFeeRate,
      count: entries.length,
    };
  }, [entries]);

  const { score, breakdown } = useMemo(() => computeAgencyScore(entries), [entries]);
  const trajectory           = useMemo(() => buildRevenueTrajectory(entries), [entries]);

  const trendIcon = useMemo(() => {
    if (trajectory.length < 2) return null;
    const last = trajectory[trajectory.length - 1].revenue;
    const prev = trajectory[trajectory.length - 2].revenue;
    if (last > prev) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (last < prev) return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  }, [trajectory]);

  // ── AI insights ────────────────────────────────────────────────────────────
  const aiInsights = useMemo(() => {
    if (!entries.length) return ["Log your first client engagement to unlock AI-powered portfolio insights."];
    const insights = [];
    if (stats.avgFeeRate > 0)
      insights.push(`Your blended fee rate is ${stats.avgFeeRate.toFixed(1)}%. Top-tier agencies command 15–25% for premium talent access.`);
    if (stats.clientCount >= 3)
      insights.push(`Managing ${stats.clientCount} clients. Agencies with 5+ diversified clients see 40% more stable revenue year-over-year.`);
    if (stats.talentCount >= 5)
      insights.push(`Your roster spans ${stats.talentCount} talent profiles. A tiered roster model (anchor + emerging) maximizes client LTV.`);
    insights.push("Package your top-performing campaigns into case studies — this is the #1 factor in winning new brand retainers.");
    insights.push("Consider introducing a retainer model for top clients — predictable revenue helps scale team capacity.");
    return insights.slice(0, 4);
  }, [entries, stats]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const feeEarned  = parseFloat(form.fee_earned) || 0;
    const feePercent = parseFloat(form.fee_percent) || 0;
    const budget     = parseFloat(form.deal_value) || 0;
    const computed   = feeEarned || (budget && feePercent ? (budget * feePercent) / 100 : 0);
    addEntry.mutate({
      title:        form.title,
      brand_name:   form.brand_name,
      talent_name:  form.talent_names,
      deal_type:    form.deal_type,
      platform:     form.platform,
      deal_value:   budget,
      start_date:   form.start_date || null,
      end_date:     form.end_date   || null,
      deliverables: form.deliverables,
      notes:        form.notes,
      status:       form.status,
      performance_metrics: { fee_earned: computed, fee_percent: feePercent },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Agency Portfolio Intelligence Room</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">Your private client portfolio, scored and analyzed</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Engagement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log a Client Engagement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Engagement Title</Label>
                  <Input
                    placeholder="e.g. Nike Q4 Influencer Campaign"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Client / Brand Name *</Label>
                  <Input
                    required
                    placeholder="Client name"
                    value={form.brand_name}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Campaign Budget (USD)</Label>
                  <Input
                    type="number"
                    placeholder="Total budget managed"
                    value={form.deal_value}
                    onChange={(e) => setForm({ ...form, deal_value: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Talent Names</Label>
                  <Input
                    placeholder="Comma-separated: @alice, @bob"
                    value={form.talent_names}
                    onChange={(e) => setForm({ ...form, talent_names: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Campaign Type</Label>
                  <Select value={form.deal_type} onValueChange={(v) => setForm({ ...form, deal_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Agency Fee Earned (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0 (or use % below)"
                    value={form.fee_earned}
                    onChange={(e) => setForm({ ...form, fee_earned: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fee % (auto-calculates if no flat fee)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 15"
                    value={form.fee_percent}
                    onChange={(e) => setForm({ ...form, fee_percent: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["completed", "active", "retainer", "paused", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Deliverables / Scope</Label>
                  <Input
                    placeholder="e.g. 5 creators, 2 posts each, full reporting"
                    value={form.deliverables}
                    onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes / Results</Label>
                  <Textarea
                    placeholder="Campaign outcomes, client feedback, lessons..."
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={addEntry.isPending}>
                  {addEntry.isPending ? "Saving..." : "Log Engagement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 bg-white border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Engagements</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={fmt(stats.totalRevenue)}
              sub="agency fees earned"
              icon={DollarSign}
              colorBg="bg-teal-100"
              colorIcon="text-teal-600"
            />
            <StatCard
              label="Total Managed Budget"
              value={fmt(stats.totalManaged)}
              sub="across all clients"
              icon={Briefcase}
              colorBg="bg-indigo-100"
              colorIcon="text-indigo-600"
            />
            <StatCard
              label="Active Clients"
              value={stats.clientCount}
              sub="unique brand clients"
              icon={Building2}
              colorBg="bg-violet-100"
              colorIcon="text-violet-600"
            />
            <StatCard
              label="Talent Count"
              value={stats.talentCount}
              sub="creators managed"
              icon={UserCheck}
              colorBg="bg-pink-100"
              colorIcon="text-pink-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agency Score */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-500" /> Agency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <ScoreGauge score={score} />
                  <div className="w-full space-y-2">
                    {Object.entries(breakdown).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-slate-500">{k}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${Math.min((v / 30) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-700 font-semibold w-4 text-right">{v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Badge className="bg-teal-100 text-teal-700 text-xs">
                    {score >= 70 ? "Tier 1 Agency" : score >= 50 ? "Established" : score >= 30 ? "Growing" : "Getting Started"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trajectory */}
            <Card className="col-span-1 lg:col-span-2 border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-500" /> Revenue Trajectory
                  </CardTitle>
                  {trendIcon && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      {trendIcon} vs last month
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {trajectory.length < 2 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    Log engagements with fee data to see revenue trajectory
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={trajectory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} width={60} />
                      <Tooltip formatter={(v, name) => [fmt(v), name === "revenue" ? "Agency Revenue" : "Managed Budget"]} />
                      <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} name="revenue" />
                      <Bar dataKey="managed" fill="#ccfbf1" radius={[4, 4, 0, 0]} name="managed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* avg fee rate card */}
          <Card className="border-slate-200/60 bg-gradient-to-br from-teal-50 to-slate-50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blended Agency Fee Rate</p>
                  <p className="text-3xl font-black text-teal-700">{stats.avgFeeRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fmt(stats.totalRevenue)} revenue on {fmt(stats.totalManaged)} managed · Industry avg: 15–20%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CLIENT ENGAGEMENTS ── */}
        <TabsContent value="clients">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Client Engagements ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading engagements...</div>
              ) : entries.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No engagements logged yet. Click "Add Engagement" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {["Client", "Campaign Type", "Platform", "Budget", "Fee Earned", "Talent", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => {
                        const feeEarned = e.performance_metrics?.fee_earned || 0;
                        const date = e.start_date
                          ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : new Date(e.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                        const talentList = e.talent_name
                          ? e.talent_name.split(",").map((t) => t.trim()).filter(Boolean)
                          : [];
                        return (
                          <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{e.brand_name || "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs">{e.deal_type || "—"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{e.platform || "—"}</td>
                            <td className="px-4 py-3 font-bold text-slate-700">{fmt(e.deal_value || 0)}</td>
                            <td className="px-4 py-3 font-bold text-teal-700">{fmt(feeEarned)}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {talentList.length > 0 ? (
                                  talentList.slice(0, 2).map((t) => (
                                    <Badge key={t} className="text-xs bg-slate-100 text-slate-600">{t}</Badge>
                                  ))
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                                {talentList.length > 2 && (
                                  <Badge className="text-xs bg-slate-100 text-slate-500">+{talentList.length - 2}</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  e.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : e.status === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : e.status === "retainer"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-slate-100 text-slate-600"
                                }
                              >
                                {e.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI INSIGHTS ── */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" /> AI Portfolio Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-teal-50/60 rounded-lg border border-teal-100">
                    <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-500" /> Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Engagements", value: stats.count },
                    { label: "Total Revenue", value: fmt(stats.totalRevenue) },
                    { label: "Managed Budget", value: fmt(stats.totalManaged) },
                    { label: "Blended Fee Rate", value: `${stats.avgFeeRate.toFixed(1)}%` },
                    { label: "Unique Clients", value: stats.clientCount },
                    { label: "Agency Score", value: `${score}/100` },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100 text-xs text-teal-700 leading-relaxed">
                  Predictive revenue modeling, client health scores, and pipeline forecasting available with the Pro plan.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

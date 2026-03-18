import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
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
  DollarSign, TrendingUp, Briefcase, Award, Plus, Eye, EyeOff,
  Globe, Lock, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight,
  Minus, CalendarDays, Tag, Share2, Download, CheckCircle2,
} from "lucide-react";
import DataRoomImporter from "@/components/dataroom/DataRoomImporter";
import NDAGate from "@/components/dataroom/NDAGate";
import AccessRequestPanel from "@/components/dataroom/AccessRequestPanel";
import IndustryIntelFeed from "@/components/dataroom/IndustryIntelFeed";
import { useAuth } from "@/lib/AuthContext";
import { exportDataRoomPDF } from "@/lib/watermarkedPdf";
import { useToast } from "@/components/ui/use-toast";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;

function computeDealScore(entries) {
  if (!entries.length) return { score: 0, breakdown: {} };
  const totalValue = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
  const avgValue   = totalValue / entries.length;
  const volumePts  = Math.min(entries.length * 5, 30);
  const valuePts   = Math.min(Math.floor(avgValue / 1_000) * 2, 30);
  const brands     = new Set(entries.map((e) => e.brand_name).filter(Boolean)).size;
  const diversityPts = Math.min(brands * 3, 20);
  const recencyDays  = entries.length
    ? Math.max(
        0,
        (Date.now() - new Date(entries[0].created_at).getTime()) / 86_400_000
      )
    : 365;
  const recencyPts = Math.max(0, 20 - Math.floor(recencyDays / 30) * 2);
  const score = Math.min(100, volumePts + valuePts + diversityPts + recencyPts);
  return {
    score: Math.round(score),
    breakdown: { volume: volumePts, value: valuePts, diversity: diversityPts, recency: recencyPts },
  };
}

function buildTrajectory(entries) {
  const byMonth = {};
  entries.forEach((e) => {
    const d   = new Date(e.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + (e.deal_value || 0);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([month, value]) => ({ month: month.slice(5), value }));
}

// ── sub-components ────────────────────────────────────────────────────────────

function ScoreGauge({ score }) {
  const color =
    score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  const ring  =
    score >= 70 ? "border-emerald-400" : score >= 40 ? "border-amber-400" : "border-rose-400";
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

// Visibility config — each level has a distinct colour so owners can see at a glance
// what information each entry exposes to others.
//   Public  → green  — only the Deal Score badge is visible to third parties
//   Shared  → blue   — deal history + benchmarks visible to approved viewers
//   Private → gray   — full analytics + AI predictions, owner-only
const VISIBILITY_CONFIG = {
  public:  {
    icon:   Globe,
    label:  "Public",
    chip:   "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200",
    dot:    "bg-emerald-400",
    tooltip: "Score badge visible to everyone",
  },
  shared:  {
    icon:   Eye,
    label:  "Shared",
    chip:   "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200",
    dot:    "bg-blue-400",
    tooltip: "Deal history & benchmarks visible to approved viewers",
  },
  private: {
    icon:   Lock,
    label:  "Private",
    chip:   "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200",
    dot:    "bg-slate-400",
    tooltip: "Full analytics & AI predictions — owner only",
  },
};

// Legacy aliases kept for any code that still references them
const VISIBILITY_ICONS = {
  private: Lock,
  shared:  Eye,
  public:  Globe,
};

const VISIBILITY_LABELS = {
  private: "Private",
  shared:  "Shared",
  public:  "Public",
};

// ── main component ────────────────────────────────────────────────────────────

const DEAL_TYPES = ["Sponsored Post", "Brand Ambassador", "Affiliate", "UGC", "Gifted", "Event", "Other"];
const PLATFORMS  = ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Twitch", "Podcast", "Blog", "Other"];

const EMPTY_FORM = {
  title: "",
  brand_name: "",
  deal_type: "",
  platform: "",
  deal_value: "",
  currency: "USD",
  start_date: "",
  end_date: "",
  deliverables: "",
  notes: "",
  visibility: "private",
  status: "completed",
};

export default function TalentDataRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab]           = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  // Determine ownership: the data room owner is whoever is currently logged in.
  // When accessed via a shared link the URL would carry ?owner=email; for now
  // we treat the page as "owned" when the viewer is authenticated.
  const ownerEmail = user?.email || "";
  const viewerEmail = user?.email || "";
  const isOwner = !!user; // In a real app, compare URL param owner vs viewer

  const handleShareLink = () => {
    const url = `${window.location.origin}/TalentDataRoom?owner=${encodeURIComponent(ownerEmail)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied", description: "Share this link to let others view your data room (NDA required)." });
    });
  };

  const handleExportPDF = () => {
    exportDataRoomPDF({
      roomTitle: "Talent Deal Intelligence Room",
      entries,
      viewerName: user?.full_name || user?.email || "Viewer",
      viewerEmail: user?.email || "",
      roomType: "talent_deals",
    });
    toast({ title: "PDF exported", description: "Your watermarked data room PDF has been downloaded." });
  };

  // ── data fetching ──────────────────────────────────────────────────────────
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["data-room-talent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .select("*")
        .eq("room_type", "talent_deals")
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
        .insert({ ...payload, room_type: "talent_deals", entry_type: "deal" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-room-talent"] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateVisibility = useMutation({
    mutationFn: async ({ id, visibility }) => {
      const { error } = await supabase
        .from("data_room_entries")
        .update({ visibility })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["data-room-talent"] }),
  });

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalValue  = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
    const avgValue    = entries.length ? totalValue / entries.length : 0;
    const typeCounts  = {};
    const industryCounts = {};
    entries.forEach((e) => {
      if (e.deal_type)  typeCounts[e.deal_type]  = (typeCounts[e.deal_type]  || 0) + 1;
      if (e.brand_name) industryCounts[e.brand_name] = (industryCounts[e.brand_name] || 0) + 1;
    });
    const topType     = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const topBrand    = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { totalValue, avgValue, topType, topBrand, count: entries.length };
  }, [entries]);

  const { score, breakdown } = useMemo(() => computeDealScore(entries), [entries]);
  const trajectory = useMemo(() => buildTrajectory(entries), [entries]);

  // ── trajectory trend ───────────────────────────────────────────────────────
  const trendIcon = useMemo(() => {
    if (trajectory.length < 2) return null;
    const last = trajectory[trajectory.length - 1].value;
    const prev = trajectory[trajectory.length - 2].value;
    if (last > prev) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (last < prev) return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  }, [trajectory]);

  // ── AI insights placeholder ────────────────────────────────────────────────
  const aiInsights = useMemo(() => {
    if (!entries.length) return ["Log your first deal to unlock AI-powered insights."];
    const insights = [];
    if (stats.avgValue > 5_000)
      insights.push(`Your average deal size of ${fmt(stats.avgValue)} places you in the top tier for brand partnerships.`);
    if (stats.count >= 5)
      insights.push(`With ${stats.count} logged deals, your portfolio shows strong recurring brand interest.`);
    insights.push(`Your most frequent deal type is "${stats.topType}" — consider diversifying into Ambassador deals for higher LTV.`);
    if (score < 50)
      insights.push("Increase your deal score by logging more completed deals with measurable deliverables.");
    insights.push("Brands with multi-platform campaigns typically pay 20–40% premium over single-platform rates.");
    return insights.slice(0, 4);
  }, [entries, stats, score]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addEntry.mutate({
      ...form,
      deal_value: parseFloat(form.deal_value) || 0,
    });
  };

  const cycleVisibility = (entry) => {
    const order = ["private", "shared", "public"];
    const next  = order[(order.indexOf(entry.visibility) + 1) % order.length];
    updateVisibility.mutate({ id: entry.id, visibility: next });
  };

  const pageContent = (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Talent Deal Intelligence Room</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">Your private deal history, scored and analyzed</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-slate-600 hover:text-indigo-700 hover:border-indigo-300"
            onClick={handleShareLink}
          >
            <Share2 className="w-4 h-4" />
            Share Data Room
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-slate-600 hover:text-indigo-700 hover:border-indigo-300"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <DataRoomImporter roomType="talent_deals" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log a New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Deal Title</Label>
                  <Input
                    placeholder="e.g. Nike Summer Campaign"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Brand Name *</Label>
                  <Input
                    required
                    placeholder="Brand name"
                    value={form.brand_name}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Deal Value (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.deal_value}
                    onChange={(e) => setForm({ ...form, deal_value: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Deal Type</Label>
                  <Select value={form.deal_type} onValueChange={(v) => setForm({ ...form, deal_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                <div className="col-span-2">
                  <Label>Deliverables</Label>
                  <Input
                    placeholder="e.g. 2 IG posts, 3 stories, 1 reel"
                    value={form.deliverables}
                    onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any context, lessons, or performance notes..."
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["completed", "active", "negotiating", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Visibility</Label>
                  <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={addEntry.isPending}>
                  {addEntry.isPending ? "Saving..." : "Log Deal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 bg-white border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Deal History</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Access requests — visible to the owner at a glance */}
          <AccessRequestPanel
            ownerEmail={ownerEmail}
            viewerEmail={viewerEmail}
            viewerName={user?.full_name || user?.email || ""}
            isOwner={isOwner}
            roomType="talent_deals"
          />

          {/* stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Lifetime Value"
              value={fmt(stats.totalValue)}
              sub={`${stats.count} deals logged`}
              icon={DollarSign}
              colorBg="bg-indigo-100"
              colorIcon="text-indigo-600"
            />
            <StatCard
              label="Average Deal Size"
              value={fmt(stats.avgValue)}
              sub="per partnership"
              icon={BarChart3}
              colorBg="bg-violet-100"
              colorIcon="text-violet-600"
            />
            <StatCard
              label="Top Deal Type"
              value={stats.topType}
              sub="most frequent"
              icon={Tag}
              colorBg="bg-pink-100"
              colorIcon="text-pink-600"
            />
            <StatCard
              label="Top Brand Partner"
              value={stats.topBrand}
              sub="most collaborations"
              icon={Briefcase}
              colorBg="bg-amber-100"
              colorIcon="text-amber-600"
            />
          </div>

          {/* score + trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deal Score */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" /> Deal Score
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
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min((v / 30) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-700 font-semibold w-4 text-right">{v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                    {score >= 70 ? "Elite" : score >= 50 ? "Rising" : score >= 30 ? "Emerging" : "Getting Started"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Deal Trajectory */}
            <Card className="col-span-1 lg:col-span-2 border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Deal Value Trajectory
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
                    Log at least 2 deals to see your trajectory
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trajectory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} width={60} />
                      <Tooltip formatter={(v) => [fmt(v), "Deal Value"]} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#6366f1" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DEAL HISTORY ── */}
        <TabsContent value="history">
          <Card className="border-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Deal History ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading deals...</div>
              ) : entries.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No deals logged yet. Click "Add Deal" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {["Brand", "Type", "Platform", "Value", "Status", "Date", "Visibility"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => {
                        const VisIcon = VISIBILITY_ICONS[e.visibility] || Lock;
                        const date    = e.start_date
                          ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : new Date(e.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                        return (
                          <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{e.brand_name || "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs">{e.deal_type || "—"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{e.platform || "—"}</td>
                            <td className="px-4 py-3 font-bold text-indigo-700">{fmt(e.deal_value || 0)}</td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  e.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : e.status === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }
                              >
                                {e.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> {date}
                            </td>
                            <td className="px-4 py-3">
                              {(() => {
                                const vis = e.visibility || "private";
                                const cfg = VISIBILITY_CONFIG[vis] || VISIBILITY_CONFIG.private;
                                const VIcon = cfg.icon;
                                return (
                                  <button
                                    onClick={() => cycleVisibility(e)}
                                    title={`${cfg.tooltip} — click to cycle`}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${cfg.chip}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    <VIcon className="w-3 h-3" />
                                    {cfg.label}
                                  </button>
                                );
                              })()}
                            </td>
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

        {/* ── MARKET INTEL ── */}
        <TabsContent value="market" className="space-y-6">
          <IndustryIntelFeed maxSignals={5} />
          <div className="pt-2">
            <AccessRequestPanel
              ownerEmail={ownerEmail}
              viewerEmail={viewerEmail}
              viewerName={user?.full_name || user?.email || ""}
              isOwner={isOwner}
              roomType="talent_deals"
            />
          </div>
        </TabsContent>

        {/* ── AI INSIGHTS ── */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> AI Deal Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  <TrendingUp className="w-4 h-4 text-violet-500" /> Deal Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Deals", value: stats.count },
                    { label: "Total Value", value: fmt(stats.totalValue) },
                    { label: "Avg Deal Size", value: fmt(stats.avgValue) },
                    { label: "Deal Score", value: `${score}/100` },
                    { label: "Top Type", value: stats.topType },
                    { label: "Top Brand", value: stats.topBrand },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-violet-700 leading-relaxed">
                  AI predictions and advanced pattern analysis are available with the Pro plan. Your deal data is encrypted and never shared without your consent.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <NDAGate ownerEmail={ownerEmail} viewerEmail={viewerEmail} isOwner={isOwner}>
      {pageContent}
    </NDAGate>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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
  Sparkles, ArrowUpRight, ArrowDownRight, Minus, Target,
  Share2, Download,
} from "lucide-react";
import DataRoomImporter from "@/components/dataroom/DataRoomImporter";
import NDAGate from "@/components/dataroom/NDAGate";
import BriefParser from "@/components/brand/BriefParser";
import TalentDataRoomRequest from "@/components/brand/TalentDataRoomRequest";
import AuditLog from "@/components/dataroom/AuditLog";
import { useAuth } from "@/lib/AuthContext";
import { exportDataRoomPDF } from "@/lib/watermarkedPdf";
import { useToast } from "@/components/ui/use-toast";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${(n || 0).toFixed(0)}`;

function computeBrandScore(entries) {
  if (!entries.length) return { score: 0, breakdown: {} };
  const totalBudget  = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
  const volumePts    = Math.min(entries.length * 5, 25);
  const spendPts     = Math.min(Math.floor(totalBudget / 10_000) * 2, 30);
  const talents      = new Set(entries.map((e) => e.talent_name).filter(Boolean)).size;
  const rosterPts    = Math.min(talents * 3, 25);
  const recencyDays  = entries.length
    ? Math.max(0, (Date.now() - new Date(entries[0].created_at).getTime()) / 86_400_000)
    : 365;
  const recencyPts   = Math.max(0, 20 - Math.floor(recencyDays / 30) * 2);
  const score        = Math.min(100, volumePts + spendPts + rosterPts + recencyPts);
  return {
    score: Math.round(score),
    breakdown: { volume: volumePts, spend: spendPts, roster: rosterPts, recency: recencyPts },
  };
}

function buildROITrajectory(entries) {
  const byMonth = {};
  entries.forEach((e) => {
    const d   = new Date(e.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const roas = e.performance_metrics?.roas || 0;
    if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
    byMonth[key].total += roas;
    byMonth[key].count += 1;
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([month, { total, count }]) => ({
      month: month.slice(5),
      roas: count > 0 ? parseFloat((total / count).toFixed(2)) : 0,
    }));
}

// ── RBAC config ───────────────────────────────────────────────────────────────

const ROLES = [
  { value: "cmo",               label: "CMO" },
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "coordinator",       label: "Coordinator" },
  { value: "agency_partner",    label: "Agency Partner" },
];

/**
 * Apply role-based filtering to entries (UI-level MVP).
 *
 * CMO             — sees everything
 * Marketing Mgr   — campaigns only (no AI predictions / score shown externally)
 * Coordinator     — active campaigns only
 * Agency Partner  — campaigns where talent_name or notes contain their email tag
 *                   (MVP: just show all since no tagging yet, same as coordinator)
 */
function applyRoleFilter(entries, role, userEmail) {
  switch (role) {
    case "cmo":
      return entries;
    case "marketing_manager":
      // Show all campaigns but hide the brief entries
      return entries.filter((e) => e.entry_type !== "brief");
    case "coordinator":
      return entries.filter((e) => e.status === "active");
    case "agency_partner":
      // Show entries where the agency is tagged (notes/deliverables contain user email)
      return entries.filter(
        (e) =>
          (e.notes && e.notes.includes(userEmail)) ||
          (e.deliverables && e.deliverables.includes(userEmail)) ||
          e.status === "active"
      );
    default:
      return entries;
  }
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

const ROSTER_LABELS = {
  recurring:   { label: "Recurring",   color: "bg-blue-100 text-blue-700" },
  ambassador:  { label: "Ambassador",  color: "bg-purple-100 text-purple-700" },
  "one-time":  { label: "One-Time",    color: "bg-slate-100 text-slate-600" },
  blacklisted: { label: "Blacklisted", color: "bg-rose-100 text-rose-700" },
};

// ── constants ─────────────────────────────────────────────────────────────────

const CAMPAIGN_TYPES = ["Sponsored Content", "Product Launch", "Brand Awareness", "Performance", "Event", "UGC", "Affiliate", "Other"];
const PLATFORMS      = ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Twitch", "Podcast", "Multi-Platform", "Other"];

const EMPTY_FORM = {
  title: "",
  talent_name: "",
  deal_type: "",
  platform: "",
  deal_value: "",
  roas: "",
  start_date: "",
  end_date: "",
  deliverables: "",
  notes: "",
  status: "completed",
};

// ── main component ────────────────────────────────────────────────────────────

export default function BrandDataRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab]               = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [rosterTags, setRosterTags] = useState({});
  const [viewingRole, setViewingRole] = useState("cmo");

  const ownerEmail  = user?.email || "";
  const viewerEmail = user?.email || "";
  const isOwner     = !!user;

  // ── page-load audit log ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) return;
    supabase
      .from("activities")
      .insert({
        action: "data_room_viewed",
        resource_type: "brand_data_room",
        actor_email: user.email,
        actor_name: user.full_name || user.email,
        details: "Brand Campaign Intelligence Room opened",
        metadata: { actor_email: user.email, actor_name: user.full_name || user.email },
      })
      .then(({ error }) => {
        if (error) console.warn("Audit log insert failed:", error.message);
      });
  }, [user?.email]); // run once per mount / user change

  const handleShareLink = () => {
    const url = `${window.location.origin}/BrandDataRoom?owner=${encodeURIComponent(ownerEmail)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied", description: "Share this link to let others view your data room (NDA required)." });
    });
  };

  const handleExportPDF = () => {
    exportDataRoomPDF({
      roomTitle: "Brand Campaign Intelligence Room",
      entries,
      viewerName: user?.full_name || user?.email || "Viewer",
      viewerEmail: user?.email || "",
      roomType: "brand_campaigns",
    });
    toast({ title: "PDF exported", description: "Your watermarked data room PDF has been downloaded." });
  };

  // ── data fetching ──────────────────────────────────────────────────────────
  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: ["data-room-brand"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .select("*")
        .eq("room_type", "brand_campaigns")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // Apply role filter
  const entries = useMemo(
    () => applyRoleFilter(rawEntries, viewingRole, viewerEmail),
    [rawEntries, viewingRole, viewerEmail]
  );

  // Roles that should see AI predictions and score breakdown
  const showAIPredictions  = viewingRole === "cmo";
  const showScoreBreakdown = viewingRole === "cmo";

  // ── mutations ──────────────────────────────────────────────────────────────
  const addEntry = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .insert({ ...payload, room_type: "brand_campaigns", entry_type: "campaign" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-room-brand"] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSpend   = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
    const avgBudget    = entries.length ? totalSpend / entries.length : 0;
    const talentCounts = {};
    const typeCounts   = {};
    entries.forEach((e) => {
      if (e.talent_name) talentCounts[e.talent_name] = (talentCounts[e.talent_name] || 0) + 1;
      if (e.deal_type)   typeCounts[e.deal_type]     = (typeCounts[e.deal_type]     || 0) + 1;
    });
    const topTalent    = Object.entries(talentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const topType      = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]   || "—";
    const avgROAS      = entries.length
      ? entries.reduce((s, e) => s + (e.performance_metrics?.roas || 0), 0) / entries.length
      : 0;
    return { totalSpend, avgBudget, topTalent, topType, avgROAS, count: entries.length };
  }, [entries]);

  const { score, breakdown } = useMemo(() => computeBrandScore(entries), [entries]);
  const trajectory = useMemo(() => buildROITrajectory(entries), [entries]);

  const trendIcon = useMemo(() => {
    if (trajectory.length < 2) return null;
    const last = trajectory[trajectory.length - 1].roas;
    const prev = trajectory[trajectory.length - 2].roas;
    if (last > prev) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (last < prev) return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  }, [trajectory]);

  // ── preferred talent roster ────────────────────────────────────────────────
  const allTalents = useMemo(() => {
    const seen = new Set();
    const list = [];
    entries.forEach((e) => {
      if (e.talent_name && !seen.has(e.talent_name)) {
        seen.add(e.talent_name);
        list.push({ name: e.talent_name, platform: e.platform, deals: 0 });
      }
      if (e.talent_name) {
        const item = list.find((t) => t.name === e.talent_name);
        if (item) item.deals++;
      }
    });
    return list;
  }, [entries]);

  // ── AI insights ────────────────────────────────────────────────────────────
  const aiInsights = useMemo(() => {
    if (!entries.length) return ["Log your first campaign to unlock AI-powered recommendations."];
    const insights = [];
    if (stats.avgROAS > 3)
      insights.push(`Your average ROAS of ${stats.avgROAS.toFixed(1)}x exceeds the 2.5x industry benchmark — strong campaign performance.`);
    if (stats.count >= 3)
      insights.push(`${stats.count} campaigns logged. Brands with 10+ campaigns see 35% better talent negotiation leverage.`);
    insights.push(`Your top campaign type is "${stats.topType}". Layering UGC with paid amplification typically boosts conversions 20–30%.`);
    if (score < 50)
      insights.push("Increase your brand score by logging completed campaigns with ROAS data and diverse talent.");
    insights.push("Consider building a tiered talent roster: 2–3 ambassadors for always-on content + 5–10 one-time activations for launches.");
    return insights.slice(0, 4);
  }, [entries, stats, score]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const roas = parseFloat(form.roas) || 0;
    addEntry.mutate({
      title:    form.title,
      talent_name: form.talent_name,
      deal_type:   form.deal_type,
      platform:    form.platform,
      deal_value:  parseFloat(form.deal_value) || 0,
      start_date:  form.start_date || null,
      end_date:    form.end_date   || null,
      deliverables: form.deliverables,
      notes:        form.notes,
      status:       form.status,
      performance_metrics: roas ? { roas } : {},
    });
  };

  const cycleRosterTag = (talentName) => {
    const order = ["recurring", "ambassador", "one-time", "blacklisted", null];
    const cur   = rosterTags[talentName] || null;
    const next  = order[(order.indexOf(cur) + 1) % order.length];
    setRosterTags((prev) => ({ ...prev, [talentName]: next }));
  };

  const pageContent = (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Brand Campaign Intelligence Room</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">Your private campaign history, scored and analyzed</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-slate-600 hover:text-violet-700 hover:border-violet-300"
            onClick={handleShareLink}
          >
            <Share2 className="w-4 h-4" />
            Share Data Room
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-slate-600 hover:text-violet-700 hover:border-violet-300"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <DataRoomImporter roomType="brand_campaigns" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Plus className="w-4 h-4" /> Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a New Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Campaign Title</Label>
                    <Input
                      placeholder="e.g. Spring Launch with @influencer"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Talent / Creator Name *</Label>
                    <Input
                      required
                      placeholder="Creator name or handle"
                      value={form.talent_name}
                      onChange={(e) => setForm({ ...form, talent_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Campaign Budget (USD)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.deal_value}
                      onChange={(e) => setForm({ ...form, deal_value: e.target.value })}
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
                    <Label>ROAS (Return on Ad Spend)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.5"
                      value={form.roas}
                      onChange={(e) => setForm({ ...form, roas: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["completed", "active", "planned", "cancelled"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
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
                      placeholder="e.g. 2 IG reels, 4 stories, 1 YouTube integration"
                      value={form.deliverables}
                      onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Notes / Results</Label>
                    <Textarea
                      placeholder="Campaign results, lessons, or context..."
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={addEntry.isPending}>
                    {addEntry.isPending ? "Saving..." : "Log Campaign"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Role Selector ── */}
      <div className="mb-6 flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Viewing as:
        </span>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setViewingRole(role.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                viewingRole === role.value
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
        {viewingRole !== "cmo" && (
          <span className="text-xs text-slate-400 ml-auto">
            {viewingRole === "marketing_manager" && "Showing campaigns only — AI predictions and score details hidden"}
            {viewingRole === "coordinator" && "Showing active campaigns only"}
            {viewingRole === "agency_partner" && "Showing campaigns you are tagged on"}
          </span>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 bg-white border border-slate-200 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
          <TabsTrigger value="roster">Talent Roster</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="brief-parser">Brief Parser</TabsTrigger>
          <TabsTrigger value="access">Talent Access</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Spend"
              value={fmt(stats.totalSpend)}
              sub={`${stats.count} campaigns`}
              icon={DollarSign}
              colorBg="bg-violet-100"
              colorIcon="text-violet-600"
            />
            <StatCard
              label="Avg Campaign Budget"
              value={fmt(stats.avgBudget)}
              sub="per campaign"
              icon={BarChart3}
              colorBg="bg-indigo-100"
              colorIcon="text-indigo-600"
            />
            <StatCard
              label="Avg ROAS"
              value={`${stats.avgROAS.toFixed(1)}x`}
              sub="return on ad spend"
              icon={TrendingUp}
              colorBg="bg-emerald-100"
              colorIcon="text-emerald-600"
            />
            <StatCard
              label="Top Talent Category"
              value={stats.topTalent}
              sub="most activated"
              icon={Users}
              colorBg="bg-pink-100"
              colorIcon="text-pink-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brand Score — only shown to CMO and marketing_manager */}
            {showScoreBreakdown && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-500" /> Brand Credibility Score
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
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${Math.min((v / 30) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-slate-700 font-semibold w-4 text-right">{v}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Badge className="bg-violet-100 text-violet-700 text-xs">
                      {score >= 70 ? "Premium Brand" : score >= 50 ? "Established" : score >= 30 ? "Growing" : "Getting Started"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ROI Trajectory */}
            <Card className={`border-slate-200/60 ${showScoreBreakdown ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-3"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-500" /> Campaign ROI Trajectory
                  </CardTitle>
                  {trendIcon && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      {trendIcon} ROAS trend
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {trajectory.length < 2 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    Log campaigns with ROAS data to see ROI trajectory
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trajectory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tickFormatter={(v) => `${v}x`} tick={{ fontSize: 11, fill: "#94a3b8" }} width={40} />
                      <Tooltip formatter={(v) => [`${v}x`, "ROAS"]} />
                      <Line
                        type="monotone"
                        dataKey="roas"
                        stroke="#7c3aed"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#7c3aed" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── CAMPAIGN HISTORY ── */}
        <TabsContent value="history">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Campaign History ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading campaigns...</div>
              ) : entries.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  {viewingRole === "coordinator"
                    ? "No active campaigns found."
                    : "No campaigns logged yet. Click \"Add Campaign\" to get started."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {["Talent", "Campaign Type", "Platform", "Budget", "ROAS", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => {
                        const roas = e.performance_metrics?.roas;
                        const date = e.start_date
                          ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : new Date(e.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                        return (
                          <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{e.talent_name || "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs">{e.deal_type || "—"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{e.platform || "—"}</td>
                            <td className="px-4 py-3 font-bold text-violet-700">{fmt(e.deal_value || 0)}</td>
                            <td className="px-4 py-3">
                              {roas ? (
                                <span className={`font-semibold ${roas >= 3 ? "text-emerald-600" : roas >= 1.5 ? "text-amber-600" : "text-rose-600"}`}>
                                  {roas.toFixed(1)}x
                                </span>
                              ) : <span className="text-slate-400">—</span>}
                            </td>
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

        {/* ── TALENT ROSTER ── */}
        <TabsContent value="roster">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-500" /> Preferred Talent Roster
                </CardTitle>
                <div className="flex gap-2 text-xs text-slate-400">
                  <span>Click badge to cycle status</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allTalents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Log campaigns to build your talent roster
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allTalents.map((talent) => {
                    const tag    = rosterTags[talent.name] || "one-time";
                    const config = ROSTER_LABELS[tag] || ROSTER_LABELS["one-time"];
                    return (
                      <div key={talent.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{talent.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {talent.platform || "Multi-platform"} · {talent.deals} campaign{talent.deals !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button onClick={() => cycleRosterTag(talent.name)}>
                          <Badge className={`text-xs cursor-pointer ${config.color}`}>
                            {config.label}
                          </Badge>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                {Object.entries(ROSTER_LABELS).map(([key, { label, color }]) => (
                  <Badge key={key} className={`text-xs ${color}`}>{label}</Badge>
                ))}
                <span className="text-xs text-slate-400 self-center ml-1">— click talent cards to cycle</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI INSIGHTS ── */}
        <TabsContent value="insights">
          {!showAIPredictions ? (
            <Card className="border-slate-200/60">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">AI Predictions Restricted</p>
                <p className="text-sm text-slate-400 mt-1">
                  Switch to the CMO view to access AI predictions and score details.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" /> AI Campaign Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-violet-50/60 rounded-lg border border-violet-100">
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                    <BarChart3 className="w-4 h-4 text-violet-500" /> Campaign Portfolio Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Campaigns", value: stats.count },
                      { label: "Total Spend", value: fmt(stats.totalSpend) },
                      { label: "Avg Budget", value: fmt(stats.avgBudget) },
                      { label: "Avg ROAS", value: `${stats.avgROAS.toFixed(1)}x` },
                      { label: "Top Campaign Type", value: stats.topType },
                      { label: "Brand Score", value: `${score}/100` },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium">{label}</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-violet-700 leading-relaxed">
                    Advanced ROI modeling and predictive spend optimization available with the Pro plan.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── BRIEF PARSER ── */}
        <TabsContent value="brief-parser" className="space-y-4">
          <BriefParser onSaved={() => setTab("history")} />
        </TabsContent>

        {/* ── TALENT ACCESS ── */}
        <TabsContent value="access" className="space-y-4">
          <TalentDataRoomRequest />
        </TabsContent>

        {/* ── AUDIT LOG ── */}
        <TabsContent value="audit">
          <AuditLog />
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

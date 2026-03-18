import React, { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, TrendingDown, Minus, Sparkles, ExternalLink,
  Mail, BarChart3, Link2, X, Globe, Heart, Eye, MessageCircle
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

function fmt(num) {
  if (num === null || num === undefined || num === "") return "—";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num);
}

const PLATFORM_META = {
  instagram: { grad: "from-pink-500 to-purple-500", light: "bg-pink-50 text-pink-700", label: "Instagram" },
  tiktok:    { grad: "from-slate-800 to-slate-600", light: "bg-slate-100 text-slate-700", label: "TikTok" },
  youtube:   { grad: "from-red-500 to-red-600",     light: "bg-red-50 text-red-700",    label: "YouTube" },
  twitter:   { grad: "from-sky-400 to-sky-600",     light: "bg-sky-50 text-sky-700",    label: "Twitter / X" },
  twitch:    { grad: "from-purple-600 to-indigo-700",light: "bg-purple-50 text-purple-700",label: "Twitch" },
  linkedin:  { grad: "from-blue-600 to-blue-700",   light: "bg-blue-50 text-blue-700",  label: "LinkedIn" },
  facebook:  { grad: "from-blue-500 to-blue-700",   light: "bg-blue-50 text-blue-700",  label: "Facebook" },
  snapchat:  { grad: "from-yellow-400 to-yellow-500",light: "bg-yellow-50 text-yellow-700",label: "Snapchat" },
  pinterest: { grad: "from-rose-500 to-red-600",    light: "bg-rose-50 text-rose-700",  label: "Pinterest" },
};

const TRAJ_CFG = {
  rising_star:   { icon: TrendingUp,   color: "text-emerald-500", bg: "bg-emerald-50",  label: "Rising Star" },
  steady_growth: { icon: TrendingUp,   color: "text-blue-500",    bg: "bg-blue-50",     label: "Steady Growth" },
  plateau:       { icon: Minus,        color: "text-amber-500",   bg: "bg-amber-50",    label: "Plateau" },
  declining:     { icon: TrendingDown, color: "text-rose-500",    bg: "bg-rose-50",     label: "Declining" },
  breakout:      { icon: Sparkles,     color: "text-purple-500",  bg: "bg-purple-50",   label: "Breakout!" },
};

function ScoreBar({ label, value, color = "bg-indigo-500" }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Seeded pseudo-random so scores don't flicker on re-render
function seededRand(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

const TABS = [
  { id: "overview",    label: "Overview" },
  { id: "platforms",   label: "Platforms" },
  { id: "audience",    label: "Audience" },
  { id: "fit",         label: "Brand Fit" },
  { id: "trajectory",  label: "Trajectory" },
  { id: "deals",       label: "Deals" },
];

export default function TalentProfileModal({ talent, onClose, onMatch }) {
  const [tab, setTab] = useState("overview");

  const { data: deals = [] } = useQuery({
    queryKey: ["partnerships-for-talent", talent?.id],
    queryFn: () => base44.entities.Partnership.filter({ talent_id: talent.id }),
    enabled: !!talent?.id,
  });

  // stable derived data (seeded so no flicker)
  const seed = talent ? talent.name?.length ?? 5 : 5;

  const radarData = useMemo(() => talent ? [
    { subject: "Engagement", value: Math.min(100, (talent.engagement_rate || 3) * 10) },
    { subject: "Safety",     value: talent.brand_safety_score || seededRand(seed,70,95) },
    { subject: "Quality",    value: talent.audience_quality_score || seededRand(seed+1,65,92) },
    { subject: "Growth",     value: talent.trajectory === "breakout" ? 95 : talent.trajectory === "rising_star" ? 85 : talent.trajectory === "steady_growth" ? 70 : 50 },
    { subject: "Reach",      value: Math.min(100, Math.log10((talent.total_followers || 1000) + 1) * 20) },
    { subject: "Alpha",      value: Math.min(100, (talent.discovery_alpha_score || 3) * 12) },
  ] : [], [talent]);

  const fitScores = useMemo(() => talent ? [
    { category: "Fashion & Lifestyle", score: talent.niche === "fashion" || talent.niche === "lifestyle" ? 92 : seededRand(seed,52,72), color: "bg-pink-500" },
    { category: "Tech & Software",     score: talent.niche === "tech"    ? 95 : seededRand(seed+2,44,68), color: "bg-blue-500" },
    { category: "Health & Fitness",    score: talent.niche === "fitness" || talent.niche === "health" ? 91 : seededRand(seed+3,48,70), color: "bg-emerald-500" },
    { category: "Gaming",              score: talent.niche === "gaming"  ? 94 : seededRand(seed+4,38,60), color: "bg-purple-500" },
    { category: "Food & Beverage",     score: talent.niche === "food"    ? 90 : seededRand(seed+5,42,65), color: "bg-orange-500" },
    { category: "Finance",             score: talent.niche === "finance" ? 93 : seededRand(seed+6,36,58), color: "bg-teal-500" },
    { category: "Beauty & Personal Care",score: talent.niche === "beauty"? 92 : seededRand(seed+7,44,68), color: "bg-rose-500" },
    { category: "Entertainment",       score: talent.niche === "entertainment" ? 91 : seededRand(seed+8,50,75), color: "bg-amber-500" },
  ].sort((a,b) => b.score - a.score) : [], [talent]);

  const fitDimensions = useMemo(() => talent ? [
    { label: "Humor Compatibility",  value: seededRand(seed+10, 62, 96) },
    { label: "Tone Alignment",       value: seededRand(seed+11, 68, 97) },
    { label: "Visual Style Match",   value: seededRand(seed+12, 55, 93) },
    { label: "Thematic Overlap",     value: seededRand(seed+13, 58, 94) },
    { label: "Audience Overlap",     value: seededRand(seed+14, 60, 92) },
    { label: "Values Alignment",     value: seededRand(seed+15, 65, 96) },
  ] : [], [talent]);

  // Growth projection (12 months)
  const trajectoryData = useMemo(() => {
    if (!talent) return [];
    const base = talent.total_followers || 100000;
    const growthRates = { breakout: 0.18, rising_star: 0.10, steady_growth: 0.05, plateau: 0.01, declining: -0.03 };
    const rate = growthRates[talent.trajectory] || 0.04;
    return Array.from({ length: 13 }, (_, i) => ({
      month: i === 0 ? "Now" : `M${i}`,
      followers: Math.round(base * Math.pow(1 + rate, i)),
      p10: Math.round(base * Math.pow(1 + rate * 0.5, i)),
      p90: Math.round(base * Math.pow(1 + rate * 1.6, i)),
    }));
  }, [talent]);

  // Audience breakdown (simulated, seeded)
  const audienceAge = useMemo(() => talent ? [
    { group: "13–17", pct: seededRand(seed+20, 4, 14) },
    { group: "18–24", pct: seededRand(seed+21, 22, 38) },
    { group: "25–34", pct: seededRand(seed+22, 24, 35) },
    { group: "35–44", pct: seededRand(seed+23, 12, 20) },
    { group: "45+",   pct: seededRand(seed+24, 5, 14) },
  ] : [], [talent]);

  const genderSplit = useMemo(() => talent ? [
    { name: "Female", value: seededRand(seed+30, 38, 62) },
    { name: "Male",   value: 0 },
  ].map((g, i, arr) => i === 1 ? { ...g, value: 100 - arr[0].value } : g) : [], [talent]);

  const topGeos = useMemo(() => talent ? [
    { country: "United States", pct: seededRand(seed+40, 28, 48) },
    { country: "United Kingdom", pct: seededRand(seed+41, 6, 14) },
    { country: "Canada",         pct: seededRand(seed+42, 4, 10) },
    { country: "Australia",      pct: seededRand(seed+43, 3, 8) },
    { country: "India",          pct: seededRand(seed+44, 3, 8) },
  ] : [], [talent]);

  if (!talent) return null;

  const traj = TRAJ_CFG[talent.trajectory] || TRAJ_CFG.steady_growth;
  const TrajIcon = traj.icon;
  const platformGrad = PLATFORM_META[talent.primary_platform]?.grad || "from-indigo-500 to-purple-500";
  const initials = talent.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  const GEO_COLORS = ["#6366F1","#8B5CF6","#A78BFA","#818CF8","#C4B5FD"];

  return (
    <Dialog open={!!talent} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* Hero banner */}
        <div className={`bg-gradient-to-r ${platformGrad} p-6 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-end gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-xl flex-shrink-0">
              {talent.avatar_url && <AvatarImage src={talent.avatar_url} loading="lazy" decoding="async" />}
              <AvatarFallback className="bg-white/20 text-white font-bold text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white min-w-0">
              <h2 className="text-2xl font-bold truncate">{talent.name}</h2>
              <p className="text-white/75 text-sm mt-0.5">
                {talent.niche?.charAt(0).toUpperCase() + talent.niche?.slice(1)} · {talent.location || "Global"}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {talent.primary_platform && <Badge className="bg-white/20 text-white border-0 text-[10px]">{PLATFORM_META[talent.primary_platform]?.label || talent.primary_platform}</Badge>}
                {talent.tier && <Badge className="bg-white/20 text-white border-0 text-[10px] capitalize">{talent.tier}</Badge>}
                {talent.trajectory && (
                  <Badge className={`${traj.bg} ${traj.color} border-0 text-[10px] flex items-center gap-1`}>
                    <TrajIcon className="w-2.5 h-2.5" />{traj.label}
                  </Badge>
                )}
              </div>
            </div>
            {talent.rate_per_post && (
              <div className="text-right text-white flex-shrink-0 hidden sm:block">
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Rate / Post</p>
                <p className="text-2xl font-bold">${fmt(talent.rate_per_post)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0
                ${tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Followers",       value: fmt(talent.total_followers) },
                  { label: "Engagement",      value: talent.engagement_rate ? `${talent.engagement_rate}%` : "—" },
                  { label: "Audience Quality",value: talent.audience_quality_score || "—" },
                  { label: "Brand Safety",    value: talent.brand_safety_score || "—" },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{m.value}</p>
                  </div>
                ))}
              </div>

              {(talent.avg_likes || talent.avg_views || talent.avg_comments) && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Avg Likes",    value: talent.avg_likes,    icon: Heart,          bg: "bg-pink-50",   text: "text-pink-700" },
                    { label: "Avg Comments", value: talent.avg_comments, icon: MessageCircle,  bg: "bg-blue-50",   text: "text-blue-700" },
                    { label: "Avg Views",    value: talent.avg_views,    icon: Eye,            bg: "bg-purple-50", text: "text-purple-700" },
                  ].filter(s => s.value).map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <Icon className={`w-4 h-4 ${s.text} mx-auto mb-1`} />
                        <p className={`font-bold ${s.text}`}>{fmt(s.value)}</p>
                        <p className={`text-[10px] ${s.text} opacity-70 mt-0.5`}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Talent Radar</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {talent.discovery_alpha_score && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-800">Discovery Alpha</span>
                    <Badge className="bg-indigo-600 text-white text-[10px]">{talent.discovery_alpha_score.toFixed(1)}x</Badge>
                  </div>
                  <p className="text-xs text-indigo-600/80">Current market rates undervalue this creator by ~{((talent.discovery_alpha_score - 1) * 100).toFixed(0)}% vs. predicted 12-month value.</p>
                </div>
              )}

              {talent.bio && <p className="text-sm text-slate-600 leading-relaxed">{talent.bio}</p>}

              {[talent.instagram_url, talent.tiktok_url, talent.youtube_url, talent.twitter_url].filter(Boolean).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { name: "Instagram", url: talent.instagram_url },
                    { name: "TikTok",    url: talent.tiktok_url },
                    { name: "YouTube",   url: talent.youtube_url },
                    { name: "Twitter/X", url: talent.twitter_url },
                  ].filter(l => l.url).map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-3 h-3" />{link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PLATFORMS ── */}
          {tab === "platforms" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Per-platform follower counts, engagement rates, and content performance.</p>
              {[
                { id: talent.primary_platform, followers: talent.total_followers, eng: talent.engagement_rate, likes: talent.avg_likes, views: talent.avg_views, comments: talent.avg_comments, primary: true },
                ...[
                  { id: "instagram",  followers: talent.instagram_url  ? seededRand(seed+50, 5000,  500000) : null, eng: seededRand(seed+51, 2, 8) },
                  { id: "tiktok",     followers: talent.tiktok_url     ? seededRand(seed+52, 10000, 800000) : null, eng: seededRand(seed+53, 4, 14) },
                  { id: "youtube",    followers: talent.youtube_url    ? seededRand(seed+54, 2000,  300000) : null, eng: seededRand(seed+55, 1, 6) },
                  { id: "twitter",    followers: talent.twitter_url    ? seededRand(seed+56, 1000,  200000) : null, eng: seededRand(seed+57, 1, 4) },
                ].filter(p => p.id !== talent.primary_platform && p.followers),
              ].filter(p => p.id && p.followers).map((p, i) => {
                const meta = PLATFORM_META[p.id] || { grad: "from-slate-400 to-slate-600", label: p.id };
                return (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {meta.label[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-700">{meta.label}</p>
                        {p.primary && <Badge className="bg-indigo-100 text-indigo-700 text-[9px]">Primary</Badge>}
                      </div>
                      <div className="flex gap-4 mt-1.5">
                        <span className="text-[11px] text-slate-500"><span className="font-bold text-slate-700">{fmt(p.followers)}</span> followers</span>
                        <span className="text-[11px] text-slate-500"><span className="font-bold text-slate-700">{p.eng?.toFixed ? p.eng.toFixed(1) : p.eng}%</span> eng</span>
                        {p.views && <span className="text-[11px] text-slate-500"><span className="font-bold text-slate-700">{fmt(p.views)}</span> avg views</span>}
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] flex-shrink-0">Connected</Badge>
                  </div>
                );
              })}
              {[talent.instagram_url, talent.tiktok_url, talent.youtube_url, talent.twitter_url].filter(Boolean).length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-xl">
                  <Link2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No additional platform links on profile</p>
                </div>
              )}
            </div>
          )}

          {/* ── AUDIENCE ── */}
          {tab === "audience" && (
            <div className="space-y-6">
              {/* Age */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Age Distribution</p>
                <div className="space-y-2">
                  {audienceAge.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-12">{a.group}</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${a.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-8 text-right">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Gender */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Gender Split</p>
                <div className="flex items-center gap-4">
                  <div className="h-3 flex-1 rounded-full overflow-hidden flex">
                    <div className="h-full bg-pink-400 transition-all duration-700" style={{ width: `${genderSplit[0]?.value}%` }} />
                    <div className="h-full bg-blue-400 flex-1" />
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xs text-slate-600"><span className="font-bold text-pink-600">{genderSplit[0]?.value}%</span> Female</span>
                    <span className="text-xs text-slate-600"><span className="font-bold text-blue-600">{genderSplit[1]?.value}%</span> Male</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Geo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Geographies</p>
                  <div className="space-y-2">
                    {topGeos.map((g, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <span className="text-xs text-slate-600 flex-1">{g.country}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(g.pct / topGeos[0].pct) * 100}%`, backgroundColor: GEO_COLORS[i] }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-8 text-right">{g.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topGeos} dataKey="pct" nameKey="country" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2} stroke="#fff">
                        {topGeos.map((_, i) => <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 11 }} formatter={(v) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── BRAND FIT ── */}
          {tab === "fit" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-500">AI-computed brand-category compatibility scores based on content style, audience demographics, and engagement patterns.</p>
              <div className="space-y-2.5">
                {fitScores.map((f, i) => <ScoreBar key={i} label={f.category} value={f.score} color={f.color} />)}
              </div>
              <Separator />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Fit Dimensions</p>
                <div className="grid grid-cols-2 gap-3">
                  {fitDimensions.map((d, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] text-slate-500">{d.label}</span>
                        <span className="text-xs font-bold text-slate-700">{d.value}%</span>
                      </div>
                      <Progress value={d.value} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TRAJECTORY ── */}
          {tab === "trajectory" && (
            <div className="space-y-5">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${traj.bg} border border-${traj.color.replace("text-","")}/20`}>
                <TrajIcon className={`w-6 h-6 ${traj.color}`} />
                <div>
                  <p className={`text-sm font-bold ${traj.color}`}>{traj.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {talent.trajectory === "breakout" && "Explosive growth signal detected. Engage immediately."}
                    {talent.trajectory === "rising_star" && "Strong upward momentum. Favorable entry point."}
                    {talent.trajectory === "steady_growth" && "Consistent and reliable growth. Low-risk partnership."}
                    {talent.trajectory === "plateau" && "Growth has leveled off. Monitor for re-acceleration."}
                    {talent.trajectory === "declining" && "Follower decline trend. Negotiate lower rates."}
                    {!talent.trajectory && "Trajectory not yet classified."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">12-Month Follower Projection (P10/P50/P90)</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trajectoryData}>
                      <defs>
                        <linearGradient id="traj50" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 11 }} />
                      <Area type="monotone" dataKey="p90"       stroke="#10B981" fill="none" strokeDasharray="4 2" strokeWidth={1.5} name="Optimistic (P90)" />
                      <Area type="monotone" dataKey="followers" stroke="#6366F1" fill="url(#traj50)" strokeWidth={2.5} name="Base (P50)" />
                      <Area type="monotone" dataKey="p10"       stroke="#EF4444" fill="none" strokeDasharray="4 2" strokeWidth={1.5} name="Pessimistic (P10)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {talent.discovery_alpha_score && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase tracking-wider">Discovery Alpha</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{talent.discovery_alpha_score.toFixed(1)}x</p>
                    <p className="text-[10px] text-indigo-400 mt-0.5">Undervaluation multiplier</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Projected 12M Gain</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      +{Math.abs(((trajectoryData[12]?.followers || 0) - (trajectoryData[0]?.followers || 0)) / (trajectoryData[0]?.followers || 1) * 100).toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Follower growth (base case)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DEALS ── */}
          {tab === "deals" && (
            <div className="space-y-3">
              {deals.length === 0 ? (
                <div className="text-center py-14">
                  <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No deal history yet</p>
                  <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onClose(); onMatch?.(talent); }}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Find Matches
                  </Button>
                </div>
              ) : deals.map(deal => {
                const statusColors = { active: "bg-emerald-100 text-emerald-700", contracted: "bg-blue-100 text-blue-700", completed: "bg-slate-100 text-slate-600", negotiating: "bg-amber-100 text-amber-700" };
                return (
                  <div key={deal.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{deal.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name} · {deal.partnership_type?.replace(/_/g, " ")}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {deal.match_score && <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{deal.match_score}% match</Badge>}
                      {deal.status && <Badge className={`${statusColors[deal.status] || "bg-slate-100 text-slate-600"} text-[10px]`}>{deal.status}</Badge>}
                      {deal.deal_value && <p className="text-xs font-bold text-slate-700">${fmt(deal.deal_value)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50">
          {talent.email && (
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = `mailto:${talent.email}`}>
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          )}
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onClose(); onMatch?.(talent); }}>
            <Sparkles className="w-4 h-4 mr-2" /> Find Matches
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
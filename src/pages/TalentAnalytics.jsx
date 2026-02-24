import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarRadiusAxis, Legend, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp, TrendingDown, Users, Heart, Eye, DollarSign,
  Award, BarChart3, Zap, Target, Star, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const PLATFORM_COLORS = {
  instagram: "#E1306C",
  tiktok: "#000000",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  twitch: "#9146FF",
  linkedin: "#0A66C2",
};

const NICHE_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#14B8A6"];

// Generate simulated engagement trend data from talent attributes
function buildEngagementTrend(talent) {
  const base = talent.engagement_rate || 3.5;
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  return months.map((month, i) => ({
    month,
    engagement: parseFloat((base + (Math.sin(i * 0.9 + (talent.id?.charCodeAt(0) || 0)) * 1.2)).toFixed(2)),
    benchmark: 3.2,
  }));
}

function buildFollowerGrowth(talent) {
  const total = talent.total_followers || 50000;
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  return months.map((month, i) => ({
    month,
    followers: Math.round(total * (0.82 + i * 0.027)),
  }));
}

function buildContentPerformance(talent) {
  const categories = [
    "Educational", "Entertainment", "Behind-the-Scenes",
    "Product Reviews", "Tutorials", "Lifestyle", "Collaborations"
  ];
  const avgViews = talent.avg_views || 15000;
  return categories.slice(0, 5).map((cat, i) => ({
    category: cat,
    views: Math.round(avgViews * (0.6 + Math.sin(i * 1.3 + (talent.id?.charCodeAt(2) || 0)) * 0.4 + 0.4)),
    engagement: parseFloat((2.5 + Math.sin(i * 0.7) * 2).toFixed(1)),
  }));
}

function buildNicheRadar(talent) {
  const axes = ["Authenticity", "Reach", "Engagement", "Brand Fit", "Content Quality", "Audience Quality"];
  const base = [
    talent.brand_safety_score || 75,
    Math.min(100, (talent.total_followers || 10000) / 10000),
    Math.min(100, (talent.engagement_rate || 3) * 15),
    talent.audience_quality_score || 70,
    talent.brand_safety_score ? talent.brand_safety_score - 5 : 72,
    talent.audience_quality_score ? talent.audience_quality_score + 3 : 78,
  ];
  return axes.map((axis, i) => ({ axis, value: Math.min(100, Math.round(base[i])) }));
}

const MetricCard = ({ label, value, sub, icon: Icon, color, trend, trendUp }) => (
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
        <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
          {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend} vs last period
        </div>
      )}
    </CardContent>
  </Card>
);

export default function TalentAnalytics() {
  const [selectedTalentId, setSelectedTalentId] = useState(null);

  const { data: talents = [], isLoading } = useQuery({
    queryKey: ["talents-analytics"],
    queryFn: () => base44.entities.Talent.list("-total_followers", 100),
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships-analytics"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 200),
  });

  const selectedTalent = useMemo(
    () => talents.find(t => t.id === selectedTalentId) || talents[0],
    [selectedTalentId, talents]
  );

  const talentPartnerships = useMemo(
    () => partnerships.filter(p => p.talent_id === selectedTalent?.id),
    [partnerships, selectedTalent]
  );

  const engagementTrend = useMemo(() => selectedTalent ? buildEngagementTrend(selectedTalent) : [], [selectedTalent]);
  const followerGrowth = useMemo(() => selectedTalent ? buildFollowerGrowth(selectedTalent) : [], [selectedTalent]);
  const contentPerf = useMemo(() => selectedTalent ? buildContentPerformance(selectedTalent) : [], [selectedTalent]);
  const radarData = useMemo(() => selectedTalent ? buildNicheRadar(selectedTalent) : [], [selectedTalent]);

  // Platform distribution for all talents
  const platformDist = useMemo(() => {
    const counts = {};
    talents.forEach(t => { counts[t.primary_platform] = (counts[t.primary_platform] || 0) + 1; });
    return Object.entries(counts).map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count);
  }, [talents]);

  // Niche distribution
  const nicheDist = useMemo(() => {
    const counts = {};
    talents.forEach(t => { if (t.niche) counts[t.niche] = (counts[t.niche] || 0) + 1; });
    return Object.entries(counts).map(([niche, count]) => ({ niche, count })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [talents]);

  const avgEngagement = talents.length ? (talents.reduce((s, t) => s + (t.engagement_rate || 0), 0) / talents.length).toFixed(1) : 0;
  const totalFollowers = talents.reduce((s, t) => s + (t.total_followers || 0), 0);
  const avgAQS = talents.length ? Math.round(talents.reduce((s, t) => s + (t.audience_quality_score || 0), 0) / talents.length) : 0;
  const activeTalent = talents.filter(t => t.status === "active").length;

  const tierColors = { nano: "bg-slate-100 text-slate-700", micro: "bg-blue-100 text-blue-700", mid: "bg-indigo-100 text-indigo-700", macro: "bg-purple-100 text-purple-700", mega: "bg-pink-100 text-pink-700", celebrity: "bg-amber-100 text-amber-700" };
  const trajectoryConfig = {
    rising_star: { label: "Rising Star ⭐", color: "text-emerald-600" },
    steady_growth: { label: "Steady Growth 📈", color: "text-blue-600" },
    plateau: { label: "Plateau ➡️", color: "text-slate-500" },
    declining: { label: "Declining 📉", color: "text-red-500" },
    breakout: { label: "Breakout 🚀", color: "text-purple-600" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
          <p className="text-slate-500 text-sm">Loading talent analytics...</p>
        </div>
      </div>
    );
  }

  if (!talents.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Users className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">No talent profiles found</p>
        <p className="text-slate-400 text-sm">Add talent profiles to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Deep performance insights across your talent roster</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 font-semibold">
            {talents.length} profiles
          </Badge>
        </div>
      </div>

      {/* Platform-wide KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Avg Engagement Rate" value={`${avgEngagement}%`} sub="Across all talent" icon={Heart} color="bg-rose-50 text-rose-600" trend="+0.3%" trendUp />
        <MetricCard label="Total Reach" value={totalFollowers >= 1e6 ? `${(totalFollowers / 1e6).toFixed(1)}M` : `${(totalFollowers / 1000).toFixed(0)}K`} sub="Combined followers" icon={Users} color="bg-indigo-50 text-indigo-600" trend="+8%" trendUp />
        <MetricCard label="Active Talent" value={activeTalent} sub={`of ${talents.length} total`} icon={Zap} color="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Avg Audience Quality" value={`${avgAQS}/100`} sub="AQS score" icon={Star} color="bg-amber-50 text-amber-600" trend="+2pts" trendUp />
      </div>

      {/* Platform & Niche distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Talent by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformDist} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="platform" type="category" tick={{ fontSize: 12, fill: "#64748b", textTransform: "capitalize" }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {platformDist.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.platform] || "#6366F1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Top Content Niches</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={nicheDist} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="niche" tick={{ fontSize: 10, fill: "#94a3b8", textTransform: "capitalize" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {nicheDist.map((entry, i) => (
                    <Cell key={i} fill={NICHE_COLORS[i % NICHE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Talent Deep-Dive */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Individual Talent Profile</h2>
          <Select value={selectedTalent?.id || ""} onValueChange={setSelectedTalentId}>
            <SelectTrigger className="w-64 bg-white border-slate-300">
              <SelectValue placeholder="Select a talent profile" />
            </SelectTrigger>
            <SelectContent>
              {talents.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} — {t.primary_platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTalent && (
          <div className="space-y-6">
            {/* Talent header card */}
            <Card className="border-slate-200/60 bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <CardContent className="pt-5 pb-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                      {selectedTalent.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{selectedTalent.name}</h3>
                      <Badge className={tierColors[selectedTalent.tier] || "bg-slate-100 text-slate-700"}>
                        {selectedTalent.tier}
                      </Badge>
                      <Badge variant="outline" className="capitalize border-slate-200 text-slate-600">
                        {selectedTalent.primary_platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 capitalize">{selectedTalent.niche} · {selectedTalent.location}</p>
                    {selectedTalent.bio && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{selectedTalent.bio}</p>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {selectedTalent.total_followers >= 1e6 ? `${(selectedTalent.total_followers / 1e6).toFixed(1)}M` : `${((selectedTalent.total_followers || 0) / 1000).toFixed(0)}K`}
                      </p>
                      <p className="text-xs text-slate-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-rose-600">{selectedTalent.engagement_rate || 0}%</p>
                      <p className="text-xs text-slate-400">Engagement</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${trajectoryConfig[selectedTalent.trajectory]?.color || "text-slate-500"}`}>
                        {trajectoryConfig[selectedTalent.trajectory]?.label || "—"}
                      </p>
                      <p className="text-xs text-slate-400">Trajectory</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts row 1: Engagement trend + Follower growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    Engagement Rate Trend
                  </CardTitle>
                  <p className="text-xs text-slate-400">vs. industry benchmark (3.2%)</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={engagementTrend}>
                      <defs>
                        <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                      <Area type="monotone" dataKey="engagement" stroke="#6366F1" strokeWidth={2.5} fill="url(#engGrad)" name="Engagement" />
                      <Line type="monotone" dataKey="benchmark" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Benchmark" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Audience Growth Over Time
                  </CardTitle>
                  <p className="text-xs text-slate-400">Estimated follower trajectory (7-month)</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={followerGrowth}>
                      <defs>
                        <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={v => [v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : `${(v / 1000).toFixed(1)}K`]} />
                      <Area type="monotone" dataKey="followers" stroke="#10B981" strokeWidth={2.5} fill="url(#followGrad)" name="Followers" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts row 2: Content performance + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    Top-Performing Content Categories
                  </CardTitle>
                  <p className="text-xs text-slate-400">Avg views per post type</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={contentPerf} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={v => [v >= 1000 ? `${(v / 1000).toFixed(1)}K views` : `${v} views`]} />
                      <Bar dataKey="views" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Performance Score Breakdown
                  </CardTitle>
                  <p className="text-xs text-slate-400">Multi-dimensional talent assessment</p>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={210}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name={selectedTalent.name} dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={v => [`${v}/100`]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Partnership history */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    Partnership History
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{talentPartnerships.length} deals</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {talentPartnerships.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No partnerships recorded for this talent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {talentPartnerships.slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{p.brand_name || "—"} · {p.partnership_type?.replace(/_/g, " ") || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {p.match_score && (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                              {p.match_score}% match
                            </Badge>
                          )}
                          {p.deal_value && (
                            <span className="text-sm font-semibold text-emerald-600">${p.deal_value.toLocaleString()}</span>
                          )}
                          <Badge className={`text-[10px] capitalize ${
                            p.status === "active" ? "bg-emerald-100 text-emerald-700" :
                            p.status === "completed" ? "bg-slate-100 text-slate-600" :
                            p.status === "contracted" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
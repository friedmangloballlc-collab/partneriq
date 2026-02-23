import React, { useState } from "react";
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
  Mail, DollarSign, Users, Shield, Star, BarChart3, Link2, X
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

function fmt(num) {
  if (!num) return "—";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num);
}

const platformColors = {
  instagram: "bg-gradient-to-r from-pink-500 to-purple-500",
  tiktok: "bg-gradient-to-r from-slate-800 to-slate-600",
  youtube: "bg-gradient-to-r from-red-500 to-red-600",
  twitter: "bg-gradient-to-r from-sky-400 to-sky-600",
  twitch: "bg-gradient-to-r from-purple-600 to-indigo-600",
  linkedin: "bg-gradient-to-r from-blue-600 to-blue-700",
};

const trajectoryConfig = {
  rising_star: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", label: "Rising Star" },
  steady_growth: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50", label: "Steady Growth" },
  plateau: { icon: Minus, color: "text-amber-500", bg: "bg-amber-50", label: "Plateau" },
  declining: { icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-50", label: "Declining" },
  breakout: { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50", label: "Breakout!" },
};

function ScoreBar({ label, value, color = "bg-indigo-500" }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const TABS = ["overview", "fit_scores", "deals", "connect"];

export default function TalentProfileModal({ talent, onClose, onMatch }) {
  const [tab, setTab] = useState("overview");

  const { data: deals = [] } = useQuery({
    queryKey: ["partnerships-for-talent", talent?.id],
    queryFn: () => base44.entities.Partnership.filter({ talent_id: talent.id }),
    enabled: !!talent?.id,
  });

  if (!talent) return null;

  const initials = talent.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  const traj = trajectoryConfig[talent.trajectory] || trajectoryConfig.steady_growth;
  const TrajIcon = traj.icon;
  const platformGrad = platformColors[talent.primary_platform] || "bg-gradient-to-r from-indigo-500 to-purple-500";

  // Radar data for content-brand fit dimensions
  const radarData = [
    { subject: "Engagement", value: Math.min(100, (talent.engagement_rate || 3) * 10) },
    { subject: "Safety", value: talent.brand_safety_score || 80 },
    { subject: "Quality", value: talent.audience_quality_score || 75 },
    { subject: "Growth", value: talent.trajectory === "breakout" ? 95 : talent.trajectory === "rising_star" ? 85 : talent.trajectory === "steady_growth" ? 70 : 50 },
    { subject: "Reach", value: Math.min(100, Math.log10((talent.total_followers || 1000) + 1) * 20) },
    { subject: "Alpha", value: Math.min(100, (talent.discovery_alpha_score || 3) * 12) },
  ];

  // Simulated fit scores for different brand categories
  const fitScores = [
    { category: "Fashion & Lifestyle", score: talent.niche === "fashion" || talent.niche === "lifestyle" ? 92 : 65, color: "bg-pink-500" },
    { category: "Tech & Software", score: talent.niche === "tech" ? 95 : 58, color: "bg-blue-500" },
    { category: "Health & Fitness", score: talent.niche === "fitness" || talent.niche === "health" ? 91 : 62, color: "bg-emerald-500" },
    { category: "Gaming", score: talent.niche === "gaming" ? 94 : 48, color: "bg-purple-500" },
    { category: "Food & Beverage", score: talent.niche === "food" ? 90 : 55, color: "bg-orange-500" },
    { category: "Finance", score: talent.niche === "finance" ? 93 : 50, color: "bg-teal-500" },
  ].sort((a, b) => b.score - a.score);

  const socialLinks = [
    { name: "Instagram", url: talent.instagram_url, platform: "instagram" },
    { name: "TikTok", url: talent.tiktok_url, platform: "tiktok" },
    { name: "YouTube", url: talent.youtube_url, platform: "youtube" },
    { name: "Twitter/X", url: talent.twitter_url, platform: "twitter" },
  ].filter(l => l.url);

  return (
    <Dialog open={!!talent} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header banner */}
        <div className={`${platformGrad} p-6 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-end gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-xl">
              {talent.avatar_url ? <AvatarImage src={talent.avatar_url} /> : null}
              <AvatarFallback className="bg-white/20 text-white font-bold text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold">{talent.name}</h2>
              <p className="text-white/80 text-sm">{talent.niche?.charAt(0).toUpperCase() + talent.niche?.slice(1)} · {talent.location || "Global"}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-0 text-[10px]">{talent.primary_platform}</Badge>
                <Badge className="bg-white/20 text-white border-0 text-[10px]">{talent.tier}</Badge>
                {talent.trajectory && (
                  <Badge className={`${traj.bg} ${traj.color} border-0 text-[10px] flex items-center gap-1`}>
                    <TrajIcon className="w-2.5 h-2.5" />{traj.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right text-white hidden sm:block">
              {talent.rate_per_post && (
                <div>
                  <p className="text-white/60 text-xs">Rate / Post</p>
                  <p className="text-2xl font-bold">${fmt(talent.rate_per_post)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Key metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Followers", value: fmt(talent.total_followers), icon: Users, color: "indigo" },
                  { label: "Engagement", value: talent.engagement_rate ? `${talent.engagement_rate}%` : "—", icon: TrendingUp, color: "emerald" },
                  { label: "Audience Quality", value: talent.audience_quality_score || "—", icon: Shield, color: "violet" },
                  { label: "Brand Safety", value: talent.brand_safety_score || "—", icon: Star, color: "amber" },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Content performance */}
              {(talent.avg_likes || talent.avg_views) && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Content Performance</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {talent.avg_likes && <div className="text-center p-3 bg-pink-50 rounded-lg"><p className="text-[10px] text-pink-400">Avg Likes</p><p className="font-bold text-pink-700 mt-0.5">{fmt(talent.avg_likes)}</p></div>}
                    {talent.avg_comments && <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-[10px] text-blue-400">Avg Comments</p><p className="font-bold text-blue-700 mt-0.5">{fmt(talent.avg_comments)}</p></div>}
                    {talent.avg_views && <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-[10px] text-purple-400">Avg Views</p><p className="font-bold text-purple-700 mt-0.5">{fmt(talent.avg_views)}</p></div>}
                  </div>
                </div>
              )}

              {/* Radar chart */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Talent Profile Radar</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Radar name="Score" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Discovery alpha */}
              {talent.discovery_alpha_score && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-800">Discovery Alpha Score</span>
                    <Badge className="bg-indigo-600 text-white text-[10px]">{talent.discovery_alpha_score.toFixed(1)}x</Badge>
                  </div>
                  <p className="text-xs text-indigo-600/80">Current rates undervalue this creator by {((talent.discovery_alpha_score - 1) * 100).toFixed(0)}% relative to predicted future value.</p>
                </div>
              )}

              {/* Bio & Links */}
              {talent.bio && <p className="text-sm text-slate-600 leading-relaxed">{talent.bio}</p>}
              {socialLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-3 h-3" />{link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FIT SCORES TAB */}
          {tab === "fit_scores" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-500">AI-computed brand-category compatibility scores based on content style, audience demographics, and engagement patterns.</p>
              <div className="space-y-3">
                {fitScores.map((f, i) => (
                  <ScoreBar key={i} label={f.category} value={f.score} color={f.color} />
                ))}
              </div>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fit Dimensions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Humor Compatibility", value: 78 + Math.floor(Math.random() * 15) },
                    { label: "Tone Alignment", value: 82 + Math.floor(Math.random() * 12) },
                    { label: "Visual Style Match", value: 70 + Math.floor(Math.random() * 20) },
                    { label: "Thematic Overlap", value: 65 + Math.floor(Math.random() * 25) },
                    { label: "Audience Overlap", value: 72 + Math.floor(Math.random() * 18) },
                    { label: "Values Alignment", value: 80 + Math.floor(Math.random() * 15) },
                  ].map((d, i) => (
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

          {/* DEALS TAB */}
          {tab === "deals" && (
            <div className="space-y-3">
              {deals.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No deal history yet</p>
                  <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onClose(); onMatch(talent); }}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Create Match
                  </Button>
                </div>
              ) : deals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{deal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name} · {deal.partnership_type?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="text-right">
                    {deal.match_score && <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{deal.match_score}%</Badge>}
                    {deal.deal_value && <p className="text-xs font-bold text-slate-700 mt-1">${fmt(deal.deal_value)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONNECT TAB */}
          {tab === "connect" && <SocialConnectTab talent={talent} />}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
          {talent.email && (
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = `mailto:${talent.email}`}>
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          )}
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onClose(); onMatch(talent); }}>
            <Sparkles className="w-4 h-4 mr-2" /> Find Matches
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Social account connection flow component
const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", color: "from-pink-500 to-purple-500", textColor: "text-pink-600", bg: "bg-pink-50" },
  { id: "tiktok", name: "TikTok", color: "from-slate-700 to-slate-900", textColor: "text-slate-700", bg: "bg-slate-100" },
  { id: "youtube", name: "YouTube", color: "from-red-500 to-red-600", textColor: "text-red-600", bg: "bg-red-50" },
  { id: "twitter", name: "Twitter / X", color: "from-sky-400 to-sky-600", textColor: "text-sky-600", bg: "bg-sky-50" },
  { id: "twitch", name: "Twitch", color: "from-purple-600 to-indigo-700", textColor: "text-purple-600", bg: "bg-purple-50" },
  { id: "linkedin", name: "LinkedIn", color: "from-blue-600 to-blue-700", textColor: "text-blue-600", bg: "bg-blue-50" },
];

function SocialConnectTab({ talent }) {
  const [connecting, setConnecting] = React.useState(null);
  const [connected, setConnected] = React.useState(
    talent.primary_platform ? { [talent.primary_platform]: true } : {}
  );

  const handleConnect = async (platformId) => {
    setConnecting(platformId);
    await new Promise(r => setTimeout(r, 1800)); // simulate OAuth
    setConnected(prev => ({ ...prev, [platformId]: true }));
    setConnecting(null);
  };

  const handleDisconnect = (platformId) => {
    if (platformId === talent.primary_platform) return; // can't disconnect primary
    setConnected(prev => { const n = { ...prev }; delete n[platformId]; return n; });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Connect social accounts to pull live metrics, verify follower counts, and unlock detailed audience analytics.</p>
      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map(p => {
          const isConnected = connected[p.id];
          const isConnecting = connecting === p.id;
          const isPrimary = talent.primary_platform === p.id;
          return (
            <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isConnected ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                  {isPrimary && <Badge className="bg-indigo-100 text-indigo-700 text-[9px]">Primary</Badge>}
                </div>
                {isConnected ? (
                  <p className="text-xs text-emerald-600 mt-0.5">✓ Connected · Metrics synced</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">Not connected</p>
                )}
              </div>
              {isConnected ? (
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Live</Badge>
                  {!isPrimary && (
                    <Button size="sm" variant="ghost" className="text-xs h-7 text-slate-400 hover:text-red-500" onClick={() => handleDisconnect(p.id)}>
                      Disconnect
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  className={`bg-gradient-to-r ${p.color} text-white border-0 text-xs h-8`}
                  onClick={() => handleConnect(p.id)}
                  disabled={!!connecting}
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Connecting...</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Link2 className="w-3 h-3" />Connect</span>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">OAuth connections are read-only. We never post or modify your accounts. Data is synced every 24 hours.</p>
      </div>
    </div>
  );
}
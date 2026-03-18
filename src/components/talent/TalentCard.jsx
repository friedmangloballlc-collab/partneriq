import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Eye, Sparkles, ShieldCheck } from "lucide-react";

const platformColors = {
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  tiktok: "bg-slate-50 text-slate-700 border-slate-200",
  youtube: "bg-red-50 text-red-700 border-red-200",
  twitter: "bg-sky-50 text-sky-700 border-sky-200",
  twitch: "bg-purple-50 text-purple-700 border-purple-200",
  linkedin: "bg-blue-50 text-blue-700 border-blue-200",
};

const tierColors = {
  nano: "bg-slate-100 text-slate-600",
  micro: "bg-blue-100 text-blue-700",
  mid: "bg-indigo-100 text-indigo-700",
  macro: "bg-purple-100 text-purple-700",
  mega: "bg-amber-100 text-amber-700",
  celebrity: "bg-yellow-100 text-yellow-700",
};

const trajectoryIcons = {
  rising_star: { icon: TrendingUp, color: "text-emerald-500" },
  steady_growth: { icon: TrendingUp, color: "text-blue-500" },
  plateau: { icon: Minus, color: "text-amber-500" },
  declining: { icon: TrendingDown, color: "text-rose-500" },
  breakout: { icon: Sparkles, color: "text-purple-500" },
};

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function TalentCard({ talent, onView, onMatch }) {
  const initials = talent.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  const trajectory = trajectoryIcons[talent.trajectory];
  const TrajectoryIcon = trajectory?.icon || Minus;

  return (
    <Card className="border-slate-200/60 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className={`w-12 h-12 shadow-sm flex-shrink-0 ${talent.is_verified ? 'ring-2 ring-indigo-500 ring-offset-2' : 'ring-2 ring-white'}`}>
            {talent.avatar_url ? <AvatarImage src={talent.avatar_url} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{talent.name}</h3>
              {talent.is_verified && (
                <span title={`${talent.verified_platforms_count || 1} platform${(talent.verified_platforms_count || 1) > 1 ? 's' : ''} verified`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </span>
              )}
              {talent.trajectory && (
                <TrajectoryIcon className={`w-3.5 h-3.5 ${trajectory?.color || "text-slate-400"}`} />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{talent.niche?.replace(/_/g, " ")} · {talent.location || "Global"}</p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {talent.primary_platform && (
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${platformColors[talent.primary_platform] || ""}`}>
                  {talent.primary_platform}
                </Badge>
              )}
              {talent.tier && (
                <Badge className={`text-[10px] px-1.5 py-0 ${tierColors[talent.tier] || ""}`}>
                  {talent.tier}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Followers</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{formatNumber(talent.total_followers)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Engagement</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{talent.engagement_rate ? `${talent.engagement_rate}%` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Quality</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{talent.audience_quality_score || "—"}</p>
          </div>
        </div>

        {talent.rate_per_post && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Rate/Post</span>
              <span className="text-sm font-bold text-slate-800">${formatNumber(talent.rate_per_post)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => onView?.(talent)}>
            <Eye className="w-3 h-3 mr-1.5" /> View
          </Button>
          <Button size="sm" className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => onMatch?.(talent)}>
            <Sparkles className="w-3 h-3 mr-1.5" /> Match
          </Button>
        </div>
      </div>
    </Card>
  );
}
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mail, ExternalLink, TrendingUp, Shield, DollarSign } from "lucide-react";

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function TalentDetailPanel({ talent, onClose, onMatch }) {
  const initials = talent.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  const socialLinks = [
    talent.instagram_url && { name: "Instagram", url: talent.instagram_url },
    talent.tiktok_url && { name: "TikTok", url: talent.tiktok_url },
    talent.youtube_url && { name: "YouTube", url: talent.youtube_url },
    talent.twitter_url && { name: "Twitter/X", url: talent.twitter_url },
  ].filter(Boolean);

  return (
    <Sheet open={!!talent} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-0">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
              {talent.avatar_url ? <AvatarImage src={talent.avatar_url} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">{talent.name}</SheetTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {talent.niche?.replace(/_/g, " ")} · {talent.location || "Global"}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {talent.primary_platform && (
                  <Badge variant="outline" className="text-[10px]">{talent.primary_platform}</Badge>
                )}
                {talent.tier && (
                  <Badge className="text-[10px] bg-indigo-100 text-indigo-700">{talent.tier}</Badge>
                )}
                {talent.status && (
                  <Badge className={`text-[10px] ${talent.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {talent.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {talent.bio && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bio</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{talent.bio}</p>
            </div>
          )}

          {/* Key Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Followers", value: formatNumber(talent.total_followers), icon: TrendingUp, color: "indigo" },
                { label: "Engagement Rate", value: talent.engagement_rate ? `${talent.engagement_rate}%` : "—", icon: TrendingUp, color: "emerald" },
                { label: "Audience Quality", value: talent.audience_quality_score || "—", icon: Shield, color: "violet" },
                { label: "Brand Safety", value: talent.brand_safety_score || "—", icon: Shield, color: "sky" },
                { label: "Rate / Post", value: talent.rate_per_post ? `$${formatNumber(talent.rate_per_post)}` : "—", icon: DollarSign, color: "amber" },
                { label: "Discovery Alpha", value: talent.discovery_alpha_score ? talent.discovery_alpha_score.toFixed(1) : "—", icon: Sparkles, color: "purple" },
              ].map((m, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Stats */}
          {(talent.avg_likes || talent.avg_comments || talent.avg_views) && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Content Performance</h4>
              <div className="grid grid-cols-3 gap-3">
                {talent.avg_likes && <div className="text-center bg-slate-50 rounded-lg p-3"><p className="text-[10px] text-slate-400">Avg Likes</p><p className="font-bold text-slate-800 mt-0.5">{formatNumber(talent.avg_likes)}</p></div>}
                {talent.avg_comments && <div className="text-center bg-slate-50 rounded-lg p-3"><p className="text-[10px] text-slate-400">Avg Comments</p><p className="font-bold text-slate-800 mt-0.5">{formatNumber(talent.avg_comments)}</p></div>}
                {talent.avg_views && <div className="text-center bg-slate-50 rounded-lg p-3"><p className="text-[10px] text-slate-400">Avg Views</p><p className="font-bold text-slate-800 mt-0.5">{formatNumber(talent.avg_views)}</p></div>}
              </div>
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Social Profiles</h4>
              <div className="space-y-2">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { if (talent.email) window.location.href = `mailto:${talent.email}`; }}>
              <Mail className="w-4 h-4 mr-2" /> Contact
            </Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => onMatch?.(talent)}>
              <Sparkles className="w-4 h-4 mr-2" /> Find Matches
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
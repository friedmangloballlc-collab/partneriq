import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Users, Zap } from "lucide-react";

const NICHES = ["All", "Tech", "Beauty", "Fitness", "Gaming", "Food", "Fashion", "Travel", "Lifestyle", "Finance"];

const TIER_COLORS = {
  mega: "bg-purple-100 text-purple-800 border-purple-200",
  macro: "bg-blue-100 text-blue-800 border-blue-200",
  mid: "bg-indigo-100 text-indigo-800 border-indigo-200",
  micro: "bg-emerald-100 text-emerald-800 border-emerald-200",
  nano: "bg-slate-100 text-slate-700 border-slate-200",
};

const RANK_STYLES = {
  0: {
    wrapper: "border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md",
    badge: "bg-yellow-400 text-yellow-900",
    icon: <Trophy className="w-4 h-4 text-yellow-600" />,
    label: "Gold",
  },
  1: {
    wrapper: "border-2 border-slate-400 bg-gradient-to-r from-slate-50 to-gray-50 shadow",
    badge: "bg-slate-400 text-slate-900",
    icon: <Medal className="w-4 h-4 text-slate-500" />,
    label: "Silver",
  },
  2: {
    wrapper: "border-2 border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 shadow",
    badge: "bg-amber-600 text-white",
    icon: <Award className="w-4 h-4 text-amber-600" />,
    label: "Bronze",
  },
};

function computeDealScore(talent) {
  const safety = Math.min(parseFloat(talent.brand_safety_score) || 0, 100);
  const engagement = Math.min(parseFloat(talent.engagement_rate) || 0, 100);
  return Math.round(safety * engagement) / 10;
}

function formatFollowers(count) {
  if (!count) return "—";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ScoreBar({ score }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums w-8 text-right">{pct}</span>
    </div>
  );
}

function TalentCard({ talent, rank }) {
  const rankStyle = RANK_STYLES[rank];
  const dealScore = computeDealScore(talent);
  const tierKey = (talent.tier || "micro").toLowerCase();
  const niche = talent.niche || talent.primary_niche || talent.expertise_areas || "—";
  const totalDeals = talent.total_deals ?? talent.completed_deals ?? 0;
  const name = talent.full_name || talent.name || "Unknown Creator";
  const platform = talent.primary_platform || "";

  return (
    <div
      className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
        rankStyle
          ? rankStyle.wrapper
          : "border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 text-center">
        {rankStyle ? (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${rankStyle.badge}`}
          >
            #{rank + 1}
          </div>
        ) : (
          <span className="text-slate-500 text-sm font-semibold">#{rank + 1}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        {talent.avatar_url ? (
          <img src={talent.avatar_url} alt={name} className="rounded-full object-cover w-full h-full" />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
            {getInitials(name)}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Name + niche */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
          {rankStyle && rankStyle.icon}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500 truncate">{niche}</span>
          {platform && (
            <span className="text-xs text-slate-400 capitalize">· {platform}</span>
          )}
        </div>
      </div>

      {/* Tier */}
      <div className="hidden sm:block flex-shrink-0">
        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${TIER_COLORS[tierKey] || TIER_COLORS.micro}`}>
          {tierKey}
        </Badge>
      </div>

      {/* Followers */}
      <div className="hidden md:block flex-shrink-0 text-right w-20">
        <p className="text-xs text-slate-500">Followers</p>
        <p className="text-sm font-semibold text-slate-800">{formatFollowers(talent.follower_count)}</p>
      </div>

      {/* Total Deals */}
      <div className="hidden lg:block flex-shrink-0 text-right w-16">
        <p className="text-xs text-slate-500">Deals</p>
        <p className="text-sm font-semibold text-slate-800">{totalDeals}</p>
      </div>

      {/* Deal Score */}
      <div className="flex-shrink-0 w-28">
        <p className="text-xs text-slate-500 mb-1">Deal Score</p>
        <ScoreBar score={dealScore} />
      </div>
    </div>
  );
}

export default function DealScoreLeaderboard() {
  const [activeNiche, setActiveNiche] = useState("All");
  const [isLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem("sb-auth-token") || !!sessionStorage.getItem("supabase.auth.token");
    } catch {
      return false;
    }
  });

  const { data: talents = [], isLoading, error } = useQuery({
    queryKey: ["leaderboard-talents"],
    queryFn: async () => {
      const results = await base44.entities.Talent.list("-brand_safety_score", 200);
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = React.useMemo(() => {
    let pool = [...talents];

    if (activeNiche !== "All") {
      const nicheLC = activeNiche.toLowerCase();
      pool = pool.filter((t) => {
        const fields = [
          t.niche,
          t.primary_niche,
          t.expertise_areas,
          t.content_categories,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(nicheLC);
      });
    }

    // Sort by computed deal score descending
    pool.sort((a, b) => computeDealScore(b) - computeDealScore(a));

    return pool.slice(0, 50);
  }, [talents, activeNiche]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-900">Deal Score Leaderboard</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Top creators ranked by Deal Score — a composite of brand safety and engagement.
          </p>
        </div>

        {!isLoggedIn && (
          <Link to={createPageUrl("Onboarding")}>
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md">
              <Zap className="w-4 h-4" />
              Join Deal Stage
            </Button>
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-slate-900">{talents.length}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Total Creators
          </div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-indigo-600">{NICHES.length - 1}</div>
          <div className="text-xs text-slate-500 mt-0.5">Niches Tracked</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-emerald-600">
            {filtered.length > 0 ? computeDealScore(filtered[0]) : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" /> Top Score
          </div>
        </Card>
      </div>

      {/* Niche Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter by Niche</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeNiche} onValueChange={setActiveNiche}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1 rounded-lg">
              {NICHES.map((niche) => (
                <TabsTrigger
                  key={niche}
                  value={niche}
                  className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {niche}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {activeNiche === "All" ? "All Niches" : activeNiche} Rankings
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {filtered.length} creators
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">Unable to load leaderboard data. Please try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No creators found for this niche.</p>
              <p className="text-xs mt-1">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="hidden md:flex items-center gap-4 px-4 pb-2 text-xs text-slate-400 font-medium uppercase tracking-wide border-b border-slate-100">
                <div className="w-10">Rank</div>
                <div className="w-10" />
                <div className="flex-1">Creator</div>
                <div className="hidden sm:block w-20">Tier</div>
                <div className="hidden md:block w-20 text-right">Followers</div>
                <div className="hidden lg:block w-16 text-right">Deals</div>
                <div className="w-28 text-right">Deal Score</div>
              </div>

              {filtered.map((talent, index) => (
                <TalentCard key={talent.id} talent={talent} rank={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA for non-logged-in users */}
      {!isLoggedIn && (
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-0 text-white overflow-hidden">
          <CardContent className="py-8 text-center space-y-4 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
            <Zap className="w-10 h-10 mx-auto opacity-80" />
            <div>
              <h2 className="text-xl font-bold">Ready to climb the leaderboard?</h2>
              <p className="text-indigo-200 text-sm mt-1">
                Join Deal Stage to access brand deals, track your Deal Score, and connect with top brands.
              </p>
            </div>
            <Link to={createPageUrl("Onboarding")}>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg">
                Join Deal Stage — It's Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

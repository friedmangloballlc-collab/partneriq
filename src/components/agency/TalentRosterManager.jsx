import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Search, Bell, Star, TrendingUp, Lock, UserCheck,
  UserX, Tag, Filter, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ── constants ─────────────────────────────────────────────────────────────────

const ROSTER_TAGS = ["Signed", "Freelance", "Preferred", "Blacklisted"];

const TAG_STYLES = {
  Signed:      { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: UserCheck },
  Freelance:   { badge: "bg-blue-100 text-blue-700 border-blue-200",          icon: Users },
  Preferred:   { badge: "bg-violet-100 text-violet-700 border-violet-200",    icon: Star },
  Blacklisted: { badge: "bg-rose-100 text-rose-700 border-rose-200",          icon: UserX },
};

const TIER_THRESHOLDS = {
  Nano:       [1_000,   10_000],
  Micro:      [10_000,  100_000],
  Mid:        [100_000, 500_000],
  Macro:      [500_000, 1_000_000],
  Mega:       [1_000_000, Infinity],
};

function getTier(followers) {
  for (const [tier, [min, max]] of Object.entries(TIER_THRESHOLDS)) {
    if (followers >= min && followers < max) return tier;
  }
  return "Unknown";
}

function fmtFollowers(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function fmtMoney(n) {
  if (!n) return "—";
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

const MILESTONE_THRESHOLDS = [10_000, 50_000, 100_000, 500_000, 1_000_000, 5_000_000];

function checkMilestone(talent) {
  const f = talent.follower_count || 0;
  const prev = talent.previous_follower_count || 0;
  for (const t of MILESTONE_THRESHOLDS) {
    if (prev < t && f >= t) return t;
  }
  return null;
}

// ── TalentCard ────────────────────────────────────────────────────────────────

function TalentCard({ talent, onCycleTag, cyclingId }) {
  const currentTag = talent.agency_tag || "Freelance";
  const nextTag    = ROSTER_TAGS[(ROSTER_TAGS.indexOf(currentTag) + 1) % ROSTER_TAGS.length];
  const style      = TAG_STYLES[currentTag] || TAG_STYLES.Freelance;
  const TagIcon    = style.icon;
  const tier       = getTier(talent.follower_count || 0);
  const milestone  = checkMilestone(talent);
  const isCycling  = cyclingId === talent.id;

  const hasExclusivity = talent.exclusivity_end_date && new Date(talent.exclusivity_end_date) > new Date();
  const exclusivityDaysLeft = hasExclusivity
    ? Math.ceil((new Date(talent.exclusivity_end_date) - new Date()) / 86_400_000)
    : null;

  return (
    <Card className="border-slate-200/60 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      {/* Milestone alert banner */}
      {milestone && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700">
            {talent.name} just hit {fmtFollowers(milestone)} followers!
          </span>
        </div>
      )}

      {/* Exclusivity stripe */}
      {hasExclusivity && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-1.5 flex items-center gap-2">
          <Lock className="w-3 h-3 text-rose-500 flex-shrink-0" />
          <span className="text-xs text-rose-600 font-medium">
            Exclusivity active — {exclusivityDaysLeft}d remaining ({talent.exclusivity_niche || "all niches"})
          </span>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {(talent.name || "?").slice(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm truncate">{talent.name || "Unknown"}</h3>
              <Badge className={`text-xs border ${style.badge}`}>
                <TagIcon className="w-3 h-3 mr-1" />
                {currentTag}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">{talent.niche || "—"}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-indigo-600">{tier}</span>
              {talent.primary_platform && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{talent.primary_platform}</span>
                </>
              )}
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Followers</p>
                <p className="text-xs font-bold text-slate-700">{fmtFollowers(talent.follower_count)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Eng. Rate</p>
                <p className="text-xs font-bold text-emerald-600">
                  {talent.engagement_rate ? `${talent.engagement_rate}%` : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Deals</p>
                <p className="text-xs font-bold text-slate-700">{talent.deal_count || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Rate/Post</p>
                <p className="text-xs font-bold text-teal-600">{fmtMoney(talent.rate_per_post)}</p>
              </div>
            </div>
          </div>

          {/* Tag cycle button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-slate-700 shrink-0 h-7 px-2"
            onClick={() => onCycleTag(talent, nextTag)}
            disabled={isCycling}
          >
            {isCycling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
            <span className="ml-1 hidden sm:inline">→ {nextTag}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TalentRosterManager() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch]     = useState("");
  const [filterTag, setFilterTag]     = useState("all");
  const [filterNiche, setFilterNiche] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [cyclingId, setCyclingId] = useState(null);

  // ── fetch talents ──────────────────────────────────────────────────────────
  const { data: talents = [], isLoading } = useQuery({
    queryKey: ["agency-roster-talents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talents")
        .select("*")
        .order("follower_count", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // ── fetch active partnerships (for exclusivity) ────────────────────────────
  const { data: partnerships = [] } = useQuery({
    queryKey: ["agency-roster-partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("id, talent_id, brand_id, exclusivity, exclusivity_end_date, niche, status")
        .eq("status", "active")
        .not("exclusivity", "is", null);
      if (error) throw error;
      return data || [];
    },
  });

  // ── cycle tag mutation ────────────────────────────────────────────────────
  const cycleTag = useMutation({
    mutationFn: async ({ id, newTag }) => {
      const { data, error } = await supabase
        .from("talents")
        .update({ agency_tag: newTag })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { newTag }) => {
      qc.invalidateQueries({ queryKey: ["agency-roster-talents"] });
      toast({ title: "Tag updated", description: `Roster tag changed to ${newTag}` });
      setCyclingId(null);
    },
    onError: () => setCyclingId(null),
  });

  const handleCycleTag = (talent, nextTag) => {
    setCyclingId(talent.id);
    cycleTag.mutate({ id: talent.id, newTag: nextTag });
  };

  // ── enrich talents with exclusivity info ──────────────────────────────────
  const enrichedTalents = useMemo(() => {
    const exclusivityByTalent = {};
    partnerships.forEach((p) => {
      if (p.talent_id && p.exclusivity_end_date) {
        exclusivityByTalent[p.talent_id] = {
          exclusivity_end_date: p.exclusivity_end_date,
          exclusivity_niche: p.niche,
        };
      }
    });
    return talents.map((t) => ({
      ...t,
      ...(exclusivityByTalent[t.id] || {}),
    }));
  }, [talents, partnerships]);

  // ── filter & search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return enrichedTalents.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.niche || "").toLowerCase().includes(q);
      const matchTag =
        filterTag === "all" || (t.agency_tag || "Freelance") === filterTag;
      const matchNiche =
        filterNiche === "all" || (t.niche || "") === filterNiche;
      const matchPlatform =
        filterPlatform === "all" || (t.primary_platform || "") === filterPlatform;
      return matchSearch && matchTag && matchNiche && matchPlatform;
    });
  }, [enrichedTalents, search, filterTag, filterNiche, filterPlatform]);

  const niches = useMemo(
    () => [...new Set(talents.map((t) => t.niche).filter(Boolean))].sort(),
    [talents]
  );
  const platforms = useMemo(
    () => [...new Set(talents.map((t) => t.primary_platform).filter(Boolean))].sort(),
    [talents]
  );

  // ── milestone alerts ───────────────────────────────────────────────────────
  const milestoneAlerts = useMemo(
    () => enrichedTalents.filter((t) => checkMilestone(t)),
    [enrichedTalents]
  );

  // ── tag distribution ───────────────────────────────────────────────────────
  const tagCounts = useMemo(() => {
    const counts = { Signed: 0, Freelance: 0, Preferred: 0, Blacklisted: 0 };
    enrichedTalents.forEach((t) => {
      const tag = t.agency_tag || "Freelance";
      if (counts[tag] !== undefined) counts[tag]++;
    });
    return counts;
  }, [enrichedTalents]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Talent Roster
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {enrichedTalents.length} talent profiles · click the tag button to cycle roster status
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {ROSTER_TAGS.map((tag) => {
            const s = TAG_STYLES[tag];
            return (
              <Badge key={tag} className={`text-xs border ${s.badge}`}>
                {tag}: {tagCounts[tag]}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Milestone alerts */}
      {milestoneAlerts.length > 0 && (
        <div className="space-y-2">
          {milestoneAlerts.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                {t.name} just hit {fmtFollowers(checkMilestone(t))} followers — consider renegotiating their rate!
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 h-9 text-sm"
            placeholder="Search by name or niche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
        </div>

        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {ROSTER_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterNiche} onValueChange={setFilterNiche}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        {(search || filterTag !== "all" || filterNiche !== "all" || filterPlatform !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-slate-400 hover:text-slate-700"
            onClick={() => { setSearch(""); setFilterTag("all"); setFilterNiche("all"); setFilterPlatform("all"); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin text-teal-400" />
          <p className="text-sm text-slate-400">Loading roster...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
          {enrichedTalents.length === 0
            ? "No talent found in the database. Add talent profiles to build your roster."
            : "No talent matches the current filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onCycleTag={handleCycleTag}
              cyclingId={cyclingId}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {enrichedTalents.length} talent profiles
        </p>
      )}
    </div>
  );
}

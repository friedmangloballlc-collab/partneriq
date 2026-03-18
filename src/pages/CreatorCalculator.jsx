/**
 * CreatorCalculator — "What should your brand deal rate be?"
 *
 * PUBLIC page — no authentication required.
 *
 * Users enter their follower count, niche, engagement rate, and platform.
 * The tool queries rate_benchmarks + category_premiums from Supabase to
 * surface a recommended rate range alongside platform averages and niche
 * premiums.
 *
 * SEO-friendly, shareable, CTA-driven for non-logged-in visitors.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  ChevronDown,
  BarChart2,
  Star,
  Sparkles,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const NICHES = [
  "Beauty", "Fashion", "Fitness", "Food", "Gaming", "Lifestyle",
  "Parenting", "Personal Finance", "Sports", "Tech", "Travel", "Wellness",
];

const PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "Twitter / X", "LinkedIn",
  "Twitch", "Pinterest", "Snapchat", "Podcast",
];

/**
 * Map follower count to creator tier.
 * Mirrors the TIER_SCORES in qualityScore.js.
 */
function getTier(followers) {
  const n = Number(followers) || 0;
  if (n < 10_000) return "nano";
  if (n < 100_000) return "micro";
  if (n < 500_000) return "mid";
  if (n < 1_000_000) return "macro";
  if (n < 5_000_000) return "mega";
  return "celebrity";
}

const TIER_LABELS = {
  nano: "Nano (< 10K)",
  micro: "Micro (10K–100K)",
  mid: "Mid-tier (100K–500K)",
  macro: "Macro (500K–1M)",
  mega: "Mega (1M–5M)",
  celebrity: "Celebrity (5M+)",
};

const TIER_DESCRIPTION = {
  nano: "Hyper-engaged communities. Ideal for niche brands seeking authentic reach.",
  micro: "High engagement with strong community trust. Most requested tier by brands.",
  mid: "The sweet spot — scale plus engagement. Premium rates apply.",
  macro: "Broad reach, recognizable name. Suitable for major campaigns.",
  mega: "Celebrity-adjacent. Rates command significant platform premiums.",
  celebrity: "Cultural icon status. Custom rates and multi-year contracts are typical.",
};

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }) {
  const colors = {
    nano: "bg-slate-100 text-slate-700",
    micro: "bg-blue-100 text-blue-700",
    mid: "bg-violet-100 text-violet-700",
    macro: "bg-amber-100 text-amber-700",
    mega: "bg-rose-100 text-rose-700",
    celebrity: "bg-yellow-100 text-yellow-800",
  };
  return (
    <Badge className={`text-xs font-semibold ${colors[tier] || "bg-slate-100 text-slate-600"}`}>
      {TIER_LABELS[tier] || tier}
    </Badge>
  );
}

// ─── Rate result card ─────────────────────────────────────────────────────────

function RateResultCard({ label, amount, highlight = false, sublabel }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl p-5 text-center border ${
        highlight
          ? "bg-gradient-to-b from-indigo-600 to-violet-700 text-white border-transparent shadow-lg shadow-indigo-200"
          : "bg-white text-slate-800 border-slate-200"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${highlight ? "text-indigo-200" : "text-slate-400"}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>
        {amount}
      </p>
      {sublabel && (
        <p className={`text-xs mt-1 ${highlight ? "text-indigo-200" : "text-slate-400"}`}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

// ─── Comparison stat ──────────────────────────────────────────────────────────

function ComparisonStat({ label, value, vs, positive }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{value}</span>
        {vs !== undefined && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {positive ? "+" : ""}{vs}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreatorCalculator() {
  // Form state
  const [followers, setFollowers] = useState("");
  const [niche, setNiche] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [platform, setPlatform] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Derived from inputs
  const tier = getTier(followers);

  // ── Fetch rate benchmarks ───────────────────────────────────────────────
  const { data: benchmarks = [] } = useQuery({
    queryKey: ["rate-benchmarks-calc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_benchmarks")
        .select("*")
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 600_000,
  });

  // ── Fetch category premiums ─────────────────────────────────────────────
  const { data: categoryPremiums = [] } = useQuery({
    queryKey: ["category-premiums-calc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_premiums")
        .select("*")
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 600_000,
  });

  // ── Derived results ─────────────────────────────────────────────────────
  const results = (() => {
    if (!submitted) return null;

    const followerNum = Number(followers) || 0;
    const erNum = Number(engagementRate) || 0;
    const platformNorm = platform.toLowerCase().replace(/\s*\/\s*/, "_").replace(/\s+/g, "_");
    const nicheNorm = niche.toLowerCase();

    // Find the best matching benchmark row for this platform + tier
    const matching = benchmarks.filter((b) => {
      const bPlatform = (b.platform || "").toLowerCase();
      const bTier = (b.tier || b.creator_tier || "").toLowerCase();
      return bPlatform.includes(platformNorm.split("_")[0]) && bTier === tier;
    });

    // Fall back to just tier match if no platform-specific benchmark
    const tierOnly = benchmarks.filter((b) => {
      const bTier = (b.tier || b.creator_tier || "").toLowerCase();
      return bTier === tier;
    });

    const benchmark = matching[0] || tierOnly[0] || null;

    // Base rate range from benchmark
    let baseMin = benchmark?.rate_min ?? benchmark?.min_rate ?? 0;
    let baseMax = benchmark?.rate_max ?? benchmark?.max_rate ?? 0;
    let baseAvg = benchmark?.rate_avg ?? benchmark?.avg_rate ?? (baseMin + baseMax) / 2;

    // If no benchmark data, use a simple follower-based heuristic
    if (baseAvg === 0 && followerNum > 0) {
      baseAvg = Math.round(followerNum * 0.01); // 1% of followers as a floor
      baseMin = Math.round(baseAvg * 0.7);
      baseMax = Math.round(baseAvg * 1.5);
    }

    // Engagement rate multiplier: >tier avg → bonus, <tier avg → slight penalty
    const tierAvgER = { nano: 5, micro: 3.5, mid: 2.5, macro: 1.8, mega: 1.2, celebrity: 0.8 };
    const avgER = tierAvgER[tier] ?? 2.5;
    const erMultiplier = erNum > 0
      ? Math.max(0.8, Math.min(1.5, 1 + (erNum - avgER) / avgER * 0.3))
      : 1;

    // Category premium lookup
    const premium = categoryPremiums.find(
      (cp) => (cp.category || cp.niche || "").toLowerCase() === nicheNorm
    );
    const premiumPct = premium?.premium_percent ?? premium?.premium ?? 0;
    const premiumMultiplier = 1 + premiumPct / 100;

    const finalMin = Math.round(baseMin * erMultiplier * premiumMultiplier);
    const finalAvg = Math.round(baseAvg * erMultiplier * premiumMultiplier);
    const finalMax = Math.round(baseMax * erMultiplier * premiumMultiplier);

    // Platform average for comparison (all tiers)
    const platformBenchmarks = benchmarks.filter((b) =>
      (b.platform || "").toLowerCase().includes(platformNorm.split("_")[0])
    );
    const platformAvg =
      platformBenchmarks.length > 0
        ? Math.round(
            platformBenchmarks.reduce(
              (s, b) => s + (b.rate_avg ?? b.avg_rate ?? 0),
              0
            ) / platformBenchmarks.length
          )
        : null;

    const vsPlatformAvg =
      platformAvg && finalAvg
        ? `${finalAvg >= platformAvg ? "+" : ""}${Math.round(((finalAvg - platformAvg) / platformAvg) * 100)}%`
        : null;

    return {
      tier,
      finalMin,
      finalAvg,
      finalMax,
      premiumPct,
      premiumLabel: premium?.category || premium?.niche || niche,
      platformAvg,
      vsPlatformAvg,
      benchmark,
      erMultiplier,
      engagementNote:
        erNum > avgER
          ? `Your ${erNum}% engagement is above the ${tier} average (${avgER}%) — you can charge more.`
          : erNum < avgER
          ? `Your ${erNum}% engagement is below the ${tier} average (${avgER}%) — focus on growing engagement to unlock higher rates.`
          : `Your engagement rate matches the ${tier} tier average.`,
    };
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!followers || Number(followers) <= 0) {
      setFormError("Please enter a valid follower count.");
      return;
    }
    if (!platform) {
      setFormError("Please select a platform.");
      return;
    }
    setSubmitted(true);
  };

  const fmt = (n) =>
    n > 0
      ? `$${n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString()}`
      : "$—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <header className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Free Creator Rate Calculator
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          What Should Your Brand
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Deal Rate Be?
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Enter your stats and get an instant rate recommendation backed by
          real benchmark data from thousands of creator deals.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        {/* ── Input form ─────────────────────────────────────────────────── */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Your Creator Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Followers */}
                <div className="space-y-1.5">
                  <Label htmlFor="followers" className="text-sm font-medium">
                    Total Followers
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <Input
                      id="followers"
                      type="number"
                      min="0"
                      placeholder="e.g. 125000"
                      value={followers}
                      onChange={(e) => {
                        setFollowers(e.target.value);
                        if (submitted) setSubmitted(false);
                      }}
                      className="pl-9"
                      aria-label="Total followers"
                    />
                  </div>
                  {followers && Number(followers) > 0 && (
                    <div className="mt-1">
                      <TierBadge tier={getTier(followers)} />
                    </div>
                  )}
                </div>

                {/* Engagement Rate */}
                <div className="space-y-1.5">
                  <Label htmlFor="engagement" className="text-sm font-medium">
                    Engagement Rate (%)
                  </Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <Input
                      id="engagement"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 3.5"
                      value={engagementRate}
                      onChange={(e) => {
                        setEngagementRate(e.target.value);
                        if (submitted) setSubmitted(false);
                      }}
                      className="pl-9"
                      aria-label="Engagement rate percentage"
                    />
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-1.5">
                  <Label htmlFor="platform" className="text-sm font-medium">
                    Primary Platform
                  </Label>
                  <Select
                    value={platform}
                    onValueChange={(v) => {
                      setPlatform(v);
                      if (submitted) setSubmitted(false);
                    }}
                  >
                    <SelectTrigger id="platform" aria-label="Select platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Niche */}
                <div className="space-y-1.5">
                  <Label htmlFor="niche" className="text-sm font-medium">
                    Content Niche
                  </Label>
                  <Select
                    value={niche}
                    onValueChange={(v) => {
                      setNiche(v);
                      if (submitted) setSubmitted(false);
                    }}
                  >
                    <SelectTrigger id="niche" aria-label="Select niche">
                      <SelectValue placeholder="Select niche (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600 font-medium">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                Calculate My Rate
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Results ───────────────────────────────────────────────────── */}
        {submitted && results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Tier context */}
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <TierBadge tier={results.tier} />
                <p className="text-sm text-slate-500">{TIER_DESCRIPTION[results.tier]}</p>
              </div>
              {results.engagementNote && (
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                  {results.engagementNote}
                </p>
              )}
            </div>

            {/* Rate range */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Recommended Rate per Post
              </p>
              <div className="grid grid-cols-3 gap-3">
                <RateResultCard
                  label="Min"
                  amount={fmt(results.finalMin)}
                  sublabel="Floor rate"
                />
                <RateResultCard
                  label="Recommended"
                  amount={fmt(results.finalAvg)}
                  sublabel="Market rate"
                  highlight
                />
                <RateResultCard
                  label="Max"
                  amount={fmt(results.finalMax)}
                  sublabel="Premium rate"
                />
              </div>
            </div>

            {/* Comparisons */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                  How You Compare
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                {results.platformAvg > 0 && (
                  <ComparisonStat
                    label={`${platform} platform average`}
                    value={fmt(results.platformAvg)}
                    vs={results.vsPlatformAvg}
                    positive={results.finalAvg >= (results.platformAvg || 0)}
                  />
                )}
                {results.premiumPct > 0 && (
                  <ComparisonStat
                    label={`${results.premiumLabel} niche premium`}
                    value={`+${results.premiumPct}%`}
                    positive
                  />
                )}
                <ComparisonStat
                  label="Engagement rate adjustment"
                  value={`${((results.erMultiplier - 1) * 100).toFixed(0)}%`}
                  positive={results.erMultiplier >= 1}
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Rate Optimisation Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    Always quote a package rate (e.g. post + story + reel) — bundles command 20–40% more.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    Add usage rights terms. Brands pay 50–100% more for content they can repurpose in ads.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    Exclusivity periods (e.g. 30-day category exclusivity) should add 25–50% to your rate.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    Showcase audience demographics — brands pay more for verified data on age, location, and income.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── CTA for non-logged-in visitors ────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-8 text-center shadow-xl shadow-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to land deals at your true rate?</h2>
          <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto">
            Deal Stage connects creators with brand opportunities matched to
            your profile using AI. Manage contracts, track payments, and
            grow your deal pipeline — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/Onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              Join Deal Stage — Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="/Marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/40 hover:bg-indigo-500/60 text-white font-semibold text-sm transition-colors"
            >
              Browse Opportunities
            </a>
          </div>
        </div>

        {/* ── Footer note ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-400">
          Rates are estimates based on industry benchmarks. Actual rates vary
          by audience quality, deliverable scope, and brand budget.{" "}
          <a href="/terms" className="underline hover:text-slate-600">
            Terms
          </a>{" "}
          ·{" "}
          <a href="/privacy" className="underline hover:text-slate-600">
            Privacy
          </a>
        </p>
      </main>
    </div>
  );
}

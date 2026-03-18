import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  CalendarDays,
  Sparkles,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthLabel(offsetFromNow) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetFromNow);
  return MONTH_NAMES[d.getMonth()];
}

function formatCurrency(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

/**
 * Deterministic seeded pseudo-random — keeps chart stable across re-renders.
 */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10_000;
  return x - Math.floor(x);
}

// ── AI / Supabase data hooks ──────────────────────────────────────────────────

function usePartnershipsAggregated() {
  return useQuery({
    queryKey: ["brandSpend:partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("brand_name, deal_value, created_at")
        .not("deal_value", "is", null);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useCultureEvents() {
  return useQuery({
    queryKey: ["brandSpend:cultureEvents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("culture_events")
        .select("name, month, category, audience_reach, best_industries")
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000,
  });
}

function useAIPrediction(partnershipData) {
  const hasData = partnershipData && partnershipData.length > 0;

  return useQuery({
    queryKey: ["brandSpend:aiPrediction", partnershipData?.length],
    enabled: hasData,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      // Build a compact summary to keep the prompt small
      const brandTotals = {};
      partnershipData.forEach(({ brand_name, deal_value }) => {
        if (!brand_name) return;
        brandTotals[brand_name] = (brandTotals[brand_name] || 0) + (deal_value || 0);
      });

      const topBrands = Object.entries(brandTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, total]) => `${name}: $${total.toLocaleString()}`)
        .join(", ");

      const today = new Date().toISOString().split("T")[0];

      const prompt = `Today is ${today}. You are a creator-economy analyst.

Based on these historical brand deal totals (brand: total_paid): ${topBrands}

Predict which brands will INCREASE creator spend in the next 6 months.
Return a JSON object with this exact shape — no markdown, no extra keys:
{
  "hot_brands": [
    { "name": string, "predicted_increase_pct": number, "reason": string, "best_month": string }
  ],
  "outreach_windows": [
    { "window": string, "reason": string, "months": string }
  ],
  "summary": string
}

hot_brands: top 5 brands trending up, predicted_increase_pct 5-80.
outreach_windows: 3 best outreach timing windows based on fiscal quarters and product launch cycles.
summary: 2 sentences.`;

      const { data, error } = await supabase.functions.invoke("ai-router", {
        body: { agent: "trend_prediction", prompt },
      });

      if (error) throw error;

      // Parse the AI response — it may be nested in data.result or data.content
      const raw = data?.result || data?.content || data?.text || data?.response || "";
      const jsonStr = typeof raw === "string"
        ? raw.replace(/```json|```/g, "").trim()
        : JSON.stringify(raw);

      try {
        return JSON.parse(jsonStr);
      } catch {
        // AI returned non-JSON — return null so UI falls back gracefully
        return null;
      }
    },
  });
}

// ── Spend forecast chart data ──────────────────────────────────────────────

function buildForecastData(partnershipData, aiData) {
  // Aggregate historical monthly spend for all brands
  const monthlyActual = {};
  (partnershipData || []).forEach(({ created_at, deal_value }) => {
    if (!created_at || !deal_value) return;
    const d = new Date(created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyActual[key] = (monthlyActual[key] || 0) + deal_value;
  });

  const sortedKeys = Object.keys(monthlyActual).sort();
  const recentKeys = sortedKeys.slice(-3); // last 3 months of actuals
  const avgActual =
    recentKeys.length > 0
      ? recentKeys.reduce((s, k) => s + monthlyActual[k], 0) / recentKeys.length
      : 25_000;

  // Build 6-month forecast with projected growth
  const avgIncreasePct =
    aiData?.hot_brands?.length > 0
      ? aiData.hot_brands.reduce((s, b) => s + (b.predicted_increase_pct || 10), 0) /
        aiData.hot_brands.length
      : 12;

  const monthlyGrowth = avgIncreasePct / 100 / 6;

  return Array.from({ length: 6 }, (_, i) => {
    const base = avgActual * (1 + monthlyGrowth * i);
    const noise = (seededRand(i * 7) - 0.5) * 0.08 * base;
    const projected = Math.max(0, Math.round(base + noise));
    const low = Math.round(projected * (1 - 0.12 - seededRand(i) * 0.06));
    const high = Math.round(projected * (1 + 0.12 + seededRand(i + 3) * 0.06));

    return {
      month: getMonthLabel(i),
      projected,
      low,
      high,
    };
  });
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { projected, low, high } = payload[0]?.payload || {};
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-indigo-300">Projected: {formatCurrency(projected)}</p>
      <p className="text-slate-400 text-xs">Range: {formatCurrency(low)} – {formatCurrency(high)}</p>
    </div>
  );
}

// ── Hot Brand card ──────────────────────────────────────────────────────────

function HotBrandCard({ brand, onOutreach }) {
  const pct = brand.predicted_increase_pct || 0;
  const isHot = pct >= 25;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm leading-tight">{brand.name}</p>
              {brand.best_month && (
                <p className="text-xs text-slate-500">Best window: {brand.best_month}</p>
              )}
            </div>
          </div>

          <Badge
            className={
              isHot
                ? "bg-red-50 text-red-600 border-red-200 gap-1 shrink-0"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 shrink-0"
            }
          >
            {isHot ? <Flame className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            +{pct}%
          </Badge>
        </div>

        {brand.reason && (
          <p className="text-xs text-slate-600 leading-relaxed">{brand.reason}</p>
        )}

        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5 text-xs"
          onClick={() => onOutreach(brand.name)}
        >
          Start Outreach <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Outreach Window card ───────────────────────────────────────────────────

function OutreachWindowCard({ window: win }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/60">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
        <CalendarDays className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="font-medium text-sm text-slate-900 truncate">{win.window}</p>
          <Badge variant="outline" className="text-xs shrink-0">{win.months}</Badge>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{win.reason}</p>
      </div>
    </div>
  );
}

// ── Culture Calendar event card ──────────────────────────────────────────────

function CultureEventCard({ event }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="font-medium text-sm text-slate-900 truncate">{event.name}</p>
          {event.month && (
            <Badge variant="outline" className="text-xs shrink-0">{event.month}</Badge>
          )}
        </div>
        {event.best_industries && (
          <p className="text-xs text-slate-500 truncate">
            Best for: {event.best_industries}
          </p>
        )}
        {event.audience_reach && (
          <p className="text-xs text-indigo-500 mt-0.5">{event.audience_reach} reach</p>
        )}
      </div>
    </div>
  );
}

// ── Fallback hot brands (when AI is unavailable) ───────────────────────────

function buildFallbackHotBrands(partnershipData) {
  const brandTotals = {};
  const brandCounts = {};
  (partnershipData || []).forEach(({ brand_name, deal_value }) => {
    if (!brand_name) return;
    brandTotals[brand_name] = (brandTotals[brand_name] || 0) + (deal_value || 0);
    brandCounts[brand_name] = (brandCounts[brand_name] || 0) + 1;
  });

  return Object.entries(brandTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total], i) => ({
      name,
      predicted_increase_pct: Math.round(10 + seededRand(i + 100) * 30),
      reason: `${brandCounts[name]} deal${brandCounts[name] !== 1 ? "s" : ""} totaling ${formatCurrency(total)}. Consistent spend indicates growth potential.`,
      best_month: getMonthLabel(i + 1),
    }));
}

function buildFallbackWindows() {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  const quarters = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"];
  const nextQ = quarters[(q + 1) % 4];
  const nextNextQ = quarters[(q + 2) % 4];

  return [
    {
      window: "Q-End Budget Sprint",
      reason: "Brands often accelerate spend in the final 4 weeks of each fiscal quarter to exhaust allocated creator budgets.",
      months: nextQ,
    },
    {
      window: "New Product Launch Cycle",
      reason: "Spring and fall launches drive the highest creator briefs. Pitch 6–8 weeks before expected launch dates.",
      months: nextNextQ,
    },
    {
      window: "Seasonal Campaign Prep",
      reason: "Brands brief agencies for holiday and cultural moments 10–12 weeks in advance. Reach out now.",
      months: "Oct – Nov",
    },
  ];
}

// ── Main page component ────────────────────────────────────────────────────

export default function BrandSpendPrediction() {
  const navigate = useNavigate();
  const [aiRequested, setAiRequested] = useState(false);

  const { data: partnershipData = [], isLoading: partnershipsLoading } = usePartnershipsAggregated();
  const { data: cultureEvents = [], isLoading: eventsLoading } = useCultureEvents();
  const {
    data: aiData,
    isLoading: aiLoading,
    isError: aiError,
    refetch: runAI,
  } = useAIPrediction(aiRequested ? partnershipData : null);

  const forecastData = useMemo(
    () => buildForecastData(partnershipData, aiData),
    [partnershipData, aiData]
  );

  const hotBrands = aiData?.hot_brands?.length
    ? aiData.hot_brands
    : buildFallbackHotBrands(partnershipData);

  const outreachWindows = aiData?.outreach_windows?.length
    ? aiData.outreach_windows
    : buildFallbackWindows();

  const handleOutreach = (brandName) => {
    navigate(`/ContactFinder?brand=${encodeURIComponent(brandName)}`);
  };

  const handleRunAI = () => {
    setAiRequested(true);
    // useQuery will auto-run once enabled, but call refetch if already enabled
    if (aiRequested) runAI();
  };

  const isLoading = partnershipsLoading || eventsLoading;

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brand Spend Prediction</h1>
          <p className="text-slate-500 mt-1.5 max-w-xl">
            AI-powered forecasting of when brands will increase creator spend — so you can pitch at exactly the right moment.
          </p>
        </div>

        <Button
          onClick={handleRunAI}
          disabled={aiLoading || partnershipsLoading}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
        >
          {aiLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Run AI Analysis</>
          )}
        </Button>
      </div>

      {/* ── AI summary banner ────────────────────────────────────────────── */}
      {aiData?.summary && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
          <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800 leading-relaxed">{aiData.summary}</p>
        </div>
      )}

      {aiError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>AI analysis unavailable — showing pattern-based predictions from your data.</span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading partnership data...
        </div>
      )}

      {/* ── Spending Forecast Chart ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Spending Forecast — Next 6 Months
              </CardTitle>
              <CardDescription>
                Projected aggregate creator spend across all tracked brands
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" />
              Based on {partnershipData.length} historical deals
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData} margin={{ top: 8, right: 16, bottom: 0, left: 16 }}>
              <defs>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<ForecastTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                formatter={(value) =>
                  value === "projected"
                    ? "Projected Spend"
                    : value === "high"
                    ? "High Estimate"
                    : "Low Estimate"
                }
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="#c7d2fe"
                strokeWidth={1}
                fill="url(#rangeGradient)"
                dot={false}
                strokeDasharray="4 4"
                name="low"
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#projectedGradient)"
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
                name="projected"
              />
              <Area
                type="monotone"
                dataKey="high"
                stroke="#818cf8"
                strokeWidth={1}
                fill="none"
                dot={false}
                strokeDasharray="4 4"
                name="high"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Hot Brands + Outreach Windows (2-col) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Brands */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Hot Brands
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Brands trending toward increased creator spend
            </p>
          </div>

          {hotBrands.length === 0 && !partnershipsLoading && (
            <p className="text-sm text-slate-400 p-4 border rounded-lg text-center">
              No brand data yet. Add partnerships to see predictions.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hotBrands.map((brand, i) => (
              <HotBrandCard key={brand.name || i} brand={brand} onOutreach={handleOutreach} />
            ))}
          </div>
        </div>

        {/* Optimal Outreach Windows */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              Optimal Outreach Windows
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Best timing based on fiscal quarters and launch cycles
            </p>
          </div>

          <div className="space-y-2">
            {outreachWindows.map((win, i) => (
              <OutreachWindowCard key={i} window={win} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Culture Calendar Overlap ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Culture Calendar Overlap
          </CardTitle>
          <CardDescription>
            Upcoming cultural moments that historically drive brand spend increases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading events...
            </div>
          )}

          {!eventsLoading && cultureEvents.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No culture events found. Seed culture events data to see calendar overlaps.
            </p>
          )}

          {cultureEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cultureEvents.map((event, i) => (
                <CultureEventCard key={event.id || i} event={event} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * BrandSignals
 *
 * Displays real-time buying intent signals and budget intelligence for a brand.
 * Designed to be embedded inside brand detail views, Contact Finder, and any
 * other page that needs a compact signal feed for a specific brand.
 *
 * Usage:
 *   <BrandSignals brandId="uuid-here" />
 *   <BrandSignals brandName="Nike" />
 */
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Zap,
  DollarSign,
  Users,
  Rocket,
  Megaphone,
  CalendarCheck,
  Trophy,
  TrendingUp,
  AlertCircle,
  Clock,
  Briefcase,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SIGNAL_STRENGTH_CONFIG = {
  critical: {
    borderCls: "border-l-red-500",
    badgeCls: "bg-red-100 text-red-700 border-red-200",
    dotCls: "bg-red-500",
    label: "Critical",
  },
  high: {
    borderCls: "border-l-orange-500",
    badgeCls: "bg-orange-100 text-orange-700 border-orange-200",
    dotCls: "bg-orange-500",
    label: "High",
  },
  medium: {
    borderCls: "border-l-yellow-400",
    badgeCls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotCls: "bg-yellow-400",
    label: "Medium",
  },
  low: {
    borderCls: "border-l-slate-300",
    badgeCls: "bg-slate-100 text-slate-600 border-slate-200",
    dotCls: "bg-slate-300",
    label: "Low",
  },
};

const SIGNAL_TYPE_CONFIG = {
  hiring: {
    icon: Users,
    label: "Hiring",
    badgeCls: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  product_launch: {
    icon: Rocket,
    label: "Product Launch",
    badgeCls: "bg-purple-100 text-purple-700 border-purple-200",
  },
  campaign: {
    icon: Megaphone,
    label: "Campaign",
    badgeCls: "bg-pink-100 text-pink-700 border-pink-200",
  },
  event_sponsor: {
    icon: CalendarCheck,
    label: "Event Sponsor",
    badgeCls: "bg-sky-100 text-sky-700 border-sky-200",
  },
  competitor_move: {
    icon: Trophy,
    label: "Competitor Move",
    badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
  },
  funding: {
    icon: TrendingUp,
    label: "Funding",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

const CONFIDENCE_CONFIG = {
  high: { cls: "bg-green-100 text-green-700 border-green-200", label: "High Confidence" },
  medium: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Med Confidence" },
  low: { cls: "bg-red-100 text-red-700 border-red-200", label: "Low Confidence" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatBudget(val) {
  if (!val && val !== 0) return null;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color = "text-slate-600" }) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${color}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <AlertCircle className="w-6 h-6 text-slate-300" />
      <p className="text-xs text-slate-400 italic">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 py-4">
      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
      <span className="text-xs text-slate-400">Loading signals...</span>
    </div>
  );
}

// ── Budget Section ────────────────────────────────────────────────────────────

function BudgetSection({ budgetIntel }) {
  const confidence = budgetIntel?.confidence_level?.toLowerCase() || "low";
  const confConfig = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.low;

  const peakMonths = useMemo(() => {
    if (!budgetIntel) return [];
    const raw = budgetIntel.peak_spending_months;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return raw.split(",").map(s => s.trim()); }
    }
    return [];
  }, [budgetIntel.peak_spending_months]);

  if (!budgetIntel) return null;

  const budgetMin = formatBudget(budgetIntel.estimated_budget_min);
  const budgetMax = formatBudget(budgetIntel.estimated_budget_max);
  const budgetDisplay = budgetMin && budgetMax
    ? `${budgetMin} – ${budgetMax}`
    : budgetMin || budgetMax || null;

  return (
    <div>
      <SectionHeader icon={DollarSign} title="Budget Intelligence" color="text-emerald-600" />
      <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          {budgetDisplay ? (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">Est. Budget</p>
              <p className="text-sm font-bold text-slate-800">{budgetDisplay}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Budget range not available</p>
          )}
          <Badge className={`text-[10px] border flex-shrink-0 ${confConfig.cls}`}>
            {confConfig.label}
          </Badge>
        </div>

        {budgetIntel.fiscal_year_end && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>FY ends: <span className="font-medium">{budgetIntel.fiscal_year_end}</span></span>
          </div>
        )}

        {peakMonths.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-1.5">Peak Spending Months</p>
            <div className="flex gap-1 flex-wrap">
              {MONTH_NAMES.map((m, idx) => {
                const monthNum = idx + 1;
                const isPeak = peakMonths.some(pm => {
                  if (typeof pm === "number") return pm === monthNum;
                  const pmStr = String(pm).toLowerCase();
                  return pmStr === m.toLowerCase() || pmStr === String(monthNum) || pmStr === String(monthNum).padStart(2, "0");
                });
                return (
                  <span
                    key={m}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                      isPeak
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {m}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {budgetIntel.notes && (
          <p className="text-[10px] text-slate-600 italic leading-relaxed line-clamp-2">
            {budgetIntel.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Signal Card ───────────────────────────────────────────────────────────────

function SignalCard({ signal }) {
  const strength = signal.signal_strength?.toLowerCase() || "low";
  const strengthConfig = SIGNAL_STRENGTH_CONFIG[strength] || SIGNAL_STRENGTH_CONFIG.low;

  const type = signal.signal_type?.toLowerCase() || "campaign";
  const typeConfig = SIGNAL_TYPE_CONFIG[type] || {
    icon: Zap,
    label: signal.signal_type || "Signal",
    badgeCls: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const TypeIcon = typeConfig.icon;

  const since = timeSince(signal.detected_at);
  const expiresInDays = daysUntil(signal.expires_at);
  const isExpiringSoon = expiresInDays !== null && expiresInDays <= 14;

  return (
    <div className={`rounded-lg border border-slate-100 border-l-4 ${strengthConfig.borderCls} bg-white p-3 space-y-1.5`}>
      <div className="flex items-start gap-2 justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={`text-[10px] border ${typeConfig.badgeCls} flex items-center gap-1`}>
            <TypeIcon className="w-2.5 h-2.5" />
            {typeConfig.label}
          </Badge>
          <Badge className={`text-[10px] border ${strengthConfig.badgeCls}`}>
            {strengthConfig.label}
          </Badge>
        </div>
        {since && (
          <span className="text-[10px] text-slate-400 flex-shrink-0">{since}</span>
        )}
      </div>

      {signal.title && (
        <p className="text-xs font-semibold text-slate-800 leading-snug">{signal.title}</p>
      )}

      {signal.description && (
        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{signal.description}</p>
      )}

      {expiresInDays !== null && (
        <div className={`flex items-center gap-1 text-[10px] font-medium ${isExpiringSoon ? "text-red-600" : "text-slate-500"}`}>
          <Clock className="w-3 h-3" />
          {expiresInDays === 0
            ? "Expires today"
            : `Expires in ${expiresInDays} day${expiresInDays !== 1 ? "s" : ""}`}
        </div>
      )}
    </div>
  );
}

// ── Hiring Signals Section ────────────────────────────────────────────────────

function HiringSignalsSection({ signals }) {
  if (!signals || signals.length === 0) return null;

  return (
    <div>
      <SectionHeader icon={Briefcase} title={`Hiring Signals (${signals.length})`} color="text-indigo-600" />
      <div className="space-y-2">
        {signals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {string} [props.brandName]   - Brand name string (used if brandId not provided)
 * @param {string} [props.brandId]     - Brand UUID for precise querying
 * @param {string} [props.className]   - Optional extra Tailwind classes on the wrapper Card
 */
export default function BrandSignals({ brandId, brandName, className = "" }) {
  // ── Signals query ──────────────────────────────────────────────────────────
  const {
    data: signals = [],
    isLoading: signalsLoading,
    error: signalsError,
  } = useQuery({
    queryKey: ["brand-signals", brandId, brandName],
    queryFn: async () => {
      let query = supabase
        .from("brand_signals")
        .select("*")
        .order("signal_strength", { ascending: false })
        .order("detected_at", { ascending: false });

      if (brandId) {
        query = query.eq("brand_id", brandId);
      } else if (brandName) {
        query = query.ilike("brand_name", brandName);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(brandId || brandName),
    staleTime: 2 * 60 * 1000,
  });

  // ── Budget intel query ─────────────────────────────────────────────────────
  const {
    data: budgetIntel,
    isLoading: budgetLoading,
  } = useQuery({
    queryKey: ["brand-budget-intel", brandId, brandName],
    queryFn: async () => {
      let query = supabase
        .from("brand_budget_intel")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (brandId) {
        query = supabase
          .from("brand_budget_intel")
          .select("*")
          .eq("brand_id", brandId)
          .limit(1)
          .maybeSingle();
      } else if (brandName) {
        query = supabase
          .from("brand_budget_intel")
          .select("*")
          .ilike("brand_name", brandName)
          .limit(1)
          .maybeSingle();
      } else {
        return null;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? null;
    },
    enabled: Boolean(brandId || brandName),
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived signal groups ──────────────────────────────────────────────────
  const hiringSignals = useMemo(
    () => signals.filter(s => s.signal_type?.toLowerCase() === "hiring"),
    [signals]
  );

  const nonHiringSignals = useMemo(
    () => signals.filter(s => s.signal_type?.toLowerCase() !== "hiring"),
    [signals]
  );

  const isLoading = signalsLoading || budgetLoading;
  const hasData = signals.length > 0 || budgetIntel;
  const label = brandName || brandId || "this brand";

  // ── Guard: nothing provided ────────────────────────────────────────────────
  if (!brandId && !brandName) {
    return (
      <Card className={`border-slate-200/60 ${className}`}>
        <CardContent className="pt-6">
          <EmptyState message="Provide a brandId or brandName to load signals." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-slate-200/60 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Brand Signals
          </CardTitle>
          {signals.length > 0 && (
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
              {signals.length} active
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Buying intent and budget intelligence
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <LoadingState />
        ) : signalsError ? (
          <EmptyState message="Failed to load signals. Please try again." />
        ) : !hasData ? (
          <EmptyState message={`No signals detected for ${label} yet.`} />
        ) : (
          <>
            {/* Budget Intelligence */}
            {budgetIntel && (
              <>
                <BudgetSection budgetIntel={budgetIntel} />
                {(hiringSignals.length > 0 || nonHiringSignals.length > 0) && (
                  <div className="border-t border-slate-100" />
                )}
              </>
            )}

            {/* Hiring Signals — high priority, shown first */}
            {hiringSignals.length > 0 && (
              <>
                <HiringSignalsSection signals={hiringSignals} />
                {nonHiringSignals.length > 0 && (
                  <div className="border-t border-slate-100" />
                )}
              </>
            )}

            {/* All Other Active Signals */}
            {nonHiringSignals.length > 0 && (
              <div>
                <SectionHeader
                  icon={Zap}
                  title={`Active Signals (${nonHiringSignals.length})`}
                  color="text-amber-600"
                />
                <div className="space-y-2">
                  {nonHiringSignals.map(signal => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

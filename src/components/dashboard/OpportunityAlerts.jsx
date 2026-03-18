/**
 * OpportunityAlerts — dismissible alert banners at the top of the Dashboard.
 *
 * Queries marketplace_opportunities created in the last 7 days, fetches the
 * current user's talent profile, calculates a fit % for every opportunity,
 * and surfaces up to 3 alerts where fit >= 85.
 *
 * Dismissed opportunity IDs are persisted in localStorage so they survive
 * page reloads.
 */

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { calculateFitPercent } from "@/lib/qualityScore";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight } from "lucide-react";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = "opportunity_alerts_dismissed_v1";

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistDismissed(ids) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable — ignore silently
  }
}

// ─── Single alert banner ──────────────────────────────────────────────────────

function AlertBanner({ opportunity, fitPercent, onDismiss }) {
  const navigate = useNavigate();

  // Fit badge colour: 95+ emerald, 90+ blue, 85+ indigo
  const badgeClass =
    fitPercent >= 95
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : fitPercent >= 90
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-indigo-100 text-indigo-700 border-indigo-200";

  return (
    <div
      role="alert"
      className="flex items-start sm:items-center gap-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 shadow-sm"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
        <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {opportunity.title}
          </p>
          {opportunity.brand_name && (
            <span className="text-xs text-slate-500 shrink-0">
              by {opportunity.brand_name}
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-[11px] font-bold shrink-0 ${badgeClass}`}
          >
            {fitPercent}% fit
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          New opportunity matches your profile.
        </p>
      </div>

      {/* CTA */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(createPageUrl("Marketplace"))}
        className="shrink-0 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-100 hidden sm:flex items-center gap-1"
        aria-label={`View opportunity: ${opportunity.title}`}
      >
        View Opportunity
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Button>

      {/* Dismiss */}
      <button
        aria-label={`Dismiss alert for ${opportunity.title}`}
        onClick={() => onDismiss(opportunity.id)}
        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OpportunityAlerts() {
  const { user } = useAuth();

  // Reactive dismissed state — seeded from localStorage
  const [dismissed, setDismissed] = useState(() => getDismissed());

  // ── Fetch talent profile linked to the current user ──────────────────────
  const { data: talent } = useQuery({
    queryKey: ["opportunity-alerts-talent", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First try the profile's talent_id link
      const { data: profile } = await supabase
        .from("profiles")
        .select("talent_id")
        .eq("id", user.id)
        .maybeSingle();

      const talentId = profile?.talent_id;
      if (!talentId) return null;

      const { data: t } = await supabase
        .from("talents")
        .select("*")
        .eq("id", talentId)
        .maybeSingle();

      return t || null;
    },
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  // ── Fetch recent marketplace opportunities (last 7 days) ─────────────────
  const { data: recentOpportunities = [] } = useQuery({
    queryKey: ["opportunity-alerts-opps"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from("marketplace_opportunities")
        .select("*")
        .eq("status", "published")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 300_000,
  });

  // ── Calculate fit % and filter to 85+ matches ────────────────────────────
  const qualifiedAlerts = useMemo(() => {
    if (!talent || recentOpportunities.length === 0) return [];

    return recentOpportunities
      .map((opp) => ({
        opportunity: opp,
        fitPercent: calculateFitPercent(talent, opp) ?? 0,
      }))
      .filter(({ fitPercent }) => fitPercent >= 85)
      .sort((a, b) => b.fitPercent - a.fitPercent);
  }, [talent, recentOpportunities]);

  // ── Apply dismissed filter, cap at 3 ────────────────────────────────────
  const visibleAlerts = useMemo(
    () =>
      qualifiedAlerts
        .filter(({ opportunity }) => !dismissed.includes(opportunity.id))
        .slice(0, 3),
    [qualifiedAlerts, dismissed]
  );

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    persistDismissed(next);
    setDismissed(next);
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <section aria-label="Opportunity alerts" className="space-y-2">
      {visibleAlerts.map(({ opportunity, fitPercent }) => (
        <AlertBanner
          key={opportunity.id}
          opportunity={opportunity}
          fitPercent={fitPercent}
          onDismiss={handleDismiss}
        />
      ))}
    </section>
  );
}

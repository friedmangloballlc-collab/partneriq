/**
 * DealExpiryTracker — surfaces partnerships with end_date within the next
 * 30 days, or whose status is 'contracted' / 'active', so the team can act
 * on renewals before deals lapse.
 *
 * Color coding:
 *   red    — < 7 days  (critical)
 *   amber  — 7–14 days (warning)
 *   green  — 15–30 days (upcoming)
 *   slate  — no end_date / ongoing active deals
 *
 * "Renew" creates a draft copy of the partnership via Supabase insert.
 * "View Deal" navigates to /DealDetail?id=<UUID>.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Urgency helpers ──────────────────────────────────────────────────────────

function daysUntil(dateString) {
  if (!dateString) return null;
  const ms = new Date(dateString).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function urgencyConfig(days) {
  if (days === null)
    return {
      label: "Ongoing",
      color: "border-l-slate-400",
      badgeClass: "bg-slate-100 text-slate-600",
      icon: CheckCircle2,
      iconClass: "text-slate-400",
    };
  if (days < 0)
    return {
      label: "Expired",
      color: "border-l-red-500",
      badgeClass: "bg-red-100 text-red-700",
      icon: AlertTriangle,
      iconClass: "text-red-500",
    };
  if (days < 7)
    return {
      label: `${days}d left`,
      color: "border-l-red-500",
      badgeClass: "bg-red-100 text-red-700",
      icon: AlertTriangle,
      iconClass: "text-red-500",
    };
  if (days <= 14)
    return {
      label: `${days}d left`,
      color: "border-l-amber-500",
      badgeClass: "bg-amber-100 text-amber-700",
      icon: Clock,
      iconClass: "text-amber-500",
    };
  return {
    label: `${days}d left`,
    color: "border-l-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
    icon: Clock,
    iconClass: "text-emerald-500",
  };
}

function statusBadgeClass(status) {
  const map = {
    contracted: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    negotiating: "bg-violet-100 text-violet-700",
    completed: "bg-slate-100 text-slate-600",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

// ─── Single deal card ─────────────────────────────────────────────────────────

function ExpiryCard({ partnership, onRenew, renewingId }) {
  const navigate = useNavigate();
  const days = daysUntil(partnership.end_date);
  const urgency = urgencyConfig(days);
  const UrgencyIcon = urgency.icon;
  const isRenewing = renewingId === partnership.id;

  return (
    <div
      className={`rounded-xl border border-slate-200/70 border-l-4 bg-white shadow-sm p-4 flex flex-col gap-3 ${urgency.color}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {partnership.title || "Untitled Deal"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {[partnership.brand_name, partnership.talent_name]
              .filter(Boolean)
              .join(" × ") || "—"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={`text-[11px] font-semibold ${statusBadgeClass(partnership.status)}`}>
            {partnership.status}
          </Badge>
        </div>
      </div>

      {/* Expiry info */}
      <div className="flex items-center gap-2">
        <UrgencyIcon
          className={`w-4 h-4 shrink-0 ${urgency.iconClass}`}
          aria-hidden="true"
        />
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgency.badgeClass}`}>
          {urgency.label}
        </span>
        {partnership.end_date && (
          <span className="text-xs text-slate-400">
            Ends {new Date(partnership.end_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Deal value */}
      {partnership.deal_value > 0 && (
        <p className="text-xs text-slate-500">
          Value:{" "}
          <span className="font-semibold text-slate-700">
            ${partnership.deal_value.toLocaleString()}
          </span>
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRenew(partnership)}
          disabled={isRenewing}
          className="flex-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          aria-label={`Renew ${partnership.title}`}
        >
          {isRenewing ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          )}
          Renew
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            navigate(`${createPageUrl("DealDetail")}?id=${partnership.id}`)
          }
          className="flex-1 text-xs text-slate-600 hover:text-slate-800"
          aria-label={`View deal: ${partnership.title}`}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          View Deal
        </Button>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ExpiryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 animate-pulse p-4 space-y-3 border-l-4 border-l-slate-200">
      <div className="flex justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          <div className="h-2.5 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-slate-200 rounded-full ml-2" />
      </div>
      <div className="h-5 bg-slate-200 rounded-full w-20" />
      <div className="flex gap-2">
        <div className="h-7 bg-slate-200 rounded flex-1" />
        <div className="h-7 bg-slate-200 rounded flex-1" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DealExpiryTracker() {
  const queryClient = useQueryClient();
  const [renewingId, setRenewingId] = useState(null);
  const [renewedIds, setRenewedIds] = useState([]);

  // ── Fetch expiring / active-contracted partnerships ───────────────────────
  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ["deal-expiry-tracker"],
    queryFn: async () => {
      const thirtyDaysOut = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const today = new Date().toISOString();

      // Two sets: deals expiring in next 30 days, and all active/contracted
      const [expiringRes, activeRes] = await Promise.all([
        supabase
          .from("partnerships")
          .select("*")
          .gte("end_date", today)
          .lte("end_date", thirtyDaysOut)
          .order("end_date", { ascending: true })
          .limit(50),
        supabase
          .from("partnerships")
          .select("*")
          .in("status", ["contracted", "active"])
          .is("end_date", null)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const seen = new Set();
      const combined = [
        ...(expiringRes.data || []),
        ...(activeRes.data || []),
      ].filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      return combined;
    },
    staleTime: 60_000,
  });

  // ── Renew mutation — creates a draft copy ────────────────────────────────
  const renewMutation = useMutation({
    mutationFn: async (partnership) => {
      const draft = {
        title: `[Renewal] ${partnership.title || "Deal"}`,
        brand_id: partnership.brand_id,
        talent_id: partnership.talent_id,
        brand_name: partnership.brand_name,
        talent_name: partnership.talent_name,
        deal_value: partnership.deal_value,
        contract_type: partnership.contract_type,
        niche: partnership.niche,
        platforms: partnership.platforms,
        status: "draft",
        notes: `Renewal draft created from partnership ${partnership.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("partnerships")
        .insert(draft)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: (partnership) => setRenewingId(partnership.id),
    onSuccess: (_, partnership) => {
      setRenewedIds((prev) => [...prev, partnership.id]);
      queryClient.invalidateQueries({ queryKey: ["deal-expiry-tracker"] });
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
    },
    onSettled: () => setRenewingId(null),
  });

  // ── Filter out already-renewed ───────────────────────────────────────────
  const displayPartnerships = partnerships.filter(
    (p) => !renewedIds.includes(p.id)
  );

  if (!isLoading && displayPartnerships.length === 0) return null;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Deal Expiry & Renewals
          </CardTitle>
          {!isLoading && displayPartnerships.length > 0 && (
            <span className="text-xs text-slate-400">
              {displayPartnerships.length} deal
              {displayPartnerships.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading
            ? [1, 2, 3].map((i) => <ExpiryCardSkeleton key={i} />)
            : displayPartnerships.map((p) => (
                <ExpiryCard
                  key={p.id}
                  partnership={p}
                  onRenew={(partnership) => renewMutation.mutate(partnership)}
                  renewingId={renewingId}
                />
              ))}
        </div>
      </CardContent>
    </Card>
  );
}

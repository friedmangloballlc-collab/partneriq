/**
 * SmartNextSteps — contextual action cards that guide users through the
 * entire platform flow based on their current progress.
 *
 * Priority logic (first applicable card is rendered as the "hero" card,
 * plus up to 2 secondary cards):
 *   1. Onboarding incomplete (onboarding_step < 4)
 *   2. No social accounts connected
 *   3. No data room entries
 *   4. No matches / partnerships at all
 *   5. Matches found but no active deals
 *   6. Active deals in flight
 *   7. Pending approval items
 *   8. Browse marketplace (always available as a secondary)
 *
 * Dismissed cards are stored in sessionStorage so they come back
 * on the next session.
 */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Link2,
  Database,
  Handshake,
  CheckCircle2,
  AlertCircle,
  Zap,
  X,
  ChevronRight,
  PartyPopper,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DISMISSED_KEY = "smart_next_steps_dismissed_v1";

function getDismissed() {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id) {
  try {
    const current = getDismissed();
    if (!current.includes(id)) {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // sessionStorage unavailable — ignore silently
  }
}

// ─── Color token map ─────────────────────────────────────────────────────────

const COLOR = {
  indigo: {
    border: "border-l-indigo-500",
    icon: "bg-indigo-50 text-indigo-600",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    gradient: "from-indigo-50/60 to-indigo-100/30",
    badge: "bg-indigo-100 text-indigo-700",
    progress: "bg-indigo-500",
  },
  emerald: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    gradient: "from-emerald-50/60 to-emerald-100/30",
    badge: "bg-emerald-100 text-emerald-700",
    progress: "bg-emerald-500",
  },
  violet: {
    border: "border-l-violet-500",
    icon: "bg-violet-50 text-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700",
    gradient: "from-violet-50/60 to-violet-100/30",
    badge: "bg-violet-100 text-violet-700",
    progress: "bg-violet-500",
  },
  amber: {
    border: "border-l-amber-500",
    icon: "bg-amber-50 text-amber-600",
    btn: "bg-amber-600 hover:bg-amber-700",
    gradient: "from-amber-50/60 to-amber-100/30",
    badge: "bg-amber-100 text-amber-700",
    progress: "bg-amber-500",
  },
  blue: {
    border: "border-l-blue-500",
    icon: "bg-blue-50 text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700",
    gradient: "from-blue-50/60 to-blue-100/30",
    badge: "bg-blue-100 text-blue-700",
    progress: "bg-blue-500",
  },
  purple: {
    border: "border-l-purple-500",
    icon: "bg-purple-50 text-purple-600",
    btn: "bg-purple-600 hover:bg-purple-700",
    gradient: "from-purple-50/60 to-purple-100/30",
    badge: "bg-purple-100 text-purple-700",
    progress: "bg-purple-500",
  },
};

// ─── Individual card ──────────────────────────────────────────────────────────

function StepCard({ card, isHero, onDismiss }) {
  const navigate = useNavigate();
  const colors = COLOR[card.color] || COLOR.indigo;

  const handleCta = () => {
    if (card.action === "scroll-to-wizard") {
      const el = document.getElementById("onboarding-wizard");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (card.href) {
      navigate(card.href);
    }
  };

  return (
    <div
      className={[
        "relative flex flex-col rounded-xl border border-slate-200/70 border-l-4 bg-white shadow-sm transition-all",
        colors.border,
        isHero
          ? `bg-gradient-to-br ${colors.gradient} min-w-[280px] flex-[1.4]`
          : "min-w-[260px] flex-1",
        "snap-start",
      ].join(" ")}
    >
      {/* Dismiss button */}
      <button
        aria-label="Dismiss this suggestion"
        onClick={() => onDismiss(card.id)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col h-full p-5 gap-3">
        {/* Header row */}
        <div className="flex items-start gap-3 pr-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
            <card.Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            {isHero && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Recommended Next Step
              </span>
            )}
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {card.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed flex-1">
          {card.description}
        </p>

        {/* Progress bar (onboarding only) */}
        {card.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Step {card.progress.current} of {card.progress.total}</span>
              <span>{Math.round((card.progress.current / card.progress.total) * 100)}%</span>
            </div>
            <Progress
              value={(card.progress.current / card.progress.total) * 100}
              className="h-1.5"
            />
          </div>
        )}

        {/* Badges / social proof */}
        {card.badge && (
          <div className="flex items-center gap-1.5">
            {card.urgent && (
              <Badge className="bg-red-100 text-red-700 text-[10px] py-0 font-semibold animate-pulse">
                Urgent
              </Badge>
            )}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
              {card.badge}
            </span>
          </div>
        )}

        {card.socialProof && (
          <p className="text-[10px] text-slate-400 italic">{card.socialProof}</p>
        )}

        {card.explainer && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            {card.explainer}
          </p>
        )}

        {/* CTA */}
        <Button
          size="sm"
          onClick={handleCta}
          className={`w-full text-xs font-semibold text-white mt-auto ${colors.btn}`}
        >
          {card.ctaLabel}
          <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ─── Congratulations card ─────────────────────────────────────────────────────

function CongratsCard() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
        <PartyPopper className="w-6 h-6 text-emerald-600" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-sm font-semibold text-emerald-900">You're all set!</h3>
        <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
          Your AI is working in the background to find you the best deals. Check back soon for new recommendations and updates.
        </p>
      </div>
      <Badge className="bg-emerald-200 text-emerald-800 shrink-0">AI Active</Badge>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard({ wide = false }) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 animate-pulse ${wide ? "min-w-[280px] flex-[1.4]" : "min-w-[260px] flex-1"} p-5 space-y-3`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-slate-200 rounded w-3/4" />
          <div className="h-2.5 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 bg-slate-200 rounded" />
        <div className="h-2 bg-slate-200 rounded w-5/6" />
        <div className="h-2 bg-slate-200 rounded w-4/6" />
      </div>
      <div className="h-7 bg-slate-200 rounded-lg mt-2" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartNextSteps({ user: propUser, onboardingStep: propStep }) {
  const { user: authUser } = useAuth();

  // Accept user from either prop (Dashboard passes it down) or AuthContext
  const user = propUser || authUser;

  // Track dismissed card ids in React state so dismissals are reactive
  const [dismissed, setDismissed] = useState(() => getDismissed());

  // ── Data queries ────────────────────────────────────────────────────────
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["smart-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.rpc('get_my_profile').single();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const talentId = profile?.talent_id || user?.talent_id || null;

  const { data: connections, isLoading: loadingConnections } = useQuery({
    queryKey: ["smart-connections", talentId],
    queryFn: async () => {
      if (!talentId) return [];
      const { data } = await supabase
        .from("connected_platforms")
        .select("id")
        .eq("talent_id", talentId);
      return data || [];
    },
    enabled: !!talentId,
    staleTime: 60_000,
  });

  const { data: dataRoomEntries, isLoading: loadingDataRoom } = useQuery({
    queryKey: ["smart-data-room", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from("data_room_entries")
        .select("id")
        .eq("user_email", user.email);
      return data || [];
    },
    enabled: !!user?.email,
    staleTime: 60_000,
  });

  const { data: partnerships, isLoading: loadingPartnerships } = useQuery({
    queryKey: ["smart-partnerships"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partnerships")
        .select("id, status");
      return data || [];
    },
    staleTime: 30_000,
  });

  const { data: approvals, isLoading: loadingApprovals } = useQuery({
    queryKey: ["smart-approvals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("approval_items")
        .select("id")
        .eq("status", "pending");
      return data || [];
    },
    staleTime: 30_000,
  });

  const isLoading =
    loadingProfile || loadingConnections || loadingDataRoom ||
    loadingPartnerships || loadingApprovals;

  // ── Derived values ───────────────────────────────────────────────────────
  const role = user?.role || profile?.role || "talent";
  const onboardingStep = propStep ?? profile?.onboarding_step ?? user?.onboarding_step ?? 0;

  const activeStatuses = ["pending", "sent", "negotiating", "contracted"];
  const discoveryStatuses = ["discovered", "researching"];

  const activeCount = (partnerships || []).filter(p => activeStatuses.includes(p.status)).length;
  const discoveryOnly = (partnerships || []).length > 0 &&
    (partnerships || []).every(p => discoveryStatuses.includes(p.status));

  const approvalsCount = (approvals || []).length;
  const connectionsCount = (connections || []).length;
  const dataRoomCount = (dataRoomEntries || []).length;

  // ── Build candidate cards ────────────────────────────────────────────────
  const allCards = useMemo(() => {
    const cards = [];

    // 1. Onboarding incomplete
    if (onboardingStep < 4) {
      cards.push({
        id: "onboarding",
        priority: 1,
        color: "indigo",
        Icon: Sparkles,
        title: "Complete Your Setup",
        description:
          "Finish setting up your profile to unlock AI matching and personalised recommendations.",
        ctaLabel: "Continue Setup",
        action: "scroll-to-wizard",
        progress: { current: Math.max(onboardingStep, 0), total: 4 },
      });
    }

    // 2. No socials connected (only meaningful for talent / agency)
    if (connectionsCount === 0 && (role === "talent" || role === "agency")) {
      cards.push({
        id: "connect-socials",
        priority: 2,
        color: "emerald",
        Icon: Link2,
        title: "Connect Your Social Accounts",
        description:
          "Link your platforms to unlock verified scoring and boost your discovery by up to 30%.",
        ctaLabel: "Connect Accounts",
        href: createPageUrl("ConnectAccounts"),
        badge: "+5% boost per platform",
      });
    }

    // 3. No data room entries
    if (dataRoomCount === 0) {
      const dataRoomPage = role === "brand" ? "BrandDataRoom" : "TalentDataRoom";
      cards.push({
        id: "data-room",
        priority: 3,
        color: "violet",
        Icon: Database,
        title: "Build Your Data Room",
        description:
          "Add your first deal or campaign to generate your Deal Score and unlock AI predictions.",
        ctaLabel: "Start Data Room",
        href: createPageUrl(dataRoomPage),
        socialProof: "Profiles with deal history get 3x more inbound inquiries",
      });
    }

    // 4. No matches at all
    if (!partnerships || partnerships.length === 0) {
      cards.push({
        id: "run-match",
        priority: 4,
        color: "amber",
        Icon: Sparkles,
        title: "Find Your First Match",
        description:
          "Our AI Match Engine uses 10 weighted factors to find your ideal brand or talent partners.",
        ctaLabel: "Run Match Engine",
        href: createPageUrl("MatchEngine"),
        badge: "AI-powered matching",
      });
    }

    // 5. Matches found but no active deals
    if (discoveryOnly) {
      cards.push({
        id: "create-deal",
        priority: 5,
        color: "blue",
        Icon: Handshake,
        title: "Create Your First Deal",
        description:
          "One click generates your Campaign Brief, ROI Projection, Pitch Deck, and Outreach Draft — all ready for your review.",
        ctaLabel: "View Matches",
        href: createPageUrl("Partnerships"),
        explainer: "Nothing sends without your approval",
      });
    }

    // 6. Active deals
    if (activeCount > 0) {
      cards.push({
        id: "active-deals",
        priority: 6,
        color: "emerald",
        Icon: CheckCircle2,
        title: "Check Your Active Deals",
        description: `You have ${activeCount} active deal${activeCount > 1 ? "s" : ""}. Review progress, approve content, and manage milestones.`,
        ctaLabel: "View Deals",
        href: createPageUrl("Partnerships"),
      });
    }

    // 7. Pending approvals
    if (approvalsCount > 0) {
      cards.push({
        id: "approvals",
        priority: 7,
        color: "amber",
        Icon: AlertCircle,
        title: `${approvalsCount} Item${approvalsCount > 1 ? "s" : ""} Awaiting Your Review`,
        description:
          "Outreach emails and deals need your approval before they can proceed.",
        ctaLabel: "Review Now",
        href: createPageUrl("Approvals"),
        badge: "Action required",
        urgent: true,
      });
    }

    // 8. Marketplace (always available as secondary)
    cards.push({
      id: "marketplace",
      priority: 8,
      color: "purple",
      Icon: Zap,
      title: "Browse the Marketplace",
      description:
        "Discover brand opportunities matched to your profile with AI-powered fit scores.",
      ctaLabel: "Explore",
      href: createPageUrl("Marketplace"),
    });

    return cards;
  }, [
    onboardingStep, connectionsCount, dataRoomCount,
    partnerships, discoveryOnly, activeCount, approvalsCount, role,
  ]);

  // ── Filter dismissed, sort by priority, take first 3 ────────────────────
  const visibleCards = useMemo(
    () => allCards.filter(c => !dismissed.includes(c.id)).slice(0, 3),
    [allCards, dismissed],
  );

  const handleDismiss = (id) => {
    addDismissed(id);
    setDismissed(prev => [...prev, id]);
  };

  // All steps complete and no pending items → congrats
  const allComplete =
    !isLoading &&
    onboardingStep >= 4 &&
    connectionsCount > 0 &&
    dataRoomCount > 0 &&
    (partnerships || []).length > 0 &&
    approvalsCount === 0 &&
    visibleCards.length === 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section aria-label="Smart Next Steps" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          Your Next Steps
        </h2>
        {visibleCards.length > 0 && !isLoading && (
          <span className="text-[11px] text-slate-400">
            {visibleCards.length} suggestion{visibleCards.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        /* Loading skeletons */
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          <SkeletonCard wide />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : allComplete ? (
        <CongratsCard />
      ) : visibleCards.length === 0 ? null : (
        <div
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory
                     md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
          role="list"
        >
          {visibleCards.map((card, idx) => (
            <div key={card.id} role="listitem" className="flex md:block">
              <StepCard
                card={card}
                isHero={idx === 0}
                onDismiss={handleDismiss}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

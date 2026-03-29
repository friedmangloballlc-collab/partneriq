import { useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  PAGE_ACCESS,
  TIER_NAMES,
  getPageTier,
  getTierLevel as resolveTierLevel,
} from "@/config/pageAccess";

const TRIAL_DAYS = 7;

// ─── Collect all pages accessible for a role at a given tier ───
function getAccessiblePages(role, tierLevel) {
  const pages = new Set();
  for (const [pageName, entry] of Object.entries(PAGE_ACCESS)) {
    if (!entry.roles.includes(role) && !entry.public) continue;
    const required = getPageTier(pageName, role);
    if (tierLevel >= required) {
      pages.add(pageName);
    }
  }
  return pages;
}

// ─── Hook ───
export function useFeatureGate() {
  const { user, isLoadingAuth } = useAuth();
  const loading = isLoadingAuth;

  const profile = useMemo(() => {
    if (!user) return null;
    return { role: user.role, plan: user.plan, created_at: user.created_at };
  }, [user?.role, user?.plan, user?.created_at]);

  const isAdmin = profile?.role === "admin";
  const role = profile?.role || "brand";
  const plan = profile?.plan || "free";
  const tierLevel = resolveTierLevel(role, plan);
  const isPaidPlan = isAdmin || tierLevel > 0;

  const trialDaysLeft = (() => {
    if (isAdmin) return 999;
    if (!profile?.created_at) return 0;
    const created = new Date(profile.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diffDays);
  })();

  const isTrialActive = isAdmin || trialDaysLeft > 0;
  const isTrialExpired = !isAdmin && !isTrialActive && !isPaidPlan;

  // Reverse trial: new users get 7 days of Tier 1 access (full pipeline, outreach, match engine)
  // so they build real workflow data before hitting the free tier paywall
  const effectiveTier = isTrialActive && !isPaidPlan ? 1 : tierLevel;

  const accessiblePages = getAccessiblePages(role, isAdmin ? 99 : effectiveTier);

  const canAccess = (pageName) => {
    if (loading) return true;
    if (!profile) return true;
    if (isAdmin) return true;
    if (accessiblePages.has(pageName)) return true;
    return false;
  };

  // Determine what tier a locked page requires (for upgrade messaging)
  const getRequiredTier = (pageName) => {
    const required = getPageTier(pageName, role);
    if (required === Infinity) return null;
    const names = TIER_NAMES[role];
    if (!names) return null;
    return names[required] || null;
  };

  return {
    canAccess,
    getRequiredTier,
    isPaidPlan,
    isTrialActive,
    isTrialExpired,
    trialDaysLeft,
    profile,
    loading,
    role,
    plan,
    tierLevel,
    effectiveTier,
  };
}

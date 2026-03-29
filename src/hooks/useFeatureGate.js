import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import {
  PAGE_ACCESS,
  TIER_NAMES,
  getPageTier,
  isRoleAllowed,
  getTierLevel as resolveTierLevel,
} from "@/config/pageAccess";

const TRIAL_DAYS = 7;

// ─── Collect all pages accessible for a role at a given tier ───
function getAccessiblePages(role, tierLevel) {
  // Managers inherit talent page tiers
  const effectiveRole = role === "manager" ? "talent" : role;

  const pages = new Set();
  for (const [pageName, entry] of Object.entries(PAGE_ACCESS)) {
    // Check role access (use original role so manager-only pages still work)
    if (!entry.roles.includes(role) && !entry.public) continue;

    // Check tier requirement using the effective role for tier lookup
    const required = getPageTier(pageName, effectiveRole);
    if (tierLevel >= required) {
      pages.add(pageName);
    }
  }
  return pages;
}

// ─── Hook ───
export function useFeatureGate() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data, error } = await supabase
          .from("profiles")
          .select("plan, created_at, role")
          .eq("id", user.id)
          .single();

        if (error && error.message?.includes("column")) {
          const result = await supabase
            .from("profiles")
            .select("created_at, role")
            .eq("id", user.id)
            .single();
          data = result.data;
        }
        setProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

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

  // During trial, users get Tier 2 access (Pro/Scale equivalent) so they can try premium features
  const effectiveTier = isTrialActive && !isPaidPlan ? 2 : tierLevel;

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
    const effectiveRole = role === "manager" ? "talent" : role;
    const required = getPageTier(pageName, effectiveRole);
    if (required === Infinity) return null;
    const names = TIER_NAMES[effectiveRole] || TIER_NAMES[role];
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

import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

// Features available per plan tier
// "free" tier gets: Dashboard, Marketplace, My Profile, Connect Accounts, Settings, Notifications, basic analytics
// Everything else is paid (requires rising/growth+ or trial)
const FREE_PAGES = [
  "Dashboard", "Marketplace", "TalentProfile", "ConnectAccounts", "Settings",
  "Notifications", "Onboarding", "PlatformOverview", "BillingHistory", "SubscriptionManagement"
];

const TRIAL_DAYS = 7;

export function useFeatureGate() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("plan, created_at, role")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const isPaidPlan = profile?.plan && profile.plan !== "free";

  const trialDaysLeft = (() => {
    if (!profile?.created_at) return 0;
    const created = new Date(profile.created_at);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diffDays);
  })();

  const isTrialActive = trialDaysLeft > 0;
  const isTrialExpired = !isTrialActive && !isPaidPlan;

  const canAccess = (pageName) => {
    if (loading) return true; // don't block while loading
    if (!profile) return true; // not logged in, let auth handle it
    if (profile.role === "admin") return true; // admin bypasses all
    if (isPaidPlan) return true; // paid users get everything
    if (FREE_PAGES.includes(pageName)) return true; // free pages always accessible
    if (isTrialActive) return true; // trial still active
    return false; // locked
  };

  return { canAccess, isPaidPlan, isTrialActive, isTrialExpired, trialDaysLeft, profile, loading };
}

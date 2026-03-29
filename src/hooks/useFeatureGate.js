import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

const TRIAL_DAYS = 7;

// ─── Tier hierarchy per role (higher index = more access) ───
const TALENT_TIERS = { free: 0, rising: 1, pro: 2, elite: 3 };
const BRAND_TIERS  = { free: 0, growth: 1, scale: 2, enterprise: 3 };
const AGENCY_TIERS = { agency_starter: 1, agency_pro: 2, agency_enterprise: 3 };
const MANAGER_TIERS = { manager_single: 1, manager_pro: 2, manager_enterprise: 3 };

// ─── Pages available at each tier per role ───
// Tier 0 = Free, Tier 1 = Rising/Growth/AgencyStarter, Tier 2 = Pro/Scale/AgencyPro, Tier 3 = Elite/Enterprise

const ALWAYS_FREE = [
  "Dashboard", "Settings", "Notifications", "BillingHistory",
  "SubscriptionManagement", "Onboarding", "Referrals",
];

const TALENT_PAGES = {
  // Free (Tier 0) — basic access, browse only
  0: [
    ...ALWAYS_FREE,
    "TalentProfile", "ConnectAccounts", "Marketplace",
    "Brands", "BrandDashboard", "TalentRevenue",
    "MasterCalendar", "CultureCalendar", "Partnerships",
    "ContractTemplates",
  ],
  // Rising (Tier 1) — core loop unlocked
  1: [
    "MatchEngine", "Outreach", "TalentAnalytics",
  ],
  // Pro (Tier 2) — full power
  2: [
    "ContactFinder", "SequenceBuilder", "WarmIntroNetwork",
    "DemographicTargeting", "DealAnalytics", "DealComparison",
    "BundleDeals", "MarketIntelligence", "PitchDeckBuilder",
    "DeckLibrary", "TalentDataRoom", "AICommandCenter",
    "AIAgentsHub", "PitchCompetition",
  ],
  // Elite (Tier 3) — everything + premium
  3: [
    "Integrations", "Teams", "CustomReports",
    "SimulationEngine", "DataImportExport", "Analytics",
    "AIFeatures", "AIAnalytics", "EventManagement",
    "BrandSpendPrediction", "PlatformOverview",
  ],
};

const BRAND_PAGES = {
  // Free (Tier 0)
  0: [
    ...ALWAYS_FREE,
    "BrandDashboard", "ConnectAccounts", "Marketplace",
    "TalentDiscovery", "CampaignBriefGenerator", "Partnerships",
    "ContractTemplates", "Analytics", "MasterCalendar",
    "CultureCalendar",
  ],
  // Growth (Tier 1)
  1: [
    "MatchEngine", "ContactFinder", "Outreach",
    "TalentAnalytics",
  ],
  // Scale (Tier 2)
  2: [
    "DemographicTargeting", "SequenceBuilder", "WarmIntroNetwork",
    "DealAnalytics", "DealComparison", "BundleDeals",
    "Approvals", "MarketIntelligence", "BrandSpendPrediction",
    "SimulationEngine", "PitchDeckBuilder", "DeckLibrary",
    "CustomReports", "BrandDataRoom", "AICommandCenter",
    "AIAgentsHub", "EventManagement", "Teams",
    "PitchCompetition",
  ],
  // Enterprise (Tier 3)
  3: [
    "Integrations", "DataImportExport", "AIFeatures",
    "AIAnalytics", "PlatformOverview", "TalentRevenue",
    "TalentDataRoom", "AgencyDataRoom", "DealScoreLeaderboard",
    "SystemArchitecture",
  ],
};

const AGENCY_PAGES = {
  // Agency Starter (Tier 1) — agencies have no free tier, starter gets almost everything
  1: [
    ...ALWAYS_FREE,
    "ConnectAccounts", "Marketplace", "TalentDiscovery",
    "TalentAnalytics", "TalentRevenue", "MatchEngine",
    "ContactFinder", "WarmIntroNetwork", "DemographicTargeting",
    "CampaignBriefGenerator", "Outreach", "SequenceBuilder",
    "Partnerships", "DealAnalytics", "DealComparison",
    "BundleDeals", "ContractTemplates", "Approvals",
    "MarketIntelligence", "BrandSpendPrediction", "SimulationEngine",
    "PitchDeckBuilder", "DeckLibrary", "Analytics",
    "CustomReports", "AgencyDataRoom", "AICommandCenter",
    "AIAgentsHub", "MasterCalendar", "CultureCalendar",
    "Integrations", "Teams", "PitchCompetition",
  ],
  // Agency Pro (Tier 2) — adds cross-client features
  2: [
    "AIFeatures", "AIAnalytics", "DataImportExport",
    "DealScoreLeaderboard", "EventManagement",
    "TalentDataRoom", "BrandDataRoom", "PlatformOverview",
  ],
  // Agency Enterprise (Tier 3) — adds white-label and API
  3: [
    "SystemArchitecture",
  ],
};

// ─── Resolve tier number from plan key + role ───
function getTierLevel(role, plan) {
  if (!plan || plan === "free") {
    // Agencies have no free tier — if somehow here, treat as tier 0
    return role === "agency" ? 0 : 0;
  }
  if (role === "talent") return TALENT_TIERS[plan] ?? 0;
  if (role === "brand")  return BRAND_TIERS[plan]  ?? 0;
  if (role === "agency") return AGENCY_TIERS[plan]  ?? 1;
  if (role === "manager") return MANAGER_TIERS[plan] ?? TALENT_TIERS[plan] ?? 0;
  return 0;
}

// ─── Collect all pages accessible at a given tier ───
function getAccessiblePages(role, tierLevel) {
  if (role === "manager") return getAccessiblePages("talent", tierLevel);

  const tierMap = role === "talent" ? TALENT_PAGES
                : role === "brand"  ? BRAND_PAGES
                : role === "agency" ? AGENCY_PAGES
                : null;

  if (!tierMap) return new Set(ALWAYS_FREE);

  const pages = new Set();
  for (let t = 0; t <= tierLevel; t++) {
    if (tierMap[t]) tierMap[t].forEach(p => pages.add(p));
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
  const tierLevel = getTierLevel(role, plan);
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
    const tierMap = effectiveRole === "talent" ? TALENT_PAGES
                  : effectiveRole === "brand"  ? BRAND_PAGES
                  : effectiveRole === "agency" ? AGENCY_PAGES
                  : null;
    if (!tierMap) return null;
    for (let t = 0; t <= 3; t++) {
      if (tierMap[t] && tierMap[t].includes(pageName)) {
        if (role === "manager") return [null, "Single Talent", "Multi-Talent", "Manager Enterprise"][t];
        if (effectiveRole === "talent") return ["Starter", "Rising", "Pro", "Elite"][t];
        if (effectiveRole === "brand")  return ["Explorer", "Growth", "Scale", "Enterprise"][t];
        if (effectiveRole === "agency") return [null, "Agency Starter", "Agency Pro", "Agency Enterprise"][t];
      }
    }
    return null;
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

/**
 * ──────────────────────────────────────────────────────────────────────
 * PAGE_ACCESS  —  Single Source of Truth for page-level access control
 * ──────────────────────────────────────────────────────────────────────
 *
 * Every page in the app MUST appear here exactly once.
 *
 * Schema per entry:
 *   roles  – array of roles that can ever see this page
 *   tier   – minimum tier number to unlock the page.
 *            * A plain number means "same tier for every listed role".
 *            * An object keyed by role allows per-role tier overrides.
 *            * Omitted roles in an object inherit the `_default` key (if
 *              present) or are denied.
 *
 * Tier numbers:
 *   0 = free / always accessible
 *   1 = Rising (talent) / Growth (brand) / Agency Starter / Manager Single
 *   2 = Pro (talent) / Scale (brand) / Agency Pro / Manager Pro
 *   3 = Elite (talent) / Enterprise (brand) / Agency Enterprise / Manager Enterprise
 *
 * Special flags:
 *   public: true  — accessible to every authenticated user regardless of role/tier
 *   adminOnly: true — only accessible to admin role
 *
 * ─── RESTRUCTURE v2 (2026-03-29) ──────────────────────────────────────
 * Principles:
 *   1. Free = Hook (AI taste, basic discovery, read-only pipeline)
 *   2. Tier 1 = Core Workflow (full pipeline, outreach, match engine)
 *   3. Tier 2 = Competitive Advantage (analytics, intelligence, advanced AI)
 *   4. Tier 3 = Enterprise Scale (teams, integrations, custom reports)
 *   5. Role Parity — same feature at same tier across all roles
 *   6. Agency Rebalanced — no more near-complete product at Tier 1
 */

// Every role string the system recognises
export const ALL_ROLES = ['talent', 'brand', 'agency', 'manager', 'admin'];

export const PAGE_ACCESS = {
  // ── Always-free pages (tier 0 for everyone) ──────────────────────
  Dashboard:               { roles: ALL_ROLES, tier: 0 },
  Settings:                { roles: ALL_ROLES, tier: 0 },
  Notifications:           { roles: ALL_ROLES, tier: 0 },
  BillingHistory:          { roles: ALL_ROLES, tier: 0 },
  SubscriptionManagement:  { roles: ALL_ROLES, tier: 0 },
  Onboarding:              { roles: ALL_ROLES, tier: 0 },
  Referrals:               { roles: ALL_ROLES, tier: 0 },
  ConnectAccounts:         { roles: ALL_ROLES, tier: 0 },
  TalentProfile:           { roles: ALL_ROLES, tier: 0 },
  BrandDashboard:          { roles: ALL_ROLES, tier: 0 },
  DealDetail:              { roles: ALL_ROLES, tier: 0 },
  Approvals:               { roles: ALL_ROLES, tier: 0 },
  AICommandCenter:         { roles: ALL_ROLES, tier: 0 },  // Free: 5 queries/month (hook)
  Marketplace:             { roles: ALL_ROLES, tier: 0 },  // Free: browse-only
  Brands:                  { roles: ALL_ROLES, tier: 0 },

  // ── Public / marketing pages ─────────────────────────────────────
  About:                       { roles: ALL_ROLES, tier: 0, public: true },
  Blog:                        { roles: ALL_ROLES, tier: 0, public: true },
  Careers:                     { roles: ALL_ROLES, tier: 0, public: true },
  Contact:                     { roles: ALL_ROLES, tier: 0, public: true },
  Customers:                   { roles: ALL_ROLES, tier: 0, public: true },
  CookiePolicy:                { roles: ALL_ROLES, tier: 0, public: true },
  GDPR:                        { roles: ALL_ROLES, tier: 0, public: true },
  Demo:                        { roles: ALL_ROLES, tier: 0, public: true },
  FeatureCampaignAnalytics:    { roles: ALL_ROLES, tier: 0, public: true },
  FeatureSendDeals:            { roles: ALL_ROLES, tier: 0, public: true },
  FeatureManageDeals:          { roles: ALL_ROLES, tier: 0, public: true },
  FeatureBrowseTalent:         { roles: ALL_ROLES, tier: 0, public: true },
  FeatureManageTalent:         { roles: ALL_ROLES, tier: 0, public: true },

  // ── Tier 1: Core Workflow ────────────────────────────────────────
  // Full pipeline, outreach, match engine, discovery — all roles same tier
  Partnerships:        { roles: ALL_ROLES, tier: 1 },  // Deal Pipeline (was free)
  ContractTemplates:   { roles: ALL_ROLES, tier: 1 },  // Was free
  MasterCalendar:      { roles: ALL_ROLES, tier: 1 },  // Was free
  CultureCalendar:     { roles: ALL_ROLES, tier: 1 },  // Was free
  CreateOpportunity:   { roles: ALL_ROLES, tier: 1 },  // Was brand-only free
  TalentDiscovery:     { roles: ALL_ROLES, tier: 1 },  // Was brand/agency only
  MatchEngine:         { roles: ALL_ROLES, tier: 1 },
  ContactFinder:       { roles: ALL_ROLES, tier: 1 },  // Role parity (was T2 for talent)
  Outreach:            { roles: ALL_ROLES, tier: 1 },
  TalentAnalytics:     { roles: ALL_ROLES, tier: 1 },
  CampaignBriefGenerator: { roles: ALL_ROLES, tier: 1 },  // Was free for some roles
  TalentRevenue:       { roles: ALL_ROLES, tier: 1 },  // Was free for talent
  DealScoreLeaderboard: { roles: ALL_ROLES, tier: 1 }, // Was free for talent, T3 for brand
  PitchDeckBuilder:    { roles: ALL_ROLES, tier: 1 },  // Was T2 for most
  DeckLibrary:         { roles: ALL_ROLES, tier: 1 },  // Was T2 for most
  AIAgentsHub:         { roles: ALL_ROLES, tier: 1 },  // T1: 1 agent (was T2)
  CreatorCalculator:   { roles: ALL_ROLES, tier: 1 },

  // ── Tier 2: Competitive Advantage ────────────────────────────────
  // Analytics, intelligence, advanced AI, data rooms — all roles same tier
  SequenceBuilder:      { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  WarmIntroNetwork:     { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  DemographicTargeting: { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  DealAnalytics:        { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  DealComparison:       { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  BundleDeals:          { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  MarketIntelligence:   { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  IndustryEvents:       { roles: ALL_ROLES, tier: 2 },  // Events calendar with brand sponsors
  PitchCompetition:     { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2
  BrandSpendPrediction: { roles: ALL_ROLES, tier: 2 },  // Talent/Manager moved from T3 to T2
  SimulationEngine:     { roles: ALL_ROLES, tier: 2 },  // Talent/Manager moved from T3 to T2
  Analytics:            { roles: ALL_ROLES, tier: 2 },  // Normalized (was T1 brand, T3 talent)
  EventManagement:      { roles: ALL_ROLES, tier: 2 },  // Normalized (was T2 brand, T3 talent)
  TalentDataRoom:       { roles: ALL_ROLES, tier: 2 },  // Simplified from per-role tiers
  BrandDataRoom:        { roles: ALL_ROLES, tier: 2 },  // Simplified
  AgencyDataRoom:       { roles: ALL_ROLES, tier: 2 },  // Agency moved from T1 to T2

  // ── Tier 3: Enterprise Scale ─────────────────────────────────────
  // Teams, integrations, custom reports, advanced AI — all roles same tier
  Teams:            { roles: ALL_ROLES, tier: 3 },  // Was T1 for agency, T2 for brand
  CustomReports:    { roles: ALL_ROLES, tier: 3 },  // Was T1 for agency, T2 for brand
  Integrations:     { roles: ALL_ROLES, tier: 3 },  // Was T1 for agency
  DataImportExport: { roles: ALL_ROLES, tier: 3 },
  AIFeatures:       { roles: ALL_ROLES, tier: 3 },
  PlatformOverview: { roles: ALL_ROLES, tier: 3 },

  // ── Admin-only pages ─────────────────────────────────────────────
  AdminDashboard:     { roles: ['admin'], tier: 0, adminOnly: true },
  AdminDataManager:   { roles: ['admin'], tier: 0, adminOnly: true },
  SystemHealth:       { roles: ['admin'], tier: 0, adminOnly: true },
  AIAnalytics:        { roles: ['admin'], tier: 0, adminOnly: true },
  SystemArchitecture: { roles: ['admin'], tier: 0, adminOnly: true },

  // ── Manager-only pages ───────────────────────────────────────────
  ManagerSetup:   { roles: ['manager', 'admin'], tier: 0 },
  ManagerProfile: { roles: ['manager', 'admin'], tier: 0 },
};

// ── Named feature flags (previously in featureFlags.js) ────────────
// These map feature names to the minimum tier per role.
// Use `isFeatureEnabled(role, tierLevel, flagName)` to check.
export const FEATURE_FLAGS = {
  ai_command_center:  { tier: 0 },  // Available free (usage-capped)
  ai_agents_hub:      { tier: 1 },  // 1 agent at T1, 3 at T2, unlimited T3
  bulk_outreach:      { tier: 2 },
  pitch_deck_builder: { tier: 1 },
  direct_email_send:  { tier: 2 },
  custom_reports:     { tier: 3 },
  api_access:         { tier: 3 },
};

// ── Tier name mappings per role (for upgrade messaging) ────────────
export const TIER_NAMES = {
  talent:  ['Starter', 'Rising', 'Pro', 'Elite'],
  brand:   ['Explorer', 'Growth', 'Scale', 'Enterprise'],
  agency:  ['Explorer', 'Agency Starter', 'Agency Pro', 'Agency Enterprise'],
  manager: ['Explorer', 'Single Talent', 'Multi-Talent', 'Manager Enterprise'],
};

// ── Tier hierarchy per role (plan key -> tier number) ──────────────
export const TIER_LEVELS = {
  talent:  { free: 0, rising: 1, pro: 2, elite: 3 },
  brand:   { free: 0, growth: 1, scale: 2, enterprise: 3 },
  agency:  { free: 0, agency_starter: 1, agency_pro: 2, agency_enterprise: 3 },
  manager: { free: 0, manager_single: 1, manager_pro: 2, manager_enterprise: 3 },
};

// ── Helper: resolve the minimum tier for a page given a role ───────
export function getPageTier(pageName, role) {
  const entry = PAGE_ACCESS[pageName];
  if (!entry) return Infinity; // unknown page = deny
  const tier = entry.tier;
  if (typeof tier === 'number') return tier;
  // Object form: look up role, then _default, then deny
  if (tier[role] !== undefined) return tier[role];
  if (tier._default !== undefined) return tier._default;
  return Infinity;
}

// ── Helper: check if a role is listed for a page ───────────────────
export function isRoleAllowed(pageName, role) {
  const entry = PAGE_ACCESS[pageName];
  if (!entry) return false;
  if (entry.public) return true;
  return entry.roles.includes(role);
}

// ── Helper: resolve tier number from plan key + role ───────────────
export function getTierLevel(role, plan) {
  if (!plan || plan === 'free') return 0;
  const map = TIER_LEVELS[role];
  if (!map) return 0;
  return map[plan] ?? 0;
}

// ── Helper: check named feature flag ───────────────────────────────
export function isFeatureEnabled(role, tierLevel, flagName) {
  const flag = FEATURE_FLAGS[flagName];
  if (!flag) return false;
  const tier = flag.tier;
  const required = typeof tier === 'number'
    ? tier
    : (tier[role] ?? tier._default ?? Infinity);
  return tierLevel >= required;
}

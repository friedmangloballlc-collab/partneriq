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

  // ── Free-tier pages with role restrictions ───────────────────────
  ConnectAccounts:   { roles: ALL_ROLES, tier: 0 },
  Marketplace:       { roles: ALL_ROLES, tier: 0 },
  MasterCalendar:    { roles: ALL_ROLES, tier: 0 },
  CultureCalendar:   { roles: ALL_ROLES, tier: 0 },
  Partnerships:      { roles: ALL_ROLES, tier: 0 },
  ContractTemplates: { roles: ALL_ROLES, tier: 0 },

  TalentProfile:     { roles: ['talent', 'manager', 'admin'], tier: 0 },
  BrandDashboard:    { roles: ['talent', 'brand', 'manager', 'admin'], tier: 0 },
  Brands:            { roles: ALL_ROLES, tier: 0 },
  TalentRevenue:     { roles: ['talent', 'manager', 'admin'], tier: { talent: 0, manager: 0, brand: 3, _default: 0 } },

  // brand gets TalentDiscovery at tier 0, agency at tier 1 (starter), talent/manager don't get it
  TalentDiscovery:   { roles: ['brand', 'agency', 'admin'], tier: { brand: 0, agency: 1, _default: 0 } },

  // brand gets CampaignBriefGenerator at tier 0; talent/agency at tier-gated
  CampaignBriefGenerator: { roles: ALL_ROLES, tier: { brand: 0, agency: 1, talent: 0, manager: 0, _default: 0 } },

  // brand gets Analytics at tier 0; talent at tier 3; agency at tier 1
  Analytics: { roles: ALL_ROLES, tier: { brand: 0, talent: 3, manager: 3, agency: 1, _default: 0 } },

  // ── Tier 1 pages ─────────────────────────────────────────────────
  MatchEngine: { roles: ALL_ROLES, tier: { talent: 1, brand: 1, agency: 1, manager: 1, _default: 1 } },
  Outreach:    { roles: ALL_ROLES, tier: { talent: 1, brand: 1, agency: 1, manager: 1, _default: 1 } },
  TalentAnalytics: { roles: ALL_ROLES, tier: { talent: 1, brand: 1, agency: 1, manager: 1, _default: 1 } },

  ContactFinder: { roles: ALL_ROLES, tier: { talent: 2, brand: 1, agency: 1, manager: 2, _default: 1 } },

  // ── Tier 2 pages ─────────────────────────────────────────────────
  SequenceBuilder:      { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  WarmIntroNetwork:     { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  DemographicTargeting: { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  DealAnalytics:        { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  DealComparison:       { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  BundleDeals:          { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  MarketIntelligence:   { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  PitchDeckBuilder:     { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  DeckLibrary:          { roles: ['talent', 'brand', 'agency', 'admin'], tier: { talent: 2, brand: 2, agency: 1, _default: 2 } },
  TalentDataRoom:       { roles: ALL_ROLES, tier: { talent: 2, brand: 3, agency: 2, manager: 2, _default: 2 } },
  AICommandCenter:      { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  AIAgentsHub:          { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },
  PitchCompetition:     { roles: ALL_ROLES, tier: { talent: 2, brand: 2, agency: 1, manager: 2, _default: 2 } },

  BrandSpendPrediction: { roles: ALL_ROLES, tier: { talent: 3, brand: 2, agency: 1, manager: 3, _default: 2 } },
  SimulationEngine:     { roles: ALL_ROLES, tier: { talent: 3, brand: 2, agency: 1, manager: 3, _default: 2 } },

  Approvals:        { roles: ALL_ROLES, tier: { brand: 2, agency: 1, talent: 0, manager: 0, _default: 0 } },
  CustomReports:    { roles: ALL_ROLES, tier: { talent: 3, brand: 2, agency: 1, manager: 3, _default: 2 } },
  BrandDataRoom:    { roles: ['brand', 'agency', 'admin'], tier: { brand: 2, agency: 2, _default: 2 } },
  AgencyDataRoom:   { roles: ['talent', 'brand', 'agency', 'manager', 'admin'], tier: { brand: 3, agency: 1, talent: 0, manager: 0, _default: 1 } },

  // brand + agency get EventManagement at tier 2; talent at tier 3
  EventManagement:  { roles: ALL_ROLES, tier: { talent: 3, brand: 2, agency: 2, manager: 3, _default: 2 } },
  Teams:            { roles: ALL_ROLES, tier: { talent: 3, brand: 2, agency: 1, manager: 3, _default: 2 } },

  DealScoreLeaderboard: { roles: ALL_ROLES, tier: { talent: 0, brand: 3, agency: 2, manager: 0, _default: 2 } },

  // brand gets CreateOpportunity at tier 0; agency at tier 1; not available for talent/manager
  CreateOpportunity: { roles: ['brand', 'agency', 'admin'], tier: { brand: 0, agency: 1, _default: 0 } },
  DealDetail:        { roles: ALL_ROLES, tier: 0 },

  // ── Tier 3 pages ─────────────────────────────────────────────────
  Integrations:     { roles: ALL_ROLES, tier: { talent: 3, brand: 3, agency: 1, manager: 3, _default: 3 } },
  DataImportExport: { roles: ALL_ROLES, tier: { talent: 3, brand: 3, agency: 2, manager: 3, _default: 3 } },
  AIFeatures:       { roles: ALL_ROLES, tier: { talent: 3, brand: 3, agency: 2, manager: 3, _default: 3 } },
  PlatformOverview: { roles: ALL_ROLES, tier: { talent: 3, brand: 3, agency: 2, manager: 3, _default: 3 } },

  // ── Admin-only pages ─────────────────────────────────────────────
  AdminDashboard:     { roles: ['admin'], tier: 0, adminOnly: true },
  AdminDataManager:   { roles: ['admin'], tier: 0, adminOnly: true },
  SystemHealth:       { roles: ['admin'], tier: 0, adminOnly: true },
  AIAnalytics:        { roles: ['admin'], tier: { talent: 3, brand: 3, agency: 2, _default: 3 }, adminOnly: true },
  SystemArchitecture: { roles: ['admin'], tier: { brand: 3, agency: 3, _default: 3 }, adminOnly: true },

  // ── Manager-only pages ───────────────────────────────────────────
  ManagerSetup:   { roles: ['manager', 'admin'], tier: 0 },
  ManagerProfile: { roles: ['manager', 'admin'], tier: 0 },
};

// ── Named feature flags (previously in featureFlags.js) ────────────
// These map feature names to the minimum tier per role.
// Use `isFeatureEnabled(role, tierLevel, flagName)` to check.
export const FEATURE_FLAGS = {
  ai_command_center: { tier: { talent: 2, brand: 2, agency: 1, _default: 2 } },
  bulk_outreach:     { tier: { talent: 2, brand: 2, agency: 1, _default: 2 } },
  pitch_deck_builder:{ tier: { talent: 2, brand: 1, agency: 1, _default: 2 } },
  direct_email_send: { tier: { talent: 2, brand: 2, agency: 1, _default: 2 } },
  custom_reports:    { tier: { talent: 2, brand: 2, agency: 2, _default: 2 } },
  api_access:        { tier: { talent: 3, brand: 3, agency: 3, _default: 3 } },
};

// ── Tier name mappings per role (for upgrade messaging) ────────────
export const TIER_NAMES = {
  talent:  ['Starter', 'Rising', 'Pro', 'Elite'],
  brand:   ['Explorer', 'Growth', 'Scale', 'Enterprise'],
  agency:  [null, 'Agency Starter', 'Agency Pro', 'Agency Enterprise'],
  manager: [null, 'Single Talent', 'Multi-Talent', 'Manager Enterprise'],
};

// ── Tier hierarchy per role (plan key -> tier number) ──────────────
export const TIER_LEVELS = {
  talent:  { free: 0, rising: 1, pro: 2, elite: 3 },
  brand:   { free: 0, growth: 1, scale: 2, enterprise: 3 },
  agency:  { agency_starter: 1, agency_pro: 2, agency_enterprise: 3 },
  manager: { manager_single: 1, manager_pro: 2, manager_enterprise: 3 },
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

/**
 * Route permissions derived from Layout.jsx roleNavItems.
 * Maps each role to the set of page keys they can access.
 * Pages not in a role's set will redirect to Dashboard.
 */

const rolePages = {
  admin: new Set([
    'Dashboard', 'Marketplace', 'TalentProfile', 'BrandDashboard', 'MasterCalendar',
    'CultureCalendar', 'MarketIntelligence', 'DemographicTargeting', 'PlatformOverview',
    'AIFeatures', 'AIAgentsHub', 'AICommandCenter', 'TalentDiscovery', 'TalentAnalytics', 'TalentRevenue',
    'Brands', 'Partnerships', 'DealAnalytics', 'DealScoreLeaderboard', 'CustomReports', 'Outreach',
    'SequenceBuilder', 'Approvals', 'MatchEngine', 'CampaignBriefGenerator',
    'DataImportExport', 'SimulationEngine', 'PitchDeckBuilder', 'Notifications',
    'Teams', 'SystemHealth', 'AIAnalytics', 'SystemArchitecture', 'Integrations', 'BillingHistory',
    'Settings', 'ConnectAccounts', 'EventManagement', 'Analytics',
    'SubscriptionManagement', 'CreateOpportunity', 'ContactFinder',
  ]),
  brand: new Set([
    'Dashboard', 'PlatformOverview', 'AIFeatures', 'AIAgentsHub', 'AICommandCenter',
    'BrandDashboard', 'Marketplace', 'MasterCalendar', 'CultureCalendar',
    'TalentDiscovery', 'TalentAnalytics', 'TalentRevenue', 'Partnerships', 'DealAnalytics',
    'DealScoreLeaderboard', 'CustomReports', 'Outreach', 'SequenceBuilder', 'Approvals', 'MatchEngine',
    'DemographicTargeting', 'CampaignBriefGenerator', 'DataImportExport',
    'SimulationEngine', 'PitchDeckBuilder', 'MarketIntelligence', 'Teams',
    'Integrations', 'BillingHistory', 'Settings', 'Notifications',
    'CreateOpportunity', 'Analytics', 'SubscriptionManagement', 'ConnectAccounts',
    'ContactFinder',
  ]),
  talent: new Set([
    'Dashboard', 'PlatformOverview', 'AIFeatures', 'AIAgentsHub', 'AICommandCenter',
    'Marketplace', 'TalentProfile', 'MasterCalendar', 'CultureCalendar',
    'MarketIntelligence', 'Brands', 'Partnerships', 'DealAnalytics', 'DealScoreLeaderboard',
    'CustomReports', 'TalentAnalytics', 'TalentRevenue', 'Outreach', 'SequenceBuilder', 'Approvals', 'MatchEngine',
    'CampaignBriefGenerator', 'PitchDeckBuilder', 'Notifications', 'Teams',
    'DemographicTargeting', 'ConnectAccounts', 'Integrations', 'BillingHistory',
    'Settings', 'Analytics', 'SubscriptionManagement', 'ContactFinder',
  ]),
  agency: new Set([
    'Dashboard', 'Marketplace', 'MasterCalendar', 'CultureCalendar',
    'TalentDiscovery', 'TalentAnalytics', 'TalentRevenue', 'Brands', 'Partnerships', 'DealAnalytics',
    'DealScoreLeaderboard', 'CustomReports', 'Outreach', 'SequenceBuilder', 'Approvals', 'MatchEngine',
    'CampaignBriefGenerator', 'AIFeatures', 'AIAgentsHub', 'AICommandCenter',
    'PitchDeckBuilder', 'MarketIntelligence', 'Teams', 'Integrations',
    'BillingHistory', 'Settings', 'Notifications', 'DemographicTargeting',
    'Analytics', 'SubscriptionManagement', 'CreateOpportunity', 'ConnectAccounts',
    'ContactFinder',
  ]),
};

/**
 * Check if a user role can access a given page.
 * Admin can always access everything. Unknown roles get admin access.
 */
export function canAccessPage(role, pageName) {
  if (!role || role === 'admin' || role === 'user') return true;
  const allowed = rolePages[role];
  if (!allowed) return true; // unknown role = full access
  return allowed.has(pageName);
}

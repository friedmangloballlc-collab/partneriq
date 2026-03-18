/**
 * pages.config.js - Page routing configuration with lazy loading
 * All pages use React.lazy() for code splitting — each page loads on demand.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const PAGES = {
    "AIAgentsHub": lazy(() => import('./pages/AIAgentsHub')),
    "AIAnalytics": lazy(() => import('./pages/AIAnalytics')),
    "AICommandCenter": lazy(() => import('./pages/AICommandCenter')),
    "AIFeatures": lazy(() => import('./pages/AIFeatures')),
    "Analytics": lazy(() => import('./pages/Analytics')),
    "Approvals": lazy(() => import('./pages/Approvals')),
    "BillingHistory": lazy(() => import('./pages/BillingHistory')),
    "BrandDashboard": lazy(() => import('./pages/BrandDashboard')),
    "Brands": lazy(() => import('./pages/Brands')),
    "CampaignBriefGenerator": lazy(() => import('./pages/CampaignBriefGenerator')),
    "ConnectAccounts": lazy(() => import('./pages/ConnectAccounts')),
    "CreateOpportunity": lazy(() => import('./pages/CreateOpportunity')),
    "CultureCalendar": lazy(() => import('./pages/CultureCalendar')),
    "CustomReports": lazy(() => import('./pages/CustomReports')),
    "Dashboard": lazy(() => import('./pages/Dashboard')),
    "DataImportExport": lazy(() => import('./pages/DataImportExport')),
    "DealAnalytics": lazy(() => import('./pages/DealAnalytics')),
    "DemographicTargeting": lazy(() => import('./pages/DemographicTargeting')),
    "EventManagement": lazy(() => import('./pages/EventManagement')),
    "Integrations": lazy(() => import('./pages/Integrations')),
    "MarketIntelligence": lazy(() => import('./pages/MarketIntelligence')),
    "Marketplace": lazy(() => import('./pages/Marketplace')),
    "MasterCalendar": lazy(() => import('./pages/MasterCalendar')),
    "MatchEngine": lazy(() => import('./pages/MatchEngine')),
    "Notifications": lazy(() => import('./pages/Notifications')),
    "Onboarding": lazy(() => import('./pages/Onboarding')),
    "Outreach": lazy(() => import('./pages/Outreach')),
    "Partnerships": lazy(() => import('./pages/Partnerships')),
    "PitchDeckBuilder": lazy(() => import('./pages/PitchDeckBuilder')),
    "PlatformOverview": lazy(() => import('./pages/PlatformOverview')),
    "SequenceBuilder": lazy(() => import('./pages/SequenceBuilder')),
    "Settings": lazy(() => import('./pages/Settings')),
    "SimulationEngine": lazy(() => import('./pages/SimulationEngine')),
    "SubscriptionManagement": lazy(() => import('./pages/SubscriptionManagement')),
    "SystemArchitecture": lazy(() => import('./pages/SystemArchitecture')),
    "SystemHealth": lazy(() => import('./pages/SystemHealth')),
    "TalentAnalytics": lazy(() => import('./pages/TalentAnalytics')),
    "TalentDiscovery": lazy(() => import('./pages/TalentDiscovery')),
    "TalentProfile": lazy(() => import('./pages/TalentProfile')),
    "TalentRevenue": lazy(() => import('./pages/TalentRevenue')),
    "Teams": lazy(() => import('./pages/Teams')),
};

export { PAGES };

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};

/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIFeatures from './pages/AIFeatures';
import Analytics from './pages/Analytics';
import Approvals from './pages/Approvals';
import Brands from './pages/Brands';
import CampaignBriefGenerator from './pages/CampaignBriefGenerator';
import ConnectAccounts from './pages/ConnectAccounts';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import MatchEngine from './pages/MatchEngine';
import Onboarding from './pages/Onboarding';
import Outreach from './pages/Outreach';
import Partnerships from './pages/Partnerships';
import PitchDeckBuilder from './pages/PitchDeckBuilder';
import PlatformOverview from './pages/PlatformOverview';
import SequenceBuilder from './pages/SequenceBuilder';
import Settings from './pages/Settings';
import SimulationEngine from './pages/SimulationEngine';
import SystemArchitecture from './pages/SystemArchitecture';
import SystemHealth from './pages/SystemHealth';
import TalentDiscovery from './pages/TalentDiscovery';
import Teams from './pages/Teams';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIFeatures": AIFeatures,
    "Analytics": Analytics,
    "Approvals": Approvals,
    "Brands": Brands,
    "CampaignBriefGenerator": CampaignBriefGenerator,
    "ConnectAccounts": ConnectAccounts,
    "Dashboard": Dashboard,
    "Integrations": Integrations,
    "MatchEngine": MatchEngine,
    "Onboarding": Onboarding,
    "Outreach": Outreach,
    "Partnerships": Partnerships,
    "PitchDeckBuilder": PitchDeckBuilder,
    "PlatformOverview": PlatformOverview,
    "SequenceBuilder": SequenceBuilder,
    "Settings": Settings,
    "SimulationEngine": SimulationEngine,
    "SystemArchitecture": SystemArchitecture,
    "SystemHealth": SystemHealth,
    "TalentDiscovery": TalentDiscovery,
    "Teams": Teams,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
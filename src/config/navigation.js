import {
  LayoutDashboard, Users, Building2, Handshake, Mail, CheckSquare,
  Sparkles, BarChart3, Settings,
  Zap, UsersRound, GitBranch, TrendingUp, Layers, Activity, Link2, Plug, FileText, Network, Brain, Bell, Calendar, User, Bot, Command, DollarSign, Database, FolderOpen, Package, ScrollText, Share2,
  Star,
} from "lucide-react";

export const roleNavItems = {
  admin: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Home" },
    { name: "Admin Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    // ── Users ──
    { name: "Talent", icon: Users, page: "TalentDiscovery", section: "Users" },
    { name: "Brands", icon: Building2, page: "Brands" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    // ── Data ──
    { name: "Data Manager", icon: Database, page: "AdminDataManager", section: "Data" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Data Room (Talent)", icon: Database, page: "TalentDataRoom" },
    { name: "Data Room (Brand)", icon: Database, page: "BrandDataRoom" },
    { name: "Data Room (Agency)", icon: Database, page: "AgencyDataRoom" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Pitch Deck Generation System", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    // ── AI ──
    { name: "AI Features", icon: Brain, page: "AIFeatures", section: "AI" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Analytics", icon: Activity, page: "AIAnalytics" },
    // ── Platform ──
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview", section: "Platform" },
    { name: "System Health", icon: Activity, page: "SystemHealth" },
    { name: "Architecture", icon: Network, page: "SystemArchitecture" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Settings ──
    { name: "Referrals", icon: Share2, page: "Referrals", section: "Settings" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  brand: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Home" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Create Opportunity", icon: Zap, page: "CreateOpportunity" },
    // ── Find Talent ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery", section: "Find Talent" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    // ── Campaigns ──
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator", section: "Campaigns" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    // ── Deals ──
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships", section: "Deals" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder", section: "Content" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics", section: "Reports" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Room", icon: Database, page: "BrandDataRoom" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter", section: "AI" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar", section: "Calendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    // ── Account ──
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts", section: "Account" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  talent: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Discovery ──
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Browse Brands", icon: Building2, page: "Brands" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    // ── Outreach ──
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    // ── Deals ──
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Earnings ──
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Data Room", icon: Database, page: "TalentDataRoom" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    // ── Account ──
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  manager: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "My Talent", icon: Star, page: "ManagerProfile" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Discovery ──
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Browse Brands", icon: Building2, page: "Brands" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    // ── Outreach ──
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    // ── Deals ──
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Earnings ──
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Data Room", icon: Database, page: "TalentDataRoom" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    // ── Account ──
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  agency: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    // ── Roster ──
    { name: "Talent Roster", icon: Users, page: "TalentDiscovery" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    // ── Find Brands ──
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    // ── Campaigns ──
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    // ── Deals ──
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Room", icon: Database, page: "AgencyDataRoom" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    // ── Account ──
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
};

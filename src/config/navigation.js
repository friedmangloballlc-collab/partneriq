import {
  LayoutDashboard, Users, Building2, Handshake, Mail, CheckSquare,
  Sparkles, BarChart3, Settings,
  Zap, UsersRound, GitBranch, TrendingUp, Layers, Activity, Link2, Plug, FileText, Network, Brain, Bell, Calendar, User, Bot, Command, DollarSign, Database, FolderOpen, Package, ScrollText, Share2,
  Star, Ticket,
} from "lucide-react";

export const roleNavItems = {
  admin: [
    // ── Admin ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Admin" },
    { name: "Admin Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
    { name: "Data Manager", icon: Database, page: "AdminDataManager" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    // ── Home ──
    { name: "My Profile", icon: User, page: "TalentProfile", section: "Home" },
    { name: "My Talent", icon: Star, page: "ManagerProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Create Opportunity", icon: Zap, page: "CreateOpportunity" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    // ── Discovery ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery", section: "Discovery" },
    { name: "Brands", icon: Building2, page: "Brands" },
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
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Industry Events", icon: Ticket, page: "IndustryEvents" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Creator Calculator", icon: TrendingUp, page: "CreatorCalculator" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder", section: "Content" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics", section: "Reports" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Room (Talent)", icon: Database, page: "TalentDataRoom" },
    { name: "Data Room (Brand)", icon: Database, page: "BrandDataRoom" },
    { name: "Data Room (Agency)", icon: Database, page: "AgencyDataRoom" },
    // ── AI ──
    { name: "AI Features", icon: Brain, page: "AIFeatures", section: "AI" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Analytics", icon: Activity, page: "AIAnalytics" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar", section: "Calendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    // ── Platform ──
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview", section: "Platform" },
    { name: "System Health", icon: Activity, page: "SystemHealth" },
    { name: "Architecture", icon: Network, page: "SystemArchitecture" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Account ──
    { name: "Referrals", icon: Share2, page: "Referrals", section: "Account" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
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
    // ── Discovery ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery", section: "Discovery" },
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
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Industry Events", icon: Ticket, page: "IndustryEvents" },
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
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Home" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Discovery ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery", section: "Discovery" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Browse Brands", icon: Building2, page: "Brands" },
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
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Create Opportunity", icon: Zap, page: "CreateOpportunity" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Industry Events", icon: Ticket, page: "IndustryEvents" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    // ── Earnings ──
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue", section: "Earnings" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Data Room", icon: Database, page: "TalentDataRoom" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder", section: "Content" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics", section: "Reports" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter", section: "AI" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar", section: "Calendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    // ── Account ──
    { name: "Integrations", icon: Plug, page: "Integrations", section: "Account" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  manager: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Home" },
    { name: "My Talent", icon: Star, page: "ManagerProfile" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    // ── Discovery ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery", section: "Discovery" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Browse Brands", icon: Building2, page: "Brands" },
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
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Create Opportunity", icon: Zap, page: "CreateOpportunity" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Industry Events", icon: Ticket, page: "IndustryEvents" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    // ── Earnings ──
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue", section: "Earnings" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Data Room", icon: Database, page: "TalentDataRoom" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder", section: "Content" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics", section: "Reports" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter", section: "AI" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar", section: "Calendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    // ── Account ──
    { name: "Integrations", icon: Plug, page: "Integrations", section: "Account" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  agency: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", section: "Home" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Create Opportunity", icon: Zap, page: "CreateOpportunity" },
    // ── Roster ──
    { name: "Talent Roster", icon: Users, page: "TalentDiscovery", section: "Roster" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    // ── Discovery ──
    { name: "Marketplace", icon: Zap, page: "Marketplace", section: "Discovery" },
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
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    // ── Intelligence ──
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence", section: "Intelligence" },
    { name: "Industry Events", icon: Ticket, page: "IndustryEvents" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder", section: "Content" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics", section: "Reports" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Room", icon: Database, page: "AgencyDataRoom" },
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
};

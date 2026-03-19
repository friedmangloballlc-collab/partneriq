import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Users, Building2, Handshake, Mail, CheckSquare,
  Sparkles, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut,
  Zap, Menu, X, UsersRound, GitBranch, TrendingUp, Layers, Activity, Link2, Plug, FileText, Network, Brain, Bell, Calendar, User, Bot, Command, DollarSign, Database, FolderOpen, Package, ScrollText, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import GlobalSearch from "@/components/search/GlobalSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const roleNavItems = {
  admin: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Admin Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
    { name: "Data Manager", icon: Database, page: "AdminDataManager" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview" },
    { name: "AI Features", icon: Brain, page: "AIFeatures" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "Talent", icon: Users, page: "TalentDiscovery" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Brands", icon: Building2, page: "Brands" },
    { name: "Partnerships", icon: Handshake, page: "Partnerships" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Data Room (Talent)", icon: Database, page: "TalentDataRoom" },
    { name: "Data Room (Brand)", icon: Database, page: "BrandDataRoom" },
    { name: "Data Room (Agency)", icon: Database, page: "AgencyDataRoom" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Pitch Deck Generation System", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "System Health", icon: Activity, page: "SystemHealth" },
    { name: "AI Analytics", icon: Activity, page: "AIAnalytics" },
    { name: "Architecture", icon: Network, page: "SystemArchitecture" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  brand: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview" },
    { name: "AI Features", icon: Brain, page: "AIFeatures" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Talent", icon: Users, page: "TalentDiscovery" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Partnerships", icon: Handshake, page: "Partnerships" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Data Room (Talent)", icon: Database, page: "TalentDataRoom" },
    { name: "Data Room (Brand)", icon: Database, page: "BrandDataRoom" },
    { name: "Data Room (Agency)", icon: Database, page: "AgencyDataRoom" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Pitch Deck Generation System", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "Brands", icon: Building2, page: "Brands" },
    { name: "Analytics", icon: BarChart3, page: "Analytics" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  talent: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview" },
    { name: "AI Features", icon: Brain, page: "AIFeatures" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "My Profile", icon: User, page: "TalentProfile" },
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "Brands", icon: Building2, page: "Brands" },
    { name: "My Deals", icon: Handshake, page: "Partnerships" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "Pitch Deck Generation System", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Talent", icon: Users, page: "TalentDiscovery" },
    { name: "Data Room", icon: Database, page: "TalentDataRoom" },
    { name: "Brand Data Room", icon: Database, page: "BrandDataRoom" },
    { name: "Agency Data Room", icon: Database, page: "AgencyDataRoom" },
    { name: "Analytics", icon: BarChart3, page: "Analytics" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  agency: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Talent Roster", icon: Users, page: "TalentDiscovery" },
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    { name: "Talent Revenue", icon: DollarSign, page: "TalentRevenue" },
    { name: "Brands", icon: Building2, page: "Brands" },
    { name: "Partnerships", icon: Handshake, page: "Partnerships" },
    { name: "Bundle Deals", icon: Package, page: "BundleDeals" },
    { name: "Data Room (Talent)", icon: Database, page: "TalentDataRoom" },
    { name: "Data Room (Brand)", icon: Database, page: "BrandDataRoom" },
    { name: "Data Room (Agency)", icon: Database, page: "AgencyDataRoom" },
    { name: "Deal Analytics", icon: BarChart3, page: "DealAnalytics" },
    { name: "Deal Comparison", icon: Layers, page: "DealComparison" },
    { name: "Deal Score Leaderboard", icon: TrendingUp, page: "DealScoreLeaderboard" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
    { name: "Pitch Competition", icon: Layers, page: "PitchCompetition" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Approvals", icon: CheckSquare, page: "Approvals" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "AI Features", icon: Brain, page: "AIFeatures" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "Pitch Deck Generation System", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    { name: "Contract Templates", icon: ScrollText, page: "ContractTemplates" },
    { name: "Referrals", icon: Share2, page: "Referrals" },
    { name: "Market Intelligence", icon: BarChart3, page: "MarketIntelligence" },
    { name: "Spend Prediction", icon: TrendingUp, page: "BrandSpendPrediction" },
    { name: "Platform Overview", icon: Zap, page: "PlatformOverview" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    { name: "Analytics", icon: BarChart3, page: "Analytics" },
    { name: "ROI Simulator", icon: TrendingUp, page: "SimulationEngine" },
    { name: "Data Import/Export", icon: Layers, page: "DataImportExport" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
    { name: "Notifications", icon: Bell, page: "Notifications" },
    { name: "Teams", icon: UsersRound, page: "Teams" },
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    { name: "Integrations", icon: Plug, page: "Integrations" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.ApprovalItem.filter({ status: "pending" }).then(items => {
      setPendingApprovals(items.length);
    }).catch(() => {});
  }, []);

  if (currentPageName === "Onboarding") {
    return <>{children}</>;
  }

  const userRole = user?.role || "brand";
  const navItems = roleNavItems[userRole] || roleNavItems.brand;
  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const roleColors = {
    admin: "bg-red-500/10 text-red-400 border-red-500/20",
    brand: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    talent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    agency: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-950 ${mobile ? "w-72" : collapsed ? "w-[72px]" : "w-64"} transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/5 ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="flex flex-col">
            <span className="text-white font-bold text-base tracking-tight">Deal Stage</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Intelligence Platform</span>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white" aria-label="Close navigation menu">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3">
          <Badge variant="outline" className={`${roleColors[userRole]} text-[10px] uppercase tracking-wider w-full justify-center py-1`}>
            {userRole} Portal
          </Badge>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentPageName === item.page;
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
                ${isActive
                  ? "bg-indigo-500/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }
                ${collapsed && !mobile ? "justify-center" : ""}
              `}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {(!collapsed || mobile) && <span>{item.name}</span>}
              {item.page === "Approvals" && pendingApprovals > 0 && (!collapsed || mobile) && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingApprovals > 9 ? "9+" : pendingApprovals}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={`p-3 border-t border-white/5 ${collapsed && !mobile ? "flex justify-center" : ""}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="User menu" className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors ${collapsed && !mobile ? "justify-center px-0" : ""}`}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || mobile) && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user?.full_name || "User"}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate(createPageUrl("Settings"))}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-500" aria-label="Sign out of your account">
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" aria-hidden="true" /> : <ChevronLeft className="w-3 h-3" aria-hidden="true" />}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex relative flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">{currentPageName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <NotificationDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
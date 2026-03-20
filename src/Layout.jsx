import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Users, Building2, Handshake, Mail, CheckSquare,
  Sparkles, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut,
  Zap, Menu, X, UsersRound, GitBranch, TrendingUp, Layers, Activity, Link2, Plug, FileText, Network, Brain, Bell, Calendar, User, Bot, Command, DollarSign, Database, FolderOpen, Package, ScrollText, Share2,
  Lock, Crown
} from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useTheme } from "@/hooks/useTheme";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import UpgradeModal from "@/components/UpgradeModal";
import FeatureGate from "@/components/FeatureGate";
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
    { name: "Deal Pipeline", icon: Handshake, page: "Partnerships" },
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
    { name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
    { name: "Subscriptions", icon: DollarSign, page: "SubscriptionManagement" },
    { name: "Billing", icon: BarChart3, page: "BillingHistory" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  brand: [
    // ── Home ──
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "My Opportunities", icon: Zap, page: "BrandDashboard" },
    // ── Find Talent ──
    { name: "Talent Discovery", icon: Users, page: "TalentDiscovery" },
    { name: "Marketplace", icon: Zap, page: "Marketplace" },
    { name: "Match Engine", icon: Sparkles, page: "MatchEngine" },
    { name: "Contact Finder", icon: Users, page: "ContactFinder" },
    { name: "Demographic Targeting", icon: Users, page: "DemographicTargeting" },
    // ── Campaigns ──
    { name: "Campaign Briefs", icon: FileText, page: "CampaignBriefGenerator" },
    { name: "Outreach", icon: Mail, page: "Outreach" },
    { name: "Sequences", icon: GitBranch, page: "SequenceBuilder" },
    { name: "Warm Intro Network", icon: Network, page: "WarmIntroNetwork" },
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
    { name: "Talent Analytics", icon: BarChart3, page: "TalentAnalytics" },
    // ── Content ──
    { name: "Pitch Deck Builder", icon: Layers, page: "PitchDeckBuilder" },
    { name: "Deck Library", icon: FolderOpen, page: "DeckLibrary" },
    // ── Reports ──
    { name: "Analytics", icon: BarChart3, page: "Analytics" },
    { name: "Custom Reports", icon: Layers, page: "CustomReports" },
    { name: "Data Room", icon: Database, page: "BrandDataRoom" },
    // ── AI ──
    { name: "AI Command Center", icon: Command, page: "AICommandCenter" },
    { name: "AI Agents Hub", icon: Bot, page: "AIAgentsHub" },
    // ── Calendar ──
    { name: "Master Calendar", icon: Calendar, page: "MasterCalendar" },
    { name: "Culture Calendar", icon: Calendar, page: "CultureCalendar" },
    { name: "Event Management", icon: Calendar, page: "EventManagement" },
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

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const navigate = useNavigate();
  const { canAccess, isTrialActive, isTrialExpired, trialDaysLeft, isPaidPlan } = useFeatureGate();
  const { theme } = useTheme();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

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
    <div className={`flex flex-col h-full bg-[#0c0c0b] border-r border-white/[0.06] ${mobile ? "w-72" : collapsed ? "w-[72px]" : "w-64"} transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/5 ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
        {collapsed && !mobile ? (
          <img src="/brand/marks/10_mark_transparent.png" alt="D" style={{ height: 34 }} />
        ) : (
          <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 36 }} />
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
          const isLocked = !canAccess(item.page);
          return (
            <Link
              key={item.page}
              to={isLocked ? "#" : createPageUrl(item.page)}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  setLockedFeature(item.name);
                  setUpgradeModal(true);
                  return;
                }
                if (mobile) setMobileOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
                ${isActive
                  ? "text-white border-l-2 border-[#c4a24a] bg-[#c4a24a]/8 rounded-l-none"
                  : isLocked
                    ? "text-slate-600 hover:text-slate-500 hover:bg-white/3 cursor-pointer"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
                ${collapsed && !mobile ? "justify-center" : ""}
              `}
            >
              {isActive && !collapsed && !mobile && null}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-[#c4a24a]" : isLocked ? "text-slate-700" : "text-slate-400 group-hover:text-slate-300"}`} />
              {(!collapsed || mobile) && <span>{item.name}</span>}
              {(!collapsed || mobile) && isLocked && (
                <Lock size={12} style={{ color: "rgba(245,240,230,0.2)", marginLeft: "auto", flexShrink: 0 }} />
              )}
              {item.page === "Approvals" && pendingApprovals > 0 && (!collapsed || mobile) && !isLocked && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingApprovals > 9 ? "9+" : pendingApprovals}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher (expanded only) */}
      {(!collapsed || mobile) && (
        <div className="px-4 pb-2">
          <ThemeSwitcher compact />
        </div>
      )}

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
    <div className="flex h-screen overflow-hidden bg-background">
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background text-foreground">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 gap-4 bg-card border-b border-border" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground flex items-center justify-center w-10 h-10 rounded-md -ml-1" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="text-lg font-semibold hidden sm:block text-foreground">{currentPageName}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <GlobalSearch />
            <NotificationDropdown />
          </div>
        </header>
        {/* Gold gradient accent stripe */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #b3922e, #e07b18, #b3922e)", opacity: 0.25, flexShrink: 0 }} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            {isTrialActive && !isPaidPlan && (
              <div style={{
                background: "linear-gradient(135deg, rgba(196,162,74,0.08), rgba(224,123,24,0.08))",
                border: "0.5px solid rgba(196,162,74,0.2)",
                borderRadius: 8, padding: "0.6rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "0.5rem",
                margin: "0 0 1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Crown size={14} style={{ color: "#c4a24a" }} />
                  <span className="text-sm text-foreground">
                    <span style={{ color: "#b3922e", fontWeight: 600 }}>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</span> left on your free trial
                  </span>
                </div>
                <button onClick={() => navigate("/SubscriptionManagement")} style={{
                  background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807",
                  border: "none", borderRadius: 5, padding: "0.35rem 0.85rem",
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}>Upgrade now</button>
              </div>
            )}
            {isTrialExpired && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "0.5px solid rgba(239,68,68,0.2)",
                borderRadius: 8, padding: "0.6rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "0.5rem",
                margin: "0 0 1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Lock size={14} style={{ color: "#ef4444" }} />
                  <span className="text-sm text-foreground">
                    Your trial has expired. Premium features are now locked.
                  </span>
                </div>
                <button onClick={() => navigate("/SubscriptionManagement")} style={{
                  background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807",
                  border: "none", borderRadius: 5, padding: "0.35rem 0.85rem",
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}>Upgrade now</button>
              </div>
            )}
            <FeatureGate locked={!canAccess(currentPageName)} featureName={currentPageName?.replace(/([A-Z])/g, ' $1').trim()}>
              {children}
            </FeatureGate>
          </div>
        </main>
      </div>
      <UpgradeModal isOpen={upgradeModal} onClose={() => setUpgradeModal(false)} featureName={lockedFeature} />
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Menu, Crown, Lock,
} from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/AuthContext";
import UpgradeModal from "@/components/UpgradeModal";
import FeatureGate from "@/components/FeatureGate";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import GlobalSearch from "@/components/search/GlobalSearch";
import { WhatsNewButton } from "@/components/WhatsNew";
import { Badge } from "@/components/ui/badge";
import { roleNavItems } from "@/config/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const globalSearchRef = useRef(null);
  const { logout: authLogout } = useAuth();

  const { data: user = null } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: pendingApprovalItems } = useQuery({
    queryKey: ['approvals-pending-count'],
    queryFn: () => base44.entities.ApprovalItem.filter({ status: "pending" }),
    staleTime: 60_000,
  });
  const pendingApprovals = pendingApprovalItems?.length || 0;

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Cmd+K (Mac) / Ctrl+K (Windows) focuses GlobalSearch
  useEffect(() => {
    const handleSearchShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        globalSearchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleSearchShortcut);
    return () => document.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const { canAccess, getRequiredTier, isTrialActive, isTrialExpired, trialDaysLeft, isPaidPlan } = useFeatureGate();
  const { theme } = useTheme();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [lockedTier, setLockedTier] = useState(null);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(
    () => sessionStorage.getItem("trialBannerDismissed") === "1"
  );
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(
    () => sessionStorage.getItem("expiredBannerDismissed") === "1"
  );

  const dismissTrialBanner = () => {
    sessionStorage.setItem("trialBannerDismissed", "1");
    setTrialBannerDismissed(true);
  };
  const dismissExpiredBanner = () => {
    sessionStorage.setItem("expiredBannerDismissed", "1");
    setExpiredBannerDismissed(true);
  };


  if (currentPageName === "Onboarding") {
    return <>{children}</>;
  }

  const userRole = user?.role || "brand";
  const navItems = roleNavItems[userRole] || roleNavItems.brand;

  const sharedSidebarProps = {
    collapsed,
    setCollapsed,
    currentPageName,
    navItems,
    userRole,
    user,
    canAccess,
    getRequiredTier,
    setLockedFeature,
    setLockedTier,
    setUpgradeModal,
    pendingApprovals,
    mobileOpen,
    setMobileOpen,
    globalSearchRef,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Tablet sidebar (md-lg): collapsed icon rail */}
      <div className="hidden md:flex lg:hidden relative flex-shrink-0 w-[72px]">
        <Sidebar {...sharedSidebarProps} forceCollapsed />
      </div>

      {/* Desktop sidebar (lg+): full width, collapsible */}
      <div className="hidden lg:flex relative flex-shrink-0">
        <Sidebar {...sharedSidebarProps} />
      </div>

      {/* Mobile overlay (below md) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar {...sharedSidebarProps} mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background text-foreground">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 gap-4 bg-card border-b border-border"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground flex items-center justify-center w-10 h-10 rounded-md -ml-1"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="text-lg font-semibold hidden sm:block text-foreground">
              {navItems.find((n) => n.page === currentPageName)?.name
                || currentPageName
                  ?.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                  .trim()}
            </h1>
            {userRole === "manager" && (
              <Badge
                variant="outline"
                className="bg-violet-50 text-violet-600 border-violet-200 text-[10px] ml-2 hidden sm:flex"
              >
                Managing Talent
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <GlobalSearch ref={globalSearchRef} />
            <WhatsNewButton />
            <NotificationDropdown />
          </div>
        </header>

        {/* Gold gradient accent stripe */}
        <div
          style={{
            height: 2,
            background: "linear-gradient(90deg, #b3922e, #e07b18, #b3922e)",
            opacity: 0.25,
            flexShrink: 0,
          }}
        />

        {/* Trial / expired banners — sticky so they stay visible while scrolling */}
        {isTrialActive && !isPaidPlan && !trialBannerDismissed && (
          <div
            style={{
              position: "sticky", top: 0, zIndex: 40,
              background: "linear-gradient(135deg, rgba(196,162,74,0.08), rgba(224,123,24,0.08))",
              border: "0.5px solid rgba(196,162,74,0.2)",
              borderBottom: "0.5px solid rgba(196,162,74,0.2)",
              padding: "0.6rem 1rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Crown size={14} style={{ color: "#c4a24a" }} />
              <span className="text-sm text-foreground">
                <span style={{ color: "#b3922e", fontWeight: 600 }}>
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}
                </span>{" "}
                left on your free trial
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => navigate("/SubscriptionManagement")}
                style={{
                  background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807",
                  border: "none", borderRadius: 5, padding: "0.35rem 0.85rem",
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Upgrade now
              </button>
              <button
                onClick={dismissTrialBanner}
                aria-label="Dismiss trial banner"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "0.25rem",
                  color: "rgba(196,162,74,0.6)", fontSize: "1rem", lineHeight: 1,
                  display: "flex", alignItems: "center",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {isTrialExpired && !expiredBannerDismissed && (
          <div
            style={{
              position: "sticky", top: 0, zIndex: 40,
              background: "rgba(239,68,68,0.08)",
              border: "0.5px solid rgba(239,68,68,0.2)",
              borderBottom: "0.5px solid rgba(239,68,68,0.2)",
              padding: "0.6rem 1rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Lock size={14} style={{ color: "#ef4444" }} />
              <span className="text-sm text-foreground">
                Your trial has expired. Premium features are now locked.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => navigate("/SubscriptionManagement")}
                style={{
                  background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807",
                  border: "none", borderRadius: 5, padding: "0.35rem 0.85rem",
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Upgrade now
              </button>
              <button
                onClick={dismissExpiredBanner}
                aria-label="Dismiss expired banner"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "0.25rem",
                  color: "rgba(239,68,68,0.6)", fontSize: "1rem", lineHeight: 1,
                  display: "flex", alignItems: "center",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            <FeatureGate
              locked={!canAccess(currentPageName)}
              featureName={currentPageName
                ?.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .trim()}
            >
              {children}
            </FeatureGate>
          </div>
        </main>
      </div>

      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        featureName={lockedFeature}
        requiredTier={lockedTier}
      />
    </div>
  );
}

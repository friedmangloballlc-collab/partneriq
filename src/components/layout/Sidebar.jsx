import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft, ChevronRight, LogOut, Settings, X, Lock,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";

const roleColors = {
  admin: "bg-red-500/10 text-red-400 border-red-500/20",
  brand: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  talent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  agency: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  manager: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const Sidebar = React.memo(function Sidebar({
  mobile = false,
  forceCollapsed = false,
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
}) {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const effectiveCollapsed = forceCollapsed || collapsed;
  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div
      className={`flex flex-col h-full bg-[#0c0c0b] border-r border-white/[0.06] ${
        mobile ? "w-72" : effectiveCollapsed ? "w-[72px]" : "w-64"
      } transition-all duration-300`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-white/5 ${
          effectiveCollapsed && !mobile ? "justify-center" : "gap-3"
        }`}
      >
        {effectiveCollapsed && !mobile ? (
          <img
            src="/brand/marks/10_mark_transparent.png"
            alt="D"
            style={{ height: 34 }}
            width={34}
            height={34}
            fetchPriority="high"
          />
        ) : (
          <img
            src="/brand/logos/04_logo_transparent_ondark.png"
            alt="DealStage"
            style={{ height: 36 }}
            width={140}
            height={36}
            fetchPriority="high"
          />
        )}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!effectiveCollapsed || mobile) && (
        <div className="px-4 py-3 space-y-1">
          <Badge
            variant="outline"
            className={`${roleColors[userRole]} text-[10px] uppercase tracking-wider w-full justify-center py-1`}
          >
            {userRole === "manager" ? "Manager Portal" : `${userRole} Portal`}
          </Badge>
          {userRole === "manager" && (
            <p className="text-[10px] text-muted-foreground text-center truncate">Managing talent</p>
          )}
        </div>
      )}

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = currentPageName === item.page;
          const Icon = item.icon;
          const isLocked = !canAccess(item.page);

          const navItemClass = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
            ${
              isActive
                ? "text-white border-l-2 border-[#c4a24a] bg-[#c4a24a]/8 rounded-l-none"
                : isLocked
                ? "text-slate-600 hover:text-slate-500 hover:bg-white/3 cursor-pointer"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }
            ${effectiveCollapsed && !mobile ? "justify-center" : ""}
          `;

          const navItemContent = (
            <>
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${
                  isActive
                    ? "text-[#c4a24a]"
                    : isLocked
                    ? "text-slate-700"
                    : "text-slate-400 group-hover:text-slate-300"
                }`}
              />
              {(!effectiveCollapsed || mobile) && <span>{item.name}</span>}
              {(!effectiveCollapsed || mobile) && isLocked && (
                <Lock
                  size={12}
                  style={{ color: "rgba(245,240,230,0.2)", marginLeft: "auto", flexShrink: 0 }}
                />
              )}
              {item.page === "Approvals" &&
                pendingApprovals > 0 &&
                (!effectiveCollapsed || mobile) &&
                !isLocked && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingApprovals > 9 ? "9+" : pendingApprovals}
                  </span>
                )}
            </>
          );

          return (
            <React.Fragment key={item.page}>
              {item.section && idx > 0 && (
                effectiveCollapsed && !mobile ? (
                  <div className="border-t border-white/5 my-1.5" />
                ) : (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 pt-4 pb-1 select-none">
                    {item.section}
                  </p>
                )
              )}
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setLockedFeature(item.name);
                    setLockedTier(getRequiredTier(item.page));
                    setUpgradeModal(true);
                  }}
                  className={navItemClass}
                >
                  {navItemContent}
                </button>
              ) : (
                <Link
                  to={createPageUrl(item.page)}
                  onClick={() => {
                    if (mobile) setMobileOpen(false);
                  }}
                  onMouseEnter={() => {
                    import(`../../pages/${item.page}.jsx`).catch(() => {});
                  }}
                  className={navItemClass}
                >
                  {navItemContent}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Theme switcher (expanded only) */}
      {(!effectiveCollapsed || mobile) && (
        <div className="px-4 pb-2">
          <ThemeSwitcher compact />
        </div>
      )}

      {/* User section */}
      <div
        className={`p-3 border-t border-white/5 ${
          effectiveCollapsed && !mobile ? "flex justify-center" : ""
        }`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="User menu"
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors ${
                effectiveCollapsed && !mobile ? "justify-center px-0" : ""
              }`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {(!effectiveCollapsed || mobile) && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate(createPageUrl("Settings"))}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => authLogout()}
              className="text-red-500"
              aria-label="Sign out of your account"
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => {
            if (!forceCollapsed) setCollapsed(!collapsed);
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-50"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
});

export default Sidebar;

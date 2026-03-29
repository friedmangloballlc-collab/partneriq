import React, { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import {
  Bell,
  BellRing,
  RefreshCw,
  CheckCheck,
  AlertTriangle,
  Shield,
  Scale,
  Lightbulb,
  Heart,
  DollarSign,
  TrendingUp,
  Handshake,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  Settings,
  Filter,
  Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const DISMISSED_KEY = "partneriq_dismissed_alerts";
const PREFERENCES_KEY = "partneriq_alert_preferences";
const READ_KEY = "partneriq_read_alerts";

const CATEGORIES = [
  { value: "all", label: "All Alerts", icon: Bell },
  { value: "deal_alert", label: "Deals", icon: Handshake },
  { value: "safety_alert", label: "Safety", icon: Shield },
  { value: "compliance_alert", label: "Compliance", icon: Scale },
  { value: "opportunity_alert", label: "Opportunities", icon: Lightbulb },
  { value: "relationship_alert", label: "Relationships", icon: Heart },
  { value: "financial_alert", label: "Financial", icon: DollarSign },
  { value: "trend_alert", label: "Trends", icon: TrendingUp },
];

const SEVERITY_CONFIG = {
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    cardBorder: "border-l-4 border-l-red-500",
    animate: true,
    label: "Critical",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    cardBorder: "border-l-4 border-l-orange-500",
    animate: false,
    label: "High",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    cardBorder: "border-l-4 border-l-yellow-500",
    animate: false,
    label: "Medium",
  },
  low: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    cardBorder: "border-l-4 border-l-blue-500",
    animate: false,
    label: "Low",
  },
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

function getCategoryIcon(category) {
  const found = CATEGORIES.find((c) => c.value === category);
  return found ? found.icon : Bell;
}

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [dismissedIds, setDismissedIds] = useState(() => loadFromStorage(DISMISSED_KEY, []));
  const [readIds, setReadIds] = useState(() => loadFromStorage(READ_KEY, []));
  const [showDigest, setShowDigest] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(() =>
    loadFromStorage(PREFERENCES_KEY, {
      deal_alert: true,
      safety_alert: true,
      compliance_alert: true,
      opportunity_alert: true,
      relationship_alert: true,
      financial_alert: true,
      trend_alert: true,
    })
  );

  useEffect(() => saveToStorage(DISMISSED_KEY, dismissedIds), [dismissedIds]);
  useEffect(() => saveToStorage(READ_KEY, readIds), [readIds]);
  useEffect(() => saveToStorage(PREFERENCES_KEY, preferences), [preferences]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke("generateSmartAlerts");
      if (response?.success && response.notifications) {
        setNotifications(response.notifications);
      } else {
        setError(response?.error || "Failed to generate alerts.");
      }
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const alerts = notifications?.alerts || [];
  const summary = notifications?.summary || { total_alerts: 0, critical_count: 0, high_count: 0, action_required_count: 0 };
  const dailyDigest = notifications?.daily_digest || "";
  const weeklyTrends = notifications?.weekly_trends || [];

  // Filter out dismissed and preference-hidden alerts
  const visibleAlerts = useMemo(() => {
    return alerts
      .filter((a) => !dismissedIds.includes(a.id))
      .filter((a) => preferences[a.category] !== false)
      .filter((a) => activeCategory === "all" || a.category === activeCategory)
      .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  }, [alerts, dismissedIds, preferences, activeCategory]);

  const unreadCount = useMemo(() => {
    return alerts.filter((a) => !dismissedIds.includes(a.id) && !readIds.includes(a.id)).length;
  }, [alerts, dismissedIds, readIds]);

  const dismissAlert = useCallback((id) => {
    setDismissedIds((prev) => [...prev, id]);
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = alerts.map((a) => a.id);
    setReadIds((prev) => [...new Set([...prev, ...allIds])]);
  }, [alerts]);

  const togglePreference = useCallback((category) => {
    setPreferences((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  // Group alerts by severity for display
  const groupedAlerts = useMemo(() => {
    const groups = {};
    SEVERITY_ORDER.forEach((sev) => {
      const items = visibleAlerts.filter((a) => a.severity === sev);
      if (items.length > 0) groups[sev] = items;
    });
    return groups;
  }, [visibleAlerts]);

  return (
    <div className="space-y-6">
      {/* Header with bell icon and summary */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              {unreadCount > 0 ? (
                <BellRing className="w-6 h-6 animate-[wiggle_1s_ease-in-out_infinite]" />
              ) : (
                <Bell className="w-6 h-6" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Smart Notifications</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                AI-powered alerts across your entire portfolio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
              className="rounded-xl gap-1.5"
            >
              <Settings className="w-4 h-4" />
              Preferences
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </Button>
            <Button
              onClick={fetchAlerts}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-md gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Analyzing..." : "Refresh Alerts"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      {notifications && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{summary.total_alerts}</p>
              <p className="text-xs text-gray-500 mt-1">Total Alerts</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-red-100 bg-red-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.critical_count}</p>
              <p className="text-xs text-red-500 mt-1">Critical</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-orange-100 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{summary.high_count}</p>
              <p className="text-xs text-orange-500 mt-1">High Priority</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-amber-100 bg-amber-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{summary.action_required_count}</p>
              <p className="text-xs text-amber-500 mt-1">Action Required</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Preferences */}
      {showPreferences && (
        <Card className="rounded-2xl shadow-md border border-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg font-semibold text-gray-900">Alert Preferences</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Toggle which alert categories you want to see</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.filter((c) => c.value !== "all").map((cat) => {
                const Icon = cat.icon;
                const enabled = preferences[cat.value] !== false;
                return (
                  <div
                    key={cat.value}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">{cat.label}</span>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => togglePreference(cat.value)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Digest */}
      {dailyDigest && (
        <Card className="rounded-2xl shadow-md border border-gray-100">
          <CardHeader
            className="pb-2 cursor-pointer"
            onClick={() => setShowDigest(!showDigest)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                  <Eye className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Daily Digest</CardTitle>
              </div>
              {showDigest ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </CardHeader>
          {showDigest && (
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {dailyDigest}
              </div>
              {weeklyTrends.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    Weekly Trends
                  </h4>
                  <ul className="space-y-1.5">
                    {weeklyTrends.map((trend, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.value;
          const count =
            cat.value === "all"
              ? alerts.filter((a) => !dismissedIds.includes(a.id) && preferences[a.category] !== false).length
              : alerts.filter((a) => a.category === cat.value && !dismissedIds.includes(a.id) && preferences[a.category] !== false).length;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {count > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && !notifications && (
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Analyzing your portfolio for smart alerts...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="rounded-2xl shadow-md border border-red-100 bg-red-50">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchAlerts} className="mt-3 rounded-xl">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert Feed Grouped by Severity */}
      {notifications && !loading && visibleAlerts.length === 0 && (
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="py-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No alerts to show</p>
            <p className="text-xs text-gray-400 mt-1">
              {dismissedIds.length > 0
                ? "Some alerts have been dismissed. Refresh to get new ones."
                : "All clear! Check back later for new alerts."}
            </p>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedAlerts).map(([severity, severityAlerts]) => {
        const config = SEVERITY_CONFIG[severity];
        return (
          <div key={severity} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {config.label} ({severityAlerts.length})
              </h3>
            </div>
            {severityAlerts.map((alert) => {
              const CategoryIcon = getCategoryIcon(alert.category);
              const isRead = readIds.includes(alert.id);
              return (
                <Card
                  key={alert.id}
                  className={`rounded-xl shadow-sm ${config.cardBorder} transition-all hover:shadow-md ${
                    config.animate ? "animate-pulse-subtle" : ""
                  } ${isRead ? "opacity-75" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            severity === "critical"
                              ? "bg-red-100 text-red-600"
                              : severity === "high"
                              ? "bg-orange-100 text-orange-600"
                              : severity === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                            <Badge className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                              {config.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500">
                              {CATEGORIES.find((c) => c.value === alert.category)?.label || alert.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          {alert.affected_entity && (
                            <p className="text-xs text-gray-400 mb-2">
                              Affects: <span className="font-medium text-gray-600">{alert.affected_entity}</span>
                            </p>
                          )}
                          {alert.recommended_action && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium">
                                Recommended: {alert.recommended_action}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {alert.action_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600"
                            onClick={() => window.location.href = alert.action_url}
                            title="Go to action"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => dismissAlert(alert.id)}
                          title="Dismiss alert"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {alert.expires_at && (
                      <p className="text-[10px] text-gray-400 mt-2 text-right">
                        Expires: {new Date(alert.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}

      {/* Custom CSS for critical alert animation */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        }
      `}</style>
    </div>
  );
}

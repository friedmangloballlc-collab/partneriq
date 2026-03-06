import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Instagram,
  Youtube,
  Twitter,
  Music2,
  RefreshCw,
  Link,
  LinkOff,
  Eye,
  EyeOff,
  Save,
  TrendingUp,
  Users,
  Heart,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "partneriq_social_api_keys";
const SYNC_HISTORY_KEY = "partneriq_social_sync_history";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-purple-500 via-pink-500 to-orange-400",
    bgColor: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10",
    borderColor: "border-pink-300",
    badgeColor: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white",
    textColor: "text-pink-600",
    actions: ["profile_metrics", "content_analysis", "audience_demographics", "hashtag_trends"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    color: "from-gray-900 to-gray-800",
    bgColor: "bg-gray-900/5",
    borderColor: "border-gray-400",
    badgeColor: "bg-gray-900 text-white",
    textColor: "text-gray-900",
    actions: ["profile_metrics", "content_analysis", "trending_sounds", "audience_demographics"],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "from-red-600 to-red-500",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-300",
    badgeColor: "bg-red-600 text-white",
    textColor: "text-red-600",
    actions: ["channel_metrics", "content_analysis", "audience_demographics", "trending_topics"],
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    color: "from-blue-500 to-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-300",
    badgeColor: "bg-blue-500 text-white",
    textColor: "text-blue-600",
    actions: ["profile_metrics", "content_analysis", "trending_topics", "audience_demographics"],
  },
];

function loadApiKeys() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveApiKeys(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function loadSyncHistory() {
  try {
    const stored = localStorage.getItem(SYNC_HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveSyncHistory(history) {
  localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
}

function formatTimestamp(ts) {
  if (!ts) return "Never";
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatActionLabel(action) {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatNumber(num) {
  if (num == null) return "N/A";
  if (typeof num === "string") return num;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function QuickStats({ data, platform }) {
  if (!data) return null;

  const stats = [];
  const d = data.data || data;

  if (platform === "instagram" || platform === "twitter") {
    if (d.followers_count != null) stats.push({ label: "Followers", value: formatNumber(d.followers_count), icon: Users });
    if (d.engagement_rate) stats.push({ label: "Engagement", value: d.engagement_rate, icon: Heart });
    if (d.follower_growth_30d) stats.push({ label: "30d Growth", value: d.follower_growth_30d, icon: TrendingUp });
  } else if (platform === "tiktok") {
    if (d.follower_count != null) stats.push({ label: "Followers", value: formatNumber(d.follower_count), icon: Users });
    if (d.engagement_rate) stats.push({ label: "Engagement", value: d.engagement_rate, icon: Heart });
    if (d.follower_growth_30d) stats.push({ label: "30d Growth", value: d.follower_growth_30d, icon: TrendingUp });
  } else if (platform === "youtube") {
    if (d.subscriber_count != null) stats.push({ label: "Subscribers", value: formatNumber(d.subscriber_count), icon: Users });
    if (d.engagement_rate) stats.push({ label: "Engagement", value: d.engagement_rate, icon: Heart });
    if (d.subscriber_growth_30d) stats.push({ label: "30d Growth", value: d.subscriber_growth_30d, icon: TrendingUp });
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {stats.map((s, i) => (
        <div key={i} className="text-center p-2 bg-white/60 rounded-lg border border-gray-100">
          <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-gray-400" />
          <div className="text-sm font-semibold text-gray-800">{s.value}</div>
          <div className="text-[10px] text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function DataPreview({ data, platform, action }) {
  if (!data) return null;
  const d = data.data || data;

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {formatActionLabel(action)} Data
      </h4>
      {data.source === "ai_generated" && (
        <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          AI-generated synthetic data. Connect API key for live data.
        </div>
      )}
      <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
        <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-mono">
          {JSON.stringify(d, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function SocialMediaIntegrations() {
  const [apiKeys, setApiKeys] = useState(loadApiKeys);
  const [connected, setConnected] = useState({});
  const [keyInputs, setKeyInputs] = useState({});
  const [showKey, setShowKey] = useState({});
  const [loading, setLoading] = useState({});
  const [syncHistory, setSyncHistory] = useState(loadSyncHistory);
  const [fetchedData, setFetchedData] = useState({});
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [error, setError] = useState({});

  // Initialize connection state from stored keys
  useEffect(() => {
    const conns = {};
    Object.keys(apiKeys).forEach((pid) => {
      if (apiKeys[pid]) conns[pid] = true;
    });
    setConnected(conns);
  }, []);

  const handleSaveKey = useCallback(
    (platformId) => {
      const key = keyInputs[platformId]?.trim();
      if (!key) return;
      const newKeys = { ...apiKeys, [platformId]: key };
      setApiKeys(newKeys);
      saveApiKeys(newKeys);
      setConnected((prev) => ({ ...prev, [platformId]: true }));
      setKeyInputs((prev) => ({ ...prev, [platformId]: "" }));
    },
    [apiKeys, keyInputs]
  );

  const handleDisconnect = useCallback(
    (platformId) => {
      const newKeys = { ...apiKeys };
      delete newKeys[platformId];
      setApiKeys(newKeys);
      saveApiKeys(newKeys);
      setConnected((prev) => ({ ...prev, [platformId]: false }));
      setFetchedData((prev) => {
        const nd = { ...prev };
        delete nd[platformId];
        return nd;
      });
    },
    [apiKeys]
  );

  const fetchPlatformData = useCallback(
    async (platformId, action, params = {}) => {
      const loadKey = `${platformId}_${action}`;
      setLoading((prev) => ({ ...prev, [loadKey]: true }));
      setError((prev) => ({ ...prev, [loadKey]: null }));

      try {
        const result = await base44.functions.fetchSocialMediaData({
          platform: platformId,
          action,
          params,
        });

        setFetchedData((prev) => ({
          ...prev,
          [platformId]: {
            ...(prev[platformId] || {}),
            [action]: result,
          },
        }));

        const newHistory = {
          ...syncHistory,
          [platformId]: {
            ...(syncHistory[platformId] || {}),
            [action]: new Date().toISOString(),
          },
        };
        setSyncHistory(newHistory);
        saveSyncHistory(newHistory);
      } catch (err) {
        setError((prev) => ({
          ...prev,
          [loadKey]: err.message || "Failed to fetch data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [loadKey]: false }));
      }
    },
    [syncHistory]
  );

  const fetchLatestData = useCallback(
    async (platformId) => {
      const platform = PLATFORMS.find((p) => p.id === platformId);
      if (!platform) return;
      // Fetch the primary action (first in the list)
      await fetchPlatformData(platformId, platform.actions[0]);
    },
    [fetchPlatformData]
  );

  const syncAllPlatforms = useCallback(async () => {
    setSyncingAll(true);
    const promises = PLATFORMS.map((p) => fetchPlatformData(p.id, p.actions[0]));
    await Promise.allSettled(promises);
    setSyncingAll(false);
  }, [fetchPlatformData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Social Media Integrations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect and monitor social media platforms for your talent roster
          </p>
        </div>
        <Button
          onClick={syncAllPlatforms}
          disabled={syncingAll}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          {syncingAll ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync All Platforms
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isConnected = !!connected[platform.id];
          const isExpanded = expandedPlatform === platform.id;
          const primaryAction = platform.actions[0];
          const primaryData = fetchedData[platform.id]?.[primaryAction];
          const primaryLoading = loading[`${platform.id}_${primaryAction}`];
          const lastSync = syncHistory[platform.id]?.[primaryAction];

          return (
            <Card
              key={platform.id}
              className={`overflow-hidden transition-all duration-200 ${platform.bgColor} ${
                isConnected ? platform.borderColor + " border-2" : "border border-gray-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isConnected ? (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0 px-2 py-0">
                            <Link className="w-2.5 h-2.5 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-gray-400 px-2 py-0">
                            <LinkOff className="w-2.5 h-2.5 mr-1" />
                            Not Connected
                          </Badge>
                        )}
                        {lastSync && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimestamp(lastSync)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Quick Stats Preview */}
                <QuickStats data={primaryData} platform={platform.id} />

                {/* Fetch Latest Button */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 text-xs ${platform.textColor} border-current/20 hover:bg-current/5`}
                    onClick={() => fetchLatestData(platform.id)}
                    disabled={primaryLoading}
                  >
                    {primaryLoading ? (
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <BarChart3 className="w-3 h-3 mr-1.5" />
                    )}
                    Fetch Latest Data
                  </Button>
                  {isConnected && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Disconnect
                    </Button>
                  )}
                </div>

                {/* Error display */}
                {error[`${platform.id}_${primaryAction}`] && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {error[`${platform.id}_${primaryAction}`]}
                  </div>
                )}

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* API Key Input */}
                    <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKey[platform.id] ? "text" : "password"}
                            placeholder={isConnected ? "********" : "Enter API key..."}
                            value={keyInputs[platform.id] || ""}
                            onChange={(e) =>
                              setKeyInputs((prev) => ({ ...prev, [platform.id]: e.target.value }))
                            }
                            className="w-full text-xs border rounded-md px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowKey((prev) => ({ ...prev, [platform.id]: !prev[platform.id] }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showKey[platform.id] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSaveKey(platform.id)}
                          disabled={!keyInputs[platform.id]?.trim()}
                          className="text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Stored locally. Without a key, AI-generated data will be used.
                      </p>
                    </div>

                    {/* Actions Grid */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Available Actions
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {platform.actions.map((action) => {
                          const actionLoading = loading[`${platform.id}_${action}`];
                          const actionData = fetchedData[platform.id]?.[action];
                          const actionSync = syncHistory[platform.id]?.[action];
                          const actionError = error[`${platform.id}_${action}`];

                          return (
                            <button
                              key={action}
                              onClick={() => fetchPlatformData(platform.id, action)}
                              disabled={actionLoading}
                              className={`text-left p-2.5 rounded-lg border transition-all hover:shadow-sm ${
                                actionData
                                  ? "bg-emerald-50/50 border-emerald-200"
                                  : actionError
                                  ? "bg-red-50/50 border-red-200"
                                  : "bg-white/60 border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700">
                                  {formatActionLabel(action)}
                                </span>
                                {actionLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                ) : actionData ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : actionError ? (
                                  <AlertCircle className="w-3 h-3 text-red-400" />
                                ) : null}
                              </div>
                              {actionSync && (
                                <span className="text-[9px] text-gray-400 mt-0.5 block">
                                  {formatTimestamp(actionSync)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Preview for each action that has data */}
                    {platform.actions.map((action) =>
                      fetchedData[platform.id]?.[action] ? (
                        <DataPreview
                          key={action}
                          data={fetchedData[platform.id][action]}
                          platform={platform.id}
                          action={action}
                        />
                      ) : null
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

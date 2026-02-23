import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, Link2, RefreshCw, AlertCircle, Zap, Users, Eye,
  TrendingUp, Shield, BarChart3, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000) return (n/1000).toFixed(1)+"K";
  return String(n);
}

const PLATFORMS = [
  { id: "youtube",   name: "YouTube",   grad: "from-red-500 to-red-600",        emoji: "▶",  scope: "read:channel,read:analytics" },
  { id: "tiktok",    name: "TikTok",    grad: "from-slate-800 to-slate-600",    emoji: "♪",  scope: "read:profile,read:analytics" },
  { id: "instagram", name: "Instagram", grad: "from-pink-500 to-purple-500",    emoji: "📸", scope: "read:profile,read:media" },
  { id: "twitch",    name: "Twitch",    grad: "from-purple-600 to-indigo-700",  emoji: "🎮", scope: "read:channel,read:analytics" },
  { id: "twitter",   name: "Twitter / X",grad:"from-sky-400 to-sky-600",       emoji: "𝕏",  scope: "tweet.read,users.read" },
  { id: "linkedin",  name: "LinkedIn",  grad: "from-blue-600 to-blue-700",      emoji: "in", scope: "r_liteprofile,r_basicprofile" },
  { id: "facebook",  name: "Facebook",  grad: "from-blue-500 to-blue-700",      emoji: "f",  scope: "read:pages,read:insights" },
  { id: "snapchat",  name: "Snapchat",  grad: "from-yellow-400 to-yellow-500",  emoji: "👻", scope: "read:profile,read:analytics" },
  { id: "pinterest", name: "Pinterest", grad: "from-rose-500 to-red-600",       emoji: "P",  scope: "read:boards,read:analytics" },
];

// Seeded mock stats per platform
function mockStats(platformId, seed) {
  const base = (seed * 31337) % 900000 + 10000;
  return {
    followers: base,
    engagement: ((seed * 13) % 120 + 20) / 10,
    views: Math.round(base * 3.5),
    posts: (seed * 7) % 300 + 50,
    lastSync: "2 hours ago",
  };
}

function OAuthModal({ platform, onConfirm, onCancel }) {
  const [step, setStep] = useState("prompt"); // prompt | authorizing | done
  const [progress, setProgress] = useState(0);

  const handleAuthorize = async () => {
    setStep("authorizing");
    // Simulate OAuth steps
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 120));
      setProgress(i);
    }
    setStep("done");
    await new Promise(r => setTimeout(r, 600));
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${platform.grad} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                {platform.emoji}
              </div>
              <div>
                <p className="font-bold text-lg">{platform.name}</p>
                <p className="text-white/70 text-xs">Powered by Phyllo OAuth</p>
              </div>
            </div>
            {step === "prompt" && (
              <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {step === "prompt" && (
            <>
              <p className="text-sm font-semibold text-slate-800 mb-1">Connect your {platform.name} account</p>
              <p className="text-xs text-slate-500 mb-4">PartnerIQ will request read-only access to pull your stats. We never post or modify your account.</p>
              <div className="space-y-2 mb-5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Requested permissions</p>
                {platform.scope.split(",").map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-slate-600">{s.trim().replace(/_/g," ").replace("read:","")} (read-only)</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs h-9" onClick={onCancel}>Cancel</Button>
                <Button className={`flex-1 text-xs h-9 bg-gradient-to-r ${platform.grad} text-white border-0 hover:opacity-90`} onClick={handleAuthorize}>
                  Authorize with {platform.name}
                </Button>
              </div>
            </>
          )}

          {step === "authorizing" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Connecting to {platform.name}...</p>
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-slate-400 mt-2">
                {progress < 30 ? "Redirecting to OAuth provider..." : progress < 60 ? "Verifying credentials..." : progress < 90 ? "Syncing account data..." : "Finalizing..."}
              </p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Connected!</p>
              <p className="text-xs text-slate-400 mt-1">Your {platform.name} stats are now syncing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlatformCard({ platform, connected, onConnect, onDisconnect, onSync, syncing }) {
  const stats = connected ? mockStats(platform.id, platform.id.charCodeAt(0) + platform.id.length) : null;
  return (
    <Card className={`border-2 transition-all duration-200 ${connected ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.grad} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
            {platform.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-800">{platform.name}</p>
              {connected && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Live</Badge>}
            </div>

            {connected && stats ? (
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                {[
                  { label: "Followers", value: fmt(stats.followers), icon: Users },
                  { label: "Eng Rate",  value: `${stats.engagement}%`, icon: TrendingUp },
                  { label: "Avg Views", value: fmt(stats.views), icon: Eye },
                  { label: "Posts",     value: stats.posts, icon: BarChart3 },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="text-center">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{s.value}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Not connected · Connect to pull live stats</p>
            )}

            {connected && (
              <p className="text-[10px] text-slate-400 mt-1.5">Last synced {stats?.lastSync}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
            {connected ? (
              <>
                <button onClick={() => onSync(platform.id)} disabled={syncing === platform.id} className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  <RefreshCw className={`w-3 h-3 ${syncing === platform.id ? "animate-spin" : ""}`} />
                  {syncing === platform.id ? "Syncing..." : "Sync"}
                </button>
                <button onClick={() => onDisconnect(platform.id)} className="text-[11px] text-slate-400 hover:text-red-500 transition-colors">
                  Disconnect
                </button>
              </>
            ) : (
              <Button
                size="sm"
                className={`h-8 text-xs bg-gradient-to-r ${platform.grad} text-white border-0 hover:opacity-90`}
                onClick={() => onConnect(platform.id)}
              >
                <Link2 className="w-3 h-3 mr-1.5" /> Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConnectAccounts() {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState({});
  const [oauthPlatform, setOauthPlatform] = useState(null);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Pre-connect primary platform if set
      if (u?.primary_platform) setConnected({ [u.primary_platform]: true });
    }).catch(() => {});
  }, []);

  const handleConnect = (platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    setOauthPlatform(platform);
  };

  const handleOAuthConfirm = () => {
    setConnected(prev => ({ ...prev, [oauthPlatform.id]: true }));
    setOauthPlatform(null);
  };

  const handleDisconnect = (platformId) => {
    setConnected(prev => { const n = {...prev}; delete n[platformId]; return n; });
  };

  const handleSync = async (platformId) => {
    setSyncing(platformId);
    await new Promise(r => setTimeout(r, 1400));
    setSyncing(null);
  };

  const connectedCount = Object.values(connected).filter(Boolean).length;
  const completionPct = Math.round((connectedCount / PLATFORMS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connect Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">Link your social accounts to pull live metrics and unlock brand partnership opportunities.</p>
      </div>

      {/* Progress tracker */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-indigo-900">{connectedCount} of {PLATFORMS.length} platforms connected</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {connectedCount === 0 && "Connect at least one account to activate your profile."}
              {connectedCount === 1 && "Great start! Connect more accounts to boost your discoverability."}
              {connectedCount >= 2 && connectedCount < 5 && "You're building a strong multi-platform presence!"}
              {connectedCount >= 5 && "Excellent! You have a robust cross-platform profile."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-700">{completionPct}%</p>
            <p className="text-[10px] text-indigo-400 uppercase tracking-wider">Complete</p>
          </div>
        </div>
        <Progress value={completionPct} className="h-2" />

        {/* Status pills */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {PLATFORMS.map(p => (
            <div key={p.id} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${connected[p.id] ? `bg-gradient-to-br ${p.grad} text-white` : "bg-white border border-slate-200 text-slate-400"}`} title={p.name}>
              {p.emoji.length <= 2 ? p.emoji : p.name[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      {connectedCount === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Shield, color: "text-indigo-600 bg-indigo-50", title: "Verified Stats", desc: "Real-time follower counts & engagement rates" },
            { icon: Zap,    color: "text-amber-600 bg-amber-50",   title: "Higher Match Score", desc: "Connected profiles rank 3× higher in brand searches" },
            { icon: Users,  color: "text-emerald-600 bg-emerald-50",title: "Audience Insights", desc: "Demographics unlocked for brand pitches" },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3">
                <div className={`w-9 h-9 rounded-lg ${b.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{b.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Platform cards */}
      <div className="space-y-3">
        {/* Connected first */}
        {PLATFORMS.filter(p => connected[p.id]).map(p => (
          <PlatformCard key={p.id} platform={p} connected onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} syncing={syncing} />
        ))}
        {PLATFORMS.filter(p => !connected[p.id]).map(p => (
          <PlatformCard key={p.id} platform={p} connected={false} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} syncing={syncing} />
        ))}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400">All OAuth connections are read-only and powered by Phyllo. PartnerIQ never posts, modifies, or stores credentials. Account data syncs every 24 hours and can be revoked at any time.</p>
      </div>

      {/* OAuth Modal */}
      {oauthPlatform && (
        <OAuthModal
          platform={oauthPlatform}
          onConfirm={handleOAuthConfirm}
          onCancel={() => setOauthPlatform(null)}
        />
      )}
    </div>
  );
}
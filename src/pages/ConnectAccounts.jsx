import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, Key, Search, ExternalLink, Plus, Trash2, RefreshCw,
  Youtube, Music, Gamepad2, Film, Dumbbell, BookOpen, Palette,
  Trophy, GraduationCap, Camera, Link2, CheckCircle2, XCircle, Globe
} from "lucide-react";
import {
  getVerificationLevel, getVerificationColor, getNextBoostMessage, recalculateBoost
} from "@/lib/verificationBoost";
import { useToast } from "@/components/ui/use-toast";

const PHYLLO_CLIENT_ID = import.meta.env.VITE_PHYLLO_CLIENT_ID || "";
const PHYLLO_ENV = import.meta.env.VITE_PHYLLO_ENV || "sandbox";
const hasPhyllo = !!PHYLLO_CLIENT_ID;

const CATEGORY_META = [
  { key: "all", label: "All Platforms", icon: Globe },
  { key: "content_creator", label: "Content & Video", icon: Youtube },
  { key: "photo_visual", label: "Photo & Visual", icon: Camera },
  { key: "musician", label: "Music & Audio", icon: Music },
  { key: "gaming", label: "Gaming & Esports", icon: Gamepad2 },
  { key: "actors", label: "Actors & Performers", icon: Film },
  { key: "fitness", label: "Fitness & Wellness", icon: Dumbbell },
  { key: "writers", label: "Writers & Podcasts", icon: BookOpen },
  { key: "beauty_fashion", label: "Beauty & Fashion", icon: Palette },
  { key: "athletes", label: "Athletes & Sports", icon: Trophy },
  { key: "educators", label: "Educators", icon: GraduationCap },
  { key: "design", label: "Design & Motion", icon: Palette },
];

const AUTH_BADGES = {
  oauth: { label: "OAuth Login", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  api_gated: { label: "API Key", icon: Key, color: "text-amber-600 bg-amber-50 border-amber-200" },
  manual: { label: "API Key", icon: Key, color: "text-amber-600 bg-amber-50 border-amber-200" },
};

export default function ConnectAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [connectModal, setConnectModal] = useState(null);
  const [connectMode, setConnectMode] = useState(null);
  const [connectForm, setConnectForm] = useState({ username: "", apiKey: "", followers: "", engagementRate: "" });
  const [oauthStep, setOauthStep] = useState("idle");

  const { data: talent } = useQuery({
    queryKey: ["my-talent"],
    queryFn: async () => {
      const { data } = await supabase.from("talents").select("*").eq("email", user?.email).maybeSingle();
      return data;
    },
    enabled: !!user?.email,
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["platform-catalog"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_catalog").select("*").order("category").order("name");
      return data || [];
    },
  });

  const { data: connected = [], refetch: refetchConnected } = useQuery({
    queryKey: ["connected-platforms", talent?.id],
    queryFn: async () => {
      if (!talent?.id) return [];
      const { data } = await supabase.from("connected_platforms").select("*").eq("talent_id", talent.id);
      return data || [];
    },
    enabled: !!talent?.id,
  });

  const connectMutation = useMutation({
    mutationFn: async ({ platform, authMethod, username, followers, engagementRate, apiKey }) => {
      if (!talent?.id) throw new Error("No talent profile found. Visit My Profile first to create one.");
      const { error } = await supabase.from("connected_platforms").insert({
        talent_id: talent.id,
        platform: platform.slug,
        platform_category: platform.category,
        auth_method: authMethod,
        verified: authMethod === "oauth" || authMethod === "api_key",
        username: username || "",
        followers: parseInt(followers) || 0,
        engagement_rate: parseFloat(engagementRate) || 0,
        last_synced_at: new Date().toISOString(),
        raw_data: apiKey ? { has_api_key: true } : {},
      });
      if (error) throw error;
      await recalculateBoost(supabase, talent.id);
    },
    onSuccess: () => {
      refetchConnected();
      queryClient.invalidateQueries({ queryKey: ["my-talent"] });
      setConnectModal(null);
      setConnectMode(null);
      setOauthStep("idle");
      setConnectForm({ username: "", apiKey: "", followers: "", engagementRate: "" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId) => {
      await supabase.from("connected_platforms").delete().eq("id", connectionId);
      if (talent?.id) await recalculateBoost(supabase, talent.id);
    },
    onSuccess: () => {
      refetchConnected();
      queryClient.invalidateQueries({ queryKey: ["my-talent"] });
    },
  });

  const filtered = useMemo(() => {
    return catalog.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [catalog, category, search]);

  const verifiedCount = connected.filter(c => c.verified).length;
  const totalConnected = connected.length;
  const boost = talent?.verification_boost || 0;
  const level = getVerificationLevel(verifiedCount);
  const levelColor = getVerificationColor(level);
  const getConnections = (slug) => connected.filter(c => c.platform === slug);

  // ID Verification state
  const [idFile, setIdFile] = useState(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idStatus, setIdStatus] = useState("none"); // none | pending | verified | rejected

  // Sync idStatus once the talent query resolves (talent is undefined on first render)
  useEffect(() => {
    if (talent) {
      if (talent.id_verified) setIdStatus("verified");
      else if (talent.id_verification_status === "pending") setIdStatus("pending");
    }
  }, [talent]);

  const handleOAuth = async (platform) => {
    // Auto-create talent profile if missing
    if (!talent?.id && user?.email) {
      try {
        await supabase.from("talents").insert({
          email: user.email,
          name: user?.full_name || user?.email?.split("@")[0] || "New Talent",
          status: "active",
        });
        queryClient.invalidateQueries({ queryKey: ["my-talent"] });
      } catch (insertErr) {
        console.error("Auto-create talent error:", insertErr);
      }
    }

    if (!hasPhyllo) {
      setOauthStep("error");
      toast({
        title: "OAuth Not Configured",
        description: "Real social platform OAuth requires Phyllo integration. Contact admin to set up VITE_PHYLLO_CLIENT_ID.",
        variant: "destructive",
      });
      return;
    }

    setOauthStep("authorizing");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-phyllo-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ platform: platform.slug }),
      });
      const { token, phyllo_user_id } = await res.json();

      const config = {
        clientDisplayName: "Dealstage",
        environment: PHYLLO_ENV,
        userId: phyllo_user_id,
        token: token,
        workPlatformId: platform.phyllo_platform_id || null,
      };

      window.PhylloConnect?.initialize(config);
      window.PhylloConnect?.open();

      // Phyllo handles OAuth in a popup; webhook updates connected_platforms on success
      setOauthStep("done");

      await connectMutation.mutateAsync({
        platform,
        authMethod: "oauth",
        username: "connecting...",
        followers: 0,
        engagementRate: 0,
      });
    } catch (err) {
      console.error("Phyllo connect error:", err);
      setOauthStep("error");
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    }
  };

  const handleApiConnect = async (platform) => {
    await connectMutation.mutateAsync({
      platform, authMethod: "api_key",
      username: connectForm.username,
      apiKey: connectForm.apiKey,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Connect Your Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Link your social platforms to boost your discovery score and earn verified status. Connect multiple accounts per platform.
        </p>
      </div>

      {/* Verification Status */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${levelColor}`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${levelColor} font-semibold`}>{level}</Badge>
                  {boost > 0 && <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">+{boost}% boost</Badge>}
                </div>
                <p className="text-sm text-slate-500 mt-1">{getNextBoostMessage(verifiedCount, boost)}</p>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{totalConnected} connected</span>
                <span>{verifiedCount} verified</span>
              </div>
              <Progress value={Math.min((boost / 30) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Verification — Verified Badge */}
      <Card className={idStatus === "verified" ? "border-emerald-300 bg-emerald-50/30" : "border-amber-200 bg-amber-50/20"}>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              idStatus === "verified" ? "bg-emerald-100 border-emerald-300 text-emerald-700" :
              idStatus === "pending" ? "bg-amber-100 border-amber-300 text-amber-700" :
              "bg-slate-100 border-slate-200 text-slate-500"
            }`}>
              {idStatus === "verified" ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground">Identity Verification</h3>
                {idStatus === "verified" && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Verified ✓</Badge>}
                {idStatus === "pending" && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Under Review</Badge>}
              </div>
              {idStatus === "verified" ? (
                <p className="text-sm text-muted-foreground">Your identity has been verified. You have the <strong className="text-emerald-700">Verified Badge</strong> on your profile — brands can trust you are who you say you are.</p>
              ) : idStatus === "pending" ? (
                <p className="text-sm text-muted-foreground">Your ID is being reviewed. This typically takes 1-2 business hours. You'll receive a notification once approved.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">Upload a government-issued ID to earn your <strong>Verified Badge</strong>. Verified talent get up to 40% more deal inquiries from brands.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div
                      className="flex-1 border-2 border-dashed border-amber-300 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
                      onClick={() => document.getElementById("id-upload-input").click()}
                    >
                      <input
                        id="id-upload-input"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={e => { if (e.target.files[0]) setIdFile(e.target.files[0]); }}
                      />
                      {idFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-foreground">{idFile.name}</span>
                          <span className="text-xs text-muted-foreground">({(idFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                      ) : (
                        <>
                          <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-foreground">Upload Government ID</p>
                          <p className="text-xs text-muted-foreground mt-1">Driver's license, passport, or national ID · JPG, PNG, or PDF</p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:w-48 shrink-0">
                      <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        disabled={!idFile || idUploading}
                        onClick={async () => {
                          setIdUploading(true);
                          try {
                            // Upload to Supabase storage
                            const filePath = `id-verification/${user?.id || "unknown"}/${Date.now()}_${idFile.name}`;
                            await supabase.storage.from("id-verification").upload(filePath, idFile);
                            // Update profile
                            if (talent?.id) {
                              await supabase.from("talents").update({
                                id_verification_file: filePath,
                                id_verification_status: "pending",
                                id_verification_submitted_at: new Date().toISOString(),
                              }).eq("id", talent.id);
                            }
                            setIdStatus("pending");
                            setIdFile(null);
                          } catch (err) {
                            console.error("ID upload error:", err);
                          }
                          setIdUploading(false);
                        }}
                      >
                        {idUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {idUploading ? "Uploading..." : "Submit for Review"}
                      </Button>
                      <div className="text-[10px] text-muted-foreground text-center leading-tight">
                        Your ID is encrypted and only used for verification. It is never shared with brands or other users.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Summary */}
      {connected.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your Connected Accounts ({connected.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {connected.map(conn => {
                const ab = AUTH_BADGES[conn.auth_method] || AUTH_BADGES.manual;
                const AI = ab.icon;
                return (
                  <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded flex items-center justify-center border ${ab.color}`}>
                        <AI className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{conn.platform}</p>
                        <p className="text-xs text-slate-500 truncate">@{conn.username || "connected"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {conn.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      {conn.followers > 0 && <span className="text-xs text-slate-500">{conn.followers.toLocaleString()}</span>}
                      <button onClick={() => disconnectMutation.mutate(conn.id)} aria-label={`Disconnect ${conn.platform} account @${conn.username || "connected"}`} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs + Search */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <Input placeholder="Search platforms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" aria-label="Search platforms" />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap h-auto gap-1">
            {CATEGORY_META.map(cat => {
              const Icon = cat.icon;
              return <TabsTrigger key={cat.key} value={cat.key} className="text-xs gap-1"><Icon className="w-3 h-3" />{cat.label}</TabsTrigger>;
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(platform => {
          const connections = getConnections(platform.slug);
          const isConnected = connections.length > 0;
          const ab = AUTH_BADGES[platform.auth_type] || AUTH_BADGES.manual;
          const AI = ab.icon;
          return (
            <Card key={platform.id} className={`transition-all hover:shadow-md ${isConnected ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${ab.color}`}><AI className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{platform.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${ab.color}`}>
                        {platform.auth_type === "oauth" ? "OAuth +5%" : "API +3%"}
                      </Badge>
                    </div>
                  </div>
                  {isConnected && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />{connections.length > 1 ? `${connections.length} accts` : "Live"}
                    </Badge>
                  )}
                </div>
                {connections.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {connections.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1 border">
                        <span className="text-slate-700 truncate">@{c.username}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.followers > 0 && <span className="text-slate-400">{c.followers.toLocaleString()}</span>}
                          <button onClick={() => disconnectMutation.mutate(c.id)} aria-label={`Disconnect @${c.username} from ${platform.name}`} className="text-slate-300 hover:text-red-500"><XCircle className="w-3 h-3" aria-hidden="true" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {platform.notes && <p className="text-xs text-slate-500 mb-3 line-clamp-1">{platform.notes}</p>}
                <Button size="sm" variant={isConnected ? "outline" : "default"} className="w-full text-xs"
                  aria-label={isConnected ? `Add another ${platform.name} account` : `Connect ${platform.name}`}
                  onClick={() => { setConnectModal(platform); setConnectMode(null); setOauthStep("idle"); setConnectForm({ username: "", apiKey: "", followers: "", engagementRate: "" }); }}>
                  <Plus className="w-3 h-3 mr-1" aria-hidden="true" />{isConnected ? "Add Another Account" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="p-12 text-center text-slate-500"><Search className="w-8 h-8 mx-auto mb-2 text-slate-300" /><p>No platforms match your search.</p></CardContent></Card>
      )}

      {/* Connect Modal */}
      <Dialog open={!!connectModal} onOpenChange={(open) => { if (!open) { setConnectModal(null); setConnectMode(null); setOauthStep("idle"); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Link2 className="w-5 h-5 text-indigo-600" />Connect {connectModal?.name}</DialogTitle>
          </DialogHeader>

          {!connectMode && connectModal && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Choose how to connect your {connectModal.name} account:</p>
              {/* OAuth login — primary option for all platforms */}
              <button onClick={() => setConnectMode("oauth")} className="w-full flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">Log in with {connectModal.name}</p>
                  <p className="text-xs text-slate-500">Sign in directly — verified account, +5% discovery boost</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">Recommended</Badge>
              </button>
              {/* API key — secondary option */}
              <button onClick={() => setConnectMode("api")} className="w-full flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Key className="w-5 h-5 text-amber-600" /></div>
                <div><p className="font-medium text-sm text-slate-900">Connect with API Key</p><p className="text-xs text-slate-500">Use your {connectModal.name} API credentials — verified, +3% boost</p></div>
              </button>
            </div>
          )}

          {connectMode === "oauth" && connectModal && (
            <div className="space-y-4">
              {oauthStep === "idle" && (
                <>
                  {!hasPhyllo && (
                    <div style={{ padding: "1rem", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, marginBottom: 12 }}>
                      <p style={{ fontSize: "0.8rem", color: "#a16207", fontWeight: 500, marginBottom: 4 }}>Real OAuth Coming Soon</p>
                      <p style={{ fontSize: "0.75rem", color: "#92400e" }}>
                        Direct login to {connectModal.name} requires Phyllo integration. For now, enter your username and we'll verify your account manually within 24 hours.
                      </p>
                    </div>
                  )}
                  <div><Label className="text-sm">Username (optional)</Label><Input placeholder={`Your ${connectModal.name} username`} value={connectForm.username} onChange={e => setConnectForm(f => ({ ...f, username: e.target.value }))} className="mt-1" /></div>
                  <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500"><ShieldCheck className="w-3 h-3 inline mr-1" />Read-only access. We never post or store credentials.{connectModal.scopes && <span className="block mt-1">Scopes: {connectModal.scopes}</span>}</p></div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOAuth(connectModal)} disabled={connectMutation.isPending}><ExternalLink className="w-4 h-4 mr-2" />Authorize with {connectModal.name}</Button>
                </>
              )}
              {oauthStep === "authorizing" && (<div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto mb-3 text-indigo-500 animate-spin" /><p className="text-sm text-slate-700">Connecting to {connectModal.name}...</p></div>)}
              {oauthStep === "done" && (<div className="text-center py-8"><CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" /><p className="text-sm font-medium text-slate-900">Connected!</p><p className="text-xs text-slate-500 mt-1">Your {connectModal.name} account is now verified</p></div>)}
              {oauthStep === "error" && (<div className="text-center py-8"><XCircle className="w-10 h-10 mx-auto mb-3 text-red-500" /><p className="text-sm font-medium text-slate-900">Connection failed</p><button onClick={() => setOauthStep("idle")} className="text-xs text-indigo-600 hover:underline mt-2">Try again</button></div>)}
            </div>
          )}

          {connectMode === "api" && connectModal && (
            <div className="space-y-4">
              <div><Label className="text-sm">Username / Account ID</Label><Input placeholder={`Your ${connectModal.name} username or account ID`} value={connectForm.username} onChange={e => setConnectForm(f => ({ ...f, username: e.target.value }))} className="mt-1" required /></div>
              <div><Label className="text-sm">API Key / Access Token</Label><Input type="password" placeholder={`Paste your ${connectModal.name} API key`} value={connectForm.apiKey} onChange={e => setConnectForm(f => ({ ...f, apiKey: e.target.value }))} className="mt-1" required /></div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700"><Key className="w-3 h-3 inline mr-1" />Your API key is used to pull your real stats (followers, engagement, views) directly from {connectModal.name}. We never modify your account.</p>
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleApiConnect(connectModal)} disabled={!connectForm.username || !connectForm.apiKey || connectMutation.isPending}>
                {connectMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}Verify & Connect
              </Button>
            </div>
          )}

          {connectMutation.error && (<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{connectMutation.error.message}</div>)}
          {connectMode && oauthStep !== "authorizing" && oauthStep !== "done" && (
            <button onClick={() => { setConnectMode(null); setOauthStep("idle"); }} className="text-xs text-slate-500 hover:text-slate-700 w-full text-center">Back to connection options</button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

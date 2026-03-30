import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_LABELS, getPlatformsByCategory } from "@/lib/platforms";

// ─── Step constants ───────────────────────────────────────────────────────────
const STEP_CONNECT = "connect";
const STEP_LOADING = "loading";
const STEP_REVIEW  = "review";

// ─── Small helpers ────────────────────────────────────────────────────────────
function PlatformIcon({ icon, name }) {
  return (
    <span className="text-lg leading-none" title={name} aria-label={name}>
      {icon}
    </span>
  );
}

function VerificationBadge({ type }) {
  if (type === "oauth") {
    return (
      <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-blue-200 font-medium">
        OAuth
      </Badge>
    );
  }
  if (type === "crawl") {
    return (
      <Badge className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200 font-medium">
        Crawl
      </Badge>
    );
  }
  return null;
}

// ─── Connect step ─────────────────────────────────────────────────────────────
function ConnectStep({ onSubmit }) {
  const [query, setQuery]               = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  // { platformId: url }
  const [addedUrls, setAddedUrls]       = useState({});
  // platformIds that have been toggled open for URL entry
  const [openInputs, setOpenInputs]     = useState({});

  const platformsByCategory = useMemo(() => getPlatformsByCategory(), []);

  // Filter across all platforms by query
  const filteredMap = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return platformsByCategory;

    const result = new Map();
    for (const [cat, platforms] of platformsByCategory) {
      const filtered = platforms.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (CATEGORY_LABELS[cat] || "").toLowerCase().includes(q)
      );
      if (filtered.length > 0) result.set(cat, filtered);
    }
    return result;
  }, [query, platformsByCategory]);

  const addedCount = Object.values(addedUrls).filter(Boolean).length;

  function toggleCategory(cat) {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function toggleInput(platformId) {
    setOpenInputs((prev) => ({ ...prev, [platformId]: !prev[platformId] }));
  }

  function handleUrlChange(platformId, value) {
    setAddedUrls((prev) => ({ ...prev, [platformId]: value }));
  }

  function handleRemove(platformId) {
    setAddedUrls((prev) => {
      const next = { ...prev };
      delete next[platformId];
      return next;
    });
    setOpenInputs((prev) => {
      const next = { ...prev };
      delete next[platformId];
      return next;
    });
  }

  function handleBuild() {
    const links = Object.entries(addedUrls)
      .filter(([, url]) => url && url.trim())
      .map(([platformId, url]) => ({ platformId, url: url.trim() }));
    onSubmit(links);
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search 92 platforms..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Platform categories */}
      <div className="space-y-2">
        {[...filteredMap.entries()].map(([cat, platforms]) => {
          const isCollapsed = !!collapsedCats[cat];
          const label = CATEGORY_LABELS[cat] || cat;
          return (
            <Card key={cat} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-sm text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{platforms.length} platforms</span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {!isCollapsed && (
                <div className="border-t divide-y">
                  {platforms.map((platform) => {
                    const hasUrl = !!addedUrls[platform.id];
                    const isOpen = !!openInputs[platform.id];

                    return (
                      <div key={platform.id} className="px-4 py-2.5 space-y-2">
                        <div className="flex items-center gap-3">
                          <PlatformIcon icon={platform.icon} name={platform.name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-slate-800">
                                {platform.name}
                              </span>
                              <VerificationBadge type={platform.verification} />
                            </div>
                            {platform.dataPoints && platform.dataPoints.length > 0 && (
                              <p className="text-xs text-slate-400 truncate">
                                {platform.dataPoints.join(", ")}
                              </p>
                            )}
                          </div>
                          {hasUrl ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Check className="w-4 h-4 text-emerald-500" />
                              <button
                                type="button"
                                onClick={() => handleRemove(platform.id)}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-7 text-xs"
                              onClick={() => toggleInput(platform.id)}
                            >
                              {isOpen ? "Cancel" : "Add"}
                            </Button>
                          )}
                        </div>

                        {/* URL input row */}
                        {(isOpen || hasUrl) && (
                          <div className="flex gap-2 pl-8">
                            <Input
                              placeholder={platform.urlPlaceholder}
                              className="h-8 text-xs"
                              value={addedUrls[platform.id] || ""}
                              onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                            />
                            {!hasUrl && (
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs shrink-0"
                                disabled={!addedUrls[platform.id]?.trim()}
                                onClick={() => {
                                  // Mark as confirmed — input stays visible but check appears
                                  setOpenInputs((prev) => ({ ...prev, [platform.id]: false }));
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleBuild}
            disabled={addedCount === 0}
            className="w-full gap-2"
            size="lg"
          >
            {addedCount > 0
              ? `Build profile from ${addedCount} platform${addedCount !== 1 ? "s" : ""}`
              : "Add at least one platform to continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading step ─────────────────────────────────────────────────────────────
function LoadingStep({ jobId, onComplete }) {
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("crawl_jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) {
          console.error("Poll error:", error);
          return;
        }

        if (data?.status === "complete" || data?.status === "done") {
          clearInterval(interval);
          onComplete(data);
        } else if (data?.status === "error" || data?.status === "failed") {
          clearInterval(interval);
          onComplete(null, data?.error_message || "Enrichment failed");
        }
      } catch (err) {
        console.error("Unexpected poll error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-semibold text-slate-800">Crawling your profiles</p>
          <p className="text-sm text-slate-500">This takes 15-30 seconds — please keep this tab open</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs text-slate-400 max-w-xs text-center">
          <span>Fetching follower counts</span>
          <span>•</span>
          <span>Reading bio text</span>
          <span>•</span>
          <span>Detecting niche signals</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Review step ─────────────────────────────────────────────────────────────
function ReviewStep({ enrichedData, onSave, isSaving, saveError }) {
  const [displayName, setDisplayName] = useState(enrichedData?.display_name || "");
  const [bio, setBio]                 = useState(enrichedData?.bio || "");

  const nicheTags     = enrichedData?.niche_tags     || [];
  const contentThemes = enrichedData?.content_themes || [];
  const pastDeals     = enrichedData?.past_brand_deals || [];
  const rateCard      = enrichedData?.rate_card      || null;

  function handleSave() {
    onSave({ display_name: displayName, bio });
  }

  return (
    <div className="space-y-4">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Display name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your creator name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="Short bio about you and your content"
            />
          </div>
        </CardContent>
      </Card>

      {/* Niche & Themes */}
      {(nicheTags.length > 0 || contentThemes.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Niche & Content Themes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nicheTags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Niches</p>
                <div className="flex flex-wrap gap-1.5">
                  {nicheTags.map((tag) => (
                    <Badge key={tag} className="bg-indigo-100 text-indigo-700 border-indigo-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {contentThemes.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Content themes</p>
                <div className="flex flex-wrap gap-1.5">
                  {contentThemes.map((theme) => (
                    <Badge key={theme} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past brand deals */}
      {pastDeals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Past Brand Deals Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {pastDeals.map((brand, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate card */}
      {rateCard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estimated Rate Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(rateCard).map(([type, price]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-slate-600 capitalize">{type.replace(/_/g, " ")}</span>
                  <span className="font-medium">{price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {saveError && (
        <p className="text-sm text-red-500">{saveError}</p>
      )}

      {/* CTA */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2" size="lg">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving profile...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" /> Looks good — complete profile
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function CreatorEnrichment({ onComplete }) {
  const { user } = useAuth();

  const [step, setStep]             = useState(STEP_CONNECT);
  const [jobId, setJobId]           = useState(null);
  const [enrichedData, setEnrichedData] = useState(null);
  const [invokeError, setInvokeError]   = useState(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState(null);

  async function handleConnectSubmit(links) {
    setInvokeError(null);
    setStep(STEP_LOADING);
    try {
      const result = await base44.functions.invoke("enrichCreator", { links });
      setJobId(result?.jobId || result?.job_id || null);
      // If function returns enriched data directly (no async job)
      if (result?.enriched) {
        setEnrichedData(result.enriched);
        setStep(STEP_REVIEW);
      }
    } catch (err) {
      setInvokeError(err?.message || "Failed to start enrichment. Please try again.");
      setStep(STEP_CONNECT);
    }
  }

  function handlePollComplete(jobData, errorMsg) {
    if (errorMsg || !jobData) {
      setInvokeError(errorMsg || "Enrichment failed. Please try again.");
      setStep(STEP_CONNECT);
      return;
    }
    setEnrichedData(jobData?.result || jobData?.data || jobData);
    setStep(STEP_REVIEW);
  }

  async function handleSave({ display_name, bio }) {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        user_id: user.id,
        email: user.email,
        display_name,
        bio,
        niche_tags: enrichedData?.niche_tags || [],
        content_themes: enrichedData?.content_themes || [],
        past_brand_deals: enrichedData?.past_brand_deals || [],
        rate_card: enrichedData?.rate_card || null,
        raw_enrichment: enrichedData,
        enriched_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("enriched_creators")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      onComplete?.(payload);
    } catch (err) {
      setSaveError(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Step header */}
      <div className="flex items-center gap-3">
        {[
          { id: STEP_CONNECT, label: "Connect" },
          { id: STEP_LOADING, label: "Analyzing" },
          { id: STEP_REVIEW,  label: "Review" },
        ].map((s, i, arr) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.id
                    ? "bg-indigo-600 text-white"
                    : step === STEP_REVIEW && s.id !== STEP_REVIEW
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step === STEP_REVIEW && s.id !== STEP_REVIEW ? (
                  <Check className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === s.id ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="flex-1 h-px bg-slate-200" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step title */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {step === STEP_CONNECT && "Connect your platforms"}
            {step === STEP_LOADING && "Building your profile"}
            {step === STEP_REVIEW  && "Review your profile"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {step === STEP_CONNECT && "Add URLs for the platforms you're active on. We'll extract your public stats and build your creator card automatically."}
            {step === STEP_LOADING && "Sit tight — we're visiting each platform and pulling your public data."}
            {step === STEP_REVIEW  && "Here's what we found. Edit anything before saving."}
          </p>
        </CardHeader>
      </Card>

      {/* Invoke error banner */}
      {invokeError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700">{invokeError}</CardContent>
        </Card>
      )}

      {/* Step content */}
      {step === STEP_CONNECT && <ConnectStep onSubmit={handleConnectSubmit} />}
      {step === STEP_LOADING && <LoadingStep jobId={jobId} onComplete={handlePollComplete} />}
      {step === STEP_REVIEW  && enrichedData && (
        <ReviewStep
          enrichedData={enrichedData}
          onSave={handleSave}
          isSaving={isSaving}
          saveError={saveError}
        />
      )}
    </div>
  );
}

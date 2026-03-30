import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Loader2, Check, ExternalLink } from "lucide-react";

// ─── Step constants ───────────────────────────────────────────────────────────
const STEP_INPUT   = "input";
const STEP_LOADING = "loading";
const STEP_REVIEW  = "review";

// ─── URL normalizer ───────────────────────────────────────────────────────────
function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(url) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

// ─── Input step ──────────────────────────────────────────────────────────────
function InputStep({ onSubmit, isLoading }) {
  const [url, setUrl]   = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!url.trim()) {
      setError("Please enter your website URL.");
      return;
    }
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL, e.g. https://example.com");
      return;
    }
    onSubmit(normalizeUrl(url));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your brand website</CardTitle>
        <p className="text-sm text-slate-500">
          We'll visit your site, extract brand signals, and pre-fill your profile. No login required.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                type="url"
                placeholder="https://yourcompany.com"
                className={`pl-9 ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !url.trim()} className="shrink-0">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...
                </>
              ) : (
                "Analyze my website"
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
    </Card>
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
          <p className="font-semibold text-slate-800">Analyzing your website</p>
          <p className="text-sm text-slate-500">
            This takes 15-30 seconds — we're reading your homepage, about page, and social links
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs text-slate-400 max-w-xs text-center">
          <span>Detecting brand voice</span>
          <span>•</span>
          <span>Extracting products</span>
          <span>•</span>
          <span>Finding social handles</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Inline editable field ────────────────────────────────────────────────────
function EditableField({ label, value, onChange, multiline = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ─── Review step ─────────────────────────────────────────────────────────────
function ReviewStep({ enrichedData, onSave, isSaving, saveError }) {
  const [companyName,     setCompanyName]     = useState(enrichedData?.company_name     || "");
  const [industry,        setIndustry]        = useState(enrichedData?.industry         || "");
  const [brandVoice,      setBrandVoice]      = useState(enrichedData?.brand_voice      || "");
  const [targetAudience,  setTargetAudience]  = useState(enrichedData?.target_audience  || "");

  const products     = enrichedData?.products     || [];
  const socialLinks  = enrichedData?.social_links || {};

  function handleSave() {
    onSave({ company_name: companyName, industry, brand_voice: brandVoice, target_audience: targetAudience });
  }

  return (
    <div className="space-y-4">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EditableField label="Company name" value={companyName} onChange={setCompanyName} />
          <EditableField label="Industry" value={industry} onChange={setIndustry} />
          <EditableField
            label="Brand voice"
            value={brandVoice}
            onChange={setBrandVoice}
            multiline
          />
          <EditableField
            label="Target audience"
            value={targetAudience}
            onChange={setTargetAudience}
            multiline
          />
        </CardContent>
      </Card>

      {/* Products */}
      {products.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Products Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {products.map((product, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {typeof product === "object" ? product.name || product.title || JSON.stringify(product) : product}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social links */}
      {Object.keys(socialLinks).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Social Profiles Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium text-slate-700">{platform}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 truncate max-w-[200px]"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
                  </a>
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
            <Loader2 className="w-4 h-4 animate-spin" /> Saving brand profile...
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
export default function BrandEnrichment({ onComplete }) {
  const { user } = useAuth();

  const [step, setStep]               = useState(STEP_INPUT);
  const [websiteUrl, setWebsiteUrl]   = useState("");
  const [jobId, setJobId]             = useState(null);
  const [enrichedData, setEnrichedData] = useState(null);
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [invokeError, setInvokeError]   = useState(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [saveError, setSaveError]     = useState(null);

  async function handleInputSubmit(url) {
    setWebsiteUrl(url);
    setInvokeError(null);
    setInvokeLoading(true);
    try {
      const result = await base44.functions.invoke("enrichBrand", { websiteUrl: url });
      setInvokeLoading(false);
      setJobId(result?.jobId || result?.job_id || null);
      // If the function returns data directly without an async job
      if (result?.enriched) {
        setEnrichedData(result.enriched);
        setStep(STEP_REVIEW);
      } else {
        setStep(STEP_LOADING);
      }
    } catch (err) {
      setInvokeLoading(false);
      setInvokeError(err?.message || "Failed to analyze website. Please try again.");
    }
  }

  function handlePollComplete(jobData, errorMsg) {
    if (errorMsg || !jobData) {
      setInvokeError(errorMsg || "Analysis failed. Please try again.");
      setStep(STEP_INPUT);
      return;
    }
    setEnrichedData(jobData?.result || jobData?.data || jobData);
    setStep(STEP_REVIEW);
  }

  async function handleSave({ company_name, industry, brand_voice, target_audience }) {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        user_id: user.id,
        email: user.email,
        company_name,
        industry,
        brand_voice,
        target_audience,
        website_url: websiteUrl,
        products: enrichedData?.products || [],
        social_links: enrichedData?.social_links || {},
        raw_enrichment: enrichedData,
        enriched_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("enriched_brands")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      onComplete?.(payload);
    } catch (err) {
      setSaveError(err?.message || "Failed to save brand profile. Please try again.");
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
          { id: STEP_INPUT,   label: "Website" },
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
            {i < arr.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step title card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {step === STEP_INPUT   && "Analyze your brand website"}
            {step === STEP_LOADING && "Analyzing your website"}
            {step === STEP_REVIEW  && "Review your brand profile"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {step === STEP_INPUT   && "Paste your company URL and we'll auto-build your brand card in seconds."}
            {step === STEP_LOADING && "We're crawling your site to extract brand voice, products, and audience signals."}
            {step === STEP_REVIEW  && "Here's what we found. Edit anything before saving to your profile."}
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
      {step === STEP_INPUT && (
        <InputStep onSubmit={handleInputSubmit} isLoading={invokeLoading} />
      )}
      {step === STEP_LOADING && (
        <LoadingStep jobId={jobId} onComplete={handlePollComplete} />
      )}
      {step === STEP_REVIEW && enrichedData && (
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

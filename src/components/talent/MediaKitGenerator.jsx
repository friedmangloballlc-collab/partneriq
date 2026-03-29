import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Copy,
  Download,
  CheckCircle2,
  Loader2,
  User,
  BarChart3,
  DollarSign,
  Star,
  Layers,
  AlertCircle,
} from "lucide-react";

function formatFollowers(count) {
  if (!count) return "N/A";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function RateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function MediaKitGenerator({ talentData }) {
  const [mediaKit, setMediaKit] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!talentData) return;

    setIsGenerating(true);
    setError(null);
    setMediaKit(null);

    try {
      const portfolio = (() => {
        try {
          return typeof talentData.portfolio === "string"
            ? JSON.parse(talentData.portfolio)
            : talentData.portfolio || [];
        } catch {
          return [];
        }
      })();

      const collabTypes = (() => {
        try {
          return typeof talentData.preferred_collaboration_types === "string"
            ? JSON.parse(talentData.preferred_collaboration_types)
            : talentData.preferred_collaboration_types || [];
        } catch {
          return [];
        }
      })();

      const prompt = `You are a professional talent media kit writer for creator partnerships. Generate a polished, compelling media kit for the following creator profile.

CREATOR PROFILE:
- Name: ${talentData.full_name || talentData.name || "Creator"}
- Email: ${talentData.email || "N/A"}
- Primary Platform: ${talentData.primary_platform || "Instagram"}
- Follower Count: ${formatFollowers(talentData.follower_count)}
- Engagement Rate: ${talentData.engagement_rate ? talentData.engagement_rate + "%" : "N/A"}
- Niche / Expertise: ${talentData.expertise_areas || talentData.niche || "Lifestyle"}
- Brand Safety Score: ${talentData.brand_safety_score ?? "N/A"}/100
- Availability: ${talentData.availability_status || "open_for_offers"}
- Preferred Collaborations: ${collabTypes.join(", ") || "Open to all types"}
- Tier: ${talentData.tier || "micro"}
- Location: ${talentData.location || "Global"}
- Past Campaigns: ${portfolio.length > 0 ? portfolio.map((p) => `${p.title} for ${p.brand}`).join(", ") : "Not specified"}
- Portfolio highlights: ${portfolio.length > 0 ? portfolio.map((p) => `${p.brand}: ${p.description || ""} (${p.engagement_rate || 0}% engagement, ${formatFollowers(p.reach)} reach)`).join("; ") : "None"}

Generate a professional media kit. Be specific, compelling, and professional. Do NOT use placeholder text.

Return as JSON with this exact structure:
{
  "professional_bio": "<3-4 sentence professional bio written in third person, highlighting their unique value to brands>",
  "audience_summary": "<2-3 sentence description of their audience demographics, interests, and buying power>",
  "top_content_categories": ["<category 1>", "<category 2>", "<category 3>", "<category 4>"],
  "rate_card": [
    { "deliverable": "<deliverable type>", "rate": "<rate range e.g. $500 - $1,500>" },
    { "deliverable": "<deliverable type>", "rate": "<rate range>" },
    { "deliverable": "<deliverable type>", "rate": "<rate range>" },
    { "deliverable": "<deliverable type>", "rate": "<rate range>" }
  ],
  "past_deal_highlights": [
    { "brand": "<brand name>", "description": "<one sentence deal description and results>" },
    { "brand": "<brand name>", "description": "<one sentence deal description and results>" },
    { "brand": "<brand name>", "description": "<one sentence deal description and results>" }
  ],
  "unique_value_prop": "<one punchy sentence about why brands should work with this creator>",
  "collaboration_types": ["<type 1>", "<type 2>", "<type 3>"]
}`;

      const result = await base44.functions.invoke("ai-router", {
        agent: "deal_patterns",
        prompt,
      });

      let parsed = null;

      if (result?.data?.result) {
        try {
          // Strip markdown code fences if present
          const raw = result.data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(raw);
        } catch {
          parsed = { professional_bio: result.data.result };
        }
      }

      if (!parsed || !parsed.professional_bio) {
        throw new Error("AI returned an unexpected format. Please try again.");
      }

      setMediaKit(parsed);
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAsText = async () => {
    if (!mediaKit) return;

    const name = talentData?.full_name || talentData?.name || "Creator";
    const lines = [
      `MEDIA KIT — ${name}`,
      `Generated by Deal Stage`,
      ``,
      `PROFESSIONAL BIO`,
      mediaKit.professional_bio || "",
      ``,
      `UNIQUE VALUE PROPOSITION`,
      mediaKit.unique_value_prop || "",
      ``,
      `AUDIENCE SUMMARY`,
      mediaKit.audience_summary || "",
      ``,
      `TOP CONTENT CATEGORIES`,
      (mediaKit.top_content_categories || []).map((c) => `• ${c}`).join("\n"),
      ``,
      `RATE CARD`,
      (mediaKit.rate_card || []).map((r) => `• ${r.deliverable}: ${r.rate}`).join("\n"),
      ``,
      `PAST DEAL HIGHLIGHTS`,
      (mediaKit.past_deal_highlights || [])
        .map((d) => `• ${d.brand}: ${d.description}`)
        .join("\n"),
      ``,
      `COLLABORATION TYPES`,
      (mediaKit.collaboration_types || []).map((c) => `• ${c}`).join("\n"),
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  };

  const handleDownload = () => {
    if (!mediaKit) return;
    const name = talentData?.full_name || talentData?.name || "Creator";
    const lines = [
      `MEDIA KIT — ${name}`,
      `Generated by Deal Stage on ${new Date().toLocaleDateString()}`,
      ``,
      `PROFESSIONAL BIO`,
      mediaKit.professional_bio || "",
      ``,
      `UNIQUE VALUE PROPOSITION`,
      mediaKit.unique_value_prop || "",
      ``,
      `AUDIENCE SUMMARY`,
      mediaKit.audience_summary || "",
      ``,
      `TOP CONTENT CATEGORIES`,
      (mediaKit.top_content_categories || []).map((c) => `• ${c}`).join("\n"),
      ``,
      `RATE CARD`,
      (mediaKit.rate_card || []).map((r) => `• ${r.deliverable}: ${r.rate}`).join("\n"),
      ``,
      `PAST DEAL HIGHLIGHTS`,
      (mediaKit.past_deal_highlights || [])
        .map((d) => `• ${d.brand}: ${d.description}`)
        .join("\n"),
      ``,
      `COLLABORATION TYPES`,
      (mediaKit.collaboration_types || []).map((c) => `• ${c}`).join("\n"),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_MediaKit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Media Kit Generator
            </CardTitle>
            <CardDescription className="mt-1">
              Generate a professional media kit from your profile data in seconds.
            </CardDescription>
          </div>
          {!mediaKit && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !talentData}
              className="flex-shrink-0 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Media Kit
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Generation failed</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleGenerate}
              className="ml-auto text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state (before generation) */}
        {!mediaKit && !isGenerating && !error && (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-600">Your media kit will appear here.</p>
            <p className="text-xs mt-1">
              Click "Generate Media Kit" to create a professional kit from your profile.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isGenerating && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-4/6" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mt-4" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        )}

        {/* Media Kit Result */}
        {mediaKit && !isGenerating && (
          <div className="space-y-5">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Media kit generated</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAsText}
                  className="gap-1.5 text-xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy as text
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .txt
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerate}
                  className="gap-1.5 text-xs text-slate-500"
                  disabled={isGenerating}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Unique Value Prop highlight */}
            {mediaKit.unique_value_prop && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-indigo-800 text-center italic">
                  "{mediaKit.unique_value_prop}"
                </p>
              </div>
            )}

            {/* Professional Bio */}
            <Section icon={User} title="Professional Bio">
              <p className="text-sm text-slate-700 leading-relaxed">
                {mediaKit.professional_bio}
              </p>
            </Section>

            <Separator />

            {/* Audience Summary */}
            <Section icon={BarChart3} title="Audience Summary">
              <p className="text-sm text-slate-700 leading-relaxed">
                {mediaKit.audience_summary}
              </p>
            </Section>

            <Separator />

            {/* Top Content Categories */}
            {mediaKit.top_content_categories?.length > 0 && (
              <>
                <Section icon={Layers} title="Top Content Categories">
                  <div className="flex flex-wrap gap-2">
                    {mediaKit.top_content_categories.map((cat, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Rate Card */}
            {mediaKit.rate_card?.length > 0 && (
              <>
                <Section icon={DollarSign} title="Rate Card">
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    {mediaKit.rate_card.map((row, i) => (
                      <RateRow key={i} label={row.deliverable} value={row.rate} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Rates are estimated. Final pricing subject to campaign scope.
                  </p>
                </Section>
                <Separator />
              </>
            )}

            {/* Past Deal Highlights */}
            {mediaKit.past_deal_highlights?.length > 0 && (
              <>
                <Section icon={Star} title="Past Deal Highlights">
                  <div className="space-y-2">
                    {mediaKit.past_deal_highlights.map((deal, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-800">{deal.brand}</span>
                          <span className="text-sm text-slate-600"> — {deal.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Collaboration Types */}
            {mediaKit.collaboration_types?.length > 0 && (
              <Section icon={Sparkles} title="Open to Collaborations">
                <div className="flex flex-wrap gap-2">
                  {mediaKit.collaboration_types.map((type, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">
                      {type}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

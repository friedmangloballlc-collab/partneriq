import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, Loader2, Copy, CheckCircle2, ChevronDown, ChevronUp,
  Target, Users, MessageSquare, Lightbulb, BarChart3, Megaphone, RefreshCw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SECTION_ICONS = {
  campaign_goals: Target,
  target_audience: Users,
  key_messaging: MessageSquare,
  creative_directions: Lightbulb,
  kpis: BarChart3,
  content_formats: Megaphone,
};

function BriefSection({ title, icon: Icon, items, color }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-2 bg-slate-50/50 space-y-2">
          {Array.isArray(items) ? items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="leading-relaxed">{item}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-700 leading-relaxed">{items}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CampaignBriefGenerator() {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedTalent, setSelectedTalent] = useState("");
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 100),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 100),
  });

  const brandObj = brands.find(b => b.id === selectedBrand);
  const talentObj = talents.find(t => t.id === selectedTalent);

  const generate = async () => {
    if (!brandObj || !talentObj) return;
    setLoading(true);
    setBrief(null);

    const prompt = `You are an expert partnership strategist and creative director. Generate a comprehensive campaign brief for a brand-talent partnership.

BRAND:
- Name: ${brandObj.name}
- Industry: ${brandObj.industry || "unknown"}
- Company Size: ${brandObj.company_size || "unknown"}
- Description: ${brandObj.description || "N/A"}
- Target Audience: ${brandObj.target_audience || "N/A"}
- Preferred Niches: ${brandObj.preferred_niches || "N/A"}
- Preferred Platforms: ${brandObj.preferred_platforms || "N/A"}
- Annual Budget: ${brandObj.annual_budget ? `$${brandObj.annual_budget.toLocaleString()}` : "N/A"}

TALENT:
- Name: ${talentObj.name}
- Primary Platform: ${talentObj.primary_platform || "unknown"}
- Niche: ${talentObj.niche || "unknown"}
- Tier: ${talentObj.tier || "unknown"}
- Total Followers: ${talentObj.total_followers ? talentObj.total_followers.toLocaleString() : "N/A"}
- Engagement Rate: ${talentObj.engagement_rate ? `${talentObj.engagement_rate}%` : "N/A"}
- Bio: ${talentObj.bio || "N/A"}
- Languages: ${talentObj.languages || "N/A"}

Generate a detailed, actionable campaign brief with the following sections. Be specific, creative, and tailored to this exact pairing.`;

    const { data: result, error } = await base44.functions.invoke("ai-router", {
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_title: { type: "string", description: "A compelling campaign name" },
          executive_summary: { type: "string", description: "2-3 sentence overview of the campaign opportunity" },
          campaign_goals: {
            type: "array",
            items: { type: "string" },
            description: "3-5 specific, measurable campaign goals"
          },
          target_audience: {
            type: "array",
            items: { type: "string" },
            description: "3-5 detailed target audience segments with demographics and psychographics"
          },
          key_messaging: {
            type: "array",
            items: { type: "string" },
            description: "4-6 core messages and talking points for the campaign"
          },
          creative_directions: {
            type: "array",
            items: { type: "string" },
            description: "4-6 specific, creative content concepts and directions"
          },
          content_formats: {
            type: "array",
            items: { type: "string" },
            description: "3-5 recommended content formats with platform-specific suggestions"
          },
          kpis: {
            type: "array",
            items: { type: "string" },
            description: "4-6 key performance indicators to track campaign success with target benchmarks"
          },
          estimated_reach: { type: "string", description: "Estimated total reach and impressions" },
          recommended_duration: { type: "string", description: "Suggested campaign duration and timeline" },
          budget_allocation: { type: "string", description: "Suggested budget split across content types" },
        },
        required: ["campaign_title", "executive_summary", "campaign_goals", "target_audience", "key_messaging", "creative_directions", "kpis"]
      }
    });
    if (error) throw error;

    setBrief(result);
    setLoading(false);
  };

  const copyBrief = () => {
    if (!brief) return;
    const text = `CAMPAIGN BRIEF: ${brief.campaign_title}

${brief.executive_summary}

CAMPAIGN GOALS:
${brief.campaign_goals?.map((g, i) => `${i + 1}. ${g}`).join("\n")}

TARGET AUDIENCE:
${brief.target_audience?.map((a, i) => `${i + 1}. ${a}`).join("\n")}

KEY MESSAGING:
${brief.key_messaging?.map((m, i) => `${i + 1}. ${m}`).join("\n")}

CREATIVE DIRECTIONS:
${brief.creative_directions?.map((c, i) => `${i + 1}. ${c}`).join("\n")}

CONTENT FORMATS:
${brief.content_formats?.map((f, i) => `${i + 1}. ${f}`).join("\n")}

KPIs:
${brief.kpis?.map((k, i) => `${i + 1}. ${k}`).join("\n")}

${brief.estimated_reach ? `Estimated Reach: ${brief.estimated_reach}` : ""}
${brief.recommended_duration ? `Duration: ${brief.recommended_duration}` : ""}
${brief.budget_allocation ? `Budget Allocation: ${brief.budget_allocation}` : ""}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = brief ? [
    { key: "campaign_goals", title: "Campaign Goals", color: "bg-indigo-500" },
    { key: "target_audience", title: "Target Audience", color: "bg-violet-500" },
    { key: "key_messaging", title: "Key Messaging", color: "bg-blue-500" },
    { key: "creative_directions", title: "Creative Directions", color: "bg-amber-500" },
    { key: "content_formats", title: "Content Formats", color: "bg-emerald-500" },
    { key: "kpis", title: "KPIs & Success Metrics", color: "bg-rose-500" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Campaign Brief Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered campaign briefs tailored to brand + talent pairings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Configure Partnership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {brandObj && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs font-medium text-indigo-700">{brandObj.industry} · {brandObj.company_size}</p>
                    {brandObj.description && <p className="text-xs text-indigo-600 mt-1 line-clamp-2">{brandObj.description}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Talent</label>
                <Select value={selectedTalent} onValueChange={setSelectedTalent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select talent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {talents.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {talentObj && (
                  <div className="mt-2 p-3 bg-violet-50 rounded-lg">
                    <p className="text-xs font-medium text-violet-700">{talentObj.primary_platform} · {talentObj.niche} · {talentObj.tier}</p>
                    {talentObj.total_followers && (
                      <p className="text-xs text-violet-600 mt-1">{(talentObj.total_followers / 1000).toFixed(0)}K followers · {talentObj.engagement_rate}% eng.</p>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={generate}
                disabled={!selectedBrand || !selectedTalent || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Brief...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Generate Brief</>
                )}
              </Button>

              {brief && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs h-9" onClick={copyBrief}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    {copied ? "Copied!" : "Copy Brief"}
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs h-9" onClick={generate}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-slate-200/60 bg-gradient-to-br from-indigo-50 to-violet-50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-indigo-700 mb-2">💡 Tips for best results</p>
              <ul className="space-y-1.5 text-xs text-indigo-600">
                <li>• Fill in brand description and target audience</li>
                <li>• Add talent bio and niche details</li>
                <li>• The more data, the more tailored the brief</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Brief output */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700">AI is crafting your brief...</p>
                <p className="text-sm text-slate-400 mt-1">Analyzing brand needs and talent profile</p>
              </div>
            </div>
          )}

          {!loading && !brief && (
            <div className="flex flex-col items-center justify-center h-96 gap-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-500">Select a brand and talent</p>
                <p className="text-sm text-slate-400 mt-1">Then click Generate Brief to get started</p>
              </div>
            </div>
          )}

          {!loading && brief && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Hero card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] uppercase tracking-wider">AI Generated</Badge>
                </div>
                <h2 className="text-xl font-bold mb-2">{brief.campaign_title}</h2>
                <p className="text-indigo-100 text-sm leading-relaxed">{brief.executive_summary}</p>
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20">
                  {brief.estimated_reach && (
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase tracking-wider">Est. Reach</p>
                      <p className="text-sm font-semibold">{brief.estimated_reach}</p>
                    </div>
                  )}
                  {brief.recommended_duration && (
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase tracking-wider">Duration</p>
                      <p className="text-sm font-semibold">{brief.recommended_duration}</p>
                    </div>
                  )}
                  {brief.budget_allocation && (
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase tracking-wider">Budget Split</p>
                      <p className="text-sm font-semibold">{brief.budget_allocation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {sections.map(s => (
                  <BriefSection
                    key={s.key}
                    title={s.title}
                    icon={SECTION_ICONS[s.key]}
                    items={brief[s.key]}
                    color={s.color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sparkles, FileText, Download, Loader2, Target, Lightbulb,
  BarChart3, Quote, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
// jsPDF dynamically imported in generateCaseStudyPDF
import { useToast } from "@/components/ui/use-toast";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n) {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ── PDF generator ─────────────────────────────────────────────────────────────

async function generateCaseStudyPDF({ deal, caseStudy }) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W  = 210;
  const MARGIN  = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, PAGE_W, 52, "F");

  // Logo text
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("DEAL STAGE", MARGIN, 12);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(153, 246, 228); // teal-200
  doc.text("Agency Intelligence Platform", MARGIN, 17);

  // Badge top-right
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  doc.setFontSize(7);
  doc.setTextColor(153, 246, 228);
  doc.text(dateStr, PAGE_W - MARGIN, 12, { align: "right" });

  // Title
  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const title = `Case Study: ${deal.brand_name || "Campaign"}`;
  doc.text(title, MARGIN, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(204, 251, 241); // teal-100
  doc.text(deal.title || deal.deal_type || "Campaign Overview", MARGIN, 43);

  y = 62;

  // ── Section helper ────────────────────────────────────────────────────────
  function addSection(heading, body, accentColor) {
    // Heading stripe
    doc.setFillColor(...accentColor);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(heading.toUpperCase(), MARGIN + 4, y + 5.5);
    y += 13;

    // Body text
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(body || "—", CONTENT_W);
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, MARGIN, y);
      y += 5.5;
    });
    y += 6;
  }

  // ── Metrics grid ─────────────────────────────────────────────────────────
  function addMetricsGrid(metrics) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "S");

    const cellW = CONTENT_W / metrics.length;
    metrics.forEach((m, i) => {
      const cx = MARGIN + cellW * i + cellW / 2;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136); // teal
      doc.text(m.value, cx, y + 10, { align: "center" });
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(m.label, cx, y + 17, { align: "center" });
    });
    y += 28;
  }

  // ── Testimonial box ───────────────────────────────────────────────────────
  function addTestimonial(text) {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "F");
    doc.setDrawColor(20, 184, 166);
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "S");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136);
    doc.text("\u201C", MARGIN + 3, y + 12);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(15, 118, 110);
    const lines = doc.splitTextToSize(text, CONTENT_W - 14);
    lines.slice(0, 2).forEach((line, i) => {
      doc.text(line, MARGIN + 10, y + 8 + i * 5.5);
    });
    y += 28;
  }

  // ── Render sections ───────────────────────────────────────────────────────
  if (caseStudy.challenge) {
    addSection("Challenge", caseStudy.challenge, [99, 102, 241]); // indigo
  }
  if (caseStudy.solution) {
    addSection("Solution", caseStudy.solution, [13, 148, 136]); // teal
  }
  if (caseStudy.results) {
    addSection("Results", caseStudy.results, [16, 185, 129]); // emerald
  }

  // Metrics
  const metrics = [
    { label: "Campaign Value", value: fmtMoney(deal.deal_value) },
    { label: "Platform", value: deal.platform || "Multi-Platform" },
    { label: "Status", value: (deal.status || "completed").toUpperCase() },
    { label: "Period", value: fmtDate(deal.start_date) },
  ];
  if (y < 240) addMetricsGrid(metrics);

  // Testimonial
  if (caseStudy.testimonial && y < 250) {
    addTestimonial(caseStudy.testimonial);
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 282, PAGE_W, 15, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 282, PAGE_W, 282);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136);
    doc.text("Powered by Deal Stage", MARGIN, 290);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("dealstage.io  ·  Agency Intelligence Platform", PAGE_W - MARGIN, 290, { align: "right" });
  }

  return doc;
}

// ── CaseStudyCard ─────────────────────────────────────────────────────────────

function CaseStudyCard({ deal, caseStudy, onRegenerate, generating }) {
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    const doc = await generateCaseStudyPDF({ deal, caseStudy });
    const slug = (deal.brand_name || "campaign").toLowerCase().replace(/\s+/g, "-");
    doc.save(`case-study-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: "PDF downloaded", description: "Case study PDF saved successfully." });
  };

  return (
    <Card className="border-teal-200 bg-teal-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              {deal.brand_name || "Campaign"} — Case Study
            </CardTitle>
            <Badge className="bg-teal-100 text-teal-700 text-xs">{deal.deal_type || "Campaign"}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={onRegenerate}
              disabled={generating}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={handleDownloadPDF}
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5">
          {/* Metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Campaign Value", value: fmtMoney(deal.deal_value) },
              { label: "Platform", value: deal.platform || "—" },
              { label: "Status", value: deal.status || "—" },
              { label: "Period", value: `${fmtDate(deal.start_date)} – ${fmtDate(deal.end_date)}` },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-white rounded-lg border border-teal-100 text-center">
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          {[
            { icon: Target, label: "Challenge", color: "text-indigo-600", bg: "bg-indigo-50/60", border: "border-indigo-100", key: "challenge" },
            { icon: Lightbulb, label: "Solution", color: "text-teal-600", bg: "bg-teal-50/60", border: "border-teal-100", key: "solution" },
            { icon: BarChart3, label: "Results", color: "text-emerald-600", bg: "bg-emerald-50/60", border: "border-emerald-100", key: "results" },
          ].map(({ icon: Icon, label, color, bg, border, key }) => (
            caseStudy[key] && (
              <div key={key} className={`p-4 rounded-xl border ${bg} ${border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <h4 className={`text-sm font-bold ${color}`}>{label}</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{caseStudy[key]}</p>
              </div>
            )
          ))}

          {/* Testimonial */}
          {caseStudy.testimonial && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-600">Testimonial Placeholder</h4>
              </div>
              <p className="text-sm italic text-slate-600 leading-relaxed">
                &ldquo;{caseStudy.testimonial}&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-1">— {deal.brand_name || "Brand"} representative (placeholder)</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function CaseStudyGenerator() {
  const { toast } = useToast();
  const [selectedDealId, setSelectedDealId] = useState("");
  const [caseStudy, setCaseStudy]           = useState(null);
  const [generating, setGenerating]         = useState(false);
  const [error, setError]                   = useState(null);
  const [customContext, setCustomContext]    = useState("");

  // ── fetch completed deals from data_room_entries ──────────────────────────
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["case-study-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .select("id, title, brand_name, deal_type, platform, deal_value, start_date, end_date, notes, deliverables, performance_metrics, status")
        .eq("room_type", "agency_engagements")
        .in("status", ["completed", "active", "retainer"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const selectedDeal = useMemo(
    () => deals.find((d) => d.id === selectedDealId) || null,
    [deals, selectedDealId]
  );

  const handleGenerate = async () => {
    if (!selectedDeal) return;
    setGenerating(true);
    setError(null);
    setCaseStudy(null);

    try {
      const context = {
        brand: selectedDeal.brand_name,
        deal_type: selectedDeal.deal_type,
        platform: selectedDeal.platform,
        deal_value: selectedDeal.deal_value,
        deliverables: selectedDeal.deliverables,
        notes: selectedDeal.notes,
        performance_metrics: selectedDeal.performance_metrics,
        start_date: selectedDeal.start_date,
        end_date: selectedDeal.end_date,
        custom_context: customContext,
      };

      const res = await base44.functions.invoke("analyzeDealPatterns", {
        agent: "deal_patterns",
        action: "case_study",
        deal_context: context,
      });

      const raw = res?.data;

      // Try to extract structured sections from AI response
      if (raw?.case_study) {
        setCaseStudy(raw.case_study);
      } else if (raw?.analysis) {
        // Parse free-text analysis into sections
        const text = typeof raw.analysis === "string" ? raw.analysis : JSON.stringify(raw.analysis);
        setCaseStudy(parseCaseStudyFromText(text, selectedDeal));
      } else {
        // Fallback: generate a smart template from deal data
        setCaseStudy(generateFallbackCaseStudy(selectedDeal, customContext));
      }
    } catch (err) {
      // If it's an AI limit error, show it; otherwise fall back gracefully
      const msg = formatAIError(err);
      if (msg !== err?.message) {
        setError(msg);
      } else {
        setCaseStudy(generateFallbackCaseStudy(selectedDeal, customContext));
      }
    }

    setGenerating(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-600" />
          Case Study Generator
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Turn completed campaigns into polished case studies — with AI-generated narrative and PDF export
        </p>
      </div>

      {/* Selection form */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Select a Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Campaign / Engagement</Label>
            <Select value={selectedDealId} onValueChange={setSelectedDealId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={dealsLoading ? "Loading campaigns..." : "Select a completed campaign..."} />
              </SelectTrigger>
              <SelectContent>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.brand_name || "Unknown Brand"} — {d.deal_type || "Campaign"}{" "}
                    {d.start_date ? `(${fmtDate(d.start_date)})` : ""}
                    {d.deal_value ? ` · ${fmtMoney(d.deal_value)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {deals.length === 0 && !dealsLoading && (
              <p className="text-xs text-slate-400 mt-1.5">
                No campaigns found. Log engagements in the Client Engagements tab first.
              </p>
            )}
          </div>

          {selectedDeal && (
            <div>
              <Label>Additional Context (optional)</Label>
              <Textarea
                className="mt-1.5 text-sm"
                rows={3}
                placeholder="Add any specific outcomes, metrics, client quotes, or context you want included in the case study..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
              />
            </div>
          )}

          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            onClick={handleGenerate}
            disabled={!selectedDeal || generating}
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Case Study...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Case Study</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generating state */}
      {generating && (
        <div className="py-12 text-center bg-rose-50/30 rounded-xl border border-dashed border-rose-200">
          <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin text-rose-400" />
          <p className="text-sm text-slate-600 font-medium">AI is crafting your case study...</p>
          <p className="text-xs text-slate-400 mt-1">Analyzing campaign data and generating narrative</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Result */}
      {caseStudy && selectedDeal && !generating && (
        <CaseStudyCard
          deal={selectedDeal}
          caseStudy={caseStudy}
          onRegenerate={handleGenerate}
          generating={generating}
        />
      )}
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function parseCaseStudyFromText(text, deal) {
  // Try to extract sections if AI returned free-form text
  const lower = text.toLowerCase();

  const extract = (keyword, nextKeywords) => {
    const idx = lower.indexOf(keyword);
    if (idx === -1) return null;
    let end = text.length;
    for (const kw of nextKeywords) {
      const i = lower.indexOf(kw, idx + keyword.length);
      if (i !== -1 && i < end) end = i;
    }
    return text.slice(idx + keyword.length, end).replace(/^[:\s]+/, "").trim().slice(0, 600);
  };

  return {
    challenge: extract("challenge", ["solution", "approach", "results", "outcome"]) || generateChallenge(deal),
    solution: extract("solution", ["results", "outcome", "impact", "testimonial"]) || generateSolution(deal),
    results: extract("results", ["testimonial", "quote", "takeaway"]) || generateResults(deal),
    testimonial: extract("testimonial", ["takeaway", "conclusion"]) || generateTestimonial(deal),
  };
}

function generateFallbackCaseStudy(deal, customContext) {
  return {
    challenge: generateChallenge(deal, customContext),
    solution: generateSolution(deal, customContext),
    results: generateResults(deal, customContext),
    testimonial: generateTestimonial(deal),
  };
}

function generateChallenge(deal, extra = "") {
  const brand = deal.brand_name || "the brand";
  const type  = deal.deal_type || "influencer campaign";
  return `${brand} sought to ${extra ? extra.slice(0, 100) + " — " : ""}expand their digital reach through a targeted ${type}. The primary challenge was identifying the right talent mix to authentically engage their core audience while maximizing campaign ROI within a competitive ${deal.platform || "multi-platform"} landscape.`;
}

function generateSolution(deal, extra = "") {
  const deliverables = deal.deliverables || "a curated creator roster with platform-native content";
  return `Our agency developed a comprehensive ${deal.deal_type || "influencer"} strategy leveraging ${deliverables}. ${extra ? extra.slice(0, 150) + " " : ""}The campaign was executed across ${deal.platform || "key platforms"}, with data-driven talent selection and real-time performance monitoring to optimize content delivery and audience alignment throughout the campaign lifecycle.`;
}

function generateResults(deal, extra = "") {
  const value  = fmtMoney(deal.deal_value);
  const pm     = deal.performance_metrics || {};
  const parts  = [`Campaign managed with ${value} in total value.`];
  if (pm.impressions) parts.push(`Achieved ${Number(pm.impressions).toLocaleString()} impressions.`);
  if (pm.engagement_rate) parts.push(`Engagement rate of ${pm.engagement_rate}%.`);
  if (pm.roas) parts.push(`Delivered ${pm.roas}x ROAS.`);
  if (deal.notes) parts.push(deal.notes.slice(0, 200));
  if (extra) parts.push(extra.slice(0, 100));
  return parts.join(" ");
}

function generateTestimonial(deal) {
  const brand = deal.brand_name || "Our client";
  return `${brand} exceeded our expectations in how seamlessly they managed the entire campaign — from talent briefing to final reporting. The quality of creators and the results delivered made this one of our strongest partnerships of the year.`;
}

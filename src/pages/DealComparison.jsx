import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Layers,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  BarChart3,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Number(n).toLocaleString()}`;
}

const DEAL_STAGE_LABELS = {
  discovered: "Discovered",
  researching: "Research",
  outreach_pending: "Outreach Pending",
  outreach_sent: "Outreach Sent",
  responded: "Responded",
  negotiating: "Negotiating",
  contracted: "Contracted",
  active: "Active",
  completed: "Completed",
  churned: "Churned",
};

const DEAL_STAGE_COLORS = {
  discovered: "bg-slate-100 text-slate-700",
  researching: "bg-blue-50 text-blue-700",
  outreach_pending: "bg-indigo-50 text-indigo-700",
  outreach_sent: "bg-purple-50 text-purple-700",
  responded: "bg-amber-50 text-amber-700",
  negotiating: "bg-orange-50 text-orange-700",
  contracted: "bg-emerald-50 text-emerald-700",
  active: "bg-green-50 text-green-700",
  completed: "bg-teal-50 text-teal-700",
  churned: "bg-red-50 text-red-700",
};

// Fields used in the side-by-side comparison table
const COMPARE_FIELDS = [
  { key: "title", label: "Deal Title" },
  { key: "brand_name", label: "Brand" },
  { key: "talent_name", label: "Talent" },
  { key: "deal_value", label: "Deal Value", format: (v) => fmtMoney(v), numeric: true, higher_is_better: true },
  { key: "partnership_type", label: "Deal Type" },
  { key: "platform", label: "Platform" },
  { key: "status", label: "Status", format: (v) => DEAL_STAGE_LABELS[v] || v },
  { key: "duration", label: "Duration" },
  { key: "deliverables", label: "Deliverables" },
  { key: "match_score", label: "Match Score", format: (v) => (v ? `${v}%` : "—"), numeric: true, higher_is_better: true },
];

// ─── Deal selector dropdown ───────────────────────────────────────────────────

function DealSelector({ label, deals, selectedId, onSelect, excludeId }) {
  const filtered = deals.filter((d) => d.id !== excludeId);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select
          value={selectedId || ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
        >
          <option value="">Select a deal...</option>
          {filtered.map((d) => (
            <option key={d.id} value={d.id}>
              {d.brand_name || "Brand"}{d.talent_name ? ` × ${d.talent_name}` : ""}{d.title ? ` — ${d.title}` : ""}
            </option>
          ))}
        </select>
        <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Deal summary card (top of each column) ───────────────────────────────────

function DealSummaryCard({ deal, label, highlight }) {
  const stageColor = DEAL_STAGE_COLORS[deal.status] || DEAL_STAGE_COLORS.discovered;
  const stageLabel = DEAL_STAGE_LABELS[deal.status] || deal.status;

  return (
    <div className={`rounded-xl border-2 p-4 space-y-2 ${highlight ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-indigo-600" : "text-slate-400"}`}>
          {label}
        </span>
        {highlight && <Star className="w-4 h-4 text-indigo-500 fill-indigo-200" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 leading-tight">
        {deal.brand_name || "Brand"}{deal.talent_name ? ` × ${deal.talent_name}` : ""}
      </h3>
      {deal.title && <p className="text-xs text-slate-500">{deal.title}</p>}
      <div className="flex flex-wrap gap-2">
        {deal.deal_value > 0 && (
          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
            <DollarSign className="w-4 h-4" />
            {fmtMoney(deal.deal_value)}
          </div>
        )}
        <Badge className={`${stageColor} border text-[10px]`}>{stageLabel}</Badge>
        {deal.match_score && (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
            {deal.match_score}% match
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({ dealA, dealB, betterDeal }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/4">Field</th>
            <th className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide w-[37.5%] ${betterDeal === "A" ? "text-indigo-600 bg-indigo-50/40" : "text-slate-500"}`}>
              Deal A {betterDeal === "A" && <Star className="inline w-3 h-3 ml-1 fill-indigo-300 text-indigo-500" />}
            </th>
            <th className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide w-[37.5%] ${betterDeal === "B" ? "text-indigo-600 bg-indigo-50/40" : "text-slate-500"}`}>
              Deal B {betterDeal === "B" && <Star className="inline w-3 h-3 ml-1 fill-indigo-300 text-indigo-500" />}
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_FIELDS.map((field, idx) => {
            const rawA = dealA[field.key];
            const rawB = dealB[field.key];
            const valA = field.format ? field.format(rawA) : (rawA ?? "—");
            const valB = field.format ? field.format(rawB) : (rawB ?? "—");
            const isDiff = String(valA) !== String(valB);

            // Determine which is better for numeric fields
            let aIsBetter = false;
            let bIsBetter = false;
            if (field.numeric && rawA != null && rawB != null) {
              const numA = Number(rawA);
              const numB = Number(rawB);
              if (field.higher_is_better) {
                aIsBetter = numA > numB;
                bIsBetter = numB > numA;
              } else {
                aIsBetter = numA < numB;
                bIsBetter = numB < numA;
              }
            }

            return (
              <tr key={field.key} className={`border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <td className="px-4 py-3 text-xs text-slate-500 font-medium">{field.label}</td>
                <td className={`px-4 py-3 text-xs font-medium ${betterDeal === "A" ? "bg-indigo-50/20" : ""} ${
                  aIsBetter ? "text-green-700" : bIsBetter ? "text-red-600" : "text-slate-700"
                }`}>
                  <span className="flex items-center gap-1.5">
                    {aIsBetter && <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />}
                    {bIsBetter && <TrendingDown className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    {!aIsBetter && !bIsBetter && isDiff && <Minus className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                    <span>{String(valA)}</span>
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs font-medium ${betterDeal === "B" ? "bg-indigo-50/20" : ""} ${
                  bIsBetter ? "text-green-700" : aIsBetter ? "text-red-600" : "text-slate-700"
                }`}>
                  <span className="flex items-center gap-1.5">
                    {bIsBetter && <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />}
                    {aIsBetter && <TrendingDown className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    {!aIsBetter && !bIsBetter && isDiff && <Minus className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                    <span>{String(valB)}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── AI analysis result panel ─────────────────────────────────────────────────

function AIAnalysisPanel({ analysis }) {
  const betterLabel = analysis.better_value === "A" ? "Deal A" : analysis.better_value === "B" ? "Deal B" : null;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-purple-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Deal Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation banner */}
        {betterLabel && (
          <div className="flex items-start gap-3 rounded-xl bg-indigo-600 p-4 text-white">
            <Star className="w-5 h-5 mt-0.5 flex-shrink-0 fill-indigo-300 text-white" />
            <div>
              <p className="text-sm font-bold mb-0.5">Take {betterLabel}</p>
              {analysis.reasoning && (
                <p className="text-xs text-indigo-100 leading-relaxed">{analysis.reasoning}</p>
              )}
            </div>
          </div>
        )}

        {/* Key differences */}
        {Array.isArray(analysis.key_differences) && analysis.key_differences.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-2">
              Key Differences
            </p>
            <div className="space-y-1.5">
              {analysis.key_differences.map((diff, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2.5">
                  <BarChart3 className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-700 leading-relaxed">{diff}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-2">
              Recommendations
            </p>
            <div className="space-y-1.5">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2.5">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DealComparison() {
  const { toast } = useToast();
  const [dealAId, setDealAId] = useState(null);
  const [dealBId, setDealBId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Fetch all partnerships
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["partnerships_comparison"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const dealA = useMemo(() => deals.find((d) => d.id === dealAId) ?? null, [deals, dealAId]);
  const dealB = useMemo(() => deals.find((d) => d.id === dealBId) ?? null, [deals, dealBId]);

  const canCompare = dealA && dealB;

  // Parse AI JSON response (handles markdown-fenced JSON)
  const parseAiJson = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    let str = String(raw).trim();
    const fence = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) str = fence[1].trim();
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const handleCompare = async () => {
    if (!canCompare) return;
    setAnalyzing(true);
    setAiAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-router", {
        body: {
          agent: "contract_intelligence",
          prompt: `Compare these two partnership deals and identify key differences, which is better value, and recommendations:
Deal A: ${JSON.stringify(dealA)}
Deal B: ${JSON.stringify(dealB)}
Return JSON: { key_differences: [...], better_value: 'A' or 'B', reasoning, recommendations: [...] }`,
        },
      });

      if (error) throw new Error(error.message || "AI router error");

      const rawContent =
        data?.result ?? data?.content ?? data?.response ?? data?.analysis ?? data;

      const parsed = parseAiJson(rawContent);
      if (!parsed) throw new Error("AI returned an unexpected response format.");

      setAiAnalysis(parsed);
      toast({ title: "Analysis complete", description: "AI comparison ready." });
    } catch (err) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deal Comparison</h1>
        </div>
        <p className="text-sm text-slate-500">Select two deals to compare side-by-side and get an AI-powered recommendation.</p>
      </div>

      {/* Deal selectors */}
      <Card className="border-slate-200/60">
        <CardContent className="pt-5">
          {dealsLoading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              <span className="text-sm text-slate-500">Loading deals...</span>
            </div>
          ) : deals.length < 2 ? (
            <div className="flex items-center gap-2 text-slate-500 py-4">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <span className="text-sm">You need at least 2 deals to compare. Create some deals in Partnerships first.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <DealSelector
                label="Deal A"
                deals={deals}
                selectedId={dealAId}
                onSelect={(id) => { setDealAId(id); setAiAnalysis(null); }}
                excludeId={dealBId}
              />
              <div className="flex items-center justify-center pb-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400">vs</span>
                </div>
              </div>
              <DealSelector
                label="Deal B"
                deals={deals}
                selectedId={dealBId}
                onSelect={(id) => { setDealBId(id); setAiAnalysis(null); }}
                excludeId={dealAId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-side deal summaries */}
      {canCompare && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DealSummaryCard deal={dealA} label="Deal A" highlight={aiAnalysis?.better_value === "A"} />
            <DealSummaryCard deal={dealB} label="Deal B" highlight={aiAnalysis?.better_value === "B"} />
          </div>

          {/* Comparison table */}
          <ComparisonTable
            dealA={dealA}
            dealB={dealB}
            betterDeal={aiAnalysis?.better_value ?? null}
          />

          {/* AI Compare button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={analyzing}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2.5 h-auto text-sm font-semibold shadow-sm"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Deals...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Compare These Deals
                </>
              )}
            </Button>
          </div>

          {/* "Which deal should I take?" — AI recommendation */}
          {aiAnalysis && (
            <>
              {/* Quick answer banner */}
              <div className={`rounded-xl border-2 p-4 flex items-start gap-3 ${
                aiAnalysis.better_value === "A"
                  ? "border-indigo-300 bg-indigo-50"
                  : aiAnalysis.better_value === "B"
                  ? "border-purple-300 bg-purple-50"
                  : "border-slate-200 bg-slate-50"
              }`}>
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  aiAnalysis.better_value === "A" ? "text-indigo-600" :
                  aiAnalysis.better_value === "B" ? "text-purple-600" : "text-slate-400"
                }`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Which deal should you take?{" "}
                    <span className={`${
                      aiAnalysis.better_value === "A" ? "text-indigo-700" :
                      aiAnalysis.better_value === "B" ? "text-purple-700" : "text-slate-600"
                    }`}>
                      {aiAnalysis.better_value === "A"
                        ? `Deal A — ${dealA.brand_name || "Brand"}`
                        : aiAnalysis.better_value === "B"
                        ? `Deal B — ${dealB.brand_name || "Brand"}`
                        : "Both deals are comparable"}
                    </span>
                  </p>
                  {aiAnalysis.reasoning && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{aiAnalysis.reasoning}</p>
                  )}
                </div>
              </div>

              {/* Full AI analysis panel */}
              <AIAnalysisPanel analysis={aiAnalysis} />
            </>
          )}
        </>
      )}

      {/* Empty state */}
      {!canCompare && !dealsLoading && deals.length >= 2 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Layers className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Select two deals above to begin comparing</p>
          <p className="text-slate-400 text-xs max-w-sm">
            Choose Deal A and Deal B from the dropdowns to see a side-by-side breakdown and get an AI recommendation.
          </p>
        </div>
      )}
    </div>
  );
}

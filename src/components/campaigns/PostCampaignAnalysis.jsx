import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, CheckCircle2, AlertTriangle, Lightbulb,
  TrendingUp, Heart, RefreshCw, BarChart3, Target, Star
} from "lucide-react";

const RATING_CONFIG = {
  excellent:      { color: "bg-emerald-100 text-emerald-800 border-emerald-300", stars: 5 },
  good:           { color: "bg-green-100 text-green-800 border-green-300",   stars: 4 },
  average:        { color: "bg-amber-100 text-amber-800 border-amber-300",   stars: 3 },
  below_average:  { color: "bg-orange-100 text-orange-800 border-orange-300",stars: 2 },
  poor:           { color: "bg-red-100 text-red-800 border-red-300",         stars: 1 },
};

const REPEAT_CONFIG = {
  strongly_yes: { label: "Strongly Recommend Repeating", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  yes:          { label: "Recommend Repeating",           color: "text-green-700 bg-green-50 border-green-200" },
  neutral:      { label: "Neutral on Repeating",          color: "text-amber-700 bg-amber-50 border-amber-200" },
  no:           { label: "Don't Recommend Repeating",     color: "text-orange-700 bg-orange-50 border-orange-200" },
  strongly_no:  { label: "Avoid Repeating",               color: "text-red-700 bg-red-50 border-red-200" },
};

const RELATIONSHIP_CONFIG = {
  strong:   { label: "Strong Relationship", color: "text-emerald-600" },
  neutral:  { label: "Neutral Relationship", color: "text-amber-600" },
  strained: { label: "Strained Relationship", color: "text-red-500" },
  unknown:  { label: "Unknown", color: "text-slate-400" },
};

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= count ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export default function PostCampaignAnalysis() {
  const [selectedId, setSelectedId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dealTitle, setDealTitle] = useState("");

  const { data: completedDeals = [] } = useQuery({
    queryKey: ["completed-partnerships"],
    queryFn: async () => {
      const all = await base44.entities.Partnership.list("-updated_date", 300);
      return all.filter(p => p.status === "completed");
    },
  });

  const runAnalysis = async () => {
    if (!selectedId) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await base44.functions.invoke("analyzeCampaignPostMortem", { partnership_id: selectedId });
      setAnalysis(res.data.analysis);
      setDealTitle(res.data.deal_title);
    } catch (err) {
      console.error("Post-campaign analysis failed:", err);
      setAnalysis(null);
      alert(formatAIError(err));
    }
    setLoading(false);
  };

  const ratingCfg = analysis ? (RATING_CONFIG[analysis.overall_rating] || RATING_CONFIG.average) : null;
  const repeatCfg = analysis ? (REPEAT_CONFIG[analysis.repeat_recommendation] || REPEAT_CONFIG.neutral) : null;
  const relCfg = analysis ? (RELATIONSHIP_CONFIG[analysis.relationship_quality] || RELATIONSHIP_CONFIG.unknown) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-purple-50 border-purple-200 text-purple-700">
        <BarChart3 className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Automated Post-Campaign Analysis</p>
          <p className="text-xs opacity-75 mt-0.5">
            AI reviews OutreachMetrics, DealNotes, and Activity logs for completed partnerships to surface key successes, challenges, and lessons learned.
          </p>
        </div>
      </div>

      {/* Selector */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Select Completed Partnership
              </label>
              <select
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setAnalysis(null); }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">— Choose a completed deal —</option>
                {completedDeals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.title}{d.brand_name ? ` · ${d.brand_name}` : ""}{d.deal_value ? ` · $${(d.deal_value / 1000).toFixed(0)}K` : ""}
                  </option>
                ))}
              </select>
              {completedDeals.length === 0 && (
                <p className="text-[11px] text-slate-400 mt-1">No completed partnerships found. Move a deal to "Completed" status first.</p>
              )}
            </div>
            <Button
              onClick={runAnalysis}
              disabled={!selectedId || loading}
              className="bg-purple-600 hover:bg-purple-700 shrink-0"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Analyzing…</>
                : <><Sparkles className="w-4 h-4 mr-1.5" />Run Analysis</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-400" />
          <p className="text-sm text-slate-500 font-medium">Reviewing campaign data…</p>
          <p className="text-xs text-slate-400 mt-1">Analyzing notes, outreach metrics & activity logs</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Overall rating */}
          <Card className="border-slate-200/60">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Campaign</p>
                  <p className="text-base font-bold text-slate-900">{dealTitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${ratingCfg.color} text-xs font-semibold capitalize`}>
                      {analysis.overall_rating?.replace(/_/g, " ")}
                    </Badge>
                    <StarRating count={ratingCfg.stars} />
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${repeatCfg.color}`}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  {repeatCfg.label}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{analysis.executive_summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Successes */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Successes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.key_successes?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Key Challenges */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.key_challenges?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                  {(!analysis.key_challenges || analysis.key_challenges.length === 0) && (
                    <li className="text-xs text-slate-400 italic">No significant challenges identified</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Lessons Learned */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-400" /> Lessons Learned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.lessons_learned?.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />{l}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Optimization Opportunities */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-500" /> Do Differently Next Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.optimization_opportunities?.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-purple-500 font-bold shrink-0">{i + 1}.</span>{o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick insights row */}
          <Card className="border-slate-200/60">
            <CardContent className="p-4 space-y-2">
              {analysis.outreach_assessment && (
                <div className="flex items-start gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Outreach:</strong> <span className="text-slate-600">{analysis.outreach_assessment}</span></span>
                </div>
              )}
              {analysis.relationship_notes && (
                <div className="flex items-start gap-2 text-xs">
                  <Heart className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${relCfg.color}`} />
                  <span><strong className="text-slate-700">Relationship ({relCfg.label}):</strong> <span className="text-slate-600">{analysis.relationship_notes}</span></span>
                </div>
              )}
              {analysis.roi_assessment && (
                <div className="flex items-start gap-2 text-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">ROI:</strong> <span className="text-slate-600">{analysis.roi_assessment}</span></span>
                </div>
              )}
              {analysis.benchmark_comparison && (
                <div className="flex items-start gap-2 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Benchmarks:</strong> <span className="text-slate-500 italic">{analysis.benchmark_comparison}</span></span>
                </div>
              )}
              {analysis.repeat_reasoning && (
                <div className="flex items-start gap-2 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Repeat:</strong> <span className="text-slate-600">{analysis.repeat_reasoning}</span></span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
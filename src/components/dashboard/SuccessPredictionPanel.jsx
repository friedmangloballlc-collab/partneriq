import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Sparkles, ChevronRight, Loader2, ShieldCheck, Lightbulb, Target
} from "lucide-react";

const VERDICT_CONFIG = {
  strong_bet:  { color: "bg-emerald-50 border-emerald-200",  badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500", icon: CheckCircle2,  iconColor: "text-emerald-600" },
  promising:   { color: "bg-indigo-50 border-indigo-200",    badge: "bg-indigo-100 text-indigo-800",   bar: "bg-indigo-500",   icon: TrendingUp,    iconColor: "text-indigo-600" },
  risky:       { color: "bg-amber-50 border-amber-200",      badge: "bg-amber-100 text-amber-800",     bar: "bg-amber-500",    icon: AlertTriangle, iconColor: "text-amber-600" },
  avoid:       { color: "bg-red-50 border-red-200",          badge: "bg-red-100 text-red-800",         bar: "bg-red-500",      icon: TrendingDown,  iconColor: "text-red-600" },
};

const CONFIDENCE_COLORS = {
  low: "text-slate-400",
  medium: "text-amber-600",
  high: "text-emerald-600",
};

export default function SuccessPredictionPanel({ partnerships = [] }) {
  const [selectedId, setSelectedId] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [partnershipTitle, setPartnershipTitle] = useState("");

  const activePartnerships = partnerships.filter(p =>
    !["completed", "churned"].includes(p.status)
  );

  const runPrediction = async () => {
    if (!selectedId) return;
    setLoading(true);
    setPrediction(null);
    const res = await base44.functions.invoke("predictPartnershipSuccess", { partnership_id: selectedId });
    setPrediction(res.data.prediction);
    setPartnershipTitle(res.data.partnership_title);
    setLoading(false);
  };

  const cfg = prediction ? (VERDICT_CONFIG[prediction.verdict] || VERDICT_CONFIG.promising) : null;
  const VerdictIcon = cfg?.icon;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Partnership Success Predictor</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">AI-powered win probability based on match score, engagement & history</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selector */}
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder="Select a partnership to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {activePartnerships.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="font-medium">{p.title}</span>
                  {p.match_score && <span className="text-slate-400 ml-2 text-xs">· {p.match_score}% match</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={runPrediction}
            disabled={!selectedId || loading}
            className="bg-violet-600 hover:bg-violet-700 shrink-0"
            size="sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Predict</>}
          </Button>
        </div>

        {/* Empty state */}
        {!prediction && !loading && (
          <div className="text-center py-8 text-slate-400">
            <Brain className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Select a deal and run the AI predictor</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-slate-400">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-violet-400" />
            <p className="text-sm text-slate-500">Analyzing deal data & historical patterns...</p>
          </div>
        )}

        {/* Result */}
        {prediction && cfg && (
          <div className={`rounded-xl border-2 p-4 space-y-4 ${cfg.color}`}>

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <VerdictIcon className={`w-5 h-5 flex-shrink-0 ${cfg.iconColor}`} />
                <div>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{partnershipTitle}</p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">{prediction.headline}</p>
                </div>
              </div>
              <Badge className={`${cfg.badge} text-xs font-bold shrink-0`}>{prediction.verdict_label}</Badge>
            </div>

            {/* Probability bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Success Probability</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase ${CONFIDENCE_COLORS[prediction.confidence]}`}>
                    {prediction.confidence} confidence
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{prediction.success_probability}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${prediction.success_probability}%` }}
                />
              </div>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Strengths
                </p>
                <ul className="space-y-1">
                  {prediction.key_strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Risks
                </p>
                <ul className="space-y-1">
                  {prediction.risk_factors?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <Target className="w-3 h-3 text-indigo-500" /> Recommended Actions
              </p>
              <ul className="space-y-1">
                {prediction.recommended_actions?.map((a, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />{a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Historical insight */}
            {prediction.comparable_deal_insight && (
              <div className="bg-white/50 rounded-lg p-2.5 flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 italic">{prediction.comparable_deal_insight}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
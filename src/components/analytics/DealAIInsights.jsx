import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, TrendingUp, AlertTriangle, CheckCircle2,
  Zap, Mail, Brain, ArrowRight
} from "lucide-react";

const IMPACT_CONFIG = {
  high:   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  medium: { badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
  low:    { badge: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
};

export default function DealAIInsights() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await base44.functions.invoke("analyzeDealPatterns", {});
      if (res.data?.error) setError(res.data.error);
      else setAnalysis(res.data?.analysis);
    } catch (err) {
      setError(formatAIError(err));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Trigger bar */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800">AI Deal Pattern Analysis</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Correlates OutreachSequence data with Partnership outcomes to surface winning strategies, risk factors, and outreach intelligence.
              </p>
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Analyzing…</>
              : <><Sparkles className="w-4 h-4 mr-1.5" />Run AI Analysis</>}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-500 font-medium">Analyzing deal history, outreach patterns & outcomes…</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Executive summary */}
          <Card className="border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 mb-2">
                <Brain className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Executive Summary</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{analysis.executive_summary}</p>
            </CardContent>
          </Card>

          {/* Top 3 actions */}
          {analysis.top_3_actions?.length > 0 && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Top 3 Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.top_3_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Winning patterns */}
            {analysis.winning_patterns?.length > 0 && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Winning Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.winning_patterns.map((p, i) => {
                    const cfg = IMPACT_CONFIG[p.impact] || IMPACT_CONFIG.medium;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-xs font-semibold text-slate-800">{p.pattern}</span>
                          <Badge className={`text-[10px] ml-auto ${cfg.badge}`}>{p.impact} impact</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-1">{p.evidence}</p>
                        <p className="text-[11px] text-emerald-700 font-medium flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />{p.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Risk factors */}
            {analysis.risk_factors?.length > 0 && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.risk_factors.map((r, i) => {
                    const cfg = IMPACT_CONFIG[r.severity] || IMPACT_CONFIG.medium;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-red-50/50 border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-xs font-semibold text-slate-800">{r.factor}</span>
                          <Badge className={`text-[10px] ml-auto ${cfg.badge}`}>{r.severity}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-1">{r.evidence}</p>
                        <p className="text-[11px] text-rose-700 font-medium flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />{r.mitigation}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Outreach intelligence */}
          {analysis.outreach_intelligence && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-500" /> Outreach Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold text-slate-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  💡 {analysis.outreach_intelligence.headline}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Best Method", value: analysis.outreach_intelligence.best_method, color: "text-emerald-700" },
                    { label: "Avoid",       value: analysis.outreach_intelligence.avoid,       color: "text-red-600" },
                    { label: "Sequences",   value: analysis.outreach_intelligence.sequence_impact, color: "text-blue-700" },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`text-xs ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Match score + type + pipeline health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(analysis.match_score_insight || analysis.type_recommendation) && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Quality Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.match_score_insight && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Match Score Insight</p>
                      <p className="text-xs text-slate-600">{analysis.match_score_insight}</p>
                    </div>
                  )}
                  {analysis.type_recommendation && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Type to Prioritize</p>
                      <p className="text-xs text-slate-600">{analysis.type_recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {analysis.pipeline_health && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Pipeline Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysis.pipeline_health}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
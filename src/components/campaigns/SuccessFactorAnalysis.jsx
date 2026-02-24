import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Trophy, AlertTriangle, Lightbulb,
  TrendingUp, Target, CheckCircle2, Shield, Info, ArrowRight
} from "lucide-react";

const IMPACT_CONFIG = {
  critical: { color: "bg-red-100 text-red-700 border-red-200",     bar: "bg-red-500",     width: "w-full" },
  high:     { color: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-amber-500",   width: "w-3/4" },
  medium:   { color: "bg-blue-100 text-blue-700 border-blue-200",   bar: "bg-blue-400",    width: "w-1/2" },
  low:      { color: "bg-slate-100 text-slate-600 border-slate-200", bar: "bg-slate-300",  width: "w-1/4" },
};

const CONFIDENCE_CONFIG = {
  high:   "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-slate-100 text-slate-500",
};

export default function SuccessFactorAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setStats(null);
    const res = await base44.functions.invoke("identifySuccessFactors", {});
    if (res.data.error) {
      alert(res.data.error);
      setLoading(false);
      return;
    }
    setAnalysis(res.data.analysis);
    setStats(res.data.stats);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-700">
        <Trophy className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Success Factor Identification</p>
          <p className="text-xs opacity-75 mt-0.5">
            Analyzes all successful partnerships to surface common attributes — partnership type, talent tier, niche, platform — so you can replicate what works.
          </p>
        </div>
      </div>

      {/* Trigger */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Analyze Your Deal History</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Scans completed & active partnerships against churned deals to find statistically significant success patterns.
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={loading} className="bg-amber-600 hover:bg-amber-700 shrink-0">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Analyzing…</>
              : <><Sparkles className="w-4 h-4 mr-1.5" />Identify Factors</>}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-amber-400" />
          <p className="text-sm text-slate-500 font-medium">Scanning partnership patterns…</p>
          <p className="text-xs text-slate-400 mt-1">Comparing successful vs churned deals across all attributes</p>
        </div>
      )}

      {analysis && stats && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Deals Analyzed",    value: stats.total_successful + stats.total_unsuccessful, color: "text-slate-800" },
              { label: "Successful",         value: stats.total_successful,   color: "text-emerald-700" },
              { label: "Avg Match Score",    value: `${stats.avg_match_score}/100`, color: "text-indigo-700" },
              { label: "Avg Deal Value",     value: `$${(stats.avg_deal_value / 1000).toFixed(0)}K`, color: "text-amber-700" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Headline insight */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <Trophy className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-indigo-800">{analysis.headline_insight}</p>
          </div>

          {/* Success factors */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Key Success Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.success_factors?.map((f, i) => {
                const impactCfg = IMPACT_CONFIG[f.impact] || IMPACT_CONFIG.medium;
                const confCfg = CONFIDENCE_CONFIG[f.confidence] || CONFIDENCE_CONFIG.medium;
                return (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{f.factor}</span>
                        <Badge className={`text-[10px] ${impactCfg.color}`}>{f.impact} impact</Badge>
                        <Badge className={`text-[10px] ${confCfg}`}>{f.confidence} confidence</Badge>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ {f.winning_value}
                      </span>
                    </div>
                    {/* Impact bar */}
                    <div className="h-1 bg-slate-200 rounded-full mb-2">
                      <div className={`h-1 rounded-full ${impactCfg.bar} ${impactCfg.width}`} />
                    </div>
                    <p className="text-xs text-slate-600">{f.explanation}</p>
                    <p className="text-xs text-indigo-700 mt-1 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />{f.recommendation}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Winning profile */}
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" /> Winning Deal Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.winning_profile && (
                  <>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{analysis.winning_profile.summary}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Type",          value: analysis.winning_profile.partnership_type },
                        { label: "Talent Tier",   value: analysis.winning_profile.talent_tier },
                        { label: "Niche",         value: analysis.winning_profile.talent_niche },
                        { label: "Platform",      value: analysis.winning_profile.platform },
                        { label: "Brand Segment", value: analysis.winning_profile.brand_industry },
                        { label: "Min Match",     value: analysis.winning_profile.min_match_score ? `${analysis.winning_profile.min_match_score}+` : null },
                      ].filter(r => r.value).map(r => (
                        <div key={r.label} className="flex items-center justify-between bg-white border border-emerald-100 rounded-lg px-3 py-2">
                          <span className="text-[11px] text-slate-500 font-medium">{r.label}</span>
                          <span className="text-xs font-bold text-emerald-700 capitalize">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Red flags */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-400" /> Red Flags to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.red_flags?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 p-2 rounded-lg bg-red-50 border border-red-100">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Replication playbook */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Replication Playbook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analysis.replication_playbook?.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Data note */}
          {analysis.data_quality_note && (
            <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="italic">{analysis.data_quality_note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
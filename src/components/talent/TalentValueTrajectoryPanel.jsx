import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Sparkles, Loader2,
  Zap, DollarSign, Users, AlertTriangle, CheckCircle2,
  Clock, Target, Lightbulb, Minus, Star
} from "lucide-react";

const TRAJECTORY_CONFIG = {
  breakout:      { color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-800", icon: Zap,          iconColor: "text-purple-600", bar: "bg-purple-500" },
  rising_star:   { color: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-800", icon: TrendingUp, iconColor: "text-emerald-600", bar: "bg-emerald-500" },
  steady_growth: { color: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-800", icon: TrendingUp,   iconColor: "text-indigo-600", bar: "bg-indigo-400" },
  plateau:       { color: "bg-amber-50 border-amber-200",   badge: "bg-amber-100 text-amber-800",   icon: Minus,        iconColor: "text-amber-600",  bar: "bg-amber-400" },
  declining:     { color: "bg-red-50 border-red-200",       badge: "bg-red-100 text-red-800",       icon: TrendingDown, iconColor: "text-red-600",    bar: "bg-red-400" },
};

const URGENCY_CONFIG = {
  act_now:      { color: "bg-red-100 text-red-700 border-red-200",       label: "🔥 Act Now" },
  watch:        { color: "bg-amber-100 text-amber-700 border-amber-200", label: "👀 Watch Closely" },
  low_priority: { color: "bg-slate-100 text-slate-600 border-slate-200", label: "💤 Low Priority" },
};

const GROWTH_COLORS = {
  rapid:    "text-emerald-600",
  moderate: "text-indigo-600",
  flat:     "text-slate-500",
  declining: "text-red-500",
};

const ENGAGEMENT_COLORS = {
  improving: "text-emerald-600",
  stable:    "text-indigo-600",
  at_risk:   "text-red-500",
};

function ValueBar({ label, value, maxValue, color = "bg-indigo-400" }) {
  const pct = maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-slate-800">${value?.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AlphaGauge({ score }) {
  const pct = score || 0;
  const color = pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-500";
  const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> Discovery Alpha Score
          </span>
          <span className={`text-sm font-bold ${color}`}>{pct}/100</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function TalentValueTrajectoryPanel({ talent }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    if (!talent?.id) return;
    setLoading(true);
    setPrediction(null);
    try {
      const res = await base44.functions.invoke("predictTalentValueTrajectory", { talent_id: talent.id });
      setPrediction(res.data.prediction);
    } catch (err) {
      console.error("Talent trajectory prediction failed:", err);
      alert(formatAIError(err));
    }
    setLoading(false);
  };

  const cfg = prediction ? (TRAJECTORY_CONFIG[prediction.trajectory_prediction] || TRAJECTORY_CONFIG.steady_growth) : null;
  const TrajectoryIcon = cfg?.icon;
  const urgencyCfg = prediction ? (URGENCY_CONFIG[prediction.urgency] || URGENCY_CONFIG.watch) : null;
  const maxVal = prediction ? prediction.predicted_market_value_12m * 1.1 : 1;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Value Trajectory Prediction</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">AI-powered market value & growth forecast</p>
            </div>
          </div>
          <Button
            onClick={runPrediction}
            disabled={!talent?.id || loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 shrink-0"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Predict</>}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!prediction && !loading && (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Click Predict to analyze {talent?.name || "this talent"}'s value trajectory</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-400" />
            <p className="text-sm text-slate-500">Analyzing growth signals, deal history & cohort benchmarks...</p>
          </div>
        )}

        {prediction && cfg && (
          <div className={`rounded-xl border-2 p-4 space-y-4 ${cfg.color}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-start gap-2">
                <TrajectoryIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{prediction.headline}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{prediction.trajectory_reasoning}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge className={`${cfg.badge} text-xs font-bold`}>{prediction.trajectory_label}</Badge>
                <Badge variant="outline" className={`text-xs font-semibold border ${urgencyCfg.color}`}>
                  {urgencyCfg.label}
                </Badge>
              </div>
            </div>

            {/* Alpha Score */}
            <div className="bg-white/60 rounded-lg p-3 space-y-1">
              <AlphaGauge score={prediction.discovery_alpha_score} />
              <p className="text-[11px] text-slate-500 italic">{prediction.alpha_reasoning}</p>
            </div>

            {/* Market value projections */}
            <div className="bg-white/60 rounded-lg p-3 space-y-2.5">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Rate per Post Projection
              </p>
              <ValueBar label="Current" value={prediction.current_market_value} maxValue={maxVal} color="bg-slate-300" />
              <ValueBar label="6 months" value={prediction.predicted_market_value_6m} maxValue={maxVal} color="bg-indigo-400" />
              <ValueBar label="12 months" value={prediction.predicted_market_value_12m} maxValue={maxVal} color={cfg.bar} />
              {prediction.value_upside_pct > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">+{prediction.value_upside_pct}% value upside</span>
                  <span className="text-xs text-slate-400">over 12 months</span>
                </div>
              )}
            </div>

            {/* Follower projection + engagement outlook */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> Audience Growth
                </p>
                <p className={`text-xs font-bold capitalize mb-1.5 ${GROWTH_COLORS[prediction.follower_growth_projection] || "text-slate-600"}`}>
                  {prediction.follower_growth_projection?.replace(/_/g, " ")}
                </p>
                {prediction.predicted_followers_6m && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">6mo: </span>
                      {prediction.predicted_followers_6m >= 1e6
                        ? `${(prediction.predicted_followers_6m / 1e6).toFixed(1)}M`
                        : `${(prediction.predicted_followers_6m / 1000).toFixed(0)}K`}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">12mo: </span>
                      {prediction.predicted_followers_12m >= 1e6
                        ? `${(prediction.predicted_followers_12m / 1e6).toFixed(1)}M`
                        : `${(prediction.predicted_followers_12m / 1000).toFixed(0)}K`}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3 text-rose-400" /> Engagement Outlook
                </p>
                <p className={`text-xs font-bold capitalize mb-1.5 ${ENGAGEMENT_COLORS[prediction.engagement_outlook] || "text-slate-600"}`}>
                  {prediction.engagement_outlook?.replace(/_/g, " ")}
                </p>
                {prediction.ideal_deal_structure && (
                  <p className="text-[11px] text-slate-600 leading-snug">{prediction.ideal_deal_structure}</p>
                )}
              </div>
            </div>

            {/* Best fit niches + partnership types */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-indigo-400" /> Best Brand Fits Right Now
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prediction.brand_fit_niches?.map((n, i) => (
                  <Badge key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium capitalize">
                    {n}
                  </Badge>
                ))}
                {prediction.partnership_type_recommendations?.map((t, i) => (
                  <Badge key={`pt-${i}`} variant="outline" className="text-[10px] font-medium capitalize text-slate-600">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Catalysts & Risks */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Growth Catalysts
                </p>
                <ul className="space-y-1">
                  {prediction.growth_catalysts?.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                      <span className="text-emerald-500 flex-shrink-0">✓</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Risk Factors
                </p>
                <ul className="space-y-1">
                  {prediction.risk_factors?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                      <span className="text-amber-500 flex-shrink-0">⚠</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1 border-t border-white/40">
              <p className="text-[11px] text-slate-500 italic">{prediction.competitive_context}</p>
              {prediction.urgency_reasoning && (
                <div className={`mt-1.5 flex items-start gap-1.5 text-[11px] px-2 py-1.5 rounded-lg border ${urgencyCfg.color}`}>
                  <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  {prediction.urgency_reasoning}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
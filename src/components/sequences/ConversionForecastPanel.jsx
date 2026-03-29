import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Sparkles, Loader2, Eye, Reply,
  Clock, Target, Lightbulb, AlertTriangle, CheckCircle2, Minus, Zap
} from "lucide-react";

const VERDICT_CONFIG = {
  high_converter: { color: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500", icon: TrendingUp, iconColor: "text-emerald-600" },
  average:        { color: "bg-indigo-50 border-indigo-200",   badge: "bg-indigo-100 text-indigo-800",   bar: "bg-indigo-500",   icon: Minus,      iconColor: "text-indigo-600" },
  underperformer: { color: "bg-amber-50 border-amber-200",     badge: "bg-amber-100 text-amber-800",     bar: "bg-amber-400",    icon: AlertTriangle, iconColor: "text-amber-600" },
  needs_work:     { color: "bg-red-50 border-red-200",         badge: "bg-red-100 text-red-800",         bar: "bg-red-400",      icon: TrendingDown, iconColor: "text-red-600" },
};

const STEP_TYPE_COLORS = {
  initial_outreach: "bg-indigo-100 text-indigo-700",
  follow_up:        "bg-slate-100 text-slate-600",
  proposal:         "bg-violet-100 text-violet-700",
  negotiation:      "bg-amber-100 text-amber-700",
  thank_you:        "bg-emerald-100 text-emerald-700",
};

function MiniBar({ value, color = "bg-indigo-400", label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{value}%</span>
      {label && <span className="text-[10px] text-slate-400">{label}</span>}
    </div>
  );
}

export default function ConversionForecastPanel({ sequences = [] }) {
  const [selectedId, setSelectedId] = useState("");
  const [forecast, setForecast] = useState(null);
  const [sequenceName, setSequenceName] = useState("");
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    if (!selectedId) return;
    setLoading(true);
    setForecast(null);
    try {
      const res = await base44.functions.invoke("forecastOutreachConversion", { sequence_id: selectedId });
      setForecast(res.data.forecast);
      setSequenceName(res.data.sequence_name);
    } catch (err) {
      console.error("Conversion forecast failed:", err);
      alert(formatAIError(err));
    }
    setLoading(false);
  };

  const cfg = forecast ? (VERDICT_CONFIG[forecast.verdict] || VERDICT_CONFIG.average) : null;
  const VerdictIcon = cfg?.icon;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Conversion Forecaster</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">AI predicts open rate, reply rate & conversion probability per sequence</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selector */}
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder="Select a sequence to forecast..." />
            </SelectTrigger>
            <SelectContent>
              {sequences.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-slate-400 ml-2 text-xs">· {s.status}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={runForecast}
            disabled={!selectedId || loading}
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
            size="sm"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Forecast</>}
          </Button>
        </div>

        {!forecast && !loading && (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Select a sequence to run the AI forecast</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-400" />
            <p className="text-sm text-slate-500">Analyzing sequence structure, talent data & benchmarks...</p>
          </div>
        )}

        {forecast && cfg && (
          <div className={`rounded-xl border-2 p-4 space-y-4 ${cfg.color}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <VerdictIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">{sequenceName}</p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">{forecast.headline}</p>
                </div>
              </div>
              <Badge className={`${cfg.badge} text-xs font-bold shrink-0`}>{forecast.verdict_label}</Badge>
            </div>

            {/* 3 KPI bars */}
            <div className="bg-white/60 rounded-lg p-3 space-y-2.5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                    <Target className="w-3 h-3 text-violet-500" /> Conversion Probability
                  </span>
                  <span className={`text-[10px] font-semibold uppercase ${forecast.confidence === 'high' ? 'text-emerald-600' : forecast.confidence === 'medium' ? 'text-amber-600' : 'text-slate-400'}`}>
                    {forecast.confidence} confidence
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${forecast.conversion_probability}%` }} />
                  </div>
                  <span className="text-lg font-bold text-slate-900 w-12 text-right">{forecast.conversion_probability}%</span>
                </div>
              </div>
              <MiniBar value={forecast.projected_open_rate} color="bg-amber-400" label="projected open" />
              <MiniBar value={forecast.projected_reply_rate} color="bg-emerald-400" label="projected reply" />
            </div>

            {/* Per-step forecasts */}
            {forecast.step_forecasts?.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Step-by-Step Forecast</p>
                <div className="space-y-2">
                  {forecast.step_forecasts.map((sf, i) => {
                    const isStrongest = sf.step === forecast.strongest_step;
                    const isWeakest = sf.step === forecast.weakest_step;
                    return (
                      <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg ${isStrongest ? 'bg-emerald-50/80' : isWeakest ? 'bg-red-50/80' : 'bg-white/50'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5
                          ${isStrongest ? 'bg-emerald-500 text-white' : isWeakest ? 'bg-red-400 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {sf.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STEP_TYPE_COLORS[sf.type] || 'bg-slate-100 text-slate-600'}`}>
                              {sf.type?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{sf.projected_open_rate}%</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Reply className="w-2.5 h-2.5" />{sf.projected_reply_rate}%</span>
                            {isStrongest && <span className="text-[10px] text-emerald-600 font-semibold">★ strongest</span>}
                            {isWeakest && <span className="text-[10px] text-red-500 font-semibold">⚠ weakest</span>}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{sf.assessment}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drivers & Blockers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Drivers
                </p>
                <ul className="space-y-1">
                  {forecast.conversion_drivers?.map((d, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                      <span className="text-emerald-500 flex-shrink-0">✓</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Blockers
                </p>
                <ul className="space-y-1">
                  {forecast.conversion_blockers?.map((b, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                      <span className="text-amber-500 flex-shrink-0">⚠</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Optimization tips */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <Lightbulb className="w-3 h-3 text-indigo-500" /> Optimization Tips
              </p>
              <ul className="space-y-1">
                {forecast.optimization_tips?.map((t, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/40 gap-3">
              {forecast.best_send_time && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Best time: <strong>{forecast.best_send_time}</strong></span>
                </div>
              )}
              {forecast.similar_sequence_benchmark && (
                <p className="text-[11px] text-slate-500 italic text-right">{forecast.similar_sequence_benchmark}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertTriangle, Zap, BarChart3, ArrowRight
} from "lucide-react";

const GRADE_CONFIG = {
  A: { color: "bg-emerald-500", text: "text-white", ring: "ring-emerald-400", label: "Excellent" },
  B: { color: "bg-blue-500",    text: "text-white", ring: "ring-blue-400",    label: "Good" },
  C: { color: "bg-amber-500",   text: "text-white", ring: "ring-amber-400",   label: "Average" },
  D: { color: "bg-orange-500",  text: "text-white", ring: "ring-orange-400",  label: "Below Average" },
  F: { color: "bg-red-500",     text: "text-white", ring: "ring-red-400",     label: "Needs Work" },
};

const STATUS_CONFIG = {
  above: { icon: TrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  at:    { icon: Minus,        color: "text-amber-500",   bg: "bg-amber-50 border-amber-100",     badge: "bg-amber-100 text-amber-700" },
  below: { icon: TrendingDown, color: "text-red-500",     bg: "bg-red-50 border-red-200",         badge: "bg-red-100 text-red-700" },
};

function StatChip({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function PerformanceBenchmarking() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("benchmarkPerformance", {});
      setResult(res.data);
    } catch (err) {
      console.error("Performance benchmarking failed:", err);
      alert(formatAIError(err));
    }
    setLoading(false);
  };

  const analysis = result?.analysis;
  const raw = result?.raw;
  const gradeCfg = analysis ? (GRADE_CONFIG[analysis.overall_grade] || GRADE_CONFIG.C) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-700">
        <BarChart3 className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Performance Benchmarking</p>
          <p className="text-xs opacity-75 mt-0.5">
            Compares your Outreach Sequence and Partnership metrics against industry averages, RateBenchmarks, and ROI Benchmarks to show exactly where you stand.
          </p>
        </div>
      </div>

      {/* Trigger */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Compare Against Industry Standards</p>
            <p className="text-xs text-slate-500 mt-0.5">Analyzes all your partnerships, outreach sequences, rate & ROI benchmarks in one report.</p>
          </div>
          <Button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 shrink-0">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Benchmarking…</>
              : <><Sparkles className="w-4 h-4 mr-1.5" />Run Benchmark</>}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
          <p className="text-sm text-slate-500 font-medium">Comparing your data to industry benchmarks…</p>
          <p className="text-xs text-slate-400 mt-1">Pulling partnerships, sequences, rate & ROI benchmarks</p>
        </div>
      )}

      {analysis && raw && (
        <div className="space-y-4">
          {/* Overall grade + snapshot stats */}
          <Card className="border-slate-200/60">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Grade circle */}
                <div className={`w-20 h-20 rounded-2xl ${gradeCfg.color} ring-4 ${gradeCfg.ring} flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className={`text-3xl font-black ${gradeCfg.text}`}>{analysis.overall_grade}</span>
                  <span className={`text-[10px] font-semibold ${gradeCfg.text} opacity-80`}>{gradeCfg.label}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">Overall Performance Score</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysis.overall_summary}</p>
                </div>
              </div>

              {/* Raw stat chips */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                <StatChip label="Total Deals" value={raw.totalDeals} />
                <StatChip label="Win Rate" value={`${raw.winRate}%`} />
                <StatChip label="Avg Deal Value" value={raw.avgDealValue ? `$${(raw.avgDealValue / 1000).toFixed(0)}K` : "—"} />
                <StatChip label="Avg Match Score" value={raw.avgMatchScore ? `${raw.avgMatchScore}/100` : "—"} />
                {raw.finalOpenRate !== null && <StatChip label="Open Rate" value={`${raw.finalOpenRate}%`} />}
                {raw.finalReplyRate !== null && <StatChip label="Reply Rate" value={`${raw.finalReplyRate}%`} />}
                {raw.metricsConversionRate !== null && <StatChip label="Conversion" value={`${raw.metricsConversionRate}%`} />}
              </div>
            </CardContent>
          </Card>

          {/* Metric-by-metric comparison */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Metric Comparison vs Industry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.metrics?.map((m, i) => {
                const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.at;
                const Icon = sc.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${sc.bg}`}>
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sc.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">{m.name}</span>
                        <Badge className={`text-[10px] font-semibold ${sc.badge}`}>{m.delta}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1">
                        <span>You: <strong className="text-slate-700">{m.user_value}</strong></span>
                        <span>·</span>
                        <span>Industry: <strong className="text-slate-600">{m.benchmark_value}</strong></span>
                      </div>
                      <p className="text-xs text-slate-600">{m.insight}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Where You Excel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Gaps */}
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Benchmark Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.gaps?.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick wins */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-500" /> Quick Wins to Close the Gap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analysis.quick_wins?.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">{i + 1}</span>
                    {w}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Rate & ROI positioning */}
          {(analysis.rate_positioning || analysis.roi_positioning) && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Rate & ROI Positioning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.rate_positioning && (
                  <div className="flex items-start gap-2 text-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700">Rate Positioning:</strong> <span className="text-slate-600">{analysis.rate_positioning}</span></span>
                  </div>
                )}
                {analysis.roi_positioning && (
                  <div className="flex items-start gap-2 text-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700">ROI Positioning:</strong> <span className="text-slate-600">{analysis.roi_positioning}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
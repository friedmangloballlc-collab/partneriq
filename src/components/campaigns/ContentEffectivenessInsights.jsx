import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Mail, TrendingUp, TrendingDown, Minus,
  Zap, CheckCircle2, AlertTriangle, Star, MessageSquare, User
} from "lucide-react";

const PERF_CONFIG = {
  top:     { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: TrendingUp },
  average: { color: "text-amber-500",   bg: "bg-amber-50 border-amber-100",     badge: "bg-amber-100 text-amber-700",    icon: Minus },
  poor:    { color: "text-red-500",     bg: "bg-red-50 border-red-200",         badge: "bg-red-100 text-red-700",        icon: TrendingDown },
};

const VERDICT_CONFIG = {
  high_impact:     { label: "High Impact",     color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  moderate_impact: { label: "Moderate Impact", color: "bg-amber-100 text-amber-700 border-amber-200" },
  low_impact:      { label: "Low Impact",      color: "bg-red-100 text-red-700 border-red-200" },
};

function MiniBar({ value, max = 100, color = "bg-indigo-500" }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export default function ContentEffectivenessInsights() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke("analyzeContentEffectiveness", {});
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError(formatAIError(err));
    }
    setLoading(false);
  };

  const analysis = result?.analysis;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-violet-50 border-violet-200 text-violet-700">
        <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Content Effectiveness Insights</p>
          <p className="text-xs opacity-75 mt-0.5">
            Analyzes your OutreachEmail content and OutreachMetrics to reveal what subject lines, CTAs, and personalization tokens (target_name, target_company) drive the highest engagement.
          </p>
        </div>
      </div>

      {/* Trigger */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Analyze Outreach Content Performance</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Scans all outreach emails, sequences, and A/B test metrics to identify winning patterns.
            </p>
          </div>
          <Button onClick={run} disabled={loading} className="bg-violet-600 hover:bg-violet-700 shrink-0">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Analyzing…</>
              : <><Sparkles className="w-4 h-4 mr-1.5" />Analyze Content</>}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-violet-400" />
          <p className="text-sm text-slate-500 font-medium">Analyzing outreach content patterns…</p>
          <p className="text-xs text-slate-400 mt-1">Scanning emails, sequences, subject lines & A/B tests</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Headline insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">Key Finding</p>
                <p className="text-sm font-medium text-slate-800">{analysis.headline_insight}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-slate-500">
              <span><strong className="text-slate-700">{result.totalEmails}</strong> emails analyzed</span>
              <span>·</span>
              <span><strong className="text-slate-700">{result.totalSequences}</strong> sequences scanned</span>
            </div>
          </div>

          {/* Subject line insights */}
          {analysis.subject_line_insights?.length > 0 && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-500" /> Subject Line Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.subject_line_insights.map((s, i) => {
                  const cfg = PERF_CONFIG[s.performance] || PERF_CONFIG.average;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${cfg.bg}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                        <span className="text-xs font-semibold text-slate-800 capitalize">{s.pattern.replace(/_/g, ' ')}</span>
                        <Badge className={`text-[10px] font-semibold ml-auto ${cfg.badge}`}>{s.performance}</Badge>
                        {s.sample_count > 0 && <span className="text-[10px] text-slate-400">{s.sample_count} emails</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-[10px] text-slate-500">Open Rate</p>
                          <p className="text-sm font-bold text-slate-800">{s.open_rate}%</p>
                          <MiniBar value={s.open_rate} color="bg-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Reply Rate</p>
                          <p className="text-sm font-bold text-slate-800">{s.reply_rate}%</p>
                          <MiniBar value={s.reply_rate} max={30} color="bg-emerald-400" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mb-0.5">{s.insight}</p>
                      <p className="text-xs text-violet-700 font-medium">→ {s.recommendation}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Personalization insights */}
          {analysis.personalization_insights && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" /> Personalization Token Impact
                  {analysis.personalization_insights.verdict && (
                    <Badge variant="outline" className={`text-[10px] ml-auto ${VERDICT_CONFIG[analysis.personalization_insights.verdict]?.color || ''}`}>
                      {VERDICT_CONFIG[analysis.personalization_insights.verdict]?.label}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-600">{analysis.personalization_insights.summary}</p>
                {analysis.personalization_insights.top_tokens?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-700 mb-1.5">✓ High-impact tokens to use:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.personalization_insights.top_tokens.map((t, i) => (
                        <code key={i} className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">{t}</code>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.personalization_insights.avoid?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-red-600 mb-1.5">✗ Patterns to avoid:</p>
                    <ul className="space-y-1">
                      {analysis.personalization_insights.avoid.map((a, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email type performance */}
          {analysis.email_type_insights?.length > 0 && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Email Type Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.email_type_insights.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-xs font-semibold text-slate-700 capitalize">{t.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex gap-4 text-[11px] flex-1">
                      <span className="text-slate-500">Open: <strong className="text-slate-700">{t.open_rate}%</strong></span>
                      <span className="text-slate-500">Reply: <strong className="text-emerald-700">{t.reply_rate}%</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-500 hidden sm:block flex-1">{t.insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Winning formula */}
            {analysis.winning_formula && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500" /> Winning Email Formula
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.winning_formula.subject_line_template && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject Line Template</p>
                      <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1.5 rounded block">{analysis.winning_formula.subject_line_template}</code>
                    </div>
                  )}
                  {analysis.winning_formula.opening_line && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Opening Line</p>
                      <p className="text-xs text-slate-600 italic bg-slate-50 px-2 py-1.5 rounded border border-slate-100">"{analysis.winning_formula.opening_line}"</p>
                    </div>
                  )}
                  {analysis.winning_formula.personalization_tokens?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Use These Tokens</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.winning_formula.personalization_tokens.map((t, i) => (
                          <code key={i} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded">{t}</code>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.winning_formula.cta && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">CTA</p>
                      <p className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100">"{analysis.winning_formula.cta}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA recommendations */}
            {analysis.cta_recommendations?.length > 0 && (
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> CTA Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.cta_recommendations.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* A/B test findings */}
          {analysis.ab_test_findings && analysis.ab_test_findings !== 'No A/B test data available' && (
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-500" /> A/B Test Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600">{analysis.ab_test_findings}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick wins */}
          {analysis.quick_wins?.length > 0 && (
            <Card className="border-violet-200 bg-violet-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-violet-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-violet-600" /> Quick Wins (Ranked by Impact)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.quick_wins.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-800 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">{i + 1}</span>
                      {w}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
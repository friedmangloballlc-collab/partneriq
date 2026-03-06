import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Shield, Users, Flame, DollarSign,
  Loader2, ArrowRight, Zap, AlertTriangle
} from "lucide-react";

const DASHBOARD_AGENTS = [
  {
    key: "brandSafety",
    fn: "analyzeBrandSafety",
    title: "Brand Safety",
    icon: Shield,
    color: "from-red-500 to-rose-700",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    key: "relationshipHealth",
    fn: "analyzeRelationshipHealth",
    title: "Relationship Health",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "trendPrediction",
    fn: "analyzeTrendPrediction",
    title: "Trend Prediction",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    key: "invoiceReconciliation",
    fn: "analyzeInvoiceReconciliation",
    title: "Invoice & Payments",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

function getStatusFromAnalysis(analysis) {
  if (!analysis) return null;

  const grade = analysis.risk_grade || analysis.overall_risk_grade;
  const score = analysis.overall_risk_score ?? analysis.risk_score ?? analysis.health_score ?? analysis.portfolio_score;

  if (grade) {
    const g = String(grade).toLowerCase();
    if (["a", "low", "healthy", "good", "strong"].some(v => g.includes(v))) return "good";
    if (["b", "medium", "moderate", "fair", "warning"].some(v => g.includes(v))) return "warning";
    return "critical";
  }

  if (score != null) {
    const n = typeof score === "number" ? score : parseFloat(score);
    if (!isNaN(n)) {
      if (n >= 70) return "good";
      if (n >= 40) return "warning";
      return "critical";
    }
  }

  return "good";
}

const STATUS_DOT = {
  good: "bg-emerald-500",
  warning: "bg-amber-400",
  critical: "bg-red-500",
};

const STATUS_BADGE = {
  good: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
  good: "Healthy",
  warning: "Attention",
  critical: "Critical",
};

function getScoreDisplay(analysis) {
  if (!analysis) return null;

  const grade = analysis.risk_grade || analysis.overall_risk_grade;
  const score = analysis.overall_risk_score ?? analysis.risk_score ?? analysis.health_score ?? analysis.portfolio_score;

  if (grade) return String(grade).toUpperCase();
  if (score != null) return String(score);
  return null;
}

function getTopAction(analysis) {
  if (!analysis) return null;
  const actions = analysis.top_3_actions || analysis.priority_actions || analysis.recommended_actions;
  if (Array.isArray(actions) && actions.length > 0) {
    const action = actions[0];
    return typeof action === "string" ? action : action?.action || action?.description || JSON.stringify(action);
  }
  return null;
}

function truncate(text, max = 100) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function SkeletonWidget() {
  return (
    <div className="p-3.5 rounded-xl border border-slate-100 bg-white animate-pulse">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200" />
        <div className="flex-1">
          <div className="h-3.5 bg-slate-200 rounded w-24 mb-1.5" />
          <div className="h-2.5 bg-slate-100 rounded w-16" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 bg-slate-100 rounded w-full" />
        <div className="h-2.5 bg-slate-100 rounded w-3/4" />
      </div>
    </div>
  );
}

function AgentMiniCard({ agent, analysis, loading, error }) {
  const Icon = agent.icon;
  const status = getStatusFromAnalysis(analysis);
  const scoreDisplay = getScoreDisplay(analysis);
  const topAction = getTopAction(analysis);

  return (
    <div className="p-3.5 rounded-xl border border-slate-200/60 bg-white hover:shadow-md hover:shadow-slate-100/80 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{agent.title}</p>
          {status && !loading && !error && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
              <span className="text-[10px] text-slate-400 font-medium">{STATUS_LABEL[status]}</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-1 mt-0.5">
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
              <span className="text-[10px] text-slate-400">Analyzing...</span>
            </div>
          )}
        </div>
        {status && !loading && !error && scoreDisplay && (
          <Badge className={`text-[9px] font-bold shrink-0 ${STATUS_BADGE[status]}`}>
            {scoreDisplay}
          </Badge>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-2.5 bg-slate-100 rounded w-2/3 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 text-[11px] text-red-500">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">Unable to load</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-2">
          {analysis.executive_summary && (
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
              {truncate(analysis.executive_summary)}
            </p>
          )}
          {topAction && (
            <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg p-2">
              <Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">
                {truncate(topAction, 90)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIAgentWidgets() {
  const [agentStates, setAgentStates] = useState(() => {
    const initial = {};
    DASHBOARD_AGENTS.forEach(a => {
      initial[a.key] = { loading: true, analysis: null, error: null };
    });
    return initial;
  });

  useEffect(() => {
    DASHBOARD_AGENTS.forEach(agent => {
      base44.functions
        .invoke(agent.fn, {})
        .then(res => {
          if (res.data?.error) {
            setAgentStates(prev => ({
              ...prev,
              [agent.key]: { loading: false, analysis: null, error: res.data.error },
            }));
          } else {
            setAgentStates(prev => ({
              ...prev,
              [agent.key]: { loading: false, analysis: res.data?.analysis || null, error: null },
            }));
          }
        })
        .catch(e => {
          setAgentStates(prev => ({
            ...prev,
            [agent.key]: { loading: false, analysis: null, error: e.message || "Failed" },
          }));
        });
    });
  }, []);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">AI Intelligence Feed</CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">Auto-running agents on your latest data</p>
            </div>
          </div>
          <Link
            to={createPageUrl("AIAgentsHub")}
            className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
          >
            View All Agents
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DASHBOARD_AGENTS.map(agent => {
            const state = agentStates[agent.key];
            return (
              <AgentMiniCard
                key={agent.key}
                agent={agent}
                analysis={state.analysis}
                loading={state.loading}
                error={state.error}
              />
            );
          })}
        </div>

        <Link
          to={createPageUrl("AIAgentsHub")}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <Brain className="w-3.5 h-3.5" />
          View Full Analysis
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

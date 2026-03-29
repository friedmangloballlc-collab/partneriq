import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import {
  BarChart3,
  Trophy,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Loader2,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Star,
  Link2,
  ClipboardList,
  Gauge,
  Medal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PERIOD_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
];

function qualityColor(score) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function qualityTextColor(score) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function qualityBgColor(score) {
  if (score >= 85) return "bg-emerald-50 border-emerald-200";
  if (score >= 70) return "bg-blue-50 border-blue-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function healthGrade(score) {
  if (score >= 90) return { grade: "A+", color: "text-emerald-600", bg: "bg-emerald-100" };
  if (score >= 80) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-100" };
  if (score >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" };
  if (score >= 60) return { grade: "C", color: "text-amber-600", bg: "bg-amber-100" };
  return { grade: "D", color: "text-red-600", bg: "bg-red-100" };
}

function OverallHealthScore({ analytics }) {
  const metrics = analytics.agent_metrics || [];
  if (metrics.length === 0) return null;

  const avgQuality =
    metrics.reduce((sum, m) => sum + (m.avg_response_quality || 0), 0) / metrics.length;
  const avgActionability =
    metrics.reduce((sum, m) => sum + (m.actionability_score || 0), 0) / metrics.length;
  const overallScore = Math.round((avgQuality + avgActionability) / 2);
  const { grade, color, bg } = healthGrade(overallScore);

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl ${bg} flex items-center justify-center`}>
              <span className={`text-3xl font-black ${color}`}>{grade}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Agent Health Score</h2>
              <p className="text-gray-500 mt-1">
                Overall system performance across {metrics.length} agents
              </p>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">{Math.round(avgQuality)}%</p>
              <p className="text-xs text-gray-500 mt-1">Avg Quality</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{Math.round(avgActionability)}%</p>
              <p className="text-xs text-gray-500 mt-1">Avg Actionability</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-pink-600">
                {metrics.reduce((sum, m) => sum + (m.runs_estimated || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Est. Runs</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentPerformanceGrid({ metrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Agent Performance Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((agent, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 ${qualityBgColor(agent.avg_response_quality)} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">
                  {agent.agent_name}
                </h4>
                <Badge variant="outline" className="text-xs shrink-0">
                  ~{agent.runs_estimated} runs
                </Badge>
              </div>

              {/* Quality bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Quality</span>
                  <span className={`font-bold ${qualityTextColor(agent.avg_response_quality)}`}>
                    {agent.avg_response_quality}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${qualityColor(agent.avg_response_quality)}`}
                    style={{ width: `${agent.avg_response_quality}%` }}
                  />
                </div>
              </div>

              {/* Actionability bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Actionability</span>
                  <span className={`font-bold ${qualityTextColor(agent.actionability_score)}`}>
                    {agent.actionability_score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${qualityColor(agent.actionability_score)}`}
                    style={{ width: `${agent.actionability_score}%` }}
                  />
                </div>
              </div>

              {/* Top insight */}
              <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{agent.most_valuable_insight}</span>
              </div>

              {/* Recommended frequency */}
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <Activity className="w-3 h-3" />
                Recommended: {agent.recommended_frequency}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformersPodium({ performers }) {
  if (!performers || performers.length === 0) return null;

  const podiumStyles = [
    {
      border: "border-yellow-300",
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      icon: "text-yellow-500",
      medal: "bg-yellow-100",
      label: "Gold",
      height: "h-32",
    },
    {
      border: "border-gray-300",
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      icon: "text-gray-400",
      medal: "bg-gray-100",
      label: "Silver",
      height: "h-24",
    },
    {
      border: "border-amber-600",
      bg: "bg-gradient-to-br from-orange-50 to-amber-50",
      icon: "text-amber-600",
      medal: "bg-amber-100",
      label: "Bronze",
      height: "h-20",
    },
  ];

  const displayOrder = performers.length >= 3 ? [1, 0, 2] : performers.map((_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-center gap-4">
          {displayOrder.map((orderIdx) => {
            const performer = performers[orderIdx];
            if (!performer) return null;
            const style = podiumStyles[orderIdx];
            return (
              <div
                key={orderIdx}
                className={`flex-1 max-w-[220px] rounded-xl border-2 ${style.border} ${style.bg} p-4 text-center transition-all hover:shadow-lg`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${style.medal} flex items-center justify-center mx-auto mb-2`}
                >
                  <Medal className={`w-5 h-5 ${style.icon}`} />
                </div>
                <Badge className={`${style.medal} ${style.icon} border-0 mb-2`}>
                  {style.label}
                </Badge>
                <h4 className="font-bold text-gray-900 text-sm">{performer.agent}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{performer.reason}</p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-lg text-gray-900">
                    {performer.impact_score}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UnderperformersSection({ agents }) {
  if (!agents || agents.length === 0) return null;

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Needs Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-orange-100 bg-orange-50/50 p-3"
            >
              <ArrowDownRight className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">{agent.agent}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{agent.issue}</p>
                <div className="flex items-start gap-1.5 mt-2 text-xs text-emerald-700 bg-emerald-50 rounded-md p-2">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{agent.suggestion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCombinations({ combinations }) {
  if (!combinations) return null;

  const items = [
    {
      label: "Most Effective Chain",
      value: combinations.most_effective_chain,
      icon: Zap,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Least Used Pair",
      value: combinations.least_used_pair,
      icon: Link2,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    {
      label: "Suggested New Chain",
      value: combinations.suggested_new_chain,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-500" />
          Agent Combination Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div key={idx} className={`rounded-xl border p-4 ${item.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
              </div>
              <p className="text-sm text-gray-700">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ROIContribution({ contributions }) {
  if (!contributions || contributions.length === 0) return null;

  const sorted = [...contributions].sort((a, b) => b.confidence - a.confidence);
  const maxConfidence = Math.max(...sorted.map((c) => c.confidence));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          ROI Contribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((item, idx) => {
            const barWidth = maxConfidence > 0 ? (item.confidence / maxConfidence) * 100 : 0;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 text-center">
                  <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.agent}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 shrink-0 ml-2">
                      {item.estimated_value_added}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-end mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {item.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function OptimizationPlan({ plan }) {
  if (!plan || plan.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-500" />
          Optimization Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plan.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-violet-50/50 hover:border-violet-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-violet-600">{item.step}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.agent}</h4>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className="text-sm text-gray-600 truncate">{item.action}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{item.expected_result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UsageRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Usage Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-blue-100 bg-blue-50/50 p-3"
            >
              <p className="text-sm text-gray-800 font-medium">{rec.recommendation}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>{rec.expected_improvement}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentAnalytics() {
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalytics(null);

    try {
      const response = await base44.functions.invoke("analyzeAgentPerformance", {
        period,
      });
      const data = response.data || response;
      if (data.error) {
        setError(data.error);
      } else {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Gauge className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agent Performance Analytics</h1>
                <p className="text-indigo-200 text-sm mt-0.5">
                  Analyze and optimize your AI agent fleet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-white/10 p-1">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      period === opt.value
                        ? "bg-white text-indigo-900 shadow-sm"
                        : "text-indigo-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={runAnalysis}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-400 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Performance
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Analyzing {period}-day performance across 12 agents...
            </p>
            <p className="text-gray-400 text-sm mt-1">
              This may take a moment while we crunch the numbers.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analytics && !loading && (
        <div className="space-y-6">
          <OverallHealthScore analytics={analytics} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPerformersPodium performers={analytics.top_performing_agents} />
            <UnderperformersSection agents={analytics.underperforming_agents} />
          </div>

          <AgentPerformanceGrid metrics={analytics.agent_metrics || []} />

          <AgentCombinations combinations={analytics.agent_combinations} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ROIContribution contributions={analytics.roi_contribution} />
            <OptimizationPlan plan={analytics.optimization_plan} />
          </div>

          <UsageRecommendations recommendations={analytics.usage_recommendations} />
        </div>
      )}

      {/* Empty state */}
      {!analytics && !loading && !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Ready to Analyze Agent Performance
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
              Select a time period and click "Analyze Performance" to get a comprehensive view of how
              your 12 AI agents are performing, their ROI contribution, and optimization
              recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

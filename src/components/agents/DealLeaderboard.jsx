import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Trophy,
  RefreshCw,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Star,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  ShieldAlert,
  Zap,
  BarChart3,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const URGENCY_CONFIG = {
  act_now: { label: "Act Now", className: "bg-red-100 text-red-700 border-red-200" },
  this_week: { label: "This Week", className: "bg-orange-100 text-orange-700 border-orange-200" },
  this_month: { label: "This Month", className: "bg-blue-100 text-blue-700 border-blue-200" },
  monitor: { label: "Monitor", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const RISK_CONFIG = {
  low: { label: "Low", className: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  high: { label: "High", className: "bg-red-100 text-red-700 border-red-200" },
};

function ScoreBar({ score }) {
  const color =
    score >= 70
      ? "bg-emerald-500"
      : score >= 40
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

function DistributionChart({ distribution }) {
  if (!distribution) return null;
  const { high_priority = 0, medium_priority = 0, low_priority = 0 } = distribution;
  const total = high_priority + medium_priority + low_priority || 1;

  const bars = [
    { label: "High", count: high_priority, color: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    { label: "Medium", count: medium_priority, color: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
    { label: "Low", count: low_priority, color: "bg-red-400", bg: "bg-red-50", text: "text-red-700" },
  ];

  return (
    <div className="space-y-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className={`text-xs font-medium w-16 ${bar.text}`}>{bar.label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
              style={{ width: `${(bar.count / total) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-600 w-6 text-right">{bar.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function DealLeaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke("scoreDealLeaderboard");
      if (response?.data?.success) {
        setData(response.data.analysis);
      } else {
        setError(response?.data?.error || "Failed to fetch leaderboard scores.");
      }
    } catch (err) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "rank" ? "asc" : "desc");
    }
  };

  const sortedLeaderboard = useMemo(() => {
    if (!data?.leaderboard) return [];
    const list = [...data.leaderboard];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [data?.leaderboard, sortField, sortDir]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  const columns = [
    { key: "rank", label: "#", className: "w-10" },
    { key: "partnership_title", label: "Deal", className: "min-w-[180px]" },
    { key: "composite_score", label: "Score", className: "min-w-[160px]" },
    { key: "predicted_roi", label: "ROI", className: "w-20" },
    { key: "risk_level", label: "Risk", className: "w-24" },
    { key: "urgency", label: "Urgency", className: "w-28" },
    { key: "recommendation", label: "Recommendation", className: "min-w-[200px]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Deal Scoring Leaderboard
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                AI-powered scoring and ranking of all active deals by composite performance
              </p>
            </div>
          </div>
          <Button
            onClick={fetchScores}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-xl shadow-md gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Scores
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <Card className="rounded-2xl shadow-md border border-gray-100">
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No scores yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click "Refresh Scores" to analyze and rank your active deals.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Summary stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pipeline Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${(data.total_pipeline_value || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Deals</p>
                  <p className="text-lg font-bold text-gray-900">
                    {data.leaderboard?.length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">High Priority</p>
                  <p className="text-lg font-bold text-gray-900">
                    {data.distribution?.high_priority || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Low Priority</p>
                  <p className="text-lg font-bold text-gray-900">
                    {data.distribution?.low_priority || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Opportunity + Biggest Risk cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.top_opportunity && (
              <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">Top Opportunity</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.top_opportunity}
                  </p>
                </CardContent>
              </Card>
            )}

            {data.biggest_risk && (
              <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-red-50 to-orange-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-bold text-red-800">Biggest Risk</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.biggest_risk}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Leaderboard table + Distribution chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Leaderboard Table */}
            <Card className="rounded-2xl shadow-md border border-gray-100 lg:col-span-3 overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Deal Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className={`px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${col.className}`}
                          >
                            <span className="flex items-center gap-1">
                              {col.label}
                              <SortIcon field={col.key} />
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLeaderboard.map((deal, idx) => {
                        const risk = RISK_CONFIG[deal.risk_level] || RISK_CONFIG.medium;
                        const urgency = URGENCY_CONFIG[deal.urgency] || URGENCY_CONFIG.monitor;

                        return (
                          <tr
                            key={idx}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            {/* Rank */}
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  deal.rank === 1
                                    ? "bg-amber-100 text-amber-700"
                                    : deal.rank === 2
                                    ? "bg-gray-200 text-gray-700"
                                    : deal.rank === 3
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {deal.rank}
                              </span>
                            </td>

                            {/* Deal name */}
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900 text-xs leading-tight">
                                  {deal.partnership_title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {deal.talent_name} x {deal.brand_name}
                                </p>
                              </div>
                            </td>

                            {/* Composite score bar */}
                            <td className="px-4 py-3">
                              <ScoreBar score={deal.composite_score} />
                            </td>

                            {/* Predicted ROI */}
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-indigo-700">
                                {deal.predicted_roi}
                              </span>
                            </td>

                            {/* Risk badge */}
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${risk.className}`}
                              >
                                {risk.label}
                              </Badge>
                            </td>

                            {/* Urgency */}
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${urgency.className}`}
                              >
                                {urgency.label}
                              </Badge>
                            </td>

                            {/* Recommendation */}
                            <td className="px-4 py-3">
                              <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                                {deal.recommendation}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart distribution={data.distribution} />
              </CardContent>

              {/* Insights */}
              {data.insights && data.insights.length > 0 && (
                <CardContent className="pt-0">
                  <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-800">Key Insights</span>
                    </div>
                    <ul className="space-y-1.5">
                      {data.insights.map((insight, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[11px] text-gray-600 leading-snug"
                        >
                          <Zap className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

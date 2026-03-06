import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Calendar,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TIMEFRAME_OPTIONS = [
  { value: 30, label: "30 Days" },
  { value: 60, label: "60 Days" },
  { value: 90, label: "90 Days" },
  { value: 180, label: "180 Days" },
];

function formatCurrency(value) {
  if (value == null) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function ConfidenceIndicator({ level }) {
  const color =
    level >= 70
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : level >= 40
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-red-600 bg-red-50 border-red-200";

  const label = level >= 70 ? "High" : level >= 40 ? "Medium" : "Low";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
      <Shield className="w-3.5 h-3.5" />
      <span>{label} Confidence</span>
      <span className="font-bold">{level}%</span>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up") return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
  if (trend === "down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

function ImpactBadge({ impact }) {
  const styles = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <Badge variant="outline" className={`text-xs ${styles[impact] || styles.low}`}>
      {impact}
    </Badge>
  );
}

function EffortBadge({ effort }) {
  const styles = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`text-xs border-0 ${styles[effort] || styles.medium}`}>
      {effort} effort
    </Badge>
  );
}

export default function RevenueForecaster() {
  const [timeframe, setTimeframe] = useState(90);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    drivers: true,
    risks: true,
    opportunities: true,
    seasonal: false,
    recommendations: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke("forecastRevenue", { timeframe });
      if (response?.data?.success) {
        setForecast(response.data.forecast);
      } else {
        setError(response?.data?.error || "Failed to generate forecast");
      }
    } catch (err) {
      setError(err?.message || "An error occurred while generating the forecast");
    } finally {
      setLoading(false);
    }
  };

  const proj = forecast?.revenue_projections;
  const monthly = forecast?.monthly_breakdown || [];
  const pipeline = forecast?.pipeline_analysis;
  const drivers = forecast?.revenue_drivers || [];
  const risks = forecast?.risk_factors || [];
  const seasonal = forecast?.seasonal_adjustments || [];
  const opportunities = forecast?.growth_opportunities || [];
  const recommendations = forecast?.recommendations || [];

  // Find max monthly revenue for bar chart scaling
  const maxMonthlyRevenue = monthly.length
    ? Math.max(...monthly.map((m) => m.projected_revenue || 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Revenue Forecaster
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                AI-powered predictive revenue projections and pipeline analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeframe(opt.value)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    timeframe === opt.value
                      ? "bg-emerald-500 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              onClick={generateForecast}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              {loading ? "Generating..." : "Generate Forecast"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">
              Analyzing partnerships, billing history, and market data...
            </p>
            <p className="text-xs text-gray-400">
              This may take a moment while the AI processes your data
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {forecast && !loading && (
        <>
          {/* Confidence & Period */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Forecast period: {forecast.forecast_period}</span>
              {forecast.generated_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <Clock className="w-4 h-4" />
                  <span>
                    Generated:{" "}
                    {new Date(forecast.generated_at).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            {proj && <ConfidenceIndicator level={proj.confidence_level} />}
          </div>

          {/* Three-Scenario Cards */}
          {proj && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conservative */}
              <Card className="rounded-2xl shadow-md border-l-4 border-l-amber-400 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        Conservative
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-200 text-amber-600 bg-amber-50"
                    >
                      Low Risk
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(proj.conservative)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Minimum expected revenue
                  </p>
                </CardContent>
              </Card>

              {/* Moderate */}
              <Card className="rounded-2xl shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow ring-2 ring-emerald-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        Moderate
                      </span>
                    </div>
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                      Most Likely
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 mb-1">
                    {formatCurrency(proj.moderate)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Expected revenue target
                  </p>
                </CardContent>
              </Card>

              {/* Aggressive */}
              <Card className="rounded-2xl shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        Aggressive
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-200 text-blue-600 bg-blue-50"
                    >
                      Stretch Goal
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(proj.aggressive)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Upside potential revenue
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monthly Breakdown Bar Chart */}
          {monthly.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Monthly Breakdown
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthly.map((m, idx) => {
                    const pct =
                      maxMonthlyRevenue > 0
                        ? (m.projected_revenue / maxMonthlyRevenue) * 100
                        : 0;
                    const confidenceColor =
                      m.confidence >= 70
                        ? "bg-emerald-500"
                        : m.confidence >= 40
                        ? "bg-amber-500"
                        : "bg-red-400";

                    return (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 w-32">
                            {m.month}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{m.deal_count} deals</span>
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(m.projected_revenue)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-white text-[10px] font-medium ${confidenceColor}`}
                            >
                              {m.confidence}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          >
                            {pct > 15 && (
                              <span className="text-[10px] font-medium text-white">
                                {formatCurrency(m.projected_revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pipeline Analysis */}
          {pipeline && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Pipeline Analysis
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Total Pipeline Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(pipeline.total_pipeline_value)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-600 mb-1">
                      Weighted Pipeline
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(pipeline.weighted_pipeline)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1">
                      Conversion Probability
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {pipeline.conversion_probability}%
                    </p>
                    <div className="mt-2 w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${pipeline.conversion_probability}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Drivers */}
          {drivers.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection("drivers")}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Revenue Drivers
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs ml-1"
                    >
                      {drivers.length}
                    </Badge>
                  </div>
                  {expandedSections.drivers ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.drivers && (
                <CardContent>
                  <div className="space-y-3">
                    {drivers.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TrendIcon trend={d.trend} />
                          <span className="text-sm text-gray-800">
                            {d.driver}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ImpactBadge impact={d.impact} />
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              d.trend === "up"
                                ? "border-emerald-200 text-emerald-600"
                                : d.trend === "down"
                                ? "border-red-200 text-red-600"
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            {d.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Risk Factors */}
          {risks.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection("risks")}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Risk Factors
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs ml-1 border-red-200 text-red-600"
                    >
                      {risks.length}
                    </Badge>
                  </div>
                  {expandedSections.risks ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.risks && (
                <CardContent>
                  <div className="space-y-3">
                    {risks.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-sm text-gray-800 truncate">
                            {r.risk}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              r.probability === "high"
                                ? "border-red-300 text-red-700 bg-red-100"
                                : r.probability === "medium"
                                ? "border-amber-300 text-amber-700 bg-amber-100"
                                : "border-gray-300 text-gray-600 bg-gray-100"
                            }`}
                          >
                            {r.probability}
                          </Badge>
                          <span className="text-xs font-semibold text-red-600">
                            -{formatCurrency(r.revenue_impact)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Growth Opportunities */}
          {opportunities.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection("opportunities")}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Growth Opportunities
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs ml-1 border-amber-200 text-amber-600"
                    >
                      {opportunities.length}
                    </Badge>
                  </div>
                  {expandedSections.opportunities ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.opportunities && (
                <CardContent>
                  <div className="space-y-3">
                    {[...opportunities]
                      .sort(
                        (a, b) =>
                          (b.potential_revenue || 0) -
                          (a.potential_revenue || 0)
                      )
                      .map((o, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 hover:from-amber-100 hover:to-yellow-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800 flex-1">
                              {o.opportunity}
                            </span>
                            <span className="text-lg font-bold text-emerald-600 ml-3 shrink-0">
                              +{formatCurrency(o.potential_revenue)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EffortBadge effort={o.effort_level} />
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-200 text-gray-500"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {o.timeline}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Seasonal Adjustments */}
          {seasonal.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection("seasonal")}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Seasonal Adjustments
                    </CardTitle>
                  </div>
                  {expandedSections.seasonal ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.seasonal && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seasonal.map((s, idx) => {
                      const isPositive = s.adjustment_factor >= 1;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border ${
                            isPositive
                              ? "bg-emerald-50/50 border-emerald-100"
                              : "bg-red-50/50 border-red-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {s.period}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                isPositive
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {((s.adjustment_factor - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{s.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection("recommendations")}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Recommendations
                    </CardTitle>
                  </div>
                  {expandedSections.recommendations ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.recommendations && (
                <CardContent>
                  <div className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
                      >
                        <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 mt-0.5 shrink-0">
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!forecast && !loading && !error && (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50">
              <DollarSign className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Ready to Forecast Revenue
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Select a timeframe and click "Generate Forecast" to get
                AI-powered revenue projections based on your partnerships,
                billing history, and market benchmarks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

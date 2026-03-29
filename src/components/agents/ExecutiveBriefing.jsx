import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  CheckSquare,
  Lightbulb,
  Printer,
  Copy,
  RefreshCw,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  BarChart3,
  Briefcase,
  Star,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function formatCurrency(value) {
  if (value == null) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SeverityBadge({ severity }) {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        colors[severity] || colors.medium
      }`}
    >
      {severity?.toUpperCase()}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        colors[priority] || colors.medium
      }`}
    >
      {priority?.toUpperCase()}
    </span>
  );
}

function KPICard({ title, value, icon: Icon, subtitle, trend }) {
  const isPositive = trend > 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-indigo-50">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 tracking-tight">
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function ExecutiveBriefing() {
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [error, setError] = useState(null);

  const generateBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke(
        "generateExecutiveBriefing",
        { period }
      );
      if (response?.data?.briefing) {
        setBriefing(response.data.briefing);
      } else if (response?.data?.error) {
        setError(response.data.error);
      } else {
        setError("Unexpected response format.");
      }
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!briefing) return;
    try {
      const text = JSON.stringify(briefing, null, 2);
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: select all in a textarea
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(briefing, null, 2);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const kpi = briefing?.kpi_dashboard;

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:max-w-none">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-slate-50 to-indigo-50 border-0">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-700 text-white">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Executive Briefing
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                AI-synthesized intelligence report for leadership review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap print:hidden">
            {/* Period Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    period === p.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              onClick={generateBriefing}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-xl shadow-md gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loading ? "Generating..." : "Generate Briefing"}
            </Button>

            {briefing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-xl gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!briefing && !loading && !error && (
        <Card className="rounded-2xl shadow-sm border-dashed border-2 border-gray-200">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-gray-50 mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No briefing generated yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Select a reporting period and click "Generate Briefing" to create
              an AI-synthesized executive intelligence report from all your
              partnership data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Generating Executive Briefing
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Analyzing partnerships, talents, brands, outreach, approvals,
              billing, and activities across all your data...
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Briefing Content ────────────────────────────────────────── */}
      {briefing && !loading && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="font-medium capitalize">
                {briefing.briefing_period} Report
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Generated {formatDate(briefing.generated_at)}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <Card className="rounded-2xl shadow-sm border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                Executive Summary
              </h2>
              <p className="text-gray-800 leading-relaxed text-[15px]">
                {briefing.executive_summary}
              </p>
            </CardContent>
          </Card>

          {/* KPI Dashboard */}
          {kpi && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                Key Performance Indicators
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard
                  title="Total Partnerships"
                  value={kpi.total_partnerships}
                  icon={Briefcase}
                />
                <KPICard
                  title="Active Deals"
                  value={kpi.active_deals}
                  icon={Target}
                />
                <KPICard
                  title="Pipeline Value"
                  value={formatCurrency(kpi.pipeline_value)}
                  icon={DollarSign}
                />
                <KPICard
                  title="Avg Deal Value"
                  value={formatCurrency(kpi.avg_deal_value)}
                  icon={BarChart3}
                />
                <KPICard
                  title="Conversion Rate"
                  value={`${kpi.conversion_rate}%`}
                  icon={TrendingUp}
                />
                <KPICard
                  title="Revenue Growth"
                  value={`${kpi.revenue_growth > 0 ? "+" : ""}${kpi.revenue_growth}%`}
                  icon={kpi.revenue_growth >= 0 ? TrendingUp : TrendingDown}
                  trend={kpi.revenue_growth}
                />
              </div>
            </div>
          )}

          {/* Partnership Highlights */}
          {briefing.partnership_highlights?.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Partnership Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-6 font-semibold text-gray-600">
                          Partnership
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">
                          Value
                        </th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600">
                          Key Insight
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {briefing.partnership_highlights.map((p, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-6 font-medium text-gray-900">
                            {p.title}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-700">
                            {formatCurrency(p.value)}
                          </td>
                          <td className="py-3 px-6 text-gray-600 max-w-xs">
                            {p.key_insight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Alerts */}
          {briefing.risk_alerts?.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2 space-y-3">
                {briefing.risk_alerts.map((r, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      r.severity === "high"
                        ? "bg-red-50/50 border-red-100"
                        : r.severity === "medium"
                          ? "bg-amber-50/50 border-amber-100"
                          : "bg-green-50/50 border-green-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              r.severity === "high"
                                ? "text-red-500"
                                : r.severity === "medium"
                                  ? "text-amber-500"
                                  : "text-green-500"
                            }`}
                          />
                          <span className="font-semibold text-gray-900 text-sm">
                            {r.risk}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          <span className="font-medium text-gray-700">
                            Mitigation:
                          </span>{" "}
                          {r.mitigation}
                        </p>
                      </div>
                      <SeverityBadge severity={r.severity} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Opportunity Pipeline */}
          {briefing.opportunity_pipeline?.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Opportunity Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2 space-y-3">
                {[...briefing.opportunity_pipeline]
                  .sort(
                    (a, b) =>
                      (b.potential_value || 0) - (a.potential_value || 0)
                  )
                  .map((o, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-gray-900 text-sm">
                            {o.opportunity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 ml-6">
                          {o.next_step}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(o.potential_value)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.min(o.probability || 0, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {o.probability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Talent Insights + Financial Summary side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Talent Insights */}
            {briefing.talent_insights && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Talent Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Users className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {briefing.talent_insights.new_signings}
                      </p>
                      <p className="text-xs text-gray-500">
                        New Signings This Period
                      </p>
                    </div>
                  </div>

                  {briefing.talent_insights.top_performers?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Top Performers
                      </h4>
                      <div className="space-y-1.5">
                        {briefing.talent_insights.top_performers.map(
                          (name, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <span className="text-gray-800 font-medium">
                                {name}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {briefing.talent_insights.at_risk?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        At Risk
                      </h4>
                      <div className="space-y-1.5">
                        {briefing.talent_insights.at_risk.map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-gray-700">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            {briefing.financial_summary && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Revenue This Period
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            briefing.financial_summary.revenue_this_period
                          )}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Outstanding Invoices
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            briefing.financial_summary.outstanding_invoices
                          )}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-amber-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Projected Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            briefing.financial_summary.projected_revenue
                          )}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Competitive Landscape */}
          {briefing.competitive_landscape && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Competitive Landscape
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <p className="text-gray-700 leading-relaxed text-[15px]">
                  {briefing.competitive_landscape}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {briefing.action_items?.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 w-24">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Action
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 w-40">
                          Owner
                        </th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 w-36">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {briefing.action_items.map((item, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <PriorityBadge priority={item.priority} />
                          </td>
                          <td className="py-3 px-4 text-gray-800 font-medium">
                            {item.action}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.owner}
                          </td>
                          <td className="py-3 px-6 text-gray-500 text-xs">
                            {item.deadline}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategic Recommendations */}
          {briefing.strategic_recommendations?.length > 0 && (
            <Card className="rounded-2xl shadow-sm border-l-4 border-l-amber-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2 space-y-3">
                {briefing.strategic_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

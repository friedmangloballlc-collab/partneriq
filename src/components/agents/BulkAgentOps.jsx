import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import {
  Play,
  Loader2,
  Download,
  Filter,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  Shield,
  Activity,
  Palette,
  MessageSquare,
  Receipt,
  Scale,
  Target,
  Zap,
  Search,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AGENTS = [
  { name: "analyzeContractIntelligence", label: "Contract Intelligence", icon: FileText },
  { name: "analyzeCompetitorIntelligence", label: "Competitor Intelligence", icon: TrendingUp },
  { name: "analyzeAudienceOverlap", label: "Audience Overlap", icon: Users },
  { name: "analyzeRelationshipHealth", label: "Relationship Health", icon: Activity },
  { name: "generateCreativeDirection", label: "Creative Direction", icon: Palette },
  { name: "analyzeNegotiationCoach", label: "Negotiation Coach", icon: MessageSquare },
  { name: "analyzeTrendPrediction", label: "Trend Prediction", icon: BarChart3 },
  { name: "analyzeBrandSafety", label: "Brand Safety", icon: Shield },
  { name: "analyzeCrossPlatformAttribution", label: "Cross-Platform Attribution", icon: Layers },
  { name: "analyzeRosterOptimization", label: "Roster Optimization", icon: Users },
  { name: "analyzeInvoiceReconciliation", label: "Invoice Reconciliation", icon: Receipt },
  { name: "analyzeComplianceDisclosure", label: "Compliance & Disclosure", icon: Scale },
];

const NICHES = ["beauty", "fitness", "tech", "gaming", "fashion", "food", "travel", "lifestyle", "entertainment", "education", "health", "finance"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter"];
const TIERS = ["nano", "micro", "mid", "macro", "mega"];
const STATUSES = ["active", "paused", "new"];

function MultiSelect({ label, options, selected, onChange, icon: Icon }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                onChange(
                  isSelected
                    ? selected.filter((s) => s !== opt)
                    : [...selected, opt]
                )
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                isSelected
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-emerald-400"
      : score >= 40
      ? "bg-amber-400"
      : "bg-red-400";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
        {score}
      </span>
    </div>
  );
}

export default function BulkAgentOps() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [filters, setFilters] = useState({
    niche: [],
    platform: [],
    tier: [],
    status: [],
    min_followers: "",
    max_followers: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortField, setSortField] = useState("score");
  const [sortDir, setSortDir] = useState("desc");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.niche.length) count++;
    if (filters.platform.length) count++;
    if (filters.tier.length) count++;
    if (filters.status.length) count++;
    if (filters.min_followers) count++;
    if (filters.max_followers) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      niche: [],
      platform: [],
      tier: [],
      status: [],
      min_followers: "",
      max_followers: "",
    });
  };

  const runBulkAnalysis = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const body = {
        agent_name: selectedAgent,
        filters: {
          niche: filters.niche.length ? filters.niche : undefined,
          platform: filters.platform.length ? filters.platform : undefined,
          tier: filters.tier.length ? filters.tier : undefined,
          status: filters.status.length ? filters.status : undefined,
          min_followers: filters.min_followers ? Number(filters.min_followers) : undefined,
          max_followers: filters.max_followers ? Number(filters.max_followers) : undefined,
        },
      };

      const response = await base44.functions.invoke("runBulkAgentOps", body);

      if (response?.data?.success) {
        setResults(response.data.bulk_results);
      } else {
        setError(response?.data?.error || "Bulk analysis failed.");
      }
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    const exportData = {
      agent: results.agent_ran,
      filter_criteria: results.filter_criteria,
      entities_matched: results.entities_matched,
      entities_processed: results.entities_processed,
      aggregate_summary: results.aggregate_summary,
      individual_results: results.individual_results,
      patterns_found: results.patterns_found,
      batch_recommendations: results.batch_recommendations,
      processing_stats: results.processing_stats,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk_${results.agent_ran || "analysis"}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedResults = useMemo(() => {
    if (!results?.individual_results) return [];
    const sorted = [...results.individual_results];
    sorted.sort((a, b) => {
      if (sortField === "score") {
        return sortDir === "desc" ? (b.score || 0) - (a.score || 0) : (a.score || 0) - (b.score || 0);
      }
      const aVal = (a[sortField] || "").toString().toLowerCase();
      const bVal = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    });
    return sorted;
  }, [results, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const selectedAgentInfo = AGENTS.find((a) => a.name === selectedAgent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-violet-50 to-indigo-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Bulk Agent Operations
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Run AI agents across filtered talent subsets for aggregate insights
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {AGENTS.length} agents
          </Badge>
        </CardHeader>
      </Card>

      {/* Agent Selection + Filters */}
      <Card className="rounded-2xl shadow-md border border-gray-100">
        <CardContent className="p-5 space-y-5">
          {/* Agent Selector */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Select Agent
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgent === agent.name;
                return (
                  <button
                    key={agent.name}
                    type="button"
                    onClick={() => setSelectedAgent(agent.name)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-150 text-left ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-200"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{agent.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Filter Builder */}
          {showFilters && (
            <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelect
                  label="Niche"
                  options={NICHES}
                  selected={filters.niche}
                  onChange={(v) => setFilters((f) => ({ ...f, niche: v }))}
                  icon={Target}
                />
                <MultiSelect
                  label="Platform"
                  options={PLATFORMS}
                  selected={filters.platform}
                  onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
                  icon={Layers}
                />
                <MultiSelect
                  label="Tier"
                  options={TIERS}
                  selected={filters.tier}
                  onChange={(v) => setFilters((f) => ({ ...f, tier: v }))}
                  icon={BarChart3}
                />
                <MultiSelect
                  label="Status"
                  options={STATUSES}
                  selected={filters.status}
                  onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                  icon={Activity}
                />
              </div>

              {/* Follower Range */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Follower Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min followers"
                    value={filters.min_followers}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, min_followers: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="number"
                    placeholder="Max followers"
                    value={filters.max_followers}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, max_followers: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Run Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={runBulkAnalysis}
              disabled={!selectedAgent || loading}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white rounded-xl shadow-md gap-2 flex-1 sm:flex-none sm:min-w-[220px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Bulk Analysis...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Bulk Analysis
                </>
              )}
            </Button>
            {selectedAgentInfo && (
              <span className="text-xs text-gray-500">
                Agent: <span className="font-medium text-gray-700">{selectedAgentInfo.label}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {loading && (
        <Card className="rounded-2xl shadow-md border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Processing bulk analysis...
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Running {selectedAgentInfo?.label || selectedAgent} across filtered entities. This may take a moment.
                </p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="rounded-2xl shadow-md border border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Analysis Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-5">
          {/* Aggregate Summary Card */}
          <Card className="rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Aggregate Summary
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {results.agent_ran} -- {results.entities_processed || results.entities_matched} entities processed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {results.processing_stats && (
                    <>
                      <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50">
                        {results.processing_stats.success_rate} success
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-600">
                        {results.processing_stats.total_time_estimate}
                      </Badge>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                    className="rounded-xl gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-lg font-bold text-indigo-600">{results.entities_matched || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Matched</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-lg font-bold text-green-600">{results.entities_processed || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Processed</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-lg font-bold text-amber-600">{results.patterns_found?.length || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Patterns</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-lg font-bold text-violet-600">{results.batch_recommendations?.length || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Recommendations</p>
                </div>
              </div>

              {/* Summary Text */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {results.aggregate_summary}
                </p>
              </div>

              {/* Filter criteria */}
              {results.filter_criteria && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Search className="w-3.5 h-3.5" />
                  <span>Filters: {results.filter_criteria}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Results Table */}
          {sortedResults.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Individual Results ({sortedResults.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr className="border-b border-gray-100">
                        <th
                          className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                          onClick={() => toggleSort("entity_name")}
                        >
                          <span className="flex items-center gap-1">
                            Entity
                            {sortField === "entity_name" && (
                              sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                            )}
                          </span>
                        </th>
                        <th
                          className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-900 w-[140px]"
                          onClick={() => toggleSort("score")}
                        >
                          <span className="flex items-center gap-1">
                            Score
                            {sortField === "score" && (
                              sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                            )}
                          </span>
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">
                          Key Finding
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">
                          Action Needed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-medium text-gray-800">
                            {row.entity_name}
                          </td>
                          <td className="px-4 py-3">
                            <ScoreBar score={row.score} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-[250px]">
                            <span className="line-clamp-2">{row.key_finding}</span>
                          </td>
                          <td className="px-4 py-3 text-xs max-w-[200px]">
                            {row.action_needed && row.action_needed !== "None" ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block line-clamp-2">
                                {row.action_needed}
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                No action needed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patterns Found */}
          {results.patterns_found && results.patterns_found.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  Patterns Found ({results.patterns_found.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {results.patterns_found.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">
                            {p.pattern}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            {p.significance}
                          </p>
                        </div>
                        <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] shrink-0">
                          {p.frequency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Recommendations */}
          {results.batch_recommendations && results.batch_recommendations.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Batch Recommendations ({results.batch_recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <ul className="space-y-2">
                  {results.batch_recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100"
                    >
                      <span className="font-bold text-amber-600 text-xs mt-px shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-xs text-gray-700 leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

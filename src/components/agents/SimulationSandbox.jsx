import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Play,
  Loader2,
  UserPlus,
  UserMinus,
  DollarSign,
  Megaphone,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  BarChart3,
  Shield,
  Target,
  Zap,
  Clock,
  Gauge,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SCENARIO_TYPES = [
  {
    key: "add_creator",
    label: "Add Creator",
    description: "Simulate adding new talent to your roster and see the projected impact on deals and revenue.",
    icon: UserPlus,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "remove_creator",
    label: "Remove Creator",
    description: "See the projected impact of removing a creator from your portfolio.",
    icon: UserMinus,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-50 to-rose-50",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    key: "change_budget",
    label: "Budget Change",
    description: "Model the effects of increasing or decreasing your partnership budget allocation.",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    key: "new_campaign",
    label: "New Campaign",
    description: "Forecast the performance of launching a new campaign type across your roster.",
    icon: Megaphone,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    key: "market_shift",
    label: "Market Shift",
    description: "Simulate how external market changes would ripple through your partnership portfolio.",
    icon: TrendingDown,
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    badgeColor: "bg-blue-100 text-blue-700",
  },
];

const CAMPAIGN_TYPES = [
  "Sponsored Content",
  "Product Launch",
  "Brand Ambassador",
  "Affiliate Program",
  "Event Activation",
  "UGC Campaign",
  "Whitelisted Ads",
  "Long-term Partnership",
];

const MARKET_FACTORS = [
  "Economic downturn",
  "Platform algorithm change",
  "New competitor enters market",
  "Regulatory changes",
  "Seasonal demand shift",
  "Viral trend opportunity",
  "Brand safety crisis",
  "Creator economy boom",
];

function ConfidenceMeter({ score }) {
  const pct = Math.min(Math.max(score || 0, 0), 100);
  let color = "bg-red-500";
  let label = "Low";
  if (pct >= 70) { color = "bg-emerald-500"; label = "High"; }
  else if (pct >= 40) { color = "bg-amber-500"; label = "Medium"; }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 font-medium flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5" /> Confidence Score
        </span>
        <span className="font-bold text-gray-700">{pct}% — {label}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ImpactBadge({ value }) {
  if (!value) return null;
  const lower = value.toLowerCase();
  const isPositive = lower.includes("positive") || lower.includes("increase") || lower.includes("improve") || lower.includes("growth") || lower.includes("gain") || lower.includes("+");
  const isNegative = lower.includes("negative") || lower.includes("decrease") || lower.includes("decline") || lower.includes("loss") || lower.includes("risk") || lower.includes("-");

  if (isPositive) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <ArrowUpRight className="w-3 h-3" /> {value}
      </span>
    );
  }
  if (isNegative) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
        <ArrowDownRight className="w-3 h-3" /> {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
      <ArrowRight className="w-3 h-3" /> {value}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const s = (severity || "").toLowerCase();
  if (s === "high" || s === "critical") {
    return <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">High</Badge>;
  }
  if (s === "medium" || s === "moderate") {
    return <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Medium</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">Low</Badge>;
}

function MetricCard({ label, current, simulated, icon: Icon }) {
  const curr = typeof current === "number" ? current : parseFloat(current) || 0;
  const sim = typeof simulated === "number" ? simulated : parseFloat(simulated) || 0;
  const diff = sim - curr;
  const pctChange = curr !== 0 ? ((diff / curr) * 100).toFixed(1) : "N/A";
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Current</div>
          <div className="text-sm font-bold text-gray-700">
            {typeof current === "number" ? current.toLocaleString() : current}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Simulated</div>
          <div className={`text-sm font-bold ${isUp ? "text-emerald-600" : isDown ? "text-red-600" : "text-gray-700"}`}>
            {typeof simulated === "number" ? simulated.toLocaleString() : simulated}
          </div>
        </div>
      </div>
      {pctChange !== "N/A" && diff !== 0 && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-600"}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? "+" : ""}{pctChange}%
        </div>
      )}
    </div>
  );
}

export default function SimulationSandbox() {
  const [selectedType, setSelectedType] = useState(null);
  const [params, setParams] = useState({ talent_ids: [], budget_change: 0, campaign_type: "", market_factor: "" });
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState(null);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Load talents for selector
  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Talent.list("-created_date", 200);
        setTalents(data || []);
      } catch (_) {
        // Talents will remain empty
      }
    })();
  }, []);

  const handleSelectType = (key) => {
    setSelectedType(key);
    setParams({ talent_ids: [], budget_change: 0, campaign_type: "", market_factor: "" });
    setSimulation(null);
    setError(null);
  };

  const toggleTalent = (id) => {
    setParams((prev) => ({
      ...prev,
      talent_ids: prev.talent_ids.includes(id)
        ? prev.talent_ids.filter((tid) => tid !== id)
        : [...prev.talent_ids, id],
    }));
  };

  const runSimulation = async () => {
    if (!selectedType) return;
    setLoading(true);
    setSimulation(null);
    setError(null);
    setShowComparisonTable(false);
    setShowAlternatives(false);

    try {
      const response = await base44.functions.invoke("simulatePartnership", {
        scenario: { type: selectedType, params },
      });
      const result = response?.data || response;
      if (result?.success && result?.simulation) {
        setSimulation(result.simulation);
      } else if (result?.simulation) {
        setSimulation(result.simulation);
      } else {
        setError(result?.error || "Simulation returned no results.");
      }
    } catch (err) {
      setError(err?.message || "Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const canRun = () => {
    if (!selectedType) return false;
    if (selectedType === "add_creator" || selectedType === "remove_creator") {
      return params.talent_ids.length > 0;
    }
    if (selectedType === "change_budget") return params.budget_change !== 0;
    if (selectedType === "new_campaign") return !!params.campaign_type;
    if (selectedType === "market_shift") return !!params.market_factor;
    return true;
  };

  const sim = simulation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 to-cyan-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Partnership Simulation Sandbox
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Model what-if scenarios and see projected impacts before making real decisions
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {SCENARIO_TYPES.length} scenarios
          </Badge>
        </CardHeader>
      </Card>

      {/* Scenario Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIO_TYPES.map((st) => {
          const Icon = st.icon;
          const isSelected = selectedType === st.key;
          return (
            <button
              key={st.key}
              onClick={() => handleSelectType(st.key)}
              className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-indigo-400 ring-2 ring-indigo-200 bg-white shadow-md"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${st.bgGradient} mb-2`}>
                <Icon className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">{st.label}</h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{st.description}</p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Parameter Inputs */}
      {selectedType && (
        <Card className="rounded-2xl shadow-md border border-gray-100">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Configure Scenario Parameters
            </h3>

            {/* Talent selector for add/remove */}
            {(selectedType === "add_creator" || selectedType === "remove_creator") && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Select Talent{params.talent_ids.length > 0 ? ` (${params.talent_ids.length} selected)` : ""}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {talents.map((t) => {
                    const isChecked = params.talent_ids.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTalent(t.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                          isChecked
                            ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium"
                            : "bg-gray-50 border border-transparent hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "bg-indigo-500 border-indigo-500" : "border-gray-300"
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="truncate">{t.name}</span>
                        {t.platform && (
                          <Badge className={`${SCENARIO_TYPES[0].badgeColor} border-0 text-[9px] ml-auto shrink-0`}>
                            {t.platform}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                  {talents.length === 0 && (
                    <p className="text-xs text-gray-400 col-span-full text-center py-3">No talents found</p>
                  )}
                </div>
              </div>
            )}

            {/* Budget slider */}
            {selectedType === "change_budget" && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-600">
                  Budget Change: <span className={`font-bold ${params.budget_change > 0 ? "text-emerald-600" : params.budget_change < 0 ? "text-red-600" : "text-gray-700"}`}>
                    {params.budget_change > 0 ? "+" : ""}{params.budget_change}%
                  </span>
                </label>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  step={5}
                  value={params.budget_change}
                  onChange={(e) => setParams((prev) => ({ ...prev, budget_change: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+50%</span>
                  <span>+100%</span>
                </div>
              </div>
            )}

            {/* Campaign type selector */}
            {selectedType === "new_campaign" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Campaign Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CAMPAIGN_TYPES.map((ct) => (
                    <button
                      key={ct}
                      onClick={() => setParams((prev) => ({ ...prev, campaign_type: ct }))}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        params.campaign_type === ct
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Market factor selector */}
            {selectedType === "market_shift" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Market Factor</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MARKET_FACTORS.map((mf) => (
                    <button
                      key={mf}
                      onClick={() => setParams((prev) => ({ ...prev, market_factor: mf }))}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                        params.market_factor === mf
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      {mf}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Run Simulation Button */}
            <div className="pt-2">
              <Button
                onClick={runSimulation}
                disabled={!canRun() || loading}
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 text-white rounded-xl shadow-md gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Simulation Results */}
      {sim && (
        <div className="space-y-5">
          {/* Scenario Description + Confidence */}
          <Card className="rounded-2xl shadow-md border border-gray-100">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50">
                  <Info className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800">Scenario Summary</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{sim.scenario_description}</p>
                </div>
                {sim.timeline_to_impact && (
                  <Badge variant="outline" className="text-[10px] shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sim.timeline_to_impact}
                  </Badge>
                )}
              </div>
              <ConfidenceMeter score={sim.confidence_score} />
            </CardContent>
          </Card>

          {/* Before / After Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Current State */}
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  Current State
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3">
                {sim.current_state && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{sim.current_state.total_creators}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Creators</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{sim.current_state.total_deals}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Deals</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">${(sim.current_state.portfolio_value || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Portfolio Value</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{sim.current_state.avg_roi}%</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Avg ROI</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Simulated State */}
            <Card className="rounded-2xl shadow-md border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Simulated State
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3">
                {sim.simulated_state && sim.current_state && (
                  <>
                    {[
                      { key: "total_creators", label: "Creators" },
                      { key: "total_deals", label: "Deals" },
                      { key: "portfolio_value", label: "Portfolio Value", prefix: "$" },
                      { key: "avg_roi", label: "Avg ROI", suffix: "%" },
                    ].map(({ key, label, prefix, suffix }) => {
                      const curr = sim.current_state[key] || 0;
                      const simVal = sim.simulated_state[key] || 0;
                      const diff = simVal - curr;
                      const isUp = diff > 0;
                      const isDown = diff < 0;
                      return (
                        <div key={key} className="bg-white/80 rounded-xl p-3 text-center border border-indigo-50">
                          <div className={`text-lg font-bold ${isUp ? "text-emerald-600" : isDown ? "text-red-600" : "text-gray-800"}`}>
                            {prefix || ""}{typeof simVal === "number" ? simVal.toLocaleString() : simVal}{suffix || ""}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
                          {diff !== 0 && (
                            <div className={`text-[10px] font-medium mt-1 flex items-center justify-center gap-0.5 ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                              {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              {isUp ? "+" : ""}{typeof diff === "number" && key === "portfolio_value" ? `$${diff.toLocaleString()}` : diff}{suffix || ""}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Impact Analysis */}
          {sim.impact_analysis && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: "revenue_impact", label: "Revenue", icon: DollarSign },
                    { key: "risk_impact", label: "Risk", icon: Shield },
                    { key: "reach_impact", label: "Reach", icon: Target },
                    { key: "efficiency_impact", label: "Efficiency", icon: Zap },
                  ].map(({ key, label, icon: ImpIcon }) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <ImpIcon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                      <ImpactBadge value={sim.impact_analysis[key]} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Side Effects Warnings */}
          {sim.side_effects && sim.side_effects.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-amber-100 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Side Effects & Warnings
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] ml-auto">
                    {sim.side_effects.length} detected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {sim.side_effects.map((se, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-amber-100">
                    <SeverityBadge severity={se.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800">{se.effect}</div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{se.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comparison Table (collapsible) */}
          {sim.comparison_table && sim.comparison_table.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setShowComparisonTable(!showComparisonTable)}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    Detailed Comparison Table
                  </CardTitle>
                  {showComparisonTable ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </CardHeader>
              {showComparisonTable && (
                <CardContent className="p-4 pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-3 text-gray-500 font-medium">Metric</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Current</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Simulated</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Change</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sim.comparison_table.map((row, idx) => {
                          const changeLower = (row.change || "").toLowerCase();
                          const isPositive = changeLower.startsWith("+") || changeLower.includes("increase");
                          const isNegative = changeLower.startsWith("-") || changeLower.includes("decrease");
                          return (
                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium text-gray-700">{row.metric}</td>
                              <td className="py-2 px-3 text-right text-gray-600">{row.current}</td>
                              <td className={`py-2 px-3 text-right font-medium ${
                                isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-gray-700"
                              }`}>
                                {row.simulated}
                              </td>
                              <td className={`py-2 px-3 text-right ${
                                isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-gray-600"
                              }`}>
                                {row.change}
                              </td>
                              <td className={`py-2 px-3 text-right ${
                                isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-gray-600"
                              }`}>
                                {row.change_percent}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Recommendations */}
          {sim.recommendations && sim.recommendations.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="space-y-2">
                  {sim.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="font-bold text-indigo-500 mt-px shrink-0">{idx + 1}.</span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alternative Scenarios (collapsible) */}
          {sim.alternative_scenarios && sim.alternative_scenarios.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-500" />
                    Alternative Scenarios
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {sim.alternative_scenarios.length} options
                    </Badge>
                  </CardTitle>
                  {showAlternatives ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </CardHeader>
              {showAlternatives && (
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sim.alternative_scenarios.map((alt, idx) => {
                      const risk = (alt.risk_level || "").toLowerCase();
                      let riskColor = "border-blue-200 bg-blue-50";
                      let riskTextColor = "text-blue-700";
                      if (risk === "high") { riskColor = "border-red-200 bg-red-50"; riskTextColor = "text-red-700"; }
                      else if (risk === "medium") { riskColor = "border-amber-200 bg-amber-50"; riskTextColor = "text-amber-700"; }

                      return (
                        <div key={idx} className={`rounded-xl p-4 border ${riskColor} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-800">{alt.scenario}</h4>
                            <Badge className={`${riskTextColor} ${riskColor} border-0 text-[9px]`}>
                              {alt.risk_level} risk
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{alt.expected_outcome}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

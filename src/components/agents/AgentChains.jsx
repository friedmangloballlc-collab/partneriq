import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  Shield,
  Users,
  Rocket,
  DollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CHAINS = [
  {
    key: "deal_intelligence",
    name: "Deal Intelligence",
    description:
      "End-to-end deal analysis: trends inform competitive positioning which shapes negotiation strategy.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      { fn: "analyzeTrendPrediction", label: "Trend Prediction" },
      { fn: "analyzeCompetitorIntelligence", label: "Competitor Intelligence" },
      { fn: "analyzeNegotiationCoach", label: "Negotiation Coach" },
    ],
  },
  {
    key: "brand_protection",
    name: "Brand Protection",
    description:
      "Comprehensive brand safety pipeline: safety audit feeds compliance review which informs relationship health.",
    icon: Shield,
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
    badgeColor: "bg-rose-100 text-rose-700",
    steps: [
      { fn: "analyzeBrandSafety", label: "Brand Safety" },
      { fn: "analyzeComplianceDisclosure", label: "Compliance & Disclosure" },
      { fn: "analyzeRelationshipHealth", label: "Relationship Health" },
    ],
  },
  {
    key: "portfolio_optimization",
    name: "Portfolio Optimization",
    description:
      "Optimize your creator portfolio: audience overlap analysis informs roster changes which drive attribution insights.",
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
    steps: [
      { fn: "analyzeAudienceOverlap", label: "Audience Overlap" },
      { fn: "analyzeRosterOptimization", label: "Roster Optimization" },
      { fn: "analyzeCrossPlatformAttribution", label: "Cross-Platform Attribution" },
    ],
  },
  {
    key: "campaign_launch",
    name: "Campaign Launch",
    description:
      "Launch-ready intelligence: trend signals shape creative direction which informs contract structuring.",
    icon: Rocket,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50",
    badgeColor: "bg-violet-100 text-violet-700",
    steps: [
      { fn: "analyzeTrendPrediction", label: "Trend Prediction" },
      { fn: "generateCreativeDirection", label: "Creative Direction" },
      { fn: "analyzeContractIntelligence", label: "Contract Intelligence" },
    ],
  },
  {
    key: "financial_health",
    name: "Financial Health",
    description:
      "Financial deep-dive: invoice reconciliation informs contract review which benchmarks against competitor pricing.",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    badgeColor: "bg-amber-100 text-amber-700",
    steps: [
      { fn: "analyzeInvoiceReconciliation", label: "Invoice Reconciliation" },
      { fn: "analyzeContractIntelligence", label: "Contract Intelligence" },
      { fn: "analyzeCompetitorIntelligence", label: "Competitor Intelligence" },
    ],
  },
];

function StepPipeline({ steps, currentStep, stepStatuses }) {
  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {steps.map((step, idx) => {
        const status = stepStatuses?.[idx];
        const isActive = currentStep === idx;

        let ringClass = "border-gray-200 bg-white text-gray-600";
        if (status === "completed") ringClass = "border-green-400 bg-green-50 text-green-700";
        else if (status === "failed") ringClass = "border-red-400 bg-red-50 text-red-700";
        else if (isActive) ringClass = "border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200";

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${ringClass}`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : status === "failed" ? (
                  <XCircle className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight max-w-[80px] truncate">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight
                className={`w-4 h-4 shrink-0 mt-[-14px] ${
                  status === "completed" ? "text-green-400" : "text-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function AgentChains() {
  const [chainStates, setChainStates] = useState({});

  const runChain = async (chainKey) => {
    setChainStates((prev) => ({
      ...prev,
      [chainKey]: {
        running: true,
        currentStep: 0,
        stepStatuses: [],
        result: null,
        error: null,
        expanded: true,
      },
    }));

    // Simulate step progression via polling appearance
    const chain = CHAINS.find((c) => c.key === chainKey);
    const totalSteps = chain.steps.length;

    // Start a timer to visually advance steps (approximate)
    const stepInterval = setInterval(() => {
      setChainStates((prev) => {
        const state = prev[chainKey];
        if (!state || !state.running) return prev;
        const next = state.currentStep + 1;
        if (next >= totalSteps) {
          clearInterval(stepInterval);
          return prev;
        }
        const statuses = [...(state.stepStatuses || [])];
        statuses[state.currentStep] = "completed";
        return {
          ...prev,
          [chainKey]: { ...state, currentStep: next, stepStatuses: statuses },
        };
      });
    }, 8000);

    try {
      const response = await base44.functions.invoke("runAgentChain", {
        chain: chainKey,
      });

      clearInterval(stepInterval);

      const finalStatuses = (response.steps || []).map((s) => s.status);

      setChainStates((prev) => ({
        ...prev,
        [chainKey]: {
          running: false,
          currentStep: totalSteps,
          stepStatuses: finalStatuses,
          result: response,
          error: null,
          expanded: true,
        },
      }));
    } catch (err) {
      clearInterval(stepInterval);
      setChainStates((prev) => ({
        ...prev,
        [chainKey]: {
          ...prev[chainKey],
          running: false,
          error: err?.message || "Chain execution failed",
          expanded: true,
        },
      }));
    }
  };

  const toggleExpand = (chainKey) => {
    setChainStates((prev) => ({
      ...prev,
      [chainKey]: {
        ...prev[chainKey],
        expanded: !prev[chainKey]?.expanded,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Agent Chains
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Run multi-agent workflows that chain insights across specialized AI agents
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {CHAINS.length} workflows
          </Badge>
        </CardHeader>
      </Card>

      {/* Chain Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CHAINS.map((chain) => {
          const state = chainStates[chain.key] || {};
          const Icon = chain.icon;
          const hasResult = state.result && !state.running;
          const hasError = state.error && !state.running;

          return (
            <Card
              key={chain.key}
              className="rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Gradient top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${chain.gradient}`} />

              <CardContent className="p-5">
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-br ${chain.bgGradient}`}
                    >
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {chain.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                        {chain.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${chain.badgeColor} border-0 text-[10px] shrink-0`}>
                    {chain.steps.length} agents
                  </Badge>
                </div>

                {/* Step pipeline visualization */}
                <div className="bg-gray-50 rounded-xl p-2 mb-3">
                  <StepPipeline
                    steps={chain.steps}
                    currentStep={state.running ? state.currentStep : null}
                    stepStatuses={state.stepStatuses}
                  />
                </div>

                {/* Run button / status */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => runChain(chain.key)}
                    disabled={state.running}
                    className={`bg-gradient-to-r ${chain.gradient} hover:opacity-90 text-white rounded-xl shadow-md gap-2 flex-1`}
                  >
                    {state.running ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running step {(state.currentStep || 0) + 1} of{" "}
                        {chain.steps.length}...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Chain
                      </>
                    )}
                  </Button>
                  {(hasResult || hasError) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(chain.key)}
                      className="rounded-xl"
                    >
                      {state.expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Error */}
                {hasError && state.expanded && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Chain Failed
                    </div>
                    <p className="text-xs text-red-600 mt-1">{state.error}</p>
                  </div>
                )}

                {/* Results */}
                {hasResult && state.expanded && (
                  <div className="mt-3 space-y-3">
                    {/* Unified Summary */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-gray-800">
                          Unified Summary
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {state.result.unified_summary}
                      </p>
                    </div>

                    {/* Individual Step Results */}
                    <div className="space-y-2">
                      {(state.result.steps || []).map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-gray-700">
                              {step.agent}
                            </span>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                              {step.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Top Actions */}
                    {state.result.top_actions &&
                      state.result.top_actions.length > 0 && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-gray-800">
                              Top Actions
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {state.result.top_actions.map((action, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-gray-600"
                              >
                                <span className="font-bold text-indigo-500 mt-px shrink-0">
                                  {idx + 1}.
                                </span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Key Risks */}
                    {state.result.key_risks &&
                      state.result.key_risks.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-gray-800">
                              Key Risks
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {state.result.key_risks.map((risk, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-600 flex items-start gap-1.5"
                              >
                                <span className="text-amber-500 mt-px shrink-0">
                                  --
                                </span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Stats */}
                    {state.result.stats && (
                      <div className="flex items-center gap-3 pt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-green-300 text-green-700 bg-green-50"
                        >
                          {state.result.stats.completed} completed
                        </Badge>
                        {state.result.stats.failed > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-red-300 text-red-700 bg-red-50"
                          >
                            {state.result.stats.failed} failed
                          </Badge>
                        )}
                        {state.result.recommended_next_chain && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-indigo-300 text-indigo-700 bg-indigo-50 cursor-pointer hover:bg-indigo-100"
                            onClick={() => {
                              if (CHAINS.find((c) => c.key === state.result.recommended_next_chain)) {
                                runChain(state.result.recommended_next_chain);
                              }
                            }}
                          >
                            Next: {state.result.recommended_next_chain}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

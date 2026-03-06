import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle2,
  Zap, ArrowRight, Shield, FileText, Eye, Users, Target, MessageSquare,
  Flame, BarChart3, PieChart, DollarSign, Scale, Palette, Search,
  ChevronDown, ChevronUp, Play, Clock, Link2, GitMerge, Database
} from "lucide-react";
import AgentScheduler from "@/components/agents/AgentScheduler";
import AgentChains from "@/components/agents/AgentChains";
import SocialMediaIntegrations from "@/components/agents/SocialMediaIntegrations";

const IMPACT_CONFIG = {
  high:     { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  medium:   { badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
  low:      { badge: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
  critical: { badge: "bg-red-100 text-red-700",         dot: "bg-red-500" },
};

const AGENTS = [
  {
    key: "contractIntelligence",
    fn: "analyzeContractIntelligence",
    title: "Contract Intelligence",
    desc: "Automates deal structuring, contract analysis, pricing fairness assessment, and risk clause recommendations.",
    icon: FileText,
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    tier: "Revenue",
  },
  {
    key: "competitorIntelligence",
    fn: "analyzeCompetitorIntelligence",
    title: "Competitor Intelligence",
    desc: "Monitors competitor brand-creator partnerships, identifies white space opportunities and talent acquisition threats.",
    icon: Search,
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    tier: "Revenue",
  },
  {
    key: "audienceOverlap",
    fn: "analyzeAudienceOverlap",
    title: "Audience Overlap",
    desc: "Analyzes audience overlap between creators to prevent cannibalization and optimize portfolio reach efficiency.",
    icon: PieChart,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    tier: "Revenue",
  },
  {
    key: "relationshipHealth",
    fn: "analyzeRelationshipHealth",
    title: "Relationship Health",
    desc: "Tracks partnership sentiment, flags at-risk relationships, and suggests re-engagement strategies before churn.",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tier: "Engagement",
  },
  {
    key: "creativeDirection",
    fn: "generateCreativeDirection",
    title: "Creative Direction",
    desc: "Generates content briefs with visual style guides, talking points, do's/don'ts, and platform-specific scripts.",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
    tier: "Engagement",
  },
  {
    key: "negotiationCoach",
    fn: "analyzeNegotiationCoach",
    title: "Negotiation Coach",
    desc: "Real-time negotiation intelligence with BATNA analysis, counter-offers, leverage points, and closing tactics.",
    icon: MessageSquare,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    tier: "Engagement",
  },
  {
    key: "trendPrediction",
    fn: "analyzeTrendPrediction",
    title: "Trend Prediction",
    desc: "Predicts emerging trends, viral moments, and newsjacking opportunities with actionable activation windows.",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    tier: "Differentiation",
  },
  {
    key: "brandSafety",
    fn: "analyzeBrandSafety",
    title: "Brand Safety",
    desc: "Continuously monitors creator content for brand safety risks, crisis scenarios, and compliance red flags.",
    icon: Shield,
    color: "from-red-500 to-rose-700",
    bg: "bg-red-50",
    iconColor: "text-red-600",
    tier: "Differentiation",
  },
  {
    key: "crossPlatformAttribution",
    fn: "analyzeCrossPlatformAttribution",
    title: "Cross-Platform Attribution",
    desc: "Multi-touch attribution modeling across platforms with channel effectiveness ranking and incrementality analysis.",
    icon: BarChart3,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    tier: "Differentiation",
  },
  {
    key: "rosterOptimization",
    fn: "analyzeRosterOptimization",
    title: "Roster Optimization",
    desc: "Analyzes talent rosters, identifies coverage gaps, recommends recruits, and flags underperformers to sunset.",
    icon: Target,
    color: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
    tier: "Differentiation",
  },
  {
    key: "invoiceReconciliation",
    fn: "analyzeInvoiceReconciliation",
    title: "Invoice & Payments",
    desc: "Automates payment tracking, milestone billing, dispute risk identification, and cash flow forecasting.",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    tier: "Operations",
  },
  {
    key: "complianceDisclosure",
    fn: "analyzeComplianceDisclosure",
    title: "Compliance & Disclosure",
    desc: "Ensures FTC/ASA compliance, tracks disclosure requirements, and generates compliance reports for legal teams.",
    icon: Scale,
    color: "from-slate-500 to-gray-700",
    bg: "bg-slate-50",
    iconColor: "text-slate-600",
    tier: "Operations",
  },
];

const TIER_INFO = {
  Revenue:         { label: "Revenue-Multiplying", color: "bg-emerald-500", badgeColor: "bg-emerald-100 text-emerald-700" },
  Engagement:      { label: "Engagement & Retention", color: "bg-blue-500", badgeColor: "bg-blue-100 text-blue-700" },
  Differentiation: { label: "Platform Differentiation", color: "bg-purple-500", badgeColor: "bg-purple-100 text-purple-700" },
  Operations:      { label: "Operational Efficiency", color: "bg-slate-500", badgeColor: "bg-slate-100 text-slate-700" },
};

function AgentResultRenderer({ agentKey, analysis }) {
  if (!analysis) return null;

  return (
    <div className="space-y-4 mt-4">
      {/* Executive Summary */}
      {analysis.executive_summary && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Executive Summary</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.executive_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Actions */}
      {analysis.top_3_actions?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Top 3 Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {analysis.top_3_actions.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">{i + 1}</span>
                  {a}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Dynamic sections based on analysis keys */}
      {renderDynamicSections(agentKey, analysis)}
    </div>
  );
}

function renderDynamicSections(agentKey, analysis) {
  const sections = [];
  const sectionRenderers = {
    // Arrays of objects with pattern/risk/opportunity style data
    contract_structure: { title: "Contract Structure", icon: FileText, color: "text-indigo-500" },
    risk_clauses: { title: "Risk Clauses", icon: Shield, color: "text-red-500" },
    performance_guarantees: { title: "Performance Guarantees", icon: CheckCircle2, color: "text-emerald-500" },
    competitor_patterns: { title: "Competitor Patterns", icon: Search, color: "text-rose-500" },
    white_space_opportunities: { title: "White Space Opportunities", icon: Target, color: "text-violet-500" },
    talent_threats: { title: "Talent Threats", icon: AlertTriangle, color: "text-amber-500" },
    emerging_trends: { title: "Emerging Trends", icon: TrendingUp, color: "text-orange-500" },
    overlap_clusters: { title: "Audience Overlap Clusters", icon: PieChart, color: "text-violet-500" },
    cannibalization_risks: { title: "Cannibalization Risks", icon: AlertTriangle, color: "text-red-500" },
    creator_swaps: { title: "Creator Swap Recommendations", icon: Users, color: "text-blue-500" },
    at_risk_partnerships: { title: "At-Risk Partnerships", icon: AlertTriangle, color: "text-amber-500" },
    reengagement_opportunities: { title: "Re-engagement Opportunities", icon: Zap, color: "text-emerald-500" },
    churn_prevention: { title: "Churn Prevention Strategies", icon: Shield, color: "text-blue-500" },
    talking_points: { title: "Talking Points", icon: MessageSquare, color: "text-pink-500" },
    shot_list: { title: "Shot List", icon: Palette, color: "text-purple-500" },
    leverage_points: { title: "Leverage Points", icon: Zap, color: "text-amber-500" },
    value_adds: { title: "Value-Add Suggestions", icon: Sparkles, color: "text-indigo-500" },
    objection_playbook: { title: "Objection Playbook", icon: MessageSquare, color: "text-orange-500" },
    closing_tactics: { title: "Closing Tactics", icon: Target, color: "text-emerald-500" },
    viral_signals: { title: "Viral Signals", icon: Flame, color: "text-orange-500" },
    newsjacking_opportunities: { title: "Newsjacking Opportunities", icon: Zap, color: "text-red-500" },
    seasonal_opportunities: { title: "Seasonal Opportunities", icon: TrendingUp, color: "text-blue-500" },
    rising_categories: { title: "Rising Categories", icon: TrendingUp, color: "text-emerald-500" },
    activation_calendar: { title: "Activation Calendar", icon: Target, color: "text-indigo-500" },
    creator_risk_assessments: { title: "Creator Risk Assessments", icon: Shield, color: "text-red-500" },
    content_risk_alerts: { title: "Content Risk Alerts", icon: AlertTriangle, color: "text-red-500" },
    crisis_scenarios: { title: "Crisis Scenarios", icon: AlertTriangle, color: "text-rose-500" },
    compliance_flags: { title: "Compliance Flags", icon: Scale, color: "text-amber-500" },
    hold_recommendations: { title: "Hold Recommendations", icon: Shield, color: "text-red-500" },
    channel_effectiveness: { title: "Channel Effectiveness", icon: BarChart3, color: "text-blue-500" },
    journey_mapping: { title: "Journey Mapping", icon: ArrowRight, color: "text-purple-500" },
    platform_roi: { title: "Platform ROI", icon: DollarSign, color: "text-emerald-500" },
    optimal_channel_mix: { title: "Optimal Channel Mix", icon: PieChart, color: "text-indigo-500" },
    coverage_gaps: { title: "Coverage Gaps", icon: Target, color: "text-amber-500" },
    recruit_recommendations: { title: "Recruit Recommendations", icon: Users, color: "text-blue-500" },
    sunset_candidates: { title: "Sunset Candidates", icon: AlertTriangle, color: "text-red-500" },
    rising_stars: { title: "Rising Stars", icon: Sparkles, color: "text-emerald-500" },
    revenue_optimization: { title: "Revenue Optimization", icon: DollarSign, color: "text-green-500" },
    outstanding_payments: { title: "Outstanding Payments", icon: DollarSign, color: "text-amber-500" },
    milestone_tracking: { title: "Milestone Tracking", icon: CheckCircle2, color: "text-blue-500" },
    dispute_risks: { title: "Dispute Risks", icon: AlertTriangle, color: "text-red-500" },
    automation_recommendations: { title: "Automation Recommendations", icon: Zap, color: "text-indigo-500" },
    ftc_requirements: { title: "FTC Requirements", icon: Scale, color: "text-slate-500" },
    platform_rules: { title: "Platform Rules", icon: Shield, color: "text-blue-500" },
    international_requirements: { title: "International Requirements", icon: Scale, color: "text-purple-500" },
    usage_rights_audit: { title: "Usage Rights Audit", icon: FileText, color: "text-amber-500" },
    partnership_compliance_scores: { title: "Compliance Scores", icon: CheckCircle2, color: "text-emerald-500" },
    monitoring_checklist: { title: "Monitoring Checklist", icon: CheckCircle2, color: "text-blue-500" },
  };

  // Render object-type sections (like pricing_assessment, payment_structure, etc.)
  const objectSections = [
    "pricing_assessment", "payment_structure", "content_rights", "market_position",
    "pricing_intelligence", "optimal_portfolio", "budget_optimization",
    "portfolio_health", "communication_insights", "creative_concept", "visual_style",
    "brand_voice", "dos_and_donts", "script_framework", "batna_analysis",
    "counter_offer_strategy", "walk_away_thresholds", "sentiment_indicators",
    "attribution_comparison", "incrementality_insights", "portfolio_score",
    "reconciliation_status", "cash_flow_forecast"
  ];

  for (const key of objectSections) {
    if (analysis[key] && typeof analysis[key] === 'object' && !Array.isArray(analysis[key])) {
      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      sections.push(
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(analysis[key]).map(([k, v]) => {
                if (Array.isArray(v)) {
                  return (
                    <div key={k} className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {k.replace(/_/g, ' ')}
                      </p>
                      <ul className="space-y-1">
                        {v.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <div key={k} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {k.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-700">{String(v)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Render array-type sections
  for (const [key, config] of Object.entries(sectionRenderers)) {
    if (analysis[key] && Array.isArray(analysis[key]) && analysis[key].length > 0) {
      const Icon = config.icon;
      sections.push(
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
              <Icon className={`w-4 h-4 ${config.color}`} /> {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {analysis[key].map((item, i) => {
              const entries = Object.entries(item);
              const title = entries[0]?.[1] || '';
              const rest = entries.slice(1);
              const severity = item.risk_level || item.severity || item.impact || item.priority || item.likelihood;
              const cfg = IMPACT_CONFIG[severity?.toLowerCase()] || IMPACT_CONFIG.medium;

              return (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-xs font-semibold text-slate-800 flex-1">{title}</span>
                    {severity && <Badge className={`text-[10px] ${cfg.badge}`}>{severity}</Badge>}
                  </div>
                  <div className="space-y-1 pl-4">
                    {rest.map(([k, v]) => (
                      <p key={k} className="text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">{k.replace(/_/g, ' ')}:</span> {String(v)}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    }
  }

  return sections.length > 0 ? (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{sections}</div>
  ) : null;
}

function AgentPanel({ agent }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const Icon = agent.icon;
  const tierInfo = TIER_INFO[agent.tier];

  const run = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setExpanded(true);
    try {
      const res = await base44.functions.invoke(agent.fn, {});
      if (res.data?.error) setError(res.data.error);
      else setAnalysis(res.data?.analysis);
    } catch (e) {
      setError(e.message || "Failed to run agent");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      {/* Agent Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-sm">{agent.title}</h3>
              <Badge className={`text-[9px] ${tierInfo.badgeColor}`}>{tierInfo.label}</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{agent.desc}</p>
          </div>
          <Button
            onClick={run}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 shrink-0 h-9 px-4"
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Running...</>
              : <><Play className="w-3.5 h-3.5 mr-1.5" />Run</>}
          </Button>
        </div>
      </div>

      {/* Results Area */}
      {(loading || error || analysis) && (
        <div className="border-t border-slate-100 px-5 pb-5">
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-400" />
              <p className="text-xs text-slate-500 font-medium">AI agent analyzing your data...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mt-4">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
            </div>
          )}

          {analysis && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-3 mb-1"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Collapse Results" : "Show Results"}
              </button>
              {expanded && <AgentResultRenderer agentKey={agent.key} analysis={analysis} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const MAIN_TABS = [
  { key: "agents", label: "AI Agents", icon: Brain, desc: "Run individual agents" },
  { key: "workflows", label: "Workflows", icon: GitMerge, desc: "Chain agents together" },
  { key: "scheduler", label: "Scheduler", icon: Clock, desc: "Automate agent runs" },
  { key: "datasources", label: "Data Sources", icon: Database, desc: "Social media integrations" },
];

export default function AIAgentsHub() {
  const [activeTab, setActiveTab] = useState("agents");
  const [filter, setFilter] = useState("all");
  const tiers = ["all", "Revenue", "Engagement", "Differentiation", "Operations"];
  const filteredAgents = filter === "all" ? AGENTS : AGENTS.filter(a => a.tier === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Agents Hub</h1>
            <p className="text-sm text-slate-500">12 specialized AI agents with workflows, scheduling, and live data integrations</p>
          </div>
        </div>

        {/* Main navigation tabs */}
        <div className="flex gap-1 mt-5 bg-slate-100 rounded-xl p-1">
          {MAIN_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex-1 justify-center
                  ${activeTab === tab.key
                    ? "bg-white text-indigo-700 shadow-sm shadow-slate-200/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "agents" && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-6">
            {[
              { label: "Total Agents", value: "12", color: "text-indigo-600" },
              { label: "Revenue", value: "3", color: "text-emerald-600" },
              { label: "Engagement", value: "3", color: "text-blue-600" },
              { label: "Differentiation", value: "4", color: "text-purple-600" },
              { label: "Operations", value: "2", color: "text-slate-600" },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {tiers.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${filter === t
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t === "all" ? "All Agents" : TIER_INFO[t]?.label || t}
              </button>
            ))}
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredAgents.map(agent => (
              <AgentPanel key={agent.key} agent={agent} />
            ))}
          </div>

          {/* Architecture Note */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Agent Architecture</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "LLM-Powered", value: "All 12 agents use advanced language models for deep analysis" },
                  { label: "Data-Driven", value: "Agents pull from partnerships, talents, benchmarks, and more" },
                  { label: "Human Approval", value: "All outbound actions require human review before execution" },
                  { label: "Real-Time", value: "Analyses run on your latest data for up-to-date intelligence" },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "workflows" && <AgentChains />}
      {activeTab === "scheduler" && <AgentScheduler />}
      {activeTab === "datasources" && <SocialMediaIntegrations />}
    </div>
  );
}

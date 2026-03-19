import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Loader2, Send, Sparkles, ArrowRight, Command,
  History, ChevronRight, AlertTriangle, CheckCircle2, Clock,
  Zap, TrendingUp, Users, DollarSign, BarChart3, Shield,
  MessageSquare, X, Search, Target,
  FileText, Flame, PieChart, Palette, Scale
} from "lucide-react";
import { Link } from "react-router-dom";

const SUGGESTED_QUERIES = [
  { label: "Show me at-risk partnerships", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { label: "Which deals need attention?", icon: Target, color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100" },
  { label: "Find trending niches", icon: Flame, color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { label: "Compliance status check", icon: Shield, color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100" },
  { label: "Revenue forecast", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { label: "Creator recommendations for my brand", icon: Users, color: "text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100" },
];

const URGENCY_CONFIG = {
  high:     { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  medium:   { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  low:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  critical: { color: "bg-red-200 text-red-800 border-red-300", icon: AlertTriangle },
};

const AGENT_ICON_MAP = {
  "Contract Intelligence": FileText,
  "Competitor Intelligence": Search,
  "Audience Overlap": PieChart,
  "Relationship Health": Users,
  "Creative Direction": Palette,
  "Negotiation Coach": MessageSquare,
  "Trend Prediction": Flame,
  "Brand Safety": Shield,
  "Cross-Platform Attribution": BarChart3,
  "Roster Optimization": Target,
  "Invoice & Payments": DollarSign,
  "Compliance & Disclosure": Scale,
};

const HISTORY_KEY = "partneriq_command_center_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export default function AICommandCenter() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = useCallback(async (q) => {
    const trimmed = (q || query).trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await base44.functions.invoke("aiCommandCenter", { query: trimmed });
      if (res?.data?.success && res.data.response) {
        setResult(res.data.response);
        const entry = { query: trimmed, timestamp: Date.now() };
        const updated = [entry, ...history.filter(h => h.query !== trimmed)].slice(0, 50);
        setHistory(updated);
        saveHistory(updated);
      } else {
        setError(res?.data?.error || "Unexpected response from Command Center.");
      }
    } catch (err) {
      setError(err.message || "Failed to process your query.");
    } finally {
      setLoading(false);
    }
  }, [query, loading, history]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (label) => {
    setQuery(label);
    handleSubmit(label);
  };

  const handleHistoryClick = (q) => {
    setQuery(q);
    setHistoryOpen(false);
    handleSubmit(q);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="relative px-6 py-10 max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Command Center</h1>
          </div>
          <p className="text-indigo-100 text-sm max-w-lg mx-auto">
            Ask anything about your partnerships, creators, brands, and deals. Get instant AI-powered insights routed through specialized agents.
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-indigo-200 text-xs">
            <Command className="w-3 h-3" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white/15 rounded text-[10px] font-mono backdrop-blur-sm border border-white/20">
              {navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl"} + K
            </kbd>
            <span>to focus</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-10">
        {/* Search input card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your partnerships, deals, creators, or brands..."
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={() => handleSubmit()}
                disabled={!query.trim() || loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-5 h-11 shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHistoryOpen(!historyOpen)}
                className="rounded-xl h-11 w-11 border-slate-200"
                title="Query history"
              >
                <History className="w-4 h-4 text-slate-500" />
              </Button>
            </div>

            {/* Suggested queries */}
            {!result && !loading && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((sq) => (
                  <button
                    key={sq.label}
                    onClick={() => handleSuggestionClick(sq.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${sq.color}`}
                  >
                    <sq.icon className="w-3 h-3" />
                    {sq.label}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History panel */}
        {historyOpen && (
          <Card className="mt-3 shadow-lg border-slate-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" /> Query History
              </CardTitle>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-500 h-7 px-2">
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(false)} className="h-7 w-7">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No queries yet. Try asking something above!</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handleHistoryClick(h.query)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate mr-3">{h.query}</span>
                      <span className="text-[10px] text-slate-300 group-hover:text-indigo-400 shrink-0">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 py-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-500 animate-pulse">Analyzing your query across all systems...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Something went wrong</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-6 space-y-5 pb-12">
            {/* Understanding badge */}
            {result.understanding && (
              <div className="flex items-start gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] font-medium shrink-0 mt-0.5">
                  UNDERSTOOD
                </Badge>
                <p className="text-xs text-slate-500 italic">{result.understanding}</p>
              </div>
            )}

            {/* Direct answer - chat bubble */}
            {result.direct_answer && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">AI Insight</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.direct_answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data summary cards */}
            {result.data_summary && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Key Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.data_summary.total_partnerships != null && (
                    <MetricCard label="Total Partnerships" value={result.data_summary.total_partnerships} icon={Users} color="indigo" />
                  )}
                  {result.data_summary.active_partnerships != null && (
                    <MetricCard label="Active" value={result.data_summary.active_partnerships} icon={CheckCircle2} color="emerald" />
                  )}
                  {result.data_summary.at_risk_partnerships != null && (
                    <MetricCard label="At Risk" value={result.data_summary.at_risk_partnerships} icon={AlertTriangle} color="amber" />
                  )}
                  {result.data_summary.total_talents != null && (
                    <MetricCard label="Talents" value={result.data_summary.total_talents} icon={Users} color="violet" />
                  )}
                  {result.data_summary.total_brands != null && (
                    <MetricCard label="Brands" value={result.data_summary.total_brands} icon={Target} color="blue" />
                  )}
                  {result.data_summary.total_deal_value && (
                    <MetricCard label="Total Deal Value" value={result.data_summary.total_deal_value} icon={DollarSign} color="emerald" />
                  )}
                  {result.data_summary.avg_deal_value && (
                    <MetricCard label="Avg Deal Value" value={result.data_summary.avg_deal_value} icon={TrendingUp} color="blue" />
                  )}
                  {result.data_summary.avg_match_score && (
                    <MetricCard label="Avg Match Score" value={result.data_summary.avg_match_score} icon={Zap} color="purple" />
                  )}
                  {result.data_summary.additional_metrics?.map((m, i) => (
                    <MetricCard key={i} label={m.label} value={m.value} icon={BarChart3} color="slate" />
                  ))}
                </div>
              </div>
            )}

            {/* Recommended agents */}
            {result.recommended_agents?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Recommended Agents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommended_agents.map((agent, i) => {
                    const AgentIcon = AGENT_ICON_MAP[agent.agent_name] || Brain;
                    return (
                      <Link key={i} to="/ai-agents-hub" className="block">
                        <Card className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group bg-white/70 backdrop-blur-sm">
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                              <AgentIcon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                {agent.agent_name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{agent.reason}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-1" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested actions */}
            {result.suggested_actions?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Suggested Actions
                </h3>
                <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4 space-y-2">
                    {result.suggested_actions.map((action, i) => {
                      const urgencyKey = (action.urgency || "medium").toLowerCase();
                      const cfg = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.medium;
                      const UrgencyIcon = cfg.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                          <UrgencyIcon className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700">{action.action}</p>
                            {action.page_to_visit && (
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <ArrowRight className="w-2.5 h-2.5" />
                                Navigate to: {action.page_to_visit}
                              </p>
                            )}
                          </div>
                          <Badge className={`text-[10px] border shrink-0 ${cfg.color}`}>
                            {action.urgency || "medium"}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Follow-up questions */}
            {result.follow_up_questions?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Follow-up Questions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.follow_up_questions.map((fq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(fq)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer shadow-sm"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {fq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    indigo:  "from-indigo-50 to-indigo-100/50 text-indigo-700 border-indigo-200",
    emerald: "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
    amber:   "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
    violet:  "from-violet-50 to-violet-100/50 text-violet-700 border-violet-200",
    blue:    "from-blue-50 to-blue-100/50 text-blue-700 border-blue-200",
    purple:  "from-purple-50 to-purple-100/50 text-purple-700 border-purple-200",
    slate:   "from-slate-50 to-slate-100/50 text-slate-700 border-slate-200",
  };
  const cls = colorMap[color] || colorMap.slate;

  return (
    <Card className={`border bg-gradient-to-br ${cls} shadow-sm`}>
      <CardContent className="p-3 flex flex-col items-center text-center">
        <Icon className="w-4 h-4 mb-1 opacity-60" />
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-70 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

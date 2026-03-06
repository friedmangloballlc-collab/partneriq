import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Settings,
  Bot,
  History,
  RefreshCw,
  Shield,
  TrendingUp,
  FileText,
  Users,
  Palette,
  MessageSquare,
  BarChart3,
  Layers,
  Receipt,
  Scale,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "partneriq_agent_schedules";
const HISTORY_KEY = "partneriq_agent_run_history";

const AGENTS = [
  { name: "analyzeContractIntelligence",     label: "Contract Intelligence",        icon: FileText,      defaultFrequency: "daily",   description: "Contract clause analysis & risk detection" },
  { name: "analyzeCompetitorIntelligence",   label: "Competitor Intelligence",      icon: TrendingUp,    defaultFrequency: "daily",   description: "Competitor activity & market positioning" },
  { name: "analyzeAudienceOverlap",          label: "Audience Overlap",             icon: Users,         defaultFrequency: "weekly",  description: "Cross-partner audience overlap analysis" },
  { name: "analyzeRelationshipHealth",       label: "Relationship Health",          icon: Activity,      defaultFrequency: "daily",   description: "Partnership health scoring & alerts" },
  { name: "generateCreativeDirection",       label: "Creative Direction",           icon: Palette,       defaultFrequency: "weekly",  description: "AI-driven creative brief generation" },
  { name: "analyzeNegotiationCoach",         label: "Negotiation Coach",            icon: MessageSquare, defaultFrequency: "daily",   description: "Deal negotiation strategy & coaching" },
  { name: "analyzeTrendPrediction",          label: "Trend Prediction",             icon: BarChart3,     defaultFrequency: "daily",   description: "Market trend forecasting & signals" },
  { name: "analyzeBrandSafety",             label: "Brand Safety",                 icon: Shield,        defaultFrequency: "hourly",  description: "Brand safety monitoring & risk flags" },
  { name: "analyzeCrossPlatformAttribution", label: "Cross-Platform Attribution",   icon: Layers,        defaultFrequency: "daily",   description: "Multi-platform attribution modeling" },
  { name: "analyzeRosterOptimization",       label: "Roster Optimization",          icon: Users,         defaultFrequency: "weekly",  description: "Talent roster balancing & recommendations" },
  { name: "analyzeInvoiceReconciliation",    label: "Invoice Reconciliation",       icon: Receipt,       defaultFrequency: "daily",   description: "Invoice matching & discrepancy detection" },
  { name: "analyzeComplianceDisclosure",     label: "Compliance & Disclosure",      icon: Scale,         defaultFrequency: "hourly",  description: "FTC/regulatory compliance checking" },
];

function loadSchedules() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults = {};
  AGENTS.forEach((a) => {
    defaults[a.name] = { enabled: true, frequency: a.defaultFrequency, lastRun: null, lastStatus: null };
  });
  return defaults;
}

function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function formatTimestamp(ts) {
  if (!ts) return "Never";
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const FREQUENCY_OPTIONS = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function AgentScheduler() {
  const [schedules, setSchedules] = useState(loadSchedules);
  const [history, setHistory] = useState(loadHistory);
  const [running, setRunning] = useState(false);
  const [runningAgents, setRunningAgents] = useState(new Set());

  useEffect(() => {
    saveSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const toggleAgent = useCallback((agentName) => {
    setSchedules((prev) => ({
      ...prev,
      [agentName]: { ...prev[agentName], enabled: !prev[agentName]?.enabled },
    }));
  }, []);

  const setFrequency = useCallback((agentName, frequency) => {
    setSchedules((prev) => ({
      ...prev,
      [agentName]: { ...prev[agentName], frequency },
    }));
  }, []);

  const runAllEnabled = useCallback(async () => {
    const enabledAgents = AGENTS.filter((a) => schedules[a.name]?.enabled).map((a) => a.name);
    if (enabledAgents.length === 0) return;

    setRunning(true);
    setRunningAgents(new Set(enabledAgents));

    try {
      const response = await base44.functions.invoke("runScheduledAgents", {
        agents: enabledAgents,
      });

      const now = new Date().toISOString();
      const updatedSchedules = { ...schedules };
      const results = response?.results || {};

      enabledAgents.forEach((agentName) => {
        const result = results[agentName];
        updatedSchedules[agentName] = {
          ...updatedSchedules[agentName],
          lastRun: result?.timestamp || now,
          lastStatus: result?.status || "unknown",
        };
      });

      setSchedules(updatedSchedules);

      const historyEntry = {
        timestamp: now,
        agentsRun: enabledAgents.length,
        succeeded: Object.values(results).filter((r) => r.status === "success").length,
        failed: Object.values(results).filter((r) => r.status === "error").length,
        details: results,
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 10));
    } catch (err) {
      const now = new Date().toISOString();
      const historyEntry = {
        timestamp: now,
        agentsRun: enabledAgents.length,
        succeeded: 0,
        failed: enabledAgents.length,
        error: err?.message || "Batch run failed",
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 10));
    } finally {
      setRunning(false);
      setRunningAgents(new Set());
    }
  }, [schedules]);

  const enabledCount = AGENTS.filter((a) => schedules[a.name]?.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Agent Scheduler</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Configure and run your AI agents on schedule
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm font-medium px-3 py-1">
              {enabledCount} / {AGENTS.length} enabled
            </Badge>
            <Button
              onClick={runAllEnabled}
              disabled={running || enabledCount === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md gap-2"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {running ? "Running..." : "Run All Enabled"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const schedule = schedules[agent.name] || {};
          const isEnabled = schedule.enabled;
          const isRunning = runningAgents.has(agent.name);
          const Icon = agent.icon;

          return (
            <Card
              key={agent.name}
              className={`rounded-2xl shadow-md transition-all duration-200 ${
                isEnabled
                  ? "bg-white border border-gray-100 hover:shadow-lg"
                  : "bg-gray-50 border border-gray-100 opacity-70"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isEnabled
                          ? "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{agent.label}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleAgent(agent.name)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                      isEnabled ? "bg-indigo-500" : "bg-gray-300"
                    }`}
                    aria-label={`Toggle ${agent.label}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Frequency Selector */}
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={schedule.frequency || agent.defaultFrequency}
                    onChange={(e) => setFrequency(agent.name, e.target.value)}
                    disabled={!isEnabled}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 disabled:opacity-50 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Run Status */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Last run: {formatTimestamp(schedule.lastRun)}
                  </span>
                  {schedule.lastStatus && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0.5 ${
                        schedule.lastStatus === "success"
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-red-300 text-red-700 bg-red-50"
                      }`}
                    >
                      {schedule.lastStatus === "success" ? (
                        <CheckCircle2 className="w-3 h-3 mr-0.5 inline" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-0.5 inline" />
                      )}
                      {schedule.lastStatus}
                    </Badge>
                  )}
                  {isRunning && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-indigo-300 text-indigo-700 bg-indigo-50">
                      <RefreshCw className="w-3 h-3 mr-0.5 inline animate-spin" />
                      running
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Run History */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-lg font-semibold text-gray-900">Run History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No runs yet. Click "Run All Enabled" to start.</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        entry.failed === 0 && !entry.error
                          ? "bg-green-100 text-green-600"
                          : entry.succeeded > 0
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {entry.failed === 0 && !entry.error ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {entry.agentsRun} agent{entry.agentsRun !== 1 ? "s" : ""} executed
                      </p>
                      <p className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.succeeded > 0 && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {entry.succeeded} passed
                      </Badge>
                    )}
                    {(entry.failed > 0 || entry.error) && (
                      <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                        {entry.error ? "Failed" : `${entry.failed} failed`}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

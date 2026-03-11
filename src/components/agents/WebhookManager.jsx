import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Webhook,
  Slack,
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link,
  Unlink,
  Bell,
  BellOff,
  Code2,
  RefreshCw,
  Globe,
  Hash,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "partneriq_webhooks";
const SLACK_STORAGE_KEY = "partneriq_slack_config";

const EVENT_TYPES = [
  { id: "deal_closed", label: "Deal Closed", color: "bg-green-100 text-green-800" },
  { id: "safety_alert", label: "Safety Alert", color: "bg-red-100 text-red-800" },
  { id: "compliance_flag", label: "Compliance Flag", color: "bg-orange-100 text-orange-800" },
  { id: "trend_detected", label: "Trend Detected", color: "bg-blue-100 text-blue-800" },
  { id: "contract_expiring", label: "Contract Expiring", color: "bg-yellow-100 text-yellow-800" },
  { id: "payment_due", label: "Payment Due", color: "bg-purple-100 text-purple-800" },
  { id: "new_opportunity", label: "New Opportunity", color: "bg-cyan-100 text-cyan-800" },
  { id: "relationship_risk", label: "Relationship Risk", color: "bg-rose-100 text-rose-800" },
];

const ALERT_CATEGORIES = [
  { id: "deals", label: "Deal Alerts", events: ["deal_closed", "new_opportunity"] },
  { id: "safety", label: "Safety & Compliance", events: ["safety_alert", "compliance_flag"] },
  { id: "contracts", label: "Contracts & Payments", events: ["contract_expiring", "payment_due"] },
  { id: "insights", label: "Insights & Risks", events: ["trend_detected", "relationship_risk"] },
];

function loadWebhooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWebhooks(webhooks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
}

function loadSlackConfig() {
  try {
    const raw = localStorage.getItem(SLACK_STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { webhook_url: "", channel: "", connected: false, categories: {} };
  } catch {
    return { webhook_url: "", channel: "", connected: false, categories: {} };
  }
}

function saveSlackConfig(config) {
  localStorage.setItem(SLACK_STORAGE_KEY, JSON.stringify(config));
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [slackConfig, setSlackConfig] = useState(loadSlackConfig);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] });
  const [slackUrlInput, setSlackUrlInput] = useState("");
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [generatedPayloads, setGeneratedPayloads] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showPayloads, setShowPayloads] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState(null);

  useEffect(() => {
    setWebhooks(loadWebhooks());
  }, []);

  useEffect(() => {
    saveWebhooks(webhooks);
  }, [webhooks]);

  useEffect(() => {
    saveSlackConfig(slackConfig);
  }, [slackConfig]);

  // ── Webhook CRUD ────────────────────────────────────────────────────
  const addWebhook = useCallback(() => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) return;
    const webhook = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: newWebhook.name.trim(),
      url: newWebhook.url.trim(),
      events: newWebhook.events.length > 0 ? newWebhook.events : EVENT_TYPES.map((e) => e.id),
      enabled: true,
      created: new Date().toISOString(),
    };
    setWebhooks((prev) => [...prev, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
  }, [newWebhook]);

  const removeWebhook = useCallback((id) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleWebhook = useCallback((id) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  }, []);

  const toggleNewEvent = useCallback((eventId) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  }, []);

  // ── Test webhook ────────────────────────────────────────────────────
  const testWebhook = useCallback(async (webhook) => {
    setTesting((prev) => ({ ...prev, [webhook.id]: true }));
    setTestResults((prev) => ({ ...prev, [webhook.id]: null }));
    try {
      const response = await base44.functions.invoke("manageWebhooks", {
        action: "test_webhook",
        webhook_url: webhook.url,
        event_type: webhook.events[0] || "deal_closed",
      });
      setTestResults((prev) => ({
        ...prev,
        [webhook.id]: { success: true, status: response.result?.status },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [webhook.id]: { success: false, error: err.message },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [webhook.id]: false }));
    }
  }, []);

  // ── Slack ───────────────────────────────────────────────────────────
  const connectSlack = useCallback(() => {
    if (!slackUrlInput.trim()) return;
    const channelMatch = slackUrlInput.match(/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+/);
    setSlackConfig((prev) => ({
      ...prev,
      webhook_url: slackUrlInput.trim(),
      channel: channelMatch ? "#connected-channel" : "#webhook-channel",
      connected: true,
      categories: ALERT_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {}),
    }));
    setSlackUrlInput("");
  }, [slackUrlInput]);

  const disconnectSlack = useCallback(() => {
    setSlackConfig({ webhook_url: "", channel: "", connected: false, categories: {} });
    setSlackTestResult(null);
  }, []);

  const toggleSlackCategory = useCallback((catId) => {
    setSlackConfig((prev) => ({
      ...prev,
      categories: { ...prev.categories, [catId]: !prev.categories[catId] },
    }));
  }, []);

  const testSlack = useCallback(async () => {
    if (!slackConfig.webhook_url) return;
    setSlackTesting(true);
    setSlackTestResult(null);
    try {
      const response = await base44.functions.invoke("manageWebhooks", {
        action: "test_slack",
        webhook_url: slackConfig.webhook_url,
        event_type: "deal_closed",
      });
      setSlackTestResult({ success: true, status: response.result?.status });
    } catch (err) {
      setSlackTestResult({ success: false, error: err.message });
    } finally {
      setSlackTesting(false);
    }
  }, [slackConfig.webhook_url]);

  // ── Generate Payloads ───────────────────────────────────────────────
  const generatePayloads = useCallback(async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke("manageWebhooks", {
        action: "generate_payload",
      });
      setGeneratedPayloads(response.result?.event_payloads || response.event_payloads || []);
      setShowPayloads(true);
    } catch (err) {
      console.error("Failed to generate payloads:", err);
    } finally {
      setGenerating(false);
    }
  }, []);

  const copyToClipboard = useCallback((text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // ── Slack preview block ─────────────────────────────────────────────
  const slackPreview = {
    text: ":white_check_mark: PartnerIQ Alert: Deal Closed",
    blocks: [
      { type: "header", text: { type: "plain_text", text: ":white_check_mark: Deal Closed" } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: "*Partner:*\nAcme Corp" },
          { type: "mrkdwn", text: "*Value:*\n$45,000" },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: 'Partnership "Summer Campaign 2026" has been finalized.' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* ── Webhooks Section ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-indigo-600" />
            Webhooks
          </CardTitle>
          <p className="text-sm text-gray-500">
            Send real-time event notifications to external services via HTTP webhooks.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Add webhook form */}
          <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50/50">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Webhook
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Webhook name"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                placeholder="https://example.com/webhook"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Event types (leave empty for all):</p>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => toggleNewEvent(evt.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      newWebhook.events.includes(evt.id)
                        ? evt.color + " ring-2 ring-offset-1 ring-indigo-400"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {evt.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              onClick={addWebhook}
              disabled={!newWebhook.name.trim() || !newWebhook.url.trim()}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Webhook
            </Button>
          </div>

          {/* Webhook list */}
          {webhooks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No webhooks configured yet. Add one above to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
                    wh.enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {wh.enabled ? (
                        <Link className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Unlink className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">{wh.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5 ml-6">{wh.url}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
                      {wh.events.slice(0, 4).map((evtId) => {
                        const evt = EVENT_TYPES.find((e) => e.id === evtId);
                        return evt ? (
                          <Badge key={evtId} variant="secondary" className={`text-[10px] ${evt.color}`}>
                            {evt.label}
                          </Badge>
                        ) : null;
                      })}
                      {wh.events.length > 4 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{wh.events.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {testResults[wh.id] && (
                      <span className="text-xs">
                        {testResults[wh.id].success ? (
                          <span className="text-green-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {testResults[wh.id].status}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-0.5">
                            <AlertCircle className="h-3.5 w-3.5" /> Failed
                          </span>
                        )}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(wh)}
                      disabled={testing[wh.id] || !wh.enabled}
                      className="gap-1 text-xs"
                    >
                      {testing[wh.id] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWebhook(wh.id)}
                      className="px-2"
                      title={wh.enabled ? "Disable" : "Enable"}
                    >
                      {wh.enabled ? (
                        <Bell className="h-4 w-4 text-green-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWebhook(wh.id)}
                      className="px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Slack Integration Section ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-5 w-5 text-[#4A154B]" />
            Slack Integration
          </CardTitle>
          <p className="text-sm text-gray-500">
            Route PartnerIQ alerts directly to your Slack workspace via incoming webhooks.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!slackConfig.connected ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50/50">
              <p className="text-sm text-gray-600">
                Paste your Slack Incoming Webhook URL to connect.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/T.../B.../xxx"
                  value={slackUrlInput}
                  onChange={(e) => setSlackUrlInput(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A154B]"
                />
                <Button
                  onClick={connectSlack}
                  disabled={!slackUrlInput.trim()}
                  className="gap-1.5 bg-[#4A154B] hover:bg-[#3b1139]"
                >
                  <Zap className="h-4 w-4" /> Connect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection status */}
              <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Slack Connected</p>
                    <p className="text-xs text-green-600">{slackConfig.channel}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectSlack}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>

              {/* Alert category toggles */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Alert Categories</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALERT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleSlackCategory(cat.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        slackConfig.categories[cat.id]
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      <span className="font-medium">{cat.label}</span>
                      {slackConfig.categories[cat.id] ? (
                        <Bell className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test & preview */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={testSlack}
                  disabled={slackTesting}
                  className="gap-1.5 bg-[#4A154B] hover:bg-[#3b1139]"
                  size="sm"
                >
                  {slackTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Test Message
                </Button>
                {slackTestResult && (
                  <span className="text-xs">
                    {slackTestResult.success ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sent ({slackTestResult.status})
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {slackTestResult.error}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Slack message preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Message Preview</p>
                <div className="rounded-lg bg-gray-900 text-gray-100 p-4 text-xs font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(slackPreview, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payload Preview Section ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code2 className="h-5 w-5 text-emerald-600" />
            Payload Preview
          </CardTitle>
          <p className="text-sm text-gray-500">
            Generate and inspect sample payloads for each event type using AI.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={generatePayloads}
              disabled={generating}
              className="gap-1.5"
              size="sm"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate Sample Payloads
            </Button>
            {generatedPayloads && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayloads((p) => !p)}
                className="gap-1 text-xs"
              >
                {showPayloads ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {showPayloads ? "Collapse" : "Expand"}
              </Button>
            )}
          </div>

          {generating && (
            <div className="flex items-center justify-center py-10 text-sm text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Generating realistic payloads with AI...
            </div>
          )}

          {showPayloads && generatedPayloads && generatedPayloads.length > 0 && (
            <div className="space-y-4">
              {generatedPayloads.map((payload, idx) => {
                const evt = EVENT_TYPES.find((e) => e.id === payload.event_type);
                const jsonStr = JSON.stringify(payload.sample_payload, null, 2);
                const slackStr = JSON.stringify(payload.slack_format, null, 2);
                return (
                  <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        {evt && (
                          <Badge className={`text-xs ${evt.color}`}>{evt.label}</Badge>
                        )}
                        <span className="text-xs text-gray-500">{payload.description}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                      {/* Webhook payload */}
                      <div className="relative">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800">
                          <span className="text-[10px] font-mono text-gray-400">
                            Webhook Payload
                          </span>
                          <button
                            onClick={() => copyToClipboard(jsonStr, `wh-${idx}`)}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            title="Copy"
                          >
                            {copied === `wh-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{jsonStr}</pre>
                        </div>
                      </div>
                      {/* Slack format */}
                      <div className="relative">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800">
                          <span className="text-[10px] font-mono text-gray-400">
                            Slack Format
                          </span>
                          <button
                            onClick={() => copyToClipboard(slackStr, `sl-${idx}`)}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            title="Copy"
                          >
                            {copied === `sl-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{slackStr}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

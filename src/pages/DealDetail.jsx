import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import InternationalDealSupport from "@/components/deals/InternationalDealSupport";
import EscrowPanel from "@/components/deals/EscrowPanel";
import DisputePanel from "@/components/deals/DisputePanel";
import ContractScanner from "@/components/deals/ContractScanner";
import ProofOfPerformance from "@/components/deals/ProofOfPerformance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Send,
  Upload,
  ThumbsUp,
  RotateCcw,
  Zap,
  TrendingUp,
  Brain,
  Handshake,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGE_CONFIG = [
  { key: "contract_signed", label: "Contract Signed", icon: FileText, field: "contract_signed_at" },
  { key: "deposit_paid", label: "Deposit Paid", icon: DollarSign, field: "deposit_paid" },
  { key: "content_submitted", label: "Content Submitted", icon: Upload, field: null }, // derived from content_submissions
  { key: "brand_approved", label: "Brand Approved", icon: ThumbsUp, field: "content_approved" },
  { key: "content_live", label: "Content Live + Final Payment", icon: CheckCircle2, field: "final_payment_released" },
];

const DEAL_STAGE_COLORS = {
  discovered: "bg-slate-100 text-slate-700",
  researching: "bg-blue-50 text-blue-700",
  outreach_pending: "bg-indigo-50 text-indigo-700",
  outreach_sent: "bg-purple-50 text-purple-700",
  responded: "bg-amber-50 text-amber-700",
  negotiating: "bg-orange-50 text-orange-700",
  contracted: "bg-emerald-50 text-emerald-700",
  active: "bg-green-50 text-green-700",
  completed: "bg-teal-50 text-teal-700",
  churned: "bg-red-50 text-red-700",
};

const DEAL_STAGE_LABELS = {
  discovered: "Discovered",
  researching: "Research",
  outreach_pending: "Outreach Pending",
  outreach_sent: "Outreach Sent",
  responded: "Responded",
  negotiating: "Negotiating",
  contracted: "Contracted",
  active: "Active",
  completed: "Completed",
  churned: "Churned",
};

// ─── Helper utilities ─────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function daysUntil(ts) {
  if (!ts) return null;
  const diff = new Date(ts) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmtMoney(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// 1. Deal Header
function DealHeader({ deal, navigate }) {
  const days = daysUntil(deal.deadline);
  const stageColor = DEAL_STAGE_COLORS[deal.status] || DEAL_STAGE_COLORS.discovered;
  const stageLabel = DEAL_STAGE_LABELS[deal.status] || deal.status;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => navigate("/Partnerships")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Partnerships
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
            {deal.brand_name || "Brand"}{deal.talent_name ? ` × ${deal.talent_name}` : ""}
          </h1>
          {deal.title && (
            <p className="text-sm text-slate-500 mt-0.5">{deal.title}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          {deal.deal_value > 0 && (
            <div className="flex items-center gap-1 text-lg font-bold text-slate-800">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              {fmtMoney(deal.deal_value)}
            </div>
          )}
          <Badge className={`${stageColor} border text-xs font-medium`}>{stageLabel}</Badge>
          {days !== null && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
              days < 0 ? "bg-red-50 text-red-700 border-red-200" :
              days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-slate-50 text-slate-600 border-slate-200"
            }`}>
              <Clock className="w-3 h-3" />
              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Milestone Tracker
function MilestoneTracker({ deal, onUpdateMilestone, isUpdating }) {
  const submissions = Array.isArray(deal.content_submissions) ? deal.content_submissions : [];
  const hasSubmission = submissions.length > 0;

  const steps = STAGE_CONFIG.map((step) => {
    let completed = false;
    if (step.key === "contract_signed") completed = !!deal.contract_signed_at;
    else if (step.key === "deposit_paid") completed = !!deal.deposit_paid;
    else if (step.key === "content_submitted") completed = hasSubmission;
    else if (step.key === "brand_approved") completed = !!deal.content_approved;
    else if (step.key === "content_live") completed = !!deal.final_payment_released;
    return { ...step, completed };
  });

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span>Deal Milestones</span>
          <span className="text-xs text-slate-400 font-normal">{completedCount}/{steps.length} complete</span>
        </CardTitle>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isNext = !step.completed && (idx === 0 || steps[idx - 1].completed);
            const isLocked = !step.completed && !isNext;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.completed
                    ? "bg-indigo-50/60"
                    : isNext
                    ? "bg-amber-50/50 border border-amber-100"
                    : "opacity-50"
                }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-indigo-600" : isNext ? "bg-amber-100" : "bg-slate-100"
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isNext ? "text-amber-600" : "text-slate-400"}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.completed ? "text-indigo-700" : isNext ? "text-amber-700" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  {step.completed && step.key === "contract_signed" && deal.contract_signed_at && (
                    <p className="text-xs text-slate-400">{formatDate(deal.contract_signed_at)}</p>
                  )}
                </div>

                {/* Action button for the next uncompleted step */}
                {isNext && step.key !== "content_submitted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50 flex-shrink-0"
                    onClick={() => onUpdateMilestone(step.key)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Done"}
                  </Button>
                )}
                {step.key === "content_submitted" && !step.completed && (
                  <span className="text-xs text-slate-400">Submit below</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// 3. Content Submission Panel
function ContentSubmissionPanel({ deal, onUpdate, isUpdating, currentUser }) {
  const [linkInput, setLinkInput] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const submissions = Array.isArray(deal.content_submissions) ? deal.content_submissions : [];
  const latest = submissions[submissions.length - 1] || null;
  const hasPendingReview = latest && latest.status === "pending";

  const handleSubmitContent = () => {
    if (!linkInput.trim()) return;
    const newSubmission = {
      id: crypto.randomUUID(),
      content: linkInput.trim(),
      submitted_at: new Date().toISOString(),
      submitted_by: currentUser?.email || "talent",
      status: "pending",
      version: submissions.length + 1,
    };
    onUpdate({ content_submissions: [...submissions, newSubmission] });
    setLinkInput("");
  };

  const handleApprove = () => {
    if (!latest) return;
    const updated = submissions.map((s) =>
      s.id === latest.id ? { ...s, status: "approved", reviewed_at: new Date().toISOString() } : s
    );
    onUpdate({ content_submissions: updated, content_approved: true });
  };

  const handleRequestRevision = () => {
    if (!latest || !revisionNotes.trim()) return;
    const updated = submissions.map((s) =>
      s.id === latest.id
        ? { ...s, status: "revision_requested", revision_notes: revisionNotes.trim(), reviewed_at: new Date().toISOString() }
        : s
    );
    onUpdate({ content_submissions: updated, content_approved: false });
    setRevisionNotes("");
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Upload className="w-4 h-4 text-slate-400" />
          Content Submission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submit new content */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Submit Content (link or description)
          </label>
          <Textarea
            placeholder="Paste content link (YouTube, Instagram, TikTok, Drive, etc.) or describe the submission..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="text-sm min-h-[80px] resize-none"
          />
          <Button
            size="sm"
            onClick={handleSubmitContent}
            disabled={!linkInput.trim() || isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
            Submit Content
          </Button>
        </div>

        {/* Latest submission review */}
        {latest && (
          <div className={`rounded-lg border p-3 space-y-2 ${
            latest.status === "approved" ? "bg-green-50 border-green-200" :
            latest.status === "revision_requested" ? "bg-amber-50 border-amber-200" :
            "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${
                  latest.status === "approved" ? "bg-green-100 text-green-700" :
                  latest.status === "revision_requested" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  v{latest.version} · {latest.status === "approved" ? "Approved" : latest.status === "revision_requested" ? "Revision Requested" : "Pending Review"}
                </Badge>
                <span className="text-xs text-slate-400">{formatDate(latest.submitted_at)}</span>
              </div>
            </div>
            <p className="text-sm text-slate-700 break-all">{latest.content}</p>

            {/* Revision notes */}
            {latest.revision_notes && (
              <div className="text-xs text-amber-700 bg-amber-100/60 rounded p-2">
                <span className="font-medium">Revision notes: </span>{latest.revision_notes}
              </div>
            )}

            {/* Brand review actions */}
            {hasPendingReview && (
              <div className="space-y-2 pt-1">
                <Textarea
                  placeholder="Revision notes (required to request revision)..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="text-sm min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRequestRevision}
                    disabled={!revisionNotes.trim() || isUpdating}
                    className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1.5" /> Request Revision
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revision history toggle */}
        {submissions.length > 1 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showHistory ? "Hide" : "Show"} revision history ({submissions.length - 1} earlier {submissions.length - 1 === 1 ? "version" : "versions"})
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2">
                {submissions.slice(0, -1).reverse().map((sub) => (
                  <div key={sub.id} className="text-xs text-slate-500 bg-slate-50 rounded p-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium">v{sub.version}</span>
                      <span className="text-slate-400">{formatDate(sub.submitted_at)} {formatTime(sub.submitted_at)}</span>
                    </div>
                    <p className="text-slate-600 break-all">{sub.content}</p>
                    {sub.revision_notes && (
                      <p className="text-amber-600 mt-1">Notes: {sub.revision_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {submissions.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-3">No content submitted yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

// 4. Messaging Thread
function MessagingThread({ deal, onUpdate, isUpdating, currentUser }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const messages = Array.isArray(deal.messages) ? deal.messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      sender: currentUser?.full_name || currentUser?.email || "You",
      sender_id: currentUser?.id,
      text: input.trim(),
      sent_at: new Date().toISOString(),
    };
    onUpdate({ messages: [...messages, msg] });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  };

  return (
    <Card className="border-slate-200/60 flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          Deal Messages
          {messages.length > 0 && (
            <span className="text-xs text-slate-400 font-normal">({messages.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1 min-h-0">
        <ScrollArea className="h-64 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <MessageSquare className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No messages yet.</p>
              <p className="text-xs text-slate-300">Start the conversation below.</p>
            </div>
          ) : (
            <div className="space-y-3 py-1">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-400">{msg.sender}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{formatTime(msg.sent_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 flex-shrink-0">
          <Textarea
            placeholder="Type a message... (Cmd+Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm min-h-[44px] max-h-[100px] resize-none flex-1"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700 self-end px-3"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 5. Deal Info Card
function DealInfoCard({ deal }) {
  const fields = [
    { label: "Deal Type", value: deal.partnership_type },
    { label: "Platform", value: deal.platform },
    { label: "Deliverables", value: deal.deliverables },
    { label: "Payment Terms", value: deal.payment_terms },
    { label: "Brand", value: deal.brand_name },
    { label: "Talent", value: deal.talent_name },
    { label: "Contract Signed", value: deal.contract_signed_at ? formatDate(deal.contract_signed_at) : null },
    { label: "Deadline", value: deal.deadline ? formatDate(deal.deadline) : null },
    { label: "Match Score", value: deal.match_score ? `${deal.match_score}%` : null },
    { label: "Priority", value: deal.priority ? deal.priority.toUpperCase() : null },
  ].filter((f) => f.value);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Deal Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-xs text-slate-400">No deal details available.</p>
        ) : (
          <div className="space-y-2.5">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
                <span className="text-xs font-medium text-slate-700 text-right">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 6. AI Agent Buttons
function AIAgentButtons({ deal }) {
  const { toast } = useToast();
  const [loadingAgent, setLoadingAgent] = useState(null);
  const [results, setResults] = useState({});

  const agents = [
    {
      key: "contract",
      label: "Contract Intelligence",
      fn: "analyzeContractIntelligence",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    },
    {
      key: "safety",
      label: "Brand Safety",
      fn: "analyzeBrandSafety",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    },
    {
      key: "negotiation",
      label: "Negotiation Coach",
      fn: "analyzeNegotiationCoach",
      icon: Brain,
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
  ];

  const runAgent = async (agent) => {
    setLoadingAgent(agent.key);
    try {
      const { data } = await base44.functions.invoke(agent.fn, { partnership_id: deal.id });
      setResults((prev) => ({ ...prev, [agent.key]: data?.analysis || data?.result || data?.message || "Analysis complete." }));
      toast({ title: `${agent.label} complete`, description: "Results ready below." });
    } catch (err) {
      toast({ title: "Agent error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingAgent(null);
    }
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-400" />
          AI Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isLoading = loadingAgent === agent.key;
          const result = results[agent.key];

          return (
            <div key={agent.key}>
              <button
                onClick={() => runAgent(agent)}
                disabled={!!loadingAgent}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${agent.bg}`}
              >
                {isLoading ? (
                  <Loader2 className={`w-4 h-4 animate-spin ${agent.color} flex-shrink-0`} />
                ) : (
                  <Icon className={`w-4 h-4 ${agent.color} flex-shrink-0`} />
                )}
                <span className={agent.color}>{isLoading ? "Analyzing..." : `Run ${agent.label}`}</span>
              </button>

              {result && (
                <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed max-h-40 overflow-y-auto">
                  {result}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// 7. Rate Benchmark Widget
function RateBenchmarkWidget({ deal }) {
  const { data: benchmarks = [], isLoading } = useQuery({
    queryKey: ["rateBenchmarks"],
    queryFn: () => base44.entities.RateBenchmark.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Try to match by tier from talent data, otherwise show all
  const displayBenchmarks = benchmarks.slice(0, 3);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          Rate Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : displayBenchmarks.length === 0 ? (
          <p className="text-xs text-slate-400">No benchmark data available.</p>
        ) : (
          <div className="space-y-2.5">
            {displayBenchmarks.map((tier) => (
              <div key={tier.id} className="bg-slate-50 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600 capitalize">{tier.tier}</span>
                  {tier.followers_min && (
                    <span className="text-[10px] text-slate-400">
                      {(tier.followers_min / 1000).toFixed(0)}K–{(tier.followers_max / 1000).toFixed(0)}K followers
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {tier.sponsored_post_min && (
                    <div>
                      <p className="text-[10px] text-slate-400">Sponsored Post</p>
                      <p className="text-xs font-medium text-indigo-600">
                        {fmtMoney(tier.sponsored_post_min)}–{fmtMoney(tier.sponsored_post_max)}
                      </p>
                    </div>
                  )}
                  {tier.brand_deal_min && (
                    <div>
                      <p className="text-[10px] text-slate-400">Brand Deal</p>
                      <p className="text-xs font-medium text-purple-600">
                        {fmtMoney(tier.brand_deal_min)}–{fmtMoney(tier.brand_deal_max)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {deal.deal_value > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">This deal value</span>
                <span className="text-xs font-bold text-emerald-600">{fmtMoney(deal.deal_value)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 8. Culture Calendar Widget
function CultureCalendarWidget({ deal }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["culture_events"],
    queryFn: () => base44.entities.CultureEvent.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Filter to upcoming events (next 90 days) and sort by date
  const now = new Date();
  const cutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const upcoming = events
    .filter((e) => {
      if (!e.date && !e.start_date) return false;
      const d = new Date(e.date || e.start_date);
      return d >= now && d <= cutoff;
    })
    .sort((a, b) => new Date(a.date || a.start_date) - new Date(b.date || b.start_date))
    .slice(0, 5);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Culture Calendar
          <span className="text-[10px] text-slate-400 font-normal">Next 90 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-xs text-slate-400">No upcoming culture events in the next 90 days.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((event) => {
              const d = new Date(event.date || event.start_date);
              const daysAway = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
              return (
                <div key={event.id} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 text-center">
                    <p className="text-[10px] text-slate-400 leading-none">{d.toLocaleDateString("en-US", { month: "short" })}</p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{event.name || event.title}</p>
                    {event.category && (
                      <p className="text-[10px] text-slate-400">{event.category}</p>
                    )}
                  </div>
                  <span className={`text-[10px] flex-shrink-0 font-medium ${daysAway <= 14 ? "text-amber-600" : "text-slate-400"}`}>
                    {daysAway}d
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DealDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const dealId = searchParams.get("id");

  // Fetch partnership
  const {
    data: deal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["partnership", dealId],
    queryFn: async () => {
      if (!dealId) throw new Error("No deal ID provided");
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .eq("id", dealId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!dealId,
    staleTime: 30 * 1000,
  });

  // Update mutation — optimistic local update
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from("partnerships")
        .update(updates)
        .eq("id", dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["partnership", dealId] });
      const previous = queryClient.getQueryData(["partnership", dealId]);
      queryClient.setQueryData(["partnership", dealId], (old) => ({ ...old, ...updates }));
      return { previous };
    },
    onError: (err, _updates, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["partnership", dealId], ctx.previous);
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      // === INTELLIGENCE FEEDBACK LOOP ===
      // When deal is completed (final payment released), write to all 3 data rooms
      if (data?.final_payment_released && data?.status !== 'completed_logged') {
        const dealEntry = {
          user_email: user?.email,
          title: data.title,
          brand_name: data.brand_name,
          talent_name: data.talent_name,
          platform: data.partnership_type || 'multi-platform',
          deal_type: data.partnership_type || 'sponsorship',
          deal_value: data.deal_value || 0,
          status: 'completed',
          deliverables: data.notes || '',
          performance_metrics: {},
        };
        // Write to Talent Data Room
        supabase.from('data_room_entries').insert({ ...dealEntry, room_type: 'talent_deals' }).then(() => {});
        // Write to Brand Data Room
        supabase.from('data_room_entries').insert({ ...dealEntry, room_type: 'brand_campaigns' }).then(() => {});
        // Write to Agency Data Room (if agency involved)
        supabase.from('data_room_entries').insert({ ...dealEntry, room_type: 'agency_engagements' }).then(() => {});
        // Log the feedback
        supabase.from('activities').insert({
          action: 'deal_completed',
          description: `Deal "${data.title}" completed. Data rooms updated. AI model improving.`,
          resource_type: 'partnership',
          resource_id: data.id,
        }).then(() => {});
      }
    },
  });

  const handleUpdate = useCallback(
    (updates) => updateMutation.mutate(updates),
    [updateMutation]
  );

  const handleMilestone = useCallback(
    (milestoneKey) => {
      const now = new Date().toISOString();
      const updates = {};
      if (milestoneKey === "contract_signed") updates.contract_signed_at = now;
      else if (milestoneKey === "deposit_paid") updates.deposit_paid = true;
      else if (milestoneKey === "brand_approved") updates.content_approved = true;
      else if (milestoneKey === "content_live") updates.final_payment_released = true;
      if (Object.keys(updates).length) {
        handleUpdate(updates);
        toast({ title: "Milestone updated", description: "Progress saved." });
      }
    },
    [handleUpdate, toast]
  );

  // ─── Render states ──────────────────────────────────────────────────────────

  if (!dealId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-10 h-10 text-slate-300" />
        <p className="text-slate-500 text-sm">No deal ID provided. Please open a deal from Partnerships.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/Partnerships")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go to Partnerships
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-xl" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-10 h-10 text-red-300" />
        <p className="text-slate-500 text-sm">Deal not found or failed to load.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/Partnerships")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Partnerships
        </Button>
      </div>
    );
  }

  const isUpdating = updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <DealHeader deal={deal} navigate={navigate} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT: 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          <MilestoneTracker
            deal={deal}
            onUpdateMilestone={handleMilestone}
            isUpdating={isUpdating}
          />
          <ContractScanner />
          <ContentSubmissionPanel
            deal={deal}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
            currentUser={currentUser}
          />
          <MessagingThread
            deal={deal}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
            currentUser={currentUser}
          />
          <EscrowPanel
            partnershipId={dealId}
            userRole={currentUser?.role}
          />
          {/* Proof of Performance — shown only when final payment is released */}
          {deal.final_payment_released && (
            <ProofOfPerformance deal={deal} />
          )}
        </div>

        {/* RIGHT: 1/3 width */}
        <div className="space-y-4">
          <DealInfoCard deal={deal} />
          <DisputePanel
            partnershipId={dealId}
            currentUser={currentUser}
          />
          <InternationalDealSupport deal={deal} />
          <AIAgentButtons deal={deal} />
          <RateBenchmarkWidget deal={deal} />
          <CultureCalendarWidget deal={deal} />
        </div>
      </div>
    </div>
  );
}

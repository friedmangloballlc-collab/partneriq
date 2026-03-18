import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, Loader2, Scale, FileWarning, CheckCircle2,
  Brain, ChevronDown, ChevronUp, Clock, Shield,
} from "lucide-react";

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Brain },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  escalated: { label: "Escalated", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

const DISPUTE_REASONS = [
  { value: "non_delivery", label: "Content Not Delivered" },
  { value: "quality_issue", label: "Content Quality Below Standard" },
  { value: "late_delivery", label: "Late Delivery" },
  { value: "payment_dispute", label: "Payment Dispute" },
  { value: "contract_violation", label: "Contract Violation" },
  { value: "unauthorized_use", label: "Unauthorized Content Use" },
  { value: "metrics_fraud", label: "Metrics / Engagement Fraud" },
  { value: "other", label: "Other" },
];

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DisputePanel({ partnershipId, currentUser }) {
  const queryClient = useQueryClient();
  const [showFileForm, setShowFileForm] = useState(false);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [contractTerms, setContractTerms] = useState("");
  const [expandedDispute, setExpandedDispute] = useState(null);

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["deal_disputes", partnershipId],
    queryFn: () => base44.entities.DealDispute.filter({ partnership_id: partnershipId }, "-created_at"),
    enabled: !!partnershipId,
    staleTime: 15000,
  });

  const fileDisputeMutation = useMutation({
    mutationFn: async (payload) => {
      return base44.entities.DealDispute.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal_disputes", partnershipId] });
      setShowFileForm(false);
      setReason("");
      setEvidence("");
      setContractTerms("");
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: (disputeId) => base44.functions.invoke("analyzeDispute", { dispute_id: disputeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal_disputes", partnershipId] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ disputeId, resolution }) => {
      return base44.entities.DealDispute.update(disputeId, {
        status: "resolved",
        resolution,
        resolved_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal_disputes", partnershipId] });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: async (disputeId) => {
      return base44.entities.DealDispute.update(disputeId, { status: "escalated" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal_disputes", partnershipId] });
    },
  });

  const handleFileDispute = () => {
    if (!reason) return;
    fileDisputeMutation.mutate({
      partnership_id: partnershipId,
      filed_by: currentUser?.email || currentUser?.full_name || "Unknown",
      filed_by_role: currentUser?.role || "user",
      reason,
      evidence: evidence || null,
      contract_terms: contractTerms || null,
      status: "open",
    });
  };

  const handleAcceptRecommendation = (dispute) => {
    const analysis = dispute.ai_analysis || {};
    resolveMutation.mutate({
      disputeId: dispute.id,
      resolution: `AI recommendation accepted: ${analysis.recommendation || analysis.suggested_resolution || "See AI analysis"}`,
    });
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            Dispute Resolution
            {disputes.filter((d) => d.status === "open" || d.status === "under_review").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {disputes.filter((d) => d.status === "open" || d.status === "under_review").length}
              </span>
            )}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowFileForm(!showFileForm)}
          >
            <FileWarning className="w-3 h-3 mr-1" />
            File Dispute
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File dispute form */}
        {showFileForm && (
          <div className="bg-red-50/50 rounded-lg border border-red-200 p-3 space-y-3">
            <p className="text-xs font-medium text-red-700">File a New Dispute</p>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Reason</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Evidence / Description</label>
              <Textarea
                placeholder="Describe the issue in detail. Include links, screenshots, or timeline references..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="text-sm min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Relevant Contract Terms</label>
              <Textarea
                placeholder="Reference specific contract clauses or terms..."
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                className="text-sm min-h-[50px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="text-xs bg-red-600 hover:bg-red-700"
                onClick={handleFileDispute}
                disabled={!reason || fileDisputeMutation.isPending}
              >
                {fileDisputeMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                Submit Dispute
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setShowFileForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Disputes list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-6">
            <Shield className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No disputes filed.</p>
            <p className="text-[10px] text-slate-300">Disputes can be filed if there are issues with the deal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => {
              const statusCfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedDispute === dispute.id;
              const hasAnalysis = dispute.ai_analysis && Object.keys(dispute.ai_analysis).length > 0;
              const reasonLabel = DISPUTE_REASONS.find((r) => r.value === dispute.reason)?.label || dispute.reason;

              return (
                <div
                  key={dispute.id}
                  className="rounded-lg border border-slate-200 overflow-hidden"
                >
                  {/* Dispute header */}
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedDispute(isExpanded ? null : dispute.id)}
                  >
                    <StatusIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{reasonLabel}</span>
                        <Badge className={`text-[10px] border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Filed by {dispute.filed_by} ({dispute.filed_by_role}) on {formatDate(dispute.created_at)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50/50">
                      {dispute.evidence && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Evidence</p>
                          <p className="text-xs text-slate-600">{dispute.evidence}</p>
                        </div>
                      )}
                      {dispute.contract_terms && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Contract Terms</p>
                          <p className="text-xs text-slate-600">{dispute.contract_terms}</p>
                        </div>
                      )}

                      {/* AI Analysis section */}
                      {hasAnalysis && (
                        <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-3 space-y-2">
                          <p className="text-xs font-medium text-indigo-700 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            AI Analysis
                          </p>
                          {dispute.ai_analysis.recommendation && (
                            <div>
                              <p className="text-[10px] text-indigo-500 uppercase">Recommendation</p>
                              <p className="text-xs text-indigo-800 font-medium">{dispute.ai_analysis.recommendation}</p>
                            </div>
                          )}
                          {dispute.ai_analysis.reasoning && (
                            <div>
                              <p className="text-[10px] text-indigo-500 uppercase">Reasoning</p>
                              <p className="text-xs text-slate-600">{dispute.ai_analysis.reasoning}</p>
                            </div>
                          )}
                          {dispute.ai_analysis.evidence_assessment && (
                            <div>
                              <p className="text-[10px] text-indigo-500 uppercase">Evidence Assessment</p>
                              <p className="text-xs text-slate-600">{dispute.ai_analysis.evidence_assessment}</p>
                            </div>
                          )}
                          {dispute.ai_analysis.suggested_resolution && (
                            <div>
                              <p className="text-[10px] text-indigo-500 uppercase">Suggested Resolution</p>
                              <p className="text-xs text-slate-600">{dispute.ai_analysis.suggested_resolution}</p>
                            </div>
                          )}
                          {dispute.ai_analysis.action_items && dispute.ai_analysis.action_items.length > 0 && (
                            <div>
                              <p className="text-[10px] text-indigo-500 uppercase">Action Items</p>
                              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                                {dispute.ai_analysis.action_items.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resolution */}
                      {dispute.resolution && (
                        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                          <p className="text-[10px] text-green-500 uppercase tracking-wide mb-1">Resolution</p>
                          <p className="text-xs text-green-800">{dispute.resolution}</p>
                          {dispute.resolved_at && (
                            <p className="text-[10px] text-green-500 mt-1">Resolved on {formatDate(dispute.resolved_at)}</p>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      {(dispute.status === "open" || dispute.status === "under_review") && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {!hasAnalysis && (
                            <Button
                              size="sm"
                              className="text-xs bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => analyzeMutation.mutate(dispute.id)}
                              disabled={analyzeMutation.isPending}
                            >
                              {analyzeMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Brain className="w-3 h-3 mr-1" />
                              )}
                              Analyze with AI
                            </Button>
                          )}
                          {hasAnalysis && (
                            <Button
                              size="sm"
                              className="text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptRecommendation(dispute)}
                              disabled={resolveMutation.isPending}
                            >
                              {resolveMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              Accept Recommendation
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => escalateMutation.mutate(dispute.id)}
                            disabled={escalateMutation.isPending}
                          >
                            {escalateMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            Escalate to Support
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

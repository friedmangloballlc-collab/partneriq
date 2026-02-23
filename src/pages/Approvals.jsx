import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Edit, RotateCcw, Shield, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, formatDistance } from "date-fns";
import ApprovalActions from "@/components/approvals/ApprovalActions";
import QueueViewSelector from "@/components/approvals/QueueViewSelector";
import ApprovalWorkflowSettings from "@/components/approvals/ApprovalWorkflowSettings";

const priorityConfig = {
  p1_critical: { label: "P1 Critical", color: "bg-red-50 text-red-700 border-red-200", sla: "4h" },
  p2_high: { label: "P2 High", color: "bg-amber-50 text-amber-700 border-amber-200", sla: "24h" },
  p3_standard: { label: "P3 Standard", color: "bg-blue-50 text-blue-700 border-blue-200", sla: "48h" },
  p4_low: { label: "P4 Low", color: "bg-slate-50 text-slate-600 border-slate-200", sla: "72h" },
};

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  revision_requested: { icon: Edit, color: "text-blue-500", bg: "bg-blue-50" },
  scheduled: { icon: Clock, color: "text-teal-500", bg: "bg-teal-50" },
  escalated: { icon: AlertTriangle, color: "text-purple-500", bg: "bg-purple-50" },
  sent: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
};

export default function Approvals() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("standard"); // Queue view mode
  const [showSettings, setShowSettings] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [workflowSettings, setWorkflowSettings] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["approval-items"],
    queryFn: () => base44.entities.ApprovalItem.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ApprovalItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-items"] });
      setShowReview(false);
      setSelectedItem(null);
      setReviewNotes("");
    },
  });

  const handleApprovalAction = (item, actionType, payload) => {
    const updateData = { reviewed_by: user?.email };

    switch (actionType) {
      case "approve":
        updateData.status = "approved";
        updateData.review_notes = payload.feedback || "Approved";
        break;
      case "reject":
        updateData.status = "rejected";
        updateData.rejection_code = payload.rejectionCode;
        updateData.rejection_feedback = payload.feedback;
        break;
      case "schedule":
        updateData.status = "scheduled";
        updateData.scheduled_send_time = payload.scheduledTime;
        break;
      case "revision":
        updateData.status = "revision_requested";
        updateData.review_notes = payload.feedback;
        break;
      case "escalate":
        updateData.status = "escalated";
        updateData.review_notes = payload.feedback;
        break;
    }

    updateMutation.mutate({
      id: item.id,
      data: updateData,
    });

    // Create audit log
    base44.entities.Activity.create({
      action: `approval_${actionType}`,
      description: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}: ${item.title}`,
      actor_email: user?.email,
      actor_name: user?.full_name,
      resource_type: "approval",
      resource_id: item.id,
    });
  };

  // Get filtered items based on selected queue view
  const getFilteredItems = () => {
    const viewMap = {
      priority_p1: (i) => i.priority === "p1_critical" && i.status === "pending",
      priority_p2: (i) => i.priority === "p2_high" && i.status === "pending",
      standard: (i) => i.priority === "p3_standard" && i.status === "pending",
      low: (i) => i.priority === "p4_low" && i.status === "pending",
      revisions: (i) => i.status === "revision_requested",
      scheduled: (i) => i.status === "scheduled",
      approved: (i) => i.status === "sent",
    };

    return items.filter(viewMap[view] || (() => i.status === "pending"));
  };

  const itemCounts = {
    priority_p1: items.filter(i => i.priority === "p1_critical" && i.status === "pending").length,
    priority_p2: items.filter(i => i.priority === "p2_high" && i.status === "pending").length,
    standard: items.filter(i => i.priority === "p3_standard" && i.status === "pending").length,
    low: items.filter(i => i.priority === "p4_low" && i.status === "pending").length,
    revisions: items.filter(i => i.status === "revision_requested").length,
    scheduled: items.filter(i => i.status === "scheduled").length,
    approved: items.filter(i => i.status === "sent").length,
  };

  const filteredItems = getFilteredItems();
  const pendingCount = items.filter(i => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approval Workflow</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600">Architecturally Enforced</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">Multi-layer enforcement: no outbound without approval</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-1.5"
        >
          <Settings className="w-4 h-4" /> Settings
        </Button>
      </div>

      {/* Workflow Settings */}
      {showSettings && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <ApprovalWorkflowSettings onSave={(settings) => { setWorkflowSettings(settings); setShowSettings(false); }} />
        </div>
      )}

      {/* Queue View Selector */}
      <QueueViewSelector selectedView={view} onSelectView={setView} itemCounts={itemCounts} />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white border rounded-xl p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-100 rounded w-2/3" /></div>)}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Queue is empty</h3>
          <p className="text-sm text-slate-400 mt-1">No items in this queue view</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const config = statusConfig[item.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const pConfig = priorityConfig[item.priority] || priorityConfig.p3_standard;
            
            return (
              <Card key={item.id} className="border-slate-200/60 p-4">
                <div className="space-y-3">
                  {/* Item Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{item.item_type?.replace(/_/g, " ")}</Badge>
                        <Badge className={`text-[10px] ${pConfig.color}`}>{pConfig.label}</Badge>
                        {item.deal_value && (
                          <Badge className="bg-slate-100 text-slate-700 text-[10px]">${(item.deal_value / 1000).toFixed(0)}K deal</Badge>
                        )}
                        {item.match_score && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{item.match_score}% match</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  {item.description && <p className="text-xs text-slate-600 px-3">{item.description}</p>}
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 px-3 text-[11px] text-slate-400 flex-wrap">
                    {item.brand_name && <span>Brand: {item.brand_name}</span>}
                    {item.talent_name && <span>Talent: {item.talent_name}</span>}
                    {item.created_date && <span>Created {formatDistance(new Date(item.created_date), new Date(), { addSuffix: true })}</span>}
                    {item.sla_deadline && <span className="text-amber-600 font-medium">SLA: {formatDistance(new Date(item.sla_deadline), new Date(), { addSuffix: true })}</span>}
                  </div>

                  {/* Feedback Display */}
                  {item.rejection_feedback && (
                    <div className="mx-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-700">Revision requested:</p>
                      <p className="text-xs text-red-600 mt-1">{item.rejection_feedback}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {item.status === "pending" && (
                    <div className="px-3 pt-2 border-t border-slate-100">
                      <ApprovalActions
                        item={item}
                        onAction={(actionType, payload) => handleApprovalAction(item, actionType, payload)}
                        isLoading={updateMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}


    </div>
  );
}
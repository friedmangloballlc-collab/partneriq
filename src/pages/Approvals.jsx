import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Edit, RotateCcw, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const priorityConfig = {
  p1: { label: "P1 High", color: "bg-red-50 text-red-700 border-red-200" },
  p2: { label: "P2 Standard", color: "bg-amber-50 text-amber-700 border-amber-200" },
  p3: { label: "P3 Low", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  needs_revision: { icon: Edit, color: "text-blue-500", bg: "bg-blue-50" },
};

export default function Approvals() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReview, setShowReview] = useState(false);

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

  const handleApprove = (item) => {
    updateMutation.mutate({
      id: item.id,
      data: { status: "approved", reviewed_by: user?.email, review_notes: reviewNotes || "Approved" }
    });
    if (item.reference_id && item.item_type === "outreach_email") {
      base44.entities.OutreachEmail.update(item.reference_id, { status: "approved", approved_by: user?.email });
    }
    base44.entities.Activity.create({
      action: "approval_approved",
      description: `Approved: ${item.title}`,
      actor_email: user?.email,
      actor_name: user?.full_name,
      resource_type: "approval",
      resource_id: item.id,
    });
  };

  const handleReject = (item) => {
    updateMutation.mutate({
      id: item.id,
      data: { status: "rejected", reviewed_by: user?.email, review_notes: reviewNotes || "Rejected" }
    });
    if (item.reference_id && item.item_type === "outreach_email") {
      base44.entities.OutreachEmail.update(item.reference_id, { status: "rejected", rejection_reason: reviewNotes });
    }
    base44.entities.Activity.create({
      action: "approval_rejected",
      description: `Rejected: ${item.title}`,
      actor_email: user?.email,
      actor_name: user?.full_name,
      resource_type: "approval",
      resource_id: item.id,
    });
  };

  const filtered = items.filter(i => tab === "all" ? true : i.status === tab);
  const pendingCount = items.filter(i => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approval Queue</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600">Human-Approved</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">Nothing goes outbound without your review</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white border rounded-xl p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-100 rounded w-2/3" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">{tab === "pending" ? "All caught up!" : "No items"}</h3>
          <p className="text-sm text-slate-400 mt-1">{tab === "pending" ? "No items waiting for approval" : "No items in this category"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const config = statusConfig[item.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const pConfig = priorityConfig[item.priority] || priorityConfig.p2;
            return (
              <Card key={item.id} className="border-slate-200/60 p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      <Badge variant="outline" className="text-[10px]">{item.item_type?.replace(/_/g, " ")}</Badge>
                      <Badge className={`text-[10px] ${pConfig.color}`}>{pConfig.label}</Badge>
                    </div>
                    {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      {item.brand_name && <span>Brand: {item.brand_name}</span>}
                      {item.talent_name && <span>Talent: {item.talent_name}</span>}
                      {item.created_date && <span>{format(new Date(item.created_date), "MMM d, h:mm a")}</span>}
                    </div>
                    {item.review_notes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                        <span className="font-medium">Review: </span>{item.review_notes}
                      </div>
                    )}
                  </div>
                  {item.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => { setSelectedItem(item); setShowReview(true); }}>
                        <Eye className="w-3 h-3 mr-1.5" /> Review
                      </Button>
                      <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(item)}>
                        <CheckCircle2 className="w-3 h-3 mr-1.5" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => { setSelectedItem(item); setShowReview(true); }}>
                        <XCircle className="w-3 h-3 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review: {selectedItem?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">{selectedItem?.description || "No additional details"}</p>
            </div>
            <div>
              <Label>Review Notes</Label>
              <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add your feedback..." />
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" className="flex-1" onClick={() => selectedItem && handleReject(selectedItem)}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => selectedItem && handleApprove(selectedItem)}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
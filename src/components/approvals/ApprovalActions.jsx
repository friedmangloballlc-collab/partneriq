import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, ArrowUp, AlertTriangle } from "lucide-react";

const REJECTION_CODES = [
  { code: "tone_mismatch", label: "Tone doesn't match brand or persona" },
  { code: "factual_error", label: "Incorrect data or claims" },
  { code: "timing_wrong", label: "Bad timing for outreach" },
  { code: "target_wrong", label: "Wrong person or contact" },
  { code: "structure_issue", label: "Deal structure inappropriate" },
  { code: "too_aggressive", label: "Too pushy or salesy" },
  { code: "missing_context", label: "Lacks personalization" },
  { code: "compliance", label: "Legal or policy concern" },
  { code: "competitor_conflict", label: "Conflicts with existing relationship" },
  { code: "budget_mismatch", label: "Terms outside realistic range" },
];

export default function ApprovalActions({ item, onAction, isLoading }) {
  const [action, setAction] = useState(null); // approve, reject, schedule, escalate, edit
  const [feedback, setFeedback] = useState("");
  const [rejectionCode, setRejectionCode] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleAction = (actionType, payload = {}) => {
    onAction(actionType, {
      feedback,
      rejectionCode,
      scheduledTime,
      ...payload,
    });
    resetForm();
  };

  const resetForm = () => {
    setAction(null);
    setFeedback("");
    setRejectionCode("");
    setScheduledTime("");
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => handleAction("approve")}
          disabled={isLoading}
        >
          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="text-xs h-8"
          onClick={() => setAction("reject")}
          disabled={isLoading}
        >
          <XCircle className="w-3 h-3 mr-1.5" /> Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => setAction("schedule")}
          disabled={isLoading}
        >
          <Clock className="w-3 h-3 mr-1.5" /> Schedule
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => setAction("revision")}
          disabled={isLoading}
        >
          <ArrowUp className="w-3 h-3 mr-1.5" /> Request Revision
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => setAction("escalate")}
          disabled={isLoading}
        >
          <AlertTriangle className="w-3 h-3 mr-1.5" /> Escalate
        </Button>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={action === "reject"} onOpenChange={() => action === "reject" && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject: {item?.title}</DialogTitle>
            <DialogDescription>Provide feedback for improvement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Rejection Reason</Label>
              <Select value={rejectionCode} onValueChange={setRejectionCode}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_CODES.map((rc) => (
                    <SelectItem key={rc.code} value={rc.code}>
                      {rc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Detailed Feedback</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what needs to change..."
                className="mt-1.5 min-h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("reject")}
                disabled={!rejectionCode || isLoading}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={action === "schedule"} onOpenChange={() => action === "schedule" && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Send: {item?.title}</DialogTitle>
            <DialogDescription>Choose when to send this item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Send Date & Time</Label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction("schedule")}
                disabled={!scheduledTime || isLoading}
                className="flex-1"
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={action === "revision"} onOpenChange={() => action === "revision" && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision: {item?.title}</DialogTitle>
            <DialogDescription>The AI will regenerate with your feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Feedback for AI</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what changes you want..."
                className="mt-1.5 min-h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction("revision")}
                disabled={!feedback || isLoading}
                className="flex-1"
              >
                Request Revision
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={action === "escalate"} onOpenChange={() => action === "escalate" && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate: {item?.title}</DialogTitle>
            <DialogDescription>Route to senior reviewer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Reason for Escalation</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Why escalate this item?"
                className="mt-1.5 min-h-20"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction("escalate")}
                disabled={!feedback || isLoading}
                className="flex-1"
              >
                Escalate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
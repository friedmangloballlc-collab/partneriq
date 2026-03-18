/**
 * AccessRequestPanel.jsx
 *
 * Feature 2 — Brand Access Requests for the Talent Data Room.
 *
 * Behaviour:
 *  - Brand viewer  → sees a "Request Access to Full Data Room" button.
 *                    Submitting creates a row in data_room_access and fires a
 *                    notification for the talent owner.
 *  - Talent owner  → sees pending requests with Approve / Deny actions.
 *                    Approving updates the row status to 'approved'.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  KeyRound,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "bg-amber-100 text-amber-700",   icon: Clock       },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  denied:   { label: "Denied",   color: "bg-rose-100 text-rose-700",     icon: XCircle     },
};

// ── Brand side: request button ────────────────────────────────────────────────

function BrandRequestButton({ ownerEmail, requesterEmail, requesterName, roomType }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Check if there is already a request row for this pair
  const { data: existing, isLoading: checkLoading } = useQuery({
    queryKey: ["data-room-access-check", ownerEmail, requesterEmail, roomType],
    queryFn: async () => {
      if (!ownerEmail || !requesterEmail) return null;
      const { data } = await supabase
        .from("data_room_access")
        .select("id, status")
        .eq("owner_email", ownerEmail)
        .eq("requester_email", requesterEmail)
        .eq("room_type", roomType)
        .maybeSingle();
      return data;
    },
    enabled: !!ownerEmail && !!requesterEmail,
  });

  const requestAccess = useMutation({
    mutationFn: async () => {
      // 1. Upsert the access request row
      const { error: accessErr } = await supabase
        .from("data_room_access")
        .upsert(
          {
            owner_email:     ownerEmail,
            requester_email: requesterEmail,
            requester_name:  requesterName || requesterEmail,
            requester_role:  "brand",
            status:          "pending",
            room_type:       roomType,
          },
          { onConflict: "owner_email,requester_email,room_type" }
        );
      if (accessErr) throw accessErr;

      // 2. Create a notification for the talent owner
      const { error: notifErr } = await supabase
        .from("notifications")
        .insert({
          user_email:   ownerEmail,
          type:         "data_room_access_request",
          title:        "New Data Room Access Request",
          message:      `${requesterName || requesterEmail} (Brand) has requested access to your full Talent Data Room.`,
          status:       "unread",
          resource_type: "data_room",
          metadata:     {
            requester_email: requesterEmail,
            requester_name:  requesterName || requesterEmail,
            room_type:       roomType,
          },
        });
      // Notifications failure is non-fatal — swallow the error
      if (notifErr) console.warn("Could not create notification:", notifErr.message);
    },
    onSuccess: () => {
      toast({
        title:       "Request sent",
        description: "The talent owner has been notified. You'll be contacted once approved.",
      });
      qc.invalidateQueries({ queryKey: ["data-room-access-check", ownerEmail, requesterEmail, roomType] });
    },
    onError: (err) => {
      toast({
        title:       "Request failed",
        description: err.message || "Could not send the access request. Please try again.",
        variant:     "destructive",
      });
    },
  });

  if (checkLoading) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="pt-5 pb-4">
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Already approved — show access granted badge
  if (existing?.status === "approved") {
    return (
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Full Data Room Access Granted</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                The talent owner approved your request. Deal history and benchmarks are now visible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending request
  if (existing?.status === "pending") {
    return (
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Access Request Pending</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your request has been sent to the talent owner. Awaiting approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No request yet — show the CTA
  return (
    <Card className="border-slate-200/60">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Want the full picture?</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">
              Request access to view this talent's complete deal history, rate benchmarks,
              and AI performance predictions.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  disabled={requestAccess.isPending}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {requestAccess.isPending ? "Sending request…" : "Request Access to Full Data Room"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Full Data Room Access</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will send a notification to the talent owner with your name and email address.
                    They can approve or deny your request. Do you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => requestAccess.mutate()}
                  >
                    Send Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Owner side: pending requests list ─────────────────────────────────────────

function OwnerRequestsPanel({ ownerEmail, roomType }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["data-room-access-requests", ownerEmail, roomType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_access")
        .select("*")
        .eq("owner_email", ownerEmail)
        .eq("room_type", roomType)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!ownerEmail,
    refetchInterval: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from("data_room_access")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === "approved" ? "Access approved" : "Request denied",
        description:
          status === "approved"
            ? "The brand now has access to your full data room."
            : "The brand's access request has been denied.",
      });
      qc.invalidateQueries({ queryKey: ["data-room-access-requests", ownerEmail, roomType] });
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="pt-5 pb-4">
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-400" /> Data Room Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-4">
            No access requests yet. Share your data room link to start receiving requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pending  = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Inbox className="w-4 h-4 text-indigo-500" /> Data Room Access Requests
          </CardTitle>
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              {pending.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((req) => {
          const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
          const StatusIcon = cfg.icon;
          const isPending = req.status === "pending";
          const timeAgo = req.created_at
            ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true })
            : "";

          return (
            <div
              key={req.id}
              className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-700">
                    {(req.requester_name || req.requester_email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {req.requester_name || req.requester_email}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{req.requester_email} · {timeAgo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isPending ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8 px-3 text-xs"
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: req.id, status: "approved" })}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 h-8 px-3 text-xs"
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: req.id, status: "denied" })}
                    >
                      <UserX className="w-3.5 h-3.5" /> Deny
                    </Button>
                  </>
                ) : (
                  <Badge className={`${cfg.color} gap-1 text-xs`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}

        {resolved.length > 0 && pending.length > 0 && (
          <p className="text-xs text-slate-400 text-center pt-1">
            {resolved.length} resolved request{resolved.length !== 1 ? "s" : ""} shown above
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

/**
 * AccessRequestPanel
 *
 * Props:
 *  ownerEmail    {string}  – email of the data room owner
 *  viewerEmail   {string}  – email of the currently signed-in user
 *  viewerName    {string}  – display name of the viewer (optional)
 *  isOwner       {boolean} – true when the viewer IS the owner
 *  roomType      {string}  – e.g. "talent_deals"
 */
export default function AccessRequestPanel({
  ownerEmail,
  viewerEmail,
  viewerName,
  isOwner,
  roomType = "talent_deals",
}) {
  if (isOwner) {
    return <OwnerRequestsPanel ownerEmail={ownerEmail} roomType={roomType} />;
  }

  // Guest / brand viewer
  if (!viewerEmail) return null;

  return (
    <BrandRequestButton
      ownerEmail={ownerEmail}
      requesterEmail={viewerEmail}
      requesterName={viewerName}
      roomType={roomType}
    />
  );
}

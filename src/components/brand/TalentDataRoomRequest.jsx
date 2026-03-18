import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Share2, Clock, CheckCircle2, XCircle, AlertCircle, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ── status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700",
  },
  declined: {
    label: "Declined",
    icon: XCircle,
    className: "bg-rose-100 text-rose-700",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Badge className={`text-xs gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function TalentDataRoomRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [talentName, setTalentName] = useState("");
  const [talentEmail, setTalentEmail] = useState("");

  // Fetch pending/sent requests for this brand user
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["data-room-access-requests", user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "data_room_access_request")
        .eq("sender_email", user?.email || "")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email,
  });

  const sendRequest = useMutation({
    mutationFn: async ({ name, email }) => {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          type: "data_room_access_request",
          recipient_email: email,
          sender_email: user?.email || "",
          title: "Data Room Access Request",
          message: `${user?.full_name || user?.email || "A brand"} is requesting access to your talent data room. Talent: ${name}.`,
          status: "pending",
          metadata: {
            talent_name: name,
            talent_email: email,
            brand_email: user?.email || "",
            brand_name: user?.full_name || user?.email || "",
          },
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-room-access-requests"] });
      toast({
        title: "Request sent",
        description: `Access request sent to ${talentEmail}.`,
      });
      setOpen(false);
      setTalentName("");
      setTalentEmail("");
    },
    onError: (err) => {
      toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!talentEmail.trim()) return;
    sendRequest.mutate({ name: talentName, email: talentEmail });
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-500" />
            Talent Data Room Access
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2 text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                Request Talent Data Room Access
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-violet-500" />
                  Request Talent Data Room Access
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enter the talent's name and email to send them a data room access request.
                  They will receive a notification and can approve or decline.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="talent-name">Talent / Creator Name</Label>
                  <Input
                    id="talent-name"
                    placeholder="e.g. @influencer or Full Name"
                    value={talentName}
                    onChange={(e) => setTalentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talent-email">
                    Talent Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="talent-email"
                    type="email"
                    required
                    placeholder="talent@example.com"
                    value={talentEmail}
                    onChange={(e) => setTalentEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                  A notification will be sent to the talent's account. They can grant or deny access to their private deal history and analytics.
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendRequest.isPending || !talentEmail.trim()}
                    className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sendRequest.isPending ? "Sending..." : "Send Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-400 text-center py-4">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-6">
            <Share2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No requests sent yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Request Talent Data Room Access" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Sent Requests ({requests.length})
            </p>
            {requests.map((req) => {
              const meta = req.metadata || {};
              const date = new Date(req.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {meta.talent_name || req.recipient_email}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{req.recipient_email}</p>
                    <p className="text-xs text-slate-400">{date}</p>
                  </div>
                  <StatusBadge status={req.status || "pending"} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

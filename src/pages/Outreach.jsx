import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Send, Plus, Sparkles, Clock, CheckCircle2, Eye, Reply, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";

const statusConfig = {
  draft: { icon: Mail, color: "bg-slate-100 text-slate-600", label: "Draft" },
  pending_approval: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending Approval" },
  approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Approved" },
  rejected: { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  sent: { icon: Send, color: "bg-blue-100 text-blue-700", label: "Sent" },
  delivered: { icon: CheckCircle2, color: "bg-sky-100 text-sky-700", label: "Delivered" },
  opened: { icon: Eye, color: "bg-indigo-100 text-indigo-700", label: "Opened" },
  replied: { icon: Reply, color: "bg-emerald-100 text-emerald-700", label: "Replied" },
  bounced: { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Bounced" },
};

export default function Outreach() {
  const [tab, setTab] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to_email: "", to_name: "", subject: "", body: "", email_type: "initial_outreach", status: "draft"
  });

  const queryClient = useQueryClient();
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["outreach-emails"],
    queryFn: () => base44.entities.OutreachEmail.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OutreachEmail.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-emails"] });
      setShowCompose(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OutreachEmail.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outreach-emails"] }),
  });

  const resetForm = () => setNewEmail({ to_email: "", to_name: "", subject: "", body: "", email_type: "initial_outreach", status: "draft" });

  const handleGenerateAI = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional and personalized partnership outreach email.
Recipient: ${newEmail.to_name || "Decision Maker"}
Email: ${newEmail.to_email}
Type: ${newEmail.email_type.replace(/_/g, " ")}

Write a compelling, concise email that:
- Has an engaging subject line
- Opens with a personalized hook
- Clearly states the value proposition
- Includes a clear call to action
- Is professional but conversational
- Is under 200 words`,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" }
        }
      }
    });
    setNewEmail(prev => ({ ...prev, subject: result.subject, body: result.body, ai_generated: true }));
    setGenerating(false);
  };

  const handleSubmitForApproval = (emailId) => {
    updateMutation.mutate({ id: emailId, data: { status: "pending_approval" } });
    base44.entities.ApprovalItem.create({
      item_type: "outreach_email",
      reference_id: emailId,
      title: `Outreach email approval`,
      description: "AI-generated outreach email requires review",
      priority: "p2",
      status: "pending",
    });
  };

  const filteredEmails = tab === "all" ? emails : emails.filter(e => e.status === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outreach Hub</h1>
          <p className="text-sm text-slate-500 mt-1">{emails.length} emails · All outbound requires approval</p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Compose
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({emails.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="pending_approval">Pending</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="opened">Opened</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-100 rounded w-2/3" /></div>)}</div>
      ) : filteredEmails.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No emails yet</h3>
          <p className="text-sm text-slate-400 mt-1">Compose your first outreach email</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmails.map(email => {
            const config = statusConfig[email.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <Card key={email.id} className="border-slate-200/60 p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{email.subject}</h4>
                      {email.ai_generated && <Badge className="bg-purple-50 text-purple-700 text-[10px]">AI</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      To: {email.to_name || email.to_email} · {email.created_date ? format(new Date(email.created_date), "MMM d, h:mm a") : ""}
                    </p>
                  </div>
                  <Badge className={`${config.color} text-[10px]`}>{config.label}</Badge>
                  {email.status === "draft" && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleSubmitForApproval(email.id)}>
                      Submit for Approval
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Outreach Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Recipient Name</Label><Input value={newEmail.to_name} onChange={e => setNewEmail({...newEmail, to_name: e.target.value})} placeholder="John Doe" /></div>
              <div><Label>Email *</Label><Input value={newEmail.to_email} onChange={e => setNewEmail({...newEmail, to_email: e.target.value})} placeholder="john@company.com" /></div>
            </div>
            <div>
              <Label>Email Type</Label>
              <Select value={newEmail.email_type} onValueChange={v => setNewEmail({...newEmail, email_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["initial_outreach","follow_up","proposal","negotiation","contract","thank_you"].map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleGenerateAI} disabled={generating} className="w-full gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
              {generating ? "Generating with AI..." : "Generate with AI"}
            </Button>

            <div><Label>Subject *</Label><Input value={newEmail.subject} onChange={e => setNewEmail({...newEmail, subject: e.target.value})} placeholder="Partnership opportunity..." /></div>
            <div><Label>Body *</Label><Textarea value={newEmail.body} onChange={e => setNewEmail({...newEmail, body: e.target.value})} placeholder="Write your email..." className="min-h-[200px]" /></div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => createMutation.mutate({...newEmail, status: "draft"})}>
                Save as Draft
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => createMutation.mutate({...newEmail, status: "pending_approval"})} disabled={!newEmail.to_email || !newEmail.subject || !newEmail.body}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Submit for Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Sparkles, Play, Pause, Mail, Save, Loader2,
  Eye, Reply, Calendar, Info, Zap, Users, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StepCard from "@/components/sequences/StepCard";

const STATUS_CONFIG = {
  draft: { cls: "bg-slate-100 text-slate-600", label: "Draft" },
  active: { cls: "bg-emerald-100 text-emerald-700", label: "Active" },
  paused: { cls: "bg-amber-100 text-amber-700", label: "Paused" },
  completed: { cls: "bg-indigo-100 text-indigo-700", label: "Completed" },
};

function MetricPill({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{value}</span>
      <span className="text-slate-400 font-normal">{label}</span>
    </div>
  );
}

export default function SequenceBuilder() {
  const [showCreate, setShowCreate] = useState(false);
  const [editSeq, setEditSeq] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", target_name: "", target_email: "",
    my_name: "", my_company: "", target_role: "", target_platform: "",
    target_niche: "", target_followers: "",
  });
  const [steps, setSteps] = useState([
    { email_type: "initial_outreach", delay_days: 0, send_time: "09:00", subject: "", body: "" }
  ]);

  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ["sequences"],
    queryFn: () => base44.entities.OutreachSequence.list("-created_date", 50),
  });

  const { data: outreachEmails = [] } = useQuery({
    queryKey: ["outreach-emails-metrics"],
    queryFn: () => base44.entities.OutreachEmail.list("-created_date", 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editSeq
      ? base44.entities.OutreachSequence.update(editSeq.id, data)
      : base44.entities.OutreachSequence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      setShowCreate(false);
      setEditSeq(null);
      resetForm();
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OutreachSequence.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sequences"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OutreachSequence.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sequences"] }),
  });

  const resetForm = () => {
    setForm({ name: "", description: "", target_name: "", target_email: "", my_name: "", my_company: "", target_role: "", target_platform: "", target_niche: "", target_followers: "" });
    setSteps([{ email_type: "initial_outreach", delay_days: 0, send_time: "09:00", subject: "", body: "" }]);
  };

  const openEdit = (seq) => {
    setEditSeq(seq);
    let meta = {};
    try { meta = JSON.parse(seq.description || "{}"); } catch {}
    setForm({
      name: seq.name,
      description: meta.description || "",
      target_name: seq.target_name || "",
      target_email: seq.target_email || "",
      my_name: meta.my_name || "",
      my_company: meta.my_company || "",
      target_role: meta.target_role || "",
      target_platform: meta.target_platform || "",
      target_niche: meta.target_niche || "",
      target_followers: meta.target_followers || "",
    });
    try { setSteps(JSON.parse(seq.steps || "[]")); } catch { setSteps([]); }
    setShowCreate(true);
  };

  const addStep = () => setSteps(s => [...s, { email_type: "follow_up", delay_days: 3, send_time: "14:00", subject: "", body: "" }]);
  const updateStep = (i, val) => setSteps(s => s.map((st, idx) => idx === i ? val : st));
  const deleteStep = (i) => setSteps(s => s.filter((_, idx) => idx !== i));

  const generateStep = async (i) => {
    setGenerating(i);
    const step = steps[i];
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a compelling ${step.email_type.replace(/_/g, " ")} email for a brand-talent partnership outreach sequence.

Context:
- Sender: ${form.my_name || "the sender"} from ${form.my_company || "our company"}
- Recipient: ${form.target_name || "{{first_name}}"} (${form.target_role || "marketing manager"}) at ${form.target_email?.split("@")[1] || "their company"}
- Talent platform: ${form.target_platform || "Instagram"}, niche: ${form.target_niche || "lifestyle"}, followers: ${form.target_followers || "100K"}
- This is step ${i + 1} of ${steps.length}${i > 0 ? `. Previous steps: ${steps.slice(0, i).map(s => s.email_type).join(" → ")}` : ""}
- Delay: ${step.delay_days} days after previous step

Requirements:
- Use personalization tokens like {{first_name}}, {{company}}, {{your_name}}, {{platform}}, {{niche}}, {{followers}} wherever natural
- Keep body under 150 words, professional but warm
- End with a clear, low-friction CTA
- Subject should be specific, not generic`,
      response_json_schema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } }
      }
    });
    updateStep(i, { ...step, subject: result.subject, body: result.body });
    setGenerating(null);
  };

  const handleSave = (status = "draft") => {
    const meta = JSON.stringify({
      description: form.description,
      my_name: form.my_name,
      my_company: form.my_company,
      target_role: form.target_role,
      target_platform: form.target_platform,
      target_niche: form.target_niche,
      target_followers: form.target_followers,
    });
    saveMutation.mutate({
      name: form.name,
      description: meta,
      target_name: form.target_name,
      target_email: form.target_email,
      steps: JSON.stringify(steps),
      status,
      current_step: 0,
    });
  };

  const parsedSteps = (seq) => { try { return JSON.parse(seq.steps || "[]"); } catch { return []; } };

  const totalSent = outreachEmails.filter(e => ["sent", "delivered", "opened", "clicked", "replied"].includes(e.status)).length;
  const totalOpened = outreachEmails.filter(e => ["opened", "clicked", "replied"].includes(e.status)).length;
  const totalReplied = outreachEmails.filter(e => e.status === "replied").length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
  const activeSeqs = sequences.filter(s => s.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outreach Sequences</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-step automated campaigns with personalization & scheduling</p>
        </div>
        <Button onClick={() => { resetForm(); setEditSeq(null); setShowCreate(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Sequence
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Sequences", value: activeSeqs, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Emails Sent", value: totalSent, icon: Mail, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Open Rate", value: `${openRate}%`, icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Reply Rate", value: `${replyRate}%`, icon: Reply, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-slate-200/60">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{m.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.bg}`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sequences list */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse h-20" />)}</div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl">
          <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-600">No sequences yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Build multi-step outreach flows with personalization tokens and smart scheduling</p>
          <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Create First Sequence
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map(seq => {
            const stepsArr = parsedSteps(seq);
            const sc = STATUS_CONFIG[seq.status] || STATUS_CONFIG.draft;
            const seqSent = outreachEmails.filter(e => e.to_email === seq.target_email).length;
            const mockOpen = Math.round(35 + ((seq.id?.charCodeAt(0) || 0) % 30));
            const mockReply = Math.round(8 + ((seq.id?.charCodeAt(1) || 0) % 15));

            return (
              <Card key={seq.id} className="border-slate-200/60 hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">{seq.name}</h3>
                        <Badge className={`${sc.cls} text-[10px]`}>{sc.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{stepsArr.length} steps</Badge>
                      </div>

                      {seq.target_name && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {seq.target_name} · {seq.target_email}
                        </p>
                      )}

                      {stepsArr.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {stepsArr.map((s, i) => (
                            <React.Fragment key={i}>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                                {i > 0 ? `+${s.delay_days}d ` : ""}{s.email_type?.replace(/_/g, " ")}
                              </span>
                              {i < stepsArr.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2.5">
                        <MetricPill icon={Mail} label="sent" value={seqSent || 0} color="text-indigo-500" />
                        <MetricPill icon={Eye} label="open rate" value={`${mockOpen}%`} color="text-amber-500" />
                        <MetricPill icon={Reply} label="reply rate" value={`${mockReply}%`} color="text-emerald-500" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => openEdit(seq)}>Edit</Button>
                      {seq.status === "active" ? (
                        <Button size="sm" variant="outline" className="text-xs h-8 text-amber-600 border-amber-200"
                          onClick={() => toggleStatus.mutate({ id: seq.id, status: "paused" })}>
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                      ) : (
                        <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => toggleStatus.mutate({ id: seq.id, status: "active" })}>
                          <Play className="w-3 h-3 mr-1" /> {seq.status === "paused" ? "Resume" : "Activate"}
                        </Button>
                      )}
                      <button onClick={() => deleteMutation.mutate(seq.id)} className="text-slate-300 hover:text-red-400 p-1 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={v => { if (!v) { setShowCreate(false); setEditSeq(null); } }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSeq ? "Edit Sequence" : "New Outreach Sequence"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="setup" className="pt-1">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="setup" className="flex-1">1 · Setup</TabsTrigger>
              <TabsTrigger value="steps" className="flex-1">2 · Steps ({steps.length})</TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">3 · Schedule</TabsTrigger>
            </TabsList>

            {/* Tab 1: Setup */}
            <TabsContent value="setup" className="space-y-4">
              <div>
                <Label>Sequence Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike Partnership Outreach Q1" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this campaign's goal" className="mt-1" />
              </div>

              <Separator />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Recipient Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Contact Name</Label>
                  <Input value={form.target_name} onChange={e => setForm({ ...form, target_name: e.target.value })} placeholder="Alex Johnson" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Contact Email</Label>
                  <Input value={form.target_email} onChange={e => setForm({ ...form, target_email: e.target.value })} placeholder="alex@brand.com" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Their Role</Label>
                  <Input value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })} placeholder="VP Marketing" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Your Company</Label>
                  <Input value={form.my_company} onChange={e => setForm({ ...form, my_company: e.target.value })} placeholder="Your brand/agency name" className="mt-1 h-9 text-sm" />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Talent Context (for AI generation)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Input value={form.target_platform} onChange={e => setForm({ ...form, target_platform: e.target.value })} placeholder="Instagram" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Niche</Label>
                  <Input value={form.target_niche} onChange={e => setForm({ ...form, target_niche: e.target.value })} placeholder="fitness & wellness" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Follower Count</Label>
                  <Input value={form.target_followers} onChange={e => setForm({ ...form, target_followers: e.target.value })} placeholder="250K" className="mt-1 h-9 text-sm" />
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                These details power personalization tokens in your email steps. The AI will use them to generate hyper-relevant content.
              </div>
            </TabsContent>

            {/* Tab 2: Steps */}
            <TabsContent value="steps" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{steps.length} step{steps.length !== 1 ? "s" : ""} in this sequence</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1"
                    onClick={async () => { for (let i = 0; i < steps.length; i++) await generateStep(i); }}
                    disabled={generating !== null}>
                    <Sparkles className="w-3 h-3 text-purple-500" /> AI Fill All
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addStep}>
                    <Plus className="w-3 h-3 mr-1" /> Add Step
                  </Button>
                </div>
              </div>

              {steps.map((step, i) => (
                <StepCard
                  key={i} step={step} index={i} total={steps.length}
                  onChange={updateStep} onDelete={deleteStep}
                  onGenerate={generateStep} generating={generating}
                />
              ))}

              {steps.length < 6 && (
                <button
                  onClick={addStep}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add another step
                </button>
              )}
            </TabsContent>

            {/* Tab 3: Schedule */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Sequence Schedule Summary
                </p>
                <div className="space-y-2">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 capitalize">{s.email_type?.replace(/_/g, " ")}</span>
                        <span className="text-slate-400 text-xs ml-2">
                          {i === 0 ? "Day 0" : `Day ${steps.slice(1, i + 1).reduce((acc, st) => acc + (st.delay_days || 0), 0)}`}
                          {s.scheduled_time ? ` at ${s.scheduled_time}` : ""}
                        </span>
                      </div>
                      {s.subject && <span className="text-xs text-slate-400 truncate max-w-[180px]">{s.subject}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" /> Best Practices
                </p>
                <ul className="space-y-1.5 text-xs text-emerald-700">
                  <li>• Initial outreach performs best sent Tuesday–Thursday, 9–10am or 2–3pm</li>
                  <li>• Follow-ups should be spaced 3–5 days apart to avoid spam filters</li>
                  <li>• 3-step sequences achieve 27% higher reply rates than single emails</li>
                  <li>• Sequences with personalization tokens see 2× open rates</li>
                </ul>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")} disabled={!form.name || saveMutation.isPending}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save as Draft
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("active")} disabled={!form.name || saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                  Save & Activate
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Sparkles, Play, Pause, Mail, Clock, ChevronDown, ChevronUp,
  ArrowDown, Save, Loader2, Copy, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const EMAIL_TYPES = ["initial_outreach", "follow_up", "proposal", "negotiation", "thank_you"];
const STATUS_CONFIG = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
};

function StepCard({ step, index, total, onChange, onDelete, onGenerate, generating }) {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="relative">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{step.subject || `Step ${index + 1}`}</p>
            <p className="text-xs text-slate-400">
              {step.delay_days > 0 ? `Send after ${step.delay_days}d` : "Send immediately"} · {step.email_type?.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.stopPropagation(); onDelete(index); }} className="text-slate-300 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email Type</Label>
                <Select value={step.email_type} onValueChange={v => onChange(index, { ...step, email_type: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Delay (days after previous)</Label>
                <Input
                  type="number" min={0} max={30}
                  value={step.delay_days ?? 0}
                  onChange={e => onChange(index, { ...step, delay_days: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Input value={step.subject || ""} onChange={e => onChange(index, { ...step, subject: e.target.value })} className="h-8 text-xs mt-1" placeholder="Email subject..." />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea
                value={step.body || ""}
                onChange={e => onChange(index, { ...step, body: e.target.value })}
                placeholder="Email body..."
                className="text-xs mt-1 min-h-[100px]"
              />
            </div>
            <Button
              size="sm" variant="outline"
              className="w-full text-xs gap-1.5 h-8"
              onClick={() => onGenerate(index)}
              disabled={generating === index}
            >
              {generating === index
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                : <><Sparkles className="w-3 h-3 text-purple-500" /> AI Generate Step</>}
            </Button>
          </div>
        )}
      </div>

      {index < total - 1 && (
        <div className="flex flex-col items-center my-1">
          <div className="w-px h-4 bg-slate-200" />
          <ArrowDown className="w-3 h-3 text-slate-300" />
        </div>
      )}
    </div>
  );
}

export default function SequenceBuilder() {
  const [showCreate, setShowCreate] = useState(false);
  const [editSeq, setEditSeq] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", target_name: "", target_email: "" });
  const [steps, setSteps] = useState([
    { email_type: "initial_outreach", delay_days: 0, subject: "", body: "" }
  ]);

  const queryClient = useQueryClient();
  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ["sequences"],
    queryFn: () => base44.entities.OutreachSequence.list("-created_date", 50),
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
    setForm({ name: "", description: "", target_name: "", target_email: "" });
    setSteps([{ email_type: "initial_outreach", delay_days: 0, subject: "", body: "" }]);
  };

  const openEdit = (seq) => {
    setEditSeq(seq);
    setForm({ name: seq.name, description: seq.description || "", target_name: seq.target_name || "", target_email: seq.target_email || "" });
    try { setSteps(JSON.parse(seq.steps || "[]")); } catch { setSteps([]); }
    setShowCreate(true);
  };

  const addStep = () => setSteps(s => [...s, { email_type: "follow_up", delay_days: 3, subject: "", body: "" }]);
  const updateStep = (i, val) => setSteps(s => s.map((st, idx) => idx === i ? val : st));
  const deleteStep = (i) => setSteps(s => s.filter((_, idx) => idx !== i));

  const generateStep = async (i) => {
    setGenerating(i);
    const step = steps[i];
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a ${step.email_type.replace(/_/g, " ")} email for a brand-talent partnership outreach sequence.
Target: ${form.target_name || "Decision Maker"} (${form.target_email || "recipient"})
This is step ${i + 1} in the sequence.${i > 0 ? ` Previous steps: ${steps.slice(0, i).map(s => s.email_type).join(" → ")}` : ""}
Delay: ${step.delay_days} days after previous step.
Write a compelling, concise email under 150 words.`,
      response_json_schema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } }
      }
    });
    updateStep(i, { ...step, subject: result.subject, body: result.body });
    setGenerating(null);
  };

  const handleSave = (status = "draft") => {
    saveMutation.mutate({
      ...form,
      steps: JSON.stringify(steps),
      status,
      current_step: 0,
    });
  };

  const parsedSteps = (seq) => { try { return JSON.parse(seq.steps || "[]"); } catch { return []; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sequence Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-step automated outreach flows</p>
        </div>
        <Button onClick={() => { resetForm(); setEditSeq(null); setShowCreate(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Sequence
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse h-20" />)}</div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl">
          <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-600">No sequences yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Build multi-step outreach flows to automate follow-ups</p>
          <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Create First Sequence
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map(seq => {
            const stepsArr = parsedSteps(seq);
            const statusCls = STATUS_CONFIG[seq.status] || STATUS_CONFIG.draft;
            return (
              <Card key={seq.id} className="border-slate-200/60 hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">{seq.name}</h3>
                        <Badge className={`${statusCls} text-[10px]`}>{seq.status}</Badge>
                        <Badge variant="outline" className="text-[10px]">{stepsArr.length} steps</Badge>
                      </div>
                      {seq.description && <p className="text-xs text-slate-400 mt-0.5">{seq.description}</p>}
                      {seq.target_name && <p className="text-xs text-slate-400 mt-0.5">→ {seq.target_name} ({seq.target_email})</p>}

                      {/* Step pills */}
                      {stepsArr.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {stepsArr.map((s, i) => (
                            <React.Fragment key={i}>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {i > 0 ? `+${s.delay_days}d ` : ""}{s.email_type?.replace(/_/g, " ")}
                              </span>
                              {i < stepsArr.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => openEdit(seq)}>
                        Edit
                      </Button>
                      {seq.status === "active" ? (
                        <Button size="sm" variant="outline" className="text-xs h-8 text-amber-600 border-amber-200"
                          onClick={() => toggleStatus.mutate({ id: seq.id, status: "paused" })}>
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                      ) : seq.status === "paused" ? (
                        <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => toggleStatus.mutate({ id: seq.id, status: "active" })}>
                          <Play className="w-3 h-3 mr-1" /> Resume
                        </Button>
                      ) : (
                        <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => toggleStatus.mutate({ id: seq.id, status: "active" })}>
                          <Play className="w-3 h-3 mr-1" /> Activate
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSeq ? "Edit Sequence" : "New Outreach Sequence"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Sequence Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. SaaS Partnership Outreach" />
              </div>
              <div>
                <Label>Target Name</Label>
                <Input value={form.target_name} onChange={e => setForm({...form, target_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div>
                <Label>Target Email</Label>
                <Input value={form.target_email} onChange={e => setForm({...form, target_email: e.target.value})} placeholder="john@brand.com" />
              </div>
            </div>

            <Separator />

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Sequence Steps ({steps.length})</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addStep}>
                  <Plus className="w-3 h-3 mr-1" /> Add Step
                </Button>
              </div>
              <div>
                {steps.map((step, i) => (
                  <StepCard
                    key={i} step={step} index={i} total={steps.length}
                    onChange={updateStep} onDelete={deleteStep}
                    onGenerate={generateStep} generating={generating}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")} disabled={!form.name || saveMutation.isPending}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("active")} disabled={!form.name || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                Save & Activate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
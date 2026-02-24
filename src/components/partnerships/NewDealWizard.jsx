import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Check, Handshake, Building2, Users, DollarSign, Sparkles } from "lucide-react";

const STEPS = [
  { id: "type", label: "Deal Type", icon: Handshake },
  { id: "parties", label: "Parties", icon: Users },
  { id: "value", label: "Value & Priority", icon: DollarSign },
  { id: "review", label: "Review", icon: Check },
];

const TYPES = [
  { value: "sponsorship", label: "Sponsorship", desc: "Brand pays talent to promote products/services", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { value: "affiliate", label: "Affiliate", desc: "Performance-based commission model", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { value: "ambassador", label: "Ambassador", desc: "Long-term brand representation deal", color: "bg-violet-50 border-violet-200 text-violet-700" },
  { value: "content_creation", label: "Content Creation", desc: "Custom content produced for the brand", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "event", label: "Event", desc: "Live event appearance or hosting", color: "bg-rose-50 border-rose-200 text-rose-700" },
  { value: "product_seeding", label: "Product Seeding", desc: "Gifting products for organic coverage", color: "bg-sky-50 border-sky-200 text-sky-700" },
  { value: "licensing", label: "Licensing", desc: "Rights to use talent's name, likeness, or content", color: "bg-orange-50 border-orange-200 text-orange-700" },
];

const PRIORITIES = [
  { value: "p0", label: "P0 – Critical", desc: "Drop everything, act now", color: "bg-red-50 border-red-300 text-red-700" },
  { value: "p1", label: "P1 – High", desc: "Address within 24 hours", color: "bg-orange-50 border-orange-300 text-orange-700" },
  { value: "p2", label: "P2 – Standard", desc: "Normal business priority", color: "bg-indigo-50 border-indigo-300 text-indigo-700" },
  { value: "p3", label: "P3 – Low", desc: "Address when bandwidth allows", color: "bg-slate-50 border-slate-300 text-slate-600" },
];

export default function NewDealWizard({ open, onOpenChange, onCreated }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    partnership_type: "",
    brand_name: "",
    talent_name: "",
    notes: "",
    deal_value: "",
    priority: "p2",
    status: "discovered",
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.partnership_type;
    if (step === 1) return !!(form.brand_name && form.talent_name);
    if (step === 2) return true;
    return true;
  };

  const handleCreate = async () => {
    setSaving(true);
    const title = form.title || `${form.brand_name} × ${form.talent_name} (${TYPES.find(t => t.value === form.partnership_type)?.label})`;
    await base44.entities.Partnership.create({
      title,
      partnership_type: form.partnership_type,
      brand_name: form.brand_name,
      talent_name: form.talent_name,
      notes: form.notes,
      deal_value: parseFloat(form.deal_value) || 0,
      priority: form.priority,
      status: form.status,
    });
    setSaving(false);
    onCreated?.();
    onOpenChange(false);
    setStep(0);
    setForm({ title: "", partnership_type: "", brand_name: "", talent_name: "", notes: "", deal_value: "", priority: "p2", status: "discovered" });
  };

  const selectedType = TYPES.find(t => t.value === form.partnership_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">New Partnership Deal</DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 mt-1 mb-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-1.5 ${active ? "text-indigo-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all
                    ${active ? "border-indigo-500 bg-indigo-50" : done ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:block ${active ? "" : "opacity-60"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${done ? "bg-emerald-300" : "bg-slate-100"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 0: Deal Type */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">What kind of partnership is this?</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => update("partnership_type", t.value)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${form.partnership_type === t.value ? t.color + " shadow-sm" : "border-slate-100 hover:border-slate-200 bg-white"}`}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Parties */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Who are the two sides of this deal?</p>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
              Creating a <strong>{selectedType?.label}</strong> deal — {selectedType?.desc}.
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-amber-500" /> Brand / Company *</Label>
              <Input value={form.brand_name} onChange={e => update("brand_name", e.target.value)} placeholder="e.g. Nike, Adidas, Glossier" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-violet-500" /> Talent / Creator *</Label>
              <Input value={form.talent_name} onChange={e => update("talent_name", e.target.value)} placeholder="e.g. @fitnessqueen, MrBeast" className="mt-1" />
            </div>
            <div>
              <Label>Custom Deal Title (optional)</Label>
              <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder={`${form.brand_name || "Brand"} × ${form.talent_name || "Talent"}`} className="mt-1" />
              <p className="text-[11px] text-slate-400 mt-1">Leave blank to auto-generate from brand & talent names</p>
            </div>
            <div>
              <Label>Initial Notes</Label>
              <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any context, source, or initial thoughts..." className="mt-1 h-20 text-sm" />
            </div>
          </div>
        )}

        {/* Step 2: Value & Priority */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Set the deal value and priority level.</p>
            <div>
              <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Estimated Deal Value (USD)</Label>
              <Input type="number" value={form.deal_value} onChange={e => update("deal_value", e.target.value)} placeholder="e.g. 15000" className="mt-1" />
              {form.deal_value && <p className="text-xs text-emerald-600 mt-1">${Number(form.deal_value).toLocaleString()} deal value</p>}
            </div>
            <div>
              <Label className="mb-2 block">Priority Level</Label>
              <div className="space-y-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} onClick={() => update("priority", p.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${form.priority === p.value ? p.color : "border-slate-100 bg-white hover:border-slate-200"}`}>
                    <div>
                      <p className="text-sm font-semibold">{p.label}</p>
                      <p className="text-[11px] text-slate-500">{p.desc}</p>
                    </div>
                    {form.priority === p.value && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Review and confirm your new deal.</p>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              {[
                { label: "Type", value: selectedType?.label },
                { label: "Brand", value: form.brand_name },
                { label: "Talent", value: form.talent_name },
                { label: "Deal Value", value: form.deal_value ? `$${Number(form.deal_value).toLocaleString()}` : "Not specified" },
                { label: "Priority", value: PRIORITIES.find(p => p.value === form.priority)?.label },
                { label: "Starting Stage", value: "Discovered" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{row.label}</span>
                  <span className="font-medium text-slate-800">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              The deal will be created in the <strong>Discovered</strong> stage. Move it through the pipeline as it progresses.
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="text-slate-500">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-indigo-600 hover:bg-indigo-700">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? "Creating..." : "Create Deal"}
              <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Trash2, ArrowDown, Sparkles, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TokenPicker from "./TokenPicker";

const EMAIL_TYPES = [
  { value: "initial_outreach", label: "Initial Outreach" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "thank_you", label: "Thank You" },
];

const PREVIEW_VARS = {
  "{{first_name}}": "Alex",
  "{{last_name}}": "Johnson",
  "{{full_name}}": "Alex Johnson",
  "{{company}}": "Acme Brand",
  "{{role}}": "Head of Marketing",
  "{{platform}}": "Instagram",
  "{{niche}}": "fitness",
  "{{followers}}": "250K",
  "{{your_name}}": "Your Name",
  "{{your_company}}": "Deal Stage",
  "{{campaign_name}}": "Summer 2025",
  "{{date}}": "Feb 24, 2026",
};

function applyTokens(text) {
  if (!text) return "";
  let out = text;
  Object.entries(PREVIEW_VARS).forEach(([tok, val]) => { out = out.replaceAll(tok, val); });
  return out;
}

export default function StepCard({ step, index, total, onChange, onDelete, onGenerate, generating }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef(null);
  const subjectRef = useRef(null);

  const insertToken = (token) => {
    const el = document.activeElement;
    const field = el === bodyRef.current ? "body" : "subject";
    const textarea = el;
    if (!textarea) return;
    const start = textarea.selectionStart ?? (textarea.value?.length || 0);
    const end = textarea.selectionEnd ?? start;
    const current = step[field] || "";
    const updated = current.slice(0, start) + token + current.slice(end);
    onChange(index, { ...step, [field]: updated });
    setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + token.length; textarea.focus(); }, 0);
  };

  return (
    <div className="relative">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpanded(e => !e)}>
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{step.subject || `Step ${index + 1} — ${EMAIL_TYPES.find(t => t.value === step.email_type)?.label || "Step"}`}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3 h-3 text-slate-300" />
              <p className="text-xs text-slate-400">
                {step.delay_days > 0 ? `+${step.delay_days}d after previous` : "Send immediately"}
                {step.scheduled_time ? ` at ${step.scheduled_time}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={e => { e.stopPropagation(); onDelete(index); }} className="text-slate-300 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 p-4 space-y-3">
            {/* Type + Delay + Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Step Type</Label>
                <Select value={step.email_type} onValueChange={v => onChange(index, { ...step, email_type: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Delay (days)</Label>
                <Input type="number" min={0} max={90} value={step.delay_days ?? 0}
                  onChange={e => onChange(index, { ...step, delay_days: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs">Send Time</Label>
                <Input type="time" value={step.scheduled_time || "09:00"}
                  onChange={e => onChange(index, { ...step, scheduled_time: e.target.value })}
                  className="h-8 text-xs mt-1" />
              </div>
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Subject Line</Label>
                <TokenPicker onInsert={insertToken} />
              </div>
              <Input
                ref={subjectRef}
                value={step.subject || ""}
                onChange={e => onChange(index, { ...step, subject: e.target.value })}
                className="h-8 text-xs font-mono"
                placeholder="e.g. Partnership opportunity for {{company}}"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Message Body</Label>
                <button onClick={() => setPreview(p => !p)} className="text-[10px] text-indigo-500 hover:underline">
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {preview ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-wrap min-h-[100px] font-sans leading-relaxed">
                  {applyTokens(step.body) || <span className="text-slate-300">Nothing to preview yet.</span>}
                </div>
              ) : (
                <Textarea
                  ref={bodyRef}
                  value={step.body || ""}
                  onChange={e => onChange(index, { ...step, body: e.target.value })}
                  placeholder={`Hi {{first_name}},\n\nI came across {{company}} and loved your work in the {{niche}} space...`}
                  className="text-xs mt-0 min-h-[120px] font-mono"
                />
              )}
            </div>

            {/* AI Generate */}
            <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 h-8 border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => onGenerate(index)} disabled={generating === index}>
              {generating === index
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating with AI...</>
                : <><Sparkles className="w-3 h-3" /> AI Write This Step</>}
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
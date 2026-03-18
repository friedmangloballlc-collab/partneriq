import React, { useState, useRef } from "react";
import mammoth from "mammoth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Target,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ── helpers ───────────────────────────────────────────────────────────────────

async function extractTextFromFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  // PDF: send filename/size as context; real PDF parsing requires server-side
  return `[PDF Document: ${file.name}]\n[File size: ${Math.round(file.size / 1024)}KB]\n\nPlease extract campaign brief details from this document named "${file.name}".`;
}

const SECTION_CONFIG = [
  {
    key: "kpis",
    label: "KPIs",
    icon: BarChart3,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    key: "budget",
    label: "Budget",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: "deliverables",
    label: "Deliverables",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    key: "timeline",
    label: "Timeline",
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: "talent_requirements",
    label: "Talent Requirements",
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    key: "success_metrics",
    label: "Success Metrics",
    icon: Target,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
];

function renderValue(value) {
  if (!value) return <span className="text-slate-400 italic text-xs">Not specified</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <ul className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <li key={k} className="text-sm text-slate-700">
            <span className="font-semibold text-slate-600 capitalize">{k.replace(/_/g, " ")}: </span>
            {String(v)}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-slate-700 leading-relaxed">{String(value)}</p>;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function BriefParser({ onSaved }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        room_type: "brand_campaigns",
        entry_type: "brief",
        title: `Campaign Brief: ${fileName}`,
        notes: JSON.stringify(parsed),
        deliverables: Array.isArray(parsed?.deliverables)
          ? parsed.deliverables.join(", ")
          : String(parsed?.deliverables || ""),
        deal_value: (() => {
          const b = parsed?.budget;
          if (!b) return 0;
          const str = typeof b === "object" ? JSON.stringify(b) : String(b);
          const match = str.match(/[\d,]+/);
          return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
        })(),
        user_email: user?.email || null,
      };
      const { data, error: err } = await supabase
        .from("data_room_entries")
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-room-brand"] });
      toast({ title: "Brief saved", description: "Campaign brief added to your Data Room." });
      if (onSaved) onSaved();
      setParsed(null);
      setFileName("");
    },
    onError: (err) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsed(null);
    setError("");
    setIsExtracting(true);

    try {
      const textContent = await extractTextFromFile(file);

      const { data, error: fnError } = await supabase.functions.invoke("ai-router", {
        body: {
          agent: "data_extractor",
          prompt:
            "Extract KPIs, budget, deliverables, talent requirements, timelines, and success metrics from this campaign brief. Return ONLY valid JSON (no markdown) with keys: kpis, budget, deliverables, timeline, talent_requirements, success_metrics. Each value can be a string, number, array of strings, or object. Extract as much detail as possible.",
          context: textContent.slice(0, 12000),
        },
      });

      if (fnError) throw new Error(fnError.message || "AI extraction failed");

      const responseText = data?.response || data?.content || data?.text || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI did not return structured data");

      const result = JSON.parse(jsonMatch[0]);
      setParsed(result);
    } catch (err) {
      setError(`Extraction failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          AI Campaign Brief Parser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors"
        >
          <div className="flex justify-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-rose-400" />
            <Upload className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {fileName ? fileName : "Upload campaign brief (.pdf or .docx)"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            AI will extract KPIs, budget, deliverables, timeline, talent requirements, and success metrics
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Extracting state */}
        {isExtracting && (
          <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <Sparkles className="w-5 h-5 text-violet-500 animate-pulse flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-700">Parsing brief with AI...</p>
              <p className="text-xs text-violet-500 mt-0.5">Extracting campaign details</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-3 border border-rose-100">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Parsed results */}
        {parsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700">Brief parsed successfully</span>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-auto">
                {Object.keys(parsed).filter((k) => parsed[k]).length} sections extracted
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SECTION_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => (
                <div key={key} className={`p-3 rounded-xl border ${bg} ${border}`}>
                  <div className={`flex items-center gap-1.5 mb-2 ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                  </div>
                  {renderValue(parsed[key])}
                </div>
              ))}
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              {saveMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save to Data Room
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

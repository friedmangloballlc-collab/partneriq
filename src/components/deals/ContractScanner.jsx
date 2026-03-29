import React, { useState, useRef, useCallback } from "react";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Scan,
} from "lucide-react";

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY = {
  CRITICAL: {
    label: "Critical",
    border: "border-red-300",
    bg: "bg-red-50",
    badgeCls: "bg-red-100 text-red-700 border-red-200",
    icon: ShieldAlert,
    iconCls: "text-red-500",
    headerText: "text-red-700",
  },
  WARNING: {
    label: "Warning",
    border: "border-amber-300",
    bg: "bg-amber-50",
    badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
    icon: AlertTriangle,
    iconCls: "text-amber-500",
    headerText: "text-amber-700",
  },
  INFO: {
    label: "Info",
    border: "border-blue-200",
    bg: "bg-blue-50",
    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Info,
    iconCls: "text-blue-500",
    headerText: "text-blue-700",
  },
};

// ─── Risk gauge ───────────────────────────────────────────────────────────────

function RiskGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));

  let color = "bg-green-500";
  let label = "Low Risk";
  let textColor = "text-green-700";
  let bgLight = "bg-green-50";
  let borderColor = "border-green-200";

  if (clamped >= 70) {
    color = "bg-red-500";
    label = "High Risk";
    textColor = "text-red-700";
    bgLight = "bg-red-50";
    borderColor = "border-red-200";
  } else if (clamped >= 40) {
    color = "bg-amber-500";
    label = "Medium Risk";
    textColor = "text-amber-700";
    bgLight = "bg-amber-50";
    borderColor = "border-amber-200";
  }

  return (
    <div className={`rounded-xl border p-4 ${bgLight} ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">Overall Risk Score</span>
        <span className={`text-2xl font-bold ${textColor}`}>{clamped}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-slate-400">0 — Safe</span>
        <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
        <span className="text-[10px] text-slate-400">100 — Danger</span>
      </div>
    </div>
  );
}

// ─── Single clause card ───────────────────────────────────────────────────────

function ClauseCard({ clause }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY[clause.severity] || SEVERITY.INFO;
  const Icon = sev.icon;

  return (
    <div className={`rounded-lg border ${sev.border} ${sev.bg} overflow-hidden`}>
      <button
        className="w-full text-left p-3.5 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sev.iconCls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={`text-[10px] border ${sev.badgeCls}`}>{sev.label}</Badge>
          </div>
          <p className={`text-xs font-medium leading-snug ${sev.headerText} line-clamp-2`}>
            {clause.text}
          </p>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-slate-200/60 pt-2.5">
          {clause.explanation && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-0.5">
                Why this matters
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{clause.explanation}</p>
            </div>
          )}
          {clause.recommendation && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-0.5">
                Recommendation
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{clause.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContractScanner() {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState(null);

  // Extract text from a DOCX file via mammoth (dynamically imported)
  const extractDocx = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const { value } = await mammoth.default.extractRawText({ arrayBuffer });
    return value;
  }, []);

  // Parse AI response — handles both raw JSON and markdown-fenced JSON
  const parseAiJson = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    let str = String(raw).trim();
    const fence = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) str = fence[1].trim();
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["pdf", "docx"].includes(ext)) {
        toast({ title: "Unsupported file type", description: "Please upload a .pdf or .docx file.", variant: "destructive" });
        return;
      }

      setFileName(file.name);
      setResult(null);
      setLoading(true);

      try {
        let contractText = "";

        if (ext === "docx") {
          setLoadingStage("Extracting text from DOCX...");
          contractText = await extractDocx(file);
        } else {
          // PDF: read as base64 and send to AI router which handles extraction
          setLoadingStage("Reading PDF...");
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          contractText = `[PDF_BASE64:${base64.substring(0, 500)}...] (PDF file — extract and analyze text from this contract)`;
        }

        if (!contractText.trim()) {
          throw new Error("Could not extract text from the file. The file may be image-based or protected.");
        }

        setLoadingStage("Analyzing contract with AI...");

        const { data, error } = await supabase.functions.invoke("ai-router", {
          body: {
            agent: "contract_intelligence",
            prompt: `Analyze this contract and identify red flags. For each clause, rate severity as: CRITICAL (deal-breaker), WARNING (negotiate), or INFO (acceptable but note).

Look specifically for:
- Perpetual or unlimited usage rights
- IP or likeness grabs beyond the campaign
- One-sided non-compete clauses
- Vague or unlimited deliverables
- No kill fee or termination clause
- Unlimited revision requests
- Missing FTC/ASA disclosure requirements
- Payment terms over 60 days
- Automatic renewal without notice

Contract text:
${contractText}

Return JSON: { clauses: [{ text, severity, explanation, recommendation }], overall_risk_score, summary }`,
          },
        });

        if (error) throw new Error(error.message || "AI router error");

        // The function may return data in different shapes
        const rawContent =
          data?.result ?? data?.content ?? data?.response ?? data?.analysis ?? data;

        const parsed = parseAiJson(rawContent);

        if (!parsed || !Array.isArray(parsed.clauses)) {
          throw new Error("AI returned an unexpected response format.");
        }

        setResult(parsed);
        toast({ title: "Analysis complete", description: `Found ${parsed.clauses.length} clause(s) to review.` });
      } catch (err) {
        toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingStage("");
      }
    },
    [extractDocx, toast]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setResult(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Organise clauses by severity order
  const clauses = result?.clauses ?? [];
  const criticals = clauses.filter((c) => c.severity === "CRITICAL");
  const warnings = clauses.filter((c) => c.severity === "WARNING");
  const infos = clauses.filter((c) => c.severity === "INFO");
  const ordered = [...criticals, ...warnings, ...infos];

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Scan className="w-4 h-4 text-slate-400" />
          Contract Red Flag Scanner
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-colors p-6 text-center cursor-pointer
              ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}
            `}
            onClick={() => !loading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />

            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm font-medium text-slate-600">{loadingStage || "Processing..."}</p>
                <p className="text-xs text-slate-400">This may take up to 30 seconds</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {fileName ? fileName : "Drop a contract here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports .pdf and .docx files</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 mt-1"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  disabled={loading}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Top bar: filename + reset */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">{fileName}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 flex-shrink-0"
                onClick={handleReset}
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                New Scan
              </Button>
            </div>

            {/* Severity summary counts */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Critical", count: criticals.length, cls: "bg-red-50 border-red-200 text-red-700" },
                { label: "Warning", count: warnings.length, cls: "bg-amber-50 border-amber-200 text-amber-700" },
                { label: "Info", count: infos.length, cls: "bg-blue-50 border-blue-200 text-blue-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg border p-2 text-center ${s.cls}`}>
                  <p className="text-xl font-bold">{s.count}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Risk gauge */}
            <RiskGauge score={result.overall_risk_score} />

            {/* Summary */}
            {result.summary && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1">
                  AI Summary
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{result.summary}</p>
              </div>
            )}

            {/* Clause cards */}
            {ordered.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Flagged Clauses ({ordered.length})
                </p>
                {ordered.map((clause, idx) => (
                  <ClauseCard key={idx} clause={clause} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <ShieldCheck className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium text-green-700">No red flags found</p>
                <p className="text-xs text-slate-400">This contract appears clean based on the AI analysis.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

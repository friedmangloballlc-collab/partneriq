import React, { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import mammoth from "mammoth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  FileText,
  Mail,
  TableProperties,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
  Link,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const DB_FIELDS = [
  { key: "title", label: "Title" },
  { key: "brand_name", label: "Brand Name" },
  { key: "talent_name", label: "Talent Name" },
  { key: "platform", label: "Platform" },
  { key: "deal_type", label: "Deal Type" },
  { key: "deal_value", label: "Deal Value" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
  { key: "start_date", label: "Start Date" },
  { key: "end_date", label: "End Date" },
  { key: "deliverables", label: "Deliverables" },
  { key: "notes", label: "Notes" },
  { key: "__skip__", label: "-- Skip this column --" },
];

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter/X",
  "LinkedIn",
  "Twitch",
  "Podcast",
  "Blog",
  "Multi-Platform",
  "Other",
];

const DEAL_TYPES = [
  "Sponsored Post",
  "Brand Ambassador",
  "Affiliate",
  "UGC",
  "Gifted",
  "Event",
  "Influencer Marketing",
  "Brand Sponsorship",
  "Content Production",
  "Performance",
  "Other",
];

const STATUSES = ["completed", "active", "negotiating", "planned", "cancelled"];

const QUERY_KEY_MAP = {
  talent_deals: "data-room-talent",
  brand_campaigns: "data-room-brand",
  agency_engagements: "data-room-agency",
};

const ENTRY_TYPE_MAP = {
  talent_deals: "deal",
  brand_campaigns: "campaign",
  agency_engagements: "engagement",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function guessMapping(csvHeaders) {
  const map = {};
  const normalized = csvHeaders.map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));
  normalized.forEach((h, idx) => {
    const header = csvHeaders[idx];
    if (h.includes("title") || h.includes("name") && h.includes("deal"))
      map[header] = "title";
    else if (h.includes("brand")) map[header] = "brand_name";
    else if (h.includes("talent") || h.includes("creator") || h.includes("influencer"))
      map[header] = "talent_name";
    else if (h.includes("platform") || h.includes("channel")) map[header] = "platform";
    else if (
      h.includes("type") ||
      h.includes("campaign") ||
      h.includes("dealtype")
    )
      map[header] = "deal_type";
    else if (
      h.includes("value") ||
      h.includes("amount") ||
      h.includes("budget") ||
      h.includes("fee") ||
      h.includes("price")
    )
      map[header] = "deal_value";
    else if (h.includes("currency")) map[header] = "currency";
    else if (h.includes("status")) map[header] = "status";
    else if (h.includes("start") || h.includes("from")) map[header] = "start_date";
    else if (h.includes("end") || h.includes("to") || h.includes("expir"))
      map[header] = "end_date";
    else if (h.includes("deliverable") || h.includes("scope"))
      map[header] = "deliverables";
    else if (h.includes("note") || h.includes("comment") || h.includes("description"))
      map[header] = "notes";
    else map[header] = "__skip__";
  });
  return map;
}

function buildEntryFromMapped(row, mapping, roomType) {
  const entry = {
    room_type: roomType,
    entry_type: ENTRY_TYPE_MAP[roomType] || "deal",
    currency: "USD",
  };
  Object.entries(mapping).forEach(([csvCol, dbField]) => {
    if (dbField === "__skip__" || !dbField) return;
    const raw = row[csvCol];
    if (raw === undefined || raw === null || raw === "") return;
    if (dbField === "deal_value") {
      const num = parseFloat(String(raw).replace(/[$,]/g, ""));
      entry.deal_value = isNaN(num) ? 0 : num;
    } else {
      entry[dbField] = String(raw).trim();
    }
  });
  return entry;
}

function buildEmptyManualRow() {
  return {
    _id: Math.random().toString(36).slice(2),
    title: "",
    brand_name: "",
    talent_name: "",
    platform: "",
    deal_type: "",
    deal_value: "",
    status: "completed",
    start_date: "",
  };
}

// ── CSV Tab ───────────────────────────────────────────────────────────────────

function CSVTab({ roomType, onImportSuccess }) {
  const { user } = useAuth();
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);
  const { toast } = useToast();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedHeaders = result.meta.fields || [];
        setHeaders(parsedHeaders);
        setRows(result.data);
        setMapping(guessMapping(parsedHeaders));
      },
      error: (err) => {
        setErrors([`CSV parse error: ${err.message}`]);
      },
    });
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setIsImporting(true);
    setErrors([]);
    const failed = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      setProgress(Math.round(((i + 1) / rows.length) * 100));
      try {
        const entry = buildEntryFromMapped(rows[i], mapping, roomType);
        if (user?.email) entry.user_email = user.email;
        const { error } = await supabase.from("data_room_entries").insert(entry);
        if (error) throw error;
        imported++;
      } catch (err) {
        failed.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    setIsImporting(false);
    setProgress(0);

    if (failed.length) setErrors(failed.slice(0, 5));

    if (imported > 0) {
      toast({
        title: `Imported ${imported} entr${imported === 1 ? "y" : "ies"}`,
        description: failed.length
          ? `${failed.length} row(s) failed — check errors below`
          : "All rows imported successfully",
      });
      onImportSuccess();
    }
  };

  return (
    <div className="space-y-4">
      {/* file picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors"
      >
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          {fileName || "Click to upload a CSV file"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports any CSV with headers
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* column mapping */}
      {headers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Map CSV Columns ({rows.length} rows detected)
            </h3>
            <Badge variant="secondary" className="text-xs">
              {rows.length} row{rows.length !== 1 ? "s" : ""} to import
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {headers.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <span
                  className="text-xs text-slate-500 font-mono truncate flex-1 min-w-0 bg-slate-50 rounded px-2 py-1"
                  title={h}
                >
                  {h}
                </span>
                <Select
                  value={mapping[h] || "__skip__"}
                  onValueChange={(v) => setMapping((prev) => ({ ...prev, [h]: v }))}
                >
                  <SelectTrigger className="h-7 text-xs w-40 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DB_FIELDS.map((f) => (
                      <SelectItem key={f.key} value={f.key} className="text-xs">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* preview */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Preview (first 5 rows)
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {headers.slice(0, 6).map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-slate-500 truncate max-w-[120px]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {headers.slice(0, 6).map((h) => (
                        <td
                          key={h}
                          className="px-3 py-1.5 text-slate-600 truncate max-w-[120px]"
                        >
                          {row[h] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* progress */}
      {isImporting && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Importing...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* action */}
      {rows.length > 0 && (
        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isImporting ? `Importing... ${progress}%` : `Import ${rows.length} Row${rows.length !== 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  );
}

// ── PDF/DOCX Tab ──────────────────────────────────────────────────────────────

function DocTab({ roomType, onImportSuccess }) {
  const { user } = useAuth();
  const [extractedEntries, setExtractedEntries] = useState([]);
  const [editedEntries, setEditedEntries] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const { toast } = useToast();

  const extractTextFromFile = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (ext === "pdf") {
      // For PDFs: read as data URL and send the raw base64 content
      // We send the first ~8000 chars of metadata + filename as context
      return `[PDF Document: ${file.name}]\n[File size: ${Math.round(file.size / 1024)}KB]\n\nNote: Please extract any deal, campaign, or partnership information visible in the document named "${file.name}". If you cannot read the content directly, return an empty array.`;
    }

    return "";
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setExtractedEntries([]);
    setEditedEntries([]);
    setIsExtracting(true);

    try {
      const textContent = await extractTextFromFile(file);

      const { data, error: fnError } = await supabase.functions.invoke("ai-router", {
        body: {
          agent: "data_extractor",
          prompt:
            "Extract all deal, campaign, or partnership information from this document. Return ONLY a valid JSON array (no markdown, no explanation) with objects containing these fields: title, brand_name, talent_name, platform, deal_type, deal_value (number), deliverables, start_date (YYYY-MM-DD or empty), end_date (YYYY-MM-DD or empty), status, notes. Extract every deal or campaign mentioned. If none found, return [].",
          context: textContent.slice(0, 12000),
        },
      });

      if (fnError) throw new Error(fnError.message || "AI extraction failed");

      // Try to parse the response
      let parsed = [];
      const responseText = data?.response || data?.content || data?.text || "";
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else if (Array.isArray(data)) {
        parsed = data;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError(
          "No entries could be extracted from this document. The AI may not have found any deal or campaign data."
        );
      } else {
        setExtractedEntries(parsed);
        setEditedEntries(parsed.map((e, i) => ({ ...e, _id: i })));
      }
    } catch (err) {
      setError(`Extraction failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateEditedEntry = (id, field, value) => {
    setEditedEntries((prev) =>
      prev.map((e) => (e._id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEntry = (id) => {
    setEditedEntries((prev) => prev.filter((e) => e._id !== id));
  };

  const handleImport = async () => {
    if (!editedEntries.length) return;
    setIsImporting(true);
    let imported = 0;
    const failed = [];

    for (const entry of editedEntries) {
      try {
        const { _id, ...rest } = entry;
        const payload = {
          ...rest,
          room_type: roomType,
          entry_type: ENTRY_TYPE_MAP[roomType] || "deal",
          deal_value: parseFloat(rest.deal_value) || 0,
          user_email: user?.email || null,
        };
        const { error } = await supabase.from("data_room_entries").insert(payload);
        if (error) throw error;
        imported++;
      } catch (err) {
        failed.push(err.message);
      }
    }

    setIsImporting(false);
    if (imported > 0) {
      toast({
        title: `Imported ${imported} entr${imported === 1 ? "y" : "ies"}`,
        description: "AI-extracted entries added to your data room",
      });
      onImportSuccess();
    }
    if (failed.length) {
      setError(`${failed.length} entr${failed.length === 1 ? "y" : "ies"} failed to import`);
    }
  };

  return (
    <div className="space-y-4">
      {/* file picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors"
      >
        <div className="flex justify-center gap-3 mb-2">
          <FileText className="w-7 h-7 text-rose-400" />
          <FileText className="w-7 h-7 text-blue-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {fileName || "Click to upload a PDF or DOCX file"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          AI will extract all deal and campaign information automatically
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* extraction status */}
      {isExtracting && (
        <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
          <Sparkles className="w-5 h-5 text-violet-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-700">
              AI is extracting deal data...
            </p>
            <p className="text-xs text-violet-500 mt-0.5">
              Analyzing document content
            </p>
          </div>
        </div>
      )}

      {/* error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* extracted entries preview/edit table */}
      {editedEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700">
                {editedEntries.length} entr{editedEntries.length !== 1 ? "ies" : "y"} extracted — edit before importing
              </h3>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {editedEntries.map((entry) => (
              <div
                key={entry._id}
                className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Entry {entry._id + 1}
                  </span>
                  <button
                    onClick={() => removeEntry(entry._id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { field: "title", label: "Title", type: "text" },
                    { field: "brand_name", label: "Brand", type: "text" },
                    { field: "talent_name", label: "Talent", type: "text" },
                    { field: "deal_value", label: "Value ($)", type: "number" },
                    { field: "start_date", label: "Start Date", type: "date" },
                    { field: "end_date", label: "End Date", type: "date" },
                  ].map(({ field, label, type }) => (
                    <div key={field}>
                      <Label className="text-xs text-slate-500">{label}</Label>
                      <Input
                        type={type}
                        value={entry[field] || ""}
                        onChange={(e) => updateEditedEntry(entry._id, field, e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-slate-500">Platform</Label>
                    <Select
                      value={entry.platform || ""}
                      onValueChange={(v) => updateEditedEntry(entry._id, "platform", v)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Deal Type</Label>
                    <Select
                      value={entry.deal_type || ""}
                      onValueChange={(v) => updateEditedEntry(entry._id, "deal_type", v)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Status</Label>
                    <Select
                      value={entry.status || "completed"}
                      onValueChange={(v) => updateEditedEntry(entry._id, "status", v)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-xs text-slate-500 italic truncate">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isImporting
              ? "Importing..."
              : `Import ${editedEntries.length} Entr${editedEntries.length !== 1 ? "ies" : "y"}`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Manual Bulk Entry Tab ─────────────────────────────────────────────────────

function ManualTab({ roomType, onImportSuccess }) {
  const { user } = useAuth();
  const [rows, setRows] = useState(() => Array.from({ length: 5 }, buildEmptyManualRow));
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, buildEmptyManualRow()]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r._id !== id));
  };

  const handleImport = async () => {
    const validRows = rows.filter(
      (r) => r.title.trim() || r.brand_name.trim() || r.talent_name.trim()
    );
    if (!validRows.length) {
      toast({ title: "No data to import", description: "Fill in at least one row" });
      return;
    }

    setIsImporting(true);
    let imported = 0;

    for (let i = 0; i < validRows.length; i++) {
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
      try {
        const { _id, ...rest } = validRows[i];
        const payload = {
          ...rest,
          deal_value: parseFloat(rest.deal_value) || 0,
          room_type: roomType,
          entry_type: ENTRY_TYPE_MAP[roomType] || "deal",
          user_email: user?.email || null,
        };
        const { error } = await supabase.from("data_room_entries").insert(payload);
        if (error) throw error;
        imported++;
      } catch (_err) {
        // silent per-row failure
      }
    }

    setIsImporting(false);
    setProgress(0);

    if (imported > 0) {
      toast({
        title: `Imported ${imported} entr${imported === 1 ? "y" : "ies"}`,
        description: "Bulk entries added to your data room",
      });
      setRows(Array.from({ length: 5 }, buildEmptyManualRow));
      onImportSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Enter multiple entries directly — fill in a row and click "Add Row" for more.
        Rows with no title, brand, or talent name will be skipped.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Title", "Brand / Talent", "Platform", "Deal Type", "Value ($)", "Status", "Start Date", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-2 py-2 text-left font-semibold text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-b border-slate-100">
                <td className="px-1 py-1">
                  <Input
                    value={row.title}
                    onChange={(e) => updateRow(row._id, "title", e.target.value)}
                    placeholder="Deal title"
                    className="h-7 text-xs min-w-[110px]"
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    value={row.brand_name}
                    onChange={(e) => updateRow(row._id, "brand_name", e.target.value)}
                    placeholder="Brand name"
                    className="h-7 text-xs min-w-[100px]"
                  />
                </td>
                <td className="px-1 py-1">
                  <Select
                    value={row.platform}
                    onValueChange={(v) => updateRow(row._id, "platform", v)}
                  >
                    <SelectTrigger className="h-7 text-xs w-[110px]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1">
                  <Select
                    value={row.deal_type}
                    onValueChange={(v) => updateRow(row._id, "deal_type", v)}
                  >
                    <SelectTrigger className="h-7 text-xs w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="number"
                    value={row.deal_value}
                    onChange={(e) => updateRow(row._id, "deal_value", e.target.value)}
                    placeholder="0"
                    className="h-7 text-xs w-20"
                  />
                </td>
                <td className="px-1 py-1">
                  <Select
                    value={row.status}
                    onValueChange={(v) => updateRow(row._id, "status", v)}
                  >
                    <SelectTrigger className="h-7 text-xs w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="date"
                    value={row.start_date}
                    onChange={(e) => updateRow(row._id, "start_date", e.target.value)}
                    className="h-7 text-xs w-[120px]"
                  />
                </td>
                <td className="px-1 py-1">
                  <button
                    onClick={() => removeRow(row._id)}
                    className="text-slate-300 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Row
        </Button>
        <span className="text-xs text-slate-400">{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
      </div>

      {isImporting && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Importing...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Button
        onClick={handleImport}
        disabled={isImporting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isImporting ? `Importing... ${progress}%` : "Import All"}
      </Button>
    </div>
  );
}

// ── Email Tab (placeholder) ───────────────────────────────────────────────────

function EmailTab() {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50 to-blue-50/40">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Email Import
              </h3>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Connect your email to automatically scan for sponsorship deals,
                campaign briefs, and partnership contracts. AI will extract key
                deal terms from relevant threads.
              </p>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm border-slate-300"
                onClick={() => (window.location.href = "/Settings")}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="#4285F4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="22,6 12,13 2,6"
                    stroke="#4285F4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Connect Gmail
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm border-slate-300"
                onClick={() => (window.location.href = "/Settings")}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    stroke="#0078D4"
                    strokeWidth="2"
                  />
                  <path d="M12 12L2 6" stroke="#0078D4" strokeWidth="1.5" />
                  <path d="M12 12L22 6" stroke="#0078D4" strokeWidth="1.5" />
                </svg>
                Connect Outlook
              </Button>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400 max-w-sm text-left bg-white/70 rounded-xl px-4 py-3 border border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-600">Coming soon</strong> — AI will
                scan your email for deal-related threads and extract key terms
                automatically: brand names, budgets, deliverables, and timelines.
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link className="w-3 h-3" />
              <span>
                Manage email connections in{" "}
                <a
                  href="/Settings"
                  className="text-indigo-500 hover:underline font-medium"
                >
                  Settings
                </a>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main DataRoomImporter Component ───────────────────────────────────────────

const ROOM_TYPE_CONFIG = {
  talent_deals: {
    accent: "indigo",
    label: "Talent Deals",
    triggerClass: "bg-indigo-600 hover:bg-indigo-700",
  },
  brand_campaigns: {
    accent: "violet",
    label: "Brand Campaigns",
    triggerClass: "bg-violet-600 hover:bg-violet-700",
  },
  agency_engagements: {
    accent: "teal",
    label: "Agency Engagements",
    triggerClass: "bg-teal-600 hover:bg-teal-700",
  },
};

export default function DataRoomImporter({ roomType }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("csv");
  const config = ROOM_TYPE_CONFIG[roomType] || ROOM_TYPE_CONFIG.talent_deals;
  const queryKey = QUERY_KEY_MAP[roomType];

  const handleImportSuccess = useCallback(() => {
    if (queryKey) {
      qc.invalidateQueries({ queryKey: [queryKey] });
    }
    // Invalidate all data room queries to be safe
    qc.invalidateQueries({ queryKey: ["data-room-talent"] });
    qc.invalidateQueries({ queryKey: ["data-room-brand"] });
    qc.invalidateQueries({ queryKey: ["data-room-agency"] });
  }, [qc, queryKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-slate-300 hover:border-slate-400 text-slate-700"
        >
          <Download className="w-4 h-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Download className="w-5 h-5 text-slate-500" />
            Import {config.label}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-4 w-full bg-slate-100/70">
            <TabsTrigger value="csv" className="gap-1.5 text-xs sm:text-sm">
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
              <span className="sm:hidden">CSV</span>
            </TabsTrigger>
            <TabsTrigger value="doc" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF / DOCX</span>
              <span className="sm:hidden">Doc</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5 text-xs sm:text-sm">
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bulk Entry</span>
              <span className="sm:hidden">Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
              <span className="sm:hidden">Email</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="csv">
              <CSVTab roomType={roomType} onImportSuccess={handleImportSuccess} />
            </TabsContent>
            <TabsContent value="doc">
              <DocTab roomType={roomType} onImportSuccess={handleImportSuccess} />
            </TabsContent>
            <TabsContent value="manual">
              <ManualTab roomType={roomType} onImportSuccess={handleImportSuccess} />
            </TabsContent>
            <TabsContent value="email">
              <EmailTab />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * AdminDataManager.jsx
 *
 * Admin-only CRUD management panel for Brands, Contacts, and Deals.
 * Data added here is visible platform-wide to all users.
 * Queries Supabase directly for full control.
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import Papa from "papaparse";
import {
  Database, Plus, Pencil, Trash2, Search, Upload, Download,
  ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Building2,
  Users, Handshake, X, Check, AlertTriangle, FileText, ArrowUpDown,
  RefreshCw, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const DEAL_STATUSES = [
  "discovered", "researching", "pending", "sent", "responded",
  "negotiating", "contracted", "active",
];

const PARTNERSHIP_TYPES = [
  "sponsorship", "ambassador", "content_collab", "affiliate",
  "licensing", "co_branding", "event", "other",
];

const INDUSTRIES = [
  "Technology", "Consumer Goods", "Fashion & Apparel", "Food & Beverage",
  "Health & Wellness", "Finance", "Entertainment", "Sports", "Travel",
  "Automotive", "Beauty & Cosmetics", "Gaming", "Education", "Media",
  "Retail", "Real Estate", "Other",
];

const TIERS = [
  { value: "1", label: "Tier 1 – Contact First" },
  { value: "2", label: "Tier 2 – Follow Up" },
  { value: "3", label: "Tier 3 – CC / Warm Intro" },
  { value: "4", label: "Tier 4 – Reference Only" },
];

const SOURCES = [
  "LinkedIn", "Company Website", "Crunchbase", "Manual Entry", "CSV Import", "Other",
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function downloadCSV(data, filename) {
  if (!data.length) return;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fmt(value) {
  if (value === null || value === undefined) return "—";
  return String(value);
}

function fmtMoney(value) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(value);
}

// ─── Sort hook ────────────────────────────────────────────────────────────────

function useSortedData(data, defaultKey) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = useCallback((key) => {
    setSortDir(prev => (sortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortKey(key);
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, handleSort };
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 ml-1 text-slate-400 inline" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 ml-1 text-indigo-500 inline" />
    : <ChevronDown className="w-3 h-3 ml-1 text-indigo-500 inline" />;
}

// ─── Th (sortable header cell) ────────────────────────────────────────────────

function Th({ col, label, sortKey, sortDir, onSort, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-900 select-none ${className}`}
      onClick={() => onSort(col)}
    >
      {label}
      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );
}

// ─── Loading skeleton rows ────────────────────────────────────────────────────

function SkeletonRows({ cols, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  ));
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, cta, onCta }) {
  return (
    <tr>
      <td colSpan={99}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
          {cta && (
            <Button size="sm" className="mt-3" onClick={onCta}>
              <Plus className="w-4 h-4 mr-1" /> {cta}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ total, page, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = i + 1;
          return (
            <Button
              key={p} variant={page === p ? "default" : "outline"} size="sm"
              onClick={() => onPage(p)}
              className="w-8 h-8 p-0"
            >
              {p}
            </Button>
          );
        })}
        {totalPages > 7 && page < totalPages && (
          <Button variant="outline" size="sm" onClick={() => onPage(totalPages)}>
            {totalPages}
          </Button>
        )}
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── FormField helper ─────────────────────────────────────────────────────────

function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── DeleteConfirm dialog ─────────────────────────────────────────────────────

function DeleteConfirm({ open, onClose, onConfirm, itemName, loading }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete {itemName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This record will be permanently removed from the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── CSV Import Component ─────────────────────────────────────────────────────

function CsvImport({ onImport, expectedFields, loading }) {
  const [parsedRows, setParsedRows] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParseError(null);
    setParsedRows(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setParseError(results.errors[0].message);
          return;
        }
        setParsedRows(results.data);
      },
      error: (err) => setParseError(err.message),
    });
  };

  const handleImport = async () => {
    if (!parsedRows?.length) return;
    setImporting(true);
    setProgress(0);
    try {
      const chunkSize = 10;
      for (let i = 0; i < parsedRows.length; i += chunkSize) {
        const chunk = parsedRows.slice(i, i + chunkSize);
        await onImport(chunk);
        setProgress(Math.round(((i + chunkSize) / parsedRows.length) * 100));
      }
      toast({ title: `Imported ${parsedRows.length} rows successfully.` });
      setParsedRows(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setParsedRows(null);
    setParseError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-600">CSV Bulk Import</span>
        {expectedFields && (
          <span className="text-[10px] text-slate-400 ml-auto">
            Expected columns: {expectedFields.join(", ")}
          </span>
        )}
      </div>

      {!parsedRows ? (
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">
              <Check className="w-3.5 h-3.5 inline mr-1" />
              {parsedRows.length} rows parsed
            </span>
            <Button variant="ghost" size="sm" onClick={reset} className="h-6 text-xs px-2">
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="text-[11px] w-full">
              <thead className="bg-slate-50">
                <tr>
                  {Object.keys(parsedRows[0]).map(k => (
                    <th key={k} className="px-2 py-1.5 text-left font-semibold text-slate-500 whitespace-nowrap">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-2 py-1.5 text-slate-600 truncate max-w-[120px]">
                        {fmt(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 5 && (
              <p className="text-[10px] text-slate-400 px-2 py-1.5 text-center border-t border-slate-100">
                + {parsedRows.length - 5} more rows
              </p>
            )}
          </div>

          {importing && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-slate-500 text-right">{progress}% complete</p>
            </div>
          )}

          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing || loading}
            className="w-full"
          >
            {importing
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Importing…</>
              : <><Upload className="w-3.5 h-3.5 mr-2" /> Import {parsedRows.length} rows</>
            }
          </Button>
        </div>
      )}

      {parseError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> {parseError}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: BRANDS
// ══════════════════════════════════════════════════════════════════════════════

const BRAND_EMPTY = {
  name: "", industry: "", domain: "", location: "",
  annual_budget: "", contact_email: "", description: "",
};

function BrandsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [form, setForm] = useState(BRAND_EMPTY);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { sorted, sortKey, sortDir, handleSort } = useSortedData(brands, "name");

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(b =>
      [b.name, b.industry, b.domain, b.location, b.contact_email]
        .some(v => String(v ?? "").toLowerCase().includes(q))
    );
  }, [sorted, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const upsertMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        annual_budget: values.annual_budget ? Number(values.annual_budget) : null,
      };
      if (editRow?.id) {
        const { error } = await supabase.from("brands").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brands").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
      toast({ title: editRow ? "Brand updated." : "Brand added." });
      closeDialog();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
      toast({ title: "Brand deleted." });
      setDeleteRow(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async (rows) => {
      const payload = rows.map(r => ({
        name: r.name || r.Name || "",
        industry: r.industry || r.Industry || "",
        domain: r.domain || r.Domain || "",
        location: r.location || r.Location || "",
        annual_budget: r.annual_budget ? Number(r.annual_budget) : null,
        contact_email: r.contact_email || r.Email || "",
        description: r.description || r.Description || "",
      }));
      const { error } = await supabase.from("brands").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  function openAdd() {
    setEditRow(null);
    setForm(BRAND_EMPTY);
    setDialogOpen(true);
  }

  function openEdit(row) {
    setEditRow(row);
    setForm({
      name: row.name ?? "",
      industry: row.industry ?? "",
      domain: row.domain ?? "",
      location: row.location ?? "",
      annual_budget: row.annual_budget ?? "",
      contact_email: row.contact_email ?? "",
      description: row.description ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditRow(null);
    setForm(BRAND_EMPTY);
  }

  function setField(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Brand name is required.", variant: "destructive" });
      return;
    }
    upsertMutation.mutate(form);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search brands…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered, "brands.csv")}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Brand
          </Button>
        </div>
      </div>

      {/* CSV Import */}
      <CsvImport
        onImport={importMutation.mutateAsync}
        loading={importMutation.isPending}
        expectedFields={["name", "industry", "domain", "location", "annual_budget", "contact_email", "description"]}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th col="name" label="Name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="industry" label="Industry" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="domain" label="Domain" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="location" label="Location" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="annual_budget" label="Annual Budget" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="contact_email" label="Contact Email" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <SkeletonRows cols={8} />
              ) : paginated.length === 0 ? (
                <EmptyState icon={Building2} title="No brands yet." cta="Add your first brand" onCta={openAdd} />
              ) : (
                paginated.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{fmt(row.name)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(row.industry)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.domain
                        ? <a href={`https://${row.domain}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{row.domain}</a>
                        : "—"
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmt(row.location)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtMoney(row.annual_budget)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(row.contact_email)}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{fmt(row.description)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteRow(row)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onPage={setPage} />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRow ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <FormField label="Brand Name" required>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Nike" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Industry">
                <Select value={form.industry} onValueChange={v => setField("industry", v)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Location">
                <Input value={form.location} onChange={e => setField("location", e.target.value)} placeholder="e.g. New York, NY" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Domain" hint="Without https://">
                <Input value={form.domain} onChange={e => setField("domain", e.target.value)} placeholder="example.com" />
              </FormField>
              <FormField label="Annual Budget ($)">
                <Input
                  type="number"
                  value={form.annual_budget}
                  onChange={e => setField("annual_budget", e.target.value)}
                  placeholder="500000"
                />
              </FormField>
            </div>
            <FormField label="Contact Email">
              <Input type="email" value={form.contact_email} onChange={e => setField("contact_email", e.target.value)} placeholder="partnerships@brand.com" />
            </FormField>
            <FormField label="Description">
              <Textarea value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Brief overview of this brand…" rows={3} />
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editRow ? "Save Changes" : "Add Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirm
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => deleteRow && deleteMutation.mutate(deleteRow.id)}
        itemName={deleteRow?.name ?? "brand"}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: CONTACTS / DECISION MAKERS
// ══════════════════════════════════════════════════════════════════════════════

const CONTACT_EMPTY = {
  full_name: "", role_title: "", role_tier: "", brand_name: "", brand_id: "",
  email: "", email_confidence: "", linkedin_url: "", phone: "", source: "",
};

function ContactsTab({ brands }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [form, setForm] = useState(CONTACT_EMPTY);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandDropOpen, setBrandDropOpen] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decision_makers")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { sorted, sortKey, sortDir, handleSort } = useSortedData(contacts, "full_name");

  const filtered = useMemo(() => {
    let rows = sorted;
    if (filterTier !== "all") rows = rows.filter(r => String(r.role_tier) === filterTier);
    if (filterBrand !== "all") rows = rows.filter(r => r.brand_name === filterBrand);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        [r.full_name, r.role_title, r.brand_name, r.email, r.source]
          .some(v => String(v ?? "").toLowerCase().includes(q))
      );
    }
    return rows;
  }, [sorted, search, filterTier, filterBrand]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique brands for filter
  const uniqueBrands = useMemo(() => {
    const set = new Set(contacts.map(c => c.brand_name).filter(Boolean));
    return Array.from(set).sort();
  }, [contacts]);

  // Brand autocomplete
  const filteredBrandOptions = useMemo(() => {
    if (!brandSearch.trim()) return brands.slice(0, 20);
    return brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).slice(0, 20);
  }, [brands, brandSearch]);

  const upsertMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        full_name: values.full_name,
        role_title: values.role_title,
        role_tier: values.role_tier ? Number(values.role_tier) : null,
        brand_name: values.brand_name,
        email: values.email,
        email_confidence: values.email_confidence ? Number(values.email_confidence) : null,
        linkedin_url: values.linkedin_url,
        phone: values.phone,
        source: values.source,
      };
      if (editRow?.id) {
        const { error } = await supabase.from("decision_makers").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("decision_makers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
      qc.invalidateQueries({ queryKey: ["decision_makers"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: editRow ? "Contact updated." : "Contact added." });
      closeDialog();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("decision_makers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Contact deleted." });
      setDeleteRow(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async (rows) => {
      const payload = rows.map(r => ({
        full_name: r.full_name || r["Full Name"] || "",
        role_title: r.role_title || r["Role Title"] || "",
        role_tier: r.role_tier ? Number(r.role_tier) : null,
        brand_name: r.brand_name || r["Brand Name"] || "",
        email: r.email || r.Email || "",
        email_confidence: r.email_confidence ? Number(r.email_confidence) : null,
        linkedin_url: r.linkedin_url || r.LinkedIn || "",
        phone: r.phone || r.Phone || "",
        source: r.source || r.Source || "",
      }));
      const { error } = await supabase.from("decision_makers").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  function openAdd() {
    setEditRow(null);
    setForm(CONTACT_EMPTY);
    setBrandSearch("");
    setDialogOpen(true);
  }

  function openEdit(row) {
    setEditRow(row);
    setForm({
      full_name: row.full_name ?? "",
      role_title: row.role_title ?? "",
      role_tier: row.role_tier ? String(row.role_tier) : "",
      brand_name: row.brand_name ?? "",
      email: row.email ?? "",
      email_confidence: row.email_confidence ?? "",
      linkedin_url: row.linkedin_url ?? "",
      phone: row.phone ?? "",
      source: row.source ?? "",
    });
    setBrandSearch(row.brand_name ?? "");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditRow(null);
    setForm(CONTACT_EMPTY);
    setBrandSearch("");
    setBrandDropOpen(false);
  }

  function setField(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast({ title: "Full name is required.", variant: "destructive" });
      return;
    }
    upsertMutation.mutate(form);
  }

  const tierConfig = {
    1: "bg-emerald-100 text-emerald-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-amber-100 text-amber-700",
    4: "bg-slate-100 text-slate-600",
  };

  function confidenceColor(pct) {
    if (!pct) return "text-slate-400";
    if (pct >= 80) return "text-emerald-600";
    if (pct >= 50) return "text-amber-600";
    return "text-red-500";
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search contacts…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Tier filter */}
          <Select value={filterTier} onValueChange={v => { setFilterTier(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Brand filter */}
          <Select value={filterBrand} onValueChange={v => { setFilterBrand(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {uniqueBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered, "contacts.csv")}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Contact
          </Button>
        </div>
      </div>

      {/* CSV Import */}
      <CsvImport
        onImport={importMutation.mutateAsync}
        loading={importMutation.isPending}
        expectedFields={["full_name", "role_title", "role_tier", "brand_name", "email", "email_confidence", "linkedin_url", "phone", "source"]}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th col="full_name" label="Full Name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="role_title" label="Role" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="role_tier" label="Tier" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="brand_name" label="Brand" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="email" label="Email" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="email_confidence" label="Confidence" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">LinkedIn</th>
                <Th col="phone" label="Phone" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="source" label="Source" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <SkeletonRows cols={10} />
              ) : paginated.length === 0 ? (
                <EmptyState icon={Users} title="No contacts yet." cta="Add your first contact" onCta={openAdd} />
              ) : (
                paginated.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{fmt(row.full_name)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{fmt(row.role_title)}</td>
                    <td className="px-4 py-3">
                      {row.role_tier ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${tierConfig[row.role_tier] || "bg-slate-100 text-slate-600"}`}>
                          T{row.role_tier}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(row.brand_name)}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{fmt(row.email)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${confidenceColor(row.email_confidence)}`}>
                      {row.email_confidence != null ? `${row.email_confidence}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.linkedin_url
                        ? <a href={row.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">View</a>
                        : "—"
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmt(row.phone)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmt(row.source)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteRow(row)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onPage={setPage} />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRow ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Full Name" required>
                <Input value={form.full_name} onChange={e => setField("full_name", e.target.value)} placeholder="Jane Smith" />
              </FormField>
              <FormField label="Role Title">
                <Input value={form.role_title} onChange={e => setField("role_title", e.target.value)} placeholder="Head of Partnerships" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tier">
                <Select value={form.role_tier} onValueChange={v => setField("role_tier", v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Brand Name" hint="Type to search">
                <div className="relative">
                  <Input
                    value={brandSearch}
                    onChange={e => {
                      setBrandSearch(e.target.value);
                      setField("brand_name", e.target.value);
                      setBrandDropOpen(true);
                    }}
                    onFocus={() => setBrandDropOpen(true)}
                    placeholder="Search brand…"
                    autoComplete="off"
                  />
                  {brandDropOpen && filteredBrandOptions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredBrandOptions.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            setField("brand_name", b.name);
                            setBrandSearch(b.name);
                            setBrandDropOpen(false);
                          }}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Email">
                <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="jane@brand.com" />
              </FormField>
              <FormField label="Email Confidence %" hint="0–100">
                <Input
                  type="number" min="0" max="100"
                  value={form.email_confidence}
                  onChange={e => setField("email_confidence", e.target.value)}
                  placeholder="85"
                />
              </FormField>
            </div>
            <FormField label="LinkedIn URL">
              <Input value={form.linkedin_url} onChange={e => setField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/janesmith" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone">
                <Input value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </FormField>
              <FormField label="Source">
                <Select value={form.source} onValueChange={v => setField("source", v)}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editRow ? "Save Changes" : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirm
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => deleteRow && deleteMutation.mutate(deleteRow.id)}
        itemName={deleteRow?.full_name ?? "contact"}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: DEALS / PARTNERSHIPS
// ══════════════════════════════════════════════════════════════════════════════

const DEAL_EMPTY = {
  title: "", brand_name: "", talent_name: "", deal_value: "", status: "",
  partnership_type: "", match_score: "", stage: "", notes: "",
};

function DealsTab({ brands }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [form, setForm] = useState(DEAL_EMPTY);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch talents for dropdown
  const { data: talents = [] } = useQuery({
    queryKey: ["admin-talents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talents")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) return [];
      return data ?? [];
    },
  });

  const { sorted, sortKey, sortDir, handleSort } = useSortedData(deals, "title");

  const filtered = useMemo(() => {
    let rows = sorted;
    if (filterStatus !== "all") rows = rows.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        [r.title, r.brand_name, r.talent_name, r.status, r.partnership_type]
          .some(v => String(v ?? "").toLowerCase().includes(q))
      );
    }
    return rows;
  }, [sorted, search, filterStatus]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const upsertMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        title: values.title,
        brand_name: values.brand_name,
        talent_name: values.talent_name,
        deal_value: values.deal_value ? Number(values.deal_value) : null,
        status: values.status || "discovered",
        partnership_type: values.partnership_type,
        match_score: values.match_score ? Number(values.match_score) : null,
        stage: values.stage,
        notes: values.notes,
      };
      if (editRow?.id) {
        const { error } = await supabase.from("partnerships").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partnerships").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["partnerships"] });
      toast({ title: editRow ? "Deal updated." : "Deal added." });
      closeDialog();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("partnerships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["partnerships"] });
      toast({ title: "Deal deleted." });
      setDeleteRow(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async (rows) => {
      const payload = rows.map(r => ({
        title: r.title || r.Title || "",
        brand_name: r.brand_name || r["Brand Name"] || "",
        talent_name: r.talent_name || r["Talent Name"] || "",
        deal_value: r.deal_value ? Number(r.deal_value) : null,
        status: r.status || "discovered",
        partnership_type: r.partnership_type || r["Partnership Type"] || "",
        match_score: r.match_score ? Number(r.match_score) : null,
        stage: r.stage || "",
        notes: r.notes || r.Notes || "",
      }));
      const { error } = await supabase.from("partnerships").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["partnerships"] });
    },
  });

  function openAdd() {
    setEditRow(null);
    setForm(DEAL_EMPTY);
    setDialogOpen(true);
  }

  function openEdit(row) {
    setEditRow(row);
    setForm({
      title: row.title ?? "",
      brand_name: row.brand_name ?? "",
      talent_name: row.talent_name ?? "",
      deal_value: row.deal_value ?? "",
      status: row.status ?? "",
      partnership_type: row.partnership_type ?? "",
      match_score: row.match_score ?? "",
      stage: row.stage ?? "",
      notes: row.notes ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditRow(null);
    setForm(DEAL_EMPTY);
  }

  function setField(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Deal title is required.", variant: "destructive" });
      return;
    }
    upsertMutation.mutate(form);
  }

  const statusColors = {
    discovered: "bg-slate-100 text-slate-600",
    researching: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    sent: "bg-indigo-100 text-indigo-700",
    responded: "bg-purple-100 text-purple-700",
    negotiating: "bg-orange-100 text-orange-700",
    contracted: "bg-emerald-100 text-emerald-700",
    active: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search deals…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DEAL_STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered, "deals.csv")}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Deal
          </Button>
        </div>
      </div>

      {/* CSV Import */}
      <CsvImport
        onImport={importMutation.mutateAsync}
        loading={importMutation.isPending}
        expectedFields={["title", "brand_name", "talent_name", "deal_value", "status", "partnership_type", "match_score", "stage", "notes"]}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th col="title" label="Title" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="brand_name" label="Brand" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="talent_name" label="Talent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="deal_value" label="Deal Value" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="match_score" label="Match Score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="partnership_type" label="Type" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <Th col="stage" label="Stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <SkeletonRows cols={9} />
              ) : paginated.length === 0 ? (
                <EmptyState icon={Handshake} title="No deals yet." cta="Add your first deal" onCta={openAdd} />
              ) : (
                paginated.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{fmt(row.title)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(row.brand_name)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(row.talent_name)}</td>
                    <td className="px-4 py-3">
                      {row.status ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColors[row.status] || "bg-slate-100 text-slate-600"}`}>
                          {row.status}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmtMoney(row.deal_value)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.match_score != null ? (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">{row.match_score}</span>
                          <span className="text-xs text-slate-400">/100</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs capitalize">{fmt(row.partnership_type).replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmt(row.stage)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteRow(row)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onPage={setPage} />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRow ? "Edit Deal" : "Add Deal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <FormField label="Deal Title" required>
              <Input value={form.title} onChange={e => setField("title", e.target.value)} placeholder="e.g. Nike x LeBron Partnership" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Brand">
                <Select value={form.brand_name} onValueChange={v => setField("brand_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Talent">
                <Select value={form.talent_name} onValueChange={v => setField("talent_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select talent" /></SelectTrigger>
                  <SelectContent>
                    {talents.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                    {talents.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400">
                        No talents found. Enter manually:
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {/* Fallback manual input if dropdown is empty */}
                {talents.length === 0 && (
                  <Input
                    value={form.talent_name}
                    onChange={e => setField("talent_name", e.target.value)}
                    placeholder="Enter talent name"
                    className="mt-1"
                  />
                )}
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Deal Value ($)">
                <Input
                  type="number"
                  value={form.deal_value}
                  onChange={e => setField("deal_value", e.target.value)}
                  placeholder="50000"
                />
              </FormField>
              <FormField label="Match Score (0–100)">
                <Input
                  type="number" min="0" max="100"
                  value={form.match_score}
                  onChange={e => setField("match_score", e.target.value)}
                  placeholder="85"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Status">
                <Select value={form.status} onValueChange={v => setField("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {DEAL_STATUSES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Partnership Type">
                <Select value={form.partnership_type} onValueChange={v => setField("partnership_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PARTNERSHIP_TYPES.map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Stage">
              <Input value={form.stage} onChange={e => setField("stage", e.target.value)} placeholder="e.g. Initial Outreach" />
            </FormField>
            <FormField label="Notes">
              <Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Any additional details…" rows={3} />
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editRow ? "Save Changes" : "Add Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirm
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => deleteRow && deleteMutation.mutate(deleteRow.id)}
        itemName={deleteRow?.title ?? "deal"}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminDataManager() {
  const [activeTab, setActiveTab] = useState("brands");

  // Shared brands data used by Contacts and Deals dropdowns/autocomplete
  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Row counts for tab badges
  const { data: contactCount = 0 } = useQuery({
    queryKey: ["admin-contact-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("decision_makers")
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });

  const { data: dealCount = 0 } = useQuery({
    queryKey: ["admin-deal-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("partnerships")
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Data Manager</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage platform-wide brands, contacts, and deals visible to all users.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px] uppercase tracking-wider px-2 py-1">
          Admin Only
        </Badge>
      </div>

      <Separator />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          Data added here is <strong>immediately visible to all platform users</strong>.
          Brands appear in Talent Discovery, contacts appear in Contact Finder, and deals appear in Partnerships.
          All changes are permanent — use caution when deleting.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 h-10 p-1 gap-1">
          <TabsTrigger value="brands" className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
            <Building2 className="w-3.5 h-3.5" />
            Brands
            <span className="ml-1 bg-slate-200 text-slate-600 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {brands.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
            <Users className="w-3.5 h-3.5" />
            Contacts
            <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {contactCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
            <Handshake className="w-3.5 h-3.5" />
            Deals
            <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {dealCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="mt-0">
          <BrandsTab />
        </TabsContent>
        <TabsContent value="contacts" className="mt-0">
          <ContactsTab brands={brands} />
        </TabsContent>
        <TabsContent value="deals" className="mt-0">
          <DealsTab brands={brands} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Trash2,
  Edit3,
  MoreVertical,
  Link2,
  Share2,
  Handshake,
  Eye,
  EyeOff,
  Tag,
  X,
  Loader2,
  AlertCircle,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  File,
  CheckCircle2,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const DECK_TYPES = [
  { value: "pitch_deck", label: "Pitch Deck" },
  { value: "campaign_brief", label: "Campaign Brief" },
  { value: "media_kit", label: "Media Kit" },
  { value: "case_study", label: "Case Study" },
  { value: "rate_card", label: "Rate Card" },
  { value: "portfolio", label: "Portfolio" },
  { value: "other", label: "Other" },
];

const DECK_TYPE_COLORS = {
  pitch_deck: "bg-indigo-100 text-indigo-700",
  campaign_brief: "bg-purple-100 text-purple-700",
  media_kit: "bg-pink-100 text-pink-700",
  case_study: "bg-emerald-100 text-emerald-700",
  rate_card: "bg-amber-100 text-amber-700",
  portfolio: "bg-blue-100 text-blue-700",
  other: "bg-slate-100 text-slate-600",
};

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", description: "Only you can see this" },
  { value: "shared", label: "Shared", description: "Visible to specific deals" },
  { value: "public", label: "Public", description: "Visible to matched talent" },
];

const ACCEPTED_EXTENSIONS = ".pdf,.pptx,.ppt,.key,.docx,.doc";
const MAX_BASE64_SIZE_MB = 4; // warn above this for base64 path
const MAX_BASE64_SIZE_BYTES = MAX_BASE64_SIZE_MB * 1024 * 1024;

// ── File icon helper ─────────────────────────────────────────────────────────

function FileIcon({ fileType, className = "w-8 h-8" }) {
  const ext = (fileType || "").toLowerCase();
  if (ext.includes("pdf")) {
    return (
      <div className={`${className} rounded-lg bg-red-100 flex items-center justify-center`}>
        <FileText className="w-4 h-4 text-red-600" />
      </div>
    );
  }
  if (ext.includes("ppt") || ext.includes("pptx") || ext.includes("key")) {
    return (
      <div className={`${className} rounded-lg bg-orange-100 flex items-center justify-center`}>
        <FileText className="w-4 h-4 text-orange-600" />
      </div>
    );
  }
  if (ext.includes("doc") || ext.includes("docx")) {
    return (
      <div className={`${className} rounded-lg bg-blue-100 flex items-center justify-center`}>
        <FileText className="w-4 h-4 text-blue-600" />
      </div>
    );
  }
  return (
    <div className={`${className} rounded-lg bg-slate-100 flex items-center justify-center`}>
      <File className="w-4 h-4 text-slate-500" />
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDeckTypeLabel(value) {
  return DECK_TYPES.find((d) => d.value === value)?.label || value;
}

function getVisibilityLabel(deck) {
  if (deck.is_public) return "Public";
  if (Array.isArray(deck.shared_with) && deck.shared_with.length > 0) return "Shared";
  return "Private";
}

// ── Tag input component ──────────────────────────────────────────────────────

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim().toLowerCase().replace(/,/g, "");
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInput("");
    }
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="border border-slate-200 rounded-md px-3 py-2 min-h-[40px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-indigo-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Add tag, press Enter..." : ""}
        className="outline-none flex-1 min-w-[100px] text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
      />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No decks yet</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Upload your pitch decks, media kits, and campaign briefs to keep everything organized in one place.
      </p>
      <Button onClick={onUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
        <Plus className="w-4 h-4" />
        Upload Your First Deck
      </Button>
    </div>
  );
}

// ── Upload / Edit Dialog ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  description: "",
  deck_type: "pitch_deck",
  tags: [],
  visibility: "private",
};

function DeckDialog({ open, onOpenChange, editingDeck, userEmail, onSuccess }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);

  // Populate form when editing
  React.useEffect(() => {
    if (editingDeck) {
      setForm({
        title: editingDeck.title || "",
        description: editingDeck.description || "",
        deck_type: editingDeck.deck_type || "pitch_deck",
        tags: Array.isArray(editingDeck.tags) ? editingDeck.tags : [],
        visibility: editingDeck.is_public
          ? "public"
          : Array.isArray(editingDeck.shared_with) && editingDeck.shared_with.length > 0
          ? "shared"
          : "private",
      });
      setSelectedFile(null);
      setSizeWarning(false);
    } else {
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setSizeWarning(false);
    }
  }, [editingDeck, open]);

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.size > MAX_BASE64_SIZE_BYTES) {
      setSizeWarning(true);
    } else {
      setSizeWarning(false);
    }
    // Auto-fill title from filename if empty
    if (!form.title) {
      const name = file.name.replace(/\.[^/.]+$/, "");
      setForm((prev) => ({ ...prev, title: name }));
    }
    // Detect file type
    // Already handled via file.type or name
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const getFileExt = (file) => {
    const parts = file.name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!editingDeck && !selectedFile) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let fileUrl = editingDeck?.file_url || null;
      let fileName = editingDeck?.file_name || null;
      let fileSize = editingDeck?.file_size || null;
      let fileType = editingDeck?.file_type || null;

      if (selectedFile) {
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = getFileExt(selectedFile);

        // Try Supabase Storage first
        let storageSuccess = false;
        try {
          const storagePath = `${userEmail}/${Date.now()}_${selectedFile.name}`;
          const { data: storageData, error: storageError } = await supabase.storage
            .from("decks")
            .upload(storagePath, selectedFile, { upsert: false });
          if (!storageError && storageData) {
            const { data: publicUrlData } = supabase.storage.from("decks").getPublicUrl(storagePath);
            fileUrl = publicUrlData?.publicUrl || null;
            storageSuccess = true;
          }
        } catch (_storageErr) {
          // Storage bucket may not exist — fall through to base64
        }

        if (!storageSuccess) {
          // Fallback: base64 data URL
          fileUrl = await fileToBase64(selectedFile);
        }
      }

      const visibilityPayload = {
        is_public: form.visibility === "public",
        shared_with: form.visibility === "shared" ? (editingDeck?.shared_with || []) : [],
      };

      if (editingDeck) {
        const { error } = await supabase
          .from("deck_library")
          .update({
            title: form.title.trim(),
            description: form.description.trim() || null,
            deck_type: form.deck_type,
            tags: form.tags,
            ...visibilityPayload,
            ...(selectedFile ? { file_url: fileUrl, file_name: fileName, file_size: fileSize, file_type: fileType } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingDeck.id);
        if (error) throw error;
        toast({ title: "Deck updated" });
      } else {
        const { error } = await supabase.from("deck_library").insert({
          user_email: userEmail,
          title: form.title.trim(),
          description: form.description.trim() || null,
          deck_type: form.deck_type,
          tags: form.tags,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          ...visibilityPayload,
          download_count: 0,
        });
        if (error) throw error;
        toast({ title: "Deck uploaded" });
      }

      qc.invalidateQueries({ queryKey: ["deck-library"] });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Deck save error:", err);
      toast({ title: "Failed to save deck", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            {editingDeck ? "Edit Deck" : "Upload Deck"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <Label>
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Q2 2025 Media Kit"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Brief description of this deck..."
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Deck Type */}
          <div>
            <Label>Deck Type</Label>
            <Select value={form.deck_type} onValueChange={(v) => setForm({ ...form, deck_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DECK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          {!editingDeck && (
            <div>
              <Label>
                File <span className="text-red-500">*</span>
              </Label>
              <div
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : selectedFile
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setSizeWarning(false); }}
                      className="ml-auto text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Drop a file or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PPTX, PPT, KEY, DOCX, DOC</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </div>
              {sizeWarning && (
                <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Large file ({formatFileSize(selectedFile?.size)}). Files over {MAX_BASE64_SIZE_MB}MB will be
                    stored as base64 — consider uploading to Supabase Storage for better performance.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Replace file when editing */}
          {editingDeck && (
            <div>
              <Label>Replace File (optional)</Label>
              <div
                className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  selectedFile ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 hover:border-indigo-300"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click to replace file — leave empty to keep existing
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags
            </Label>
            <div className="mt-1">
              <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Press Enter to add a tag</p>
          </div>

          {/* Visibility */}
          <div>
            <Label>Visibility</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, visibility: opt.value })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    form.visibility === opt.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-indigo-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {opt.value === "private" && <EyeOff className="w-3.5 h-3.5" />}
                    {opt.value === "shared" && <Handshake className="w-3.5 h-3.5" />}
                    {opt.value === "public" && <Eye className="w-3.5 h-3.5" />}
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  <p className="text-[10px] leading-tight text-current opacity-70">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              disabled={uploading}
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Saving..." : editingDeck ? "Save Changes" : "Upload Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Attach to Deal Dialog ────────────────────────────────────────────────────

function AttachToDealDialog({ open, onOpenChange, deck, partnerships, onAttach }) {
  const [selectedPartnership, setSelectedPartnership] = useState("");

  React.useEffect(() => {
    setSelectedPartnership("");
  }, [open]);

  const activePartnerships = useMemo(
    () => (partnerships || []).filter((p) => ["active", "negotiating", "contracted"].includes(p.status)),
    [partnerships]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-indigo-600" />
            Attach to Deal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <p className="text-sm text-slate-600">
            Attach <span className="font-semibold">"{deck?.title}"</span> to an active deal.
          </p>
          {activePartnerships.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              No active deals found. Partnerships must be active, negotiating, or contracted.
            </div>
          ) : (
            <Select value={selectedPartnership} onValueChange={setSelectedPartnership}>
              <SelectTrigger>
                <SelectValue placeholder="Select a deal..." />
              </SelectTrigger>
              <SelectContent>
                {activePartnerships.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.talent_name || p.title || `Deal ${p.id.slice(0, 8)}`}
                    {p.status && (
                      <span className="ml-2 text-xs text-slate-400">({p.status})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!selectedPartnership}
            onClick={() => onAttach(selectedPartnership)}
          >
            Attach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Deck Card ────────────────────────────────────────────────────────────────

function DeckCard({
  deck,
  partnerships,
  onEdit,
  onDelete,
  onAttach,
  onShare,
  onDownload,
  viewMode,
}) {
  const visLabel = getVisibilityLabel(deck);
  const typeLabel = getDeckTypeLabel(deck.deck_type);
  const typeColor = DECK_TYPE_COLORS[deck.deck_type] || DECK_TYPE_COLORS.other;

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow group">
        <FileIcon fileType={deck.file_type} className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm truncate">{deck.title}</p>
            <Badge className={`text-xs ${typeColor}`}>{typeLabel}</Badge>
            {visLabel !== "Private" && (
              <Badge variant="outline" className="text-xs text-slate-500">
                {visLabel}
              </Badge>
            )}
          </div>
          {deck.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{deck.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span>{formatFileSize(deck.file_size)}</span>
            <span>·</span>
            <span>{formatDate(deck.created_at)}</span>
            <span>·</span>
            <span>{deck.download_count || 0} downloads</span>
            {Array.isArray(deck.tags) && deck.tags.length > 0 && (
              <>
                <span>·</span>
                <span>{deck.tags.slice(0, 3).join(", ")}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onDownload(deck)}>
            <Download className="w-4 h-4 text-slate-500" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onShare(deck)}>
            <Share2 className="w-4 h-4 text-slate-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deck)}>
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAttach(deck)}>
                <Handshake className="w-4 h-4 mr-2" /> Attach to Deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(deck)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow group overflow-hidden">
      {/* Color header by type */}
      <div className={`h-1.5 ${
        deck.deck_type === "pitch_deck" ? "bg-indigo-500" :
        deck.deck_type === "campaign_brief" ? "bg-purple-500" :
        deck.deck_type === "media_kit" ? "bg-pink-500" :
        deck.deck_type === "case_study" ? "bg-emerald-500" :
        deck.deck_type === "rate_card" ? "bg-amber-500" :
        deck.deck_type === "portfolio" ? "bg-blue-500" : "bg-slate-300"
      }`} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <FileIcon fileType={deck.file_type} className="w-10 h-10 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{deck.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge className={`text-xs ${typeColor}`}>{typeLabel}</Badge>
              <span className="text-xs text-slate-400">{deck.file_type?.toUpperCase() || "—"}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 -mr-1"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deck)}>
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAttach(deck)}>
                <Handshake className="w-4 h-4 mr-2" /> Attach to Deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(deck)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {deck.description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{deck.description}</p>
        )}

        {Array.isArray(deck.tags) && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deck.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {deck.tags.length > 4 && (
              <span className="text-[10px] text-slate-400">+{deck.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>{formatFileSize(deck.file_size)}</span>
          <span>{formatDate(deck.created_at)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Download className="w-3 h-3" />
            <span>{deck.download_count || 0}</span>
            <span className="ml-1">
              {visLabel === "Private" ? (
                <span className="flex items-center gap-0.5"><EyeOff className="w-3 h-3" /> Private</span>
              ) : visLabel === "Public" ? (
                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> Public</span>
              ) : (
                <span className="flex items-center gap-0.5"><Handshake className="w-3 h-3" /> Shared</span>
              )}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
              onClick={() => onShare(deck)}
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
              onClick={() => onDownload(deck)}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DeckLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const userEmail = user?.email || "";

  // UI state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deletingDeck, setDeletingDeck] = useState(null);
  const [attachingDeck, setAttachingDeck] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [viewMode, setViewMode] = useState("grid");

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["deck-library", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const { data, error } = await supabase
        .from("deck_library")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userEmail,
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships-for-deck"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("id, talent_name, title, status")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const deleteDeck = useMutation({
    mutationFn: async (deck) => {
      // Try to remove from Storage if URL is a Supabase storage URL
      if (deck.file_url && deck.file_url.includes("supabase") && !deck.file_url.startsWith("data:")) {
        try {
          const url = new URL(deck.file_url);
          const pathParts = url.pathname.split("/object/public/decks/");
          if (pathParts[1]) {
            await supabase.storage.from("decks").remove([pathParts[1]]);
          }
        } catch (_) {
          // Ignore storage cleanup errors
        }
      }
      const { error } = await supabase.from("deck_library").delete().eq("id", deck.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deck-library"] });
      setDeletingDeck(null);
      toast({ title: "Deck deleted" });
    },
    onError: (err) => {
      toast({ title: "Failed to delete deck", description: err.message, variant: "destructive" });
    },
  });

  const attachToDeal = useMutation({
    mutationFn: async ({ deckId, partnershipId }) => {
      // Update deck with partnership_id
      const { error: deckError } = await supabase
        .from("deck_library")
        .update({ partnership_id: partnershipId, updated_at: new Date().toISOString() })
        .eq("id", deckId);
      if (deckError) throw deckError;

      // Also store deck_id reference on the partnership if column exists
      // Fail silently if the column doesn't exist yet
      try {
        await supabase
          .from("partnerships")
          .update({ deck_id: deckId })
          .eq("id", partnershipId);
      } catch (_) {}
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deck-library"] });
      setAttachingDeck(null);
      toast({ title: "Deck attached to deal" });
    },
    onError: (err) => {
      toast({ title: "Failed to attach deck", description: err.message, variant: "destructive" });
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDownload = useCallback(
    async (deck) => {
      if (!deck.file_url) {
        toast({ title: "No file available", variant: "destructive" });
        return;
      }

      // Increment download count
      supabase
        .from("deck_library")
        .update({ download_count: (deck.download_count || 0) + 1 })
        .eq("id", deck.id)
        .then(() => qc.invalidateQueries({ queryKey: ["deck-library"] }));

      if (deck.file_url.startsWith("data:")) {
        // Base64 download
        const link = document.createElement("a");
        link.href = deck.file_url;
        link.download = deck.file_name || "deck";
        link.click();
      } else {
        window.open(deck.file_url, "_blank");
      }
    },
    [toast, qc]
  );

  const handleShare = useCallback(
    (deck) => {
      const shareUrl = `${window.location.origin}/DeckLibrary?deckId=${deck.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({ title: "Link copied", description: "Share this link to give access to the deck." });
      });
    },
    [toast]
  );

  // ── Filtering & sorting ────────────────────────────────────────────────────

  const filteredDecks = useMemo(() => {
    let result = [...decks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          (Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (filterType !== "all") {
      result = result.filter((d) => d.deck_type === filterType);
    }

    if (filterVisibility !== "all") {
      result = result.filter((d) => {
        const vis = getVisibilityLabel(d).toLowerCase();
        return vis === filterVisibility;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "name_asc":
          return a.title.localeCompare(b.title);
        case "name_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [decks, search, filterType, filterVisibility, sortBy]);

  // ── Counts for the stat bar ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSize = decks.reduce((s, d) => s + (d.file_size || 0), 0);
    const totalDownloads = decks.reduce((s, d) => s + (d.download_count || 0), 0);
    return { count: decks.length, totalSize, totalDownloads };
  }, [decks]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Deck Library</h1>
          </div>
          <p className="text-sm text-slate-500 ml-11">
            Upload and manage your pitch decks, media kits, and campaign materials
          </p>
        </div>
        <Button
          onClick={() => { setEditingDeck(null); setUploadOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Deck
        </Button>
      </div>

      {/* Stats bar */}
      {decks.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Decks", value: stats.count },
            { label: "Total Size", value: formatFileSize(stats.totalSize) },
            { label: "Total Downloads", value: stats.totalDownloads },
          ].map(({ label, value }) => (
            <Card key={label} className="border-slate-200/60">
              <CardContent className="py-3 px-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DECK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="w-40">
            <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            {sortBy.includes("asc") ? (
              <SortAsc className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            ) : (
              <SortDesc className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            )}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="name_desc">Name Z–A</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredDecks.length === 0 && decks.length === 0 ? (
        <EmptyState onUpload={() => { setEditingDeck(null); setUploadOpen(true); }} />
      ) : filteredDecks.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No decks match your filters</p>
          <button
            onClick={() => { setSearch(""); setFilterType("all"); setFilterVisibility("all"); }}
            className="text-sm text-indigo-600 hover:underline mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              partnerships={partnerships}
              onEdit={(d) => { setEditingDeck(d); setUploadOpen(true); }}
              onDelete={setDeletingDeck}
              onAttach={setAttachingDeck}
              onShare={handleShare}
              onDownload={handleDownload}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              partnerships={partnerships}
              onEdit={(d) => { setEditingDeck(d); setUploadOpen(true); }}
              onDelete={setDeletingDeck}
              onAttach={setAttachingDeck}
              onShare={handleShare}
              onDownload={handleDownload}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Upload / Edit Dialog */}
      <DeckDialog
        open={uploadOpen}
        onOpenChange={(v) => { setUploadOpen(v); if (!v) setEditingDeck(null); }}
        editingDeck={editingDeck}
        userEmail={userEmail}
        onSuccess={() => setEditingDeck(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDeck} onOpenChange={(v) => !v && setDeletingDeck(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deletingDeck?.title}"</strong> and cannot be undone.
              The file will also be removed from storage if applicable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDeck.mutate(deletingDeck)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteDeck.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Attach to Deal Dialog */}
      <AttachToDealDialog
        open={!!attachingDeck}
        onOpenChange={(v) => !v && setAttachingDeck(null)}
        deck={attachingDeck}
        partnerships={partnerships}
        onAttach={(partnershipId) =>
          attachToDeal.mutate({ deckId: attachingDeck.id, partnershipId })
        }
      />
    </div>
  );
}

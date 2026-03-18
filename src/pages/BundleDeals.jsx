import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus, Package, Users, DollarSign, Send, Handshake, Loader2,
  ChevronDown, ChevronUp, Trash2, X, Check,
} from "lucide-react";

const BUNDLE_STATUS_BADGES = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700 border-blue-200" },
  active: { label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
  completed: { label: "Completed", color: "bg-teal-100 text-teal-700 border-teal-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600 border-red-200" },
};

function fmtMoney(n) {
  if (!n && n !== 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Number(n).toLocaleString()}`;
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Create Bundle Form ─────────────────────────────────────────────────────────

function CreateBundleForm({ talents, brands, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [selectedTalentIds, setSelectedTalentIds] = useState([]);
  const [talentSearch, setTalentSearch] = useState("");

  const filteredTalents = useMemo(() => {
    if (!talentSearch) return talents.slice(0, 20);
    const q = talentSearch.toLowerCase();
    return talents.filter((t) => t.name?.toLowerCase().includes(q)).slice(0, 20);
  }, [talents, talentSearch]);

  const toggleTalent = (talent) => {
    setSelectedTalentIds((prev) =>
      prev.includes(talent.id) ? prev.filter((id) => id !== talent.id) : [...prev, talent.id]
    );
  };

  const selectedTalents = talents.filter((t) => selectedTalentIds.includes(t.id));

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreated({
      title: title.trim(),
      brand_id: brandId || null,
      brand_name: brandName || null,
      total_budget: Number(totalBudget) || 0,
      talent_ids: selectedTalentIds,
      talent_names: selectedTalents.map((t) => t.name),
      campaign_brief: campaignBrief || null,
      status: "draft",
    });
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            Create Bundle Deal
          </span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Bundle Title</label>
            <Input
              placeholder="Q2 Campaign Bundle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm h-9"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Brand</label>
            {brands.length > 0 ? (
              <Select
                value={brandId}
                onValueChange={(val) => {
                  setBrandId(val);
                  const brand = brands.find((b) => b.id === val);
                  setBrandName(brand?.name || "");
                }}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Select brand..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="text-sm h-9"
              />
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wide">Total Budget ($)</label>
          <Input
            type="number"
            placeholder="50000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="text-sm h-9 max-w-[200px]"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wide">Campaign Brief</label>
          <Textarea
            placeholder="Describe the campaign goals, deliverables, and timeline..."
            value={campaignBrief}
            onChange={(e) => setCampaignBrief(e.target.value)}
            className="text-sm min-h-[80px] resize-none"
          />
        </div>

        {/* Talent selector */}
        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 block">
            Select Talents ({selectedTalentIds.length} selected)
          </label>
          <Input
            placeholder="Search talents..."
            value={talentSearch}
            onChange={(e) => setTalentSearch(e.target.value)}
            className="text-sm h-8 mb-2"
          />
          {/* Selected chips */}
          {selectedTalents.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedTalents.map((t) => (
                <Badge
                  key={t.id}
                  className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] cursor-pointer hover:bg-indigo-200"
                  onClick={() => toggleTalent(t)}
                >
                  {t.name}
                  <X className="w-2.5 h-2.5 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
            {filteredTalents.map((talent) => {
              const isSelected = selectedTalentIds.includes(talent.id);
              return (
                <button
                  key={talent.id}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                    isSelected ? "bg-indigo-50" : ""
                  }`}
                  onClick={() => toggleTalent(talent)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="flex-1 truncate">{talent.name}</span>
                  {talent.platform && (
                    <span className="text-[10px] text-slate-400">{talent.platform}</span>
                  )}
                  {talent.tier && (
                    <Badge className="text-[10px] bg-slate-100 text-slate-500">{talent.tier}</Badge>
                  )}
                </button>
              );
            })}
            {filteredTalents.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No talents found.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSubmit}
            disabled={!title.trim() || selectedTalentIds.length === 0}
          >
            <Package className="w-3 h-3 mr-1" />
            Create Bundle
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Bundle Card ────────────────────────────────────────────────────────────────

function BundleCard({ bundle, talents, onSendToAll, onConvertToDeals, onDelete, isSending, isConverting }) {
  const [expanded, setExpanded] = useState(false);
  const statusBadge = BUNDLE_STATUS_BADGES[bundle.status] || BUNDLE_STATUS_BADGES.draft;
  const talentNames = Array.isArray(bundle.talent_names) ? bundle.talent_names : [];
  const talentIds = Array.isArray(bundle.talent_ids) ? bundle.talent_ids : [];
  const perTalentBudget = talentIds.length > 0 ? (Number(bundle.total_budget) || 0) / talentIds.length : 0;

  const bundleTalents = talents.filter((t) => talentIds.includes(t.id));

  return (
    <Card className="border-slate-200/60 hover:border-slate-300/80 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{bundle.title}</h3>
              <Badge className={`text-[10px] border ${statusBadge.color}`}>{statusBadge.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {bundle.brand_name && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {bundle.brand_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {talentIds.length} talent{talentIds.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {fmtMoney(bundle.total_budget)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {bundle.status === "draft" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => onSendToAll(bundle)}
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                  Send to All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 text-green-700 border-green-200 hover:bg-green-50"
                  onClick={() => onConvertToDeals(bundle)}
                  disabled={isConverting}
                >
                  {isConverting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Handshake className="w-3 h-3 mr-1" />}
                  Convert to Deals
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-red-500 hover:text-red-700"
              onClick={() => onDelete(bundle.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expand / collapse talent list */}
        <button
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide" : "Show"} talents
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {bundle.campaign_brief && (
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Campaign Brief</p>
                <p className="text-xs text-slate-600">{bundle.campaign_brief}</p>
              </div>
            )}
            {bundleTalents.length > 0 ? (
              bundleTalents.map((talent) => (
                <div
                  key={talent.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {talent.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{talent.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {talent.platform} {talent.tier ? `/ ${talent.tier}` : ""}
                      {talent.followers ? ` / ${(talent.followers / 1000).toFixed(0)}K followers` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-600">{fmtMoney(perTalentBudget)}</p>
                    <p className="text-[10px] text-slate-400">budget share</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback to names if talent records not found
              talentNames.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 text-xs font-bold">{name?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-600">{fmtMoney(perTalentBudget)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function BundleDeals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["bundle_deals"],
    queryFn: () => base44.entities.BundleDeal.list("-created_at"),
    staleTime: 15000,
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents_for_bundles"],
    queryFn: () => base44.entities.Talent.list("-created_at", 500),
    staleTime: 60000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands_for_bundles"],
    queryFn: () => base44.entities.Brand.list("-created_at", 200),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.BundleDeal.create({ ...payload, created_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle_deals"] });
      setShowCreate(false);
      toast({ title: "Bundle created", description: "Your bundle deal has been created." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BundleDeal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle_deals"] });
      toast({ title: "Bundle deleted" });
    },
  });

  const [sendingId, setSendingId] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  const handleSendToAll = async (bundle) => {
    setSendingId(bundle.id);
    try {
      const talentIds = Array.isArray(bundle.talent_ids) ? bundle.talent_ids : [];
      const talentNames = Array.isArray(bundle.talent_names) ? bundle.talent_names : [];
      const emails = [];

      for (let i = 0; i < talentIds.length; i++) {
        emails.push({
          talent_name: talentNames[i] || "Talent",
          brand_name: bundle.brand_name || "Brand",
          subject: `Partnership Opportunity: ${bundle.title}`,
          body: `Hi ${talentNames[i] || "there"},\n\nWe'd like to invite you to participate in "${bundle.title}" campaign${bundle.brand_name ? ` with ${bundle.brand_name}` : ""}.\n\n${bundle.campaign_brief || "More details to follow."}\n\nBudget allocation: $${talentIds.length > 0 ? Math.round(Number(bundle.total_budget) / talentIds.length) : 0}\n\nLooking forward to hearing from you!`,
          status: "draft",
          sequence_id: null,
        });
      }

      if (emails.length > 0) {
        await base44.entities.OutreachEmail.bulkCreate
          ? await Promise.all(emails.map((e) => base44.entities.OutreachEmail.create(e)))
          : await Promise.all(emails.map((e) => base44.entities.OutreachEmail.create(e)));
      }

      await base44.entities.BundleDeal.update(bundle.id, { status: "sent" });
      queryClient.invalidateQueries({ queryKey: ["bundle_deals"] });
      toast({ title: "Outreach sent", description: `Created ${emails.length} outreach emails.` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  const handleConvertToDeals = async (bundle) => {
    setConvertingId(bundle.id);
    try {
      const talentIds = Array.isArray(bundle.talent_ids) ? bundle.talent_ids : [];
      const talentNames = Array.isArray(bundle.talent_names) ? bundle.talent_names : [];
      const perTalentBudget = talentIds.length > 0 ? Math.round(Number(bundle.total_budget) / talentIds.length) : 0;

      for (let i = 0; i < talentIds.length; i++) {
        await base44.entities.Partnership.create({
          title: `${bundle.title} - ${talentNames[i] || "Talent"}`,
          brand_name: bundle.brand_name || null,
          talent_name: talentNames[i] || null,
          deal_value: perTalentBudget,
          status: "negotiating",
          notes: bundle.campaign_brief || null,
        });
      }

      await base44.entities.BundleDeal.update(bundle.id, { status: "active" });
      queryClient.invalidateQueries({ queryKey: ["bundle_deals"] });
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      toast({ title: "Deals created", description: `Created ${talentIds.length} individual partnerships.` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setConvertingId(null);
    }
  };

  // Stats
  const totalBudget = bundles.reduce((sum, b) => sum + Number(b.total_budget || 0), 0);
  const totalTalents = bundles.reduce((sum, b) => sum + (Array.isArray(b.talent_ids) ? b.talent_ids.length : 0), 0);
  const activeBundles = bundles.filter((b) => b.status === "active" || b.status === "sent").length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bundle Deals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create multi-talent campaign bundles and manage them as a group.
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bundles", value: bundles.length, icon: Package },
          { label: "Active Bundles", value: activeBundles, icon: Handshake },
          { label: "Total Talents", value: totalTalents, icon: Users },
          { label: "Total Budget", value: fmtMoney(totalBudget), icon: DollarSign },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateBundleForm
          talents={talents}
          brands={brands}
          onClose={() => setShowCreate(false)}
          onCreated={(data) => createMutation.mutate(data)}
        />
      )}

      {/* Bundle list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-sm text-slate-500 font-medium">No bundle deals yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first multi-talent bundle campaign.</p>
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Bundle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              talents={talents}
              onSendToAll={handleSendToAll}
              onConvertToDeals={handleConvertToDeals}
              onDelete={(id) => deleteMutation.mutate(id)}
              isSending={sendingId === bundle.id}
              isConverting={convertingId === bundle.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

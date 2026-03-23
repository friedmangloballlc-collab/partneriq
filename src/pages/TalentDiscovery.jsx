import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import ContextualTip from "@/components/onboarding/ContextualTip";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Plus, Grid3X3, List, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TalentCard from "@/components/talent/TalentCard";
import TalentFilters from "@/components/talent/TalentFilters";
import TalentProfileModal from "@/components/talent/TalentProfileModal";
import { EmptyState } from "@/components/ui/empty-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";

const DEFAULT_FILTERS = {
  platform: "all", niche: "all", tier: "all", trajectory: "all",
  minFollowers: 0, minEngagement: 0, minBrandSafety: 0, minAlpha: 0,
};

// Custom hook: debounce a value by the given delay (ms)
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function TalentDiscovery() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [newTalent, setNewTalent] = useState({ name: "", email: "", primary_platform: "instagram", niche: "tech", tier: "micro" });
  const navigate = useNavigate();

  // Build a server-side query with full-text search + chip filters
  const fetchTalents = useCallback(async () => {
    let query = supabase
      .from("talents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    // Full-text search: convert the search string into tsquery-compatible terms
    if (debouncedSearch.trim()) {
      const terms = debouncedSearch
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(t => `'${t}'`)
        .join(" & ");
      query = query.textSearch("fts", terms);
    }

    // Chip / select filters applied server-side
    if (filters.platform !== "all") query = query.eq("primary_platform", filters.platform);
    if (filters.niche !== "all") query = query.eq("niche", filters.niche);
    if (filters.tier !== "all") query = query.eq("tier", filters.tier);
    if (filters.trajectory !== "all") query = query.eq("trajectory", filters.trajectory);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [debouncedSearch, filters.platform, filters.niche, filters.tier, filters.trajectory]);

  const { data: talents = [], isLoading, refetch } = useQuery({
    queryKey: ["talents", debouncedSearch, filters.platform, filters.niche, filters.tier, filters.trajectory],
    queryFn: fetchTalents,
  });

  // Numeric range filters are still applied client-side for simplicity
  const filtered = talents.filter(t => {
    if (filters.minFollowers > 0 && (t.total_followers || 0) < filters.minFollowers) return false;
    if (filters.minEngagement > 0 && (t.engagement_rate || 0) < filters.minEngagement) return false;
    if (filters.minBrandSafety > 0 && (t.brand_safety_score || 0) < filters.minBrandSafety) return false;
    if (filters.minAlpha > 0 && (t.discovery_alpha_score || 0) < filters.minAlpha) return false;
    return true;
  });

  const [addError, setAddError] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  const handleAddTalent = async () => {
    setAddError(null);
    setAddSaving(true);
    try {
      await base44.entities.Talent.create(newTalent);
      setShowAddForm(false);
      setNewTalent({ name: "", email: "", primary_platform: "instagram", niche: "tech", tier: "micro" });
      refetch();
    } catch (err) {
      setAddError(err?.message || "Failed to add talent. Please try again.");
    } finally {
      setAddSaving(false);
    }
  };

  const handleMatch = (talent) => {
    navigate(createPageUrl("MatchEngine") + `?talentId=${talent.id}`);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === "minFollowers" ? v > 0 : k === "minEngagement" ? v > 0 : v !== "all"
  ).length;

  return (
    <div className="space-y-5">
      <ContextualTip
        tipId="talent_discovery_tip"
        title="Search our growing creator network"
        description="Use the filters panel to narrow by niche, platform, follower tier, engagement rate, and brand safety score. Click any creator card to see full analytics, then hit 'Match' to run the AI engine."
        color="indigo"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent Discovery</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} of {talents.length} creators</p>
        </div>
        <div className="flex gap-2">
          {/* Mobile: opens a sheet overlay; Desktop: toggles inline sidebar */}
          <Button
            variant="outline"
            onClick={() => {
              if (window.innerWidth < 1024) setShowMobileFilters(true);
              else setShowFilters(f => !f);
            }}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Talent
          </Button>
        </div>
      </div>

      {/* Search + view toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name, niche, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: filters + grid */}
      <div className={`flex gap-6 items-start ${showFilters ? "" : ""}`}>
        {/* Filter sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <TalentFilters filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        )}

        {/* Cards */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <CardGridSkeleton
              count={6}
              columns={`grid-cols-1 sm:grid-cols-2 ${showFilters ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title={talents.length === 0 ? "No talent in your roster yet" : "No talent found"}
              description={
                talents.length === 0
                  ? "Add your first creator to start discovering and matching talent."
                  : "Try adjusting your filters or search term to find matching creators."
              }
              action={
                talents.length === 0
                  ? { label: "Add Talent", onClick: () => setShowAddForm(true), icon: <Plus className="w-4 h-4" /> }
                  : activeFilterCount > 0
                  ? { label: "Clear filters", onClick: () => setFilters(DEFAULT_FILTERS), variant: "outline", icon: <X className="w-3.5 h-3.5" /> }
                  : undefined
              }
            />
          ) : (
            <div className={viewMode === "grid"
              ? `grid grid-cols-1 sm:grid-cols-2 ${showFilters ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-4 stagger-children`
              : "space-y-3 stagger-children"
            }>
              {filtered.map(talent => (
                <TalentCard key={talent.id} talent={talent} onView={setSelectedTalent} onMatch={handleMatch} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet (shown on < lg screens) */}
      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <TalentFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => { setFilters(DEFAULT_FILTERS); setShowMobileFilters(false); }}
          />
        </SheetContent>
      </Sheet>

      {/* Talent Profile Modal */}
      <TalentProfileModal
        talent={selectedTalent}
        onClose={() => setSelectedTalent(null)}
        onMatch={handleMatch}
      />

      {/* Add Talent Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Talent</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Name *</Label><Input value={newTalent.name} onChange={e => setNewTalent({...newTalent, name: e.target.value})} placeholder="Creator name" /></div>
            <div><Label>Email</Label><Input value={newTalent.email} onChange={e => setNewTalent({...newTalent, email: e.target.value})} placeholder="email@example.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Platform</Label>
                <Select value={newTalent.primary_platform} onValueChange={v => setNewTalent({...newTalent, primary_platform: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["instagram","tiktok","youtube","twitter","twitch","linkedin"].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Niche</Label>
                <Select value={newTalent.niche} onValueChange={v => setNewTalent({...newTalent, niche: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["tech","lifestyle","fitness","beauty","gaming","food","travel","fashion","finance","education","entertainment","sports","music","health","business"].map(n => <SelectItem key={n} value={n}>{n.charAt(0).toUpperCase()+n.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={newTalent.tier} onValueChange={v => setNewTalent({...newTalent, tier: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["nano","micro","mid","macro","mega","celebrity"].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {addError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</p>
            )}
            <Button onClick={handleAddTalent} disabled={!newTalent.name || addSaving} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {addSaving ? "Adding..." : "Add Talent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
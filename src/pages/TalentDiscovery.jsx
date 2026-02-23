import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Filter, Plus, Grid3X3, List, SlidersHorizontal, X, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TalentCard from "@/components/talent/TalentCard";
import TalentDetailPanel from "@/components/talent/TalentDetailPanel";

export default function TalentDiscovery() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTalent, setNewTalent] = useState({ name: "", email: "", primary_platform: "instagram", niche: "tech", tier: "micro" });
  const navigate = useNavigate();

  const { data: talents = [], isLoading, refetch } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 200),
  });

  const filtered = talents.filter(t => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) && !t.niche?.toLowerCase().includes(search.toLowerCase())) return false;
    if (platformFilter !== "all" && t.primary_platform !== platformFilter) return false;
    if (nicheFilter !== "all" && t.niche !== nicheFilter) return false;
    if (tierFilter !== "all" && t.tier !== tierFilter) return false;
    return true;
  });

  const handleAddTalent = async () => {
    await base44.entities.Talent.create(newTalent);
    setShowAddForm(false);
    setNewTalent({ name: "", email: "", primary_platform: "instagram", niche: "tech", tier: "micro" });
    refetch();
  };

  const handleMatch = (talent) => {
    navigate(createPageUrl("MatchEngine") + `?talentId=${talent.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent Discovery</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} creators found</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Talent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name, niche..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
            <SelectItem value="twitch">Twitch</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={nicheFilter} onValueChange={setNicheFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {["tech","lifestyle","fitness","beauty","gaming","food","travel","fashion","finance","education","entertainment","sports","music","health","business"].map(n => (
              <SelectItem key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {["nano","micro","mid","macro","mega","celebrity"].map(t => (
              <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active filters */}
      {(platformFilter !== "all" || nicheFilter !== "all" || tierFilter !== "all") && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Active filters:</span>
          {platformFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setPlatformFilter("all")}>
              {platformFilter} <X className="w-3 h-3" />
            </Badge>
          )}
          {nicheFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setNicheFilter("all")}>
              {nicheFilter} <X className="w-3 h-3" />
            </Badge>
          )}
          {tierFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setTierFilter("all")}>
              {tierFilter} <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex gap-4"><div className="w-12 h-12 rounded-full bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-4 bg-slate-100 rounded w-2/3" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div></div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">{[1,2,3].map(j => <div key={j}><div className="h-2 bg-slate-100 rounded w-full mb-1" /><div className="h-4 bg-slate-100 rounded w-2/3" /></div>)}</div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No talent found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add new talent</p>
          <Button onClick={() => setShowAddForm(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Talent
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children" : "space-y-3 stagger-children"}>
          {filtered.map(talent => (
            <TalentCard key={talent.id} talent={talent} onView={setSelectedTalent} onMatch={handleMatch} />
          ))}
        </div>
      )}

      {/* Talent Detail Panel */}
      {selectedTalent && (
        <TalentDetailPanel talent={selectedTalent} onClose={() => setSelectedTalent(null)} onMatch={handleMatch} />
      )}

      {/* Add Talent Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Talent</DialogTitle>
          </DialogHeader>
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
            <Button onClick={handleAddTalent} disabled={!newTalent.name} className="w-full bg-indigo-600 hover:bg-indigo-700">Add Talent</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
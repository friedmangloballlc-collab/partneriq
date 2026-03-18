import React, { useState, useMemo } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Users, Search, Briefcase, Mic, ShoppingBag, TrendingUp,
  Sparkles, Film, Music, Gamepad2, Trophy, ChevronRight, LayoutGrid, List
} from "lucide-react";

const STREAM_ICONS = {
  brand_partnerships: Briefcase,
  content_media: Film,
  licensing_merchandise: ShoppingBag,
  speaking_appearances: Mic,
  primary_income: DollarSign,
  emerging_revenue: Sparkles,
};

const STREAM_LABELS = {
  brand_partnerships: "Brand Partnerships",
  content_media: "Content & Media",
  licensing_merchandise: "Licensing & Merchandise",
  speaking_appearances: "Speaking & Appearances",
  primary_income: "Primary Income",
  emerging_revenue: "Emerging Revenue",
};

const STREAM_COLORS = {
  brand_partnerships: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  content_media: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  licensing_merchandise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  speaking_appearances: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  primary_income: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerging_revenue: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const CATEGORY_ICONS = {
  "Film, Television & Theater": Film,
  "Music & Audio": Music,
  "Sports & Athletics": Trophy,
  "Gaming & Esports": Gamepad2,
  "Digital & Social Media": TrendingUp,
};

export default function TalentRevenue() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedType, setSelectedType] = useState(null);
  const [view, setView] = useState("grid");

  const { data: talentTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["talent-types"],
    queryFn: async () => {
      const { data } = await supabase.from("talent_types").select("*").order("category");
      return data || [];
    },
  });

  const { data: revenueMatrix = [] } = useQuery({
    queryKey: ["talent-revenue-matrix"],
    queryFn: async () => {
      const { data } = await supabase.from("talent_revenue_matrix").select("*");
      return data || [];
    },
  });

  const { data: revenueStreams = [] } = useQuery({
    queryKey: ["talent-revenue-streams"],
    queryFn: async () => {
      const { data } = await supabase.from("talent_revenue_streams").select("*");
      return data || [];
    },
  });

  const categories = useMemo(() => {
    const cats = [...new Set(talentTypes.map(t => t.category).filter(Boolean))];
    return cats.sort();
  }, [talentTypes]);

  const filtered = useMemo(() => {
    return talentTypes.filter(t => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (search && !t.talent_type?.toLowerCase().includes(search.toLowerCase()) &&
          !t.category?.toLowerCase().includes(search.toLowerCase()) &&
          !t.subcategory?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [talentTypes, search, categoryFilter]);

  const selectedStreams = useMemo(() => {
    if (!selectedType) return [];
    return revenueStreams.filter(s => s.talent_type === selectedType.talent_type);
  }, [selectedType, revenueStreams]);

  const selectedMatrix = useMemo(() => {
    if (!selectedType) return null;
    return revenueMatrix.find(m =>
      m.talent_category?.toLowerCase().includes(selectedType.talent_type?.toLowerCase().split(" ")[0])
    );
  }, [selectedType, revenueMatrix]);

  const stats = useMemo(() => ({
    totalTypes: talentTypes.length,
    categories: categories.length,
    streams: revenueStreams.length,
    matrixEntries: revenueMatrix.length,
  }), [talentTypes, categories, revenueStreams, revenueMatrix]);

  if (loadingTypes) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Talent Revenue Streams</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete monetization guide across {stats.totalTypes} talent types and {stats.categories} categories
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTypes}</p>
              <p className="text-xs text-slate-500">Talent Types</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.categories}</p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.streams}</p>
              <p className="text-xs text-slate-500">Revenue Streams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">6</p>
              <p className="text-xs text-slate-500">Revenue Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search talent types..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`px-3 py-2 ${view === "grid" ? "bg-slate-100" : ""}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`px-3 py-2 ${view === "list" ? "bg-slate-100" : ""}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Talent Type List */}
        <div className={`${selectedType ? "lg:col-span-1" : "lg:col-span-3"} space-y-2 max-h-[70vh] overflow-y-auto`}>
          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-500">No talent types match your search.</CardContent></Card>
          ) : view === "grid" && !selectedType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(t => {
                const Icon = CATEGORY_ICONS[t.category] || Users;
                return (
                  <Card
                    key={t.id}
                    className="cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
                    onClick={() => setSelectedType(t)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{t.talent_type}</p>
                          <p className="text-xs text-slate-500 truncate">{t.subcategory || t.category}</p>
                          {t.primary_revenue_focus && (
                            <p className="text-xs text-indigo-600 mt-1 line-clamp-2">{t.primary_revenue_focus}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            filtered.map(t => {
              const isSelected = selectedType?.id === t.id;
              const Icon = CATEGORY_ICONS[t.category] || Users;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedType(t)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-900 truncate">{t.talent_type}</p>
                    <p className="text-xs text-slate-500">{t.category} — {t.subcategory}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Right: Revenue Detail */}
        {selectedType && (
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedType.talent_type}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedType.category} — {selectedType.subcategory}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded border"
                  >
                    Close
                  </button>
                </div>
                {selectedType.primary_revenue_focus && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs font-medium text-indigo-700 mb-1">Primary Revenue Focus</p>
                    <p className="text-sm text-indigo-900">{selectedType.primary_revenue_focus}</p>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Revenue Matrix Overview */}
            {selectedMatrix && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Brand Partnerships", value: selectedMatrix.brand_partnerships },
                    { label: "Content & Media", value: selectedMatrix.content_media },
                    { label: "Licensing & Merch", value: selectedMatrix.licensing_merchandise },
                    { label: "Speaking", value: selectedMatrix.speaking_appearances },
                    { label: "Primary Income", value: selectedMatrix.primary_income },
                    { label: "Emerging", value: selectedMatrix.emerging_revenue },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">{item.label}</p>
                      <p className="text-sm text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detailed Revenue Streams */}
            {selectedStreams.length > 0 && (
              <Tabs defaultValue={selectedStreams[0]?.stream_category} className="space-y-4">
                <TabsList className="flex-wrap h-auto gap-1">
                  {selectedStreams.map(stream => {
                    const Icon = STREAM_ICONS[stream.stream_category] || DollarSign;
                    return (
                      <TabsTrigger key={stream.stream_category} value={stream.stream_category} className="text-xs gap-1">
                        <Icon className="w-3 h-3" />
                        {STREAM_LABELS[stream.stream_category] || stream.stream_category}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {selectedStreams.map(stream => {
                  const fields = Object.entries(stream)
                    .filter(([k, v]) => v && !['id', 'talent_type', 'stream_category', 'created_at'].includes(k))
                    .map(([k, v]) => ({
                      label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                      value: v,
                    }));

                  return (
                    <TabsContent key={stream.stream_category} value={stream.stream_category}>
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          {fields.map(f => (
                            <div key={f.label} className="p-3 border rounded-lg">
                              <p className="text-xs font-semibold text-slate-600 mb-1">{f.label}</p>
                              <p className="text-sm text-slate-800 whitespace-pre-wrap">{f.value}</p>
                            </div>
                          ))}
                          {fields.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No detailed data for this stream.</p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}

            {selectedStreams.length === 0 && !selectedMatrix && (
              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No detailed revenue streams available for this talent type.</p>
                  <p className="text-xs mt-1">Revenue data covers major categories like Film Actors, Athletes, Musicians, Influencers, etc.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

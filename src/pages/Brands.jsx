import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Plus, Building2, Globe, Users, MapPin, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";

function formatBudget(num) {
  if (!num) return "—";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
}

const industryColors = {
  technology: "bg-blue-50 text-blue-700",
  fashion: "bg-pink-50 text-pink-700",
  beauty: "bg-rose-50 text-rose-700",
  food_beverage: "bg-orange-50 text-orange-700",
  automotive: "bg-slate-50 text-slate-700",
  finance: "bg-emerald-50 text-emerald-700",
  health_wellness: "bg-green-50 text-green-700",
  entertainment: "bg-purple-50 text-purple-700",
  sports: "bg-red-50 text-red-700",
  travel: "bg-sky-50 text-sky-700",
  gaming: "bg-violet-50 text-violet-700",
};

export default function Brands() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", domain: "", industry: "technology", company_size: "medium", description: "" });

  const [page, setPage] = useState(1);
  const PER_PAGE = 48;

  const { data: brands = [], isLoading, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      // Supabase caps at 1,000 rows per query — fetch in chunks to get all 1,200+
      const chunks = [];
      let from = 0;
      const chunkSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("brands")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + chunkSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        chunks.push(...data);
        if (data.length < chunkSize) break;
        from += chunkSize;
      }
      return chunks;
    },
  });

  const filtered = brands.filter(b => {
    if (search && !b.name?.toLowerCase().includes(search.toLowerCase()) && !b.domain?.toLowerCase().includes(search.toLowerCase())) return false;
    if (industryFilter !== "all" && b.industry !== industryFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginatedBrands = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAdd = async () => {
    await base44.entities.Brand.create(newBrand);
    setShowAdd(false);
    setNewBrand({ name: "", domain: "", industry: "technology", company_size: "medium", description: "" });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brands</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} brands in directory</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Brand
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search brands..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
        </div>
        <Select value={industryFilter} onValueChange={v => { setIndustryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Industry" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {["technology","fashion","beauty","food_beverage","automotive","finance","health_wellness","entertainment","sports","travel","education","retail","gaming","real_estate","telecom","other"].map(i => (
              <SelectItem key={i} value={i}>{i.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title={brands.length === 0 ? "No brands in your directory yet" : "No brands match your search"}
          description={
            brands.length === 0
              ? "Add your first brand to start tracking and building partnerships."
              : "Try a different search term or change the industry filter."
          }
          action={
            brands.length === 0
              ? { label: "Add Brand", onClick: () => setShowAdd(true), icon: <Plus className="w-4 h-4" /> }
              : search || industryFilter !== "all"
              ? { label: "Clear filters", onClick: () => { setSearch(""); setIndustryFilter("all"); }, variant: "outline" }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {paginatedBrands.map(brand => {
            const initials = brand.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "B";
            return (
              <Card key={brand.id} className="border-slate-200/60 hover:shadow-md transition-all duration-300 p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 rounded-lg">
                    {brand.logo_url ? <AvatarImage src={brand.logo_url} /> : null}
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{brand.name}</h3>
                    {brand.domain && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" /> {brand.domain}
                      </p>
                    )}
                  </div>
                  <Badge className={`text-[10px] ${industryColors[brand.industry] || "bg-slate-50 text-slate-600"}`}>
                    {brand.industry?.replace(/_/g, " ")}
                  </Badge>
                </div>
                {brand.description && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{brand.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  {brand.company_size && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {brand.company_size}</span>}
                  {brand.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {brand.location}</span>}
                  {brand.annual_budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatBudget(brand.annual_budget)}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} brands
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-xs h-8 px-3"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm"
                  onClick={() => setPage(p)} className="text-xs h-8 w-8 p-0">
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Brand</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Name *</Label><Input value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} placeholder="Brand name" /></div>
            <div><Label>Domain</Label><Input value={newBrand.domain} onChange={e => setNewBrand({...newBrand, domain: e.target.value})} placeholder="example.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Industry</Label>
                <Select value={newBrand.industry} onValueChange={v => setNewBrand({...newBrand, industry: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["technology","fashion","beauty","food_beverage","automotive","finance","health_wellness","entertainment","sports","travel","education","retail","gaming"].map(i => (
                      <SelectItem key={i} value={i}>{i.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
                <Select value={newBrand.company_size} onValueChange={v => setNewBrand({...newBrand, company_size: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["startup","small","medium","large","enterprise"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={newBrand.description} onChange={e => setNewBrand({...newBrand, description: e.target.value})} placeholder="Brief description..." /></div>
            <Button onClick={handleAdd} disabled={!newBrand.name} className="w-full bg-indigo-600 hover:bg-indigo-700">Add Brand</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
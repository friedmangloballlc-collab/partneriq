import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Plus, Building2, Globe, Users, MapPin, DollarSign, ExternalLink
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

  const { data: brands = [], isLoading, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 200),
  });

  const filtered = brands.filter(b => {
    if (search && !b.name?.toLowerCase().includes(search.toLowerCase()) && !b.domain?.toLowerCase().includes(search.toLowerCase())) return false;
    if (industryFilter !== "all" && b.industry !== industryFilter) return false;
    return true;
  });

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
          <Input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl border p-5 animate-pulse"><div className="flex gap-3"><div className="w-10 h-10 rounded-lg bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-4 bg-slate-100 rounded w-2/3" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div></div></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No brands found</h3>
          <p className="text-sm text-slate-400 mt-1">Add brands to start building partnerships</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(brand => {
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
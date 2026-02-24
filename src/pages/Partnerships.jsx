import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, DollarSign, ArrowRight, MoreHorizontal, MessageSquare, CheckSquare, UserCheck, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import AssigneeSelector from "@/components/partnerships/AssigneeSelector";
import DealNotesPanel from "@/components/partnerships/DealNotesPanel";
import TasksPanel from "@/components/tasks/TasksPanel";
import NewDealWizard from "@/components/partnerships/NewDealWizard";

const stages = [
  { key: "discovered", label: "Discovered", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "researching", label: "Research", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "outreach_pending", label: "Outreach Pending", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "outreach_sent", label: "Outreach Sent", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "responded", label: "Responded", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "negotiating", label: "Negotiating", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "contracted", label: "Contracted", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "active", label: "Active", color: "bg-green-50 text-green-700 border-green-200" },
  { key: "completed", label: "Completed", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { key: "churned", label: "Churned", color: "bg-red-50 text-red-700 border-red-200" },
];

const pipelineStages = stages.filter(s => !["completed", "churned"].includes(s.key));

export default function Partnerships() {
  const [view, setView] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealTab, setDealTab] = useState("notes");

  const queryClient = useQueryClient();
  const { data: partnerships = [], isLoading, refetch } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partnership.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partnerships"] }),
  });

  const filtered = partnerships.filter(p => {
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.brand_name?.toLowerCase().includes(search.toLowerCase()) && !p.talent_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = async () => {
    await base44.entities.Partnership.create(newDeal);
    setShowAdd(false);
    setNewDeal({ title: "", brand_name: "", talent_name: "", partnership_type: "sponsorship", status: "discovered", priority: "p2", deal_value: 0 });
    refetch();
  };

  const moveToStage = (partnershipId, newStatus) => {
    updateMutation.mutate({ id: partnershipId, data: { status: newStatus } });
  };

  const getStageColor = (status) => stages.find(s => s.key === status)?.color || stages[0].color;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partnerships</h1>
          <p className="text-sm text-slate-500 mt-1">{partnerships.length} total deals · ${(partnerships.reduce((s, p) => s + (p.deal_value || 0), 0) / 1000).toFixed(0)}K pipeline value</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("pipeline")} className={`px-3 py-2 text-xs font-medium ${view === "pipeline" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>Pipeline</button>
            <button onClick={() => setView("list")} className={`px-3 py-2 text-xs font-medium ${view === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>List</button>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {view === "pipeline" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
          {pipelineStages.map(stage => {
            const stageDeals = filtered.filter(p => p.status === stage.key);
            return (
              <div key={stage.key} className="min-w-[280px] max-w-[300px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stage.label}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full w-5 h-5 flex items-center justify-center font-bold">{stageDeals.length}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stageDeals.map(deal => (
                    <Card key={deal.id} className="pipeline-card p-4 border-slate-200/60 cursor-pointer" onClick={() => { setSelectedDeal(deal); setDealTab("notes"); }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">{deal.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name} {deal.talent_name ? `× ${deal.talent_name}` : ""}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-slate-300 hover:text-slate-500 p-0.5" onClick={e => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {stages.filter(s => s.key !== deal.status).map(s => (
                              <DropdownMenuItem key={s.key} onClick={(e) => { e.stopPropagation(); moveToStage(deal.id, s.key); }}>
                                <ArrowRight className="w-3 h-3 mr-2" /> Move to {s.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {deal.match_score && (
                          <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{deal.match_score}% match</Badge>
                        )}
                        {deal.priority && (
                          <Badge variant="outline" className="text-[10px]">{deal.priority.toUpperCase()}</Badge>
                        )}
                        {deal.deal_value > 0 && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <DollarSign className="w-2.5 h-2.5" />{(deal.deal_value / 1000).toFixed(0)}K
                          </span>
                        )}
                        {deal.assigned_to && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" />{deal.assigned_to.split("@")[0]}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(deal => (
            <Card key={deal.id} className="p-4 border-slate-200/60 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800">{deal.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name} {deal.talent_name ? `× ${deal.talent_name}` : ""}</p>
              </div>
              <Badge className={`${getStageColor(deal.status)} text-[10px]`}>{stages.find(s => s.key === deal.status)?.label}</Badge>
              {deal.match_score && <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{deal.match_score}%</Badge>}
              {deal.deal_value > 0 && <span className="text-xs font-medium text-slate-600">${(deal.deal_value / 1000).toFixed(0)}K</span>}
              <Select value={deal.status} onValueChange={v => moveToStage(deal.id, v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{stages.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Card>
          ))}
        </div>
      )}

      {/* Deal Detail Sheet */}
      <Sheet open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedDeal && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-base leading-snug">{selectedDeal.title}</SheetTitle>
                <p className="text-xs text-slate-400">{selectedDeal.brand_name}{selectedDeal.talent_name ? ` × ${selectedDeal.talent_name}` : ""}</p>
              </SheetHeader>

              {/* Assignee */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Assigned To</label>
                <AssigneeSelector
                  value={selectedDeal.assigned_to}
                  onChange={v => {
                    updateMutation.mutate({ id: selectedDeal.id, data: { assigned_to: v } });
                    setSelectedDeal(prev => ({ ...prev, assigned_to: v }));
                  }}
                />
              </div>

              {/* Stage */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Pipeline Stage</label>
                <Select value={selectedDeal.status} onValueChange={v => { moveToStage(selectedDeal.id, v); setSelectedDeal(prev => ({ ...prev, status: v })); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                {[{ key: "notes", label: "Notes", icon: MessageSquare }, { key: "tasks", label: "Tasks", icon: CheckSquare }].map(tab => (
                  <button key={tab.key} onClick={() => setDealTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dealTab === tab.key ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
                    <tab.icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                ))}
              </div>

              {dealTab === "notes" && (
                <DealNotesPanel partnershipId={selectedDeal.id} />
              )}
              {dealTab === "tasks" && (
                <TasksPanel partnershipId={selectedDeal.id} contextLabel={selectedDeal.title} />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Partnership Deal</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Deal Title *</Label><Input value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} placeholder="e.g. Nike × Creator X Sponsorship" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Brand Name</Label><Input value={newDeal.brand_name} onChange={e => setNewDeal({...newDeal, brand_name: e.target.value})} placeholder="Brand" /></div>
              <div><Label>Talent Name</Label><Input value={newDeal.talent_name} onChange={e => setNewDeal({...newDeal, talent_name: e.target.value})} placeholder="Creator" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newDeal.partnership_type} onValueChange={v => setNewDeal({...newDeal, partnership_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["sponsorship","affiliate","ambassador","content_creation","event","product_seeding","licensing"].map(t => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newDeal.priority} onValueChange={v => setNewDeal({...newDeal, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["p0","p1","p2","p3"].map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Deal Value ($)</Label><Input type="number" value={newDeal.deal_value} onChange={e => setNewDeal({...newDeal, deal_value: parseFloat(e.target.value) || 0})} /></div>
            <Button onClick={handleAdd} disabled={!newDeal.title} className="w-full bg-indigo-600 hover:bg-indigo-700">Create Deal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
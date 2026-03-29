import React, { useState } from "react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, DollarSign, ArrowRight, MoreHorizontal, UserCheck, Handshake,
  Upload, Sparkles, FileText, X, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NewDealWizard from "@/components/partnerships/NewDealWizard";
import { EmptyState } from "@/components/ui/empty-state";
import { KanbanSkeleton, ListSkeleton } from "@/components/ui/loading-skeleton";

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
  const [showDeckUpload, setShowDeckUpload] = useState(false);
  const [deckFile, setDeckFile] = useState(null);
  const [deckAnalyzing, setDeckAnalyzing] = useState(false);
  const [deckMatches, setDeckMatches] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: partnerships = [], isLoading, refetch } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partnership.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update.
      await queryClient.cancelQueries({ queryKey: ["partnerships"] });

      // Snapshot the current cache value so we can roll back on error.
      const previous = queryClient.getQueryData(["partnerships"]);

      // Optimistically update the cache with the new status immediately.
      queryClient.setQueryData(["partnerships"], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      // Roll back to the snapshot we captured in onMutate.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["partnerships"], context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure the cache is in sync.
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
    },
  });

  const filtered = partnerships.filter(p => {
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.brand_name?.toLowerCase().includes(search.toLowerCase()) && !p.talent_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const moveToStage = (partnershipId, newStatus) => {
    updateMutation.mutate({ id: partnershipId, data: { status: newStatus } });
  };

  const getStageColor = (status) => stages.find(s => s.key === status)?.color || stages[0].color;

  return (
    <div className="space-y-6">
      <SEO title="Deal Pipeline" description="Manage your active deals and partnership pipeline" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Deal Pipeline</h1>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => setShowDeckUpload(!showDeckUpload)} className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
          <Upload className="w-4 h-4" /> Upload Deck for AI Matching
        </Button>
      </div>

      {/* Deck Upload & AI Matching Panel */}
      {showDeckUpload && (
        <Card className="p-6 border-amber-200 bg-amber-50/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" /> Upload Campaign Deck — AI Auto-Match
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Upload your campaign brief or deck and our AI will analyze it and find the best talent matches within your budget.</p>
            </div>
            <button onClick={() => { setShowDeckUpload(false); setDeckFile(null); setDeckMatches(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!deckMatches ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Upload area */}
              <div
                className="flex-1 border-2 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
                onClick={() => document.getElementById("deck-upload-input").click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#d97706"; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ""; }}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setDeckFile(file);
                }}
              >
                <input id="deck-upload-input" type="file" accept=".pdf,.pptx,.ppt,.docx,.doc" className="hidden" onChange={e => { if (e.target.files[0]) setDeckFile(e.target.files[0]); }} />
                {deckFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-amber-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{deckFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(deckFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Drag & drop your campaign deck</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, PPTX, or DOCX · Max 50MB</p>
                  </>
                )}
              </div>

              {/* What AI extracts */}
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI will extract & match on:</p>
                {["Campaign objectives & KPIs", "Target audience demographics", "Budget range & timeline", "Brand tone & creative direction", "Preferred talent categories"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
                <Button
                  className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
                  disabled={!deckFile || deckAnalyzing}
                  onClick={async () => {
                    setDeckAnalyzing(true);
                    // Simulate AI analysis (replace with real API call)
                    await new Promise(r => setTimeout(r, 2500));
                    setDeckMatches([
                      { name: "Jordan Reeves", type: "NBA Athlete", match: 97, rate: "$85K", reason: "Audience 92% overlap with your target demo, fitness + lifestyle niche alignment" },
                      { name: "Mia Chen", type: "YouTube Creator", match: 94, rate: "$12.5K", reason: "Tech audience match, 6.8% engagement — within your $10-15K tier" },
                      { name: "Zara Ali", type: "Fashion Model", match: 91, rate: "$34K", reason: "Luxury demographic fit, 340K avg views, premium brand alignment" },
                      { name: "Marcus Cole", type: "Podcast Host", match: 88, rate: "$8K", reason: "Finance audience overlap, 120K weekly listeners, strong conversion rates" },
                      { name: "Priya Sharma", type: "Instagram Influencer", match: 85, rate: "$15K", reason: "Food & lifestyle niche, 4.2M followers, 3.8% engagement rate" },
                    ]);
                    setDeckAnalyzing(false);
                  }}
                >
                  {deckAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing deck...</> : <><Sparkles className="w-4 h-4" /> Analyze & Find Matches</>}
                </Button>
              </div>
            </div>
          ) : (
            /* Match Results */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-semibold text-foreground">{deckMatches.length} talent matches found within your budget</h4>
                <button onClick={() => { setDeckMatches(null); setDeckFile(null); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Upload new deck</button>
              </div>
              <div className="space-y-3">
                {deckMatches.map((talent, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-card border rounded-xl hover:border-amber-300 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {talent.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{talent.name}</span>
                        <Badge variant="outline" className="text-[10px]">{talent.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{talent.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-amber-600">{talent.match}%</div>
                      <div className="text-xs text-muted-foreground">{talent.rate}</div>
                    </div>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs flex-shrink-0" onClick={() => setShowAdd(true)}>
                      Send Deal
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white gap-2" onClick={() => setShowAdd(true)}>
                <Handshake className="w-4 h-4" /> Send deal to all {deckMatches.length} matches
              </Button>
            </div>
          )}
        </Card>
      )}

      {isLoading ? (
        view === "pipeline" ? (
          <KanbanSkeleton cols={pipelineStages.length} cardsPerCol={2} className="-mx-4 px-4 lg:-mx-8 lg:px-8" />
        ) : (
          <ListSkeleton count={6} />
        )
      ) : view === "pipeline" ? (
        <div className="relative">
        <div className="absolute inset-y-0 right-0 w-12 pointer-events-none md:hidden z-10" style={{ background: "linear-gradient(to left, var(--background, white), transparent)" }} />
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 snap-x snap-mandatory scroll-smooth">
          {pipelineStages.map(stage => {
            const stageDeals = filtered.filter(p => p.status === stage.key);
            return (
              <div key={stage.key} className="min-w-[260px] sm:min-w-[280px] max-w-[300px] flex-shrink-0 snap-start">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stage.label}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full w-5 h-5 flex items-center justify-center font-bold">{stageDeals.length}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stageDeals.map(deal => (
                    <Card key={deal.id} className="pipeline-card p-4 border-slate-200/60 cursor-pointer" onClick={() => navigate(`/DealDetail?id=${deal.id}`)}>
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
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Handshake />}
          title={search ? "No deals match your search" : "No deals yet"}
          description={search ? "Try a different search term or clear the field." : "Create your first deal to start tracking partnerships."}
          action={search
            ? { label: "Clear search", onClick: () => setSearch(""), variant: "outline" }
            : { label: "New Deal", onClick: () => setShowAdd(true), icon: <Plus className="w-4 h-4" /> }
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(deal => (
            <Card key={deal.id} className="p-4 border-slate-200/60 cursor-pointer hover:border-indigo-200 transition-colors" onClick={() => navigate(`/DealDetail?id=${deal.id}`)}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800">{deal.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name} {deal.talent_name ? `× ${deal.talent_name}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getStageColor(deal.status)} text-[10px]`}>{stages.find(s => s.key === deal.status)?.label}</Badge>
                  {deal.match_score && <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">{deal.match_score}%</Badge>}
                  {deal.deal_value > 0 && <span className="text-xs font-medium text-slate-600">${(deal.deal_value / 1000).toFixed(0)}K</span>}
                  <div onClick={e => e.stopPropagation()}>
                    <Select value={deal.status} onValueChange={v => moveToStage(deal.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{stages.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewDealWizard open={showAdd} onOpenChange={setShowAdd} onCreated={() => refetch()} />
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Users, Sparkles, Loader2, Mail, Linkedin, Phone, ExternalLink,
  PlusCircle, Info, Building2, ShieldCheck, Star, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

// Tier configuration
const TIER_CONFIG = {
  1: { label: "Contact First", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", description: "Decision-maker with direct budget authority. Reach out first." },
  2: { label: "Follow Up", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500", description: "Senior influencer. Follow up after initial contact." },
  3: { label: "CC / Warm Intro", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", description: "Mid-level stakeholder. CC or get a warm intro." },
  4: { label: "Reference Only", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", description: "Peripheral contact. Reference only when relevant." },
};

// Confidence color helper
function confidenceColor(pct) {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-500";
}

export default function ContactFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractBrand, setExtractBrand] = useState("");
  const [extractIndustry, setExtractIndustry] = useState("");
  const [addingOutreach, setAddingOutreach] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query decision_makers filtered by brand name search
  const { data: decisionMakers = [], isLoading, refetch } = useQuery({
    queryKey: ["decision_makers", activeSearch],
    queryFn: () => {
      if (!activeSearch.trim()) return [];
      return base44.entities.DecisionMaker.filter(
        { brand_name: { $regex: activeSearch.trim() } },
        "-created_at",
        50
      );
    },
    enabled: !!activeSearch.trim(),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  // AI Extract decision makers via edge function
  const handleAIExtract = async () => {
    if (!extractBrand.trim()) {
      toast({ title: "Brand name required", description: "Enter a brand name to extract decision-makers.", variant: "destructive" });
      return;
    }
    setExtracting(true);
    try {
      const { data } = await base44.functions.invoke("extractDecisionMakers", {
        brand_name: extractBrand.trim(),
        industry: extractIndustry.trim() || undefined,
      });

      const suggestions = data?.roles || [];
      if (!suggestions.length) {
        toast({ title: "No results", description: "AI could not identify decision-maker roles for that brand type." });
        return;
      }

      // Insert suggested roles as decision_maker rows
      for (const role of suggestions) {
        await base44.entities.DecisionMaker.create({
          brand_name: extractBrand.trim(),
          full_name: role.likely_name || null,
          role_title: role.title,
          role_tier: role.tier ?? 2,
          email: role.email_pattern || null,
          email_confidence: role.email_confidence ?? 0,
          linkedin_url: role.linkedin_url || null,
          source: "ai_extract",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["decision_makers"] });
      setActiveSearch(extractBrand.trim());
      setSearchQuery(extractBrand.trim());

      toast({
        title: `${suggestions.length} roles extracted`,
        description: `AI identified likely decision-maker roles at ${extractBrand}.`,
      });
    } catch (err) {
      toast({
        title: "Extraction failed",
        description: err?.message || "AI extraction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  // Add to outreach: create an outreach_emails row then navigate to Outreach page
  const handleAddToOutreach = async (dm) => {
    setAddingOutreach(dm.id);
    try {
      await base44.entities.OutreachEmail.create({
        recipient_name: dm.full_name || dm.role_title,
        recipient_email: dm.email || "",
        brand_name: dm.brand_name || "",
        subject: `Partnership Opportunity — ${dm.brand_name || "Your Brand"}`,
        body: "",
        status: "draft",
      });

      toast({
        title: "Added to Outreach",
        description: `${dm.full_name || dm.role_title} has been added as a draft outreach.`,
      });

      navigate(createPageUrl("Outreach"));
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Could not add to outreach.",
        variant: "destructive",
      });
    } finally {
      setAddingOutreach(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Finder</h1>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2.5">AI-Powered</Badge>
          </div>
          <p className="text-sm text-slate-500">Find and organize decision-makers at target brands for your outreach.</p>
        </div>

        {/* Tier Legend */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Tier Legend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
                <div key={tier} className={`flex items-start gap-2 p-3 rounded-xl border ${cfg.color}`}>
                  <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${cfg.dot}`} />
                  <div>
                    <p className="text-xs font-bold">Tier {tier}</p>
                    <p className="text-xs font-semibold">{cfg.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80">{cfg.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search + AI Extract */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Manual search */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" /> Search Decision-Makers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Brand name or industry..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                  <Search className="w-4 h-4 mr-1.5" /> Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Extract */}
          <Card className="border-indigo-200/60 bg-gradient-to-br from-indigo-50/40 to-purple-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> AI Extract Decision-Makers
                <Badge className="bg-indigo-100 text-indigo-700 text-[10px] ml-auto">AI</Badge>
              </CardTitle>
              <p className="text-xs text-slate-500">Let AI identify likely decision-maker roles at any brand type.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Brand name (e.g. Nike, Glossier)"
                value={extractBrand}
                onChange={e => setExtractBrand(e.target.value)}
              />
              <Input
                placeholder="Industry (optional, e.g. sportswear, beauty)"
                value={extractIndustry}
                onChange={e => setExtractIndustry(e.target.value)}
              />
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={extracting || !extractBrand.trim()}
                onClick={handleAIExtract}
              >
                {extracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {extracting ? "Analyzing brand..." : "Extract Roles with AI"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Searching decision-makers...</p>
          </div>
        )}

        {!isLoading && activeSearch && decisionMakers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No contacts found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              No decision-makers found for <span className="font-medium">&ldquo;{activeSearch}&rdquo;</span>. Try the AI Extract tool to generate role suggestions.
            </p>
          </div>
        )}

        {!activeSearch && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">Find decision-makers</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Search by brand name or use AI Extract to identify likely decision-makers at any company.
            </p>
          </div>
        )}

        {decisionMakers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                {decisionMakers.length} contact{decisionMakers.length !== 1 ? "s" : ""} found for &ldquo;{activeSearch}&rdquo;
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {decisionMakers.map(dm => {
                const tier = dm.role_tier || 2;
                const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG[2];

                return (
                  <Card key={dm.id} className="border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-4">
                      {/* Header row */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-11 h-11 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm">
                            {(dm.full_name || dm.role_title || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {dm.full_name || "Unknown Name"}
                            </h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-2 py-0.5 font-semibold border cursor-help ${tierCfg.color}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${tierCfg.dot}`} />
                                  Tier {tier}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs font-semibold">{tierCfg.label}</p>
                                <p className="text-xs text-slate-400 max-w-[180px]">{tierCfg.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{dm.role_title || "Unknown Role"}</p>
                          {dm.brand_name && (
                            <p className="text-[11px] text-indigo-600 font-medium truncate">{dm.brand_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="space-y-2">
                        {dm.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-700 truncate flex-1">{dm.email}</span>
                            {dm.email_confidence > 0 && (
                              <span className={`text-[10px] font-semibold flex-shrink-0 ${confidenceColor(dm.email_confidence)}`}>
                                {dm.email_confidence}% conf.
                              </span>
                            )}
                          </div>
                        )}

                        {dm.linkedin_url && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <a
                              href={dm.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 truncate"
                            >
                              LinkedIn Profile
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            </a>
                          </div>
                        )}

                        {dm.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-700">{dm.phone}</span>
                          </div>
                        )}

                        {dm.source && (
                          <div className="flex items-center gap-2">
                            {dm.source === "ai_extract"
                              ? <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                              : <ShieldCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            }
                            <span className="text-[10px] text-slate-400 capitalize">
                              {dm.source === "ai_extract" ? "AI generated" : dm.source}
                            </span>
                            {dm.last_verified_at && (
                              <span className="text-[10px] text-slate-400 ml-auto">
                                Verified {new Date(dm.last_verified_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold"
                        disabled={addingOutreach === dm.id}
                        onClick={() => handleAddToOutreach(dm)}
                      >
                        {addingOutreach === dm.id
                          ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          : <PlusCircle className="w-3 h-3 mr-1.5" />
                        }
                        Add to Outreach
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

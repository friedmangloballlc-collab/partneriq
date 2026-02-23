import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Zap, Users, Target, TrendingUp } from "lucide-react";
import DemographicFilters from "@/components/demographic/DemographicFilters";

export default function DemographicTargetingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [selectedDemographicsFilter, setSelectedDemographicsFilter] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDemographics, setSelectedDemographics] = useState(new Set());
  const [autoMatched, setAutoMatched] = useState(new Set());
  const [demographicFilters, setDemographicFilters] = useState({
    populationMin: "",
    populationMax: "",
    selectedBuyingPower: [],
  });

  // Fetch industries, events, and demographics
  const { data: industries = [] } = useQuery({
    queryKey: ["industries"],
    queryFn: () => base44.entities.IndustryGuide.list(),
  });

  const { data: cultureEvents = [] } = useQuery({
    queryKey: ["cultureEvents"],
    queryFn: () => base44.entities.CultureEvent.list(),
  });

  const { data: megaEvents = [] } = useQuery({
    queryKey: ["megaEvents"],
    queryFn: () => base44.entities.MegaEvent.list(),
  });

  const { data: demographics = [] } = useQuery({
    queryKey: ["demographics"],
    queryFn: () => base44.entities.DemographicSegment.list(),
  });

  // Auto-match demographics when industry/event changes
  useEffect(() => {
    const matched = new Set();

    if (selectedIndustry) {
      const industry = industries.find(i => i.id === selectedIndustry);
      if (industry?.best_demographics) {
        // Parse demographics from industry
        const demosFromIndustry = industry.best_demographics
          .split(",")
          .map(d => d.trim().toLowerCase());
        demographics.forEach(demo => {
          if (demosFromIndustry.some(d => demo.segment_name.toLowerCase().includes(d))) {
            matched.add(demo.id);
          }
        });
      }
    }

    if (selectedEvent) {
      const allEvents = [...cultureEvents, ...megaEvents];
      const event = allEvents.find(e => e.id === selectedEvent);
      if (event?.audience_demographics) {
        // Parse demographics from event (JSON array format)
        try {
          const demosFromEvent = JSON.parse(event.audience_demographics);
          if (Array.isArray(demosFromEvent)) {
            demosFromEvent.forEach(demoId => {
              if (demographics.some(d => d.id === demoId)) {
                matched.add(demoId);
              }
            });
          }
        } catch (e) {
          // Fallback for comma-separated format
          const demosFromEvent = event.audience_demographics
            .split(",")
            .map(d => d.trim().toLowerCase());
          demographics.forEach(demo => {
            if (demosFromEvent.some(d => demo.name?.toLowerCase().includes(d))) {
              matched.add(demo.id);
            }
          });
        }
      }
    }

    setAutoMatched(matched);
  }, [selectedIndustries, selectedEvent, industries, cultureEvents, megaEvents, demographics]);

  const filteredDemographics = useMemo(() => {
    return demographics.filter((d) => {
      const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (
        demographicFilters.populationMin ||
        demographicFilters.populationMax ||
        demographicFilters.selectedBuyingPower.length > 0
      ) {
        const population = parseInt(d.population_size?.replace(/[^0-9]/g, "") || "0");
        if (
          demographicFilters.populationMin &&
          population < parseInt(demographicFilters.populationMin)
        ) {
          return false;
        }
        if (
          demographicFilters.populationMax &&
          population > parseInt(demographicFilters.populationMax)
        ) {
          return false;
        }

        if (demographicFilters.selectedBuyingPower.length > 0) {
          const matchesBuyingPower = demographicFilters.selectedBuyingPower.some(
            (bp) => d.buying_power?.toLowerCase().includes(bp.toLowerCase())
          );
          if (!matchesBuyingPower) return false;
        }
      }

      return true;
    });
  }, [demographics, searchTerm, demographicFilters]);

  const handleToggleDemographic = (id) => {
    const newSelected = new Set(selectedDemographics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDemographics(newSelected);
  };

  const handleAutoSelect = () => {
    setSelectedDemographics(new Set(autoMatched));
  };

  const handleClearSelection = () => {
    setSelectedDemographics(new Set());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Demographic Targeting</h1>
        <p className="text-slate-600 mt-2">
          Auto-match or manually select target demographics based on industries and events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search Industry</CardTitle>
            <CardDescription>Find an industry to get auto-matched demographics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Type industry name..."
                value={industrySearch}
                onChange={(e) => {
                  setIndustrySearch(e.target.value);
                  setShowIndustryDropdown(true);
                }}
                onFocus={() => setShowIndustryDropdown(true)}
                className="pl-10"
              />
            </div>
            {showIndustryDropdown && industrySearch && (
              <div className="absolute z-50 w-full md:w-[calc(33%-8px)] bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                {industries
                  .filter(i => i.industry.toLowerCase().includes(industrySearch.toLowerCase()))
                  .slice(0, 10)
                  .map(industry => (
                    <button
                      key={industry.id}
                      onClick={() => {
                        setSelectedIndustry(industry.id);
                        setIndustrySearch(industry.industry);
                        setShowIndustryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-slate-900">{industry.industry}</div>
                      <div className="text-xs text-slate-500">{industry.sector}</div>
                    </button>
                  ))}
              </div>
            )}
            {selectedIndustry && (
              <Badge variant="outline" className="mt-2">
                {industrySearch}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Event (Optional)</CardTitle>
            <CardDescription>Add an event to refine matches further</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose event (optional)..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value={null}>None</SelectItem>
                {[...cultureEvents, ...megaEvents].map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name || event.event_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Browse Demographics</CardTitle>
            <CardDescription>Select from all available segments</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={Array.from(selectedDemographicsFilter)[0] || ""} 
              onValueChange={(value) => {
                if (value) {
                  setSelectedDemographicsFilter(prev => {
                    const next = new Set(prev);
                    next.add(value);
                    return next;
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose demographics..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {demographics.map(demo => (
                  <SelectItem key={demo.id} value={demo.id}>
                    {demo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDemographicsFilter.size > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {demographics
                  .filter(d => selectedDemographicsFilter.has(d.id))
                  .map(demo => (
                    <Badge 
                      key={demo.id} 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={() => {
                        const next = new Set(selectedDemographicsFilter);
                        next.delete(demo.id);
                        setSelectedDemographicsFilter(next);
                      }}
                    >
                      {demo.name} ✕
                    </Badge>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="auto">
            <Zap className="w-4 h-4 mr-2" /> Auto-Matched
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Users className="w-4 h-4 mr-2" /> Manual Selection
          </TabsTrigger>
          <TabsTrigger value="all">
            <Users className="w-4 h-4 mr-2" /> All Demographics
          </TabsTrigger>
        </TabsList>

        {/* Auto-Matched Tab */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Auto-Matched Demographics ({autoMatched.size})
              </CardTitle>
              <CardDescription>
                Based on selected industry and event data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {autoMatched.size === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select an industry or event to auto-match demographics</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demographics
                    .filter(d => autoMatched.has(d.id))
                    .map(demographic => (
                      <div key={demographic.id} className="p-3 border border-indigo-200 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900">{demographic.name}</h4>
                        {demographic.population_size && (
                          <p className="text-sm text-slate-600 mt-1">Population: {demographic.population_size}</p>
                        )}
                        {demographic.buying_power && (
                          <p className="text-sm text-slate-600">Buying Power: {demographic.buying_power}</p>
                        )}
                        {demographic.media_preferences && (
                          <p className="text-sm text-slate-600 mt-2">
                            Media: {demographic.media_preferences}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {autoMatched.size > 0 && (
                <Button onClick={handleAutoSelect} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Apply Auto-Matched ({autoMatched.size})
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Demographics Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                All Available Demographics
              </CardTitle>
              <CardDescription>
                Complete reference of all demographic segments with detailed insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {demographics.map(demographic => (
                  <div key={demographic.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                    <h4 className="font-semibold text-slate-900 mb-3">{demographic.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {demographic.population_size && (
                        <div>
                          <span className="text-slate-500">Population:</span>
                          <p className="text-slate-900 font-medium">{demographic.population_size}</p>
                        </div>
                      )}
                      {demographic.buying_power && (
                        <div>
                          <span className="text-slate-500">Buying Power:</span>
                          <p className="text-slate-900 font-medium">{demographic.buying_power}</p>
                        </div>
                      )}
                      {demographic.top_events && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500">Top Events:</span>
                          <p className="text-slate-900 font-medium">{demographic.top_events}</p>
                        </div>
                      )}
                      {demographic.key_cultural_moments && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500">Key Cultural Moments:</span>
                          <p className="text-slate-900 font-medium">{demographic.key_cultural_moments}</p>
                        </div>
                      )}
                      {demographic.media_preferences && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500">Media Preferences:</span>
                          <p className="text-slate-900 font-medium">{demographic.media_preferences}</p>
                        </div>
                      )}
                      {demographic.brand_activation_tips && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500">Brand Activation Tips:</span>
                          <p className="text-slate-900 font-medium italic">{demographic.brand_activation_tips}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleDemographic(demographic.id)}
                      className={`mt-3 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        selectedDemographics.has(demographic.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {selectedDemographics.has(demographic.id) ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Selection Tab */}
         <TabsContent value="manual" className="space-y-4">
           <DemographicFilters
             demographics={demographics}
             onFilter={setDemographicFilters}
           />

           <Card>
             <CardHeader>
               <CardTitle className="text-base flex items-center gap-2">
                 <Users className="w-4 h-4 text-purple-600" />
                 Manual Selection ({selectedDemographics.size})
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="relative">
                 <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                 <Input
                   placeholder="Search demographics..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10"
                 />
               </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDemographics.map(demographic => (
                  <div key={demographic.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      id={demographic.id}
                      checked={selectedDemographics.has(demographic.id)}
                      onCheckedChange={() => handleToggleDemographic(demographic.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={demographic.id}
                        className="text-sm font-medium cursor-pointer block text-slate-900"
                      >
                        {demographic.name}
                      </label>
                      {demographic.population_size && (
                        <p className="text-xs text-slate-500 mt-1">Pop: {demographic.population_size}</p>
                      )}
                      {demographic.buying_power && (
                        <p className="text-xs text-slate-500">Power: {demographic.buying_power}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAutoSelect}
                  variant="outline"
                  className="flex-1"
                  disabled={autoMatched.size === 0}
                >
                  Use Auto-Match
                </Button>
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  className="flex-1"
                  disabled={selectedDemographics.size === 0}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Demographics Summary */}
      {selectedDemographics.size > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Selected Demographics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demographics
                .filter(d => selectedDemographics.has(d.id))
                .map(demographic => (
                  <div key={demographic.id} className="bg-white p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-slate-900 mb-2">{demographic.name}</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      {demographic.population_size && <p>📊 {demographic.population_size}</p>}
                      {demographic.buying_power && <p>💰 {demographic.buying_power}</p>}
                      {demographic.media_preferences && (
                        <p>📱 Media: {demographic.media_preferences}</p>
                      )}
                      {demographic.key_cultural_moments && (
                        <p>🎉 {demographic.key_cultural_moments}</p>
                      )}
                      {demographic.activation_tips && (
                        <p className="text-slate-700 italic mt-2">💡 {demographic.activation_tips}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
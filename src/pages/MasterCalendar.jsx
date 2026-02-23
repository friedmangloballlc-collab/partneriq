import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function MasterCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  const { data: cultureEvents = [] } = useQuery({
    queryKey: ["culture_events_master"],
    queryFn: () => base44.entities.CultureEvent.list(),
  });

  const { data: conferences = [] } = useQuery({
    queryKey: ["conferences_master"],
    queryFn: () => base44.entities.Conference.list(),
  });

  const { data: megaEventsData = [] } = useQuery({
    queryKey: ["mega_events_master"],
    queryFn: () => base44.entities.MegaEvent.list(),
  });

  const allEvents = useMemo(() => {
    const combined = [
      ...cultureEvents.map(e => ({
        id: e.id,
        year: e.year,
        month: e.month,
        date: e.dates,
        eventName: e.event_name,
        category: e.category,
        subcategory: e.subcategory,
        audienceReach: e.audience_reach,
        keyDemographics: e.key_demographics,
        bestIndustries: e.best_industries,
        activation: e.activation_opportunities,
        location: e.location,
        tier: e.tier,
        notes: e.notes,
        type: "culture"
      })),
      ...conferences.map(e => ({
        id: e.id,
        year: new Date(e.typical_date || "").getFullYear() || 2026,
        month: new Date(e.typical_date || "").toLocaleString("default", { month: "long" }) || e.typical_date,
        date: e.typical_date,
        eventName: e.conference_name,
        category: "Conferences/Trade",
        subcategory: e.industry_focus,
        audienceReach: e.attendees,
        keyDemographics: e.key_audience,
        bestIndustries: e.best_for_industries,
        activation: e.why_attend,
        location: e.location,
        tier: "2",
        notes: `Sponsorship: ${e.sponsorship_range}`,
        type: "conference"
      })),
      ...megaEventsData.map(e => ({
        id: e.id,
        year: e.year,
        month: e.dates?.split(' ')[0] || "TBD",
        date: e.dates,
        eventName: e.event_name,
        category: "Sports",
        subcategory: "Mega Event",
        audienceReach: e.global_reach,
        keyDemographics: "Global",
        bestIndustries: "All major industries",
        activation: e.key_facts,
        location: "Global",
        tier: "1",
        notes: e.planning_urgency,
        type: "mega"
      }))
    ];
    return combined.sort((a, b) => {
      const yearDiff = a.year - b.year;
      if (yearDiff !== 0) return yearDiff;
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return (months.indexOf(a.month) || 0) - (months.indexOf(b.month) || 0);
    });
  }, [cultureEvents, conferences, megaEventsData]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.bestIndustries?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filterYear === "all" || event.year?.toString() === filterYear;
      const matchesMonth = filterMonth === "all" || event.month === filterMonth;
      const matchesCategory = filterCategory === "all" || event.category === filterCategory;
      const matchesTier = filterTier === "all" || event.tier === filterTier;
      
      return matchesSearch && matchesYear && matchesMonth && matchesCategory && matchesTier;
    });
  }, [allEvents, searchTerm, filterYear, filterMonth, filterCategory, filterTier]);

  const tierColors = {
    "1": "bg-red-100 text-red-800",
    "2": "bg-amber-100 text-amber-800",
    "3": "bg-blue-100 text-blue-800"
  };

  const categoryColors = {
    "Sports": "bg-blue-50",
    "Entertainment": "bg-purple-50",
    "Holiday/Civic": "bg-green-50",
    "Conferences/Trade": "bg-indigo-50",
    "Cultural": "bg-pink-50",
    "Awareness Month": "bg-yellow-50"
  };

  const years = ["2026", "2027", "2028"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const categories = ["Sports", "Entertainment", "Holiday/Civic", "Conferences/Trade", "Cultural", "Awareness Month"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Master Calendar 2026-2028</h1>
        <p className="text-slate-600 mt-2">486+ brand activation opportunities | Complete event database</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search events by name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Month</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Tier</label>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="1">Tier 1 - Mega</SelectItem>
                  <SelectItem value="2">Tier 2 - High Value</SelectItem>
                  <SelectItem value="3">Tier 3 - Growing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filteredEvents.length}</span> events
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Date(s)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Event Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Audience/Reach</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Tier</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Industries</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                      No events match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <tr 
                      key={`${event.id}-${event.type}-${idx}`}
                      className={`border-b hover:bg-slate-50 transition-colors ${categoryColors[event.category] || "bg-white"}`}
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium">{event.year}</td>
                      <td className="px-4 py-3 text-slate-700">{event.month}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{event.date}</td>
                      <td className="px-4 py-3 text-slate-900 font-semibold max-w-xs truncate" title={event.eventName}>
                        {event.eventName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{event.category}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{event.audienceReach}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{event.location}</td>
                      <td className="px-4 py-3">
                        <Badge className={tierColors[event.tier]}>
                          Tier {event.tier}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs max-w-xs truncate" title={event.bestIndustries}>
                        {event.bestIndustries}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{filteredEvents.filter(e => e.tier === "1").length}</div>
            <p className="text-xs text-slate-600 mt-1">Tier 1 Mega Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{filteredEvents.filter(e => e.tier === "2").length}</div>
            <p className="text-xs text-slate-600 mt-1">Tier 2 High-Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{filteredEvents.length}</div>
            <p className="text-xs text-slate-600 mt-1">Total Matching Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
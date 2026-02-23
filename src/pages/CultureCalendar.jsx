import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Calendar, TrendingUp, DollarSign, Zap, Target, AlertCircle, ChevronRight,
  Users, MapPin, Clock
} from "lucide-react";

export default function CultureCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [industryPage, setIndustryPage] = useState(0);

  const { data: events = [] } = useQuery({
    queryKey: ["culture_events"],
    queryFn: () => base44.entities.CultureEvent.list(),
  });

  const { data: conferences = [] } = useQuery({
    queryKey: ["conferences"],
    queryFn: () => base44.entities.Conference.list(),
  });

  const { data: megaEventsData = [] } = useQuery({
    queryKey: ["mega_events"],
    queryFn: () => base44.entities.MegaEvent.list(),
  });

  const { data: industryGuides = [] } = useQuery({
    queryKey: ["industry_guides"],
    queryFn: () => base44.entities.IndustryGuide.list(),
  });

  const categories = ["Sports", "Entertainment", "Holiday/Civic", "Conferences/Trade", "Cultural", "Awareness Month"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2026", "2027", "2028"];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.best_industries?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === "all" || event.tier === selectedTier;
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesMonth = selectedMonth === "all" || event.month === selectedMonth;
      const matchesYear = event.year === parseInt(selectedYear);

      return matchesSearch && matchesTier && matchesCategory && matchesMonth && matchesYear;
    });
  }, [events, searchTerm, selectedTier, selectedCategory, selectedMonth, selectedYear]);

  const megaEvents = filteredEvents.filter(e => e.tier === "1");
  const highValueEvents = filteredEvents.filter(e => e.tier === "2");

  const tierColors = {
    "1": "bg-red-500/10 text-red-700 border-red-200",
    "2": "bg-amber-500/10 text-amber-700 border-amber-200",
    "3": "bg-blue-500/10 text-blue-700 border-blue-200"
  };

  const EventCard = ({ event }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
              {event.event_name}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {event.dates}
            </CardDescription>
          </div>
          <Badge className={tierColors[event.tier]}>
            Tier {event.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-xs truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs truncate">{event.audience_reach}</span>
          </div>
        </div>

        {event.activation_opportunities && (
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p className="font-medium text-slate-700 mb-1">Activation Ideas:</p>
            <p className="text-slate-600 line-clamp-2">{event.activation_opportunities}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {event.best_industries?.split(",").slice(0, 2).map((industry, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {industry.trim()}
            </Badge>
          ))}
          {event.best_industries?.split(",").length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{event.best_industries.split(",").length - 2} more
            </Badge>
          )}
        </div>

        {event.planning_lead_time && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 p-2 rounded">
            <Clock className="w-3 h-3" />
            <span><strong>Lead time:</strong> {event.planning_lead_time}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Culture Calendar 2026-2028</h1>
          <p className="text-slate-600 mt-2">486+ brand activation opportunities across sports, entertainment, and cultural moments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-700">{megaEvents.length}</div>
              <p className="text-xs text-red-600 mt-1">Tier 1 Mega Events</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-700">{highValueEvents.length}</div>
              <p className="text-xs text-amber-600 mt-1">Tier 2 High-Value</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-700">146</div>
              <p className="text-xs text-blue-600 mt-1">Industries Covered</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-indigo-700">{filteredEvents.length}</div>
              <p className="text-xs text-indigo-600 mt-1">Matching Events</p>
            </CardContent>
          </Card>
        </div>
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
            placeholder="Search events by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              <label className="text-xs font-medium text-slate-600 mb-2 block">Event Tier</label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
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

      {/* Events Grid */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendar">Calendar Events ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="mega">Mega Events ({megaEventsData.length})</TabsTrigger>
          <TabsTrigger value="conferences">Conferences ({conferences.length})</TabsTrigger>
          <TabsTrigger value="industries">Industries ({industryGuides.length})</TabsTrigger>
          <TabsTrigger value="tiers">Event Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-6">
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No events match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mega" className="space-y-4 mt-6">
          {megaEvents.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No Tier 1 events match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {megaEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="high" className="space-y-4 mt-6">
          {highValueEvents.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No Tier 2+ events match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {highValueEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mega" className="space-y-4 mt-6">
          {megaEventsData.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No mega events available.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {megaEventsData.map(event => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{event.event_name}</CardTitle>
                    <CardDescription>{event.dates}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Reach:</strong> {event.global_reach}</p>
                    <p><strong>Format:</strong> {event.format_details}</p>
                    <p className="text-amber-600"><strong>Urgency:</strong> {event.planning_urgency}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conferences" className="space-y-4 mt-6">
          {conferences.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No conferences available.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conferences.map(conf => (
                <Card key={conf.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{conf.conference_name}</CardTitle>
                    <CardDescription>{conf.industry_focus}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {conf.typical_date}</p>
                    <p><strong>Location:</strong> {conf.location}</p>
                    <p><strong>Attendees:</strong> {conf.attendees}</p>
                    <p className="text-indigo-600"><strong>Investment:</strong> {conf.sponsorship_range}</p>
                    <p className="text-xs text-slate-600 mt-2">{conf.why_attend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="industries" className="space-y-4 mt-6">
          {industryGuides.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500">No industry guides available.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {industryGuides.map(guide => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-indigo-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{guide.industry}</CardTitle>
                        <CardDescription className="mt-1">{guide.sector}</CardDescription>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">{guide.budget_allocation}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">🏆 Must-Attend Tier 1</p>
                        <p className="text-sm text-slate-700">{guide.priority_tier_1_events}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">⭐ High-Value Tier 2</p>
                        <p className="text-sm text-slate-700">{guide.tier_2_events}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">🗓️ Heritage Moments</p>
                        <p className="text-sm text-slate-700">{guide.heritage_awareness_months}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">🎯 Key Conferences</p>
                        <p className="text-sm text-slate-700">{guide.key_conferences}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">👥 Best Demographics</p>
                        <p className="text-sm text-slate-700">{guide.best_demographics}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">💡 Top Activation Strategies</p>
                        <p className="text-sm text-slate-700">{guide.activation_strategies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4 mt-6">
          <div className="grid gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle>Tier 1: 100M+ US Viewership</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p><strong>Examples:</strong> Super Bowl, World Cup Final, Olympics Opening</p>
                <p className="mt-2"><strong>Best For:</strong> Mass awareness, product launches</p>
                <p className="mt-2"><strong>Lead Time:</strong> 12-24 months</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle>Tier 2: 15-50M US Viewership</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p><strong>Examples:</strong> March Madness Final Four, Golf Majors, Emmy Awards</p>
                <p className="mt-2"><strong>Best For:</strong> Targeted reach, prestige positioning</p>
                <p className="mt-2"><strong>Lead Time:</strong> 6-12 months</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Tier 3: Regional/Niche Events</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p><strong>Examples:</strong> Regional sports, local festivals, conferences</p>
                <p className="mt-2"><strong>Best For:</strong> Hyper-targeted campaigns, community building</p>
                <p className="mt-2"><strong>Lead Time:</strong> 3-6 months</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
            <Zap className="w-5 h-5" />
            Pro Tips for Sponsorship Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-indigo-800">
          <p>✓ <strong>Book Early:</strong> Mega events (Tier 1) require 12-18 months lead time</p>
          <p>✓ <strong>Multi-Event Strategy:</strong> Combine major events with industry-specific moments</p>
          <p>✓ <strong>Budget Smart:</strong> GOOD ($50K-500K) vs BETTER ($500K-5M) vs BEST ($5M+)</p>
          <p>✓ <strong>Competitive Intel:</strong> Check sponsor status to find white-space opportunities</p>
        </CardContent>
      </Card>
    </div>
  );
}
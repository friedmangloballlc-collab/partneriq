import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar, MapPin, Users, ExternalLink, Search, Loader2, Building2,
} from "lucide-react";

const EVENT_TYPES = ["all", "conference", "festival", "trade_show", "award_show", "summit", "expo"];

const typeColors = {
  conference: "bg-blue-100 text-blue-700",
  festival: "bg-purple-100 text-purple-700",
  trade_show: "bg-amber-100 text-amber-700",
  award_show: "bg-pink-100 text-pink-700",
  summit: "bg-indigo-100 text-indigo-700",
  expo: "bg-emerald-100 text-emerald-700",
};

export default function EventsCalendar() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["industry-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("industry_events")
        .select("*")
        .order("start_date", { ascending: true });
      return data || [];
    },
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ["event-sponsors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_event_sponsors")
        .select("*");
      return data || [];
    },
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (typeFilter !== "all" && event.event_type !== typeFilter) return false;
      if (industryFilter && !event.industry?.some((i) => i.toLowerCase().includes(industryFilter.toLowerCase()))) return false;
      if (searchQuery && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [events, typeFilter, industryFilter, searchQuery]);

  const now = new Date();
  const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const upcoming = filteredEvents.filter((e) => {
    const d = new Date(e.start_date);
    return d >= now && d <= threeMonths;
  });
  const allOther = filteredEvents.filter((e) => {
    const d = new Date(e.start_date);
    return d > threeMonths || d < now;
  });

  const getSponsorsForEvent = (eventId) => sponsors.filter((s) => s.event_id === eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Industry Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conferences, festivals, and trade shows where brands and creators connect. {events.length} events tracked.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {EVENT_TYPES.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="text-xs capitalize"
            >
              {type === "all" ? "All" : type.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Upcoming (Next 3 Months)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} sponsors={getSponsorsForEvent(event.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {upcoming.length > 0 ? "All Events" : "Events"} ({filteredEvents.length})
        </h2>
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No events found matching your filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(upcoming.length > 0 ? allOther : filteredEvents).map((event) => (
              <EventCard key={event.id} event={event} sponsors={getSponsorsForEvent(event.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, sponsors }) {
  const startDate = event.start_date ? new Date(event.start_date) : null;
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPast = startDate && startDate < new Date();

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{event.name}</CardTitle>
          <Badge className={typeColors[event.event_type] || "bg-gray-100 text-gray-700"} variant="secondary">
            {(event.event_type || "event").replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 text-xs">
          {startDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {endDate && ` — ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </span>
              {isPast && <Badge variant="outline" className="text-[10px] ml-1">Past</Badge>}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          )}
          {event.estimated_attendees && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{event.estimated_attendees.toLocaleString()} attendees</span>
            </div>
          )}
        </div>

        {event.industry?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.industry.slice(0, 4).map((ind) => (
              <Badge key={ind} variant="outline" className="text-[10px]">{ind}</Badge>
            ))}
            {event.industry.length > 4 && (
              <Badge variant="outline" className="text-[10px]">+{event.industry.length - 4}</Badge>
            )}
          </div>
        )}

        {event.creator_relevance && (
          <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded px-2 py-1.5 leading-relaxed">
            {event.creator_relevance}
          </p>
        )}

        {sponsors.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Sponsors</p>
            <div className="flex flex-wrap gap-1">
              {sponsors.slice(0, 5).map((s) => (
                <Badge key={s.id} variant="secondary" className="text-[10px]">
                  <Building2 className="w-2.5 h-2.5 mr-0.5" />
                  {s.brand_name}
                </Badge>
              ))}
              {sponsors.length > 5 && (
                <Badge variant="secondary" className="text-[10px]">+{sponsors.length - 5}</Badge>
              )}
            </div>
          </div>
        )}

        {event.website_url && (
          <a href={event.website_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="w-full text-xs mt-1">
              <ExternalLink className="w-3 h-3 mr-1.5" /> Visit Website
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}

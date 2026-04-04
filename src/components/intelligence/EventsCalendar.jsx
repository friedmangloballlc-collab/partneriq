/**
 * EventsCalendar
 *
 * Standalone page component showing all industry events where brands and
 * creators connect. Supports filtering by industry, event type, and date range.
 * Events are grouped by month and split into "Upcoming" (next 3 months) and
 * "All Events" sections.
 *
 * Usage (as a page):
 *   <EventsCalendar />
 */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarDays,
  MapPin,
  Users,
  Building2,
  Globe,
  Filter,
  ChevronDown,
  AlertCircle,
  Star,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "conference", label: "Conference" },
  { value: "festival", label: "Festival" },
  { value: "trade_show", label: "Trade Show" },
  { value: "awards", label: "Awards" },
  { value: "summit", label: "Summit" },
  { value: "expo", label: "Expo" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

const EVENT_TYPE_BADGES = {
  conference: "bg-indigo-100 text-indigo-700 border-indigo-200",
  festival: "bg-pink-100 text-pink-700 border-pink-200",
  trade_show: "bg-amber-100 text-amber-700 border-amber-200",
  awards: "bg-yellow-100 text-yellow-700 border-yellow-200",
  summit: "bg-purple-100 text-purple-700 border-purple-200",
  expo: "bg-sky-100 text-sky-700 border-sky-200",
  webinar: "bg-teal-100 text-teal-700 border-teal-200",
  other: "bg-slate-100 text-slate-600 border-slate-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(startDate, endDate) {
  if (!startDate) return "Date TBD";
  const start = new Date(startDate);
  const startStr = `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`;
  if (!endDate) return startStr;
  const end = new Date(endDate);
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${startStr} – ${SHORT_MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function getMonthKey(dateStr) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function groupByMonth(events) {
  const groups = {};
  for (const event of events) {
    const key = getMonthKey(event.start_date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}

function formatAttendees(count) {
  if (!count) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M attendees`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K attendees`;
  return `${count} attendees`;
}

function isWithinNextMonths(dateStr, months) {
  if (!dateStr) return false;
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + months);
  const d = new Date(dateStr);
  return d >= now && d <= cutoff;
}

function isPastDate(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function parseTagArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch {
      return raw.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

// ── Industry Select ───────────────────────────────────────────────────────────

function IndustrySelect({ industries, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
      >
        <option value="">All Industries</option>
        {industries.map(ind => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}

// ── Date Range Select ─────────────────────────────────────────────────────────

function DateRangeSelect({ value, onChange }) {
  const options = [
    { value: "", label: "Any Time" },
    { value: "1", label: "Next Month" },
    { value: "3", label: "Next 3 Months" },
    { value: "6", label: "Next 6 Months" },
    { value: "12", label: "Next 12 Months" },
  ];
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}

// ── Event Type Tabs ───────────────────────────────────────────────────────────

function EventTypeTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {EVENT_TYPES.map(type => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`h-8 px-3 text-xs font-medium rounded-md border transition-colors ${
            value === type.value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

// ── Sponsor Pill ──────────────────────────────────────────────────────────────

function SponsorPill({ brandName, onClick }) {
  return (
    <button
      onClick={() => onClick && onClick(brandName)}
      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
    >
      <Building2 className="w-2.5 h-2.5" />
      {brandName}
    </button>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event, sponsors, onBrandClick, isUpcoming }) {
  const typeKey = event.event_type?.toLowerCase() || "other";
  const typeBadgeCls = EVENT_TYPE_BADGES[typeKey] || EVENT_TYPE_BADGES.other;
  const dateRange = formatDateRange(event.start_date, event.end_date);
  const attendeesLabel = formatAttendees(event.estimated_attendees);
  const past = isPastDate(event.end_date || event.start_date);

  const industryTags = useMemo(
    () => parseTagArray(event.industry_tags || event.industries || event.industry),
    [event.industry_tags, event.industries, event.industry]
  );

  const displaySponsors = sponsors.slice(0, 8);
  const extraSponsors = sponsors.length - displaySponsors.length;

  return (
    <Card className={`border-slate-200/70 hover:shadow-md transition-shadow ${past ? "opacity-60" : ""}`}>
      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {isUpcoming && !past && (
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Upcoming
                </Badge>
              )}
              {event.event_type && (
                <Badge className={`text-[10px] border capitalize ${typeBadgeCls}`}>
                  {event.event_type.replace(/_/g, " ")}
                </Badge>
              )}
              {past && (
                <Badge className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">
                  Past
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 leading-snug">
              {event.event_name || event.name}
            </h3>
          </div>
          {event.website_url && (
            <a
              href={event.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2 flex-shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Globe className="w-3 h-3 mr-1" />
                Website
              </Button>
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <CalendarDays className="w-3 h-3 text-slate-400" />
            {dateRange}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              {event.location}
            </span>
          )}
          {attendeesLabel && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Users className="w-3 h-3 text-slate-400" />
              {attendeesLabel}
            </span>
          )}
        </div>

        {/* Industry tags */}
        {industryTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {industryTags.slice(0, 5).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium"
              >
                {tag}
              </span>
            ))}
            {industryTags.length > 5 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                +{industryTags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Creator relevance */}
        {event.creator_relevance && (
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 bg-slate-50 rounded-md p-2 border border-slate-100">
            <span className="font-semibold text-slate-700">Creator angle: </span>
            {event.creator_relevance}
          </p>
        )}

        {/* Sponsors */}
        {displaySponsors.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">
              Sponsors ({sponsors.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displaySponsors.map(s => (
                <SponsorPill
                  key={s.brand_id || s.brand_name}
                  brandName={s.brand_name || s.brands?.name || "Unknown Brand"}
                  onClick={onBrandClick}
                />
              ))}
              {extraSponsors > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                  +{extraSponsors} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Month Group ───────────────────────────────────────────────────────────────

function MonthGroup({ monthLabel, events, sponsorsByEvent, onBrandClick, upcomingIds }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-bold text-slate-700">{monthLabel}</h3>
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] text-slate-400">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            sponsors={sponsorsByEvent[event.id] || []}
            onBrandClick={onBrandClick}
            isUpcoming={upcomingIds.has(event.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function NoEventsState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <CalendarDays className="w-6 h-6 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">
          {message || "No events found matching your filters."}
        </p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or check back later.</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EventsCalendar() {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState("");

  // ── Events query ───────────────────────────────────────────────────────────
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["industry-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_events")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Sponsors query with brand join ─────────────────────────────────────────
  const {
    data: sponsorRows = [],
    isLoading: sponsorsLoading,
  } = useQuery({
    queryKey: ["brand-event-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_event_sponsors")
        .select("*, brands(id, name)");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Index sponsors by event_id ─────────────────────────────────────────────
  const sponsorsByEvent = useMemo(() => {
    const map = {};
    for (const row of sponsorRows) {
      const key = row.event_id;
      if (!map[key]) map[key] = [];
      map[key].push({
        brand_id: row.brand_id,
        brand_name: row.brands?.name || row.brand_name || null,
        brands: row.brands,
      });
    }
    return map;
  }, [sponsorRows]);

  // ── Collect unique industries across all events ────────────────────────────
  const industries = useMemo(() => {
    const set = new Set();
    for (const event of events) {
      const tags = parseTagArray(event.industry_tags || event.industries || event.industry);
      tags.filter(Boolean).forEach(t => set.add(t));
    }
    return Array.from(set).sort();
  }, [events]);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (selectedType && selectedType !== "all") {
        if (event.event_type?.toLowerCase() !== selectedType) return false;
      }
      if (selectedIndustry) {
        const tags = parseTagArray(event.industry_tags || event.industries || event.industry);
        const hasMatch = tags.some(t =>
          t.toLowerCase().includes(selectedIndustry.toLowerCase())
        );
        if (!hasMatch) return false;
      }
      if (dateRange) {
        const months = parseInt(dateRange, 10);
        if (!isWithinNextMonths(event.start_date, months)) return false;
      }
      return true;
    });
  }, [events, selectedType, selectedIndustry, dateRange]);

  // ── Split into upcoming (next 3 months) vs all ────────────────────────────
  const upcomingEvents = useMemo(
    () => filteredEvents.filter(e => isWithinNextMonths(e.start_date, 3)),
    [filteredEvents]
  );

  const upcomingIds = useMemo(
    () => new Set(upcomingEvents.map(e => e.id)),
    [upcomingEvents]
  );

  // ── Group all filtered events by month ────────────────────────────────────
  const groupedAll = useMemo(() => groupByMonth(filteredEvents), [filteredEvents]);
  const monthKeys = useMemo(() => Object.keys(groupedAll), [groupedAll]);

  const isLoading = eventsLoading || sponsorsLoading;
  const hasActiveFilters = selectedIndustry || selectedType !== "all" || dateRange;

  const handleClearFilters = () => {
    setSelectedIndustry("");
    setSelectedType("all");
    setDateRange("");
  };

  // ── Extensible brand click handler ────────────────────────────────────────
  const handleBrandClick = (brandName) => {
    // Wire to brand detail navigation as needed
    console.log("[EventsCalendar] Brand clicked:", brandName);
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-500" />
          Industry Events Calendar
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Conferences, festivals, and trade shows where brands and creators connect.
        </p>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <IndustrySelect
            industries={industries}
            value={selectedIndustry}
            onChange={setSelectedIndustry}
          />
          <DateRangeSelect value={dateRange} onChange={setDateRange} />
        </div>
        <EventTypeTabs value={selectedType} onChange={setSelectedType} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-24">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading events...</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && eventsError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-slate-600">Failed to load events. Please refresh the page.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !eventsError && filteredEvents.length === 0 && (
        <NoEventsState />
      )}

      {/* Events content */}
      {!isLoading && !eventsError && filteredEvents.length > 0 && (
        <div className="space-y-8">

          {/* Upcoming Events — next 3 months */}
          {upcomingEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-800">Upcoming Events</h2>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                    Next 3 months
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-amber-100" />
                <span className="text-[11px] text-amber-600 font-medium">
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {upcomingEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    sponsors={sponsorsByEvent[event.id] || []}
                    onBrandClick={handleBrandClick}
                    isUpcoming
                  />
                ))}
              </div>
            </section>
          )}

          {/* Divider */}
          {upcomingEvents.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                All Events
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          )}

          {/* All events by month */}
          <section className="space-y-8">
            {monthKeys.map(monthKey => (
              <MonthGroup
                key={monthKey}
                monthLabel={monthKey}
                events={groupedAll[monthKey]}
                sponsorsByEvent={sponsorsByEvent}
                onBrandClick={handleBrandClick}
                upcomingIds={upcomingIds}
              />
            ))}
          </section>

          {/* Footer */}
          <div className="flex items-center justify-center py-4 text-xs text-slate-400">
            Showing {filteredEvents.length} of {events.length} total event{events.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

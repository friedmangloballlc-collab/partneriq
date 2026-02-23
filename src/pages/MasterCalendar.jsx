import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, format } from "date-fns";

export default function MasterCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: cultureEvents = [] } = useQuery({
    queryKey: ["culture_events_calendar"],
    queryFn: () => base44.entities.CultureEvent.list(),
  });

  const { data: conferences = [] } = useQuery({
    queryKey: ["conferences_calendar"],
    queryFn: () => base44.entities.Conference.list(),
  });

  const { data: megaEvents = [] } = useQuery({
    queryKey: ["mega_events_calendar"],
    queryFn: () => base44.entities.MegaEvent.list(),
  });

  const allEvents = useMemo(() => {
    const combined = [
      ...cultureEvents.map(e => ({
        ...e,
        type: "culture",
        eventDate: e.month && e.year ? new Date(e.year, new Date(`${e.month} 1`).getMonth(), parseInt(e.dates?.split('-')[0]?.trim()) || 1) : null
      })),
      ...conferences.map(e => ({
        ...e,
        type: "conference",
        eventDate: e.typical_date ? new Date(e.typical_date) : null
      })),
      ...megaEvents.map(e => ({
        ...e,
        type: "mega",
        eventDate: e.dates ? new Date(e.dates) : null
      }))
    ];
    return combined.filter(e => e.eventDate && !isNaN(e.eventDate.getTime()));
  }, [cultureEvents, conferences, megaEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day) => {
    return allEvents.filter(event => isSameDay(new Date(event.eventDate), day));
  };

  const typeColors = {
    culture: "bg-blue-100 text-blue-800 border-blue-300",
    conference: "bg-purple-100 text-purple-800 border-purple-300",
    mega: "bg-red-100 text-red-800 border-red-300"
  };

  const typeIcons = {
    culture: "🎭",
    conference: "🏢",
    mega: "⭐"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Master Calendar 2026-2028</h1>
        <p className="text-slate-600 mt-2">Complete view of all events, conferences, and mega events</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎭</span>
          <span className="text-sm text-slate-600">Culture Events</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <span className="text-sm text-slate-600">Conferences</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="text-sm text-slate-600">Mega Events</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[120px] p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    isCurrentMonth
                      ? "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  } ${isSameDay(day, selectedDay) ? "border-indigo-500 bg-indigo-100" : ""}`}
                >
                  <div className="text-sm font-semibold mb-1">{format(day, "d")}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={`${event.id}-${event.type}-${idx}`}
                        className={`text-xs p-1 rounded truncate border ${typeColors[event.type]}`}
                        title={event.event_name || event.conference_name}
                      >
                        {typeIcons[event.type]} {event.event_name || event.conference_name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>Events on {format(selectedDay, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getEventsForDay(selectedDay).length === 0 ? (
              <p className="text-slate-500">No events scheduled for this date.</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(selectedDay).map((event, idx) => (
                  <div key={`${event.id}-${event.type}-${idx}`} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {typeIcons[event.type]} {event.event_name || event.conference_name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {event.type === "culture" && `${event.category || ""} • ${event.location || ""}`}
                          {event.type === "conference" && `${event.industry_focus || ""} • ${event.location || ""}`}
                          {event.type === "mega" && event.global_reach}
                        </p>
                      </div>
                      <Badge className={typeColors[event.type]}>
                        {event.type === "culture" && `Tier ${event.tier}`}
                        {event.type === "conference" && "Conference"}
                        {event.type === "mega" && "Mega Event"}
                      </Badge>
                    </div>
                    {event.type === "culture" && (
                      <div className="mt-2 text-sm text-slate-600">
                        <p><strong>Activation:</strong> {event.activation_opportunities}</p>
                      </div>
                    )}
                    {event.type === "conference" && (
                      <div className="mt-2 text-sm text-slate-600">
                        <p><strong>Attendees:</strong> {event.attendees}</p>
                        <p><strong>Sponsorship:</strong> {event.sponsorship_range}</p>
                      </div>
                    )}
                    {event.type === "mega" && (
                      <div className="mt-2 text-sm text-slate-600">
                        <p><strong>Format:</strong> {event.format_details}</p>
                        <p><strong>Planning Urgency:</strong> {event.planning_urgency}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
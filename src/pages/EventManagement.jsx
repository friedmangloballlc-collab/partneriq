import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EventForm from "@/components/eventmanagement/EventForm";
import EventCard from "@/components/eventmanagement/EventCard";
import EventFilters from "@/components/eventmanagement/EventFilters";

export default function EventManagement() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventType, setEventType] = useState("culture"); // "culture" or "mega"
  const [eventFilters, setEventFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    tier: "",
    selectedDemographics: [],
  });
  const queryClient = useQueryClient();

  const { data: cultureEvents = [], isLoading: cultureLoading } = useQuery({
    queryKey: ["cultureEvents"],
    queryFn: () => base44.entities.CultureEvent.list(),
  });

  const { data: megaEvents = [], isLoading: megaLoading } = useQuery({
    queryKey: ["megaEvents"],
    queryFn: () => base44.entities.MegaEvent.list(),
  });

  // Handle navigation state from search - add to existing selections
  useEffect(() => {
    if (location.state?.selectedEvent) {
      const allEvents = [...cultureEvents, ...megaEvents];
      const event = allEvents.find(e => e.id === location.state.selectedEvent);
      if (event) {
        setSelectedEvents(prev => new Set([...prev, location.state.selectedEvent]));
        if (cultureEvents.find(e => e.id === location.state.selectedEvent)) {
          setEventType("culture");
        } else {
          setEventType("mega");
        }
      }
    }
  }, [location.state, cultureEvents, megaEvents]);

  const { data: demographics = [] } = useQuery({
    queryKey: ["demographics"],
    queryFn: () => base44.entities.DemographicSegment.list(),
  });

  const createCultureEventMutation = useMutation({
    mutationFn: (data) => base44.entities.CultureEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultureEvents"] });
      setShowForm(false);
    },
  });

  const updateCultureEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CultureEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultureEvents"] });
      setShowForm(false);
      setEditingEvent(null);
    },
  });

  const deleteCultureEventMutation = useMutation({
    mutationFn: (id) => base44.entities.CultureEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultureEvents"] });
    },
  });

  const createMegaEventMutation = useMutation({
    mutationFn: (data) => base44.entities.MegaEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["megaEvents"] });
      setShowForm(false);
    },
  });

  const updateMegaEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MegaEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["megaEvents"] });
      setShowForm(false);
      setEditingEvent(null);
    },
  });

  const deleteMegaEventMutation = useMutation({
    mutationFn: (id) => base44.entities.MegaEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["megaEvents"] });
    },
  });

  const handleSubmit = (formData) => {
    if (eventType === "culture") {
      if (editingEvent) {
        updateCultureEventMutation.mutate({
          id: editingEvent.id,
          data: formData,
        });
      } else {
        createCultureEventMutation.mutate(formData);
      }
    } else {
      if (editingEvent) {
        updateMegaEventMutation.mutate({
          id: editingEvent.id,
          data: formData,
        });
      } else {
        createMegaEventMutation.mutate(formData);
      }
    }
  };

  const handleDelete = (id) => {
    if (eventType === "culture") {
      deleteCultureEventMutation.mutate(id);
    } else {
      deleteMegaEventMutation.mutate(id);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const currentEvents = eventType === "culture" ? cultureEvents : megaEvents;
  const isLoading = eventType === "culture" ? cultureLoading : megaLoading;

  const filteredEvents = useMemo(() => {
    return currentEvents.filter((event) => {
      if (eventFilters.dateFrom && event.dates) {
        const eventDate = new Date(event.dates);
        const filterDate = new Date(eventFilters.dateFrom);
        if (eventDate < filterDate) return false;
      }

      if (eventFilters.dateTo && event.dates) {
        const eventDate = new Date(event.dates);
        const filterDate = new Date(eventFilters.dateTo);
        if (eventDate > filterDate) return false;
      }

      if (eventFilters.category && event.category !== eventFilters.category) {
        return false;
      }

      if (eventFilters.tier && event.tier !== eventFilters.tier) {
        return false;
      }

      if (eventFilters.selectedDemographics.length > 0) {
        const eventDemos = event.audience_demographics
          ? (typeof event.audience_demographics === 'string' ? JSON.parse(event.audience_demographics) : event.audience_demographics)
          : [];
        const hasMatch = eventFilters.selectedDemographics.some((demoId) =>
          eventDemos.includes(demoId)
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [currentEvents, eventFilters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Event Management</h1>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(!showForm);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <Tabs defaultValue="culture" onValueChange={(val) => {
        setEventType(val);
        setShowForm(false);
        setEditingEvent(null);
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="culture">Culture Events</TabsTrigger>
          <TabsTrigger value="mega">Mega Events</TabsTrigger>
        </TabsList>

        <TabsContent value="culture" className="space-y-4">
          <EventFilters
            eventType="culture"
            demographics={demographics}
            onFilter={setEventFilters}
          />

          {showForm && (
            <EventForm
              event={editingEvent}
              eventType="culture"
              demographics={demographics}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading events...</div>
          ) : currentEvents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <p className="text-slate-500 mb-4">No culture events yet</p>
              <Button
                onClick={() => {
                  setEventType("culture");
                  setShowForm(true);
                }}
                variant="outline"
              >
                Create First Event
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  eventType="culture"
                  demographics={demographics}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mega" className="space-y-4">
          <EventFilters
            eventType="mega"
            demographics={demographics}
            onFilter={setEventFilters}
          />

          {showForm && (
            <EventForm
              event={editingEvent}
              eventType="mega"
              demographics={demographics}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading events...</div>
          ) : currentEvents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <p className="text-slate-500 mb-4">No mega events yet</p>
              <Button
                onClick={() => {
                  setEventType("mega");
                  setShowForm(true);
                }}
                variant="outline"
              >
                Create First Event
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  eventType="mega"
                  demographics={demographics}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function EventCard({ event, eventType, demographics, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const selectedDemographics = event.audience_demographics
    ? (typeof event.audience_demographics === 'string'
        ? JSON.parse(event.audience_demographics)
        : event.audience_demographics)
    : [];
  const demoNames = demographics
    .filter((d) => selectedDemographics.includes(d.id))
    .map((d) => d.name);

  const tierColors = {
    "1": "bg-red-100 text-red-800",
    "2": "bg-amber-100 text-amber-800",
    "3": "bg-blue-100 text-blue-800",
  };

  const categoryColors = {
    Sports: "bg-purple-100 text-purple-800",
    Entertainment: "bg-pink-100 text-pink-800",
    "Holiday/Civic": "bg-red-100 text-red-800",
    "Conferences/Trade": "bg-blue-100 text-blue-800",
    Cultural: "bg-green-100 text-green-800",
    "Awareness Month": "bg-yellow-100 text-yellow-800",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{event.event_name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {eventType === "culture" && event.category && (
                <Badge className={categoryColors[event.category] || "bg-slate-100 text-slate-800"}>
                  {event.category}
                </Badge>
              )}
              {eventType === "culture" && event.tier && (
                <Badge className={tierColors[event.tier] || "bg-slate-100 text-slate-800"}>
                  {event.tier === "1" ? "Tier 1 - Premium" : event.tier === "2" ? "Tier 2 - High Value" : "Tier 3 - Standard"}
                </Badge>
              )}
              {event.year && (
                <Badge variant="outline">{event.year}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {event.dates && (
            <div>
              <p className="text-slate-500 text-xs font-medium">Dates</p>
              <p className="text-slate-900 font-medium">{event.dates}</p>
            </div>
          )}
          {event.location && (
            <div>
              <p className="text-slate-500 text-xs font-medium">Location</p>
              <p className="text-slate-900 font-medium">{event.location}</p>
            </div>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            {event.notes && (
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Description</p>
                <p className="text-slate-700 text-sm">{event.notes}</p>
              </div>
            )}

            {demoNames.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs font-medium mb-2">Target Demographics</p>
                <div className="flex flex-wrap gap-2">
                  {demoNames.map((name) => (
                    <Badge key={name} className="bg-indigo-100 text-indigo-700">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {eventType === "culture" && event.activation_opportunities && (
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Activation Opportunities</p>
                <p className="text-slate-700 text-sm">{event.activation_opportunities}</p>
              </div>
            )}

            {eventType === "mega" && event.global_reach && (
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Global Reach</p>
                <p className="text-slate-700 text-sm">{event.global_reach}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
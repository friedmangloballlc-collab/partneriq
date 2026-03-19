import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function EventForm({ event, eventType, demographics, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(event || {});
  const [selectedDemographics, setSelectedDemographics] = useState(() => {
    if (!event?.audience_demographics) return [];
    return typeof event.audience_demographics === 'string'
      ? JSON.parse(event.audience_demographics)
      : event.audience_demographics;
  });
  const [showDemoSelect, setShowDemoSelect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      audience_demographics: JSON.stringify(selectedDemographics),
    };
    onSubmit(submitData);
  };

  const toggleDemographic = (demoId) => {
    setSelectedDemographics((prev) =>
      prev.includes(demoId) ? prev.filter((id) => id !== demoId) : [...prev, demoId]
    );
  };

  const selectedDemoNames = demographics
    .filter((d) => selectedDemographics.includes(d.id))
    .map((d) => d.name);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Event Name *
          </label>
          <Input
            value={formData.event_name || ""}
            onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
            placeholder="Enter event name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Location
          </label>
          <Input
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          Description
        </label>
        <Textarea
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Event description and details"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Date(s)
          </label>
          <Input
            value={formData.dates || ""}
            onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
            placeholder="e.g., March 15-17, 2026"
          />
        </div>

        {eventType === "culture" && (
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Category
            </label>
            <Select
              value={formData.category || ""}
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Holiday/Civic">Holiday/Civic</SelectItem>
                <SelectItem value="Conferences/Trade">Conferences/Trade</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Awareness Month">Awareness Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {eventType === "culture" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Year
            </label>
            <Input
              type="number"
              value={formData.year || new Date().getFullYear()}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Tier
            </label>
            <Select
              value={formData.tier || ""}
              onValueChange={(val) => setFormData({ ...formData, tier: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1 - Premium</SelectItem>
                <SelectItem value="2">Tier 2 - High Value</SelectItem>
                <SelectItem value="3">Tier 3 - Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Audience Demographics
        </label>
        <button
          type="button"
          onClick={() => setShowDemoSelect(!showDemoSelect)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left text-sm hover:bg-slate-50 transition-colors"
        >
          {selectedDemoNames.length === 0
            ? "Select demographics..."
            : `${selectedDemoNames.length} selected`}
        </button>

        {showDemoSelect && (
          <div className="mt-2 border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {demographics.map((demo) => (
              <label key={demo.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDemographics.includes(demo.id)}
                  onChange={() => toggleDemographic(demo.id)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">{demo.name}</span>
              </label>
            ))}
          </div>
        )}

        {selectedDemoNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedDemoNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
              >
                {name}
                <button
                  type="button"
                  onClick={() =>
                    toggleDemographic(
                      demographics.find((d) => d.name === name)?.id
                    )
                  }
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
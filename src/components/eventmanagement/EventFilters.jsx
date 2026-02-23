import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export default function EventFilters({ eventType, demographics, onFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    tier: "",
    selectedDemographics: [],
  });

  const categories = [
    "Sports",
    "Entertainment",
    "Holiday/Civic",
    "Conferences/Trade",
    "Cultural",
    "Awareness Month",
  ];

  const handleFilterChange = () => {
    onFilter(filters);
  };

  const toggleDemographic = (demoId) => {
    setFilters((prev) => ({
      ...prev,
      selectedDemographics: prev.selectedDemographics.includes(demoId)
        ? prev.selectedDemographics.filter((id) => id !== demoId)
        : [...prev.selectedDemographics, demoId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      category: "",
      tier: "",
      selectedDemographics: [],
    });
    onFilter({
      dateFrom: "",
      dateTo: "",
      category: "",
      tier: "",
      selectedDemographics: [],
    });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.category ||
    filters.tier ||
    filters.selectedDemographics.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900">
          Advanced Filters{" "}
          {hasActiveFilters &&
            `(${
              [filters.dateFrom, filters.dateTo, filters.category, filters.tier]
                .filter(Boolean).length + filters.selectedDemographics.length
            })`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {eventType === "culture" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Category
                </label>
                <Select value={filters.category} onValueChange={(val) =>
                  setFilters({ ...filters, category: val })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tier
                </label>
                <Select value={filters.tier} onValueChange={(val) =>
                  setFilters({ ...filters, tier: val })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All tiers</SelectItem>
                    <SelectItem value="1">Tier 1 - Premium</SelectItem>
                    <SelectItem value="2">Tier 2 - High Value</SelectItem>
                    <SelectItem value="3">Tier 3 - Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Associated Demographics
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {demographics.map((demo) => (
                <label key={demo.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.selectedDemographics.includes(demo.id)}
                    onChange={() => toggleDemographic(demo.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">{demo.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleFilterChange} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="flex-1">
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
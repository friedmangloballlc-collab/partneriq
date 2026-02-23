import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, X } from "lucide-react";

export default function DemographicFilters({ demographics, onFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    populationMin: "",
    populationMax: "",
    selectedBuyingPower: [],
  });

  const buyingPowerOptions = ["Low", "Medium", "High", "Very High"];

  const handleFilterChange = () => {
    onFilter(filters);
  };

  const toggleBuyingPower = (option) => {
    setFilters((prev) => ({
      ...prev,
      selectedBuyingPower: prev.selectedBuyingPower.includes(option)
        ? prev.selectedBuyingPower.filter((o) => o !== option)
        : [...prev.selectedBuyingPower, option],
    }));
  };

  const clearFilters = () => {
    setFilters({
      populationMin: "",
      populationMax: "",
      selectedBuyingPower: [],
    });
    onFilter({
      populationMin: "",
      populationMax: "",
      selectedBuyingPower: [],
    });
  };

  const hasActiveFilters =
    filters.populationMin || filters.populationMax || filters.selectedBuyingPower.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900">
          Advanced Filters {hasActiveFilters && `(${filters.selectedBuyingPower.length + (filters.populationMin ? 1 : 0) + (filters.populationMax ? 1 : 0)})`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Population Range
            </label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-slate-600 mb-1 block">Min</label>
                <Input
                  type="number"
                  placeholder="Min population"
                  value={filters.populationMin}
                  onChange={(e) =>
                    setFilters({ ...filters, populationMin: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-600 mb-1 block">Max</label>
                <Input
                  type="number"
                  placeholder="Max population"
                  value={filters.populationMax}
                  onChange={(e) =>
                    setFilters({ ...filters, populationMax: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Buying Power
            </label>
            <div className="space-y-2">
              {buyingPowerOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.selectedBuyingPower.includes(option)}
                    onChange={() => toggleBuyingPower(option)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
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
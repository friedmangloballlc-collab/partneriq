import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TALENT_CATEGORIES } from "@/lib/talentTypes";

const PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "twitch", "linkedin"];
const CONTRACT_TYPES = ["sponsorship", "affiliate", "ambassador", "content_creation", "partnership", "event", "other"];

export default function MarketplaceFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    budget_min: "",
    budget_max: "",
    contract_type: "",
    niches: [],
    platforms: [],
    minFollowers: "",
  });

  const handleBudgetChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const togglePlatform = (platform) => {
    const updated = {
      ...filters,
      platforms: filters.platforms.includes(platform)
        ? filters.platforms.filter((p) => p !== platform)
        : [...filters.platforms, platform],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleNiche = (niche) => {
    const updated = {
      ...filters,
      niches: filters.niches.includes(niche)
        ? filters.niches.filter((n) => n !== niche)
        : [...filters.niches, niche],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleContractTypeChange = (value) => {
    const updated = { ...filters, contract_type: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    const cleared = {
      budget_min: "",
      budget_max: "",
      contract_type: "",
      niches: [],
      platforms: [],
      minFollowers: "",
    };
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="font-semibold">Budget Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="budget_min" className="text-xs text-slate-600">
                Min ($)
              </Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="5000"
                value={filters.budget_min}
                onChange={(e) => handleBudgetChange("budget_min", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="budget_max" className="text-xs text-slate-600">
                Max ($)
              </Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="50000"
                value={filters.budget_max}
                onChange={(e) => handleBudgetChange("budget_max", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contract Type */}
        <div className="space-y-3">
          <Label htmlFor="contract_type" className="font-semibold">
            Contract Type
          </Label>
          <Select value={filters.contract_type} onValueChange={handleContractTypeChange}>
            <SelectTrigger id="contract_type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All types</SelectItem>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platforms */}
        <div className="space-y-3">
          <Label className="font-semibold">Platforms</Label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.platforms.includes(platform)}
                  onCheckedChange={() => togglePlatform(platform)}
                />
                <label className="text-sm capitalize cursor-pointer">{platform}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Talent Types */}
        <div className="space-y-3">
          <Label className="font-semibold">Talent Types</Label>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {TALENT_CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{cat.category}</p>
                <div className="grid grid-cols-1 gap-1">
                  {cat.types.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.niches.includes(type)}
                        onCheckedChange={() => toggleNiche(type)}
                      />
                      <label className="text-sm cursor-pointer">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Min Followers */}
        <div className="space-y-2">
          <Label htmlFor="minFollowers" className="font-semibold">
            Minimum Followers
          </Label>
          <Input
            id="minFollowers"
            type="number"
            placeholder="10000"
            value={filters.minFollowers}
            onChange={(e) => handleBudgetChange("minFollowers", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex-1"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
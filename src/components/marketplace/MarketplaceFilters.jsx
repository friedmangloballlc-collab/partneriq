import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "twitch", "linkedin"];
const NICHES = ["tech", "lifestyle", "fitness", "beauty", "gaming", "food", "travel", "fashion", "finance", "education", "entertainment", "sports", "music", "health", "business"];
const CONTRACT_TYPES = ["sponsorship", "affiliate", "ambassador", "content_creation", "partnership", "event"];

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
    const newFilters = { ...filters, [field]: value ? parseInt(value) : null };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleContractTypeChange = (value) => {
    const newFilters = { ...filters, contract_type: value || null };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleNiche = (niche) => {
    const newNiches = filters.niches.includes(niche)
      ? filters.niches.filter((n) => n !== niche)
      : [...filters.niches, niche];
    const newFilters = { ...filters, niches: newNiches };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const togglePlatform = (platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter((p) => p !== platform)
      : [...filters.platforms, platform];
    const newFilters = { ...filters, platforms: newPlatforms };
    setFilters(newFilters);
    onFiltersChange(newFilters);
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
      <CardContent className="pt-6 space-y-6">
        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="font-semibold">Budget Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.budget_min}
              onChange={(e) => handleBudgetChange("budget_min", e.target.value)}
              className="w-1/2"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.budget_max}
              onChange={(e) => handleBudgetChange("budget_max", e.target.value)}
              className="w-1/2"
            />
          </div>
        </div>

        {/* Contract Type */}
        <div className="space-y-3">
          <Label className="font-semibold">Contract Type</Label>
          <Select value={filters.contract_type} onValueChange={handleContractTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Types</SelectItem>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platforms */}
        <div className="space-y-3">
          <Label className="font-semibold">Required Platforms</Label>
          <div className="space-y-2">
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

        {/* Niches */}
        <div className="space-y-3">
          <Label className="font-semibold">Niches</Label>
          <div className="grid grid-cols-2 gap-2">
            {NICHES.map((niche) => (
              <div key={niche} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.niches.includes(niche)}
                  onCheckedChange={() => toggleNiche(niche)}
                />
                <label className="text-sm capitalize cursor-pointer">{niche}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Min Followers */}
        <div className="space-y-3">
          <Label className="font-semibold">Minimum Followers</Label>
          <Input
            type="number"
            placeholder="Enter minimum follower count"
            value={filters.minFollowers}
            onChange={(e) => {
              const newFilters = { ...filters, minFollowers: e.target.value };
              setFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
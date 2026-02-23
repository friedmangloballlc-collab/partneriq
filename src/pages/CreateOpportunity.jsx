import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "twitch", "linkedin"];
const NICHES = ["tech", "lifestyle", "fitness", "beauty", "gaming", "food", "travel", "fashion", "finance", "education", "entertainment", "sports", "music", "health", "business"];
const CONTRACT_TYPES = ["sponsorship", "affiliate", "ambassador", "content_creation", "partnership", "event", "other"];

export default function CreateOpportunity() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contract_type: "",
    budget_min: "",
    budget_max: "",
    timeline_start: "",
    timeline_end: "",
    required_platforms: [],
    required_niches: [],
    target_audience_size_min: "",
    target_audience_size_max: "",
    deliverables: "",
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const deliverables = formData.deliverables.split("\n").filter(d => d.trim());
      return base44.entities.MarketplaceOpportunity.create({
        ...formData,
        brand_id: user.id,
        brand_name: user.full_name,
        created_by: user.email,
        status: "published",
        required_platforms: formData.required_platforms.join(","),
        required_niches: formData.required_niches.join(","),
        deliverables: JSON.stringify(deliverables),
        attachment_urls: JSON.stringify([]),
      });
    },
    onSuccess: () => {
      navigate(createPageUrl("Marketplace"));
    },
  });

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      required_platforms: prev.required_platforms.includes(platform)
        ? prev.required_platforms.filter(p => p !== platform)
        : [...prev.required_platforms, platform],
    }));
  };

  const toggleNiche = (niche) => {
    setFormData(prev => ({
      ...prev,
      required_niches: prev.required_niches.includes(niche)
        ? prev.required_niches.filter(n => n !== niche)
        : [...prev.required_niches, niche],
    }));
  };

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Link to={createPageUrl("Marketplace")} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Opportunity</CardTitle>
          <CardDescription>Post a partnership opportunity to find the right talent</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Campaign with TikTok Creators"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the campaign, brand, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">Contract Type *</Label>
              <Select value={formData.contract_type} onValueChange={(value) => setFormData({ ...formData, contract_type: value })}>
                <SelectTrigger id="contract_type">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Budget & Timeline</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Budget Min ($)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  placeholder="5000"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Budget Max ($)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  placeholder="50000"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="timeline_start">Start Date</Label>
                <Input
                  id="timeline_start"
                  type="date"
                  value={formData.timeline_start}
                  onChange={(e) => setFormData({ ...formData, timeline_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline_end">End Date</Label>
                <Input
                  id="timeline_end"
                  type="date"
                  value={formData.timeline_end}
                  onChange={(e) => setFormData({ ...formData, timeline_end: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <h3 className="font-semibold">Deliverables</h3>
            <div className="space-y-2">
              <Label htmlFor="deliverables">List deliverables (one per line)</Label>
              <Textarea
                id="deliverables"
                placeholder="3 TikTok videos&#10;2 Instagram Reels&#10;1 sponsored post"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Required Platforms */}
          <div className="space-y-3">
            <h3 className="font-semibold">Required Platforms</h3>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.required_platforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <label className="text-sm capitalize cursor-pointer">{platform}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Niches */}
          <div className="space-y-3">
            <h3 className="font-semibold">Preferred Niches</h3>
            <div className="grid grid-cols-2 gap-2">
              {NICHES.map((niche) => (
                <div key={niche} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.required_niches.includes(niche)}
                    onCheckedChange={() => toggleNiche(niche)}
                  />
                  <label className="text-sm capitalize cursor-pointer">{niche}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Size */}
          <div className="space-y-4">
            <h3 className="font-semibold">Target Audience Size</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min_followers">Min Followers</Label>
                <Input
                  id="min_followers"
                  type="number"
                  placeholder="10000"
                  value={formData.target_audience_size_min}
                  onChange={(e) => setFormData({ ...formData, target_audience_size_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_followers">Max Followers (optional)</Label>
                <Input
                  id="max_followers"
                  type="number"
                  placeholder="500000"
                  value={formData.target_audience_size_max}
                  onChange={(e) => setFormData({ ...formData, target_audience_size_max: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl("Marketplace"))}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !formData.title || !formData.contract_type}
              className="flex-1"
            >
              {mutation.isPending ? "Creating..." : "Create Opportunity"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
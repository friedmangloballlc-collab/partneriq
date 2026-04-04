import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "twitch", "linkedin"];
const NICHES = ["tech", "lifestyle", "fitness", "beauty", "gaming", "food", "travel", "fashion", "finance", "education", "entertainment", "sports", "music", "health", "business", "parenting", "pets", "automotive", "real_estate", "wedding", "art_design", "photography", "diy_home", "sustainability", "crypto_web3", "outdoor_adventure", "luxury", "saas_tools", "skincare", "streetwear", "mental_health", "airlines_travel", "hospitality", "wine_spirits", "cosmetics", "sporting_goods", "telecom", "insurance", "restaurants", "pharma_otc", "elearning", "clean_energy", "jewelry_watches"];
const CONTRACT_TYPES = ["sponsorship", "affiliate", "ambassador", "content_creation", "partnership", "event", "other"];

// ─── Zod schema ──────────────────────────────────────────────────────────────

const opportunitySchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .min(5, "Title must be at least 5 characters")
      .max(120, "Title must be 120 characters or fewer"),
    description: z
      .string()
      .min(1, "Description is required")
      .min(20, "Please provide at least 20 characters of detail"),
    contract_type: z
      .string()
      .min(1, "Please select a contract type"),
    budget_min: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Budget min must be a positive number",
      }),
    budget_max: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Budget max must be a positive number",
      }),
    timeline_start: z.string().optional(),
    timeline_end: z.string().optional(),
    deliverables: z.string().optional(),
    target_audience_size_min: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Min followers must be a positive number",
      }),
    target_audience_size_max: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Max followers must be a positive number",
      }),
  })
  .refine(
    (data) => {
      if (data.budget_min && data.budget_max) {
        return Number(data.budget_min) <= Number(data.budget_max);
      }
      return true;
    },
    { message: "Budget min cannot exceed budget max", path: ["budget_max"] }
  )
  .refine(
    (data) => {
      if (data.timeline_start && data.timeline_end) {
        return data.timeline_start <= data.timeline_end;
      }
      return true;
    },
    { message: "End date must be on or after the start date", path: ["timeline_end"] }
  )
  .refine(
    (data) => {
      if (data.target_audience_size_min && data.target_audience_size_max) {
        return Number(data.target_audience_size_min) <= Number(data.target_audience_size_max);
      }
      return true;
    },
    { message: "Max followers must be greater than min followers", path: ["target_audience_size_max"] }
  );

// ─── Inline field error ───────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export default function CreateOpportunity() {
  const { user } = useAuth();

  // Checkbox arrays are kept as local state because they aren't standard RHF inputs
  const [requiredPlatforms, setRequiredPlatforms] = useState([]);
  const [requiredNiches, setRequiredNiches] = useState([]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      contract_type: "",
      budget_min: "",
      budget_max: "",
      timeline_start: "",
      timeline_end: "",
      deliverables: "",
      target_audience_size_min: "",
      target_audience_size_max: "",
    },
  });

  const { isPaidPlan } = useFeatureGate();
  const FREE_OPPORTUNITY_LIMIT = 3;

  const { data: existingOpportunities = [] } = useQuery({
    queryKey: ["my-opportunities-count", user?.email],
    queryFn: () => user?.email ? base44.entities.MarketplaceOpportunity.filter({ created_by: user.email }) : [],
    enabled: !!user?.email,
  });

  const atFreeLimit = !isPaidPlan && existingOpportunities.length >= FREE_OPPORTUNITY_LIMIT;

  const mutation = useMutation({
    mutationFn: async (data) => {
      const deliverables = (data.deliverables || "").split("\n").filter((d) => d.trim());
      return base44.entities.MarketplaceOpportunity.create({
        ...data,
        brand_id: user.id,
        brand_name: user.full_name,
        created_by: user.email,
        status: "published",
        required_platforms: requiredPlatforms.join(","),
        required_niches: requiredNiches.join(","),
        deliverables: JSON.stringify(deliverables),
        attachment_urls: JSON.stringify([]),
      });
    },
    onSuccess: () => {
      navigate(createPageUrl("Marketplace"));
    },
  });

  const togglePlatform = (platform) => {
    setRequiredPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const toggleNiche = (niche) => {
    setRequiredNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Link to={createPageUrl("Marketplace")} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {atFreeLimit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Free plan limit reached</p>
              <p className="text-sm text-amber-700">
                You've used all {FREE_OPPORTUNITY_LIMIT} opportunities on the free plan.{" "}
                <Link to={createPageUrl("SubscriptionManagement")} className="underline font-medium">
                  Upgrade to create unlimited opportunities
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Opportunity</CardTitle>
          <CardDescription>Post a partnership opportunity to find the right talent</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Campaign with TikTok Creators"
                  className={errors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
                  {...register("title")}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the campaign, brand, and what you're looking for..."
                  rows={4}
                  className={errors.description ? "border-red-400 focus-visible:ring-red-400" : ""}
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_type">Contract Type *</Label>
                <Controller
                  name="contract_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="contract_type"
                        className={errors.contract_type ? "border-red-400 focus:ring-red-400" : ""}
                      >
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
                  )}
                />
                <FieldError message={errors.contract_type?.message} />
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
                    className={errors.budget_min ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("budget_min")}
                  />
                  <FieldError message={errors.budget_min?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="50000"
                    className={errors.budget_max ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("budget_max")}
                  />
                  <FieldError message={errors.budget_max?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="timeline_start">Start Date</Label>
                  <Input
                    id="timeline_start"
                    type="date"
                    className={errors.timeline_start ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("timeline_start")}
                  />
                  <FieldError message={errors.timeline_start?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline_end">End Date</Label>
                  <Input
                    id="timeline_end"
                    type="date"
                    className={errors.timeline_end ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("timeline_end")}
                  />
                  <FieldError message={errors.timeline_end?.message} />
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
                  placeholder={"3 TikTok videos\n2 Instagram Reels\n1 sponsored post"}
                  rows={3}
                  {...register("deliverables")}
                />
              </div>
            </div>

            {/* Required Platforms — uncontrolled checkboxes, no Zod needed */}
            <div className="space-y-3">
              <h3 className="font-semibold">Required Platforms</h3>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Checkbox
                      checked={requiredPlatforms.includes(platform)}
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
                      checked={requiredNiches.includes(niche)}
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
                  <Label htmlFor="target_audience_size_min">Min Followers</Label>
                  <Input
                    id="target_audience_size_min"
                    type="number"
                    placeholder="10000"
                    className={errors.target_audience_size_min ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("target_audience_size_min")}
                  />
                  <FieldError message={errors.target_audience_size_min?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_audience_size_max">Max Followers (optional)</Label>
                  <Input
                    id="target_audience_size_max"
                    type="number"
                    placeholder="500000"
                    className={errors.target_audience_size_max ? "border-red-400 focus-visible:ring-red-400" : ""}
                    {...register("target_audience_size_max")}
                  />
                  <FieldError message={errors.target_audience_size_max?.message} />
                </div>
              </div>
            </div>

            {/* Mutation error */}
            {mutation.isError && (
              <p className="text-sm text-red-500">
                Failed to create opportunity. Please try again.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl("Marketplace"))}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || atFreeLimit}
                className="flex-1"
              >
                {atFreeLimit ? "Upgrade to Create More" : mutation.isPending ? "Creating..." : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

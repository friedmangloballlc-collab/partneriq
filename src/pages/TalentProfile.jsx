import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PortfolioManager from "@/components/talent/PortfolioManager";
import MediaKitGenerator from "@/components/talent/MediaKitGenerator";
import VideoPitchStudio from "@/components/talent/VideoPitchStudio";

const COLLABORATION_TYPES = [
  "sponsorship",
  "affiliate",
  "ambassador",
  "content_creation",
  "partnership",
  "event",
];

const AVAILABILITY_OPTIONS = [
  { value: "actively_looking", label: "Actively Looking for Collaborations" },
  { value: "open_for_offers", label: "Open for Offers" },
  { value: "limited_availability", label: "Limited Availability" },
  { value: "not_available", label: "Not Available" },
];

export default function TalentProfile() {
  const [user, setUser] = useState(null);
  const [talentData, setTalentData] = useState(null);
  const [formData, setFormData] = useState({
    expertise_areas: "",
    preferred_collaboration_types: [],
    availability_status: "open_for_offers",
    portfolio: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const authUser = await base44.auth.me();
      setUser(authUser);

      if (authUser.email) {
        const talents = await base44.entities.Talent.filter({ email: authUser.email });
        if (talents.length > 0) {
          const talent = talents[0];
          setTalentData(talent);
          setFormData({
            expertise_areas: talent.expertise_areas || "",
            preferred_collaboration_types: talent.preferred_collaboration_types
              ? JSON.parse(talent.preferred_collaboration_types)
              : [],
            availability_status: talent.availability_status || "open_for_offers",
            portfolio: talent.portfolio ? JSON.parse(talent.portfolio) : [],
          });
        } else {
          // Create a placeholder talent record if none exists
          setTalentData({ id: "new", email: authUser.email });
        }
      }
    };
    loadProfile();
  }, []);

  const handleToggleCollaborationType = (type) => {
    setFormData((prev) => ({
      ...prev,
      preferred_collaboration_types: prev.preferred_collaboration_types.includes(type)
        ? prev.preferred_collaboration_types.filter((t) => t !== type)
        : [...prev.preferred_collaboration_types, type],
    }));
  };

  const handleSave = async () => {
    if (!talentData?.id) return;

    setIsSaving(true);
    try {
      if (talentData.id === "new") {
        // Create new talent record
        const newTalent = await base44.entities.Talent.create({
          email: user.email,
          name: user.full_name,
          expertise_areas: formData.expertise_areas,
          preferred_collaboration_types: JSON.stringify(
            formData.preferred_collaboration_types
          ),
          availability_status: formData.availability_status,
          portfolio: JSON.stringify(formData.portfolio),
          primary_platform: "instagram",
        });
        setTalentData(newTalent);
      } else {
        // Update existing talent record
        await base44.entities.Talent.update(talentData.id, {
          expertise_areas: formData.expertise_areas,
          preferred_collaboration_types: JSON.stringify(
            formData.preferred_collaboration_types
          ),
          availability_status: formData.availability_status,
          portfolio: JSON.stringify(formData.portfolio),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !talentData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Link
        to={createPageUrl("Dashboard")}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Talent Profile</CardTitle>
              <CardDescription>
                Showcase your expertise, availability, and past collaborations
              </CardDescription>
            </div>
            {talentData?.video_pitch_url && (
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 gap-1 shrink-0">
                <Video className="w-3 h-3" />
                Pitch Video Live
              </Badge>
            )}
          </div>
          {talentData?.video_pitch_url && (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black">
              <video
                src={talentData.video_pitch_url}
                controls
                className="w-full max-h-64 object-contain"
                aria-label="Your video pitch"
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Expertise Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Areas of Expertise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expertise">
              List your expertise areas (e.g., product reviews, storytelling, tutorials)
            </Label>
            <Textarea
              id="expertise"
              placeholder="Product reviews, Tutorial content, Lifestyle storytelling"
              value={formData.expertise_areas}
              onChange={(e) =>
                setFormData({ ...formData, expertise_areas: e.target.value })
              }
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Separate multiple areas with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Collaboration Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferred Collaboration Types</CardTitle>
          <CardDescription>
            Select the types of collaborations you're interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {COLLABORATION_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.preferred_collaboration_types.includes(type)}
                  onCheckedChange={() => handleToggleCollaborationType(type)}
                />
                <label className="text-sm capitalize cursor-pointer">
                  {type.replace(/_/g, " ")}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Status</CardTitle>
          <CardDescription>
            Let brands know your current availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={formData.availability_status}
            onValueChange={(value) =>
              setFormData({ ...formData, availability_status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Badge */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Preview</Label>
            <Badge
              className={
                formData.availability_status === "actively_looking"
                  ? "bg-green-100 text-green-800"
                  : formData.availability_status === "open_for_offers"
                    ? "bg-blue-100 text-blue-800"
                    : formData.availability_status === "limited_availability"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
              }
            >
              {AVAILABILITY_OPTIONS.find(
                (opt) => opt.value === formData.availability_status
              )?.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <PortfolioManager
        portfolio={formData.portfolio}
        onChange={(portfolio) => setFormData({ ...formData, portfolio })}
      />

      {/* Video Pitch Studio */}
      <VideoPitchStudio
        talentId={talentData?.id !== "new" ? talentData?.id : null}
        existingUrl={talentData?.video_pitch_url || null}
        onSaved={(url) => setTalentData((prev) => ({ ...prev, video_pitch_url: url }))}
      />

      {/* Media Kit Generator */}
      <MediaKitGenerator talentData={talentData?.id !== "new" ? talentData : null} />

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate(createPageUrl("Dashboard"))}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
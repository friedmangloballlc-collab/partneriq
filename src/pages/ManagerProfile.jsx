import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User, Music, Mic, Trophy, Globe, Mail, Phone, MapPin, Instagram, Youtube, Twitter, Save, Upload, Star, TrendingUp, DollarSign, BarChart3, Shield } from "lucide-react";

const TALENT_CATEGORIES = [
  "Athlete", "Actor", "Chef", "Coach", "Consultant", "Creator", "Designer",
  "Gamer", "Model", "Musician", "Podcaster", "Speaker", "Influencer", "Other"
];

export default function ManagerProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [managerProfile, setManagerProfile] = useState(null);
  const [talentProfile, setTalentProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [form, setForm] = useState({
    talent_name: "",
    talent_email: "",
    talent_phone: "",
    talent_category: "",
    talent_bio: "",
    talent_location: "",
    talent_website: "",
    talent_instagram: "",
    talent_youtube: "",
    talent_tiktok: "",
    talent_twitter: "",
    talent_spotify: "",
    talent_rate_min: "",
    talent_rate_max: "",
    talent_expertise: "",
    talent_achievements: "",
    manager_commission: "15",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      // Load manager's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setManagerProfile(profile);

      // Load talent profile managed by this manager
      const { data: talent } = await supabase
        .from("talents")
        .select("*")
        .eq("created_by_manager", authUser.id)
        .single();

      if (talent) {
        setTalentProfile(talent);
        setForm(prev => ({
          ...prev,
          talent_name: talent.name || "",
          talent_email: talent.email || "",
          talent_phone: talent.phone || "",
          talent_category: talent.category || "",
          talent_bio: talent.bio || "",
          talent_location: talent.location || "",
          talent_website: talent.website || "",
          talent_instagram: talent.instagram || "",
          talent_youtube: talent.youtube || "",
          talent_tiktok: talent.tiktok || "",
          talent_twitter: talent.twitter || "",
          talent_spotify: talent.spotify || "",
          talent_rate_min: talent.rate_min?.toString() || "",
          talent_rate_max: talent.rate_max?.toString() || "",
          talent_expertise: talent.expertise || "",
          talent_achievements: talent.achievements || "",
          manager_commission: talent.manager_commission?.toString() || "15",
        }));
        if (talent.avatar_url) setAvatarPreview(talent.avatar_url);
      }
    } catch (err) {
      console.error("Error loading manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = talentProfile?.avatar_url || null;

      // Upload avatar if changed
      if (avatarFile && user) {
        const ext = avatarFile.name.split(".").pop();
        const path = `talent-avatars/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const talentData = {
        name: form.talent_name,
        email: form.talent_email,
        phone: form.talent_phone,
        category: form.talent_category,
        bio: form.talent_bio,
        location: form.talent_location,
        website: form.talent_website,
        instagram: form.talent_instagram,
        youtube: form.talent_youtube,
        tiktok: form.talent_tiktok,
        twitter: form.talent_twitter,
        spotify: form.talent_spotify,
        rate_min: form.talent_rate_min ? parseInt(form.talent_rate_min) : null,
        rate_max: form.talent_rate_max ? parseInt(form.talent_rate_max) : null,
        expertise: form.talent_expertise,
        achievements: form.talent_achievements,
        manager_commission: parseInt(form.manager_commission) || 15,
        avatar_url: avatarUrl,
      };

      if (talentProfile?.id) {
        // Update existing talent
        await supabase.from("talents").update(talentData).eq("id", talentProfile.id);
      } else {
        // Create new talent profile
        talentData.created_by_manager = user.id;
        talentData.status = "active";
        const { data: newTalent } = await supabase.from("talents").insert(talentData).select().single();
        if (newTalent) {
          setTalentProfile(newTalent);
          // Link manager to talent
          await supabase.from("profiles").update({ manager_of: newTalent.id }).eq("id", user.id);
        }
      }

      toast({ title: "Saved", description: "Artist profile updated successfully." });
    } catch (err) {
      console.error("Error saving:", err);
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Talent</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {talentProfile ? "Manage your talent's profile and information" : "Set up your talent's profile to start managing deals"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !form.talent_name}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Verification Status */}
      {managerProfile?.manager_verification_status && (
        <Card className={`border-l-4 ${managerProfile.manager_verification_status === "approved" ? "border-l-green-500 bg-green-50" : managerProfile.manager_verification_status === "pending" ? "border-l-amber-500 bg-amber-50" : "border-l-red-500 bg-red-50"}`}>
          <CardContent className="flex items-center gap-3 py-3">
            <Shield className={`w-5 h-5 ${managerProfile.manager_verification_status === "approved" ? "text-green-600" : "text-amber-600"}`} />
            <div>
              <p className="text-sm font-medium text-foreground">
                Verification: {managerProfile.manager_verification_status === "approved" ? "Verified Manager" : managerProfile.manager_verification_status === "pending" ? "Verification Pending" : "Verification Required"}
              </p>
              <p className="text-xs text-muted-foreground">
                {managerProfile.manager_verification_status === "pending" ? "Your management documents are being reviewed." : managerProfile.manager_verification_status === "approved" ? "You are a verified talent manager." : "Upload management agreement to get verified."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Talent Photo & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Talent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Artist" className="w-full h-full object-cover" width={96} height={96} loading="lazy" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">Talent Photo</p>
              <p className="text-xs text-muted-foreground">Upload a professional headshot. This appears on their media kit and public profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Talent Name *</label>
              <Input value={form.talent_name} onChange={e => updateField("talent_name", e.target.value)} placeholder="Full legal or stage name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Category *</label>
              <select value={form.talent_category} onChange={e => updateField("talent_category", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select category...</option>
                {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_email} onChange={e => updateField("talent_email", e.target.value)} placeholder="artist@example.com" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_phone} onChange={e => updateField("talent_phone", e.target.value)} placeholder="+1 (555) 000-0000" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_location} onChange={e => updateField("talent_location", e.target.value)} placeholder="City, State" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_website} onChange={e => updateField("talent_website", e.target.value)} placeholder="https://..." className="pl-10" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
            <Textarea value={form.talent_bio} onChange={e => updateField("talent_bio", e.target.value)} placeholder="Write a compelling bio for your artist..." rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_instagram} onChange={e => updateField("talent_instagram", e.target.value)} placeholder="@handle" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">YouTube</label>
              <div className="relative">
                <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_youtube} onChange={e => updateField("talent_youtube", e.target.value)} placeholder="Channel URL or @handle" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">TikTok</label>
              <div className="relative">
                <Music className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_tiktok} onChange={e => updateField("talent_tiktok", e.target.value)} placeholder="@handle" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Twitter / X</label>
              <div className="relative">
                <Twitter className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_twitter} onChange={e => updateField("talent_twitter", e.target.value)} placeholder="@handle" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Spotify</label>
              <div className="relative">
                <Mic className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input value={form.talent_spotify} onChange={e => updateField("talent_spotify", e.target.value)} placeholder="Spotify artist URL" className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates & Commission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Rates & Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Min Rate (per deal)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input type="number" value={form.talent_rate_min} onChange={e => updateField("talent_rate_min", e.target.value)} placeholder="5,000" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Max Rate (per deal)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input type="number" value={form.talent_rate_max} onChange={e => updateField("talent_rate_max", e.target.value)} placeholder="50,000" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Your Commission %</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input type="number" value={form.manager_commission} onChange={e => updateField("manager_commission", e.target.value)} placeholder="15" min="1" max="50" className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Standard: 10-20%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" /> Expertise & Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Areas of Expertise</label>
            <Textarea value={form.talent_expertise} onChange={e => updateField("talent_expertise", e.target.value)} placeholder="Brand partnerships, live events, product launches, endorsements..." rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Notable Achievements</label>
            <Textarea value={form.talent_achievements} onChange={e => updateField("talent_achievements", e.target.value)} placeholder="Previous brand deals, awards, milestones, press features..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Plan Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Single Artist Plan</p>
              <p className="text-xs text-muted-foreground">Managing 1 talent profile. Need to manage more talent? Upgrade to Multi-Artist.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/SubscriptionManagement"}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving || !form.talent_name} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Talent Profile"}
        </Button>
      </div>
    </div>
  );
}

/**
 * OnboardingWizard — multi-step guided wizard shown on the Dashboard
 * for logged-in users who have not yet completed onboarding.
 *
 * Steps (onboarding_step column in profiles):
 *   0 → not started / wizard visible
 *   1 → completed "Connect Socials"
 *   2 → completed "Build Profile"
 *   3 → completed "Set Goals"
 *   4 → completed "Start Data Room" → wizard hidden
 *
 * The wizard persists step progress to the profiles table via
 * base44.auth.updateMe({ onboarding_step: N }).
 */
import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Facebook,
  Music2,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Target,
  Database,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  DollarSign,
  Zap,
  SkipForward,
} from "lucide-react";
import { createPageUrl } from "@/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: "socials",   label: "Connect Socials",  icon: Zap },
  { id: "profile",   label: "Build Profile",    icon: Sparkles },
  { id: "goals",     label: "Set Goals",        icon: Target },
  { id: "dataroom",  label: "Data Room",        icon: Database },
];

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: Music2,
    color: "from-slate-800 to-slate-900",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  {
    key: "twitter",
    label: "X / Twitter",
    icon: Twitter,
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-indigo-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
  },
];

const NICHES = [
  "Fashion", "Beauty", "Fitness", "Food & Beverage", "Travel", "Gaming",
  "Tech", "Finance", "Wellness", "Entertainment", "Sports", "Education",
  "Parenting", "Home & Lifestyle", "Music", "Comedy", "Business", "Arts",
];

const TALENT_DEAL_TYPES = [
  { key: "sponsorship",       label: "Sponsored Posts",       icon: "💰" },
  { key: "affiliate",         label: "Affiliate / CPA",        icon: "🔗" },
  { key: "ambassador",        label: "Brand Ambassador",       icon: "🤝" },
  { key: "content_creation",  label: "Content Creation",       icon: "🎥" },
  { key: "event",             label: "Event Appearances",      icon: "🎤" },
  { key: "product_seeding",   label: "Product Gifting",        icon: "📦" },
  { key: "licensing",         label: "Licensing / IP Deals",   icon: "📜" },
  { key: "collab",            label: "Collab / Co-Creation",   icon: "✨" },
];

const BRAND_AUDIENCES = [
  "Gen Z (16–24)", "Millennials (25–40)", "Gen X (41–56)", "Boomers (57+)",
  "Parents", "Professionals", "Students", "Athletes",
  "Homeowners", "Tech Enthusiasts", "Travelers", "Gamers",
];

const BRAND_PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Facebook", "Twitch", "Pinterest",
];

const INDUSTRY_SECTORS = [
  "Consumer Goods", "Fashion & Apparel", "Beauty & Personal Care",
  "Food & Beverage", "Technology", "Gaming", "Finance & Fintech",
  "Health & Wellness", "Travel & Hospitality", "Entertainment", "Sports", "Education",
  "Automotive", "Real Estate", "Pet Care", "Home & Lifestyle",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2 w-full">
      {WIZARD_STEPS.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? "text-indigo-700" : done ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div
                className={`flex-1 h-px transition-colors duration-300 ${
                  done ? "bg-indigo-400" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Connect Socials ──────────────────────────────────────────────────

function StepConnectSocials({ onNext, onSkip }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Connect Your Socials</h2>
        <p className="text-sm text-slate-500 mt-1">
          Link your social accounts so brands can verify your reach and for AI-powered match scoring.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <Link
              key={platform.key}
              to={createPageUrl("ConnectAccounts")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border ${platform.bg} ${platform.border} hover:shadow-md transition-all duration-200 group`}
            >
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${platform.text} truncate`}>
                  {platform.label}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-0.5">
                  Connect <ArrowRight className="w-2.5 h-2.5" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex gap-3">
        <TrendingUp className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Profiles with verified social accounts receive <strong>4.7x more brand inquiries</strong>{" "}
          and higher AI match scores across all deal types.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
          Skip for now
        </button>
        <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Build Profile ────────────────────────────────────────────────────

function StepBuildProfile({ user, onNext, onPrev, onSkip }) {
  const [bio, setBio] = useState("");
  const [rateCard, setRateCard] = useState("");
  const [selectedNiches, setSelectedNiches] = useState([]);

  const toggleNiche = useCallback((niche) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }, []);

  const handleNext = () => {
    // Save non-critically — best effort; don't block wizard progress
    base44.auth.updateMe({
      bio: bio || undefined,
      rate_card: rateCard || undefined,
      niches: selectedNiches.length ? selectedNiches : undefined,
    }).catch(() => {});
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Build Your Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          A strong profile signals professionalism and gets matched to better brand deals.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          Your Bio
          <span className="ml-2 text-xs font-normal text-slate-400">
            (AI will auto-draft from connected socials once verified)
          </span>
        </Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="E.g., Fashion & lifestyle creator with 500K+ followers across Instagram and TikTok. Known for authentic storytelling and high-engagement content."
          className="resize-none min-h-[90px] text-sm"
          maxLength={400}
        />
        <p className="text-xs text-slate-400 text-right">{bio.length}/400</p>
      </div>

      {/* Rate Card */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          Starting Rate / Deal Floor
          <span className="ml-2 text-xs font-normal text-slate-400">
            Market avg: $500–$5,000 per post for 100K followers
          </span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <Input
            type="number"
            min={0}
            value={rateCard}
            onChange={(e) => setRateCard(e.target.value)}
            placeholder="1000"
            className="pl-7 text-sm"
          />
        </div>
        <p className="text-xs text-indigo-600">
          Profiles with a published rate card close deals <strong>2.3x faster</strong>.
        </p>
      </div>

      {/* Niche selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          Niches / Industries
          <span className="ml-2 text-xs font-normal text-slate-400">Select all that apply</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((niche) => {
            const selected = selectedNiches.includes(niche);
            return (
              <button
                key={niche}
                type="button"
                onClick={() => toggleNiche(niche)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                  selected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {selected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                {niche}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>
        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Set Goals ────────────────────────────────────────────────────────

function StepSetGoals({ user, onNext, onPrev, onSkip }) {
  const role = user?.role || "brand";
  const [talentDeals, setTalentDeals] = useState([]);
  const [brandAudiences, setBrandAudiences] = useState([]);
  const [brandBudget, setBrandBudget] = useState([5000, 50000]);
  const [brandPlatforms, setBrandPlatforms] = useState([]);
  const [agencyClients, setAgencyClients] = useState("");
  const [agencyRosterSize, setAgencyRosterSize] = useState("");
  const [agencyIndustries, setAgencyIndustries] = useState([]);

  const toggle = (arr, setArr, value) => {
    setArr((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    const goals = {};
    if (role === "talent") goals.preferred_deal_types = talentDeals;
    if (role === "brand") {
      goals.target_audiences = brandAudiences;
      goals.budget_min = brandBudget[0];
      goals.budget_max = brandBudget[1];
      goals.priority_platforms = brandPlatforms;
    }
    if (role === "agency") {
      goals.agency_clients = agencyClients;
      goals.agency_roster_size = agencyRosterSize;
      goals.agency_target_industries = agencyIndustries;
    }
    base44.auth.updateMe({ goals }).catch(() => {});
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Set Your Goals</h2>
        <p className="text-sm text-slate-500 mt-1">
          Help our AI prioritize the right deals, partners, and opportunities for you.
        </p>
      </div>

      {/* TALENT */}
      {role === "talent" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            What deal types are you looking for?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {TALENT_DEAL_TYPES.map((dt) => {
              const selected = talentDeals.includes(dt.key);
              return (
                <button
                  key={dt.key}
                  type="button"
                  onClick={() => toggle(talentDeals, setTalentDeals, dt.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 ${
                    selected
                      ? "bg-emerald-50 border-emerald-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-emerald-200"
                  }`}
                >
                  <span className="text-lg leading-none">{dt.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${selected ? "text-emerald-700" : "text-slate-700"}`}>
                      {dt.label}
                    </p>
                  </div>
                  {selected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BRAND */}
      {role === "brand" && (
        <div className="space-y-5">
          {/* Target audience */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Target Audiences
            </Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_AUDIENCES.map((aud) => {
                const selected = brandAudiences.includes(aud);
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => toggle(brandAudiences, setBrandAudiences, aud)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {aud}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Campaign Budget Range
              <span className="ml-auto text-xs font-normal text-slate-500">
                ${(brandBudget[0] / 1000).toFixed(0)}K – ${(brandBudget[1] / 1000).toFixed(0)}K
              </span>
            </Label>
            <Slider
              min={500}
              max={500000}
              step={500}
              value={brandBudget}
              onValueChange={setBrandBudget}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>$500</span>
              <span>$500K+</span>
            </div>
          </div>

          {/* Platform priorities */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Priority Platforms
            </Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_PLATFORMS.map((plat) => {
                const selected = brandPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => toggle(brandPlatforms, setBrandPlatforms, plat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      selected
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AGENCY */}
      {role === "agency" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                Active Clients
              </Label>
              <Input
                type="number"
                min={0}
                value={agencyClients}
                onChange={(e) => setAgencyClients(e.target.value)}
                placeholder="e.g., 12"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Talent Roster Size
              </Label>
              <Input
                type="number"
                min={0}
                value={agencyRosterSize}
                onChange={(e) => setAgencyRosterSize(e.target.value)}
                placeholder="e.g., 45"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-500" />
              Target Industries
            </Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_SECTORS.map((ind) => {
                const selected = agencyIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggle(agencyIndustries, setAgencyIndustries, ind)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      selected
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>
        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Start Data Room ──────────────────────────────────────────────────

function StepDataRoom({ onFinish, onPrev, onSkip, saving }) {
  const [form, setForm] = useState({
    title: "",
    brand_name: "",
    partnership_type: "sponsorship",
    deal_value: "",
    notes: "",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const DEAL_TYPES = [
    { value: "sponsorship",      label: "Sponsorship" },
    { value: "affiliate",        label: "Affiliate" },
    { value: "ambassador",       label: "Ambassador" },
    { value: "content_creation", label: "Content Creation" },
    { value: "event",            label: "Event" },
    { value: "licensing",        label: "Licensing" },
  ];

  const canSubmit = form.title && form.brand_name;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Start Your Data Room</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add your first deal or campaign to unlock AI-powered predictions and deal intelligence.
        </p>
      </div>

      {/* Social proof callout */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">
              Talent with deal history get 3x more brand inquiries
            </p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Even one deal entry activates AI success predictions, ROI benchmarking, and intelligent deal scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Deal entry form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Deal / Campaign Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g., Nike Summer 2025 Campaign"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Brand / Partner Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.brand_name}
              onChange={(e) => update("brand_name", e.target.value)}
              placeholder="e.g., Nike"
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Deal Type</Label>
            <select
              value={form.partnership_type}
              onChange={(e) => update("partnership_type", e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {DEAL_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Deal Value (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                type="number"
                min={0}
                value={form.deal_value}
                onChange={(e) => update("deal_value", e.target.value)}
                placeholder="5000"
                className="pl-7 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Notes (optional)</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Deliverables, context, outcome..."
            className="resize-none text-sm min-h-[72px]"
            maxLength={500}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip for now
          </button>
        </div>
        <Button
          onClick={() => onFinish(canSubmit ? form : null)}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shadow-sm"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {canSubmit ? "Save & Finish" : "Finish Setup"}
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Completion Banner ─────────────────────────────────────────────────────────

function CompletionBanner({ onDismiss }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold">Onboarding complete!</h3>
          <p className="text-sm text-indigo-100 mt-1">
            Your profile is live and the AI Match Engine is now scoring deals for you. Expect your first matches shortly.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-0 text-xs">
              <Check className="w-3 h-3 mr-1" /> Profile active
            </Badge>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              <Check className="w-3 h-3 mr-1" /> AI scoring on
            </Badge>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              <Check className="w-3 h-3 mr-1" /> Ready for deals
            </Badge>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main OnboardingWizard ────────────────────────────────────────────────────

/**
 * OnboardingWizard
 *
 * Props:
 *   user           - current user object from base44.auth.me()
 *   onboardingStep - integer (0–4), initial value from user.onboarding_step
 *   onComplete     - callback invoked when wizard is fully completed/dismissed
 */
export default function OnboardingWizard({ user, onboardingStep = 0, onComplete }) {
  // wizardStep: which wizard screen (0–3) the user is currently on.
  // We map profiles.onboarding_step (1–4) back to wizard screen (0–3)
  // by doing currentScreen = max(onboardingStep - 1, 0) as the starting panel.
  const [currentStep, setCurrentStep] = useState(
    onboardingStep > 0 ? Math.min(onboardingStep, WIZARD_STEPS.length - 1) : 0
  );
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const totalSteps = WIZARD_STEPS.length;

  // Advance wizard + persist step to DB
  const advanceTo = useCallback(async (targetStep) => {
    // targetStep is the DB onboarding_step value (1-indexed completed count)
    try {
      await base44.auth.updateMe({ onboarding_step: targetStep });
    } catch {
      // Non-blocking — proceed even if DB write fails
    }
    if (targetStep >= totalSteps) {
      setShowCompletion(true);
    } else {
      setCurrentStep(targetStep);
    }
  }, [totalSteps]);

  // Skip current step — count it as "passed"
  const handleSkip = () => advanceTo(currentStep + 1);
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleNext = () => advanceTo(currentStep + 1);

  const handleFinish = async (dealForm) => {
    setSaving(true);
    try {
      if (dealForm) {
        await base44.entities.Partnership.create({
          title: dealForm.title,
          brand_name: dealForm.brand_name,
          partnership_type: dealForm.partnership_type,
          deal_value: dealForm.deal_value ? Number(dealForm.deal_value) : undefined,
          notes: dealForm.notes || undefined,
          status: "discovered",
        });
      }
      await base44.auth.updateMe({ onboarding_step: totalSteps });
      setShowCompletion(true);
    } catch {
      // Still complete wizard on error
      setShowCompletion(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDismissCompletion = () => {
    if (onComplete) onComplete();
  };

  if (showCompletion) {
    return <CompletionBanner onDismiss={handleDismissCompletion} />;
  }

  const progressPct = ((currentStep) / totalSteps) * 100;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
      {/* Header band */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-indigo-100 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complete Your Setup</h3>
              <p className="text-xs text-slate-500">
                Step {currentStep + 1} of {totalSteps} — {WIZARD_STEPS[currentStep].label}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold"
          >
            {Math.round(progressPct)}% complete
          </Badge>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Progress bar */}
        <Progress value={progressPct} className="h-1.5 mt-3 bg-indigo-100" />
      </div>

      {/* Step content */}
      <div className="px-6 py-6">
        {currentStep === 0 && (
          <StepConnectSocials
            onNext={handleNext}
            onSkip={handleSkip}
          />
        )}
        {currentStep === 1 && (
          <StepBuildProfile
            user={user}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
          />
        )}
        {currentStep === 2 && (
          <StepSetGoals
            user={user}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
          />
        )}
        {currentStep === 3 && (
          <StepDataRoom
            onFinish={handleFinish}
            onPrev={handlePrev}
            onSkip={handleSkip}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

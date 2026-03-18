import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap, Building2, Users, Briefcase, ArrowRight, Loader2,
  CheckCircle2, CheckSquare, Star, Sparkles, Shield, Lock,
  Brain, TrendingUp, Layers, Bell, ChevronDown, BarChart3, Globe, Network } from
"lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const ROLES = [
{
  key: "talent",
  icon: Users,
  title: "Talent",
  desc: "Creator, athlete, or celebrity seeking brand deals",
  color: "from-emerald-500 to-teal-600",
  accent: "emerald",
  perks: ["Talent profile & discovery", "Brand match engine", "Deal pipeline", "Connect social accounts"]
},
{
  key: "brand",
  icon: Building2,
  title: "Brands",
  desc: "Brand or company looking to partner with creators",
  color: "from-indigo-500 to-blue-600",
  accent: "indigo",
  perks: ["Talent discovery & search", "AI-powered matching", "Outreach sequences", "ROI simulation"]
},
{
  key: "agency",
  icon: Briefcase,
  title: "Agency",
  desc: "Talent agency managing rosters and partnerships",
  color: "from-amber-500 to-orange-600",
  accent: "amber",
  perks: ["Full roster management", "Multi-brand pipelines", "Team collaboration", "Advanced analytics"]
},
{
  key: "admin",
  icon: Shield,
  title: "Admin",
  desc: "Platform administrator with full access",
  color: "from-rose-500 to-pink-600",
  accent: "rose",
  perks: ["Full platform access", "User management", "All analytics & reports", "System configuration"]
}];


const PLANS_BY_ROLE = {
  talent: [
  {
    key: "free",
    title: "Starter",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
    "Basic profile & brand search",
    "View up to 3 campaign briefs/mo",
    "1 active partnership",
    "In-app notifications",
    "Basic analytics"],

    cta: "Get Started Free",
    color: "border-emerald-500",
    btnClass: "bg-white/10 hover:bg-white/20 text-white border border-white/20"
  },
  {
    key: "rising",
    title: "Rising",
    price: "$99",
    period: "/ month",
    badge: null,
    features: [
    "Enhanced profile with media kit",
    "Unlimited campaign brief views",
    "Up to 5 active partnerships",
    "AI Match Engine (basic)",
    "15 outreach messages/mo",
    "Performance analytics dashboard"],

    cta: "Start Rising",
    color: "border-blue-500",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white"
  },
  {
    key: "pro",
    title: "Pro",
    price: "$249",
    period: "/ month",
    badge: "Most Popular",
    features: [
    "Priority placement in searches",
    "Up to 20 active partnerships",
    "AI Match Engine (smart scoring)",
    "Unlimited outreach & sequences",
    "AI Pitch Deck Generation",
    "Full ROI Simulator & advanced analytics"],

    cta: "Start Pro",
    color: "border-indigo-500",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white"
  },
  {
    key: "elite",
    title: "Elite",
    price: "$499",
    period: "/ month",
    badge: null,
    features: [
    "Unlimited partnerships",
    "AI Match Engine (auto-matching)",
    "AI brand recommendations",
    "Unlimited team seats & integrations",
    "Dedicated account manager",
    "Priority support & custom analytics"],

    cta: "Start Elite",
    color: "border-purple-500",
    btnClass: "bg-purple-600 hover:bg-purple-700 text-white"
  }],

  brand: [
  {
    key: "free",
    title: "Explorer",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
    "Browse talent directory (limited)",
    "Post 1 campaign brief/mo",
    "1 active partnership",
    "In-app notifications",
    "Basic analytics"],

    cta: "Get Started Free",
    color: "border-indigo-500",
    btnClass: "bg-white/10 hover:bg-white/20 text-white border border-white/20"
  },
  {
    key: "growth",
    title: "Growth",
    price: "$499",
    period: "/ month",
    badge: null,
    features: [
    "Full talent search & filters",
    "Up to 5 campaign briefs/mo",
    "15 active partnerships",
    "AI Match Engine (basic)",
    "50 outreach messages/mo",
    "Performance analytics dashboard"],

    cta: "Start Growth",
    color: "border-blue-500",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white"
  },
  {
    key: "scale",
    title: "Scale",
    price: "$1,299",
    period: "/ month",
    badge: "Most Popular",
    features: [
    "Unlimited campaign briefs",
    "Up to 100 active partnerships",
    "AI Match Engine (smart scoring)",
    "Unlimited outreach & sequences",
    "AI Pitch Deck Generation",
    "Team collaboration (up to 10 seats)"],

    cta: "Start Scale",
    color: "border-indigo-500",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white"
  },
  {
    key: "enterprise",
    title: "Enterprise",
    price: "Custom",
    period: "starting at $2,500/mo",
    badge: null,
    features: [
    "Unlimited partnerships & briefs",
    "AI Match Engine (auto-matching)",
    "Unlimited team seats & integrations",
    "Custom pitch deck templates",
    "White-label options",
    "Dedicated success manager & SLA"],

    cta: "Contact Sales",
    color: "border-slate-600",
    btnClass: "bg-slate-700 hover:bg-slate-800 text-white"
  }],

  agency: [
  {
    key: "agency_starter",
    title: "Agency Starter",
    price: "$2,499",
    period: "/ month",
    badge: null,
    features: [
    "Manage up to 5 brands or 25 talent",
    "Unlimited campaign briefs & outreach",
    "AI Pitch Deck Generation",
    "Multi-step approval workflows",
    "Team collaboration (up to 10 seats)",
    "Agency-level reporting & dashboards"],

    cta: "Start Agency Starter",
    color: "border-amber-500",
    btnClass: "bg-amber-600 hover:bg-amber-700 text-white"
  },
  {
    key: "agency_pro",
    title: "Agency Pro",
    price: "$4,999",
    period: "/ month",
    badge: "Most Popular",
    features: [
    "Manage up to 20 brands or 100 talent",
    "AI Match Engine (auto-matching)",
    "Unlimited team seats & integrations",
    "Custom pitch deck templates per client",
    "Cross-client analytics & benchmarking",
    "Bulk outreach & campaign coordination"],

    cta: "Start Agency Pro",
    color: "border-amber-500",
    btnClass: "bg-amber-600 hover:bg-amber-700 text-white"
  },
  {
    key: "agency_enterprise",
    title: "Agency Enterprise",
    price: "Custom",
    period: "starting at $9,999/mo",
    badge: null,
    features: [
    "Unlimited brands & talent profiles",
    "White-label platform & custom domain",
    "Full API access & custom endpoints",
    "SSO & advanced security with audit logs",
    "Custom BI dashboards & data exports",
    "Dedicated success team & SLA support"],

    cta: "Contact Sales",
    color: "border-slate-600",
    btnClass: "bg-slate-700 hover:bg-slate-800 text-white"
  }],

  admin: [
  {
    key: "admin",
    title: "Admin Access",
    price: "$0",
    period: "internal",
    badge: "Full Access",
    features: [
    "Full platform administration",
    "All features unlocked",
    "User & team management",
    "System configuration",
    "All analytics & reports",
    "Demo data management"],

    cta: "Continue as Admin",
    color: "border-rose-500",
    btnClass: "bg-rose-600 hover:bg-rose-700 text-white"
  }]

};

const LABEL_MAP = {
  talent: { name: "Stage Name / Brand", namePlaceholder: "Your name or creator brand", title: "Content Niche / Category", titlePlaceholder: "e.g. Fitness, Tech, Lifestyle" },
  brand: { name: "Company Name", namePlaceholder: "Your company name", title: "Your Job Title", titlePlaceholder: "e.g. VP Marketing, Partnership Lead" },
  agency: { name: "Agency Name", namePlaceholder: "Your agency name", title: "Your Role", titlePlaceholder: "e.g. Talent Manager, Agency Director" },
  admin: { name: "Full Name", namePlaceholder: "Your name", title: "Your Role", titlePlaceholder: "e.g. Platform Admin, CTO" }
};

const PLATFORM_STATS = [
{ value: "10M+", label: "Profiles Indexed" },
{ value: "94%", label: "Match Accuracy" },
{ value: "50+", label: "AI Agents" },
{ value: "32", label: "Industries" }];


const KEY_METRICS = [
{ label: "System Uptime", value: "99.95%", desc: "< 4.4 hours downtime/year" },
{ label: "Agent Concurrency", value: "50+", desc: "Running simultaneously across 12 agent types" },
{ label: "Fault Recovery", value: "< 30s", desc: "Automatic failover and task reassignment" },
{ label: "Match Accuracy", value: "94%", desc: "AI recommendation precision validated" },
{ label: "Human Approval", value: "100%", desc: "All outbound requires human review" },
{ label: "Data Sources", value: "50+", desc: "Social, marketplace, public data" },
{ label: "Categories Covered", value: "32", desc: "Universal partnership categories" },
{ label: "Profiles Indexed", value: "10M+", desc: "Searchable talent profiles" },
{ label: "Daily Data Updates", value: "5M+", desc: "Metrics refreshed daily" }];


const CAPABILITIES = [
{ icon: Users, color: "bg-indigo-50 text-indigo-600", title: "AI-Powered Talent Discovery", desc: "Search 10M+ profiles with semantic understanding and natural language queries" },
{ icon: Brain, color: "bg-purple-50 text-purple-600", title: "Intelligent Matching", desc: "94% accuracy connecting brands with ideal talent using 10-factor weighted scoring" },
{ icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", title: "Predictive Analytics", desc: "Forecast talent trajectory 6–18 months ahead with 78% accuracy" },
{ icon: BarChart3, color: "bg-blue-50 text-blue-600", title: "Partnership Simulation", desc: "Monte Carlo modeling with 10,000 scenarios predicts campaign ROI before spend" },
{ icon: Network, color: "bg-rose-50 text-rose-600", title: "Relationship Graph", desc: "Neo4j-powered mapping of industry relationships for warm intro paths" },
{ icon: Layers, color: "bg-amber-50 text-amber-600", title: "Auto Pitch Deck Generation", desc: "Custom 12-section decks generated in <5 minutes per deal" },
{ icon: CheckSquare, color: "bg-teal-50 text-teal-600", title: "Human Approval Workflow", desc: "Nothing goes outbound without review — enforced at architecture level" },
{ icon: Shield, color: "bg-red-50 text-red-600", title: "Fault-Tolerant Architecture", desc: "50+ concurrent agents with circuit breakers and auto-recovery" },
{ icon: Bell, color: "bg-orange-50 text-orange-600", title: "Real-Time Alerts", desc: "Event-driven triggers for awards, viral moments, deal expirations" },
{ icon: BarChart3, color: "bg-sky-50 text-sky-600", title: "Market Intelligence", desc: "Rate benchmarks, competitive intel, trend analysis" }];


const INDUSTRIES = [
{ name: "Entertainment", icon: "🎬", range: "$10K – $10M+", examples: "Actors, musicians, TV personalities", color: "border-l-purple-400" },
{ name: "Sports", icon: "🏆", range: "$25K – $50M+", examples: "Athletes, teams, leagues", color: "border-l-blue-400" },
{ name: "Digital/Creator", icon: "📱", range: "$500 – $5M", examples: "YouTubers, TikTokers, streamers", color: "border-l-indigo-400" },
{ name: "Fashion", icon: "👗", range: "$5K – $2M", examples: "Models, designers, influencers", color: "border-l-pink-400" },
{ name: "Business", icon: "💼", range: "$10K – $500K", examples: "Executives, entrepreneurs, speakers", color: "border-l-slate-400" },
{ name: "Gaming", icon: "🎮", range: "$1K – $1M", examples: "Esports, streamers, game developers", color: "border-l-emerald-400" },
{ name: "Fitness", icon: "💪", range: "$2K – $500K", examples: "Athletes, trainers, wellness experts", color: "border-l-orange-400" },
{ name: "Food & Beverage", icon: "🍽️", range: "$5K – $1M", examples: "Chefs, food critics, restaurateurs", color: "border-l-amber-400" },
{ name: "Technology", icon: "⚡", range: "$10K – $2M", examples: "Tech influencers, founders", color: "border-l-cyan-400" },
{ name: "Finance", icon: "📈", range: "$15K – $1M", examples: "Fintech influencers, advisors", color: "border-l-green-400" },
{ name: "Travel", icon: "✈️", range: "$3K – $500K", examples: "Travel creators, hospitality", color: "border-l-sky-400" },
{ name: "Beauty", icon: "💄", range: "$2K – $2M", examples: "Makeup artists, skincare experts", color: "border-l-rose-400" },
{ name: "Automotive", icon: "🚗", range: "$10K – $5M", examples: "Car enthusiasts, racing", color: "border-l-red-400" }];


const USER_TYPES = [
{
  icon: Building2,
  color: "from-indigo-500 to-blue-600",
  bg: "bg-indigo-50",
  label: "Brands",
  desc: "Seeking talent partnerships",
  points: ["Discover verified talent profiles", "AI-powered match recommendations", "Campaign ROI simulation", "Automated outreach workflows"]
},
{
  icon: Users,
  color: "from-purple-500 to-pink-600",
  bg: "bg-purple-50",
  label: "Talent",
  desc: "Creators, athletes, celebrities",
  points: ["Showcase profiles to top brands", "Track deal pipeline & earnings", "Connect social accounts", "Receive curated brand opportunities"]
},
{
  icon: Briefcase,
  color: "from-emerald-500 to-teal-600",
  bg: "bg-emerald-50",
  label: "Agencies",
  desc: "Managing talent rosters",
  points: ["Full talent roster management", "Multi-deal pipeline view", "Team collaboration tools", "Approval workflows & audit trails"]
}];


const HIGHLIGHTS = [
{ icon: Brain, text: "AI-Powered Matching" },
{ icon: TrendingUp, text: "Predictive Analytics" },
{ icon: Layers, text: "Auto Pitch Decks" },
{ icon: CheckSquare, text: "Human Approval Workflow" },
{ icon: Shield, text: "Fault-Tolerant Architecture" },
{ icon: Bell, text: "Real-Time Alerts" }];


const BRAND_CULTURES = [
  { key: "innovative", label: "Innovative", emoji: "🚀", desc: "Forward-thinking, tech-first, disruptive" },
  { key: "authentic", label: "Authentic", emoji: "🌿", desc: "Real, transparent, community-driven" },
  { key: "premium", label: "Premium", emoji: "💎", desc: "Luxury, quality-first, aspirational" },
  { key: "playful", label: "Playful", emoji: "🎉", desc: "Fun, bold, energetic, youth-focused" },
  { key: "purpose_driven", label: "Purpose-Driven", emoji: "❤️", desc: "Mission-led, social impact, values-first" },
  { key: "professional", label: "Professional", emoji: "🏢", desc: "B2B, corporate, authority-focused" },
];

const AUDIENCE_AGES = ["13–17", "18–24", "25–34", "35–44", "45–54", "55+"];
const AUDIENCE_GENDERS = ["Female", "Male", "Non-binary", "All"];
const AUDIENCE_INTERESTS = [
  "Fashion & Beauty", "Fitness & Health", "Tech & Gaming", "Food & Cooking",
  "Travel & Lifestyle", "Finance & Business", "Music & Entertainment", "Sports",
  "Parenting & Family", "Education & Learning", "Sustainability", "Luxury"
];
const AUDIENCE_LOCATIONS = ["United States", "United Kingdom", "Canada", "Australia", "Europe", "Latin America", "Global"];

const CAMPAIGN_OBJECTIVES = [
  { key: "brand_awareness", label: "Brand Awareness", emoji: "📢", desc: "Reach new audiences and build recognition" },
  { key: "product_launch", label: "Product Launch", emoji: "🚀", desc: "Drive excitement for a new product or service" },
  { key: "sales_conversion", label: "Sales & Conversions", emoji: "💰", desc: "Drive direct purchases or sign-ups" },
  { key: "community_building", label: "Community Building", emoji: "👥", desc: "Grow an engaged loyal audience" },
  { key: "content_creation", label: "Content Creation", emoji: "🎬", desc: "Generate high-quality content assets" },
  { key: "thought_leadership", label: "Thought Leadership", emoji: "🧠", desc: "Establish authority in your industry" },
];

const PARTNERSHIP_TYPES = [
  { key: "sponsorship", label: "Sponsorship", emoji: "🤝" },
  { key: "affiliate", label: "Affiliate", emoji: "🔗" },
  { key: "ambassador", label: "Brand Ambassador", emoji: "⭐" },
  { key: "content_creation", label: "Content Creation", emoji: "🎥" },
  { key: "event", label: "Event Collaboration", emoji: "🎪" },
];

const Tooltip = ({ text }) => (
  <span className="group relative inline-flex items-center ml-1.5 cursor-pointer">
    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">?</span>
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl leading-relaxed">
      {text}
    </span>
  </span>
);

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1 = role, 2 = plan, 3 = details, 4 = brand wizard
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState("");

  // Brand wizard state
  const [brandWizardStep, setBrandWizardStep] = useState(1); // 1=culture, 2=audience, 3=objectives
  const [selectedCultures, setSelectedCultures] = useState([]);
  const [audienceAges, setAudienceAges] = useState([]);
  const [audienceGenders, setAudienceGenders] = useState([]);
  const [audienceInterests, setAudienceInterests] = useState([]);
  const [audienceLocations, setAudienceLocations] = useState([]);
  const [campaignObjectives, setCampaignObjectives] = useState([]);
  const [preferredPartnerships, setPreferredPartnerships] = useState([]);
  const [annualBudget, setAnnualBudget] = useState("");

  const navigate = useNavigate();

  const toggleItem = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  const { data: rateBenchmarks = [] } = useQuery({
    queryKey: ["rateBenchmarks"],
    queryFn: () => base44.entities.RateBenchmark.list()
  });

  const { data: roiBenchmarks = [] } = useQuery({
    queryKey: ["roiBenchmarks"],
    queryFn: () => base44.entities.ROIBenchmark.list()
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.onboarded) navigate(createPageUrl("Dashboard"));
    }).catch(() => {});
  }, []);

  const handleComplete = async () => {
    setSaving(true);
    setAuthError("");
    try {
      // Sign up the user with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: selectedRole,
          }
        }
      });

      if (signUpError) {
        setAuthError(signUpError.message);
        setSaving(false);
        return;
      }

      // Wait briefly for the auth state to propagate
      await new Promise(r => setTimeout(r, 1000));

      // Update profile with onboarding data
      const brandData = selectedRole === "brand" ? {
        brand_culture: selectedCultures.join(","),
        audience_ages: audienceAges.join(","),
        audience_genders: audienceGenders.join(","),
        audience_interests: audienceInterests.join(","),
        audience_locations: audienceLocations.join(","),
        campaign_objectives: campaignObjectives.join(","),
        preferred_partnership_types: preferredPartnerships.join(","),
        annual_budget: annualBudget,
      } : {};

      try {
        await base44.auth.updateMe({
          role: selectedRole,
          plan: selectedPlan,
          company_name: name,
          job_title: title,
          onboarded: true,
          ...brandData,
        });
      } catch (e) {
        // Profile update may fail if trigger hasn't fired yet, continue anyway
      }

      // Auto-create brand record for brand users
      if (selectedRole === "brand" && name) {
        try {
          await base44.entities.Brand.create({
            name,
            preferred_niches: audienceInterests.slice(0, 3).join(","),
            target_audience: `${audienceAges.join(", ")} | ${audienceGenders.join(", ")}`,
            annual_budget: parseFloat(annualBudget) || 0,
            status: "active",
          });
        } catch (e) {
        }
      }

      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const roleObj = ROLES.find((r) => r.key === selectedRole);
  const labels = LABEL_MAP[selectedRole] || LABEL_MAP.brand;

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-50 flex items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Deal Stage</span>
        </div>
        <button onClick={() => navigate("/login")} className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
          Already have an account? <span className="text-indigo-600 hover:text-indigo-700 ml-0.5 font-semibold">Sign in</span>
        </button>
      </header>

      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden pt-36 pb-28 bg-gradient-to-b from-slate-950 via-[#0f1629] to-indigo-950">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">AI-Powered Partnership Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            The smartest way to build
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-orange-400 bg-clip-text text-transparent">creator partnerships</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Connecting <span className="text-white font-medium">Talent</span>, <span className="text-white font-medium">Brands</span>, and <span className="text-white font-medium">Agencies</span> with AI-powered matching, deal simulation, and real-time market intelligence.
          </p>

          {/* Dual Role CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => {setSelectedRole("brand");setStep(2);}} className="h-12 px-7 rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all">
              I'm a Brand
            </Button>
            <Button onClick={() => {setSelectedRole("talent");setStep(2);}} className="h-12 px-7 rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all">
              I'm a Creator
            </Button>
            <Button onClick={() => {setSelectedRole("agency");setStep(2);}} className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all">
              I'm an Agency
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-5">No credit card required &middot; Start free today</p>
        </div>
      </div>

      {/* ── TRUSTED BRANDS SECTION ── */}
      <div className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by leading brands & creators</p>
          <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap opacity-50 hover:opacity-70 transition-opacity">
            {[
            { name: "Coca-Cola", emoji: "🥤" },
            { name: "Corona", emoji: "🍺" },
            { name: "Heineken", emoji: "🍻" },
            { name: "JBL", emoji: "🎵" },
            { name: "L'Oreal", emoji: "💄" }].
            map((brand, i) =>
            <div key={i} className="text-center flex flex-col items-center">
                <div className="text-3xl mb-1.5">{brand.emoji}</div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{brand.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-24 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Powerful AI Capabilities</h2>
            <p className="text-base text-slate-500 max-w-lg mx-auto">Everything you need to find, evaluate, and close partnerships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
            { icon: TrendingUp, bg: "bg-indigo-50", color: "text-indigo-600", title: "Predictive Analytics", desc: "Forecast creator growth and ROI before campaigns launch" },
            { icon: Brain, bg: "bg-purple-50", color: "text-purple-600", title: "AI Match Engine", desc: "40+ signal compatibility scoring for perfect partnerships" },
            { icon: Sparkles, bg: "bg-amber-50", color: "text-amber-600", title: "Deal Simulation", desc: "10,000+ Monte Carlo simulations to predict outcomes" },
            { icon: CheckSquare, bg: "bg-emerald-50", color: "text-emerald-600", title: "Approval Workflows", desc: "Human review with intelligent recommendations" },
            { icon: Layers, bg: "bg-blue-50", color: "text-blue-600", title: "Auto Pitch Decks", desc: "AI-generated pitch decks in seconds" },
            { icon: Bell, bg: "bg-rose-50", color: "text-rose-600", title: "Smart Notifications", desc: "Real-time alerts on market opportunities" }].
            map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="group bg-white border border-slate-200/70 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl ${feature.bg} mb-4 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>);

            })}
          </div>
        </div>
      </div>

      {/* ── PLATFORM OVERVIEW SECTION ── */}
      <div className="py-24 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 space-y-20">

          {/* Overview Hero */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl" />
            </div>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-[0.2em]">Platform Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">Enterprise AI Partnership Intelligence</h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Deal Stage connects talent — creators, athletes, celebrities — with brands and agencies. Featuring 50+ AI agents, automatic failover, and mandatory human approval for all outbound communications.
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Key Platform Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {KEY_METRICS.map((m, i) =>
              <div key={i} className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">{m.value}</p>
                  <p className="text-sm font-bold text-slate-700 mt-1.5">{m.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Types */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Who Deal Stage Serves</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {USER_TYPES.map((u, i) => {
                const Icon = u.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-sm transition-shadow">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center mb-4 shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-base font-bold text-slate-800">{u.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">{u.desc}</p>
                    <ul className="space-y-1.5">
                      {u.points.map((p, j) =>
                      <li key={j} className="flex items-center gap-2 text-[12px] text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          {p}
                        </li>
                      )}
                    </ul>
                  </div>);

              })}
            </div>
          </div>

          {/* Core Capabilities */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Core Platform Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAPABILITIES.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200/60 hover:shadow-sm transition-shadow">
                    <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{c.title}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>);

              })}
            </div>
          </div>

          {/* Industries */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Industries Covered</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INDUSTRIES.map((ind, i) =>
              <div key={i} className={`bg-white rounded-xl border border-slate-200/60 border-l-4 ${ind.color} p-4 hover:shadow-sm transition-shadow`}>
                  <div className="flex items-center gap-2 mb-1">
                    
                    <p className="text-sm font-bold text-slate-700">{ind.name}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{ind.examples}</p>
                  <Badge className="bg-slate-100 text-slate-600 text-[10px] font-semibold">{ind.range}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MARKET INTELLIGENCE SECTION ── */}
      <div className="py-24 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Market Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Real-Time Industry Benchmarks</h2>
            <p className="text-base text-slate-500 max-w-lg mx-auto">Data-driven insights to make smarter partnership decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Rate Benchmarks */}
            <div className="bg-white border border-slate-200/70 rounded-2xl p-7 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Creator Pricing Tiers</h3>
              <div className="space-y-5">
                {rateBenchmarks.slice(0, 3).map((tier) =>
                <div key={tier.id} className="border-l-4 border-indigo-200 pl-4">
                    <p className="font-medium text-slate-900 capitalize text-sm mb-2">{tier.tier} Tier</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Post Rate</span>
                        <span className="font-medium text-slate-900">${tier.sponsored_post_min?.toLocaleString()}-${tier.sponsored_post_max?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Brand Deal</span>
                        <span className="font-medium text-slate-900">${tier.brand_deal_min?.toLocaleString()}-${tier.brand_deal_max?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROI Benchmarks */}
            <div className="bg-white border border-slate-200/70 rounded-2xl p-7 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Campaign ROI Benchmarks</h3>
              <div className="space-y-5">
                {roiBenchmarks.slice(0, 3).map((roi) =>
                <div key={roi.id} className="border-l-4 border-emerald-200 pl-4">
                    <p className="font-medium text-slate-900 capitalize text-sm mb-2">{roi.deal_type.replace(/_/g, " ")}</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Median ROI</span>
                        <span className="font-bold text-emerald-600 text-base">{roi.median_roi}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Top Quartile</span>
                        <span className="font-bold text-emerald-600">{roi.top_quartile_roi}x+</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-400">Full market intelligence and advanced filters available to all users</p>
          </div>
        </div>
      </div>

      {/* ── ONBOARDING FORM ── */}
      <div className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
      <div className="flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Get started in minutes</h2>
          <p className="text-sm text-slate-500 mt-2">Set up your account and start discovering partnerships</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-10 bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
          {(selectedRole === "brand"
            ? ["Account Type", "Choose Plan", "Your Details", "Brand Setup"]
            : ["Account Type", "Choose Plan", "Your Details"]
          ).map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <React.Fragment key={num}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${done ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : active ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "bg-slate-100 text-slate-400"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block transition-colors ${active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
                </div>
                {i < (selectedRole === "brand" ? 3 : 2) && <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${step > num ? "bg-emerald-400" : "bg-slate-100"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <>
          {/* ── STEP 1: Account Type ── */}
          {step === 1 &&
              <div className="space-y-5 animate-fade-in-up">
             <div>
               <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">What type of account do you need?</h2>
               <p className="text-sm text-slate-500 mt-1">Select your role to personalize your experience</p>
             </div>

             <div className="space-y-3">
               {ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        onClick={() => setSelectedRole(role.key)}
                        className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left
                       ${isSelected ? "bg-indigo-50/80 border-indigo-400 shadow-lg shadow-indigo-500/10" : "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"}`}>

                     <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                       <Icon className="w-6 h-6 text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-slate-900">{role.title}</p>
                       <p className="text-sm text-slate-500 mt-0.5 mb-2.5">{role.desc}</p>
                       <div className="flex flex-wrap gap-1.5">
                         {role.perks.map((p, i) =>
                            <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{p}</span>
                            )}
                       </div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300
                       ${isSelected ? "border-indigo-600 bg-indigo-600 shadow-md shadow-indigo-500/30" : "border-slate-300"}`}>
                       {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                     </div>
                   </button>);

                  })}
             </div>

             <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:shadow-none">

               Continue <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
              }

        {/* ── STEP 2: Plan ── */}
         {step === 2 &&
              <div className="space-y-5 animate-fade-in-up">
             <div>
               <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Choose your plan</h2>
               <p className="text-sm text-slate-500 mt-1">
                 You selected <span className="font-semibold text-slate-800">{roleObj?.title}</span>. Pick the plan that fits your needs.
               </p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {(PLANS_BY_ROLE[selectedRole] || []).map((plan) => {
                    const isSelected = selectedPlan === plan.key;
                    return (
                      <button
                        key={plan.key}
                        onClick={() => setSelectedPlan(plan.key)}
                        className={`relative flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-300
                       ${isSelected ? "border-indigo-500 bg-indigo-50/70 shadow-xl shadow-indigo-500/10" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}>

                     {plan.badge &&
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-indigo-500/25">
                         <Star className="w-3 h-3" /> {plan.badge}
                       </div>
                        }
                     <div className="flex items-end gap-1 mb-2">
                       <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                       <span className="text-sm mb-1 text-slate-500">{plan.period}</span>
                     </div>
                     <p className="text-sm font-bold text-slate-800 mb-4">{plan.title}</p>
                     <ul className="space-y-2.5 flex-1">
                       {plan.features.map((f, i) =>
                          <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                           {f}
                         </li>
                          )}
                     </ul>
                     <div className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-300 ${isSelected ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20" : "bg-slate-100 text-slate-700"}`}>
                       {isSelected ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Selected</span> : plan.cta}
                     </div>
                   </button>);

                  })}
             </div>

             <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-1">
               <Lock className="w-3 h-3" />
               <span>Secure checkout &middot; Cancel anytime &middot; No hidden fees</span>
             </div>

             <div className="flex gap-3 mt-4">
               <Button variant="outline" onClick={() => {setSelectedRole("");setStep(1);}} className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
                 Back
               </Button>
               <Button onClick={() => setStep(3)} disabled={!selectedPlan} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:shadow-none">
                 Continue <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </div>
           </div>
              }

        {/* ── STEP 3: Details ── */}
         {step === 3 &&
              <div className="space-y-5 animate-fade-in-up">
             <div>
               <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
               <p className="text-sm text-slate-500 mt-1">
                 Almost done! Set up your <span className="font-semibold text-slate-800">{roleObj?.title}</span> account.
               </p>
             </div>

             {/* Account credentials group */}
             <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Credentials</p>
               <div>
                 <Label className="text-slate-700 font-semibold text-sm">Email</Label>
                 <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
               </div>
               <div>
                 <Label className="text-slate-700 font-semibold text-sm">Password</Label>
                 <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="mt-1.5 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
               </div>
             </div>

             {/* Profile details group */}
             <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Details</p>
               <div>
                 <Label className="text-slate-700 font-semibold text-sm">{labels.name}</Label>
                 <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={labels.namePlaceholder}
                      className="mt-1.5 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
               </div>
               <div>
                 <Label className="text-slate-700 font-semibold text-sm">{labels.title}</Label>
                 <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={labels.titlePlaceholder}
                      className="mt-1.5 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
               </div>
             </div>

             {authError && (
               <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                   <span className="text-red-500 text-xs font-bold">!</span>
                 </div>
                 {authError}
               </div>
             )}

             {/* Summary card */}
             <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/70 p-5 flex items-center gap-4">
               <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleObj?.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                 {roleObj && <roleObj.icon className="w-5 h-5 text-white" />}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-900">{roleObj?.title} &middot; {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}</p>
                 <p className="text-xs text-slate-500 mt-0.5 truncate">{name || "Your profile"}</p>
               </div>
               {selectedPlan === "pro" && <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />}
             </div>

             <div className="flex gap-3 mt-4">
               <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
                 Back
               </Button>
               {selectedRole === "brand" ? (
                 <Button onClick={() => setStep(4)} disabled={!name || !email || !password} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:shadow-none">
                   Continue <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               ) : (
                 <Button onClick={handleComplete} disabled={saving || !name || !email || !password} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:shadow-none">
                   {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                   {saving ? "Setting up..." : "Launch Dashboard"}
                 </Button>
               )}
             </div>
             </div>
              }

        {/* ── STEP 4: Brand Wizard ── */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Sub-step progress */}
            <div className="flex items-center gap-2 mb-2">
              {["Company Culture", "Target Audience", "Campaign Goals"].map((label, i) => {
                const num = i + 1;
                const active = brandWizardStep === num;
                const done = brandWizardStep > num;
                return (
                  <React.Fragment key={num}>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                        ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {done ? "✓" : num}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${active ? "text-indigo-600" : done ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-px ${brandWizardStep > num ? "bg-emerald-400" : "bg-slate-200"}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Wizard Step 1: Company Culture */}
            {brandWizardStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Define Your Brand Culture
                    <Tooltip text="Your brand culture helps us match you with talent whose content style and audience values align with yours." />
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Select up to 3 traits that best describe your brand's personality. <span className="text-indigo-600 font-medium">Example: Nike = Innovative + Purpose-Driven + Playful</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {BRAND_CULTURES.map(c => {
                    const sel = selectedCultures.includes(c.key);
                    return (
                      <button key={c.key} onClick={() => toggleItem(selectedCultures, setSelectedCultures, c.key)}
                        disabled={!sel && selectedCultures.length >= 3}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                          ${sel ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}
                          ${!sel && selectedCultures.length >= 3 ? "opacity-40 cursor-not-allowed" : ""}`}>
                        <span className="text-2xl">{c.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                        </div>
                        {sel && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
                  💡 <strong>Tip:</strong> Brands with clearly defined cultures get 3x better talent match scores. Think of this like your brand's personality type.
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-11 border-slate-300">Back</Button>
                  <Button onClick={() => setBrandWizardStep(2)} disabled={selectedCultures.length === 0} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Wizard Step 2: Target Audience */}
            {brandWizardStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Define Your Target Audience
                    <Tooltip text="Precise audience targeting means we match you with talent whose followers match your ideal customer profile." />
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Help us understand who you're trying to reach. <span className="text-indigo-600 font-medium">Example: Sephora targets 18–34 Female beauty & lifestyle audiences.</span></p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                    Age Groups <Tooltip text="Select all age ranges your primary customers fall into." />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AUDIENCE_AGES.map(age => (
                      <button key={age} onClick={() => toggleItem(audienceAges, setAudienceAges, age)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${audienceAges.includes(age) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                    Gender Focus <Tooltip text="Which genders make up your primary audience?" />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AUDIENCE_GENDERS.map(g => (
                      <button key={g} onClick={() => toggleItem(audienceGenders, setAudienceGenders, g)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${audienceGenders.includes(g) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                    Key Interests <Tooltip text="What topics are your customers passionate about? This helps us find talent with matching audience interests." />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AUDIENCE_INTERESTS.map(interest => (
                      <button key={interest} onClick={() => toggleItem(audienceInterests, setAudienceInterests, interest)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${audienceInterests.includes(interest) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                    Primary Markets <Tooltip text="Where are most of your customers located?" />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AUDIENCE_LOCATIONS.map(loc => (
                      <button key={loc} onClick={() => toggleItem(audienceLocations, setAudienceLocations, loc)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${audienceLocations.includes(loc) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setBrandWizardStep(1)} className="flex-1 h-11 border-slate-300">Back</Button>
                  <Button onClick={() => setBrandWizardStep(3)} disabled={audienceAges.length === 0 || audienceInterests.length === 0} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Wizard Step 3: Campaign Objectives */}
            {brandWizardStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Set Your Campaign Goals
                    <Tooltip text="Your campaign objectives shape how we score and prioritize talent matches for your campaigns." />
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">What are you trying to achieve? Select all that apply. <span className="text-indigo-600 font-medium">Example: Red Bull focuses on Brand Awareness + Community Building.</span></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CAMPAIGN_OBJECTIVES.map(obj => {
                    const sel = campaignObjectives.includes(obj.key);
                    return (
                      <button key={obj.key} onClick={() => toggleItem(campaignObjectives, setCampaignObjectives, obj.key)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                          ${sel ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                        <span className="text-xl">{obj.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{obj.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{obj.desc}</p>
                        </div>
                        {sel && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                    Preferred Partnership Types <Tooltip text="What type of collaborations does your brand typically run?" />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PARTNERSHIP_TYPES.map(pt => (
                      <button key={pt.key} onClick={() => toggleItem(preferredPartnerships, setPreferredPartnerships, pt.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${preferredPartnerships.includes(pt.key) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {pt.emoji} {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center mb-2">
                    Estimated Annual Partnership Budget (USD) <Tooltip text="This helps us show you talent within your budget range. You can always update this later." />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Under $10K", "$10K–$50K", "$50K–$250K", "$250K–$1M", "$1M+"].map(b => (
                      <button key={b} onClick={() => setAnnualBudget(b)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                          ${annualBudget === b ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Your brand profile is ready!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">AI will use this to proactively recommend talent, generate campaign briefs, and score matches specifically for your goals.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setBrandWizardStep(2)} className="flex-1 h-11 border-slate-300">Back</Button>
                  <Button onClick={handleComplete} disabled={saving || campaignObjectives.length === 0} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {saving ? "Setting up..." : "Launch Dashboard"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

             </>
             </div>
             </div>
             </div>
             </div>);

}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
  }]

};

const LABEL_MAP = {
  talent: { name: "Stage Name / Brand", namePlaceholder: "Your name or creator brand", title: "Content Niche / Category", titlePlaceholder: "e.g. Fitness, Tech, Lifestyle" },
  brand: { name: "Company Name", namePlaceholder: "Your company name", title: "Your Job Title", titlePlaceholder: "e.g. VP Marketing, Partnership Lead" },
  agency: { name: "Agency Name", namePlaceholder: "Your agency name", title: "Your Role", titlePlaceholder: "e.g. Talent Manager, Agency Director" }
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
  const [saving, setSaving] = useState(false);

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
    await base44.auth.updateMe({
      role: selectedRole,
      plan: selectedPlan,
      company_name: name,
      job_title: title,
      onboarded: true
    });
    navigate(createPageUrl("Dashboard"));
  };

  const roleObj = ROLES.find((r) => r.key === selectedRole);
  const labels = LABEL_MAP[selectedRole] || LABEL_MAP.brand;

  return (
    <div className="min-h-screen bg-white">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">PartnerIQ</span>
        </div>
      </header>

      {/* ── HERO SECTION (Influur Inspired) ── */}
      <div className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #f97316 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            We're the ultimate partnership intelligence platform
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            We help <span className="text-orange-400 font-semibold">Talent, Brands, Brand Managers</span>, <span className="text-orange-400 font-semibold">CMOs</span>, and <span className="text-orange-400 font-semibold">marketing agencies</span> build their influencer marketing strategy through cutting-edge AI technology.
          </p>

          {/* Dual Role CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => {setSelectedRole("brand");setStep(2);}} className="h-11 px-6 border-2 border-white bg-transparent text-white font-semibold hover:bg-white/10">
              I'm a Brand
            </Button>
            <Button onClick={() => {setSelectedRole("talent");setStep(2);}} className="h-11 px-6 border-2 border-white bg-transparent text-white font-semibold hover:bg-white/10">
              I'm a Creator
            </Button>
            <Button onClick={() => {setSelectedRole("agency");setStep(2);}} className="h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              I'm an Agency
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-4">No credit card required • Start free today</p>
        </div>
      </div>

      {/* ── TRUSTED BRANDS SECTION ── */}
      <div className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider mb-12">Trusted by leading brands & creators</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center opacity-60">
            {[
            { name: "Coca-Cola", emoji: "🥤" },
            { name: "Corona", emoji: "🍺" },
            { name: "Heineken", emoji: "🍻" },
            { name: "JBL", emoji: "🎵" },
            { name: "L'Oreal", emoji: "💄" }].
            map((brand, i) =>
            <div key={i} className="text-center">
                <div className="text-4xl mb-2">{brand.emoji}</div>
                <p className="text-xs font-semibold text-slate-600">{brand.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful AI Capabilities</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Every partnership intelligence you need, powered by cutting-edge AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
            { icon: TrendingUp, color: "text-indigo-600", title: "Predictive Analytics", desc: "Forecast creator growth and ROI before campaigns launch" },
            { icon: Brain, color: "text-purple-600", title: "AI Match Engine", desc: "40+ signal compatibility scoring for perfect partnerships" },
            { icon: Sparkles, color: "text-amber-600", title: "Deal Simulation", desc: "10,000+ Monte Carlo simulations to predict outcomes" },
            { icon: CheckSquare, color: "text-emerald-600", title: "Approval Workflows", desc: "Human review with intelligent recommendations" },
            { icon: Layers, color: "text-blue-600", title: "Auto Pitch Decks", desc: "AI-generated pitch decks in seconds" },
            { icon: Bell, color: "text-rose-600", title: "Smart Notifications", desc: "Real-time alerts on market opportunities" }].
            map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} bg-opacity-10 mb-4 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </div>);

            })}
          </div>
        </div>
      </div>

      {/* ── PLATFORM OVERVIEW SECTION ── */}
      <div className="py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          
          {/* Overview Hero */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 50%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <Badge className="bg-white/10 text-white/80 border-white/20 text-[10px] uppercase tracking-widest">Platform Overview</Badge>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Enterprise AI Partnership Intelligence</h2>
              <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
                PartnerIQ is an enterprise AI-powered platform connecting talent — creators, athletes, celebrities — with brands and agencies. Featuring a fault-tolerant multi-agent architecture with 50+ AI agents operating concurrently, automatic failover, and mandatory human approval for all outbound communications.
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Key Platform Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {KEY_METRICS.map((m, i) =>
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-sm transition-shadow">
                  <p className="text-2xl font-bold text-indigo-600 tracking-tight">{m.value}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{m.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Types */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Who PartnerIQ Serves</h3>
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
      <div className="py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Market Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Real-Time Industry Benchmarks</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Data-driven insights to make smarter partnership decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {/* Rate Benchmarks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <h3 className="font-semibold text-slate-900 mb-6 text-lg">Creator Pricing Tiers</h3>
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
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <h3 className="font-semibold text-slate-900 mb-6 text-lg">Campaign ROI Benchmarks</h3>
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

          <div className="text-center text-sm text-slate-600">
            Full market intelligence and advanced filters available to all users
          </div>
        </div>
      </div>

      {/* ── ONBOARDING FORM ── */}
      <div className="py-20 border-t border-slate-200">
      <div className="flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-12">
          {["Account Type", "Choose Plan", "Your Details"].map((label, i) => {
                const num = i + 1;
                const active = step === num;
                const done = step > num;
                return (
                  <React.Fragment key={num}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${active ? "text-indigo-600" : done ? "text-slate-600" : "text-slate-500"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${step > num ? "bg-emerald-500" : "bg-slate-300"}`} />}
              </React.Fragment>);

              })}
        </div>

        <>
          {/* ── STEP 1: Account Type ── */}
          {step === 1 &&
              <div className="space-y-4 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">What type of account do you need?</h2>
             <p className="text-slate-600 mb-6">Select your role to personalize your experience</p>

             <div className="space-y-3">
               {ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        onClick={() => setSelectedRole(role.key)}
                        className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left
                       ${isSelected ? "bg-indigo-50 border-indigo-300 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"}`}>

                     <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                       <Icon className="w-6 h-6 text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-slate-900">{role.title}</p>
                       <p className="text-sm text-slate-600 mt-0.5 mb-2">{role.desc}</p>
                       <div className="flex flex-wrap gap-1.5">
                         {role.perks.map((p, i) =>
                            <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">{p}</span>
                            )}
                       </div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
                       ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                       {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                     </div>
                   </button>);

                  })}
             </div>

             <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  className="w-full mt-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">

               Continue <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
              }

        {/* ── STEP 2: Plan ── */}
         {step === 2 &&
              <div className="space-y-4 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">Choose your plan</h2>
             <p className="text-slate-600 mb-6">
               You selected <span className={`font-semibold text-slate-900`}>{roleObj?.title}</span>. Pick the plan that fits your needs.
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {(PLANS_BY_ROLE[selectedRole] || []).map((plan) => {
                    const isSelected = selectedPlan === plan.key;
                    return (
                      <button
                        key={plan.key}
                        onClick={() => setSelectedPlan(plan.key)}
                        className={`relative flex flex-col p-6 rounded-xl border-2 text-left transition-all duration-200
                       ${isSelected ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>

                     {plan.badge &&
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                         <Star className="w-3 h-3" /> {plan.badge}
                       </div>
                        }
                     <div className="flex items-end gap-1 mb-2">
                       <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                       <span className={`text-sm mb-1 ${isSelected ? "text-slate-700" : "text-slate-600"}`}>{plan.period}</span>
                     </div>
                     <p className="text-sm font-semibold text-slate-900 mb-4">{plan.title}</p>
                     <ul className="space-y-2 flex-1">
                       {plan.features.map((f, i) =>
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                           {f}
                         </li>
                          )}
                     </ul>
                     <div className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                       {isSelected ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Selected</span> : plan.cta}
                     </div>
                   </button>);

                  })}
             </div>

             <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
               <Lock className="w-3.5 h-3.5" />
               <span>Secure checkout · Cancel anytime · No hidden fees</span>
             </div>

             <div className="flex gap-3 mt-6">
               <Button variant="outline" onClick={() => {setSelectedRole("");setStep(1);}} className="flex-1 h-11 border-slate-300 text-slate-900 hover:bg-slate-50">
                 Back
               </Button>
               <Button onClick={() => setStep(3)} disabled={!selectedPlan} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                 Continue <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </div>
           </div>
              }

        {/* ── STEP 3: Details ── */}
         {step === 3 &&
              <div className="space-y-5 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">Complete your profile</h2>
             <p className="text-slate-600 mb-6">
               Almost done! Just a few details to finish setting up your <span className="font-semibold text-slate-900">{roleObj?.title}</span> account.
             </p>

             <div>
               <Label className="text-slate-900 font-medium">{labels.name}</Label>
               <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={labels.namePlaceholder}
                    className="mt-2 border-slate-300 text-slate-900 placeholder:text-slate-500 h-11 bg-white" />

             </div>
             <div>
               <Label className="text-slate-900 font-medium">{labels.title}</Label>
               <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={labels.titlePlaceholder}
                    className="mt-2 border-slate-300 text-slate-900 placeholder:text-slate-500 h-11 bg-white" />

             </div>

             {/* Summary card */}
             <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-center gap-4 mt-6">
               <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${roleObj?.color} flex items-center justify-center flex-shrink-0`}>
                 {roleObj && <roleObj.icon className="w-5 h-5 text-white" />}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-semibold text-slate-900">{roleObj?.title} · {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}</p>
                 <p className="text-xs text-slate-600 mt-0.5 truncate">{name || "Your profile"}</p>
               </div>
               {selectedPlan === "pro" && <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
             </div>

             <div className="flex gap-3 mt-6">
               <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 border-slate-300 text-slate-900 hover:bg-slate-50">
                 Back
               </Button>
               <Button onClick={handleComplete} disabled={saving || !name} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                 {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                 {saving ? "Setting up..." : "Launch Dashboard"}
               </Button>
             </div>
             </div>
              }
             </>
             </div>
             </div>
             </div>
             </div>);

}
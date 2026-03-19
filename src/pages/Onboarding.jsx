import React, { useState, useEffect, useRef } from "react";
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
  Brain, TrendingUp, Layers, Bell, ChevronDown, BarChart3, Globe, Network,
  Calendar, Award, Target, DollarSign, ChevronRight, Play, Check
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { FAQSection, ComparisonSection, SecurityBadges, VideoDemoSection, MobileAppSection } from "@/components/landing/LandingSections";
import LandingPage from "@/components/landing/LandingPage";

// ─────────────────────────────────────────────
// DATA — unchanged from original
// ─────────────────────────────────────────────

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
];

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
        "Basic analytics",
      ],
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
        "Performance analytics dashboard",
      ],
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
        "Full ROI Simulator & advanced analytics",
      ],
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
        "Priority support & custom analytics",
      ],
      cta: "Start Elite",
      color: "border-purple-500",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white"
    },
  ],

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
        "Basic analytics",
      ],
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
        "Performance analytics dashboard",
      ],
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
        "Team collaboration (up to 10 seats)",
      ],
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
        "Dedicated success manager & SLA",
      ],
      cta: "Contact Sales",
      color: "border-slate-600",
      btnClass: "bg-slate-700 hover:bg-slate-800 text-white"
    },
  ],

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
        "Agency-level reporting & dashboards",
      ],
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
        "Bulk outreach & campaign coordination",
      ],
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
        "Dedicated success team & SLA support",
      ],
      cta: "Contact Sales",
      color: "border-slate-600",
      btnClass: "bg-slate-700 hover:bg-slate-800 text-white"
    },
  ],
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
  { value: "32", label: "Industries" }
];

const KEY_METRICS = [
  { label: "System Uptime", value: "99.95%", desc: "< 4.4 hours downtime/year" },
  { label: "Agent Concurrency", value: "50+", desc: "Running simultaneously across 12 agent types" },
  { label: "Fault Recovery", value: "< 30s", desc: "Automatic failover and task reassignment" },
  { label: "Match Accuracy", value: "94%", desc: "AI recommendation precision validated" },
  { label: "Human Approval", value: "100%", desc: "All outbound requires human review" },
  { label: "Data Sources", value: "50+", desc: "Social, marketplace, public data" },
  { label: "Categories Covered", value: "32", desc: "Universal partnership categories" },
  { label: "Profiles Indexed", value: "10M+", desc: "Searchable talent profiles" },
  { label: "Daily Data Updates", value: "5M+", desc: "Metrics refreshed daily" }
];

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
  { icon: BarChart3, color: "bg-sky-50 text-sky-600", title: "Market Intelligence", desc: "Rate benchmarks, competitive intel, trend analysis" }
];

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
  { name: "Automotive", icon: "🚗", range: "$10K – $5M", examples: "Car enthusiasts, racing", color: "border-l-red-400" }
];

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
  }
];

const HIGHLIGHTS = [
  { icon: Brain, text: "AI-Powered Matching" },
  { icon: TrendingUp, text: "Predictive Analytics" },
  { icon: Layers, text: "Auto Pitch Decks" },
  { icon: CheckSquare, text: "Human Approval Workflow" },
  { icon: Shield, text: "Fault-Tolerant Architecture" },
  { icon: Bell, text: "Real-Time Alerts" }
];

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

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────

const Tooltip = ({ text }) => (
  <span className="group relative inline-flex items-center ml-1.5 cursor-pointer">
    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">?</span>
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl leading-relaxed">
      {text}
    </span>
  </span>
);

// Animated stat that counts up on mount
const AnimatedStat = ({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
        {value}
      </div>
      <div className="text-sm text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
};

// Section fade-in wrapper
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

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
  const [brandWizardStep, setBrandWizardStep] = useState(1);
  const [selectedCultures, setSelectedCultures] = useState([]);
  const [audienceAges, setAudienceAges] = useState([]);
  const [audienceGenders, setAudienceGenders] = useState([]);
  const [audienceInterests, setAudienceInterests] = useState([]);
  const [audienceLocations, setAudienceLocations] = useState([]);
  const [campaignObjectives, setCampaignObjectives] = useState([]);
  const [preferredPartnerships, setPreferredPartnerships] = useState([]);
  const [annualBudget, setAnnualBudget] = useState("");

  // Pricing tab state (for the landing section)
  const [pricingTab, setPricingTab] = useState("brand");

  const navigate = useNavigate();
  const formRef = useRef(null);

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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setStep(2);
    scrollToForm();
  };

  const handleComplete = async () => {
    setSaving(true);
    setAuthError("");
    try {
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

      await new Promise(r => setTimeout(r, 1000));

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

      if (selectedRole === "brand" && name) {
        try {
          await base44.entities.Brand.create({
            name,
            preferred_niches: audienceInterests.slice(0, 3).join(","),
            target_audience: `${audienceAges.join(", ")} | ${audienceGenders.join(", ")}`,
            annual_budget: parseFloat(annualBudget) || 0,
            status: "active",
          });
        } catch (e) {}
      }

      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const roleObj = ROLES.find((r) => r.key === selectedRole);
  const labels = LABEL_MAP[selectedRole] || LABEL_MAP.brand;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  // Step 1: Show the premium landing page
  if (step === 1) {
    return (
      <LandingPage
        onGetStarted={() => { setStep(2); window.scrollTo(0, 0); }}
        onSelectRole={(role) => { setSelectedRole(role); setStep(2); window.scrollTo(0, 0); }}
      />
    );
  }

  // Step 2+: Show the signup flow (gold theme matching landing page)
  return (
    <div className="min-h-screen antialiased" style={{ scrollBehavior: "smooth", background: "#080807", color: "#f5f0e6", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        /* Gold theme overrides for signup flow */
        .min-h-screen { background: #080807 !important; }
        .bg-slate-950, .bg-gradient-to-b, .bg-gradient-to-br { background: #080807 !important; }
        .from-indigo-500, .from-indigo-600, .bg-indigo-600, .bg-indigo-500 { background: linear-gradient(135deg, #c4a24a, #e07b18) !important; }
        .hover\\:bg-indigo-700:hover, .hover\\:bg-indigo-600:hover { background: linear-gradient(135deg, #b39340, #d07015) !important; }
        .text-indigo-400, .text-indigo-300, .text-violet-400 { color: #d9b96a !important; }
        .text-indigo-600, .text-indigo-500 { color: #c4a24a !important; }
        .border-indigo-500, .border-indigo-500\\/20 { border-color: rgba(196,162,74,0.3) !important; }
        .bg-indigo-500\\/10, .bg-indigo-500\\/15 { background: rgba(196,162,74,0.1) !important; }
        .shadow-indigo-500\\/20, .shadow-indigo-500\\/25, .shadow-indigo-500\\/30 { box-shadow: 0 4px 24px rgba(196,162,74,0.15) !important; }
        .from-violet-400, .to-violet-400, .from-violet-500, .to-violet-500 { color: #f09040; }
        .bg-gradient-to-r.from-indigo-400 { background: linear-gradient(90deg, #d9b96a, #f09040) !important; -webkit-background-clip: text !important; }
        .ring-indigo-500 { --tw-ring-color: rgba(196,162,74,0.5) !important; }
        /* Buttons */
        button[class*="bg-indigo"], a[class*="bg-indigo"] { background: linear-gradient(135deg, #c4a24a, #e07b18) !important; color: #080807 !important; }
        /* Cards on dark bg */
        .bg-white\\/5, .bg-white\\/10 { background: rgba(245,240,230,0.03) !important; }
        .border-white\\/10, .border-white\\/5 { border-color: rgba(255,248,220,0.07) !important; }
        /* Emerald to gold */
        .from-emerald-500, .bg-emerald-500, .text-emerald-400 { color: #c4a24a !important; }
        .bg-emerald-50, .bg-emerald-500\\/10 { background: rgba(196,162,74,0.1) !important; }
      `}</style>

      {/* ══════════════════════════════════════════════
          STICKY HEADER — gold theme
      ══════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 sm:px-10"
        style={{ background: "rgba(8,8,7,0.92)", backdropFilter: "blur(24px)", borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>
        <button onClick={() => setStep(1)} className="flex items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, color: "#f5f0e6" }}>Deal<span style={{ background: "linear-gradient(90deg, #d9b96a, #f09040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>stage</span></span>
        </button>
        {/* Step indicator */}
        <div className="hidden md:flex items-center gap-3">
          {["Role", "Plan", "Account"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{
                width: 24, height: 24, borderRadius: "50%", fontSize: "0.65rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
                background: step >= i + 2 ? "linear-gradient(135deg, #c4a24a, #e07b18)" : "rgba(255,248,220,0.07)",
                color: step >= i + 2 ? "#080807" : "rgba(245,240,230,0.3)",
                fontFamily: "'Instrument Mono', monospace",
              }}>{i + 1}</div>
              <span style={{ fontSize: "0.75rem", color: step >= i + 2 ? "#f5f0e6" : "rgba(245,240,230,0.25)", fontFamily: "'Instrument Sans', sans-serif" }}>{label}</span>
              {i < 2 && <div style={{ width: 20, height: "0.5px", background: "rgba(255,248,220,0.1)" }} />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" style={{ fontSize: "0.82rem", color: "rgba(245,240,230,0.4)", textDecoration: "none", fontFamily: "'Instrument Sans', sans-serif" }}>Log in</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-sm text-slate-400 hover:text-white transition-colors font-medium hidden sm:block">
            Sign in
          </button>
          <Button onClick={scrollToForm} className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all">
            Get started
          </Button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden bg-slate-950">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/3 right-1/6 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
          <div className="absolute bottom-1/4 left-1/2 w-[300px] h-[300px] rounded-full bg-indigo-400/6 blur-[80px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "4s" }} />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-widest uppercase">AI-Powered · Enterprise Grade</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-8 max-w-5xl mx-auto">
            The Intelligence Platform
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              for Creator Partnerships
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Deal Stage connects Talent, Brands, and Agencies using AI that finds the perfect match, predicts campaign ROI, and closes deals — all in one platform.
          </p>

          {/* Animated stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 max-w-3xl mx-auto mb-16 py-6 border-y border-white/5">
            <AnimatedStat value="50+" label="AI Agents" />
            <AnimatedStat value="94%" label="Match Accuracy" />
            <AnimatedStat value="486" label="Culture Events" />
            <AnimatedStat value="88" label="Verified Platforms" />
          </div>

          {/* Role CTA Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {/* Talent */}
            <button
              onClick={() => handleRoleSelect("talent")}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-1">I'm a Creator</p>
              <p className="text-xs text-slate-400 leading-relaxed">Athlete, influencer, or celebrity seeking brand deals</p>
              <div className="flex items-center gap-1 mt-3 text-emerald-400 text-xs font-semibold">
                Get started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Brand — most prominent */}
            <button
              onClick={() => handleRoleSelect("brand")}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/15 hover:border-indigo-400/60 transition-all duration-300 shadow-xl shadow-indigo-500/10 backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-500/30">
                Most Popular
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-1">I'm a Brand</p>
              <p className="text-xs text-slate-400 leading-relaxed">Company or brand looking to partner with creators</p>
              <div className="flex items-center gap-1 mt-3 text-indigo-400 text-xs font-semibold">
                Get started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Agency */}
            <button
              onClick={() => handleRoleSelect("agency")}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-1">I'm an Agency</p>
              <p className="text-xs text-slate-400 leading-relaxed">Talent agency managing rosters and multi-brand pipelines</p>
              <div className="flex items-center gap-1 mt-3 text-amber-400 text-xs font-semibold">
                Get started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <p className="text-sm text-slate-500">No credit card required &middot; Free plan available &middot; Set up in minutes</p>
        </div>

        {/* Scroll chevron */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF BAR
      ══════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-slate-900/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-8">
            Trusted by leading brands and creators worldwide
          </p>
          <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap mb-8">
            {[
              { name: "Coca-Cola", emoji: "🥤" },
              { name: "Corona", emoji: "🍺" },
              { name: "Heineken", emoji: "🍻" },
              { name: "JBL", emoji: "🎵" },
              { name: "L'Oreal", emoji: "💄" },
              { name: "Nike", emoji: "👟" },
              { name: "Red Bull", emoji: "🐂" },
            ].map((brand, i) =>
              <div key={i} className="text-center flex flex-col items-center opacity-30 hover:opacity-60 transition-opacity">
                <div className="text-2xl mb-1">{brand.emoji}</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{brand.name}</p>
              </div>
            )}
          </div>
          {/* Numbers strip */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto border-t border-white/5 pt-8">
            <div className="text-center">
              <p className="text-xl font-black text-white">10M+</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Profiles Indexed</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-xl font-black text-white">$2B+</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Deal Value Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-white">146</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Industries Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 sm:py-36 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">How it works</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                From search to signed deal
                <span className="block text-slate-400 font-normal text-2xl sm:text-3xl mt-2">in three steps.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />

            {[
              {
                step: "01",
                icon: Layers,
                title: "Connect & Build Your Data Room",
                desc: "Sync your social accounts, upload past deal data, and let AI build a living profile that gets smarter every day.",
                color: "from-indigo-500 to-indigo-600",
                glow: "shadow-indigo-500/20"
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Matches You with Perfect Partners",
                desc: "Our 50+ AI agents analyze 10M+ profiles across 146 industries to surface the highest-compatibility matches with 94% accuracy.",
                color: "from-violet-500 to-violet-600",
                glow: "shadow-violet-500/20"
              },
              {
                step: "03",
                icon: DollarSign,
                title: "Close Deals with Full Intelligence",
                desc: "Auto-generate pitch decks, simulate deal ROI with 10,000 Monte Carlo scenarios, and close with smart contract tools.",
                color: "from-fuchsia-500 to-fuchsia-600",
                glow: "shadow-fuchsia-500/20"
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 120}>
                  <div className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-white/3 border border-white/6 hover:border-white/12 hover:bg-white/5 transition-all duration-300 group">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-600 tracking-widest">{item.step}</div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-xl ${item.glow} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 leading-snug">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════ */}
      <section id="features" className="py-28 sm:py-36 bg-gradient-to-b from-slate-950 to-[#0a0d1a]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Features</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  win partnerships.
                </span>
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto">
                Six powerful modules working together as one unified intelligence platform.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                gradient: "from-indigo-500 to-violet-600",
                glow: "shadow-indigo-500/20",
                title: "AI Match Engine",
                desc: "40+ weighted signals. 94% accuracy. Finds your highest-compatibility partners across 10M+ profiles in seconds."
              },
              {
                icon: Layers,
                gradient: "from-violet-500 to-fuchsia-600",
                glow: "shadow-violet-500/20",
                title: "Three Data Rooms",
                desc: "Separate intelligence vaults for Talent, Brand, and Agency — each with custom fields, media kits, and deal history."
              },
              {
                icon: Sparkles,
                gradient: "from-fuchsia-500 to-pink-600",
                glow: "shadow-fuchsia-500/20",
                title: "50+ AI Agents",
                desc: "Concurrent agents handle discovery, outreach drafting, pitch generation, ROI modeling, and real-time alerts — 24/7."
              },
              {
                icon: Shield,
                gradient: "from-emerald-500 to-teal-600",
                glow: "shadow-emerald-500/20",
                title: "Smart Contract & Escrow",
                desc: "AI-generated contracts with milestone-based escrow. Both parties protected. Disputes resolved by intelligence, not lawyers."
              },
              {
                icon: Calendar,
                gradient: "from-amber-500 to-orange-600",
                glow: "shadow-amber-500/20",
                title: "Culture Calendar",
                desc: "486 tracked culture events, award shows, and sponsorship windows. Never miss a peak relevance moment for your deals."
              },
              {
                icon: Award,
                gradient: "from-blue-500 to-cyan-600",
                glow: "shadow-blue-500/20",
                title: "Deal Score System",
                desc: "Every partnership gets a composite score: fit, timing, audience overlap, budget alignment, and predictive success rate."
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <div className="group relative p-7 rounded-2xl bg-white/3 border border-white/6 hover:border-white/12 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {/* Hover glow background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03]`} />
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-xl ${feature.glow} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="relative font-bold text-white text-lg mb-2">{feature.title}</h3>
                    <p className="relative text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          THREE-SIDED PLATFORM
      ══════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36 bg-[#0a0d1a]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-5">
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">The Network Effect</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Built for every side
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  of the deal.
                </span>
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto">
                One platform connecting all three parties. Every deal makes the AI smarter for everyone.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Users,
                label: "Talent",
                color: "border-emerald-500/30 hover:border-emerald-500/50",
                badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                gradient: "from-emerald-500 to-teal-600",
                accent: "text-emerald-400",
                points: [
                  "Auto-generated media kit & profile",
                  "Curated brand opportunities daily",
                  "Deal pipeline & earnings tracker",
                  "Pitch deck generation in minutes",
                  "Market rate benchmarking"
                ]
              },
              {
                icon: Building2,
                label: "Brands",
                color: "border-indigo-500/30 hover:border-indigo-500/50",
                badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                gradient: "from-indigo-500 to-blue-600",
                accent: "text-indigo-400",
                points: [
                  "Search 10M+ verified talent profiles",
                  "AI recommendations with score cards",
                  "Campaign ROI simulation (10K scenarios)",
                  "Automated outreach sequences",
                  "Brand safety analysis"
                ]
              },
              {
                icon: Briefcase,
                label: "Agencies",
                color: "border-amber-500/30 hover:border-amber-500/50",
                badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                gradient: "from-amber-500 to-orange-600",
                accent: "text-amber-400",
                points: [
                  "Full roster management dashboard",
                  "Multi-brand deal pipelines",
                  "Team collaboration & approvals",
                  "Cross-client analytics & benchmarks",
                  "White-label platform option"
                ]
              },
            ].map((side, i) => {
              const Icon = side.icon;
              return (
                <FadeIn key={i} delay={i * 100}>
                  <div className={`flex flex-col p-8 rounded-2xl bg-white/3 border ${side.color} transition-all duration-300 h-full`}>
                    <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 mb-5 self-start ${side.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{side.label}</span>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {side.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                          <Check className={`w-4 h-4 ${side.accent} flex-shrink-0 mt-0.5`} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Network effect callout */}
          <FadeIn>
            <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 text-center">
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <p className="text-xl font-bold text-white mb-2">Every deal makes the AI smarter.</p>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Deal Stage's network effect means every signed partnership, every campaign result, and every match outcome trains the model — so your next deal is always smarter than your last.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING SECTION
      ══════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 sm:py-36 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto">
                Start free, scale when you're ready. No surprises, no hidden fees.
              </p>
            </div>
          </FadeIn>

          {/* Pricing role tabs */}
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center bg-white/4 border border-white/8 rounded-xl p-1.5 gap-1">
              {[
                { key: "talent", label: "Talent", icon: Users },
                { key: "brand", label: "Brands", icon: Building2 },
                { key: "agency", label: "Agency", icon: Briefcase },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setPricingTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                      ${pricingTab === tab.key ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white"}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan cards */}
          <div className={`grid gap-5 ${(PLANS_BY_ROLE[pricingTab] || []).length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
            {(PLANS_BY_ROLE[pricingTab] || []).map((plan, i) => {
              const isPopular = plan.badge === "Most Popular";
              return (
                <FadeIn key={plan.key} delay={i * 80}>
                  <div className={`relative flex flex-col h-full rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1
                    ${isPopular
                      ? "bg-gradient-to-b from-indigo-500/15 to-violet-500/10 border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/10"
                      : "bg-white/3 border border-white/8 hover:border-white/14 hover:bg-white/5"
                    }`}>
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg shadow-indigo-500/30">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </div>
                    )}

                    <div className="mb-5">
                      <p className="text-sm font-bold text-slate-300 mb-3">{plan.title}</p>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-sm text-slate-500 mb-1.5">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-7 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => { setPricingTab(pricingTab); setSelectedRole(pricingTab); setSelectedPlan(plan.key); setStep(3); scrollToForm(); }}
                      className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${isPopular
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-white/8 hover:bg-white/14 text-white border border-white/10"
                      }`}>
                      {plan.cta}
                    </Button>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ENTERPRISE SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36 bg-[#06080f]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden border border-white/8 p-10 sm:p-16">
              {/* BG gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-slate-800 border border-white/8 rounded-full px-4 py-2 mb-6">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                    Built for Enterprise Scale
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-8">
                    Custom deployments, white-label options, dedicated success teams, and SLA-backed uptime for organizations that can't afford to slow down.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      "Custom AI model fine-tuning",
                      "White-label platform & domain",
                      "Full API & webhook access",
                      "SSO & advanced security",
                      "Custom BI dashboards",
                      "Dedicated success manager",
                      "99.95% SLA uptime guarantee",
                      "Audit logs & compliance exports",
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                  <Button className="h-12 px-8 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all">
                    Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Trust badges */}
                  {[
                    { icon: Shield, title: "SOC 2 Type II", desc: "Annual third-party security audit" },
                    { icon: Globe, title: "GDPR Compliant", desc: "Full EU data protection compliance" },
                    { icon: Lock, title: "Enterprise SSO", desc: "SAML 2.0, Okta, Azure AD, Google Workspace" },
                    { icon: CheckSquare, title: "99.95% Uptime SLA", desc: "Contractually guaranteed availability" },
                  ].map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-white/4 border border-white/6 hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/8 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{badge.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SIGNUP FORM — THE ONBOARDING FLOW
      ══════════════════════════════════════════════ */}
      <section ref={formRef} id="get-started" className="py-28 sm:py-36 bg-slate-950 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6">

          {/* Section header */}
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Get started in minutes.
              </h2>
              <p className="text-slate-400 text-base">
                Choose your role, pick a plan, and launch your partnership intelligence platform.
              </p>
            </div>
          </FadeIn>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-10 bg-white/3 rounded-2xl border border-white/6 p-4">
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
                      ${done ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : active ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "bg-white/8 text-slate-500"}`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block transition-colors ${active ? "text-indigo-400" : done ? "text-emerald-400" : "text-slate-500"}`}>{label}</span>
                  </div>
                  {i < (selectedRole === "brand" ? 3 : 2) && (
                    <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${step > num ? "bg-emerald-500" : "bg-white/6"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: Account Type ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">What type of account do you need?</h3>
                <p className="text-sm text-slate-400 mt-1">Select your role to personalize your experience</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      onClick={() => setSelectedRole(role.key)}
                      className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left
                        ${isSelected
                          ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5"}`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white">{role.title}</p>
                        <p className="text-sm text-slate-400 mt-0.5 mb-2.5">{role.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.perks.map((p, i) =>
                            <span key={i} className="text-[11px] bg-white/6 text-slate-300 px-2.5 py-1 rounded-lg font-medium border border-white/6">{p}</span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300
                        ${isSelected ? "border-indigo-500 bg-indigo-600 shadow-md shadow-indigo-500/30" : "border-slate-600"}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedRole}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:shadow-none text-sm mt-4">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── STEP 2: Plan ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Choose your plan</h3>
                <p className="text-sm text-slate-400 mt-1">
                  You selected <span className="font-semibold text-white">{roleObj?.title}</span>. Pick the plan that fits your needs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(PLANS_BY_ROLE[selectedRole] || []).map((plan) => {
                  const isSelected = selectedPlan === plan.key;
                  const isPopular = plan.badge === "Most Popular";
                  return (
                    <button
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key)}
                      className={`relative flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-200
                        ${isSelected
                          ? "border-indigo-500/60 bg-indigo-500/10 shadow-xl shadow-indigo-500/10"
                          : isPopular
                          ? "border-white/12 bg-white/4 hover:border-white/20"
                          : "border-white/8 bg-white/3 hover:border-white/14"}`}>
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-indigo-500/25">
                          <Star className="w-3 h-3" /> {plan.badge}
                        </div>
                      )}
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-sm mb-1 text-slate-500">{plan.period}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-200 mb-4">{plan.title}</p>
                      <ul className="space-y-2.5 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200
                        ${isSelected
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-white/8 text-slate-300"}`}>
                        {isSelected ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Selected</span> : plan.cta}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Secure checkout · Cancel anytime · No hidden fees</span>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => { setSelectedRole(""); setStep(1); }}
                  className="flex-1 h-12 rounded-xl border-white/10 text-slate-300 hover:bg-white/5 bg-transparent font-medium">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedPlan}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:shadow-none">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Account Details ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Create your account</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Almost done. Set up your <span className="font-semibold text-white">{roleObj?.title}</span> account.
                </p>
              </div>

              {/* Credentials */}
              <div className="bg-white/3 rounded-2xl border border-white/6 p-5 space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Credentials</p>
                <div>
                  <Label className="text-slate-300 font-semibold text-sm">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <Label className="text-slate-300 font-semibold text-sm">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
                </div>
              </div>

              {/* Profile details */}
              <div className="bg-white/3 rounded-2xl border border-white/6 p-5 space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Details</p>
                <div>
                  <Label className="text-slate-300 font-semibold text-sm">{labels.name}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={labels.namePlaceholder}
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <Label className="text-slate-300 font-semibold text-sm">{labels.title}</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={labels.titlePlaceholder}
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
                </div>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-xs font-bold">!</span>
                  </div>
                  {authError}
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-r from-white/3 to-indigo-500/5 rounded-2xl border border-white/6 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleObj?.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  {roleObj && <roleObj.icon className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{roleObj?.title} · {selectedPlan === "pro" || selectedPlan === "agency_pro" ? "Pro Plan" : selectedPlan === "free" || selectedPlan === "agency_starter" ? "Starter Plan" : "Selected Plan"}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{name || "Your profile"}</p>
                </div>
                {(selectedPlan === "pro" || selectedPlan === "agency_pro") && <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}
                  className="flex-1 h-12 rounded-xl border-white/10 text-slate-300 hover:bg-white/5 bg-transparent font-medium">
                  Back
                </Button>
                {selectedRole === "brand" ? (
                  <Button onClick={() => setStep(4)} disabled={!name || !email || !password}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:shadow-none">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} disabled={saving || !name || !email || !password}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:shadow-none">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {saving ? "Setting up..." : "Launch Dashboard"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Brand Wizard ── */}
          {step === 4 && (
            <div className="space-y-6">
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
                          ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-white/8 text-slate-500"}`}>
                          {done ? "✓" : num}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${active ? "text-indigo-400" : done ? "text-slate-400" : "text-slate-600"}`}>{label}</span>
                      </div>
                      {i < 2 && <div className={`flex-1 h-px ${brandWizardStep > num ? "bg-emerald-500" : "bg-white/8"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Wizard Step 1: Company Culture */}
              {brandWizardStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Define Your Brand Culture
                      <Tooltip text="Your brand culture helps us match you with talent whose content style and audience values align with yours." />
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Select up to 3 traits that best describe your brand's personality. <span className="text-indigo-400 font-medium">Example: Nike = Innovative + Purpose-Driven + Playful</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {BRAND_CULTURES.map(c => {
                      const sel = selectedCultures.includes(c.key);
                      return (
                        <button key={c.key} onClick={() => toggleItem(selectedCultures, setSelectedCultures, c.key)}
                          disabled={!sel && selectedCultures.length >= 3}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                            ${sel ? "border-indigo-500/60 bg-indigo-500/10" : "border-white/8 bg-white/3 hover:border-white/14"}
                            ${!sel && selectedCultures.length >= 3 ? "opacity-30 cursor-not-allowed" : ""}`}>
                          <span className="text-2xl">{c.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-white">{c.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
                          </div>
                          {sel && <CheckCircle2 className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
                    Brands with clearly defined cultures get 3x better talent match scores.
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-11 border-white/10 text-slate-300 hover:bg-white/5 bg-transparent">Back</Button>
                    <Button onClick={() => setBrandWizardStep(2)} disabled={selectedCultures.length === 0}
                      className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white">
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Wizard Step 2: Target Audience */}
              {brandWizardStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Define Your Target Audience
                      <Tooltip text="Precise audience targeting means we match you with talent whose followers match your ideal customer profile." />
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Help us understand who you're trying to reach. <span className="text-indigo-400 font-medium">Example: Sephora targets 18–34 Female beauty & lifestyle audiences.</span></p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                      Age Groups <Tooltip text="Select all age ranges your primary customers fall into." />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AUDIENCE_AGES.map(age => (
                        <button key={age} onClick={() => toggleItem(audienceAges, setAudienceAges, age)}
                          className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${audienceAges.includes(age) ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                      Gender Focus <Tooltip text="Which genders make up your primary audience?" />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AUDIENCE_GENDERS.map(g => (
                        <button key={g} onClick={() => toggleItem(audienceGenders, setAudienceGenders, g)}
                          className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${audienceGenders.includes(g) ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                      Key Interests <Tooltip text="What topics are your customers passionate about?" />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AUDIENCE_INTERESTS.map(interest => (
                        <button key={interest} onClick={() => toggleItem(audienceInterests, setAudienceInterests, interest)}
                          className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${audienceInterests.includes(interest) ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                      Primary Markets <Tooltip text="Where are most of your customers located?" />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AUDIENCE_LOCATIONS.map(loc => (
                        <button key={loc} onClick={() => toggleItem(audienceLocations, setAudienceLocations, loc)}
                          className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${audienceLocations.includes(loc) ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setBrandWizardStep(1)} className="flex-1 h-11 border-white/10 text-slate-300 hover:bg-white/5 bg-transparent">Back</Button>
                    <Button onClick={() => setBrandWizardStep(3)} disabled={audienceAges.length === 0 || audienceInterests.length === 0}
                      className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white">
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Wizard Step 3: Campaign Objectives */}
              {brandWizardStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Set Your Campaign Goals
                      <Tooltip text="Your campaign objectives shape how we score and prioritize talent matches for your campaigns." />
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">What are you trying to achieve? <span className="text-indigo-400 font-medium">Example: Red Bull focuses on Brand Awareness + Community Building.</span></p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAMPAIGN_OBJECTIVES.map(obj => {
                      const sel = campaignObjectives.includes(obj.key);
                      return (
                        <button key={obj.key} onClick={() => toggleItem(campaignObjectives, setCampaignObjectives, obj.key)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                            ${sel ? "border-indigo-500/60 bg-indigo-500/10" : "border-white/8 bg-white/3 hover:border-white/14"}`}>
                          <span className="text-xl">{obj.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{obj.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{obj.desc}</p>
                          </div>
                          {sel && <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                      Preferred Partnership Types <Tooltip text="What type of collaborations does your brand typically run?" />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PARTNERSHIP_TYPES.map(pt => (
                        <button key={pt.key} onClick={() => toggleItem(preferredPartnerships, setPreferredPartnerships, pt.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${preferredPartnerships.includes(pt.key) ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {pt.emoji} {pt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center mb-2">
                      Estimated Annual Budget <Tooltip text="This helps us show you talent within your budget range." />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Under $10K", "$10K–$50K", "$50K–$250K", "$250K–$1M", "$1M+"].map(b => (
                        <button key={b} onClick={() => setAnnualBudget(b)}
                          className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                            ${annualBudget === b ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300" : "border-white/8 text-slate-400 hover:border-white/14"}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-300">Your brand profile is ready!</p>
                      <p className="text-xs text-emerald-400/70 mt-0.5">AI will use this to proactively recommend talent, generate campaign briefs, and score matches for your goals.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setBrandWizardStep(2)} className="flex-1 h-11 border-white/10 text-slate-300 hover:bg-white/5 bg-transparent">Back</Button>
                    <Button onClick={handleComplete} disabled={saving || campaignObjectives.length === 0}
                      className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {saving ? "Setting up..." : "Launch Dashboard"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA SECTION
      ══════════════════════════════════════════════ */}
      {/* ── NEW SECTIONS: Video Demo, Comparison, FAQ, Security, Mobile ── */}
      <div style={{ background: "#080807", color: "#f5f0e6" }}>
        <VideoDemoSection />
        <ComparisonSection />
        <SecurityBadges />
        <FAQSection />
        <MobileAppSection />
      </div>

      <section className="py-28 sm:py-36 bg-gradient-to-b from-[#06080f] to-slate-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-300 tracking-widest uppercase">Get started today</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
              Ready to transform
              <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                your partnerships?
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Join the intelligence platform trusted by creators, brands, and agencies worldwide. Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={scrollToForm}
                className="w-full sm:w-auto h-14 px-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold text-base shadow-2xl shadow-indigo-500/25 transition-all hover:scale-105">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button onClick={() => navigate("/login")} className="text-sm text-slate-400 hover:text-white transition-colors font-medium underline underline-offset-4">
                Already have an account? Sign in
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-5">No credit card required · Free plan available · Cancel anytime</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-[#020409] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">Deal Stage</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                AI-powered partnership intelligence for creators, brands, and agencies. Close better deals, faster.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Calculator", href: "/calculator" },
                  { label: "API", href: "#" },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Partners", href: "#" },
                  { label: "Contact", href: "#" },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Security", href: "#" },
                  { label: "GDPR", href: "#" },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2026 DealStage LLC. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {/* Social placeholders */}
              {["Twitter", "LinkedIn", "Instagram"].map(social => (
                <a key={social} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

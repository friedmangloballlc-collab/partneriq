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
  Brain, TrendingUp, Layers, Bell, ChevronDown, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ROLES = [
  {
    key: "talent",
    icon: Users,
    title: "Talent",
    desc: "Creator, athlete, or celebrity seeking brand deals",
    color: "from-emerald-500 to-teal-600",
    accent: "emerald",
    perks: ["Talent profile & discovery", "Brand match engine", "Deal pipeline", "Connect social accounts"],
  },
  {
    key: "brand",
    icon: Building2,
    title: "Brands",
    desc: "Brand or company looking to partner with creators",
    color: "from-indigo-500 to-blue-600",
    accent: "indigo",
    perks: ["Talent discovery & search", "AI-powered matching", "Outreach sequences", "ROI simulation"],
  },
  {
    key: "agency",
    icon: Briefcase,
    title: "Agency",
    desc: "Talent agency managing rosters and partnerships",
    color: "from-amber-500 to-orange-600",
    accent: "amber",
    perks: ["Full roster management", "Multi-brand pipelines", "Team collaboration", "Advanced analytics"],
  },
];

const PLANS = [
  {
    key: "free",
    title: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
      "Up to 25 talent profiles",
      "5 active deals",
      "Basic analytics",
      "Email outreach (10/mo)",
      "Community support",
    ],
    cta: "Get Started Free",
    color: "border-slate-600",
    btnClass: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
  },
  {
    key: "pro",
    title: "Pro",
    price: "$49",
    period: "/ month",
    badge: "Most Popular",
    features: [
      "Unlimited talent profiles",
      "Unlimited active deals",
      "AI match engine",
      "Outreach sequences",
      "ROI simulation engine",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    color: "border-indigo-500",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
];

const LABEL_MAP = {
  talent: { name: "Stage Name / Brand", namePlaceholder: "Your name or creator brand", title: "Content Niche / Category", titlePlaceholder: "e.g. Fitness, Tech, Lifestyle" },
  brand:  { name: "Company Name",       namePlaceholder: "Your company name",          title: "Your Job Title",          titlePlaceholder: "e.g. VP Marketing, Partnership Lead" },
  agency: { name: "Agency Name",        namePlaceholder: "Your agency name",           title: "Your Role",               titlePlaceholder: "e.g. Talent Manager, Agency Director" },
};

const PLATFORM_STATS = [
  { value: "10M+", label: "Profiles Indexed" },
  { value: "94%",  label: "Match Accuracy" },
  { value: "50+",  label: "AI Agents" },
  { value: "32",   label: "Industries" },
];

const HIGHLIGHTS = [
  { icon: Brain,      text: "AI-Powered Matching" },
  { icon: TrendingUp, text: "Predictive Analytics" },
  { icon: Layers,     text: "Auto Pitch Decks" },
  { icon: CheckSquare,text: "Human Approval Workflow" },
  { icon: Shield,     text: "Fault-Tolerant Architecture" },
  { icon: Bell,       text: "Real-Time Alerts" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1 = role, 2 = plan, 3 = details
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const { data: rateBenchmarks = [] } = useQuery({
    queryKey: ["rateBenchmarks"],
    queryFn: () => base44.entities.RateBenchmark.list(),
  });

  const { data: roiBenchmarks = [] } = useQuery({
    queryKey: ["roiBenchmarks"],
    queryFn: () => base44.entities.ROIBenchmark.list(),
  });

  useEffect(() => {
    base44.auth.me().then(u => {
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
      onboarded: true,
    });
    navigate(createPageUrl("Dashboard"));
  };

  const roleObj = ROLES.find(r => r.key === selectedRole);
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

      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 50%)"}} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Enterprise AI Platform</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
            Partnership <span className="text-indigo-600">Intelligence</span> Reimagined
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Connect creators, athletes, and celebrities with brands. Powered by advanced AI matching, predictive analytics, and autonomous deal execution.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {PLATFORM_STATS.map((s, i) => (
              <div key={i} className="text-left">
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-600 mt-1">{s.label}</p>
              </div>
            ))}
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
              { icon: Brain,      color: "text-purple-600", title: "AI Match Engine", desc: "40+ signal compatibility scoring for perfect partnerships" },
              { icon: Sparkles,   color: "text-amber-600", title: "Deal Simulation", desc: "10,000+ Monte Carlo simulations to predict outcomes" },
              { icon: CheckSquare,color: "text-emerald-600", title: "Approval Workflows", desc: "Human review with intelligent recommendations" },
              { icon: Layers,     color: "text-blue-600",  title: "Auto Pitch Decks", desc: "AI-generated pitch decks in seconds" },
              { icon: Bell,       color: "text-rose-600",  title: "Smart Notifications", desc: "Real-time alerts on market opportunities" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} bg-opacity-10 mb-4 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </div>
              );
            })}
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
                {rateBenchmarks.slice(0, 3).map((tier) => (
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
                ))}
              </div>
            </div>

            {/* ROI Benchmarks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <h3 className="font-semibold text-slate-900 mb-6 text-lg">Campaign ROI Benchmarks</h3>
              <div className="space-y-5">
                {roiBenchmarks.slice(0, 3).map((roi) => (
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
                ))}
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
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: Account Type ── */}
         {step === 1 && (
           <div className="space-y-4 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">What type of account do you need?</h2>
             <p className="text-slate-600 mb-6">Select your role to personalize your experience</p>

             <div className="space-y-3">
               {ROLES.map(role => {
                 const Icon = role.icon;
                 const isSelected = selectedRole === role.key;
                 return (
                   <button
                     key={role.key}
                     onClick={() => setSelectedRole(role.key)}
                     className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left
                       ${isSelected ? "bg-indigo-50 border-indigo-300 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                   >
                     <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                       <Icon className="w-6 h-6 text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-slate-900">{role.title}</p>
                       <p className="text-sm text-slate-600 mt-0.5 mb-2">{role.desc}</p>
                       <div className="flex flex-wrap gap-1.5">
                         {role.perks.map((p, i) => (
                           <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">{p}</span>
                         ))}
                       </div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
                       ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                       {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                     </div>
                   </button>
                 );
               })}
             </div>

             <Button
               onClick={() => setStep(2)}
               disabled={!selectedRole}
               className="w-full mt-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
             >
               Continue <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
         )}

        {/* ── STEP 2: Plan ── */}
         {step === 2 && (
           <div className="space-y-4 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">Choose your plan</h2>
             <p className="text-slate-600 mb-6">
               You selected <span className={`font-semibold text-slate-900`}>{roleObj?.title}</span>. Pick the plan that fits your needs.
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {PLANS.map(plan => {
                 const isSelected = selectedPlan === plan.key;
                 return (
                   <button
                     key={plan.key}
                     onClick={() => setSelectedPlan(plan.key)}
                     className={`relative flex flex-col p-6 rounded-xl border-2 text-left transition-all duration-200
                       ${isSelected ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                   >
                     {plan.badge && (
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                         <Star className="w-3 h-3" /> {plan.badge}
                       </div>
                     )}
                     <div className="flex items-end gap-1 mb-2">
                       <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                       <span className={`text-sm mb-1 ${isSelected ? "text-slate-700" : "text-slate-600"}`}>{plan.period}</span>
                     </div>
                     <p className="text-sm font-semibold text-slate-900 mb-4">{plan.title}</p>
                     <ul className="space-y-2 flex-1">
                       {plan.features.map((f, i) => (
                         <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                           {f}
                         </li>
                       ))}
                     </ul>
                     <div className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                       {isSelected ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Selected</span> : plan.cta}
                     </div>
                   </button>
                 );
               })}
             </div>

             <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
               <Lock className="w-3.5 h-3.5" />
               <span>Secure checkout · Cancel anytime · No hidden fees</span>
             </div>

             <div className="flex gap-3 mt-6">
               <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 border-slate-300 text-slate-900 hover:bg-slate-50">
                 Back
               </Button>
               <Button onClick={() => setStep(3)} disabled={!selectedPlan} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                 Continue <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </div>
           </div>
         )}

        {/* ── STEP 3: Details ── */}
         {step === 3 && (
           <div className="space-y-5 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900">Complete your profile</h2>
             <p className="text-slate-600 mb-6">
               Almost done! Just a few details to finish setting up your <span className="font-semibold text-slate-900">{roleObj?.title}</span> account.
             </p>

             <div>
               <Label className="text-slate-900 font-medium">{labels.name}</Label>
               <Input
                 value={name}
                 onChange={e => setName(e.target.value)}
                 placeholder={labels.namePlaceholder}
                 className="mt-2 border-slate-300 text-slate-900 placeholder:text-slate-500 h-11 bg-white"
               />
             </div>
             <div>
               <Label className="text-slate-900 font-medium">{labels.title}</Label>
               <Input
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 placeholder={labels.titlePlaceholder}
                 className="mt-2 border-slate-300 text-slate-900 placeholder:text-slate-500 h-11 bg-white"
               />
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
           )}
           </div>
           </div>
           </div>
           );
           }
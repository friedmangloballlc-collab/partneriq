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

      {/* ── AI FEATURES OVERVIEW ── */}
      <div className="relative max-w-4xl mx-auto px-6 pb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">AI-Powered Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Intelligence at Every Step
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            PartnerIQ's AI engine works continuously in the background — predicting outcomes, automating workflows, and surfacing insights you'd never find manually.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, color: "from-indigo-500 to-blue-600", title: "Predictive Talent Trajectory", desc: "ML models forecast which creators will break out before they go mainstream." },
            { icon: Brain,      color: "from-purple-500 to-violet-600", title: "Live Negotiation Co-Pilot", desc: "Real-time AI assistance during deal calls with suggested responses and risk flags." },
            { icon: Layers,     color: "from-amber-500 to-orange-600", title: "Partnership Simulation", desc: "Monte Carlo modeling runs 10,000+ simulations to predict campaign ROI and risk." },
            { icon: Sparkles,   color: "from-emerald-500 to-teal-600", title: "AI Match Engine", desc: "Deep compatibility scoring across 40+ signals including audience overlap and brand safety." },
            { icon: CheckSquare,color: "from-rose-500 to-pink-600",   title: "Content-Brand Fit Predictor", desc: "Analyzes past content to score brand alignment before a single email is sent." },
            { icon: Zap,        color: "from-sky-500 to-cyan-600",    title: "Autonomous Deal Execution", desc: "Automates outreach, follow-ups, and contract steps within your defined guardrails." },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-white text-sm mb-1.5">{feature.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARKET INTELLIGENCE PREVIEW ── */}
      <div className="relative max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Market Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Industry Rate Benchmarks
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Real market data to power your partnership valuations and ROI projections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Rate Benchmarks */}
          {rateBenchmarks.slice(0, 3).map((tier) => (
            <div key={tier.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-semibold text-white capitalize text-sm mb-3">{tier.tier} Tier</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Post</span>
                  <span className="text-emerald-400">${tier.sponsored_post_min?.toLocaleString()}-${tier.sponsored_post_max?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Brand Deal</span>
                  <span className="text-blue-400">${tier.brand_deal_min?.toLocaleString()}-${tier.brand_deal_max?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Ambassador/yr</span>
                  <span className="text-purple-400">${tier.ambassador_annual_min?.toLocaleString()}-${tier.ambassador_annual_max?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

          {/* ROI Benchmarks */}
          {roiBenchmarks.slice(0, 2).map((roi) => (
            <div key={roi.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-semibold text-white capitalize text-sm mb-3">{roi.deal_type.replace(/_/g, " ")}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Median ROI</span>
                  <span className="text-indigo-400 font-bold">{roi.median_roi}x</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Top Quartile</span>
                  <span className="text-emerald-400">{roi.top_quartile_roi}x+</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-xs">Access complete market intelligence after signup</p>
        </div>
      </div>

      {/* ── ONBOARDING FORM ── */}
      <div className="flex items-center justify-center p-6 pb-16">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to PartnerIQ</h1>
          <p className="text-slate-400 mt-2 text-sm">Create your account in just a few steps</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Account Type", "Choose Plan", "Your Details"].map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <React.Fragment key={num}>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done ? "bg-indigo-500 text-white" : active ? "bg-white text-slate-900" : "bg-white/10 text-slate-500"}`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-white" : "text-slate-500"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${step > num ? "bg-indigo-500" : "bg-white/10"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: Account Type ── */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white">What type of account do you need?</h2>
            <p className="text-sm text-slate-400 mb-4">This personalizes your entire dashboard experience</p>

            {ROLES.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${isSelected ? "bg-white/10 border-indigo-500" : "border-white/10 hover:border-white/20 bg-white/5"}`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{role.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-2">{role.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.perks.map((p, i) => (
                        <span key={i} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
                    ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-white/20"}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedRole}
              className="w-full mt-4 h-12 bg-indigo-600 hover:bg-indigo-700 text-base"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ── STEP 2: Plan ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white">Choose your plan</h2>
            <p className="text-sm text-slate-400 mb-4">
              You selected <span className={`font-semibold text-white`}>{roleObj?.title}</span>. Pick a plan that fits your needs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-200
                      ${isSelected ? "border-indigo-500 bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> {plan.badge}
                      </div>
                    )}
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-3">{plan.title}</p>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all ${isSelected ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-300"}`}>
                      {isSelected ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Selected</span> : plan.cta}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <Lock className="w-3 h-3" />
              <span>Secure checkout · Cancel anytime · No hidden fees</span>
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 bg-transparent border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedPlan} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Details ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white">Complete your profile</h2>
            <p className="text-sm text-slate-400 mb-4">
              Almost there! Just a few details to finish setting up your <span className="text-white font-semibold">{roleObj?.title}</span> account.
            </p>

            <div>
              <Label className="text-slate-300">{labels.name}</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={labels.namePlaceholder}
                className="mt-1.5 bg-white/10 border-white/10 text-white placeholder:text-slate-500 h-11"
              />
            </div>
            <div>
              <Label className="text-slate-300">{labels.title}</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={labels.titlePlaceholder}
                className="mt-1.5 bg-white/10 border-white/10 text-white placeholder:text-slate-500 h-11"
              />
            </div>

            {/* Summary card */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleObj?.color} flex items-center justify-center flex-shrink-0`}>
                {roleObj && <roleObj.icon className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{roleObj?.title} · {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{name || "Your profile"}</p>
              </div>
              {selectedPlan === "pro" && <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 bg-transparent border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
              <Button onClick={handleComplete} disabled={saving || !name} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-base">
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
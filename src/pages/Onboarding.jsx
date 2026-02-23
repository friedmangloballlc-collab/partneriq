import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap, Building2, Users, Briefcase, ArrowRight, Loader2,
  CheckCircle2, Star, Sparkles, Shield, BarChart3, Mail, Globe, Lock,
  Brain, TrendingUp, Network, Layers, Bell, ChevronDown
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

      {/* ── PLATFORM OVERVIEW HERO (pre-onboarding) ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 50%)"}} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PartnerIQ</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            The enterprise AI-powered Partnership Intelligence Platform connecting talent — creators, athletes, celebrities — with brands and agencies worldwide.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto">
            {PLATFORM_STATS.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-indigo-400">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Capability chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  {h.text}
                </div>
              );
            })}
          </div>

          {/* Industries */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-2xl mx-auto mb-10 text-left">
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Industries Covered</p>
            <div className="flex flex-wrap gap-2">
              {["Entertainment","Sports","Digital/Creator","Fashion","Business","Gaming","Fitness","Food & Bev","Technology","Finance","Travel","Beauty","Automotive"].map(ind => (
                <span key={ind} className="text-[11px] bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">{ind}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-slate-500">
            <p className="text-sm">Create your account below</p>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
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
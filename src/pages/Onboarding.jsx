import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Zap, Building2, Users, Briefcase, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const roles = [
  {
    key: "brand",
    icon: Building2,
    title: "Brand",
    desc: "I represent a brand looking for talent partnerships",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  {
    key: "talent",
    icon: Users,
    title: "Talent / Creator",
    desc: "I'm a creator, athlete, or celebrity seeking deals",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "agency",
    icon: Briefcase,
    title: "Agency",
    desc: "I manage a roster of talent and seek partnerships",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 border-amber-200",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
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
      company_name: companyName,
      job_title: jobTitle,
      onboarded: true,
    });
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to PartnerIQ</h1>
          <p className="text-slate-400 mt-2 text-sm">Let's set up your account in 30 seconds</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors duration-500 ${step >= s ? "bg-indigo-500" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-1">What describes you best?</h2>
            <p className="text-sm text-slate-400 mb-6">This personalizes your dashboard and features</p>
            <div className="space-y-3">
              {roles.map(role => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected
                        ? `${role.bg} border-opacity-100`
                        : "border-white/10 hover:border-white/20 bg-white/5"
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isSelected ? "text-slate-900" : "text-white"}`}>{role.title}</p>
                      <p className={`text-xs mt-0.5 ${isSelected ? "text-slate-600" : "text-slate-400"}`}>{role.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedRole}
              className="w-full mt-6 h-12 bg-indigo-600 hover:bg-indigo-700 text-base"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-1">Tell us a bit more</h2>
            <p className="text-sm text-slate-400 mb-6">This helps us personalize your experience</p>
            <div>
              <Label className="text-slate-300">
                {selectedRole === "talent" ? "Stage Name / Brand" : selectedRole === "agency" ? "Agency Name" : "Company Name"}
              </Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder={selectedRole === "talent" ? "Your name or brand" : "Company name"}
                className="mt-1.5 bg-white/10 border-white/10 text-white placeholder:text-slate-500 h-11"
              />
            </div>
            <div>
              <Label className="text-slate-300">Your Role / Title</Label>
              <Input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. VP Marketing, Creator, Talent Manager"
                className="mt-1.5 bg-white/10 border-white/10 text-white placeholder:text-slate-500 h-11"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 bg-transparent border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
              <Button onClick={handleComplete} disabled={saving} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-base">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {saving ? "Setting up..." : "Launch Dashboard"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
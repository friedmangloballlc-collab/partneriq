import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const TourContext = createContext(null);

export const useTour = () => useContext(TourContext);

// Tour steps per role
const TOUR_STEPS = {
  brand: [
    {
      title: "Welcome to Deal Stage! 🎉",
      description: "You're all set! Let's take a 60-second tour so you can hit the ground running. We'll show you the most powerful features for your brand.",
      target: null,
      position: "center",
    },
    {
      title: "Your Dashboard",
      description: "This is your command center. See active deals, pipeline value, and recent activity at a glance.",
      target: "dashboard-stats",
      position: "bottom",
    },
    {
      title: "AI Match Engine",
      description: "Our AI scores talent across 40+ signals to find your perfect partners. Get recommendations in seconds.",
      target: "quick-actions",
      position: "top",
    },
    {
      title: "Partnership Pipeline",
      description: "Track every deal from discovery to signed contract. Drag deals between stages or view as a list.",
      target: null,
      page: "Partnerships",
      position: "center",
    },
    {
      title: "Discover Talent",
      description: "Search 10M+ verified creator profiles with advanced filters — niche, followers, engagement rate, location and more.",
      target: null,
      page: "TalentDiscovery",
      position: "center",
    },
    {
      title: "You're ready! 🚀",
      description: "Start by discovering talent or running the AI Match Engine. Your dedicated analytics and reports are always one click away.",
      target: null,
      position: "center",
    },
  ],
  talent: [
    {
      title: "Welcome, Creator! 🌟",
      description: "Let's show you how to find brand deals, track partnerships, and grow your career on Deal Stage.",
      target: null,
      position: "center",
    },
    {
      title: "Your Deal Dashboard",
      description: "Track all your active brand partnerships, match scores, and revenue potential right here.",
      target: "dashboard-stats",
      position: "bottom",
    },
    {
      title: "Marketplace Opportunities",
      description: "Browse live brand campaigns looking for creators like you. Apply in one click with your profile.",
      target: null,
      page: "Marketplace",
      position: "center",
    },
    {
      title: "Complete Your Profile",
      description: "A complete profile gets 5x more brand views. Add your social links, portfolio, and rate card.",
      target: null,
      page: "TalentProfile",
      position: "center",
    },
    {
      title: "You're ready! 🚀",
      description: "Head to the Marketplace to find your first brand deal, or let the AI Match Engine connect you with the right partners.",
      target: null,
      position: "center",
    },
  ],
  agency: [
    {
      title: "Welcome to Deal Stage Agency! 🏢",
      description: "Manage your entire talent roster, multiple brand partnerships, and team collaboration — all in one place.",
      target: null,
      position: "center",
    },
    {
      title: "Pipeline Overview",
      description: "See all deals across your entire roster. Filter by talent, brand, or deal stage.",
      target: "dashboard-stats",
      position: "bottom",
    },
    {
      title: "Approval Workflows",
      description: "Nothing goes out without review. Set up multi-step approvals for outreach emails, proposals, and contracts.",
      target: null,
      page: "Approvals",
      position: "center",
    },
    {
      title: "Outreach Sequences",
      description: "Build automated multi-step outreach campaigns. AI writes the emails, you approve before anything sends.",
      target: null,
      page: "SequenceBuilder",
      position: "center",
    },
    {
      title: "You're ready! 🚀",
      description: "Start by adding your talent roster and setting up your first outreach sequence.",
      target: null,
      position: "center",
    },
  ],
  admin: [
    {
      title: "Admin Platform Overview 🛡️",
      description: "Full access to all platform features. Let's highlight the key admin areas.",
      target: null,
      position: "center",
    },
    {
      title: "System Health",
      description: "Monitor platform performance, API statuses, and agent concurrency in real time.",
      target: null,
      page: "SystemHealth",
      position: "center",
    },
    {
      title: "You're all set! 🚀",
      description: "You have full access to all platform features. Use the sidebar to navigate.",
      target: null,
      position: "center",
    },
  ],
};

const TOUR_KEY = "partneriq_tour_completed";
const TOUR_SEEN_KEY = "partneriq_tour_seen";

export function TourProvider({ children, user }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();

  const role = user?.role || "brand";
  const steps = TOUR_STEPS[role] || TOUR_STEPS.brand;

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem(TOUR_SEEN_KEY + "_" + user.email);
    if (!seen) {
      // Small delay so the dashboard renders first
      const t = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(t);
    }
  }, [user]);

  const currentStep = steps[stepIndex];

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1];
      if (nextStep?.page) navigate(createPageUrl(nextStep.page));
      setStepIndex(i => i + 1);
    } else {
      dismiss();
    }
  }, [stepIndex, steps]);

  const prev = useCallback(() => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }, [stepIndex]);

  const dismiss = useCallback(() => {
    setActive(false);
    if (user?.email) {
      localStorage.setItem(TOUR_SEEN_KEY + "_" + user.email, "1");
    }
  }, [user]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  return (
    <TourContext.Provider value={{ active, startTour, dismiss, currentStep, stepIndex, totalSteps: steps.length }}>
      {children}
      {active && (
        <TourOverlay
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          onNext={next}
          onPrev={prev}
          onDismiss={dismiss}
        />
      )}
    </TourContext.Provider>
  );
}

function TourOverlay({ step, stepIndex, totalSteps, onNext, onPrev, onDismiss }) {
  const isCenter = step.position === "center" || !step.target;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9998]"
        onClick={onDismiss}
      />

      {/* Tour card */}
      <div
        className={`fixed z-[9999] w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 transition-all
          ${isCenter ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "bottom-8 right-8"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Feature Tour</span>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? "w-6 bg-indigo-500" : i < stepIndex ? "w-3 bg-indigo-200" : "w-3 bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={onPrev} className="h-8 px-3 text-xs gap-1">
                <ChevronLeft className="w-3 h-3" /> Back
              </Button>
            )}
            <Button size="sm" onClick={onNext} className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
              {isLast ? "Get started!" : "Next"}
              {!isLast && <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
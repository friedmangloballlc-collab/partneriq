import React, { useState } from "react";
import SEO from "@/components/SEO";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, Building2, Handshake, DollarSign, CheckSquare, Sparkles, ArrowRight, Brain, Zap, FileText, PlayCircle,
  Database, Loader2, AlertCircle, Plus, UsersRound, Link2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PipelineChart from "@/components/dashboard/PipelineChart";
import PitchDeckMetrics from "@/components/dashboard/PitchDeckMetrics";
import TalentDashboardPanel from "@/components/dashboard/TalentDashboardPanel";
import BrandDashboardPanel from "@/components/dashboard/BrandDashboardPanel";
import SuccessPredictionPanel from "@/components/dashboard/SuccessPredictionPanel";
import AIAgentWidgets from "@/components/dashboard/AIAgentWidgets";
import SmartNextSteps from "@/components/dashboard/SmartNextSteps";
import OpportunityAlerts from "@/components/dashboard/OpportunityAlerts";
import DealExpiryTracker from "@/components/dashboard/DealExpiryTracker";
import { TourProvider, useTour } from "@/components/onboarding/TourProvider";
import ContextualTip from "@/components/onboarding/ContextualTip";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
// seedDemoData is loaded on demand to keep the initial bundle smaller
import { queryClientInstance } from "@/lib/query-client";
import { Progress } from "@/components/ui/progress";

function GettingStarted({ user, hasDealData }) {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("ds-welcome-dismissed") === "1");

  if (dismissed || hasDealData) return null;

  const isTalent = user?.role === "talent" || user?.role === "manager";
  const isBrand = user?.role === "brand";

  const steps = isTalent ? [
    { label: "Complete your profile", page: "TalentProfile", icon: Users },
    { label: "Connect your social accounts", page: "ConnectAccounts", icon: Link2 },
    { label: "Browse the marketplace", page: "Marketplace", icon: Zap },
    { label: "Try the AI Command Center", page: "AICommandCenter", icon: Brain },
  ] : isBrand ? [
    { label: "Try the AI Command Center", page: "AICommandCenter", icon: Brain },
    { label: "Browse talent in the marketplace", page: "Marketplace", icon: Zap },
    { label: "Create your first opportunity", page: "CreateOpportunity", icon: Plus },
    { label: "Search for brand contacts", page: "ContactFinder", icon: Users },
  ] : [
    { label: "Try the AI Command Center", page: "AICommandCenter", icon: Brain },
    { label: "Browse the marketplace", page: "Marketplace", icon: Zap },
    { label: "Explore talent discovery", page: "TalentDiscovery", icon: Users },
    { label: "Set up your team", page: "Teams", icon: UsersRound },
  ];

  return (
    <Card className="mb-6 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Welcome to DealStage!</h2>
            <p className="text-sm text-muted-foreground">Get started in 4 quick steps</p>
          </div>
          <button
            onClick={() => { setDismissed(true); sessionStorage.setItem("ds-welcome-dismissed", "1"); }}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Dismiss
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={i}
                to={createPageUrl(step.page)}
                className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyStateSeedBanner() {
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(null);
  const [errors, setErrors] = useState([]);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setErrors([]);
    setDone(false);
    sessionStorage.removeItem('partneriq_auto_seed_done');
    const errs = [];
    try {
      const { seedDemoData } = await import("@/utils/seedDemoData");
      await seedDemoData((p) => {
        setProgress(p);
        if (p.error) errs.push(p.error);
      });
      setErrors(errs);
      await queryClientInstance.invalidateQueries();
      setDone(true);
    } catch (err) {
      setErrors([...errs, err.message]);
    } finally {
      setSeeding(false);
    }
  };

  if (done) return null; // banner disappears after successful seed + query refresh

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900">No data found</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              Your database is empty. Load demo data to explore all platform features — brands, talents, partnerships, marketplace, and more.
            </p>
            {progress && seeding && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span>{progress.label}</span>
                  <span>{progress.step}/{progress.total}</span>
                </div>
                <Progress value={(progress.step / progress.total) * 100} className="h-2" />
              </div>
            )}
            {errors.length > 0 && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 space-y-1">
                <p className="text-xs font-medium text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Errors:</p>
                {errors.map((e, i) => <p key={i} className="text-xs text-red-600 font-mono">{e}</p>)}
              </div>
            )}
          </div>
          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
            {seeding ? 'Loading...' : 'Load Demo Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent({ user }) {
  const { startTour } = useTour() || {};
  const role = user?.role || "brand";
  const navigate = useNavigate();

  // Track whether the wizard has been dismissed this session so the
  // user isn't blocked from the dashboard if they skip all steps.
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const onboardingStep = user?.onboarding_step ?? 0;
  const showWizard = !wizardDismissed && onboardingStep < 4;

  // Primary: single RPC call for all dashboard summary data
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const { data, error } = await supabase.rpc("get_dashboard_summary", {
          p_user_email: authUser?.email || "",
        });
        if (error) throw error;
        return data;
      } catch (err) {
        // RPC not available yet — return null so fallback queries are used
        console.warn("[Dashboard] get_dashboard_summary RPC unavailable, using fallback queries:", err.message);
        return null;
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fallback individual queries — kept in sync and used when summary is null
  const { data: partnerships = [], isLoading: loadingP } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 100),
    enabled: summary === null,
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 50),
    enabled: summary === null,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 50),
    enabled: summary === null,
  });

  const { data: activities = [], isLoading: loadingA } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 10),
    enabled: summary === null,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["approvals-pending"],
    queryFn: () => base44.entities.ApprovalItem.filter({ status: "pending" }),
    enabled: summary === null,
  });

  const { data: sequences = [] } = useQuery({
    queryKey: ["sequences"],
    queryFn: () => base44.entities.OutreachSequence.list("-created_date", 20),
    enabled: summary === null,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities-published"],
    queryFn: () => base44.entities.MarketplaceOpportunity.filter({ status: "published" }, "-created_date", 10),
    enabled: summary === null,
  });

  // Resolve values: prefer RPC summary, fall back to individual query results
  const resolvedTalents    = summary ? (summary.total_talents    ?? 0)  : (Array.isArray(talents) ? talents.length : (talents ?? 0));
  const resolvedBrands     = summary ? (summary.total_brands     ?? 0)  : (Array.isArray(brands) ? brands.length : (brands ?? 0));
  const resolvedActivities = summary ? (Array.isArray(summary.recent_activities) ? summary.recent_activities : []) : (Array.isArray(activities) ? activities : []);
  const resolvedApprovals  = summary ? (summary.pending_approvals ?? 0)  : (Array.isArray(approvals) ? approvals.length : (approvals ?? 0));
  const safePartnerships = Array.isArray(partnerships) ? partnerships : [];

  const totalDealValue = summary
    ? (summary.total_deal_value ?? 0)
    : safePartnerships.reduce((sum, p) => sum + (p.deal_value || 0), 0);

  const activeDeals = summary
    ? (summary.active_deals ?? 0)
    : safePartnerships.filter(p => ["negotiating", "contracted", "active"].includes(p.status)).length;

  // When using the RPC the full partnership list still comes from the fallback cache
  // so pipeline chart / top matches continue to work.  Force-enable fallback partnerships
  // for components that need the full record set.
  const { data: partnershipsFull = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 100),
  });

  const resolvedPartnerships = partnershipsFull;

  const isLoading = loadingSummary || loadingP;
  const loadingAct = summary !== null ? false : loadingA;

  const topPartnerships = resolvedPartnerships
    .filter(p => p.match_score)
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <SEO title="Dashboard" description="Your Dealstage dashboard — deals, analytics, and AI insights" />
      <GettingStarted user={user} hasDealData={resolvedPartnerships.length > 0} />
      {/* Onboarding wizard — shown until user completes all 4 steps */}
      {showWizard && (
        <div id="onboarding-wizard">
          <OnboardingWizard
            user={user}
            onboardingStep={onboardingStep}
            onComplete={() => setWizardDismissed(true)}
          />
        </div>
      )}

      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "brand" && "Discover talent and manage your partnerships."}
            {role === "talent" && "Track your deals and brand opportunities."}
            {role === "agency" && "Manage your talent roster and partnership pipeline."}
            {role === "admin" && "Full platform overview and management."}
          </p>
        </div>
        {startTour && (
          <Button variant="outline" size="sm" onClick={startTour} aria-label="Start platform tour" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hidden sm:flex">
            <PlayCircle className="w-4 h-4" aria-hidden="true" /> Platform Tour
          </Button>
        )}
      </div>

      {/* Opportunity match alerts — shown when talent has 85%+ fit opportunities */}
      <OpportunityAlerts />

      {/* Empty state — show seed button when no data */}
      {!isLoading && resolvedPartnerships.length === 0 && (summary ? summary.total_brands === 0 && summary.total_talents === 0 : brands.length === 0 && talents.length === 0) && (
        {/* EmptyStateSeedBanner removed — production users should not see demo data loader */}
      )}

      {/* Contextual tip for new users */}
      <ContextualTip
        tipId="dashboard_getting_started"
        title="💡 Getting started tip"
        description="Complete your profile and run the AI Match Engine to get your first partnership recommendations in under 2 minutes."
        color="indigo"
      />

      {/* Stats — show platform stats for new users, personal stats once they have data */}
      {activeDeals === 0 && totalDealValue === 0 && role !== "admin" ? (
        <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children" role="region" aria-label="Platform overview">
          <StatCard title="Brands Available" value="1,200+" icon={Building2} color="amber" subtitle="Ready to connect" />
          <StatCard title="Verified Contacts" value="45K+" icon={Users} color="indigo" subtitle="Decision-makers with emails" />
          <StatCard title="Talent Categories" value="140+" icon={Sparkles} color="violet" subtitle="From NBA to TikTok" />
          <StatCard title="AI Agents" value="30+" icon={Brain} color="emerald" subtitle="Powered by AI" />
        </div>
      ) : (
        <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children" role="region" aria-label="Key metrics">
          {(role === "admin" || role === "agency") && (
            <StatCard title="Total Talent" value={typeof resolvedTalents === "number" ? resolvedTalents : resolvedTalents.length} icon={Users} color="violet" trend="+12%" trendUp aria-label={`Total Talent: ${typeof resolvedTalents === "number" ? resolvedTalents : resolvedTalents.length}`} />
          )}
          {(role === "admin" || role === "brand" || role === "agency") && (
            <StatCard title="Brands" value={typeof resolvedBrands === "number" ? resolvedBrands : resolvedBrands.length} icon={Building2} color="amber" trend="+8%" trendUp aria-label={`Brands: ${typeof resolvedBrands === "number" ? resolvedBrands : resolvedBrands.length}`} />
          )}
          <StatCard title="Active Deals" value={activeDeals} subtitle="In pipeline" icon={Handshake} color="indigo" aria-label={`Active Deals: ${activeDeals} in pipeline`} />
          <StatCard title="Deal Value" value={`$${(totalDealValue / 1000).toFixed(0)}K`} icon={DollarSign} color="emerald" trend="+23%" trendUp aria-label={`Deal Value: $${(totalDealValue / 1000).toFixed(0)}K`} />
          {(role === "admin" || role === "agency") && (
            <StatCard title="Pending Approvals" value={typeof resolvedApprovals === "number" ? resolvedApprovals : resolvedApprovals.length} icon={CheckSquare} color="rose" aria-label={`Pending Approvals: ${typeof resolvedApprovals === "number" ? resolvedApprovals : resolvedApprovals.length}`} />
          )}
          {role === "talent" && (
            <StatCard title="Match Score Avg" value={resolvedPartnerships.length ? Math.round(resolvedPartnerships.reduce((s, p) => s + (p.match_score || 0), 0) / resolvedPartnerships.length) : 0} icon={Sparkles} color="violet" aria-label={`Average Match Score: ${resolvedPartnerships.length ? Math.round(resolvedPartnerships.reduce((s, p) => s + (p.match_score || 0), 0) / resolvedPartnerships.length) : 0}`} />
          )}
        </div>
      )}

      {/* Smart Next Steps — contextual guidance based on user progress */}
      <SmartNextSteps user={user} onboardingStep={onboardingStep} />

      {/* Deal Expiry & Renewal Tracker */}
      <DealExpiryTracker />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline chart */}
        <div className="lg:col-span-2">
          <PipelineChart partnerships={resolvedPartnerships} />
        </div>

        {/* Activity feed */}
        <div>
          <ActivityFeed activities={resolvedActivities} isLoading={loadingAct} />
        </div>
      </div>

      {/* Role-specific panels */}
      {role === "talent" && (
        <TalentDashboardPanel partnerships={resolvedPartnerships} opportunities={opportunities} user={user} />
      )}
      {(role === "brand" || role === "agency") && (
        <BrandDashboardPanel partnerships={resolvedPartnerships} sequences={sequences} approvals={Array.isArray(resolvedApprovals) ? resolvedApprovals : []} />
      )}

      {/* Pitch Deck Metrics */}
      <PitchDeckMetrics />

      {/* Success Predictor */}
      <SuccessPredictionPanel partnerships={resolvedPartnerships} />

      {/* AI Intelligence Feed */}
      <AIAgentWidgets />

      {/* Quick Actions + Top Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card id="quick-actions" className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(role === "brand" || role === "admin") && (
              <Link to={createPageUrl("TalentDiscovery")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Discover Talent</p>
                    <p className="text-xs text-slate-400">Find your next partner</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            )}
            <Link to={createPageUrl("MatchEngine")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">AI Match Engine</p>
                  <p className="text-xs text-slate-400">Get intelligent recommendations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link to={createPageUrl("Partnerships")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">View Pipeline</p>
                  <p className="text-xs text-slate-400">Manage active partnerships</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link to={createPageUrl("PlatformOverview")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Platform Overview</p>
                  <p className="text-xs text-slate-400">Explore platform capabilities</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link to={createPageUrl("AIFeatures")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">AI Features</p>
                  <p className="text-xs text-slate-400">Advanced AI-powered tools</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link to={createPageUrl("PitchDeckBuilder")} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Pitch Deck Generation System</p>
                  <p className="text-xs text-slate-400">Auto-generate custom pitch decks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Top Matches */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Matches</CardTitle>
              <Link to={createPageUrl("Partnerships")} className="text-xs text-indigo-600 font-medium hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topPartnerships.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No matched partnerships yet</p>
            ) : (
              <div className="space-y-3">
                {topPartnerships.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.brand_name} {p.talent_name ? `× ${p.talent_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                        {p.match_score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-7 bg-slate-100 rounded w-52" />
            <div className="h-4 bg-slate-100 rounded w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-100 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 h-64" />
          <div className="bg-white rounded-xl border border-slate-100 h-64" />
        </div>
      </div>
    );
  }

  return (
    <TourProvider user={user}>
      <DashboardContent user={user} />
    </TourProvider>
  );
}
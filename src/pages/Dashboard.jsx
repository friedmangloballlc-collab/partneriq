import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, Building2, Handshake, DollarSign, Mail, CheckSquare,
  TrendingUp, Sparkles, ArrowRight, Star, Brain, Zap, FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PipelineChart from "@/components/dashboard/PipelineChart";
import PitchDeckMetrics from "@/components/dashboard/PitchDeckMetrics";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: partnerships = [], isLoading: loadingP } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 100),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 50),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 50),
  });

  const { data: activities = [], isLoading: loadingA } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 10),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["approvals-pending"],
    queryFn: () => base44.entities.ApprovalItem.filter({ status: "pending" }),
  });

  const role = user?.role || "brand";
  const totalDealValue = partnerships.reduce((sum, p) => sum + (p.deal_value || 0), 0);
  const activeDeals = partnerships.filter(p => ["negotiating", "contracted", "active"].includes(p.status)).length;

  const topPartnerships = partnerships
    .filter(p => p.match_score)
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {(role === "admin" || role === "agency") && (
          <StatCard title="Total Talent" value={talents.length} icon={Users} color="violet" trend="+12%" trendUp />
        )}
        {(role === "admin" || role === "brand" || role === "agency") && (
          <StatCard title="Brands" value={brands.length} icon={Building2} color="amber" trend="+8%" trendUp />
        )}
        <StatCard title="Active Deals" value={activeDeals} subtitle="In pipeline" icon={Handshake} color="indigo" />
        <StatCard title="Deal Value" value={`$${(totalDealValue / 1000).toFixed(0)}K`} icon={DollarSign} color="emerald" trend="+23%" trendUp />
        {(role === "admin" || role === "agency") && (
          <StatCard title="Pending Approvals" value={approvals.length} icon={CheckSquare} color="rose" />
        )}
        {role === "talent" && (
          <StatCard title="Match Score Avg" value={partnerships.length ? Math.round(partnerships.reduce((s, p) => s + (p.match_score || 0), 0) / partnerships.length) : 0} icon={Sparkles} color="violet" />
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline chart */}
        <div className="lg:col-span-2">
          <PipelineChart partnerships={partnerships} />
        </div>

        {/* Activity feed */}
        <div>
          <ActivityFeed activities={activities} isLoading={loadingA} />
        </div>
      </div>

      {/* Pitch Deck Metrics */}
      <PitchDeckMetrics />

      {/* Quick Actions + Top Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-slate-200/60">
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
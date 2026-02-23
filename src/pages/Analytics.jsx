import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, DollarSign, Handshake, Mail, Users, BarChart3, Zap, TrendingDown
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CompetitorBenchmarking from "@/components/analytics/CompetitorBenchmarking";
import TrendAnalysis from "@/components/analytics/TrendAnalysis";
import PredictiveROI from "@/components/analytics/PredictiveROI";
import CustomReporting from "@/components/analytics/CustomReporting";

const COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#818CF8", "#6D28D9", "#4F46E5", "#3730A3"];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 200),
  });

  const { data: emails = [] } = useQuery({
    queryKey: ["outreach-emails"],
    queryFn: () => base44.entities.OutreachEmail.list("-created_date", 200),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 200),
  });

  // Pipeline by status
  const pipelineData = (() => {
    const counts = {};
    partnerships.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  })();

  // Partnership type distribution
  const typeData = (() => {
    const counts = {};
    partnerships.forEach(p => { if (p.partnership_type) counts[p.partnership_type] = (counts[p.partnership_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  })();

  // Email performance
  const emailStats = (() => {
    const total = emails.length;
    const sent = emails.filter(e => ["sent", "delivered", "opened", "clicked", "replied"].includes(e.status)).length;
    const opened = emails.filter(e => ["opened", "clicked", "replied"].includes(e.status)).length;
    const replied = emails.filter(e => e.status === "replied").length;
    return { total, sent, opened, replied, openRate: sent ? ((opened / sent) * 100).toFixed(1) : 0, replyRate: sent ? ((replied / sent) * 100).toFixed(1) : 0 };
  })();

  // Talent by niche
  const nicheData = (() => {
    const counts = {};
    talents.forEach(t => { if (t.niche) counts[t.niche] = (counts[t.niche] || 0) + 1; });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  // Talent by tier
  const tierData = (() => {
    const counts = {};
    talents.forEach(t => { if (t.tier) counts[t.tier] = (counts[t.tier] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  const totalDealValue = partnerships.reduce((s, p) => s + (p.deal_value || 0), 0);
  const avgMatchScore = partnerships.filter(p => p.match_score).length
    ? Math.round(partnerships.reduce((s, p) => s + (p.match_score || 0), 0) / partnerships.filter(p => p.match_score).length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Platform performance and partnership intelligence</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Partnerships" value={partnerships.length} icon={Handshake} color="indigo" />
        <StatCard title="Pipeline Value" value={`$${(totalDealValue / 1000).toFixed(0)}K`} icon={DollarSign} color="emerald" />
        <StatCard title="Avg Match Score" value={`${avgMatchScore}%`} icon={TrendingUp} color="violet" />
        <StatCard title="Email Open Rate" value={`${emailStats.openRate}%`} icon={Mail} color="sky" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Partnership Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Partnership Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={2} stroke="#fff">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Talent by Niche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nicheData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Talent Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={2} stroke="#fff">
                    {tierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Performance */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Email Outreach Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Total Emails", value: emailStats.total, color: "slate" },
              { label: "Sent", value: emailStats.sent, color: "blue" },
              { label: "Opened", value: emailStats.opened, color: "indigo" },
              { label: "Replied", value: emailStats.replied, color: "emerald" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
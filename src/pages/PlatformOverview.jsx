import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap, Shield, Users, Building2, Briefcase, TrendingUp,
  Brain, BarChart3, GitBranch, Bell, Globe, CheckSquare, Network, Layers
} from "lucide-react";

const KEY_METRICS = [
  { label: "System Uptime",       value: "99.95%",     desc: "< 4.4 hours downtime/year" },
  { label: "Agent Concurrency",   value: "50+",        desc: "Running simultaneously across 12 agent types" },
  { label: "Fault Recovery",      value: "< 30s",      desc: "Automatic failover and task reassignment" },
  { label: "Match Accuracy",      value: "94%",        desc: "AI recommendation precision validated" },
  { label: "Human Approval",      value: "100%",       desc: "All outbound requires human review" },
  { label: "Data Sources",        value: "50+",        desc: "Social, marketplace, public data" },
  { label: "Categories Covered",  value: "32",         desc: "Universal partnership categories" },
  { label: "Profiles Indexed",    value: "10M+",       desc: "Searchable talent profiles" },
  { label: "Daily Data Updates",  value: "5M+",        desc: "Metrics refreshed daily" },
];

const CAPABILITIES = [
  { icon: Users,       color: "bg-indigo-50 text-indigo-600",  title: "AI-Powered Talent Discovery",    desc: "Search 10M+ profiles with semantic understanding and natural language queries" },
  { icon: Brain,       color: "bg-purple-50 text-purple-600",  title: "Intelligent Matching",           desc: "94% accuracy connecting brands with ideal talent using 10-factor weighted scoring" },
  { icon: TrendingUp,  color: "bg-emerald-50 text-emerald-600",title: "Predictive Analytics",           desc: "Forecast talent trajectory 6–18 months ahead with 78% accuracy" },
  { icon: BarChart3,   color: "bg-blue-50 text-blue-600",      title: "Partnership Simulation",         desc: "Monte Carlo modeling with 10,000 scenarios predicts campaign ROI before spend" },
  { icon: Network,     color: "bg-rose-50 text-rose-600",      title: "Relationship Graph",             desc: "Neo4j-powered mapping of industry relationships for warm intro paths" },
  { icon: Layers,      color: "bg-amber-50 text-amber-600",    title: "Auto Pitch Deck Generation",    desc: "Custom 12-section decks generated in <5 minutes per deal" },
  { icon: CheckSquare, color: "bg-teal-50 text-teal-600",      title: "Human Approval Workflow",        desc: "Nothing goes outbound without review — enforced at architecture level" },
  { icon: Shield,      color: "bg-red-50 text-red-600",        title: "Fault-Tolerant Architecture",   desc: "50+ concurrent agents with circuit breakers and auto-recovery" },
  { icon: Bell,        color: "bg-orange-50 text-orange-600",  title: "Real-Time Alerts",               desc: "Event-driven triggers for awards, viral moments, deal expirations" },
  { icon: Globe,       color: "bg-sky-50 text-sky-600",        title: "Market Intelligence",            desc: "Rate benchmarks, competitive intel, trend analysis" },
];

const INDUSTRIES = [
  { name: "Entertainment",   icon: "🎬", range: "$10K – $10M+",  examples: "Actors, musicians, TV personalities",     color: "border-l-purple-400" },
  { name: "Sports",          icon: "🏆", range: "$25K – $50M+",  examples: "Athletes, teams, leagues",                color: "border-l-blue-400" },
  { name: "Digital/Creator", icon: "📱", range: "$500 – $5M",    examples: "YouTubers, TikTokers, streamers",          color: "border-l-indigo-400" },
  { name: "Fashion",         icon: "👗", range: "$5K – $2M",     examples: "Models, designers, influencers",           color: "border-l-pink-400" },
  { name: "Business",        icon: "💼", range: "$10K – $500K",  examples: "Executives, entrepreneurs, speakers",      color: "border-l-slate-400" },
  { name: "Gaming",          icon: "🎮", range: "$1K – $1M",     examples: "Esports, streamers, game developers",      color: "border-l-emerald-400" },
  { name: "Fitness",         icon: "💪", range: "$2K – $500K",   examples: "Athletes, trainers, wellness experts",     color: "border-l-orange-400" },
  { name: "Food & Beverage", icon: "🍽️", range: "$5K – $1M",     examples: "Chefs, food critics, restaurateurs",       color: "border-l-amber-400" },
  { name: "Technology",      icon: "⚡", range: "$10K – $2M",    examples: "Tech influencers, founders",               color: "border-l-cyan-400" },
  { name: "Finance",         icon: "📈", range: "$15K – $1M",    examples: "Fintech influencers, advisors",            color: "border-l-green-400" },
  { name: "Travel",          icon: "✈️", range: "$3K – $500K",   examples: "Travel creators, hospitality",             color: "border-l-sky-400" },
  { name: "Beauty",          icon: "💄", range: "$2K – $2M",     examples: "Makeup artists, skincare experts",         color: "border-l-rose-400" },
  { name: "Automotive",      icon: "🚗", range: "$10K – $5M",    examples: "Car enthusiasts, racing",                  color: "border-l-red-400" },
];

const USER_TYPES = [
  {
    icon: Building2,
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    label: "Brands",
    desc: "Seeking talent partnerships",
    points: ["Discover verified talent profiles", "AI-powered match recommendations", "Campaign ROI simulation", "Automated outreach workflows"],
  },
  {
    icon: Users,
    color: "from-purple-500 to-pink-600",
    bg: "bg-purple-50",
    label: "Talent",
    desc: "Creators, athletes, celebrities",
    points: ["Showcase profiles to top brands", "Track deal pipeline & earnings", "Connect social accounts", "Receive curated brand opportunities"],
  },
  {
    icon: Briefcase,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    label: "Agencies",
    desc: "Managing talent rosters",
    points: ["Full talent roster management", "Multi-deal pipeline view", "Team collaboration tools", "Approval workflows & audit trails"],
  },
];

export default function PlatformOverview() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 50%)"}} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <Badge className="bg-white/10 text-white/80 border-white/20 text-[10px] uppercase tracking-widest">Part I · Section 1</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Platform Overview</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            Deal Stage is an enterprise AI-powered Partnership Intelligence Platform connecting talent — creators, athletes, celebrities — with brands and agencies. Featuring a fault-tolerant multi-agent architecture with 50+ AI agents operating concurrently, automatic failover, and mandatory human approval for all outbound communications.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Brands", "Talent", "Agencies"].map(t => (
              <Badge key={t} className="bg-white/10 text-white border-white/20 text-xs">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 1.1 Key Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">1.1</span>
          <h2 className="text-lg font-bold text-slate-800">Key Platform Metrics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {KEY_METRICS.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-sm transition-shadow">
              <p className="text-2xl font-bold text-indigo-600 tracking-tight">{m.value}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{m.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Types */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">1.0</span>
          <h2 className="text-lg font-bold text-slate-800">Who Deal Stage Serves</h2>
        </div>
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
                  {u.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1.2 Capabilities */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">1.2</span>
          <h2 className="text-lg font-bold text-slate-800">Core Platform Capabilities</h2>
        </div>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* 1.3 Industries */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">1.3</span>
          <h2 className="text-lg font-bold text-slate-800">Industries Covered</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INDUSTRIES.map((ind, i) => (
            <div key={i} className={`bg-white rounded-xl border border-slate-200/60 border-l-4 ${ind.color} p-4 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{ind.icon}</span>
                <p className="text-sm font-bold text-slate-700">{ind.name}</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{ind.examples}</p>
              <Badge className="bg-slate-100 text-slate-600 text-[10px] font-semibold">{ind.range}</Badge>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
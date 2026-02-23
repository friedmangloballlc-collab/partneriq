import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, DollarSign, Sparkles, Target, TrendingUp, ShieldCheck, Eye } from "lucide-react";

const METRICS = [
  {
    icon: Sparkles,
    color: "bg-indigo-50 text-indigo-600",
    label: "AI Match Score",
    description: "0–100 compatibility rating between talent & brand",
  },
  {
    icon: Users,
    color: "bg-violet-50 text-violet-600",
    label: "Audience Analysis",
    description: "Follower count, engagement rate & audience quality score",
  },
  {
    icon: Target,
    color: "bg-rose-50 text-rose-600",
    label: "Content–Brand Fit",
    description: "Niche alignment, tone match & platform suitability",
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    label: "Growth Trajectory",
    description: "Creator tier, growth trend & Discovery Alpha score",
  },
  {
    icon: DollarSign,
    color: "bg-amber-50 text-amber-600",
    label: "Deal Economics",
    description: "Deal value, rate per post & estimated ROI projection",
  },
  {
    icon: ShieldCheck,
    color: "bg-sky-50 text-sky-600",
    label: "Brand Safety",
    description: "Brand safety score & past partnership history",
  },
  {
    icon: BarChart3,
    color: "bg-purple-50 text-purple-600",
    label: "Performance Data",
    description: "Avg likes, comments, views & historical campaign results",
  },
  {
    icon: Eye,
    color: "bg-orange-50 text-orange-600",
    label: "Human Review Gate",
    description: "Every deck routes to approval queue before any send",
  },
];

export default function PitchDeckMetrics() {
  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Pitch Deck Generation System — Metrics Used</CardTitle>
          <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-600 bg-indigo-50">
            12 Auto-Generated Sections
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Each pitch deck is built from the following data points pulled from your partnership and talent records.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{m.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
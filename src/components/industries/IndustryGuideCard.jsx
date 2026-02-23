import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Target, Users, Lightbulb, Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function IndustryGuideCard({ guide }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div onClick={() => setExpanded(!expanded)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">{guide.industry}</CardTitle>
              <CardDescription className="text-xs mt-1">{guide.sector}</CardDescription>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 whitespace-nowrap flex-shrink-0">
              <DollarSign className="w-3 h-3 mr-1" />
              {guide.budget_allocation}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Top row - Key events */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-red-50/50 p-3 rounded-lg border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">🏆 Must-Attend (Tier 1)</p>
              <p className="text-sm text-slate-700 line-clamp-2">{guide.priority_tier_1_events}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 p-3 rounded-lg border border-amber-100">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">⭐ High-Value (Tier 2)</p>
              <p className="text-sm text-slate-700 line-clamp-2">{guide.tier_2_events}</p>
            </div>
          </div>

          {/* Expandable content */}
          {expanded && (
            <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in duration-200">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Heritage Moments
                  </p>
                  <p className="text-sm text-slate-700">{guide.heritage_awareness_months}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Key Conferences
                  </p>
                  <p className="text-sm text-slate-700">{guide.key_conferences}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-green-50/50 p-3 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Best Demographics
                  </p>
                  <p className="text-sm text-slate-700">{guide.best_demographics}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Top Strategies
                  </p>
                  <p className="text-sm text-slate-700">{guide.activation_strategies}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Expand toggle */}
      <div className="px-6 py-2 flex justify-center border-t border-slate-100">
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>
    </Card>
  );
}
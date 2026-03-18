import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Zap } from "lucide-react";
import { fitColorClass } from "@/lib/qualityScore";

const contractTypeColors = {
  sponsorship: "bg-blue-100 text-blue-800",
  affiliate: "bg-purple-100 text-purple-800",
  ambassador: "bg-pink-100 text-pink-800",
  content_creation: "bg-green-100 text-green-800",
  partnership: "bg-indigo-100 text-indigo-800",
  event: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

const formatBudget = (min, max) => {
  if (!min && !max) return "Budget not specified";
  if (min && max) return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  if (min) return `$${parseInt(min).toLocaleString()}+`;
  return `Up to $${parseInt(max).toLocaleString()}`;
};

export default function OpportunityCard({ opportunity, userRole, onApply, fitPercent }) {
  const platforms = Array.isArray(opportunity.required_platforms)
    ? opportunity.required_platforms
    : typeof opportunity.required_platforms === 'string'
      ? opportunity.required_platforms.split(",").filter(Boolean)
      : [];
  const niches = Array.isArray(opportunity.required_niches)
    ? opportunity.required_niches
    : typeof opportunity.required_niches === 'string'
      ? opportunity.required_niches.split(",").filter(Boolean)
      : [];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{opportunity.title}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{opportunity.brand_name}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={contractTypeColors[opportunity.contract_type]}>
              {opportunity.contract_type?.replace(/_/g, " ")}
            </Badge>
            {fitPercent !== null && fitPercent !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  fitPercent >= 75
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : fitPercent >= 50
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
                title="Fit score: how well your profile matches this opportunity"
              >
                {fitPercent}% fit
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{opportunity.description}</p>

        {/* Budget & Timeline */}
        <div className="space-y-2 text-sm">
          {(opportunity.budget_min || opportunity.budget_max) && (
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span>{formatBudget(opportunity.budget_min, opportunity.budget_max)}</span>
            </div>
          )}
          {(opportunity.timeline_start || opportunity.timeline_end) && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>
                {opportunity.timeline_start && new Date(opportunity.timeline_start).toLocaleDateString()}
                {opportunity.timeline_end && ` - ${new Date(opportunity.timeline_end).toLocaleDateString()}`}
              </span>
            </div>
          )}
          {opportunity.target_audience_size_min && (
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4" />
              <span>{parseInt(opportunity.target_audience_size_min).toLocaleString()}+ followers</span>
            </div>
          )}
        </div>

        {/* Platforms & Niches */}
        <div className="space-y-2">
          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {platforms.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          )}
          {niches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {niches.map((n) => (
                <Badge key={n} variant="secondary" className="text-xs">
                  {n}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Apply Button */}
        {userRole !== "brand" && userRole !== "admin" && (
          <Button onClick={onApply} className="w-full gap-2">
            <Zap className="w-4 h-4" /> Apply Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
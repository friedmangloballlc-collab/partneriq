import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, DollarSign, Calendar, Users, ArrowRight } from "lucide-react";

export default function OpportunityCard({ opportunity, userRole, onApply }) {
  const contractTypeColors = {
    sponsorship: "bg-blue-100 text-blue-800",
    affiliate: "bg-green-100 text-green-800",
    ambassador: "bg-purple-100 text-purple-800",
    content_creation: "bg-orange-100 text-orange-800",
    partnership: "bg-indigo-100 text-indigo-800",
    event: "bg-pink-100 text-pink-800",
    other: "bg-slate-100 text-slate-800",
  };

  const formatBudget = (min, max) => {
    if (!min && !max) return "Budget TBA";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    return `$${(min || max).toLocaleString()}+`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {opportunity.brand_name}
            </p>
          </div>
        </div>
        <Badge className={`${contractTypeColors[opportunity.contract_type]} w-fit text-xs`}>
          {opportunity.contract_type}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{opportunity.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <DollarSign className="w-4 h-4 text-green-600" />
            {formatBudget(opportunity.budget_min, opportunity.budget_max)}
          </div>

          {opportunity.timeline_start && (
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              {new Date(opportunity.timeline_start).toLocaleDateString()} - {new Date(opportunity.timeline_end).toLocaleDateString()}
            </div>
          )}

          {opportunity.required_platforms && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs">{opportunity.required_platforms.split(",").slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>

        {opportunity.required_niches && (
          <div className="flex flex-wrap gap-1">
            {opportunity.required_niches.split(",").slice(0, 3).map((niche) => (
              <Badge key={niche} variant="outline" className="text-xs">
                {niche.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <div className="p-4 pt-0 border-t">
        <Button onClick={onApply} className="w-full gap-2" size="sm">
          View Details <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}
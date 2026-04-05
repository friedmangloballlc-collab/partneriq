import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Target, Calendar } from "lucide-react";

export default function TalentExpertiseSection({ talent }) {
  const expertise = talent.expertise_areas
    ? talent.expertise_areas.split(",").map((e) => e.trim())
    : [];
  const collaborationTypes = talent.preferred_collaboration_types
    ? (() => { try { return JSON.parse(talent.preferred_collaboration_types); } catch { return []; } })()
    : [];
  const portfolio = talent.portfolio
    ? (() => { try { return JSON.parse(talent.portfolio); } catch { return []; } })()
    : [];

  const availabilityConfig = {
    actively_looking: { bg: "bg-green-100", text: "text-green-800", label: "Actively Looking" },
    open_for_offers: { bg: "bg-blue-100", text: "text-blue-800", label: "Open for Offers" },
    limited_availability: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Limited Availability" },
    not_available: { bg: "bg-red-100", text: "text-red-800", label: "Not Available" },
  };

  const statusConfig =
    availabilityConfig[talent.availability_status] ||
    availabilityConfig.open_for_offers;

  return (
    <div className="space-y-4">
      {/* Availability Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm text-slate-600">Availability</p>
              <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise Areas */}
      {expertise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Areas of Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expertise.map((area) => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferred Collaboration Types */}
      {collaborationTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" /> Collaboration Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {collaborationTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Highlights */}
      {portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Collaborations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolio.slice(0, 3).map((item) => (
              <div key={item.id} className="border-l-2 border-indigo-300 pl-3 py-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-600">{item.brand}</p>
                <div className="flex gap-2 mt-1">
                  {item.engagement_rate > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.engagement_rate}% engagement
                    </Badge>
                  )}
                  {item.reach > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.reach.toLocaleString()} reach
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {portfolio.length > 3 && (
              <p className="text-xs text-slate-600 pt-2">
                +{portfolio.length - 3} more collaborations in profile
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
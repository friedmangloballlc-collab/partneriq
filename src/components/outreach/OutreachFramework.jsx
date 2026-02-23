import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertCircle, Gift, CheckCircle2 } from "lucide-react";

const OUTREACH_TYPES = [
  {
    type: "cold_brand_pitch",
    label: "Cold Brand Pitch",
    trigger: "High match score detected",
    elements: ["Brand intro", "Match reasons", "Rate range", "CTA"],
    approval: true,
    icon: Mail
  },
  {
    type: "agency_application",
    label: "Agency Application",
    trigger: "Talent requests representation",
    elements: ["Talent highlights", "Growth metrics", "Goals"],
    approval: true,
    icon: Mail
  },
  {
    type: "opportunity_alert",
    label: "Opportunity Alert",
    trigger: "New opportunity matches criteria",
    elements: ["Opportunity details", "Fit score", "Timeline"],
    approval: true,
    icon: AlertCircle
  },
  {
    type: "follow_up_1",
    label: "Follow-Up #1",
    trigger: "3-5 days after initial, no response",
    elements: ["Reference original", "Gentle reminder", "New value"],
    approval: true,
    icon: Mail
  },
  {
    type: "follow_up_2",
    label: "Follow-Up #2",
    trigger: "7-10 days after initial",
    elements: ["Value reinforcement", "New data point", "Urgency"],
    approval: true,
    icon: Mail
  },
  {
    type: "follow_up_3_final",
    label: "Follow-Up #3 (Final)",
    trigger: "14 days after initial",
    elements: ["Last chance framing", "Alternative contact offer"],
    approval: true,
    icon: Mail
  },
  {
    type: "negotiation_response",
    label: "Negotiation Response",
    trigger: "During active negotiation",
    elements: ["Counter-offer", "Supporting data", "Next steps"],
    approval: true,
    icon: Gift
  },
  {
    type: "deal_confirmation",
    label: "Deal Confirmation",
    trigger: "Terms agreed",
    elements: ["Summary of terms", "Next steps", "Contract prep"],
    approval: true,
    icon: CheckCircle2
  }
];

const PERSONALIZATION_VARIABLES = [
  { variable: "{talent_name}", source: "Profile database", example: "Sarah Johnson" },
  { variable: "{recent_achievement}", source: "News/social monitoring", example: "Your recent collaboration with Nike" },
  { variable: "{engagement_stat}", source: "Social metrics", example: "Your 8.2% engagement rate" },
  { variable: "{audience_overlap}", source: "Match calculation", example: "73% audience overlap with our target" },
  { variable: "{comparable_deal}", source: "Deal database", example: "Similar to the $50K deal [Creator X] did" },
  { variable: "{mutual_connection}", source: "Relationship graph", example: "I see you worked with [Contact Y]" },
  { variable: "{trending_content}", source: "Content analysis", example: "Your recent video on [topic] performed well" },
  { variable: "{growth_stat}", source: "Trajectory engine", example: "Your 40% growth this quarter" }
];

const AB_TESTING_FRAMEWORK = [
  {
    element: "Subject Line",
    variants: "2-4 variants per campaign",
    metric: "Open rate",
    minSample: "100 per variant"
  },
  {
    element: "Opening Hook",
    variants: "2-3 variants",
    metric: "Read time, reply rate",
    minSample: "50 per variant"
  },
  {
    element: "Value Proposition",
    variants: "2-3 framings",
    metric: "Reply rate, positive sentiment",
    minSample: "50 per variant"
  },
  {
    element: "CTA",
    variants: "2-3 variants",
    metric: "Click rate, meeting bookings",
    minSample: "100 per variant"
  },
  {
    element: "Send Time",
    variants: "Multiple windows",
    metric: "Open rate, reply rate",
    minSample: "50 per window"
  },
  {
    element: "Personalization Depth",
    variants: "Low/Medium/High",
    metric: "Reply rate, conversion",
    minSample: "100 per level"
  }
];

export default function OutreachFramework() {
  const [selectedType, setSelectedType] = useState("cold_brand_pitch");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="types">Outreach Types</TabsTrigger>
          <TabsTrigger value="personalization">Personalization Variables</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing Framework</TabsTrigger>
        </TabsList>

        {/* Outreach Types Tab */}
        <TabsContent value="types" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OUTREACH_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.type;
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-sm text-slate-900">{type.label}</h4>
                  </div>
                  <p className="text-xs text-slate-500">{type.trigger}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Type Details */}
          {selectedType && (() => {
            const selected = OUTREACH_TYPES.find(t => t.type === selectedType);
            return (
              <Card className="mt-6 border-indigo-200 bg-indigo-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{selected.label} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1.5">Trigger</p>
                    <p className="text-sm text-slate-700">{selected.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Content Elements</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.elements.map((element, i) => (
                        <Badge key={i} variant="secondary" className="bg-white text-indigo-700 border-indigo-200">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      {selected.approval ? "✓ Approval Required" : "Auto-Send"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* Personalization Variables Tab */}
        <TabsContent value="personalization" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-3 font-semibold text-slate-700">Variable</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Source</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Example</th>
                </tr>
              </thead>
              <tbody>
                {PERSONALIZATION_VARIABLES.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3">
                      <code className="bg-slate-100 text-indigo-700 px-2 py-1 rounded text-xs font-mono">
                        {item.variable}
                      </code>
                    </td>
                    <td className="p-3 text-slate-600">{item.source}</td>
                    <td className="p-3 text-slate-600">{item.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* A/B Testing Framework Tab */}
        <TabsContent value="ab-testing" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-3 font-semibold text-slate-700">Element</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Variants</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Success Metric</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Min Sample Size</th>
                </tr>
              </thead>
              <tbody>
                {AB_TESTING_FRAMEWORK.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-900">{item.element}</td>
                    <td className="p-3 text-slate-600">{item.variants}</td>
                    <td className="p-3 text-slate-600">{item.metric}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px]">{item.minSample}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
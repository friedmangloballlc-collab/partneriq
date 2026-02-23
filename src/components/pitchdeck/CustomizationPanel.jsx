import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";

const OPTIONS = [
  {
    key: "deckLength",
    label: "Deck Length",
    description: "Section depth",
    choices: [
      { value: "brief", label: "Brief (5 slides)" },
      { value: "standard", label: "Standard (10 slides)" },
      { value: "comprehensive", label: "Comprehensive (15+ slides)" },
    ],
    default: "standard",
  },
  {
    key: "tone",
    label: "Tone",
    description: "Language style",
    choices: [
      { value: "formal", label: "Formal" },
      { value: "professional", label: "Professional" },
      { value: "casual", label: "Casual" },
      { value: "creative", label: "Creative" },
    ],
    default: "professional",
  },
  {
    key: "emphasis",
    label: "Emphasis",
    description: "Content priority",
    choices: [
      { value: "roi", label: "ROI-focused" },
      { value: "creative", label: "Creative-focused" },
      { value: "relationship", label: "Relationship-focused" },
    ],
    default: "roi",
  },
  {
    key: "dataDepth",
    label: "Data Depth",
    description: "Charts and tables",
    choices: [
      { value: "summary", label: "Summary" },
      { value: "detailed", label: "Detailed" },
      { value: "comprehensive", label: "Comprehensive" },
    ],
    default: "detailed",
  },
  {
    key: "comparables",
    label: "Comparables",
    description: "Privacy level",
    choices: [
      { value: "include", label: "Include" },
      { value: "exclude", label: "Exclude" },
      { value: "anonymized", label: "Anonymized only" },
    ],
    default: "include",
  },
  {
    key: "simulationDetail",
    label: "Simulation Detail",
    description: "Technical depth",
    choices: [
      { value: "summary", label: "Summary" },
      { value: "full", label: "Full report" },
      { value: "exclude", label: "Exclude" },
    ],
    default: "summary",
  },
  {
    key: "branding",
    label: "Branding",
    description: "Visual identity",
    choices: [
      { value: "platform", label: "Platform default" },
      { value: "brand_colors", label: "Brand colors" },
      { value: "co_branded", label: "Co-branded" },
    ],
    default: "brand_colors",
  },
];

export const DEFAULT_OPTIONS = OPTIONS.reduce((acc, o) => {
  acc[o.key] = o.default;
  return acc;
}, {});

export default function CustomizationPanel({ options, onChange }) {
  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <CardTitle className="text-sm font-semibold text-slate-700">Customization Options</CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px] text-slate-500">Optional</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OPTIONS.map((opt) => (
            <div key={opt.key}>
              <Label className="text-[11px] text-slate-500 mb-0.5 block font-medium">
                {opt.label}
                <span className="ml-1 text-slate-300 font-normal">· {opt.description}</span>
              </Label>
              <Select
                value={options[opt.key]}
                onValueChange={(val) => onChange({ ...options, [opt.key]: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opt.choices.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                      {c.value === opt.default && (
                        <span className="ml-1 text-slate-400">(default)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
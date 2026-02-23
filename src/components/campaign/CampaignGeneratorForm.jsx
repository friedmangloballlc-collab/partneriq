import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2 } from "lucide-react";

export default function CampaignGeneratorForm({
  demographics,
  selectedDemographics,
  isLoading,
  onGenerate
}) {
  const [industry, setIndustry] = useState("");
  const [marketTrends, setMarketTrends] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const selectedData = demographics.filter(d => selectedDemographics.has(d.id));

  const handleGenerate = () => {
    if (selectedData.length === 0) {
      alert("Please select at least one demographic segment");
      return;
    }

    onGenerate({
      demographics: selectedData,
      industry,
      marketTrends,
      targetAudience
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Campaign Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Selected Demographics ({selectedData.length})
          </label>
          {selectedData.length === 0 ? (
            <p className="text-sm text-slate-500">Select demographics from the targeting panel above</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedData.map(d => (
                <div
                  key={d.id}
                  className="bg-indigo-100 text-indigo-900 text-sm px-3 py-1 rounded-full"
                >
                  {d.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Industry
          </label>
          <Input
            placeholder="e.g., Fashion, Technology, Food & Beverage"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Market Trends & Context
          </label>
          <Textarea
            placeholder="Describe current market trends, seasonal factors, or any specific context for the campaign"
            value={marketTrends}
            onChange={(e) => setMarketTrends(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Additional Target Audience Info
          </label>
          <Input
            placeholder="Any specific targeting criteria or audience preferences"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || selectedData.length === 0}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Campaign...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Campaign Strategy
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          AI will generate campaign ideas, copy, and budget recommendations based on your selections
        </p>
      </CardContent>
    </Card>
  );
}
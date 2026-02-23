import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Copy, Download } from "lucide-react";

export default function AIMarketingBrief({ campaign, isLoading }) {
  const [copiedSection, setCopiedSection] = useState(null);

  if (!campaign) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-12 text-center text-slate-500">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating campaign strategy...
            </div>
          ) : (
            "Campaign suggestions will appear here"
          )}
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Concept */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Campaign Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{campaign.concept}</p>
        </CardContent>
      </Card>

      {/* Campaign Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaign Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaign.campaignIdeas?.map((idea, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                <h4 className="font-semibold text-slate-900">{idea.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{idea.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Copy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Primary Campaign Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Headline
            </label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group relative">
              <p className="text-lg font-bold text-slate-900">{campaign.primaryCopy?.headline}</p>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(campaign.primaryCopy?.headline, 'headline')}
              >
                {copiedSection === 'headline' ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Body Text
            </label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group relative">
              <p className="text-sm text-slate-700 leading-relaxed">{campaign.primaryCopy?.bodyText}</p>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(campaign.primaryCopy?.bodyText, 'body')}
              >
                {copiedSection === 'body' ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Call to Action
            </label>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 group relative">
              <p className="text-sm font-semibold text-indigo-900">{campaign.primaryCopy?.cta}</p>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(campaign.primaryCopy?.cta, 'cta')}
              >
                {copiedSection === 'cta' ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targeting Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Targeting Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.targetingParameters && Object.entries(campaign.targetingParameters).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <p className="text-sm text-slate-700">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Budget Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Recommended Budget Range
            </label>
            <p className="text-lg font-bold text-slate-900">{campaign.budgetAllocation?.budgetRange}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Channel Breakdown
            </label>
            <div className="space-y-2">
              {campaign.budgetAllocation?.channelBreakdown && Object.entries(campaign.budgetAllocation.channelBreakdown).map(([channel, percentage]) => (
                <div key={channel} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 capitalize">
                    {channel.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant="outline" className="bg-indigo-50">
                    {percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Cost Per Result
            </label>
            <p className="text-sm text-slate-700">{campaign.budgetAllocation?.costPerResult}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
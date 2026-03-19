import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Target, PieChart } from "lucide-react";

export default function MarketIntelligence() {
  const { data: rateBenchmarks = [] } = useQuery({
    queryKey: ["rateBenchmarks"],
    queryFn: () => base44.entities.RateBenchmark.list(),
  });

  const { data: platformMultipliers = [] } = useQuery({
    queryKey: ["platformMultipliers"],
    queryFn: () => base44.entities.PlatformMultiplier.list(),
  });

  const { data: categoryPremiums = [] } = useQuery({
    queryKey: ["categoryPremiums"],
    queryFn: () => base44.entities.CategoryPremium.list(),
  });

  const { data: roiBenchmarks = [] } = useQuery({
    queryKey: ["roiBenchmarks"],
    queryFn: () => base44.entities.ROIBenchmark.list(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Market Intelligence</h1>
        <p className="text-slate-600 mt-2">Rate benchmarks, platform multipliers, and ROI metrics</p>
      </div>

      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rates" className="flex gap-2">
            <BarChart3 className="w-4 h-4" /> Rates by Tier
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex gap-2">
            <TrendingUp className="w-4 h-4" /> Platforms
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex gap-2">
            <Target className="w-4 h-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex gap-2">
            <PieChart className="w-4 h-4" /> ROI
          </TabsTrigger>
        </TabsList>

        {/* Rate Benchmarks Tab */}
        <TabsContent value="rates" className="space-y-4">
          <div className="grid gap-4">
            {rateBenchmarks.map((tier) => (
              <Card key={tier.id}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center justify-between">
                    <span>{tier.tier} Tier</span>
                    <span className="text-sm font-normal text-slate-600">
                      {tier.followers_min?.toLocaleString() ?? "N/A"} - {tier.followers_max?.toLocaleString() ?? "N/A"} followers
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">Sponsored Post</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        ${tier.sponsored_post_min?.toLocaleString() || "N/A"} - ${tier.sponsored_post_max?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">Brand Deal</p>
                      <p className="text-lg font-semibold text-purple-600">
                        ${tier.brand_deal_min?.toLocaleString() || "N/A"} - ${tier.brand_deal_max?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">Ambassador (Annual)</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        ${tier.ambassador_annual_min?.toLocaleString() || "N/A"} - ${tier.ambassador_annual_max?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Platform Multipliers Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformMultipliers.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <CardTitle className="capitalize text-lg">{platform.platform}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Base CPM</p>
                    <p className="font-semibold text-slate-900">
                      ${platform.base_cpm_min?.toFixed(2) || "N/A"} - ${platform.base_cpm_max?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Rate Multiplier</p>
                    <p className="font-semibold text-indigo-600 text-lg">{platform.rate_multiplier}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Engagement Benchmark</p>
                    <p className="font-semibold text-slate-900">
                      {platform.engagement_benchmark_min}% - {platform.engagement_benchmark_max}%
                    </p>
                  </div>
                  {platform.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-600 italic">{platform.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category Premiums Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryPremiums.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Premium Multiplier</p>
                      <p className="text-2xl font-bold text-emerald-600">{category.premium_multiplier}x</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-slate-700">{category.rationale}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ROI Benchmarks Tab */}
        <TabsContent value="roi" className="space-y-4">
          <div className="grid gap-4">
            {roiBenchmarks.map((roi) => (
              <Card key={roi.id}>
                <CardHeader>
                  <CardTitle className="capitalize">{roi.deal_type.replace(/_/g, " ")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Median ROI</p>
                      <p className="text-2xl font-bold text-blue-600">{roi.median_roi}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Top Quartile</p>
                      <p className="text-2xl font-bold text-green-600">{roi.top_quartile_roi}x+</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Bottom Quartile</p>
                      <p className="text-2xl font-bold text-amber-600">{roi.bottom_quartile_roi}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Measurement Period</p>
                      <p className="font-semibold text-slate-900">{roi.measurement_period}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
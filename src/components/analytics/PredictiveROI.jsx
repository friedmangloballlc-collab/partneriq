import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";

export default function PredictiveROI({ partnerships = [] }) {
  const [selectedType, setSelectedType] = useState("sponsorship");

  const { data: roiBenchmarks = [] } = useQuery({
    queryKey: ["roi-benchmarks"],
    queryFn: () => base44.entities.ROIBenchmark.list(),
  });

  // Monte Carlo simulation for ROI projections
  const generateROIProjection = () => {
    const benchmark = roiBenchmarks.find(r => r.deal_type === selectedType);
    if (!benchmark) return [];

    const scenarios = [];
    const iterations = 10000;
    const timeframes = [30, 60, 90, 180, 365];
    
    timeframes.forEach(days => {
      const results = [];
      for (let i = 0; i < iterations; i++) {
        // Random variation around median with std dev
        const variance = (Math.random() - 0.5) * 2;
        const roiMultiplier = (benchmark.median_roi || 3) + variance;
        const avgDealValue = 50000;
        const projectedReturn = avgDealValue * roiMultiplier;
        results.push(projectedReturn);
      }
      
      results.sort((a, b) => a - b);
      const p10 = results[Math.floor(iterations * 0.1)];
      const p50 = results[Math.floor(iterations * 0.5)];
      const p90 = results[Math.floor(iterations * 0.9)];

      scenarios.push({
        days,
        label: `${days}d`,
        low: Math.round(p10 / 1000),
        median: Math.round(p50 / 1000),
        high: Math.round(p90 / 1000),
      });
    });

    return scenarios;
  };

  const projections = generateROIProjection();
  const activeDeals = partnerships.filter(p => ["active", "negotiating", "contracted"].includes(p.status));
  const totalExposure = activeDeals.reduce((s, p) => s + (p.deal_value || 0), 0);
  const selectedBenchmark = roiBenchmarks.find(r => r.deal_type === selectedType);
  const projectedReturn = selectedBenchmark ? (totalExposure * selectedBenchmark.median_roi) : 0;

  return (
    <div className="space-y-6">
      {/* Deal Type Selector */}
      <div className="flex flex-wrap gap-2">
        {["sponsorship", "affiliate", "ambassador", "content_creation"].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === type
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1)}
          </button>
        ))}
      </div>

      {/* Projected Returns Card */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Projected Returns (Next 12 Months)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/50">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-2">Current Exposure</p>
              <p className="text-2xl font-bold text-emerald-900">${Math.round(totalExposure / 1000)}K</p>
              <p className="text-xs text-emerald-600 mt-2">{activeDeals.length} active deals</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200/50">
              <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider mb-2">ROI Multiplier</p>
              <p className="text-2xl font-bold text-indigo-900">{selectedBenchmark?.median_roi || "2.5"}x</p>
              <p className="text-xs text-indigo-600 mt-2">Market median</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider mb-2">Projected Return</p>
                  <p className="text-2xl font-bold text-purple-900">${Math.round(projectedReturn / 1000)}K</p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Probability Distribution */}
      {projections.length > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">ROI Scenarios (10,000 Monte Carlo Simulations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "Return ($K)", angle: -90, position: "insideLeft" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="low" fill="#F59E0B" name="10th Percentile" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="median" fill="#6366F1" name="Median (50th)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="high" fill="#10B981" name="90th Percentile" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Interpretation:</strong> At the 90th percentile, there's a 10% probability of returns exceeding ${projections[projections.length - 1]?.high}K. 
                The median scenario projects ${projections[projections.length - 1]?.median}K over 12 months.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factors */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Key Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {[
              { label: "Market Saturation", impact: "Medium", color: "amber" },
              { label: "Audience Demographic Shift", impact: "Low", color: "emerald" },
              { label: "Content Performance Variance", impact: "High", color: "red" },
              { label: "Partnership Execution Risk", impact: "Medium", color: "amber" },
            ].map((risk, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{risk.label}</span>
                <Badge className={`text-xs font-semibold bg-${risk.color}-50 text-${risk.color}-700 border-${risk.color}-200`}>
                  {risk.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
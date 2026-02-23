import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function CompetitorBenchmarking({ partnerships = [] }) {
  const { data: rateBenchmarks = [] } = useQuery({
    queryKey: ["rate-benchmarks"],
    queryFn: () => base44.entities.RateBenchmark.list(),
  });

  const { data: roiBenchmarks = [] } = useQuery({
    queryKey: ["roi-benchmarks"],
    queryFn: () => base44.entities.ROIBenchmark.list(),
  });

  // Calculate your portfolio metrics vs benchmarks
  const benchmarkComparison = (() => {
    const avgYourDeal = partnerships.length ? partnerships.reduce((s, p) => s + (p.deal_value || 0), 0) / partnerships.length : 0;
    const avgBenchmark = roiBenchmarks.length ? roiBenchmarks.reduce((s, r) => s + (r.median_roi || 0), 0) / roiBenchmarks.length * 50000 : 50000;
    const percentDiff = avgBenchmark ? ((avgYourDeal - avgBenchmark) / avgBenchmark * 100).toFixed(1) : 0;
    
    return [
      { label: "Your Avg Deal", value: Math.round(avgYourDeal), benchmark: Math.round(avgBenchmark), diff: percentDiff },
    ];
  })();

  // ROI vs Industry
  const roiComparison = roiBenchmarks.slice(0, 4).map(roi => ({
    type: roi.deal_type.replace(/_/g, " "),
    median: roi.median_roi,
    top: roi.top_quartile_roi,
  }));

  const activeDeals = partnerships.filter(p => ["active", "negotiating", "contracted"].includes(p.status));
  const avgMatchScore = activeDeals.length ? Math.round(activeDeals.reduce((s, p) => s + (p.match_score || 0), 0) / activeDeals.length) : 0;

  return (
    <div className="space-y-6">
      {/* Your Performance vs Market */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {benchmarkComparison.map((comp, i) => (
          <Card key={i} className="border-slate-200/60">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Avg Deal</p>
                  <p className="text-2xl font-bold text-slate-900">${Math.round(comp.value).toLocaleString()}</p>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Benchmark</p>
                  <p className="text-lg font-semibold text-slate-700">${Math.round(comp.benchmark).toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-2 pt-2 ${comp.diff > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {comp.diff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-semibold">{comp.diff > 0 ? "+" : ""}{comp.diff}% vs market</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-slate-200/60">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Match Score</p>
                <p className="text-2xl font-bold text-slate-900">{avgMatchScore}%</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Industry Avg</p>
                <p className="text-lg font-semibold text-slate-700">72%</p>
              </div>
              <div className={`flex items-center gap-2 pt-2 ${avgMatchScore > 72 ? "text-emerald-600" : "text-amber-600"}`}>
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">{avgMatchScore > 72 ? "Above average" : "Room to improve"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Deals</p>
                <p className="text-2xl font-bold text-slate-900">{activeDeals.length}</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Platform Avg</p>
                <p className="text-lg font-semibold text-slate-700">8.2</p>
              </div>
              <div className={`flex items-center gap-2 pt-2 ${activeDeals.length > 8 ? "text-emerald-600" : "text-slate-600"}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{activeDeals.length > 8 ? "High velocity" : "Building momentum"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Distribution */}
      {roiComparison.length > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Industry ROI Benchmarks by Deal Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "ROI Multiple (x)", angle: -90, position: "insideLeft" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="median" fill="#6366F1" name="Median" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="top" fill="#10B981" name="Top Quartile" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
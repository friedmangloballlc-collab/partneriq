import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, DollarSign, BarChart3, Loader2, Sparkles, RefreshCw, Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

function runMonteCarlo(params, iterations = 1000) {
  const { dealValue, conversionRate, avgEngagement, numDeals, marketingCost } = params;
  const results = [];

  for (let i = 0; i < iterations; i++) {
    let totalROI = 0;
    for (let d = 0; d < numDeals; d++) {
      // Gaussian noise via Box-Muller
      const u1 = Math.random(), u2 = Math.random();
      const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      const realConversion = Math.max(0.001, conversionRate / 100 + noise * 0.02);
      const realEngagement = Math.max(0.001, avgEngagement / 100 + noise * 0.015);
      const revenue = dealValue * realConversion * realEngagement * 50;
      totalROI += revenue - marketingCost / numDeals;
    }
    results.push(totalROI);
  }

  results.sort((a, b) => a - b);
  return {
    p10: results[Math.floor(iterations * 0.1)],
    p50: results[Math.floor(iterations * 0.5)],
    p90: results[Math.floor(iterations * 0.9)],
    mean: results.reduce((a, b) => a + b, 0) / iterations,
    distribution: results,
  };
}

function buildChartData(dist) {
  const min = dist[0], max = dist[dist.length - 1];
  const buckets = 30;
  const step = (max - min) / buckets;
  const data = [];
  for (let i = 0; i < buckets; i++) {
    const lo = min + i * step, hi = min + (i + 1) * step;
    const count = dist.filter(v => v >= lo && v < hi).length;
    data.push({ roi: Math.round((lo + hi) / 2), frequency: count, label: fmt(lo) });
  }
  return data;
}

export default function SimulationEngine() {
  const [params, setParams] = useState({
    dealValue: 25000,
    conversionRate: 3,
    avgEngagement: 4,
    numDeals: 10,
    marketingCost: 50000,
  });
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState("none");

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 100),
  });

  const runSimulation = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 600)); // UX delay
    const res = runMonteCarlo(params);
    setResults(res);
    setRunning(false);
  };

  const loadFromDeal = (dealId) => {
    if (dealId === "none") return;
    const deal = partnerships.find(p => p.id === dealId);
    if (deal) {
      setParams(prev => ({
        ...prev,
        dealValue: deal.deal_value || prev.dealValue,
      }));
    }
  };

  const chartData = results ? buildChartData(results.distribution) : [];
  const positive = results ? results.distribution.filter(v => v > 0).length / results.distribution.length * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ROI Simulation Engine</h1>
        <p className="text-sm text-slate-500 mt-1">Monte Carlo P10/P50/P90 partnership ROI modeling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Load from deal */}
              <div>
                <Label className="text-xs text-slate-500">Load from Deal (optional)</Label>
                <Select value={selectedDeal} onValueChange={v => { setSelectedDeal(v); loadFromDeal(v); }}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select deal..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Manual input —</SelectItem>
                    {partnerships.filter(p => p.deal_value).map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {[
                { key: "dealValue", label: "Avg Deal Value", min: 1000, max: 500000, step: 1000, fmt: v => fmt(v) },
                { key: "conversionRate", label: "Conversion Rate (%)", min: 0.1, max: 20, step: 0.1, fmt: v => `${v.toFixed(1)}%` },
                { key: "avgEngagement", label: "Avg Engagement Rate (%)", min: 0.1, max: 20, step: 0.1, fmt: v => `${v.toFixed(1)}%` },
                { key: "numDeals", label: "Number of Deals", min: 1, max: 100, step: 1, fmt: v => v },
                { key: "marketingCost", label: "Total Marketing Cost", min: 1000, max: 1000000, step: 1000, fmt: v => fmt(v) },
              ].map(({ key, label, min, max, step, fmt: f }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs text-slate-600">{label}</Label>
                    <span className="text-xs font-bold text-slate-700">{f(params[key])}</span>
                  </div>
                  <Slider
                    min={min} max={max} step={step}
                    value={[params[key]]}
                    onValueChange={([v]) => setParams(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                onClick={runSimulation}
                disabled={running}
              >
                {running
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Running 1,000 simulations...</>
                  : <><RefreshCw className="w-4 h-4" /> Run Monte Carlo</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!results ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
              <BarChart3 className="w-14 h-14 text-slate-200 mb-3" />
              <h3 className="text-lg font-semibold text-slate-500">Configure & Run</h3>
              <p className="text-sm text-slate-400 mt-1">Set parameters and click Run Monte Carlo to see P10/P50/P90 outcomes</p>
            </div>
          ) : (
            <>
              {/* Percentile cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "P10 (Pessimistic)", value: results.p10, color: "border-rose-200 bg-rose-50", text: "text-rose-700", sub: "10% chance of worse" },
                  { label: "P50 (Base Case)", value: results.p50, color: "border-indigo-200 bg-indigo-50", text: "text-indigo-700", sub: "Median outcome" },
                  { label: "P90 (Optimistic)", value: results.p90, color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700", sub: "10% chance of better" },
                ].map(c => (
                  <Card key={c.label} className={`border-2 ${c.color}`}>
                    <CardContent className="p-4 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${c.text}`}>{fmt(c.value)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary row */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Expected value: <strong className="text-slate-800">{fmt(results.mean)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Positive outcome probability: <strong className={positive >= 60 ? "text-emerald-600" : positive >= 40 ? "text-amber-600" : "text-rose-600"}>{positive.toFixed(0)}%</strong></span>
                </div>
              </div>

              {/* Distribution chart */}
              <Card className="border-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    ROI Distribution (1,000 Simulations)
                    <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">Monte Carlo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 11 }}
                          formatter={(v) => [v, "Simulations"]}
                          labelFormatter={(l) => `ROI: ${l}`}
                        />
                        <ReferenceLine x={chartData.findIndex(d => parseFloat(d.label.replace(/[$KM,]/g, "")) >= 0) > -1 ? chartData[chartData.findIndex(d => d.roi >= 0)]?.label : undefined} stroke="#10B981" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "Break-even", fill: "#10B981", fontSize: 10 }} />
                        <Area type="monotone" dataKey="frequency" stroke="#6366F1" strokeWidth={2} fill="url(#roiGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card className="border-slate-200/60 bg-slate-50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Insight</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {positive >= 70
                      ? `Strong positive outlook — ${positive.toFixed(0)}% of simulations yield positive ROI. The P50 case of ${fmt(results.p50)} represents a solid return. Consider increasing deal volume to compound returns.`
                      : positive >= 40
                      ? `Moderate risk profile — ${positive.toFixed(0)}% probability of positive ROI. Recommend tightening conversion rate targets or reducing marketing costs by 15–20% to improve the expected value.`
                      : `High risk scenario — only ${positive.toFixed(0)}% of simulations yield positive returns. Consider renegotiating deal terms, reducing cost basis, or targeting higher-engagement talent to shift the distribution right.`}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
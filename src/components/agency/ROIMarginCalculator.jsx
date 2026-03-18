import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign, TrendingUp, Users, Clock, BarChart3,
  Award, TrendingDown, Minus, Percent, Info,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const INDUSTRY_BENCHMARKS = {
  grossMargin:    55,  // %
  netMargin:      28,  // %
  hourlyRate:     95,  // USD
  revenuePerHead: 120_000, // USD
};

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n) {
  if (n == null || isNaN(n)) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return "0%";
  return `${n.toFixed(1)}%`;
}

function delta(actual, benchmark) {
  if (!benchmark) return 0;
  return ((actual - benchmark) / benchmark) * 100;
}

function CompareBar({ label, actual, benchmark, formatter, higherIsBetter = true }) {
  const pct     = Math.min(Math.max((actual / (benchmark * 1.5)) * 100, 0), 100);
  const isGood  = higherIsBetter ? actual >= benchmark : actual <= benchmark;
  const diff    = delta(actual, benchmark);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{formatter(actual)}</span>
          <span className={`font-semibold ${isGood ? "text-emerald-600" : "text-rose-600"}`}>
            {diff >= 0 ? "+" : ""}{diff.toFixed(0)}% vs avg
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isGood ? "bg-emerald-500" : "bg-rose-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">Industry avg: {formatter(benchmark)}</p>
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon: Icon, color, bg, good }) {
  return (
    <Card className={`border-slate-200/60 ${bg || ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color || "text-slate-900"}`}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg || "bg-slate-100"}`}>
            <Icon className={`w-4 h-4 ${color || "text-slate-500"}`} />
          </div>
        </div>
        {good !== undefined && (
          <div className={`mt-2 text-xs font-semibold ${good ? "text-emerald-600" : "text-rose-500"}`}>
            {good ? "Above industry average" : "Below industry average"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── ClientProfitabilityRow ────────────────────────────────────────────────────

function ClientProfitabilityRow({ entry, isMost, isLeast }) {
  const revenue = entry.performance_metrics?.fee_earned || 0;
  const budget  = entry.deal_value || 0;
  const margin  = budget > 0 ? (revenue / budget) * 100 : 0;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{entry.brand_name || "Unknown"}</span>
          {isMost && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
              <Award className="w-3 h-3" /> Most Profitable
            </Badge>
          )}
          {isLeast && (
            <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Least Profitable
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{entry.deal_type || "—"} · {entry.platform || "—"}</p>
      </td>
      <td className="px-4 py-3 text-slate-700 font-medium">{fmtMoney(budget)}</td>
      <td className="px-4 py-3 font-bold text-teal-700">{fmtMoney(revenue)}</td>
      <td className="px-4 py-3">
        <span
          className={`text-sm font-bold ${
            margin >= 20 ? "text-emerald-600" : margin >= 10 ? "text-amber-600" : "text-rose-500"
          }`}
        >
          {fmtPct(margin)}
        </span>
      </td>
    </tr>
  );
}

// ── NumberInput ───────────────────────────────────────────────────────────────

function NumberInput({ label, value, onChange, prefix, suffix, placeholder }) {
  return (
    <div>
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
        )}
        <Input
          type="number"
          min="0"
          step="any"
          className={`${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""} h-10 text-sm`}
          placeholder={placeholder || "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ROIMarginCalculator() {
  const [revenue,   setRevenue]   = useState("");
  const [agencyFee, setAgencyFee] = useState("");
  const [hours,     setHours]     = useState("");
  const [teamSize,  setTeamSize]  = useState("");

  // ── fetch per-client data ─────────────────────────────────────────────────
  const { data: entries = [] } = useQuery({
    queryKey: ["roi-calculator-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_entries")
        .select("id, brand_name, deal_value, deal_type, platform, performance_metrics, status")
        .eq("room_type", "agency_engagements")
        .order("deal_value", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // ── calculations ──────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const rev  = parseFloat(revenue)   || 0;
    const fee  = parseFloat(agencyFee) || 0;
    const hrs  = parseFloat(hours)     || 0;
    const team = parseFloat(teamSize)  || 1;

    if (!rev && !fee) return null;

    const grossMargin    = rev > 0 ? ((rev - (rev - fee)) / rev) * 100 : fee > 0 ? 100 : 0;
    // Net margin: fee after hypothetical 30% overhead
    const overhead       = fee * 0.30;
    const netProfit      = fee - overhead;
    const netMargin      = rev > 0 ? (netProfit / rev) * 100 : 0;
    const hourlyRate     = hrs > 0 ? fee / hrs : 0;
    const revenuePerHead = team > 0 ? rev / team : 0;

    return {
      revenue: rev,
      agencyFee: fee,
      hours: hrs,
      teamSize: team,
      grossMargin,
      netMargin,
      netProfit,
      hourlyRate,
      revenuePerHead,
    };
  }, [revenue, agencyFee, hours, teamSize]);

  // ── per-client profitability ───────────────────────────────────────────────
  const clientProfitability = useMemo(() => {
    const clients = entries.filter((e) => e.deal_value && e.performance_metrics?.fee_earned);
    const sorted = [...clients].sort((a, b) => {
      const mA = (a.performance_metrics?.fee_earned / a.deal_value) || 0;
      const mB = (b.performance_metrics?.fee_earned / b.deal_value) || 0;
      return mB - mA;
    });
    return sorted;
  }, [entries]);

  const mostProfitable  = clientProfitability[0]?.id;
  const leastProfitable = clientProfitability[clientProfitability.length - 1]?.id;

  const hasCalc = calc && (calc.revenue > 0 || calc.agencyFee > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Percent className="w-5 h-5 text-amber-600" />
          ROI & Margin Calculator
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Calculate campaign margins, hourly rates, and compare against industry averages
        </p>
      </div>

      {/* Input panel */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Campaign Inputs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NumberInput
              label="Campaign Revenue"
              value={revenue}
              onChange={setRevenue}
              prefix="$"
              placeholder="Total billed"
            />
            <NumberInput
              label="Agency Fee"
              value={agencyFee}
              onChange={setAgencyFee}
              prefix="$"
              placeholder="Gross fee earned"
            />
            <NumberInput
              label="Hours Worked"
              value={hours}
              onChange={setHours}
              suffix="hrs"
              placeholder="Team total hours"
            />
            <NumberInput
              label="Team Size"
              value={teamSize}
              onChange={setTeamSize}
              suffix="ppl"
              placeholder="Headcount"
            />
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              Net margin assumes 30% overhead on agency fee. Industry benchmarks: gross margin 55%, net margin 28%, $95/hr blended rate, $120K revenue per head.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metric cards */}
      {hasCalc && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Gross Margin"
            value={fmtPct(calc.grossMargin)}
            sub={`${fmtMoney(calc.agencyFee)} fee on ${fmtMoney(calc.revenue)}`}
            icon={Percent}
            color={calc.grossMargin >= INDUSTRY_BENCHMARKS.grossMargin ? "text-emerald-600" : "text-rose-500"}
            bg={calc.grossMargin >= INDUSTRY_BENCHMARKS.grossMargin ? "bg-emerald-50/40" : "bg-rose-50/40"}
            good={calc.grossMargin >= INDUSTRY_BENCHMARKS.grossMargin}
          />
          <MetricCard
            label="Net Margin"
            value={fmtPct(calc.netMargin)}
            sub={`${fmtMoney(calc.netProfit)} net profit`}
            icon={TrendingUp}
            color={calc.netMargin >= INDUSTRY_BENCHMARKS.netMargin ? "text-emerald-600" : "text-amber-600"}
            bg={calc.netMargin >= INDUSTRY_BENCHMARKS.netMargin ? "bg-emerald-50/40" : "bg-amber-50/40"}
            good={calc.netMargin >= INDUSTRY_BENCHMARKS.netMargin}
          />
          <MetricCard
            label="Hourly Rate"
            value={calc.hours > 0 ? fmtMoney(calc.hourlyRate) + "/hr" : "—"}
            sub={calc.hours > 0 ? `${calc.hours} hours worked` : "Enter hours to calculate"}
            icon={Clock}
            color={calc.hours > 0 && calc.hourlyRate >= INDUSTRY_BENCHMARKS.hourlyRate ? "text-teal-600" : "text-slate-500"}
            bg="bg-teal-50/40"
            good={calc.hours > 0 ? calc.hourlyRate >= INDUSTRY_BENCHMARKS.hourlyRate : undefined}
          />
          <MetricCard
            label="Revenue / Head"
            value={fmtMoney(calc.revenuePerHead)}
            sub={`${calc.teamSize} team member${calc.teamSize !== 1 ? "s" : ""}`}
            icon={Users}
            color={calc.revenuePerHead >= INDUSTRY_BENCHMARKS.revenuePerHead ? "text-violet-600" : "text-slate-500"}
            bg="bg-violet-50/40"
            good={calc.revenuePerHead >= INDUSTRY_BENCHMARKS.revenuePerHead}
          />
        </div>
      )}

      {/* Benchmark comparison */}
      {hasCalc && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Industry Benchmark Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CompareBar
              label="Gross Margin"
              actual={calc.grossMargin}
              benchmark={INDUSTRY_BENCHMARKS.grossMargin}
              formatter={fmtPct}
            />
            <CompareBar
              label="Net Margin"
              actual={calc.netMargin}
              benchmark={INDUSTRY_BENCHMARKS.netMargin}
              formatter={fmtPct}
            />
            {calc.hours > 0 && (
              <CompareBar
                label="Blended Hourly Rate"
                actual={calc.hourlyRate}
                benchmark={INDUSTRY_BENCHMARKS.hourlyRate}
                formatter={(v) => `$${v.toFixed(0)}/hr`}
              />
            )}
            <CompareBar
              label="Revenue per Team Member"
              actual={calc.revenuePerHead}
              benchmark={INDUSTRY_BENCHMARKS.revenuePerHead}
              formatter={fmtMoney}
            />
          </CardContent>
        </Card>
      )}

      {!hasCalc && (
        <div className="py-10 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
          Enter campaign revenue and agency fee above to see margin calculations and benchmark comparisons.
        </div>
      )}

      {/* Per-client profitability from database */}
      {clientProfitability.length > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-500" />
              Per-Client Profitability (from Data Room)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Client", "Campaign Budget", "Fee Earned", "Fee Margin"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientProfitability.map((entry) => (
                    <ClientProfitabilityRow
                      key={entry.id}
                      entry={entry}
                      isMost={entry.id === mostProfitable}
                      isLeast={entry.id === leastProfitable && clientProfitability.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length > 0 && clientProfitability.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          Log engagements with both campaign budget and fee earned values to see per-client profitability breakdown.
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle2, Target, Clock, Lightbulb
} from "lucide-react";

const RISK_CONFIG = {
  low:    { color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { color: "text-amber-600",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  high:   { color: "text-red-500",     badge: "bg-red-50 text-red-700 border-red-200" },
};

const CONFIDENCE_CONFIG = {
  high:   { badge: "bg-emerald-100 text-emerald-800", label: "High Confidence" },
  medium: { badge: "bg-amber-100 text-amber-800",     label: "Medium Confidence" },
  low:    { badge: "bg-slate-100 text-slate-600",     label: "Low Confidence" },
};

export default function OptimalPricingPanel({ partnershipId }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setPricing(null);
    const res = await base44.functions.invoke("recommendOptimalPricing", { partnership_id: partnershipId });
    setPricing(res.data.pricing);
    setLoading(false);
  };

  const riskCfg = pricing ? (RISK_CONFIG[pricing.discount_risk] || RISK_CONFIG.medium) : null;
  const confCfg = pricing ? (CONFIDENCE_CONFIG[pricing.confidence] || CONFIDENCE_CONFIG.medium) : null;

  const rangeWidth = pricing
    ? Math.max(1, pricing.price_ceiling - pricing.price_floor)
    : 1;
  const recommendedPct = pricing
    ? Math.round(((pricing.recommended_price - pricing.price_floor) / rangeWidth) * 100)
    : 50;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Optimal Pricing</p>
            <p className="text-[10px] text-slate-400">AI-powered deal value recommendation</p>
          </div>
        </div>
        <Button size="sm" onClick={runAnalysis} disabled={loading}
          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 px-2.5">
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><Sparkles className="w-3 h-3 mr-1" />Analyze</>}
        </Button>
      </div>

      {!pricing && !loading && (
        <div className="text-center py-5 border border-dashed border-slate-200 rounded-lg">
          <DollarSign className="w-7 h-7 text-slate-200 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Click Analyze to get pricing recommendations</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-5 bg-slate-50 rounded-lg">
          <Loader2 className="w-6 h-6 mx-auto mb-1.5 animate-spin text-emerald-400" />
          <p className="text-xs text-slate-500">Analyzing benchmarks, talent rates & deal history...</p>
        </div>
      )}

      {pricing && (
        <div className="space-y-3 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">

          {/* Recommended price + confidence */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Recommended Price</p>
              <p className="text-2xl font-bold text-slate-900">${pricing.recommended_price?.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{pricing.pricing_rationale}</p>
            </div>
            <Badge className={`${confCfg.badge} text-[10px] font-semibold shrink-0`}>{confCfg.label}</Badge>
          </div>

          {/* Price range bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Floor: <strong className="text-slate-600">${pricing.price_floor?.toLocaleString()}</strong></span>
              <span>Ceiling: <strong className="text-slate-600">${pricing.price_ceiling?.toLocaleString()}</strong></span>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-visible">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-emerald-300 to-slate-200 rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-emerald-600 border-2 border-white rounded-full shadow-md"
                style={{ left: `${Math.max(5, Math.min(95, recommendedPct))}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
          </div>

          {/* Value drivers */}
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Value Drivers
            </p>
            <ul className="space-y-0.5">
              {pricing.value_drivers?.map((d, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />{d}
                </li>
              ))}
            </ul>
          </div>

          {/* Negotiation anchors */}
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-indigo-400" /> Negotiation Anchors
            </p>
            <ul className="space-y-0.5">
              {pricing.negotiation_anchors?.map((a, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                  <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>{a}
                </li>
              ))}
            </ul>
          </div>

          {/* Discount risk */}
          <div className={`flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg border ${riskCfg.badge}`}>
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span><strong>Discount risk: {pricing.discount_risk}</strong> — {pricing.discount_risk_reason}</span>
          </div>

          {/* Deal structure + ROI + urgency */}
          <div className="space-y-1.5 pt-1 border-t border-emerald-100">
            {pricing.optimal_deal_structure && (
              <p className="text-xs text-slate-600 flex items-start gap-1">
                <Lightbulb className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                {pricing.optimal_deal_structure}
              </p>
            )}
            {pricing.roi_projection && (
              <p className="text-xs text-slate-600 flex items-start gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                {pricing.roi_projection}
              </p>
            )}
            {pricing.urgency_note && (
              <p className="text-xs text-slate-600 flex items-start gap-1">
                <Clock className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                {pricing.urgency_note}
              </p>
            )}
            {pricing.comparable_context && (
              <p className="text-[11px] text-slate-400 italic">{pricing.comparable_context}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
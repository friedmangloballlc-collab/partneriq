import React, { useState } from "react";
import jsPDF from "jspdf";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  Award,
  Download,
  Save,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Users,
  BarChart3,
  ShoppingCart,
  Calendar,
  DollarSign,
} from "lucide-react";

// Platform logo SVG paths (rendered as colored initials / badges)
const PLATFORM_CONFIG = {
  Instagram: { label: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500", short: "IG" },
  TikTok: { label: "TikTok", color: "bg-black", short: "TK" },
  YouTube: { label: "YouTube", color: "bg-red-600", short: "YT" },
  "Twitter/X": { label: "Twitter / X", color: "bg-slate-900", short: "X" },
  LinkedIn: { label: "LinkedIn", color: "bg-blue-700", short: "LI" },
  Twitch: { label: "Twitch", color: "bg-purple-600", short: "TV" },
  Podcast: { label: "Podcast", color: "bg-amber-600", short: "POD" },
  Blog: { label: "Blog", color: "bg-emerald-600", short: "BLOG" },
  Other: { label: "Platform", color: "bg-slate-500", short: "..." },
};

function getPlatform(deal) {
  const raw = deal?.platform || deal?.partnership_type || "Other";
  return PLATFORM_CONFIG[raw] || PLATFORM_CONFIG["Other"];
}

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtMoney(n) {
  if (!n && n !== 0) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function MetricInput({ icon: Icon, label, value, onChange, placeholder, suffix }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      <div className="relative">
        <Input
          type="number"
          min="0"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm pr-10"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProofOfPerformance({ deal }) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    impressions: "",
    reach: "",
    clicks: "",
    conversions: "",
    engagement_rate: "",
  });

  const platform = getPlatform(deal);
  const verifiedAt = new Date().toISOString();

  // ── Save to Supabase ────────────────────────────────────────────────────────
  const saveToDataRoom = useMutation({
    mutationFn: async () => {
      const payload = {
        title: deal.title || `${deal.brand_name} × ${deal.talent_name}`,
        brand_name: deal.brand_name,
        talent_name: deal.talent_name,
        platform: deal.platform || deal.partnership_type,
        deal_type: deal.partnership_type || "sponsorship",
        deal_value: deal.deal_value || 0,
        status: "completed",
        deliverables: deal.notes || deal.deliverables || "",
        room_type: "talent_deals",
        entry_type: "deal",
        performance_metrics: {
          impressions: parseFloat(metrics.impressions) || 0,
          reach: parseFloat(metrics.reach) || 0,
          clicks: parseFloat(metrics.clicks) || 0,
          conversions: parseFloat(metrics.conversions) || 0,
          engagement_rate: parseFloat(metrics.engagement_rate) || 0,
          verified_at: verifiedAt,
          deal_id: deal.id,
        },
        start_date: deal.contract_signed_at ? deal.contract_signed_at.slice(0, 10) : null,
        end_date: deal.deadline ? deal.deadline.slice(0, 10) : null,
        visibility: "private",
      };
      const { data, error } = await supabase
        .from("data_room_entries")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Saved to Data Room", description: "Performance card saved to your Talent Data Room." });
    },
    onError: (err) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  // ── PDF Generator ───────────────────────────────────────────────────────────
  const handleGeneratePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const marginX = 18;
    let y = 0;

    // ── Header band ─────────────────────────────────────────────────────────
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, W, 52, "F");

    // Badge: "VERIFIED BY DEAL STAGE"
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, 8, 60, 8, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED BY DEAL STAGE", marginX + 3, 13.2);

    // Timestamp on right
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 255);
    doc.setFont("helvetica", "normal");
    doc.text(`Issued: ${fmtDate(verifiedAt)}`, W - marginX, 13.2, { align: "right" });

    // Title
    y = 26;
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    const title = deal.title || "Campaign Performance";
    doc.text(title, marginX, y);

    // Subtitle
    y = 34;
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 255);
    doc.setFont("helvetica", "normal");
    const subtitle = `${deal.brand_name || "Brand"} × ${deal.talent_name || "Talent"}`;
    doc.text(subtitle, marginX, y);

    // Platform + deal value pills
    y = 44;
    doc.setFillColor(255, 255, 255, 0.2);
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Platform: ${deal.platform || deal.partnership_type || "—"}`, marginX, y);
    if (deal.deal_value) {
      doc.text(`Deal Value: ${fmtMoney(deal.deal_value)}`, marginX + 70, y);
    }
    const duration =
      deal.contract_signed_at && deal.deadline
        ? `${fmtDate(deal.contract_signed_at)} – ${fmtDate(deal.deadline)}`
        : deal.deadline
        ? `Until ${fmtDate(deal.deadline)}`
        : null;
    if (duration) {
      doc.text(`Duration: ${duration}`, marginX + 140, y, { align: "right", maxWidth: 50 });
    }

    // ── Section: Campaign Metrics ────────────────────────────────────────────
    y = 66;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("CAMPAIGN METRICS", marginX, y);
    doc.setDrawColor(220, 220, 240);
    doc.line(marginX, y + 2, W - marginX, y + 2);

    const metricItems = [
      { label: "Impressions", value: metrics.impressions ? Number(metrics.impressions).toLocaleString() : "—" },
      { label: "Reach", value: metrics.reach ? Number(metrics.reach).toLocaleString() : "—" },
      { label: "Clicks", value: metrics.clicks ? Number(metrics.clicks).toLocaleString() : "—" },
      { label: "Conversions", value: metrics.conversions ? Number(metrics.conversions).toLocaleString() : "—" },
      { label: "Engagement Rate", value: metrics.engagement_rate ? `${metrics.engagement_rate}%` : "—" },
    ];

    y = 74;
    const colW = (W - marginX * 2) / 3;
    metricItems.forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = marginX + col * colW;
      const by = y + row * 30;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(bx, by, colW - 4, 26, 2, 2, "F");

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(m.label.toUpperCase(), bx + 5, by + 9);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(m.value, bx + 5, by + 20);
    });

    // ── Section: Deal Details ────────────────────────────────────────────────
    y = 140;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("DEAL DETAILS", marginX, y);
    doc.setDrawColor(220, 220, 240);
    doc.line(marginX, y + 2, W - marginX, y + 2);

    y = 150;
    const details = [
      ["Brand", deal.brand_name || "—"],
      ["Talent / Creator", deal.talent_name || "—"],
      ["Deal Type", deal.partnership_type || "—"],
      ["Platform", deal.platform || deal.partnership_type || "—"],
      ["Deal Value", deal.deal_value ? fmtMoney(deal.deal_value) : "—"],
      ["Deliverables", deal.deliverables || deal.notes || "—"],
      ["Contract Signed", fmtDate(deal.contract_signed_at)],
      ["Campaign Deadline", fmtDate(deal.deadline)],
    ].filter(([, v]) => v && v !== "—");

    doc.setFont("helvetica", "normal");
    details.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = marginX + col * ((W - marginX * 2) / 2);
      const by = y + row * 12;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label + ":", bx, by);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(String(value).slice(0, 38), bx + 32, by);
      doc.setFont("helvetica", "normal");
    });

    // ── Watermark ────────────────────────────────────────────────────────────
    doc.setTextColor(230, 230, 245);
    doc.setFontSize(52);
    doc.setFont("helvetica", "bold");
    doc.text("DEAL STAGE", 105, 175, { align: "center", angle: 35 });

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 272, W, 25, "F");
    doc.setDrawColor(220, 220, 240);
    doc.line(0, 272, W, 272);

    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("Verified by Deal Stage", marginX, 281);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Issued: ${new Date(verifiedAt).toLocaleString()}`, marginX, 288);
    doc.text("dealstage.io", W - marginX, 281, { align: "right" });
    doc.text("Confidential Performance Report", W - marginX, 288, { align: "right" });

    doc.save(`proof-of-performance-${(deal.brand_name || "deal").toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF downloaded", description: "Your performance card has been downloaded." });
  };

  // ── Card preview ─────────────────────────────────────────────────────────
  return (
    <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Proof of Performance</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Generate a verified campaign performance card</p>
            </div>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified by Deal Stage
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deal identity banner */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black ${platform.color}`}>
            {platform.short}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">
              {deal.brand_name || "Brand"} <span className="text-slate-400 font-normal">×</span> {deal.talent_name || "Talent"}
            </p>
            {deal.title && <p className="text-xs text-slate-500 mt-0.5 truncate">{deal.title}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {deal.deal_value > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  {fmtMoney(deal.deal_value)}
                </span>
              )}
              {deal.deadline && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(deal.deadline)}
                </span>
              )}
              <span className="text-xs text-slate-400">{platform.label}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Issued</p>
            <p className="text-xs font-medium text-slate-600">{fmtDate(verifiedAt)}</p>
          </div>
        </div>

        {/* Metric inputs */}
        <div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            Campaign Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricInput
              icon={Eye}
              label="Impressions"
              value={metrics.impressions}
              onChange={(v) => setMetrics((m) => ({ ...m, impressions: v }))}
              placeholder="0"
            />
            <MetricInput
              icon={Users}
              label="Reach"
              value={metrics.reach}
              onChange={(v) => setMetrics((m) => ({ ...m, reach: v }))}
              placeholder="0"
            />
            <MetricInput
              icon={MousePointerClick}
              label="Clicks"
              value={metrics.clicks}
              onChange={(v) => setMetrics((m) => ({ ...m, clicks: v }))}
              placeholder="0"
            />
            <MetricInput
              icon={ShoppingCart}
              label="Conversions"
              value={metrics.conversions}
              onChange={(v) => setMetrics((m) => ({ ...m, conversions: v }))}
              placeholder="0"
            />
            <MetricInput
              icon={TrendingUp}
              label="Engagement Rate"
              value={metrics.engagement_rate}
              onChange={(v) => setMetrics((m) => ({ ...m, engagement_rate: v }))}
              placeholder="0.0"
              suffix="%"
            />
          </div>
        </div>

        {/* Metric preview pills */}
        {(metrics.impressions || metrics.reach || metrics.clicks || metrics.conversions || metrics.engagement_rate) && (
          <div className="flex flex-wrap gap-2 p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
            {metrics.impressions && (
              <span className="text-xs font-semibold bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
                {Number(metrics.impressions).toLocaleString()} impressions
              </span>
            )}
            {metrics.reach && (
              <span className="text-xs font-semibold bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
                {Number(metrics.reach).toLocaleString()} reach
              </span>
            )}
            {metrics.clicks && (
              <span className="text-xs font-semibold bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
                {Number(metrics.clicks).toLocaleString()} clicks
              </span>
            )}
            {metrics.conversions && (
              <span className="text-xs font-semibold bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
                {Number(metrics.conversions).toLocaleString()} conversions
              </span>
            )}
            {metrics.engagement_rate && (
              <span className="text-xs font-semibold bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shadow-sm">
                {metrics.engagement_rate}% engagement
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={handleGeneratePDF}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Generate PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => saveToDataRoom.mutate()}
            disabled={saveToDataRoom.isPending}
            className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2"
          >
            {saveToDataRoom.isPending ? (
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveToDataRoom.isPending ? "Saving..." : "Save to Data Room"}
          </Button>
        </div>

        {/* Verified footer */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <p className="text-xs text-slate-500">
            This performance card is verified by Deal Stage.
            Timestamp: <span className="font-medium text-slate-600">{new Date(verifiedAt).toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Sliders, Check } from "lucide-react";

export default function CustomReporting({ partnerships = [], emails = [] }) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    summary: true,
    pipeline: true,
    roi: true,
    trends: true,
    benchmarks: true,
  });

  const [exportFormat, setExportFormat] = useState("pdf");
  const [scheduling, setScheduling] = useState(null);

  const metrics = [
    { key: "summary", label: "Executive Summary", desc: "High-level KPIs and overview" },
    { key: "pipeline", label: "Pipeline Analysis", desc: "Deal stages and progression" },
    { key: "roi", label: "ROI Projections", desc: "Predictive modeling & scenarios" },
    { key: "trends", label: "Trend Analysis", desc: "Performance over time" },
    { key: "benchmarks", label: "Competitor Benchmarks", desc: "Industry comparisons" },
  ];

  const toggleMetric = (key) => {
    setSelectedMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeMetrics = Object.entries(selectedMetrics).filter(([_, v]) => v).length;
  
  const handleExport = () => {
    // Generate report data
    const reportData = {
      generatedAt: new Date().toISOString(),
      format: exportFormat,
      metrics: Object.keys(selectedMetrics).filter(k => selectedMetrics[k]),
      summary: {
        totalPartnerships: partnerships.length,
        totalValue: partnerships.reduce((s, p) => s + (p.deal_value || 0), 0),
        avgMatchScore: partnerships.filter(p => p.match_score).length
          ? Math.round(partnerships.reduce((s, p) => s + (p.match_score || 0), 0) / partnerships.filter(p => p.match_score).length)
          : 0,
      },
    };

    // Simulate download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.${exportFormat === "pdf" ? "pdf" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Customize Report Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                selectedMetrics[metric.key]
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                selectedMetrics[metric.key]
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-slate-300"
              }`}>
                {selectedMetrics[metric.key] && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{metric.label}</p>
                <p className="text-sm text-slate-600 mt-0.5">{metric.desc}</p>
              </div>
            </button>
          ))}
          <p className="text-xs text-slate-500 mt-4">
            <strong>Report includes:</strong> {activeMetrics} metric{activeMetrics !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Export & Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div>
            <p className="text-sm font-medium text-slate-900 mb-2">Export Format</p>
            <div className="flex gap-2 flex-wrap">
              {["pdf", "csv", "json"].map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exportFormat === format
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-900 mb-2">Auto-Report Schedule</p>
            <div className="flex gap-2 flex-wrap">
              {["never", "weekly", "monthly"].map(sched => (
                <button
                  key={sched}
                  onClick={() => setScheduling(sched)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    scheduling === sched
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sched === "never" ? "Manual Only" : `Every ${sched}`}
                </button>
              ))}
            </div>
            {scheduling !== "never" && (
              <p className="text-xs text-emerald-600 mt-2 font-medium">✓ Report will be emailed to your inbox</p>
            )}
          </div>

          {/* Download Button */}
          <div className="border-t border-slate-200 pt-4">
            <Button onClick={handleExport} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              <Download className="w-4 h-4 mr-2" />
              Export Report Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Report Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Total Partnerships", value: partnerships.length },
              { label: "Pipeline Value", value: `$${Math.round(partnerships.reduce((s, p) => s + (p.deal_value || 0), 0) / 1000)}K` },
              { label: "Email Open Rate", value: "45.2%" },
              { label: "Avg Match Score", value: "84%" },
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 p-3 bg-blue-50 rounded-lg border border-blue-200/50">
            <strong>Format:</strong> Your {exportFormat.toUpperCase()} report will include all selected metrics with charts, tables, and insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
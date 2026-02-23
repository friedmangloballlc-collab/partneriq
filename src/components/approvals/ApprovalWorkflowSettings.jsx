import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function ApprovalWorkflowSettings({ onSave }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    approvalMode: "manual", // "manual" or "hybrid"
    autoApproveThreshold: 90, // AI match score threshold
    autoApproveDealValueLimit: 50000, // Max deal value for auto-approval
    requireHumanApprovalAbove: 100000,
    priorityAssignment: "distribution", // "distribution" or "manual"
    slaConfig: {
      p1_critical: 4, // hours
      p2_high: 24,
      p3_standard: 48,
      p4_low: 72,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (user) {
      await base44.auth.updateMe({
        approval_workflow_settings: JSON.stringify(settings),
      });
      setSaving(false);
      onSave?.(settings);
    }
  };

  return (
    <div className="space-y-4">
      {/* Approval Mode */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Approval Mode</CardTitle>
            <Badge variant="outline" className="text-[10px]">Required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border-2 border-indigo-200 bg-indigo-50">
              <input
                type="radio"
                id="manual"
                value="manual"
                checked={settings.approvalMode === "manual"}
                onChange={(e) => setSettings({ ...settings, approvalMode: e.target.value })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="manual" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  Manual Review
                </label>
                <p className="text-xs text-slate-600 mt-0.5">You review and approve every outbound item</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-slate-100 text-slate-700 text-[10px]">Max Control</Badge>
                  <Badge className="bg-red-100 text-red-700 text-[10px]">Higher Volume</Badge>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
              <input
                type="radio"
                id="hybrid"
                value="hybrid"
                checked={settings.approvalMode === "hybrid"}
                onChange={(e) => setSettings({ ...settings, approvalMode: e.target.value })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="hybrid" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  Hybrid (Manual + Auto)
                </label>
                <p className="text-xs text-slate-600 mt-0.5">Auto-approve matched items below thresholds, review exceptions</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Efficiency</Badge>
                  <Badge className="bg-amber-100 text-amber-700 text-[10px]">Smart Filtering</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Approval Thresholds (Hybrid Only) */}
      {settings.approvalMode === "hybrid" && (
        <Card className="border-slate-200/60 bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-semibold text-emerald-900">Auto-Approval Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Match Score Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-slate-700">AI Match Score Threshold</Label>
                <Badge className="bg-emerald-600 text-white">{settings.autoApproveThreshold}%</Badge>
              </div>
              <Slider
                value={[settings.autoApproveThreshold]}
                onValueChange={(val) => setSettings({ ...settings, autoApproveThreshold: val[0] })}
                min={70}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-2">Items with match score ≥ {settings.autoApproveThreshold}% auto-approve</p>
            </div>

            {/* Deal Value Limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-slate-700">Max Deal Value for Auto-Approval</Label>
                <Badge className="bg-emerald-600 text-white">${(settings.autoApproveDealValueLimit / 1000).toFixed(0)}K</Badge>
              </div>
              <Slider
                value={[settings.autoApproveDealValueLimit]}
                onValueChange={(val) => setSettings({ ...settings, autoApproveDealValueLimit: val[0] })}
                min={10000}
                max={500000}
                step={10000}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-2">Only auto-approve deals under this value</p>
            </div>

            {/* Hard Ceiling */}
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">Manual Review Required</p>
                  <p className="text-xs text-amber-700 mt-0.5">Deals over ${(settings.requireHumanApprovalAbove / 1000).toFixed(0)}K always require human approval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA Configuration */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Review SLA Timelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(settings.slaConfig).map(([priority, hours]) => (
              <div key={priority} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {priority.replace(/_/g, " ")}
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setSettings({
                      ...settings,
                      slaConfig: { ...settings.slaConfig, [priority]: parseInt(e.target.value) }
                    })}
                    className="w-12 px-2 py-1 text-xs border border-slate-300 rounded text-center"
                  />
                  <span className="text-xs text-slate-500">hours</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {saving ? "Saving..." : "Save Workflow Settings"}
      </Button>
    </div>
  );
}
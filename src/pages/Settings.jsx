import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, User, Shield, Bell, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    phone: "",
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({
        company_name: u?.company_name || "",
        job_title: u?.job_title || "",
        phone: u?.phone || "",
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await base44.auth.updateMe(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = {
    admin: { label: "Administrator", desc: "Full access to all platform features", color: "bg-red-50 text-red-700" },
    brand: { label: "Brand User", desc: "Discover talent, manage partnerships", color: "bg-indigo-50 text-indigo-700" },
    talent: { label: "Talent/Creator", desc: "Manage deals, view brand opportunities", color: "bg-emerald-50 text-emerald-700" },
    agency: { label: "Agency", desc: "Manage talent roster and partnership pipeline", color: "bg-amber-50 text-amber-700" },
  };

  const currentRole = roleInfo[user?.role] || roleInfo.brand;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">Full Name</Label>
              <p className="text-sm font-medium text-slate-700 mt-1">{user?.full_name || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Email</Label>
              <p className="text-sm font-medium text-slate-700 mt-1">{user?.email || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company / Agency Name</Label>
              <Input value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="Your company" />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} placeholder="Your role" />
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
            {saveStatus === 'success' && (
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm font-medium text-red-600">Failed to save. Please try again.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Account Role</CardTitle>
              <CardDescription>Your access level on the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={`${currentRole.color} text-sm px-3 py-1`}>{currentRole.label}</Badge>
            <p className="text-sm text-slate-500">{currentRole.desc}</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Contact an admin to change your role.</p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Configure your alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New match recommendations", desc: "When the AI engine finds a high-score match" },
            { label: "Approval requests", desc: "When items need your review" },
            { label: "Partnership updates", desc: "Status changes on your deals" },
            { label: "Outreach responses", desc: "When recipients reply to emails" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, User, Shield, Bell, Loader2, Database, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { seedDemoData } from "@/utils/seedDemoData";
import { queryClientInstance } from "@/lib/query-client";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Zod schema ──────────────────────────────────────────────────────────────

const profileSchema = z.object({
  company_name: z
    .string()
    .max(100, "Company name must be 100 characters or fewer")
    .optional()
    .or(z.literal("")),
  job_title: z
    .string()
    .max(80, "Job title must be 80 characters or fewer")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^(\+?[\d\s\-().]{7,20})?$/,
      "Enter a valid phone number (e.g. +1 555 000 0000)"
    )
    .optional()
    .or(z.literal("")),
});

// ─── Inline field error ───────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(null);
  const [seedDone, setSeedDone] = useState(false);
  const [seedErrors, setSeedErrors] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: "",
      job_title: "",
      phone: "",
    },
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Populate form with persisted values once the user loads
      reset({
        company_name: u?.company_name || "",
        job_title: u?.job_title || "",
        phone: u?.phone || "",
      });
    }).catch(() => {});
  }, [reset]);

  const handleSave = handleSubmit(async (data) => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await base44.auth.updateMe(data);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setSaving(false);
    }
  });

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
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences (v2 - local)</p>
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

          {/* Validated fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company / Agency Name</Label>
              <Input
                id="company_name"
                placeholder="Your company"
                className={errors.company_name ? "border-red-400 focus-visible:ring-red-400" : ""}
                {...register("company_name")}
              />
              <FieldError message={errors.company_name?.message} />
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                placeholder="Your role"
                className={errors.job_title ? "border-red-400 focus-visible:ring-red-400" : ""}
                {...register("job_title")}
              />
              <FieldError message={errors.job_title?.message} />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
            {saveStatus === "success" && (
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            {saveStatus === "error" && (
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

      {/* Demo Data */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Demo Data</CardTitle>
              <CardDescription>Load sample data to explore all platform features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Populate the database with demo brands, talents, partnerships, marketplace opportunities, outreach sequences, approval items, tasks, activities, rate benchmarks, events, and more.
          </p>
          {seedProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{seedProgress.label}</span>
                <span>{seedProgress.step}/{seedProgress.total}</span>
              </div>
              <Progress value={(seedProgress.step / seedProgress.total) * 100} className="h-2" />
            </div>
          )}
          {seedErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
              <p className="text-sm font-medium text-red-700">Errors during seeding:</p>
              {seedErrors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
              ))}
            </div>
          )}
          {seedDone ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Demo data loaded! All pages have been refreshed.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setSeedDone(false);
                  setSeedErrors([]);
                  setSeedProgress(null);
                  sessionStorage.removeItem("partneriq_auto_seed_done");
                }}
              >
                Seed Again
              </Button>
            </div>
          ) : (
            <Button
              onClick={async () => {
                setSeeding(true);
                setSeedDone(false);
                setSeedErrors([]);
                sessionStorage.removeItem("partneriq_auto_seed_done");
                const errors = [];
                try {
                  await seedDemoData((p) => {
                    setSeedProgress(p);
                    if (p.error) errors.push(p.error);
                  });
                  setSeedErrors(errors);
                  await queryClientInstance.invalidateQueries();
                  setSeedDone(true);
                } catch (err) {
                  console.error("Seed error:", err);
                  setSeedErrors([...errors, err.message]);
                } finally {
                  setSeeding(false);
                }
              }}
              disabled={seeding}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              {seeding ? "Loading Demo Data..." : "Load Demo Data"}
            </Button>
          )}
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

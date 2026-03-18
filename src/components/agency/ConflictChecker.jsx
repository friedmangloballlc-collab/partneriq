import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck, ShieldAlert, Search, AlertTriangle, CheckCircle2,
  Loader2, Lock, Calendar, User, Building2,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "unknown date";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nicheOverlap(nicheA, nicheB) {
  if (!nicheA || !nicheB) return false;
  const a = nicheA.toLowerCase().trim();
  const b = nicheB.toLowerCase().trim();
  if (a === b) return true;
  // Partial match (e.g. "beauty & skincare" overlaps with "beauty")
  return a.includes(b) || b.includes(a);
}

// ── ConflictResult ────────────────────────────────────────────────────────────

function ConflictResult({ conflicts, pitchBrand, pitchNiche, checked }) {
  if (!checked) return null;

  if (conflicts.length === 0) {
    return (
      <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-800">No Conflicts Found</p>
          <p className="text-sm text-emerald-700 mt-0.5">
            None of your talent have active exclusivity deals that conflict with pitching{" "}
            <strong>{pitchBrand}</strong>
            {pitchNiche ? ` in the ${pitchNiche} niche` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
        <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
        <div>
          <p className="font-bold text-rose-800">
            {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} Detected
          </p>
          <p className="text-sm text-rose-600 mt-0.5">
            Pitching <strong>{pitchBrand}</strong>
            {pitchNiche ? ` in ${pitchNiche}` : ""} may violate active exclusivity agreements.
          </p>
        </div>
      </div>

      {conflicts.map((c, i) => (
        <Card key={i} className="border-rose-200 bg-rose-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-rose-800">
                  Conflict: {c.talentName}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-rose-700">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Talent: <strong>{c.talentName}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Exclusive with: <strong>{c.exclusiveBrand}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Niche: <strong>{c.niche}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Until: <strong>{fmtDate(c.exclusivityEnd)}</strong>
                  </span>
                </div>
                <p className="text-xs text-rose-600 bg-rose-100 rounded px-2 py-1 inline-block">
                  {c.talentName} has an active exclusivity deal with {c.exclusiveBrand} in the{" "}
                  <strong>{c.niche}</strong> niche until{" "}
                  <strong>{fmtDate(c.exclusivityEnd)}</strong>
                </p>
                {c.partnershipId && (
                  <p className="text-xs text-rose-400">Partnership ID: {c.partnershipId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
        Review exclusivity clauses before proceeding. Conflicts may expose the agency to legal liability.
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ConflictChecker() {
  const [pitchBrand, setPitchBrand]   = useState("");
  const [pitchNiche, setPitchNiche]   = useState("");
  const [talentFilter, setTalentFilter] = useState("all");
  const [checked, setChecked]         = useState(false);
  const [isChecking, setIsChecking]   = useState(false);

  // ── fetch active partnerships with exclusivity ────────────────────────────
  const { data: exclusivePartnerships = [], isLoading: loadingPartnerships } = useQuery({
    queryKey: ["conflict-checker-partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("id, talent_id, brand_id, brand_name, niche, exclusivity, exclusivity_end_date, status")
        .eq("status", "active")
        .not("exclusivity_end_date", "is", null)
        .order("exclusivity_end_date", { ascending: false })
        .limit(500);
      if (error) throw error;
      // Only include still-active exclusivity windows
      return (data || []).filter(
        (p) => p.exclusivity_end_date && new Date(p.exclusivity_end_date) > new Date()
      );
    },
  });

  // ── fetch talent names ────────────────────────────────────────────────────
  const { data: talents = [] } = useQuery({
    queryKey: ["conflict-checker-talents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("talents").select("id, name, niche").limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const talentById = useMemo(() => {
    const map = {};
    talents.forEach((t) => (map[t.id] = t));
    return map;
  }, [talents]);

  // ── unique niches from active exclusivity deals ───────────────────────────
  const niches = useMemo(() => {
    return [...new Set(exclusivePartnerships.map((p) => p.niche).filter(Boolean))].sort();
  }, [exclusivePartnerships]);

  // ── talent options ────────────────────────────────────────────────────────
  const talentOptions = useMemo(() => {
    const ids = [...new Set(exclusivePartnerships.map((p) => p.talent_id).filter(Boolean))];
    return ids.map((id) => ({ id, name: talentById[id]?.name || id }));
  }, [exclusivePartnerships, talentById]);

  // ── conflict detection ────────────────────────────────────────────────────
  const conflicts = useMemo(() => {
    if (!checked || !pitchBrand.trim()) return [];

    return exclusivePartnerships
      .filter((p) => {
        // Optionally filter by selected talent
        if (talentFilter !== "all" && p.talent_id !== talentFilter) return false;

        // Check niche overlap if a niche is specified
        if (pitchNiche && p.niche) {
          return nicheOverlap(p.niche, pitchNiche);
        }

        // If no niche specified, flag all active exclusivities
        return true;
      })
      .map((p) => ({
        partnershipId: p.id,
        talentId: p.talent_id,
        talentName: talentById[p.talent_id]?.name || `Talent ${p.talent_id}`,
        exclusiveBrand: p.brand_name || `Brand ${p.brand_id}`,
        niche: p.niche || "All niches",
        exclusivityEnd: p.exclusivity_end_date,
      }));
  }, [checked, pitchBrand, pitchNiche, talentFilter, exclusivePartnerships, talentById]);

  const handleCheck = async () => {
    if (!pitchBrand.trim()) return;
    setIsChecking(true);
    // Simulate brief processing delay for UX
    await new Promise((r) => setTimeout(r, 400));
    setChecked(true);
    setIsChecking(false);
  };

  const handleReset = () => {
    setPitchBrand("");
    setPitchNiche("");
    setTalentFilter("all");
    setChecked(false);
  };

  // ── overview stats ────────────────────────────────────────────────────────
  const activeExclusivityCount = exclusivePartnerships.length;
  const talentsWithExclusivity = new Set(exclusivePartnerships.map((p) => p.talent_id)).size;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-600" />
          Conflict Checker
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Check for exclusivity conflicts before pitching a brand to your talent
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-slate-200/60 bg-amber-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xl font-black text-slate-800">{activeExclusivityCount}</p>
              <p className="text-xs text-slate-500">Active Exclusivity Deals</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 bg-violet-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <User className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-xl font-black text-slate-800">{talentsWithExclusivity}</p>
              <p className="text-xs text-slate-500">Talent Under Exclusivity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input form */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Check New Pitch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Brand You Want to Pitch *</Label>
              <div className="relative mt-1.5">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="e.g. Glossier, Nike, SHEIN..."
                  value={pitchBrand}
                  onChange={(e) => { setPitchBrand(e.target.value); setChecked(false); }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Campaign Niche (optional)</Label>
              <Select
                value={pitchNiche}
                onValueChange={(v) => { setPitchNiche(v === "none" ? "" : v); setChecked(false); }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select niche or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any niche</SelectItem>
                  {niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Check Specific Talent (optional)</Label>
              <Select
                value={talentFilter}
                onValueChange={(v) => { setTalentFilter(v); setChecked(false); }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All talent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Talent</SelectItem>
                  {talentOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              onClick={handleCheck}
              disabled={!pitchBrand.trim() || isChecking || loadingPartnerships}
            >
              {isChecking ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Run Conflict Check</>
              )}
            </Button>
            {checked && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <ConflictResult
        conflicts={conflicts}
        pitchBrand={pitchBrand}
        pitchNiche={pitchNiche}
        checked={checked}
      />

      {/* Active exclusivity table */}
      {activeExclusivityCount > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              All Active Exclusivity Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Talent", "Exclusive Brand", "Niche", "Expires"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exclusivePartnerships.map((p) => {
                    const daysLeft = Math.ceil(
                      (new Date(p.exclusivity_end_date) - new Date()) / 86_400_000
                    );
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {talentById[p.talent_id]?.name || p.talent_id || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {p.brand_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {p.niche ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                              {p.niche}
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 text-xs">All niches</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${daysLeft <= 30 ? "text-rose-600" : "text-slate-600"}`}>
                            {fmtDate(p.exclusivity_end_date)}
                            <span className="text-slate-400 font-normal ml-1">({daysLeft}d)</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

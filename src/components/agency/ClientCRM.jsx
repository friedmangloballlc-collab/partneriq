import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2, Star, RefreshCw, TrendingUp, DollarSign,
  Calendar, ChevronRight, Search, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ── constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = ["Prospect", "Pitch", "Negotiation", "Signed", "Active", "Renewal"];

const STAGE_STYLES = {
  Prospect:    "bg-slate-100 text-slate-600 border-slate-200",
  Pitch:       "bg-blue-100 text-blue-700 border-blue-200",
  Negotiation: "bg-amber-100 text-amber-700 border-amber-200",
  Signed:      "bg-violet-100 text-violet-700 border-violet-200",
  Active:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  Renewal:     "bg-teal-100 text-teal-700 border-teal-200",
};

function fmtMoney(n) {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className="focus:outline-none disabled:cursor-not-allowed"
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(null)}
          onClick={() => !disabled && onChange(n)}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              n <= (hovered ?? value)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── PipelineBar ───────────────────────────────────────────────────────────────

function PipelineBar({ stage }) {
  const idx = PIPELINE_STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-1 mt-2">
      {PIPELINE_STAGES.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= idx ? "bg-teal-500" : "bg-slate-200"
          }`}
          title={s}
        />
      ))}
    </div>
  );
}

// ── ClientCard ────────────────────────────────────────────────────────────────

function ClientCard({ brand, dealScore, onCycleStage, onUpdateRating, updatingId }) {
  const stage   = brand.pipeline_stage || "Prospect";
  const nextStage = PIPELINE_STAGES[(PIPELINE_STAGES.indexOf(stage) + 1) % PIPELINE_STAGES.length];
  const stageStyle = STAGE_STYLES[stage] || STAGE_STYLES.Prospect;
  const isUpdating = updatingId === brand.id;

  const credScore = dealScore?.score || null;
  const credColor = credScore >= 70 ? "text-emerald-600" : credScore >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <Card className="border-slate-200/60 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">{brand.brand_name || brand.name || "Unnamed Brand"}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge className={`text-xs border ${stageStyle}`}>{stage}</Badge>
              {credScore !== null && (
                <span className={`text-xs font-bold ${credColor}`}>
                  Score: {credScore}/100
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-400 hover:text-slate-700 shrink-0"
            onClick={() => onCycleStage(brand, nextStage)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="ml-1 hidden sm:inline">{nextStage}</span>
              </>
            )}
          </Button>
        </div>

        {/* Pipeline progress */}
        <PipelineBar stage={stage} />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Spend</p>
            <p className="text-sm font-bold text-slate-800">{fmtMoney(brand.total_spend)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Renewal</p>
            <p className="text-sm font-bold text-slate-700">{fmtDate(brand.renewal_date)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Satisfaction</p>
            <StarRating
              value={brand.satisfaction_score || 0}
              onChange={(v) => onUpdateRating(brand, v)}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Industry / niche */}
        {brand.industry && (
          <p className="text-xs text-slate-400 mt-2">
            <span className="font-medium text-slate-600">{brand.industry}</span>
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noreferrer" className="ml-2 text-teal-600 hover:underline">
                {brand.website.replace(/^https?:\/\//, "").split("/")[0]}
              </a>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ClientCRM() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // ── fetch brands from partnerships ────────────────────────────────────────
  const { data: rawBrands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["client-crm-brands"],
    queryFn: async () => {
      // Fetch all brands
      const { data: brands, error: bError } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (bError) throw bError;

      // Fetch partnership spend summaries per brand
      const { data: partnerships, error: pError } = await supabase
        .from("partnerships")
        .select("brand_id, deal_value, status")
        .limit(1000);
      if (pError) throw pError;

      // Aggregate spend per brand
      const spendByBrand = {};
      (partnerships || []).forEach((p) => {
        if (!p.brand_id) return;
        spendByBrand[p.brand_id] = (spendByBrand[p.brand_id] || 0) + (p.deal_value || 0);
      });

      return (brands || []).map((b) => ({
        ...b,
        total_spend: spendByBrand[b.id] || 0,
      }));
    },
  });

  // ── fetch deal scores ─────────────────────────────────────────────────────
  const { data: dealScores = [] } = useQuery({
    queryKey: ["client-crm-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_scores")
        .select("*")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const scoreByBrand = useMemo(() => {
    const map = {};
    dealScores.forEach((s) => {
      if (s.brand_id) map[s.brand_id] = s;
    });
    return map;
  }, [dealScores]);

  // ── mutation: update pipeline stage ───────────────────────────────────────
  const updateStage = useMutation({
    mutationFn: async ({ id, stage }) => {
      const { data, error } = await supabase
        .from("brands")
        .update({ pipeline_stage: stage })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { stage }) => {
      qc.invalidateQueries({ queryKey: ["client-crm-brands"] });
      toast({ title: "Stage updated", description: `Pipeline stage moved to ${stage}` });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  // ── mutation: update satisfaction rating ──────────────────────────────────
  const updateRating = useMutation({
    mutationFn: async ({ id, rating }) => {
      const { data, error } = await supabase
        .from("brands")
        .update({ satisfaction_score: rating })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { rating }) => {
      qc.invalidateQueries({ queryKey: ["client-crm-brands"] });
      toast({ title: "Rating saved", description: `Satisfaction set to ${rating}/5 stars` });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  const handleCycleStage = (brand, nextStage) => {
    setUpdatingId(brand.id);
    updateStage.mutate({ id: brand.id, stage: nextStage });
  };

  const handleUpdateRating = (brand, rating) => {
    setUpdatingId(brand.id);
    updateRating.mutate({ id: brand.id, rating });
  };

  // ── filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return rawBrands.filter((b) => {
      const q = search.toLowerCase();
      const name = (b.brand_name || b.name || "").toLowerCase();
      const matchSearch = !q || name.includes(q) || (b.industry || "").toLowerCase().includes(q);
      const matchStage = filterStage === "all" || (b.pipeline_stage || "Prospect") === filterStage;
      return matchSearch && matchStage;
    });
  }, [rawBrands, search, filterStage]);

  // ── stage summary counts ──────────────────────────────────────────────────
  const stageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach((s) => (counts[s] = 0));
    rawBrands.forEach((b) => {
      const s = b.pipeline_stage || "Prospect";
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [rawBrands]);

  const totalSpend = useMemo(
    () => rawBrands.reduce((s, b) => s + (b.total_spend || 0), 0),
    [rawBrands]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Client & Brand CRM
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {rawBrands.length} clients · {fmtMoney(totalSpend)} total managed spend
          </p>
        </div>
      </div>

      {/* Pipeline funnel summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(filterStage === stage ? "all" : stage)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterStage === stage
                ? `${STAGE_STYLES[stage]} font-bold ring-2 ring-offset-1 ring-teal-400`
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-lg font-black text-slate-800">{stageCounts[stage]}</p>
            <p className="text-xs font-medium text-slate-500">{stage}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9 h-9 text-sm"
          placeholder="Search clients by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {brandsLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
          {rawBrands.length === 0
            ? "No clients found. Brand records will appear here once partnerships are created."
            : "No clients match the current filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((brand) => (
            <ClientCard
              key={brand.id}
              brand={brand}
              dealScore={scoreByBrand[brand.id]}
              onCycleStage={handleCycleStage}
              onUpdateRating={handleUpdateRating}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {rawBrands.length} clients
          {filterStage !== "all" && ` · filtered by ${filterStage}`}
        </p>
      )}
    </div>
  );
}

import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const PLATFORMS = ["instagram","tiktok","youtube","twitter","twitch","linkedin"];
const NICHES = ["tech","lifestyle","fitness","beauty","gaming","food","travel","fashion","finance","education","entertainment","sports","music","health","business"];
const TIERS = ["nano","micro","mid","macro","mega","celebrity"];
const TRAJECTORIES = [
  { key: "breakout",      label: "Breakout" },
  { key: "rising_star",   label: "Rising Star" },
  { key: "steady_growth", label: "Steady Growth" },
  { key: "plateau",       label: "Plateau" },
  { key: "declining",     label: "Declining" },
];

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
        active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}>
      {label}
    </button>
  );
}

function SliderRow({ label, value, min, max, step, fmt, onChange, inputType = "number" }) {
  const handleInputChange = (e) => {
    const num = e.target.value === "" ? 0 : parseFloat(e.target.value);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <span className="text-xs font-medium text-slate-600">{fmt(value)}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ""}
        onChange={handleInputChange}
        placeholder="Enter value..."
        className="mt-2 h-8 text-sm"
      />
    </div>
  );
}

export default function TalentFilters({ filters, onChange, onReset }) {
  const toggle = (key, val) =>
    onChange({ ...filters, [key]: filters[key] === val ? "all" : val });

  const activeCount = [
    filters.platform !== "all",
    filters.niche !== "all",
    filters.tier !== "all",
    filters.trajectory !== "all",
    filters.minFollowers > 0,
    filters.minEngagement > 0,
    filters.minBrandSafety > 0,
    filters.minAlpha > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl p-5 space-y-5 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Platform */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map(p => <Chip key={p} label={p.charAt(0).toUpperCase()+p.slice(1)} active={filters.platform===p} onClick={()=>toggle("platform",p)} />)}
        </div>
      </div>

      <Separator />

      {/* Tier */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tier</p>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map(t => <Chip key={t} label={t.charAt(0).toUpperCase()+t.slice(1)} active={filters.tier===t} onClick={()=>toggle("tier",t)} />)}
        </div>
      </div>

      <Separator />

      {/* Niche / Category */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {NICHES.map(n => <Chip key={n} label={n.charAt(0).toUpperCase()+n.slice(1)} active={filters.niche===n} onClick={()=>toggle("niche",n)} />)}
        </div>
      </div>

      <Separator />

      {/* Trajectory */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Trajectory</p>
        <div className="flex flex-wrap gap-1.5">
          {TRAJECTORIES.map(t => <Chip key={t.key} label={t.label} active={filters.trajectory===t.key} onClick={()=>toggle("trajectory",t.key)} />)}
        </div>
      </div>

      <Separator />

      {/* Followers */}
      <SliderRow
        label="Min Followers" value={filters.minFollowers || 0}
        min={0} max={5000000} step={50000}
        fmt={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v || "Any"}
        onChange={v => onChange({ ...filters, minFollowers: v })}
      />

      <Separator />

      {/* Engagement */}
      <SliderRow
        label="Min Engagement %" value={filters.minEngagement || 0}
        min={0} max={20} step={0.5}
        fmt={v => v ? `${v}%` : "Any"}
        onChange={v => onChange({ ...filters, minEngagement: v })}
      />

      <Separator />

      {/* Brand Safety */}
      <SliderRow
        label="Min Brand Safety Score" value={filters.minBrandSafety || 0}
        min={0} max={100} step={5}
        fmt={v => v ? `${v}+` : "Any"}
        onChange={v => onChange({ ...filters, minBrandSafety: v })}
      />

      <Separator />

      {/* Discovery Alpha */}
      <SliderRow
        label="Min Discovery Alpha" value={filters.minAlpha || 0}
        min={0} max={10} step={0.5}
        fmt={v => v ? `${v}x+` : "Any"}
        onChange={v => onChange({ ...filters, minAlpha: v })}
      />
    </div>
  );
}
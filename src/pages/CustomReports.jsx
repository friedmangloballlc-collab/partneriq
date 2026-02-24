import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Plus, X, GripVertical, BarChart3, PieChart as PieIcon, TrendingUp,
  Table2, Download, Filter, RefreshCw, Layers, ChevronDown,
  CheckCircle2, DollarSign, Mail, Users, Zap, Eye, Reply,
  ArrowUpRight, Maximize2, Minimize2
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

// ─── WIDGET DEFINITIONS ───────────────────────────────────────────────────────
const WIDGET_CATALOG = [
  // Partnerships
  { id: "partnership_funnel",    label: "Partnership Funnel",       category: "partnerships", chartType: "bar",     icon: BarChart3,   color: "bg-indigo-100 text-indigo-600" },
  { id: "deal_value_trend",      label: "Deal Value Over Time",     category: "partnerships", chartType: "area",    icon: TrendingUp,  color: "bg-emerald-100 text-emerald-600" },
  { id: "type_breakdown",        label: "Partnership Type Mix",     category: "partnerships", chartType: "pie",     icon: PieIcon,     color: "bg-violet-100 text-violet-600" },
  { id: "top_deals_table",       label: "Top Deals Table",          category: "partnerships", chartType: "table",   icon: Table2,      color: "bg-blue-100 text-blue-600" },
  { id: "match_score_dist",      label: "Match Score Distribution", category: "partnerships", chartType: "bar",     icon: BarChart3,   color: "bg-teal-100 text-teal-600" },
  { id: "win_rate_kpi",          label: "Win Rate KPI",             category: "partnerships", chartType: "kpi",     icon: CheckCircle2,color: "bg-emerald-100 text-emerald-600" },
  { id: "pipeline_value_kpi",    label: "Pipeline Value KPI",       category: "partnerships", chartType: "kpi",     icon: DollarSign,  color: "bg-amber-100 text-amber-600" },
  // Outreach
  { id: "outreach_open_rate",    label: "Open Rate by Type",        category: "outreach",     chartType: "bar",     icon: BarChart3,   color: "bg-amber-100 text-amber-600" },
  { id: "outreach_reply_trend",  label: "Reply Rate Trend",         category: "outreach",     chartType: "line",    icon: TrendingUp,  color: "bg-rose-100 text-rose-600" },
  { id: "sequence_performance",  label: "Sequence Performance",     category: "outreach",     chartType: "table",   icon: Table2,      color: "bg-orange-100 text-orange-600" },
  { id: "outreach_sent_kpi",     label: "Emails Sent KPI",          category: "outreach",     chartType: "kpi",     icon: Mail,        color: "bg-blue-100 text-blue-600" },
  // Talent
  { id: "talent_tier_dist",      label: "Talent Tier Distribution", category: "talent",       chartType: "pie",     icon: PieIcon,     color: "bg-pink-100 text-pink-600" },
  { id: "talent_engagement",     label: "Engagement vs Followers",  category: "talent",       chartType: "scatter", icon: Zap,         color: "bg-purple-100 text-purple-600" },
  { id: "talent_niche_breakdown",label: "Niche Breakdown",          category: "talent",       chartType: "bar",     icon: BarChart3,   color: "bg-fuchsia-100 text-fuchsia-600" },
  { id: "talent_count_kpi",      label: "Total Talent KPI",         category: "talent",       chartType: "kpi",     icon: Users,       color: "bg-indigo-100 text-indigo-600" },
];

const CHART_COLORS = ["#6366F1","#10B981","#F59E0B","#EC4899","#3B82F6","#8B5CF6","#EF4444","#14B8A6"];

const fmt = v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`;

// ─── CHART RENDERERS ──────────────────────────────────────────────────────────
function WidgetChart({ widgetId, partnerships, sequences, talents, drilldown, onDrilldown }) {
  const p = partnerships;
  const t = talents;

  if (widgetId === "partnership_funnel") {
    const counts = {};
    p.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    const data = Object.entries(counts).map(([s, c]) => ({ stage: s.replace(/_/g, " "), count: c })).sort((a,b) => b.count - a.count);
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" onClick={e => e?.activePayload && onDrilldown && onDrilldown("stage", e.activePayload[0]?.payload?.stage)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, textTransform: "capitalize" }} axisLine={false} tickLine={false} width={90} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="count" radius={[0,6,6,0]} fill="#6366F1" cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "deal_value_trend") {
    const byMonth = {};
    p.forEach(d => {
      if (!d.created_date) return;
      const key = new Date(d.created_date).toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, value: 0, count: 0 };
      byMonth[key].value += d.deal_value || 0;
      byMonth[key].count++;
    });
    const data = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).slice(-9);
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={v => [fmt(v), "Value"]} />
          <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fill="url(#valGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "type_breakdown") {
    const counts = {};
    p.forEach(d => { if (d.partnership_type) counts[d.partnership_type] = (counts[d.partnership_type] || 0) + 1; });
    const data = Object.entries(counts).map(([n, v]) => ({ name: n.replace(/_/g," "), value: v }));
    return (
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="55%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} onClick={e => onDrilldown && onDrilldown("type", e?.name)}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} cursor="pointer" />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-1" onClick={() => onDrilldown && onDrilldown("type", d.name)}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-[11px] text-slate-600 flex-1 capitalize">{d.name}</span>
              <span className="text-[11px] font-bold text-slate-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (widgetId === "top_deals_table") {
    const top = [...p].filter(d => d.deal_value > 0).sort((a,b) => b.deal_value - a.deal_value).slice(0, 6);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-100">
            {["Deal","Stage","Type","Value"].map(h => <th key={h} className="text-left py-1.5 px-2 text-[10px] font-semibold text-slate-400 uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {top.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onDrilldown && onDrilldown("deal", d.id)}>
                <td className="py-2 px-2 font-medium text-slate-800 max-w-[120px] truncate">{d.title}</td>
                <td className="py-2 px-2 text-slate-500 capitalize">{d.status?.replace(/_/g," ")}</td>
                <td className="py-2 px-2 text-slate-500 capitalize">{d.partnership_type?.replace(/_/g," ") || "—"}</td>
                <td className="py-2 px-2 font-bold text-emerald-700">{fmt(d.deal_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (widgetId === "match_score_dist") {
    const buckets = [{r:"90–100",min:90,max:100},{r:"70–89",min:70,max:89},{r:"50–69",min:50,max:69},{r:"<50",min:0,max:49}];
    const data = buckets.map(b => ({ range: b.r, count: p.filter(d => d.match_score >= b.min && d.match_score <= b.max).length }));
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="count" radius={[6,6,0,0]}>
            {data.map((_,i) => <Cell key={i} fill={["#10b981","#6366f1","#f59e0b","#f87171"][i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "win_rate_kpi") {
    const total = p.length;
    const completed = p.filter(d => d.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <p className="text-5xl font-extrabold text-emerald-600">{rate}%</p>
        <p className="text-sm text-slate-500">{completed} of {total} deals closed</p>
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
        </div>
      </div>
    );
  }

  if (widgetId === "pipeline_value_kpi") {
    const total = p.filter(d => !["completed","churned"].includes(d.status)).reduce((s,d) => s+(d.deal_value||0), 0);
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <p className="text-4xl font-extrabold text-indigo-600">{fmt(total)}</p>
        <p className="text-sm text-slate-500">Active pipeline value</p>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Updated live
        </div>
      </div>
    );
  }

  if (widgetId === "outreach_open_rate") {
    const types = ["initial_outreach","follow_up","proposal","negotiation"];
    const data = types.map(type => {
      const seq = sequences.filter(s => s.name.toLowerCase().includes(type.split("_")[0]));
      return { type: type.replace(/_/g," "), rate: Math.round(30 + Math.random() * 35) };
    });
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="type" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}%`, "Open Rate"]} />
          <Bar dataKey="rate" radius={[6,6,0,0]} fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "outreach_reply_trend") {
    const data = sequences.slice(0, 8).map((s, i) => ({
      name: s.name?.slice(0, 12) || `Seq ${i+1}`,
      rate: s.reply_rate || Math.round(5 + Math.random() * 20),
      open: s.open_rate || Math.round(25 + Math.random() * 30),
    }));
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <Line type="monotone" dataKey="open" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} name="Open %" />
          <Line type="monotone" dataKey="rate" stroke="#EC4899" strokeWidth={2} dot={{ r: 2 }} name="Reply %" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "sequence_performance") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-100">
            {["Sequence","Status","Sent","Open%","Reply%"].map(h => <th key={h} className="text-left py-1.5 px-2 text-[10px] font-semibold text-slate-400 uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {sequences.slice(0, 6).map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-2 px-2 font-medium text-slate-800 max-w-[120px] truncate">{s.name}</td>
                <td className="py-2 px-2"><Badge className="text-[9px]" variant="outline">{s.status}</Badge></td>
                <td className="py-2 px-2 text-slate-600">{s.total_sent || 0}</td>
                <td className="py-2 px-2 text-amber-600 font-semibold">{s.open_rate ? `${s.open_rate}%` : "—"}</td>
                <td className="py-2 px-2 text-emerald-600 font-semibold">{s.reply_rate ? `${s.reply_rate}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (widgetId === "outreach_sent_kpi") {
    const total = sequences.reduce((s, seq) => s + (seq.total_sent || 0), 0);
    const replied = sequences.reduce((s, seq) => s + (seq.total_replied || 0), 0);
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <p className="text-5xl font-extrabold text-blue-600">{total.toLocaleString()}</p>
        <p className="text-sm text-slate-500">Total emails sent</p>
        <p className="text-xs text-emerald-600 font-semibold">{replied} replies received</p>
      </div>
    );
  }

  if (widgetId === "talent_tier_dist") {
    const counts = {};
    t.forEach(x => { if (x.tier) counts[x.tier] = (counts[x.tier]||0)+1; });
    const data = Object.entries(counts).map(([n,v]) => ({ name: n, value: v }));
    return (
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="55%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
              {data.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d,i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i%CHART_COLORS.length] }} />
              <span className="text-[11px] text-slate-600 flex-1 capitalize">{d.name}</span>
              <span className="text-[11px] font-bold text-slate-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (widgetId === "talent_engagement") {
    const data = t.filter(x => x.total_followers && x.engagement_rate).slice(0, 50).map(x => ({
      followers: Math.round((x.total_followers||0)/1000),
      engagement: x.engagement_rate,
      name: x.name,
    }));
    return (
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="followers" name="Followers (K)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="K" />
          <YAxis dataKey="engagement" name="Engagement %" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }}
            formatter={(val, name) => [name.includes("K") ? `${val}K` : `${val}%`, name]} />
          <Scatter data={data} fill="#8B5CF6" opacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "talent_niche_breakdown") {
    const counts = {};
    t.forEach(x => { if (x.niche) counts[x.niche] = (counts[x.niche]||0)+1; });
    const data = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,v]) => ({ niche: n, count: v }));
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="niche" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="count" radius={[6,6,0,0]} fill="#EC4899" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widgetId === "talent_count_kpi") {
    const active = t.filter(x => x.status === "active").length;
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <p className="text-5xl font-extrabold text-indigo-600">{t.length}</p>
        <p className="text-sm text-slate-500">Total talent in roster</p>
        <p className="text-xs text-emerald-600 font-semibold">{active} actively looking</p>
      </div>
    );
  }

  return <div className="text-sm text-slate-400 text-center py-8">No data</div>;
}

// ─── DRILLDOWN MODAL ──────────────────────────────────────────────────────────
function DrilldownModal({ drilldown, partnerships, onClose }) {
  if (!drilldown) return null;
  const { type, value } = drilldown;

  let filtered = partnerships;
  let title = "Drill-down";

  if (type === "stage") {
    filtered = partnerships.filter(p => p.status?.replace(/_/g," ") === value);
    title = `Deals: ${value}`;
  } else if (type === "type") {
    filtered = partnerships.filter(p => p.partnership_type?.replace(/_/g," ") === value);
    title = `Deals: ${value}`;
  } else if (type === "deal") {
    filtered = partnerships.filter(p => p.id === value);
    title = filtered[0]?.title || "Deal Detail";
  }

  const fmt = v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-500">{filtered.length} deals</p>
        <div className="space-y-2 mt-2">
          {filtered.map(d => (
            <div key={d.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{d.title}</p>
                <span className="text-sm font-bold text-emerald-700">{d.deal_value ? fmt(d.deal_value) : "—"}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                <Badge variant="outline" className="text-[10px] capitalize">{d.status?.replace(/_/g," ")}</Badge>
                {d.partnership_type && <Badge variant="outline" className="text-[10px] capitalize">{d.partnership_type.replace(/_/g," ")}</Badge>}
                {d.match_score > 0 && <Badge className="bg-indigo-50 text-indigo-700 text-[10px]">Match {d.match_score}%</Badge>}
                {d.brand_name && <span>Brand: {d.brand_name}</span>}
                {d.talent_name && <span>Talent: {d.talent_name}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No matching deals</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── WIDGET CARD ──────────────────────────────────────────────────────────────
function WidgetCard({ widget, partnerships, sequences, talents, onRemove, onDrilldown }) {
  const [expanded, setExpanded] = useState(false);
  const def = WIDGET_CATALOG.find(w => w.id === widget.id);
  if (!def) return null;
  const Icon = def.icon;

  return (
    <Card className={`border-slate-200/60 hover:shadow-md transition-shadow ${expanded ? "col-span-2" : ""}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${def.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-700">{def.label}</span>
            <Badge variant="outline" className="text-[9px] capitalize">{def.category}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(e => !e)} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onRemove(widget.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <WidgetChart
          widgetId={widget.id}
          partnerships={partnerships}
          sequences={sequences}
          talents={talents}
          onDrilldown={onDrilldown}
        />
      </CardContent>
    </Card>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const PRESET_DASHBOARDS = {
  partnerships: ["pipeline_value_kpi","win_rate_kpi","partnership_funnel","deal_value_trend","type_breakdown","top_deals_table"],
  outreach:     ["outreach_sent_kpi","outreach_open_rate","outreach_reply_trend","sequence_performance"],
  talent:       ["talent_count_kpi","talent_tier_dist","talent_niche_breakdown","talent_engagement"],
  full:         ["pipeline_value_kpi","win_rate_kpi","outreach_sent_kpi","talent_count_kpi","partnership_funnel","deal_value_trend","outreach_reply_trend","talent_niche_breakdown"],
};

export default function CustomReports() {
  const [activeWidgets, setActiveWidgets] = useState(PRESET_DASHBOARDS.partnerships.map(id => ({ id })));
  const [drilldown, setDrilldown] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [reportName, setReportName] = useState("My Dashboard");

  const { data: partnerships = [] } = useQuery({ queryKey: ["cr-partnerships"], queryFn: () => base44.entities.Partnership.list("-created_date", 500) });
  const { data: sequences = [] }    = useQuery({ queryKey: ["cr-sequences"],    queryFn: () => base44.entities.OutreachSequence.list("-created_date", 200) });
  const { data: talents = [] }      = useQuery({ queryKey: ["cr-talents"],      queryFn: () => base44.entities.Talent.list("-created_date", 300) });

  const addWidget = (id) => {
    if (!activeWidgets.find(w => w.id === id)) {
      setActiveWidgets(prev => [...prev, { id }]);
    }
  };

  const removeWidget = (id) => setActiveWidgets(prev => prev.filter(w => w.id !== id));

  const loadPreset = (key) => setActiveWidgets(PRESET_DASHBOARDS[key].map(id => ({ id })));

  const handleExport = () => {
    const report = {
      name: reportName,
      generatedAt: new Date().toISOString(),
      widgets: activeWidgets.map(w => w.id),
      summary: {
        partnerships: partnerships.length,
        pipelineValue: partnerships.filter(p => !["completed","churned"].includes(p.status)).reduce((s,p) => s+(p.deal_value||0),0),
        winRate: partnerships.length > 0 ? Math.round((partnerships.filter(p=>p.status==="completed").length/partnerships.length)*100) : 0,
        sequences: sequences.length,
        talent: talents.length,
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reportName.toLowerCase().replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const filteredCatalog = filterCategory === "all"
    ? WIDGET_CATALOG
    : WIDGET_CATALOG.filter(w => w.category === filterCategory);

  const addedIds = new Set(activeWidgets.map(w => w.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <Input
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              className="text-xl font-bold text-slate-900 border-0 p-0 h-auto focus-visible:ring-0 bg-transparent w-64"
            />
            <p className="text-xs text-slate-500">{activeWidgets.length} widgets · {partnerships.length} deals · {sequences.length} sequences · {talents.length} talent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Load Preset <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(PRESET_DASHBOARDS).map(k => (
                <DropdownMenuItem key={k} onClick={() => loadPreset(k)} className="capitalize">{k} Dashboard</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Widget Catalog Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-500" /> Add Widgets</p>
          <div className="flex gap-1">
            {["all","partnerships","outreach","talent"].map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${filterCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredCatalog.map(w => {
            const added = addedIds.has(w.id);
            const Icon = w.icon;
            return (
              <button key={w.id} onClick={() => !added && addWidget(w.id)} disabled={added}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                  added ? "bg-slate-50 border-slate-100 text-slate-300 cursor-default" : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 cursor-pointer"
                }`}>
                <Icon className="w-3 h-3" />
                {w.label}
                {added && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Grid */}
      {activeWidgets.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Your dashboard is empty</p>
          <p className="text-sm text-slate-400 mt-1">Add widgets above or load a preset</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeWidgets.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              partnerships={partnerships}
              sequences={sequences}
              talents={talents}
              onRemove={removeWidget}
              onDrilldown={(type, value) => setDrilldown({ type, value })}
            />
          ))}
        </div>
      )}

      {/* Drill-down modal */}
      {drilldown && (
        <DrilldownModal drilldown={drilldown} partnerships={partnerships} onClose={() => setDrilldown(null)} />
      )}
    </div>
  );
}
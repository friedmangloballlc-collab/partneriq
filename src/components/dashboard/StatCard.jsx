import React from "react";
import { Card } from "@/components/ui/card";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = "indigo" }) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "ring-indigo-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
    rose: { bg: "bg-rose-50", icon: "text-rose-600", ring: "ring-rose-100" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", ring: "ring-violet-100" },
    sky: { bg: "bg-sky-50", icon: "text-sky-600", ring: "ring-sky-100" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <Card className="stat-glow p-5 bg-white border-slate-200/60 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
              <span>{trendUp ? "↑" : "↓"} {trend}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </Card>
  );
}
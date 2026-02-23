import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Target, DollarSign } from "lucide-react";

export default function KPICards({ selectedData }) {
  const parseValue = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return parseInt(val.toString().replace(/\D/g, "")) || 0;
  };

  const totalPopulation = selectedData.reduce((sum, d) => {
    return sum + parseValue(d.population_size);
  }, 0);

  const avgBuyingPower = (
    selectedData.reduce((sum, d) => {
      return sum + parseValue(d.buying_power);
    }, 0) / Math.max(selectedData.length, 1)
  ).toFixed(0);

  const kpis = [
    {
      label: "Total Population",
      value: totalPopulation.toLocaleString(),
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Avg Buying Power",
      value: `$${avgBuyingPower}M`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Segments",
      value: selectedData.length,
      icon: Target,
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      label: "Opportunities",
      value: selectedData.filter(d => d.key_cultural_moments).length,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                </div>
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
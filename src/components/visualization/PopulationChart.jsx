import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#A78BFA",
  "#C4B5FD",
  "#DDD6FE",
  "#E9D5FF",
  "#F3E8FF",
  "#F5F3FF",
];

export default function PopulationChart({ selectedData }) {
  const parseValue = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return parseInt(val.toString().replace(/\D/g, "")) || 0;
  };

  const chartData = selectedData
    .map((d) => ({
      name: d.name,
      population: parseValue(d.population_size),
      id: d.id,
    }))
    .sort((a, b) => b.population - a.population);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Population Distribution</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Population size across selected demographic segments
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="population" fill="#6366F1" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
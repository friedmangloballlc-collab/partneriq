import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

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

export default function BuyingPowerChart({ selectedData }) {
  const parseValue = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return parseInt(val.toString().replace(/\D/g, "")) || 0;
  };

  const chartData = selectedData
    .map((d) => ({
      name: d.name,
      value: parseValue(d.buying_power),
      id: d.id,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buying Power Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-slate-400">
          No buying power data available
        </CardContent>
      </Card>
    );
  }

  const totalBuyingPower = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buying Power Distribution</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Economic impact across segments (Total: ${totalBuyingPower}M)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${((value / totalBuyingPower) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${value}M`}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
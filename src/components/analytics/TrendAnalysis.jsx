import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";

export default function TrendAnalysis({ partnerships = [] }) {
  const [timeframe, setTimeframe] = useState("30d");

  // Generate trend data (30, 90, 365 days)
  const getTrendData = () => {
    const days = timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365;
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 15))) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const matching = partnerships.filter(p => {
        const pDate = new Date(p.created_date);
        return pDate <= date;
      });

      const active = matching.filter(p => ["active", "negotiating", "contracted"].includes(p.status));
      const completed = matching.filter(p => p.status === "completed");

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        active: active.length,
        completed: completed.length,
        totalValue: matching.reduce((s, p) => s + (p.deal_value || 0), 0),
      });
    }
    return data;
  };

  const trendData = getTrendData();
  const currentActive = partnerships.filter(p => ["active", "negotiating", "contracted"].includes(p.status)).length;
  const prevActive = trendData.length > 1 ? trendData[trendData.length - 2]?.active || 0 : currentActive;
  const trendDir = currentActive >= prevActive ? "up" : "down";
  const trendPct = prevActive ? Math.abs(((currentActive - prevActive) / prevActive) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Partnership Trends</CardTitle>
          <div className="flex gap-2">
            {["30d", "90d", "365d"].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeframe === tf 
                    ? "bg-indigo-600 text-white" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick stats */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">{currentActive}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Active Partnerships</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${trendDir === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              <TrendingUp className="w-4 h-4" style={{transform: trendDir === "down" ? "scaleY(-1)" : ""}} />
              <span className="text-sm font-semibold">{trendDir === "up" ? "+" : "-"}{trendPct}%</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                  formatter={(value) => value}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="active" stroke="#6366F1" dot={false} strokeWidth={2.5} name="Active" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" dot={false} strokeWidth={2.5} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold mb-1">Peak Activity</p>
              <p className="text-lg font-bold text-blue-900">
                {Math.max(...trendData.map(d => d.active + d.completed), 1)} partnerships
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 font-semibold mb-1">Avg Pipeline Value</p>
              <p className="text-lg font-bold text-purple-900">
                ${trendData.length ? Math.round(trendData.reduce((s, d) => s + d.totalValue, 0) / trendData.length / 1000) : 0}K
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
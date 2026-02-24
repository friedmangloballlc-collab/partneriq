import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, MessageSquare, TrendingUp, Award } from "lucide-react";

function StatBox({ label, value, sub, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SequenceAnalyticsPanel({ sequences }) {
  const active = sequences.filter(s => s.status === "active");
  const totalSent = sequences.reduce((s, seq) => s + (seq.total_sent || 0), 0);
  const totalOpened = sequences.reduce((s, seq) => s + (seq.total_opened || 0), 0);
  const totalReplied = sequences.reduce((s, seq) => s + (seq.total_replied || 0), 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const avgReplyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  const chartData = sequences
    .filter(s => s.total_sent > 0)
    .slice(0, 6)
    .map(s => ({
      name: s.name.length > 16 ? s.name.slice(0, 16) + "…" : s.name,
      open_rate: s.total_sent > 0 ? Math.round(((s.total_opened || 0) / s.total_sent) * 100) : s.open_rate || 0,
      reply_rate: s.total_sent > 0 ? Math.round(((s.total_replied || 0) / s.total_sent) * 100) : s.reply_rate || 0,
    }));

  if (sequences.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-500" />
        <h2 className="text-sm font-semibold text-slate-700">Analytics Overview</h2>
        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">{active.length} active</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Emails Sent" value={totalSent} color="bg-slate-50 border border-slate-200" />
        <StatBox label="Avg Open Rate" value={`${avgOpenRate}%`} sub="Industry avg: 21%" color="bg-indigo-50 border border-indigo-100" />
        <StatBox label="Avg Reply Rate" value={`${avgReplyRate}%`} sub="Industry avg: 8%" color="bg-emerald-50 border border-emerald-100" />
        <StatBox label="Sequences" value={sequences.length} sub={`${active.length} running`} color="bg-purple-50 border border-purple-100" />
      </div>

      {chartData.length > 0 && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-600">Open & Reply Rate by Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} formatter={v => [`${v}%`]} />
                <Bar dataKey="open_rate" name="Open Rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reply_rate" name="Reply Rate" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
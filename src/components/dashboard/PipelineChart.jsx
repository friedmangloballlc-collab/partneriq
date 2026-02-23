import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const stageColors = {
  discovered: "#94A3B8",
  researching: "#60A5FA",
  outreach_pending: "#818CF8",
  outreach_sent: "#A78BFA",
  responded: "#F59E0B",
  negotiating: "#F97316",
  contracted: "#10B981",
  active: "#059669",
  completed: "#047857",
  churned: "#EF4444",
};

const stageLabels = {
  discovered: "Discovered",
  researching: "Research",
  outreach_pending: "Pending",
  outreach_sent: "Sent",
  responded: "Responded",
  negotiating: "Negotiating",
  contracted: "Contracted",
  active: "Active",
  completed: "Completed",
  churned: "Churned",
};

export default function PipelineChart({ partnerships }) {
  const stageCounts = {};
  Object.keys(stageLabels).forEach(s => { stageCounts[s] = 0; });
  partnerships.forEach(p => {
    if (stageCounts[p.status] !== undefined) stageCounts[p.status]++;
  });

  const data = Object.entries(stageCounts)
    .filter(([_, count]) => count > 0 || ["discovered", "outreach_sent", "negotiating", "active"].includes(_))
    .map(([stage, count]) => ({
      name: stageLabels[stage],
      value: count,
      color: stageColors[stage],
    }));

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Partnership Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                cursor={{ fill: "#F8FAFC" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
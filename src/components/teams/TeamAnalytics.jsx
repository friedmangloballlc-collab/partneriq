import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TeamAnalytics({ teamId, members }) {
  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 200),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  // Per-member deal assignment stats
  const memberEmails = members.map(m => m.member_email);
  const memberStats = members.map(member => {
    const assignedDeals = partnerships.filter(p => p.assigned_to === member.member_email).length;
    const assignedTasks = tasks.filter(t => t.assigned_to_email === member.member_email).length;
    const completedTasks = tasks.filter(t => t.assigned_to_email === member.member_email && t.status === "done").length;
    return {
      name: member.member_name?.split(" ")[0] || member.member_email?.split("@")[0] || "User",
      deals: assignedDeals,
      tasks: assignedTasks,
      done: completedTasks,
    };
  });

  const totalDeals = partnerships.length;
  const totalAssigned = partnerships.filter(p => memberEmails.includes(p.assigned_to)).length;
  const totalTasks = tasks.filter(t => memberEmails.includes(t.assigned_to_email)).length;
  const doneTasks = tasks.filter(t => memberEmails.includes(t.assigned_to_email) && t.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Team Deals", value: totalAssigned },
          { label: "Open Tasks", value: totalTasks - doneTasks },
          { label: "Tasks Done", value: doneTasks },
        ].map((s, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {memberStats.length > 0 && (
        <>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Deals per Member</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberStats} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="deals" name="Deals" fill="#6366F1" radius={[5, 5, 0, 0]} barSize={28} />
                  <Bar dataKey="done" name="Tasks Done" fill="#10B981" radius={[5, 5, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
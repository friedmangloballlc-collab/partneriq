import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckSquare, Handshake, Mail, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const actionIcons = {
  partnership_created: { icon: Handshake, color: "bg-indigo-100 text-indigo-600" },
  partnership_updated: { icon: Handshake, color: "bg-blue-100 text-blue-600" },
  outreach_sent: { icon: Mail, color: "bg-sky-100 text-sky-600" },
  outreach_replied: { icon: Mail, color: "bg-emerald-100 text-emerald-600" },
  approval_approved: { icon: CheckSquare, color: "bg-green-100 text-green-600" },
  approval_rejected: { icon: CheckSquare, color: "bg-red-100 text-red-600" },
  match_generated: { icon: Sparkles, color: "bg-purple-100 text-purple-600" },
  deal_closed: { icon: Handshake, color: "bg-amber-100 text-amber-600" },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const { data: activities = [] } = useQuery({
    queryKey: ["activities-notif"],
    queryFn: () => base44.entities.Activity.list("-created_date", 20),
    refetchInterval: 30000,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["approvals-pending-notif"],
    queryFn: () => base44.entities.ApprovalItem.filter({ status: "pending" }),
    refetchInterval: 30000,
  });

  const notifications = [
    ...approvals.map(a => ({
      id: `approval-${a.id}`,
      type: "approval",
      title: "Approval Required",
      description: a.title,
      time: a.created_date,
      icon: CheckSquare,
      color: "bg-amber-100 text-amber-600",
    })),
    ...activities.map(a => {
      const cfg = actionIcons[a.action] || { icon: Bell, color: "bg-slate-100 text-slate-500" };
      return {
        id: `activity-${a.id}`,
        type: "activity",
        title: a.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        description: a.description,
        time: a.created_date,
        icon: cfg.icon,
        color: cfg.color,
      };
    }),
  ]
    .filter(n => !dismissed.has(n.id))
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 15);

  const unread = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={() => setDismissed(new Set(notifications.map(n => n.id)))}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.description}</p>
                        {n.time && (
                          <p className="text-[10px] text-slate-300 mt-1">
                            {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all self-start mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
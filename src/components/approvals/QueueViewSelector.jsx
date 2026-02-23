import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, XCircle, Calendar, ArrowUp } from "lucide-react";

const QUEUE_VIEWS = [
  {
    id: "priority_p1",
    label: "Priority Queue (P1)",
    description: "Critical items - 4 hour SLA",
    icon: AlertTriangle,
    filter: { priority: "p1_critical" },
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "priority_p2",
    label: "High Priority (P2)",
    description: "High value - 24 hour SLA",
    icon: AlertTriangle,
    filter: { priority: "p2_high" },
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "standard",
    label: "Standard Queue (P3)",
    description: "Regular items - 48 hour SLA",
    icon: Clock,
    filter: { priority: "p3_standard" },
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "low",
    label: "Low Priority (P4)",
    description: "Low urgency - 72 hour SLA",
    icon: Clock,
    filter: { priority: "p4_low" },
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  {
    id: "revisions",
    label: "Revision Queue",
    description: "Items needing changes",
    icon: ArrowUp,
    filter: { status: "revision_requested" },
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "scheduled",
    label: "Scheduled Queue",
    description: "Pending send time",
    icon: Calendar,
    filter: { status: "scheduled" },
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    id: "approved",
    label: "Sent Archive",
    description: "Recently sent items",
    icon: CheckCircle2,
    filter: { status: "sent" },
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function QueueViewSelector({ selectedView, onSelectView, itemCounts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {QUEUE_VIEWS.map((view) => {
        const Icon = view.icon;
        const count = itemCounts[view.id] || 0;
        const isSelected = selectedView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onSelectView(view.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? `${view.bg} border-current`
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${view.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${view.color}`}>{view.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{view.description}</p>
              </div>
              {count > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] flex-shrink-0 ml-2">
                  {count > 99 ? "99+" : count}
                </Badge>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
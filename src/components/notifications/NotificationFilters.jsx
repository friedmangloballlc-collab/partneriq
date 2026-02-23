import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

const PRIORITY_FILTERS = [
  { value: "p0_crisis", label: "🚨 Crisis", color: "bg-red-100 text-red-700" },
  { value: "p1_immediate", label: "⚡ Immediate", color: "bg-orange-100 text-orange-700" },
  { value: "p2_same_day", label: "📌 Same Day", color: "bg-amber-100 text-amber-700" },
  { value: "p3_next_day", label: "📅 Next Day", color: "bg-blue-100 text-blue-700" },
  { value: "p4_weekly", label: "📊 Weekly", color: "bg-slate-100 text-slate-700" },
];

const STATUS_FILTERS = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "acknowledged", label: "Acknowledged" },
];

export default function NotificationFilters({
  selectedPriorities,
  selectedStatuses,
  onPriorityChange,
  onStatusChange,
  onClearAll
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Priority</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_FILTERS.map(p => (
            <Button
              key={p.value}
              variant={selectedPriorities.includes(p.value) ? "default" : "outline"}
              size="sm"
              className={`text-[11px] h-7 ${
                selectedPriorities.includes(p.value)
                  ? p.color
                  : "border-slate-200"
              }`}
              onClick={() => onPriorityChange(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <Button
              key={s.value}
              variant={selectedStatuses.includes(s.value) ? "default" : "outline"}
              size="sm"
              className="text-[11px] h-7"
              onClick={() => onStatusChange(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {(selectedPriorities.length > 0 || selectedStatuses.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] text-slate-500 hover:text-slate-700 gap-1"
          onClick={onClearAll}
        >
          <X className="w-3 h-3" /> Clear Filters
        </Button>
      )}
    </div>
  );
}
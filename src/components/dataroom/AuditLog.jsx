import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Edit, Trash2, Plus, Download, AlertCircle } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_CONFIG = {
  data_room_viewed: {
    label: "Viewed",
    icon: Eye,
    className: "bg-blue-100 text-blue-700",
  },
  data_room_entry_created: {
    label: "Entry Created",
    icon: Plus,
    className: "bg-emerald-100 text-emerald-700",
  },
  data_room_entry_updated: {
    label: "Entry Updated",
    icon: Edit,
    className: "bg-amber-100 text-amber-700",
  },
  data_room_entry_deleted: {
    label: "Entry Deleted",
    icon: Trash2,
    className: "bg-rose-100 text-rose-700",
  },
  data_room_exported: {
    label: "Exported",
    icon: Download,
    className: "bg-violet-100 text-violet-700",
  },
  campaign_created: {
    label: "Campaign Created",
    icon: Plus,
    className: "bg-emerald-100 text-emerald-700",
  },
  campaign_updated: {
    label: "Campaign Updated",
    icon: Edit,
    className: "bg-amber-100 text-amber-700",
  },
  campaign_deleted: {
    label: "Campaign Deleted",
    icon: Trash2,
    className: "bg-rose-100 text-rose-700",
  },
};

function ActionBadge({ action }) {
  const config = ACTION_CONFIG[action] || {
    label: action?.replace(/_/g, " ") || "Action",
    icon: Shield,
    className: "bg-slate-100 text-slate-600",
  };
  const Icon = config.icon;
  return (
    <Badge className={`text-xs gap-1 font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AuditLog() {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["audit-log-data-room"],
    queryFn: async () => {
      // Query activities filtered by resource_type containing 'data_room' or 'campaign'
      const { data, error: err } = await supabase
        .from("activities")
        .select("*")
        .or("resource_type.ilike.%data_room%,resource_type.ilike.%campaign%")
        .order("created_at", { ascending: false })
        .limit(200);
      if (err) throw err;
      return data || [];
    },
  });

  // Separate "who viewed" from other actions
  const viewEvents = activities.filter((a) => a.action === "data_room_viewed");
  const otherEvents = activities.filter((a) => a.action !== "data_room_viewed");

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">Loading audit log...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 rounded-lg px-4 py-3 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        Failed to load audit log: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Who Viewed section */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-500" />
            Who Viewed This Data Room
            {viewEvents.length > 0 && (
              <Badge className="bg-violet-100 text-violet-700 text-xs ml-auto">
                {viewEvents.length} view{viewEvents.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No views recorded yet. Views are logged when users open the data room.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Viewer", "Email", "Timestamp", "Details"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewEvents.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {a.actor_name || a.metadata?.actor_name || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">
                        {a.actor_email || a.metadata?.actor_email || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">
                        {a.details || "Page load"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full activity log */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-500" />
            Full Activity Log
            {activities.length > 0 && (
              <Badge className="bg-slate-100 text-slate-600 text-xs ml-auto">
                {activities.length} event{activities.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No activity logged yet for this data room.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Timestamp", "User", "Action", "Resource", "Details"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {a.actor_name || a.metadata?.actor_name || "Unknown"}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {a.actor_email || a.metadata?.actor_email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <ActionBadge action={a.action} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">
                        {a.resource_type || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs max-w-xs truncate">
                        {a.details || a.metadata?.details || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

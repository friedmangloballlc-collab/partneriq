import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Handshake, Mail, CheckCircle2, XCircle, UserPlus, Building2, Sparkles, Star
} from "lucide-react";

const actionIcons = {
  partnership_created: { icon: Handshake, color: "text-indigo-500 bg-indigo-50" },
  partnership_updated: { icon: Handshake, color: "text-blue-500 bg-blue-50" },
  outreach_sent: { icon: Mail, color: "text-sky-500 bg-sky-50" },
  outreach_opened: { icon: Mail, color: "text-emerald-500 bg-emerald-50" },
  outreach_replied: { icon: Mail, color: "text-green-600 bg-green-50" },
  approval_approved: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
  approval_rejected: { icon: XCircle, color: "text-rose-500 bg-rose-50" },
  talent_added: { icon: UserPlus, color: "text-violet-500 bg-violet-50" },
  brand_added: { icon: Building2, color: "text-amber-500 bg-amber-50" },
  match_generated: { icon: Sparkles, color: "text-purple-500 bg-purple-50" },
  deal_closed: { icon: Star, color: "text-yellow-500 bg-yellow-50" },
  note_added: { icon: Mail, color: "text-slate-500 bg-slate-50" },
};

export default function ActivityFeed({ activities, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 8).map((activity, i) => {
              const config = actionIcons[activity.action] || actionIcons.note_added;
              const Icon = config.icon;
              return (
                <div key={activity.id || i} className="flex gap-3 group">
                  <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {activity.created_date ? format(new Date(activity.created_date), "MMM d, h:mm a") : ""}
                      </span>
                      {activity.actor_name && (
                        <span className="text-[11px] text-slate-400">by {activity.actor_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
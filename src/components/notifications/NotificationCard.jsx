import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Bell, TrendingUp, Users, Zap, Share2,
  Clock, CheckCircle2, Eye, Archive, X
} from "lucide-react";

const TRIGGER_ICONS = {
  award_win: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  viral_moment: { icon: TrendingUp, color: "text-pink-500", bg: "bg-pink-50" },
  competitor_deal_expiring: { icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
  trajectory_inflection: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  rep_change: { icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  new_platform_launch: { icon: Share2, color: "text-indigo-500", bg: "bg-indigo-50" },
  scandal_crisis: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  major_announcement: { icon: Bell, color: "text-slate-500", bg: "bg-slate-50" },
};

const PRIORITY_CONFIG = {
  p0_crisis: { label: "🚨 CRISIS", color: "bg-red-100 text-red-700 border-red-300" },
  p1_immediate: { label: "⚡ IMMEDIATE", color: "bg-orange-100 text-orange-700 border-orange-300" },
  p2_same_day: { label: "📌 SAME DAY", color: "bg-amber-100 text-amber-700 border-amber-300" },
  p3_next_day: { label: "📅 NEXT DAY", color: "bg-blue-100 text-blue-700 border-blue-300" },
  p4_weekly: { label: "📊 WEEKLY", color: "bg-slate-100 text-slate-700 border-slate-300" },
};

export default function NotificationCard({
  notification,
  onRead,
  onArchive,
  onNavigate
}) {
  const triggerConfig = TRIGGER_ICONS[notification.trigger_event] || TRIGGER_ICONS.major_announcement;
  const priorityConfig = PRIORITY_CONFIG[notification.priority];
  const TriggerIcon = triggerConfig.icon;

  const actions = notification.automated_actions
    ? (() => { try { return JSON.parse(notification.automated_actions); } catch { return []; } })()
    : [];

  return (
    <div
      className={`p-4 rounded-xl border-l-4 transition-all ${
        notification.status === "unread"
          ? "bg-white border-l-indigo-500 shadow-md"
          : "bg-slate-50 border-l-slate-300"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${triggerConfig.bg}`}>
          <TriggerIcon className={`w-5 h-5 ${triggerConfig.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{notification.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{notification.reference_name}</p>
            </div>
            <Badge className={`flex-shrink-0 text-[10px] font-bold border ${priorityConfig.color}`}>
              {priorityConfig.label}
            </Badge>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-3">{notification.description}</p>

          {/* Detection & Response */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-100 rounded p-2">
              <p className="text-slate-500 font-medium">Detection</p>
              <p className="text-slate-700">{notification.detection_method}</p>
            </div>
            <div className="bg-slate-100 rounded p-2">
              <p className="text-slate-500 font-medium">Response Window</p>
              <p className="text-slate-700">{notification.response_window}</p>
            </div>
          </div>

          {/* Automated Actions */}
          {actions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-1.5">Automated Actions:</p>
              <div className="flex flex-wrap gap-1.5">
                {actions.map((action, i) => (
                  <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">
                    ✓ {action}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          <p className="text-[11px] text-slate-500 mb-3">
            <span className="font-medium">Channels:</span> {notification.channels}
          </p>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {notification.status === "unread" && (
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 gap-1"
                onClick={() => onRead(notification.id)}
              >
                <Eye className="w-3 h-3" /> Mark Read
              </Button>
            )}
            {notification.action_url && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-[11px] h-7 gap-1"
                onClick={() => onNavigate(notification.action_url)}
              >
                <CheckCircle2 className="w-3 h-3" /> View Details
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-[11px] h-7 gap-1 text-slate-500 hover:text-slate-700"
              onClick={() => onArchive(notification.id)}
            >
              <Archive className="w-3 h-3" /> Archive
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => onArchive(notification.id)}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
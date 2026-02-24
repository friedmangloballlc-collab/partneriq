import React from "react";
import { Mail, Eye, MessageSquare, MousePointer, TrendingUp } from "lucide-react";

function MetricPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-800">{value}</p>
        <p className="text-[10px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function SequenceMetricsBar({ seq }) {
  const sent = seq.total_sent || 0;
  const opened = seq.total_opened || 0;
  const replied = seq.total_replied || 0;
  const openRate = sent > 0 ? Math.round((opened / sent) * 100) : (seq.open_rate || 0);
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : (seq.reply_rate || 0);

  if (sent === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <MetricPill icon={Mail} label="Sent" value={sent} color="bg-slate-100 text-slate-500" />
      <MetricPill icon={Eye} label="Open Rate" value={`${openRate}%`} color="bg-indigo-50 text-indigo-500" />
      <MetricPill icon={MessageSquare} label="Reply Rate" value={`${replyRate}%`} color="bg-emerald-50 text-emerald-500" />
      <MetricPill icon={MousePointer} label="Clicked" value={seq.total_clicked || 0} color="bg-amber-50 text-amber-500" />
    </div>
  );
}
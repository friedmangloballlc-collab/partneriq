import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Handshake, Mail, Sparkles } from "lucide-react";

const statusColors = {
  active: "bg-emerald-50 text-emerald-700",
  negotiating: "bg-amber-50 text-amber-700",
  responded: "bg-sky-50 text-sky-700",
  outreach_sent: "bg-indigo-50 text-indigo-700",
  contracted: "bg-purple-50 text-purple-700",
};

export default function BrandDashboardPanel({ partnerships, sequences, approvals }) {
  const activePipeline = partnerships.filter(p =>
    ["outreach_pending", "outreach_sent", "responded", "negotiating", "contracted", "active"].includes(p.status)
  ).slice(0, 5);

  const recentSequences = (sequences || []).slice(0, 3);

  const totalSent = sequences?.reduce((s, seq) => s + (seq.total_sent || 0), 0) || 0;
  const totalOpened = sequences?.reduce((s, seq) => s + (seq.total_opened || 0), 0) || 0;
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Partnership Pipeline */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Handshake className="w-4 h-4 text-indigo-500" />
              Partnership Pipeline
            </CardTitle>
            <Link to={createPageUrl("Partnerships")} className="text-xs text-indigo-600 font-medium hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activePipeline.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No active partnerships yet</p>
              <Link to={createPageUrl("TalentDiscovery")} className="mt-2 inline-block text-xs text-indigo-600 hover:underline">
                Discover talent →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activePipeline.map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{deal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{deal.talent_name || "Talent"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {deal.match_score && (
                      <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700">
                        {deal.match_score}%
                      </Badge>
                    )}
                    <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[deal.status] || "bg-slate-50 text-slate-600"}`}>
                      {deal.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outreach Sequence Performance */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-500" />
              Outreach Performance
            </CardTitle>
            <Link to={createPageUrl("SequenceBuilder")} className="text-xs text-indigo-600 font-medium hover:underline">
              Manage
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-violet-50">
              <p className="text-xl font-bold text-violet-700">{totalSent}</p>
              <p className="text-[10px] text-violet-500 mt-0.5 font-medium uppercase tracking-wide">Sent</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-sky-50">
              <p className="text-xl font-bold text-sky-700">{avgOpenRate}%</p>
              <p className="text-[10px] text-sky-500 mt-0.5 font-medium uppercase tracking-wide">Open Rate</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50">
              <p className="text-xl font-bold text-amber-700">{approvals?.length || 0}</p>
              <p className="text-[10px] text-amber-500 mt-0.5 font-medium uppercase tracking-wide">Pending</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Sequences</p>
            {recentSequences.length === 0 ? (
              <p className="text-sm text-slate-400">No sequences created yet</p>
            ) : (
              <div className="space-y-2">
                {recentSequences.map(seq => (
                  <div key={seq.id} className="flex items-center justify-between">
                    <p className="text-sm text-slate-700 truncate max-w-[180px]">{seq.name}</p>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${seq.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
                      {seq.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link to={createPageUrl("SequenceBuilder")} className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
              View sequences <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
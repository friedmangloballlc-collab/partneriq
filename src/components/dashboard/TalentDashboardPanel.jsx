import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Star, TrendingUp, Target } from "lucide-react";

export default function TalentDashboardPanel({ partnerships, opportunities, user }) {
  const myDeals = partnerships.filter(p =>
    ["active", "contracted", "negotiating", "responded"].includes(p.status)
  );

  const wonDeals = partnerships.filter(p => p.status === "completed");
  const avgMatchScore = partnerships.length
    ? Math.round(partnerships.reduce((s, p) => s + (p.match_score || 0), 0) / partnerships.length)
    : 0;

  const recentOpportunities = (opportunities || []).slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Deals */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              My Active Deals
            </CardTitle>
            <Link to={createPageUrl("Partnerships")} className="text-xs text-indigo-600 font-medium hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {myDeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No active deals yet</p>
              <Link to={createPageUrl("Marketplace")} className="mt-2 inline-block text-xs text-indigo-600 hover:underline">
                Browse opportunities →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myDeals.slice(0, 5).map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{deal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{deal.brand_name || "Brand"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {deal.deal_value && (
                      <span className="text-xs font-semibold text-emerald-600">${(deal.deal_value / 1000).toFixed(0)}K</span>
                    )}
                    <Badge variant="secondary" className="text-[10px] capitalize bg-indigo-50 text-indigo-700">
                      {deal.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Strength + Stats */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            My Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-indigo-50">
              <p className="text-xl font-bold text-indigo-700">{avgMatchScore}%</p>
              <p className="text-[10px] text-indigo-500 mt-0.5 font-medium uppercase tracking-wide">Avg Match</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <p className="text-xl font-bold text-emerald-700">{wonDeals.length}</p>
              <p className="text-[10px] text-emerald-500 mt-0.5 font-medium uppercase tracking-wide">Completed</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-violet-50">
              <p className="text-xl font-bold text-violet-700">{myDeals.length}</p>
              <p className="text-[10px] text-violet-500 mt-0.5 font-medium uppercase tracking-wide">In Progress</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">New Opportunities</p>
            {recentOpportunities.length === 0 ? (
              <p className="text-sm text-slate-400">No open opportunities right now</p>
            ) : (
              <div className="space-y-2">
                {recentOpportunities.map(opp => (
                  <div key={opp.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-slate-700 truncate max-w-[180px]">{opp.title}</p>
                    </div>
                    {opp.budget_max && (
                      <span className="text-xs text-slate-500">${(opp.budget_max / 1000).toFixed(0)}K</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Link to={createPageUrl("Marketplace")} className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
              Browse marketplace <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
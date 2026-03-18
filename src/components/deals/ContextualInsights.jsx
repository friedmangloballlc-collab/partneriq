/**
 * ContextualInsights
 *
 * A reusable sidebar widget that shows contextual intelligence for any deal.
 * Given a niche, platform, and tier it automatically fetches and displays:
 *   - Relevant upcoming culture events for the deal's niche
 *   - Rate benchmarks for the talent's platform + tier
 *   - Demographic insights for the likely audience
 *   - Industry guide activation strategies
 *
 * Usage (on any Deal Detail page):
 *   <ContextualInsights niche="beauty" platform="instagram" tier="macro" />
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getRelevantEvents,
  getRateBenchmarks,
  getDemographicInsights,
  getIndustryGuide,
} from "@/lib/dealFlowConnectors";
import {
  Calendar, DollarSign, Users, Lightbulb, TrendingUp, Clock,
  MapPin, ChevronRight, Loader2, AlertCircle
} from "lucide-react";

// ── Small internal sub-components ────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color = "text-slate-600" }) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${color}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <p className="text-xs text-slate-400 italic py-2 text-center">{message}</p>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
      <span className="text-xs text-slate-400">Loading...</span>
    </div>
  );
}

// ── Culture Events section ────────────────────────────────────────────────────

function CultureEventsSection({ niche }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["contextual-events", niche],
    queryFn: () => getRelevantEvents(supabase, niche, 4),
    enabled: Boolean(niche),
    staleTime: 5 * 60 * 1000,
  });

  const tierColors = {
    "1": "bg-red-100 text-red-700 border-red-200",
    "2": "bg-amber-100 text-amber-700 border-amber-200",
    "3": "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div>
      <SectionHeader icon={Calendar} title="Upcoming Culture Events" color="text-indigo-600" />
      {isLoading ? (
        <LoadingRow />
      ) : events.length === 0 ? (
        <EmptyState message={`No events found for "${niche}" niche`} />
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <div
              key={event.id}
              className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 flex-1">
                  {event.event_name}
                </p>
                {event.tier && (
                  <Badge className={`text-[10px] flex-shrink-0 ${tierColors[event.tier] || "bg-slate-100 text-slate-600"}`}>
                    T{event.tier}
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                {event.dates && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" /> {event.dates}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </span>
                )}
              </div>
              {event.planning_lead_time && (
                <p className="mt-1 text-[10px] text-indigo-600 font-medium">
                  Lead time: {event.planning_lead_time}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Rate Benchmarks section ───────────────────────────────────────────────────

function RateBenchmarksSection({ platform, tier }) {
  const { data: benchmark, isLoading } = useQuery({
    queryKey: ["contextual-rate-benchmark", platform, tier],
    queryFn: () => getRateBenchmarks(supabase, platform, tier),
    enabled: Boolean(platform && tier),
    staleTime: 10 * 60 * 1000,
  });

  const fields = benchmark
    ? Object.entries(benchmark).filter(([k, v]) =>
        v && !["id", "platform", "tier", "created_at", "updated_at"].includes(k)
      )
    : [];

  return (
    <div>
      <SectionHeader icon={DollarSign} title="Rate Benchmarks" color="text-emerald-600" />
      {isLoading ? (
        <LoadingRow />
      ) : !benchmark ? (
        <EmptyState message={`No benchmarks for ${platform || "—"} / ${tier || "—"}`} />
      ) : (
        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] capitalize text-emerald-700 border-emerald-200">
              {platform}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize text-emerald-700 border-emerald-200">
              {tier}
            </Badge>
          </div>
          {fields.slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex justify-between items-start gap-2">
              <span className="text-[10px] text-slate-500 capitalize flex-1">
                {key.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] font-semibold text-slate-800 text-right max-w-[55%] leading-tight">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Demographic Insights section ──────────────────────────────────────────────

function DemographicInsightsSection({ niche }) {
  // Map common niches to demographic segment names for broader matching
  const segmentQuery = niche || "";

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["contextual-demographics", segmentQuery],
    queryFn: () => getDemographicInsights(supabase, segmentQuery, 3),
    enabled: Boolean(segmentQuery),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div>
      <SectionHeader icon={Users} title="Demographic Insights" color="text-violet-600" />
      {isLoading ? (
        <LoadingRow />
      ) : segments.length === 0 ? (
        <EmptyState message={`No segments matched for "${niche}"`} />
      ) : (
        <div className="space-y-2">
          {segments.map(seg => (
            <div
              key={seg.id}
              className="p-2.5 rounded-lg bg-violet-50/60 border border-violet-100"
            >
              <p className="text-xs font-semibold text-slate-800">{seg.name}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                {seg.population_size && (
                  <div>
                    <p className="text-[9px] uppercase text-slate-400 tracking-wide">Population</p>
                    <p className="text-[10px] text-slate-700 font-medium">{seg.population_size}</p>
                  </div>
                )}
                {seg.buying_power && (
                  <div>
                    <p className="text-[9px] uppercase text-slate-400 tracking-wide">Buying Power</p>
                    <p className="text-[10px] text-slate-700 font-medium">{seg.buying_power}</p>
                  </div>
                )}
              </div>
              {seg.media_preferences && (
                <p className="mt-1.5 text-[10px] text-violet-700 line-clamp-2">
                  Media: {seg.media_preferences}
                </p>
              )}
              {seg.brand_activation_tips && (
                <p className="mt-1 text-[10px] text-slate-600 italic line-clamp-2">
                  {seg.brand_activation_tips}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Industry Guide section ────────────────────────────────────────────────────

function IndustryGuideSection({ niche }) {
  const { data: guide, isLoading } = useQuery({
    queryKey: ["contextual-industry-guide", niche],
    queryFn: () => getIndustryGuide(supabase, niche),
    enabled: Boolean(niche),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div>
      <SectionHeader icon={Lightbulb} title="Industry Activation Guide" color="text-amber-600" />
      {isLoading ? (
        <LoadingRow />
      ) : !guide ? (
        <EmptyState message={`No guide found for "${niche}"`} />
      ) : (
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-800">{guide.industry}</p>
            {guide.budget_allocation && (
              <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200">
                {guide.budget_allocation}
              </Badge>
            )}
          </div>
          {guide.activation_strategies && (
            <div>
              <p className="text-[9px] uppercase font-semibold text-amber-700 tracking-wide mb-1">
                Activation Strategies
              </p>
              <p className="text-[10px] text-slate-700 leading-relaxed line-clamp-4">
                {guide.activation_strategies}
              </p>
            </div>
          )}
          {guide.priority_tier_1_events && (
            <div>
              <p className="text-[9px] uppercase font-semibold text-red-600 tracking-wide mb-1">
                Tier 1 Events
              </p>
              <p className="text-[10px] text-slate-700 line-clamp-2">{guide.priority_tier_1_events}</p>
            </div>
          )}
          {guide.best_demographics && (
            <div>
              <p className="text-[9px] uppercase font-semibold text-slate-500 tracking-wide mb-1">
                Best Demographics
              </p>
              <p className="text-[10px] text-slate-700 line-clamp-2">{guide.best_demographics}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  [props.niche]    - Deal/talent niche e.g. "beauty", "fitness"
 * @param {string}  [props.platform] - Primary platform e.g. "instagram", "youtube"
 * @param {string}  [props.tier]     - Talent tier e.g. "micro", "mid", "macro", "mega"
 * @param {string}  [props.className] - Optional extra Tailwind classes on the wrapper
 */
export default function ContextualInsights({ niche, platform, tier, className = "" }) {
  const hasAnyProp = niche || platform || tier;

  if (!hasAnyProp) {
    return (
      <Card className={`border-slate-200/60 ${className}`}>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            Provide a niche, platform, or tier to load contextual insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-slate-200/60 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Contextual Intelligence
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {niche && (
              <Badge variant="outline" className="text-[10px] capitalize text-slate-600">
                {niche}
              </Badge>
            )}
            {platform && (
              <Badge variant="outline" className="text-[10px] capitalize text-slate-600">
                {platform}
              </Badge>
            )}
            {tier && (
              <Badge variant="outline" className="text-[10px] capitalize text-slate-600">
                {tier}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Live data from Culture Calendar, Rate Benchmarks, Demographics, and Industry Guides
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Culture Events — requires niche */}
        {niche && <CultureEventsSection niche={niche} />}

        {/* Rate Benchmarks — requires both platform and tier */}
        {platform && tier && (
          <>
            <div className="border-t border-slate-100" />
            <RateBenchmarksSection platform={platform} tier={tier} />
          </>
        )}

        {/* Demographic Insights — requires niche */}
        {niche && (
          <>
            <div className="border-t border-slate-100" />
            <DemographicInsightsSection niche={niche} />
          </>
        )}

        {/* Industry Guide — requires niche */}
        {niche && (
          <>
            <div className="border-t border-slate-100" />
            <IndustryGuideSection niche={niche} />
          </>
        )}

        {/* Footer link hint */}
        <div className="flex items-center gap-1 text-[10px] text-indigo-500 pt-1">
          <ChevronRight className="w-3 h-3" />
          <span>Full details in Culture Calendar, Demographics, and Talent Revenue pages</span>
        </div>
      </CardContent>
    </Card>
  );
}

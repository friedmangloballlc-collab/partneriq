/**
 * updateRateBenchmarks — Supabase Edge Function
 *
 * Designed to run weekly via cron (scheduling is handled separately).
 *
 * Logic:
 *  1. Fetch all completed data_room_entries from the last 90 days.
 *  2. Group entries by (platform, tier, niche).
 *  3. For each group with >= 10 deals, compute avg_rate, min_rate, max_rate.
 *  4. Upsert those values into the rate_benchmarks table.
 *  5. Log a summary record in the activities table.
 *
 * The function accepts an optional Bearer token for manual invocation from the
 * admin UI, but can also run without auth when called by Supabase's cron scheduler
 * (using the service role key in the Authorization header).
 */

import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// Minimum number of deals required before we update a benchmark bucket
const MIN_DEAL_COUNT = 10;

// How many days back to look for completed deals
const LOOKBACK_DAYS = 90;

interface DataRoomEntry {
  id: string;
  user_id: string;
  platform: string | null;
  tier: string | null;
  niche: string | null;
  deal_value: number | null;
  status: string | null;
  created_at: string;
}

interface BenchmarkGroup {
  platform: string;
  tier: string;
  niche: string;
  values: number[];
}

interface UpdatedBenchmark {
  platform: string;
  tier: string;
  niche: string;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
  sample_size: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Allow both admin users (manual trigger) and unauthenticated cron invocations.
    // When called by Supabase cron the service-role key is passed as the Bearer token
    // so auth.me() may return null — that is acceptable for a scheduled job.
    const user = await base44.auth.me();
    if (user !== null && user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden — admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = base44.supabase;
    const now = new Date();
    const cutoff = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

    // ── 1. Fetch completed data_room_entries from last 90 days ────────────────
    const { data: rawEntries, error: fetchErr } = await supabase
      .from('data_room_entries')
      .select('id, user_id, platform, tier, niche, deal_value, status, created_at')
      .eq('status', 'completed')
      .gte('created_at', cutoff.toISOString())
      .not('deal_value', 'is', null)
      .not('platform', 'is', null)
      .not('tier', 'is', null);

    if (fetchErr) throw new Error(`Failed to fetch data_room_entries: ${fetchErr.message}`);

    const entries: DataRoomEntry[] = rawEntries ?? [];

    // ── 2. Group by (platform, tier, niche) ──────────────────────────────────
    const groupMap = new Map<string, BenchmarkGroup>();

    for (const entry of entries) {
      const platform = (entry.platform ?? '').toLowerCase().trim();
      const tier = (entry.tier ?? '').toLowerCase().trim();
      const niche = (entry.niche ?? 'general').toLowerCase().trim();

      if (!platform || !tier) continue;
      if (typeof entry.deal_value !== 'number' || entry.deal_value <= 0) continue;

      const key = `${platform}||${tier}||${niche}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, { platform, tier, niche, values: [] });
      }
      groupMap.get(key)!.values.push(entry.deal_value);
    }

    // ── 3. Filter groups with >= MIN_DEAL_COUNT and compute stats ─────────────
    const updates: UpdatedBenchmark[] = [];

    for (const group of groupMap.values()) {
      if (group.values.length < MIN_DEAL_COUNT) continue;

      const sorted = [...group.values].sort((a, b) => a - b);
      const sum = sorted.reduce((acc, v) => acc + v, 0);
      const avg = Math.round(sum / sorted.length);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      updates.push({
        platform: group.platform,
        tier: group.tier,
        niche: group.niche,
        avg_rate: avg,
        min_rate: min,
        max_rate: max,
        sample_size: sorted.length,
      });
    }

    // ── 4. Upsert into rate_benchmarks ────────────────────────────────────────
    let upsertedCount = 0;
    const upsertErrors: string[] = [];

    for (const benchmark of updates) {
      const { error: upsertErr } = await supabase
        .from('rate_benchmarks')
        .upsert(
          {
            platform: benchmark.platform,
            tier: benchmark.tier,
            niche: benchmark.niche,
            avg_rate: benchmark.avg_rate,
            min_rate: benchmark.min_rate,
            max_rate: benchmark.max_rate,
            sample_size: benchmark.sample_size,
            updated_at: now.toISOString(),
            last_computed_at: now.toISOString(),
          },
          {
            // Match on (platform, tier, niche) — assumes a unique constraint exists on these three columns
            onConflict: 'platform,tier,niche',
            ignoreDuplicates: false,
          },
        );

      if (upsertErr) {
        upsertErrors.push(`${benchmark.platform}/${benchmark.tier}/${benchmark.niche}: ${upsertErr.message}`);
      } else {
        upsertedCount++;
      }
    }

    // ── 5. Log the run in the activities table ────────────────────────────────
    const summary = {
      run_at: now.toISOString(),
      lookback_days: LOOKBACK_DAYS,
      entries_processed: entries.length,
      groups_found: groupMap.size,
      groups_with_min_count: updates.length,
      benchmarks_updated: upsertedCount,
      errors: upsertErrors,
    };

    await supabase
      .from('activities')
      .insert({
        type: 'rate_benchmarks_updated',
        title: 'Rate Benchmarks Auto-Updated',
        description: `Weekly cron updated ${upsertedCount} rate benchmark(s) from ${entries.length} completed deals in the last ${LOOKBACK_DAYS} days.`,
        metadata: JSON.stringify(summary),
        created_at: now.toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn('[updateRateBenchmarks] Failed to log activity:', error.message);
      });

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        updated_benchmarks: updates.map(u => ({
          key: `${u.platform}/${u.tier}/${u.niche}`,
          avg_rate: u.avg_rate,
          min_rate: u.min_rate,
          max_rate: u.max_rate,
          sample_size: u.sample_size,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[updateRateBenchmarks] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

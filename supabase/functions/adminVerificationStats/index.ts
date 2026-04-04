/**
 * adminVerificationStats
 *
 * Admin-only endpoint that returns platform-wide verification and enrichment
 * statistics.  Requires a valid Supabase JWT from a user whose profiles row
 * has role = 'admin'.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ---------------------------------------------------------------
    // 1. Authenticate caller via Supabase JWT
    // ---------------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Missing Authorization header" },
        { status: 401, headers: corsHeaders },
      );
    }

    // User-scoped client for getUser() validation
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401, headers: corsHeaders },
      );
    }

    // ---------------------------------------------------------------
    // 2. Verify admin role in profiles table
    // ---------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return Response.json(
        { error: "Forbidden — admin role required" },
        { status: 403, headers: corsHeaders },
      );
    }

    // ---------------------------------------------------------------
    // 3. Gather aggregation queries in parallel
    // ---------------------------------------------------------------
    const [
      connectedAccountsRes,
      enrichedCreatorsRes,
      enrichedBrandsRes,
      crawlJobsRes,
      websiteVerificationsRes,
      dealVerificationsRes,
      matchScoresRes,
    ] = await Promise.all([
      // Connected accounts total + by_platform breakdown
      supabase.from("connected_accounts").select("platform"),

      // Enriched creators count
      supabase
        .from("enriched_creators")
        .select("id", { count: "exact", head: true }),

      // Enriched brands count
      supabase
        .from("enriched_brands")
        .select("id", { count: "exact", head: true }),

      // Crawl jobs with statuses
      supabase.from("crawl_jobs").select("status"),

      // Website verifications
      supabase.from("website_verifications").select("verified"),

      // Deal verifications
      supabase.from("deal_verifications").select("verified"),

      // Match scores
      supabase.from("match_scores").select("score"),
    ]);

    // ---------------------------------------------------------------
    // 4. Transform results into response shape
    // ---------------------------------------------------------------

    // Connected accounts
    const accountRows = connectedAccountsRes.data ?? [];
    const byPlatform: Record<string, number> = {};
    for (const row of accountRows) {
      const p = row.platform ?? "unknown";
      byPlatform[p] = (byPlatform[p] ?? 0) + 1;
    }

    // Crawl jobs breakdown
    const crawlRows = crawlJobsRes.data ?? [];
    const crawlCounts = { total: crawlRows.length, queued: 0, running: 0, completed: 0, failed: 0 };
    for (const row of crawlRows) {
      const s = row.status as keyof typeof crawlCounts;
      if (s in crawlCounts && s !== "total") {
        crawlCounts[s]++;
      }
    }

    // Website verifications
    const websiteRows = websiteVerificationsRes.data ?? [];
    const websiteVerified = websiteRows.filter((r) => r.verified === true).length;

    // Deal verifications
    const dealRows = dealVerificationsRes.data ?? [];
    const dealVerified = dealRows.filter((r) => r.verified === true).length;

    // Match scores
    const scoreRows = matchScoresRes.data ?? [];
    const totalScores = scoreRows.length;
    const avgScore =
      totalScores > 0
        ? Math.round(
            scoreRows.reduce((sum, r) => sum + (r.score ?? 0), 0) / totalScores,
          )
        : 0;

    // ---------------------------------------------------------------
    // 5. Return stats
    // ---------------------------------------------------------------
    const stats = {
      connected_accounts: {
        total: accountRows.length,
        by_platform: byPlatform,
      },
      enriched_profiles: {
        creators: enrichedCreatorsRes.count ?? 0,
        brands: enrichedBrandsRes.count ?? 0,
      },
      crawl_jobs: crawlCounts,
      verifications: {
        website: {
          total: websiteRows.length,
          verified: websiteVerified,
          pending: websiteRows.length - websiteVerified,
        },
        deals: {
          total: dealRows.length,
          verified: dealVerified,
        },
      },
      match_scores: {
        total: totalScores,
        avg_score: avgScore,
      },
    };

    return Response.json(stats, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[adminVerificationStats] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
});

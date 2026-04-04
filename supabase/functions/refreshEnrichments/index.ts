/**
 * refreshEnrichments
 *
 * Cron-triggered function that:
 *   1. Re-enriches stale creator profiles (last_enriched_at > 7 days, limit 10)
 *   2. Retries recently-failed crawl jobs (retry_count < 3, created in last 24h)
 *
 * Authentication: Bearer CRON_SECRET header (not a user JWT).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CRAWL4AI_URL = Deno.env.get("CRAWL4AI_URL") ?? "";
const CRAWL4AI_TOKEN = Deno.env.get("CRAWL4AI_TOKEN") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 30;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Submit a URL to Crawl4AI and poll until a terminal state is reached. */
async function crawlUrl(url: string): Promise<{ markdown: string; error?: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (CRAWL4AI_TOKEN) {
    headers["Authorization"] = `Bearer ${CRAWL4AI_TOKEN}`;
  }

  const crawlResp = await fetch(`${CRAWL4AI_URL}/crawl`, {
    method: "POST",
    headers,
    body: JSON.stringify({ urls: [url], priority: 5, cache_mode: "bypass" }),
  });

  if (!crawlResp.ok) {
    const body = await crawlResp.text();
    return { markdown: "", error: `Crawl request failed (${crawlResp.status}): ${body}` };
  }

  const crawlData = await crawlResp.json();

  // If the result came back inline, return immediately
  if (crawlData.result?.markdown) {
    return { markdown: crawlData.result.markdown };
  }

  // Otherwise poll via task_id
  const taskId = crawlData.task_id;
  if (!taskId) {
    return { markdown: "", error: "No task_id or inline result from Crawl4AI" };
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await delay(POLL_INTERVAL_MS);

    const pollResp = await fetch(`${CRAWL4AI_URL}/task/${taskId}`, { headers });
    if (!pollResp.ok) continue;

    const pollData = await pollResp.json();

    if (pollData.status === "completed" && pollData.result?.markdown) {
      return { markdown: pollData.result.markdown };
    }
    if (pollData.status === "failed") {
      return { markdown: "", error: pollData.result?.error ?? "Crawl task failed" };
    }
  }

  return { markdown: "", error: `Task ${taskId} did not complete within ${MAX_POLL_ATTEMPTS} polls` };
}

/** Extract structured creator data from markdown via Claude. */
async function extractWithClaude(
  markdown: string,
  creatorName: string,
): Promise<Record<string, unknown> | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn("[refreshEnrichments] ANTHROPIC_API_KEY not set — skipping extraction");
    return null;
  }

  const systemPrompt = `You are a data extraction assistant. Given the markdown content of a creator or brand website, extract structured profile information. Return valid JSON only with the following fields where available: bio, niche, audience_size_estimate, location, contact_email, social_links (array), notable_brands (array), content_topics (array), monetization_signals (array).`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Extract structured profile data for "${creatorName}" from this website content:\n\n${markdown.slice(0, 12_000)}`,
        },
      ],
    }),
  });

  if (!resp.ok) {
    console.error("[refreshEnrichments] Claude API error:", resp.status, await resp.text());
    return null;
  }

  const data = await resp.json();
  const text = data.content?.[0]?.text ?? "";

  // Attempt to parse JSON from the response (handle markdown code fences)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
  try {
    return JSON.parse(jsonMatch[1]!.trim());
  } catch {
    console.warn("[refreshEnrichments] Could not parse Claude response as JSON");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ------------------------------------------------------------------
    // 1. Verify CRON_SECRET
    // ------------------------------------------------------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!CRON_SECRET || token !== CRON_SECRET) {
      return Response.json(
        { error: "Unauthorized — invalid CRON_SECRET" },
        { status: 401, headers: corsHeaders },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ------------------------------------------------------------------
    // 2. Find stale enriched creators (last_enriched_at > 7 days)
    // ------------------------------------------------------------------
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000).toISOString();

    const { data: staleCreators, error: staleError } = await supabase
      .from("enriched_creators")
      .select("id, name, website_url, last_enriched_at")
      .lt("last_enriched_at", sevenDaysAgo)
      .not("website_url", "is", null)
      .order("last_enriched_at", { ascending: true })
      .limit(10);

    if (staleError) {
      console.error("[refreshEnrichments] Error fetching stale creators:", staleError);
    }

    let refreshed = 0;

    for (const creator of staleCreators ?? []) {
      try {
        console.log(`[refreshEnrichments] Re-enriching creator ${creator.id} (${creator.name})`);

        // Crawl the website
        const crawlResult = await crawlUrl(creator.website_url);
        if (crawlResult.error) {
          console.warn(`[refreshEnrichments] Crawl failed for ${creator.website_url}: ${crawlResult.error}`);
          continue;
        }

        // Extract structured data via Claude
        const extracted = await extractWithClaude(crawlResult.markdown, creator.name ?? "Unknown");

        // Update the enriched_creators row
        const updatePayload: Record<string, unknown> = {
          last_enriched_at: new Date().toISOString(),
          raw_markdown: crawlResult.markdown.slice(0, 50_000), // cap storage
        };

        if (extracted) {
          updatePayload.extracted_data = extracted;
        }

        const { error: updateError } = await supabase
          .from("enriched_creators")
          .update(updatePayload)
          .eq("id", creator.id);

        if (updateError) {
          console.error(`[refreshEnrichments] Update failed for creator ${creator.id}:`, updateError);
          continue;
        }

        refreshed++;
      } catch (err) {
        console.error(`[refreshEnrichments] Error processing creator ${creator.id}:`, err);
      }
    }

    // ------------------------------------------------------------------
    // 3. Retry recently-failed crawl jobs (retry_count < 3, last 24h)
    // ------------------------------------------------------------------
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString();

    const { data: failedJobs, error: failedError } = await supabase
      .from("crawl_jobs")
      .select("id, retry_count")
      .eq("status", "failed")
      .lt("retry_count", 3)
      .gt("created_at", twentyFourHoursAgo);

    if (failedError) {
      console.error("[refreshEnrichments] Error fetching failed jobs:", failedError);
    }

    let retried = 0;

    for (const job of failedJobs ?? []) {
      const { error: retryError } = await supabase
        .from("crawl_jobs")
        .update({
          status: "queued",
          retry_count: (job.retry_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      if (retryError) {
        console.error(`[refreshEnrichments] Failed to re-queue job ${job.id}:`, retryError);
        continue;
      }

      retried++;
    }

    // ------------------------------------------------------------------
    // 4. Return summary
    // ------------------------------------------------------------------
    console.log(`[refreshEnrichments] Done — refreshed: ${refreshed}, retried: ${retried}`);

    return Response.json(
      { refreshed, retried },
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("[refreshEnrichments] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
});

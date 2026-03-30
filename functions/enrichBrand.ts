import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crawlUrl, crawlMultiple } from "./_shared/crawl4ai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

/** Subpage path patterns to look for when discovering key brand pages. */
const SUBPAGE_PATTERNS = [
  /\/(about|who-we-are|our-story)/i,
  /\/(products?|shop|catalog|store)/i,
  /\/(pricing|plans|packages)/i,
  /\/(services?|solutions?|offerings?)/i,
  /\/(team|people|leadership|careers)/i,
];

const EXTRACTION_PROMPT = `You are a brand intelligence analyst. Analyze the following crawled content from a brand's website and extract a structured profile with the following fields:

- company_name: string — the official company/brand name
- industry: string — the primary industry (e.g., "Fashion", "Technology", "Food & Beverage")
- products: string[] — key products or product categories
- brand_voice: string — a description of the brand's tone and communication style (e.g., "casual and playful", "professional and authoritative")
- target_audience: string — who the brand targets (demographics, interests)
- social_links: object — social media URLs found (keys like "instagram", "twitter", "tiktok", "youtube", "linkedin", "facebook")

Return ONLY valid JSON matching this schema. If a field cannot be determined, use null for strings or empty arrays/objects for collection types.`;

/**
 * Given a list of raw links from a crawl result, find up to 5 key subpages
 * that match common brand page patterns (about, products, pricing, services, team).
 */
function findKeySubpages(links: string[], baseUrl: string): string[] {
  const baseOrigin = new URL(baseUrl).origin;
  const found: string[] = [];
  const matchedPatterns = new Set<number>();

  for (const link of links) {
    if (found.length >= 5) break;

    try {
      const parsed = new URL(link, baseUrl);
      // Only consider same-origin links
      if (parsed.origin !== baseOrigin) continue;

      for (let i = 0; i < SUBPAGE_PATTERNS.length; i++) {
        if (matchedPatterns.has(i)) continue;
        if (SUBPAGE_PATTERNS[i].test(parsed.pathname)) {
          found.push(parsed.href);
          matchedPatterns.add(i);
          break;
        }
      }
    } catch {
      // Skip malformed URLs
    }
  }

  return found;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = user.id;
  let crawlJobId: string | null = null;

  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return new Response(JSON.stringify({ error: "websiteUrl is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create crawl_job record
    const { data: crawlJob, error: jobError } = await supabaseAdmin
      .from("crawl_jobs")
      .insert({
        user_id: userId,
        job_type: "enrich_brand",
        status: "running",
        input_data: { websiteUrl },
      })
      .select()
      .single();

    if (jobError) throw new Error(`Failed to create crawl job: ${jobError.message}`);
    crawlJobId = crawlJob.id;

    // 1. Crawl the main URL
    const mainResult = await crawlUrl(websiteUrl);

    // 2. Find key subpages from discovered links
    const subpageUrls = findKeySubpages(mainResult.links ?? [], websiteUrl);

    // 3. Crawl subpages
    const subpageResults = subpageUrls.length > 0 ? await crawlMultiple(subpageUrls) : [];

    // 4. Combine all markdown
    const allMarkdown = [
      `--- Main Page: ${websiteUrl} ---\n${mainResult.markdown ?? ""}`,
      ...subpageResults.map(
        (r, i) => `--- Subpage: ${subpageUrls[i]} ---\n${r.markdown ?? ""}`
      ),
    ].join("\n\n");

    if (!allMarkdown.trim()) {
      throw new Error("No content could be extracted from the website");
    }

    // 5. Send to Anthropic for structured extraction
    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n--- CRAWLED CONTENT ---\n${allMarkdown}`,
          },
        ],
      }),
    });

    if (!anthropicResp.ok) {
      throw new Error(`Anthropic API error: ${anthropicResp.status} ${await anthropicResp.text()}`);
    }

    const anthropicData = await anthropicResp.json();
    const rawText = anthropicData.content?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawText];
    const enrichedBrand = JSON.parse(jsonMatch[1]!.trim());

    // 6. Upsert into enriched_brands table
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from("enriched_brands")
      .upsert(
        {
          user_id: userId,
          company_name: enrichedBrand.company_name,
          industry: enrichedBrand.industry,
          products: enrichedBrand.products,
          brand_voice: enrichedBrand.brand_voice,
          target_audience: enrichedBrand.target_audience,
          social_links: enrichedBrand.social_links,
          website_url: websiteUrl,
          pages_crawled: [websiteUrl, ...subpageUrls],
          enriched_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (upsertError) throw new Error(`Failed to upsert enriched brand: ${upsertError.message}`);

    // Update crawl_job to completed
    await supabaseAdmin
      .from("crawl_jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", crawlJobId);

    // 7. Return the enriched profile
    return new Response(
      JSON.stringify({ success: true, profile: upserted }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (crawlJobId) {
      await supabaseAdmin
        .from("crawl_jobs")
        .update({
          status: "failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", crawlJobId);
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

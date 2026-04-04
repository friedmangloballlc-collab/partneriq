import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crawlUrl, crawlMultiple } from "./_shared/crawl4ai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const EXTRACTION_PROMPT = `You are a data extraction specialist. Analyze the following crawled content from a creator's social media profiles and websites. Extract a structured profile with the following fields:

- display_name: string — the creator's public display name
- bio: string — a concise biography (max 300 chars)
- niche: string[] — content niches/categories (e.g., "fitness", "tech", "beauty")
- profile_image_url: string | null — URL of their profile image if found
- website_url: string | null — their personal website URL if found
- media_kit_url: string | null — link to their media kit if found
- rate_card: object | null — any pricing/rate information found (JSON with keys like "instagram_post", "youtube_video", etc.)
- audience_data: object | null — follower counts, engagement rates, demographics if available (JSON)
- past_brand_deals: string[] — brands they have visibly partnered with
- content_themes: string[] — recurring themes in their content

Return ONLY valid JSON matching this schema. If a field cannot be determined, use null for optional fields or empty arrays for array fields.`;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Authenticate via Supabase JWT
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
    const { links } = await req.json();

    if (!Array.isArray(links) || links.length === 0) {
      return new Response(JSON.stringify({ error: "links must be a non-empty array of URLs" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Create crawl_job record
    const { data: crawlJob, error: jobError } = await supabaseAdmin
      .from("crawl_jobs")
      .insert({
        user_id: userId,
        job_type: "enrich_creator",
        status: "running",
        input_data: { links },
      })
      .select()
      .single();

    if (jobError) throw new Error(`Failed to create crawl job: ${jobError.message}`);
    crawlJobId = crawlJob.id;

    // 2. Crawl each link via Crawl4AI
    const crawlResults = await crawlMultiple(links);

    // 3. Combine all markdown content
    const combinedMarkdown = crawlResults
      .map((r, i) => `--- Source: ${links[i]} ---\n${r.markdown ?? ""}`)
      .join("\n\n");

    if (!combinedMarkdown.trim()) {
      throw new Error("No content could be extracted from the provided links");
    }

    // 4. Send to Anthropic for structured extraction
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
            content: `${EXTRACTION_PROMPT}\n\n--- CRAWLED CONTENT ---\n${combinedMarkdown}`,
          },
        ],
      }),
    });

    if (!anthropicResp.ok) {
      throw new Error(`Anthropic API error: ${anthropicResp.status} ${await anthropicResp.text()}`);
    }

    const anthropicData = await anthropicResp.json();
    const rawText = anthropicData.content?.[0]?.text ?? "";

    // Parse the JSON from the response (handle markdown code blocks)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawText];
    const enrichedProfile = JSON.parse(jsonMatch[1]!.trim());

    // 5. Upsert into enriched_creators table
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from("enriched_creators")
      .upsert(
        {
          user_id: userId,
          display_name: enrichedProfile.display_name,
          bio: enrichedProfile.bio,
          niche: enrichedProfile.niche,
          profile_image_url: enrichedProfile.profile_image_url,
          website_url: enrichedProfile.website_url,
          media_kit_url: enrichedProfile.media_kit_url,
          rate_card: enrichedProfile.rate_card,
          audience_data: enrichedProfile.audience_data,
          past_brand_deals: enrichedProfile.past_brand_deals,
          content_themes: enrichedProfile.content_themes,
          source_links: links,
          enriched_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (upsertError) throw new Error(`Failed to upsert enriched creator: ${upsertError.message}`);

    // 6. Update crawl_job to completed
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

    // Update crawl_job to failed
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crawlUrl } from "./_shared/crawl4ai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

  try {
    const { dealId, creatorId, postUrl, brandName, requiredLinks } = await req.json();

    // Validate required fields
    if (!dealId || !creatorId || !postUrl || !brandName) {
      return new Response(
        JSON.stringify({
          error: "dealId, creatorId, postUrl, and brandName are all required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const linksToCheck: string[] = Array.isArray(requiredLinks) ? requiredLinks : [];

    // 1. Crawl the post URL (bypass cache to get fresh content)
    const crawlResult = await crawlUrl(postUrl, "bypass");

    const markdown = (crawlResult.markdown ?? "").toLowerCase();
    const html = (crawlResult.html ?? "").toLowerCase();
    const combinedContent = `${markdown}\n${html}`;

    // 2. Check if brandName appears in the content (case insensitive)
    const brandMentioned = combinedContent.includes(brandName.toLowerCase());

    // 3. Check if all required links appear in the HTML
    let linksCorrect = true;
    const linkResults: Record<string, boolean> = {};

    for (const link of linksToCheck) {
      const normalizedLink = link.toLowerCase().replace(/\/$/, "");
      const found = combinedContent.includes(normalizedLink);
      linkResults[link] = found;
      if (!found) linksCorrect = false;
    }

    // If no links were required, links_correct is true by default
    if (linksToCheck.length === 0) {
      linksCorrect = true;
    }

    // 4. Determine verification status
    const verified = brandMentioned && linksCorrect;

    // Create a content snapshot (truncated for storage)
    const snapshot = (crawlResult.markdown ?? "").slice(0, 5000);

    // 5. Insert into deal_verifications table
    const { data: verification, error: insertError } = await supabaseAdmin
      .from("deal_verifications")
      .insert({
        deal_id: dealId,
        creator_id: creatorId,
        verified_by: user.id,
        post_url: postUrl,
        brand_name: brandName,
        required_links: linksToCheck,
        verified,
        brand_mentioned: brandMentioned,
        links_correct: linksCorrect,
        link_results: linkResults,
        snapshot,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert deal verification: ${insertError.message}`);
    }

    // 6. Return verification result
    return new Response(
      JSON.stringify({
        success: true,
        verified,
        brand_mentioned: brandMentioned,
        links_correct: linksCorrect,
        link_results: linkResults,
        snapshot,
        verification_id: verification.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

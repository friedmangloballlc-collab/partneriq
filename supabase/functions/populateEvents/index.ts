// Edge Function: populateEvents
// Populates the industry_events table with real events and maps brand sponsors.
// Uses Claude to generate accurate event data per industry category, then links
// sponsor brands found in the brands table via brand_event_sponsors.
// Admin-only endpoint.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "fashion",
  "beauty",
  "tech",
  "fitness",
  "food",
  "travel",
  "gaming",
  "lifestyle",
  "finance",
  "education",
  "entertainment",
  "sports",
  "music",
  "health",
  "business",
  "parenting",
  "pets",
  "automotive",
  "outdoor_adventure",
  "luxury",
  "crypto_web3",
  "sustainability",
  "photography",
  "art_design",
];

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------
async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "[]";
}

// ---------------------------------------------------------------------------
// Extract JSON array from Claude's response (handles markdown fences)
// ---------------------------------------------------------------------------
function extractJsonArray(raw: string): any[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fall through
  }

  // Strip markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Fall through
    }
  }

  // Try to find the first [ ... ] bracket pair
  const startIdx = raw.indexOf("[");
  const endIdx = raw.lastIndexOf("]");
  if (startIdx !== -1 && endIdx > startIdx) {
    try {
      const parsed = JSON.parse(raw.slice(startIdx, endIdx + 1));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Fall through
    }
  }

  console.error("[populateEvents] Failed to parse Claude response:", raw.slice(0, 200));
  return [];
}

// ---------------------------------------------------------------------------
// Build prompt for a single category
// ---------------------------------------------------------------------------
function buildPrompt(category: string): string {
  return `List 10-15 real, well-known industry events, conferences, festivals, and trade shows relevant to the "${category}" industry where brands and creators/influencers connect.

For each event, return ONLY valid JSON array with:
{
  "name": "VidCon",
  "description": "The world's largest event for digital creators and online video",
  "event_type": "conference" | "festival" | "trade_show" | "award_show" | "summit" | "expo",
  "industry": ["${category}", "other relevant categories"],
  "location": "Anaheim, CA",
  "typical_month": "June",
  "start_date": "2026-06-15",
  "end_date": "2026-06-18",
  "website_url": "https://vidcon.com",
  "estimated_attendees": 30000,
  "creator_relevance": "Why creators should care — what opportunities exist at this event",
  "typical_sponsors": ["Brand1", "Brand2", "Brand3"]
}

Only include REAL events that actually exist. Do not make up events.
Return ONLY the JSON array, no additional text.`;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth check ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse request body ──
    let clearExisting = true;
    try {
      const body = await req.json();
      if (body.clear_existing === false) clearExisting = false;
    } catch {
      // No body or invalid JSON — use defaults
    }

    // ── Clear existing data if requested ──
    if (clearExisting) {
      console.log("[populateEvents] Clearing existing brand_event_sponsors...");
      await supabase.from("brand_event_sponsors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateEvents] Clearing existing industry_events...");
      await supabase.from("industry_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // ── Pre-load all brands for sponsor matching ──
    const { data: allBrands } = await supabase
      .from("brands")
      .select("id, name");

    // Build a lowercase name -> brand map for fuzzy matching
    const brandMap = new Map<string, { id: string; name: string }>();
    if (allBrands) {
      for (const b of allBrands) {
        brandMap.set(b.name.toLowerCase().trim(), { id: b.id, name: b.name });
      }
    }
    console.log(`[populateEvents] Loaded ${brandMap.size} brands for sponsor matching`);

    // ── Process each category sequentially ──
    let totalEventsAdded = 0;
    let totalSponsorsMapped = 0;
    let industriesProcessed = 0;
    const errors: string[] = [];

    for (const category of CATEGORIES) {
      console.log(`[populateEvents] Processing category: ${category}`);

      try {
        const prompt = buildPrompt(category);
        const rawResponse = await callClaude(prompt);
        const events = extractJsonArray(rawResponse);

        if (events.length === 0) {
          console.warn(`[populateEvents] No events parsed for category: ${category}`);
          errors.push(`${category}: no events parsed from Claude response`);
          continue;
        }

        // Insert events one at a time to capture IDs and handle duplicates
        for (const evt of events) {
          // Validate required fields
          if (!evt.name || typeof evt.name !== "string") {
            console.warn(`[populateEvents] Skipping event with missing name in ${category}`);
            continue;
          }

          // Check for duplicate by name (case-insensitive)
          const { data: existing } = await supabase
            .from("industry_events")
            .select("id")
            .ilike("name", evt.name)
            .maybeSingle();

          let eventId: string;

          if (existing) {
            // Event already exists (from a previous category), use its ID
            eventId = existing.id;
            console.log(`[populateEvents] Event "${evt.name}" already exists, mapping sponsors only`);
          } else {
            // Insert the new event
            const eventRow = {
              name: evt.name,
              description: evt.description || null,
              event_type: evt.event_type || null,
              industry: Array.isArray(evt.industry) ? evt.industry : [category],
              location: evt.location || null,
              start_date: evt.start_date || null,
              end_date: evt.end_date || null,
              website_url: evt.website_url || null,
              estimated_attendees: typeof evt.estimated_attendees === "number"
                ? evt.estimated_attendees
                : null,
              creator_relevance: evt.creator_relevance || null,
              metadata: {
                typical_month: evt.typical_month || null,
                source: "claude_populated",
                populated_at: new Date().toISOString(),
              },
            };

            const { data: inserted, error: insertError } = await supabase
              .from("industry_events")
              .insert(eventRow)
              .select("id")
              .single();

            if (insertError) {
              console.error(`[populateEvents] Insert error for "${evt.name}":`, insertError.message);
              continue;
            }

            eventId = inserted.id;
            totalEventsAdded++;
          }

          // Map sponsors to brands
          const sponsors: string[] = Array.isArray(evt.typical_sponsors)
            ? evt.typical_sponsors
            : [];

          for (const sponsorName of sponsors) {
            if (!sponsorName || typeof sponsorName !== "string") continue;

            const brandKey = sponsorName.toLowerCase().trim();
            const matched = brandMap.get(brandKey);

            if (matched) {
              // Check if this sponsor mapping already exists
              const { data: existingSponsor } = await supabase
                .from("brand_event_sponsors")
                .select("id")
                .eq("brand_id", matched.id)
                .eq("event_id", eventId)
                .eq("year", 2026)
                .maybeSingle();

              if (!existingSponsor) {
                const { error: sponsorError } = await supabase
                  .from("brand_event_sponsors")
                  .insert({
                    brand_id: matched.id,
                    brand_name: matched.name,
                    event_id: eventId,
                    event_name: evt.name,
                    sponsorship_level: "exhibitor",
                    year: 2026,
                    notes: `Identified as typical sponsor via AI population`,
                  });

                if (sponsorError) {
                  console.error(
                    `[populateEvents] Sponsor link error: ${matched.name} -> ${evt.name}:`,
                    sponsorError.message
                  );
                } else {
                  totalSponsorsMapped++;
                }
              }
            }
          }
        }

        industriesProcessed++;
        console.log(
          `[populateEvents] Completed ${category}: ${events.length} events processed`
        );
      } catch (catError) {
        const msg = (catError as Error).message;
        console.error(`[populateEvents] Error processing ${category}:`, msg);
        errors.push(`${category}: ${msg}`);
      }
    }

    // ── Return summary ──
    const result = {
      success: true,
      events_added: totalEventsAdded,
      sponsors_mapped: totalSponsorsMapped,
      industries_processed: industriesProcessed,
      total_categories: CATEGORIES.length,
      cleared_existing: clearExisting,
      ...(errors.length > 0 ? { errors } : {}),
    };

    console.log("[populateEvents] Complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = (err as Error).message;
    console.error("[populateEvents] Fatal error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

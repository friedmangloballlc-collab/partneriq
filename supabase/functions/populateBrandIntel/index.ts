// Edge Function: populateBrandIntel
// Generates brand intelligence data (buying signals, budget intel) for every brand in the database.
// Admin-only endpoint. Runs after populateBrands to enrich each brand with actionable intel.
// Processes brands in batches with offset-based pagination for large datasets.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

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
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "{}";
}

function buildIntelPrompt(brand: { name: string; domain: string; industry: string }): string {
  return `For the real company "${brand.name}" (${brand.domain || "unknown domain"}, ${brand.industry || "unknown industry"}), provide brand intelligence data.
Return ONLY valid JSON with:
{
  "estimated_annual_budget": number (USD estimate for influencer/creator marketing spend),
  "budget_confidence": "low" | "medium" | "high",
  "fiscal_year_start": "January" (month their fiscal year begins),
  "budget_cycle": "quarterly" | "semi_annual" | "annual",
  "peak_spending_months": ["March", "September", "November"] (when they spend most on marketing),
  "recent_campaigns": [{"name": "campaign name", "type": "product_launch|seasonal|awareness|partnership", "approximate_date": "2025-Q4", "description": "brief description"}],
  "hiring_signals": [{"role": "Influencer Marketing Manager", "status": "recently_posted|filled|planned", "signal_strength": "high|medium|low", "implication": "they are building/expanding their influencer program"}],
  "funding_history": [{"round": "Series B", "amount": "$50M", "date": "2025", "implication": "likely increasing marketing spend"}],
  "competitor_activity": [{"competitor": "competitor name", "action": "launched major creator campaign", "implication": "brand will likely respond with their own campaign"}],
  "signals": [
    {"type": "hiring", "strength": "high", "title": "Hiring Influencer Marketing Manager", "description": "Posted job for influencer marketing role — building creator program", "expires_in_days": 90},
    {"type": "product_launch", "strength": "high", "title": "New Product Line Launching Q2 2026", "description": "Will need creators for launch campaign", "expires_in_days": 60},
    {"type": "event_sponsor", "strength": "medium", "title": "Sponsoring VidCon 2026", "description": "Looking for creators to activate at the event", "expires_in_days": 45},
    {"type": "campaign", "strength": "medium", "title": "Back-to-School Campaign", "description": "Annual seasonal push — peak outreach window", "expires_in_days": 30}
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no explanation. Use realistic data based on what you know about this company.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // --- Admin auth check ---
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${authHeader}` } },
    });

    const { data: { user } } = await userClient.auth.getUser(authHeader);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
    }

    // --- Parse request body ---
    const body = await req.json().catch(() => ({}));
    const clearExisting: boolean = body.clear_existing === true;
    const batchSize: number = Math.min(Math.max(body.batch_size || 5, 1), 25);
    const offset: number = Math.max(body.offset || 0, 0);

    // --- Clear existing data if requested (only on first batch) ---
    if (clearExisting && offset === 0) {
      console.log("[populateBrandIntel] Clearing existing brand intel data");
      await supabase.from("brand_signals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("brand_budget_intel").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateBrandIntel] Cleared brand_signals and brand_budget_intel tables");
    }

    // --- Fetch brands in batch ---
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("id, name, domain, industry")
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (brandsError) {
      throw new Error(`Failed to fetch brands: ${brandsError.message}`);
    }

    if (!brands || brands.length === 0) {
      return Response.json({
        success: true,
        brands_processed: 0,
        signals_added: 0,
        offset,
        next_offset: null,
        has_more: false,
        message: "No brands found at this offset",
      }, { headers: CORS_HEADERS });
    }

    // --- Check if there are more brands beyond this batch ---
    const { count: totalCount } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true });

    const hasMore = (totalCount ?? 0) > offset + batchSize;
    const nextOffset = hasMore ? offset + batchSize : null;

    // --- Process each brand ---
    let brandsProcessed = 0;
    let signalsAdded = 0;
    const errors: string[] = [];

    for (const brand of brands) {
      console.log(`[populateBrandIntel] Processing brand: ${brand.name} (${brand.id})`);

      try {
        const prompt = buildIntelPrompt(brand);
        const rawText = await callClaude(prompt);

        // Parse the JSON response, stripping markdown fences if present
        const cleaned = rawText.replace(/```json?|```/g, "").trim();
        const intel = JSON.parse(cleaned);

        // --- Upsert into brand_budget_intel ---
        const { error: budgetError } = await supabase
          .from("brand_budget_intel")
          .upsert(
            {
              brand_id: brand.id,
              estimated_annual_budget: intel.estimated_annual_budget ?? null,
              budget_confidence: intel.budget_confidence ?? "low",
              fiscal_year_start: intel.fiscal_year_start ?? "January",
              budget_cycle: intel.budget_cycle ?? "annual",
              peak_spending_months: intel.peak_spending_months ?? [],
              recent_campaigns: intel.recent_campaigns ?? [],
              hiring_signals: intel.hiring_signals ?? [],
              funding_history: intel.funding_history ?? [],
              competitor_activity: intel.competitor_activity ?? [],
              updated_at: new Date().toISOString(),
            },
            { onConflict: "brand_id" }
          );

        if (budgetError) {
          throw new Error(`brand_budget_intel upsert failed: ${budgetError.message}`);
        }

        // --- Insert signals into brand_signals ---
        const signals = intel.signals ?? [];
        if (signals.length > 0) {
          // Remove existing signals for this brand before inserting new ones
          await supabase.from("brand_signals").delete().eq("brand_id", brand.id);

          const signalRows = signals.map((signal: any) => ({
            brand_id: brand.id,
            type: signal.type ?? "general",
            strength: signal.strength ?? "medium",
            title: signal.title ?? "Untitled Signal",
            description: signal.description ?? "",
            expires_in_days: signal.expires_in_days ?? 90,
            expires_at: new Date(
              Date.now() + (signal.expires_in_days ?? 90) * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date().toISOString(),
          }));

          const { error: signalsError } = await supabase
            .from("brand_signals")
            .insert(signalRows);

          if (signalsError) {
            throw new Error(`brand_signals insert failed: ${signalsError.message}`);
          }

          signalsAdded += signalRows.length;
        }

        brandsProcessed++;
        console.log(
          `[populateBrandIntel] Completed ${brand.name}: ` +
          `budget=$${intel.estimated_annual_budget}, ${signals.length} signals`
        );
      } catch (brandError) {
        const msg = `${brand.name} (${brand.id}): ${brandError instanceof Error ? brandError.message : String(brandError)}`;
        errors.push(msg);
        console.error(`[populateBrandIntel] Error processing ${brand.name}:`, brandError);
        // Continue to next brand — don't stop the batch
      }
    }

    return Response.json(
      {
        success: true,
        brands_processed: brandsProcessed,
        signals_added: signalsAdded,
        offset,
        next_offset: nextOffset,
        has_more: hasMore,
        total_brands: totalCount,
        errors: errors.length > 0 ? errors : undefined,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[populateBrandIntel] Fatal error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Adjacent niche map — bidirectional associations
// ---------------------------------------------------------------------------
const ADJACENT_NICHES: Record<string, string[]> = {
  fashion: ["lifestyle", "beauty"],
  lifestyle: ["fashion", "travel", "photography"],
  beauty: ["fashion", "skincare"],
  tech: ["gaming", "software"],
  gaming: ["tech", "entertainment"],
  software: ["tech"],
  fitness: ["health", "wellness"],
  health: ["fitness", "wellness", "nutrition"],
  wellness: ["fitness", "health"],
  food: ["cooking", "nutrition"],
  cooking: ["food", "nutrition"],
  nutrition: ["food", "cooking", "health"],
  travel: ["lifestyle", "photography"],
  photography: ["travel", "lifestyle"],
};

// ---------------------------------------------------------------------------
// Tone vocabulary map for brand-voice matching
// ---------------------------------------------------------------------------
const TONE_KEYWORDS: Record<string, string[]> = {
  casual: ["fun", "chill", "vibes", "relaxed", "easygoing", "laid-back"],
  professional: ["expert", "certified", "authority", "specialist", "industry"],
  aspirational: ["inspire", "dream", "goals", "ambition", "empower", "vision"],
  edgy: ["bold", "raw", "unfiltered", "provocative", "disruptive"],
  luxury: ["premium", "exclusive", "curated", "bespoke", "elevated", "refined"],
  playful: ["fun", "creative", "quirky", "colorful", "whimsical"],
};

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function toLowerArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((s: any) => String(s).toLowerCase());
  if (typeof input === "string") return input.toLowerCase().split(/[\s,;|]+/).filter(Boolean);
  return [];
}

function safeStr(input: unknown): string {
  if (typeof input === "string") return input.toLowerCase();
  return "";
}

/** Check whether any term in `terms` appears as a substring within any term in `pool`. */
function countOverlaps(terms: string[], pool: string[]): number {
  let count = 0;
  for (const t of terms) {
    for (const p of pool) {
      if (p.includes(t) || t.includes(p)) {
        count++;
        break; // count each term at most once
      }
    }
  }
  return count;
}

function areAdjacentNiches(creatorTerms: string[], brandTerms: string[]): boolean {
  for (const ct of creatorTerms) {
    const neighbors = ADJACENT_NICHES[ct];
    if (!neighbors) continue;
    for (const bt of brandTerms) {
      if (neighbors.includes(bt)) return true;
    }
  }
  return false;
}

function detectTones(text: string): string[] {
  const matched: string[] = [];
  const lower = text.toLowerCase();
  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(tone);
    }
  }
  return matched;
}

// ---------------------------------------------------------------------------
// Core scoring function
// ---------------------------------------------------------------------------

interface ScoreBreakdown {
  niche_fit: number;
  audience_fit: number;
  brand_voice_fit: number;
  track_record: number;
}

interface ScoreResult {
  overall: number;
  breakdown: ScoreBreakdown;
  signals: string[];
}

function scorePair(creator: any, brand: any): ScoreResult {
  const signals: string[] = [];

  // ---- 1. Niche Fit (0-25) ----
  const brandTerms = [
    ...toLowerArray(brand.industry),
    ...toLowerArray(brand.product_names),
    ...toLowerArray(brand.niche),
    ...toLowerArray(brand.categories),
  ];
  const creatorTerms = [
    ...toLowerArray(creator.niche),
    ...toLowerArray(creator.content_themes),
    ...toLowerArray(creator.categories),
  ];

  const overlaps = countOverlaps(brandTerms, creatorTerms);
  let nicheFit: number;
  if (overlaps >= 3) {
    nicheFit = 25;
    signals.push(`Strong niche overlap: ${overlaps} matching terms`);
  } else if (overlaps >= 1) {
    nicheFit = 15;
    signals.push(`Partial niche overlap: ${overlaps} matching term(s)`);
  } else if (areAdjacentNiches(creatorTerms, brandTerms)) {
    nicheFit = 10;
    signals.push("Adjacent niche detected");
  } else {
    nicheFit = 2;
    signals.push("No niche overlap found");
  }

  // ---- 2. Audience Fit (0-25) ----
  const targetAudience = safeStr(brand.target_audience);
  const creatorBio = safeStr(creator.bio);
  const creatorThemes = toLowerArray(creator.content_themes).join(" ");
  const creatorText = `${creatorBio} ${creatorThemes}`;

  let audienceFit = 5; // base

  // Age-demographic keyword matching
  const ageTerms = ["gen z", "gen-z", "millennial", "gen x", "gen-x", "boomer", "teen", "young adult", "18-24", "25-34", "35-44"];
  for (const term of ageTerms) {
    if (targetAudience.includes(term) && creatorText.includes(term)) {
      audienceFit += 8;
      signals.push(`Age/demographic match: "${term}"`);
      break;
    }
  }

  // Interest keyword matching
  const interestTerms = [
    "fashion", "tech", "beauty", "fitness", "food", "travel", "gaming",
    "music", "sports", "finance", "health", "parenting", "education",
    "entertainment", "lifestyle", "luxury", "sustainability", "wellness",
  ];
  let interestMatches = 0;
  for (const term of interestTerms) {
    if (targetAudience.includes(term) && creatorText.includes(term)) {
      interestMatches++;
      if (interestMatches <= 3) {
        signals.push(`Interest match: "${term}"`);
      }
    }
  }
  audienceFit += Math.min(interestMatches * 4, 12);
  audienceFit = Math.min(audienceFit, 25);

  // ---- 3. Brand Voice Fit (0-25) ----
  const brandVoiceText = [
    safeStr(brand.brand_voice),
    safeStr(brand.tone),
    safeStr(brand.description),
    safeStr(brand.tagline),
  ].join(" ");
  const creatorVoiceText = [
    creatorBio,
    creatorThemes,
    safeStr(creator.tagline),
    safeStr(creator.description),
  ].join(" ");

  const brandTones = detectTones(brandVoiceText);
  const creatorTones = detectTones(creatorVoiceText);

  let brandVoiceFit = 5; // base
  const sharedTones = brandTones.filter((t) => creatorTones.includes(t));

  if (sharedTones.length > 0) {
    brandVoiceFit = 20;
    signals.push(`Shared voice tones: ${sharedTones.join(", ")}`);
  } else if (brandTones.length > 0 || creatorTones.length > 0) {
    brandVoiceFit = 8;
    signals.push("Partial voice alignment detected");
  }
  brandVoiceFit = Math.min(brandVoiceFit, 25);

  // ---- 4. Track Record (0-25) ----
  const pastDeals: any[] = Array.isArray(creator.past_brand_deals)
    ? creator.past_brand_deals
    : [];

  let trackRecord = 5; // base
  trackRecord += Math.min(pastDeals.length * 2, 10);

  if (pastDeals.length > 0) {
    signals.push(`${pastDeals.length} past brand deal(s) on record`);
  }

  // Bonus if past deals include brands in same industry
  const brandIndustry = safeStr(brand.industry);
  if (brandIndustry) {
    const sameIndustryDeals = pastDeals.filter((d: any) => {
      const dealIndustry = safeStr(d.industry ?? d.brand_industry ?? d.category ?? "");
      return dealIndustry.includes(brandIndustry) || brandIndustry.includes(dealIndustry);
    });
    if (sameIndustryDeals.length > 0) {
      trackRecord += 10;
      signals.push(`${sameIndustryDeals.length} past deal(s) in same industry`);
    }
  }
  trackRecord = Math.min(trackRecord, 25);

  // ---- Total ----
  const overall = nicheFit + audienceFit + brandVoiceFit + trackRecord;

  return {
    overall,
    breakdown: {
      niche_fit: nicheFit,
      audience_fit: audienceFit,
      brand_voice_fit: brandVoiceFit,
      track_record: trackRecord,
    },
    signals,
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // --- Authenticate ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Parse request ---
    const body = await req.json();
    const { creatorId, brandId, mode, limit: rawLimit } = body;
    const resultLimit = Math.min(rawLimit ?? 20, 100);

    // -----------------------------------------------------------------------
    // Mode: score a specific creator-brand pair
    // -----------------------------------------------------------------------
    if (!mode && creatorId && brandId) {
      const [creatorRes, brandRes] = await Promise.all([
        supabase.from("enriched_creators").select("*").eq("id", creatorId).single(),
        supabase.from("enriched_brands").select("*").eq("id", brandId).single(),
      ]);

      if (creatorRes.error || !creatorRes.data) {
        return Response.json({ error: "Creator not found" }, { status: 404 });
      }
      if (brandRes.error || !brandRes.data) {
        return Response.json({ error: "Brand not found" }, { status: 404 });
      }

      const result = scorePair(creatorRes.data, brandRes.data);

      // Persist the score
      const { error: upsertErr } = await supabase.from("match_scores").upsert(
        {
          creator_id: creatorId,
          brand_id: brandId,
          overall_score: result.overall,
          niche_fit: result.breakdown.niche_fit,
          audience_fit: result.breakdown.audience_fit,
          brand_voice_fit: result.breakdown.brand_voice_fit,
          track_record: result.breakdown.track_record,
          signals: result.signals,
          scored_at: new Date().toISOString(),
        },
        { onConflict: "creator_id,brand_id" },
      );

      if (upsertErr) {
        console.error("[scoreMatch] Upsert error:", upsertErr);
      }

      return Response.json({
        creator_id: creatorId,
        brand_id: brandId,
        overall: result.overall,
        breakdown: result.breakdown,
        signals: result.signals,
      });
    }

    // -----------------------------------------------------------------------
    // Mode: top_creators — find best creators for a given brand
    // -----------------------------------------------------------------------
    if (mode === "top_creators" && brandId) {
      const brandRes = await supabase.from("enriched_brands").select("*").eq("id", brandId).single();
      if (brandRes.error || !brandRes.data) {
        return Response.json({ error: "Brand not found" }, { status: 404 });
      }

      const creatorsRes = await supabase
        .from("enriched_creators")
        .select("*")
        .limit(200);

      if (creatorsRes.error) {
        return Response.json({ error: "Failed to fetch creators" }, { status: 500 });
      }

      const scored = (creatorsRes.data ?? []).map((creator: any) => {
        const result = scorePair(creator, brandRes.data);
        return {
          creator_id: creator.id,
          creator_name: creator.name ?? creator.username ?? creator.platform_username ?? null,
          overall: result.overall,
          breakdown: result.breakdown,
          signals: result.signals,
        };
      });

      scored.sort((a: any, b: any) => b.overall - a.overall);
      const topResults = scored.slice(0, resultLimit);

      // Batch upsert top scores
      const upsertRows = topResults.map((r: any) => ({
        creator_id: r.creator_id,
        brand_id: brandId,
        overall_score: r.overall,
        niche_fit: r.breakdown.niche_fit,
        audience_fit: r.breakdown.audience_fit,
        brand_voice_fit: r.breakdown.brand_voice_fit,
        track_record: r.breakdown.track_record,
        signals: r.signals,
        scored_at: new Date().toISOString(),
      }));

      const { error: batchErr } = await supabase
        .from("match_scores")
        .upsert(upsertRows, { onConflict: "creator_id,brand_id" });

      if (batchErr) {
        console.error("[scoreMatch] Batch upsert error:", batchErr);
      }

      return Response.json({
        brand_id: brandId,
        mode: "top_creators",
        count: topResults.length,
        results: topResults,
      });
    }

    // -----------------------------------------------------------------------
    // Mode: top_brands — find best brands for a given creator
    // -----------------------------------------------------------------------
    if (mode === "top_brands" && creatorId) {
      const creatorRes = await supabase
        .from("enriched_creators")
        .select("*")
        .eq("id", creatorId)
        .single();

      if (creatorRes.error || !creatorRes.data) {
        return Response.json({ error: "Creator not found" }, { status: 404 });
      }

      const brandsRes = await supabase
        .from("enriched_brands")
        .select("*")
        .limit(200);

      if (brandsRes.error) {
        return Response.json({ error: "Failed to fetch brands" }, { status: 500 });
      }

      const scored = (brandsRes.data ?? []).map((brand: any) => {
        const result = scorePair(creatorRes.data, brand);
        return {
          brand_id: brand.id,
          brand_name: brand.name ?? brand.brand_name ?? null,
          overall: result.overall,
          breakdown: result.breakdown,
          signals: result.signals,
        };
      });

      scored.sort((a: any, b: any) => b.overall - a.overall);
      const topResults = scored.slice(0, resultLimit);

      // Batch upsert top scores
      const upsertRows = topResults.map((r: any) => ({
        creator_id: creatorId,
        brand_id: r.brand_id,
        overall_score: r.overall,
        niche_fit: r.breakdown.niche_fit,
        audience_fit: r.breakdown.audience_fit,
        brand_voice_fit: r.breakdown.brand_voice_fit,
        track_record: r.breakdown.track_record,
        signals: r.signals,
        scored_at: new Date().toISOString(),
      }));

      const { error: batchErr } = await supabase
        .from("match_scores")
        .upsert(upsertRows, { onConflict: "creator_id,brand_id" });

      if (batchErr) {
        console.error("[scoreMatch] Batch upsert error:", batchErr);
      }

      return Response.json({
        creator_id: creatorId,
        mode: "top_brands",
        count: topResults.length,
        results: topResults,
      });
    }

    // -----------------------------------------------------------------------
    // Invalid request
    // -----------------------------------------------------------------------
    return Response.json(
      {
        error: "Invalid request. Provide {creatorId, brandId}, {mode: 'top_creators', brandId}, or {mode: 'top_brands', creatorId}.",
      },
      { status: 400 },
    );
  } catch (err) {
    console.error("[scoreMatch] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 },
    );
  }
});

// populateBrands — Uses curated brand list + GrowMeOrganic enrichment
// No Claude API needed. Zero AI costs.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BRAND_LIST } from "./brandList.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GMO_API_KEY = Deno.env.get("GROWMEORGANIC_API_KEY") || "";
const GMO_BASE = "https://myapiconnect.com/api-product/incoming-webhook";

async function enrichWithGMO(domain: string): Promise<any> {
  if (!GMO_API_KEY || !domain) return null;
  try {
    const res = await fetch(`${GMO_BASE}/enrich-company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: GMO_API_KEY, domain }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey" },
    });
  }

  const corsHeaders = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    // Admin auth
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader);
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const clearExisting = body.clear_existing !== false;
    const offset = body.offset || 0;
    const batchSize = body.batch_size || 3;

    // Get all industry keys
    const allIndustries = Object.keys(BRAND_LIST);

    // Clear on first batch
    if (clearExisting && offset === 0) {
      await supabase.from("brands").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateBrands] Cleared existing brands");
    }

    const batch = allIndustries.slice(offset, offset + batchSize);
    const hasMore = offset + batchSize < allIndustries.length;
    let totalInserted = 0;
    const errors: string[] = [];

    for (const industry of batch) {
      const brands = BRAND_LIST[industry] || [];
      console.log(`[populateBrands] Processing: ${industry} (${brands.length} brands)`);

      for (const brand of brands) {
        try {
          // Try GMO enrichment for extra data
          let gmoData: any = null;
          if (brand.domain && GMO_API_KEY) {
            gmoData = await enrichWithGMO(brand.domain);
          }

          const { error: insertErr } = await supabase.from("brands").insert({
            name: brand.name,
            domain: brand.domain,
            description: gmoData?.description || null,
            industry,
            company_size: gmoData?.company_size || gmoData?.size || null,
            location: gmoData?.location || gmoData?.city || null,
            contact_email: gmoData?.email || gmoData?.contact_email || null,
            annual_budget: null,
            logo_url: gmoData?.logo || gmoData?.logo_url || null,
            created_by: "system_populate",
          });

          if (insertErr) {
            console.error(`[populateBrands] Insert error ${brand.name}:`, insertErr.message);
            errors.push(`${brand.name}: ${insertErr.message}`);
          } else {
            totalInserted++;
          }
        } catch (err) {
          console.error(`[populateBrands] Error ${brand.name}:`, err);
          errors.push(`${brand.name}: ${String(err)}`);
        }
      }
      console.log(`[populateBrands] ${industry}: done`);
    }

    return new Response(JSON.stringify({
      success: true,
      total_inserted: totalInserted,
      industries_processed: batch.length,
      offset,
      next_offset: hasMore ? offset + batchSize : null,
      total_industries: allIndustries.length,
      has_more: hasMore,
      progress: `${Math.min(offset + batchSize, allIndustries.length)}/${allIndustries.length}`,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    }), { headers: corsHeaders });

  } catch (error) {
    console.error("[populateBrands] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

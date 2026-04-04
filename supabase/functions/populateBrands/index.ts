// populateBrands — Uses curated brand list + GrowMeOrganic enrichment
// GMO returns company data AND employee contacts in one call
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
    if (!res.ok) {
      console.error(`[GMO] Error for ${domain}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data.state || !data.employees?.length) {
      console.log(`[GMO] No data for ${domain}`);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[GMO] Fetch error for ${domain}:`, err);
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
    const batchSize = body.batch_size || 2; // 2 industries per call (GMO calls take time)

    const allIndustries = Object.keys(BRAND_LIST);

    // Clear on first batch
    if (clearExisting && offset === 0) {
      await supabase.from("decision_makers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("brands").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateBrands] Cleared existing brands and contacts");
    }

    const batch = allIndustries.slice(offset, offset + batchSize);
    const hasMore = offset + batchSize < allIndustries.length;
    let totalBrandsInserted = 0;
    let totalContactsInserted = 0;
    const errors: string[] = [];

    for (const industry of batch) {
      const brands = BRAND_LIST[industry] || [];
      console.log(`[populateBrands] Processing: ${industry} (${brands.length} brands)`);

      for (const brand of brands) {
        try {
          // Call GMO to get company data + employees
          const gmoData = await enrichWithGMO(brand.domain);
          const emp = gmoData?.employees?.[0]; // first employee has company-level data

          // Serialize extended fields into description JSON
          const descriptionJson = JSON.stringify({
            _desc: "",
            _linkedin: emp?.company_linkedin_url || "",
            _founded: emp?.company_founded ? String(emp.company_founded).replace(".0", "") : "",
            _type: emp?.company_type || "",
            _country: emp?.company_country || "",
          });

          // Insert brand
          const { data: insertedBrand, error: insertErr } = await supabase.from("brands").insert({
            name: brand.name,
            domain: brand.domain,
            description: descriptionJson,
            industry: emp?.company_industry || industry,
            company_size: emp?.company_size || null,
            location: emp?.company_address || null,
            contact_email: emp?.email_format || null,
            annual_budget: null,
            logo_url: null,
            created_by: "system_populate",
          }).select("id").single();

          if (insertErr) {
            console.error(`[populateBrands] Insert error ${brand.name}:`, insertErr.message);
            errors.push(`${brand.name}: ${insertErr.message}`);
            continue;
          }

          totalBrandsInserted++;
          const brandId = insertedBrand?.id;

          // Insert employees as decision_makers
          if (gmoData?.employees && brandId) {
            for (const employee of gmoData.employees.slice(0, 20)) { // max 20 contacts per brand
              try {
                await supabase.from("decision_makers").insert({
                  brand_name: brand.name,
                  brand_id: brandId,
                  full_name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || "Unknown",
                  role_title: employee.job_title || employee.headline || "Unknown",
                  role_tier: "1",
                  email: employee.business_email || null,
                  email_confidence: employee.business_email ? 0.85 : 0,
                  phone: employee.phone || null,
                  linkedin_url: typeof employee.social_url === "string" ? employee.social_url : null,
                  source: { type: "gmo_enrichment", industry },
                  verified: true,
                });
                totalContactsInserted++;
              } catch {
                // skip duplicate contacts
              }
            }
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
      total_inserted: totalBrandsInserted,
      contacts_inserted: totalContactsInserted,
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

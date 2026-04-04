// GrowMeOrganic: Enrich company by domain or name
// Returns company info, contacts, emails from GMO's 15M+ company database
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GMO_API_KEY = Deno.env.get("GROWMEORGANIC_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GMO_BASE = "https://myapiconnect.com/api-product/incoming-webhook";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey" },
    });
  }

  try {
    // Auth
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, authHeader);
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { domain, company_name } = body;

    if (!domain && !company_name) {
      return Response.json({ error: "Provide domain or company_name" }, { status: 400 });
    }

    let gmoResult: any = null;

    // Strategy 1: Enrich by domain
    if (domain) {
      const res = await fetch(`${GMO_BASE}/enrich-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: GMO_API_KEY, domain }),
      });
      gmoResult = await res.json();
    }

    // Strategy 2: Convert company name to domain, then enrich
    if (!gmoResult && company_name) {
      const res = await fetch(`${GMO_BASE}/convert-company-names`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: GMO_API_KEY, company_name }),
      });
      gmoResult = await res.json();
    }

    // Also extract emails from the website
    let websiteEmails: any = null;
    const websiteUrl = domain ? `https://${domain}` : null;
    if (websiteUrl) {
      try {
        const res = await fetch(`${GMO_BASE}/extract-emails-from-urls`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: GMO_API_KEY, url: websiteUrl }),
        });
        websiteEmails = await res.json();
      } catch { /* non-blocking */ }
    }

    // Save to enriched_brands if we got data
    if (gmoResult && !gmoResult.error) {
      await supabase.from("enriched_brands").upsert({
        user_id: user.id,
        company_name: gmoResult.company_name || gmoResult.name || company_name || domain,
        website_url: websiteUrl || gmoResult.website || gmoResult.domain,
        industry: gmoResult.industry || gmoResult.category || null,
        social_links: gmoResult.social_links || gmoResult.socials || null,
        enrichment_raw: { gmo: gmoResult, website_emails: websiteEmails },
        last_enriched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return Response.json({
      success: true,
      company: gmoResult,
      website_emails: websiteEmails,
    }, { headers: { "Access-Control-Allow-Origin": "*" } });

  } catch (error) {
    console.error("gmoEnrichCompany error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});

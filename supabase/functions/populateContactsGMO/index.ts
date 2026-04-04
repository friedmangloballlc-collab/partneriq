// populateContactsGMO — Adds GMO contacts to existing brands WITHOUT re-creating brands
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GMO_API_KEY = Deno.env.get("GROWMEORGANIC_API_KEY") || "";
const GMO_BASE = "https://myapiconnect.com/api-product/incoming-webhook";

// Job titles we want — lowercase for matching
const RELEVANT_TITLES = [
  // Partnerships, Sponsorships, Activations
  "partnership", "sponsor", "activation", "business development", "brand partnership",
  "strategic partner", "commercial", "licensing", "affiliate", "co-marketing",
  "integrated marketing",
  // Marketing, Brand
  "cmo", "chief marketing", "vp marketing", "marketing director", "brand marketing",
  "influencer marketing", "marketing manager", "marketing specialist", "digital marketing",
  // Advertising, Sales
  "vp sales", "head of advertising", "chief revenue", "ad sales", "revenue officer",
  // Digital, Social, Audience, Growth
  "head of digital", "digital partner", "social media director", "digital strategy",
  "audience development", "vp growth", "growth", "audience engagement",
  // Content, Creative
  "creative director", "content strategy", "programming", "executive producer",
  "podcast", "head of video", "video partner", "newsletter", "host",
  // Editorial
  "editor-in-chief", "managing editor", "executive editor", "editorial director",
  "editor in chief",
  // Communications, PR
  "communications", "pr director", "public relations",
  // Events, Booking
  "events director", "head of programming", "vp events", "booking",
  "guest submission", "speaker bureau",
  // Management
  "ceo", "founder", "general manager", "talent manager", "chief executive",
  // Talent, Agency
  "agent", "publicist", "talent rep", "talent agency",
  // Other relevant
  "client services", "client relations",
];

function isRelevantContact(jobTitle: string): boolean {
  if (!jobTitle) return false;
  const lower = jobTitle.toLowerCase();
  return RELEVANT_TITLES.some(title => lower.includes(title));
}

async function enrichWithGMO(domain: string): Promise<any> {
  if (!GMO_API_KEY || !domain) return null;
  try {
    const res = await fetch(`${GMO_BASE}/enrich-company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: GMO_API_KEY, domain }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.state || !data.employees?.length) return null;
    return data;
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
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader);
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const offset = body.offset || 0;
    const batchSize = body.batch_size || 10;
    const clearExisting = body.clear_existing !== false;

    // Clear contacts on first batch
    if (clearExisting && offset === 0) {
      await supabase.from("decision_makers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateContactsGMO] Cleared existing contacts");
    }

    // Get brands that need contacts
    const { data: brands, error: brandsErr } = await supabase
      .from("brands")
      .select("id, name, domain")
      .not("domain", "is", null)
      .order("name")
      .range(offset, offset + batchSize - 1);

    if (brandsErr || !brands?.length) {
      return new Response(JSON.stringify({ success: true, message: "No more brands", total_contacts: 0 }), { headers: corsHeaders });
    }

    let totalContacts = 0;
    const errors: string[] = [];

    for (const brand of brands) {
      if (!brand.domain) continue;
      try {
        const gmoData = await enrichWithGMO(brand.domain);
        if (!gmoData?.employees) continue;

        for (const emp of gmoData.employees) {
          try {
            await supabase.from("decision_makers").insert({
              brand_name: brand.name,
              company_domain: brand.domain,
              full_name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Unknown",
              role_title: emp.job_title || emp.headline || "Unknown",
              role_tier: "1",
              email: emp.business_email || null,
              email_confidence: emp.business_email ? 0.85 : 0,
              phone: emp.phone || null,
              linkedin_url: typeof emp.social_url === "string" ? emp.social_url : null,
              source: JSON.stringify({ type: "gmo_enrichment" }),
              person_first_name: emp.first_name || null,
              person_last_name: emp.last_name || null,
              person_headline: emp.headline || null,
              person_location: emp.location || null,
              person_business_email: emp.business_email || null,
              person_personal_email: emp.personal_email || null,
              person_city: emp.city || null,
              person_linkedin_id: emp.linkedin_id ? String(emp.linkedin_id) : null,
              person_company_name: emp.company_name || brand.name,
              company_meta_phones: emp.company_phone || null,
              person_picture: emp.picture || null,
              person_skills: Array.isArray(emp.skills) ? emp.skills.filter(Boolean) : null,
              person_connections: emp.connections_count || null,
            });
            totalContacts++;
          } catch { /* skip duplicates */ }
        }
        console.log(`[populateContactsGMO] ${brand.name}: added contacts`);
      } catch (err) {
        errors.push(`${brand.name}: ${String(err)}`);
      }
    }

    const { count: totalBrands } = await supabase.from("brands").select("id", { count: "exact", head: true });
    const nextOffset = offset + batchSize;
    const hasMore = nextOffset < (totalBrands || 0);

    return new Response(JSON.stringify({
      success: true,
      contacts_added: totalContacts,
      brands_processed: brands.length,
      offset,
      next_offset: hasMore ? nextOffset : null,
      total_brands: totalBrands,
      has_more: hasMore,
      progress: `${Math.min(nextOffset, totalBrands || 0)}/${totalBrands}`,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    }), { headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

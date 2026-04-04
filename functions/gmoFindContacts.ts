// GrowMeOrganic: Find contact emails by name + company domain
// Powers the Contact Finder feature in PartnerIQ
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GMO_API_KEY = Deno.env.get("GROWMEORGANIC_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GMO_BASE = "https://myapiconnect.com/api-product/incoming-webhook";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" },
    });
  }

  try {
    // Auth
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userClient = createClient(SUPABASE_URL, authHeader);
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { contacts, domain, url } = body;

    // Mode 1: Find emails for specific people at a company
    // Input: { contacts: [{ first_name, last_name }], domain: "company.com" }
    if (contacts && domain && Array.isArray(contacts)) {
      const results = [];

      for (const contact of contacts.slice(0, 10)) { // cap at 10 per request
        try {
          const res = await fetch(`${GMO_BASE}/find-emails-first-last`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: GMO_API_KEY,
              first_name: contact.first_name,
              last_name: contact.last_name,
              domain,
            }),
          });
          const data = await res.json();
          results.push({
            first_name: contact.first_name,
            last_name: contact.last_name,
            domain,
            ...data,
          });
        } catch (err) {
          results.push({
            first_name: contact.first_name,
            last_name: contact.last_name,
            domain,
            error: String(err),
          });
        }
      }

      return Response.json({ success: true, results }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Mode 2: Extract all emails from a website URL
    // Input: { url: "https://company.com" }
    if (url) {
      const res = await fetch(`${GMO_BASE}/extract-emails-from-urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: GMO_API_KEY, url }),
      });
      const data = await res.json();

      return Response.json({ success: true, results: data }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Mode 3: Find email for a single person
    // Input: { first_name, last_name, domain }
    if (body.first_name && body.last_name && body.domain) {
      const res = await fetch(`${GMO_BASE}/find-emails-first-last`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: GMO_API_KEY,
          first_name: body.first_name,
          last_name: body.last_name,
          domain: body.domain,
        }),
      });
      const data = await res.json();

      return Response.json({ success: true, ...data }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return Response.json({ error: "Provide contacts+domain, url, or first_name+last_name+domain" }, { status: 400 });

  } catch (error) {
    console.error("gmoFindContacts error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});

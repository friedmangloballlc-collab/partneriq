// Edge Function: populateContacts
// Generates decision-maker contacts for every brand in the database.
// Uses Claude to identify real people in partnership/sponsorship roles,
// then GMO to verify their emails.
// Admin-only. Run after populateBrands.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const GMO_API_KEY = Deno.env.get("GROWMEORGANIC_API_KEY") || "";
const GMO_BASE = "https://myapiconnect.com/api-product/incoming-webhook";

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
  const data = await res.json();
  return data.content?.[0]?.text || "[]";
}

async function findEmailViaGMO(firstName: string, lastName: string, domain: string): Promise<string | null> {
  if (!GMO_API_KEY || !firstName || !domain) return null;
  try {
    const res = await fetch(`${GMO_BASE}/find-emails-first-last`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: GMO_API_KEY, first_name: firstName, last_name: lastName, domain }),
    });
    const data = await res.json();
    return data?.email || data?.results?.email || null;
  } catch {
    return null;
  }
}

// All the role titles the user wants populated, organized by priority
const ROLE_CATEGORIES = `
Priority 1 — Partnerships, Sponsorships, Activations:
Head/VP of Sponsorships, Head/VP of Partnerships, Director of Sponsorship Sales, VP of Business Development, Head of Brand Activations, Chief Revenue Officer, Brand Partnerships Manager, Chief Partnership Officer, VP of Integrated Marketing, Director of Strategic Partnerships, Sponsorship Manager, VP of Sponsorship Sales, Commercial Director, VP of Commercial Partnerships

Priority 2 — Marketing, Brand:
CMO, VP of Marketing, Marketing Director, Head of Brand Marketing, Influencer Marketing Manager, Marketing Specialist

Priority 3 — Digital, Social, Audience:
Head of Digital, Digital Partnerships Manager, Social Media Director, VP of Digital Strategy, Head of Audience Development, VP of Growth, Director of Audience Engagement

Priority 4 — Content, Creative, Editorial:
Creative Director, Head of Content Strategy, VP of Programming, Editor-in-Chief, Managing Editor, Executive Editor, Editorial Director, Executive Producer

Priority 5 — Advertising, Sales:
VP of Sales, Head of Advertising, Chief Revenue Officer, Director of Ad Sales, Head of Podcast Sales, Head of Video, Video Partnerships Manager

Priority 6 — Communications, PR:
Head of Communications, PR Director, VP of Public Relations

Priority 7 — Events, Booking:
Events Director, Head of Programming, VP of Events, Booking Manager

Priority 8 — Management:
CEO/Founder (for smaller companies), General Manager, Talent Manager

Priority 9 — Other Relevant:
Head of Licensing, Head of Newsletter Partnerships, Client Services Director, Director of Client Relations, Agent, Manager, Publicist
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey" } });
  }

  try {
    // Admin auth
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: { user } } = await supabase.auth.getUser(authHeader);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const clearExisting = body.clear_existing !== false;
    const batchSize = body.batch_size || 5; // process N brands per run
    const offset = body.offset || 0;

    // Clear existing contacts if requested
    if (clearExisting && offset === 0) {
      await supabase.from("decision_makers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateContacts] Cleared system-populated contacts");
    }

    // Get brands to process
    const { data: brands, error: brandsErr } = await supabase
      .from("brands")
      .select("id, name, domain, industry, company_size")
      .order("name")
      .range(offset, offset + batchSize - 1);

    if (brandsErr || !brands?.length) {
      return Response.json({ success: true, message: "No more brands to process", total_processed: 0 }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    let totalContacts = 0;
    const errors: string[] = [];

    for (const brand of brands) {
      try {
        const prompt = `For the real company "${brand.name}" (domain: ${brand.domain || "unknown"}, industry: ${brand.industry || "unknown"}, size: ${brand.company_size || "unknown"}), identify ALL decision-makers across every relevant department.

You MUST provide contacts for EVERY one of these departments that applies to this company. Provide as many real people as you can identify. For roles where you don't know the specific person, still include the role with full_name as null.

DEPARTMENTS AND ROLES TO COVER:

1. PARTNERSHIPS, SPONSORSHIPS, ACTIVATIONS:
Head/VP of Partnerships, Director of Strategic Partnerships, VP of Business Development, Head of Brand Activations, Director of Sponsorships, Head of Sponsorships, VP of Sponsorship Sales, Sponsorship Manager, Chief Partnership Officer, VP of Integrated Marketing, Brand Partnerships Manager, Commercial Director, VP of Commercial Partnerships, Head of Licensing, Co-Marketing Contact

2. MARKETING, BRAND:
CMO, VP of Marketing, Marketing Director, Head of Brand Marketing, Influencer Marketing Manager, Marketing Specialist, Digital Marketing Intern

3. ADVERTISING, SALES:
VP of Sales, Head of Advertising, Chief Revenue Officer, Director of Ad Sales

4. DIGITAL, SOCIAL, AUDIENCE, GROWTH:
Head of Digital, Digital Partnerships Manager, Social Media Director, VP of Digital Strategy, Head of Audience Development, VP of Growth, Director of Audience Engagement

5. CONTENT, CREATIVE:
Creative Director, Head of Content Strategy, VP of Programming, Executive Producer, Head of Video, Video Partnerships Manager, Newsletter Editor, Head of Newsletter Partnerships

6. EDITORIAL:
Editor-in-Chief, Managing Editor, Executive Editor, Editorial Director

7. COMMUNICATIONS, PR:
Head of Communications, PR Director, VP of Public Relations

8. EVENTS, BOOKING:
Events Director, Head of Programming, VP of Events, Booking Manager, Podcast Booking, Guest Submission Contact, Speaker Bureau

9. MANAGEMENT:
CEO/Founder, General Manager, Talent Manager

10. TALENT, AGENCY:
Agent, Manager, Publicist, Talent Rep, Talent Agency Contact

11. OTHER:
Affiliate Partnerships Contact, Syndication/Licensing Contact, Client Services Director, Director of Client Relations, Head of Podcast Sales

Return ONLY a valid JSON array. Each object must have:
- "full_name": the person's real full name if confident, or null
- "role_title": their exact job title
- "role_tier": priority number 1-9 based on hierarchy above (1=partnerships, 2=marketing, etc.)
- "email_pattern": likely email format (e.g., "firstname.lastname@domain.com") or null
- "linkedin_url": their LinkedIn URL if known, or null
- "department": one of: partnerships, marketing, advertising, digital, content, editorial, communications, events, management, talent, other

Generate 15-25 contacts per company. Cover EVERY department listed above that is relevant to this company. For large companies (enterprise), aim for 20-25. For smaller companies, 10-15.
Only include people you believe actually work at this company based on your training data.
Do NOT make up names — use null for likely_name if unsure.`;

        const text = await callClaude(prompt);
        const contacts = JSON.parse(text.replace(/```json?|```/g, "").trim());

        if (!Array.isArray(contacts)) continue;

        for (const contact of contacts) {
          // Try to verify email via GMO
          let verifiedEmail: string | null = null;
          if (contact.full_name && brand.domain) {
            const nameParts = contact.full_name.split(/\s+/);
            verifiedEmail = await findEmailViaGMO(
              nameParts[0] || "",
              nameParts.slice(1).join(" ") || "",
              brand.domain
            );
          }

          await supabase.from("decision_makers").insert({
            brand_name: brand.name,
            full_name: contact.full_name || contact.role_title,
            role_title: contact.role_title,
            role_tier: String(contact.role_tier || 5),
            email: verifiedEmail || contact.email_pattern || null,
            email_confidence: verifiedEmail ? 0.85 : (contact.email_pattern ? 0.40 : 0),
            linkedin_url: contact.linkedin_url || null,
            source: { type: "system_populate", department: contact.department || null },
          }).catch(() => {}); // skip duplicates

          totalContacts++;
        }

        console.log(`[populateContacts] ${brand.name}: added contacts`);
      } catch (err) {
        errors.push(`${brand.name}: ${String(err)}`);
      }
    }

    // Get total brand count for progress tracking
    const { count: totalBrands } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true });

    const nextOffset = offset + batchSize;
    const hasMore = nextOffset < (totalBrands || 0);

    return Response.json({
      success: true,
      brands_processed: brands.length,
      contacts_added: totalContacts,
      offset,
      next_offset: hasMore ? nextOffset : null,
      total_brands: totalBrands,
      progress: `${Math.min(nextOffset, totalBrands || 0)}/${totalBrands}`,
      has_more: hasMore,
      errors: errors.length > 0 ? errors : undefined,
    }, { headers: { "Access-Control-Allow-Origin": "*" } });

  } catch (error) {
    console.error("populateContacts error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});

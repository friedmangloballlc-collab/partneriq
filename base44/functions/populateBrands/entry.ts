// Edge Function: populateBrands
// Populates the brands table with real, verified companies across all relevant industries.
// Uses Claude to generate accurate brand data, then GMO to enrich with real contact info.
// Admin-only endpoint.

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
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "[]";
}

async function enrichWithGMO(domain: string): Promise<any> {
  if (!GMO_API_KEY || !domain) return null;
  try {
    const res = await fetch(`${GMO_BASE}/enrich-company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: GMO_API_KEY, domain }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// Industries and the type of brands that work with creators in each
const INDUSTRIES = [
  { niche: "fashion", prompt: "major fashion and apparel brands that actively work with influencers and creators for partnerships, sponsorships, and campaigns. Include luxury, streetwear, athletic wear, and fast fashion. Focus on brands with active influencer programs." },
  { niche: "beauty", prompt: "beauty, skincare, cosmetics, and personal care brands that actively run influencer marketing campaigns. Include prestige beauty, indie brands, and mass market. Focus on brands known for creator partnerships." },
  { niche: "tech", prompt: "technology companies, SaaS brands, consumer electronics, and app companies that work with creators and influencers for product launches, reviews, and sponsorships." },
  { niche: "fitness", prompt: "fitness, activewear, supplements, gym equipment, and wellness brands that partner with fitness influencers, athletes, and health creators." },
  { niche: "food", prompt: "food and beverage brands, restaurant chains, CPG food companies, meal kit services, and alcohol brands that run influencer campaigns and creator partnerships." },
  { niche: "travel", prompt: "travel brands including airlines, hotels, tourism boards, luggage companies, travel apps, and booking platforms that work with travel influencers and content creators." },
  { niche: "gaming", prompt: "gaming companies, game publishers, gaming hardware brands, esports organizations, and streaming platforms that sponsor gamers and gaming content creators." },
  { niche: "lifestyle", prompt: "lifestyle brands including home decor, furniture, household products, subscription boxes, and general consumer brands that partner with lifestyle influencers." },
  { niche: "finance", prompt: "fintech companies, banking apps, investment platforms, crypto exchanges, insurance companies, and financial services brands that work with finance influencers and educators." },
  { niche: "education", prompt: "edtech companies, online course platforms, learning apps, educational publishers, and university programs that partner with educational content creators." },
  { niche: "entertainment", prompt: "entertainment companies, streaming services, movie studios, music labels, podcast networks, and media companies that work with creators for promotion." },
  { niche: "sports", prompt: "sports brands, athletic teams, sports media companies, sports betting platforms, and athletic equipment brands that partner with sports influencers and athletes." },
  { niche: "music", prompt: "music streaming platforms, record labels, music gear brands, music education platforms, and concert/festival promoters that work with music creators." },
  { niche: "health", prompt: "health and wellness brands, telehealth companies, mental health apps, vitamin/supplement brands, and healthcare companies that partner with health influencers." },
  { niche: "business", prompt: "B2B SaaS companies, business tools, productivity apps, CRM platforms, and professional services that work with business influencers and thought leaders." },
  { niche: "parenting", prompt: "baby product brands, kids clothing companies, toy manufacturers, family-focused apps, parenting platforms, family car brands, and children's education companies that work with parenting and family influencers." },
  { niche: "pets", prompt: "pet food brands, pet insurance companies, pet tech products, grooming brands, pet toy manufacturers, and veterinary service companies that partner with pet influencers and animal content creators." },
  { niche: "automotive", prompt: "car manufacturers, electric vehicle brands, auto parts companies, car care product brands, rideshare platforms, and automotive media companies that work with car reviewers and auto influencers." },
  { niche: "real_estate", prompt: "real estate platforms, mortgage companies, home improvement brands, moving services, interior design companies, and PropTech startups that partner with real estate and home influencers." },
  { niche: "wedding", prompt: "wedding planning platforms, bridal wear brands, venue booking services, wedding registry companies, jewelry brands, and event planning companies that work with wedding and event content creators." },
  { niche: "art_design", prompt: "art supply brands, graphic design software companies, NFT and digital art platforms, print-on-demand services, and creative tool companies that partner with artists and design influencers." },
  { niche: "photography", prompt: "camera and lens manufacturers, photo editing software companies, printing services, stock photography platforms, drone companies, and photography accessory brands that work with photography creators." },
  { niche: "diy_home", prompt: "hardware store chains, power tool brands, paint companies, garden and landscaping brands, smart home device makers, and home renovation companies that partner with DIY and home improvement creators." },
  { niche: "sustainability", prompt: "eco-friendly product brands, clean beauty companies, sustainable fashion labels, electric vehicle brands, solar energy companies, reusable product makers, and carbon offset platforms that work with sustainability and eco influencers." },
  { niche: "crypto_web3", prompt: "cryptocurrency exchanges, crypto wallet companies, DeFi platforms, NFT marketplaces, blockchain infrastructure companies, and Web3 gaming studios that partner with crypto and Web3 content creators." },
  { niche: "outdoor_adventure", prompt: "outdoor gear brands, camping equipment companies, hiking and trail brands, ski resort chains, adventure travel companies, and extreme sports equipment makers that work with outdoor and adventure influencers." },
  { niche: "luxury", prompt: "luxury fashion houses, premium watch brands, luxury car manufacturers, five-star hotel chains, premium spirits and wine brands, luxury jewelry companies, and high-end lifestyle brands that partner with luxury lifestyle influencers." },
  { niche: "food_beverage", prompt: "energy drink brands, coffee companies, snack brands, alcohol and spirits companies, water and beverage brands, and fast food chains that specifically run large influencer marketing campaigns." },
  { niche: "saas_tools", prompt: "project management tools, email marketing platforms, social media management tools, website builders, hosting companies, design tools like Canva and Figma, and developer tools that work with tech and productivity creators." },
  { niche: "dating_social", prompt: "dating app companies, social networking platforms, messaging apps, community platforms, and social discovery apps that partner with lifestyle and relationship content creators." },
  { niche: "kids_family", prompt: "children's entertainment companies, kids YouTube channel networks, educational toy brands, children's streaming services, family travel brands, and kids fashion labels that work with family and kid-focused creators." },
  { niche: "legal_professional", prompt: "legal tech companies, professional development platforms, networking apps, resume and career services, business coaching platforms, and professional certification companies that work with career and professional development influencers." },
  { niche: "nonprofit_cause", prompt: "major nonprofit organizations, charitable foundations, cause marketing agencies, CSR consulting firms, social impact platforms, and advocacy organizations that partner with influencers for awareness campaigns." },
  { niche: "skincare_derma", prompt: "dermatologist-backed skincare brands, acne treatment companies, anti-aging product lines, sunscreen brands, clinical skincare companies, and medical aesthetics brands that work with skincare influencers and dermatology creators." },
  { niche: "streetwear_urban", prompt: "streetwear brands, sneaker companies, urban fashion labels, skateboard and BMX brands, hip-hop clothing lines, and limited-edition drop brands that partner with streetwear and urban culture influencers." },
  { niche: "mental_health", prompt: "therapy and counseling platforms, meditation and mindfulness apps, mental health startups, journaling apps, stress management tools, and emotional wellness brands that work with mental health advocates and wellness creators." },
  { niche: "airlines_travel", prompt: "major airlines, airline loyalty programs, private aviation companies, and airport lounge brands that sponsor travel influencers and content creators for flight reviews, destination content, and travel partnerships." },
  { niche: "hospitality", prompt: "major hotel chains, boutique hotel groups, resort brands, Airbnb competitors, vacation rental platforms, and hospitality management companies that run influencer stay programs and creator partnerships." },
  { niche: "wine_spirits", prompt: "major liquor brands, wine companies, craft beer brands, spirits distributors, cocktail brands, and non-alcoholic beverage alternatives that partner with lifestyle, food, and cocktail content creators." },
  { niche: "cosmetics", prompt: "dedicated cosmetics and makeup brands including foundation, lipstick, eyeshadow companies, professional makeup tool brands, and indie cosmetics labels that run creator partnership and ambassador programs." },
  { niche: "sporting_goods", prompt: "sporting goods retailers, athletic equipment manufacturers, running shoe brands, golf equipment companies, tennis and racquet brands, and outdoor sports equipment makers that sponsor athlete and fitness influencers." },
  { niche: "telecom", prompt: "major mobile carriers, internet service providers, cable companies, 5G technology brands, and mobile device accessory companies that run large-scale influencer marketing campaigns." },
  { niche: "insurance", prompt: "insurtech companies, health insurance marketplaces, car insurance brands, life insurance companies, pet insurance startups, and home insurance platforms that work with finance and lifestyle influencers." },
  { niche: "restaurants", prompt: "major restaurant chains, fast food brands, fast casual restaurants, delivery-only kitchen brands, and restaurant franchise companies that sponsor food creators and run influencer tasting campaigns." },
  { niche: "pharma_otc", prompt: "over-the-counter health product brands, vitamin and supplement companies, allergy medication brands, pain relief brands, and consumer health companies that partner with health and wellness influencers within advertising guidelines." },
  { niche: "elearning", prompt: "online course platforms like Skillshare, Masterclass, and Udemy, coding bootcamps, professional certification platforms, language learning apps, and tutoring marketplaces that sponsor educational content creators." },
  { niche: "clean_energy", prompt: "solar panel companies, EV charging networks, home battery storage brands, renewable energy providers, carbon offset platforms, and green energy startups that work with sustainability and tech influencers." },
  { niche: "jewelry_watches", prompt: "mid-market jewelry brands, watch companies, engagement ring retailers, fashion jewelry labels, custom jewelry makers, and watch subscription services that partner with fashion and lifestyle influencers." },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    // Admin auth check
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const clearExisting = body.clear_existing !== false; // default: clear
    const selectedNiches = body.niches || INDUSTRIES.map(i => i.niche); // default: all

    // Step 1: Clear existing brands if requested
    if (clearExisting) {
      await supabase.from("brands").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("[populateBrands] Cleared existing brands");
    }

    let totalInserted = 0;
    const errors: string[] = [];

    // Step 2: For each industry, ask Claude for real brands
    for (const industry of INDUSTRIES.filter(i => selectedNiches.includes(i.niche))) {
      console.log(`[populateBrands] Processing: ${industry.niche}`);

      try {
        const prompt = `List exactly 25 real, well-known ${industry.prompt}

For each brand, provide ONLY factual, verifiable information. Return ONLY valid JSON array.

Each object must have:
- "name": exact company name
- "domain": their actual website domain (e.g., "nike.com")
- "description": 1-2 sentence factual description of the company
- "industry": "${industry.niche}"
- "company_size": one of "startup", "small", "medium", "large", "enterprise"
- "location": city, state/country of HQ
- "annual_budget": estimated annual influencer marketing budget in USD (number, your best estimate)
- "contact_email": their general partnerships or marketing email if publicly known, otherwise null
- "logo_url": null

IMPORTANT: Only include brands that actually exist and are known to work with influencers/creators. No made-up companies.`;

        const text = await callClaude(prompt);
        const brands = JSON.parse(text.replace(/```json?|```/g, "").trim());

        if (!Array.isArray(brands)) {
          errors.push(`${industry.niche}: Invalid response format`);
          continue;
        }

        // Step 3: Insert brands and optionally enrich with GMO
        for (const brand of brands) {
          try {
            // Try GMO enrichment for extra data
            let gmoData: any = null;
            if (brand.domain && GMO_API_KEY) {
              gmoData = await enrichWithGMO(brand.domain);
              // Don't await too long — skip if slow
            }

            await supabase.from("brands").insert({
              name: brand.name,
              domain: brand.domain,
              description: brand.description || gmoData?.description,
              industry: brand.industry || industry.niche,
              company_size: brand.company_size,
              location: brand.location || gmoData?.location,
              contact_email: gmoData?.email || brand.contact_email,
              annual_budget: brand.annual_budget,
              logo_url: gmoData?.logo || brand.logo_url,
              created_by: "system_populate",
            });
            totalInserted++;
          } catch (insertErr) {
            // Skip duplicates or invalid entries
            console.error(`Failed to insert ${brand.name}:`, insertErr);
          }
        }

        console.log(`[populateBrands] ${industry.niche}: inserted brands from batch`);
      } catch (err) {
        errors.push(`${industry.niche}: ${String(err)}`);
        console.error(`[populateBrands] ${industry.niche} error:`, err);
      }
    }

    return Response.json({
      success: true,
      total_inserted: totalInserted,
      industries_processed: selectedNiches.length,
      errors: errors.length > 0 ? errors : undefined,
    }, { headers: { "Access-Control-Allow-Origin": "*" } });

  } catch (error) {
    console.error("populateBrands error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});

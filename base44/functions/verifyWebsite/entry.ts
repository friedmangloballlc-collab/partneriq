import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crawlUrl } from "./_shared/crawl4ai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Route based on HTTP method
  if (req.method === "POST") {
    return handleGenerateToken(supabaseAdmin, user.id, req);
  } else if (req.method === "GET") {
    return handleCheckVerification(supabaseAdmin, user.id, req);
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});

/**
 * POST: Generate a verification token for website ownership verification.
 */
async function handleGenerateToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  req: Request
): Promise<Response> {
  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return new Response(JSON.stringify({ error: "websiteUrl is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate a unique verification token
    const token = crypto.randomUUID();

    // Insert into verification_tokens table
    const { data: tokenRecord, error: insertError } = await supabase
      .from("verification_tokens")
      .insert({
        user_id: userId,
        website_url: websiteUrl,
        token,
        status: "pending",
        attempts: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create verification token: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        token_id: tokenRecord.id,
        token,
        website_url: websiteUrl,
        instructions: [
          "To verify ownership of this website, complete ONE of the following:",
          "",
          "Option A: Add a meta tag to your homepage <head> section:",
          `  <meta name="dealstage-verify" content="${token}">`,
          "",
          "Option B: Create a text file at the root of your website:",
          `  URL: ${websiteUrl.replace(/\/$/, "")}/.well-known/dealstage-verify.txt`,
          `  Content: ${token}`,
          "",
          "After placing the token, call GET /verifyWebsite?token_id=" + tokenRecord.id,
        ].join("\n"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET: Check if a verification token was placed on the website.
 */
async function handleCheckVerification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  req: Request
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const tokenId = url.searchParams.get("token_id");

    if (!tokenId) {
      return new Response(JSON.stringify({ error: "token_id query parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the verification token record (scoped to the authenticated user)
    const { data: tokenRecord, error: fetchError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("id", tokenId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !tokenRecord) {
      return new Response(
        JSON.stringify({ error: "Verification token not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (tokenRecord.status === "verified") {
      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          method: tokenRecord.verification_method ?? "previously_verified",
          verified_at: tokenRecord.verified_at,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Crawl the website to check for the token
    const websiteUrl = tokenRecord.website_url;
    const token = tokenRecord.token;
    const crawlResult = await crawlUrl(websiteUrl, "bypass");

    const html = crawlResult.html ?? "";
    const markdown = crawlResult.markdown ?? "";
    const combinedContent = `${html}\n${markdown}`;

    // Check for meta tag: <meta name="dealstage-verify" content="{token}">
    const metaTagPattern = new RegExp(
      `<meta\\s+name=["']dealstage-verify["']\\s+content=["']${token}["']`,
      "i"
    );
    const metaTagFound = metaTagPattern.test(html);

    // Check if token appears anywhere in the content (covers txt file and other methods)
    const tokenInContent = combinedContent.includes(token);

    const verified = metaTagFound || tokenInContent;
    let method: string | null = null;

    if (metaTagFound) {
      method = "meta_tag";
    } else if (tokenInContent) {
      method = "content_match";
    }

    // Update the verification_tokens record
    const newAttempts = (tokenRecord.attempts ?? 0) + 1;

    if (verified) {
      await supabase
        .from("verification_tokens")
        .update({
          status: "verified",
          verification_method: method,
          verified_at: new Date().toISOString(),
          attempts: newAttempts,
        })
        .eq("id", tokenId);
    } else {
      await supabase
        .from("verification_tokens")
        .update({ attempts: newAttempts })
        .eq("id", tokenId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        method,
        attempts: newAttempts,
        message: verified
          ? "Website ownership verified successfully."
          : "Token not found on the website. Ensure the meta tag or text file is accessible and try again.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

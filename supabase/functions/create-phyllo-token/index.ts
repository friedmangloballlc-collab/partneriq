import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const PHYLLO_CLIENT_ID = Deno.env.get("PHYLLO_CLIENT_ID");
    const PHYLLO_CLIENT_SECRET = Deno.env.get("PHYLLO_CLIENT_SECRET");

    if (!PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "Phyllo not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { platform } = await req.json();

    // Create a Phyllo SDK token
    // See: https://docs.getphyllo.com/docs/api-reference/create-sdk-token
    const authHeader = btoa(`${PHYLLO_CLIENT_ID}:${PHYLLO_CLIENT_SECRET}`);

    const userRes = await fetch("https://api.getphyllo.com/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        name: "DealStage User",
        external_id: crypto.randomUUID(),
      }),
    });
    const userData = await userRes.json();

    const tokenRes = await fetch("https://api.getphyllo.com/v1/sdk-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        user_id: userData.id,
      }),
    });
    const tokenData = await tokenRes.json();

    return new Response(JSON.stringify({
      token: tokenData.sdk_token,
      phyllo_user_id: userData.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

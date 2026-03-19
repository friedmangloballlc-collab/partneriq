import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, role, plan } = await req.json();

    if (!email || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing email or API key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roleLabel = role === "talent" ? "Talent" : role === "brand" ? "Brand" : "Agency";
    const firstName = name?.split(" ")[0] || "there";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080807;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://www.thedealstage.com/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" height="40" />
    </div>

    <div style="background:#0f0f0d;border:1px solid rgba(255,248,220,0.07);border-radius:12px;padding:32px;margin-bottom:24px;">
      <h1 style="color:#f5f0e6;font-size:24px;font-weight:700;margin:0 0 16px;">Welcome to Dealstage, ${firstName}!</h1>
      <p style="color:rgba(245,240,230,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        You've joined as a <strong style="color:#c4a24a;">${roleLabel}</strong>${plan && plan !== "free" ? ` on the <strong style="color:#c4a24a;">${plan}</strong> plan` : ""}. Here's how to get the most out of Dealstage:
      </p>

      <div style="margin-bottom:24px;">
        ${[
          { num: "1", title: "Complete your profile", desc: "Add your details so brands and talent can find you." },
          { num: "2", title: "Connect your accounts", desc: "Link social platforms for verified stats and audience data." },
          { num: "3", title: "Explore the marketplace", desc: "Browse talent or brands and start your first deal." },
        ].map(step => `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,248,220,0.05);">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#c4a24a,#e07b18);display:flex;align-items:center;justify-content:center;color:#080807;font-size:12px;font-weight:700;flex-shrink:0;">${step.num}</div>
            <div>
              <div style="color:#f5f0e6;font-size:14px;font-weight:600;margin-bottom:2px;">${step.title}</div>
              <div style="color:rgba(245,240,230,0.4);font-size:13px;">${step.desc}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <a href="https://www.thedealstage.com/Dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#c4a24a,#e07b18);color:#080807;font-size:15px;font-weight:600;padding:14px;border-radius:8px;text-decoration:none;">
        Go to your Dashboard →
      </a>
    </div>

    <p style="text-align:center;color:rgba(245,240,230,0.2);font-size:12px;line-height:1.6;">
      DealStage LLC · www.thedealstage.com<br/>
      <a href="https://www.thedealstage.com/Settings" style="color:rgba(245,240,230,0.3);">Manage email preferences</a>
    </p>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dealstage <hello@thedealstage.com>",
        to: [email],
        subject: `Welcome to Dealstage, ${firstName}!`,
        html: htmlBody,
      }),
    });

    const result = await res.json();

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

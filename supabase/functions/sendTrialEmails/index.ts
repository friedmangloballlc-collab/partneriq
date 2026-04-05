// Edge Function: sendTrialEmails
// Triggered on a daily schedule (via Supabase cron or external scheduler).
// Sends 3 emails during the reverse trial lifecycle:
//   Day 1: Welcome — here's what you can do
//   Day 5: Warning — 2 days left
//   Day 8: Expired — upgrade to keep your pipeline

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FROM_EMAIL = "Dealstage <noreply@thedealstage.com>";
const APP_URL = "https://www.thedealstage.com";

const TRIAL_DAYS = 7;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload) {
  if (!RESEND_API_KEY) {
    console.log("[sendTrialEmails] No RESEND_API_KEY — skipping email to", payload.to);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });
}

function welcomeEmail(name: string): EmailPayload {
  return {
    to: "",
    subject: "Welcome to Dealstage — your 7-day trial starts now",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1c1b19;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${name}!</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          You have <strong>7 days of full access</strong> to everything in your plan — pipeline, outreach, match engine, AI agents, and more.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">Here's what to do first:</p>
        <ul style="font-size: 14px; line-height: 1.8; color: #555;">
          <li><strong>Set up your profile</strong> so brands/talent can find you</li>
          <li><strong>Run the AI Match Engine</strong> to get your first recommendations</li>
          <li><strong>Create a deal</strong> in your pipeline to start tracking</li>
          <li><strong>Try the AI Command Center</strong> — ask it anything about partnerships</li>
        </ul>
        <a href="${APP_URL}/Dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #c4a24a, #e07b18); color: #0a0a09; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Go to Dashboard
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 24px;">
          Your trial expires in 7 days. After that, you'll keep the free tier with 5 AI queries/month.
        </p>
      </div>
    `,
  };
}

function warningEmail(name: string): EmailPayload {
  return {
    to: "",
    subject: "2 days left on your Dealstage trial",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1c1b19;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Hey ${name}, your trial ends in 2 days</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          In 2 days, you'll lose access to:
        </p>
        <ul style="font-size: 14px; line-height: 1.8; color: #555;">
          <li><strong>Deal Pipeline</strong> — your active deals will be locked</li>
          <li><strong>Match Engine & Contact Finder</strong> — no more AI-powered discovery</li>
          <li><strong>Outreach & Sequences</strong> — can't send new messages</li>
          <li><strong>Calendar & Contract Templates</strong></li>
          <li><strong>45 of your 50 AI queries</strong> — you'll drop to 5/month</li>
        </ul>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          <strong>Your data stays safe.</strong> Upgrade anytime to pick up right where you left off.
        </p>
        <a href="${APP_URL}/SubscriptionManagement" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #c4a24a, #e07b18); color: #0a0a09; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Upgrade Now
        </a>
      </div>
    `,
  };
}

function expiredEmail(name: string): EmailPayload {
  return {
    to: "",
    subject: "Your Dealstage trial ended — upgrade to keep your pipeline",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1c1b19;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">${name}, your trial has ended</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          Your 7-day trial is over. You're now on the free tier with limited access.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          <strong>Everything you built is still here</strong> — your deals, contacts, analytics, and AI history.
          Upgrade to unlock it all again instantly.
        </p>
        <div style="background: #fef3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            Plans start at just <strong>$29/month</strong> for full pipeline, outreach, and 50 AI queries.
          </p>
        </div>
        <a href="${APP_URL}/SubscriptionManagement" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: linear-gradient(135deg, #c4a24a, #e07b18); color: #0a0a09; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          See Plans & Upgrade
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 24px;">
          Questions? Reply to this email — we're here to help.
        </p>
      </div>
    `,
  };
}

serve(async (req) => {
  // Auth: require CRON_SECRET to prevent unauthorized triggers
  const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (CRON_SECRET && authHeader !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all free-tier users (plan = 'free' or null) who signed up within the last 10 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at, plan, role, trial_email_sent")
      .or("plan.eq.free,plan.is.null")
      .gte("created_at", tenDaysAgo.toISOString());

    if (error) throw error;

    let sent = 0;

    for (const user of users || []) {
      if (!user.email || user.role === "admin") continue;

      const created = new Date(user.created_at);
      const now = new Date();
      const daysSinceSignup = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const alreadySent = user.trial_email_sent || "";

      let email: EmailPayload | null = null;
      let emailType = "";

      // Day 0-1: Welcome email
      if (daysSinceSignup <= 1 && !alreadySent.includes("welcome")) {
        email = welcomeEmail(user.full_name || "there");
        emailType = "welcome";
      }
      // Day 5: Warning email
      else if (daysSinceSignup >= (TRIAL_DAYS - 2) && daysSinceSignup < TRIAL_DAYS && !alreadySent.includes("warning")) {
        email = warningEmail(user.full_name || "there");
        emailType = "warning";
      }
      // Day 7-8: Expired email
      else if (daysSinceSignup >= TRIAL_DAYS && daysSinceSignup <= TRIAL_DAYS + 1 && !alreadySent.includes("expired")) {
        email = expiredEmail(user.full_name || "there");
        emailType = "expired";
      }

      if (email && emailType) {
        email.to = user.email;
        await sendEmail(email);

        // Track which emails have been sent
        const newSent = alreadySent ? `${alreadySent},${emailType}` : emailType;
        await supabase
          .from("profiles")
          .update({ trial_email_sent: newSent })
          .eq("id", user.id);

        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, emails_sent: sent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

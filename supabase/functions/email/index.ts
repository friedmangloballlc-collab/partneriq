import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// =============================================================================
// UNIFIED EMAIL HANDLER
// Consolidates: sendOutreachEmail, sendBulkOutreach, send-welcome-email,
//               connectEmailAccount, refreshEmailToken, scanEmailForDeals
//
// Usage: POST with { action: "send" | "send_bulk" | "welcome" | "connect" | "refresh" | "scan", ...params }
// =============================================================================

type EmailAction = 'send' | 'send_bulk' | 'welcome' | 'connect' | 'refresh' | 'scan';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const DIRECT_SEND_TIERS = ['pro', 'elite', 'growth', 'scale', 'agency'];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshTokenIfNeeded(
  connection: any,
  serviceClient: any,
): Promise<string | null> {
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at).getTime();
    if (Date.now() < expiresAt - 5 * 60 * 1000) {
      return connection.access_token;
    }
  }

  if (!connection.refresh_token) return null;

  try {
    let tokenUrl: string;
    let body: Record<string, string>;

    if (connection.provider === 'gmail') {
      tokenUrl = 'https://oauth2.googleapis.com/token';
      body = {
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: connection.refresh_token,
        grant_type: 'refresh_token',
      };
    } else {
      tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      body = {
        client_id: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
        client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
        refresh_token: connection.refresh_token,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Send offline_access',
      };
    }

    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });

    if (!resp.ok) {
      console.error('[email/refreshToken] Failed:', await resp.text());
      return null;
    }

    const data = await resp.json();
    const newExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

    await serviceClient
      .from('email_connections')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token || connection.refresh_token,
        token_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    return data.access_token;
  } catch (err) {
    console.error('[email/refreshToken] Error:', (err as Error).message);
    return null;
  }
}

async function refreshTokenOrThrow(base44: any, connection: any): Promise<string> {
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at).getTime();
    if (Date.now() < expiresAt - 5 * 60 * 1000) {
      return connection.access_token;
    }
  }

  if (!connection.refresh_token) {
    throw new Error('No refresh token available. Please reconnect your email account.');
  }

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!tokenResp.ok) {
    const errText = await tokenResp.text();
    console.error('[email/scan] Token refresh failed:', errText);

    if (tokenResp.status === 400 || tokenResp.status === 401) {
      await base44.supabase
        .from('email_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', connection.id);
    }

    throw new Error(`Gmail token refresh failed (${tokenResp.status}). Please reconnect your account.`);
  }

  const tokenData = await tokenResp.json();
  const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

  await base44.supabase
    .from('email_connections')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || connection.refresh_token,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);

  return tokenData.access_token;
}

async function sendViaGmail(
  accessToken: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const boundary = 'boundary_' + crypto.randomUUID().replace(/-/g, '');
  const rawMessage = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(htmlBody))),
    `--${boundary}--`,
  ].join('\r\n');

  const encoded = btoa(rawMessage)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!resp.ok) {
    const errData = await resp.text();
    return { success: false, error: `Gmail API error ${resp.status}: ${errData}` };
  }

  const data = await resp.json();
  return { success: true, messageId: data.id };
}

async function sendViaOutlook(
  accessToken: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resp = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: 'HTML', content: htmlBody },
        toRecipients: [{ emailAddress: { address: toEmail } }],
        from: { emailAddress: { address: fromEmail } },
      },
      saveToSentItems: true,
    }),
  });

  if (!resp.ok) {
    const errData = await resp.text();
    return { success: false, error: `Outlook API error ${resp.status}: ${errData}` };
  }

  return { success: true, messageId: `outlook_${Date.now()}` };
}

function decodeBase64Url(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return atob(padded);
  } catch {
    return '';
  }
}

function extractBodyFromParts(parts: any[]): string {
  let body = '';
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body += decodeBase64Url(part.body.data);
    } else if (part.parts) {
      body += extractBodyFromParts(part.parts);
    }
  }
  return body;
}

function extractEmailData(message: any): {
  subject: string;
  from: string;
  date: string;
  body: string;
  message_id: string;
} {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let body = '';
  if (message.payload?.body?.data) {
    body = decodeBase64Url(message.payload.body.data);
  } else if (message.payload?.parts) {
    body = extractBodyFromParts(message.payload.parts);
  }

  const maxBodyLength = 3000;
  if (body.length > maxBodyLength) {
    body = body.substring(0, maxBodyLength) + '... [truncated]';
  }

  return {
    subject: getHeader('Subject'),
    from: getHeader('From'),
    date: getHeader('Date'),
    body,
    message_id: message.id,
  };
}

// ---------------------------------------------------------------------------
// OAuth connect helpers
// ---------------------------------------------------------------------------

const REDIRECT_URI = 'https://www.thedealstage.com/Settings';

async function handleGmail(authCode: string) {
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: authCode,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const tokenData = await tokenResp.json();

  const profileResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResp.ok) {
    throw new Error('Failed to fetch Google user profile');
  }

  const profile = await profileResp.json();

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_in: tokenData.expires_in || 3600,
    email_address: profile.email,
  };
}

async function handleOutlook(authCode: string) {
  const tokenResp = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: authCode,
      client_id: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
      client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access openid email profile',
    }).toString(),
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    throw new Error(`Microsoft token exchange failed: ${err}`);
  }

  const tokenData = await tokenResp.json();

  const profileResp = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResp.ok) {
    throw new Error('Failed to fetch Microsoft user profile');
  }

  const profile = await profileResp.json();

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_in: tokenData.expires_in || 3600,
    email_address: profile.mail || profile.userPrincipalName,
  };
}

// ---------------------------------------------------------------------------
// ACTION: send  (was sendOutreachEmail)
// ---------------------------------------------------------------------------

async function handleSend(base44: any, user: any, payload: any): Promise<Response> {
  const { email_id } = payload;
  if (!email_id) {
    return new Response(JSON.stringify({ error: 'Missing required field: email_id' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: email, error: fetchError } = await base44.supabase
    .from('outreach_emails')
    .select('*')
    .eq('id', email_id)
    .single();

  if (fetchError || !email) {
    return new Response(JSON.stringify({ error: 'Email not found' }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (email.status === 'sent') {
    return new Response(JSON.stringify({ error: 'Email has already been sent' }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!email.recipient_email) {
    return new Response(JSON.stringify({ error: 'Email record is missing recipient_email' }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sendMethod: 'direct' | 'platform' = 'platform';
  let directConnection: any = null;
  let userTier = 'free';

  try {
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
    });
    if (subs.length > 0) {
      userTier = subs[0].current_plan || 'free';
    }
  } catch (e) {
    console.error('[email/send] Failed to fetch subscription:', (e as Error).message);
  }

  if (DIRECT_SEND_TIERS.includes(userTier.toLowerCase())) {
    try {
      const { data: connections } = await base44.supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (connections && connections.length > 0) {
        directConnection = connections[0];
        sendMethod = 'direct';
      }
    } catch (e) {
      console.error('[email/send] Failed to fetch email connections:', (e as Error).message);
    }
  }

  let sendResult: any;

  if (sendMethod === 'direct' && directConnection) {
    const accessToken = await refreshTokenIfNeeded(directConnection, base44.supabase);
    if (!accessToken) {
      console.warn('[email/send] Token refresh failed, falling back to platform send');
      sendMethod = 'platform';
    } else {
      if (directConnection.provider === 'gmail') {
        sendResult = await sendViaGmail(
          accessToken,
          directConnection.email_address,
          email.recipient_email,
          email.subject || '(No subject)',
          email.body || '',
        );
      } else if (directConnection.provider === 'outlook') {
        sendResult = await sendViaOutlook(
          accessToken,
          directConnection.email_address,
          email.recipient_email,
          email.subject || '(No subject)',
          email.body || '',
        );
      }

      if (sendResult && !sendResult.success) {
        console.warn('[email/send] Direct send failed, falling back to platform:', sendResult.error);
        sendMethod = 'platform';
        sendResult = null;
      }
    }
  }

  if (sendMethod === 'platform') {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com';

    const resendPayload: any = {
      from: fromEmail,
      to: [email.recipient_email],
      subject: email.subject || '(No subject)',
      html: email.body || '',
    };

    if (user.email) {
      resendPayload.reply_to = user.email;
    }

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendResp.json();

    if (!resendResp.ok) {
      await base44.supabase
        .from('outreach_emails')
        .update({ status: 'draft' })
        .eq('id', email_id);

      return new Response(JSON.stringify({
        error: 'Failed to send email via Resend',
        details: resendData,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    sendResult = { success: true, messageId: resendData.id };
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await base44.supabase
    .from('outreach_emails')
    .update({ status: 'sent', sent_at: sentAt })
    .eq('id', email_id);

  if (updateError) {
    console.error('[email/send] Failed to update email status:', updateError.message);
  }

  const sendMethodLabel = sendMethod === 'direct'
    ? `Direct send via ${directConnection?.provider} (${directConnection?.email_address})`
    : `Platform send via Deal Stage (deals@thedealstage.com)`;

  try {
    await base44.supabase.from('activities').insert({
      type: 'email_sent',
      description: `Outreach email sent to ${email.recipient_name || email.recipient_email}: "${email.subject}"`,
      entity_type: 'outreach_email',
      entity_id: email_id,
      partnership_id: email.partnership_id || null,
      user_id: user.id,
      user_name: user.full_name || user.email,
      metadata: JSON.stringify({
        message_id: sendResult?.messageId || null,
        recipient_email: email.recipient_email,
        recipient_name: email.recipient_name,
        subject: email.subject,
        sequence_id: email.sequence_id || null,
        send_method: sendMethod,
        send_method_label: sendMethodLabel,
        sender_email: sendMethod === 'direct'
          ? directConnection?.email_address
          : (Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com'),
        user_tier: userTier,
      }),
    });
  } catch (activityErr) {
    console.error('[email/send] Failed to log activity:', (activityErr as Error).message);
  }

  return new Response(JSON.stringify({
    success: true,
    message_id: sendResult?.messageId || null,
    email_id,
    sent_at: sentAt,
    send_method: sendMethod,
    sender_email: sendMethod === 'direct'
      ? directConnection?.email_address
      : (Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com'),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: send_bulk  (was sendBulkOutreach)
// ---------------------------------------------------------------------------

async function handleSendBulk(base44: any, user: any, payload: any): Promise<Response> {
  const { sequence_id } = payload;
  if (!sequence_id) {
    return new Response(JSON.stringify({ error: 'Missing required field: sequence_id' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: sequence, error: seqError } = await base44.supabase
    .from('outreach_sequences')
    .select('*')
    .eq('id', sequence_id)
    .single();

  if (seqError || !sequence) {
    return new Response(JSON.stringify({ error: 'Sequence not found' }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await base44.supabase
    .from('outreach_sequences')
    .update({ status: 'active' })
    .eq('id', sequence_id);

  const { data: emails, error: emailsError } = await base44.supabase
    .from('outreach_emails')
    .select('*')
    .eq('sequence_id', sequence_id)
    .in('status', ['draft', 'scheduled'])
    .order('created_at', { ascending: true });

  if (emailsError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch emails', details: emailsError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!emails || emails.length === 0) {
    await base44.supabase
      .from('outreach_sequences')
      .update({ status: 'completed' })
      .eq('id', sequence_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'No pending emails in this sequence',
      sent: 0,
      failed: 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com';

  const results: { email_id: string; status: 'sent' | 'failed'; error?: string; resend_id?: string }[] = [];
  let sentCount = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    if (i > 0) {
      await sleep(1000);
    }

    if (!email.recipient_email) {
      results.push({ email_id: email.id, status: 'failed', error: 'Missing recipient_email' });
      continue;
    }

    try {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email.recipient_email],
          subject: email.subject || '(No subject)',
          html: email.body || '',
        }),
      });

      const resendData = await resendResp.json();

      if (!resendResp.ok) {
        results.push({
          email_id: email.id,
          status: 'failed',
          error: resendData?.message || `Resend returned ${resendResp.status}`,
        });
        continue;
      }

      const sentAt = new Date().toISOString();
      await base44.supabase
        .from('outreach_emails')
        .update({ status: 'sent', sent_at: sentAt })
        .eq('id', email.id);

      try {
        await base44.supabase.from('activities').insert({
          type: 'email_sent',
          description: `Bulk outreach email sent to ${email.recipient_name || email.recipient_email}: "${email.subject}"`,
          entity_type: 'outreach_email',
          entity_id: email.id,
          partnership_id: email.partnership_id || null,
          user_id: user.id,
          user_name: user.full_name || user.email,
          metadata: JSON.stringify({
            resend_id: resendData.id,
            recipient_email: email.recipient_email,
            recipient_name: email.recipient_name,
            subject: email.subject,
            sequence_id,
            bulk: true,
          }),
        });
      } catch (activityErr) {
        console.error('[email/send_bulk] Failed to log activity for email', email.id, (activityErr as Error).message);
      }

      sentCount++;
      results.push({ email_id: email.id, status: 'sent', resend_id: resendData.id });

    } catch (sendErr) {
      results.push({
        email_id: email.id,
        status: 'failed',
        error: (sendErr as Error).message,
      });
    }
  }

  const failedCount = results.filter(r => r.status === 'failed').length;
  const newSentCount = (sequence.sent_count || 0) + sentCount;

  const sequenceUpdate: Record<string, any> = {
    sent_count: newSentCount,
  };

  const { count: remainingCount } = await base44.supabase
    .from('outreach_emails')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', sequence_id)
    .in('status', ['draft', 'scheduled']);

  if (remainingCount === 0 || remainingCount === null) {
    sequenceUpdate.status = 'completed';
  }

  await base44.supabase
    .from('outreach_sequences')
    .update(sequenceUpdate)
    .eq('id', sequence_id);

  try {
    await base44.supabase.from('activities').insert({
      type: 'bulk_outreach_sent',
      description: `Bulk outreach completed for sequence "${sequence.name}": ${sentCount} sent, ${failedCount} failed`,
      entity_type: 'outreach_sequence',
      entity_id: sequence_id,
      user_id: user.id,
      user_name: user.full_name || user.email,
      metadata: JSON.stringify({
        sequence_id,
        sequence_name: sequence.name,
        total_attempted: emails.length,
        sent: sentCount,
        failed: failedCount,
      }),
    });
  } catch (activityErr) {
    console.error('[email/send_bulk] Failed to log summary activity:', (activityErr as Error).message);
  }

  return new Response(JSON.stringify({
    success: true,
    sent: sentCount,
    failed: failedCount,
    total: emails.length,
    sequence_status: sequenceUpdate.status || 'active',
    results,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: welcome  (was send-welcome-email)
// ---------------------------------------------------------------------------

async function handleWelcome(_base44: any, _user: any, payload: any): Promise<Response> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const { email, name, role, plan } = payload;

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
}

// ---------------------------------------------------------------------------
// ACTION: connect  (was connectEmailAccount)
// ---------------------------------------------------------------------------

async function handleConnect(base44: any, user: any, payload: any): Promise<Response> {
  const { provider, auth_code } = payload;

  if (!provider || !auth_code) {
    return new Response(JSON.stringify({ error: 'Missing required fields: provider, auth_code' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!['gmail', 'outlook'].includes(provider)) {
    return new Response(JSON.stringify({ error: 'Invalid provider. Must be "gmail" or "outlook".' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let result: {
    access_token: string;
    refresh_token: string | null;
    expires_in: number;
    email_address: string;
  };

  if (provider === 'gmail') {
    result = await handleGmail(auth_code);
  } else {
    result = await handleOutlook(auth_code);
  }

  const tokenExpiresAt = new Date(Date.now() + result.expires_in * 1000).toISOString();

  const { data: connection, error: upsertError } = await base44.supabase
    .from('email_connections')
    .upsert(
      {
        user_id: user.id,
        provider,
        email_address: result.email_address,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_expires_at: tokenExpiresAt,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,email_address' },
    )
    .select()
    .single();

  if (upsertError) {
    console.error('[email/connect] Upsert error:', upsertError.message);
    return new Response(JSON.stringify({ error: 'Failed to save email connection', details: upsertError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    await base44.supabase.from('activities').insert({
      type: 'email_connected',
      description: `Connected ${provider} account (${result.email_address}) for direct email sending`,
      entity_type: 'email_connection',
      entity_id: connection.id,
      user_id: user.id,
      user_name: user.full_name || user.email,
      metadata: JSON.stringify({ provider, email_address: result.email_address }),
    });
  } catch (activityErr) {
    console.error('[email/connect] Failed to log activity:', (activityErr as Error).message);
  }

  return new Response(JSON.stringify({
    success: true,
    email_address: result.email_address,
    provider,
    connection_id: connection.id,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// ACTION: refresh  (was refreshEmailToken)
// ---------------------------------------------------------------------------

async function handleRefresh(base44: any, user: any, payload: any): Promise<Response> {
  const { connection_id } = payload;

  if (!connection_id) {
    return new Response(JSON.stringify({ error: 'Missing required field: connection_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: connection, error: fetchError } = await base44.supabase
    .from('email_connections')
    .select('*')
    .eq('id', connection_id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !connection) {
    return new Response(JSON.stringify({ error: 'Email connection not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!connection.refresh_token) {
    return new Response(JSON.stringify({ error: 'No refresh token available for this connection' }), {
      status: 422,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at).getTime();
    if (Date.now() < expiresAt - 5 * 60 * 1000) {
      return new Response(JSON.stringify({
        success: true,
        refreshed: false,
        message: 'Token is still valid',
        expires_at: connection.token_expires_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  let tokenUrl: string;
  let body: Record<string, string>;

  if (connection.provider === 'gmail') {
    tokenUrl = 'https://oauth2.googleapis.com/token';
    body = {
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    };
  } else {
    tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    body = {
      client_id: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
      client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    };
  }

  const tokenResp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });

  if (!tokenResp.ok) {
    const errText = await tokenResp.text();
    console.error('[email/refresh] Token refresh failed:', errText);

    if (tokenResp.status === 400 || tokenResp.status === 401) {
      await base44.supabase
        .from('email_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', connection_id);
    }

    return new Response(JSON.stringify({
      error: 'Token refresh failed',
      details: errText,
      deactivated: tokenResp.status === 400 || tokenResp.status === 401,
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const tokenData = await tokenResp.json();
  const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

  const { error: updateError } = await base44.supabase
    .from('email_connections')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || connection.refresh_token,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection_id);

  if (updateError) {
    console.error('[email/refresh] Failed to update tokens:', updateError.message);
    return new Response(JSON.stringify({ error: 'Failed to persist refreshed tokens' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    refreshed: true,
    expires_at: newExpiresAt,
    provider: connection.provider,
    email_address: connection.email_address,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// ACTION: scan  (was scanEmailForDeals)
// ---------------------------------------------------------------------------

async function handleScan(base44: any, user: any, payload: any): Promise<Response> {
  const { user_id } = payload;
  const targetUserId = user_id || user.id;

  const { data: connections, error: connError } = await base44.supabase
    .from('email_connections')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('provider', 'gmail')
    .eq('is_active', true)
    .limit(1);

  if (connError) {
    console.error('[email/scan] Connection query error:', connError.message);
    return new Response(JSON.stringify({ error: 'Failed to query email connections' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!connections || connections.length === 0) {
    return new Response(JSON.stringify({
      error: 'No active Gmail connection found. Please connect your Gmail account first.',
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const connection = connections[0];

  const accessToken = await refreshTokenOrThrow(base44, connection);

  const searchQuery = 'sponsorship OR partnership OR collaboration OR "brand deal" OR "campaign brief" newer_than:90d';
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=20`;

  const searchResp = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchResp.ok) {
    const errText = await searchResp.text();
    console.error('[email/scan] Gmail search failed:', searchResp.status, errText);
    return new Response(JSON.stringify({
      error: 'Gmail search failed',
      details: errText,
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const searchData = await searchResp.json();
  const messageIds: string[] = (searchData.messages || []).map((m: any) => m.id);

  if (messageIds.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      deals: [],
      message: 'No deal-related emails found in the last 90 days.',
      emails_scanned: 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const emails: any[] = [];
  for (const msgId of messageIds) {
    try {
      const msgResp = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (msgResp.ok) {
        const msgData = await msgResp.json();
        emails.push(extractEmailData(msgData));
      } else {
        console.error(`[email/scan] Failed to fetch message ${msgId}:`, msgResp.status);
      }
    } catch (fetchErr) {
      console.error(`[email/scan] Error fetching message ${msgId}:`, (fetchErr as Error).message);
    }
  }

  if (emails.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      deals: [],
      message: 'Found matching emails but could not retrieve their content.',
      emails_scanned: 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const emailSummaries = emails.map((e, i) =>
    `--- Email ${i + 1} ---\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\n\n${e.body}`
  ).join('\n\n');

  const aiResult = await base44.integrations.Core.InvokeLLM({
    prompt: `Extract deal information from these emails. For each deal found, return: brand_name, deal_type, estimated_value, platform, dates, deliverables, status (active/completed/negotiating).

Here are the emails to analyze:

${emailSummaries}`,
    agent_name: 'data_extractor',
    response_json_schema: {
      type: 'object',
      properties: {
        deals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              brand_name: { type: 'string' },
              deal_type: { type: 'string' },
              estimated_value: { type: 'number' },
              platform: { type: 'string' },
              dates: {
                type: 'object',
                properties: {
                  start_date: { type: 'string' },
                  end_date: { type: 'string' },
                  deadline: { type: 'string' },
                },
              },
              deliverables: { type: 'array', items: { type: 'string' } },
              status: { type: 'string' },
              source_subject: { type: 'string' },
              source_from: { type: 'string' },
              confidence: { type: 'number' },
            },
          },
        },
        summary: { type: 'string' },
      },
    },
  });

  const deals = aiResult.deals || [];

  return new Response(JSON.stringify({
    success: true,
    deals,
    summary: aiResult.summary || `Found ${deals.length} potential deal(s) from ${emails.length} email(s).`,
    emails_scanned: emails.length,
    connection_email: connection.email_address,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// MAIN ROUTER
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json().catch(() => ({}));
    const action: EmailAction = payload.action;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: action. Must be one of: send, send_bulk, welcome, connect, refresh, scan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Welcome email does not require auth (called from auth trigger)
    if (action === 'welcome') {
      return await handleWelcome(null, null, payload);
    }

    // All other actions require authentication
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'send':
        return await handleSend(base44, user, payload);
      case 'send_bulk':
        return await handleSendBulk(base44, user, payload);
      case 'connect':
        return await handleConnect(base44, user, payload);
      case 'refresh':
        return await handleRefresh(base44, user, payload);
      case 'scan':
        return await handleScan(base44, user, payload);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Must be one of: send, send_bulk, welcome, connect, refresh, scan` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }
  } catch (error) {
    console.error('[email] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

const DIRECT_SEND_TIERS = ['pro', 'elite', 'growth', 'scale', 'agency'];

/**
 * Refresh an expired OAuth token for Gmail or Outlook.
 * Returns the new access_token or null on failure.
 */
async function refreshTokenIfNeeded(
  connection: any,
  serviceClient: any,
): Promise<string | null> {
  // If token is still valid (with 5-min buffer), return it as-is
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
      // outlook
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
      console.error('[refreshToken] Failed:', await resp.text());
      return null;
    }

    const data = await resp.json();
    const newExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

    // Persist refreshed tokens
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
    console.error('[refreshToken] Error:', (err as Error).message);
    return null;
  }
}

/**
 * Send an email via the Gmail API using the user's OAuth token.
 */
async function sendViaGmail(
  accessToken: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Build RFC 2822 MIME message
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

  // Base64url encode for Gmail API
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

/**
 * Send an email via the Microsoft Graph API using the user's OAuth token.
 */
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id } = await req.json();
    if (!email_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: email_id' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the email record
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

    // ── Determine sending mode ──────────────────────────────────────────────

    let sendMethod: 'direct' | 'platform' = 'platform';
    let directConnection: any = null;
    let userTier = 'free';

    // 1. Check the user's subscription tier
    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({
        user_email: user.email,
      });
      if (subs.length > 0) {
        userTier = subs[0].current_plan || 'free';
      }
    } catch (e) {
      console.error('[sendOutreachEmail] Failed to fetch subscription:', (e as Error).message);
    }

    // 2. If on a direct-send tier, look for an active email connection
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
        console.error('[sendOutreachEmail] Failed to fetch email connections:', (e as Error).message);
      }
    }

    // ── Send the email ──────────────────────────────────────────────────────

    let sendResult: any;

    if (sendMethod === 'direct' && directConnection) {
      // Refresh token if needed
      const accessToken = await refreshTokenIfNeeded(directConnection, base44.supabase);
      if (!accessToken) {
        // Fall back to platform send if token refresh fails
        console.warn('[sendOutreachEmail] Token refresh failed, falling back to platform send');
        sendMethod = 'platform';
      } else {
        // Send via the user's connected inbox
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
          console.warn('[sendOutreachEmail] Direct send failed, falling back to platform:', sendResult.error);
          sendMethod = 'platform';
          sendResult = null;
        }
      }
    }

    // Platform send (Resend) – used for free/starter or as fallback
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

      // Set Reply-To as the user's email so replies go to them
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

    // ── Update email status ─────────────────────────────────────────────────

    const sentAt = new Date().toISOString();
    const { error: updateError } = await base44.supabase
      .from('outreach_emails')
      .update({ status: 'sent', sent_at: sentAt })
      .eq('id', email_id);

    if (updateError) {
      console.error('[sendOutreachEmail] Failed to update email status:', updateError.message);
    }

    // ── Log activity ────────────────────────────────────────────────────────

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
      console.error('[sendOutreachEmail] Failed to log activity:', (activityErr as Error).message);
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

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

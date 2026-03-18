import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * scanEmailForDeals
 * Scans a user's connected Gmail for deal-related emails, extracts partnership
 * information via the AI router, and returns structured deal data for import.
 */

async function refreshTokenIfNeeded(base44: any, connection: any): Promise<string> {
  // Check if token is still valid (5-min buffer)
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at).getTime();
    if (Date.now() < expiresAt - 5 * 60 * 1000) {
      return connection.access_token;
    }
  }

  // Token expired or missing expiry — refresh it
  if (!connection.refresh_token) {
    throw new Error('No refresh token available. Please reconnect your Gmail account.');
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
    console.error('[scanEmailForDeals] Token refresh failed:', errText);

    // Mark connection as inactive if refresh permanently fails
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

  // Persist refreshed tokens
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

function decodeBase64Url(str: string): string {
  // Gmail uses URL-safe base64 encoding
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

  // Truncate body to prevent excessively large AI prompts
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_id } = await req.json();
    const targetUserId = user_id || user.id;

    // 1. Find the user's active Gmail connection
    const { data: connections, error: connError } = await base44.supabase
      .from('email_connections')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('provider', 'gmail')
      .eq('is_active', true)
      .limit(1);

    if (connError) {
      console.error('[scanEmailForDeals] Connection query error:', connError.message);
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

    // 2. Refresh token if expired
    const accessToken = await refreshTokenIfNeeded(base44, connection);

    // 3. Search Gmail for deal-related emails
    const searchQuery = 'sponsorship OR partnership OR collaboration OR "brand deal" OR "campaign brief" newer_than:90d';
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=20`;

    const searchResp = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!searchResp.ok) {
      const errText = await searchResp.text();
      console.error('[scanEmailForDeals] Gmail search failed:', searchResp.status, errText);
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

    // 4. Fetch full content for each message
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
          console.error(`[scanEmailForDeals] Failed to fetch message ${msgId}:`, msgResp.status);
        }
      } catch (fetchErr) {
        console.error(`[scanEmailForDeals] Error fetching message ${msgId}:`, (fetchErr as Error).message);
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

    // 5. Send extracted emails to AI router for deal extraction
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

  } catch (error) {
    console.error('[scanEmailForDeals] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

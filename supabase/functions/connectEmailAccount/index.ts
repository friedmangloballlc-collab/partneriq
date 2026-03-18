import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

const REDIRECT_URI = 'https://www.thedealstage.com/Settings';

/**
 * Exchange a Google auth code for access + refresh tokens, then fetch the
 * user's Gmail address from the userinfo endpoint.
 */
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

  // Fetch the connected email address
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

/**
 * Exchange a Microsoft auth code for access + refresh tokens, then fetch the
 * user's Outlook email address from the Graph /me endpoint.
 */
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

  // Fetch the connected email address
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

    const { provider, auth_code } = await req.json();

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

    // Exchange auth code for tokens
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

    // Upsert into email_connections (unique on user_id + email_address)
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
      console.error('[connectEmailAccount] Upsert error:', upsertError.message);
      return new Response(JSON.stringify({ error: 'Failed to save email connection', details: upsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log activity
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
      console.error('[connectEmailAccount] Failed to log activity:', (activityErr as Error).message);
    }

    return new Response(JSON.stringify({
      success: true,
      email_address: result.email_address,
      provider,
      connection_id: connection.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[connectEmailAccount] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

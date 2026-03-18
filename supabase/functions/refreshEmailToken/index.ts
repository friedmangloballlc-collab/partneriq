import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

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

    const { connection_id } = await req.json();

    if (!connection_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: connection_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the connection (must belong to this user)
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

    // Check if token is still valid (5-min buffer)
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

    // Refresh the token
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
      console.error('[refreshEmailToken] Token refresh failed:', errText);

      // Mark connection as inactive if refresh permanently fails
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

    // Update tokens in database
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
      console.error('[refreshEmailToken] Failed to update tokens:', updateError.message);
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

  } catch (error) {
    console.error('[refreshEmailToken] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

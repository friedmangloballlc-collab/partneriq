import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// OAuth provider configurations
// ---------------------------------------------------------------------------
interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  profileUrl: string;
}

const PROVIDER_CONFIGS: Record<string, OAuthProviderConfig> = {
  instagram: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "instagram_basic,pages_show_list",
    profileUrl: "https://graph.instagram.com/me?fields=id,username,media_count,account_type",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    profileUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scope: "user.info.basic",
    profileUrl: "https://open.tiktokapis.com/v2/user/info/",
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    scope: "users.read tweet.read",
    profileUrl: "https://api.x.com/2/users/me",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "openid profile",
    profileUrl: "https://api.linkedin.com/v2/userinfo",
  },
  pinterest: {
    authUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    scope: "user_accounts:read",
    profileUrl: "https://api.pinterest.com/v5/user_account",
  },
  spotify: {
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    scope: "user-read-private",
    profileUrl: "https://api.spotify.com/v1/me",
  },
  twitch: {
    authUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scope: "user:read:email",
    profileUrl: "https://api.twitch.tv/helix/users",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "public_profile,pages_show_list",
    profileUrl: "https://graph.facebook.com/me?fields=id,name,picture",
  },
  snapchat: {
    authUrl: "https://accounts.snapchat.com/accounts/oauth2/auth",
    tokenUrl: "https://accounts.snapchat.com/accounts/oauth2/token",
    scope: "snapchat-marketing-api",
    profileUrl: "https://adsapi.snapchat.com/v1/me",
  },
  discord: {
    authUrl: "https://discord.com/oauth2/authorize",
    tokenUrl: "https://discord.com/api/v10/oauth2/token",
    scope: "identify",
    profileUrl: "https://discord.com/api/v10/users/@me",
  },
  threads: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "threads_basic",
    profileUrl: "https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url",
  },
};

const SUPPORTED_PLATFORMS = Object.keys(PROVIDER_CONFIGS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function envVar(name: string): string {
  const val = Deno.env.get(name);
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

function getAppUrl(): string {
  return Deno.env.get("NEXT_PUBLIC_APP_URL") || Deno.env.get("APP_URL") || "";
}

function getClientCredentials(platform: string): { clientId: string; clientSecret: string } {
  const key = platform.toUpperCase();
  return {
    clientId: envVar(`${key}_CLIENT_ID`),
    clientSecret: envVar(`${key}_CLIENT_SECRET`),
  };
}

function getRedirectUri(platform: string): string {
  return `${getAppUrl()}/api/auth/${platform}/callback`;
}

/** Extract a portable user-id and username from a provider-specific profile response. */
function extractProfileIdentifiers(
  platform: string,
  data: any,
): { platformUserId: string; platformUsername: string } {
  switch (platform) {
    case "youtube": {
      const ch = data?.items?.[0];
      return {
        platformUserId: ch?.id ?? "",
        platformUsername: ch?.snippet?.title ?? "",
      };
    }
    case "tiktok": {
      const user = data?.data?.user;
      return {
        platformUserId: user?.open_id ?? user?.union_id ?? "",
        platformUsername: user?.display_name ?? "",
      };
    }
    case "twitter": {
      const d = data?.data;
      return {
        platformUserId: d?.id ?? "",
        platformUsername: d?.username ?? d?.name ?? "",
      };
    }
    case "twitch": {
      const u = data?.data?.[0];
      return {
        platformUserId: u?.id ?? "",
        platformUsername: u?.login ?? u?.display_name ?? "",
      };
    }
    case "linkedin": {
      return {
        platformUserId: data?.sub ?? "",
        platformUsername: data?.name ?? "",
      };
    }
    case "pinterest": {
      return {
        platformUserId: data?.id ?? data?.username ?? "",
        platformUsername: data?.username ?? "",
      };
    }
    case "spotify": {
      return {
        platformUserId: data?.id ?? "",
        platformUsername: data?.display_name ?? data?.id ?? "",
      };
    }
    case "discord": {
      return {
        platformUserId: data?.id ?? "",
        platformUsername: data?.username ?? "",
      };
    }
    case "snapchat": {
      const me = data?.me;
      return {
        platformUserId: me?.id ?? data?.id ?? "",
        platformUsername: me?.display_name ?? data?.display_name ?? "",
      };
    }
    default: {
      // instagram, facebook, threads, and any future provider with {id, username|name}
      return {
        platformUserId: data?.id ?? "",
        platformUsername: data?.username ?? data?.name ?? "",
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function handleStart(
  platform: string,
): Promise<Response> {
  const config = PROVIDER_CONFIGS[platform];
  const { clientId } = getClientCredentials(platform);
  const redirectUri = getRedirectUri(platform);
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    response_type: "code",
    state,
  });

  // TikTok uses "client_key" rather than "client_id"
  if (platform === "tiktok") {
    params.delete("client_id");
    params.set("client_key", clientId);
  }

  // Twitter (X) requires PKCE — adding code_challenge placeholder
  if (platform === "twitter") {
    params.set("code_challenge", "challenge");
    params.set("code_challenge_method", "plain");
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;
  return Response.json({ authUrl, state }, { status: 200 });
}

async function handleCallback(
  platform: string,
  code: string,
  supabase: any,
  userId: string,
): Promise<Response> {
  const config = PROVIDER_CONFIGS[platform];
  const { clientId, clientSecret } = getClientCredentials(platform);
  const redirectUri = getRedirectUri(platform);

  // ----- Step 1: Exchange authorization code for tokens -----
  const tokenBody: Record<string, string> = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  // TikTok uses "client_key" rather than "client_id"
  if (platform === "tiktok") {
    delete tokenBody.client_id;
    tokenBody.client_key = clientId;
  }

  // Twitter requires PKCE verifier
  if (platform === "twitter") {
    tokenBody.code_verifier = "challenge";
  }

  const tokenHeaders: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  // Spotify and Twitch prefer Basic auth for token exchange
  if (platform === "spotify" || platform === "twitch") {
    const encoded = btoa(`${clientId}:${clientSecret}`);
    tokenHeaders["Authorization"] = `Basic ${encoded}`;
    delete tokenBody.client_id;
    delete tokenBody.client_secret;
  }

  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: tokenHeaders,
    body: new URLSearchParams(tokenBody).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error(`[oauthConnect] Token exchange failed for ${platform}:`, errText);
    return Response.json(
      { error: "Token exchange failed", detail: errText },
      { status: 502 },
    );
  }

  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;
  const refreshToken: string | null = tokenData.refresh_token ?? null;
  const expiresIn: number | null = tokenData.expires_in ?? null;
  const tokenExpiresAt: string | null = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null;

  // ----- Step 2: Fetch user profile -----
  const profileHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  // Twitch requires Client-Id header alongside the Bearer token
  if (platform === "twitch") {
    profileHeaders["Client-Id"] = clientId;
  }

  const profileRes = await fetch(config.profileUrl, {
    method: "GET",
    headers: profileHeaders,
  });

  if (!profileRes.ok) {
    const errText = await profileRes.text();
    console.error(`[oauthConnect] Profile fetch failed for ${platform}:`, errText);
    return Response.json(
      { error: "Profile fetch failed", detail: errText },
      { status: 502 },
    );
  }

  const profileData = await profileRes.json();
  const { platformUserId, platformUsername } = extractProfileIdentifiers(platform, profileData);

  // ----- Step 3: Upsert into connected_accounts -----
  const { error: upsertError } = await supabase
    .from("connected_accounts")
    .upsert(
      {
        user_id: userId,
        platform,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        profile_data: profileData,
        verified: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" },
    );

  if (upsertError) {
    console.error(`[oauthConnect] Upsert failed for ${platform}:`, upsertError);
    return Response.json(
      { error: "Failed to save connected account", detail: upsertError.message },
      { status: 500 },
    );
  }

  return Response.json(
    { success: true, platform, username: platformUsername },
    { status: 200 },
  );
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Authenticate via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client scoped to the caller's JWT for auth verification
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Service-role client for database writes (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse body
    const body = await req.json();
    const { action, platform, code, state: _state } = body;

    if (!action || !platform) {
      return Response.json(
        { error: "Missing required fields: action, platform" },
        { status: 400 },
      );
    }

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      return Response.json(
        { error: `Unsupported platform: ${platform}. Supported: ${SUPPORTED_PLATFORMS.join(", ")}` },
        { status: 400 },
      );
    }

    if (action === "start") {
      return await handleStart(platform);
    }

    if (action === "callback") {
      if (!code) {
        return Response.json({ error: "Missing authorization code" }, { status: 400 });
      }
      return await handleCallback(platform, code, supabaseAdmin, user.id);
    }

    return Response.json(
      { error: `Invalid action: ${action}. Must be "start" or "callback".` },
      { status: 400 },
    );
  } catch (err) {
    console.error("[oauthConnect] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 },
    );
  }
});

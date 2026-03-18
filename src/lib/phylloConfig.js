/**
 * Phyllo OAuth configuration for social platform connections.
 *
 * To enable real OAuth:
 * 1. Sign up at https://dashboard.getphyllo.com
 * 2. Get your Client ID and Client Secret
 * 3. Add to Supabase Edge Function secrets:
 *    - PHYLLO_CLIENT_ID
 *    - PHYLLO_CLIENT_SECRET
 * 4. Add to Vercel env vars:
 *    - VITE_PHYLLO_CLIENT_ID
 *
 * Phyllo supports: Instagram, YouTube, TikTok, Twitch, Twitter/X,
 * Facebook, Snapchat, Pinterest, LinkedIn, and 20+ more platforms.
 *
 * Until Phyllo is configured, the app uses simulated OAuth (1.5s delay).
 */

export const PHYLLO_CONFIG = {
  clientId: import.meta.env.VITE_PHYLLO_CLIENT_ID || '',
  environment: import.meta.env.MODE === 'production' ? 'production' : 'sandbox',
  isConfigured: !!import.meta.env.VITE_PHYLLO_CLIENT_ID,
};

/**
 * Platform slug → Phyllo work platform ID mapping.
 * See: https://docs.getphyllo.com/docs/api-reference/work-platforms
 */
export const PHYLLO_PLATFORM_MAP = {
  youtube: 'youtube',
  instagram: 'instagram',
  'instagram-reels': 'instagram',
  tiktok: 'tiktok',
  twitch: 'twitch',
  twitter: 'twitter',
  facebook: 'facebook',
  snapchat: 'snapchat',
  pinterest: 'pinterest',
  linkedin: 'linkedin',
  reddit: 'reddit',
  discord: 'discord',
  threads: 'threads',
  spotify: 'spotify',
  soundcloud: 'soundcloud',
  patreon: 'patreon',
};

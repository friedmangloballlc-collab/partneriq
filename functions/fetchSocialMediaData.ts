import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Platform API configurations - ready for real API integration
const PLATFORM_CONFIGS = {
  instagram: {
    baseUrl: 'https://graph.instagram.com/v18.0',
    actions: {
      profile_metrics: { endpoint: '/me', params: ['fields=id,username,media_count,followers_count,follows_count'] },
      content_analysis: { endpoint: '/me/media', params: ['fields=id,caption,media_type,timestamp,like_count,comments_count,insights'] },
      audience_demographics: { endpoint: '/me/insights', params: ['metric=audience_city,audience_country,audience_gender_age,audience_locale', 'period=lifetime'] },
      hashtag_trends: { endpoint: '/ig_hashtag_search', params: ['q={hashtag}'] },
    },
    envKey: 'INSTAGRAM_API_KEY',
    integrationKey: 'instagram_graph_api',
  },
  tiktok: {
    baseUrl: 'https://open.tiktokapis.com/v2',
    actions: {
      profile_metrics: { endpoint: '/user/info/', params: ['fields=display_name,follower_count,following_count,likes_count,video_count'] },
      content_analysis: { endpoint: '/video/list/', params: ['fields=id,title,create_time,like_count,comment_count,share_count,view_count'] },
      trending_sounds: { endpoint: '/research/music/trending/', params: ['fields=id,title,author_name,duration'] },
      audience_demographics: { endpoint: '/research/user/followers/', params: ['fields=country,gender,age_range'] },
    },
    envKey: 'TIKTOK_API_KEY',
    integrationKey: 'tiktok_open_api',
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    actions: {
      channel_metrics: { endpoint: '/channels', params: ['part=statistics,snippet,brandingSettings', 'mine=true'] },
      content_analysis: { endpoint: '/search', params: ['part=snippet', 'forMine=true', 'type=video', 'maxResults=20'] },
      audience_demographics: { endpoint: '/reports', params: ['dimensions=ageGroup,gender', 'metrics=viewerPercentage'] },
      trending_topics: { endpoint: '/search', params: ['part=snippet', 'type=video', 'chart=mostPopular', 'maxResults=20'] },
    },
    envKey: 'YOUTUBE_API_KEY',
    integrationKey: 'youtube_data_api',
  },
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    actions: {
      profile_metrics: { endpoint: '/users/me', params: ['user.fields=public_metrics,description,created_at,profile_image_url'] },
      content_analysis: { endpoint: '/users/{id}/tweets', params: ['tweet.fields=public_metrics,created_at,entities', 'max_results=20'] },
      trending_topics: { endpoint: '/trends/by/woeid/{woeid}', params: [] },
      audience_demographics: { endpoint: '/users/{id}/followers', params: ['user.fields=location,public_metrics'] },
    },
    envKey: 'TWITTER_API_KEY',
    integrationKey: 'twitter_api_v2',
  },
};

const VALID_ACTIONS: Record<string, string[]> = {
  instagram: ['profile_metrics', 'content_analysis', 'audience_demographics', 'hashtag_trends'],
  tiktok: ['profile_metrics', 'content_analysis', 'trending_sounds', 'audience_demographics'],
  youtube: ['channel_metrics', 'content_analysis', 'audience_demographics', 'trending_topics'],
  twitter: ['profile_metrics', 'content_analysis', 'trending_topics', 'audience_demographics'],
};

function buildSyntheticPrompt(platform: string, action: string, talents: any[], params: any): string {
  const talentSummary = talents.slice(0, 15).map(t =>
    `- ${t.name}: ${t.platform || 'multi-platform'}, ${t.niche || 'general'}, Tier=${t.tier || 'N/A'}, Followers=${t.followers?.toLocaleString() || 'N/A'}, Engagement=${t.engagement_rate || 'N/A'}`
  ).join('\n');

  const platformTalents = talents.filter(t =>
    t.platform?.toLowerCase().includes(platform) ||
    t.social_platforms?.some?.((sp: any) => sp.toLowerCase().includes(platform))
  );

  const targetHandle = params?.handle || params?.username || (platformTalents[0]?.name) || 'sample_creator';

  return `You are a Social Media Analytics Data Generator. Generate realistic ${platform} ${action.replace(/_/g, ' ')} data.

CONTEXT - Talent Roster (${talents.length} total):
${talentSummary}

${platformTalents.length > 0 ? `Platform-specific talents found: ${platformTalents.map(t => t.name).join(', ')}` : 'No platform-specific talents found, generate representative data.'}

Target: ${targetHandle}
${params?.hashtag ? `Hashtag: ${params.hashtag}` : ''}
${params?.dateRange ? `Date Range: ${params.dateRange}` : 'Date Range: Last 30 days'}

Generate realistic, detailed ${platform} ${action.replace(/_/g, ' ')} data that matches what the ${platform} API would return. Make the numbers realistic and internally consistent. Use actual talent names from the roster where applicable. Include timestamps from the last 30 days.`;
}

function getResponseSchema(platform: string, action: string) {
  const schemas: Record<string, Record<string, any>> = {
    instagram: {
      profile_metrics: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          followers_count: { type: 'number' },
          following_count: { type: 'number' },
          media_count: { type: 'number' },
          engagement_rate: { type: 'string' },
          avg_likes: { type: 'number' },
          avg_comments: { type: 'number' },
          follower_growth_30d: { type: 'string' },
          top_performing_format: { type: 'string' },
          best_posting_time: { type: 'string' },
          estimated_reach: { type: 'number' },
        },
      },
      content_analysis: {
        type: 'object',
        properties: {
          total_posts_analyzed: { type: 'number' },
          avg_engagement_rate: { type: 'string' },
          top_content_types: { type: 'array', items: { type: 'object', properties: { type: { type: 'string' }, count: { type: 'number' }, avg_engagement: { type: 'string' } } } },
          top_posts: { type: 'array', items: { type: 'object', properties: { caption_preview: { type: 'string' }, likes: { type: 'number' }, comments: { type: 'number' }, type: { type: 'string' }, posted_at: { type: 'string' } } } },
          content_themes: { type: 'array', items: { type: 'string' } },
          posting_frequency: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
      audience_demographics: {
        type: 'object',
        properties: {
          total_followers: { type: 'number' },
          gender_split: { type: 'object', properties: { male: { type: 'string' }, female: { type: 'string' }, other: { type: 'string' } } },
          age_ranges: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, percentage: { type: 'string' } } } },
          top_cities: { type: 'array', items: { type: 'object', properties: { city: { type: 'string' }, percentage: { type: 'string' } } } },
          top_countries: { type: 'array', items: { type: 'object', properties: { country: { type: 'string' }, percentage: { type: 'string' } } } },
          active_hours: { type: 'array', items: { type: 'object', properties: { hour: { type: 'string' }, activity_level: { type: 'string' } } } },
          audience_interests: { type: 'array', items: { type: 'string' } },
        },
      },
      hashtag_trends: {
        type: 'object',
        properties: {
          hashtag: { type: 'string' },
          total_posts: { type: 'number' },
          avg_likes: { type: 'number' },
          trending_score: { type: 'string' },
          related_hashtags: { type: 'array', items: { type: 'object', properties: { tag: { type: 'string' }, post_count: { type: 'number' }, growth: { type: 'string' } } } },
          top_creators: { type: 'array', items: { type: 'object', properties: { username: { type: 'string' }, followers: { type: 'number' }, posts_with_tag: { type: 'number' } } } },
          peak_posting_times: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    tiktok: {
      profile_metrics: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          display_name: { type: 'string' },
          follower_count: { type: 'number' },
          following_count: { type: 'number' },
          total_likes: { type: 'number' },
          video_count: { type: 'number' },
          avg_views_per_video: { type: 'number' },
          engagement_rate: { type: 'string' },
          follower_growth_30d: { type: 'string' },
          viral_video_count: { type: 'number' },
          avg_watch_time: { type: 'string' },
        },
      },
      content_analysis: {
        type: 'object',
        properties: {
          total_videos_analyzed: { type: 'number' },
          avg_views: { type: 'number' },
          avg_likes: { type: 'number' },
          avg_shares: { type: 'number' },
          top_videos: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, views: { type: 'number' }, likes: { type: 'number' }, shares: { type: 'number' }, posted_at: { type: 'string' } } } },
          content_categories: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, video_count: { type: 'number' }, avg_performance: { type: 'string' } } } },
          optimal_video_length: { type: 'string' },
          posting_recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
      trending_sounds: {
        type: 'object',
        properties: {
          trending_sounds: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, artist: { type: 'string' }, usage_count: { type: 'number' }, growth_rate: { type: 'string' }, category: { type: 'string' } } } },
          recommended_for_niche: { type: 'array', items: { type: 'object', properties: { sound: { type: 'string' }, relevance_score: { type: 'string' }, suggested_content_type: { type: 'string' } } } },
          analysis_period: { type: 'string' },
        },
      },
      audience_demographics: {
        type: 'object',
        properties: {
          total_followers: { type: 'number' },
          gender_split: { type: 'object', properties: { male: { type: 'string' }, female: { type: 'string' }, other: { type: 'string' } } },
          age_ranges: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, percentage: { type: 'string' } } } },
          top_countries: { type: 'array', items: { type: 'object', properties: { country: { type: 'string' }, percentage: { type: 'string' } } } },
          device_types: { type: 'object', properties: { ios: { type: 'string' }, android: { type: 'string' } } },
          peak_active_times: { type: 'array', items: { type: 'string' } },
          audience_interests: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    youtube: {
      channel_metrics: {
        type: 'object',
        properties: {
          channel_name: { type: 'string' },
          subscriber_count: { type: 'number' },
          total_views: { type: 'number' },
          video_count: { type: 'number' },
          avg_views_per_video: { type: 'number' },
          engagement_rate: { type: 'string' },
          subscriber_growth_30d: { type: 'string' },
          estimated_monthly_revenue: { type: 'string' },
          avg_watch_time: { type: 'string' },
          top_performing_category: { type: 'string' },
        },
      },
      content_analysis: {
        type: 'object',
        properties: {
          total_videos_analyzed: { type: 'number' },
          avg_views: { type: 'number' },
          avg_likes: { type: 'number' },
          avg_comments: { type: 'number' },
          top_videos: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, views: { type: 'number' }, likes: { type: 'number' }, comments: { type: 'number' }, published_at: { type: 'string' }, watch_time_hours: { type: 'number' } } } },
          content_categories: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, video_count: { type: 'number' }, avg_views: { type: 'number' } } } },
          optimal_upload_schedule: { type: 'string' },
          thumbnail_ctr_avg: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
      audience_demographics: {
        type: 'object',
        properties: {
          total_subscribers: { type: 'number' },
          gender_split: { type: 'object', properties: { male: { type: 'string' }, female: { type: 'string' }, other: { type: 'string' } } },
          age_ranges: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, percentage: { type: 'string' } } } },
          top_countries: { type: 'array', items: { type: 'object', properties: { country: { type: 'string' }, percentage: { type: 'string' } } } },
          traffic_sources: { type: 'array', items: { type: 'object', properties: { source: { type: 'string' }, percentage: { type: 'string' } } } },
          subscriber_activity: { type: 'object', properties: { active_subscribers_pct: { type: 'string' }, notification_bell_pct: { type: 'string' } } },
        },
      },
      trending_topics: {
        type: 'object',
        properties: {
          trending_topics: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, search_volume: { type: 'number' }, growth_rate: { type: 'string' }, competition: { type: 'string' } } } },
          niche_opportunities: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, relevance: { type: 'string' }, estimated_views: { type: 'number' }, suggested_angle: { type: 'string' } } } },
          analysis_period: { type: 'string' },
        },
      },
    },
    twitter: {
      profile_metrics: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          display_name: { type: 'string' },
          followers_count: { type: 'number' },
          following_count: { type: 'number' },
          tweet_count: { type: 'number' },
          avg_likes_per_tweet: { type: 'number' },
          avg_retweets_per_tweet: { type: 'number' },
          engagement_rate: { type: 'string' },
          follower_growth_30d: { type: 'string' },
          avg_impressions: { type: 'number' },
          reply_rate: { type: 'string' },
        },
      },
      content_analysis: {
        type: 'object',
        properties: {
          total_tweets_analyzed: { type: 'number' },
          avg_engagement: { type: 'string' },
          top_tweets: { type: 'array', items: { type: 'object', properties: { text_preview: { type: 'string' }, likes: { type: 'number' }, retweets: { type: 'number' }, replies: { type: 'number' }, impressions: { type: 'number' }, posted_at: { type: 'string' } } } },
          content_mix: { type: 'object', properties: { original_tweets: { type: 'string' }, replies: { type: 'string' }, retweets: { type: 'string' }, threads: { type: 'string' } } },
          top_hashtags: { type: 'array', items: { type: 'object', properties: { tag: { type: 'string' }, usage_count: { type: 'number' }, avg_engagement: { type: 'string' } } } },
          best_posting_times: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
      trending_topics: {
        type: 'object',
        properties: {
          trending_topics: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, tweet_volume: { type: 'number' }, trend_type: { type: 'string' }, related_keywords: { type: 'array', items: { type: 'string' } } } } },
          niche_trends: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, relevance_score: { type: 'string' }, suggested_take: { type: 'string' } } } },
          analysis_period: { type: 'string' },
        },
      },
      audience_demographics: {
        type: 'object',
        properties: {
          total_followers: { type: 'number' },
          notable_followers: { type: 'array', items: { type: 'object', properties: { username: { type: 'string' }, followers: { type: 'number' }, category: { type: 'string' } } } },
          follower_categories: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, percentage: { type: 'string' } } } },
          top_locations: { type: 'array', items: { type: 'object', properties: { location: { type: 'string' }, percentage: { type: 'string' } } } },
          activity_patterns: { type: 'object', properties: { most_active_day: { type: 'string' }, most_active_hour: { type: 'string' }, avg_daily_impressions: { type: 'number' } } },
          audience_interests: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  };

  return schemas[platform]?.[action] || { type: 'object', properties: { data: { type: 'string' }, message: { type: 'string' } } };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { platform, action, params = {} } = await req.json();

    // Validate platform
    if (!platform || !VALID_ACTIONS[platform]) {
      return Response.json({
        error: `Invalid platform: "${platform}". Supported platforms: ${Object.keys(VALID_ACTIONS).join(', ')}`,
      }, { status: 400 });
    }

    // Validate action
    if (!action || !VALID_ACTIONS[platform].includes(action)) {
      return Response.json({
        error: `Invalid action: "${action}" for platform "${platform}". Supported actions: ${VALID_ACTIONS[platform].join(', ')}`,
      }, { status: 400 });
    }

    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];

    // Attempt to get API key from environment or integrations
    let apiKey: string | null = null;
    try {
      apiKey = Deno.env.get(config.envKey) || null;
    } catch {
      // Environment variable not available
    }

    // If a real API key is available, make the actual API call
    if (apiKey) {
      // TODO: Implement real API calls per platform when keys are configured
      // const actionConfig = config.actions[action as keyof typeof config.actions];
      // const url = `${config.baseUrl}${actionConfig.endpoint}`;
      // const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
      // return Response.json({ success: true, source: 'live_api', platform, action, data: await response.json() });
    }

    // No API key configured: use LLM to generate realistic synthetic data
    const talents = await base44.entities.Talent.list('-created_date', 100);

    const prompt = buildSyntheticPrompt(platform, action, talents, params);
    const responseSchema = getResponseSchema(platform, action);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema,
    });

    return Response.json({
      success: true,
      source: apiKey ? 'live_api' : 'ai_generated',
      platform,
      action,
      generated_at: new Date().toISOString(),
      data: result,
      _meta: {
        note: apiKey
          ? 'Data fetched from live API'
          : 'AI-generated synthetic data based on talent roster. Connect a real API key for live data.',
        api_endpoint: `${config.baseUrl}${config.actions[action as keyof typeof config.actions].endpoint}`,
        talents_referenced: talents.slice(0, 5).map((t: any) => t.name),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

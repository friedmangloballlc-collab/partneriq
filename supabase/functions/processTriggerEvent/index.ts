import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

const TRIGGER_CONFIG = {
  award_win: {
    priority: 'p1_immediate',
    responseWindow: '< 4 hours',
    detectionMethod: 'News API, social monitoring',
    actions: ['Score boost', 'Generate pitch', 'Priority queue'],
    channels: 'Push + SMS + Email'
  },
  viral_moment: {
    priority: 'p1_immediate',
    responseWindow: '< 4 hours',
    detectionMethod: 'Engagement spike detection',
    actions: ['Fast-track scoring', 'Opportunity alert'],
    channels: 'Push + SMS + Email'
  },
  competitor_deal_expiring: {
    priority: 'p2_same_day',
    responseWindow: '< 24 hours',
    detectionMethod: 'Deal database monitoring',
    actions: ['Preemptive pitch preparation'],
    channels: 'Push + Email'
  },
  trajectory_inflection: {
    priority: 'p2_same_day',
    responseWindow: '< 24 hours',
    detectionMethod: 'Weekly model output',
    actions: ['Flag rising stars', 'Discovery alert'],
    channels: 'Push + Email'
  },
  rep_change: {
    priority: 'p3_next_day',
    responseWindow: '< 48 hours',
    detectionMethod: 'News + social monitoring',
    actions: ['Update relationships', 'Alert brands'],
    channels: 'Email only'
  },
  new_platform_launch: {
    priority: 'p3_next_day',
    responseWindow: '< 48 hours',
    detectionMethod: 'Account detection',
    actions: ['Add to profile', 'Track growth'],
    channels: 'Email only'
  },
  scandal_crisis: {
    priority: 'p0_crisis',
    responseWindow: 'Immediate',
    detectionMethod: 'News + sentiment monitoring',
    actions: ['Pause outreach', 'Alert stakeholders'],
    channels: 'Phone + SMS + Email + Slack + In-app'
  },
  major_announcement: {
    priority: 'p2_same_day',
    responseWindow: '< 24 hours',
    detectionMethod: 'Press release monitoring',
    actions: ['Update profile', 'Evaluate impact'],
    channels: 'Push + Email'
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { trigger_event, reference_type, reference_id, reference_name, metadata } = body;

    if (!trigger_event || !TRIGGER_CONFIG[trigger_event]) {
      return new Response(JSON.stringify({ error: 'Invalid trigger event' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const config = TRIGGER_CONFIG[trigger_event];

    // Create notification
    const notification = await base44.entities.Notification.create({
      title: `${trigger_event.replace(/_/g, ' ').toUpperCase()} Detected`,
      description: `A ${trigger_event.replace(/_/g, ' ')} event has been detected for ${reference_name || 'a tracked entity'}.`,
      trigger_event,
      priority: config.priority,
      reference_type,
      reference_id,
      reference_name,
      automated_actions: JSON.stringify(config.actions),
      response_window: config.responseWindow,
      detection_method: config.detectionMethod,
      channels: config.channels,
      metadata: JSON.stringify(metadata || {})
    });

    // Log activity
    await base44.entities.Activity.create({
      action: 'trigger_event',
      description: `${trigger_event} event detected for ${reference_name}`,
      resource_type: reference_type,
      resource_id: reference_id,
      metadata: JSON.stringify({ notification_id: notification.id })
    });

    return new Response(JSON.stringify({
      success: true,
      notification_id: notification.id,
      priority: config.priority,
      response_window: config.responseWindow
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
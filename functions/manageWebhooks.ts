import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const EVENT_TYPES = [
  'deal_closed',
  'safety_alert',
  'compliance_flag',
  'trend_detected',
  'contract_expiring',
  'payment_due',
  'new_opportunity',
  'relationship_risk',
];

const SEVERITY_MAP: Record<string, string> = {
  deal_closed: 'info',
  safety_alert: 'critical',
  compliance_flag: 'high',
  trend_detected: 'medium',
  contract_expiring: 'high',
  payment_due: 'medium',
  new_opportunity: 'low',
  relationship_risk: 'high',
};

function buildSamplePayload(eventType: string) {
  const now = new Date().toISOString();
  return {
    event: eventType,
    timestamp: now,
    data: {
      id: `evt_${Math.random().toString(36).substring(2, 10)}`,
      source: 'partneriq',
      event_type: eventType,
      details: `Sample ${eventType.replace(/_/g, ' ')} event from PartnerIQ`,
    },
    severity: SEVERITY_MAP[eventType] || 'medium',
  };
}

function buildSlackBlocks(eventType: string) {
  const severity = SEVERITY_MAP[eventType] || 'medium';
  const emoji =
    severity === 'critical' ? ':rotating_light:' :
    severity === 'high' ? ':warning:' :
    severity === 'medium' ? ':large_blue_circle:' :
    ':white_check_mark:';

  const label = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return {
    text: `${emoji} PartnerIQ Alert: ${label}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emoji} ${label}`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Event:*\n${label}` },
          { type: 'mrkdwn', text: `*Severity:*\n${severity.toUpperCase()}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `This is a test notification from *PartnerIQ* for the \`${eventType}\` event type.`,
        },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Sent at <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|${new Date().toISOString()}>` },
        ],
      },
      { type: 'divider' },
    ],
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── test_webhook ──────────────────────────────────────────────────
    if (action === 'test_webhook') {
      const { webhook_url, event_type } = body;
      if (!webhook_url) {
        return Response.json({ error: 'webhook_url is required' }, { status: 400 });
      }

      const payload = buildSamplePayload(event_type || 'deal_closed');

      const res = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return Response.json({
        success: true,
        result: {
          status: res.status,
          statusText: res.statusText,
          payload_sent: payload,
        },
      });
    }

    // ── test_slack ────────────────────────────────────────────────────
    if (action === 'test_slack') {
      const { webhook_url, event_type } = body;
      if (!webhook_url) {
        return Response.json({ error: 'webhook_url is required' }, { status: 400 });
      }

      const slackMessage = buildSlackBlocks(event_type || 'deal_closed');

      const res = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });

      return Response.json({
        success: true,
        result: {
          status: res.status,
          statusText: res.statusText,
          message_sent: slackMessage,
        },
      });
    }

    // ── generate_payload ──────────────────────────────────────────────
    if (action === 'generate_payload') {
      const prompt = `You are a webhook payload generator for PartnerIQ, a partnership and influencer management platform.

Generate realistic, detailed sample payloads for each of the following event types:
${EVENT_TYPES.map(e => `- ${e}`).join('\n')}

For each event type, produce:
1. A description of when this event fires
2. A realistic JSON payload with event, timestamp, data (with relevant fields), and severity
3. A Slack Block Kit formatted message suitable for posting to a Slack channel

Use realistic names, dollar amounts, dates, and partnership details. Make each payload unique and representative of a real-world scenario in influencer/partnership management.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            event_payloads: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  event_type: { type: 'string' },
                  description: { type: 'string' },
                  sample_payload: {
                    type: 'object',
                    properties: {
                      event: { type: 'string' },
                      timestamp: { type: 'string' },
                      data: { type: 'object' },
                      severity: { type: 'string' },
                    },
                  },
                  slack_format: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      blocks: { type: 'array' },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return Response.json({ success: true, result });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});

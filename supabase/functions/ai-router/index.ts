/**
 * Universal AI Router v4 — main entry point.
 * Routes all AI agent calls with failover, caching, rate limiting, and usage tracking.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from './cors.ts';
import { routeRequest } from './router.ts';
import { getAgent } from './agents.ts';
import { getHealthStatus } from './circuit-breaker.ts';

// Rate limits by subscription plan (daily requests)
const TIER_LIMITS: Record<string, number> = {
  free: 10,
  starter: 50,
  rising: 100,
  growth: 200,
  pro: 500,
  scale: 1000,
  elite: 2000,
  enterprise: Infinity,
  agency_starter: 1000,
  agency_pro: 2000,
  agency_enterprise: Infinity,
};

// Map current_plan values to numeric tiers for provider access control
// free=0, rising/growth=1, pro/scale/agency_pro=2, elite/enterprise/agency_enterprise=3
const PLAN_TO_TIER: Record<string, number> = {
  free: 0,
  starter: 0,
  rising: 1,
  growth: 1,
  pro: 2,
  scale: 2,
  agency_starter: 1,
  agency_pro: 2,
  elite: 3,
  enterprise: 3,
  agency_enterprise: 3,
};

// AI provider restrictions by tier — controls cost
const TIER_PROVIDERS: Record<string, string[]> = {
  free: ['openai', 'groq', 'gemini'],
  starter: ['openai', 'groq', 'gemini', 'deepseek'],
  rising: ['openai', 'groq', 'gemini', 'deepseek'],
  growth: ['openai', 'groq', 'gemini', 'deepseek'],
  pro: ['openai', 'groq', 'gemini', 'deepseek', 'anthropic'],
  scale: ['openai', 'groq', 'gemini', 'deepseek', 'anthropic'],
  elite: ['openai', 'openai_gpt4o', 'groq', 'gemini', 'deepseek', 'anthropic'],
  enterprise: ['openai', 'openai_gpt4o', 'groq', 'gemini', 'deepseek', 'anthropic'],
  agency_starter: ['openai', 'groq', 'gemini', 'deepseek', 'anthropic'],
  agency_pro: ['openai', 'openai_gpt4o', 'groq', 'gemini', 'deepseek', 'anthropic'],
  agency_enterprise: ['openai', 'openai_gpt4o', 'groq', 'gemini', 'deepseek', 'anthropic'],
};

// Service-role client — shared across requests within the same isolate.
// Safe to reuse because it uses the static service-role key, not a per-user JWT.
const supabaseServiceClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Response cache (in-memory, per-isolate)
const responseCache = new Map<string, { result: string; expires: number }>();

function getCacheKey(agent: string, prompt: string): string {
  // Simple hash from agent + prompt
  let hash = 0;
  const str = `${agent}:${prompt}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `${agent}:${hash}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  // === Health endpoint ===
  if (action === 'health') {
    const circuits = getHealthStatus();
    const providers = ['anthropic', 'anthropic_haiku', 'deepseek', 'deepseek_reasoner', 'gemini', 'groq'];
    const health: Record<string, any> = {};
    for (const p of providers) {
      health[p] = circuits[p] || { state: 'CLOSED', failures: 0 };
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      providers: health,
      cache_size: responseCache.size,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // === Diagnose endpoint — admin-only, test each provider individually ===
  if (action === 'diagnose') {
    // Require admin authentication
    const diagAuthHeader = req.headers.get('Authorization') || '';
    const diagToken = diagAuthHeader.replace('Bearer ', '');
    const diagSupabase = supabaseServiceClient;
    const { data: { user: diagUser } } = await diagSupabase.auth.getUser(diagToken);
    if (!diagUser) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: diagProfile } = await diagSupabase.from('profiles').select('role').eq('id', diagUser.id).single();
    if (!diagProfile || diagProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: Record<string, any> = {};

    // Test Anthropic
    try {
      const key = Deno.env.get('ANTHROPIC_API_KEY') || '';
      results.anthropic = { key_set: !!key };
      // Try multiple models to find one available on this account
      let anthropicResp: Response | null = null;
      for (const m of ['claude-sonnet-4-5', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307']) {
        anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: m, max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
        });
        if (anthropicResp.ok) { results.anthropic.model = m; break; }
        const t = await anthropicResp.text();
        if (anthropicResp.status === 401 || t.includes('credit balance')) { results.anthropic.error_detail = t.slice(0, 200); break; }
        // 404 = model not found, try next
      }
      const resp = anthropicResp!;
      if (resp.ok) {
        const data = await resp.json();
        results.anthropic.status = 'WORKING';
        results.anthropic.response = data?.content?.[0]?.text?.slice(0, 50);
      } else {
        results.anthropic.status = 'FAILED';
        results.anthropic.http_code = resp.status;
        results.anthropic.error = (await resp.text()).slice(0, 300);
      }
    } catch (e) { results.anthropic = { status: 'ERROR', error: (e as Error).message }; }

    // Test DeepSeek
    try {
      const key = Deno.env.get('DEEPSEEK_API_KEY') || '';
      results.deepseek = { key_set: !!key };
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
      });
      if (resp.ok) {
        const data = await resp.json();
        results.deepseek.status = 'WORKING';
        results.deepseek.response = data?.choices?.[0]?.message?.content?.slice(0, 50);
      } else {
        results.deepseek.status = 'FAILED';
        results.deepseek.http_code = resp.status;
        results.deepseek.error = (await resp.text()).slice(0, 300);
      }
    } catch (e) { results.deepseek = { status: 'ERROR', error: (e as Error).message }; }

    // Test Gemini — try multiple model names
    try {
      const key = Deno.env.get('GEMINI_API_KEY') || '';
      results.gemini = { key_set: !!key };
      const geminiModels = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b', 'gemini-pro'];
      let found = false;
      for (const m of geminiModels) {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 10 } }),
        });
        if (resp.ok) {
          const data = await resp.json();
          results.gemini.status = 'WORKING';
          results.gemini.model = m;
          results.gemini.response = data?.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50);
          found = true;
          break;
        }
        const errText = await resp.text();
        if (resp.status === 400 && errText.includes('API key')) {
          results.gemini.status = 'FAILED';
          results.gemini.error = 'Invalid API key';
          found = true;
          break;
        }
        // 404 = model not found, try next
      }
      if (!found) {
        results.gemini.status = 'FAILED';
        results.gemini.error = 'No Gemini model available for this API key. Tried: ' + geminiModels.join(', ');
      }
    } catch (e) { results.gemini = { status: 'ERROR', error: (e as Error).message }; }

    // Test Groq
    try {
      const key = Deno.env.get('GROQ_API_KEY') || '';
      results.groq = { key_set: !!key };
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
      });
      if (resp.ok) {
        const data = await resp.json();
        results.groq.status = 'WORKING';
        results.groq.response = data?.choices?.[0]?.message?.content?.slice(0, 50);
      } else {
        results.groq.status = 'FAILED';
        results.groq.http_code = resp.status;
        results.groq.error = (await resp.text()).slice(0, 300);
      }
    } catch (e) { results.groq = { status: 'ERROR', error: (e as Error).message }; }

    return new Response(JSON.stringify(results, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // === Main route ===
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { agent: agentName, prompt, context, stream, skip_cache } = body;

    if (!agentName || !prompt) {
      return new Response(JSON.stringify({ error: 'agent and prompt are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // === JWT Authentication: verify caller identity ===
    const authHeader = req.headers.get('Authorization') || '';
    const jwtToken = authHeader.replace('Bearer ', '');
    // Use the shared service-role client for auth verification and DB queries.
    // The service-role client can verify any JWT; no need to create a new client per request.
    const supabaseAuth = supabaseServiceClient;
    const { data: { user: authedUser }, error: authError } = await supabaseAuth.auth.getUser(jwtToken);
    if (authError || !authedUser) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user_id = authedUser.id;

    // === Server-side tier lookup: never trust client-provided tier ===
    // The user_subscriptions table stores `current_plan` (TEXT), not `tier`.
    // We map the plan key to both TIER_LIMITS and TIER_PROVIDERS lookups.
    let user_tier = 'free';
    try {
      const { data: sub } = await supabaseAuth
        .from('user_subscriptions')
        .select('current_plan')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (sub?.current_plan && sub.current_plan in TIER_LIMITS) {
        user_tier = sub.current_plan;
      }
    } catch { /* default to free tier */ }

    // Get agent config
    const agent = getAgent(agentName);

    // === Rate limiting (atomic upsert on ai_rate_limits table) ===
    const limit = TIER_LIMITS[user_tier] ?? TIER_LIMITS.free;
    if (limit !== Infinity) {
      // Atomic increment: INSERT or UPDATE the daily counter in one round-trip.
      // Returns the new request_count after incrementing.
      const { data: rateData, error: rateError } = await supabaseAuth.rpc(
        'increment_ai_rate_limit',
        { p_user_id: user_id }
      );

      // rateData is the new request_count after the upsert
      const currentCount = rateError ? 0 : (rateData ?? 0);

      if (currentCount > limit) {
        return new Response(JSON.stringify({
          error: 'Daily AI request limit reached',
          limit,
          tier: user_tier,
          upgrade_url: '/SubscriptionManagement',
        }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // === Response cache ===
    if (agent.useCache && agent.cacheTTL > 0 && !skip_cache) {
      const cacheKey = getCacheKey(agentName, prompt);
      const cached = responseCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return new Response(JSON.stringify({
          success: true,
          agent: agentName,
          provider: 'cache',
          model: 'cache',
          fallback_used: false,
          batch_mode: false,
          cache_hit: true,
          latency_ms: 0,
          result: cached.result,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // === Determine allowed providers for this subscription tier ===
    const allowedProviders = TIER_PROVIDERS[user_tier] ?? TIER_PROVIDERS.free;

    // === Route to provider ===
    const fullPrompt = context ? `${prompt}\n\nContext:\n${context}` : prompt;
    const result = await routeRequest(
      agent.tier,
      fullPrompt,
      agent.systemPrompt,
      agent.maxTokens,
      agent.temperature,
      allowedProviders,
    );

    // === Cache response ===
    if (agent.useCache && agent.cacheTTL > 0) {
      const cacheKey = getCacheKey(agentName, prompt);
      responseCache.set(cacheKey, {
        result: result.text,
        expires: Date.now() + (agent.cacheTTL * 1000),
      });
      // Evict expired entries periodically
      if (responseCache.size > 500) {
        const now = Date.now();
        for (const [k, v] of responseCache) {
          if (v.expires < now) responseCache.delete(k);
        }
      }
    }

    // === Log usage ===
    try {
      // Prefer real token counts from the provider when available; fall back to char/4 estimate
      const inputTokens = result.inputTokens ?? Math.ceil(prompt.length / 4);
      const outputTokens = result.outputTokens ?? Math.ceil(result.text.length / 4);

      await supabaseServiceClient.from('ai_usage_logs').insert({
        user_id: user_id || null,
        agent: agentName,
        provider: result.provider,
        model: result.model,
        fallback_used: result.fallbackUsed,
        batch_mode: false,
        latency_ms: result.latencyMs,
        prompt_length: prompt.length,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_usd: estimateCost(result.provider, inputTokens, outputTokens),
      });
    } catch (logErr) {
      console.error('[ai-router] Usage log failed:', (logErr as Error).message);
    }

    return new Response(JSON.stringify({
      success: true,
      agent: agentName,
      provider: result.provider,
      model: result.model,
      fallback_used: result.fallbackUsed,
      batch_mode: false,
      cache_hit: false,
      latency_ms: result.latencyMs,
      result: result.text,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[ai-router] Error:', (err as Error).message);
    return new Response(JSON.stringify({
      success: false,
      error: (err as Error).message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function estimateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, [number, number]> = {
    anthropic: [3 / 1_000_000, 15 / 1_000_000],
    anthropic_haiku: [0.25 / 1_000_000, 1.25 / 1_000_000],
    deepseek: [0.28 / 1_000_000, 0.42 / 1_000_000],
    deepseek_reasoner: [0.50 / 1_000_000, 2.18 / 1_000_000],
    gemini: [0, 0], // free tier
    groq: [0.05 / 1_000_000, 0.08 / 1_000_000],
  };
  const [inRate, outRate] = rates[provider] || [0.001 / 1_000_000, 0.002 / 1_000_000];
  return (inputTokens * inRate) + (outputTokens * outRate);
}

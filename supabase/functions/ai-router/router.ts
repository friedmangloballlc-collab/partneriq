/**
 * Provider router — calls AI providers with retry and fallback logic.
 */

import { isProviderHealthy, recordSuccess, recordFailure } from './circuit-breaker.ts';
import { type RoutingTier } from './agents.ts';

/** Per-provider timeout in milliseconds */
const PROVIDER_TIMEOUT_MS = 25_000;

/** Response from an individual provider call, including optional real token counts */
interface ProviderResponse {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}

const TIER_PROVIDERS: Record<RoutingTier, string[]> = {
  COMPLEX: ['anthropic', 'deepseek', 'gemini', 'groq'],
  STANDARD: ['deepseek', 'anthropic_haiku', 'gemini', 'groq'],
  REASONING: ['deepseek_reasoner', 'anthropic', 'gemini'],
  FREE: ['gemini', 'deepseek', 'groq', 'anthropic_haiku'],
  FAST: ['groq', 'deepseek', 'gemini', 'anthropic_haiku'],
  BATCH: ['anthropic_haiku', 'deepseek', 'gemini'],
};

async function callAnthropic(prompt: string, systemPrompt: string | undefined, maxTokens: number, temperature: number, model = 'claude-sonnet-4-5', signal?: AbortSignal): Promise<ProviderResponse> {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const models = [model, 'claude-sonnet-4-5', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
  let lastError = '';

  for (const m of [...new Set(models)]) {
    const messages: any[] = [{ role: 'user', content: prompt }];
    const body: any = { model: m, max_tokens: maxTokens, temperature, messages };
    // Enable prompt caching for system prompts — 90% cheaper on repeated calls
    if (systemPrompt) {
      body.system = [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }];
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'prompt-caching-2024-07-31', 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (resp.ok) {
      const result = await resp.json();
      const text = result?.content?.[0]?.text || '';
      return {
        text,
        inputTokens: result?.usage?.input_tokens,
        outputTokens: result?.usage?.output_tokens,
      };
    }

    const errText = await resp.text();
    lastError = `Anthropic ${resp.status} (${m}): ${errText.slice(0, 200)}`;
    if (resp.status === 401) throw new Error(lastError);
    if (resp.status === 404 || errText.includes('model')) continue;
    throw new Error(lastError);
  }
  throw new Error(lastError);
}

async function callDeepSeek(prompt: string, systemPrompt: string | undefined, maxTokens: number, temperature: number, model = 'deepseek-chat', signal?: AbortSignal): Promise<ProviderResponse> {
  const key = Deno.env.get('DEEPSEEK_API_KEY');
  if (!key) throw new Error('DEEPSEEK_API_KEY not set');
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature, messages }),
    signal,
  });
  if (!resp.ok) throw new Error(`DeepSeek ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const result = await resp.json();
  return {
    text: result?.choices?.[0]?.message?.content || '',
    inputTokens: result?.usage?.prompt_tokens,
    outputTokens: result?.usage?.completion_tokens,
  };
}

async function callGemini(prompt: string, systemPrompt: string | undefined, maxTokens: number, temperature: number, _model?: string, signal?: AbortSignal): Promise<ProviderResponse> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b', 'gemini-pro'];
  let lastError = '';

  for (const model of models) {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      }),
      signal,
    });
    if (resp.ok) {
      const result = await resp.json();
      return {
        text: result?.candidates?.[0]?.content?.parts?.[0]?.text || '',
        inputTokens: result?.usageMetadata?.promptTokenCount,
        outputTokens: result?.usageMetadata?.candidatesTokenCount,
      };
    }
    const errText = await resp.text();
    lastError = `Gemini ${resp.status} (${model}): ${errText.slice(0, 200)}`;
    if (resp.status === 400 && errText.includes('API key not valid')) throw new Error(lastError);
    if (resp.status === 429) throw new Error(`Gemini rate limited (${model}). Retrying via fallback.`);
    if (resp.status === 404 || errText.includes('not found')) continue;
    throw new Error(lastError);
  }
  throw new Error(lastError);
}

async function callGroq(prompt: string, systemPrompt: string | undefined, maxTokens: number, temperature: number, _model?: string, signal?: AbortSignal): Promise<ProviderResponse> {
  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) throw new Error('GROQ_API_KEY not set');
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: maxTokens, temperature, messages }),
    signal,
  });
  if (!resp.ok) throw new Error(`Groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const result = await resp.json();
  return {
    text: result?.choices?.[0]?.message?.content || '',
    inputTokens: result?.usage?.prompt_tokens,
    outputTokens: result?.usage?.completion_tokens,
  };
}

type ProviderCallFn = (p: string, s: string | undefined, m: number, t: number, model?: string, signal?: AbortSignal) => Promise<ProviderResponse>;

const PROVIDER_CALLS: Record<string, ProviderCallFn> = {
  anthropic: (p, s, m, t, _model?, signal?) => callAnthropic(p, s, m, t, 'claude-sonnet-4-5', signal),
  anthropic_haiku: (p, s, m, t, _model?, signal?) => callAnthropic(p, s, m, t, 'claude-3-5-haiku-20241022', signal),
  deepseek: (p, s, m, t, _model?, signal?) => callDeepSeek(p, s, m, t, 'deepseek-chat', signal),
  deepseek_reasoner: (p, s, m, t, _model?, signal?) => callDeepSeek(p, s, m, t, 'deepseek-reasoner', signal),
  gemini: callGemini,
  groq: callGroq,
};

const PROVIDER_MODELS: Record<string, string> = {
  anthropic: 'claude-sonnet-4-5',
  anthropic_haiku: 'claude-3-5-haiku-20241022',
  deepseek: 'deepseek-chat',
  deepseek_reasoner: 'deepseek-reasoner',
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
};

export interface RouteResult {
  text: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

export async function routeRequest(
  tier: RoutingTier,
  prompt: string,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  allowedProviders?: string[],
): Promise<RouteResult> {
  const baseProviders = TIER_PROVIDERS[tier] || TIER_PROVIDERS.STANDARD;
  // Filter by subscription-tier allowed providers if specified
  const providers = allowedProviders
    ? baseProviders.filter((p) => {
        const base = p.split('_')[0]; // 'anthropic_haiku' -> 'anthropic'
        return allowedProviders.includes(p) || allowedProviders.includes(base);
      })
    : baseProviders;
  if (providers.length === 0) {
    throw new Error(`No AI providers available for your subscription tier. Please upgrade.`);
  }
  const start = Date.now();
  const errors: string[] = [];

  for (let i = 0; i < providers.length; i++) {
    const providerKey = providers[i];
    if (!isProviderHealthy(providerKey)) {
      errors.push(`${providerKey}: circuit open`);
      continue;
    }

    try {
      const callFn = PROVIDER_CALLS[providerKey];
      if (!callFn) { errors.push(`${providerKey}: no handler`); continue; }

      // Per-provider timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

      let providerResult: ProviderResponse;
      try {
        providerResult = await Promise.race([
          callFn(prompt, systemPrompt, maxTokens, temperature, undefined, controller.signal),
          new Promise<never>((_resolve, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error(`Provider ${providerKey} timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`));
            });
          }),
        ]);
      } finally {
        clearTimeout(timeoutId);
      }

      recordSuccess(providerKey);

      return {
        text: providerResult.text,
        provider: providerKey,
        model: PROVIDER_MODELS[providerKey] || providerKey,
        fallbackUsed: i > 0,
        latencyMs: Date.now() - start,
        inputTokens: providerResult.inputTokens,
        outputTokens: providerResult.outputTokens,
      };
    } catch (err) {
      const msg = (err as Error).message?.slice(0, 200);
      console.error(`[ai-router] ${providerKey} failed:`, msg);
      errors.push(`${providerKey}: ${msg}`);
      recordFailure(providerKey);
    }
  }

  throw new Error(`All providers failed. ${errors.join(' | ')}`);
}

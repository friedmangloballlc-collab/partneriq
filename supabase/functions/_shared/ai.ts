/**
 * Dual AI Model Strategy
 *
 * callClaude  — Claude Sonnet 4 for premium features:
 *   aiCommandCenter, analyzeContractIntelligence, analyzeCompetitorIntelligence,
 *   analyzeRelationshipHealth, populateBrandIntel, populateEvents
 *
 * callGPT     — GPT-4o-mini for volume features (all other AI functions)
 */

// ---------------------------------------------------------------------------
// Premium features — Claude Sonnet 4
// ---------------------------------------------------------------------------
export async function callClaude(
  prompt: string,
  maxTokens = 4000,
): Promise<string> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "[]";
}

// ---------------------------------------------------------------------------
// Volume features — GPT-4o-mini (10x cheaper)
// ---------------------------------------------------------------------------
export async function callGPT(
  prompt: string,
  maxTokens = 4000,
): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "[]";
}

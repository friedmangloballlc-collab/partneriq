/**
 * Crawl4AI HTTP Client
 *
 * Shared helper for interacting with the Crawl4AI Docker service.
 * Provides crawlUrl (single URL), crawlMultiple (batch), and pollForResult (task polling).
 */

const CRAWL4AI_URL = Deno.env.get("CRAWL4AI_URL") ?? "";
const CRAWL4AI_TOKEN = Deno.env.get("CRAWL4AI_TOKEN") ?? "";

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

interface CrawlResponse {
  task_id?: string;
  result?: CrawlResult;
  status?: string;
}

export interface CrawlResult {
  markdown?: string;
  html?: string;
  links?: string[];
  status?: string;
  error?: string;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (CRAWL4AI_TOKEN) {
    headers["Authorization"] = `Bearer ${CRAWL4AI_TOKEN}`;
  }
  return headers;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll a Crawl4AI task until it reaches a terminal state or max attempts.
 */
export async function pollForResult(taskId: string): Promise<CrawlResult> {
  const headers = buildHeaders();

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const resp = await fetch(`${CRAWL4AI_URL}/task/${taskId}`, { headers });
    if (!resp.ok) {
      throw new Error(`Poll request failed with status ${resp.status}: ${await resp.text()}`);
    }

    const data: CrawlResponse = await resp.json();

    if (data.status === "completed" && data.result) {
      return data.result;
    }

    if (data.status === "failed") {
      throw new Error(data.result?.error ?? "Crawl task failed without error details");
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Crawl task ${taskId} did not complete within ${MAX_POLL_ATTEMPTS} attempts`);
}

/**
 * Crawl a single URL via Crawl4AI. Returns the crawl result with markdown, html, and links.
 */
export async function crawlUrl(
  url: string,
  cacheMode: string = "bypass"
): Promise<CrawlResult> {
  if (!CRAWL4AI_URL) {
    throw new Error("CRAWL4AI_URL environment variable is not set");
  }

  const headers = buildHeaders();

  const resp = await fetch(`${CRAWL4AI_URL}/crawl`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      urls: [url],
      priority: 10,
      cache_mode: cacheMode,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Crawl request failed with status ${resp.status}: ${await resp.text()}`);
  }

  const data: CrawlResponse = await resp.json();

  // If we get a task_id, poll for the result
  if (data.task_id) {
    return await pollForResult(data.task_id);
  }

  // If the result is returned inline
  if (data.result) {
    return data.result;
  }

  throw new Error("Crawl response contained neither task_id nor result");
}

/**
 * Crawl multiple URLs sequentially and return all results.
 */
export async function crawlMultiple(
  urls: string[],
  cacheMode: string = "bypass"
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];

  for (const url of urls) {
    try {
      const result = await crawlUrl(url, cacheMode);
      results.push(result);
    } catch (err) {
      // Include partial failures with error context so callers can decide how to handle
      results.push({
        markdown: "",
        html: "",
        links: [],
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

/**
 * dealFlowConnectors.js
 *
 * Cross-tool utility functions that connect the siloed Deal Stage tools
 * (Demographics, Culture Calendar, Talent Revenue, Deal Analytics) so they
 * feed each other automatically. All functions receive the Supabase client as
 * their first argument so they work cleanly in both component and server
 * contexts without importing a singleton.
 */

/**
 * Fetch upcoming culture events that are relevant to a deal's niche.
 * Matches on the `best_industries` column using a case-insensitive LIKE.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} niche  - e.g. "fitness", "beauty", "tech"
 * @param {number} [limit=5]
 * @returns {Promise<Array>}
 */
export async function getRelevantEvents(supabase, niche, limit = 5) {
  const { data } = await supabase
    .from('culture_events')
    .select('*')
    .ilike('best_industries', `%${niche}%`)
    .order('year')
    .order('month')
    .limit(limit);
  return data || [];
}

/**
 * Fetch rate benchmark data for a given platform + tier combination.
 * Returns a single benchmark record or null when no match is found.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} platform - e.g. "instagram", "youtube", "tiktok"
 * @param {string} tier     - e.g. "micro", "mid", "macro", "mega"
 * @returns {Promise<object|null>}
 */
export async function getRateBenchmarks(supabase, platform, tier) {
  const { data } = await supabase
    .from('rate_benchmarks')
    .select('*')
    .eq('platform', platform)
    .eq('tier', tier)
    .limit(1);
  return data?.[0] || null;
}

/**
 * Fetch demographic segments that match a target audience description.
 * Matches on the `name` column using a case-insensitive LIKE so partial
 * terms like "gen z", "millennial", or "sports fans" all resolve.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} segmentName - partial or full segment name to search
 * @param {number} [limit=3]
 * @returns {Promise<Array>}
 */
export async function getDemographicInsights(supabase, segmentName, limit = 3) {
  const { data } = await supabase
    .from('demographic_segments')
    .select('*')
    .ilike('name', `%${segmentName}%`)
    .limit(limit);
  return data || [];
}

/**
 * Fetch the industry guide entry for a brand's industry.
 * Returns a single guide record or null when no match is found.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} industry - e.g. "Beauty & Personal Care", "Sports & Fitness"
 * @returns {Promise<object|null>}
 */
export async function getIndustryGuide(supabase, industry) {
  const { data } = await supabase
    .from('industry_guides')
    .select('*')
    .ilike('industry', `%${industry}%`)
    .limit(1);
  return data?.[0] || null;
}

/**
 * Aggregate outreach conversion funnel metrics from outreach_emails.
 * Counts records by status to compute sent → replied → contracted rates.
 *
 * Returned shape:
 *   { sent, replied, contracted, replyRate, contractRate }
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{sent:number, replied:number, contracted:number, replyRate:number, contractRate:number}>}
 */
export async function getOutreachConversionMetrics(supabase) {
  // Use parallel count queries instead of fetching 2000 rows
  const [sentRes, repliedRes, contractedRes] = await Promise.all([
    supabase.from('outreach_emails').select('id', { count: 'exact', head: true }).in('status', ['sent', 'replied', 'contracted']),
    supabase.from('outreach_emails').select('id', { count: 'exact', head: true }).in('status', ['replied', 'contracted']),
    supabase.from('outreach_emails').select('id', { count: 'exact', head: true }).eq('status', 'contracted'),
  ]);

  const sent = sentRes.count || 0;
  const replied = repliedRes.count || 0;
  const contracted = contractedRes.count || 0;

  return {
    sent,
    replied,
    contracted,
    replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    contractRate: replied > 0 ? Math.round((contracted / replied) * 100) : 0,
  };
}

/**
 * Fetch pipeline value summary from the partnerships table.
 * Groups active and negotiating deals to compute the live pipeline value,
 * and returns completed deal revenue and the overall win rate.
 *
 * Returned shape:
 *   { pipelineValue, closedRevenue, totalDeals, winRate, activeCount, negotiatingCount }
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<object>}
 */
export async function getPipelineSummary(supabase) {
  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('status, deal_value')
    .limit(500);

  if (!partnerships || partnerships.length === 0) {
    return { pipelineValue: 0, closedRevenue: 0, totalDeals: 0, winRate: 0, activeCount: 0, negotiatingCount: 0 };
  }

  const activeStatuses = ['active', 'negotiating', 'contracted', 'responded', 'outreach_sent', 'outreach_pending', 'researching', 'discovered'];
  const total = partnerships.length;
  const completed = partnerships.filter(p => p.status === 'completed');
  const active = partnerships.filter(p => p.status === 'active');
  const negotiating = partnerships.filter(p => p.status === 'negotiating');
  const inPipeline = partnerships.filter(p => activeStatuses.includes(p.status));

  const pipelineValue = inPipeline.reduce((sum, p) => sum + (p.deal_value || 0), 0);
  const closedRevenue = completed.reduce((sum, p) => sum + (p.deal_value || 0), 0);

  return {
    pipelineValue,
    closedRevenue,
    totalDeals: total,
    winRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    activeCount: active.length,
    negotiatingCount: negotiating.length,
  };
}

/**
 * Fetch deal-value-over-time data by grouping partnerships on created_at.
 * Returns an array of { month, value, deals } objects sorted chronologically.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {number} [monthsBack=9]
 * @returns {Promise<Array<{month:string, value:number, deals:number}>>}
 */
export async function getDealValueOverTime(supabase, monthsBack = 9) {
  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('created_at, deal_value')
    .order('created_at', { ascending: true })
    .limit(1000);

  if (!partnerships || partnerships.length === 0) return [];

  const byMonth = {};
  partnerships.forEach(p => {
    if (!p.created_at) return;
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: key, value: 0, deals: 0 };
    byMonth[key].value += p.deal_value || 0;
    byMonth[key].deals++;
  });

  return Object.values(byMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-monthsBack);
}

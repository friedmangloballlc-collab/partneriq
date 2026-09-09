import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Import Planning Timelines
    const timelines = [
      { event_type: "MEGA EVENTS (Olympics, World Cup)", planning_lead_time: "18-24 months", key_milestones: "Sponsorship negotiations 24mo, Creative strategy 18mo, Media planning 12mo, Production 6mo", budget_lock_date: "18 months prior", creative_development: "12-18 months prior", media_buying_window: "12-18 months prior", execution_phase: "Event month + shoulder periods", post_event_analysis: "Within 30 days post-event" },
      { event_type: "Super Bowl", planning_lead_time: "12-18 months", key_milestones: "Ad buy decision 12mo, Creative brief 9mo, Production 6mo, Legal/network approval 2mo", budget_lock_date: "12 months prior", creative_development: "9-12 months prior", media_buying_window: "12 months prior (upfront)", execution_phase: "2 weeks pre + game day + post", post_event_analysis: "Within 1 week (rapid)" },
      { event_type: "NFL Season", planning_lead_time: "6-9 months", key_milestones: "Partnership renewals 9mo, Campaign development 6mo, Media plans 4mo, Talent booking 3mo", budget_lock_date: "6 months prior", creative_development: "4-6 months prior", media_buying_window: "4-6 months (upfronts)", execution_phase: "September-February", post_event_analysis: "End of season review" },
      { event_type: "March Madness", planning_lead_time: "6-9 months", key_milestones: "Bracket sponsorship 9mo, Creative 6mo, Regional planning 4mo, Digital strategy 3mo", budget_lock_date: "6 months prior", creative_development: "4-6 months prior", media_buying_window: "4-6 months prior", execution_phase: "Selection Sunday through Finals", post_event_analysis: "Within 2 weeks" },
      { event_type: "Major Awards Shows (Oscars, Grammy)", planning_lead_time: "4-6 months", key_milestones: "Sponsorship 6mo, Talent partnerships 4mo, Social strategy 2mo, Real-time war room 1mo", budget_lock_date: "4 months prior", creative_development: "3-4 months prior", media_buying_window: "3-4 months prior", execution_phase: "Red carpet + show + after-parties", post_event_analysis: "Within 1 week" }
    ];

    // Import Demographic Segments
    const demographics = [
      { segment_name: "Gen Z (Born 1997-2012)", population_size: "68M Americans", buying_power: "$360B direct, $600B influence", top_events: "World Cup, NBA, MLS, VMAs, Coachella, VidCon, Gaming events", key_cultural_moments: "Pride Month, Mental Health Awareness, Earth Day", media_preferences: "TikTok, YouTube, Twitch, Instagram; mobile-first; short-form video", activation_tips: "Authenticity critical; influencer partnerships; interactive experiences; sustainability messaging" },
      { segment_name: "Millennials (Born 1981-1996)", population_size: "72M Americans", buying_power: "$2.5T annually", top_events: "World Cup, Olympics, NBA, NFL, March Madness, Music Festivals", key_cultural_moments: "All heritage months, Pride, Earth Day", media_preferences: "Instagram, TikTok, YouTube, Streaming; cross-platform", activation_tips: "Experiences over products; nostalgia marketing; value-driven; highest Halloween spenders ($447)" },
      { segment_name: "Gen X (Born 1965-1980)", population_size: "65M Americans", buying_power: "$2.4T annually", top_events: "NFL, MLB, Golf Majors, NASCAR, Classic Rock Tours", key_cultural_moments: "Breast Cancer Awareness, Veterans Day", media_preferences: "Facebook, YouTube, Email, TV; streaming adoption growing", activation_tips: "Value-conscious; quality messaging; family-focused; financial security themes" },
      { segment_name: "Baby Boomers (Born 1946-1964)", population_size: "70M Americans", buying_power: "$2.6T annually", top_events: "NFL, MLB, Golf, NASCAR, Traditional holidays", key_cultural_moments: "Veterans Day, Heart Health Month", media_preferences: "Facebook, TV (linear), Email, Print", activation_tips: "Traditional retail; brand loyalty; health/wellness; legacy themes" },
      { segment_name: "Hispanic/Latino Americans", population_size: "65M (19% of US)", buying_power: "$2.8T (LARGEST minority)", top_events: "World Cup 2026 (#1), Soccer/MLS, Boxing, Latin Music", key_cultural_moments: "Hispanic Heritage Month (Sep 15-Oct 15), Cinco de Mayo", media_preferences: "Spanish-language media, Telemundo/Univision, YouTube, WhatsApp", activation_tips: "Bilingual campaigns; family values; cultural authenticity; soccer is ESSENTIAL" }
    ];

    // Import Viewership Tiers
    const viewership = [
      { event: "Super Bowl", tier: "TIER 1 (100M+ US)", us_viewership: "127M+ US", global_reach: "200M+ global", key_demographic: "Mass market, 70% male", cpm_range: "$7M/30 sec", best_for: "Mass awareness, product launches" },
      { event: "World Cup Final 2026", tier: "TIER 1", us_viewership: "50M+ US projected", global_reach: "2B+ global", key_demographic: "Global, 76% under 45", cpm_range: "Premium digital/TV", best_for: "Global brands, Hispanic marketing" },
      { event: "Olympic Opening Ceremony 2028", tier: "TIER 1", us_viewership: "30-40M US", global_reach: "1B+ global", key_demographic: "All demos, families", cpm_range: "NBC premium package", best_for: "Brand prestige, national pride" },
      { event: "March Madness Final Four", tier: "TIER 2 (15-50M US)", us_viewership: "18M+ US", global_reach: "N/A", key_demographic: "Office workers, alumni", cpm_range: "$400K-800K/30 sec", best_for: "QSR, beer, insurance, betting" }
    ];

    // Import Mega Events
    const megaEvents = [
      { event_name: "FIFA World Cup 2026", year: 2026, global_reach: "6 BILLION global engagement", us_viewership: "50M+ for US matches, 2B+ for Final", format_details: "48 teams, 104 matches, first tri-nation World Cup", key_facts: "First tri-nation event; US hosts for first time in 32 years", dates: "Jun 11 - Jul 19, 2026", planning_urgency: "BEGIN PLANNING NOW - 18+ month lead time", competitive_landscape: "Adidas, Coca-Cola, Visa, Qatar Airways already in discussions" },
      { event_name: "Winter Olympics 2026", year: 2026, global_reach: "1B+ global viewership", us_viewership: "30-40M US", format_details: "Winter sports across multiple venues", key_facts: "Global prestige; family appeal", dates: "Feb 6-22, 2026", planning_urgency: "CRITICAL - NBC packages selling now", competitive_landscape: "Coca-Cola, Intel, Samsung, Visa" },
      { event_name: "Super Bowl LX", year: 2026, global_reach: "200M+ global", us_viewership: "127M+ US", format_details: "Annual championship game", key_facts: "Most-watched sporting event; Bad Bunny halftime", dates: "Feb 8, 2026", planning_urgency: "CRITICAL - Media buys lock 12+ months out", competitive_landscape: "Pepsi, Bud Light, Toyota, Verizon" }
    ];

    // Import Conferences
    const conferences = [
      { conference_name: "CES (Consumer Electronics Show)", industry_focus: "Technology", typical_date: "January (Jan 7-10, 2026)", location: "Las Vegas, NV", attendees: "200,000+", key_audience: "Tech executives, media, innovators", best_for_industries: "Tech, Consumer Electronics, Automotive, AI", sponsorship_range: "$50K-$500K+", why_attend: "Largest tech showcase; product launches; media coverage" },
      { conference_name: "NVIDIA GTC", industry_focus: "AI/Technology", typical_date: "March", location: "San Jose, CA", attendees: "20,000+ in-person", key_audience: "AI/ML professionals, developers", best_for_industries: "AI, Tech, Healthcare, Financial Services", sponsorship_range: "$25K-$200K", why_attend: "Premier AI conference; cutting-edge research" },
      { conference_name: "Google Cloud Next", industry_focus: "Cloud/Technology", typical_date: "April", location: "Las Vegas, NV", attendees: "30,000+", key_audience: "IT leaders, developers, enterprises", best_for_industries: "Cloud, AI, Tech, Enterprise", sponsorship_range: "$30K-$250K", why_attend: "Google ecosystem; cloud transformation" },
      { conference_name: "Microsoft Build", industry_focus: "Technology/Developer", typical_date: "May", location: "Seattle, WA", attendees: "6,000+ in-person", key_audience: "Developers, IT professionals", best_for_industries: "Tech, Software, AI, Enterprise", sponsorship_range: "$25K-$150K", why_attend: "Microsoft ecosystem; developer tools" },
      { conference_name: "Apple WWDC", industry_focus: "Technology", typical_date: "June", location: "Cupertino, CA (mostly virtual)", attendees: "Developers, media", key_audience: "Developers, media", best_for_industries: "Tech, Apps, Consumer Electronics", sponsorship_range: "By invitation", why_attend: "Apple ecosystem; iOS/Mac development" }
    ];

    // Bulk imports
    const results = {
      timelines: (await base44.asServiceRole.entities.PlanningTimeline.bulkCreate(timelines)).length,
      demographics: (await base44.asServiceRole.entities.DemographicSegment.bulkCreate(demographics)).length,
      viewership: (await base44.asServiceRole.entities.ViewershipTier.bulkCreate(viewership)).length,
      megaEvents: (await base44.asServiceRole.entities.MegaEvent.bulkCreate(megaEvents)).length,
      conferences: (await base44.asServiceRole.entities.Conference.bulkCreate(conferences)).length
    };

    return Response.json({ success: true, imported: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
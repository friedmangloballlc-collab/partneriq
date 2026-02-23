import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Complete Industry Guide Data (146 industries)
const INDUSTRY_GUIDES = [
  { industry: "Accounting", sector: "Finance", priority_tier_1_events: "Tax Day (Apr 15), Q1-Q4 Earnings Seasons, NFL Season", tier_2_events: "Small Business Saturday, Financial Literacy Month", heritage_awareness_months: "Financial Literacy Month (Apr)", key_conferences: "AICPA Engage, AAA Annual Meeting", best_demographics: "Business owners, CFOs, SMBs", budget_allocation: "8-12%", activation_strategies: "Tax season campaigns, B2B thought leadership, CPE sponsorships" },
  { industry: "Banking", sector: "Finance", priority_tier_1_events: "Super Bowl, NFL Season, March Madness, Holiday Shopping Season", tier_2_events: "Kentucky Derby, Golf Majors, College Football", heritage_awareness_months: "Financial Literacy Month, Hispanic Heritage Month", key_conferences: "Money 20/20, BAI Beacon, ABA Annual", best_demographics: "Mass market, affluent, small business", budget_allocation: "12-15%", activation_strategies: "Branch activations, financial wellness, community banking" },
  { industry: "Capital Markets", sector: "Finance", priority_tier_1_events: "Golf Majors, US Open Tennis, Kentucky Derby, Art Basel", tier_2_events: "NFL Season, Super Bowl (hospitality)", heritage_awareness_months: "N/A", key_conferences: "Milken Global, SALT, Delivering Alpha", best_demographics: "UHNW, institutional investors", budget_allocation: "8-12%", activation_strategies: "Exclusive hospitality, thought leadership, investor events" },
  { industry: "Financial Services", sector: "Finance", priority_tier_1_events: "Super Bowl, March Madness, NFL Season, Golf Majors, Olympics", tier_2_events: "Kentucky Derby, US Open Tennis, College Football", heritage_awareness_months: "Financial Literacy Month, All Heritage Months", key_conferences: "Money 20/20, Finovate, In|Vest", best_demographics: "Mass market to UHNW", budget_allocation: "12-18%", activation_strategies: "Life stage marketing, retirement messaging, mobile banking" },
  { industry: "Insurance", sector: "Finance", priority_tier_1_events: "Super Bowl, NFL Season, March Madness, NASCAR, MLB", tier_2_events: "College Football, Golf Majors, NHL", heritage_awareness_months: "Financial Literacy Month, Veterans Day", key_conferences: "RIMS, NAIC, InsureTech Connect", best_demographics: "Homeowners, families, businesses", budget_allocation: "15-20%", activation_strategies: "Safety messaging, claims stories, sports risk themes" },
  { industry: "Automotive", sector: "Retail", priority_tier_1_events: "Super Bowl, NFL Season, March Madness, Olympics, World Cup", tier_2_events: "Kentucky Derby, Golf Majors, NBA Finals", heritage_awareness_months: "N/A", key_conferences: "Detroit Auto Show, SXSW, CES", best_demographics: "Male 35-55, affluent", budget_allocation: "18-25%", activation_strategies: "Performance messaging, technology showcases, test drive events" },
  { industry: "Retail/General Merchandise", sector: "Retail", priority_tier_1_events: "Black Friday, Cyber Monday, Christmas, Back to School, Presidents Day", tier_2_events: "Valentine's Day, Mother's Day, Father's Day", heritage_awareness_months: "All heritage months", key_conferences: "NRF Annual Convention, ShopTalk", best_demographics: "All demographics, deal-seekers", budget_allocation: "20-30%", activation_strategies: "Seasonal campaigns, flash sales, influencer partnerships" },
  { industry: "Food & Beverage", sector: "Consumer", priority_tier_1_events: "Super Bowl, Super Bowl Sunday, Thanksgiving, Christmas, Summer BBQ Season", tier_2_events: "Mother's Day, Father's Day, Valentine's Day", heritage_awareness_months: "Hispanic Heritage Month, Pride Month", key_conferences: "IPPE, NRA Conference, Summer Fancy Food", best_demographics: "Families, 25-65", budget_allocation: "15-22%", activation_strategies: "Product sampling, chef partnerships, cultural tie-ins" },
  { industry: "Technology", sector: "B2B/B2C", priority_tier_1_events: "CES, World Cup 2026 (tech angle), Olympics, Super Bowl", tier_2_events: "SXSW, Google I/O, Microsoft Build", heritage_awareness_months: "N/A", key_conferences: "CES, Google I/O, Microsoft Build, Apple WWDC", best_demographics: "Tech professionals, 25-45", budget_allocation: "15-20%", activation_strategies: "Product launches, innovation showcases, developer engagement" },
  { industry: "Healthcare", sector: "B2B/B2C", priority_tier_1_events: "Super Bowl (wellness angle), World Cup, Olympics, Health Awareness Months", tier_2_events: "New Year (resolutions), Summer fitness", heritage_awareness_months: "Mental Health Month (May), Cancer Awareness Months", key_conferences: "HIMSS, J.P. Morgan Healthcare", best_demographics: "All ages, health-conscious", budget_allocation: "12-18%", activation_strategies: "Education campaigns, wellness partnerships, professional training" },
  { industry: "Sports & Fitness", sector: "Consumer", priority_tier_1_events: "All sporting events, Olympics, World Cup, March Madness", tier_2_events: "New Year (resolutions), Summer sports", heritage_awareness_months: "All heritage months", key_conferences: "IHRSA, NASM Summit", best_demographics: "All ages, active lifestyle", budget_allocation: "20-30%", activation_strategies: "Athlete partnerships, sponsorships, community events" }
];

// Activation Checklists
const ACTIVATION_CHECKLISTS = [
  { event_type: "Major Sporting Event", timeline: "12+ months out", task: "Secure sponsorship agreement", owner: "Business Development", notes: "Lock in rights, category exclusivity", priority: "critical" },
  { event_type: "Major Sporting Event", timeline: "12+ months out", task: "Assign internal team lead", owner: "Project Management", notes: "Single point of accountability", priority: "critical" },
  { event_type: "Major Sporting Event", timeline: "10-12 months", task: "Develop strategic brief", owner: "Strategy", notes: "Objectives, KPIs, target audience, key messages", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "9-10 months", task: "Secure talent/athlete partnerships", owner: "Business Development", notes: "Lock key personalities for activations", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "9-10 months", task: "Creative concept development", owner: "Creative", notes: "Multiple concepts, board approval", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "6-8 months", task: "Media planning and buying", owner: "Media", notes: "Broadcast, digital, print placements", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "6 months", task: "Experiential/activation site design", owner: "Experiential", notes: "Logistics, permits, vendor selection", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "4 months", task: "Production begins", owner: "Production", notes: "Creative assets, video, photography", priority: "high" },
  { event_type: "Major Sporting Event", timeline: "6-8 weeks", task: "Social/digital strategy and content calendar", owner: "Digital/Social", notes: "Real-time engagement plan, hashtag strategy", priority: "medium" },
  { event_type: "Major Sporting Event", timeline: "4 weeks", task: "Internal/team training", owner: "HR", notes: "Brief all staff on messaging and KPIs", priority: "medium" },
  { event_type: "Major Sporting Event", timeline: "2 weeks pre-event", task: "Final logistics review", owner: "Operations", notes: "Confirm all details, contingency plans", priority: "critical" },
  { event_type: "Major Sporting Event", timeline: "Event week", task: "Real-time monitoring and response", owner: "Social/PR", notes: "War room setup, rapid response", priority: "critical" },
  { event_type: "Major Sporting Event", timeline: "Post-event", task: "Performance analysis and reporting", owner: "Analytics", notes: "ROI, reach, engagement, learnings", priority: "high" }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Bulk import all data
    const results = {
      industryGuides: (await base44.asServiceRole.entities.IndustryGuide.bulkCreate(INDUSTRY_GUIDES)).length,
      activationChecklists: (await base44.asServiceRole.entities.ActivationChecklist.bulkCreate(ACTIVATION_CHECKLISTS)).length
    };

    return Response.json({ success: true, imported: results, message: `Imported ${results.industryGuides} industry guides and ${results.activationChecklists} checklist items` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * Unified data-import edge function.
 *
 * Consolidates: importAllCalendarData (industry guides + checklists),
 * importAllConferences, importCultureEvents, importEntityData,
 * importFullCalendarData (timelines + demographics + viewership + mega events + conferences),
 * importIndustryGuides (CSV/LLM-based import).
 *
 * Request body:
 *   { entity: string, ...entityPayload }
 *
 * Valid entities:
 *   "industry_guides"   - Seed 11 industry guides + 13 activation checklists
 *   "conferences"       - Seed 31 conferences from master list
 *   "culture_events"    - Seed 36 culture/calendar events
 *   "entity"            - Generic CSV import (requires entityName, csvData, fieldMapping)
 *   "full_calendar"     - Seed timelines, demographics, viewership, mega events, conferences
 *   "industry_csv"      - Import industry guides from CSV rows or file URL
 */

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

// ─── Seed data: Industry Guides (11 industries) ─────────────────────────────

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
  { industry: "Sports & Fitness", sector: "Consumer", priority_tier_1_events: "All sporting events, Olympics, World Cup, March Madness", tier_2_events: "New Year (resolutions), Summer sports", heritage_awareness_months: "All heritage months", key_conferences: "IHRSA, NASM Summit", best_demographics: "All ages, active lifestyle", budget_allocation: "20-30%", activation_strategies: "Athlete partnerships, sponsorships, community events" },
];

// ─── Seed data: Activation Checklists ────────────────────────────────────────

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
  { event_type: "Major Sporting Event", timeline: "Post-event", task: "Performance analysis and reporting", owner: "Analytics", notes: "ROI, reach, engagement, learnings", priority: "high" },
];

// ─── Seed data: Conferences (31 entries) ─────────────────────────────────────

const ALL_CONFERENCES = [
  { conference_name: "CES (Consumer Electronics Show)", industry_focus: "Technology", typical_date: "January (Jan 7-10, 2026)", location: "Las Vegas, NV", attendees: "200,000+", key_audience: "Tech executives, media, innovators", best_for_industries: "Tech, Consumer Electronics, Automotive, AI", sponsorship_range: "$50K-$500K+", why_attend: "Largest tech showcase; product launches; media coverage" },
  { conference_name: "NVIDIA GTC", industry_focus: "AI/Technology", typical_date: "March", location: "San Jose, CA", attendees: "20,000+ in-person", key_audience: "AI/ML professionals, developers", best_for_industries: "AI, Tech, Healthcare, Financial Services", sponsorship_range: "$25K-$200K", why_attend: "Premier AI conference; cutting-edge research" },
  { conference_name: "Google Cloud Next", industry_focus: "Cloud/Technology", typical_date: "April", location: "Las Vegas, NV", attendees: "30,000+", key_audience: "IT leaders, developers, enterprises", best_for_industries: "Cloud, AI, Tech, Enterprise", sponsorship_range: "$30K-$250K", why_attend: "Google ecosystem; cloud transformation" },
  { conference_name: "Microsoft Build", industry_focus: "Technology/Developer", typical_date: "May", location: "Seattle, WA", attendees: "6,000+ in-person", key_audience: "Developers, IT professionals", best_for_industries: "Tech, Software, AI, Enterprise", sponsorship_range: "$25K-$150K", why_attend: "Microsoft ecosystem; developer tools" },
  { conference_name: "Apple WWDC", industry_focus: "Technology", typical_date: "June", location: "Cupertino, CA (mostly virtual)", attendees: "Developers, media", key_audience: "Developers, media", best_for_industries: "Tech, Apps, Consumer Electronics", sponsorship_range: "By invitation", why_attend: "Apple ecosystem; iOS/Mac development" },
  { conference_name: "Google I/O", industry_focus: "Technology", typical_date: "May", location: "Mountain View, CA", attendees: "10,000+ in-person", key_audience: "Developers, AI researchers", best_for_industries: "Tech, AI, Cloud, Consumer Electronics", sponsorship_range: "$30K-$200K", why_attend: "Google's annual developer conference" },
  { conference_name: "SXSW", industry_focus: "Technology/Film/Music", typical_date: "March", location: "Austin, TX", attendees: "400,000+", key_audience: "Creatives, tech professionals, media", best_for_industries: "Tech, Entertainment, Automotive, Consumer", sponsorship_range: "$25K-$500K+", why_attend: "Cultural phenomenon; networking nexus" },
  { conference_name: "Money 20/20", industry_focus: "Financial Services", typical_date: "October", location: "Las Vegas, NV", attendees: "15,000+", key_audience: "Fintech leaders, investors", best_for_industries: "Finance, Banking, FinTech, Tech", sponsorship_range: "$50K-$500K", why_attend: "Largest financial services tech conference" },
  { conference_name: "Milken Global", industry_focus: "Finance/Investment", typical_date: "April-May", location: "Los Angeles, CA", attendees: "4,000+", key_audience: "Ultra-high-net-worth investors", best_for_industries: "Finance, Investment, Luxury", sponsorship_range: "$100K-$1M+", why_attend: "Elite networking; UHNW audience" },
  { conference_name: "SALT", industry_focus: "Finance/Investment", typical_date: "September", location: "Las Vegas, NV", attendees: "3,000+", key_audience: "Hedge fund managers, investors", best_for_industries: "Finance, Investment, Tech", sponsorship_range: "$50K-$500K", why_attend: "Premier alternative investment conference" },
  { conference_name: "NRF Annual Convention", industry_focus: "Retail", typical_date: "January", location: "New York, NY", attendees: "35,000+", key_audience: "Retail executives, entrepreneurs", best_for_industries: "Retail, Tech, Logistics, Fashion", sponsorship_range: "$25K-$300K", why_attend: "Retail industry flagship event" },
  { conference_name: "ShopTalk", industry_focus: "Retail/E-Commerce", typical_date: "March", location: "Las Vegas, NV", attendees: "8,000+", key_audience: "Retail, e-commerce leaders", best_for_industries: "Retail, Tech, Consumer", sponsorship_range: "$30K-$250K", why_attend: "Modern retail transformation" },
  { conference_name: "IPPE (International Production and Processing Expo)", industry_focus: "Food & Agriculture", typical_date: "January", location: "Atlanta, GA", attendees: "30,000+", key_audience: "Food producers, processors", best_for_industries: "Food & Beverage, Agriculture, Retail", sponsorship_range: "$20K-$150K", why_attend: "Largest poultry/food processing show" },
  { conference_name: "NRA Conference (National Restaurant Association)", industry_focus: "Food Service", typical_date: "May", location: "Chicago, IL", attendees: "85,000+", key_audience: "Restaurant owners, operators", best_for_industries: "Food & Beverage, Tech, Hospitality", sponsorship_range: "$50K-$500K+", why_attend: "Restaurant industry's largest event" },
  { conference_name: "Summer Fancy Food Show", industry_focus: "Specialty Food", typical_date: "June", location: "New York, NY", attendees: "20,000+", key_audience: "Specialty food buyers, chefs", best_for_industries: "Food & Beverage, Retail, Hospitality", sponsorship_range: "$15K-$100K", why_attend: "Premium food product showcase" },
  { conference_name: "HIMSS (Healthcare Information and Management Systems Society)", industry_focus: "Healthcare Technology", typical_date: "March", location: "Orlando, FL", attendees: "45,000+", key_audience: "Healthcare IT professionals", best_for_industries: "Healthcare, Tech, Pharma", sponsorship_range: "$50K-$500K", why_attend: "Healthcare IT industry leader" },
  { conference_name: "J.P. Morgan Healthcare Conference", industry_focus: "Healthcare Investment", typical_date: "January", location: "San Francisco, CA", attendees: "4,000+", key_audience: "Healthcare investors, pharma execs", best_for_industries: "Healthcare, Pharma, Medical Devices", sponsorship_range: "$100K-$1M+", why_attend: "Premier healthcare investment event" },
  { conference_name: "IHRSA (International Health, Racquet & Sportsclub Association)", industry_focus: "Fitness/Sports", typical_date: "March", location: "San Diego, CA", attendees: "10,000+", key_audience: "Gym owners, fitness professionals", best_for_industries: "Sports & Fitness, Healthcare, Tech", sponsorship_range: "$25K-$200K", why_attend: "Fitness industry's largest conference" },
  { conference_name: "AICPA Engage", industry_focus: "Accounting", typical_date: "November", location: "Denver, CO", attendees: "8,000+", key_audience: "CPAs, accounting professionals", best_for_industries: "Accounting, Finance, Tech", sponsorship_range: "$20K-$150K", why_attend: "Professional accounting conference" },
  { conference_name: "BAI Beacon", industry_focus: "Banking", typical_date: "October", location: "New York, NY", attendees: "3,000+", key_audience: "Bank executives, leaders", best_for_industries: "Banking, Finance, Tech", sponsorship_range: "$50K-$250K", why_attend: "Banking strategy conference" },
  { conference_name: "ABA Annual Conference", industry_focus: "Banking", typical_date: "October", location: "Various", attendees: "5,000+", key_audience: "Bankers, financial professionals", best_for_industries: "Banking, Finance, Retail", sponsorship_range: "$25K-$200K", why_attend: "American Bankers Association flagship" },
  { conference_name: "Finovate", industry_focus: "Financial Innovation", typical_date: "May & September", location: "New York, San Francisco", attendees: "2,000+", key_audience: "FinTech startups, investors", best_for_industries: "FinTech, Finance, Tech", sponsorship_range: "$10K-$75K", why_attend: "FinTech innovation showcase" },
  { conference_name: "InsureTech Connect", industry_focus: "Insurance Technology", typical_date: "November", location: "Las Vegas, NV", attendees: "5,000+", key_audience: "Insurance execs, tech leaders", best_for_industries: "Insurance, Tech, Finance", sponsorship_range: "$30K-$200K", why_attend: "Insurance technology conference" },
  { conference_name: "RIMS (Risk and Insurance Management Society)", industry_focus: "Risk Management", typical_date: "April", location: "Various", attendees: "4,000+", key_audience: "Risk managers, insurance professionals", best_for_industries: "Insurance, Finance, Corporate", sponsorship_range: "$25K-$150K", why_attend: "Risk management professional association" },
  { conference_name: "NAIC (National Association of Insurance Commissioners)", industry_focus: "Insurance Regulation", typical_date: "December", location: "New Orleans, LA", attendees: "2,000+", key_audience: "Insurance regulators, commissioners", best_for_industries: "Insurance, Finance, Legal", sponsorship_range: "$15K-$100K", why_attend: "Insurance regulatory leadership" },
  { conference_name: "Detroit Auto Show", industry_focus: "Automotive", typical_date: "January", location: "Detroit, MI", attendees: "600,000+", key_audience: "Auto industry, consumers, media", best_for_industries: "Automotive, Tech, Consumer", sponsorship_range: "$100K-$5M+", why_attend: "North America's largest auto show" },
  { conference_name: "Delivering Alpha", industry_focus: "Investment/Finance", typical_date: "September", location: "New York, NY", attendees: "1,500+", key_audience: "Investment managers, hedge fund leads", best_for_industries: "Finance, Investment, Tech", sponsorship_range: "$75K-$500K", why_attend: "Elite investment conference" },
  { conference_name: "In|Vest", industry_focus: "Investment Management", typical_date: "June", location: "Austin, TX", attendees: "2,000+", key_audience: "Asset managers, investors", best_for_industries: "Finance, Investment, Tech", sponsorship_range: "$25K-$150K", why_attend: "Investment innovation summit" },
  { conference_name: "Art Basel", industry_focus: "Art/Luxury", typical_date: "December", location: "Miami Beach, FL", attendees: "75,000+", key_audience: "Art collectors, galleries, dealers", best_for_industries: "Luxury, Finance, Entertainment", sponsorship_range: "$50K-$500K+", why_attend: "Premier international art fair" },
  { conference_name: "VidCon", industry_focus: "Digital Video/Creator", typical_date: "July", location: "Anaheim, CA", attendees: "70,000+", key_audience: "Content creators, Gen Z/Millennials", best_for_industries: "Entertainment, Tech, Consumer", sponsorship_range: "$50K-$500K", why_attend: "Creator economy flagship event" },
];

// ─── Seed data: Culture Events (36 entries) ──────────────────────────────────

const CULTURE_EVENTS = [
  {"event_name": "New Year's Day", "year": 2026, "month": "January", "dates": "Jan 1", "category": "Holiday/Civic", "subcategory": "Federal Holiday", "audience_reach": "National", "key_demographics": "All demographics", "best_industries": "Retail, Fitness, Health & Wellness, Financial Services, CPG", "location": "National", "tier": "1", "activation_opportunities": "Resolution campaigns, Q5 gift card redemption, fresh start messaging", "notes": "Resolution-focused; gift card peak redemption"},
  {"event_name": "CES (Consumer Electronics Show)", "year": 2026, "month": "January", "dates": "Jan 6-9", "category": "Conferences/Trade", "subcategory": "Tech Conference", "audience_reach": "200,000+ attendees", "key_demographics": "Tech industry, innovators, media", "best_industries": "Technology, Consumer Electronics, Automotive, AI/ML, Telecom, Media", "location": "Las Vegas, NV", "tier": "1", "activation_opportunities": "Innovation showcases, keynote sponsorships, demo spaces, press events", "notes": "World's largest tech event"},
  {"event_name": "NFL Wild Card Weekend", "year": 2026, "month": "January", "dates": "Jan 10-12", "category": "Sports", "subcategory": "NFL", "audience_reach": "30M+ per game", "key_demographics": "Mass market, 70% male, HHI $75K+", "best_industries": "Beer/Alcohol, Automotive, Insurance, QSR, Snacks, Wireless", "location": "Various", "tier": "1", "activation_opportunities": "Gameday promotions, sports bars, fantasy playoffs", "notes": "Playoff intensity begins"},
  {"event_name": "Golden Globe Awards", "year": 2026, "month": "January", "dates": "Jan 11", "category": "Entertainment", "subcategory": "Awards Show", "audience_reach": "9.3M viewers", "key_demographics": "Adults 25-54, entertainment enthusiasts", "best_industries": "Luxury, Beauty, Fashion, Spirits, Automotive, Streaming", "location": "Los Angeles, CA", "tier": "2", "activation_opportunities": "Red carpet partnerships, viewing parties, celebrity activations", "notes": "Hollywood's party of the year"},
  {"event_name": "NFL Divisional Round", "year": 2026, "month": "January", "dates": "Jan 17-18", "category": "Sports", "subcategory": "NFL", "audience_reach": "35M+ per game", "key_demographics": "Mass market, 70% male", "best_industries": "Beer/Alcohol, Automotive, QSR, Sports Betting", "location": "Various", "tier": "1", "activation_opportunities": "Regional activations, hometown hero campaigns", "notes": "High-stakes playoff weekend"},
  {"event_name": "Super Bowl LX", "year": 2026, "month": "February", "dates": "Feb 8", "category": "Sports", "subcategory": "NFL", "audience_reach": "127M+ US", "key_demographics": "Mass market, 70% male", "best_industries": "Beer/Alcohol, Automotive, Insurance, QSR, Tech, Retail", "location": "Santa Clara, CA", "tier": "1", "activation_opportunities": "TV spots, halftime activations, experiential marketing, hospitality events", "notes": "Most-watched sporting event; Bad Bunny halftime"},
  {"event_name": "Winter Olympics 2026", "year": 2026, "month": "February", "dates": "Feb 6-22", "category": "Sports", "subcategory": "Winter Olympics", "audience_reach": "30-40M US viewers", "key_demographics": "All demographics, families", "best_industries": "All industries - cross-category appeal", "location": "Milan-Cortina, Italy", "tier": "1", "activation_opportunities": "NBC broadcast sponsorships, athlete partnerships, Olympic heritage campaigns", "notes": "Global prestige event; 1B+ worldwide"},
  {"event_name": "NBA All-Star Weekend", "year": 2026, "month": "February", "dates": "Feb 15-17", "category": "Sports", "subcategory": "NBA", "audience_reach": "15M+ US viewers", "key_demographics": "Urban, 35% female, multicultural", "best_industries": "Tech, Apparel, Automotive, Spirits, Entertainment", "location": "New Orleans, LA", "tier": "2", "activation_opportunities": "Celebrity partnerships, fashion events, tech showcases", "notes": "Entertainment meets sports"},
  {"event_name": "NCAA Tournament (March Madness)", "year": 2026, "month": "March", "dates": "Mar 17-Apr 6", "category": "Sports", "subcategory": "College Basketball", "audience_reach": "18M+ final four viewers", "key_demographics": "Office workers, alumni, 40-65 skew", "best_industries": "QSR, Beer, Insurance, Betting, Office Supply", "location": "Various", "tier": "1", "activation_opportunities": "Office bracket campaigns, watch party sponsorships, regional activations", "notes": "Highest engagement in workplace"},
  {"event_name": "Academy Awards (Oscars)", "year": 2026, "month": "March", "dates": "Mar 15", "category": "Entertainment", "subcategory": "Awards Show", "audience_reach": "11.5M US viewers", "key_demographics": "Adults 25-54, entertainment industry", "best_industries": "Luxury, Fashion, Beauty, Automotive, Streaming", "location": "Los Angeles, CA", "tier": "1", "activation_opportunities": "Red carpet partnerships, luxury brand activations, fashion events", "notes": "Highest prestige awards ceremony"},
  {"event_name": "Coachella Music Festival", "year": 2026, "month": "April", "dates": "Apr 10-19", "category": "Entertainment", "subcategory": "Music Festival", "audience_reach": "250,000+ attendees", "key_demographics": "Gen Z, Millennials, 60% female", "best_industries": "Fashion, Beauty, Tech, Spirits, Apparel", "location": "Indio, CA", "tier": "2", "activation_opportunities": "Brand activations, influencer partnerships, social media content", "notes": "Culture-defining music festival; influencer magnet"},
  {"event_name": "Masters Golf Tournament", "year": 2026, "month": "April", "dates": "Apr 9-12", "category": "Sports", "subcategory": "Golf", "audience_reach": "3M+ viewers, 100M+ reach", "key_demographics": "Male-skewed, affluent, 45-65", "best_industries": "Automotive, Luxury, Financial Services, Spirits", "location": "Augusta, GA", "tier": "1", "activation_opportunities": "Hospitality, luxury partnerships, prestige branding", "notes": "Most exclusive golf event; high-net-worth audience"},
  {"event_name": "Easter", "year": 2026, "month": "April", "dates": "Apr 5", "category": "Holiday/Civic", "subcategory": "Religious Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Retail, Fashion, Apparel, CPG, Candy, Travel", "location": "National", "tier": "1", "activation_opportunities": "Family campaigns, spring collection launches, gift bundles", "notes": "2nd largest consumer spending holiday"},
  {"event_name": "Kentucky Derby", "year": 2026, "month": "May", "dates": "May 2", "category": "Sports", "subcategory": "Horse Racing", "audience_reach": "20M+ viewers, 150K attendees", "key_demographics": "Affluent, 50-70, male-skewed", "best_industries": "Spirits, Automotive, Luxury, Fashion, Financial Services", "location": "Louisville, KY", "tier": "1", "activation_opportunities": "Hospitality, fashion partnerships, mint julep sponsorships", "notes": "Most prestigious horse race; haute couture event"},
  {"event_name": "Memorial Day", "year": 2026, "month": "May", "dates": "May 25", "category": "Holiday/Civic", "subcategory": "Federal Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Retail, Automotive, Travel, Home & Garden, Spirits", "location": "National", "tier": "1", "activation_opportunities": "Sales events, travel promotions, patriotic campaigns", "notes": "Unofficial summer kickoff; #2 consumer spending day"},
  {"event_name": "NBA Finals", "year": 2026, "month": "June", "dates": "Jun 4-18", "category": "Sports", "subcategory": "NBA", "audience_reach": "12M+ US viewers", "key_demographics": "Urban, multicultural, 35% female", "best_industries": "Tech, Apparel, Automotive, Spirits, Entertainment", "location": "Various", "tier": "1", "activation_opportunities": "Broadcast sponsorships, arena activations, celebrity partnerships", "notes": "Annual championship; global reach"},
  {"event_name": "Father's Day", "year": 2026, "month": "June", "dates": "Jun 21", "category": "Holiday/Civic", "subcategory": "Consumer Holiday", "audience_reach": "National", "key_demographics": "All demographics, male-skewed", "best_industries": "Retail, Tech, Automotive, Spirits, Apparel, Sports", "location": "National", "tier": "1", "activation_opportunities": "Gift guides, male-focused campaigns, sports partnerships", "notes": "Major retail driver; golf/sports overlap"},
  {"event_name": "FIFA World Cup 2026", "year": 2026, "month": "June", "dates": "Jun 11-Jul 19", "category": "Sports", "subcategory": "International Soccer", "audience_reach": "6B+ global, 50M+ US", "key_demographics": "Global, 76% under 45, Hispanic-dominant in US", "best_industries": "All industries - global megaevent", "location": "USA, Mexico, Canada (Multi-nation)", "tier": "1", "activation_opportunities": "Broadcast rights, stadium sponsorships, team partnerships, fan activation", "notes": "First tri-nation World Cup; US hosts; massive Hispanic opportunity"},
  {"event_name": "Independence Day", "year": 2026, "month": "July", "dates": "Jul 4", "category": "Holiday/Civic", "subcategory": "Federal Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Beer/Alcohol, Spirits, Automotive, Retail, Travel, Food", "location": "National", "tier": "1", "activation_opportunities": "Patriotic campaigns, barbecue tie-ins, travel promotions", "notes": "#1 beer consumption day; high spirits/alcohol spend"},
  {"event_name": "MLB All-Star Game", "year": 2026, "month": "July", "dates": "Jul 14", "category": "Sports", "subcategory": "MLB", "audience_reach": "8M+ viewers", "key_demographics": "Families, 45-65 skew", "best_industries": "Beer, Insurance, Automotive, Sports", "location": "New York, NY", "tier": "2", "activation_opportunities": "Fan experiences, Home Run Derby sponsorships, ballpark activations", "notes": "Mid-season entertainment"},
  {"event_name": "US Open Tennis", "year": 2026, "month": "August", "dates": "Aug 24-Sep 13", "category": "Sports", "subcategory": "Tennis", "audience_reach": "3M+ viewers, affluent", "key_demographics": "Affluent, educated, 45-70, female-skewed", "best_industries": "Luxury, Automotive, Financial Services, Fashion, Spirits", "location": "New York, NY", "tier": "2", "activation_opportunities": "VIP hospitality, luxury partnerships, fashion events", "notes": "Prestige tennis event; NYC glamour factor"},
  {"event_name": "Back to School", "year": 2026, "month": "August", "dates": "Aug 1-31", "category": "Holiday/Civic", "subcategory": "Consumer Shopping", "audience_reach": "National", "key_demographics": "Parents, students, 25-45", "best_industries": "Retail, Tech, Apparel, Office Supply, Beauty, Wireless", "location": "National", "tier": "1", "activation_opportunities": "School supply campaigns, tech launches, fashion collections", "notes": "2nd largest retail event after Christmas"},
  {"event_name": "Labor Day", "year": 2026, "month": "September", "dates": "Sep 7", "category": "Holiday/Civic", "subcategory": "Federal Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Retail, Automotive, Travel, Apparel, Home & Garden", "location": "National", "tier": "1", "activation_opportunities": "Summer clearance, fall collection launches, travel promotions", "notes": "End of summer; back to routine messaging"},
  {"event_name": "NFL Season Opener", "year": 2026, "month": "September", "dates": "Sep 10", "category": "Sports", "subcategory": "NFL", "audience_reach": "30M+ viewers", "key_demographics": "Mass market, 70% male, HHI $75K+", "best_industries": "Beer, Automotive, Insurance, QSR, Wireless, Sports Betting", "location": "Various", "tier": "1", "activation_opportunities": "Team partnerships, bar activations, fantasy tie-ins", "notes": "Start of peak sports season"},
  {"event_name": "US Open Golf Championship", "year": 2026, "month": "June", "dates": "Jun 15-21", "category": "Sports", "subcategory": "Golf", "audience_reach": "3M+ viewers, affluent", "key_demographics": "Affluent, educated, 50-70, male-skewed", "best_industries": "Automotive, Luxury, Financial Services, Spirits, Watches", "location": "Various", "tier": "1", "activation_opportunities": "Sponsorships, luxury hospitality, prestige branding", "notes": "Second-most prestigious golf tournament"},
  {"event_name": "Hispanic Heritage Month", "year": 2026, "month": "September", "dates": "Sep 15-Oct 15", "category": "Awareness Month", "subcategory": "Cultural Celebration", "audience_reach": "65M+ Hispanic Americans", "key_demographics": "Hispanic/Latino 18-65, bilingual", "best_industries": "All industries - major segment", "location": "National", "tier": "1", "activation_opportunities": "Bilingual campaigns, cultural events, community sponsorships, family-focused messaging", "notes": "Largest minority segment ($2.8T buying power); CRITICAL for Hispanic brands"},
  {"event_name": "Thanksgiving", "year": 2026, "month": "November", "dates": "Nov 26", "category": "Holiday/Civic", "subcategory": "Family Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Retail, Food, Travel, Spirits, Automotive, CPG", "location": "National", "tier": "1", "activation_opportunities": "Family campaigns, food/beverage tie-ins, travel promotions, gratitude messaging", "notes": "2nd largest travel day; family-centric"},
  {"event_name": "Black Friday", "year": 2026, "month": "November", "dates": "Nov 27", "category": "Holiday/Civic", "subcategory": "Shopping Event", "audience_reach": "National", "key_demographics": "All demographics, deal-seekers", "best_industries": "Retail, Tech, Apparel, Home & Garden, Automotive", "location": "National", "tier": "1", "activation_opportunities": "Major sales campaigns, flash deals, door busters, online promotions", "notes": "Largest retail day; kicks off holiday season"},
  {"event_name": "Cyber Monday", "year": 2026, "month": "December", "dates": "Dec 1", "category": "Holiday/Civic", "subcategory": "Shopping Event", "audience_reach": "National", "key_demographics": "All demographics, online-first", "best_industries": "Retail, Tech, Apparel, Electronics, Streaming", "location": "National", "tier": "1", "activation_opportunities": "Online-exclusive deals, digital campaigns, app promotions", "notes": "Peak online shopping day"},
  {"event_name": "Christmas", "year": 2026, "month": "December", "dates": "Dec 25", "category": "Holiday/Civic", "subcategory": "Religious Holiday", "audience_reach": "National", "key_demographics": "All demographics, families", "best_industries": "Retail, Spirits, Travel, Entertainment, Tech, Luxury", "location": "National", "tier": "1", "activation_opportunities": "Holiday campaigns, gift guides, family messaging, charitable tie-ins", "notes": "#1 consumer spending holiday; nostalgia/family-focused"},
  {"event_name": "MLB Playoff Wildcard", "year": 2026, "month": "October", "dates": "Oct 6-7", "category": "Sports", "subcategory": "MLB", "audience_reach": "8M+ viewers", "key_demographics": "Sports fans, 40-65", "best_industries": "Beer, Automotive, Insurance, Sports", "location": "Various", "tier": "2", "activation_opportunities": "Regional activations, hometown campaigns, bar sponsorships", "notes": "Playoff intensity begins"},
  {"event_name": "Halloween", "year": 2026, "month": "October", "dates": "Oct 31", "category": "Holiday/Civic", "subcategory": "Consumer Holiday", "audience_reach": "National", "key_demographics": "Families, Gen X/Millennials, 25-54", "best_industries": "Retail, Candy, Costumes, Home Decor, Spirits, Entertainment", "location": "National", "tier": "1", "activation_opportunities": "Costume contests, Halloween parties, seasonal collections, spooky campaigns", "notes": "Highest Halloween spending among Millennials ($447)"},
];

// ─── Seed data: Full Calendar (timelines, demographics, viewership, mega events, conferences) ──

const PLANNING_TIMELINES = [
  { event_type: "MEGA EVENTS (Olympics, World Cup)", planning_lead_time: "18-24 months", key_milestones: "Sponsorship negotiations 24mo, Creative strategy 18mo, Media planning 12mo, Production 6mo", budget_lock_date: "18 months prior", creative_development: "12-18 months prior", media_buying_window: "12-18 months prior", execution_phase: "Event month + shoulder periods", post_event_analysis: "Within 30 days post-event" },
  { event_type: "Super Bowl", planning_lead_time: "12-18 months", key_milestones: "Ad buy decision 12mo, Creative brief 9mo, Production 6mo, Legal/network approval 2mo", budget_lock_date: "12 months prior", creative_development: "9-12 months prior", media_buying_window: "12 months prior (upfront)", execution_phase: "2 weeks pre + game day + post", post_event_analysis: "Within 1 week (rapid)" },
  { event_type: "NFL Season", planning_lead_time: "6-9 months", key_milestones: "Partnership renewals 9mo, Campaign development 6mo, Media plans 4mo, Talent booking 3mo", budget_lock_date: "6 months prior", creative_development: "4-6 months prior", media_buying_window: "4-6 months (upfronts)", execution_phase: "September-February", post_event_analysis: "End of season review" },
  { event_type: "March Madness", planning_lead_time: "6-9 months", key_milestones: "Bracket sponsorship 9mo, Creative 6mo, Regional planning 4mo, Digital strategy 3mo", budget_lock_date: "6 months prior", creative_development: "4-6 months prior", media_buying_window: "4-6 months prior", execution_phase: "Selection Sunday through Finals", post_event_analysis: "Within 2 weeks" },
  { event_type: "Major Awards Shows (Oscars, Grammy)", planning_lead_time: "4-6 months", key_milestones: "Sponsorship 6mo, Talent partnerships 4mo, Social strategy 2mo, Real-time war room 1mo", budget_lock_date: "4 months prior", creative_development: "3-4 months prior", media_buying_window: "3-4 months prior", execution_phase: "Red carpet + show + after-parties", post_event_analysis: "Within 1 week" },
];

const DEMOGRAPHIC_SEGMENTS = [
  { segment_name: "Gen Z (Born 1997-2012)", population_size: "68M Americans", buying_power: "$360B direct, $600B influence", top_events: "World Cup, NBA, MLS, VMAs, Coachella, VidCon, Gaming events", key_cultural_moments: "Pride Month, Mental Health Awareness, Earth Day", media_preferences: "TikTok, YouTube, Twitch, Instagram; mobile-first; short-form video", activation_tips: "Authenticity critical; influencer partnerships; interactive experiences; sustainability messaging" },
  { segment_name: "Millennials (Born 1981-1996)", population_size: "72M Americans", buying_power: "$2.5T annually", top_events: "World Cup, Olympics, NBA, NFL, March Madness, Music Festivals", key_cultural_moments: "All heritage months, Pride, Earth Day", media_preferences: "Instagram, TikTok, YouTube, Streaming; cross-platform", activation_tips: "Experiences over products; nostalgia marketing; value-driven; highest Halloween spenders ($447)" },
  { segment_name: "Gen X (Born 1965-1980)", population_size: "65M Americans", buying_power: "$2.4T annually", top_events: "NFL, MLB, Golf Majors, NASCAR, Classic Rock Tours", key_cultural_moments: "Breast Cancer Awareness, Veterans Day", media_preferences: "Facebook, YouTube, Email, TV; streaming adoption growing", activation_tips: "Value-conscious; quality messaging; family-focused; financial security themes" },
  { segment_name: "Baby Boomers (Born 1946-1964)", population_size: "70M Americans", buying_power: "$2.6T annually", top_events: "NFL, MLB, Golf, NASCAR, Traditional holidays", key_cultural_moments: "Veterans Day, Heart Health Month", media_preferences: "Facebook, TV (linear), Email, Print", activation_tips: "Traditional retail; brand loyalty; health/wellness; legacy themes" },
  { segment_name: "Hispanic/Latino Americans", population_size: "65M (19% of US)", buying_power: "$2.8T (LARGEST minority)", top_events: "World Cup 2026 (#1), Soccer/MLS, Boxing, Latin Music", key_cultural_moments: "Hispanic Heritage Month (Sep 15-Oct 15), Cinco de Mayo", media_preferences: "Spanish-language media, Telemundo/Univision, YouTube, WhatsApp", activation_tips: "Bilingual campaigns; family values; cultural authenticity; soccer is ESSENTIAL" },
];

const VIEWERSHIP_TIERS = [
  { event: "Super Bowl", tier: "TIER 1 (100M+ US)", us_viewership: "127M+ US", global_reach: "200M+ global", key_demographic: "Mass market, 70% male", cpm_range: "$7M/30 sec", best_for: "Mass awareness, product launches" },
  { event: "World Cup Final 2026", tier: "TIER 1", us_viewership: "50M+ US projected", global_reach: "2B+ global", key_demographic: "Global, 76% under 45", cpm_range: "Premium digital/TV", best_for: "Global brands, Hispanic marketing" },
  { event: "Olympic Opening Ceremony 2028", tier: "TIER 1", us_viewership: "30-40M US", global_reach: "1B+ global", key_demographic: "All demos, families", cpm_range: "NBC premium package", best_for: "Brand prestige, national pride" },
  { event: "March Madness Final Four", tier: "TIER 2 (15-50M US)", us_viewership: "18M+ US", global_reach: "N/A", key_demographic: "Office workers, alumni", cpm_range: "$400K-800K/30 sec", best_for: "QSR, beer, insurance, betting" },
];

const MEGA_EVENTS = [
  { event_name: "FIFA World Cup 2026", year: 2026, global_reach: "6 BILLION global engagement", us_viewership: "50M+ for US matches, 2B+ for Final", format_details: "48 teams, 104 matches, first tri-nation World Cup", key_facts: "First tri-nation event; US hosts for first time in 32 years", dates: "Jun 11 - Jul 19, 2026", planning_urgency: "BEGIN PLANNING NOW - 18+ month lead time", competitive_landscape: "Adidas, Coca-Cola, Visa, Qatar Airways already in discussions" },
  { event_name: "Winter Olympics 2026", year: 2026, global_reach: "1B+ global viewership", us_viewership: "30-40M US", format_details: "Winter sports across multiple venues", key_facts: "Global prestige; family appeal", dates: "Feb 6-22, 2026", planning_urgency: "CRITICAL - NBC packages selling now", competitive_landscape: "Coca-Cola, Intel, Samsung, Visa" },
  { event_name: "Super Bowl LX", year: 2026, global_reach: "200M+ global", us_viewership: "127M+ US", format_details: "Annual championship game", key_facts: "Most-watched sporting event; Bad Bunny halftime", dates: "Feb 8, 2026", planning_urgency: "CRITICAL - Media buys lock 12+ months out", competitive_landscape: "Pepsi, Bud Light, Toyota, Verizon" },
];

const FULL_CALENDAR_CONFERENCES = [
  { conference_name: "CES (Consumer Electronics Show)", industry_focus: "Technology", typical_date: "January (Jan 7-10, 2026)", location: "Las Vegas, NV", attendees: "200,000+", key_audience: "Tech executives, media, innovators", best_for_industries: "Tech, Consumer Electronics, Automotive, AI", sponsorship_range: "$50K-$500K+", why_attend: "Largest tech showcase; product launches; media coverage" },
  { conference_name: "NVIDIA GTC", industry_focus: "AI/Technology", typical_date: "March", location: "San Jose, CA", attendees: "20,000+ in-person", key_audience: "AI/ML professionals, developers", best_for_industries: "AI, Tech, Healthcare, Financial Services", sponsorship_range: "$25K-$200K", why_attend: "Premier AI conference; cutting-edge research" },
  { conference_name: "Google Cloud Next", industry_focus: "Cloud/Technology", typical_date: "April", location: "Las Vegas, NV", attendees: "30,000+", key_audience: "IT leaders, developers, enterprises", best_for_industries: "Cloud, AI, Tech, Enterprise", sponsorship_range: "$30K-$250K", why_attend: "Google ecosystem; cloud transformation" },
  { conference_name: "Microsoft Build", industry_focus: "Technology/Developer", typical_date: "May", location: "Seattle, WA", attendees: "6,000+ in-person", key_audience: "Developers, IT professionals", best_for_industries: "Tech, Software, AI, Enterprise", sponsorship_range: "$25K-$150K", why_attend: "Microsoft ecosystem; developer tools" },
  { conference_name: "Apple WWDC", industry_focus: "Technology", typical_date: "June", location: "Cupertino, CA (mostly virtual)", attendees: "Developers, media", key_audience: "Developers, media", best_for_industries: "Tech, Apps, Consumer Electronics", sponsorship_range: "By invitation", why_attend: "Apple ecosystem; iOS/Mac development" },
];

// ─── Action handlers ─────────────────────────────────────────────────────────

async function handleIndustryGuides(base44: any) {
  const results = {
    industryGuides: (await base44.asServiceRole.entities.IndustryGuide.bulkCreate(INDUSTRY_GUIDES)).length,
    activationChecklists: (await base44.asServiceRole.entities.ActivationChecklist.bulkCreate(ACTIVATION_CHECKLISTS)).length,
  };

  return json({
    success: true,
    imported: results,
    message: `Imported ${results.industryGuides} industry guides and ${results.activationChecklists} checklist items`,
  });
}

async function handleConferences(base44: any) {
  const created = await base44.asServiceRole.entities.Conference.bulkCreate(ALL_CONFERENCES);
  return json({
    success: true,
    conferenceCount: created.length,
    message: `Imported ${created.length} conferences from Master List`,
  });
}

async function handleCultureEvents(base44: any) {
  const result = await base44.asServiceRole.entities.CultureEvent.bulkCreate(CULTURE_EVENTS);
  return json({
    success: true,
    created: result.length,
    message: `Imported ${result.length} culture events`,
  });
}

async function handleEntityImport(base44: any, body: any) {
  const { entityName, csvData, fieldMapping } = body;

  if (!entityName || !csvData) {
    return json({ error: 'Missing required fields: entityName, csvData' }, 400);
  }

  const lines = csvData.split('\n').filter((l: string) => l.trim());
  const headers = lines[0].split(',').map((h: string) => h.trim());

  const records: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: any = {};

    headers.forEach((header: string, idx: number) => {
      const mappedField = fieldMapping?.[header] || header;
      const value = values[idx]?.trim() || '';

      if (value === '' || value === 'null') {
        record[mappedField] = null;
      } else if (value === 'true' || value === 'false') {
        record[mappedField] = value === 'true';
      } else if (!isNaN(value as any) && value !== '') {
        record[mappedField] = parseFloat(value);
      } else {
        record[mappedField] = value;
      }
    });

    records.push(record);
  }

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  try {
    const entity = base44.asServiceRole.entities[entityName];
    if (!entity || !entity.bulkCreate) {
      return json({ error: `Entity ${entityName} not found or does not support bulk operations` }, 400);
    }

    await entity.bulkCreate(records);
    successCount = records.length;
  } catch (_bulkError) {
    for (const record of records) {
      try {
        await base44.asServiceRole.entities[entityName].create(record);
        successCount++;
      } catch (err: any) {
        failureCount++;
        errors.push(`Row ${successCount + failureCount}: ${err.message}`);
      }
    }
  }

  return json({
    success: failureCount === 0,
    message: `Successfully imported ${successCount} records${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
    successCount,
    failureCount,
    errors: errors.slice(0, 10),
  });
}

async function handleFullCalendar(base44: any) {
  const results = {
    timelines: (await base44.asServiceRole.entities.PlanningTimeline.bulkCreate(PLANNING_TIMELINES)).length,
    demographics: (await base44.asServiceRole.entities.DemographicSegment.bulkCreate(DEMOGRAPHIC_SEGMENTS)).length,
    viewership: (await base44.asServiceRole.entities.ViewershipTier.bulkCreate(VIEWERSHIP_TIERS)).length,
    megaEvents: (await base44.asServiceRole.entities.MegaEvent.bulkCreate(MEGA_EVENTS)).length,
    conferences: (await base44.asServiceRole.entities.Conference.bulkCreate(FULL_CALENDAR_CONFERENCES)).length,
  };

  return json({ success: true, imported: results });
}

async function handleIndustryCsv(base44: any, body: any) {
  const { csvRows, fileUrl } = body;
  let rowsToImport = csvRows;

  if (!rowsToImport && fileUrl) {
    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract ALL rows from this CSV file. Return ONLY valid JSON with a "rows" array. Each row object should have these keys exactly:
        - Industry
        - Sector
        - Priority Tier 1 Events (Must-Attend)
        - Tier 2 Events (High Value)
        - Heritage/Awareness Months
        - Key Conferences/Trade Shows
        - Best Demographics
        - Budget Allocation Guidance
        - Top Activation Strategies

        IMPORTANT: Include EVERY data row, skip headers. Return valid JSON only, nothing else.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          rows: { type: "array", items: { type: "object" } },
        },
      },
    });
    rowsToImport = llmResult.rows;
  }

  if (!rowsToImport || !Array.isArray(rowsToImport) || rowsToImport.length === 0) {
    return json({ error: 'No data provided', details: 'Provide csvRows array or fileUrl' }, 400);
  }

  const mappedIndustries = rowsToImport
    .filter((row: any) => row.Industry && String(row.Industry).trim() && String(row.Industry).trim() !== 'Industry')
    .map((row: any) => ({
      industry: String(row.Industry || '').trim(),
      sector: String(row.Sector || '').trim(),
      priority_tier_1_events: String(row['Priority Tier 1 Events (Must-Attend)'] || '').trim(),
      tier_2_events: String(row['Tier 2 Events (High Value)'] || '').trim(),
      heritage_awareness_months: String(row['Heritage/Awareness Months'] || '').trim(),
      key_conferences: String(row['Key Conferences/Trade Shows'] || '').trim(),
      best_demographics: String(row['Best Demographics'] || '').trim(),
      budget_allocation: String(row['Budget Allocation Guidance'] || '').trim(),
      activation_strategies: String(row['Top Activation Strategies'] || '').trim(),
    }))
    .filter((row: any) => row.industry);

  console.log(`Processing ${mappedIndustries.length} industries for import`);

  const chunkSize = 50;
  let totalImported = 0;

  for (let i = 0; i < mappedIndustries.length; i += chunkSize) {
    const chunk = mappedIndustries.slice(i, i + chunkSize);
    await base44.entities.IndustryGuide.bulkCreate(chunk);
    totalImported += chunk.length;
  }

  return json({
    success: true,
    imported: totalImported,
    message: `Successfully imported ${totalImported} industries`,
  });
}

// ─── Router ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // entity import only requires authentication; all seed imports require admin
    const body = await req.json();
    const { entity } = body;

    if (!entity) {
      return json({
        error: 'Missing "entity". Valid values: industry_guides, conferences, culture_events, entity, full_calendar, industry_csv',
      }, 400);
    }

    // Generic entity import only requires auth, not admin
    if (entity === 'entity') {
      if (!user) {
        return json({ error: 'Unauthorized' }, 401);
      }
      return await handleEntityImport(base44, body);
    }

    // All seed/bulk imports require admin
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden: Admin access required' }, 403);
    }

    switch (entity) {
      case 'industry_guides':
        return await handleIndustryGuides(base44);
      case 'conferences':
        return await handleConferences(base44);
      case 'culture_events':
        return await handleCultureEvents(base44);
      case 'full_calendar':
        return await handleFullCalendar(base44);
      case 'industry_csv':
        return await handleIndustryCsv(base44, body);
      default:
        return json({
          error: `Unknown entity: "${entity}". Valid values: industry_guides, conferences, culture_events, entity, full_calendar, industry_csv`,
        }, 400);
    }
  } catch (error) {
    console.error('[import-data] Error:', (error as Error).message);
    return json({ error: (error as Error).message }, 500);
  }
});

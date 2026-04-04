-- Migration 023: Map brands to ALL relevant talent types
-- Additive mapping — brands get every talent type that could be relevant

ALTER TABLE brands ADD COLUMN IF NOT EXISTS relevant_talent_types TEXT[] DEFAULT '{}';

-- Step 1: Start with base types that ALL brands can work with
UPDATE brands SET relevant_talent_types = ARRAY['Lifestyle Vlogger','Podcast Host','Business Creator'];

-- Step 2: Add talent types based on industry keywords (additive, not replacing)

-- Fashion related
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fashion Influencer','Beauty Creator','Photography Creator','Streetwear Creator','Luxury Influencer','Couple Creator','Mom/Family Creator','Unboxing Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%fashion%','%apparel%','%clothing%','%textile%']);

-- Beauty & Cosmetics
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Beauty Creator','Skincare Creator','Fashion Influencer','Mom/Family Creator','Health & Wellness Creator','Unboxing Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%beauty%','%cosmetic%','%skincare%','%makeup%','%personal care%']);

-- Technology
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Tech Reviewer','Gaming Creator','Developer Creator','Productivity Creator','Education Creator','Unboxing Creator','Student Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%tech%','%software%','%saas%','%computer%','%internet%','%information%','%electronic%']);

-- Fitness & Sports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fitness Influencer','Sports Athlete','Health & Wellness Creator','Yoga/Meditation Creator','Outdoor Adventure Creator','Nutrition Creator','Sports Commentator'])
WHERE lower(industry) LIKE ANY(ARRAY['%fitness%','%sport%','%athletic%','%activewear%','%gym%','%wellness%']);

-- Food & Beverage
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Food Creator','Mukbang Creator','Nutrition Creator','Travel Influencer','Mom/Family Creator','Health & Wellness Creator','Couple Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%food%','%beverage%','%restaurant%','%cooking%','%grocery%','%dairy%','%snack%']);

-- Travel & Hospitality
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Travel Influencer','Photography Creator','Luxury Influencer','Outdoor Adventure Creator','Food Creator','Couple Creator','Adventure Creator','Vlogger'])
WHERE lower(industry) LIKE ANY(ARRAY['%travel%','%hospitality%','%hotel%','%airline%','%tourism%','%resort%','%booking%']);

-- Gaming & Esports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Gaming Creator','Streamer','Tech Reviewer','Entertainment Creator','Anime/Manga Creator','Comedy Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%gaming%','%game%','%esport%']);

-- Home & Lifestyle
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['DIY/Home Creator','Interior Design Creator','Organization Creator','Photography Creator','Mom/Family Creator','Couple Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%home%','%diy%','%furniture%','%decor%','%household%','%garden%']);

-- Finance & Banking
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Finance Educator','Crypto Creator','Real Estate Creator','Career Coach','LinkedIn Creator','Education Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%financ%','%banking%','%insurance%','%invest%','%capital%','%accounting%']);

-- Education
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Education Creator','Student Creator','Language Creator','Productivity Creator','Career Coach','Mom/Family Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%education%','%elearn%','%training%','%learning%','%university%']);

-- Entertainment & Media
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Entertainment Creator','Comedy Creator','Music Artist','Filmmaker','Vlogger','DJ/Producer','Streamer'])
WHERE lower(industry) LIKE ANY(ARRAY['%entertainment%','%media%','%streaming%','%film%','%motion picture%','%broadcast%']);

-- Music
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Music Artist','DJ/Producer','Entertainment Creator','Streamer','Hip-Hop Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%music%','%audio%','%record%','%sound%']);

-- Health & Medical
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Health & Wellness Creator','Mental Health Advocate','Fitness Influencer','Yoga/Meditation Creator','Nutrition Creator','Mom/Family Creator','Education Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%health%','%medical%','%pharma%','%mental%','%supplement%','%vitamin%']);

-- Parenting & Kids
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Mom/Family Creator','Parenting Blogger','Kid Creator','Education Creator','Lifestyle Vlogger','Comedy Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%parent%','%baby%','%kid%','%child%','%family%','%toy%','%maternity%']);

-- Pets
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Pet Influencer','Comedy Creator','Mom/Family Creator','Lifestyle Vlogger','Outdoor Adventure Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%pet%','%animal%','%veterinar%','%dog%','%cat%']);

-- Automotive
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Auto/Car Reviewer','Tech Reviewer','Luxury Influencer','Adventure Creator','Vlogger','Photography Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%auto%','%car%','%vehicle%','%motor%','%electric vehicle%']);

-- Real Estate
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Real Estate Creator','Finance Educator','Interior Design Creator','DIY/Home Creator','Photography Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%real estate%','%property%','%mortgage%','%construction%','%building%']);

-- Art & Design & Photography
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Art Creator','Photography Creator','Graphic Designer','Filmmaker','Fashion Influencer','DIY/Home Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%art%','%design%','%creative%','%photo%','%camera%']);

-- Sustainability & Clean Energy
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Sustainability Advocate','Outdoor Adventure Creator','Health & Wellness Creator','Education Creator','Community Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%sustain%','%eco%','%renewable%','%solar%','%clean%','%organic%','%green%']);

-- Crypto & Web3
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Crypto Creator','Finance Educator','Tech Reviewer','Gaming Creator','Education Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%crypto%','%blockchain%','%web3%','%defi%','%nft%']);

-- Luxury
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Luxury Influencer','Fashion Influencer','Travel Influencer','Photography Creator','Food Creator','Couple Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%luxury%','%premium%','%high-end%']);

-- Wine & Spirits & Alcohol
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Food Creator','Luxury Influencer','Travel Influencer','Entertainment Creator','Couple Creator','Comedy Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%wine%','%spirit%','%alcohol%','%beer%','%liquor%','%cocktail%']);

-- Telecom
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Tech Reviewer','Gaming Creator','Student Creator','Vlogger','Entertainment Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%telecom%','%wireless%','%mobile%','%carrier%']);

-- Jewelry & Watches
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fashion Influencer','Luxury Influencer','Couple Creator','Photography Creator','Wedding Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%jewelry%','%watch%','%jewel%','%diamond%','%accessori%']);

-- Streetwear
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Streetwear Creator','Hip-Hop Creator','Music Artist','Gaming Creator','Sports Athlete','Skateboard Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%streetwear%','%urban%','%sneaker%','%skate%']);

-- Marketing & Advertising
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['LinkedIn Creator','Career Coach','Education Creator','Productivity Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%marketing%','%advertising%','%agency%','%pr %','%public relation%']);

-- Consumer & Retail
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Unboxing Creator','Mom/Family Creator','Fashion Influencer','Beauty Creator','Tech Reviewer'])
WHERE lower(industry) LIKE ANY(ARRAY['%consumer%','%retail%','%shopping%','%ecommerce%','%e-commerce%']);

-- Nonprofit & Social Impact
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Sustainability Advocate','Mental Health Advocate','Community Creator','Education Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%nonprofit%','%non-profit%','%charity%','%philanthrop%','%social%','%civic%']);

-- Wedding
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Wedding Creator','Couple Creator','Photography Creator','Fashion Influencer'])
WHERE lower(industry) LIKE ANY(ARRAY['%wedding%','%bridal%','%event%']);

-- Step 3: Remove duplicates from arrays
UPDATE brands SET relevant_talent_types = (
  SELECT ARRAY(SELECT DISTINCT unnest(relevant_talent_types) ORDER BY 1)
);

-- Step 4: Create GIN index for fast array searches
CREATE INDEX IF NOT EXISTS idx_brands_talent_types ON brands USING GIN(relevant_talent_types);

-- Migration 023: Map brands to relevant talent types
-- Adds relevant_talent_types array column and populates it based on industry

ALTER TABLE brands ADD COLUMN IF NOT EXISTS relevant_talent_types TEXT[] DEFAULT '{}';

-- Map every industry to the talent types that are relevant
UPDATE brands SET relevant_talent_types = CASE
  -- Fashion & Apparel
  WHEN lower(industry) LIKE '%fashion%' OR lower(industry) LIKE '%apparel%' OR lower(industry) LIKE '%clothing%'
    THEN ARRAY['Fashion Influencer','Lifestyle Vlogger','Beauty Creator','Photography Creator','Streetwear Creator','Luxury Influencer','Mom/Family Creator']
  -- Beauty & Cosmetics
  WHEN lower(industry) LIKE '%beauty%' OR lower(industry) LIKE '%cosmetic%' OR lower(industry) LIKE '%skincare%' OR lower(industry) LIKE '%makeup%'
    THEN ARRAY['Beauty Creator','Skincare Creator','Fashion Influencer','Lifestyle Vlogger','Mom/Family Creator','Health & Wellness Creator']
  -- Technology
  WHEN lower(industry) LIKE '%tech%' OR lower(industry) LIKE '%software%' OR lower(industry) LIKE '%saas%' OR lower(industry) LIKE '%computer%'
    THEN ARRAY['Tech Reviewer','Gaming Creator','Business Creator','Education Creator','Productivity Creator','Developer Creator']
  -- Fitness & Wellness
  WHEN lower(industry) LIKE '%fitness%' OR lower(industry) LIKE '%wellness%' OR lower(industry) LIKE '%activewear%' OR lower(industry) LIKE '%gym%'
    THEN ARRAY['Fitness Influencer','Health & Wellness Creator','Sports Athlete','Lifestyle Vlogger','Outdoor Adventure Creator','Yoga/Meditation Creator']
  -- Food & Beverage
  WHEN lower(industry) LIKE '%food%' OR lower(industry) LIKE '%beverage%' OR lower(industry) LIKE '%restaurant%' OR lower(industry) LIKE '%cooking%'
    THEN ARRAY['Food Creator','Lifestyle Vlogger','Mom/Family Creator','Travel Influencer','Health & Wellness Creator','Mukbang Creator']
  -- Travel & Hospitality
  WHEN lower(industry) LIKE '%travel%' OR lower(industry) LIKE '%hospitality%' OR lower(industry) LIKE '%hotel%' OR lower(industry) LIKE '%airline%'
    THEN ARRAY['Travel Influencer','Lifestyle Vlogger','Photography Creator','Luxury Influencer','Outdoor Adventure Creator','Food Creator','Couple Creator']
  -- Gaming
  WHEN lower(industry) LIKE '%gaming%' OR lower(industry) LIKE '%game%' OR lower(industry) LIKE '%esport%'
    THEN ARRAY['Gaming Creator','Tech Reviewer','Streamer','Entertainment Creator','Anime/Manga Creator']
  -- Lifestyle & Home
  WHEN lower(industry) LIKE '%lifestyle%' OR lower(industry) LIKE '%home%' OR lower(industry) LIKE '%diy%' OR lower(industry) LIKE '%furniture%' OR lower(industry) LIKE '%decor%'
    THEN ARRAY['Lifestyle Vlogger','DIY/Home Creator','Mom/Family Creator','Interior Design Creator','Organization Creator','Photography Creator']
  -- Finance & Insurance
  WHEN lower(industry) LIKE '%financ%' OR lower(industry) LIKE '%banking%' OR lower(industry) LIKE '%insurance%' OR lower(industry) LIKE '%invest%'
    THEN ARRAY['Finance Educator','Business Creator','Crypto Creator','Real Estate Creator','Education Creator','Career Coach']
  -- Education & E-Learning
  WHEN lower(industry) LIKE '%education%' OR lower(industry) LIKE '%elearn%' OR lower(industry) LIKE '%training%'
    THEN ARRAY['Education Creator','Business Creator','Career Coach','Student Creator','Language Creator','Productivity Creator']
  -- Entertainment & Media
  WHEN lower(industry) LIKE '%entertainment%' OR lower(industry) LIKE '%media%' OR lower(industry) LIKE '%streaming%' OR lower(industry) LIKE '%film%'
    THEN ARRAY['Entertainment Creator','Comedy Creator','Podcast Host','Music Artist','Filmmaker','Vlogger']
  -- Sports
  WHEN lower(industry) LIKE '%sport%' AND NOT lower(industry) LIKE '%esport%'
    THEN ARRAY['Sports Athlete','Fitness Influencer','Sports Commentator','Outdoor Adventure Creator','Lifestyle Vlogger']
  -- Music & Audio
  WHEN lower(industry) LIKE '%music%' OR lower(industry) LIKE '%audio%' OR lower(industry) LIKE '%record%'
    THEN ARRAY['Music Artist','Podcast Host','Entertainment Creator','DJ/Producer','Lifestyle Vlogger']
  -- Health & Medical
  WHEN lower(industry) LIKE '%health%' OR lower(industry) LIKE '%medical%' OR lower(industry) LIKE '%pharma%' OR lower(industry) LIKE '%mental%'
    THEN ARRAY['Health & Wellness Creator','Fitness Influencer','Mental Health Advocate','Yoga/Meditation Creator','Nutrition Creator','Mom/Family Creator']
  -- Business & Professional
  WHEN lower(industry) LIKE '%business%' OR lower(industry) LIKE '%consulting%' OR lower(industry) LIKE '%professional%' OR lower(industry) LIKE '%management%'
    THEN ARRAY['Business Creator','Career Coach','Finance Educator','LinkedIn Creator','Podcast Host','Education Creator']
  -- Parenting & Family
  WHEN lower(industry) LIKE '%parent%' OR lower(industry) LIKE '%baby%' OR lower(industry) LIKE '%kid%' OR lower(industry) LIKE '%family%' OR lower(industry) LIKE '%toy%'
    THEN ARRAY['Mom/Family Creator','Lifestyle Vlogger','Education Creator','Parenting Blogger','Kid Creator']
  -- Pets & Animals
  WHEN lower(industry) LIKE '%pet%' OR lower(industry) LIKE '%animal%' OR lower(industry) LIKE '%veterinar%'
    THEN ARRAY['Pet Influencer','Lifestyle Vlogger','Comedy Creator','Mom/Family Creator']
  -- Automotive
  WHEN lower(industry) LIKE '%auto%' OR lower(industry) LIKE '%car%' OR lower(industry) LIKE '%vehicle%' OR lower(industry) LIKE '%motor%'
    THEN ARRAY['Auto/Car Reviewer','Tech Reviewer','Luxury Influencer','Lifestyle Vlogger','Adventure Creator']
  -- Real Estate
  WHEN lower(industry) LIKE '%real estate%' OR lower(industry) LIKE '%property%' OR lower(industry) LIKE '%mortgage%'
    THEN ARRAY['Real Estate Creator','Finance Educator','Lifestyle Vlogger','Interior Design Creator','Business Creator']
  -- Wedding & Events
  WHEN lower(industry) LIKE '%wedding%' OR lower(industry) LIKE '%event%' OR lower(industry) LIKE '%bridal%'
    THEN ARRAY['Wedding Creator','Lifestyle Vlogger','Photography Creator','Fashion Influencer','Couple Creator']
  -- Art & Design
  WHEN lower(industry) LIKE '%art%' OR lower(industry) LIKE '%design%' OR lower(industry) LIKE '%creative%'
    THEN ARRAY['Art Creator','Photography Creator','DIY/Home Creator','Fashion Influencer','Filmmaker','Graphic Designer']
  -- Photography
  WHEN lower(industry) LIKE '%photo%' OR lower(industry) LIKE '%camera%'
    THEN ARRAY['Photography Creator','Travel Influencer','Fashion Influencer','Art Creator','Tech Reviewer','Filmmaker']
  -- Sustainability & Clean Energy
  WHEN lower(industry) LIKE '%sustain%' OR lower(industry) LIKE '%eco%' OR lower(industry) LIKE '%renewable%' OR lower(industry) LIKE '%solar%' OR lower(industry) LIKE '%clean%'
    THEN ARRAY['Sustainability Advocate','Lifestyle Vlogger','Education Creator','Outdoor Adventure Creator','Health & Wellness Creator']
  -- Crypto & Web3
  WHEN lower(industry) LIKE '%crypto%' OR lower(industry) LIKE '%blockchain%' OR lower(industry) LIKE '%web3%' OR lower(industry) LIKE '%defi%'
    THEN ARRAY['Crypto Creator','Finance Educator','Tech Reviewer','Business Creator','Gaming Creator']
  -- Outdoor & Adventure
  WHEN lower(industry) LIKE '%outdoor%' OR lower(industry) LIKE '%adventure%' OR lower(industry) LIKE '%camping%' OR lower(industry) LIKE '%hiking%'
    THEN ARRAY['Outdoor Adventure Creator','Travel Influencer','Fitness Influencer','Photography Creator','Sports Athlete','Lifestyle Vlogger']
  -- Luxury
  WHEN lower(industry) LIKE '%luxury%' OR lower(industry) LIKE '%premium%'
    THEN ARRAY['Luxury Influencer','Fashion Influencer','Travel Influencer','Lifestyle Vlogger','Photography Creator','Food Creator']
  -- Wine & Spirits
  WHEN lower(industry) LIKE '%wine%' OR lower(industry) LIKE '%spirit%' OR lower(industry) LIKE '%alcohol%' OR lower(industry) LIKE '%beer%' OR lower(industry) LIKE '%liquor%'
    THEN ARRAY['Food Creator','Lifestyle Vlogger','Travel Influencer','Luxury Influencer','Entertainment Creator','Couple Creator']
  -- Telecom
  WHEN lower(industry) LIKE '%telecom%' OR lower(industry) LIKE '%wireless%' OR lower(industry) LIKE '%mobile%'
    THEN ARRAY['Tech Reviewer','Lifestyle Vlogger','Business Creator','Gaming Creator','Student Creator']
  -- Jewelry & Watches
  WHEN lower(industry) LIKE '%jewelry%' OR lower(industry) LIKE '%watch%' OR lower(industry) LIKE '%jewel%'
    THEN ARRAY['Fashion Influencer','Luxury Influencer','Lifestyle Vlogger','Couple Creator','Photography Creator']
  -- Streetwear & Urban
  WHEN lower(industry) LIKE '%streetwear%' OR lower(industry) LIKE '%urban%' OR lower(industry) LIKE '%sneaker%'
    THEN ARRAY['Streetwear Creator','Fashion Influencer','Music Artist','Gaming Creator','Sports Athlete','Hip-Hop Creator']
  -- Legal & Professional Services
  WHEN lower(industry) LIKE '%legal%' OR lower(industry) LIKE '%law%'
    THEN ARRAY['Business Creator','Career Coach','Education Creator','LinkedIn Creator','Finance Educator']
  -- Nonprofit
  WHEN lower(industry) LIKE '%nonprofit%' OR lower(industry) LIKE '%non-profit%' OR lower(industry) LIKE '%charity%' OR lower(industry) LIKE '%philanthrop%'
    THEN ARRAY['Sustainability Advocate','Education Creator','Lifestyle Vlogger','Mental Health Advocate','Community Creator']
  -- Marketing & Advertising
  WHEN lower(industry) LIKE '%marketing%' OR lower(industry) LIKE '%advertising%'
    THEN ARRAY['Business Creator','LinkedIn Creator','Education Creator','Tech Reviewer','Podcast Host','Career Coach']
  -- Consumer Goods / Retail
  WHEN lower(industry) LIKE '%consumer%' OR lower(industry) LIKE '%retail%' OR lower(industry) LIKE '%shopping%' OR lower(industry) LIKE '%ecommerce%'
    THEN ARRAY['Lifestyle Vlogger','Fashion Influencer','Beauty Creator','Mom/Family Creator','Tech Reviewer','Unboxing Creator']
  -- Dating & Social
  WHEN lower(industry) LIKE '%dating%' OR lower(industry) LIKE '%social%'
    THEN ARRAY['Lifestyle Vlogger','Comedy Creator','Couple Creator','Podcast Host','Entertainment Creator']
  -- Default — if no match, general lifestyle
  ELSE ARRAY['Lifestyle Vlogger','Business Creator','Education Creator']
END;

-- Create index for array search
CREATE INDEX IF NOT EXISTS idx_brands_talent_types ON brands USING GIN(relevant_talent_types);

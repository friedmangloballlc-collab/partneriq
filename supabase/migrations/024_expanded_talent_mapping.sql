-- Migration 024: Expanded talent type mapping with all platform talent categories
-- Adds actors, dancers, models, athletes, motorsports, variety performers

-- Reset to base types
UPDATE brands SET relevant_talent_types = ARRAY['Instagram Influencers','TikTok Creators','YouTube Creators','Podcast Creators'];

-- Fashion / Apparel / Clothing
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fashion Influencer','Beauty Creator','High Fashion Runway Models','Designer Campaign Models','Editorial Print Models','Swimwear/Lingerie Models','Bridal Models','Catalog Models','E-commerce Models','Plus-size/Curve Models','Photography Creator','Lifestyle Vlogger','Streetwear Creator','Luxury Influencer','TV Actors','Film Actors','Music Artists','Commercial Actors','Hip-Hop Dancers'])
WHERE lower(industry) LIKE ANY(ARRAY['%fashion%','%apparel%','%clothing%','%textile%']);

-- Beauty / Cosmetics
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Beauty Creator','Skincare Creator','Fashion Influencer','Hair Models','Parts Models','Advertising Print Models','Lifestyle Vlogger','Mom/Family Creator','Commercial Actors','Music Artists'])
WHERE lower(industry) LIKE ANY(ARRAY['%beauty%','%cosmetic%','%skincare%','%makeup%','%personal care%']);

-- Technology / Software
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Tech Reviewer','Gaming Creator','Twitch Streamers','Esports Athletes','Education Creator','Stand-up Comedians','Commercial Actors','Music Artists','Sports Broadcasters'])
WHERE lower(industry) LIKE ANY(ARRAY['%tech%','%software%','%saas%','%computer%','%internet%','%information%','%electronic%']);

-- Sports / Fitness / Sporting Goods
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fitness Influencer','Fitness Models','Basketball Players','Football Players','Baseball Players','Hockey Players','Soccer Players','Golf Athletes','Tennis Athletes','Boxing/MMA Athletes','Track & Field Athletes','Swimmers/Divers','Gymnasts','Olympic Athletes','Paralympic Athletes','F1/IndyCar/NASCAR Drivers','Skateboarders','Surfers','BMX Athletes','Esports Athletes','Sports Broadcasters','Sports Analysts','Coaches','Backup Dancers','Hip-Hop Dancers','Choreographers','Health & Wellness Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%sport%','%fitness%','%athletic%','%activewear%','%gym%','%wellness%']);

-- Food / Beverage / Restaurant
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Food Creator','Lifestyle Vlogger','Mom/Family Creator','Travel Influencer','Commercial Actors','Stand-up Comedians','Music Artists','Health & Wellness Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%food%','%beverage%','%restaurant%','%cooking%','%grocery%','%dairy%','%snack%']);

-- Travel / Hospitality / Airlines
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Travel Influencer','Photography Creator','Luxury Influencer','Food Creator','Lifestyle Vlogger','Film Actors','Music Artists','Stand-up Comedians','Contemporary Dancers','Magicians/Illusionists'])
WHERE lower(industry) LIKE ANY(ARRAY['%travel%','%hospitality%','%hotel%','%airline%','%tourism%','%resort%']);

-- Gaming / Esports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Gaming Creator','Twitch Streamers','Esports Athletes','Tech Reviewer','Stand-up Comedians','Music Artists','Hip-Hop Dancers'])
WHERE lower(industry) LIKE ANY(ARRAY['%gaming%','%game%','%esport%']);

-- Entertainment / Media / Film / TV
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['TV Actors','Film Actors','Commercial Actors','Child/Youth Actors','Stunt Performers','Stand-up Comedians','Music Artists','Choreographers','Ballet Dancers','Contemporary Dancers','Broadway/Musical Theater Dancers','Hip-Hop Dancers','Magicians/Illusionists','Circus Performers','Mentalists','Puppeteers','Photography Creator','Sports Broadcasters','Sports Analysts'])
WHERE lower(industry) LIKE ANY(ARRAY['%entertainment%','%media%','%streaming%','%film%','%motion picture%','%broadcast%','%television%']);

-- Music / Audio / Recording
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Music Artists','Backup Dancers','Hip-Hop Dancers','Choreographers','Stand-up Comedians','Twitch Streamers','Film Actors'])
WHERE lower(industry) LIKE ANY(ARRAY['%music%','%audio%','%record%','%sound%']);

-- Health / Medical / Pharma
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Health & Wellness Creator','Mental Health Advocate','Fitness Influencer','Fitness Models','Yoga/Meditation Creator','Commercial Actors','Olympic Athletes','Mom/Family Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%health%','%medical%','%pharma%','%mental%','%supplement%','%vitamin%']);

-- Automotive / Motor
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Auto/Car Reviewer','F1/IndyCar/NASCAR Drivers','Tech Reviewer','Luxury Influencer','Music Artists','Film Actors','Sports Broadcasters','Photography Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%auto%','%car%','%vehicle%','%motor%']);

-- Luxury / Premium
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Luxury Influencer','High Fashion Runway Models','Designer Campaign Models','Film Actors','TV Actors','Music Artists','Golf Athletes','Tennis Athletes','F1/IndyCar/NASCAR Drivers','Photography Creator','Travel Influencer','Food Creator','Ballet Dancers'])
WHERE lower(industry) LIKE ANY(ARRAY['%luxury%','%premium%','%high-end%']);

-- Finance / Banking / Insurance
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Finance Educator','Crypto Creator','Real Estate Creator','Commercial Actors','Sports Broadcasters','Sports Analysts','Golf Athletes'])
WHERE lower(industry) LIKE ANY(ARRAY['%financ%','%banking%','%insurance%','%invest%','%capital%']);

-- Wine / Spirits / Alcohol
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Food Creator','Luxury Influencer','Film Actors','TV Actors','Music Artists','Stand-up Comedians','Golf Athletes','Photography Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%wine%','%spirit%','%alcohol%','%beer%','%liquor%']);

-- Jewelry / Watches
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Fashion Influencer','Luxury Influencer','High Fashion Runway Models','Film Actors','TV Actors','Music Artists','Wedding Creator','Photography Creator','Parts Models'])
WHERE lower(industry) LIKE ANY(ARRAY['%jewelry%','%watch%','%jewel%','%diamond%']);

-- Consumer / Retail / E-commerce
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Lifestyle Vlogger','Mom/Family Creator','Fashion Influencer','Beauty Creator','Tech Reviewer','E-commerce Models','Catalog Models','Advertising Print Models','Commercial Actors','Stand-up Comedians'])
WHERE lower(industry) LIKE ANY(ARRAY['%consumer%','%retail%','%shopping%','%ecommerce%']);

-- Marketing / Advertising
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Commercial Actors','Advertising Print Models','E-commerce Models','Education Creator','Stand-up Comedians'])
WHERE lower(industry) LIKE ANY(ARRAY['%marketing%','%advertising%','%agency%']);

-- Telecom / Mobile
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Tech Reviewer','Gaming Creator','Music Artists','Stand-up Comedians','Commercial Actors','Sports Broadcasters','Film Actors'])
WHERE lower(industry) LIKE ANY(ARRAY['%telecom%','%wireless%','%mobile%']);

-- Parenting / Kids / Family
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Mom/Family Creator','Child/Youth Actors','Education Creator','Puppeteers','Stand-up Comedians','Gymnasts'])
WHERE lower(industry) LIKE ANY(ARRAY['%parent%','%baby%','%kid%','%child%','%family%','%toy%']);

-- Pets
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Pet Influencer','Lifestyle Vlogger','Stand-up Comedians','Commercial Actors'])
WHERE lower(industry) LIKE ANY(ARRAY['%pet%','%animal%','%veterinar%']);

-- Real Estate / Construction
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Real Estate Creator','Finance Educator','DIY/Home Creator','Photography Creator','Commercial Actors'])
WHERE lower(industry) LIKE ANY(ARRAY['%real estate%','%property%','%mortgage%','%construction%']);

-- Home / DIY / Furniture
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['DIY/Home Creator','Lifestyle Vlogger','Mom/Family Creator','Photography Creator','Commercial Actors','E-commerce Models'])
WHERE lower(industry) LIKE ANY(ARRAY['%home%','%diy%','%furniture%','%decor%','%garden%']);

-- Art / Design / Creative
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Art Creator','Photography Creator','Film Actors','Contemporary Dancers','Ballet Dancers','Music Artists'])
WHERE lower(industry) LIKE ANY(ARRAY['%art%','%design%','%creative%','%photo%','%camera%']);

-- Sustainability / Clean Energy
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Sustainability Advocate','Education Creator','Olympic Athletes','Surfers','Health & Wellness Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%sustain%','%eco%','%renewable%','%solar%','%clean%','%organic%']);

-- Crypto / Web3
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Crypto Creator','Finance Educator','Tech Reviewer','Esports Athletes','Gaming Creator'])
WHERE lower(industry) LIKE ANY(ARRAY['%crypto%','%blockchain%','%web3%','%defi%']);

-- Streetwear / Urban
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Streetwear Creator','Hip-Hop Dancers','Music Artists','Skateboarders','BMX Athletes','Basketball Players','Esports Athletes'])
WHERE lower(industry) LIKE ANY(ARRAY['%streetwear%','%urban%','%sneaker%','%skate%']);

-- Nonprofit / Social
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Sustainability Advocate','Mental Health Advocate','Education Creator','Olympic Athletes','Paralympic Athletes'])
WHERE lower(industry) LIKE ANY(ARRAY['%nonprofit%','%non-profit%','%charity%','%philanthrop%']);

-- Education
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Education Creator','Stand-up Comedians','Music Artists','Puppeteers','Child/Youth Actors'])
WHERE lower(industry) LIKE ANY(ARRAY['%education%','%elearn%','%training%','%learning%']);

-- Wedding / Events
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Wedding Creator','Photography Creator','Ballroom/Latin Dancers','Music Artists','Magicians/Illusionists','Fashion Influencer','Bridal Models'])
WHERE lower(industry) LIKE ANY(ARRAY['%wedding%','%bridal%','%event%']);

-- Remove duplicates
UPDATE brands SET relevant_talent_types = (
  SELECT ARRAY(SELECT DISTINCT unnest(relevant_talent_types) ORDER BY 1)
);

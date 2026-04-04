-- Migration 025: Add exact talent type names from platform matrix
-- Adds specific sub-types (NBA, WNBA, NFL, etc.) alongside general categories

-- Sports brands get ALL specific sport types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Basketball (NBA)','Basketball (WNBA)','Basketball (International)',
  'Football (NFL)','Football (CFL)','Football (European Leagues)',
  'Baseball (MLB)','Baseball (Minor Leagues)','Hockey (NHL)',
  'Soccer (MLS)','Soccer (International)',
  'Golf (PGA, LPGA)','Tennis (ATP, WTA)','Boxing','MMA',
  'Track and Field','Swimming and Diving','Gymnastics',
  'Summer Olympic Athletes','Winter Olympic Athletes','Paralympic Athletes',
  'F1 Drivers','IndyCar Drivers','NASCAR Drivers',
  'Skateboarding','Surfing','BMX','Esports Athletes',
  'Sports Broadcasters','Sports Analysts','Team Executives','Coaches'
])
WHERE lower(industry) LIKE ANY(ARRAY['%sport%','%fitness%','%athletic%','%activewear%']);

-- Entertainment/Media brands get ALL actor and performer types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'TV Actors (Series Regulars)','TV Actors (Recurring)','TV Actors (Guest Stars)',
  'Film Actors (Lead)','Film Actors (Supporting)','Film Actors (Character)',
  'Commercial Actors','Child/Youth Actors','Background/Extras',
  'Stunt Performers and Doubles','Stand-ins and Body Doubles',
  'Ballet Dancers','Contemporary/Modern Dancers','Ballroom and Latin Dancers',
  'Broadway/Musical Theater Dancers','Backup Dancers for Tours',
  'Hip-Hop and Urban Dancers','Choreographers','Dance Company Directors',
  'Magicians and Illusionists','Circus Performers','Jugglers',
  'Mentalists and Hypnotists','Variety Show Acts','Puppeteers',
  'Ventriloquists','Buskers and Street Performers'
])
WHERE lower(industry) LIKE ANY(ARRAY['%entertainment%','%media%','%film%','%television%','%broadcast%','%streaming%']);

-- Fashion brands get ALL model types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'High Fashion Runway Models','Designer Campaign Models','Editorial Print Models',
  'Fashion Week Participants','Haute Couture Models','Ready-to-Wear Models',
  'Swimwear/Lingerie Models','Bridal Models',
  'Advertising Print Models','Catalog Models','E-commerce Models',
  'Stock Photography Models','Plus-size/Curve Models','Fitness Models',
  'Petite Models','Mature/Classic Models','Parts Models (Hands, Feet, Legs, Eyes)','Hair Models'
])
WHERE lower(industry) LIKE ANY(ARRAY['%fashion%','%apparel%','%clothing%','%beauty%','%cosmetic%','%luxury%']);

-- Beauty/cosmetics get model types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Advertising Print Models','E-commerce Models','Hair Models',
  'Parts Models (Hands, Feet, Legs, Eyes)','Plus-size/Curve Models'
])
WHERE lower(industry) LIKE ANY(ARRAY['%beauty%','%cosmetic%','%skincare%','%personal care%']);

-- Automotive get motorsport types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'F1 Drivers','IndyCar Drivers','NASCAR Drivers'
])
WHERE lower(industry) LIKE ANY(ARRAY['%auto%','%car%','%vehicle%','%motor%']);

-- Consumer/retail get commercial actor and model types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Commercial Actors','Advertising Print Models','E-commerce Models','Catalog Models',
  'Stock Photography Models','Mature/Classic Models','Plus-size/Curve Models'
])
WHERE lower(industry) LIKE ANY(ARRAY['%consumer%','%retail%','%shopping%','%ecommerce%']);

-- Gaming/tech get esports and streaming types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Esports Athletes','Twitch Streamers'
])
WHERE lower(industry) LIKE ANY(ARRAY['%gaming%','%game%','%tech%','%software%','%electronic%']);

-- All brands get digital creator base
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Stand-up Comedians','Commercial Actors','Buskers and Street Performers'
])
WHERE relevant_talent_types IS NOT NULL;

-- Remove duplicates
UPDATE brands SET relevant_talent_types = (
  SELECT ARRAY(SELECT DISTINCT unnest(relevant_talent_types) ORDER BY 1)
);

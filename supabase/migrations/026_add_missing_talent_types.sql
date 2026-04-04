-- Migration 026: Add missing talent types to brand mappings

-- New actor types for entertainment brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Voice Actors (Animation, Video Games, Audiobooks)','Theater/Stage Actors (Non-Musical)',
  'Opera Singers','TV Hosts/Presenters','Reality TV Personalities','Radio Hosts/DJs',
  'Comedians (Live/Touring)','Drag Performers','Burlesque Performers','Aerialists/Acrobats'
])
WHERE lower(industry) LIKE ANY(ARRAY['%entertainment%','%media%','%film%','%television%','%broadcast%','%streaming%']);

-- New dancer type
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Ice Show Skaters'])
WHERE lower(industry) LIKE ANY(ARRAY['%entertainment%','%sport%','%event%']);

-- Variety performers for event/hospitality brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Drag Performers','Burlesque Performers','Aerialists/Acrobats','Rodeo Performers','Comedians (Live/Touring)'
])
WHERE lower(industry) LIKE ANY(ARRAY['%event%','%hospitality%','%hotel%','%resort%','%casino%','%entertainment%']);

-- New model types for fashion/beauty/retail
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Child Models','Promotional/Brand Ambassador Models','Tattoo/Alternative Models'
])
WHERE lower(industry) LIKE ANY(ARRAY['%fashion%','%beauty%','%retail%','%consumer%','%apparel%']);

-- New music types
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'Music Artists (All Genres)','Session Musicians','Orchestra/Classical Musicians',
  'Conductors','DJs/Electronic Music Performers','Songwriters/Composers','Music Producers'
])
WHERE lower(industry) LIKE ANY(ARRAY['%music%','%audio%','%entertainment%','%media%','%streaming%']);

-- New team sports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Rugby','Cricket','Volleyball'])
WHERE lower(industry) LIKE ANY(ARRAY['%sport%','%fitness%','%athletic%']);

-- New individual sports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY[
  'MMA (UFC)','MMA (Bellator, ONE, PFL)','Wrestling/WWE (Pro Wrestling)',
  'Cycling (Pro Road/Track)','Triathlon/Marathon','Weightlifting/Powerlifting',
  'Fencing/Archery/Shooting','Jockeys (Horse Racing)','Professional Poker Players'
])
WHERE lower(industry) LIKE ANY(ARRAY['%sport%','%fitness%','%athletic%','%entertainment%']);

-- New extreme sports
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Skiing/Snowboarding','Rock Climbing'])
WHERE lower(industry) LIKE ANY(ARRAY['%sport%','%outdoor%','%adventure%','%fitness%']);

-- Writers & Speakers for education/business brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Authors/Writers','Motivational/Public Speakers'])
WHERE lower(industry) LIKE ANY(ARRAY['%education%','%business%','%consulting%','%media%','%publishing%','%professional%']);

-- Voice actors for tech/gaming brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Voice Actors (Animation, Video Games, Audiobooks)'])
WHERE lower(industry) LIKE ANY(ARRAY['%gaming%','%game%','%tech%','%software%','%animation%']);

-- TV/Radio hosts for consumer brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['TV Hosts/Presenters','Reality TV Personalities','Radio Hosts/DJs'])
WHERE lower(industry) LIKE ANY(ARRAY['%consumer%','%retail%','%food%','%beverage%','%beauty%','%fashion%']);

-- DJs for nightlife/alcohol/event brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['DJs/Electronic Music Performers','Drag Performers'])
WHERE lower(industry) LIKE ANY(ARRAY['%wine%','%spirit%','%alcohol%','%beer%','%nightlife%','%event%']);

-- Poker players for gambling/finance
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Professional Poker Players'])
WHERE lower(industry) LIKE ANY(ARRAY['%gambling%','%casino%','%financ%','%crypto%']);

-- Rodeo for outdoor/western brands
UPDATE brands SET relevant_talent_types = array_cat(relevant_talent_types, ARRAY['Rodeo Performers'])
WHERE lower(industry) LIKE ANY(ARRAY['%outdoor%','%ranch%','%western%','%country%']);

-- Remove duplicates
UPDATE brands SET relevant_talent_types = (
  SELECT ARRAY(SELECT DISTINCT unnest(relevant_talent_types) ORDER BY 1)
);

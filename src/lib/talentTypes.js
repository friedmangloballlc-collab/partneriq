// Single source of truth for all talent types on the platform
// Import this in any page that needs talent categories

export const TALENT_CATEGORIES = [
  {
    category: "Digital Creators & Influencers",
    types: [
      "Stand-up Comedians", "Podcast Creators", "Twitch Streamers",
      "Instagram Influencers", "TikTok Creators", "YouTube Creators",
    ],
  },
  {
    category: "Actors & Screen Talent",
    types: [
      "TV Actors (Series Regulars)", "TV Actors (Recurring)", "TV Actors (Guest Stars)",
      "Film Actors (Lead)", "Film Actors (Supporting)", "Film Actors (Character)",
      "Commercial Actors", "Child/Youth Actors", "Background/Extras",
      "Stunt Performers and Doubles", "Stand-ins and Body Doubles",
      "Voice Actors (Animation, Video Games, Audiobooks)", "Theater/Stage Actors (Non-Musical)",
      "Opera Singers", "TV Hosts/Presenters", "Reality TV Personalities", "Radio Hosts/DJs",
    ],
  },
  {
    category: "Dancers & Choreographers",
    types: [
      "Ballet Dancers", "Contemporary/Modern Dancers", "Ballroom and Latin Dancers",
      "Broadway/Musical Theater Dancers", "Backup Dancers for Tours",
      "Hip-Hop and Urban Dancers", "Choreographers", "Dance Company Directors",
      "Ice Show Skaters",
    ],
  },
  {
    category: "Variety & Live Performance",
    types: [
      "Magicians and Illusionists", "Circus Performers", "Jugglers",
      "Mentalists and Hypnotists", "Variety Show Acts", "Puppeteers",
      "Ventriloquists", "Buskers and Street Performers", "Drag Performers",
      "Burlesque Performers", "Aerialists/Acrobats", "Rodeo Performers",
      "Comedians (Live/Touring)",
    ],
  },
  {
    category: "Models — Fashion & Editorial",
    types: [
      "High Fashion Runway Models", "Designer Campaign Models", "Editorial Print Models",
      "Fashion Week Participants", "Haute Couture Models", "Ready-to-Wear Models",
      "Swimwear/Lingerie Models", "Bridal Models",
    ],
  },
  {
    category: "Models — Commercial & Specialty",
    types: [
      "Advertising Print Models", "Catalog Models", "E-commerce Models",
      "Stock Photography Models", "Plus-size/Curve Models", "Fitness Models",
      "Petite Models", "Mature/Classic Models", "Parts Models (Hands, Feet, Legs, Eyes)",
      "Hair Models", "Child Models", "Promotional/Brand Ambassador Models",
      "Tattoo/Alternative Models",
    ],
  },
  {
    category: "Music Artists",
    types: [
      "Music Artists (All Genres)", "Session Musicians", "Orchestra/Classical Musicians",
      "Conductors", "DJs/Electronic Music Performers", "Songwriters/Composers", "Music Producers",
    ],
  },
  {
    category: "Team Sports Athletes",
    types: [
      "Basketball (NBA)", "Basketball (WNBA)", "Basketball (International)",
      "Football (NFL)", "Football (CFL)", "Football (European Leagues)",
      "Baseball (MLB)", "Baseball (Minor Leagues)", "Hockey (NHL)",
      "Soccer (MLS)", "Soccer (International)", "Rugby", "Cricket", "Volleyball",
    ],
  },
  {
    category: "Individual Sports Athletes",
    types: [
      "Golf (PGA, LPGA)", "Tennis (ATP, WTA)", "Boxing",
      "MMA (UFC)", "MMA (Bellator, ONE, PFL)",
      "Track and Field", "Swimming and Diving", "Gymnastics",
      "Summer Olympic Athletes", "Winter Olympic Athletes", "Paralympic Athletes",
      "Wrestling/WWE (Pro Wrestling)", "Cycling (Pro Road/Track)",
      "Triathlon/Marathon", "Weightlifting/Powerlifting",
      "Fencing/Archery/Shooting", "Jockeys (Horse Racing)", "Professional Poker Players",
    ],
  },
  {
    category: "Motorsports & Extreme Sports",
    types: [
      "F1 Drivers", "IndyCar Drivers", "NASCAR Drivers",
      "Skateboarding", "Surfing", "BMX", "Esports Athletes",
      "Skiing/Snowboarding", "Rock Climbing",
    ],
  },
  {
    category: "Sports Industry Professionals",
    types: [
      "Sports Broadcasters", "Sports Analysts", "Team Executives", "Coaches",
    ],
  },
  {
    category: "Writers & Speakers",
    types: [
      "Authors/Writers", "Motivational/Public Speakers",
    ],
  },
];

// Flat list of all talent types (for dropdowns, filters)
export const ALL_TALENT_TYPES = TALENT_CATEGORIES.flatMap(c => c.types);

// Flat list with "All" option
export const ALL_TALENT_TYPES_WITH_ALL = ["All Talents", ...ALL_TALENT_TYPES];

// Get category for a talent type
export function getTalentCategory(type) {
  const cat = TALENT_CATEGORIES.find(c => c.types.includes(type));
  return cat?.category || "Other";
}

// Get all types in a category
export function getTypesByCategory(category) {
  const cat = TALENT_CATEGORIES.find(c => c.category === category);
  return cat?.types || [];
}

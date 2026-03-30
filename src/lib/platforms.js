// 92 platforms, 12 categories — single source of truth for creator platform support

export const CATEGORY_LABELS = {
  social: "Social Media", video: "Video", audio: "Music & Audio", gaming: "Gaming",
  creative: "Art & Design", shopping: "Shopping & E-commerce", writing: "Writing & Newsletters",
  podcast: "Podcasts", fitness: "Fitness & Sports", professional: "Professional",
  crm: "CRM & Marketing", tools: "Tools & Productivity",
};

export const CATEGORY_ORDER = ["social","video","audio","podcast","gaming","creative","shopping","writing","fitness","professional","crm","tools"];

function p(id, name, cat, icon, urlPattern, urlPlaceholder, verification, dataPoints, priority, oauthProvider, crawlable = true) {
  return { id, name, category: cat, icon, urlPattern, urlPlaceholder, verification, oauthProvider, crawlable, dataPoints, priority };
}

export const PLATFORMS = [
  // SOCIAL (15)
  p("instagram","Instagram","social","📸","instagram\\.com/[\\w.]+","https://instagram.com/handle","oauth",["followers","engagement","content"],1,"instagram"),
  p("instagram_reels","Instagram Reels","social","🎞️","instagram\\.com/reels","https://instagram.com/reels/handle","oauth",["reel views","engagement"],2,"instagram"),
  p("tiktok","TikTok","social","🎵","tiktok\\.com/@[\\w.]+","https://tiktok.com/@handle","oauth",["followers","likes","videos"],3,"tiktok"),
  p("twitter","X / Twitter","social","𝕏","(twitter|x)\\.com/[\\w]+","https://x.com/handle","oauth",["followers","engagement","content"],4,"twitter"),
  p("facebook","Facebook","social","👤","facebook\\.com/[\\w.]+","https://facebook.com/page","oauth",["page likes","followers"],5,"instagram"),
  p("threads","Threads","social","🧵","threads\\.net/@[\\w.]+","https://threads.net/@handle","crawl",["followers","content"],6),
  p("snapchat","Snapchat","social","👻","snapchat\\.com/add/[\\w.]+","https://snapchat.com/add/handle","crawl",["public profile"],7,undefined,false),
  p("reddit","Reddit","social","🤖","reddit\\.com/user/[\\w_]+","https://reddit.com/user/handle","crawl",["karma","communities","content"],8),
  p("bluesky","Bluesky","social","🦋","bsky\\.app/profile/[\\w.]+","https://bsky.app/profile/handle","crawl",["followers","posts"],9),
  p("clubhouse","Clubhouse","social","🏠","joinclubhouse\\.com/@[\\w]+","https://joinclubhouse.com/@handle","crawl",["followers","topics"],10),
  p("telegram","Telegram","social","✈️","t\\.me/[\\w]+","https://t.me/channel","crawl",["subscribers"],11),
  p("whatsapp_channels","WhatsApp Channels","social","💬","whatsapp\\.com/channel/[\\w]+","https://whatsapp.com/channel/...","manual",["channel link"],12,undefined,false),
  p("pinterest","Pinterest","social","📌","pinterest\\.com/[\\w]+","https://pinterest.com/handle","oauth",["followers","pins","monthly views"],13,"pinterest"),
  p("linkedin","LinkedIn","social","💼","linkedin\\.com/in/[\\w-]+","https://linkedin.com/in/profile","oauth",["connections","headline"],14,"linkedin"),
  p("rumble_social","Rumble","social","📹","rumble\\.com/user/[\\w-]+","https://rumble.com/user/handle","crawl",["followers"],15),
  // VIDEO (5)
  p("youtube","YouTube","video","🎬","youtube\\.com/(c/|@|channel/)[\\w-]+","https://youtube.com/@channel","oauth",["subscribers","views","videos"],1,"youtube"),
  p("rumble","Rumble","video","📹","rumble\\.com/c/[\\w-]+","https://rumble.com/c/channel","crawl",["followers","videos"],2),
  p("triller","Triller","video","🎭","triller\\.co/@[\\w]+","https://triller.co/@handle","crawl",["followers"],3),
  p("dailymotion","Dailymotion","video","▶️","dailymotion\\.com/[\\w]+","https://dailymotion.com/channel","crawl",["followers","views"],4),
  p("youtube_gaming","YouTube Gaming","video","🎮","youtube\\.com/@[\\w-]+","https://youtube.com/@gamingchannel","oauth",["subscribers","gaming content"],5,"youtube"),
  // AUDIO (7)
  p("spotify","Spotify","audio","🎧","open\\.spotify\\.com/artist/[\\w]+","https://open.spotify.com/artist/id","oauth",["monthly listeners","followers"],1,"spotify"),
  p("soundcloud","SoundCloud","audio","☁️","soundcloud\\.com/[\\w-]+","https://soundcloud.com/handle","crawl",["followers","tracks","plays"],2),
  p("apple_music","Apple Music","audio","🍎","music\\.apple\\.com/.+/artist/","https://music.apple.com/artist/...","crawl",["profile","discography"],3),
  p("audiomack","Audiomack","audio","🔊","audiomack\\.com/[\\w-]+","https://audiomack.com/handle","crawl",["followers","plays"],4),
  p("bandcamp","Bandcamp","audio","🎸","[\\w]+\\.bandcamp\\.com","https://name.bandcamp.com","crawl",["releases","followers"],5),
  p("mixcloud","Mixcloud","audio","🎛️","mixcloud\\.com/[\\w-]+","https://mixcloud.com/handle","crawl",["followers","shows"],6),
  p("reverbnation","ReverbNation","audio","🎤","reverbnation\\.com/[\\w]+","https://reverbnation.com/band","crawl",["fans","rank"],7),
  // PODCAST (5)
  p("apple_podcasts","Apple Podcasts","podcast","🎙️","podcasts\\.apple\\.com/.+/podcast/","https://podcasts.apple.com/.../id123","crawl",["ratings","episodes"],1),
  p("spotify_podcasts","Spotify Podcasts","podcast","🎧","open\\.spotify\\.com/show/[\\w]+","https://open.spotify.com/show/id","crawl",["episodes","show info"],2),
  p("youtube_podcasts","YouTube Podcasts","podcast","📺","youtube\\.com/@[\\w-]+","https://youtube.com/@podcast","oauth",["subscribers","episodes"],3,"youtube"),
  p("amazon_music","Amazon Music","podcast","🔈","music\\.amazon\\.com/podcasts/[\\w-]+","https://music.amazon.com/podcasts/...","crawl",["episodes"],4),
  p("iheartradio","iHeartRadio","podcast","❤️","iheart\\.com/podcast/[\\w-]+","https://iheart.com/podcast/...","crawl",["episodes"],5),
  // GAMING (9)
  p("twitch","Twitch","gaming","🟣","twitch\\.tv/[\\w]+","https://twitch.tv/handle","oauth",["followers","avg viewers"],1,"twitch"),
  p("twitch_clips","Twitch Clips","gaming","✂️","twitch\\.tv/[\\w]+/clips","https://twitch.tv/handle/clips","oauth",["top clips"],2,"twitch"),
  p("discord","Discord","gaming","🎙️","discord\\.gg/[\\w]+","https://discord.gg/invite","crawl",["server link"],3,undefined,false),
  p("steam","Steam","gaming","🎲","steamcommunity\\.com/id/[\\w]+","https://steamcommunity.com/id/profile","crawl",["games","level"],4),
  p("kick","Kick","gaming","🟢","kick\\.com/[\\w]+","https://kick.com/handle","crawl",["followers","streams"],5),
  p("roblox","Roblox","gaming","🧱","roblox\\.com/users/\\d+","https://roblox.com/users/123","crawl",["friends","creations"],6),
  p("fortnite_creative","Fortnite Creative","gaming","🏗️","fortnite\\.com/@[\\w]+","https://fortnite.com/@code","manual",["creator code"],7,undefined,false),
  p("battlefy","Battlefy","gaming","⚔️","battlefy\\.com/[\\w-]+","https://battlefy.com/team","crawl",["tournaments"],8),
  p("youtube_gaming_alt","YouTube Gaming","gaming","🎮","youtube\\.com/@[\\w-]+","https://youtube.com/@gaming","oauth",["subscribers"],9,"youtube"),
  // CREATIVE (8)
  p("behance","Behance","creative","🎨","behance\\.net/[\\w]+","https://behance.net/handle","crawl",["projects","followers"],1),
  p("dribbble","Dribbble","creative","🏀","dribbble\\.com/[\\w]+","https://dribbble.com/handle","crawl",["shots","followers"],2),
  p("deviantart","DeviantArt","creative","🖌️","deviantart\\.com/[\\w]+","https://deviantart.com/handle","crawl",["watchers","deviations"],3),
  p("vsco","VSCO","creative","📷","vsco\\.co/[\\w]+","https://vsco.co/handle","crawl",["gallery"],4),
  p("500px","500px","creative","🖼️","500px\\.com/p/[\\w]+","https://500px.com/p/handle","crawl",["photos","followers"],5),
  p("artstation","ArtStation","creative","🎭","artstation\\.com/[\\w]+","https://artstation.com/handle","crawl",["projects","followers"],6),
  p("etsy","Etsy","creative","🧶","etsy\\.com/shop/[\\w]+","https://etsy.com/shop/name","crawl",["products","reviews"],7),
  p("adobe_portfolio","Adobe Portfolio","creative","🅰️","[\\w]+\\.myportfolio\\.com","https://name.myportfolio.com","crawl",["portfolio"],8),
  // SHOPPING (13)
  p("tiktok_shop","TikTok Shop","shopping","🛍️","tiktok\\.com/@[\\w.]+/shop","https://tiktok.com/@handle/shop","crawl",["products","reviews"],1),
  p("instagram_shop","Instagram Shop","shopping","🛒","instagram\\.com/[\\w.]+/shop","https://instagram.com/handle/shop","oauth",["products"],2,"instagram"),
  p("shopify_collabs","Shopify Collabs","shopping","🏪","shopify\\.com/collabs/[\\w-]+","https://shopify.com/collabs/profile","crawl",["collabs"],3),
  p("ltk","LTK","shopping","👗","liketoknow\\.it/[\\w]+","https://liketoknow.it/handle","crawl",["followers","posts"],4),
  p("poshmark","Poshmark","shopping","👠","poshmark\\.com/closet/[\\w]+","https://poshmark.com/closet/handle","crawl",["listings","followers"],5),
  p("depop","Depop","shopping","🧥","depop\\.com/[\\w]+","https://depop.com/handle","crawl",["items","reviews"],6),
  p("lemon8","Lemon8","shopping","🍋","lemon8-app\\.com/[\\w]+","https://lemon8-app.com/handle","crawl",["followers","posts"],7),
  p("amazon_influencer","Amazon Influencer","shopping","📦","amazon\\.com/shop/[\\w]+","https://amazon.com/shop/handle","crawl",["storefront"],8),
  p("shopmy","ShopMy","shopping","🛍️","shopmy\\.us/[\\w]+","https://shopmy.us/handle","crawl",["products"],9),
  p("buymeacoffee","Buy Me a Coffee","shopping","☕","buymeacoffee\\.com/[\\w]+","https://buymeacoffee.com/handle","crawl",["supporters"],10),
  p("kofi","Ko-fi","shopping","🍵","ko-fi\\.com/[\\w]+","https://ko-fi.com/handle","crawl",["supporters"],11),
  p("fanfix","Fanfix / Passes","shopping","🎫","(fanfix|passes)\\.io/[\\w]+","https://passes.io/handle","crawl",["subscribers"],12),
  p("onlyfans","OnlyFans","shopping","🔒","onlyfans\\.com/[\\w]+","https://onlyfans.com/handle","crawl",["likes","media count"],13),
  // WRITING (7)
  p("medium","Medium","writing","📝","medium\\.com/@[\\w.]+","https://medium.com/@handle","crawl",["followers","articles"],1),
  p("substack","Substack","writing","📰","[\\w]+\\.substack\\.com","https://name.substack.com","crawl",["posts","topics"],2),
  p("beehiiv","Beehiiv","writing","🐝","[\\w]+\\.beehiiv\\.com","https://newsletter.beehiiv.com","crawl",["content"],3),
  p("convertkit","ConvertKit / Kit","writing","✉️","[\\w]+\\.ck\\.page","https://name.ck.page","crawl",["landing page"],4),
  p("patreon","Patreon","writing","🎁","patreon\\.com/[\\w]+","https://patreon.com/handle","oauth",["patrons","tiers"],5,"patreon"),
  p("quora","Quora","writing","❓","quora\\.com/profile/[\\w-]+","https://quora.com/profile/Name","crawl",["followers","answers"],6),
  p("goodreads","Goodreads","writing","📚","goodreads\\.com/author/show/\\d+","https://goodreads.com/author/show/123","crawl",["books","ratings"],7),
  // FITNESS (8)
  p("strava","Strava","fitness","🏃","strava\\.com/athletes/\\d+","https://strava.com/athletes/123","oauth",["activities","followers"],1,"strava"),
  p("peloton","Peloton","fitness","🚴","members\\.onepeloton\\.com/members/[\\w]+","https://members.onepeloton.com/members/handle","crawl",["workouts"],2),
  p("myfitnesspal","MyFitnessPal","fitness","🥗","myfitnesspal\\.com/profile/[\\w]+","https://myfitnesspal.com/profile/handle","crawl",["profile"],3),
  p("espn","ESPN","fitness","🏈","espn\\.com/.+","https://espn.com/profile","manual",["profile link"],4,undefined,false),
  p("garmin_connect","Garmin Connect","fitness","⌚","connect\\.garmin\\.com/modern/profile/[\\w-]+","https://connect.garmin.com/.../handle","crawl",["activities"],5),
  p("hudl","Hudl","fitness","📊","hudl\\.com/profile/\\d+","https://hudl.com/profile/123","crawl",["highlights"],6),
  p("maxpreps","MaxPreps","fitness","🏅","maxpreps\\.com/athlete/.+","https://maxpreps.com/athlete/...","crawl",["stats"],7),
  p("transfermarkt","Transfermarkt","fitness","⚽","transfermarkt\\.com/.+/profil/spieler/\\d+","https://transfermarkt.com/.../123","crawl",["market value","stats"],8),
  // PROFESSIONAL (10)
  p("cameo","Cameo","professional","⭐","cameo\\.com/[\\w]+","https://cameo.com/handle","crawl",["price","reviews"],1),
  p("casting_networks","Casting Networks","professional","🎬","castingnetworks\\.com/[\\w]+","https://castingnetworks.com/profile","crawl",["resume","credits"],2),
  p("imdb","IMDb","professional","🎥","imdb\\.com/name/nm\\d+","https://imdb.com/name/nm123","crawl",["credits","filmography"],3),
  p("letterboxd","Letterboxd","professional","🎞️","letterboxd\\.com/[\\w]+","https://letterboxd.com/handle","crawl",["reviews","followers"],4),
  p("fiverr","Fiverr","professional","💚","fiverr\\.com/[\\w]+","https://fiverr.com/handle","crawl",["gigs","reviews"],5),
  p("upwork","Upwork","professional","🟢","upwork\\.com/freelancers/[\\w~]+","https://upwork.com/freelancers/~profile","crawl",["job success","skills"],6),
  p("social_blade","Social Blade","professional","📈","socialblade\\.com/.+","https://socialblade.com/...","crawl",["growth stats","grade"],7),
  p("hypeauditor","HypeAuditor","professional","🔍","hypeauditor\\.com/.+","https://hypeauditor.com/report","crawl",["audience quality"],8),
  p("teachable","Teachable","professional","🎓","[\\w]+\\.teachable\\.com","https://school.teachable.com","crawl",["courses"],9),
  p("gumroad","Gumroad","professional","💰","[\\w]+\\.gumroad\\.com","https://name.gumroad.com","crawl",["products","ratings"],10),
  // CRM (2)
  p("mailchimp","Mailchimp","crm","🐵","mailchimp\\.com","Connected via API","oauth",["list size"],1,"mailchimp",false),
  p("klaviyo","Klaviyo","crm","📧","klaviyo\\.com","Connected via API","oauth",["list size","flows"],2,"klaviyo",false),
  // TOOLS (1)
  p("calendly","Calendly","tools","📅","calendly\\.com/[\\w-]+","https://calendly.com/handle","crawl",["booking page"],1),
];

export function getPlatformsByCategory() {
  const g = new Map();
  for (const cat of CATEGORY_ORDER) {
    const ps = PLATFORMS.filter(pl => pl.category === cat).sort((a, b) => a.priority - b.priority);
    if (ps.length > 0) g.set(cat, ps);
  }
  return g;
}

export function getPlatform(id) { return PLATFORMS.find(pl => pl.id === id); }
export function detectPlatform(url) { return PLATFORMS.find(pl => new RegExp(pl.urlPattern, "i").test(url)); }

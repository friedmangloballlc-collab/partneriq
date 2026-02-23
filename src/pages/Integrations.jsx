import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Plug, BarChart3, Briefcase, Building2, Users,
  CheckCircle2, Clock, ExternalLink, Zap, ChevronDown, ChevronUp
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { name: "YouTube",     method: "Data API v3 + Phyllo",  rateLimit: "10,000 units/day",   data: "Subscribers, views, demographics, content",            status: "live" },
  { name: "Instagram",   method: "Graph API + Phyllo",    rateLimit: "200 calls/hour",      data: "Followers, engagement, stories, reels, demos",         status: "live" },
  { name: "TikTok",      method: "Research API + Phyllo", rateLimit: "1,000 calls/day",     data: "Followers, views, engagement, sounds, demos",          status: "live" },
  { name: "Twitch",      method: "Helix API",             rateLimit: "800 calls/minute",    data: "Followers, subs, watch time, clips, streams",          status: "live" },
  { name: "Twitter/X",   method: "API v2",                rateLimit: "500 calls/15 min",    data: "Followers, engagement, impressions, spaces",           status: "live" },
  { name: "LinkedIn",    method: "Marketing API",         rateLimit: "100 calls/day",       data: "Connections, engagement, company data",                status: "live" },
  { name: "Facebook",    method: "Graph API",             rateLimit: "200 calls/hour",      data: "Page followers, engagement, groups",                   status: "live" },
  { name: "Snapchat",    method: "Marketing API",         rateLimit: "Limited",             data: "Story views, subscribers, demos",                      status: "beta" },
  { name: "Pinterest",   method: "API v5",                rateLimit: "1,000 calls/hour",    data: "Followers, pins, engagement, saves",                   status: "live" },
  { name: "Reddit",      method: "API",                   rateLimit: "60 calls/minute",     data: "Karma, posts, community engagement",                   status: "beta" },
  { name: "Discord",     method: "API",                   rateLimit: "50 calls/second",     data: "Server members, activity",                             status: "beta" },
];

const INFLUENCER_PLATFORMS = [
  { name: "CreatorIQ",      data: "Campaign data, benchmarks, performance",              status: "live" },
  { name: "Grin",           data: "Creator relationships, CRM, payments",                status: "live" },
  { name: "AspireIQ",       data: "Campaign management, content library",                status: "live" },
  { name: "Captiv8",        data: "Influencer analytics, discovery",                     status: "live" },
  { name: "Traackr",        data: "Influence scoring, relationship tracking",            status: "live" },
  { name: "Tagger",         data: "Discovery, campaign management",                      status: "coming_soon" },
  { name: "Klear",          data: "Analytics, discovery, measurement",                   status: "coming_soon" },
  { name: "IZEA",           data: "Marketplace, payments, contracts",                    status: "live" },
  { name: "Mavrck",         data: "Advocacy, UGC, ambassador programs",                  status: "coming_soon" },
  { name: "Popular Pays",   data: "Creative, UGC, licensing",                            status: "coming_soon" },
  { name: "#paid",          data: "Creator marketplace, payments",                       status: "coming_soon" },
  { name: "Heepsy",         data: "Discovery, analytics",                                status: "live" },
  { name: "Influencity",    data: "CRM, analytics, reporting",                           status: "live" },
  { name: "Affable.ai",     data: "AI-powered discovery, analytics",                     status: "coming_soon" },
  { name: "Brandbassador",  data: "Ambassador management, gamification",                 status: "coming_soon" },
];

const ANALYTICS_PLATFORMS = [
  { name: "HypeAuditor",  data: "Authenticity analysis, fake follower detection",  status: "live" },
  { name: "Modash",       data: "Creator discovery, email finder",                 status: "live" },
  { name: "Social Blade", data: "Historical growth data, rankings",               status: "live" },
  { name: "Tubular Labs", data: "Video analytics, cross-platform data",           status: "live" },
  { name: "Sprout Social",data: "Social management, analytics",                   status: "live" },
  { name: "Hootsuite",    data: "Social management, listening",                   status: "coming_soon" },
  { name: "Brandwatch",   data: "Social listening, sentiment",                    status: "live" },
  { name: "Meltwater",    data: "Media monitoring, analytics",                    status: "coming_soon" },
  { name: "Talkwalker",   data: "Social listening, image recognition",            status: "coming_soon" },
  { name: "Sprinklr",     data: "Enterprise social suite",                        status: "coming_soon" },
];

const BUSINESS_TOOLS = [
  { category: "CRM",                   platforms: "Salesforce, HubSpot, Pipedrive, Copper, Zoho",                   type: "OAuth + API",      status: "live" },
  { category: "Productivity",          platforms: "Notion, Airtable, Monday.com, Asana, ClickUp",                  type: "OAuth + API",      status: "live" },
  { category: "Email",                 platforms: "Gmail, Outlook, SendGrid, Mailchimp, HubSpot",                  type: "OAuth + API",      status: "live" },
  { category: "Calendar",             platforms: "Google Calendar, Outlook Calendar, Calendly",                    type: "OAuth + API",      status: "live" },
  { category: "Communication",        platforms: "Slack, Microsoft Teams, Discord, Intercom",                      type: "OAuth + Webhook",  status: "live" },
  { category: "Video",                 platforms: "Zoom, Google Meet, Microsoft Teams",                            type: "OAuth + API",      status: "live" },
  { category: "Contracts",            platforms: "DocuSign, HelloSign, PandaDoc, Ironclad",                        type: "OAuth + API",      status: "live" },
  { category: "Payments",             platforms: "Stripe, PayPal, Wise, Mercury, Bill.com",                        type: "API",              status: "live" },
  { category: "Accounting",           platforms: "QuickBooks, Xero, NetSuite",                                     type: "OAuth + API",      status: "coming_soon" },
  { category: "B2B Lead Generation",  platforms: "GrowMeOrganic",                                                  type: "REST API",         status: "live" },
  { category: "Analytics",            platforms: "Google Analytics, Mixpanel, Amplitude, Heap",                    type: "API + SDK",        status: "live" },
];

const GROWME_POSITIONS = [
  { category: "Partnerships, Sponsorships, Activations", color: "bg-indigo-100 text-indigo-700", positions: "Head/VP of Sponsorships, Head/VP of Partnerships, Director of Sponsorship Sales, VP of Business Development, Head of Brand Activations, Chief Revenue Officer, Chief Partnership Officer, Director of Strategic Partnerships, VP of Integrated Marketing, Brand Partnerships Manager, Sponsorship Manager" },
  { category: "Marketing / Brand",              color: "bg-blue-100 text-blue-700",    positions: "CMO, VP of Marketing, Marketing Director, Head of Brand Marketing, Influencer Marketing Manager, Marketing Specialist, Digital Marketing Intern" },
  { category: "Editorial / Content",            color: "bg-purple-100 text-purple-700",positions: "Editor-in-Chief, Managing Editor, Executive Editor, Editorial Director, Creative Director, Head of Content Strategy, VP of Programming, Newsletter Editor" },
  { category: "Advertising / Sales",            color: "bg-orange-100 text-orange-700",positions: "VP of Sales, Head of Advertising, Director of Ad Sales, Head of Podcast Sales" },
  { category: "Digital / Social",               color: "bg-sky-100 text-sky-700",      positions: "Head of Digital, Digital Partnerships Manager, Social Media Director, VP of Digital Strategy" },
  { category: "Audience / Growth",              color: "bg-teal-100 text-teal-700",    positions: "Head of Audience Development, VP of Growth, Director of Audience Engagement" },
  { category: "Events / Booking",               color: "bg-rose-100 text-rose-700",    positions: "Events Director, Head of Programming, VP of Events, Booking Manager, Podcast Booking, Guest Submission, Speaker Bureau" },
  { category: "Video / Podcast",                color: "bg-red-100 text-red-700",      positions: "Host, Executive Producer, Head of Video, Video Partnerships Manager, Head of Newsletter Partnerships" },
  { category: "Communications / PR",            color: "bg-pink-100 text-pink-700",    positions: "Head of Communications, PR Director, VP of Public Relations" },
  { category: "Talent / Management",            color: "bg-emerald-100 text-emerald-700", positions: "CEO/Founder (smaller outlets), General Manager, Talent Manager, Agent, Publicist, Talent Rep, Talent Agency" },
  { category: "Commercial / Licensing",         color: "bg-amber-100 text-amber-700",  positions: "Commercial Director, VP of Commercial Partnerships, Head of Licensing, Affiliate Partnerships, Syndication, Licensing, Co-Marketing Contact" },
  { category: "Client Services",                color: "bg-slate-100 text-slate-700",  positions: "Client Services Director, Director of Client Relations" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === "live")
    return <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Live</Badge>;
  if (status === "beta")
    return <Badge className="bg-amber-100 text-amber-700 text-[10px]">Beta</Badge>;
  return <Badge className="bg-slate-100 text-slate-500 text-[10px]">Coming Soon</Badge>;
}

function SectionHeader({ icon: Icon, title, count, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-400">{count} integrations</p>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon, color, count, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <SectionHeader icon={icon} title={title} count={count} color={color} />
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Integrations() {
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();

  const filterName = arr => q ? arr.filter(i => (i.name || i.category || "").toLowerCase().includes(q) || (i.data || i.platforms || "").toLowerCase().includes(q)) : arr;

  const totalLive = SOCIAL_PLATFORMS.filter(p => p.status === "live").length
    + INFLUENCER_PLATFORMS.filter(p => p.status === "live").length
    + ANALYTICS_PLATFORMS.filter(p => p.status === "live").length
    + BUSINESS_TOOLS.filter(p => p.status === "live").length;

  const totalAll = SOCIAL_PLATFORMS.length + INFLUENCER_PLATFORMS.length + ANALYTICS_PLATFORMS.length + BUSINESS_TOOLS.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integration Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Part XVI · All platform connections powering PartnerIQ</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold text-emerald-700">{totalLive}</p>
            <p className="text-[10px] text-emerald-500 uppercase tracking-wider">Live</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold text-slate-700">{totalAll}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search integrations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 31.1 Social Platforms */}
      <CollapsibleSection title="31.1 Social Platforms" icon={Users} color="bg-indigo-50 text-indigo-600" count={SOCIAL_PLATFORMS.length}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Platform</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Method</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 hidden md:table-cell">Rate Limit</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 hidden lg:table-cell">Data Available</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filterName(SOCIAL_PLATFORMS).map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-slate-800">{p.name}</td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">{p.method}</td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs hidden md:table-cell">{p.rateLimit}</td>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs hidden lg:table-cell max-w-xs truncate">{p.data}</td>
                  <td className="py-2.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* 31.2 Influencer Marketing Platforms */}
      <CollapsibleSection title="31.2 Influencer Marketing Platforms" icon={Zap} color="bg-purple-50 text-purple-600" count={INFLUENCER_PLATFORMS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(INFLUENCER_PLATFORMS).map((p, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.data}</p>
                <Badge variant="outline" className="text-[9px] mt-1.5">API</Badge>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 31.3 Analytics & Intelligence */}
      <CollapsibleSection title="31.3 Analytics & Intelligence" icon={BarChart3} color="bg-teal-50 text-teal-600" count={ANALYTICS_PLATFORMS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(ANALYTICS_PLATFORMS).map((p, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.data}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 31.4 Business Tools */}
      <CollapsibleSection title="31.4 Business Tools" icon={Briefcase} color="bg-amber-50 text-amber-600" count={BUSINESS_TOOLS.length}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Category</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Platforms</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 hidden sm:table-cell">Integration Type</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filterName(BUSINESS_TOOLS).map((t, i) => (
                <tr key={i} className={`hover:bg-slate-50 transition-colors ${t.category === "B2B Lead Generation" ? "bg-indigo-50/50" : ""}`}>
                  <td className="py-2.5 pr-4 font-semibold text-slate-800 whitespace-nowrap">
                    {t.category === "B2B Lead Generation" && <span className="mr-1.5 text-indigo-600">★</span>}
                    {t.category}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">{t.platforms}</td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell">
                    <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
                  </td>
                  <td className="py-2.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* 31.5 GrowMeOrganic B2B Contact Intelligence */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 overflow-hidden">
        <div className="p-5 border-b border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-800">31.5 B2B Contact Intelligence</h2>
                <Badge className="bg-indigo-600 text-white text-[10px]">GrowMeOrganic</Badge>
                <StatusBadge status="live" />
              </div>
              <p className="text-sm text-slate-600 mt-1">Verified B2B contact data from LinkedIn and Google Maps — enabling PartnerIQ to identify and reach exact decision-makers for partnership services.</p>
            </div>
          </div>

          {/* API Config */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Base URL",      value: "api.growmeorganic.com/v1" },
              { label: "Auth",          value: "X-API-Key (Header)" },
              { label: "Rate Limit",    value: "Unlimited (subscription)" },
            ].map((c, i) => (
              <div key={i} className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider">{c.label}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5 font-mono">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Key Endpoints */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Endpoints</p>
            <div className="space-y-1.5">
              {[
                { method: "POST", path: "/linkedin/search",   desc: "Search LinkedIn profiles by filters (title, company, location)" },
                { method: "POST", path: "/linkedin/enrich",   desc: "Get verified email/phone for LinkedIn profile URL" },
                { method: "POST", path: "/gmaps/search",      desc: "Extract business contacts from Google Maps results" },
                { method: "POST", path: "/email/verify",      desc: "Validate email deliverability before outreach" },
                { method: "POST", path: "/campaigns/create",  desc: "Create automated email sequence with follow-ups" },
              ].map((ep, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/60 rounded-lg p-2.5 border border-indigo-100">
                  <Badge className="bg-indigo-600 text-white text-[9px] font-mono flex-shrink-0 mt-0.5">{ep.method}</Badge>
                  <code className="text-xs font-mono text-indigo-700 flex-shrink-0">{ep.path}</code>
                  <span className="text-xs text-slate-500 hidden sm:block">— {ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Target Positions */}
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Decision-Maker Positions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GROWME_POSITIONS.map((g, i) => (
              <div key={i} className="bg-white/70 rounded-xl border border-white p-3">
                <Badge className={`${g.color} text-[10px] mb-2`}>{g.category}</Badge>
                <p className="text-[11px] text-slate-500 leading-relaxed">{g.positions}</p>
              </div>
            ))}
          </div>

          {/* Match Agent Integration note */}
          <div className="mt-4 flex items-start gap-3 bg-white/80 rounded-xl border border-indigo-100 p-4">
            <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Match Agent Integration</p>
              <p className="text-xs text-slate-500 mt-0.5">When Match Agent identifies a high-fit brand partnership, GrowMeOrganic automatically enriches contact data to find the right decision-maker (e.g. "VP Marketing" or "Head of Partnerships") with verified contact info, enabling immediate personalized outreach through the Outreach Agent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, BarChart3, Briefcase, Building2, Users,
  Zap, ChevronDown, ChevronUp, Link2, CheckCircle2, Lock, MessageSquare, Mail, Database
} from "lucide-react";
import ConnectModal from "@/components/integrations/ConnectModal";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { name: "YouTube",   method: "Data API v3 + Phyllo",  rateLimit: "10,000 units/day", data: "Subscribers, views, demographics, content",         status: "live" },
  { name: "Instagram", method: "Graph API + Phyllo",    rateLimit: "200 calls/hour",   data: "Followers, engagement, stories, reels, demos",      status: "live" },
  { name: "TikTok",    method: "Research API + Phyllo", rateLimit: "1,000 calls/day",  data: "Followers, views, engagement, sounds, demos",       status: "live" },
  { name: "Twitch",    method: "Helix API",             rateLimit: "800 calls/minute", data: "Followers, subs, watch time, clips, streams",       status: "live" },
  { name: "Twitter/X", method: "API v2",                rateLimit: "500 calls/15 min", data: "Followers, engagement, impressions, spaces",        status: "live" },
  { name: "LinkedIn",  method: "Marketing API",         rateLimit: "100 calls/day",    data: "Connections, engagement, company data",             status: "live" },
  { name: "Facebook",  method: "Graph API",             rateLimit: "200 calls/hour",   data: "Page followers, engagement, groups",                status: "live" },
  { name: "Snapchat",  method: "Marketing API",         rateLimit: "Limited",          data: "Story views, subscribers, demos",                   status: "beta" },
  { name: "Pinterest", method: "API v5",                rateLimit: "1,000 calls/hour", data: "Followers, pins, engagement, saves",                status: "live" },
  { name: "Reddit",    method: "API",                   rateLimit: "60 calls/minute",  data: "Karma, posts, community engagement",                status: "beta" },
  { name: "Discord",   method: "API",                   rateLimit: "50 calls/second",  data: "Server members, activity",                          status: "beta" },
];

const INFLUENCER_PLATFORMS = [
  { name: "CreatorIQ",     data: "Campaign data, benchmarks, performance",           status: "live" },
  { name: "Grin",          data: "Creator relationships, CRM, payments",             status: "live" },
  { name: "AspireIQ",      data: "Campaign management, content library",             status: "live" },
  { name: "Captiv8",       data: "Influencer analytics, discovery",                  status: "live" },
  { name: "Traackr",       data: "Influence scoring, relationship tracking",         status: "live" },
  { name: "Tagger",        data: "Discovery, campaign management",                   status: "coming_soon" },
  { name: "Klear",         data: "Analytics, discovery, measurement",                status: "coming_soon" },
  { name: "IZEA",          data: "Marketplace, payments, contracts",                 status: "live" },
  { name: "Mavrck",        data: "Advocacy, UGC, ambassador programs",               status: "coming_soon" },
  { name: "Popular Pays",  data: "Creative, UGC, licensing",                         status: "coming_soon" },
  { name: "#paid",         data: "Creator marketplace, payments",                    status: "coming_soon" },
  { name: "Heepsy",        data: "Discovery, analytics",                             status: "live" },
  { name: "Influencity",   data: "CRM, analytics, reporting",                        status: "live" },
  { name: "Affable.ai",    data: "AI-powered discovery, analytics",                  status: "coming_soon" },
  { name: "Brandbassador", data: "Ambassador management, gamification",              status: "coming_soon" },
];

const ANALYTICS_PLATFORMS = [
  { name: "HypeAuditor",  data: "Authenticity analysis, fake follower detection", status: "live" },
  { name: "Modash",       data: "Creator discovery, email finder",                status: "live" },
  { name: "Social Blade", data: "Historical growth data, rankings",              status: "live" },
  { name: "Tubular Labs", data: "Video analytics, cross-platform data",          status: "live" },
  { name: "Sprout Social",data: "Social management, analytics",                  status: "live" },
  { name: "Hootsuite",    data: "Social management, listening",                  status: "coming_soon" },
  { name: "Brandwatch",   data: "Social listening, sentiment",                   status: "live" },
  { name: "Meltwater",    data: "Media monitoring, analytics",                   status: "coming_soon" },
  { name: "Talkwalker",   data: "Social listening, image recognition",           status: "coming_soon" },
  { name: "Sprinklr",     data: "Enterprise social suite",                       status: "coming_soon" },
];

const BUSINESS_TOOLS = [
  { category: "Productivity",     platforms: "Notion, Airtable, Monday.com, Asana, ClickUp",             type: "OAuth + API",     status: "live" },
  { category: "Email",            platforms: "Gmail, Outlook, SendGrid, Mailchimp, HubSpot",             type: "OAuth + API",     status: "live" },
  { category: "Calendar",         platforms: "Google Calendar, Outlook Calendar, Calendly",              type: "OAuth + API",     status: "live" },
  { category: "Video",            platforms: "Zoom, Google Meet, Microsoft Teams",                       type: "OAuth + API",     status: "live" },
  { category: "Contracts",        platforms: "DocuSign, HelloSign, PandaDoc, Ironclad",                  type: "OAuth + API",     status: "live" },
  { category: "Payments",         platforms: "Stripe, PayPal, Wise, Mercury, Bill.com",                  type: "API",             status: "live" },
  { category: "Accounting",       platforms: "QuickBooks, Xero, NetSuite",                               type: "OAuth + API",     status: "coming_soon" },
  { category: "Analytics",        platforms: "Google Analytics, Mixpanel, Amplitude, Heap",              type: "API + SDK",       status: "live" },
];

const CRM_INTEGRATIONS = [
  {
    name: "Salesforce",
    logo: "SF",
    color: "bg-blue-600",
    description: "Sync partnerships, contacts, and deals bidirectionally. Auto-create Opportunities from high-match deals and log all outreach activity.",
    features: ["Bidirectional deal sync", "Auto-create Opportunities", "Log outreach as Activities", "Contact enrichment"],
    type: "OAuth 2.0",
    status: "live",
  },
  {
    name: "HubSpot",
    logo: "HS",
    color: "bg-orange-500",
    description: "Push partnership deals to HubSpot CRM pipeline, sync contacts, and trigger HubSpot workflows from PartnerIQ deal stage changes.",
    features: ["CRM pipeline sync", "Contact sync", "Workflow triggers", "Email tracking"],
    type: "OAuth 2.0",
    status: "live",
  },
  {
    name: "Pipedrive",
    logo: "PD",
    color: "bg-green-600",
    description: "Map PartnerIQ pipeline stages to Pipedrive deals. Get a unified view of all partnership revenue in your sales CRM.",
    features: ["Pipeline stage mapping", "Deal revenue tracking", "Activity logging", "Person sync"],
    type: "API Key",
    status: "live",
  },
  {
    name: "Zoho CRM",
    logo: "ZO",
    color: "bg-red-500",
    description: "Connect with Zoho's CRM to manage brand relationships, track deal progress, and automate follow-up tasks.",
    features: ["Lead & contact sync", "Deal tracking", "Task automation", "Custom modules"],
    type: "OAuth 2.0",
    status: "live",
  },
  {
    name: "Attio",
    logo: "AT",
    color: "bg-violet-600",
    description: "Modern CRM built for relationship intelligence. Sync your partnership network and get rich context on every contact.",
    features: ["Relationship graph sync", "Note sync", "Enrichment", "Team workspace"],
    type: "API Key",
    status: "beta",
  },
  {
    name: "Copper",
    logo: "CO",
    color: "bg-amber-500",
    description: "Google Workspace-native CRM. Sync partnerships and contacts directly into your Gmail workflow.",
    features: ["Gmail sidebar sync", "Google Contacts sync", "Pipeline mapping", "Task creation"],
    type: "OAuth 2.0",
    status: "coming_soon",
  },
];

const MARKETING_AUTOMATION = [
  {
    name: "Mailchimp",
    logo: "MC",
    color: "bg-yellow-500",
    description: "Add partners and talent to targeted email lists, trigger automated campaigns when deals close, and track email performance.",
    features: ["List segmentation", "Automated campaigns", "Deal-triggered emails", "Open/click tracking"],
    type: "OAuth 2.0",
    status: "live",
  },
  {
    name: "ActiveCampaign",
    logo: "AC",
    color: "bg-blue-500",
    description: "Advanced marketing automation triggered by PartnerIQ deal events. Build complex partner nurture sequences with full CRM data.",
    features: ["Deal event triggers", "Nurture sequences", "CRM sync", "Lead scoring"],
    type: "API Key",
    status: "live",
  },
  {
    name: "Klaviyo",
    logo: "KL",
    color: "bg-green-700",
    description: "E-commerce focused marketing automation. Ideal for product seeding partnerships and affiliate campaign tracking.",
    features: ["Affiliate tracking", "Product seeding flows", "Revenue attribution", "A/B testing"],
    type: "API Key",
    status: "live",
  },
  {
    name: "Marketo",
    logo: "MK",
    color: "bg-purple-600",
    description: "Enterprise marketing automation for large-scale partnership programs. Sync with Salesforce and run multi-touch attribution.",
    features: ["Enterprise campaigns", "Salesforce sync", "Multi-touch attribution", "Lead lifecycle"],
    type: "OAuth 2.0",
    status: "coming_soon",
  },
  {
    name: "Pardot",
    logo: "PA",
    color: "bg-blue-700",
    description: "Salesforce B2B marketing automation. Align partnership outreach with your broader demand generation strategy.",
    features: ["Salesforce alignment", "B2B scoring", "Engagement studio", "ROI reporting"],
    type: "OAuth 2.0",
    status: "coming_soon",
  },
  {
    name: "Brevo (Sendinblue)",
    logo: "BR",
    color: "bg-teal-500",
    description: "All-in-one platform for transactional emails, SMS, and marketing campaigns triggered from partnership events.",
    features: ["Transactional emails", "SMS outreach", "Campaign automation", "Contact management"],
    type: "API Key",
    status: "live",
  },
];

const COMMUNICATION_TOOLS = [
  {
    name: "Slack",
    logo: "SL",
    color: "bg-purple-600",
    description: "Get instant Slack notifications for deal updates, approval requests, and outreach replies. Post summaries to channels automatically.",
    features: ["Deal update alerts", "Approval notifications", "Reply alerts", "Channel posting", "Slash commands"],
    type: "OAuth 2.0 / Webhook",
    status: "live",
  },
  {
    name: "Microsoft Teams",
    logo: "MT",
    color: "bg-blue-600",
    description: "Bring PartnerIQ deal intelligence directly into Teams channels. Get approval workflows and deal summaries without leaving Teams.",
    features: ["Teams notifications", "Adaptive cards", "Approval workflow", "Meeting scheduling"],
    type: "OAuth 2.0 / Webhook",
    status: "live",
  },
  {
    name: "Discord",
    logo: "DC",
    color: "bg-indigo-500",
    description: "Perfect for creator-focused teams. Get bot notifications in your Discord server for partnership milestones and alerts.",
    features: ["Bot notifications", "Role-based alerts", "Deal milestones", "Creator updates"],
    type: "Bot Token / Webhook",
    status: "live",
  },
  {
    name: "Intercom",
    logo: "IC",
    color: "bg-blue-400",
    description: "Enhance partner communication with Intercom's messaging platform. Log all partner conversations as PartnerIQ notes.",
    features: ["Conversation logging", "Contact enrichment", "Automated messages", "Help desk sync"],
    type: "OAuth 2.0",
    status: "beta",
  },
  {
    name: "WhatsApp Business",
    logo: "WA",
    color: "bg-green-500",
    description: "Send WhatsApp messages for partnership outreach via Meta's Cloud API. High open rates for initial contact with talent.",
    features: ["Template messages", "Outreach campaigns", "Reply tracking", "Contact management"],
    type: "Meta Cloud API",
    status: "coming_soon",
  },
  {
    name: "Twilio",
    logo: "TW",
    color: "bg-red-600",
    description: "Programmable SMS and voice for partnership outreach. Build multi-channel campaigns that combine email and SMS follow-ups.",
    features: ["SMS campaigns", "Voice calls", "Multi-channel sequences", "Delivery receipts"],
    type: "API Key",
    status: "coming_soon",
  },
];

const GROWME_POSITIONS = [
  { category: "Partnerships, Sponsorships, Activations", color: "bg-indigo-100 text-indigo-700", positions: "Head/VP of Sponsorships, Head/VP of Partnerships, Director of Sponsorship Sales, VP of Business Development, Head of Brand Activations, Chief Revenue Officer, Chief Partnership Officer, Director of Strategic Partnerships, VP of Integrated Marketing, Brand Partnerships Manager, Sponsorship Manager" },
  { category: "Marketing / Brand",    color: "bg-blue-100 text-blue-700",     positions: "CMO, VP of Marketing, Marketing Director, Head of Brand Marketing, Influencer Marketing Manager, Marketing Specialist, Digital Marketing Intern" },
  { category: "Editorial / Content",  color: "bg-purple-100 text-purple-700", positions: "Editor-in-Chief, Managing Editor, Executive Editor, Editorial Director, Creative Director, Head of Content Strategy, VP of Programming, Newsletter Editor" },
  { category: "Advertising / Sales",  color: "bg-orange-100 text-orange-700", positions: "VP of Sales, Head of Advertising, Director of Ad Sales, Head of Podcast Sales" },
  { category: "Digital / Social",     color: "bg-sky-100 text-sky-700",       positions: "Head of Digital, Digital Partnerships Manager, Social Media Director, VP of Digital Strategy" },
  { category: "Audience / Growth",    color: "bg-teal-100 text-teal-700",     positions: "Head of Audience Development, VP of Growth, Director of Audience Engagement" },
  { category: "Events / Booking",     color: "bg-rose-100 text-rose-700",     positions: "Events Director, Head of Programming, VP of Events, Booking Manager, Podcast Booking, Guest Submission, Speaker Bureau" },
  { category: "Video / Podcast",      color: "bg-red-100 text-red-700",       positions: "Host, Executive Producer, Head of Video, Video Partnerships Manager, Head of Newsletter Partnerships" },
  { category: "Communications / PR",  color: "bg-pink-100 text-pink-700",     positions: "Head of Communications, PR Director, VP of Public Relations" },
  { category: "Talent / Management",  color: "bg-emerald-100 text-emerald-700", positions: "CEO/Founder (smaller outlets), General Manager, Talent Manager, Agent, Publicist, Talent Rep, Talent Agency" },
  { category: "Commercial / Licensing", color: "bg-amber-100 text-amber-700", positions: "Commercial Director, VP of Commercial Partnerships, Head of Licensing, Affiliate Partnerships, Syndication, Licensing, Co-Marketing Contact" },
  { category: "Client Services",      color: "bg-slate-100 text-slate-700",   positions: "Client Services Director, Director of Client Relations" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === "live")
    return <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Live</Badge>;
  if (status === "beta")
    return <Badge className="bg-amber-100 text-amber-700 text-[10px]">Beta</Badge>;
  return <Badge className="bg-slate-100 text-slate-500 text-[10px]">Coming Soon</Badge>;
}

// Simulates connected state per platform (stored in localStorage)
function useConnectedPlatforms() {
  const [connected, setConnected] = useState(() => {
    try { return JSON.parse(localStorage.getItem("piq_connected") || "{}"); } catch { return {}; }
  });

  const toggle = (name) => {
    setConnected(prev => {
      const next = { ...prev, [name]: !prev[name] };
      localStorage.setItem("piq_connected", JSON.stringify(next));
      return next;
    });
  };

  const setConnectedFor = (name) => {
    setConnected(prev => {
      const next = { ...prev, [name]: true };
      localStorage.setItem("piq_connected", JSON.stringify(next));
      return next;
    });
  };

  return [connected, toggle, setConnectedFor];
}

function ConnectButton({ name, status, connected, onToggle, onOpenModal }) {
  if (status === "coming_soon") {
    return <Button size="sm" variant="outline" disabled className="text-[11px] h-7 opacity-50">Coming Soon</Button>;
  }
  if (connected) {
    return (
      <Button size="sm" variant="outline" onClick={() => onOpenModal && onOpenModal()}
        className="text-[11px] h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Connected
      </Button>
    );
  }
  return (
    <Button size="sm" onClick={() => onOpenModal && onOpenModal()}
      className="text-[11px] h-7 bg-indigo-600 hover:bg-indigo-700 gap-1">
      <Link2 className="w-3 h-3" /> Connect
    </Button>
  );
}

function CollapsibleSection({ title, icon: Icon, color, count, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-400">{count} integrations</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Integrations() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [connected, toggleConnected] = useConnectedPlatforms();
  const [modalIntegration, setModalIntegration] = useState(null);
  const q = search.toLowerCase();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const openModal = (integration) => setModalIntegration(integration);
  const closeModal = () => setModalIntegration(null);
  const handleConnect = (name) => toggleConnected(name);

  const isAdmin = user?.role === "admin";

  const filterName = arr => q
    ? arr.filter(i => (i.name || i.category || "").toLowerCase().includes(q) || (i.data || i.platforms || "").toLowerCase().includes(q))
    : arr;

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations</h1>
          <p className="text-sm text-slate-500 mt-1">Connect your accounts to unlock the full power of PartnerIQ</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold text-emerald-700">{connectedCount}</p>
            <p className="text-[10px] text-emerald-500 uppercase tracking-wider">Connected</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold text-slate-700">{SOCIAL_PLATFORMS.length + INFLUENCER_PLATFORMS.length + ANALYTICS_PLATFORMS.length + BUSINESS_TOOLS.length + CRM_INTEGRATIONS.length + MARKETING_AUTOMATION.length + COMMUNICATION_TOOLS.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-9" placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* 31.1 Social Platforms */}
      <CollapsibleSection title="Social Platforms" icon={Users} color="bg-indigo-50 text-indigo-600" count={SOCIAL_PLATFORMS.length}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Platform</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 hidden md:table-cell">Method</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 hidden lg:table-cell">Data Available</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Status</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filterName(SOCIAL_PLATFORMS).map((p, i) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                   <td className="py-2.5 pr-4 font-semibold text-slate-800">{p.name}</td>
                   <td className="py-2.5 pr-4 text-slate-500 text-xs hidden md:table-cell">{p.method}</td>
                   <td className="py-2.5 pr-4 text-slate-400 text-xs hidden lg:table-cell max-w-xs truncate">{p.data}</td>
                   <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                   <td className="py-2.5">
                     <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal({ ...p, type: p.method })} />
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* 31.2 Influencer Marketing Platforms */}
      <CollapsibleSection title="Influencer Marketing Platforms" icon={Zap} color="bg-purple-50 text-purple-600" count={INFLUENCER_PLATFORMS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(INFLUENCER_PLATFORMS).map((p, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.data}</p>
                <div className="mt-2">
                  <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal({ ...p, type: "API Key" })} />
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 31.3 Analytics & Intelligence */}
      <CollapsibleSection title="Analytics & Intelligence" icon={BarChart3} color="bg-teal-50 text-teal-600" count={ANALYTICS_PLATFORMS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(ANALYTICS_PLATFORMS).map((p, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.data}</p>
                <div className="mt-2">
                  <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal({ ...p, type: "API Key" })} />
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 31.4 Business Tools */}
      <CollapsibleSection title="Business Tools" icon={Briefcase} color="bg-amber-50 text-amber-600" count={BUSINESS_TOOLS.length}>
        <div className="space-y-3">
          {filterName(BUSINESS_TOOLS).map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{t.category}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.platforms}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{t.type}</Badge>
                <StatusBadge status={t.status} />
                <ConnectButton name={t.category} status={t.status} connected={!!connected[t.category]} onToggle={toggleConnected} onOpenModal={() => openModal({ name: t.category, description: `Connect ${t.category} tools: ${t.platforms}`, type: t.type })} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* CRM Integrations */}
      <CollapsibleSection title="CRM Integrations" icon={Database} color="bg-blue-50 text-blue-600" count={CRM_INTEGRATIONS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(CRM_INTEGRATIONS).map((p, i) => (
            <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${p.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-[11px]">{p.logo}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <Badge variant="outline" className="text-[9px] mt-0.5">{p.type}</Badge>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.features.map((f, j) => (
                  <span key={j} className="text-[10px] bg-white border border-slate-200 text-slate-500 rounded-full px-2 py-0.5">{f}</span>
                ))}
              </div>
              <div className="pt-1">
                <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal(p)} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Marketing Automation */}
      <CollapsibleSection title="Marketing Automation" icon={Mail} color="bg-orange-50 text-orange-600" count={MARKETING_AUTOMATION.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(MARKETING_AUTOMATION).map((p, i) => (
            <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${p.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-[11px]">{p.logo}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <Badge variant="outline" className="text-[9px] mt-0.5">{p.type}</Badge>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.features.map((f, j) => (
                  <span key={j} className="text-[10px] bg-white border border-slate-200 text-slate-500 rounded-full px-2 py-0.5">{f}</span>
                ))}
              </div>
              <div className="pt-1">
                <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal(p)} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Communication Tools */}
      <CollapsibleSection title="Communication Tools" icon={MessageSquare} color="bg-violet-50 text-violet-600" count={COMMUNICATION_TOOLS.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filterName(COMMUNICATION_TOOLS).map((p, i) => (
            <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${p.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-[11px]">{p.logo}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <Badge variant="outline" className="text-[9px] mt-0.5">{p.type}</Badge>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.features.map((f, j) => (
                  <span key={j} className="text-[10px] bg-white border border-slate-200 text-slate-500 rounded-full px-2 py-0.5">{f}</span>
                ))}
              </div>
              <div className="pt-1">
                <ConnectButton name={p.name} status={p.status} connected={!!connected[p.name]} onToggle={toggleConnected} onOpenModal={() => openModal(p)} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 31.5 GrowMeOrganic — ADMIN ONLY */}
      {isAdmin ? (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 overflow-hidden">
          <div className="p-5 border-b border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-800">B2B Contact Intelligence</h2>
                  <Badge className="bg-indigo-600 text-white text-[10px]">GrowMeOrganic</Badge>
                  <Badge className="bg-red-100 text-red-700 text-[10px] gap-1"><Lock className="w-2.5 h-2.5" />Admin Only</Badge>
                  <StatusBadge status="live" />
                </div>
                <p className="text-sm text-slate-600 mt-1">Verified B2B contact data from LinkedIn and Google Maps — enables PartnerIQ to identify and reach exact decision-makers for partnership services.</p>
              </div>
            </div>

            {/* API Config */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Base URL",   value: "api.growmeorganic.com/v1" },
                { label: "Auth",       value: "X-API-Key (Header)" },
                { label: "Rate Limit", value: "Unlimited (subscription)" },
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
                  { method: "POST", path: "/linkedin/search",  desc: "Search LinkedIn profiles by filters (title, company, location)" },
                  { method: "POST", path: "/linkedin/enrich",  desc: "Get verified email/phone for LinkedIn profile URL" },
                  { method: "POST", path: "/gmaps/search",     desc: "Extract business contacts from Google Maps results" },
                  { method: "POST", path: "/email/verify",     desc: "Validate email deliverability before outreach" },
                  { method: "POST", path: "/campaigns/create", desc: "Create automated email sequence with follow-ups" },
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
            <div className="mt-4 flex items-start gap-3 bg-white/80 rounded-xl border border-indigo-100 p-4">
              <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Match Agent Integration</p>
                <p className="text-xs text-slate-500 mt-0.5">When Match Agent identifies a high-fit brand partnership, GrowMeOrganic automatically enriches contact data to find the right decision-maker with verified contact info, enabling immediate personalized outreach through the Outreach Agent.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
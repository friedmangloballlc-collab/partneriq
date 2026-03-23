import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useIsMobile";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AnimatedWalkthrough from "./AnimatedWalkthrough";

// ─── PRICING DATA ────────────────────────────────────────────────────────────

const PRICING = {
  talent: [
    {
      title: "Free",
      price: "$0",
      period: "forever",
      badge: null,
      popular: false,
      features: [
        "Basic profile & brand search",
        "Browse marketplace (view only)",
        "1 active partnership",
        "Connect up to 2 social accounts",
        "Basic earnings summary",
        "Master Calendar access"
      ],
      cta: "Get Started Free",
    },
    {
      title: "Rising",
      price: "$99",
      period: "/ month",
      badge: null,
      popular: false,
      features: [
        "Everything in Free, plus:",
        "AI Match Engine (top 5 matches)",
        "15 outreach messages/month",
        "5 active partnerships",
        "Connect up to 5 social accounts",
        "Basic performance analytics",
        "Apply to brand campaigns"
      ],
      cta: "Start Rising",
    },
    {
      title: "Pro",
      price: "$249",
      period: "/ month",
      badge: "Most Popular",
      popular: true,
      features: [
        "Everything in Rising, plus:",
        "Full AI Match Engine (10-factor scoring)",
        "Unlimited outreach & sequences",
        "20 active partnerships",
        "Contact Finder & Warm Intros",
        "AI Pitch Deck Generation",
        "Market Intelligence & Data Room",
        "AI Command Center (32 agents)"
      ],
      cta: "Start Pro",
    },
    {
      title: "Elite",
      price: "$499",
      period: "/ month",
      badge: null,
      popular: false,
      features: [
        "Everything in Pro, plus:",
        "AI auto-matching with brands",
        "Unlimited partnerships",
        "Priority placement in searches",
        "Unlimited team seats & integrations",
        "Dedicated account manager",
        "Custom analytics & priority support"
      ],
      cta: "Start Elite",
    },
  ],
  brand: [
    {
      title: "Free",
      price: "$0",
      period: "forever",
      badge: null,
      popular: false,
      features: [
        "Browse talent directory (limited)",
        "Post 1 campaign brief/month",
        "1 active partnership",
        "Basic campaign analytics",
        "Master Calendar access"
      ],
      cta: "Get Started Free",
    },
    {
      title: "Growth",
      price: "$499",
      period: "/ month",
      badge: null,
      popular: false,
      features: [
        "Everything in Free, plus:",
        "Full talent search & filters",
        "AI Match Engine (top 10 matches)",
        "50 outreach messages/month",
        "Contact Finder (50 lookups/mo)",
        "15 active partnerships",
        "Full campaign analytics"
      ],
      cta: "Start Growth",
    },
    {
      title: "Scale",
      price: "$1,299",
      period: "/ month",
      badge: "Most Popular",
      popular: true,
      features: [
        "Everything in Growth, plus:",
        "Full AI Match Engine (10-factor)",
        "Unlimited outreach & sequences",
        "100 active partnerships",
        "Contact Finder (unlimited)",
        "AI Pitch Deck & Data Room",
        "Market Intelligence & ROI Simulator",
        "AI Command Center (32 agents)",
        "Team collaboration (10 seats)"
      ],
      cta: "Start Scale",
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "starting at $2,500/mo",
      badge: null,
      popular: false,
      features: [
        "Everything in Scale, plus:",
        "AI auto-matching talent",
        "Unlimited partnerships & seats",
        "All integrations (Salesforce, HubSpot)",
        "White-label options",
        "Dedicated success manager & SLA"
      ],
      cta: "Contact Sales",
    },
  ],
  agency: [
    {
      title: "Starter",
      price: "$2,499",
      period: "/ month",
      badge: null,
      popular: false,
      features: [
        "Manage up to 5 brands or 10 talent",
        "Full AI features & outreach",
        "AI Pitch Deck Generation",
        "Multi-step approval workflows",
        "Team collaboration (10 seats)",
        "Agency-level reporting"
      ],
      cta: "Start Starter",
    },
    {
      title: "Pro",
      price: "$4,999",
      period: "/ month",
      badge: "Most Popular",
      popular: true,
      features: [
        "Manage up to 10 brands or 20 talent",
        "AI auto-matching across roster",
        "Unlimited team seats",
        "Custom pitch deck templates",
        "Cross-client analytics",
        "Bulk outreach coordination"
      ],
      cta: "Start Pro",
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "starting at $9,999/mo",
      badge: null,
      popular: false,
      features: [
        "Up to 25 brands or 25 talent profiles",
        "White-label platform & custom domain",
        "Full API access",
        "SSO & advanced security",
        "Custom BI dashboards",
        "Dedicated success team & SLA"
      ],
      cta: "Contact Sales",
    },
  ],
};

const FAQ_ITEMS = [
  { q: "What types of talent can join Dealstage?", a: "Dealstage supports every talent category — athletes, creators, musicians, speakers, models, chefs, actors, podcasters, designers, gamers, coaches, and consultants. If you have an audience or expertise, there's a brand looking for you." },
  { q: "How does the deal pipeline work?", a: "Once a brand sends you a deal proposal, it appears in your pipeline. You can review the terms, negotiate, sign contracts with built-in e-signatures, and track payment — all within the platform without switching tools." },
  { q: "Is Dealstage free to start?", a: "Yes. Talent, brands, and agencies can all start on a free plan with no credit card required. You can upgrade anytime as your deal volume grows." },
  { q: "How does Dealstage verify talent stats?", a: "We pull live data directly from connected platforms — Instagram, TikTok, YouTube, Spotify, and more. Brands see verified, real-time follower counts and engagement rates, not self-reported numbers." },
  { q: "Can agencies manage multiple talent and brands at once?", a: "Absolutely. Agency plans are built for roster management — you can represent dozens of talent profiles, run multi-brand deal pipelines, and collaborate with your whole team from a single dashboard." },
  { q: "Is my data safe on Dealstage?", a: "We're SOC 2 Type II compliant, use 256-bit AES encryption for all data at rest and in transit, process payments through Stripe, and are fully GDPR compliant. Your data is never sold or shared with third parties." },
];

const FEATURES = [
  {
    label: "01 / Media kits",
    title: "Pitch your talent",
    titleEm: "beautifully",
    body: "Auto-generated media kits that pull live stats from connected platforms. Always up to date. No more outdated PDFs sent via email.",
    bullets: ["Live follower counts, engagement rates, and audience data", "Custom rate cards and availability calendar", "Share with a link or export to PDF in one click"],
    mockup: "mediakits",
    reverse: false,
  },
  {
    label: "02 / Marketplace",
    title: "Browse and hire",
    titleEm: "any talent type",
    body: "Search across athletes, creators, musicians, speakers, and more. Filter by category, audience size, rate, and availability. Find your match fast.",
    bullets: ["12+ talent categories from athletes to consultants", "Verified stats pulled directly from social platforms", "Send a deal request directly from the profile"],
    mockup: "marketplace",
    reverse: true,
  },
  {
    label: "03 / Deal pipeline",
    title: "Manage every deal",
    titleEm: "in one place",
    body: "From first contact to signed contract, your entire deal flow lives in Dealstage. Track stages, deadlines, tasks, and revenue in real time.",
    bullets: ["Visual Kanban pipeline with drag-and-drop stages", "Built-in contract builder and e-signatures", "Revenue forecasting and close rate tracking"],
    mockup: "pipeline",
    reverse: false,
  },
  {
    label: "04 / Payments",
    title: "Get paid faster,",
    titleEm: "every time",
    body: "Invoicing, payment tracking, and commission splits built directly into deals. Brands pay through Stripe. Talent receives funds securely.",
    bullets: ["Auto-generated invoices tied to deal milestones", "Commission splits for agency rosters", "Full earnings history and payout reporting"],
    mockup: "payments",
    reverse: true,
  },
  {
    label: "05 / Analytics",
    title: "Performance you can",
    titleEm: "actually act on",
    body: "Track campaign performance, deal close rates, revenue trends, and talent growth metrics — all in one analytics dashboard.",
    bullets: ["Deal close rate and pipeline velocity metrics", "Campaign ROI and brand performance tracking", "Talent growth trajectory forecasting"],
    mockup: "analytics",
    reverse: false,
  },
  {
    label: "06 / AI matching",
    title: "The right brand, found",
    titleEm: "automatically",
    body: "Our AI engine scores compatibility between talent and brands across 10 factors — audience fit, deal history, category alignment, and more.",
    bullets: ["94% match accuracy across 10 weighted scoring factors", "Auto-suggestions based on pipeline and goals", "Warm intro paths via relationship graph"],
    mockup: "ai",
    reverse: true,
  },
];

const HOW_IT_WORKS = {
  brand: [
    { step: "01", title: "Post a campaign brief", desc: "Describe your campaign goals, budget, talent type, and timeline. Our AI instantly surfaces the best-fit profiles from 12k+ verified talent." },
    { step: "02", title: "Review and reach out", desc: "Browse matched talent, view live media kits with verified stats, and send deal proposals directly from their profile — no cold emails." },
    { step: "03", title: "Close and track", desc: "Negotiate terms, sign contracts, and track campaign performance all in one place. Payments flow through Stripe with full reporting." },
  ],
  talent: [
    { step: "01", title: "Build your profile", desc: "Connect your social accounts for verified live stats. Your auto-generated media kit updates in real time — always ready to send to brands." },
    { step: "02", title: "Get discovered", desc: "Brands search for talent like you. When there's a match, you receive deal proposals directly in your pipeline inbox. No cold pitching required." },
    { step: "03", title: "Close deals and get paid", desc: "Review terms, sign contracts with built-in e-signatures, and receive payment securely through Stripe — on time, every time." },
  ],
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LandingPage({ onGetStarted, onSelectRole }) {
  const [pricingRole, setPricingRole] = useState("talent");
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [howItWorksRole, setHowItWorksRole] = useState("brand");
  const [openFaq, setOpenFaq] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef(null);
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  // Scroll-based nav shadow
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Intersection observer for fade-in sections
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("ds-visible")),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".ds-fade").forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  const handleGetStarted = () => onGetStarted && onGetStarted();
  const handleSelectRole = (role, plan) => onSelectRole && onSelectRole(role, plan);

  return (
    <>
      {/* ── GOOGLE FONTS + GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap');

        :root {
          --ds-bg: #1c1b19;
          --ds-bg2: #232220;
          --ds-bg3: #2a2826;
          --ds-bg4: #1d1d19;
          --ds-bg5: #242420;
          --ds-border: rgba(255,248,220,0.07);
          --ds-border2: rgba(255,248,220,0.13);
          --ds-border3: rgba(255,248,220,0.22);
          --ds-cream: #f5f0e6;
          --ds-cream2: rgba(245,240,230,0.56);
          --ds-cream3: rgba(245,240,230,0.28);
          --ds-cream4: rgba(245,240,230,0.14);
          --ds-gold: #d4b04e;
          --ds-gold2: #d9b96a;
          --ds-gold-dim: rgba(212,176,78,0.11);
          --ds-gold-dim2: rgba(212,176,78,0.18);
          --ds-amber: #e07b18;
          --ds-amber2: #f09040;
          --ds-amber-dim: rgba(224,123,24,0.12);
          --ds-amber-dim2: rgba(224,123,24,0.2);
          --ds-ga: linear-gradient(135deg, #d4b04e 0%, #e07b18 100%);
          --ds-ga-text: linear-gradient(90deg, #d9b96a 0%, #f09040 100%);
          --ds-serif: 'Cormorant Garamond', Georgia, serif;
          --ds-sans: 'Instrument Sans', system-ui, sans-serif;
          --ds-mono: 'Instrument Mono', monospace;
        }

        .ds-wrap * { box-sizing: border-box; }
        .ds-wrap {
          background: var(--ds-bg);
          color: var(--ds-cream);
          font-family: var(--ds-sans);
          font-weight: 300;
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .ds-gt {
          background: var(--ds-ga-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* NAV */
        .ds-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 56px;
          border-bottom: 0.5px solid var(--ds-border);
          backdrop-filter: blur(24px);
          background: rgba(8,8,7,0.92);
          transition: box-shadow 0.3s;
        }
        .ds-nav.scrolled { box-shadow: 0 1px 24px rgba(0,0,0,0.4); }
        .ds-nav-logo {
          font-family: var(--ds-serif); font-size: 1.4rem; font-weight: 700;
          color: var(--ds-cream); text-decoration: none; letter-spacing: -0.01em; flex-shrink: 0;
        }
        .ds-nav-logo span { background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-nav-links { display: flex; align-items: center; gap: 0; list-style: none; height: 100%; margin: 0; padding: 0; }
        .ds-nav-link {
          font-size: 0.82rem; color: var(--ds-cream3); text-decoration: none;
          letter-spacing: 0.01em; transition: color 0.2s; padding: 0 0.9rem;
          height: 56px; display: flex; align-items: center; white-space: nowrap;
          background: none; border: none; cursor: pointer; font-family: var(--ds-sans);
        }
        .ds-nav-link:hover { color: var(--ds-cream); }
        .ds-nav-link svg { opacity: 0.5; transition: transform 0.2s; }
        .ds-nav-item { position: relative; height: 100%; display: flex; align-items: center; }
        .ds-nav-item:hover .ds-nav-link svg { transform: rotate(180deg); opacity: 1; }
        .ds-dropdown { position: absolute; top: 100%; left: 0; background: var(--ds-bg2); border: 0.5px solid rgba(255,248,220,0.13); border-radius: 10px; padding: 0.75rem; min-width: 240px; opacity: 0; pointer-events: none; transform: translateY(6px); transition: all 0.18s; z-index: 300; }
        .ds-nav-item:hover .ds-dropdown { opacity: 1; pointer-events: all; transform: translateY(0); }
        .ds-drop-item { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.65rem 0.75rem; border-radius: 6px; text-decoration: none; transition: background 0.15s; cursor: pointer; color: inherit; }
        .ds-drop-item:hover { background: rgba(255,248,220,0.04); }
        .ds-drop-icon { width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, var(--ds-gold), var(--ds-amber)); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; margin-top: 1px; }
        .ds-drop-title { font-size: 0.82rem; font-weight: 500; color: var(--ds-cream); margin-bottom: 0.1rem; }
        .ds-drop-desc { font-size: 0.7rem; color: rgba(245,240,230,0.4); line-height: 1.4; }
        .ds-nav-badge { font-size: 0.58rem; background: linear-gradient(135deg, var(--ds-gold), var(--ds-amber)); color: #1c1b19; border-radius: 3px; padding: 0.1rem 0.35rem; font-weight: 500; margin-left: 0.5rem; }
        .ds-btn-demo { font-size: 0.82rem; font-weight: 400; color: var(--ds-cream); border: 0.5px solid rgba(255,248,220,0.13); border-radius: 5px; padding: 0.45rem 1rem; background: none; cursor: pointer; text-decoration: none; transition: border-color 0.2s, background 0.2s; white-space: nowrap; font-family: var(--ds-sans); }
        .ds-btn-demo:hover { border-color: rgba(255,248,220,0.22); background: rgba(245,240,230,0.04); }
        .ds-nav-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .ds-btn-ghost {
          font-family: var(--ds-sans); font-size: 0.82rem; color: var(--ds-cream3);
          background: none; border: none; cursor: pointer; text-decoration: none;
          transition: color 0.2s; white-space: nowrap;
        }
        .ds-btn-ghost:hover { color: var(--ds-cream); }
        .ds-btn-trial {
          font-family: var(--ds-sans); font-size: 0.82rem; font-weight: 500;
          color: #1c1b19; border: none; border-radius: 5px; padding: 0.45rem 1.1rem;
          background: var(--ds-ga); cursor: pointer; text-decoration: none;
          transition: opacity 0.2s, transform 0.15s; white-space: nowrap;
        }
        .ds-btn-trial:hover { opacity: 0.88; transform: translateY(-1px); }

        /* HERO */
        .ds-hero {
          padding: 56px 0 0; min-height: 100vh; display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .ds-hero-glow-l {
          position: absolute; top: 5%; left: -15%; width: 700px; height: 600px;
          background: radial-gradient(ellipse, rgba(212,176,78,0.055) 0%, transparent 65%);
          pointer-events: none;
        }
        .ds-hero-glow-r {
          position: absolute; top: 10%; right: -15%; width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(224,123,24,0.045) 0%, transparent 65%);
          pointer-events: none;
        }
        .ds-hero-top {
          padding: 4rem 3rem 3rem; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .ds-hero-badge {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: var(--ds-mono); font-size: 0.65rem; letter-spacing: 0.1em;
          text-transform: uppercase; border-radius: 100px; padding: 0.3rem 0.9rem;
          margin-bottom: 2rem;
          background: linear-gradient(var(--ds-bg2), var(--ds-bg2)) padding-box, var(--ds-ga) border-box;
          border: 0.5px solid transparent; color: var(--ds-gold2);
          animation: dsf 0.5s ease forwards 0.1s; opacity: 0;
        }
        .ds-badge-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--ds-amber);
          animation: dspulse 2s infinite;
        }
        @keyframes dspulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes dsf { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .ds-hero-headline {
          font-family: var(--ds-serif); font-size: clamp(3rem,6.5vw,6rem); font-weight: 700;
          line-height: 0.97; letter-spacing: -0.02em; color: var(--ds-cream);
          max-width: 820px; margin-bottom: 1.5rem;
          animation: dsf 0.6s ease forwards 0.25s; opacity: 0;
        }
        .ds-hero-headline em { font-style: italic; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-hero-sub {
          font-size: 1rem; font-weight: 300; color: var(--ds-cream2); max-width: 480px;
          line-height: 1.75; margin-bottom: 2rem;
          animation: dsf 0.6s ease forwards 0.4s; opacity: 0;
        }
        .ds-hero-btns {
          display: flex; align-items: center; gap: 0.85rem; margin-bottom: 2.5rem;
          animation: dsf 0.6s ease forwards 0.55s; opacity: 0;
        }
        .ds-btn-hero-primary {
          font-family: var(--ds-sans); font-size: 0.9rem; font-weight: 500; color: #1c1b19;
          border: none; border-radius: 7px; padding: 0.85rem 2rem; background: var(--ds-ga);
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .ds-btn-hero-primary:hover { opacity: 0.88; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(224,123,24,0.2); }
        .ds-btn-hero-secondary {
          font-family: var(--ds-sans); font-size: 0.9rem; font-weight: 400; color: var(--ds-cream2);
          background: none; border: 0.5px solid var(--ds-border2); border-radius: 7px;
          padding: 0.85rem 2rem; cursor: pointer; text-decoration: none; display: inline-block;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ds-btn-hero-secondary:hover { border-color: var(--ds-border3); color: var(--ds-cream); background: rgba(245,240,230,0.03); }
        .ds-hero-note {
          font-family: var(--ds-mono); font-size: 0.65rem; color: var(--ds-cream3);
          letter-spacing: 0.06em; animation: dsf 0.6s ease forwards 0.65s; opacity: 0;
        }

        /* HERO UI MOCKUP */
        .ds-hero-ui {
          margin: 0 3rem; border: 0.5px solid var(--ds-border2); border-bottom: none;
          border-radius: 14px 14px 0 0; background: var(--ds-bg2); overflow: hidden; flex: 1;
          animation: dsf 0.8s ease forwards 0.5s; opacity: 0; min-height: 400px;
        }
        .ds-ui-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 1.5rem; border-bottom: 0.5px solid var(--ds-border);
          background: var(--ds-bg3);
        }
        .ds-ui-dots { display: flex; gap: 5px; }
        .ds-ui-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ds-border2); }
        .ds-ui-tabs { display: flex; gap: 0.25rem; }
        .ds-ui-tab {
          font-family: var(--ds-mono); font-size: 0.65rem; letter-spacing: 0.04em;
          color: var(--ds-cream3); padding: 0.3rem 0.7rem; border-radius: 4px;
          cursor: pointer; border: none; background: none; transition: background 0.15s, color 0.15s;
        }
        .ds-ui-tab.active { background: var(--ds-ga); color: #1c1b19; font-weight: 500; }
        .ds-ui-body { display: grid; grid-template-columns: 200px 1fr 260px; height: 360px; }
        .ds-ui-sidebar { border-right: 0.5px solid var(--ds-border); padding: 1rem 0; display: flex; flex-direction: column; gap: 0.1rem; }
        .ds-ui-nav-item {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 1rem;
          font-size: 0.72rem; color: var(--ds-cream3); cursor: pointer;
          transition: background 0.15s, color 0.15s; font-family: var(--ds-mono);
        }
        .ds-ui-nav-item.active { background: var(--ds-gold-dim2); color: var(--ds-gold2); border-left: 2px solid var(--ds-gold); }
        .ds-ui-main { padding: 1.5rem; overflow: hidden; }
        .ds-ui-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .ds-ui-title { font-family: var(--ds-serif); font-size: 1.1rem; font-weight: 500; color: var(--ds-cream); }
        .ds-ui-add-btn {
          font-family: var(--ds-mono); font-size: 0.62rem; background: var(--ds-ga); color: #1c1b19;
          border: none; border-radius: 4px; padding: 0.3rem 0.7rem; cursor: pointer; letter-spacing: 0.04em;
        }
        .ds-ui-stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
        .ds-ui-stat { background: var(--ds-bg3); border: 0.5px solid var(--ds-border); border-radius: 7px; padding: 0.75rem; }
        .ds-ui-stat-val { font-family: var(--ds-mono); font-size: 1rem; font-weight: 500; margin-bottom: 0.15rem; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-ui-stat-lbl { font-size: 0.62rem; color: var(--ds-cream3); font-family: var(--ds-mono); letter-spacing: 0.04em; }
        .ds-ui-deal-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.65rem 0.75rem; background: var(--ds-bg3); border: 0.5px solid var(--ds-border);
          border-radius: 7px; margin-bottom: 0.5rem;
        }
        .ds-ui-deal-left { display: flex; align-items: center; gap: 0.6rem; }
        .ds-ui-avatar {
          width: 28px; height: 28px; border-radius: 6px; background: var(--ds-ga);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.55rem; font-weight: 500; font-family: var(--ds-mono); color: #1c1b19; flex-shrink: 0;
        }
        .ds-ui-deal-name { font-size: 0.75rem; font-weight: 500; color: var(--ds-cream); }
        .ds-ui-deal-brand { font-size: 0.62rem; color: var(--ds-cream3); font-family: var(--ds-mono); }
        .ds-ui-deal-right { text-align: right; }
        .ds-ui-deal-amt { font-family: var(--ds-mono); font-size: 0.78rem; color: var(--ds-cream); margin-bottom: 0.15rem; }
        .ds-ui-pill { font-size: 0.55rem; font-family: var(--ds-mono); letter-spacing: 0.05em; padding: 0.1rem 0.45rem; border-radius: 100px; text-transform: uppercase; }
        .ds-pill-active { background: var(--ds-amber-dim2); color: var(--ds-amber2); border: 0.5px solid rgba(224,123,24,0.25); }
        .ds-pill-review { background: var(--ds-gold-dim); color: var(--ds-gold2); border: 0.5px solid rgba(212,176,78,0.2); }
        .ds-pill-new { background: rgba(245,240,230,0.06); color: var(--ds-cream3); border: 0.5px solid var(--ds-border2); }
        .ds-ui-right { border-left: 0.5px solid var(--ds-border); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .ds-ui-revenue-card { background: var(--ds-bg3); border: 0.5px solid var(--ds-border); border-radius: 8px; padding: 1rem; }
        .ds-ui-rev-label { font-family: var(--ds-mono); font-size: 0.62rem; color: var(--ds-cream3); letter-spacing: 0.06em; margin-bottom: 0.4rem; }
        .ds-ui-rev-val { font-family: var(--ds-serif); font-size: 1.6rem; font-weight: 700; line-height: 1; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-ui-rev-sub { font-family: var(--ds-mono); font-size: 0.6rem; color: var(--ds-cream3); margin-top: 0.3rem; }
        .ds-ui-task-lbl { font-family: var(--ds-mono); font-size: 0.62rem; color: var(--ds-cream3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.25rem; }
        .ds-ui-task-item { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 0.5px solid var(--ds-border); }
        .ds-ui-task-item:last-child { border-bottom: none; }
        .ds-ui-check { width: 14px; height: 14px; border-radius: 3px; border: 0.5px solid var(--ds-border2); flex-shrink: 0; margin-top: 1px; }
        .ds-ui-task-text { font-size: 0.68rem; color: var(--ds-cream2); line-height: 1.35; }
        .ds-ui-task-brand { font-size: 0.6rem; color: var(--ds-cream3); font-family: var(--ds-mono); }

        /* TRUST BAR */
        .ds-trust-bar {
          border-top: 0.5px solid var(--ds-border); border-bottom: 0.5px solid var(--ds-border);
          padding: 1.5rem 3rem; display: flex; align-items: center; gap: 3rem;
          background: var(--ds-bg2); overflow: hidden;
        }
        .ds-trust-label { font-family: var(--ds-mono); font-size: 0.65rem; color: var(--ds-cream3); letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .ds-trust-logos { display: flex; align-items: center; gap: 2.5rem; flex: 1; flex-wrap: wrap; }
        .ds-trust-logo { font-family: var(--ds-serif); font-size: 0.95rem; font-weight: 500; color: var(--ds-cream4); letter-spacing: -0.01em; white-space: nowrap; transition: color 0.2s; }
        .ds-trust-logo:hover { color: var(--ds-cream2); }

        /* STATS */
        .ds-stats { display: grid; grid-template-columns: repeat(4,1fr); border-bottom: 0.5px solid var(--ds-border); }
        .ds-stat-cell { padding: 2.5rem; text-align: center; border-right: 0.5px solid var(--ds-border); }
        .ds-stat-cell:last-child { border-right: none; }
        .ds-stat-num { font-family: var(--ds-serif); font-size: 2.75rem; font-weight: 700; color: var(--ds-cream); letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.4rem; }
        .ds-stat-num span { background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-stat-lbl { font-size: 0.72rem; color: var(--ds-cream3); letter-spacing: 0.07em; text-transform: uppercase; font-family: var(--ds-mono); }

        /* TICKER */
        .ds-ticker-wrap { overflow: hidden; border-bottom: 0.5px solid var(--ds-border); padding: 0.85rem 0; background: var(--ds-bg2); }
        .ds-ticker { display: flex; gap: 3rem; animation: dsticker 32s linear infinite; white-space: nowrap; }
        .ds-ticker-item { font-family: var(--ds-mono); font-size: 0.65rem; letter-spacing: 0.09em; color: var(--ds-cream3); text-transform: uppercase; display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }
        .ds-ticker-sep { background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 0.4rem; }
        @keyframes dsticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* SECTION UTILS */
        .ds-section { padding: 7rem 3rem; max-width: 1280px; margin: 0 auto; }
        .ds-full-bleed { border-top: 0.5px solid var(--ds-border); border-bottom: 0.5px solid var(--ds-border); background: var(--ds-bg2); padding: 6rem 3rem; }
        .ds-section-tag { font-family: var(--ds-mono); font-size: 0.65rem; letter-spacing: 0.12em; color: var(--ds-gold2); text-transform: uppercase; margin-bottom: 1.25rem; display: block; }
        .ds-section-title { font-family: var(--ds-serif); font-size: clamp(2rem,4vw,3.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.025em; color: var(--ds-cream); margin-bottom: 1.1rem; }
        .ds-section-title em { font-style: italic; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-section-body { font-size: 0.95rem; color: var(--ds-cream2); max-width: 500px; line-height: 1.8; }

        /* FEATURE ROWS */
        .ds-feature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; margin-bottom: 6rem; }
        .ds-feature-row:last-child { margin-bottom: 0; }
        .ds-feature-row.reverse { direction: rtl; }
        .ds-feature-row.reverse > * { direction: ltr; }
        .ds-feature-label { font-family: var(--ds-mono); font-size: 0.62rem; letter-spacing: 0.12em; color: var(--ds-amber2); text-transform: uppercase; margin-bottom: 1rem; display: block; }
        .ds-feature-title { font-family: var(--ds-serif); font-size: 2.25rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: var(--ds-cream); margin-bottom: 1rem; }
        .ds-feature-title em { font-style: italic; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-feature-body { font-size: 0.9rem; color: var(--ds-cream2); line-height: 1.8; margin-bottom: 1.5rem; }
        .ds-feature-bullets { display: flex; flex-direction: column; gap: 0.6rem; }
        .ds-feature-bullet { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.85rem; color: var(--ds-cream2); }
        .ds-bullet-dot { width: 16px; height: 16px; border-radius: 4px; background: var(--ds-ga); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; font-size: 0.55rem; color: #1c1b19; }
        .ds-feature-panel { background: var(--ds-bg2); border: 0.5px solid var(--ds-border2); border-radius: 12px; padding: 1.5rem; overflow: hidden; min-height: 280px; display: flex; flex-direction: column; gap: 0.75rem; }

        /* HOW IT WORKS */
        .ds-tab-row { display: flex; gap: 0; border: 0.5px solid var(--ds-border2); border-radius: 8px; overflow: hidden; width: fit-content; margin-bottom: 3rem; }
        .ds-tab-btn {
          font-family: var(--ds-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.6rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--ds-cream3);
          transition: background 0.15s, color 0.15s;
        }
        .ds-tab-btn.active { background: var(--ds-ga); color: #1c1b19; font-weight: 500; }
        .ds-hiw-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; }
        .ds-hiw-step { background: var(--ds-bg3); border: 0.5px solid var(--ds-border); border-radius: 12px; padding: 2rem; }
        .ds-hiw-num { font-family: var(--ds-serif); font-size: 3rem; font-weight: 700; line-height: 1; margin-bottom: 1rem; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-hiw-title { font-family: var(--ds-serif); font-size: 1.25rem; font-weight: 700; color: var(--ds-cream); margin-bottom: 0.75rem; letter-spacing: -0.01em; }
        .ds-hiw-desc { font-size: 0.88rem; color: var(--ds-cream2); line-height: 1.75; }

        /* PRICING */
        .ds-pricing-grid { display: grid; gap: 1.25rem; }
        .ds-pricing-grid-cols[data-cols="1"] { grid-template-columns: 1fr; }
        .ds-pricing-grid-cols[data-cols="2"] { grid-template-columns: repeat(2, 1fr); }
        .ds-pricing-grid-cols[data-cols="3"] { grid-template-columns: repeat(3, 1fr); }
        .ds-pricing-grid-cols[data-cols="4"] { grid-template-columns: repeat(4, 1fr); }
        .ds-plan-card { background: var(--ds-bg3); border: 0.5px solid var(--ds-border); border-radius: 12px; padding: 2rem; position: relative; transition: border-color 0.2s; }
        .ds-plan-card:hover { border-color: var(--ds-border2); }
        .ds-plan-card.popular { border-color: rgba(212,176,78,0.35); background: linear-gradient(135deg, var(--ds-bg3) 0%, rgba(212,176,78,0.04) 100%); }
        .ds-plan-badge { font-family: var(--ds-mono); font-size: 0.58rem; background: var(--ds-ga); color: #1c1b19; border-radius: 3px; padding: 0.1rem 0.5rem; letter-spacing: 0.06em; position: absolute; top: 1.25rem; right: 1.25rem; }
        .ds-plan-title { font-family: var(--ds-serif); font-size: 1.25rem; font-weight: 700; color: var(--ds-cream); margin-bottom: 0.5rem; }
        .ds-plan-price { font-family: var(--ds-serif); font-size: 2.5rem; font-weight: 700; color: var(--ds-cream); line-height: 1; letter-spacing: -0.03em; }
        .ds-plan-price span { font-size: 0.85rem; font-weight: 400; color: var(--ds-cream3); font-family: var(--ds-sans); margin-left: 0.25rem; }
        .ds-plan-divider { border: none; border-top: 0.5px solid var(--ds-border); margin: 1.25rem 0; }
        .ds-plan-features { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
        .ds-plan-feature { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.83rem; color: var(--ds-cream2); }
        .ds-plan-check { color: var(--ds-gold2); font-size: 0.75rem; flex-shrink: 0; margin-top: 0.15rem; }
        .ds-plan-btn {
          width: 100%; font-family: var(--ds-sans); font-size: 0.88rem; font-weight: 500;
          padding: 0.75rem; border-radius: 7px; cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          border: none; background: var(--ds-ga); color: #1c1b19;
        }
        .ds-plan-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ds-plan-btn.outline { background: none; border: 0.5px solid var(--ds-border2); color: var(--ds-cream2); }
        .ds-plan-btn.outline:hover { border-color: var(--ds-border3); color: var(--ds-cream); background: rgba(245,240,230,0.04); }

        /* COMPARISON TABLE */
        .ds-comp-table { width: 100%; border-collapse: collapse; margin-top: 3rem; }
        .ds-comp-table th { font-family: var(--ds-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ds-cream3); padding: 0.85rem 1.25rem; text-align: left; border-bottom: 0.5px solid var(--ds-border); }
        .ds-comp-table th:first-child { color: var(--ds-cream2); }
        .ds-comp-table th.highlight { color: var(--ds-gold2); }
        .ds-comp-table td { font-size: 0.85rem; color: var(--ds-cream2); padding: 0.85rem 1.25rem; border-bottom: 0.5px solid var(--ds-border); }
        .ds-comp-table tr:last-child td { border-bottom: none; }
        .ds-comp-table td:first-child { color: var(--ds-cream); font-weight: 400; }
        .ds-comp-yes { color: var(--ds-gold2); font-size: 0.8rem; }
        .ds-comp-no { color: var(--ds-cream3); font-size: 0.8rem; }
        .ds-comp-table tr:hover td { background: var(--ds-bg3); }

        /* FAQ */
        .ds-faq-list { display: flex; flex-direction: column; gap: 0; margin-top: 3rem; border: 0.5px solid var(--ds-border); border-radius: 12px; overflow: hidden; }
        .ds-faq-item { border-bottom: 0.5px solid var(--ds-border); }
        .ds-faq-item:last-child { border-bottom: none; }
        .ds-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem; background: none; border: none; cursor: pointer;
          text-align: left; font-family: var(--ds-sans); font-size: 0.95rem; font-weight: 400;
          color: var(--ds-cream); transition: background 0.15s;
        }
        .ds-faq-q:hover { background: var(--ds-bg3); }
        .ds-faq-icon { font-family: var(--ds-mono); font-size: 1rem; color: var(--ds-gold2); flex-shrink: 0; margin-left: 1rem; transition: transform 0.2s; }
        .ds-faq-icon.open { transform: rotate(45deg); }
        .ds-faq-a { padding: 0 1.5rem 1.25rem; font-size: 0.88rem; color: var(--ds-cream2); line-height: 1.8; }

        /* SECURITY BADGES */
        .ds-badges-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 3rem; }
        .ds-badge-card { background: var(--ds-bg3); border: 0.5px solid var(--ds-border); border-radius: 10px; padding: 1.5rem; text-align: center; }
        .ds-badge-icon { font-size: 1.75rem; margin-bottom: 0.75rem; display: block; }
        .ds-badge-title { font-family: var(--ds-mono); font-size: 0.72rem; color: var(--ds-cream); letter-spacing: 0.04em; margin-bottom: 0.35rem; }
        .ds-badge-desc { font-size: 0.72rem; color: var(--ds-cream3); line-height: 1.5; }

        /* MOBILE APP PREVIEW */
        .ds-mobile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .ds-phone-frame { background: var(--ds-bg3); border: 0.5px solid var(--ds-border2); border-radius: 32px; padding: 1.5rem; max-width: 280px; margin: 0 auto; }
        .ds-phone-screen { background: var(--ds-bg4); border-radius: 20px; padding: 1.25rem; min-height: 420px; display: flex; flex-direction: column; gap: 0.85rem; }
        .ds-phone-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .ds-phone-logo { font-family: var(--ds-serif); font-size: 0.95rem; font-weight: 700; }
        .ds-phone-logo span { background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-phone-notif { width: 8px; height: 8px; border-radius: 50%; background: var(--ds-amber); }
        .ds-phone-card { background: var(--ds-bg5); border: 0.5px solid var(--ds-border); border-radius: 10px; padding: 0.85rem; }
        .ds-phone-card-label { font-family: var(--ds-mono); font-size: 0.55rem; color: var(--ds-cream3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.25rem; }
        .ds-phone-card-val { font-family: var(--ds-serif); font-size: 1.35rem; font-weight: 700; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-phone-deal-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 0.5px solid var(--ds-border); font-size: 0.68rem; }
        .ds-phone-deal-row:last-child { border-bottom: none; }

        /* VIDEO DEMO */
        .ds-video-section { text-align: center; }
        .ds-video-box {
          position: relative; margin: 3rem auto 0; max-width: 800px;
          background: var(--ds-bg2); border: 0.5px solid var(--ds-border2); border-radius: 16px;
          overflow: hidden; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.2s;
        }
        .ds-video-box:hover { border-color: var(--ds-border3); }
        .ds-video-play {
          width: 72px; height: 72px; border-radius: 50%; background: var(--ds-ga);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s; position: relative; z-index: 2;
        }
        .ds-video-play:hover { transform: scale(1.06); box-shadow: 0 16px 48px rgba(224,123,24,0.3); }
        .ds-video-bg-text {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: var(--ds-serif); font-size: 5rem; opacity: 0.04; color: var(--ds-cream); pointer-events: none;
        }
        .ds-video-label { font-family: var(--ds-mono); font-size: 0.72rem; color: var(--ds-cream3); letter-spacing: 0.06em; margin-top: 1.25rem; }

        /* FINAL CTA */
        .ds-cta-section {
          padding: 8rem 3rem; text-align: center; position: relative; overflow: hidden;
          border-top: 0.5px solid var(--ds-border);
        }
        .ds-cta-glow-l { position: absolute; bottom: -30%; left: -10%; width: 600px; height: 600px; background: radial-gradient(ellipse, rgba(212,176,78,0.06) 0%, transparent 65%); pointer-events: none; }
        .ds-cta-glow-r { position: absolute; bottom: -30%; right: -10%; width: 600px; height: 600px; background: radial-gradient(ellipse, rgba(224,123,24,0.06) 0%, transparent 65%); pointer-events: none; }
        .ds-cta-title { font-family: var(--ds-serif); font-size: clamp(2.75rem,5.5vw,5rem); font-weight: 700; line-height: 1.0; letter-spacing: -0.03em; color: var(--ds-cream); max-width: 660px; margin: 0 auto 1.25rem; }
        .ds-cta-title em { font-style: italic; background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-cta-sub { font-size: 0.95rem; color: var(--ds-cream2); margin-bottom: 2.5rem; line-height: 1.7; }
        .ds-cta-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1.25rem; }
        .ds-cta-note { font-family: var(--ds-mono); font-size: 0.62rem; color: var(--ds-cream3); letter-spacing: 0.06em; }

        /* FOOTER */
        .ds-footer { border-top: 0.5px solid var(--ds-border); padding: 3rem; display: grid; grid-template-columns: 220px 1fr 1fr 1fr; gap: 3rem; }
        .ds-footer-logo { font-family: var(--ds-serif); font-size: 1.25rem; font-weight: 700; color: var(--ds-cream); text-decoration: none; display: block; margin-bottom: 0.75rem; }
        .ds-footer-logo span { background: var(--ds-ga-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ds-footer-tagline { font-size: 0.78rem; color: var(--ds-cream3); line-height: 1.6; }
        .ds-footer-col-title { font-family: var(--ds-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--ds-cream2); text-transform: uppercase; margin-bottom: 1rem; font-weight: 500; }
        .ds-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .ds-footer-links a { font-size: 0.8rem; color: var(--ds-cream3); text-decoration: none; transition: color 0.2s; }
        .ds-footer-links a:hover { color: var(--ds-cream); }
        .ds-footer-bottom { border-top: 0.5px solid var(--ds-border); padding: 1.5rem 3rem; display: flex; align-items: center; justify-content: space-between; }
        .ds-footer-copy { font-family: var(--ds-mono); font-size: 0.65rem; color: var(--ds-cream3); }

        /* FADE IN UTIL */
        .ds-fade { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .ds-fade.ds-visible { opacity: 1; transform: translateY(0); }

        /* SCROLLBAR */
        .ds-wrap ::-webkit-scrollbar { width: 3px; }
        .ds-wrap ::-webkit-scrollbar-track { background: var(--ds-bg); }
        .ds-wrap ::-webkit-scrollbar-thumb { background: var(--ds-border2); border-radius: 2px; }

        /* MOBILE NAV OVERLAY */
        .ds-mobile-menu-btn { display: none; background: none; border: none; color: var(--ds-cream); font-size: 1.5rem; cursor: pointer; padding: 0.5rem; line-height: 1; }
        .ds-mobile-nav-overlay {
          display: none; position: fixed; inset: 0; z-index: 500;
          background: rgba(8,8,7,0.97); flex-direction: column;
          padding: 1.25rem 1.5rem;
        }
        .ds-mobile-nav-overlay.open { display: flex; }
        .ds-mobile-nav-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .ds-mobile-nav-links { display: flex; flex-direction: column; gap: 0; flex: 1; overflow-y: auto; }
        .ds-mobile-nav-link {
          font-family: var(--ds-serif); font-size: 1.5rem; font-weight: 500; color: var(--ds-cream);
          text-decoration: none; padding: 0.85rem 0; border-bottom: 0.5px solid var(--ds-border);
          display: block; transition: color 0.2s;
        }
        .ds-mobile-nav-link:hover { color: var(--ds-gold2); }
        .ds-mobile-nav-footer { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .ds-mobile-nav-cta {
          width: 100%; font-family: var(--ds-sans); font-size: 0.9rem; font-weight: 500;
          padding: 0.85rem; border-radius: 7px; cursor: pointer; text-align: center;
          background: var(--ds-ga); color: #1c1b19; border: none; text-decoration: none;
          display: block;
        }
        .ds-mobile-nav-login {
          width: 100%; font-family: var(--ds-sans); font-size: 0.9rem; font-weight: 400;
          padding: 0.85rem; border-radius: 7px; cursor: pointer; text-align: center;
          background: none; color: var(--ds-cream2); border: 0.5px solid var(--ds-border2);
          text-decoration: none; display: block;
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .ds-mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; }
          .ds-nav-links { display: none !important; }
          .ds-btn-demo { display: none !important; }
          .ds-nav-right .ds-btn-ghost { display: none !important; }
          .ds-btn-trial { font-size: 0.78rem !important; padding: 0.4rem 0.85rem !important; min-height: 44px; }
          .ds-nav { padding: 0 1rem !important; height: 52px !important; }
          .ds-hero { padding-top: 52px !important; }
          .ds-hero-headline { font-size: clamp(2rem, 8.5vw, 3rem) !important; word-break: break-word !important; }
          .ds-hero-top { padding: 2rem 1.25rem 1.5rem !important; }
          .ds-hero-ui { margin: 0 0.75rem !important; min-height: 280px !important; }
          .ds-ui-body { grid-template-columns: 1fr !important; height: auto !important; }
          .ds-ui-sidebar, .ds-ui-right { display: none !important; }
          .ds-ui-main { padding: 1rem !important; overflow: hidden !important; }
          .ds-ui-deal-name { font-size: 0.7rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 140px !important; }
          .ds-ui-deal-brand { font-size: 0.58rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 140px !important; }
          .ds-ui-tabs { gap: 0.15rem !important; overflow-x: auto !important; }
          .ds-ui-tab { font-size: 0.58rem !important; padding: 0.25rem 0.45rem !important; white-space: nowrap !important; }
          .ds-trust-bar { padding: 1rem 1.25rem !important; gap: 1rem !important; flex-wrap: wrap !important; flex-direction: column !important; align-items: flex-start !important; }
          .ds-trust-logos { gap: 1rem !important; flex-wrap: wrap !important; }
          .ds-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-stat-cell { padding: 1.25rem 1rem !important; border-right: none !important; border-bottom: 0.5px solid var(--ds-border); }
          .ds-stat-cell:nth-child(odd) { border-right: 0.5px solid var(--ds-border) !important; }
          .ds-stat-cell:nth-child(3), .ds-stat-cell:nth-child(4) { border-bottom: none !important; }
          .ds-stat-num { font-size: 1.85rem !important; }
          .ds-section { padding: 3.5rem 1.25rem !important; }
          .ds-full-bleed { padding: 3.5rem 1.25rem !important; }
          .ds-feature-row { grid-template-columns: 1fr !important; gap: 1.5rem !important; margin-bottom: 3.5rem !important; }
          .ds-feature-row.reverse { direction: ltr !important; }
          .ds-feature-title { font-size: 1.75rem !important; word-break: break-word !important; }
          .ds-feature-panel { min-height: 220px !important; }
          .ds-hiw-grid { grid-template-columns: 1fr !important; }
          .ds-pricing-grid,
          .ds-pricing-grid-cols[data-cols="1"],
          .ds-pricing-grid-cols[data-cols="2"],
          .ds-pricing-grid-cols[data-cols="3"],
          .ds-pricing-grid-cols[data-cols="4"] { grid-template-columns: 1fr !important; }
          .ds-badges-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-mobile-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .ds-comp-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .ds-comp-table { font-size: 0.72rem !important; min-width: 480px !important; }
          .ds-comp-table th, .ds-comp-table td { padding: 0.6rem 0.75rem !important; }
          .ds-footer { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 2rem 1.25rem !important; }
          .ds-footer-bottom { flex-direction: column !important; gap: 0.5rem !important; text-align: center !important; padding: 1rem 1.25rem !important; }
          .ds-cta-title { font-size: clamp(1.85rem, 7.5vw, 2.5rem) !important; word-break: break-word !important; }
          .ds-hero-btns { flex-direction: column !important; width: 100% !important; gap: 0.65rem !important; }
          .ds-btn-hero-primary, .ds-btn-hero-secondary { width: 100% !important; text-align: center !important; justify-content: center !important; min-height: 48px !important; box-sizing: border-box !important; }
          .ds-tab-row { flex-wrap: wrap !important; width: 100% !important; }
          .ds-tab-btn { flex: 1 !important; text-align: center !important; min-height: 44px !important; font-size: 0.68rem !important; }
          .ds-cta-actions { flex-direction: column !important; align-items: stretch !important; width: 100% !important; max-width: 360px !important; margin-left: auto !important; margin-right: auto !important; }
          .ds-cta-section { padding: 4rem 1.25rem !important; }
          .ds-hero-sub { font-size: 0.875rem !important; }
          .ds-hero-note { font-size: 0.6rem !important; }
          .ds-ui-stats-row { grid-template-columns: 1fr !important; }
          .ds-faq-q { padding: 1rem 1.25rem !important; font-size: 0.88rem !important; }
          .ds-faq-a { padding: 0 1.25rem 1rem !important; }
          .ds-section-title { font-size: clamp(1.75rem, 6.5vw, 3.5rem) !important; word-break: break-word !important; }
          .ds-video-box { margin: 2rem 0 0 !important; border-radius: 10px !important; }
          .ds-plan-price { font-size: 2rem !important; }
          .ds-hiw-step { padding: 1.5rem !important; }
          .ds-phone-frame { max-width: 240px !important; }
        }

        @media (max-width: 480px) {
          .ds-hero-headline { font-size: clamp(1.85rem, 8vw, 2.5rem) !important; }
          .ds-nav { padding: 0 0.875rem !important; }
          .ds-ui-topbar { padding: 0.65rem 0.85rem !important; }
          .ds-ui-dot { width: 8px !important; height: 8px !important; }
          .ds-badges-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
          .ds-badge-card { padding: 1rem !important; }
          .ds-trust-logo { font-size: 0.82rem !important; }
          .ds-stat-num { font-size: 1.6rem !important; }
          .ds-section { padding: 3rem 1rem !important; }
          .ds-full-bleed { padding: 3rem 1rem !important; }
          .ds-footer { padding: 1.75rem 1rem !important; }
          .ds-footer-bottom { padding: 1rem !important; }
          .ds-cta-section { padding: 3.5rem 1rem !important; }
          .ds-cta-actions .ds-btn-hero-primary, .ds-cta-actions .ds-btn-hero-secondary { font-size: 0.85rem !important; }
          .ds-mobile-nav-link { font-size: 1.25rem !important; }
          .ds-plan-card { padding: 1.5rem !important; }
        }
      `}</style>

      <div className="ds-wrap" style={theme.bg.startsWith("linear") ? { background: theme.bg } : { backgroundColor: theme.bg }}>

        {/* ── MOBILE NAV OVERLAY ──────────────────────────────────────────── */}
        <div className={`ds-mobile-nav-overlay${mobileNavOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="ds-mobile-nav-header">
            <a href="/" style={{ display: "flex", alignItems: "center" }} onClick={() => setMobileNavOpen(false)}>
              <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 36 }} />
            </a>
            <button className="ds-mobile-menu-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <nav className="ds-mobile-nav-links">
            <a href="#features" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Features</a>
            <a href="#pricing" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Pricing</a>
            <a href="#how-it-works" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>How It Works</a>
            <a href="/About" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="/Blog" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Blog</a>
            <a href="/Demo" className="ds-mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Book a Demo</a>
          </nav>
          <div className="ds-mobile-nav-footer">
            <button className="ds-mobile-nav-cta" onClick={() => { setMobileNavOpen(false); handleGetStarted(); }}>Start free trial</button>
            <a href="/login" className="ds-mobile-nav-login" onClick={() => setMobileNavOpen(false)}>Log in</a>
          </div>
        </div>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav className={`ds-nav${navScrolled ? " scrolled" : ""}`} style={isMobile ? { padding: "0 1rem", height: 52 } : {}}>
          <a href="/" className="ds-nav-logo" style={{ display: "flex", alignItems: "center" }}>
            <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 42 }} />
          </a>
          <button className="ds-mobile-menu-btn" style={{ display: isMobile ? "flex" : "none", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 }} onClick={() => setMobileNavOpen(true)} aria-label="Open menu" aria-expanded={mobileNavOpen}>☰</button>
          <ul className="ds-nav-links" style={isMobile ? { display: "none" } : {}}>
            {/* For Brands dropdown */}
            <li className="ds-nav-item">
              <button className="ds-nav-link">For Brands <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{marginLeft:4}}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <div className="ds-dropdown">
                <a href="/features/browse-talent" className="ds-drop-item"><div className="ds-drop-icon">🔍</div><div><div className="ds-drop-title">Browse Talent</div><div className="ds-drop-desc">Search all talent categories</div></div></a>
                <a href="/features/send-deals" className="ds-drop-item"><div className="ds-drop-icon">🤝</div><div><div className="ds-drop-title">Send Deals</div><div className="ds-drop-desc">Proposal and contract tools</div></div></a>
                <a href="/features/campaign-analytics" className="ds-drop-item"><div className="ds-drop-icon">📊</div><div><div className="ds-drop-title">Campaign Analytics</div><div className="ds-drop-desc">Track performance and ROI</div></div></a>
                <a href="/features/integrations" className="ds-drop-item"><div className="ds-drop-icon">🔗</div><div><div className="ds-drop-title">Integrations</div><div className="ds-drop-desc">Connect 88+ platforms and tools</div></div></a>
              </div>
            </li>
            {/* For Talent dropdown */}
            <li className="ds-nav-item">
              <button className="ds-nav-link">For Talent <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{marginLeft:4}}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <div className="ds-dropdown">
                <a href="/features/talent-discovery" className="ds-drop-item"><div className="ds-drop-icon">🎯</div><div><div className="ds-drop-title">Talent Discovery</div><div className="ds-drop-desc">Find any talent type instantly</div></div></a>
                <a href="/features/deal-pipeline" className="ds-drop-item"><div className="ds-drop-icon">📋</div><div><div className="ds-drop-title">Deal Pipeline</div><div className="ds-drop-desc">Track deals from pitch to close</div></div><span className="ds-nav-badge">New</span></a>
                <a href="/features/media-kits" className="ds-drop-item"><div className="ds-drop-icon">📄</div><div><div className="ds-drop-title">Media Kits</div><div className="ds-drop-desc">Auto-updating talent profiles</div></div></a>
                <a href="/features/payments" className="ds-drop-item"><div className="ds-drop-icon">💰</div><div><div className="ds-drop-title">Payments</div><div className="ds-drop-desc">Invoicing and commission splits</div></div></a>
              </div>
            </li>
            {/* For Managers dropdown */}
            <li className="ds-nav-item">
              <button className="ds-nav-link">For Managers <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{marginLeft:4}}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <div className="ds-dropdown">
                <a href="/features/manage-talent" className="ds-drop-item"><div className="ds-drop-icon">⭐</div><div><div className="ds-drop-title">Manage Talent</div><div className="ds-drop-desc">Full control of your roster</div></div></a>
                <a href="/features/manage-deals" className="ds-drop-item"><div className="ds-drop-icon">💼</div><div><div className="ds-drop-title">Manage Deals</div><div className="ds-drop-desc">All deals across your clients</div></div></a>
                <a href="/features/payments" className="ds-drop-item"><div className="ds-drop-icon">💲</div><div><div className="ds-drop-title">Get Paid Fast</div><div className="ds-drop-desc">Secure, on-time payments</div></div></a>
              </div>
            </li>
            <li><a href="#pricing" className="ds-nav-link">Pricing</a></li>
          </ul>
          <div className="ds-nav-right">
            <ThemeSwitcher compact />
            {!isMobile && <a href="/login" className="ds-btn-ghost">Log in</a>}
            {!isMobile && <a href="/Demo" className="ds-btn-demo">Book a demo</a>}
            <button className="ds-btn-trial" onClick={handleGetStarted}>Start free trial</button>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <div className="ds-hero">
          <div className="ds-hero-glow-l" />
          <div className="ds-hero-glow-r" />
          <div className="ds-hero-top">
            <div className="ds-hero-badge">
              <div className="ds-badge-dot" />
              Now live — talent &amp; brands welcome
            </div>
            <h1 className="ds-hero-headline">
              The platform powering<br /><em>talent-brand deals</em>
            </h1>
            <p className="ds-hero-sub">
              Dealstage connects every type of talent to brands and agencies — with deal management, media kits, contracts, and payments built in.
            </p>
            <div className="ds-hero-btns" style={isMobile ? { flexDirection: "column", width: "100%", gap: "0.65rem" } : {}}>
              <button className="ds-btn-hero-primary" style={isMobile ? { width: "100%", textAlign: "center" } : {}} onClick={handleGetStarted}>Start free trial</button>
              <a href="#how-it-works" className="ds-btn-hero-secondary" style={isMobile ? { width: "100%", textAlign: "center" } : {}}>See how it works</a>
            </div>
            <p className="ds-hero-note">No credit card required · Free 7-day trial · All talent types welcome</p>
          </div>

          {/* Product UI mockup */}
          <div className="ds-hero-ui">
            <div className="ds-ui-topbar">
              <div className="ds-ui-dots">
                <div className="ds-ui-dot" />
                <div className="ds-ui-dot" />
                <div className="ds-ui-dot" />
              </div>
              <div className="ds-ui-tabs">
                {["Deals", "Media Kits", "Roster", "Payments", "Analytics"].map((t, i) => (
                  <button key={t} className={`ds-ui-tab${i === 0 ? " active" : ""}`}>{t}</button>
                ))}
              </div>
              <div style={{ width: 60 }} />
            </div>
            <div className="ds-ui-body" style={isMobile ? { gridTemplateColumns: "1fr", height: "auto" } : {}}>
              {!isMobile && <div className="ds-ui-sidebar">
                {[["📋", "Deals", true], ["🏠", "Home", false], ["📅", "Calendar", false], ["👥", "Roster", false], ["📄", "Media Kits", false], ["📊", "Reports", false], ["💸", "Payments", false], ["🔗", "Contacts", false]].map(([icon, label, active]) => (
                  <div key={label} className={`ds-ui-nav-item${active ? " active" : ""}`}>{icon}&nbsp;&nbsp;{label}</div>
                ))}
              </div>}
              <div className="ds-ui-main">
                <div className="ds-ui-header-row">
                  <div className="ds-ui-title">Deal Pipeline</div>
                  <button className="ds-ui-add-btn">+ New Deal</button>
                </div>
                <div className="ds-ui-stats-row">
                  <div className="ds-ui-stat"><div className="ds-ui-stat-val">$248K</div><div className="ds-ui-stat-lbl">Pipeline value</div></div>
                  <div className="ds-ui-stat"><div className="ds-ui-stat-val">24</div><div className="ds-ui-stat-lbl">Active deals</div></div>
                  <div className="ds-ui-stat"><div className="ds-ui-stat-val">96%</div><div className="ds-ui-stat-lbl">Close rate</div></div>
                </div>
                {[
                  { init: "NK", name: "Nike × Jordan Reeves", type: "Athlete · Campaign · 60 days", amt: "$85,000", pill: "ds-pill-active", pillLabel: "Active" },
                  { init: "SP", name: "Spotify × Mia Chen", type: "Creator · Podcast · Ongoing", amt: "$12,500", pill: "ds-pill-review", pillLabel: "In review" },
                  { init: "LV", name: "Louis Vuitton × Zara Ali", type: "Model · Editorial · 2 weeks", amt: "$34,000", pill: "ds-pill-new", pillLabel: "New" },
                ].map((deal) => (
                  <div key={deal.name} className="ds-ui-deal-row">
                    <div className="ds-ui-deal-left">
                      <div className="ds-ui-avatar">{deal.init}</div>
                      <div>
                        <div className="ds-ui-deal-name">{deal.name}</div>
                        <div className="ds-ui-deal-brand">{deal.type}</div>
                      </div>
                    </div>
                    <div className="ds-ui-deal-right">
                      <div className="ds-ui-deal-amt">{deal.amt}</div>
                      <span className={`ds-ui-pill ${deal.pill}`}>{deal.pillLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
              {!isMobile && <div className="ds-ui-right">
                <div className="ds-ui-revenue-card">
                  <div className="ds-ui-rev-label">2026 Revenue</div>
                  <div className="ds-ui-rev-val">$1,248,325</div>
                  <div className="ds-ui-rev-sub">&#8593; 34% vs last year</div>
                </div>
                <div className="ds-ui-task-lbl">Upcoming tasks</div>
                {[
                  { text: "Confirm exclusivity with Nike", brand: "Jordan Reeves · Due today" },
                  { text: "Send invoice to Spotify", brand: "Mia Chen · Due tomorrow" },
                  { text: "Review LV contract draft", brand: "Zara Ali · Due Friday" },
                ].map((task) => (
                  <div key={task.text} className="ds-ui-task-item">
                    <div className="ds-ui-check" />
                    <div>
                      <div className="ds-ui-task-text">{task.text}</div>
                      <div className="ds-ui-task-brand">{task.brand}</div>
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          </div>
        </div>

        {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
        <div className="ds-trust-bar">
          <span className="ds-trust-label">Trusted by leading agencies &amp; brands</span>
          <div className="ds-trust-logos">
            {["Wasserman", "WME", "CAA", "Endeavor", "Night", "Select", "Gleam", "Sixteenth"].map((name) => (
              <span key={name} className="ds-trust-logo">{name}</span>
            ))}
          </div>
        </div>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <div className="ds-stats" style={isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}>
          <div className="ds-stat-cell"><div className="ds-stat-num">12<span>k+</span></div><div className="ds-stat-lbl">Talent profiles</div></div>
          <div className="ds-stat-cell"><div className="ds-stat-num"><span>$</span>48M</div><div className="ds-stat-lbl">Deals facilitated</div></div>
          <div className="ds-stat-cell"><div className="ds-stat-num">840<span>+</span></div><div className="ds-stat-lbl">Brands &amp; agencies</div></div>
          <div className="ds-stat-cell"><div className="ds-stat-num">96<span>%</span></div><div className="ds-stat-lbl">Deal close rate</div></div>
        </div>

        {/* ── TICKER ──────────────────────────────────────────────────────── */}
        <div className="ds-ticker-wrap">
          <div className="ds-ticker">
            {["Athletes", "Creators", "Musicians", "Speakers", "Models", "Coaches", "Podcasters", "Chefs", "Actors", "Designers", "Gamers", "Consultants",
              "Athletes", "Creators", "Musicians", "Speakers", "Models", "Coaches", "Podcasters", "Chefs", "Actors", "Designers", "Gamers", "Consultants"].map((item, i) => (
              <span key={i} className="ds-ticker-item">
                {item} <span className="ds-ticker-sep">&#9670;</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <div id="how-it-works" className="ds-section ds-fade">
          <span className="ds-section-tag">/ How it works</span>
          <h2 className="ds-section-title">Simple for everyone<br /><em>in the deal</em></h2>
          <p className="ds-section-body" style={{ marginBottom: "2.5rem" }}>Whether you're a brand sourcing talent or a talent managing deals, Dealstage gets you from discovery to signed contract in days — not months.</p>
          <div className="ds-tab-row">
            <button className={`ds-tab-btn${howItWorksRole === "brand" ? " active" : ""}`} onClick={() => setHowItWorksRole("brand")}>For Brands</button>
            <button className={`ds-tab-btn${howItWorksRole === "talent" ? " active" : ""}`} onClick={() => setHowItWorksRole("talent")}>For Talent</button>
          </div>
          <div className="ds-hiw-grid" style={isMobile ? { gridTemplateColumns: "1fr" } : {}}>
            {HOW_IT_WORKS[howItWorksRole].map((step) => (
              <div key={step.step} className="ds-hiw-step">
                <div className="ds-hiw-num">{step.step}</div>
                <div className="ds-hiw-title">{step.title}</div>
                <div className="ds-hiw-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURE ROWS ────────────────────────────────────────────────── */}
        <div id="features" className="ds-full-bleed ds-fade">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <span className="ds-section-tag">/ Platform features</span>
            <h2 className="ds-section-title">Everything in one place.<br /><em>Nothing left out.</em></h2>
            <p className="ds-section-body" style={{ marginBottom: "5rem" }}>Every feature is built around the deal — from first discovery to final payment.</p>
            {FEATURES.map((feat) => (
              <div key={feat.label} className={`ds-feature-row${feat.reverse ? " reverse" : ""}`} style={isMobile ? { gridTemplateColumns: "1fr", gap: "1.5rem", direction: "ltr" } : {}}>
                <div className="ds-feature-copy">
                  <span className="ds-feature-label">{feat.label}</span>
                  <h3 className="ds-feature-title">{feat.title}<br /><em>{feat.titleEm}</em></h3>
                  <p className="ds-feature-body">{feat.body}</p>
                  <div className="ds-feature-bullets">
                    {feat.bullets.map((b) => (
                      <div key={b} className="ds-feature-bullet">
                        <div className="ds-bullet-dot">&#10003;</div>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <FeatureMockup type={feat.mockup} />
              </div>
            ))}
          </div>
        </div>

        {/* ── VIDEO DEMO ──────────────────────────────────────────────────── */}
        <div className="ds-section ds-fade ds-video-section">
          <span className="ds-section-tag">/ Product demo</span>
          <h2 className="ds-section-title">See it in <em>2 minutes</em></h2>
          <p className="ds-section-body" style={{ maxWidth: 480, margin: "0 auto 2.5rem" }}>Watch how Dealstage connects talent to brand deals — automatically</p>
          <AnimatedWalkthrough />
          <p className="ds-video-label" style={{ marginTop: "1.5rem" }}>
            Want to try it yourself?{" "}
            <a href="/Demo" style={{ color: "var(--ds-gold2)", textDecoration: "none", borderBottom: "0.5px solid rgba(212,176,78,0.35)", paddingBottom: 1, transition: "border-color 0.2s" }}>
              Interactive demo &#8594;
            </a>
          </p>
        </div>

        {/* ── PRICING ─────────────────────────────────────────────────────── */}
        <div id="pricing" className="ds-full-bleed ds-fade">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <span className="ds-section-tag">/ Pricing</span>
            <h2 className="ds-section-title">Start free. Scale<br /><em>as you grow.</em></h2>
            <p className="ds-section-body" style={{ marginBottom: "2.5rem" }}>Every plan includes a 7-day free trial. No credit card required to get started.</p>
            {/* Role tabs + billing toggle row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
              <div className="ds-tab-row" style={{ margin: 0 }}>
                {[["talent", "Talent"], ["brand", "Brands"], ["agency", "Agencies"]].map(([key, label]) => (
                  <button key={key} className={`ds-tab-btn${pricingRole === key ? " active" : ""}`} onClick={() => setPricingRole(key)}>{label}</button>
                ))}
              </div>
              {/* Billing toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.72rem", color: !billingAnnual ? "var(--ds-cream)" : "var(--ds-cream3)", letterSpacing: "0.04em" }}>Monthly</span>
                <button
                  onClick={() => setBillingAnnual(!billingAnnual)}
                  style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", background: billingAnnual ? "var(--ds-ga)" : "rgba(255,248,220,0.1)" }}
                  aria-label="Toggle annual billing"
                >
                  <div style={{ position: "absolute", top: 3, left: billingAnnual ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: billingAnnual ? "#1c1b19" : "rgba(245,240,230,0.5)", transition: "left 0.2s" }} />
                </button>
                <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.72rem", color: billingAnnual ? "var(--ds-cream)" : "var(--ds-cream3)", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  Annual
                  {billingAnnual && <span style={{ fontSize: "0.58rem", background: "var(--ds-ga)", color: "#1c1b19", borderRadius: 3, padding: "0.1rem 0.4rem", fontWeight: 600 }}>Save 20%</span>}
                </span>
              </div>
            </div>
            <div className="ds-pricing-grid ds-pricing-grid-cols" data-cols={PRICING[pricingRole].length} style={isMobile ? { gridTemplateColumns: "1fr" } : {}}>
              {PRICING[pricingRole].map((plan) => {
                const numericPrice = parseInt((plan.price || "").replace(/[^0-9]/g, ""), 10);
                const annualMonthlyPrice = (billingAnnual && numericPrice) ? `$${Math.round(numericPrice * 0.8)}` : plan.price;
                const displayPrice = (plan.price === "$0" || plan.price === "Custom") ? plan.price : annualMonthlyPrice;
                const isPaid = plan.price !== "$0" && plan.price !== "Custom";
                return (
                  <div key={plan.title} className={`ds-plan-card${plan.popular ? " popular" : ""}`}>
                    {plan.badge && <div className="ds-plan-badge">{plan.badge}</div>}
                    <div className="ds-plan-title">{plan.title}</div>
                    <div className="ds-plan-price">
                      {displayPrice}
                      <span>{billingAnnual && isPaid ? "/ mo · billed annually" : plan.period}</span>
                    </div>
                    {isPaid && (
                      <div style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", color: "var(--ds-gold2)", background: "var(--ds-gold-dim)", border: "0.5px solid rgba(212,176,78,0.18)", borderRadius: 3, padding: "0.15rem 0.5rem", letterSpacing: "0.04em" }}>7-day free trial</span>
                      </div>
                    )}
                    <hr className="ds-plan-divider" />
                    <div className="ds-plan-features">
                      {plan.features.map((f) => (
                        <div key={f} className="ds-plan-feature">
                          <span className="ds-plan-check">&#9670;</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className={`ds-plan-btn${plan.popular ? "" : " outline"}`}
                      onClick={() => {
                        if (onSelectRole) onSelectRole(pricingRole, plan.title.toLowerCase());
                      }}
                    >
                      {plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── COMPARISON TABLE ────────────────────────────────────────────── */}
        <div className="ds-section ds-fade">
          <span className="ds-section-tag">/ How we compare</span>
          <h2 className="ds-section-title">Dealstage vs the<br /><em>alternatives</em></h2>
          <p className="ds-section-body">See why top agencies and brands choose Dealstage over disconnected tools.</p>
          <div className="ds-comp-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="ds-comp-table" style={isMobile ? { minWidth: 480, fontSize: "0.72rem" } : {}}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className="highlight">Dealstage</th>
                <th>Talent Agencies</th>
                <th>Spreadsheets</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Verified live social stats", true, false, false],
                ["Deal pipeline & task tracking", true, "Partial", false],
                ["Built-in contracts & e-signatures", true, false, false],
                ["Automated media kit generation", true, false, false],
                ["AI talent matching (94% accuracy)", true, false, false],
                ["Stripe payments & invoicing", true, false, false],
                ["12+ talent categories", true, "Limited", false],
                ["Real-time brand notifications", true, false, false],
                ["Free plan available", true, false, true],
                ["No commissions on deals", true, false, true],
              ].map(([feat, ds, agency, sheets]) => (
                <tr key={feat}>
                  <td>{feat}</td>
                  <td>{ds === true ? <span className="ds-comp-yes">&#9670; Yes</span> : ds === false ? <span className="ds-comp-no">&#8212;</span> : <span style={{ color: "var(--ds-gold2)", fontSize: "0.8rem" }}>{ds}</span>}</td>
                  <td>{agency === true ? <span className="ds-comp-yes">&#9670; Yes</span> : agency === false ? <span className="ds-comp-no">&#8212;</span> : <span style={{ color: "var(--ds-cream3)", fontSize: "0.8rem" }}>{agency}</span>}</td>
                  <td>{sheets === true ? <span className="ds-comp-yes">&#9670; Yes</span> : <span className="ds-comp-no">&#8212;</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <div id="faq" className="ds-full-bleed ds-fade">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <span className="ds-section-tag">/ Frequently asked</span>
            <h2 className="ds-section-title">Questions we<br /><em>always hear</em></h2>
            <div className="ds-faq-list">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="ds-faq-item">
                  <button className="ds-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className={`ds-faq-icon${openFaq === i ? " open" : ""}`}>+</span>
                  </button>
                  {openFaq === i && <div className="ds-faq-a">{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECURITY BADGES ─────────────────────────────────────────────── */}
        <div className="ds-section ds-fade">
          <span className="ds-section-tag">/ Security &amp; compliance</span>
          <h2 className="ds-section-title">Built to enterprise<br /><em>security standards</em></h2>
          <p className="ds-section-body">Your data, your deals, and your payments are protected at every layer.</p>
          <div className="ds-badges-grid" style={isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}>
            <div className="ds-badge-card">
              <span className="ds-badge-icon">&#128737;</span>
              <div className="ds-badge-title">SOC 2 Type II</div>
              <div className="ds-badge-desc">Annual third-party audits of our security controls and practices</div>
            </div>
            <div className="ds-badge-card">
              <span className="ds-badge-icon">&#128274;</span>
              <div className="ds-badge-title">256-bit AES Encryption</div>
              <div className="ds-badge-desc">All data encrypted at rest and in transit using AES-256</div>
            </div>
            <div className="ds-badge-card">
              <span className="ds-badge-icon">&#128179;</span>
              <div className="ds-badge-title">Stripe Payments</div>
              <div className="ds-badge-desc">PCI-DSS compliant payment processing via Stripe with escrow</div>
            </div>
            <div className="ds-badge-card">
              <span className="ds-badge-icon">&#127482;&#127466;</span>
              <div className="ds-badge-title">GDPR Compliant</div>
              <div className="ds-badge-desc">Full GDPR compliance with data residency options for EU users</div>
            </div>
          </div>
        </div>

        {/* ── MOBILE APP PREVIEW ──────────────────────────────────────────── */}
        <div className="ds-full-bleed ds-fade">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="ds-mobile-grid" style={isMobile ? { gridTemplateColumns: "1fr", gap: "2rem" } : {}}>
              <div>
                <span className="ds-section-tag">/ Mobile app</span>
                <h2 className="ds-section-title">Your pipeline,<br /><em>in your pocket</em></h2>
                <p className="ds-section-body" style={{ marginBottom: "2rem" }}>Manage deals, review contracts, and get paid on the go. The Dealstage mobile app keeps you connected to every deal — wherever you are.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                  {["Real-time deal notifications and status updates", "Review and sign contracts from your phone", "Track earnings and payment status on the go", "Message brands and talent directly"].map((b) => (
                    <div key={b} className="ds-feature-bullet">
                      <div className="ds-bullet-dot">&#10003;</div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div title="Coming Q3 2026" style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 8, padding: "0.65rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "not-allowed", opacity: 0.45, userSelect: "none" }}>
                      <span style={{ fontSize: "1.25rem" }}>&#63743;</span>
                      <div>
                        <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.55rem", color: "var(--ds-cream3)", letterSpacing: "0.06em" }}>Download on the</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--ds-cream)", fontWeight: 500 }}>App Store</div>
                      </div>
                    </div>
                    <div title="Coming Q3 2026" style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 8, padding: "0.65rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "not-allowed", opacity: 0.45, userSelect: "none" }}>
                      <span style={{ fontSize: "1.25rem" }}>&#9654;</span>
                      <div>
                        <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.55rem", color: "var(--ds-cream3)", letterSpacing: "0.06em" }}>Get it on</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--ds-cream)", fontWeight: 500 }}>Google Play</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", color: "var(--ds-cream3)", letterSpacing: "0.06em" }}>Coming Q3 2026</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="ds-phone-frame">
                  <div className="ds-phone-screen">
                    <div className="ds-phone-header">
                      <div className="ds-phone-logo"><img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 20 }} /></div>
                      <div className="ds-phone-notif" />
                    </div>
                    <div className="ds-phone-card">
                      <div className="ds-phone-card-label">Pipeline Value</div>
                      <div className="ds-phone-card-val">$248,000</div>
                    </div>
                    <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Active Deals</div>
                    {[
                      { name: "Nike × Jordan R.", amt: "$85K", status: "Active" },
                      { name: "Spotify × Mia C.", amt: "$12.5K", status: "Review" },
                      { name: "LV × Zara A.", amt: "$34K", status: "New" },
                    ].map((deal) => (
                      <div key={deal.name} className="ds-phone-deal-row">
                        <span style={{ color: "var(--ds-cream2)" }}>{deal.name}</span>
                        <span style={{ fontFamily: "var(--ds-mono)", color: "var(--ds-gold2)" }}>{deal.amt}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: "auto", background: "var(--ds-ga)", borderRadius: 8, padding: "0.6rem", textAlign: "center", fontFamily: "var(--ds-mono)", fontSize: "0.65rem", color: "#1c1b19", cursor: "pointer" }}>
                      View all deals &#8594;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
        <div className="ds-cta-section ds-fade">
          <div className="ds-cta-glow-l" />
          <div className="ds-cta-glow-r" />
          <h2 className="ds-cta-title">Start building deals<br /><em>today</em></h2>
          <p className="ds-cta-sub">
            Join thousands of talent and brands already on Dealstage.<br />
            Free 7-day trial. No credit card required.
          </p>
          <div className="ds-cta-actions" style={isMobile ? { flexDirection: "column", alignItems: "stretch", maxWidth: 360, margin: "0 auto" } : {}}>
            <button className="ds-btn-hero-primary" onClick={handleGetStarted}>Start free trial</button>
            <a href="#how-it-works" className="ds-btn-hero-secondary">See how it works</a>
          </div>
          <p className="ds-cta-note">Launching Q2 2026 · All talent types welcome · Free to join</p>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="ds-footer" style={isMobile ? { gridTemplateColumns: "1fr", gap: "2rem", padding: "2rem 1.25rem" } : {}}>
          <div>
            <a href="/" className="ds-footer-logo" style={{ display: "flex", alignItems: "center" }}>
              <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 36 }} />
            </a>
            <p className="ds-footer-tagline">The platform where talent meets brands and deals get done.</p>
            <p style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", color: "var(--ds-cream3)", marginTop: "1.5rem" }}>&copy; 2026 DealStage LLC</p>
          </div>
          <div>
            <div className="ds-footer-col-title">Product</div>
            <ul className="ds-footer-links">
              <li><a href="/features/browse-talent">Browse talent</a></li>
              <li><a href="/features/deal-pipeline">Deal pipeline</a></li>
              <li><a href="/features/media-kits">Media kits</a></li>
              <li><a href="/features/payments">Payments</a></li>
              <li><a href="/features/integrations">Integrations</a></li>
            </ul>
          </div>
          <div>
            <div className="ds-footer-col-title">Company</div>
            <ul className="ds-footer-links">
              <li><a href="/About">About</a></li>
              <li><a href="/Customers">Customer stories</a></li>
              <li><a href="/Blog">Blog</a></li>
              <li><a href="/Careers">Careers</a></li>
              <li><a href="/Contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="ds-footer-col-title">Legal</div>
            <ul className="ds-footer-links">
              <li><a href="/privacy">Privacy policy</a></li>
              <li><a href="/terms">Terms of service</a></li>
              <li><a href="/CookiePolicy">Cookie policy</a></li>
              <li><a href="/GDPR">GDPR</a></li>
            </ul>
          </div>
        </footer>
        <div className="ds-footer-bottom">
          <span className="ds-footer-copy">&copy; 2026 DealStage LLC. All rights reserved.</span>
          <span className="ds-footer-copy">Made with Dealstage</span>
        </div>

      </div>
    </>
  );
}

// ─── FEATURE MOCKUP SUB-COMPONENT ────────────────────────────────────────────

function FeatureMockup({ type }) {
  const base = {
    background: "var(--ds-bg2)",
    border: "0.5px solid var(--ds-border2)",
    borderRadius: 12,
    padding: "1.5rem",
    overflow: "hidden",
    minHeight: 280,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  if (type === "mediakits") {
    return (
      <div style={base}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1rem", borderBottom: "0.5px solid var(--ds-border)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--ds-ga)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>📸</div>
          <div>
            <div style={{ fontFamily: "var(--ds-serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--ds-cream)" }}>Zara Ali</div>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.25rem" }}>
              {["Fashion", "Beauty", "Lifestyle"].map((t) => (
                <span key={t} style={{ fontSize: "0.6rem", fontFamily: "var(--ds-mono)", color: "var(--ds-gold2)", background: "var(--ds-gold-dim)", border: "0.5px solid rgba(212,176,78,0.18)", borderRadius: 3, padding: "0.1rem 0.45rem", letterSpacing: "0.04em" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.65rem" }}>
          {[["2.4M", "Followers"], ["8.2%", "Engagement"], ["1.1M", "Avg reach"]].map(([v, l]) => (
            <div key={l} style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 7, padding: "0.7rem", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.95rem", fontWeight: 500, background: "var(--ds-ga-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{v}</div>
              <div style={{ fontSize: "0.58rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)", letterSpacing: "0.04em", marginTop: "0.15rem" }}>{l}</div>
            </div>
          ))}
        </div>
        {[["Instagram post", "$8,500"], ["Reel / TikTok", "$12,000"], ["Brand campaign", "From $35,000"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderTop: "0.5px solid var(--ds-border)", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--ds-cream2)" }}>{l}</span>
            <span style={{ fontFamily: "var(--ds-mono)", color: "var(--ds-cream)", fontSize: "0.82rem" }}>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button style={{ flex: 1, fontFamily: "var(--ds-mono)", fontSize: "0.65rem", background: "var(--ds-ga)", color: "#1c1b19", border: "none", borderRadius: 5, padding: "0.55rem", cursor: "pointer", letterSpacing: "0.04em" }}>Send to brand</button>
          <button style={{ flex: 1, fontFamily: "var(--ds-mono)", fontSize: "0.65rem", background: "none", color: "var(--ds-cream2)", border: "0.5px solid var(--ds-border2)", borderRadius: 5, padding: "0.55rem", cursor: "pointer", letterSpacing: "0.04em" }}>Export PDF</button>
        </div>
      </div>
    );
  }

  if (type === "marketplace") {
    return (
      <div style={base}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--ds-bg4)", border: "0.5px solid var(--ds-border2)", borderRadius: 8, padding: "0.7rem 1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ds-cream3)" }}>&#128269;</span>
          <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.78rem", color: "var(--ds-cream3)" }}>Search talent by name, niche, or location...</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["All", "Athletes", "Creators", "Musicians", "Speakers"].map((f, i) => (
            <span key={f} style={{ fontFamily: "var(--ds-mono)", fontSize: "0.68rem", color: i === 0 ? "var(--ds-gold2)" : "var(--ds-cream3)", background: i === 0 ? "var(--ds-gold-dim)" : "var(--ds-bg3)", border: `0.5px solid ${i === 0 ? "rgba(212,176,78,0.3)" : "var(--ds-border)"}`, borderRadius: 6, padding: "0.3rem 0.75rem", cursor: "pointer", letterSpacing: "0.04em" }}>{f}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {[
            { icon: "&#127942;", name: "Jordan Reeves", type: "Athlete · Basketball", followers: "2.1M", eng: "6.4%", rate: "$45K" },
            { icon: "&#128241;", name: "Mia Chen", type: "Creator · Lifestyle", followers: "890K", eng: "9.1%", rate: "$8K" },
          ].map((c) => (
            <div key={c.name} style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: 90, background: "var(--ds-bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", position: "relative" }}>
                <span dangerouslySetInnerHTML={{ __html: c.icon }} />
                <span style={{ position: "absolute", top: "0.5rem", right: "0.5rem", fontFamily: "var(--ds-mono)", fontSize: "0.55rem", background: "var(--ds-ga)", color: "#1c1b19", borderRadius: 3, padding: "0.1rem 0.4rem", letterSpacing: "0.05em" }}>Verified</span>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--ds-cream)", marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{c.type}</div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)" }}><strong style={{ color: "var(--ds-gold2)" }}>{c.followers}</strong> followers</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)" }}><strong style={{ color: "var(--ds-gold2)" }}>{c.eng}</strong> eng.</span>
                </div>
              </div>
              <div style={{ padding: "0.5rem 0.75rem", borderTop: "0.5px solid var(--ds-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.72rem", color: "var(--ds-cream2)" }}>From <strong style={{ color: "var(--ds-amber2)" }}>{c.rate}</strong></span>
                <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-gold2)", background: "var(--ds-gold-dim)", border: "0.5px solid rgba(212,176,78,0.2)", borderRadius: 4, padding: "0.2rem 0.5rem", cursor: "pointer", letterSpacing: "0.04em" }}>View profile</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "pipeline") {
    return (
      <div style={base}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontFamily: "var(--ds-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--ds-cream)" }}>Deal Pipeline</span>
          <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", background: "var(--ds-ga)", color: "#1c1b19", borderRadius: 4, padding: "0.25rem 0.6rem", cursor: "pointer" }}>+ New Deal</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.65rem" }}>
          {[["$248K", "Pipeline"], ["24", "Active"], ["96%", "Closed"]].map(([v, l]) => (
            <div key={l} style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 7, padding: "0.65rem" }}>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.95rem", fontWeight: 500, background: "var(--ds-ga-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{v}</div>
              <div style={{ fontSize: "0.6rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)", letterSpacing: "0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
        {[
          { init: "NK", name: "Nike × Jordan Reeves", sub: "Athlete · 60 days", amt: "$85,000", status: "Active", pill: { bg: "var(--ds-amber-dim2)", color: "var(--ds-amber2)" } },
          { init: "SP", name: "Spotify × Mia Chen", sub: "Creator · Ongoing", amt: "$12,500", status: "In review", pill: { bg: "var(--ds-gold-dim)", color: "var(--ds-gold2)" } },
          { init: "LV", name: "Louis Vuitton × Zara Ali", sub: "Model · 2 weeks", amt: "$34,000", status: "New", pill: { bg: "rgba(245,240,230,0.06)", color: "var(--ds-cream3)" } },
        ].map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.7rem", background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--ds-ga)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontFamily: "var(--ds-mono)", color: "#1c1b19", flexShrink: 0 }}>{d.init}</div>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--ds-cream)" }}>{d.name}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)" }}>{d.sub}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.75rem", color: "var(--ds-cream)", marginBottom: 2 }}>{d.amt}</div>
              <span style={{ fontSize: "0.52rem", fontFamily: "var(--ds-mono)", letterSpacing: "0.05em", padding: "0.1rem 0.4rem", borderRadius: 100, textTransform: "uppercase", background: d.pill.bg, color: d.pill.color }}>{d.status}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "payments") {
    return (
      <div style={base}>
        <div style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 8, padding: "1rem" }}>
          <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>2026 Earnings</div>
          <div style={{ fontFamily: "var(--ds-serif)", fontSize: "1.75rem", fontWeight: 700, background: "var(--ds-ga-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>$1,248,325</div>
          <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)", marginTop: "0.3rem" }}>&#8593; 34% vs last year</div>
        </div>
        <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Payments</div>
        {[
          { brand: "Nike", talent: "Jordan Reeves", amt: "+$42,500", date: "Mar 15", status: "Paid" },
          { brand: "Spotify", talent: "Mia Chen", amt: "+$6,250", date: "Mar 12", status: "Paid" },
          { brand: "Louis Vuitton", talent: "Zara Ali", amt: "+$17,000", date: "Mar 10", status: "Pending" },
        ].map((p) => (
          <div key={p.brand} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "0.5px solid var(--ds-border)" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--ds-cream)", fontWeight: 400 }}>{p.brand} → {p.talent}</div>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)" }}>{p.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.8rem", color: "var(--ds-gold2)" }}>{p.amt}</div>
              <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.52rem", color: p.status === "Paid" ? "var(--ds-amber2)" : "var(--ds-cream3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "analytics") {
    return (
      <div style={base}>
        <div style={{ fontFamily: "var(--ds-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--ds-cream)" }}>Performance Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.65rem" }}>
          {[["96%", "Close Rate"], ["$248K", "Pipeline"], ["24", "Active Deals"], ["34%", "YoY Growth"]].map(([v, l]) => (
            <div key={l} style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 7, padding: "0.85rem" }}>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "1.1rem", fontWeight: 500, background: "var(--ds-ga-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{v}</div>
              <div style={{ fontSize: "0.62rem", color: "var(--ds-cream3)", fontFamily: "var(--ds-mono)", letterSpacing: "0.04em", marginTop: "0.15rem" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--ds-bg3)", border: "0.5px solid var(--ds-border)", borderRadius: 8, padding: "1rem" }}>
          <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>DEAL VELOCITY (LAST 6 MONTHS)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", height: 72 }}>
            {[45, 60, 72, 55, 88, 96].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? "var(--ds-ga)" : "var(--ds-border2)", borderRadius: "3px 3px 0 0", transition: "background 0.2s" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "ai") {
    return (
      <div style={base}>
        <div style={{ fontFamily: "var(--ds-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--ds-cream)" }}>AI Match Engine</div>
        <div style={{ background: "linear-gradient(135deg, var(--ds-bg3) 0%, rgba(212,176,78,0.06) 100%)", border: "0.5px solid rgba(212,176,78,0.2)", borderRadius: 8, padding: "1rem" }}>
          <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-gold2)", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>TOP MATCH · 97% COMPATIBILITY</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--ds-ga)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏆</div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--ds-cream)" }}>Jordan Reeves × Nike</div>
              <div style={{ fontFamily: "var(--ds-mono)", fontSize: "0.6rem", color: "var(--ds-cream3)" }}>Athlete · 2.1M followers · 6.4% eng.</div>
            </div>
          </div>
        </div>
        {[["Audience fit", 97], ["Category alignment", 94], ["Rate compatibility", 88], ["Deal history", 92], ["Engagement quality", 96]].map(([label, score]) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", color: "var(--ds-cream2)" }}>{label}</span>
              <span style={{ fontFamily: "var(--ds-mono)", fontSize: "0.62rem", color: "var(--ds-gold2)" }}>{score}%</span>
            </div>
            <div style={{ height: 4, background: "var(--ds-border2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score}%`, background: "var(--ds-ga)", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div style={base} />;
}

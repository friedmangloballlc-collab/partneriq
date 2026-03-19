import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  RefreshCw,
  Calendar,
  Webhook,
  ArrowRight,
  CheckCircle,
  Plus,
  Zap,
  Globe,
} from "lucide-react";

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
const T = {
  bg:        "#080807",
  bgCard:    "#0e0d0b",
  bgCardAlt: "#121109",
  gold:      "#c4a24a",
  goldLight: "#d4b86a",
  goldDim:   "#8a6f2e",
  amber:     "#e07b18",
  cream:     "#f5f0e6",
  creamDim:  "#b8b0a0",
  border:    "rgba(196,162,74,0.18)",
  borderAlt: "rgba(196,162,74,0.10)",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500;1,700&family=Instrument+Sans:wght@300;400;500;600&family=Instrument+Mono:wght@400;500&display=swap');`;

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans  = { fontFamily: "'Instrument Sans', system-ui, sans-serif" };
const mono  = { fontFamily: "'Instrument Mono', 'Courier New', monospace" };

/* ─────────────────────────────────────────────
   FADE
───────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Fade({ children, delay = 0, style = {} }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: 0, transform: "translateY(32px)", transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function GoldRule() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.3, maxWidth: 1100, margin: "0 auto" }} />;
}

function SectionLabel({ children }) {
  return (
    <span style={{ ...mono, fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, display: "block", marginBottom: 16 }}>
      {children}
    </span>
  );
}

function CTAButton({ children, primary, to }) {
  return (
    <Link
      to={to || "/Onboarding"}
      style={{
        ...sans, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px",
        borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em", transition: "all 0.25s ease",
        ...(primary
          ? { background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg }
          : { background: "transparent", color: T.cream, border: `1px solid ${T.border}` }),
      }}
      onMouseEnter={e => { if (primary) e.currentTarget.style.opacity = "0.88"; else e.currentTarget.style.borderColor = T.gold; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; if (!primary) e.currentTarget.style.borderColor = T.border; }}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CAPABILITIES
───────────────────────────────────────────── */
const CAPABILITIES = [
  { Icon: ShieldCheck, title: "Social Platform Verification", desc: "Connect and verify accounts across 88 social platforms. Followers, engagement, and audience quality data flows in automatically — always current." },
  { Icon: RefreshCw, title: "CRM Sync", desc: "Two-way sync with HubSpot, Salesforce, and 10 other CRMs. Contact records, deal stages, and notes stay consistent across your entire stack." },
  { Icon: Calendar, title: "Calendar Integration", desc: "Sync campaign milestones, call schedules, and deliverable deadlines to Google Calendar, Outlook, and Apple Calendar automatically." },
  { Icon: Webhook, title: "Webhook API", desc: "Push Dealstage events to any endpoint — Zapier, Make, or your own services. Build custom automations on top of our real-time data stream." },
];

/* ─────────────────────────────────────────────
   INTEGRATIONS DATA
───────────────────────────────────────────── */
const INTEGRATIONS = [
  { name: "Instagram",      emoji: "📸", category: "Social",   connected: true  },
  { name: "TikTok",         emoji: "🎵", category: "Social",   connected: true  },
  { name: "YouTube",        emoji: "▶️",  category: "Social",   connected: true  },
  { name: "Spotify",        emoji: "🎧", category: "Social",   connected: true  },
  { name: "Twitter / X",    emoji: "✖️",  category: "Social",   connected: false },
  { name: "LinkedIn",       emoji: "💼", category: "Social",   connected: true  },
  { name: "Stripe",         emoji: "💳", category: "Payments", connected: true  },
  { name: "Google Cal",     emoji: "📅", category: "Calendar", connected: true  },
  { name: "Slack",          emoji: "💬", category: "Comms",    connected: false },
  { name: "HubSpot",        emoji: "🟠", category: "CRM",      connected: true  },
  { name: "Salesforce",     emoji: "☁️",  category: "CRM",      connected: false },
  { name: "Zapier",         emoji: "⚡", category: "Automation",connected: false },
];

const CATEGORY_COLORS = {
  Social:     { bg: "rgba(96,165,250,0.1)",  text: "#60a5fa",  border: "rgba(96,165,250,0.2)"  },
  Payments:   { bg: "rgba(99,91,255,0.1)",   text: "#8b83ff",  border: "rgba(99,91,255,0.2)"   },
  Calendar:   { bg: "rgba(34,197,94,0.1)",   text: "#22c55e",  border: "rgba(34,197,94,0.2)"   },
  CRM:        { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b",  border: "rgba(245,158,11,0.2)"  },
  Comms:      { bg: "rgba(236,72,153,0.1)",  text: "#ec4899",  border: "rgba(236,72,153,0.2)"  },
  Automation: { bg: "rgba(196,162,74,0.1)",  text: T.gold,     border: T.border                },
};

function IntegrationGrid() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / settings / integrations</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ ...mono, fontSize: 10, padding: "3px 10px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>7 CONNECTED</span>
          <span style={{ ...mono, fontSize: 10, padding: "3px 10px", borderRadius: 4, background: "rgba(196,162,74,0.1)", color: T.gold, border: `1px solid ${T.borderAlt}` }}>88 TOTAL</span>
        </div>
      </div>

      <div style={{ padding: "28px" }}>
        {/* Search + Filter Row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
          <div style={{ flex: 1, background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 8, padding: "10px 14px", ...sans, fontSize: 13, color: T.creamDim, display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={14} style={{ color: T.goldDim }} />
            <span>Search integrations...</span>
          </div>
          {["All", "Social", "CRM", "Automation"].map((tab, i) => (
            <span key={i} style={{ ...mono, fontSize: 11, padding: "7px 14px", borderRadius: 6, background: i === 0 ? "rgba(196,162,74,0.12)" : "transparent", border: `1px solid ${i === 0 ? T.border : T.borderAlt}`, color: i === 0 ? T.gold : T.creamDim, cursor: "pointer", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              {tab}
            </span>
          ))}
        </div>

        {/* Integration Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {INTEGRATIONS.map((intg, i) => {
            const cat = CATEGORY_COLORS[intg.category] || CATEGORY_COLORS.Social;
            return (
              <div key={i} style={{
                background: T.bgCardAlt,
                border: `1px solid ${intg.connected ? T.border : T.borderAlt}`,
                borderRadius: 12,
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "border-color 0.2s, transform 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = intg.connected ? T.border : T.borderAlt; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Logo */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {intg.emoji}
                </div>
                {/* Name + Category */}
                <div>
                  <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream, marginBottom: 3 }}>{intg.name}</div>
                  <span style={{ ...mono, fontSize: 9, padding: "2px 6px", borderRadius: 3, background: cat.bg, color: cat.text, letterSpacing: "0.06em" }}>{intg.category.toUpperCase()}</span>
                </div>
                {/* Status */}
                {intg.connected ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle size={11} style={{ color: "#22c55e" }} />
                    <span style={{ ...mono, fontSize: 10, color: "#22c55e" }}>Connected</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                    <Plus size={11} style={{ color: T.goldDim }} />
                    <span style={{ ...mono, fontSize: 10, color: T.goldDim }}>Connect</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Row */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(196,162,74,0.04)", border: `1px solid ${T.borderAlt}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={14} style={{ color: T.gold, flexShrink: 0 }} />
          <span style={{ ...sans, fontSize: 13, color: T.creamDim }}>
            Don't see your tool? <span style={{ color: T.gold, cursor: "pointer" }}>Request an integration</span> or connect via our <span style={{ color: T.gold, cursor: "pointer" }}>Webhook API</span>.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureIntegrations() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(196,162,74,0.25); color: #f5f0e6; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,7,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.borderAlt}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ ...serif, fontSize: 20, fontWeight: 700, color: T.gold, textDecoration: "none", letterSpacing: "0.04em" }}>Dealstage</Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/login" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px", borderRadius: 6 }}>Log in</Link>
          <Link to="/Onboarding" style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.bg, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "8px 18px", borderRadius: 6 }}>Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "160px 24px 96px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Integrations</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Connect everything{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              you already use
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Dealstage integrates with 88+ platforms and the tools your team relies on — social networks, CRMs, calendars, payment processors, and automation tools.
          </p>
        </Fade>
        <Fade delay={220}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start free trial <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Pricing">See pricing</CTAButton>
          </div>
        </Fade>
        <Fade delay={320}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 56, flexWrap: "wrap" }}>
            {[["88+", "Social Platforms"], ["12", "CRM Integrations"], ["Real-time", "Data Sync"]].map(([val, lbl], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ ...serif, fontSize: 30, fontWeight: 700, color: T.gold }}>{val}</div>
                <div style={{ ...mono, fontSize: 11, color: T.creamDim, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* CAPABILITIES */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Core Capabilities</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 56, maxWidth: 480 }}>
            Your stack, fully connected
          </h2>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {CAPABILITIES.map(({ Icon, title, desc }, i) => (
            <Fade key={i} delay={i * 80}>
              <div
                style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 24px", height: "100%", transition: "border-color 0.25s, transform 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(196,162,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={22} style={{ color: T.gold }} />
                </div>
                <h3 style={{ ...sans, fontSize: 16, fontWeight: 600, color: T.cream, marginBottom: 10 }}>{title}</h3>
                <p style={{ ...sans, fontSize: 14, color: T.creamDim, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      <GoldRule />

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The integrations panel
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Connect platforms with one click. See connection status, sync health, and manage OAuth permissions from one place.
          </p>
        </Fade>
        <Fade delay={100}>
          <IntegrationGrid />
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(196,162,74,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
              {[["88", "Verified Platforms"], ["12", "CRM Integrations"], ["Real-time", "Sync"]].map(([val, lbl], i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ ...serif, fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 700, color: T.gold, marginBottom: 10 }}>{val}</div>
                  <div style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.12em", textTransform: "uppercase" }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>88 VERIFIED PLATFORMS · 12 CRM INTEGRATIONS · REAL-TIME SYNC</div>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Explore integrations
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Connect your first platform in under 60 seconds. No engineering needed.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Explore integrations <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Pricing">See pricing</CTAButton>
          </div>
        </Fade>
      </section>

      <GoldRule />
      <div style={{ textAlign: "center", padding: "28px 24px", ...sans, fontSize: 13, color: T.creamDim }}>
        © 2026 Dealstage · <Link to="/privacy" style={{ color: T.creamDim, textDecoration: "none" }}>Privacy</Link> · <Link to="/terms" style={{ color: T.creamDim, textDecoration: "none" }}>Terms</Link>
      </div>
    </div>
  );
}

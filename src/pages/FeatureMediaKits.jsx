import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Download,
  Palette,
  ArrowRight,
  RefreshCw,
  Users,
  Eye,
  Heart,
  MapPin,
  CheckCircle,
  ExternalLink,
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
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
  { Icon: RefreshCw, title: "Live Social Stats", desc: "Follower counts, engagement rates, and view averages pull directly from connected platforms and update every 24 hours. No manual refresh needed." },
  { Icon: DollarSign, title: "Custom Rate Cards", desc: "Set your rates for posts, stories, reels, videos, and appearances. Agencies can configure commission tiers. Everything in one shareable doc." },
  { Icon: Download, title: "One-Click PDF Export", desc: "Generate a polished, print-ready PDF in seconds. Client receives a branded doc that looks like your team spent hours on it." },
  { Icon: Palette, title: "Branded Templates", desc: "Choose from 12 professional templates or customize with your brand colors, fonts, and logo. White-label for agency use." },
];

/* ─────────────────────────────────────────────
   MEDIA KIT MOCKUP
───────────────────────────────────────────── */
const SOCIAL_STATS = [
  { platform: "Instagram", Icon: Users, value: "2.4M", label: "Followers", delta: "+12K this week" },
  { platform: "Engagement", Icon: Heart, value: "6.8%", label: "Avg Engagement", delta: "Above industry avg" },
  { platform: "Avg Views", Icon: Eye, value: "340K", label: "Per Video", delta: "TikTok + YouTube" },
  { platform: "Audience", Icon: MapPin, value: "68%", label: "US Audience", delta: "25–34 primary demo" },
];

const RATE_CARD = [
  { type: "Instagram Post", rate: "$8,500" },
  { type: "Instagram Story (3x)", rate: "$4,200" },
  { type: "TikTok Video", rate: "$11,000" },
  { type: "YouTube Integration", rate: "$18,500" },
  { type: "Brand Ambassador (3mo)", rate: "$45,000" },
];

function MediaKitMockup() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / media-kit / maya-chen</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          <span style={{ ...mono, fontSize: 10, color: "#22c55e" }}>LIVE</span>
        </div>
      </div>

      <div style={{ padding: "32px 28px" }}>
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.borderAlt}` }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...serif, fontSize: 28, fontWeight: 700, color: T.bg, border: `3px solid ${T.gold}` }}>
            M
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h3 style={{ ...serif, fontSize: 24, fontWeight: 700, color: T.cream }}>Maya Chen</h3>
              <CheckCircle size={16} style={{ color: T.gold }} />
            </div>
            <p style={{ ...sans, fontSize: 13, color: T.creamDim, lineHeight: 1.5, maxWidth: 360 }}>
              Fitness & lifestyle creator. NASM certified trainer. Brand partner with Nike, Lululemon & Reebok.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <div style={{ ...sans, fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={13} /> Export PDF
            </div>
            <div style={{ ...sans, fontSize: 12, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, color: T.cream, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <ExternalLink size={13} /> Share link
            </div>
          </div>
        </div>

        {/* Social Stat Cards */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ ...mono, fontSize: 10, color: T.goldDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>Live Platform Stats</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
            {SOCIAL_STATS.map((s, i) => (
              <div key={i} style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 10, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <s.Icon size={16} style={{ color: T.goldDim }} />
                </div>
                <div style={{ ...sans, fontSize: 20, fontWeight: 700, color: T.gold, marginBottom: 4 }}>{s.value}</div>
                <div style={{ ...mono, fontSize: 9, color: T.creamDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ ...sans, fontSize: 10, color: T.creamDim, opacity: 0.7 }}>{s.delta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Card */}
        <div>
          <span style={{ ...mono, fontSize: 10, color: T.goldDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>Rate Card</span>
          <div style={{ marginTop: 12, background: T.bgCardAlt, borderRadius: 10, border: `1px solid ${T.borderAlt}`, overflow: "hidden" }}>
            {RATE_CARD.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < RATE_CARD.length - 1 ? `1px solid ${T.borderAlt}` : "none" }}>
                <span style={{ ...sans, fontSize: 13, color: T.cream }}>{r.type}</span>
                <span style={{ ...sans, fontSize: 13, fontWeight: 700, color: T.gold }}>{r.rate}</span>
              </div>
            ))}
          </div>
          <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 8, opacity: 0.7 }}>* Custom packages available · Updated March 2026</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureMediaKits() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
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
          <SectionLabel>Media Kits</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Auto-updating media kits{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              that close deals
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            No more outdated PDFs. Your media kit pulls live stats from connected platforms and stays current 24/7 — so brands always see your real numbers.
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
            {[["3x", "More Brand Responses"], ["24/7", "Live Data Sync"], ["12", "Pro Templates"]].map(([val, lbl], i) => (
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
            Your kit, always impressive
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
            What brands actually see
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            A professional, data-rich media kit that updates in real time. Share a link or export a PDF in one click.
          </p>
        </Fade>
        <Fade delay={100}>
          <MediaKitMockup />
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(196,162,74,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>3×</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>more brand responses for media kits with live stats</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>BASED ON PLATFORM DATA ACROSS 5,000+ OUTREACH CAMPAIGNS</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Build your media kit
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Connect your platforms and go live in under 5 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Build your media kit <ArrowRight size={15} /></CTAButton>
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

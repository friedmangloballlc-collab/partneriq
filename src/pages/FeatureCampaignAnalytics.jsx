import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  BarChart2,
  TrendingUp,
  Sparkles,
  FileText,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
const T = {
  bg:        "#1c1b19",
  bgCard:    "#0e0d0b",
  bgCardAlt: "#121109",
  gold:      "#d4b04e",
  goldLight: "#d4b86a",
  goldDim:   "#8a6f2e",
  amber:     "#e07b18",
  cream:     "#f5f0e6",
  creamDim:  "#b8b0a0",
  border:    "rgba(212,176,78,0.18)",
  borderAlt: "rgba(212,176,78,0.10)",
};

/* ─────────────────────────────────────────────
   FONTS
───────────────────────────────────────────── */
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500;1,700&family=Instrument+Sans:wght@300;400;500;600&family=Instrument+Mono:wght@400;500&display=swap');`;

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans  = { fontFamily: "'Instrument Sans', system-ui, sans-serif" };
const mono  = { fontFamily: "'Instrument Mono', 'Courier New', monospace" };

/* ─────────────────────────────────────────────
   FADE HOOK
───────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
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
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(32px)",
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */
function GoldRule() {
  return (
    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.3, maxWidth: 1100, margin: "0 auto" }} />
  );
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
        ...sans,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        letterSpacing: "0.02em",
        transition: "all 0.25s ease",
        ...(primary
          ? { background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg }
          : { background: "transparent", color: T.cream, border: `1px solid ${T.border}` }),
      }}
      onMouseEnter={e => {
        if (primary) e.currentTarget.style.opacity = "0.88";
        else e.currentTarget.style.borderColor = T.gold;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = "1";
        if (!primary) e.currentTarget.style.borderColor = T.border;
      }}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CAPABILITY CARDS
───────────────────────────────────────────── */
const CAPABILITIES = [
  {
    Icon: BarChart2,
    title: "Real-Time Dashboard",
    desc: "Live campaign metrics across all active partnerships — impressions, clicks, conversions, and spend — updated as they happen. No more waiting for weekly reports.",
  },
  {
    Icon: TrendingUp,
    title: "ROI Attribution",
    desc: "Track exactly which creator drove which conversions. Last-click, multi-touch, and custom attribution windows give you the complete revenue picture.",
  },
  {
    Icon: Sparkles,
    title: "AI Performance Predictions",
    desc: "Predict campaign outcome before launch using historical data, audience overlap, and category benchmarks. Know your expected ROI before you sign.",
  },
  {
    Icon: FileText,
    title: "Custom Reports",
    desc: "Build and export reports tailored to your stakeholders. Choose your metrics, set your date ranges, and schedule automated delivery to your inbox.",
  },
];

/* ─────────────────────────────────────────────
   MOCKUP: ANALYTICS DASHBOARD
───────────────────────────────────────────── */
const BAR_DATA = [
  { month: "Oct", value: 62 },
  { month: "Nov", value: 78 },
  { month: "Dec", value: 55 },
  { month: "Jan", value: 88 },
  { month: "Feb", value: 72 },
  { month: "Mar", value: 100 },
];

const KPI_CARDS = [
  { label: "Total Reach", value: "12.4M", delta: "+18%" },
  { label: "Engagement Rate", value: "4.8%", delta: "+0.6%" },
  { label: "Conversions", value: "24.5K", delta: "+32%" },
  { label: "ROI", value: "312%", delta: "+44%" },
];

const TOP_CREATORS = [
  { name: "Maya Chen", platform: "IG", conversions: "8.2K", roi: "418%" },
  { name: "Jordan Wells", platform: "TT", conversions: "6.7K", roi: "389%" },
  { name: "Rina Alvarez", platform: "YT", conversions: "4.1K", roi: "271%" },
];

function AnalyticsMockup() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / analytics</span>
      </div>

      <div style={{ padding: "28px 28px 32px" }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {KPI_CARDS.map((kpi, i) => (
            <div key={i} style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ ...mono, fontSize: 10, color: T.creamDim, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>{kpi.label}</div>
              <div style={{ ...sans, fontSize: 20, fontWeight: 700, color: T.cream, marginBottom: 4 }}>{kpi.value}</div>
              <div style={{ ...mono, fontSize: 11, color: T.amber }}>{kpi.delta} vs last period</div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 12, padding: "20px 20px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.cream }}>Campaign ROI — Last 6 Months</span>
            <span style={{ ...mono, fontSize: 10, color: T.goldDim }}>LIVE DATA</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
            {BAR_DATA.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%",
                  height: `${bar.value * 0.8}%`,
                  background: i === BAR_DATA.length - 1
                    ? `linear-gradient(180deg, ${T.gold}, ${T.amber})`
                    : `rgba(212,176,78,0.25)`,
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                }} />
                <span style={{ ...mono, fontSize: 9, color: T.creamDim, letterSpacing: "0.06em" }}>{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Creators Table */}
        <div style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderAlt}` }}>
            <span style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.cream }}>Top Performing Creators</span>
          </div>
          {TOP_CREATORS.map((creator, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < TOP_CREATORS.length - 1 ? `1px solid ${T.borderAlt}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 12, fontWeight: 700, color: T.bg, flexShrink: 0 }}>
                {creator.name[0]}
              </div>
              <span style={{ ...sans, fontSize: 13, color: T.cream, flex: 1 }}>{creator.name}</span>
              <span style={{ ...mono, fontSize: 10, color: T.creamDim, padding: "3px 8px", background: "rgba(212,176,78,0.08)", borderRadius: 4 }}>{creator.platform}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream }}>{creator.conversions}</div>
                <div style={{ ...mono, fontSize: 10, color: T.amber }}>{creator.roi} ROI</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureCampaignAnalytics() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO title="Campaign Analytics" description="Track every campaign's performance in real time. Real-time dashboards, ROI tracking, and AI-powered insights for creator partnerships." />
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 50% { opacity: 0; } }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fp-nav-links { display: none !important; }
          .fp-nav { padding: 0 16px !important; }
          .fp-hero { padding: 100px 20px 64px !important; }
          .fp-caps-grid { grid-template-columns: 1fr !important; }
          .fp-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fp-mockup-overflow { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .fp-stat-row { gap: 16px !important; }
          .fp-footer-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="fp-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,7,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.borderAlt}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ ...serif, fontSize: 20, fontWeight: 700, color: T.gold, textDecoration: "none", letterSpacing: "0.04em" }}>Dealstage</Link>
        <div className="fp-nav-links" style={{ display: "flex", gap: 8 }}>
          <Link to="/login" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px", borderRadius: 6 }}>Log in</Link>
          <Link to="/Onboarding" style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.bg, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "8px 18px", borderRadius: 6 }}>Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 160, paddingBottom: 96, textAlign: "center", maxWidth: 860, margin: "0 auto", padding: "160px 24px 96px" }}>
        <Fade>
          <SectionLabel>Campaign Analytics</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Track every campaign's performance{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              in real time
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            From impressions to conversions — see exactly how your creator partnerships perform. Real-time dashboards, ROI tracking, and AI-powered insights.
          </p>
        </Fade>
        <Fade delay={220}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start free trial <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Demo">Book a demo</CTAButton>
          </div>
        </Fade>

        <Fade delay={280}>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem", marginTop: "2rem" }}>
            {[
              { role: "For Brands", text: "See which creators actually drive your sales and revenue" },
              { role: "For Talent", text: "Prove your value to brands with verified performance data" },
              { role: "For Agencies", text: "Consolidate campaign reporting across your entire client roster" },
            ].map(item => (
              <div key={item.role} style={{ padding: "0.6rem 1.25rem", borderRadius: 8, border: "0.5px solid rgba(212,176,78,0.2)", background: "rgba(212,176,78,0.04)", fontSize: "0.78rem", color: "rgba(245,240,230,0.5)" }}>
                <span style={{ color: "#d4b04e", fontWeight: 500 }}>{item.role}:</span> {item.text}
              </div>
            ))}
          </div>
        </Fade>

        {/* Hero stats */}
        <Fade delay={320}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 56, flexWrap: "wrap" }}>
            {[["312%", "Avg Campaign ROI"], ["Real-Time", "Data Updates"], ["10+", "Attribution Models"]].map(([val, lbl], i) => (
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
            Analytics built for creator partnerships
          </h2>
        </Fade>
        <div className="fp-caps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {CAPABILITIES.map(({ Icon, title, desc }, i) => (
            <Fade key={i} delay={i * 80}>
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "28px 24px",
                  height: "100%",
                  transition: "border-color 0.25s, transform 0.25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(212,176,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
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

      {/* TESTIMONIAL */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 0" }}>
        <Fade>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem", textAlign: "center", borderLeft: "2px solid #d4b04e", background: "rgba(212,176,78,0.03)", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>"We finally know which creators actually drive sales. DealStage analytics replaced 3 separate tools."</p>
            <p style={{ fontSize: "0.75rem", color: "#d4b04e", fontFamily: "'Instrument Mono', monospace" }}>— VP Marketing, DTC Brand</p>
          </div>
        </Fade>
      </section>

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The analytics dashboard
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Every metric you need, in one view. Track performance across all your creator partnerships with data that updates as it happens.
          </p>
        </Fade>
        <Fade delay={100}>
          <div className="fp-mockup-overflow">
            <AnalyticsMockup />
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(212,176,78,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>312%</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>average campaign ROI tracked through DealStage</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>ACROSS ALL ACTIVE BRAND PARTNERSHIPS</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Stop guessing. Start knowing.
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Join the brands and agencies who track campaign ROI with DealStage analytics.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start tracking campaigns <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Demo">Book a demo</CTAButton>
          </div>
        </Fade>
      </section>

      {/* FOOTER LINE */}
      <GoldRule />
      <div style={{ textAlign: "center", padding: "28px 24px", ...sans, fontSize: 13, color: T.creamDim }}>
        © 2026 Dealstage · <Link to="/privacy" style={{ color: T.creamDim, textDecoration: "none" }}>Privacy</Link> · <Link to="/terms" style={{ color: T.creamDim, textDecoration: "none" }}>Terms</Link>
      </div>
    </div>
  );
}

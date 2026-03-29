import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { CheckCircle, XCircle, ArrowRight, Minus } from "lucide-react";

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
const T = {
  bg:        "#1c1b19",
  bgCard:    "#0e0d0b",
  bgCardAlt: "#121109",
  gold:      "#d4b04e",
  amber:     "#e07b18",
  cream:     "#f5f0e6",
  creamDim:  "#b8b0a0",
  border:    "rgba(212,176,78,0.18)",
  borderAlt: "rgba(212,176,78,0.10)",
  green:     "#34d399",
  red:       "#f87171",
  muted:     "#6b7280",
};

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans  = { fontFamily: "'Instrument Sans', system-ui, sans-serif" };
const mono  = { fontFamily: "'Instrument Mono', 'Courier New', monospace" };

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
    <div ref={ref} style={{ opacity: 0, transform: "translateY(28px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function GoldRule() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.3, maxWidth: 1100, margin: "0 auto" }} />;
}

function SectionLabel({ children }) {
  return <span style={{ ...mono, fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, display: "block", marginBottom: 16 }}>{children}</span>;
}

/* ─────────────────────────────────────────────
   COMPARISON DATA — DealStage vs CreatorIQ
───────────────────────────────────────────── */
const COMPETITOR = "CreatorIQ";

const PRICING_ROWS = [
  { label: "Starting price",      dealstage: "Free tier available",        competitor: "$36,000 / year" },
  { label: "Monthly equivalent",  dealstage: "From $0 (paid from $49/mo)", competitor: "$3,000 / mo minimum" },
  { label: "Free trial",          dealstage: "Yes — no credit card",       competitor: "Enterprise demo only" },
  { label: "Contract required",   dealstage: "No",                         competitor: "Annual enterprise contract" },
  { label: "Manager role",        dealstage: "Dedicated plan from $149/mo", competitor: "Not available" },
];

const FEATURE_ROWS = [
  { feature: "Free tier",                     dealstage: true,  creatoriq: false },
  { feature: "AI Match Engine",               dealstage: true,  creatoriq: "partial" },
  { feature: "Monte Carlo ROI Simulator",     dealstage: true,  creatoriq: false },
  { feature: "Pitch Competition marketplace", dealstage: true,  creatoriq: false },
  { feature: "Personal Manager role",         dealstage: true,  creatoriq: false },
  { feature: "88 platform integrations",      dealstage: true,  creatoriq: "partial" },
  { feature: "Contract templates",            dealstage: true,  creatoriq: true },
  { feature: "Talent CRM",                    dealstage: true,  creatoriq: true },
  { feature: "Campaign analytics",            dealstage: true,  creatoriq: true },
  { feature: "Enterprise / agency tier",      dealstage: true,  creatoriq: true },
];

const CHOOSE_COMPETITOR = [
  "You are a Fortune 500 brand or large agency with $500K+ annual influencer budget",
  "You need CreatorIQ's deep enterprise reporting and executive dashboards",
  "You require custom API integrations with your existing martech stack",
  "Your team has already gone through a formal CreatorIQ procurement process",
];

const CHOOSE_DEALSTAGE = [
  "You want to start without a $36,000/year enterprise contract",
  "You are a talent, personal manager, or boutique agency — not just a large brand",
  "You need AI-powered brand-talent matching, not just advanced search filters",
  "You want the Monte Carlo ROI Simulator to model deal value before committing",
  "You need a Pitch Competition feature where brands compete for your talent",
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function CompareCreatorIQ() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO
        title={`DealStage vs ${COMPETITOR}`}
        description={`An honest comparison of DealStage vs ${COMPETITOR}. See pricing, features, and who each platform is actually built for.`}
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border-bottom: 1px solid rgba(212,176,78,0.08); }
        @media (max-width: 768px) {
          .cmp-nav-links { display: none !important; }
          .cmp-hero { padding: 100px 20px 64px !important; }
          .cmp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .cmp-who-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,7,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.borderAlt}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ ...serif, fontSize: 20, fontWeight: 700, color: T.gold, textDecoration: "none", letterSpacing: "0.04em" }}>Dealstage</Link>
        <div className="cmp-nav-links" style={{ display: "flex", gap: 8 }}>
          <Link to="/pricing" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px" }}>Pricing</Link>
          <Link to="/login" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px" }}>Log in</Link>
          <Link to="/Onboarding" style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.bg, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "8px 18px", borderRadius: 6 }}>Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cmp-hero" style={{ padding: "140px 24px 80px", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade>
          <SectionLabel>Honest Comparison</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.08, color: T.cream, marginBottom: 28 }}>
            DealStage vs{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {COMPETITOR}
            </span>
          </h1>
        </Fade>
        <Fade delay={100}>
          <p style={{ ...sans, fontSize: "clamp(15px, 2vw, 18px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
            An honest, feature-by-feature comparison. No fluff — just the facts on pricing, features, and who each platform is built for.
          </p>
        </Fade>
      </section>

      <GoldRule />

      {/* TL;DR */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 24px" }}>
        <Fade>
          <SectionLabel>TL;DR</SectionLabel>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "36px 32px" }}>
            <p style={{ ...sans, fontSize: 17, color: T.cream, lineHeight: 1.75, marginBottom: 16 }}>
              <strong style={{ color: T.gold }}>CreatorIQ</strong> is a premium enterprise influencer intelligence platform used by large global brands, starting at <strong>$36,000/year</strong>. It provides deep campaign measurement, executive reporting, and complex multi-brand portfolio management for Fortune 500 marketing teams.
            </p>
            <p style={{ ...sans, fontSize: 17, color: T.cream, lineHeight: 1.75 }}>
              <strong style={{ color: T.gold }}>DealStage</strong> starts free, includes an AI Match Engine, a Monte Carlo ROI Simulator, a Pitch Competition feature, and the only platform with a dedicated <strong>personal manager role</strong> — serving brands, talent, agencies, and managers without a $36K annual lock-in.
            </p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* PRICING TABLE */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <Fade>
          <SectionLabel>Pricing Comparison</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: T.cream, marginBottom: 40 }}>
            $36,000/year vs starting free
          </h2>
        </Fade>
        <Fade delay={80}>
          <div className="cmp-table-wrap" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
            <table>
              <thead>
                <tr style={{ background: T.bgCardAlt }}>
                  <th style={{ ...mono, fontSize: 11, color: T.creamDim, padding: "16px 18px", textAlign: "left", letterSpacing: "0.1em", fontWeight: 500, width: "34%" }}>PRICING DETAIL</th>
                  <th style={{ ...mono, fontSize: 11, color: T.gold, padding: "16px 18px", textAlign: "left", letterSpacing: "0.1em", fontWeight: 600 }}>DEALSTAGE</th>
                  <th style={{ ...mono, fontSize: 11, color: T.creamDim, padding: "16px 18px", textAlign: "left", letterSpacing: "0.1em", fontWeight: 500 }}>{COMPETITOR.toUpperCase()}</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_ROWS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(212,176,78,0.02)" }}>
                    <td style={{ ...sans, fontSize: 14, color: T.creamDim, padding: "14px 18px", fontWeight: 500 }}>{row.label}</td>
                    <td style={{ ...sans, fontSize: 13, color: T.green, padding: "14px 18px", fontWeight: 500 }}>{row.dealstage}</td>
                    <td style={{ ...sans, fontSize: 13, color: T.creamDim, padding: "14px 18px" }}>{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* FEATURE TABLE */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <Fade>
          <SectionLabel>Feature Comparison</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: T.cream, marginBottom: 40 }}>
            What you actually get
          </h2>
        </Fade>
        <Fade delay={80}>
          <div className="cmp-table-wrap" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
            <table>
              <thead>
                <tr style={{ background: T.bgCardAlt }}>
                  <th style={{ ...mono, fontSize: 11, color: T.creamDim, padding: "16px 18px", textAlign: "left", letterSpacing: "0.1em", fontWeight: 500, width: "44%" }}>FEATURE</th>
                  <th style={{ ...mono, fontSize: 11, color: T.gold, padding: "16px 18px", textAlign: "center", letterSpacing: "0.1em", fontWeight: 600 }}>DEALSTAGE</th>
                  <th style={{ ...mono, fontSize: 11, color: T.creamDim, padding: "16px 18px", textAlign: "center", letterSpacing: "0.1em", fontWeight: 500 }}>{COMPETITOR.toUpperCase()}</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(212,176,78,0.02)" }}>
                    <td style={{ ...sans, fontSize: 14, color: T.cream, padding: "14px 18px" }}>{row.feature}</td>
                    <td style={{ textAlign: "center", padding: "14px 18px" }}>
                      {row.dealstage === true ? <CheckCircle size={18} style={{ color: T.green }} /> : <XCircle size={18} style={{ color: T.red }} />}
                    </td>
                    <td style={{ textAlign: "center", padding: "14px 18px" }}>
                      {row.creatoriq === true ? <CheckCircle size={18} style={{ color: T.green }} /> :
                       row.creatoriq === "partial" ? <Minus size={18} style={{ color: T.amber }} /> :
                       <XCircle size={18} style={{ color: T.red }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* WHO SHOULD CHOOSE */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <Fade>
          <SectionLabel>The Honest Take</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: T.cream, marginBottom: 48 }}>
            Which platform is right for you?
          </h2>
        </Fade>
        <div className="cmp-who-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Fade delay={60}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "32px 28px" }}>
              <div style={{ ...mono, fontSize: 11, color: T.creamDim, letterSpacing: "0.15em", marginBottom: 20 }}>CHOOSE {COMPETITOR.toUpperCase()} IF…</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {CHOOSE_COMPETITOR.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle size={15} style={{ color: T.muted, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ ...sans, fontSize: 14, color: T.creamDim, lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
          <Fade delay={120}>
            <div style={{ background: "rgba(212,176,78,0.05)", border: `1px solid ${T.gold}`, borderRadius: 14, padding: "32px 28px" }}>
              <div style={{ ...mono, fontSize: 11, color: T.gold, letterSpacing: "0.15em", marginBottom: 20 }}>CHOOSE DEALSTAGE IF…</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {CHOOSE_DEALSTAGE.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle size={15} style={{ color: T.green, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ ...sans, fontSize: 14, color: T.cream, lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <GoldRule />

      {/* CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Try DealStage free — no $36K commitment
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, lineHeight: 1.65, maxWidth: 460, margin: "0 auto 40px" }}>
            Start your free trial today. No credit card required. Upgrade only when you're ready.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/Onboarding"
              style={{ ...sans, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Start free trial <ArrowRight size={15} />
            </Link>
            <Link
              to="/Demo"
              style={{ ...sans, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", background: "transparent", color: T.cream, border: `1px solid ${T.border}`, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              Book a demo
            </Link>
          </div>
        </Fade>
      </section>

      <GoldRule />
      <div style={{ textAlign: "center", padding: "28px 24px", ...sans, fontSize: 13, color: T.creamDim }}>
        © 2026 Dealstage · <Link to="/privacy" style={{ color: T.creamDim, textDecoration: "none" }}>Privacy</Link> · <Link to="/terms" style={{ color: T.creamDim, textDecoration: "none" }}>Terms</Link>
        <span style={{ display: "block", marginTop: 6, fontSize: 11, opacity: 0.5 }}>Pricing data sourced from public sources and vendor websites. Updated Q1 2026.</span>
      </div>
    </div>
  );
}

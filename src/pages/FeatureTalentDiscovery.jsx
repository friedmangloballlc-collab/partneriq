import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Search,
  Sparkles,
  ShieldCheck,
  BarChart2,
  SlidersHorizontal,
  ArrowRight,
  Star,
  ChevronRight,
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
    Icon: Sparkles,
    title: "AI-Powered Search",
    desc: "Natural language queries. Describe the talent you need and our engine surfaces the best matches from 12,000+ verified profiles using semantic understanding.",
  },
  {
    Icon: ShieldCheck,
    title: "88-Platform Verification",
    desc: "Every profile is verified across 88 platforms. Fake followers, inflated metrics, and fraudulent accounts are flagged before they ever appear in your results.",
  },
  {
    Icon: BarChart2,
    title: "Audience Quality Scoring",
    desc: "Proprietary quality scores analyze follower authenticity, engagement depth, geographic distribution, and demographic alignment against your target audience.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Smart Filters",
    desc: "Filter by category, engagement rate, budget range, location, audience age, or brand safety score. Saved search templates let you repeat winning searches instantly.",
  },
];

/* ─────────────────────────────────────────────
   TALENT DATA (MOCKUP)
───────────────────────────────────────────── */
const TALENT_RESULTS = [
  { name: "Maya Chen", category: "Lifestyle & Fitness", followers: "2.4M", engagement: "6.8%", match: 98, verified: true, platforms: ["IG", "TT", "YT"] },
  { name: "Jordan Wells", category: "Tech & Gaming", followers: "890K", engagement: "9.2%", match: 95, verified: true, platforms: ["TT", "YT", "TW"] },
  { name: "Rina Alvarez", category: "Fashion & Beauty", followers: "1.1M", engagement: "7.4%", match: 91, verified: true, platforms: ["IG", "TT", "SP"] },
];

/* ─────────────────────────────────────────────
   MOCKUP: SEARCH INTERFACE
───────────────────────────────────────────── */
function SearchMockup() {
  const [query, setQuery] = useState("fitness influencer, 1M+ followers, US-based");
  const activeFilters = ["Fitness & Lifestyle", "1M–5M followers", "United States"];

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / discover</span>
      </div>

      <div style={{ padding: "28px 28px 32px" }}>
        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.goldDim }} />
          <div style={{
            ...sans,
            background: "#13120f",
            border: `1px solid ${T.gold}`,
            borderRadius: 10,
            padding: "14px 16px 14px 48px",
            fontSize: 14,
            color: T.cream,
            boxShadow: `0 0 0 3px rgba(196,162,74,0.08)`,
          }}>
            {query}
            <span style={{ display: "inline-block", width: 2, height: 14, background: T.gold, marginLeft: 4, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
          </div>
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, borderRadius: 6, padding: "6px 14px", ...sans, fontSize: 12, fontWeight: 600, color: T.bg, cursor: "pointer" }}>
            Search
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {activeFilters.map((f, i) => (
            <span key={i} style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 20, background: "rgba(196,162,74,0.12)", border: `1px solid ${T.border}`, color: T.gold, letterSpacing: "0.05em" }}>
              {f} ×
            </span>
          ))}
          <span style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 20, background: "transparent", border: `1px dashed ${T.border}`, color: T.creamDim, cursor: "pointer", letterSpacing: "0.05em" }}>
            + Add filter
          </span>
        </div>

        {/* Results Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ ...sans, fontSize: 13, color: T.creamDim }}>
            <span style={{ color: T.cream, fontWeight: 600 }}>347 results</span> — sorted by match score
          </span>
          <span style={{ ...mono, fontSize: 11, color: T.goldDim }}>AI-SCORED</span>
        </div>

        {/* Result Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TALENT_RESULTS.map((t, i) => (
            <div key={i} style={{
              background: i === 0 ? "rgba(196,162,74,0.06)" : T.bgCardAlt,
              border: `1px solid ${i === 0 ? T.border : T.borderAlt}`,
              borderRadius: 10,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 16, fontWeight: 700, color: T.bg }}>
                {t.name[0]}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ ...sans, fontWeight: 600, fontSize: 14, color: T.cream }}>{t.name}</span>
                  {t.verified && <ShieldCheck size={13} style={{ color: T.gold }} />}
                </div>
                <span style={{ ...mono, fontSize: 11, color: T.creamDim, letterSpacing: "0.04em" }}>{t.category}</span>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.cream }}>{t.followers}</div>
                  <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 2 }}>FOLLOWERS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.amber }}>{t.engagement}</div>
                  <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 2 }}>ENG. RATE</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                    <Star size={11} style={{ color: T.gold, fill: T.gold }} />
                    <span style={{ ...sans, fontSize: 13, fontWeight: 700, color: T.gold }}>{t.match}%</span>
                  </div>
                  <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 2 }}>MATCH</div>
                </div>
              </div>
              {/* Platforms */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {t.platforms.map((p, pi) => (
                  <span key={pi} style={{ ...mono, fontSize: 10, padding: "3px 7px", borderRadius: 4, background: "rgba(196,162,74,0.1)", color: T.goldDim, border: `1px solid ${T.borderAlt}` }}>{p}</span>
                ))}
              </div>
              <ChevronRight size={16} style={{ color: T.goldDim, flexShrink: 0 }} />
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
export default function FeatureTalentDiscovery() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO title="Talent Discovery" description="Search 12,000+ verified talent profiles across athletes, creators, musicians, and more" />
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(196,162,74,0.3); } 50% { box-shadow: 0 0 0 12px rgba(196,162,74,0); } }
        ::selection { background: rgba(196,162,74,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fp-nav-links { display: none !important; }
          .fp-nav { padding: 0 16px !important; }
          .fp-hero { padding: 100px 20px 64px !important; }
          .fp-caps-grid { grid-template-columns: 1fr !important; }
          .fp-two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
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
          <SectionLabel>Talent Discovery</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Find any talent type,{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              instantly
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Search 12,000+ verified profiles across athletes, creators, musicians, speakers, models, and more — with AI that understands what you're actually looking for.
          </p>
        </Fade>
        <Fade delay={220}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start free trial <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Pricing">See pricing</CTAButton>
          </div>
        </Fade>

        <Fade delay={280}>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem", marginTop: "2rem" }}>
            {[
              { role: "For Brands", text: "Find the perfect creator for your campaign in minutes" },
              { role: "For Talent", text: "Get discovered by top brands looking for your niche" },
              { role: "For Agencies", text: "Source talent across 12+ categories for any client brief" },
            ].map(item => (
              <div key={item.role} style={{ padding: "0.6rem 1.25rem", borderRadius: 8, border: "0.5px solid rgba(196,162,74,0.2)", background: "rgba(196,162,74,0.04)", fontSize: "0.78rem", color: "rgba(245,240,230,0.5)" }}>
                <span style={{ color: "#c4a24a", fontWeight: 500 }}>{item.role}:</span> {item.text}
              </div>
            ))}
          </div>
        </Fade>

        {/* Hero badge */}
        <Fade delay={320}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 56, flexWrap: "wrap" }}>
            {[["12K+", "Verified Profiles"], ["88", "Platforms"], ["94%", "Match Accuracy"]].map(([val, lbl], i) => (
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
            Discovery built for serious partnerships
          </h2>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {CAPABILITIES.map(({ Icon, title, desc }, i) => (
            <Fade key={i} delay={i * 80}>
              <div style={{
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

      {/* TESTIMONIAL */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 0" }}>
        <Fade>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem", textAlign: "center", borderLeft: "2px solid #c4a24a", background: "rgba(196,162,74,0.03)", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>"We found our ideal athlete partner in under 48 hours. The AI matching is incredibly accurate."</p>
            <p style={{ fontSize: "0.75rem", color: "#c4a24a", fontFamily: "'Instrument Mono', monospace" }}>— Marketing Director, Nike</p>
          </div>
        </Fade>
      </section>

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The search interface
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Type naturally or use smart filters. Results update in real time with match scores calculated across 10 weighted factors.
          </p>
        </Fade>
        <Fade delay={100}>
          <SearchMockup />
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(196,162,74,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>94%</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>match accuracy across 10 weighted scoring factors</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>VERIFIED ACROSS 12,000+ TALENT PROFILES</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Start discovering talent
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Join 840+ brands and agencies finding the right partners faster than ever.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start discovering talent <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Pricing">See pricing</CTAButton>
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

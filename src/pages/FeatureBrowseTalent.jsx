import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Grid3x3,
  ShieldCheck,
  DollarSign,
  Bookmark,
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
    Icon: Grid3x3,
    title: "45 Talent Categories",
    desc: "Athletes to musicians to chefs to comedians. Every talent type organized into 45 browsable categories — find exactly the niche you need in seconds.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Profiles",
    desc: "Real stats pulled directly from connected social platforms. No self-reported numbers, no inflated counts — only verified follower counts and engagement rates.",
  },
  {
    Icon: DollarSign,
    title: "Rate Transparency",
    desc: "See what talent charges before you reach out. Starting rates, package options, and availability are all visible upfront so you only contact talent that fits your budget.",
  },
  {
    Icon: Bookmark,
    title: "Instant Shortlisting",
    desc: "Save favorites and compare side by side. Build shortlists of your top candidates, share them with your team, and make the final call with all the data in one view.",
  },
];

/* ─────────────────────────────────────────────
   MOCKUP: TALENT GRID
───────────────────────────────────────────── */
const TALENT_CARDS = [
  { initials: "MJ", name: "Marcus Johnson", category: "Athlete", followers: "4.2M", engagement: "5.1%", rate: "from $25K" },
  { initials: "SK", name: "Sofia Kim", category: "Creator", followers: "1.8M", engagement: "7.3%", rate: "from $5K" },
  { initials: "LP", name: "Layla Price", category: "Musician", followers: "890K", engagement: "8.6%", rate: "from $15K" },
  { initials: "DW", name: "Derek Walsh", category: "Model", followers: "620K", engagement: "4.9%", rate: "from $3K" },
  { initials: "NR", name: "Nina Ramos", category: "Podcaster", followers: "340K", engagement: "11.2%", rate: "from $8K" },
  { initials: "JT", name: "James Tran", category: "Chef", followers: "280K", engagement: "9.4%", rate: "from $4K" },
];

const CATEGORY_COLORS = {
  Athlete: T.amber,
  Creator: T.gold,
  Musician: "#a78bfa",
  Model: "#f472b6",
  Podcaster: "#34d399",
  Chef: "#fb923c",
};

function TalentGridMockup() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / browse</span>
        <div style={{ marginLeft: "auto", ...mono, fontSize: 11, color: T.gold }}>12,000+ verified profiles</div>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.borderAlt}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {["All Categories", "Athletes", "Creators", "Musicians", "Models", "Podcasters"].map((cat, i) => (
          <span key={i} style={{
            ...mono, fontSize: 11, padding: "5px 14px", borderRadius: 20, cursor: "pointer", letterSpacing: "0.05em",
            background: i === 0 ? `linear-gradient(135deg, ${T.gold}, ${T.amber})` : "rgba(212,176,78,0.08)",
            color: i === 0 ? T.bg : T.gold,
            border: i === 0 ? "none" : `1px solid ${T.border}`,
            fontWeight: i === 0 ? 600 : 400,
          }}>
            {cat}
          </span>
        ))}
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: "auto" }}>12,000+ results</span>
      </div>

      {/* Grid */}
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {TALENT_CARDS.map((talent, i) => (
          <div
            key={i}
            style={{
              background: T.bgCardAlt,
              border: `1px solid ${T.borderAlt}`,
              borderRadius: 12,
              padding: "16px",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderAlt; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 18, fontWeight: 700, color: T.bg, marginBottom: 12 }}>
              {talent.initials}
            </div>

            {/* Name + Category */}
            <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 4 }}>{talent.name}</div>
            <div style={{ display: "inline-block", ...mono, fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${CATEGORY_COLORS[talent.category]}18`, color: CATEGORY_COLORS[talent.category], border: `1px solid ${CATEGORY_COLORS[talent.category]}30`, marginBottom: 12 }}>
              {talent.category.toUpperCase()}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.cream }}>{talent.followers}</div>
                <div style={{ ...mono, fontSize: 9, color: T.creamDim }}>FOLLOWERS</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.amber }}>{talent.engagement}</div>
                <div style={{ ...mono, fontSize: 9, color: T.creamDim }}>ENG. RATE</div>
              </div>
            </div>

            {/* Rate */}
            <div style={{ borderTop: `1px solid ${T.borderAlt}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...mono, fontSize: 11, color: T.gold }}>{talent.rate}</span>
              <span style={{ ...mono, fontSize: 10, color: T.creamDim, cursor: "pointer" }}>+ Save</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureBrowseTalent() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO title="Browse Talent" description="Browse 12,000+ verified creators, athletes, musicians, and performers. Filter by audience, engagement, niche, and budget." />
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fp-nav-links { display: none !important; }
          .fp-nav { padding: 0 16px !important; }
          .fp-hero { padding: 100px 20px 64px !important; }
          .fp-caps-grid { grid-template-columns: 1fr !important; }
          .fp-talent-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fp-mockup-overflow { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
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
          <SectionLabel>Browse Talent</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Discover talent across{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              every category
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Browse 12,000+ verified creators, athletes, musicians, and performers. Filter by audience, engagement, niche, and budget — find your perfect match in minutes.
          </p>
        </Fade>
        <Fade delay={220}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start browsing free <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Demo">Book a demo</CTAButton>
          </div>
        </Fade>

        <Fade delay={280}>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem", marginTop: "2rem" }}>
            {[
              { role: "For Brands", text: "Find your perfect creator match from 45 talent categories" },
              { role: "For Talent", text: "Be seen by thousands of brands browsing your category" },
              { role: "For Agencies", text: "Source talent for any client brief from one unified marketplace" },
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
            {[["12K+", "Verified Profiles"], ["45", "Categories"], ["20 min", "To Find Your Match"]].map(([val, lbl], i) => (
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
            The marketplace built for every partnership
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
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>"We found our perfect brand ambassador in 20 minutes. On our own, it took 3 months."</p>
            <p style={{ fontSize: "0.75rem", color: "#d4b04e", fontFamily: "'Instrument Mono', monospace" }}>— Brand Marketing Director</p>
          </div>
        </Fade>
      </section>

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The talent marketplace
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Browse verified profiles across every category. Filter by niche, audience size, engagement rate, and starting rate.
          </p>
        </Fade>
        <Fade delay={100}>
          <div className="fp-mockup-overflow">
            <TalentGridMockup />
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(212,176,78,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>45</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>talent categories, 12,000+ verified profiles, all searchable in seconds</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>ATHLETES · CREATORS · MUSICIANS · MODELS · CHEFS · PODCASTERS AND MORE</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Your next partner is already here
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Browse 12,000+ verified talent profiles across every category. Find your match in minutes, not months.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start browsing talent <ArrowRight size={15} /></CTAButton>
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

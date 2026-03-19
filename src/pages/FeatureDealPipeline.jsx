import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Kanban,
  FileText,
  TrendingUp,
  CheckSquare,
  ArrowRight,
  MoreHorizontal,
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
   CAPABILITY CARDS
───────────────────────────────────────────── */
const CAPABILITIES = [
  { Icon: Kanban, title: "Kanban Board", desc: "Drag deals across stages. Discovery, Negotiation, Contract, Active — see your entire pipeline at a glance with deal values and age." },
  { Icon: FileText, title: "Contract Builder", desc: "Generate NDAs, partnership agreements, and deliverable specs from templates. AI fills in deal details. Sign with DocuSign in one click." },
  { Icon: TrendingUp, title: "Revenue Forecasting", desc: "Predict quarterly revenue based on your pipeline velocity. See weighted probabilities per stage and get AI alerts on deals at risk of stalling." },
  { Icon: CheckSquare, title: "Milestone Tracking", desc: "Break deals into deliverable milestones. Assign owners, set due dates, attach proof of performance, and release payments automatically on completion." },
];

/* ─────────────────────────────────────────────
   KANBAN DATA
───────────────────────────────────────────── */
const COLUMNS = [
  {
    label: "Discovery",
    color: "#6b7280",
    deals: [
      { brand: "Nike", talent: "Marcus Webb", amount: "$42,000", age: "3d", stage: "Outreach sent" },
      { brand: "Apple", talent: "Sona Park", amount: "$88,000", age: "1d", stage: "Brief reviewed" },
      { brand: "Adidas", talent: "Leo Torres", amount: "$31,500", age: "5d", stage: "Intro call scheduled" },
    ],
  },
  {
    label: "Negotiation",
    color: T.amber,
    deals: [
      { brand: "Samsung", talent: "Priya Nair", amount: "$120,000", age: "8d", stage: "Counter-offer sent" },
      { brand: "Netflix", talent: "James Holt", amount: "$65,000", age: "4d", stage: "Rate negotiation" },
    ],
  },
  {
    label: "Contract",
    color: T.gold,
    deals: [
      { brand: "Lululemon", talent: "Zara Kim", amount: "$54,000", age: "2d", stage: "DocuSign pending" },
      { brand: "Spotify", talent: "Dev Patel", amount: "$38,000", age: "6d", stage: "Legal review" },
    ],
  },
  {
    label: "Active",
    color: "#22c55e",
    deals: [
      { brand: "Red Bull", talent: "Ali Hassan", amount: "$96,000", age: "12d", stage: "Content live" },
      { brand: "Beats", talent: "Chloe Stein", amount: "$44,000", age: "9d", stage: "Milestone 2/3" },
    ],
  },
];

function KanbanMockup() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / pipeline</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ ...mono, fontSize: 10, padding: "3px 10px", borderRadius: 4, background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>9 ACTIVE DEALS</span>
          <span style={{ ...mono, fontSize: 10, padding: "3px 10px", borderRadius: 4, background: "rgba(196,162,74,0.1)", color: T.gold, border: `1px solid ${T.borderAlt}` }}>$578K PIPELINE</span>
        </div>
      </div>

      <div style={{ padding: "24px", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(200px, 1fr))", gap: 16, minWidth: 860 }}>
          {COLUMNS.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                <span style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream, letterSpacing: "0.04em" }}>{col.label}</span>
                <span style={{ ...mono, fontSize: 10, color: T.creamDim, marginLeft: "auto" }}>{col.deals.length}</span>
              </div>
              {/* Deal Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, minHeight: 200 }}>
                {col.deals.map((deal, di) => (
                  <div key={di} style={{
                    background: T.bgCard,
                    border: `1px solid ${T.borderAlt}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = col.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.borderAlt}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream }}>{deal.brand}</div>
                        <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 2 }}>{deal.talent}</div>
                      </div>
                      <MoreHorizontal size={13} style={{ color: T.creamDim, marginTop: 2, flexShrink: 0 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ ...sans, fontSize: 13, fontWeight: 700, color: T.gold }}>{deal.amount}</span>
                      <span style={{ ...mono, fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${col.color}18`, color: col.color, border: `1px solid ${col.color}30` }}>{deal.age}</span>
                    </div>
                    <div style={{ marginTop: 8, ...mono, fontSize: 10, color: T.creamDim, padding: "4px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
                      {deal.stage}
                    </div>
                  </div>
                ))}
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
export default function FeatureDealPipeline() {
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
      <section style={{ paddingTop: 160, paddingBottom: 96, textAlign: "center", maxWidth: 860, margin: "0 auto", padding: "160px 24px 96px" }}>
        <Fade>
          <SectionLabel>Deal Pipeline</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Track every deal from{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              pitch to close
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Visual pipeline management for partnerships — never lose track of a deal again. Every stage, every dollar, every deadline in one place.
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
            {[["$48M+", "Deals Facilitated"], ["4", "Pipeline Stages"], ["96%", "Deal Close Rate"]].map(([val, lbl], i) => (
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
            Everything a deal needs to close
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
            Your pipeline, visualized
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Drag deals between stages. See your total pipeline value in real time. Get notified when deals stall.
          </p>
        </Fade>
        <Fade delay={100}>
          <KanbanMockup />
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(224,123,24,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>$48M+</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>in deals facilitated through Dealstage</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>ACROSS 840+ BRANDS AND AGENCIES</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Start managing deals
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Move faster, close more, and never let a deal slip through the cracks again.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start managing deals <ArrowRight size={15} /></CTAButton>
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

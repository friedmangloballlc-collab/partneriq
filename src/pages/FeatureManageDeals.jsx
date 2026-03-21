import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  LayoutGrid,
  Sparkles,
  DollarSign,
  ShieldCheck,
  ArrowRight,
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
    Icon: LayoutGrid,
    title: "Multi-Client Pipeline",
    desc: "All your talent's deals in one Kanban view. See every active negotiation, pending contract, and closed deal across your entire roster at a glance.",
  },
  {
    Icon: Sparkles,
    title: "AI Deal Coach",
    desc: "Get AI suggestions on counter-offers and negotiation strategy. Know when to push, when to hold, and what comparable deals in your category are closing for.",
  },
  {
    Icon: DollarSign,
    title: "Commission Tracking",
    desc: "Automatic commission splits calculated on every deal. Your percentage, your talent's payout, and any additional fees are computed and tracked without spreadsheets.",
  },
  {
    Icon: ShieldCheck,
    title: "Approval Workflows",
    desc: "Nothing goes out without your sign-off. Review proposals, contracts, and deliverables before they reach the brand — maintain quality control across every client.",
  },
];

/* ─────────────────────────────────────────────
   MOCKUP: KANBAN BOARD
───────────────────────────────────────────── */
const KANBAN_COLUMNS = [
  {
    title: "Active",
    color: T.amber,
    deals: [
      { talent: "Jordan Reeves", brand: "Nike", value: "$85K", stage: "Negotiating" },
    ],
  },
  {
    title: "Negotiating",
    color: T.gold,
    deals: [
      { talent: "Mia Chen", brand: "Spotify", value: "$12.5K", stage: "Counter sent" },
    ],
  },
  {
    title: "Contracted",
    color: "#4ade80",
    deals: [
      { talent: "Zara Ali", brand: "Sephora", value: "$34K", stage: "Awaiting deliverables" },
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
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / pipeline / roster</span>
        <div style={{ marginLeft: "auto", ...mono, fontSize: 11, color: T.gold }}>Pipeline Total: $248K</div>
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        {/* Kanban Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {KANBAN_COLUMNS.map((col, ci) => (
            <div key={ci}>
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                <span style={{ ...mono, fontSize: 11, color: T.cream, letterSpacing: "0.08em", fontWeight: 500 }}>{col.title.toUpperCase()}</span>
                <span style={{ ...mono, fontSize: 10, color: T.creamDim, marginLeft: "auto" }}>{col.deals.length}</span>
              </div>

              {/* Deal Cards */}
              {col.deals.map((deal, di) => (
                <div key={di} style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 10, padding: "14px 14px" }}>
                  {/* Talent + Brand */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 11, fontWeight: 700, color: T.bg, flexShrink: 0 }}>
                      {deal.talent[0]}
                    </div>
                    <div>
                      <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream }}>{deal.talent}</div>
                      <div style={{ ...mono, fontSize: 10, color: T.creamDim }}>→ {deal.brand}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...serif, fontSize: 18, fontWeight: 700, color: T.gold }}>{deal.value}</span>
                    <span style={{ ...mono, fontSize: 9, color: col.color, padding: "3px 8px", borderRadius: 20, background: `${col.color}15`, border: `1px solid ${col.color}30` }}>{deal.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pipeline Summary */}
        <div style={{ marginTop: 20, background: "rgba(196,162,74,0.04)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginBottom: 4 }}>TOTAL PIPELINE VALUE</div>
            <div style={{ ...serif, fontSize: 24, fontWeight: 700, color: T.gold }}>$248K</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginBottom: 4 }}>ACTIVE TALENT</div>
            <div style={{ ...sans, fontSize: 20, fontWeight: 700, color: T.cream }}>3</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginBottom: 4 }}>YOUR COMMISSION</div>
            <div style={{ ...sans, fontSize: 20, fontWeight: 700, color: T.amber }}>$24.8K</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureManageDeals() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO title="Manage Deals" description="Your entire deal pipeline in one dashboard. Manage deals across your entire talent roster — never miss a deadline, never lose a deal." />
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(196,162,74,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fp-nav-links { display: none !important; }
          .fp-nav { padding: 0 16px !important; }
          .fp-hero { padding: 100px 20px 64px !important; }
          .fp-caps-grid { grid-template-columns: 1fr !important; }
          .fp-kanban-grid { grid-template-columns: 1fr !important; }
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
          <SectionLabel>Manage Deals</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Your entire deal pipeline,{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              one dashboard
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            For managers who handle multiple talent — see every deal across your entire roster. Never miss a deadline, never lose a deal, never leave money on the table.
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
              { role: "For Brands", text: "Track all your active creator partnerships in one place" },
              { role: "For Talent", text: "See all your deals, deadlines, and deliverables at a glance" },
              { role: "For Agencies", text: "Manage deals across every client and talent relationship simultaneously" },
            ].map(item => (
              <div key={item.role} style={{ padding: "0.6rem 1.25rem", borderRadius: 8, border: "0.5px solid rgba(196,162,74,0.2)", background: "rgba(196,162,74,0.04)", fontSize: "0.78rem", color: "rgba(245,240,230,0.5)" }}>
                <span style={{ color: "#c4a24a", fontWeight: 500 }}>{item.role}:</span> {item.text}
              </div>
            ))}
          </div>
        </Fade>

        {/* Hero stats */}
        <Fade delay={320}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 56, flexWrap: "wrap" }}>
            {[["4x", "Faster Closing"], ["$248K", "Avg Pipeline"], ["15+", "Clients Managed"]].map(([val, lbl], i) => (
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
            Pipeline management for serious managers
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
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>"I manage 15 creators and used to drown in emails. Now I see everything in one screen."</p>
            <p style={{ fontSize: "0.75rem", color: "#c4a24a", fontFamily: "'Instrument Mono', monospace" }}>— Talent Manager</p>
          </div>
        </Fade>
      </section>

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The roster pipeline view
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            Every deal for every talent client, laid out in a Kanban view so nothing falls through the cracks.
          </p>
        </Fade>
        <Fade delay={100}>
          <div className="fp-mockup-overflow">
            <KanbanMockup />
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(196,162,74,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>4x</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>faster deal closing than email-based management</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>MANAGERS USING DEALSTAGE VS EMAIL-ONLY WORKFLOWS</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Your roster deserves better than email chains
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Join managers who run their entire talent roster from one dashboard, closing more deals in less time.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start managing deals <ArrowRight size={15} /></CTAButton>
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

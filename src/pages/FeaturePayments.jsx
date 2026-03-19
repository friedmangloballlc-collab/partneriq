import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  Split,
  BarChart2,
  ArrowRight,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  Lock,
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
  green:     "#22c55e",
  greenDim:  "rgba(34,197,94,0.12)",
  yellow:    "#f59e0b",
  yellowDim: "rgba(245,158,11,0.12)",
  blue:      "#60a5fa",
  blueDim:   "rgba(96,165,250,0.12)",
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
  { Icon: FileText, title: "Auto-Generated Invoices", desc: "Invoices are created automatically when a deal moves to Active. Line items, tax calculations, and payment terms pulled directly from the contract." },
  { Icon: Lock, title: "Escrow Protection", desc: "Funds are held securely until deliverables are confirmed. Brands never lose money to underperforming campaigns. Talent always gets paid for work delivered." },
  { Icon: Split, title: "Commission Splits", desc: "Set agency commission percentages once. Platform calculates and routes payments automatically — talent gets their share, agency gets theirs, simultaneously." },
  { Icon: BarChart2, title: "Payout Reporting", desc: "Real-time dashboards for total earned, pending, and projected revenue. Export transaction history for accounting, tax filing, or client reporting." },
];

/* ─────────────────────────────────────────────
   PAYMENT DATA
───────────────────────────────────────────── */
const RECENT_PAYMENTS = [
  { brand: "Nike", talent: "Marcus Webb", amount: "$42,000", status: "Paid", date: "Mar 14", statusColor: T.green, statusBg: T.greenDim },
  { brand: "Samsung", talent: "Priya Nair", amount: "$120,000", status: "Pending", date: "Mar 18", statusColor: T.yellow, statusBg: T.yellowDim },
  { brand: "Netflix", talent: "James Holt", amount: "$65,000", status: "Processing", date: "Mar 19", statusColor: T.blue, statusBg: T.blueDim },
];

const SCHEDULE = [
  { date: "Mar 20", amount: "$54,000", deal: "Lululemon × Zara Kim" },
  { date: "Mar 27", amount: "$38,000", deal: "Spotify × Dev Patel" },
  { date: "Apr 2",  amount: "$96,000", deal: "Red Bull × Ali Hassan" },
];

function PaymentsDashboard() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / payments</span>
      </div>

      <div style={{ padding: "28px 28px 32px" }}>
        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Earned", value: "$248,000", sub: "2026 YTD", color: T.gold, Icon: TrendingUp },
            { label: "Pending", value: "$34,000", sub: "2 invoices", color: T.yellow, Icon: Clock },
            { label: "Avg Deal Size", value: "$52,400", sub: "+18% vs last yr", color: T.green, Icon: ArrowUpRight },
          ].map((kpi, i) => (
            <div key={i} style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ ...mono, fontSize: 10, color: T.creamDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>{kpi.label}</span>
                <kpi.Icon size={14} style={{ color: kpi.color }} />
              </div>
              <div style={{ ...sans, fontSize: 22, fontWeight: 700, color: kpi.color, marginBottom: 4 }}>{kpi.value}</div>
              <div style={{ ...mono, fontSize: 10, color: T.creamDim }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Recent Payments */}
          <div>
            <div style={{ ...mono, fontSize: 10, color: T.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Recent Payments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECENT_PAYMENTS.map((p, i) => (
                <div key={i} style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 9, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(196,162,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CreditCard size={14} style={{ color: T.gold }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: T.cream, marginBottom: 2 }}>{p.brand}</div>
                    <div style={{ ...mono, fontSize: 10, color: T.creamDim }}>{p.talent} · {p.date}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ ...sans, fontSize: 13, fontWeight: 700, color: T.cream, marginBottom: 3 }}>{p.amount}</div>
                    <span style={{ ...mono, fontSize: 9, padding: "2px 7px", borderRadius: 4, background: p.statusBg, color: p.statusColor, border: `1px solid ${p.statusColor}30` }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout Schedule */}
          <div>
            <div style={{ ...mono, fontSize: 10, color: T.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Upcoming Payouts</div>
            <div style={{ background: T.bgCardAlt, border: `1px solid ${T.borderAlt}`, borderRadius: 9, overflow: "hidden" }}>
              {SCHEDULE.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < SCHEDULE.length - 1 ? `1px solid ${T.borderAlt}` : "none" }}>
                  <div style={{ ...mono, fontSize: 11, color: T.gold, fontWeight: 500, minWidth: 40, flexShrink: 0 }}>{s.date}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...sans, fontSize: 11, color: T.creamDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.deal}</div>
                  </div>
                  <div style={{ ...sans, fontSize: 13, fontWeight: 700, color: T.cream, flexShrink: 0 }}>{s.amount}</div>
                </div>
              ))}
              <div style={{ padding: "10px 14px", background: "rgba(196,162,74,0.04)", borderTop: `1px solid ${T.borderAlt}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: 10, color: T.creamDim }}>TOTAL SCHEDULED</span>
                  <span style={{ ...sans, fontSize: 14, fontWeight: 700, color: T.gold }}>$188,000</span>
                </div>
              </div>
            </div>

            {/* Stripe Badge */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(99,91,255,0.06)", border: "1px solid rgba(99,91,255,0.15)", borderRadius: 8 }}>
              <Shield size={13} style={{ color: "#635bff", flexShrink: 0 }} />
              <span style={{ ...mono, fontSize: 10, color: T.creamDim }}>Payments powered by <span style={{ color: "#635bff" }}>Stripe</span> · SOC 2 compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeaturePayments() {
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
          <SectionLabel>Payments</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Get paid faster,{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              every time
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Invoicing, payment tracking, and commission splits built directly into deals. Brands pay through Stripe. Talent receives funds securely. No spreadsheets.
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
            {[["2.3d", "Avg Processing Time"], ["$248K+", "Avg Annual Payouts"], ["0%", "Fraud Loss Rate"]].map(([val, lbl], i) => (
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
            Built for how deals actually work
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
            Your payments dashboard
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            See everything at a glance — total earned, pending, upcoming payouts, and transaction history.
          </p>
        </Fade>
        <Fade delay={100}>
          <PaymentsDashboard />
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>2.3 days</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>average payment processing time</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>STRIPE-POWERED · GLOBAL PAYOUTS · SOC 2 TYPE II COMPLIANT</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Start getting paid
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Connect your account, invoice your first brand, and get paid in days — not weeks.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start getting paid <ArrowRight size={15} /></CTAButton>
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

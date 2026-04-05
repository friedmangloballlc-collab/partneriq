import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Briefcase,
  Users,
  Zap,
  Search,
  BarChart2,
  FileText,
  ArrowRight,
  CheckCircle,
  ChevronDown,
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
   PAIN POINTS
───────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    emoji: "📧",
    title: "Tracking deals across 5 Gmail threads?",
    desc: "Brand deals live in your inbox, your DMs, and a spreadsheet that's three months out of date. When a brand asks for an update, you're scrambling.",
  },
  {
    emoji: "📱",
    title: 'Your client asks "where are my deals?"',
    desc: "You spend 20 minutes pulling together a status update that should take 20 seconds. Your client deserves a real-time view — not a one-off email.",
  },
  {
    emoji: "⏰",
    title: "Missing follow-up windows",
    desc: "Brands go quiet. You mean to follow up but forget. Two weeks later the opportunity is gone. One missed follow-up can cost your client tens of thousands.",
  },
];

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Briefcase,
    title: "Single Talent Plan",
    desc: "Purpose-built for managers who represent one client. A full deal pipeline, brand inbox, and contract vault — for a single talent, no clutter.",
  },
  {
    Icon: Users,
    title: "Multi-Talent Plan",
    desc: "Manage up to 10 clients from one dashboard. Each talent gets their own pipeline view. You see everything across all clients at a glance.",
  },
  {
    Icon: Zap,
    title: "AI Match Engine",
    desc: "Our AI surfaces brand deals that fit your talent's audience, niche, and rate history — so you pitch brands that are already likely to say yes.",
  },
  {
    Icon: Search,
    title: "Contact Finder",
    desc: "Find the right brand contact instantly. No more hunting LinkedIn for 'Head of Influencer Marketing.' We surface verified decision-maker emails.",
  },
  {
    Icon: BarChart2,
    title: "Revenue Tracking",
    desc: "See every deal's value, stage, and projected close date. Know exactly where your commission income is coming from — and what's at risk.",
  },
  {
    Icon: FileText,
    title: "Contract Templates",
    desc: "Send professional brand deal contracts in minutes. Pre-built templates cover usage rights, exclusivity, payment terms, and deliverable schedules.",
  },
];

/* ─────────────────────────────────────────────
   PRICING TIERS
───────────────────────────────────────────── */
const TIERS = [
  {
    name: "Single Talent",
    price: "$99",
    period: "/mo",
    desc: "For managers representing one talent",
    highlight: false,
    features: [
      "1 talent profile managed",
      "Full deal pipeline & kanban board",
      "AI Match Engine",
      "Contact Finder (50 lookups/mo)",
      "Contract templates",
      "Revenue tracking & commission calc",
      "Client-facing deal status page",
      "Follow-up reminders",
    ],
    cta: "Start free trial",
  },
  {
    name: "Multi-Talent",
    price: "$249",
    period: "/mo",
    desc: "For managers with a growing roster",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Up to 10 talent profiles",
      "Everything in Single Talent",
      "Cross-roster deal dashboard",
      "Contact Finder (200 lookups/mo)",
      "Priority AI matching",
      "Bulk outreach templates",
      "Team collaboration (3 seats)",
      "Advanced revenue analytics",
    ],
    cta: "Start free trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large management firms & agencies",
    highlight: false,
    features: [
      "Unlimited talent profiles",
      "Everything in Multi-Talent",
      "Unlimited Contact Finder lookups",
      "White-label client portal",
      "Dedicated account manager",
      "Custom integrations & API access",
      "SLA & priority support",
      "Onboarding & training",
    ],
    cta: "Contact Sales",
  },
];

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
const FAQS = [
  {
    q: "Do my clients (the talent) need their own DealStage account?",
    a: "No. Your clients don't need to log in or pay for anything. You manage their pipeline on their behalf. Optionally, you can share a read-only deal status link with them so they can see progress without needing an account.",
  },
  {
    q: "How does the AI Match Engine work for managers?",
    a: "The AI analyzes your talent's audience demographics, engagement rates, past deal history, and niche keywords to surface brand opportunities likely to convert. It learns from every deal you win or lose to get sharper over time.",
  },
  {
    q: "Can I add a second manager or assistant to help me?",
    a: "The Multi-Talent plan includes 3 team seats so you can add an assistant or co-manager. Enterprise plans have unlimited seats. Single Talent plans are single-user.",
  },
  {
    q: "What happens if I manage more than 10 clients?",
    a: "If you're growing beyond 10 clients, our Enterprise plan is designed for you. Contact our sales team and we'll build a custom plan around your roster size, integrations, and white-label requirements.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${open ? T.gold : T.border}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.25s",
        cursor: "pointer",
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
        <span style={{ ...sans, fontSize: 15, fontWeight: 600, color: T.cream, flex: 1, paddingRight: 16 }}>{q}</span>
        <ChevronDown
          size={18}
          style={{ color: T.gold, flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      {open && (
        <div style={{ padding: "0 24px 20px", ...sans, fontSize: 14, color: T.creamDim, lineHeight: 1.7, borderTop: `1px solid ${T.borderAlt}`, paddingTop: 16 }}>
          {a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ForManagers() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO
        title="For Personal Managers"
        description="DealStage is the only platform built specifically for personal talent managers. Manage your talent's entire brand deal pipeline — never lose a deal to a missed follow-up again."
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fm-nav-links { display: none !important; }
          .fm-nav { padding: 0 16px !important; }
          .fm-hero { padding: 100px 20px 64px !important; }
          .fm-pain-grid { grid-template-columns: 1fr !important; }
          .fm-feat-grid { grid-template-columns: 1fr !important; }
          .fm-tier-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="fm-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,7,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.borderAlt}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ ...serif, fontSize: 20, fontWeight: 700, color: T.gold, textDecoration: "none", letterSpacing: "0.04em" }}>Dealstage</Link>
        <div className="fm-nav-links" style={{ display: "flex", gap: 8 }}>
          <Link to="/pricing" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px", borderRadius: 6 }}>Pricing</Link>
          <Link to="/login" style={{ ...sans, fontSize: 13, color: T.creamDim, textDecoration: "none", padding: "8px 16px", borderRadius: 6 }}>Log in</Link>
          <Link to="/Onboarding" style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.bg, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "8px 18px", borderRadius: 6 }}>Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="fm-hero" style={{ paddingTop: 160, paddingBottom: 96, textAlign: "center", maxWidth: 860, margin: "0 auto", padding: "160px 24px 96px" }}>
        <Fade>
          <SectionLabel>For Personal Managers</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Finally — A Platform{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Built for Personal Managers
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 40px" }}>
            Manage your talent's entire brand deal pipeline. Never lose a deal to a missed follow-up again.
          </p>
        </Fade>
        <Fade delay={220}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start free trial <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Demo">Book a demo</CTAButton>
          </div>
        </Fade>
        <Fade delay={300}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 56, flexWrap: "wrap" }}>
            {[["$0", "Free to start"], ["88", "Platform integrations"], ["1 platform", "For your entire roster"]].map(([val, lbl], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ ...serif, fontSize: 30, fontWeight: 700, color: T.gold }}>{val}</div>
                <div style={{ ...mono, fontSize: 11, color: T.creamDim, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* PAIN POINTS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Sound Familiar?</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 56, maxWidth: 540 }}>
            The problems every personal manager knows too well
          </h2>
        </Fade>
        <div className="fm-pain-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PAIN_POINTS.map(({ emoji, title, desc }, i) => (
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{emoji}</div>
                <h3 style={{ ...sans, fontSize: 16, fontWeight: 600, color: T.cream, marginBottom: 12, lineHeight: 1.4 }}>{title}</h3>
                <p style={{ ...sans, fontSize: 14, color: T.creamDim, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      <GoldRule />

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Built for Managers</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16, maxWidth: 520 }}>
            Every tool you need to run a modern management business
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, lineHeight: 1.65, maxWidth: 540, marginBottom: 56 }}>
            DealStage is the only platform with a dedicated Manager role — built from the ground up for personal managers, not retrofitted from a brand tool.
          </p>
        </Fade>
        <div className="fm-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <Fade key={i} delay={i * 70}>
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
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem", textAlign: "center", borderLeft: `2px solid ${T.gold}`, background: "rgba(212,176,78,0.03)", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>
              "I used to manage my client's deals in a spreadsheet and three Gmail labels. DealStage replaced all of it. My client can see deal status any time without texting me."
            </p>
            <p style={{ fontSize: "0.75rem", color: T.gold, ...mono }}>— Personal Manager, 4-talent roster</p>
          </div>
        </Fade>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Pricing</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            Plans for every roster size
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 56, maxWidth: 480, lineHeight: 1.65 }}>
            Start free. Upgrade when you're ready. No contracts, no setup fees.
          </p>
        </Fade>
        <div className="fm-tier-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start" }}>
          {TIERS.map((tier, i) => (
            <Fade key={i} delay={i * 80}>
              <div
                style={{
                  background: tier.highlight ? "rgba(212,176,78,0.06)" : T.bgCard,
                  border: `1px solid ${tier.highlight ? T.gold : T.border}`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  position: "relative",
                  transition: "transform 0.25s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {tier.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg, ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", padding: "4px 14px", borderRadius: 20 }}>
                    {tier.badge}
                  </div>
                )}
                <div style={{ ...mono, fontSize: 11, color: T.gold, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>{tier.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ ...serif, fontSize: 44, fontWeight: 700, color: T.cream }}>{tier.price}</span>
                  {tier.period && <span style={{ ...sans, fontSize: 14, color: T.creamDim }}>{tier.period}</span>}
                </div>
                <p style={{ ...sans, fontSize: 13, color: T.creamDim, marginBottom: 28, lineHeight: 1.5 }}>{tier.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <CheckCircle size={15} style={{ color: T.gold, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ ...sans, fontSize: 13, color: T.creamDim, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={tier.price === "Custom" ? "/Contact" : "/Onboarding"}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px 24px",
                    borderRadius: 8,
                    ...sans,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.25s",
                    ...(tier.highlight
                      ? { background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, color: T.bg }
                      : { background: "transparent", color: T.cream, border: `1px solid ${T.border}` }),
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      <GoldRule />

      {/* FAQ */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>FAQ</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: T.cream, marginBottom: 48 }}>
            Questions from managers
          </h2>
        </Fade>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <Fade key={i} delay={i * 60}>
              <FAQItem q={faq.q} a={faq.a} />
            </Fade>
          ))}
        </div>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Your talent deserves better than a Gmail thread
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, lineHeight: 1.65, maxWidth: 500, margin: "0 auto 40px" }}>
            Start your free trial today. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start free trial <ArrowRight size={15} /></CTAButton>
            <CTAButton to="/Demo">Book a demo</CTAButton>
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

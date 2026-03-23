import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Sparkles,
  Users,
  Repeat2,
  Eye,
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
    Icon: Sparkles,
    title: "AI-Powered Proposals",
    desc: "Personalized deal proposals generated in seconds. The AI analyzes the brand's campaigns, audience, and budget to craft a pitch that speaks their language.",
  },
  {
    Icon: Users,
    title: "Contact Intelligence",
    desc: "Find the right decision-maker, not generic info@ emails. Our contact graph surfaces the actual influencer marketing manager at your target brand.",
  },
  {
    Icon: Repeat2,
    title: "Automated Sequences",
    desc: "Multi-step follow-ups that send themselves. Set your cadence once — Day 1 initial, Day 3 follow-up, Day 7 final — and let DealStage handle the rest.",
  },
  {
    Icon: Eye,
    title: "Response Tracking",
    desc: "Know exactly when your proposal is opened and read. Real-time notifications let you follow up at precisely the right moment, not blindly into the void.",
  },
];

/* ─────────────────────────────────────────────
   MOCKUP: OUTREACH INTERFACE
───────────────────────────────────────────── */
const SEQUENCE_STEPS = [
  { day: "Day 1", label: "Initial Proposal", status: "sent", time: "9:00 AM" },
  { day: "Day 3", label: "Follow-up", status: "pending", time: "10:30 AM" },
  { day: "Day 7", label: "Final Touch", status: "scheduled", time: "9:00 AM" },
];

function OutreachMockup() {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
      {/* Window Chrome */}
      <div style={{ background: "#0a0909", borderBottom: `1px solid ${T.borderAlt}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ ...mono, fontSize: 11, color: T.creamDim, marginLeft: 12, opacity: 0.6 }}>dealstage.app / outreach / compose</span>
      </div>

      <div style={{ padding: "28px 28px 32px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Left: Compose Window */}
        <div>
          {/* Contact Card */}
          <div style={{ background: T.bgCardAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${T.goldDim}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 15, fontWeight: 700, color: T.bg, flexShrink: 0 }}>S</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: T.cream }}>Sarah Chen</div>
              <div style={{ ...mono, fontSize: 11, color: T.creamDim }}>Influencer Marketing Manager · Nike</div>
            </div>
            <div style={{ ...mono, fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(212,176,78,0.12)", border: `1px solid ${T.border}`, color: T.gold }}>VERIFIED</div>
          </div>

          {/* Message Area */}
          <div style={{ background: "#0a0908", border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px", marginBottom: 12 }}>
            <div style={{ ...mono, fontSize: 10, color: T.gold, letterSpacing: "0.1em", marginBottom: 10 }}>AI-GENERATED PROPOSAL</div>
            <p style={{ ...sans, fontSize: 13, color: T.cream, lineHeight: 1.7, marginBottom: 8 }}>
              Hi Sarah, I noticed Nike's recent push into the wellness space and think there's a natural fit with my audience of 180K fitness-focused followers (4.8% engagement, 78% ages 18–34).
            </p>
            <p style={{ ...sans, fontSize: 13, color: T.cream, lineHeight: 1.7 }}>
              I'd love to explore a partnership around your upcoming Air Max campaign. I've attached my media kit with verified stats. Happy to jump on a call this week.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, borderRadius: 7, padding: "10px 16px", ...sans, fontSize: 13, fontWeight: 600, color: T.bg, textAlign: "center", cursor: "pointer" }}>
              Send Proposal
            </div>
            <div style={{ background: T.bgCardAlt, border: `1px solid ${T.border}`, borderRadius: 7, padding: "10px 16px", ...sans, fontSize: 13, color: T.creamDim, cursor: "pointer" }}>
              Save Draft
            </div>
          </div>
        </div>

        {/* Right: Sequence Timeline */}
        <div>
          <div style={{ ...mono, fontSize: 10, color: T.gold, letterSpacing: "0.1em", marginBottom: 14 }}>FOLLOW-UP SEQUENCE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SEQUENCE_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                {/* Line connector */}
                {i < SEQUENCE_STEPS.length - 1 && (
                  <div style={{ position: "absolute", left: 11, top: 24, width: 2, height: "calc(100% - 8px)", background: `rgba(212,176,78,0.15)` }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 8,
                  background: step.status === "sent"
                    ? `linear-gradient(135deg, ${T.gold}, ${T.amber})`
                    : step.status === "pending"
                    ? "rgba(212,176,78,0.2)"
                    : "rgba(212,176,78,0.1)",
                  border: step.status !== "sent" ? `1px solid ${T.border}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.status === "sent" && <span style={{ fontSize: 10 }}>✓</span>}
                </div>
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ ...mono, fontSize: 10, color: T.gold, letterSpacing: "0.06em" }}>{step.day}</div>
                  <div style={{ ...sans, fontSize: 13, fontWeight: 500, color: T.cream, marginTop: 2 }}>{step.label}</div>
                  <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginTop: 2 }}>{step.time} · {step.status}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Response Rate Badge */}
          <div style={{ background: "rgba(212,176,78,0.06)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px", marginTop: 8 }}>
            <div style={{ ...mono, fontSize: 10, color: T.creamDim, marginBottom: 4 }}>PREDICTED RESPONSE RATE</div>
            <div style={{ ...serif, fontSize: 28, fontWeight: 700, color: T.gold }}>68%</div>
            <div style={{ ...mono, fontSize: 10, color: T.amber }}>vs 12% cold email avg</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function FeatureSendDeals() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, overflowX: "hidden" }}>
      <SEO title="Send Deals" description="Send proposals that get responses. AI-powered outreach finds the right person, writes the perfect pitch, and follows up automatically." />
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        @media (max-width: 768px) {
          .fp-nav-links { display: none !important; }
          .fp-nav { padding: 0 16px !important; }
          .fp-hero { padding: 100px 20px 64px !important; }
          .fp-caps-grid { grid-template-columns: 1fr !important; }
          .fp-compose-grid { grid-template-columns: 1fr !important; }
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
          <SectionLabel>Send Deals</SectionLabel>
          <h1 style={{ ...serif, fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.06, color: T.cream, marginBottom: 28 }}>
            Send proposals that{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              get responses
            </span>
          </h1>
        </Fade>
        <Fade delay={120}>
          <p style={{ ...sans, fontSize: "clamp(16px, 2.2vw, 20px)", color: T.creamDim, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
            Stop cold-emailing into the void. DealStage's AI-powered outreach finds the right person, writes the perfect pitch, and follows up automatically.
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
              { role: "For Brands", text: "Reach creators with proposals they can't ignore" },
              { role: "For Talent", text: "Send polished pitches that actually land in front of decision-makers" },
              { role: "For Agencies", text: "Automate outreach across your entire client and talent roster" },
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
            {[["68%", "Response Rate"], ["12%", "Cold Email Avg"], ["Auto", "Follow-ups"]].map(([val, lbl], i) => (
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
            Outreach that works from the first send
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
            <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,230,0.6)", lineHeight: 1.8, marginBottom: "0.75rem" }}>"Our response rate went from 12% to 68%. The AI knows exactly what brands want to hear."</p>
            <p style={{ fontSize: "0.75rem", color: "#d4b04e", fontFamily: "'Instrument Mono', monospace" }}>— Creator with 180K followers</p>
          </div>
        </Fade>
      </section>

      {/* MOCKUP */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Fade>
          <SectionLabel>Live Preview</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: T.cream, marginBottom: 16 }}>
            The outreach interface
          </h2>
          <p style={{ ...sans, fontSize: 16, color: T.creamDim, marginBottom: 52, maxWidth: 520, lineHeight: 1.65 }}>
            AI writes your pitch. Contact intelligence finds the right person. Automated sequences handle the follow-up.
          </p>
        </Fade>
        <Fade delay={100}>
          <div className="fp-mockup-overflow">
            <OutreachMockup />
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* STAT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, rgba(212,176,78,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ ...serif, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: T.gold, marginBottom: 16 }}>68%</div>
            <p style={{ ...sans, fontSize: "clamp(16px, 2vw, 20px)", color: T.cream, fontWeight: 500, marginBottom: 8 }}>average response rate on DealStage outreach (vs 12% cold email)</p>
            <p style={{ ...mono, fontSize: 12, color: T.creamDim, letterSpacing: "0.1em" }}>ACROSS ALL OUTREACH CAMPAIGNS ON THE PLATFORM</p>
          </div>
        </Fade>
      </section>

      <GoldRule />

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <Fade>
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ ...serif, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: T.cream, marginBottom: 20 }}>
            Your next deal starts with one send
          </h2>
          <p style={{ ...sans, fontSize: 17, color: T.creamDim, marginBottom: 40, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
            Join thousands of creators and brands closing deals faster with AI-powered outreach.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <CTAButton primary to="/Onboarding">Start sending deals <ArrowRight size={15} /></CTAButton>
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

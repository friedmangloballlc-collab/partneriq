import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Brain,
  ShieldCheck,
  Layers,
  Lightbulb,
  Eye,
  Scale,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────
   THEME TOKENS
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
   FONT FACE INJECTION
───────────────────────────────────────────── */
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap');`;

/* ─────────────────────────────────────────────
   INLINE STYLE HELPERS
───────────────────────────────────────────── */
const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans   = { fontFamily: "'Instrument Sans', system-ui, sans-serif" };
const mono   = { fontFamily: "'Instrument Mono', 'Courier New', monospace" };

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────────── */
function useFadeIn(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity    = "1";
          el.style.transform  = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─────────────────────────────────────────────
   FADE WRAPPER COMPONENT
───────────────────────────────────────────── */
function Fade({ children, delay = 0, style = {} }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.72s ease ${delay}ms, transform 0.72s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────── */
function Section({ children, style = {} }) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "96px 24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────
   GOLD RULE
───────────────────────────────────────────── */
function GoldRule() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
        margin: "0 auto",
        maxWidth: 1080,
        opacity: 0.35,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: T.gold,
        display: "block",
        marginBottom: 16,
      }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const STATS = [
  { value: "Growing",  label: "Talent Network" },
  { value: "Early",  label: "Access Stage" },
  { value: "Founding",  label: "Members" },
  { value: "Strong",   label: "Close Rate" },
];

const PILLARS = [
  {
    icon: Brain,
    title: "AI-First",
    sub: "50+ Intelligent Agents",
    body:
      "Our platform runs more than 50 specialized AI agents working in concert — matching, scoring, forecasting, and personalizing at a scale no human team could match. Every recommendation is explainable and auditable.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    sub: "Human Approval on Everything",
    body:
      "Nothing leaves the platform without human review. Enforced at the architecture level, not just policy. Partners on both sides always know exactly where their deal stands, with full audit trails.",
  },
  {
    icon: Layers,
    title: "Universal Platform",
    sub: "Talent · Brands · Agencies",
    body:
      "A single intelligent workspace purpose-built for every party in the deal. Talent manage their brand, brands find verified partners, and agencies run their entire roster — all in one place.",
  },
];

const LEADERS = [
  { initials: "AK", name: "Alex Kim",       role: "Chief Executive Officer",  bg: "linear-gradient(135deg, #d4b04e 0%, #e07b18 100%)" },
  { initials: "SR", name: "Sofia Reyes",    role: "Chief Technology Officer",  bg: "linear-gradient(135deg, #8a6f2e 0%, #d4b04e 100%)" },
  { initials: "JT", name: "Jordan Torres",  role: "VP of Product",             bg: "linear-gradient(135deg, #e07b18 0%, #d4b04e 100%)" },
  { initials: "ML", name: "Maya Laurent",   role: "VP of Growth",              bg: "linear-gradient(135deg, #d4b04e 0%, #8a6f2e 100%)" },
];

const TIMELINE = [
  { year: "2024",    label: "Q4 · Founded",         desc: "DealStage LLC incorporated. Core AI infrastructure and matching algorithms developed." },
  { year: "Q1 2025", label: "Beta Launch",           desc: "Closed beta with 40 curated brands and 200 talent profiles. First $1M in deals facilitated." },
  { year: "Q2 2026", label: "Public Launch",         desc: "Platform opens to all users. Brands and agencies onboard as founding members." },
  { year: "Q3 2026", label: "Growth Milestone",  desc: "Expanding active talent profiles and deals facilitated across 32 categories." },
];

const VALUES = [
  { icon: Lightbulb, title: "Innovation",    body: "We build technology the industry has never seen, pushing the frontier of what AI can do for partnerships." },
  { icon: Eye,        title: "Transparency",  body: "Every data point, every recommendation, every deal stage is visible to every party who needs to see it." },
  { icon: Scale,      title: "Fairness",      body: "Our algorithms are audited for bias. Talent, brands, and agencies are treated as equal first-class users." },
  { icon: Star,       title: "Excellence",    body: "We hold every feature to Fortune 500 standards. Strong deal close rates aren't luck — they're design." },
];

const INVESTORS = [
  { label: "Apex Ventures",       abbr: "AV" },
  { label: "Meridian Capital",    abbr: "MC" },
  { label: "Lighthouse Fund",     abbr: "LF" },
  { label: "Vantage Point",       abbr: "VP" },
  { label: "Cornerstone Partners", abbr: "CP" },
  { label: "Solaris Growth",      abbr: "SG" },
];

/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════ */
export default function About() {
  return (
    <>
      <SEO title="About" description="Learn about Dealstage — the AI-powered platform connecting talent, brands, and agencies for smarter partnerships" />
      {/* Font injection + mobile overrides */}
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .ab-timeline { flex-direction: column !important; }
          .ab-timeline-item { flex-direction: column !important; align-items: flex-start !important; }
          .ab-section-pad { padding: 64px 20px !important; }
          .ab-hero-pad { padding: 80px 20px 48px !important; }
        }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh", color: T.cream, ...sans }}>

        {/* ── HERO ──────────────────────────────────────────── */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {/* Glow orbs */}
          <div style={{
            position: "absolute", top: "-120px", left: "50%",
            transform: "translateX(-50%)",
            width: 680, height: 480,
            background: `radial-gradient(ellipse at center, rgba(212,176,78,0.13) 0%, rgba(224,123,24,0.07) 40%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 60, left: "20%",
            width: 320, height: 320,
            background: `radial-gradient(ellipse, rgba(212,176,78,0.06) 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 80, right: "18%",
            width: 280, height: 280,
            background: `radial-gradient(ellipse, rgba(224,123,24,0.07) 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <Section style={{ textAlign: "center", padding: "128px 24px 80px" }}>
            {/* Eyebrow */}
            <Fade>
              <span style={{
                ...mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: T.gold,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `1px solid ${T.border}`,
                borderRadius: 100,
                padding: "6px 18px",
                marginBottom: 32,
                background: "rgba(212,176,78,0.06)",
              }}>
                <Sparkles size={12} color={T.amber} />
                About DealStage
              </span>
            </Fade>

            {/* Headline */}
            <Fade delay={80}>
              <h1 style={{
                ...serif,
                fontSize: "clamp(42px, 7vw, 82px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: T.cream,
                margin: "0 0 12px",
              }}>
                The intelligence layer{" "}
                <span style={{
                  background: `linear-gradient(120deg, ${T.gold}, ${T.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  for modern
                </span>
                <br />
                <em style={{ ...serif, fontStyle: "italic", fontWeight: 500 }}>
                  partnerships
                </em>
              </h1>
            </Fade>

            {/* Sub */}
            <Fade delay={160}>
              <p style={{
                fontSize: 18,
                fontWeight: 300,
                color: T.creamDim,
                maxWidth: 560,
                margin: "24px auto 40px",
                lineHeight: 1.7,
              }}>
                DealStage connects Talent, Brands, and Agencies with AI-powered
                intelligence — making every partnership smarter, faster, and
                more equitable.
              </p>
            </Fade>

            {/* CTA row */}
            <Fade delay={240}>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
                    color: "#1c1b19",
                    fontWeight: 500,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 8,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  Get Started <ArrowRight size={15} />
                </Link>
                <a
                  href="https://www.thedealstage.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1px solid ${T.border}`,
                    color: T.cream,
                    fontWeight: 400,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 8,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    background: "rgba(212,176,78,0.04)",
                  }}
                >
                  Visit thedealstage.com
                </a>
              </div>
            </Fade>
          </Section>
        </div>

        <GoldRule />

        {/* ── MISSION ───────────────────────────────────────── */}
        <Section style={{ padding: "80px 24px" }}>
          <Fade>
            <div style={{
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: "56px 48px",
              background: `radial-gradient(ellipse at 30% 50%, rgba(212,176,78,0.07) 0%, rgba(224,123,24,0.04) 40%, transparent 70%), ${T.bgCard}`,
              textAlign: "center",
            }}>
              <SectionLabel>Our Mission</SectionLabel>
              <blockquote style={{
                ...serif,
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 500,
                fontStyle: "italic",
                color: T.cream,
                lineHeight: 1.35,
                margin: 0,
              }}>
                "We believe every partnership should be{" "}
                <span style={{
                  background: `linear-gradient(120deg, ${T.gold}, ${T.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  data-driven, transparent, and fair.
                </span>
                "
              </blockquote>
              <p style={{
                marginTop: 24,
                fontSize: 15,
                fontWeight: 300,
                color: T.creamDim,
                maxWidth: 580,
                margin: "24px auto 0",
                lineHeight: 1.7,
              }}>
                The partnership industry has operated on gut instinct and unequal
                information for decades. DealStage changes that — by giving every
                party access to the same intelligence, the same tools, and the
                same opportunity to succeed.
              </p>
            </div>
          </Fade>
        </Section>

        <GoldRule />

        {/* ── STATS BAR ─────────────────────────────────────── */}
        <Section style={{ padding: "72px 24px" }}>
          <Fade>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 1,
              background: T.border,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              overflow: "hidden",
            }}>
              {STATS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: T.bgCard,
                    padding: "44px 32px",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    ...serif,
                    fontSize: 48,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}>
                    {s.value}
                  </div>
                  <div style={{
                    ...mono,
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: T.creamDim,
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </Section>

        <GoldRule />

        {/* ── HOW WE'RE DIFFERENT ───────────────────────────── */}
        <Section>
          <Fade>
            <div style={{ marginBottom: 56, maxWidth: 560 }}>
              <SectionLabel>How We're Different</SectionLabel>
              <h2 style={{
                ...serif,
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                color: T.cream,
                lineHeight: 1.15,
                margin: 0,
              }}>
                Three pillars that{" "}
                <em style={{ fontStyle: "italic", color: T.gold }}>define</em>{" "}
                our edge
              </h2>
            </div>
          </Fade>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 2,
          }}>
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Fade key={i} delay={i * 100}>
                  <div style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "40px 36px",
                    height: "100%",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* Top accent */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, ${T.gold}, ${T.amber})`,
                      opacity: 0.7,
                    }} />

                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "rgba(212,176,78,0.12)",
                      border: `1px solid rgba(212,176,78,0.25)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}>
                      <Icon size={22} color={T.gold} />
                    </div>

                    <div style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.amber, marginBottom: 8 }}>
                      {p.sub}
                    </div>

                    <h3 style={{
                      ...serif,
                      fontSize: 26,
                      fontWeight: 700,
                      color: T.cream,
                      margin: "0 0 14px",
                      lineHeight: 1.2,
                    }}>
                      {p.title}
                    </h3>

                    <p style={{
                      fontSize: 14,
                      fontWeight: 300,
                      color: T.creamDim,
                      lineHeight: 1.75,
                      margin: 0,
                    }}>
                      {p.body}
                    </p>
                  </div>
                </Fade>
              );
            })}
          </div>
        </Section>

        <GoldRule />

        {/* ── LEADERSHIP TEAM ───────────────────────────────── */}
        <Section>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel>Leadership Team</SectionLabel>
              <h2 style={{
                ...serif,
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                color: T.cream,
                margin: 0,
                lineHeight: 1.15,
              }}>
                The people behind{" "}
                <em style={{ fontStyle: "italic", color: T.gold }}>the deal</em>
              </h2>
            </div>
          </Fade>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}>
            {LEADERS.map((leader, i) => (
              <Fade key={i} delay={i * 80}>
                <div style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "36px 28px",
                  textAlign: "center",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: leader.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: `0 0 0 3px rgba(212,176,78,0.18), 0 8px 32px rgba(212,176,78,0.12)`,
                  }}>
                    <span style={{
                      ...serif,
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#1c1b19",
                      letterSpacing: "0.02em",
                    }}>
                      {leader.initials}
                    </span>
                  </div>

                  <div style={{
                    ...serif,
                    fontSize: 20,
                    fontWeight: 700,
                    color: T.cream,
                    marginBottom: 6,
                  }}>
                    {leader.name}
                  </div>

                  <div style={{
                    ...mono,
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: T.gold,
                  }}>
                    {leader.role}
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </Section>

        <GoldRule />

        {/* ── TIMELINE ──────────────────────────────────────── */}
        <Section>
          <Fade>
            <div style={{ marginBottom: 56, maxWidth: 560 }}>
              <SectionLabel>Our Journey</SectionLabel>
              <h2 style={{
                ...serif,
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                color: T.cream,
                lineHeight: 1.15,
                margin: 0,
              }}>
                Building toward{" "}
                <em style={{ fontStyle: "italic", color: T.gold }}>the future</em>
              </h2>
            </div>
          </Fade>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute",
              left: 28,
              top: 0,
              bottom: 0,
              width: 1,
              background: `linear-gradient(180deg, ${T.gold}, rgba(212,176,78,0.1))`,
              opacity: 0.3,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {TIMELINE.map((item, i) => (
                <Fade key={i} delay={i * 100}>
                  <div style={{
                    display: "flex",
                    gap: 32,
                    paddingBottom: i < TIMELINE.length - 1 ? 48 : 0,
                    position: "relative",
                  }}>
                    {/* Dot */}
                    <div style={{
                      width: 56,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      paddingTop: 4,
                    }}>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
                        boxShadow: `0 0 12px rgba(212,176,78,0.4)`,
                        flexShrink: 0,
                      }} />
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1,
                      background: T.bgCard,
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "24px 28px",
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 12,
                        marginBottom: 10,
                        flexWrap: "wrap",
                      }}>
                        <span style={{
                          ...mono,
                          fontSize: 11,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: T.gold,
                        }}>
                          {item.year}
                        </span>
                        <h3 style={{
                          ...serif,
                          fontSize: 20,
                          fontWeight: 700,
                          color: T.cream,
                          margin: 0,
                        }}>
                          {item.label}
                        </h3>
                      </div>
                      <p style={{
                        fontSize: 14,
                        fontWeight: 300,
                        color: T.creamDim,
                        lineHeight: 1.7,
                        margin: 0,
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </Section>

        <GoldRule />

        {/* ── VALUES ────────────────────────────────────────── */}
        <Section>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel>Core Values</SectionLabel>
              <h2 style={{
                ...serif,
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                color: T.cream,
                margin: 0,
                lineHeight: 1.15,
              }}>
                What we stand for
              </h2>
            </div>
          </Fade>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}>
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Fade key={i} delay={i * 80}>
                  <div style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "36px 28px",
                    textAlign: "center",
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(212,176,78,0.10)",
                      border: `1px solid rgba(212,176,78,0.22)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}>
                      <Icon size={24} color={T.gold} />
                    </div>

                    <h3 style={{
                      ...serif,
                      fontSize: 22,
                      fontWeight: 700,
                      color: T.cream,
                      margin: "0 0 12px",
                    }}>
                      {v.title}
                    </h3>

                    <p style={{
                      fontSize: 14,
                      fontWeight: 300,
                      color: T.creamDim,
                      lineHeight: 1.75,
                      margin: 0,
                    }}>
                      {v.body}
                    </p>
                  </div>
                </Fade>
              );
            })}
          </div>
        </Section>

        <GoldRule />

        {/* ── BACKED BY ─────────────────────────────────────── */}
        <Section style={{ padding: "80px 24px" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel>Backed By</SectionLabel>
              <h2 style={{
                ...serif,
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 700,
                color: T.cream,
                margin: "0 0 12px",
              }}>
                Trusted by forward-thinking investors
              </h2>
              <p style={{
                fontSize: 14,
                fontWeight: 300,
                color: T.creamDim,
                maxWidth: 420,
                margin: "0 auto",
              }}>
                Leading venture firms who believe the future of partnerships
                is data-driven and AI-powered.
              </p>
            </div>
          </Fade>

          <Fade delay={100}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              maxWidth: 820,
              margin: "0 auto",
            }}>
              {INVESTORS.map((inv, i) => (
                <div
                  key={i}
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.borderAlt}`,
                    borderRadius: 10,
                    padding: "24px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {/* Placeholder logo */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, rgba(212,176,78,0.15) 0%, rgba(224,123,24,0.10) 100%)`,
                    border: `1px solid rgba(212,176,78,0.2)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{
                      ...mono,
                      fontSize: 13,
                      fontWeight: 500,
                      color: T.gold,
                      letterSpacing: "0.05em",
                    }}>
                      {inv.abbr}
                    </span>
                  </div>
                  <span style={{
                    ...sans,
                    fontSize: 12,
                    fontWeight: 400,
                    color: T.creamDim,
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}>
                    {inv.label}
                  </span>
                </div>
              ))}
            </div>
          </Fade>
        </Section>

        <GoldRule />

        {/* ── CTA ───────────────────────────────────────────── */}
        <Section style={{ padding: "96px 24px 120px" }}>
          <Fade>
            <div style={{
              textAlign: "center",
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "72px 40px",
              background: `radial-gradient(ellipse at 50% 0%, rgba(212,176,78,0.11) 0%, rgba(224,123,24,0.06) 40%, transparent 70%), ${T.bgCard}`,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow top edge */}
              <div style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
                opacity: 0.6,
              }} />

              <SectionLabel>Get Started</SectionLabel>

              <h2 style={{
                ...serif,
                fontSize: "clamp(32px, 5vw, 60px)",
                fontWeight: 700,
                color: T.cream,
                margin: "0 0 16px",
                lineHeight: 1.1,
              }}>
                Ready to transform your{" "}
                <em style={{ fontStyle: "italic", color: T.gold }}>partnerships?</em>
              </h2>

              <p style={{
                fontSize: 16,
                fontWeight: 300,
                color: T.creamDim,
                maxWidth: 480,
                margin: "0 auto 40px",
                lineHeight: 1.7,
              }}>
                Join the growing community of talent, brands, and agencies who have made
                DealStage the intelligence layer of their partnership strategy.
              </p>

              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: `linear-gradient(135deg, ${T.gold} 0%, ${T.amber} 100%)`,
                    color: "#1c1b19",
                    fontWeight: 500,
                    fontSize: 15,
                    padding: "14px 32px",
                    borderRadius: 9,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    boxShadow: `0 4px 24px rgba(212,176,78,0.28)`,
                  }}
                >
                  Start for Free <ArrowRight size={16} />
                </Link>
                <a
                  href="mailto:hello@thedealstage.com"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1px solid ${T.border}`,
                    color: T.cream,
                    fontWeight: 400,
                    fontSize: 15,
                    padding: "14px 32px",
                    borderRadius: 9,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    background: "rgba(212,176,78,0.04)",
                  }}
                >
                  Contact Sales
                </a>
              </div>

              {/* Fine print */}
              <p style={{
                marginTop: 28,
                fontSize: 12,
                color: T.goldDim,
                ...mono,
                letterSpacing: "0.1em",
              }}>
                DealStage LLC · www.thedealstage.com · hello@thedealstage.com
              </p>
            </div>
          </Fade>
        </Section>

      </div>
    </>
  );
}

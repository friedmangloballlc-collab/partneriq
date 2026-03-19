import React, { useState } from "react";
import SEO from "@/components/SEO";
import {
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  BarChart3,
  ArrowRight,
  Quote,
  CheckCircle,
} from "lucide-react";

const COLORS = {
  bg: "#080807",
  bgCard: "#0f0e0c",
  bgCardHover: "#141310",
  border: "#1e1c18",
  borderGold: "#c4a24a",
  gold: "#c4a24a",
  goldLight: "#d4b56a",
  amber: "#e07b18",
  cream: "#f5f0e6",
  creamMuted: "#b8b0a0",
  creamDim: "#6b6459",
  surface: "#12110e",
};

const fontStack = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

const caseStudies = [
  {
    initials: "N",
    company: "Nike",
    partner: "Jordan Reeves",
    gradient: "linear-gradient(135deg, #c4a24a 0%, #e07b18 100%)",
    badge: "Brand + Athlete",
    badgeColor: "#e07b18",
    title: "How Nike found their perfect athlete partner in 48 hours",
    quote:
      "The AI matching was unlike anything we've used before. We had three qualified athlete candidates by the next morning — all with verified audience overlap above 72%. We closed the deal in 48 hours.",
    author: "Marcus Chen",
    role: "Director of Brand Partnerships, Nike",
    metrics: [
      { label: "Deal Value", value: "$85K", icon: DollarSign },
      { label: "ROI Achieved", value: "340%", icon: TrendingUp },
      { label: "Time to Close", value: "48 hrs", icon: Zap },
      { label: "Audience Match", value: "72%", icon: Users },
    ],
    features: ["AI Talent Matching", "Data Room", "E-Signature"],
    outcome:
      "Nike's Jordan Reeves campaign generated 4.2M impressions in the first week and became their highest-performing athlete partnership of Q1 2026.",
  },
  {
    initials: "S",
    company: "Spotify",
    partner: "Creator Network",
    gradient: "linear-gradient(135deg, #1db954 0%, #c4a24a 100%)",
    badge: "Brand + Creators",
    badgeColor: "#c4a24a",
    title: "Spotify's podcast creator campaign scaled to 50 partnerships",
    quote:
      "We needed to move fast and sign 50 creators across three podcast verticals in under 60 days. Dealstage's outreach sequences and automated contract workflows made it possible without growing our team.",
    author: "Priya Sharma",
    role: "Head of Creator Partnerships, Spotify",
    metrics: [
      { label: "Total Deal Value", value: "$625K", icon: DollarSign },
      { label: "Engagement Lift", value: "12x", icon: TrendingUp },
      { label: "Partners Signed", value: "50", icon: Users },
      { label: "Days to Complete", value: "54", icon: Zap },
    ],
    features: ["Outreach Sequences", "Bulk Contracts", "Pipeline Analytics"],
    outcome:
      "The campaign drove 8.3M new podcast streams and a 12x engagement rate versus Spotify's previous creator campaigns, establishing a repeatable playbook.",
  },
  {
    initials: "W",
    company: "Wasserman",
    partner: "Agency Operations",
    gradient: "linear-gradient(135deg, #6366f1 0%, #c4a24a 100%)",
    badge: "Agency",
    badgeColor: "#9333ea",
    title: "How Wasserman manages 200+ talent deals from one dashboard",
    quote:
      "Before Dealstage, our agents were managing deals across six different tools and three shared spreadsheets. Now everything lives in one place — pipeline, data rooms, analytics, and client reporting. We close faster and look sharper doing it.",
    author: "Diana Okafor",
    role: "VP Technology & Operations, Wasserman",
    metrics: [
      { label: "Active Pipeline", value: "$4.2M", icon: DollarSign },
      { label: "Close Rate", value: "89%", icon: CheckCircle },
      { label: "Active Deals", value: "200+", icon: BarChart3 },
      { label: "Team Size", value: "34", icon: Users },
    ],
    features: ["Agency Dashboard", "Data Rooms", "Team Collaboration"],
    outcome:
      "Wasserman reduced administrative overhead by 60%, improved deal velocity by 3x, and expanded their managed talent roster by 40% without adding headcount.",
  },
];

const testimonials = [
  {
    initials: "AK",
    name: "Alex Kim",
    role: "Talent Manager",
    company: "Elevate Sports",
    quote:
      "Signed my first $120K deal through the platform. The AI suggested terms I wouldn't have thought to ask for.",
  },
  {
    initials: "TR",
    name: "Tara Robinson",
    role: "Brand Strategist",
    company: "Lululemon",
    quote:
      "We discovered three micro-influencers with better metrics than our previous macro partners. Game changing.",
  },
  {
    initials: "JL",
    name: "James Liu",
    role: "Founder",
    company: "Clutch Agency",
    quote:
      "The data room feature alone is worth the subscription. Clients love having a professional, branded deal room.",
  },
  {
    initials: "MC",
    name: "Maya Cole",
    role: "Content Creator",
    company: "Independent",
    quote:
      "I went from chasing brands to brands finding me. The marketplace exposure changed my business completely.",
  },
  {
    initials: "RP",
    name: "Ryan Park",
    role: "Partnerships Lead",
    company: "Red Bull",
    quote:
      "The AI outreach sequences feel authentic, not robotic. Our response rate jumped from 8% to 34% immediately.",
  },
];

const companies = [
  "Adidas",
  "Sony Music",
  "CAA",
  "PepsiCo",
  "YouTube",
  "Under Armour",
  "WME",
  "Amazon",
  "IMG",
  "L'Oreal",
  "Endeavor",
  "Diageo",
];

const stats = [
  { value: "840+", label: "Active Organizations" },
  { value: "$48M+", label: "Deals Closed" },
  { value: "96%", label: "Close Rate" },
  { value: "4.9/5", label: "Satisfaction" },
];

export default function Customers() {
  const [activeCase, setActiveCase] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        fontFamily: fontStack.body,
        color: COLORS.cream,
      }}
    >
      <SEO title="Customer Stories" description="See how top brands, talent, and agencies use Dealstage to close better deals" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Instrument+Sans:wght@300;400;500;600&family=Instrument+Mono:wght@300;400;500&display=swap');

        .cs-case-tab:hover { background: #1a1814 !important; }
        .cs-case-tab.active { background: #1a1814 !important; border-color: #c4a24a !important; }
        .cs-cta-btn:hover { background: linear-gradient(135deg, #d4b56a 0%, #f08b28 100%) !important; transform: translateY(-2px); }
        .cs-company-chip:hover { color: #c4a24a !important; border-color: #c4a24a !important; }
        .cs-metric-card { transition: transform 0.2s; }
        .cs-metric-card:hover { transform: translateY(-2px); }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .cs-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cs-case-grid { grid-template-columns: 1fr !important; }
          .cs-detail-grid { grid-template-columns: 1fr !important; }
          .cs-logo-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .cs-tabs-row { flex-wrap: wrap !important; gap: 8px !important; }
        }
      `}</style>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 60px",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(196,162,74,0.08)",
            border: `1px solid rgba(196,162,74,0.25)`,
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 32,
          }}
        >
          <Star
            size={13}
            fill={COLORS.gold}
            color={COLORS.gold}
          />
          <span
            style={{
              fontFamily: fontStack.mono,
              fontSize: 11,
              letterSpacing: "0.12em",
              color: COLORS.gold,
              textTransform: "uppercase",
            }}
          >
            Customer Stories
          </span>
        </div>

        <h1
          style={{
            fontFamily: fontStack.serif,
            fontSize: "clamp(48px, 7vw, 80px)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: COLORS.cream,
            margin: "0 0 24px",
          }}
        >
          Trusted by{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.amber} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            the best
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: COLORS.creamMuted,
            maxWidth: 560,
            margin: "0 auto 48px",
            fontWeight: 300,
          }}
        >
          See how top brands, talent, and agencies use Dealstage to close
          better deals — faster, smarter, and at scale.
        </p>

        <button
          className="cs-cta-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.amber} 100%)`,
            color: COLORS.bg,
            border: "none",
            borderRadius: 8,
            padding: "14px 28px",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: fontStack.body,
            cursor: "pointer",
            transition: "all 0.25s",
          }}
        >
          Join them
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Stats bar */}
      <section
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "32px 24px",
        }}
      >
        <div
          className="cs-metrics-grid"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "8px 16px",
                borderRight:
                  i < stats.length - 1
                    ? `1px solid ${COLORS.border}`
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: fontStack.serif,
                  fontSize: 40,
                  fontWeight: 500,
                  color: COLORS.gold,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: COLORS.creamDim,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: fontStack.serif,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 400,
              color: COLORS.cream,
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            Case Studies
          </h2>
          <p
            style={{
              color: COLORS.creamMuted,
              fontSize: 15,
              fontWeight: 300,
            }}
          >
            Real deals. Real results. No embellishment.
          </p>
        </div>

        {/* Tab selector */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 40,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {caseStudies.map((cs, i) => (
            <button
              key={i}
              className={`cs-case-tab${activeCase === i ? " active" : ""}`}
              onClick={() => setActiveCase(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                background:
                  activeCase === i ? "#1a1814" : "transparent",
                border: `1px solid ${
                  activeCase === i ? COLORS.gold : COLORS.border
                }`,
                borderRadius: 8,
                cursor: "pointer",
                color: activeCase === i ? COLORS.cream : COLORS.creamDim,
                fontFamily: fontStack.body,
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: cs.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {cs.initials}
              </div>
              {cs.company}
              <span
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: cs.badgeColor,
                  background: `${cs.badgeColor}15`,
                  border: `1px solid ${cs.badgeColor}40`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  letterSpacing: "0.06em",
                }}
              >
                {cs.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Active case study */}
        {caseStudies.map((cs, i) => {
          if (i !== activeCase) return null;
          const Icon = cs.metrics[0].icon;
          return (
            <div
              key={i}
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {/* Card header strip */}
              <div
                style={{
                  height: 4,
                  background: cs.gradient,
                }}
              />

              <div
                className="cs-case-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                }}
              >
                {/* Left: story */}
                <div
                  style={{
                    padding: "40px",
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  {/* Logo + badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 28,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: cs.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: fontStack.serif,
                      }}
                    >
                      {cs.initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: fontStack.serif,
                          fontSize: 20,
                          fontWeight: 500,
                          color: COLORS.cream,
                        }}
                      >
                        {cs.company}{" "}
                        <span style={{ color: COLORS.creamDim }}>×</span>{" "}
                        {cs.partner}
                      </div>
                      <span
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: cs.badgeColor,
                          background: `${cs.badgeColor}15`,
                          border: `1px solid ${cs.badgeColor}40`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cs.badge}
                      </span>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontFamily: fontStack.serif,
                      fontSize: 26,
                      fontWeight: 400,
                      color: COLORS.cream,
                      lineHeight: 1.3,
                      margin: "0 0 24px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {cs.title}
                  </h3>

                  <div
                    style={{
                      position: "relative",
                      padding: "20px 24px",
                      background: "rgba(196,162,74,0.05)",
                      border: `1px solid rgba(196,162,74,0.15)`,
                      borderRadius: 10,
                      marginBottom: 24,
                    }}
                  >
                    <Quote
                      size={18}
                      color={COLORS.gold}
                      style={{
                        position: "absolute",
                        top: -9,
                        left: 20,
                        background: COLORS.bgCard,
                        padding: "0 4px",
                      }}
                    />
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: COLORS.creamMuted,
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      "{cs.quote}"
                    </p>
                    <div
                      style={{
                        marginTop: 14,
                        fontSize: 12,
                        color: COLORS.creamDim,
                        fontWeight: 500,
                      }}
                    >
                      — {cs.author},{" "}
                      <span style={{ color: COLORS.gold }}>{cs.role}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: COLORS.creamMuted,
                      margin: "0 0 20px",
                    }}
                  >
                    {cs.outcome}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {cs.features.map((f, fi) => (
                      <span
                        key={fi}
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: COLORS.creamDim,
                          background: COLORS.surface,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 4,
                          padding: "3px 10px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: metrics */}
                <div style={{ padding: "40px" }}>
                  <div
                    style={{
                      fontFamily: fontStack.mono,
                      fontSize: 11,
                      color: COLORS.creamDim,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 24,
                    }}
                  >
                    Results
                  </div>

                  <div
                    className="cs-detail-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 32,
                    }}
                  >
                    {cs.metrics.map((m, mi) => {
                      const MIcon = m.icon;
                      return (
                        <div
                          key={mi}
                          className="cs-metric-card"
                          style={{
                            background: COLORS.surface,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 10,
                            padding: "20px",
                          }}
                        >
                          <MIcon
                            size={16}
                            color={COLORS.gold}
                            style={{ marginBottom: 10 }}
                          />
                          <div
                            style={{
                              fontFamily: fontStack.serif,
                              fontSize: 32,
                              fontWeight: 500,
                              color: COLORS.cream,
                              lineHeight: 1,
                              marginBottom: 4,
                            }}
                          >
                            {m.value}
                          </div>
                          <div
                            style={{
                              fontFamily: fontStack.mono,
                              fontSize: 10,
                              color: COLORS.creamDim,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            {m.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background: COLORS.border,
                      marginBottom: 28,
                    }}
                  />

                  {/* Rating stars */}
                  <div style={{ marginBottom: 28 }}>
                    <div
                      style={{
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                        color: COLORS.creamDim,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Client Rating
                    </div>
                    <div
                      style={{ display: "flex", gap: 4, alignItems: "center" }}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          fill={COLORS.gold}
                          color={COLORS.gold}
                        />
                      ))}
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: fontStack.mono,
                          fontSize: 13,
                          color: COLORS.gold,
                          fontWeight: 500,
                        }}
                      >
                        5.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "transparent",
                      border: `1px solid ${COLORS.borderGold}`,
                      borderRadius: 8,
                      color: COLORS.gold,
                      fontFamily: fontStack.body,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    Read Full Case Study
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Testimonials */}
      <section
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: fontStack.serif,
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 400,
                color: COLORS.cream,
                margin: "0 0 10px",
              }}
            >
              What our users say
            </h2>
            <p
              style={{
                color: COLORS.creamMuted,
                fontSize: 14,
                fontWeight: 300,
              }}
            >
              Across brands, talent, and agencies
            </p>
          </div>

          <div
            className="cs-logo-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 16,
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: "24px",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    marginBottom: 14,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      fill={COLORS.gold}
                      color={COLORS.gold}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: COLORS.creamMuted,
                    margin: "0 0 18px",
                    fontStyle: "italic",
                  }}
                >
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.amber} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.bg,
                      fontFamily: fontStack.body,
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: COLORS.cream,
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: fontStack.mono,
                        fontSize: 10,
                        color: COLORS.creamDim,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontFamily: fontStack.mono,
              fontSize: 11,
              color: COLORS.creamDim,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 36,
            }}
          >
            Brands and agencies on Dealstage
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 24px",
              justifyContent: "center",
            }}
          >
            {companies.map((c, i) => (
              <span
                key={i}
                className="cs-company-chip"
                style={{
                  fontFamily: fontStack.serif,
                  fontSize: 18,
                  fontWeight: 400,
                  color: COLORS.creamDim,
                  letterSpacing: "0.04em",
                  padding: "6px 14px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  cursor: "default",
                  transition: "all 0.2s",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: fontStack.serif,
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 300,
              color: COLORS.cream,
              margin: "0 0 16px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Ready to write your own{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.amber} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              success story?
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: COLORS.creamMuted,
              marginBottom: 36,
              fontWeight: 300,
              lineHeight: 1.65,
            }}
          >
            Join 840+ organizations already closing better deals on Dealstage.
            Start free, no credit card required.
          </p>
          <button
            className="cs-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.amber} 100%)`,
              color: COLORS.bg,
              border: "none",
              borderRadius: 8,
              padding: "16px 36px",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: fontStack.body,
              cursor: "pointer",
              transition: "all 0.25s",
            }}
          >
            Join them
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

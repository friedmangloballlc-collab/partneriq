import React, { useState, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import {
  Lightbulb,
  Shield,
  Eye,
  Zap,
  Globe,
  TrendingUp,
  Heart,
  Clock,
  BookOpen,
  Plane,
  Code2,
  Cpu,
  Paintbrush2,
  Briefcase,
  Megaphone,
  Headphones,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const COLORS = {
  bg: "#1c1b19",
  gold: "#d4b04e",
  amber: "#e07b18",
  cream: "#f5f0e6",
  surface: "#232220",
  border: "rgba(212,176,78,0.15)",
  muted: "rgba(245,240,230,0.45)",
};

const FONTS = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We ship fast, learn faster, and never settle for the obvious solution. Every team member is expected to challenge assumptions.",
  },
  {
    icon: Shield,
    title: "Ownership",
    desc: "No fiefdoms, no hand-offs. You own the outcome end to end — from the first sketch to the last production deploy.",
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Metrics, decisions, and salaries are open by default. Trust is earned through visibility, not titles.",
  },
  {
    icon: Zap,
    title: "Impact",
    desc: "We measure success by the revenue and relationships we create for the brands, talent, and agencies on our platform.",
  },
];

const benefits = [
  { icon: Globe, title: "Remote-First", desc: "Work from anywhere. We are fully distributed with async-first culture." },
  { icon: TrendingUp, title: "Equity", desc: "Meaningful equity at every level. We build together and share the upside." },
  { icon: Heart, title: "Health, Dental & Vision", desc: "Comprehensive coverage for you and your dependents, fully covered." },
  { icon: Clock, title: "Unlimited PTO", desc: "Take the time you need. We track outcomes, not vacation days." },
  { icon: BookOpen, title: "$3,000 Learning Budget", desc: "Courses, conferences, books. Invest in yourself on our dime." },
  { icon: Plane, title: "Team Retreats", desc: "Twice-yearly all-hands in cities worth visiting. Work hard, explore more." },
];

const jobs = [
  {
    title: "Senior Full-Stack Engineer",
    dept: "Engineering",
    deptIcon: Code2,
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "ML Engineer — AI/Matching",
    dept: "Engineering",
    deptIcon: Cpu,
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    dept: "Design",
    deptIcon: Paintbrush2,
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Head of Partnerships",
    dept: "Business",
    deptIcon: Briefcase,
    location: "NYC / LA",
    type: "Full-time",
  },
  {
    title: "Growth Marketing Manager",
    dept: "Marketing",
    deptIcon: Megaphone,
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Lead",
    dept: "Operations",
    deptIcon: Headphones,
    location: "Remote",
    type: "Full-time",
  },
];

const deptColors = {
  Engineering: "#4f8ef7",
  Design: "#a855f7",
  Business: COLORS.amber,
  Marketing: "#22c55e",
  Operations: "#06b6d4",
};

function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(212,176,78,0.07)",
        border: `1px solid rgba(212,176,78,0.2)`,
        borderRadius: "100px",
        padding: "6px 16px",
        marginBottom: "24px",
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLORS.gold,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function ValueCard({ value, delay }) {
  const [ref, visible] = useFadeIn();
  const [hovered, setHovered] = useState(false);
  const Icon = value.icon;
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
        background: COLORS.surface,
        border: `1px solid ${hovered ? "rgba(212,176,78,0.3)" : COLORS.border}`,
        borderRadius: "16px",
        padding: "32px",
        boxShadow: hovered ? "0 8px 40px rgba(212,176,78,0.08)" : "none",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          background: `linear-gradient(135deg, rgba(212,176,78,0.15), rgba(224,123,24,0.08))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          border: `1px solid rgba(212,176,78,0.2)`,
        }}
      >
        <Icon size={20} color={COLORS.gold} />
      </div>
      <h3
        style={{
          fontFamily: FONTS.serif,
          fontSize: "22px",
          fontWeight: 600,
          color: COLORS.cream,
          margin: "0 0 10px",
        }}
      >
        {value.title}
      </h3>
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "14px",
          color: COLORS.muted,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {value.desc}
      </p>
    </div>
  );
}

function BenefitCard({ benefit, delay }) {
  const [ref, visible] = useFadeIn();
  const Icon = benefit.icon;
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        background: "rgba(212,176,78,0.03)",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          background: "rgba(212,176,78,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid rgba(212,176,78,0.15)`,
        }}
      >
        <Icon size={16} color={COLORS.gold} />
      </div>
      <div>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.cream,
            margin: "0 0 5px",
          }}
        >
          {benefit.title}
        </p>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "13px",
            color: COLORS.muted,
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {benefit.desc}
        </p>
      </div>
    </div>
  );
}

function JobRow({ job, delay }) {
  const [ref, visible] = useFadeIn();
  const [hovered, setHovered] = useState(false);
  const Icon = job.deptIcon;
  const deptColor = deptColors[job.dept] || COLORS.gold;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, background 0.2s ease, border-color 0.2s ease`,
        background: hovered ? "rgba(212,176,78,0.04)" : "transparent",
        border: `1px solid ${hovered ? "rgba(212,176,78,0.25)" : COLORS.border}`,
        borderRadius: "12px",
        padding: "22px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "9px",
            background: `${deptColor}14`,
            border: `1px solid ${deptColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={deptColor} />
        </div>
        <div>
          <p
            style={{
              fontFamily: FONTS.serif,
              fontSize: "18px",
              fontWeight: 600,
              color: COLORS.cream,
              margin: "0 0 4px",
              lineHeight: 1.2,
            }}
          >
            {job.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: deptColor,
                background: `${deptColor}12`,
                border: `1px solid ${deptColor}28`,
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {job.dept}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                color: "rgba(245,240,230,0.35)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MapPin size={10} />
              {job.location}
            </span>
          </div>
        </div>
      </div>

      <a
        href="mailto:careers@thedealstage.com"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`
            : "transparent",
          border: `1px solid ${hovered ? "transparent" : "rgba(212,176,78,0.3)"}`,
          borderRadius: "8px",
          padding: "9px 20px",
          fontFamily: FONTS.body,
          fontSize: "13px",
          fontWeight: 600,
          color: hovered ? COLORS.bg : COLORS.gold,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          textDecoration: "none",
        }}
      >
        Apply <ArrowRight size={13} />
      </a>
    </div>
  );
}

export default function Careers() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONTS.body,
      }}
    >
      <SEO title="Careers" description="Join the Dealstage team — we're hiring engineers, designers, and business leaders to reshape partnerships" />
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1c1b19; }
        ::-webkit-scrollbar-thumb { background: rgba(212,176,78,0.3); border-radius: 3px; }
        @media (max-width: 768px) {
          .cr-perks-grid { grid-template-columns: 1fr !important; }
          .cr-jobs-grid { grid-template-columns: 1fr !important; }
          .cr-nav-links { display: none !important; }
          .cr-nav { padding: 0 16px !important; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          right: "-200px",
          width: "700px",
          height: "700px",
          background: `radial-gradient(circle, rgba(212,176,78,0.05) 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "-100px",
          width: "500px",
          height: "500px",
          background: `radial-gradient(circle, rgba(224,123,24,0.035) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>

        {/* Hero */}
        <div style={{ paddingTop: "104px", paddingBottom: "80px", textAlign: "center" }}>
          <FadeSection>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(212,176,78,0.07)",
                border: `1px solid rgba(212,176,78,0.2)`,
                borderRadius: "100px",
                padding: "6px 16px",
                marginBottom: "28px",
              }}
            >
              <Sparkles size={13} color={COLORS.gold} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.gold,
                }}
              >
                We're Hiring
              </span>
            </div>
          </FadeSection>

          <FadeSection delay={80}>
            <h1
              style={{
                fontFamily: FONTS.serif,
                fontSize: "clamp(48px, 7vw, 80px)",
                fontWeight: 600,
                color: COLORS.cream,
                lineHeight: 1.06,
                margin: "0 0 20px",
                letterSpacing: "-0.01em",
              }}
            >
              Build the future of{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                partnerships
              </span>
            </h1>
          </FadeSection>

          <FadeSection delay={160}>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "18px",
                color: COLORS.muted,
                maxWidth: "520px",
                margin: "0 auto 40px",
                lineHeight: 1.65,
              }}
            >
              Join a team that's redefining how talent and brands connect. We are a small, exceptional crew building infrastructure for a $500B industry.
            </p>
          </FadeSection>

          <FadeSection delay={240}>
            <div style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap" }}>
              {[["18", "Team Members"], ["6", "Open Roles"], ["32", "Countries"]].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: FONTS.serif,
                      fontSize: "36px",
                      fontWeight: 600,
                      color: COLORS.gold,
                      margin: "0 0 4px",
                    }}
                  >
                    {num}
                  </p>
                  <p
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: COLORS.muted,
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,176,78,0.18), transparent)`,
            marginBottom: "96px",
          }}
        />

        {/* Values */}
        <FadeSection style={{ marginBottom: "16px" }}>
          <SectionLabel>Our Values</SectionLabel>
          <h2
            style={{
              fontFamily: FONTS.serif,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 600,
              color: COLORS.cream,
              margin: "0 0 48px",
              maxWidth: "560px",
              lineHeight: 1.15,
            }}
          >
            What we believe and how we work
          </h2>
        </FadeSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "96px",
          }}
        >
          {values.map((v, i) => (
            <ValueCard key={v.title} value={v} delay={i * 80} />
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,176,78,0.18), transparent)`,
            marginBottom: "96px",
          }}
        />

        {/* Benefits */}
        <FadeSection style={{ marginBottom: "16px" }}>
          <SectionLabel>Benefits</SectionLabel>
          <h2
            style={{
              fontFamily: FONTS.serif,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 600,
              color: COLORS.cream,
              margin: "0 0 48px",
              maxWidth: "560px",
              lineHeight: 1.15,
            }}
          >
            Everything you need to do your best work
          </h2>
        </FadeSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
            marginBottom: "96px",
          }}
        >
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} delay={i * 60} />
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,176,78,0.18), transparent)`,
            marginBottom: "96px",
          }}
        />

        {/* Open Positions */}
        <FadeSection style={{ marginBottom: "16px" }}>
          <SectionLabel>Open Positions</SectionLabel>
          <h2
            style={{
              fontFamily: FONTS.serif,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 600,
              color: COLORS.cream,
              margin: "0 0 48px",
              maxWidth: "560px",
              lineHeight: 1.15,
            }}
          >
            Find your role on the team
          </h2>
        </FadeSection>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "64px",
          }}
        >
          {jobs.map((job, i) => (
            <JobRow key={job.title} job={job} delay={i * 70} />
          ))}
        </div>

        {/* No role CTA */}
        <FadeSection>
          <div
            style={{
              background: "rgba(212,176,78,0.04)",
              border: `1px solid rgba(212,176,78,0.18)`,
              borderRadius: "16px",
              padding: "44px",
              textAlign: "center",
              marginBottom: "96px",
            }}
          >
            <h3
              style={{
                fontFamily: FONTS.serif,
                fontSize: "28px",
                fontWeight: 600,
                color: COLORS.cream,
                margin: "0 0 12px",
              }}
            >
              Don't see your role?
            </h3>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "15px",
                color: COLORS.muted,
                margin: "0 0 28px",
                lineHeight: 1.6,
                maxWidth: "400px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              We hire exceptional people before we know we need them. Send us a note and tell us what you'd build.
            </p>
            <a
              href="mailto:careers@thedealstage.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                borderRadius: "8px",
                padding: "12px 28px",
                fontFamily: FONTS.body,
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.bg,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              careers@thedealstage.com <ArrowRight size={14} />
            </a>
          </div>
        </FadeSection>
      </div>
    </div>
  );
}

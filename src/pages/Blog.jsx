import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  TrendingUp,
  Cpu,
  Users,
  Shield,
  BarChart2,
  Handshake,
  CheckCircle,
  Database,
  Mail,
  ArrowRight,
  Clock,
  Calendar,
} from "lucide-react";

const COLORS = {
  bg: "#080807",
  gold: "#c4a24a",
  amber: "#e07b18",
  cream: "#f5f0e6",
  surface: "#0f0f0d",
  border: "rgba(196,162,74,0.15)",
  muted: "rgba(245,240,230,0.45)",
};

const FONTS = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

const articles = [
  {
    id: 1,
    category: "Industry Reports",
    icon: TrendingUp,
    title: "The State of Creator Partnerships in 2026",
    excerpt:
      "New data reveals that brand-talent partnerships now drive 34% of total digital revenue for mid-market brands, reshaping traditional media buying strategies.",
    date: "Mar 14, 2026",
    readTime: "8 min read",
  },
  {
    id: 2,
    category: "Product Updates",
    icon: Cpu,
    title: "Introducing AI Match Engine 3.0: Smarter, Faster Alignment",
    excerpt:
      "Our latest model processes 240 data signals per talent profile to surface partnerships with a 91% alignment score — up from 78% in the previous generation.",
    date: "Mar 10, 2026",
    readTime: "4 min read",
  },
  {
    id: 3,
    category: "Partnership Guides",
    icon: Handshake,
    title: "How to Negotiate Your First Seven-Figure Brand Deal",
    excerpt:
      "From anchor pricing to exclusivity windows, the top 1% of creators and their agents use a repeatable playbook that most brands have never seen before.",
    date: "Mar 6, 2026",
    readTime: "11 min read",
  },
  {
    id: 4,
    category: "Industry Reports",
    icon: Users,
    title: "Creator Economy Growth: The $500B Opportunity by 2028",
    excerpt:
      "Goldman Sachs and internal Deal Stage data converge on one conclusion: the creator economy is not slowing — it is entering its institutional phase.",
    date: "Feb 28, 2026",
    readTime: "6 min read",
  },
  {
    id: 5,
    category: "Industry Reports",
    icon: Shield,
    title: "Brand Safety in the Age of AI-Generated Content",
    excerpt:
      "As synthetic media proliferates, brands need a new due-diligence framework. We analyzed 2,000 campaigns to define what verification actually means in 2026.",
    date: "Feb 22, 2026",
    readTime: "9 min read",
  },
  {
    id: 6,
    category: "Partnership Guides",
    icon: BarChart2,
    title: "Beyond CPM: A Modern ROI Framework for Creator Campaigns",
    excerpt:
      "Impressions are a vanity metric. Leading brands now track earned media value, lower-funnel attribution, and lifetime customer overlap to measure true deal impact.",
    date: "Feb 17, 2026",
    readTime: "7 min read",
  },
  {
    id: 7,
    category: "Case Studies",
    icon: CheckCircle,
    title: "How Agency X Scaled to 300 Active Brand Partnerships",
    excerpt:
      "With a two-person team and Deal Stage's automation layer, this boutique talent agency now manages a portfolio that rivals firms with 20 full-time employees.",
    date: "Feb 11, 2026",
    readTime: "5 min read",
  },
  {
    id: 8,
    category: "Product Updates",
    icon: Database,
    title: "Social Verification: Why Authenticated Metrics Change Everything",
    excerpt:
      "Unverified follower counts cost brands $1.3B annually in wasted spend. Our new verification layer pulls directly from platform APIs — no estimates, no guesswork.",
    date: "Feb 4, 2026",
    readTime: "6 min read",
  },
  {
    id: 9,
    category: "Partnership Guides",
    icon: BookOpen,
    title: "Data-Driven Talent Discovery: Moving Beyond the Gut Check",
    excerpt:
      "The agencies and brands outperforming the market share one trait: they replaced subjective taste with structured data signals before making any outreach decision.",
    date: "Jan 29, 2026",
    readTime: "8 min read",
  },
];

const FILTERS = ["All", "Industry Reports", "Product Updates", "Partnership Guides", "Case Studies"];

function useFadeIn() {
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
      { threshold: 0.12 }
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

function CategoryBadge({ label }) {
  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: "10px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.amber})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        border: `1px solid rgba(196,162,74,0.3)`,
        borderRadius: "4px",
        padding: "3px 8px",
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

function ArticleCard({ article, delay }) {
  const [ref, visible] = useFadeIn();
  const [hovered, setHovered] = useState(false);
  const Icon = article.icon;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        background: hovered ? "rgba(196,162,74,0.04)" : COLORS.surface,
        border: `1px solid ${hovered ? "rgba(196,162,74,0.28)" : COLORS.border}`,
        borderRadius: "12px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        cursor: "pointer",
        boxShadow: hovered ? "0 8px 32px rgba(196,162,74,0.08)" : "none",
        transition: `all 0.3s ease`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CategoryBadge label={article.category} />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: "rgba(196,162,74,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={COLORS.gold} />
        </div>
      </div>

      <h3
        style={{
          fontFamily: FONTS.serif,
          fontSize: "19px",
          fontWeight: 600,
          color: COLORS.cream,
          lineHeight: 1.35,
          margin: 0,
        }}
      >
        {article.title}
      </h3>

      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "13.5px",
          color: COLORS.muted,
          lineHeight: 1.65,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {article.excerpt}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: "rgba(245,240,230,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Calendar size={11} />
            {article.date}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: "rgba(245,240,230,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Clock size={11} />
            {article.readTime}
          </span>
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            fontFamily: FONTS.body,
            fontSize: "12px",
            fontWeight: 600,
            color: COLORS.gold,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "0.02em",
          }}
        >
          Read more <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered =
    activeFilter === "All" ? articles : articles.filter((a) => a.category === activeFilter);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONTS.body,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(196,162,74,0.25); color: #f5f0e6; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080807; }
        ::-webkit-scrollbar-thumb { background: rgba(196,162,74,0.3); border-radius: 3px; }
      `}</style>

      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(196,162,74,0.055) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-150px",
          left: "-150px",
          width: "500px",
          height: "500px",
          background: `radial-gradient(circle, rgba(224,123,24,0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>

        {/* Hero */}
        <div style={{ paddingTop: "96px", paddingBottom: "72px", textAlign: "center" }}>
          <FadeSection>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(196,162,74,0.07)",
                border: `1px solid rgba(196,162,74,0.2)`,
                borderRadius: "100px",
                padding: "6px 16px",
                marginBottom: "28px",
              }}
            >
              <BookOpen size={13} color={COLORS.gold} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.gold,
                }}
              >
                Resource Center
              </span>
            </div>
          </FadeSection>

          <FadeSection delay={80}>
            <h1
              style={{
                fontFamily: FONTS.serif,
                fontSize: "clamp(48px, 7vw, 76px)",
                fontWeight: 600,
                color: COLORS.cream,
                lineHeight: 1.08,
                margin: "0 0 20px",
                letterSpacing: "-0.01em",
              }}
            >
              Insights &{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Resources
              </span>
            </h1>
          </FadeSection>

          <FadeSection delay={160}>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "18px",
                color: COLORS.muted,
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Intelligence for smarter partnerships. Research, guides, and platform updates from the Deal Stage team.
            </p>
          </FadeSection>
        </div>

        {/* Filter Tabs */}
        <FadeSection delay={200}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "56px",
            }}
          >
            {FILTERS.map((f) => {
              const active = f === activeFilter;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    color: active ? COLORS.bg : COLORS.muted,
                    background: active
                      ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`
                      : "transparent",
                    border: `1px solid ${active ? "transparent" : "rgba(196,162,74,0.2)"}`,
                    borderRadius: "100px",
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.01em",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </FadeSection>

        {/* Article Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "96px",
          }}
        >
          {filtered.map((article, i) => (
            <ArticleCard key={article.id} article={article} delay={i * 60} />
          ))}
        </div>

        {/* Newsletter Section */}
        <FadeSection>
          <div
            style={{
              background: "rgba(196,162,74,0.04)",
              border: `1px solid rgba(196,162,74,0.18)`,
              borderRadius: "20px",
              padding: "64px 48px",
              textAlign: "center",
              marginBottom: "80px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "600px",
                height: "300px",
                background: `radial-gradient(ellipse, rgba(196,162,74,0.06) 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "rgba(196,162,74,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  border: `1px solid rgba(196,162,74,0.2)`,
                }}
              >
                <Mail size={20} color={COLORS.gold} />
              </div>

              <h2
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 600,
                  color: COLORS.cream,
                  margin: "0 0 12px",
                }}
              >
                Get the Dealstage Brief
              </h2>
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "15px",
                  color: COLORS.muted,
                  maxWidth: "420px",
                  margin: "0 auto 36px",
                  lineHeight: 1.6,
                }}
              >
                Weekly intelligence on creator partnerships, platform data, and deals worth knowing about. No fluff.
              </p>

              {subscribed ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: COLORS.gold,
                    fontFamily: FONTS.body,
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle size={18} color={COLORS.gold} />
                  You're on the list. Welcome aboard.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  style={{
                    display: "flex",
                    gap: "12px",
                    maxWidth: "440px",
                    margin: "0 auto",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid rgba(196,162,74,0.25)`,
                      borderRadius: "8px",
                      padding: "12px 18px",
                      fontFamily: FONTS.body,
                      fontSize: "14px",
                      color: COLORS.cream,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 28px",
                      fontFamily: FONTS.body,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: COLORS.bg,
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <p
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  color: "rgba(245,240,230,0.25)",
                  marginTop: "16px",
                }}
              >
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </FadeSection>
      </div>
    </div>
  );
}

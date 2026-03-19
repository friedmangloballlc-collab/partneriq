import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080807",
  bgAlt: "#0f0e0c",
  bgCard: "#111109",
  bgCardHover: "#161612",
  border: "rgba(196,162,74,0.15)",
  borderMid: "rgba(196,162,74,0.3)",
  gold: "#c4a24a",
  goldLight: "#d4b56a",
  goldDim: "rgba(196,162,74,0.12)",
  goldDimMid: "rgba(196,162,74,0.2)",
  amber: "#e07b18",
  cream: "#f5f0e6",
  creamDim: "rgba(245,240,230,0.6)",
  creamFaint: "rgba(245,240,230,0.35)",
  creamGhost: "rgba(245,240,230,0.12)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
};

const fonts = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const GoldGradientText = ({ children, style = {} }) => (
  <span
    style={{
      background: `linear-gradient(135deg, ${T.goldLight} 0%, ${T.gold} 50%, ${T.amber} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      ...style,
    }}
  >
    {children}
  </span>
);

const Pill = ({ children, color = T.gold, bg }) => (
  <span
    style={{
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color,
      background: bg || `rgba(196,162,74,0.12)`,
      border: `1px solid ${color}30`,
      borderRadius: 4,
      padding: "2px 8px",
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

const ScoreBar = ({ label, value, color = T.gold }) => (
  <div style={{ marginBottom: 8 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
        fontFamily: fonts.mono,
        fontSize: 11,
        color: T.creamFaint,
      }}
    >
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div
      style={{
        height: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: `linear-gradient(90deg, ${T.gold}, ${T.amber})`,
          borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  </div>
);

const KpiCard = ({ label, value, sub, color = T.gold }) => (
  <div
    style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: "14px 16px",
      flex: 1,
      minWidth: 0,
    }}
  >
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        color: T.creamFaint,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: fonts.serif,
        fontSize: 22,
        fontWeight: 600,
        color,
        lineHeight: 1,
        marginBottom: 3,
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.green }}>
        {sub}
      </div>
    )}
  </div>
);

// ─── Screen 1: Discover Talent ────────────────────────────────────────────────

const talents = [
  {
    initials: "SA",
    name: "Simone Alvarez",
    category: "Athlete",
    sub: "Track & Field",
    followers: "2.4M",
    engagement: "6.8%",
    score: 95,
    tags: ["Nike", "Adidas"],
    color: "#a855f7",
  },
  {
    initials: "JK",
    name: "Jordan Kim",
    category: "Creator",
    sub: "Fitness & Lifestyle",
    followers: "1.1M",
    engagement: "9.2%",
    score: 91,
    tags: ["Under Armour"],
    color: T.amber,
  },
  {
    initials: "MR",
    name: "Marcus Reid",
    category: "Speaker",
    sub: "Entrepreneurship",
    followers: "890K",
    engagement: "7.4%",
    score: 88,
    tags: ["Forbes", "TEDx"],
    color: T.blue,
  },
];

const matchFactors = [
  { label: "Audience Fit", value: 95 },
  { label: "Engagement", value: 88 },
  { label: "Brand Safety", value: 97 },
  { label: "Budget Fit", value: 92 },
  { label: "Category", value: 90 },
];

const filterChips = ["Category", "Audience Size", "Engagement Rate", "Budget", "Brand Safety"];

const Screen1 = () => {
  const [active, setActive] = useState(0);
  const [filterActive, setFilterActive] = useState(null);

  return (
    <div style={{ display: "flex", gap: 16, height: "100%", minHeight: 0 }}>
      {/* Main panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Search bar */}
        <div
          style={{
            background: T.bgCard,
            border: `1px solid ${T.borderMid}`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            padding: "10px 14px",
            gap: 10,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontFamily: fonts.body, fontSize: 13, color: T.creamFaint, flex: 1 }}>
            Search 12,000+ verified talent...
          </span>
          <Pill>12,847 results</Pill>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterChips.map((chip, i) => (
            <button
              key={chip}
              onClick={() => setFilterActive(filterActive === i ? null : i)}
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: filterActive === i ? T.bg : T.creamDim,
                background: filterActive === i ? T.gold : "rgba(255,255,255,0.04)",
                border: `1px solid ${filterActive === i ? T.gold : T.border}`,
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {chip} {filterActive === i ? "✓" : "▾"}
            </button>
          ))}
        </div>

        {/* Talent cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {talents.map((t, i) => (
            <div
              key={t.name}
              onClick={() => setActive(i)}
              style={{
                background: active === i ? `rgba(196,162,74,0.07)` : T.bgCard,
                border: `1px solid ${active === i ? T.borderMid : T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: `${t.color}22`,
                  border: `2px solid ${t.color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.color,
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.cream,
                    marginBottom: 2,
                  }}
                >
                  {t.name}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Pill color={t.color} bg={`${t.color}18`}>
                    {t.category}
                  </Pill>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>
                    {t.sub}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: T.cream, fontWeight: 600 }}>
                    {t.followers}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.creamFaint, letterSpacing: "0.06em" }}>
                    FOLLOWERS
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: T.green, fontWeight: 600 }}>
                    {t.engagement}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.creamFaint, letterSpacing: "0.06em" }}>
                    ENG RATE
                  </div>
                </div>
                {/* Match score */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: `2px solid ${T.gold}60`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.goldDim,
                  }}
                >
                  <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: T.gold, lineHeight: 1 }}>
                    {t.score}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 7, color: T.creamFaint, letterSpacing: "0.04em" }}>
                    MATCH
                  </div>
                </div>
              </div>

              <button
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: T.gold,
                  background: T.goldDim,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar: AI Score Breakdown */}
      <div
        style={{
          width: 200,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 16,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.gold,
            marginBottom: 4,
          }}
        >
          AI Score Breakdown
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 14,
            color: T.cream,
            marginBottom: 14,
          }}
        >
          {talents[active].name}
        </div>

        {/* Big score ring */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `conic-gradient(${T.gold} ${talents[active].score}%, rgba(196,162,74,0.1) 0%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: T.bgCard,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 700, color: T.gold, lineHeight: 1 }}>
                {talents[active].score}
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 8, color: T.creamFaint }}>SCORE</span>
            </div>
          </div>
        </div>

        {/* Factor bars */}
        {matchFactors.map((f) => (
          <ScoreBar key={f.label} label={f.label} value={f.value} />
        ))}
      </div>
    </div>
  );
};

// ─── Screen 2: AI Matching ────────────────────────────────────────────────────

const matchedTalents = [
  { initials: "SA", name: "Simone Alvarez", category: "Athlete", score: 97, color: "#a855f7" },
  { initials: "JK", name: "Jordan Kim", category: "Creator", score: 94, color: T.amber },
  { initials: "MR", name: "Marcus Reid", category: "Speaker", score: 89, color: T.blue },
];

const factors10 = [
  { name: "Audience Demographics", weight: 20 },
  { name: "Engagement Rate", weight: 18 },
  { name: "Brand Safety Score", weight: 15 },
  { name: "Category Alignment", weight: 12 },
  { name: "Budget Compatibility", weight: 10 },
  { name: "Past Performance", weight: 8 },
  { name: "Content Quality", weight: 7 },
  { name: "Exclusivity Windows", weight: 4 },
  { name: "Geographic Reach", weight: 4 },
  { name: "Platform Mix", weight: 2 },
];

const Screen2 = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 3), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Top: Brand + Lines + Talent */}
      <div style={{ display: "flex", gap: 0, alignItems: "stretch", flex: "0 0 auto" }}>
        {/* Brand Brief */}
        <div
          style={{
            flex: 1,
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 10 }}>
            Brand Brief
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: T.cream,
              }}
            >
              N
            </div>
            <div>
              <div style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: T.cream }}>Nike</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>Verified Brand</div>
            </div>
          </div>
          {[
            ["Looking For", "Athletes, Creators"],
            ["Budget", "$50K – $100K"],
            ["Target Audience", "18–34, Urban"],
            ["Campaign Type", "Product Launch"],
            ["Timeline", "Q2 2026"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                padding: "5px 0",
              }}
            >
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>{k}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: T.cream }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Center: animated connection lines */}
        <div
          style={{
            width: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 6, textAlign: "center" }}>
            AI Engine
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 80,
                height: 2,
                borderRadius: 1,
                background: `linear-gradient(90deg, ${T.gold}80, ${T.amber})`,
                opacity: pulse === i ? 1 : 0.25,
                transition: "opacity 0.4s",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: pulse === i ? "80%" : "10%",
                  transform: "translate(-50%,-50%)",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: T.gold,
                  boxShadow: `0 0 8px ${T.gold}`,
                  transition: "left 0.8s linear",
                }}
              />
            </div>
          ))}
          <div
            style={{
              marginTop: 4,
              fontFamily: fonts.mono,
              fontSize: 9,
              color: T.green,
              textAlign: "center",
              letterSpacing: "0.04em",
            }}
          >
            Analyzing...
          </div>
        </div>

        {/* Matched Talent */}
        <div
          style={{
            flex: 1,
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 2 }}>
            Top Matches
          </div>
          {matchedTalents.map((t) => (
            <div
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 8,
                padding: "8px 10px",
                border: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `${t.color}22`,
                  border: `2px solid ${t.color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.color,
                }}
              >
                {t.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: T.cream }}>{t.name}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>{t.category}</div>
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.gold,
                }}
              >
                {t.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: 10-factor breakdown */}
      <div
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 14,
          flex: 1,
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 12 }}>
          10-Factor Weighted Scoring Model
        </div>
        <div className="dm-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
          {factors10.map((f) => (
            <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: T.creamDim,
                }}
              >
                {f.name}
              </div>
              <div
                style={{
                  width: 40,
                  height: 3,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${f.weight * 5}%`,
                    background: `linear-gradient(90deg, ${T.gold}, ${T.amber})`,
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint, width: 24, textAlign: "right" }}>
                {f.weight}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Screen 3: Deal Pipeline (Kanban) ─────────────────────────────────────────

const pipelineColumns = [
  {
    title: "Discovery",
    color: T.blue,
    count: 8,
    deals: [
      { brand: "Adidas", talent: "Priya Patel", amount: "$45K", tag: "Fitness" },
      { brand: "Red Bull", talent: "Carlos Webb", amount: "$80K", tag: "Extreme Sports" },
    ],
  },
  {
    title: "Negotiation",
    color: T.amber,
    count: 5,
    deals: [
      { brand: "Apple", talent: "Simone Alvarez", amount: "$120K", tag: "Tech" },
      { brand: "Lululemon", talent: "Jordan Kim", amount: "$60K", tag: "Wellness" },
    ],
  },
  {
    title: "Contract",
    color: T.purple,
    count: 3,
    deals: [
      { brand: "Nike", talent: "Marcus Reid", amount: "$95K", tag: "Speaking" },
      { brand: "Gatorade", talent: "Aaliyah Fox", amount: "$55K", tag: "Hydration" },
    ],
  },
  {
    title: "Active",
    color: T.green,
    count: 12,
    deals: [
      { brand: "ESPN", talent: "Devon Ochoa", amount: "$140K", tag: "Media" },
      { brand: "Puma", talent: "Jasmine Nguyen", amount: "$75K", tag: "Lifestyle" },
    ],
  },
];

const Screen3 = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
    {/* Pipeline header */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontFamily: fonts.serif, fontSize: 16, color: T.cream }}>Deal Pipeline</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>28 active deals</div>
      </div>
      <div
        style={{
          background: T.goldDim,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "8px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint, letterSpacing: "0.06em" }}>
          TOTAL PIPELINE VALUE
        </div>
        <div style={{ fontFamily: fonts.serif, fontSize: 20, fontWeight: 600, color: T.gold }}>$1.2M</div>
      </div>
    </div>

    {/* Kanban */}
    <div style={{ display: "flex", gap: 10, flex: 1, minHeight: 0 }}>
      {pipelineColumns.map((col) => (
        <div
          key={col.title}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid rgba(255,255,255,0.06)`,
            borderTop: `2px solid ${col.color}`,
            borderRadius: 10,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 0,
          }}
        >
          {/* Column header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 600, color: col.color }}>
              {col.title}
            </span>
            <span
              style={{
                background: `${col.color}22`,
                color: col.color,
                borderRadius: 10,
                padding: "1px 7px",
                fontFamily: fonts.mono,
                fontSize: 10,
              }}
            >
              {col.count}
            </span>
          </div>

          {/* Deal cards */}
          {col.deals.map((deal, i) => (
            <div
              key={i}
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "grab",
                position: "relative",
              }}
            >
              {/* Drag handle visual */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{ width: 14, height: 1.5, background: "rgba(255,255,255,0.12)", borderRadius: 1 }}
                  />
                ))}
              </div>

              <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: T.cream, marginBottom: 2 }}>
                {deal.brand}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.creamFaint, marginBottom: 8 }}>
                {deal.talent}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Pill color={col.color} bg={`${col.color}18`}>
                  {deal.tag}
                </Pill>
                <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: T.gold }}>
                  {deal.amount}
                </span>
              </div>
            </div>
          ))}

          {/* Add card placeholder */}
          <div
            style={{
              border: `1px dashed rgba(255,255,255,0.1)`,
              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "center",
              fontFamily: fonts.mono,
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              cursor: "pointer",
              marginTop: "auto",
            }}
          >
            + Add deal
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Screen 4: Smart Contracts ────────────────────────────────────────────────

const contractSections = [
  { title: "Parties & Recitals", status: "ok" },
  { title: "Deliverables & Timeline", status: "ok" },
  { title: "Compensation & Payment Terms", status: "warn" },
  { title: "Exclusivity Clause", status: "error" },
  { title: "Intellectual Property Rights", status: "error" },
  { title: "Termination & Remedies", status: "ok" },
  { title: "Governing Law", status: "ok" },
];

const redFlags = [
  {
    severity: "high",
    label: "Exclusivity clause too broad",
    detail: "Section 4.2 restricts all categories for 24 months. Recommend narrowing to brand category only.",
    color: T.red,
  },
  {
    severity: "medium",
    label: "Payment terms unclear",
    detail: "Section 3.1 references 'NET-60' but milestone schedule is missing. Add payment triggers.",
    color: T.amber,
  },
  {
    severity: "high",
    label: "IP rights not defined",
    detail: "Section 5 is blank. Usage rights, platform restrictions, and duration must be specified.",
    color: T.red,
  },
];

const signers = [
  { name: "Sarah Chen", role: "Brand Manager, Nike", signed: true },
  { name: "Marcus Reid", role: "Talent", signed: true },
  { name: "Legal Counsel", role: "DealStage Escrow", signed: false },
];

const Screen4 = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", gap: 14, height: "100%" }}>
      {/* Contract preview */}
      <div
        style={{
          flex: 1,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold }}>
              Contract Preview
            </div>
            <div style={{ fontFamily: fonts.serif, fontSize: 15, color: T.cream, marginTop: 2 }}>
              Nike × Marcus Reid — Sponsorship Agreement
            </div>
          </div>
          <Pill color={T.amber}>Draft v2.3</Pill>
        </div>

        {contractSections.map((s) => (
          <div
            key={s.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background:
                s.status === "error"
                  ? "rgba(239,68,68,0.06)"
                  : s.status === "warn"
                  ? "rgba(224,123,24,0.06)"
                  : "rgba(255,255,255,0.03)",
              border: `1px solid ${
                s.status === "error"
                  ? "rgba(239,68,68,0.2)"
                  : s.status === "warn"
                  ? "rgba(224,123,24,0.2)"
                  : "rgba(255,255,255,0.06)"
              }`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  s.status === "error" ? T.red : s.status === "warn" ? T.amber : T.green,
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: fonts.body, fontSize: 12, color: T.cream, flex: 1 }}>
              {s.title}
            </span>
            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>
              {s.status === "error" ? "⚠ Review Required" : s.status === "warn" ? "~ Clarify" : "✓ Clear"}
            </span>
          </div>
        ))}

        {/* E-signature */}
        <div
          style={{
            marginTop: 4,
            borderTop: `1px solid ${T.border}`,
            paddingTop: 12,
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>
            E-Signatures — 2 of 3 Signed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {signers.map((s) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 10px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 7,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: s.signed ? `${T.green}22` : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${s.signed ? T.green : "rgba(255,255,255,0.15)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                  }}
                >
                  {s.signed ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.cream }}>{s.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.creamFaint }}>{s.role}</div>
                </div>
                <Pill color={s.signed ? T.green : T.creamFaint} bg={s.signed ? `${T.green}18` : "rgba(255,255,255,0.05)"}>
                  {s.signed ? "Signed" : "Pending"}
                </Pill>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Red Flag Sidebar */}
      <div
        style={{
          width: 220,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "rgba(239,68,68,0.06)",
            border: `1px solid rgba(239,68,68,0.2)`,
            borderRadius: 10,
            padding: 14,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.2)",
                border: `1px solid rgba(239,68,68,0.4)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
              }}
            >
              !
            </div>
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.red }}>
                AI Red Flag Scanner
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>3 issues found</div>
            </div>
          </div>

          {redFlags.map((f, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                background: selected === i ? `${f.color}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected === i ? `${f.color}40` : "rgba(255,255,255,0.06)"}`,
                borderRadius: 8,
                padding: "8px 10px",
                marginBottom: 6,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: f.color,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.cream, fontWeight: 600, marginBottom: 2 }}>
                    {f.label}
                  </div>
                  {selected === i && (
                    <div style={{ fontFamily: fonts.body, fontSize: 10, color: T.creamFaint, lineHeight: 1.5 }}>
                      {f.detail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          style={{
            background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
            border: "none",
            borderRadius: 10,
            padding: "13px",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: T.bg,
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Send for Signature
        </button>
      </div>
    </div>
  );
};

// ─── Screen 5: Analytics Dashboard ───────────────────────────────────────────

const barData = [
  { month: "Oct", value: 148 },
  { month: "Nov", value: 185 },
  { month: "Dec", value: 220 },
  { month: "Jan", value: 195 },
  { month: "Feb", value: 265 },
  { month: "Mar", value: 312 },
];

const maxBar = Math.max(...barData.map((d) => d.value));

const topPartnerships = [
  { brand: "Nike", talent: "Simone Alvarez", value: "$140K", roi: "420%", status: "Active" },
  { brand: "Apple", talent: "Jordan Kim", value: "$95K", roi: "380%", status: "Active" },
  { brand: "Red Bull", talent: "Carlos Webb", value: "$80K", roi: "310%", status: "Complete" },
  { brand: "Lululemon", talent: "Priya Patel", value: "$60K", roi: "290%", status: "Active" },
];

const Screen5 = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
    {/* KPIs */}
    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
      <KpiCard label="Total Revenue" value="$1.2M" sub="↑ 34% vs last quarter" color={T.gold} />
      <KpiCard label="Deals Closed" value="47" sub="↑ 12 this month" color={T.green} />
      <KpiCard label="Avg Deal Size" value="$25.5K" sub="↑ 8% QoQ" color={T.amber} />
      <KpiCard label="Portfolio ROI" value="340%" sub="↑ vs 280% target" color="#a855f7" />
    </div>

    {/* Chart + Table row */}
    <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
      {/* Bar chart */}
      <div
        style={{
          flex: 1,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold }}>
              Revenue Pipeline
            </div>
            <div style={{ fontFamily: fonts.serif, fontSize: 16, color: T.cream, marginTop: 2 }}>
              6-Month Trend
            </div>
          </div>
          <Pill color={T.green} bg="rgba(34,197,94,0.12)">+34% QoQ</Pill>
        </div>

        {/* Bars */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            paddingBottom: 4,
          }}
        >
          {barData.map((d) => (
            <div
              key={d.month}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  color: T.creamFaint,
                }}
              >
                ${d.value}K
              </div>
              <div
                style={{
                  width: "100%",
                  height: `${(d.value / maxBar) * 100}%`,
                  background:
                    d.month === "Mar"
                      ? `linear-gradient(180deg, ${T.amber} 0%, ${T.gold} 100%)`
                      : `linear-gradient(180deg, ${T.gold}80 0%, ${T.gold}40 100%)`,
                  borderRadius: "4px 4px 2px 2px",
                  minHeight: 4,
                  boxShadow: d.month === "Mar" ? `0 -4px 12px ${T.gold}40` : "none",
                  transition: "height 0.6s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint }}>
                {d.month}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top partnerships table */}
      <div
        style={{
          width: 280,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 16,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 12 }}>
          Top Performing Partnerships
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto auto",
            gap: 6,
            padding: "4px 6px",
            marginBottom: 4,
          }}
        >
          {["Brand", "Talent", "Value", "ROI"].map((h) => (
            <div key={h} style={{ fontFamily: fonts.mono, fontSize: 9, color: T.creamFaint, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
        </div>

        {topPartnerships.map((p, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto auto",
              gap: 6,
              padding: "8px 6px",
              borderTop: `1px solid rgba(255,255,255,0.04)`,
              alignItems: "center",
            }}
          >
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.cream, fontWeight: 600 }}>{p.brand}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.creamFaint }}>{p.talent}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold }}>{p.value}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.green }}>{p.roi}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Screen 6: Data Rooms ─────────────────────────────────────────────────────

const dataRoomFolders = [
  {
    icon: "📊",
    name: "Financial Data",
    files: 12,
    size: "45 MB",
    access: "NDA Required",
    color: T.gold,
  },
  {
    icon: "🎨",
    name: "Campaign Assets",
    files: 34,
    size: "2.1 GB",
    access: "Shared",
    color: T.blue,
  },
  {
    icon: "📈",
    name: "Performance Reports",
    files: 8,
    size: "18 MB",
    access: "NDA Required",
    color: T.purple,
  },
];

const activityLog = [
  { who: "Nike (Brand)", action: "viewed", file: "Q4 2025 Performance Report", time: "2m ago", color: T.amber },
  { who: "Jordan Kim", action: "uploaded", file: "Media Kit v3.pdf", time: "18m ago", color: T.green },
  { who: "DealStage System", action: "watermarked", file: "Financial Summary.xlsx", time: "1h ago", color: T.creamFaint },
  { who: "Adidas (Brand)", action: "requested access", file: "Campaign Assets", time: "3h ago", color: T.blue },
];

const Screen6 = () => {
  const [ndaBanner, setNdaBanner] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%", position: "relative" }}>
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%) rotate(-25deg)",
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.2em",
          color: "rgba(196,162,74,0.06)",
          fontWeight: 700,
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 0,
          whiteSpace: "nowrap",
        }}
      >
        CONFIDENTIAL — DEALSTAGE
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
        {/* NDA Gate Banner */}
        {ndaBanner && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(196,162,74,0.1), rgba(224,123,24,0.08))",
              border: `1px solid ${T.borderMid}`,
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: T.goldDim,
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              🔒
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 1 }}>
                NDA Required for Full Access
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: T.creamFaint }}>
                Some folders are restricted. Sign the NDA to unlock all data room contents.
              </div>
            </div>
            <button
              style={{
                background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: "0.06em",
                color: T.bg,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Sign NDA
            </button>
            <button
              onClick={() => setNdaBanner(false)}
              style={{
                background: "none",
                border: "none",
                color: T.creamFaint,
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Folders */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {dataRoomFolders.map((folder) => (
            <div
              key={folder.name}
              style={{
                flex: 1,
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderTop: `2px solid ${folder.color}`,
                borderRadius: 10,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{folder.icon}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 2 }}>
                {folder.name}
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint, marginBottom: 8 }}>
                {folder.files} files · {folder.size}
              </div>
              <Pill color={folder.access === "NDA Required" ? T.amber : T.green} bg={folder.access === "NDA Required" ? "rgba(224,123,24,0.12)" : "rgba(34,197,94,0.12)"}>
                {folder.access}
              </Pill>
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div
          style={{
            flex: 1,
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 14,
            minHeight: 0,
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 10 }}>
            Activity Log
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activityLog.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.04)`,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: entry.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: entry.color, fontWeight: 600 }}>
                    {entry.who}
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: T.creamFaint }}> {entry.action} </span>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: T.cream }}>{entry.file}</span>
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint, flexShrink: 0 }}>
                  {entry.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tour screens config ───────────────────────────────────────────────────────

const screens = [
  { id: 1, title: "Discover Talent", label: "Discovery", component: Screen1 },
  { id: 2, title: "AI Matching", label: "AI Match", component: Screen2 },
  { id: 3, title: "Deal Pipeline", label: "Pipeline", component: Screen3 },
  { id: 4, title: "Smart Contracts", label: "Contracts", component: Screen4 },
  { id: 5, title: "Analytics", label: "Analytics", component: Screen5 },
  { id: 6, title: "Data Rooms", label: "Data Rooms", component: Screen6 },
];

// ─── Main Demo Component ──────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const tourRef = useRef(null);
  const autoPlayRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      setActiveScreen(index);
      setFadeKey((k) => k + 1);
    },
    []
  );

  const goNext = useCallback(() => {
    goTo((activeScreen + 1) % screens.length);
  }, [activeScreen, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeScreen - 1 + screens.length) % screens.length);
  }, [activeScreen, goTo]);

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(goNext, 5000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, goNext]);

  const ActiveComponent = screens[activeScreen].component;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.cream,
        fontFamily: fonts.body,
        overflowX: "hidden",
      }}
    >
      <SEO title="Interactive Demo" description="Try the Dealstage platform with an interactive product tour — no signup required" />
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@300;400;500;600;700&family=Instrument+Mono:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes goldPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes lineGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(196,162,74,0.3); }
          50% { box-shadow: 0 0 16px rgba(196,162,74,0.7); }
        }

        .demo-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(196,162,74,0.35) !important;
        }

        .demo-cta-secondary:hover {
          background: rgba(196,162,74,0.08) !important;
          border-color: rgba(196,162,74,0.5) !important;
        }

        .screen-tab:hover {
          background: rgba(196,162,74,0.08) !important;
        }

        .tour-nav-btn:hover {
          background: rgba(196,162,74,0.12) !important;
          border-color: rgba(196,162,74,0.4) !important;
        }

        @media (max-width: 768px) {
          .dm-two-col { grid-template-columns: 1fr !important; }
          .dm-four-col { grid-template-columns: repeat(2, 1fr) !important; }
          .dm-hero-btns { flex-direction: column !important; width: 100% !important; gap: 12px !important; }
          .dm-hero-btns a, .dm-hero-btns button { width: 100% !important; justify-content: center !important; }
          .demo-screen { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
        }
      `}</style>

      {/* ── Hero Section ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(196,162,74,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(196,162,74,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(196,162,74,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            pointerEvents: "none",
          }}
        />

        {/* Pre-label */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: T.goldDim,
            border: `1px solid ${T.border}`,
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 32,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.gold,
            animation: "fadeSlideIn 0.6s ease both",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.gold,
              display: "inline-block",
              animation: "goldPulse 2s ease-in-out infinite",
            }}
          />
          Interactive Platform Tour
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(42px, 7vw, 88px)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
            maxWidth: 900,
            animation: "fadeSlideIn 0.6s ease 0.1s both",
          }}
        >
          See DealStage
          <br />
          <GoldGradientText>in action.</GoldGradientText>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: "clamp(15px, 2.2vw, 19px)",
            color: T.creamDim,
            maxWidth: 580,
            lineHeight: 1.65,
            margin: "0 0 48px",
            animation: "fadeSlideIn 0.6s ease 0.2s both",
          }}
        >
          An interactive tour of the platform that's changing how deals get done.
          No sign-up required. No sales call needed. Just explore.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeSlideIn 0.6s ease 0.3s both",
          }}
        >
          <button
            className="demo-cta-primary"
            onClick={() => tourRef.current?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.amber} 100%)`,
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              fontFamily: fonts.mono,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.bg,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: `0 4px 20px rgba(196,162,74,0.2)`,
            }}
          >
            Start the Tour
          </button>
          <button
            className="demo-cta-secondary"
            onClick={() => navigate("/Contact")}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "16px 36px",
              fontFamily: fonts.mono,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.cream,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            Book a Live Demo
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "fadeSlideIn 0.6s ease 0.6s both",
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.creamFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll to explore
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              background: `linear-gradient(180deg, ${T.gold}60, transparent)`,
              animation: "goldPulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ── Interactive Tour Section ── */}
      <section
        ref={tourRef}
        style={{
          padding: "80px 24px 100px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.gold,
              marginBottom: 12,
            }}
          >
            Platform Walkthrough
          </div>
          <h2
            style={{
              fontFamily: fonts.serif,
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 600,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Every tool you need,{" "}
            <GoldGradientText>beautifully integrated.</GoldGradientText>
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 16, color: T.creamDim, maxWidth: 500, margin: "0 auto" }}>
            Click through six core workflows. Each screen is a real representation of what you'll use every day.
          </p>
        </div>

        {/* Tour container */}
        <div
          style={{
            background: T.bgAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,162,74,0.08)`,
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "stretch",
              overflowX: "auto",
              padding: "0 4px",
            }}
          >
            {screens.map((s, i) => (
              <button
                key={s.id}
                className="screen-tab"
                onClick={() => goTo(i)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${activeScreen === i ? T.gold : "transparent"}`,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: activeScreen === i ? T.gold : "rgba(255,255,255,0.08)",
                    border: `1px solid ${activeScreen === i ? T.gold : "rgba(255,255,255,0.1)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color: activeScreen === i ? T.bg : T.creamFaint,
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {s.id}
                </div>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: activeScreen === i ? T.cream : T.creamFaint,
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
              </button>
            ))}

            {/* Auto-play toggle */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <button
                onClick={() => setAutoPlay((p) => !p)}
                style={{
                  background: autoPlay ? T.goldDim : "rgba(255,255,255,0.04)",
                  border: `1px solid ${autoPlay ? T.borderMid : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: autoPlay ? T.gold : T.creamFaint,
                    animation: autoPlay ? "goldPulse 1s ease-in-out infinite" : "none",
                  }}
                />
                <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.06em", color: autoPlay ? T.gold : T.creamFaint }}>
                  {autoPlay ? "AUTO-PLAYING" : "AUTO-PLAY"}
                </span>
              </button>
            </div>
          </div>

          {/* Screen header bar */}
          <div
            style={{
              padding: "20px 28px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: T.gold,
                  marginBottom: 3,
                }}
              >
                Step {screens[activeScreen].id} of {screens.length}
              </div>
              <h3
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 22,
                  fontWeight: 600,
                  color: T.cream,
                  margin: 0,
                }}
              >
                {screens[activeScreen].title}
              </h3>
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="tour-nav-btn"
                onClick={goPrev}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: T.creamDim,
                  fontSize: 16,
                  transition: "all 0.2s",
                }}
              >
                ‹
              </button>
              <button
                className="tour-nav-btn"
                onClick={goNext}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: T.creamDim,
                  fontSize: 16,
                  transition: "all 0.2s",
                }}
              >
                ›
              </button>
            </div>
          </div>

          {/* Screen content */}
          <div
            key={fadeKey}
            style={{
              padding: "20px 28px 28px",
              minHeight: 460,
              animation: "fadeSlideIn 0.35s ease both",
            }}
          >
            <ActiveComponent />
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
            <div
              style={{
                height: "100%",
                width: `${((activeScreen + 1) / screens.length) * 100}%`,
                background: `linear-gradient(90deg, ${T.gold}, ${T.amber})`,
                transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: `0 0 8px ${T.gold}60`,
              }}
            />
          </div>
        </div>

        {/* Dot indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 20,
          }}
        >
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: activeScreen === i ? 24 : 7,
                height: 7,
                borderRadius: 4,
                background: activeScreen === i ? T.gold : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Below Tour CTA Section ── */}
      <section
        style={{
          padding: "80px 24px 100px",
          background: `linear-gradient(180deg, ${T.bg} 0%, rgba(196,162,74,0.04) 50%, ${T.bg} 100%)`,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Stat cards */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginBottom: 64,
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "2 min", label: "Average tour time", icon: "⏱" },
              { value: "94%", label: "AI match accuracy", icon: "🎯" },
              { value: "5 min", label: "Average setup time", icon: "⚡" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "24px 32px",
                  textAlign: "center",
                  flex: "1 1 200px",
                  maxWidth: 260,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                <div
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 36,
                    fontWeight: 600,
                    marginBottom: 4,
                    background: `linear-gradient(135deg, ${T.goldLight}, ${T.gold})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 13, color: T.creamFaint }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA block */}
          <div
            style={{
              textAlign: "center",
              background: T.bgCard,
              border: `1px solid ${T.borderMid}`,
              borderRadius: 24,
              padding: "56px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(196,162,74,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.gold,
                marginBottom: 16,
              }}
            >
              Ready to experience the real thing?
            </div>
            <h2
              style={{
                fontFamily: fonts.serif,
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: "0 0 16px",
              }}
            >
              Ready to try it yourself?
            </h2>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: T.creamDim,
                maxWidth: 440,
                margin: "0 auto 36px",
                lineHeight: 1.65,
              }}
            >
              Join 2,400+ brands and talent on the platform built for serious deal-makers.
              Start free. No credit card required.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="demo-cta-primary"
                style={{
                  background: `linear-gradient(135deg, ${T.gold} 0%, ${T.amber} 100%)`,
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 40px",
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.bg,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: `0 4px 20px rgba(196,162,74,0.25)`,
                }}
              >
                Start Free Trial
              </button>
              <button
                className="demo-cta-secondary"
                onClick={() => navigate("/Contact")}
                style={{
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "16px 36px",
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.cream,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                Talk to Sales
              </button>
            </div>

            {/* Trust line */}
            <div
              style={{
                marginTop: 24,
                fontFamily: fonts.mono,
                fontSize: 10,
                color: T.creamFaint,
                letterSpacing: "0.06em",
              }}
            >
              SOC 2 Type II · 256-bit encryption · GDPR compliant · Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── SCENE DURATIONS ─────────────────────────────────────────────────────────
const SCENE_DURATION = 4000; // ms per scene
const TOTAL_SCENES = 5;

// ─── KEYFRAME STYLES ─────────────────────────────────────────────────────────
const STYLES = `
  @keyframes aw-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aw-fade-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-8px) scale(0.98); }
  }
  @keyframes aw-slide-in-right {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-slide-in-left {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-slide-in-bottom {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aw-stamp-in {
    0%   { opacity: 0; transform: scale(1.5) rotate(-8deg); }
    60%  { opacity: 1; transform: scale(0.92) rotate(2deg); }
    100% { opacity: 1; transform: scale(1) rotate(-4deg); }
  }
  @keyframes aw-line-grow {
    from { width: 0; opacity: 0; }
    to   { width: 100%; opacity: 1; }
  }
  @keyframes aw-bar-grow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes aw-notification-in {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-pulse-dot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.4; transform: scale(0.7); }
  }
  @keyframes aw-check-pop {
    0%   { opacity: 0; transform: scale(0); }
    70%  { opacity: 1; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes aw-card-float {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aw-cursor-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0; }
  }
  @keyframes aw-score-in {
    from { opacity: 0; transform: scale(0.8) translateX(16px); }
    to   { opacity: 1; transform: scale(1) translateX(0); }
  }
  .aw-fade-in      { animation: aw-fade-in      0.5s ease forwards; }
  .aw-fade-out     { animation: aw-fade-out     0.35s ease forwards; }
  .aw-slide-right  { animation: aw-slide-in-right 0.45s ease forwards; }
  .aw-slide-left   { animation: aw-slide-in-left  0.45s ease forwards; }
  .aw-slide-bottom { animation: aw-slide-in-bottom 0.45s ease forwards; }

  /* ── Mobile overrides ── */
  @media (max-width: 600px) {
    .aw-container {
      aspect-ratio: 4/3 !important;
      border-radius: 10px !important;
    }
    .aw-narration-text {
      font-size: 0.72rem !important;
    }
    .aw-scene-inner {
      padding: 0.75rem !important;
    }
    .aw-scene-inner-top {
      padding-top: 3rem !important;
    }
    .aw-card-grid-3 {
      grid-template-columns: 1fr !important;
      gap: 0.5rem !important;
    }
    .aw-kanban-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .aw-scene2-layout {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    .aw-scene2-brief {
      width: 100% !important;
    }
    .aw-talent-card {
      min-width: unset !important;
      flex: 1 !important;
    }
    .aw-contract-layout {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    .aw-contract-doc {
      width: 100% !important;
    }
    .aw-contract-sidebar {
      width: 100% !important;
    }
    .aw-analytics-layout {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    .aw-payment-notif {
      right: 0.5rem !important;
      bottom: 1.5rem !important;
      padding: 0.5rem 0.65rem !important;
    }
    .aw-payment-notif-amount {
      font-size: 0.62rem !important;
    }
    .aw-filter-chips {
      flex-wrap: wrap !important;
      gap: 0.3rem !important;
    }
  }
`;

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const S = {
  container: {
    background: "#0a0a09",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    aspectRatio: "16/9",
    maxWidth: 800,
    margin: "0 auto",
    border: "0.5px solid rgba(255,248,220,0.13)",
    cursor: "pointer",
    userSelect: "none",
  },
  narration: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.05rem",
    fontWeight: 500,
    fontStyle: "italic",
    background: "linear-gradient(90deg, #d9b96a 0%, #f09040 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.01em",
    lineHeight: 1.3,
  },
  mono: {
    fontFamily: "'Instrument Mono', monospace",
  },
  sans: {
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
  },
  goldText: {
    background: "linear-gradient(90deg, #d9b96a 0%, #f09040 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  card: {
    background: "#161613",
    border: "0.5px solid rgba(255,248,220,0.09)",
    borderRadius: 10,
  },
  cardHi: {
    background: "linear-gradient(135deg, #161613 0%, rgba(196,162,74,0.06) 100%)",
    border: "0.5px solid rgba(196,162,74,0.22)",
    borderRadius: 10,
  },
};

// ─── SCENE 1: Search and discover talent ────────────────────────────────────
function Scene1({ active }) {
  const [typedText, setTypedText] = useState("");
  const [showCards, setShowCards] = useState([false, false, false]);
  const fullText = "Athletes in fitness...";
  const timers = useRef([]);

  useEffect(() => {
    if (!active) {
      setTypedText("");
      setShowCards([false, false, false]);
      timers.current.forEach(clearTimeout);
      return;
    }
    timers.current = [];
    let i = 0;
    const typeNext = () => {
      if (i < fullText.length) {
        const idx = i;
        const t = setTimeout(() => {
          setTypedText(fullText.slice(0, idx + 1));
          i++;
          typeNext();
        }, 55);
        timers.current.push(t);
      }
    };
    typeNext();

    [0, 1, 2].forEach((ci) => {
      const t = setTimeout(() => {
        setShowCards((prev) => {
          const next = [...prev];
          next[ci] = true;
          return next;
        });
      }, 1400 + ci * 340);
      timers.current.push(t);
    });

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  const talents = [
    { init: "JR", name: "Jordan Reeves", cat: "Athlete · Basketball", score: "98%", followers: "2.1M" },
    { init: "SK", name: "Sofia Kline", cat: "Athlete · Fitness", score: "94%", followers: "890K" },
    { init: "MD", name: "Marcus Davis", cat: "Athlete · Track", score: "91%", followers: "1.4M" },
  ];

  return (
    <div className="aw-scene-inner" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Search bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#161613", border: "0.5px solid rgba(255,248,220,0.18)", borderRadius: 8, padding: "0.75rem 1rem", boxShadow: "0 0 0 3px rgba(196,162,74,0.08)" }}>
        <span style={{ color: "rgba(245,240,230,0.4)", fontSize: "0.9rem" }}>&#128269;</span>
        <span style={{ ...S.mono, fontSize: "0.82rem", color: "rgba(245,240,230,0.75)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {typedText}
          <span style={{ animation: "aw-cursor-blink 0.9s infinite", borderLeft: "1.5px solid #d9b96a", marginLeft: 1 }}>&nbsp;</span>
        </span>
        <span style={{ ...S.mono, fontSize: "0.65rem", background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807", borderRadius: 5, padding: "0.25rem 0.6rem", flexShrink: 0 }}>Search</span>
      </div>

      {/* Filter chips */}
      <div className="aw-filter-chips" style={{ display: "flex", gap: "0.4rem", overflow: "hidden" }}>
        {["All", "Athletes", "Creators", "Musicians"].map((f, i) => (
          <span key={f} style={{ ...S.mono, fontSize: "0.62rem", padding: "0.25rem 0.65rem", borderRadius: 100, background: i === 1 ? "rgba(196,162,74,0.18)" : "rgba(255,248,220,0.04)", border: `0.5px solid ${i === 1 ? "rgba(196,162,74,0.35)" : "rgba(255,248,220,0.07)"}`, color: i === 1 ? "#d9b96a" : "rgba(245,240,230,0.45)", letterSpacing: "0.05em" }}>
            {f}
          </span>
        ))}
        <span style={{ ...S.mono, fontSize: "0.62rem", color: "rgba(245,240,230,0.3)", padding: "0.25rem 0", letterSpacing: "0.05em" }}>12,847 results</span>
      </div>

      {/* Talent cards */}
      <div className="aw-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", flex: 1 }}>
        {talents.map((t, i) => (
          <div
            key={t.name}
            style={{
              ...S.card,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              opacity: showCards[i] ? 1 : 0,
              transform: showCards[i] ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #c4a24a, #e07b18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Mono', monospace", fontSize: "0.6rem", color: "#080807", fontWeight: 500, flexShrink: 0 }}>{t.init}</div>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "#f5f0e6" }}>{t.name}</div>
                <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.04em" }}>{t.cat}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...S.mono, fontSize: "0.62rem", color: "rgba(245,240,230,0.5)" }}>{t.followers}</span>
              <span style={{ ...S.mono, fontSize: "0.62rem", ...S.goldText, fontWeight: 500 }}>{t.score} match</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,248,220,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: t.score, background: "linear-gradient(90deg, #c4a24a, #e07b18)", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCENE 2: AI Match ────────────────────────────────────────────────────────
function Scene2({ active }) {
  const [showBrief, setShowBrief] = useState(false);
  const [lineProgress, setLineProgress] = useState([0, 0, 0]);
  const [scores, setScores] = useState([0, 0, 0]);
  const timers = useRef([]);

  const targetScores = [95, 91, 88];
  const talents = [
    { init: "JR", name: "Jordan Reeves", cat: "Athlete" },
    { init: "SK", name: "Sofia Kline", cat: "Fitness Creator" },
    { init: "MD", name: "Marcus Davis", cat: "Track Athlete" },
  ];

  useEffect(() => {
    if (!active) {
      setShowBrief(false);
      setLineProgress([0, 0, 0]);
      setScores([0, 0, 0]);
      timers.current.forEach(clearTimeout);
      return;
    }
    timers.current = [];

    const t1 = setTimeout(() => setShowBrief(true), 300);
    timers.current.push(t1);

    [0, 1, 2].forEach((i) => {
      const lineTimer = setTimeout(() => {
        setLineProgress((prev) => {
          const next = [...prev];
          next[i] = 1;
          return next;
        });
      }, 900 + i * 300);
      timers.current.push(lineTimer);

      // Count up score
      const scoreStart = 950 + i * 300;
      const duration = 800;
      const steps = 30;
      for (let step = 0; step <= steps; step++) {
        const t = setTimeout(() => {
          setScores((prev) => {
            const next = [...prev];
            next[i] = Math.round((targetScores[i] * step) / steps);
            return next;
          });
        }, scoreStart + (duration * step) / steps);
        timers.current.push(t);
      }
    });

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner aw-scene2-layout" style={{ padding: "1.5rem", height: "100%", display: "flex", gap: "1.25rem", alignItems: "center" }}>
      {/* Brand brief */}
      <div className="aw-scene2-brief" style={{ width: "38%", opacity: showBrief ? 1 : 0, transform: showBrief ? "translateX(0)" : "translateX(-20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
        <div style={{ ...S.card, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(196,162,74,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Campaign Brief</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "#f5f0e6", lineHeight: 1.2 }}>Nike Air Max<br />Summer 2026</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[["Budget", "$80–100K"], ["Category", "Athletes / Fitness"], ["Audience", "18–34 M/F"], ["Reach", "1M+ followers"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                <span style={{ color: "rgba(245,240,230,0.4)", ...S.mono }}>{k}</span>
                <span style={{ color: "#f5f0e6", fontWeight: 400 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "0.5px", background: "rgba(255,248,220,0.07)" }} />
          <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.35)" }}>Matching across 10 factors...</div>
        </div>
      </div>

      {/* Connection lines area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.1rem", justifyContent: "center" }}>
        {talents.map((t, i) => (
          <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Line */}
            <div style={{ flex: 1, height: 1.5, background: "rgba(255,248,220,0.05)", borderRadius: 2, overflow: "visible", position: "relative" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%",
                width: lineProgress[i] ? "100%" : "0%",
                background: `linear-gradient(90deg, rgba(196,162,74,0.3), #c4a24a, #e07b18)`,
                transition: "width 0.6s ease",
                borderRadius: 2,
                boxShadow: lineProgress[i] ? "0 0 6px rgba(196,162,74,0.4)" : "none",
              }} />
            </div>
            {/* Talent card */}
            <div className="aw-talent-card" style={{
              ...S.card,
              padding: "0.6rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              minWidth: 170,
              opacity: lineProgress[i] ? 1 : 0,
              transform: lineProgress[i] ? "translateX(0)" : "translateX(16px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${i * 0.1}s`,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #c4a24a, #e07b18)", display: "flex", alignItems: "center", justifyContent: "center", ...S.mono, fontSize: "0.55rem", color: "#080807", fontWeight: 500, flexShrink: 0 }}>{t.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "#f5f0e6" }}>{t.name}</div>
                <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)" }}>{t.cat}</div>
              </div>
              <div style={{ ...S.mono, fontSize: "0.82rem", fontWeight: 500, ...S.goldText, minWidth: 36, textAlign: "right" }}>{scores[i]}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCENE 3: Kanban Pipeline ─────────────────────────────────────────────────
function Scene3({ active }) {
  const [showCols, setShowCols] = useState([false, false, false, false]);
  const [movingCard, setMovingCard] = useState(null); // null | 'moving' | 'done'
  const timers = useRef([]);

  const columns = [
    { label: "Prospect", color: "rgba(245,240,230,0.18)", deals: ["Nike brief", "Adidas reach"] },
    { label: "Proposal", color: "#c4a24a", deals: ["Louis Vuitton"] },
    { label: "Negotiation", color: "#e07b18", deals: ["Spotify deal"] },
    { label: "Closed", color: "#5cb85c", deals: movingCard === "done" ? ["Nike × Jordan", "Puma deal"] : ["Puma deal"] },
  ];

  useEffect(() => {
    if (!active) {
      setShowCols([false, false, false, false]);
      setMovingCard(null);
      timers.current.forEach(clearTimeout);
      return;
    }
    timers.current = [];

    [0, 1, 2, 3].forEach((i) => {
      const t = setTimeout(() => {
        setShowCols((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 200);
      timers.current.push(t);
    });

    const t1 = setTimeout(() => setMovingCard("moving"), 1800);
    const t2 = setTimeout(() => setMovingCard("done"), 2400);
    timers.current.push(t1, t2);

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner" style={{ padding: "1.25rem 1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 500, color: "#f5f0e6" }}>Deal Pipeline</span>
        <span style={{ ...S.mono, fontSize: "0.58rem", background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#080807", borderRadius: 4, padding: "0.2rem 0.55rem" }}>+ New Deal</span>
      </div>
      <div className="aw-kanban-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", flex: 1 }}>
        {columns.map((col, ci) => (
          <div key={col.label} style={{ opacity: showCols[ci] ? 1 : 0, transform: showCols[ci] ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
              <span style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.label}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {col.deals.map((deal, di) => {
                const isMoving = ci === 1 && di === 0 && movingCard === "moving";
                const isArrived = ci === 3 && deal === "Nike × Jordan";
                return (
                  <div
                    key={deal}
                    style={{
                      ...S.card,
                      padding: "0.65rem 0.75rem",
                      fontSize: "0.68rem",
                      color: isArrived ? "#d9b96a" : "#f5f0e6",
                      border: isArrived ? "0.5px solid rgba(196,162,74,0.35)" : "0.5px solid rgba(255,248,220,0.09)",
                      background: isArrived ? "linear-gradient(135deg, #161613, rgba(196,162,74,0.07))" : "#161613",
                      opacity: isMoving ? 0.2 : 1,
                      transition: "opacity 0.5s ease, background 0.4s ease, border-color 0.4s ease",
                      animation: isArrived ? "aw-card-float 0.5s ease" : "none",
                    }}
                  >
                    {deal}
                    {isArrived && <div style={{ ...S.mono, fontSize: "0.52rem", color: "#5cb85c", marginTop: "0.2rem" }}>&#10003; Signed</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCENE 4: Smart Contracts ─────────────────────────────────────────────────
function Scene4({ active }) {
  const [showDoc, setShowDoc] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [resolvedIssues, setResolvedIssues] = useState([false, false, false]);
  const [showStamp, setShowStamp] = useState(false);
  const timers = useRef([]);

  const issues = ["Exclusivity clause — 90 days", "Payment terms unclear", "Usage rights missing"];

  useEffect(() => {
    if (!active) {
      setShowDoc(false);
      setShowSidebar(false);
      setResolvedIssues([false, false, false]);
      setShowStamp(false);
      timers.current.forEach(clearTimeout);
      return;
    }
    timers.current = [];

    const t1 = setTimeout(() => setShowDoc(true), 200);
    const t2 = setTimeout(() => setShowSidebar(true), 700);
    timers.current.push(t1, t2);

    [0, 1, 2].forEach((i) => {
      const t = setTimeout(() => {
        setResolvedIssues((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 1400 + i * 380);
      timers.current.push(t);
    });

    const t3 = setTimeout(() => setShowStamp(true), 2700);
    timers.current.push(t3);

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner aw-contract-layout" style={{ padding: "1.5rem", height: "100%", display: "flex", gap: "1.25rem" }}>
      {/* Contract doc */}
      <div className="aw-contract-doc" style={{ flex: 1, opacity: showDoc ? 1 : 0, transform: showDoc ? "translateX(0)" : "translateX(-16px)", transition: "opacity 0.5s ease, transform 0.5s ease", position: "relative" }}>
        <div style={{ ...S.card, padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Partnership Agreement</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "#f5f0e6" }}>Nike × Jordan Reeves<br /><span style={{ fontSize: "0.85rem", fontWeight: 500, fontStyle: "italic", color: "rgba(245,240,230,0.6)" }}>Summer Campaign 2026</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { text: "This agreement is between Nike Inc. and Jordan Reeves...", highlight: false },
              { text: "Compensation: $85,000 USD", highlight: false },
              { text: "Exclusivity: Subject to review — 90 day clause", highlight: true },
              { text: "Deliverables: 3 posts, 2 reels, 1 campaign video", highlight: false },
              { text: "Payment: Upon delivery of all assets — terms TBD", highlight: true },
              { text: "Usage rights and licensing — see Appendix A", highlight: true },
            ].map((line, i) => (
              <div key={i} style={{ fontSize: "0.7rem", color: line.highlight ? "#e07b18" : "rgba(245,240,230,0.5)", background: line.highlight ? "rgba(224,123,24,0.08)" : "transparent", borderLeft: line.highlight ? "2px solid rgba(224,123,24,0.4)" : "none", paddingLeft: line.highlight ? "0.5rem" : 0, borderRadius: line.highlight ? "0 3px 3px 0" : 0, lineHeight: 1.5 }}>{line.text}</div>
            ))}
          </div>

          {/* Signed stamp */}
          {showStamp && (
            <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", background: "rgba(92,184,92,0.12)", border: "2px solid rgba(92,184,92,0.5)", borderRadius: 8, padding: "0.5rem 1rem", transform: "rotate(-4deg)", animation: "aw-stamp-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
              <div style={{ ...S.mono, fontSize: "0.75rem", color: "#5cb85c", fontWeight: 500, letterSpacing: "0.08em" }}>SIGNED &#10003;</div>
            </div>
          )}
        </div>
      </div>

      {/* Issues sidebar */}
      <div className="aw-contract-sidebar" style={{ width: "38%", opacity: showSidebar ? 1 : 0, transform: showSidebar ? "translateX(0)" : "translateX(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
        <div style={{ ...S.card, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>&#129302;</span>
            <span style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.6)", letterSpacing: "0.06em" }}>AI CONTRACT SCAN</span>
          </div>
          <div style={{ background: "rgba(224,123,24,0.08)", border: "0.5px solid rgba(224,123,24,0.25)", borderRadius: 7, padding: "0.6rem 0.75rem", ...S.mono, fontSize: "0.65rem", color: "#f09040" }}>3 issues found</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.5rem 0", borderBottom: i < 2 ? "0.5px solid rgba(255,248,220,0.06)" : "none" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, border: resolvedIssues[i] ? "none" : "0.5px solid rgba(255,248,220,0.2)",
                  background: resolvedIssues[i] ? "rgba(92,184,92,0.2)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                  animation: resolvedIssues[i] ? "aw-check-pop 0.4s ease" : "none",
                  transition: "background 0.3s ease",
                }}>
                  {resolvedIssues[i] && <span style={{ fontSize: "0.55rem", color: "#5cb85c" }}>&#10003;</span>}
                </div>
                <span style={{ fontSize: "0.68rem", color: resolvedIssues[i] ? "rgba(245,240,230,0.35)" : "rgba(245,240,230,0.6)", textDecoration: resolvedIssues[i] ? "line-through" : "none", lineHeight: 1.4, transition: "color 0.3s ease" }}>{issue}</span>
              </div>
            ))}
          </div>
          {resolvedIssues[2] && (
            <div style={{ background: "rgba(92,184,92,0.08)", border: "0.5px solid rgba(92,184,92,0.25)", borderRadius: 7, padding: "0.5rem 0.75rem", ...S.mono, fontSize: "0.62rem", color: "#5cb85c", animation: "aw-fade-in 0.4s ease" }}>
              &#10003; All issues resolved — ready to sign
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCENE 5: Analytics & Payments ────────────────────────────────────────────
function Scene5({ active }) {
  const [barsReady, setBarsReady] = useState(false);
  const [kpiValues, setKpiValues] = useState([0, 0, 0]);
  const [showNotif, setShowNotif] = useState(false);
  const timers = useRef([]);

  const bars = [42, 58, 67, 53, 79, 91];
  const kpiTargets = [1200000, 47, 340];
  const kpiFormats = [(v) => `$${(v / 1000).toFixed(1)}M`, (v) => String(Math.round(v)), (v) => `${Math.round(v)}%`];
  const kpiLabels = ["Revenue", "Deals closed", "Avg ROI"];

  useEffect(() => {
    if (!active) {
      setBarsReady(false);
      setKpiValues([0, 0, 0]);
      setShowNotif(false);
      timers.current.forEach(clearTimeout);
      return;
    }
    timers.current = [];

    const t1 = setTimeout(() => setBarsReady(true), 300);
    timers.current.push(t1);

    kpiTargets.forEach((target, i) => {
      const start = 500 + i * 200;
      const dur = 900;
      const steps = 36;
      for (let s = 0; s <= steps; s++) {
        const t = setTimeout(() => {
          setKpiValues((prev) => {
            const next = [...prev];
            next[i] = target * (s / steps);
            return next;
          });
        }, start + (dur * s) / steps);
        timers.current.push(t);
      }
    });

    const t2 = setTimeout(() => setShowNotif(true), 2600);
    timers.current.push(t2);

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner aw-analytics-layout" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
        {kpiLabels.map((label, i) => (
          <div key={label} style={{ ...S.card, padding: "0.9rem 1rem" }}>
            <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, ...S.goldText }}>{kpiFormats[i](kpiValues[i])}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ ...S.card, padding: "1rem", flex: 1 }}>
        <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.85rem" }}>Revenue — Last 6 Months</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.6rem", height: 80 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div style={{
                  width: "100%",
                  height: `${h}%`,
                  background: i === 5 ? "linear-gradient(180deg, #e07b18 0%, #c4a24a 100%)" : "rgba(255,248,220,0.08)",
                  borderRadius: "4px 4px 0 0",
                  transformOrigin: "bottom",
                  transform: barsReady ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.7s cubic-bezier(0.34,1.1,0.64,1) ${i * 0.07}s`,
                  boxShadow: i === 5 ? "0 0 12px rgba(224,123,24,0.3)" : "none",
                }} />
              </div>
              <div style={{ ...S.mono, fontSize: "0.5rem", color: "rgba(245,240,230,0.3)" }}>{["O", "N", "D", "J", "F", "M"][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment notification */}
      {showNotif && (
        <div className="aw-payment-notif" style={{
          position: "absolute",
          bottom: "2.5rem",
          right: "1.5rem",
          background: "linear-gradient(135deg, #161613, rgba(92,184,92,0.08))",
          border: "0.5px solid rgba(92,184,92,0.35)",
          borderRadius: 10,
          padding: "0.75rem 1.1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          animation: "aw-notification-in 0.5s cubic-bezier(0.34,1.1,0.64,1) forwards",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(92,184,92,0.15)",
          zIndex: 10,
          maxWidth: "calc(100% - 1rem)",
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(92,184,92,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>&#128176;</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#f5f0e6", marginBottom: 2 }}>Payment received</div>
            <div className="aw-payment-notif-amount" style={{ ...S.mono, fontSize: "0.7rem", ...S.goldText }}>$85,000 from Nike</div>
          </div>
          <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(92,184,92,0.8)", marginLeft: "0.25rem" }}>&#10003; Paid</div>
        </div>
      )}
    </div>
  );
}

// ─── SCENES CONFIG ────────────────────────────────────────────────────────────
const SCENES = [
  { id: 1, narration: "Search 12,000+ verified profiles", Component: Scene1 },
  { id: 2, narration: "Our AI scores compatibility across 10 factors", Component: Scene2 },
  { id: 3, narration: "Track every deal from pitch to payment", Component: Scene3 },
  { id: 4, narration: "AI-powered contracts with red flag scanning", Component: Scene4 },
  { id: 5, narration: "Real-time analytics and secure payments", Component: Scene5 },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnimatedWalkthrough() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0); // 0–1 for current scene progress
  const intervalRef = useRef(null);
  const elapsedRef = useRef(null);
  const elapsedVal = useRef(0);
  const sceneRef = useRef(0);
  const isPlayingRef = useRef(true);

  const TICK = 50; // ms per progress tick

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
  }, []);

  const advance = useCallback(() => {
    setSceneVisible(false);
    setTimeout(() => {
      sceneRef.current = (sceneRef.current + 1) % TOTAL_SCENES;
      setCurrentScene(sceneRef.current);
      elapsedVal.current = 0;
      setElapsed(0);
      setSceneVisible(true);
    }, 350);
  }, []);

  const startPlayback = useCallback(() => {
    clearTimers();
    elapsedVal.current = 0;
    setElapsed(0);

    elapsedRef.current = setInterval(() => {
      elapsedVal.current += TICK / SCENE_DURATION;
      setElapsed(Math.min(elapsedVal.current, 1));
    }, TICK);

    intervalRef.current = setInterval(() => {
      if (isPlayingRef.current) {
        advance();
        elapsedVal.current = 0;
        setElapsed(0);
      }
    }, SCENE_DURATION);
  }, [clearTimers, advance]);

  useEffect(() => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    startPlayback();
    return () => clearTimers();
  }, []);

  const handleToggle = useCallback(() => {
    if (isPlayingRef.current) {
      // Pause
      clearTimers();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      // Resume — restart the interval from current point
      isPlayingRef.current = true;
      setIsPlaying(true);
      // restart elapsed and interval
      const remaining = (1 - elapsedVal.current) * SCENE_DURATION;

      elapsedRef.current = setInterval(() => {
        elapsedVal.current += TICK / SCENE_DURATION;
        setElapsed(Math.min(elapsedVal.current, 1));
      }, TICK);

      intervalRef.current = setTimeout(() => {
        advance();
        elapsedVal.current = 0;
        setElapsed(0);
        // After the first partial scene, switch to full interval
        intervalRef.current = setInterval(() => {
          if (isPlayingRef.current) {
            advance();
            elapsedVal.current = 0;
            setElapsed(0);
          }
        }, SCENE_DURATION);
      }, remaining);
    }
  }, [clearTimers, advance, startPlayback]);

  const globalProgress = (currentScene + elapsed) / TOTAL_SCENES;

  const { Component, narration } = SCENES[currentScene];

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="aw-container"
        style={S.container}
        onClick={handleToggle}
        title={isPlaying ? "Click to pause" : "Click to resume"}
      >
        {/* Scene content */}
        <div
          className="aw-scene-inner-top"
          style={{
            position: "absolute",
            inset: 0,
            opacity: sceneVisible ? 1 : 0,
            transform: sceneVisible ? "scale(1)" : "scale(0.98)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            paddingTop: "3.5rem",
          }}
        >
          <Component active={sceneVisible} />
        </div>

        {/* Narration overlay at top */}
        <div
          className="aw-narration-bar"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "0.9rem 1.5rem",
            background: "linear-gradient(to bottom, rgba(10,10,9,0.95) 60%, transparent)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 5,
            opacity: sceneVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          {/* Scene indicator dots */}
          <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
            {SCENES.map((_, i) => (
              <div key={i} style={{
                width: i === currentScene ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentScene ? "linear-gradient(90deg, #c4a24a, #e07b18)" : "rgba(255,248,220,0.18)",
                transition: "width 0.3s ease, background 0.3s ease",
              }} />
            ))}
          </div>
          <p className="aw-narration-text" style={{ ...S.narration, margin: 0, fontSize: "0.92rem" }}>{narration}</p>
        </div>

        {/* Play/pause button bottom-right */}
        <div style={{
          position: "absolute",
          bottom: "0.85rem",
          right: "1rem",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(10,10,9,0.7)",
          border: "0.5px solid rgba(255,248,220,0.1)",
          borderRadius: 100,
          padding: "0.3rem 0.65rem",
          backdropFilter: "blur(8px)",
        }}>
          {isPlaying ? (
            <>
              <div style={{ display: "flex", gap: "2px" }}>
                <div style={{ width: 3, height: 10, background: "#d9b96a", borderRadius: 1.5 }} />
                <div style={{ width: 3, height: 10, background: "#d9b96a", borderRadius: 1.5 }} />
              </div>
              <span style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.55)", letterSpacing: "0.05em" }}>Pause</span>
            </>
          ) : (
            <>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M1 1l8 5-8 5V1z" fill="#d9b96a" />
              </svg>
              <span style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.55)", letterSpacing: "0.05em" }}>Resume</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,248,220,0.05)",
          zIndex: 10,
        }}>
          <div style={{
            height: "100%",
            width: `${globalProgress * 100}%`,
            background: "linear-gradient(90deg, #c4a24a 0%, #e07b18 100%)",
            transition: `width ${TICK}ms linear`,
            boxShadow: "0 0 6px rgba(224,123,24,0.4)",
          }} />
        </div>
      </div>
    </>
  );
}

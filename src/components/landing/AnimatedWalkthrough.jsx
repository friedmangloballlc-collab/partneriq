import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SCENE_DURATION = 5000;
const TOTAL_SCENES = 8;
const TICK = 50;
const TRANSITION_MS = 400;

// ─── SHARED DESIGN SYSTEM ─────────────────────────────────────────────────────
const DS = {
  bg: "#1c1b19",
  bgCard: "#232220",
  gold: "#d4b04e",
  goldLight: "#d9b96a",
  amber: "#e07b18",
  cream: "#f5f0e6",
  green: "#4ade80",
  border: "rgba(212,176,78,0.18)",
  borderFaint: "rgba(245,240,230,0.07)",
};

const S = {
  container: {
    background: DS.bg,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    aspectRatio: "16/9",
    maxWidth: 820,
    margin: "0 auto",
    border: `0.5px solid ${DS.border}`,
    userSelect: "none",
  },
  narration: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "0.95rem",
    fontWeight: 500,
    fontStyle: "italic",
    background: `linear-gradient(90deg, ${DS.goldLight} 0%, ${DS.amber} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.01em",
    lineHeight: 1.35,
  },
  mono: { fontFamily: "'Instrument Mono', 'Fira Mono', monospace" },
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans: { fontFamily: "'Instrument Sans', system-ui, sans-serif" },
  goldText: {
    background: `linear-gradient(90deg, ${DS.goldLight} 0%, ${DS.amber} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  card: {
    background: DS.bgCard,
    border: `0.5px solid ${DS.borderFaint}`,
    borderRadius: 10,
  },
  cardGold: {
    background: `linear-gradient(135deg, ${DS.bgCard} 0%, rgba(212,176,78,0.06) 100%)`,
    border: `0.5px solid ${DS.border}`,
    borderRadius: 10,
  },
};

// ─── KEYFRAME STYLES ──────────────────────────────────────────────────────────
const STYLES = `
  @keyframes aw-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aw-slide-in-right {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-slide-in-left {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-slide-in-bottom {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aw-slide-out-left {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-40px); }
  }
  @keyframes aw-slide-scene-in {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-slide-scene-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-30px); }
  }
  @keyframes aw-stamp-in {
    0%   { opacity: 0; transform: scale(1.6) rotate(-8deg); }
    60%  { opacity: 1; transform: scale(0.9) rotate(2deg); }
    80%  { transform: scale(1.05) rotate(-3deg); }
    100% { opacity: 1; transform: scale(1) rotate(-4deg); }
  }
  @keyframes aw-check-pop {
    0%   { opacity: 0; transform: scale(0); }
    70%  { opacity: 1; transform: scale(1.25); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes aw-notification-in {
    from { opacity: 0; transform: translateX(110%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes aw-cursor-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0; }
  }
  @keyframes aw-ring-fill {
    from { stroke-dashoffset: 113; }
    to   { stroke-dashoffset: var(--target-offset); }
  }
  @keyframes aw-sparkle {
    0%   { opacity: 0; transform: scale(0) translateY(0); }
    40%  { opacity: 1; transform: scale(1.2) translateY(-8px); }
    100% { opacity: 0; transform: scale(0.6) translateY(-18px); }
  }
  @keyframes aw-confetti {
    0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    100% { opacity: 0; transform: translateY(40px) rotate(360deg) scale(0.4); }
  }
  @keyframes aw-pulse-glow {
    0%,100% { box-shadow: 0 0 8px rgba(212,176,78,0.3); }
    50%     { box-shadow: 0 0 18px rgba(212,176,78,0.65), 0 0 32px rgba(224,123,24,0.2); }
  }
  @keyframes aw-bar-grow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes aw-progress-fill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes aw-float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-4px); }
  }
  @keyframes aw-line-draw {
    from { stroke-dashoffset: 200; opacity: 0; }
    to   { stroke-dashoffset: 0; opacity: 1; }
  }
  @keyframes aw-glow-pulse {
    0%,100% { opacity: 0.4; }
    50%     { opacity: 0.9; }
  }
  @keyframes aw-scale-in {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes aw-role-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(212,176,78,0); border-color: rgba(212,176,78,0.18); }
    50%     { box-shadow: 0 0 20px rgba(212,176,78,0.4), 0 0 40px rgba(212,176,78,0.15); border-color: rgba(212,176,78,0.7); }
  }

  /* Scene transition wrapper */
  .aw-scene-transition-in  { animation: aw-slide-scene-in  ${TRANSITION_MS}ms ease forwards; }
  .aw-scene-transition-out { animation: aw-slide-scene-out ${TRANSITION_MS}ms ease forwards; }

  /* Mobile overrides */
  @media (max-width: 600px) {
    .aw-container { aspect-ratio: 4/3 !important; border-radius: 10px !important; }
    .aw-narration-text { font-size: 0.68rem !important; }
    .aw-scene-inner { padding: 0.6rem !important; }
    .aw-scene-pad { padding-top: 3.2rem !important; }
    .aw-grid-3 { grid-template-columns: 1fr !important; gap: 0.4rem !important; }
    .aw-grid-2 { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
    .aw-grid-4 { grid-template-columns: repeat(2,1fr) !important; }
    .aw-flex-col-mobile { flex-direction: column !important; }
    .aw-talent-list { flex-direction: column !important; gap: 0.4rem !important; }
    .aw-w-auto { width: auto !important; }
    .aw-tab-bar { display: none !important; }
    .aw-nav-btn-label { display: none !important; }
  }
  @media (max-width: 480px) {
    .aw-kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
`;

// ─── SPARKLE PARTICLE ─────────────────────────────────────────────────────────
function Sparkle({ x, y, delay = 0, size = 6, color = DS.gold }) {
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      animation: `aw-sparkle 0.8s ease ${delay}ms forwards`,
      pointerEvents: "none",
      zIndex: 20,
    }} />
  );
}

// ─── CONFETTI BURST ───────────────────────────────────────────────────────────
function ConfettiBurst({ show, x = "50%", y = "50%" }) {
  if (!show) return null;
  const pieces = [
    { dx: -18, dy: -12, color: DS.gold, shape: "rect" },
    { dx: 16, dy: -20, color: DS.amber, shape: "circle" },
    { dx: -8, dy: -24, color: DS.goldLight, shape: "rect" },
    { dx: 22, dy: -8, color: DS.gold, shape: "circle" },
    { dx: -24, dy: -4, color: DS.amber, shape: "rect" },
    { dx: 10, dy: -30, color: DS.goldLight, shape: "rect" },
    { dx: -14, dy: -18, color: DS.gold, shape: "circle" },
    { dx: 28, dy: -16, color: DS.amber, shape: "rect" },
  ];
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 30, pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.shape === "circle" ? 5 : 4,
          height: p.shape === "circle" ? 5 : 8,
          borderRadius: p.shape === "circle" ? "50%" : 1,
          background: p.color,
          left: p.dx,
          top: p.dy,
          animation: `aw-confetti 0.9s ease ${i * 60}ms forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 52, strokeWidth = 4, animDelay = 0 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, overflow: "visible" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,248,220,0.07)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        style={{
          "--target-offset": offset,
          strokeDashoffset: circ,
          animation: `aw-ring-fill 1s cubic-bezier(0.34,1.1,0.64,1) ${animDelay}ms forwards`,
          transform: "rotate(-90deg)",
          transformOrigin: "center",
        }}
      />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={DS.goldLight} />
          <stop offset="100%" stopColor={DS.amber} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── COUNTER HOOK ─────────────────────────────────────────────────────────────
function useCounter(target, active, delay = 0, duration = 900) {
  const [value, setValue] = useState(0);
  const timerRef = useRef([]);

  useEffect(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    if (!active) { setValue(0); return; }
    const steps = 36;
    for (let s = 0; s <= steps; s++) {
      const t = setTimeout(() => {
        setValue(target * (s / steps));
      }, delay + (duration * s) / steps);
      timerRef.current.push(t);
    }
    return () => timerRef.current.forEach(clearTimeout);
  }, [active, target, delay, duration]);

  return value;
}

// ─── TYPING HOOK ──────────────────────────────────────────────────────────────
function useTyping(text, active, delay = 0, charDelay = 30) {
  const [typed, setTyped] = useState("");
  const timerRef = useRef([]);

  useEffect(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    if (!active) { setTyped(""); return; }
    let i = 0;
    const typeNext = () => {
      if (i < text.length) {
        const idx = i;
        const t = setTimeout(() => {
          setTyped(text.slice(0, idx + 1));
          i++;
          typeNext();
        }, delay + charDelay * idx);
        timerRef.current.push(t);
      }
    };
    typeNext();
    return () => timerRef.current.forEach(clearTimeout);
  }, [active, text]);

  return typed;
}

// ─── SCENE 1: Sign Up in 30 Seconds ──────────────────────────────────────────
function Scene1({ active }) {
  const [phase, setPhase] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) { setPhase(0); return; }
    const ts = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2900),
    ];
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const roles = [
    { icon: "🏷️", label: "Brand", sub: "Run campaigns" },
    { icon: "⭐", label: "Talent", sub: "Get discovered" },
    { icon: "🏢", label: "Agency", sub: "Manage clients" },
  ];

  return (
    <div className="aw-scene-inner" style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(-10px)",
        transition: "all 0.5s ease",
      }}>
        <div style={{ ...S.serif, fontSize: "1.15rem", fontWeight: 700, color: DS.cream }}>Choose your role</div>
        <div style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.4)", marginTop: 3, letterSpacing: "0.06em" }}>FREE FOREVER — NO CREDIT CARD</div>
      </div>

      {/* Role cards */}
      <div className="aw-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
        {roles.map((r, i) => {
          const isSelected = phase >= 2 && i === 1;
          return (
            <div key={r.label} style={{
              ...S.card,
              padding: "1.1rem 0.75rem",
              textAlign: "center",
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.45s ease ${i * 120}ms`,
              border: isSelected ? `1px solid rgba(212,176,78,0.6)` : `0.5px solid ${DS.borderFaint}`,
              background: isSelected
                ? `linear-gradient(135deg, #232220 0%, rgba(212,176,78,0.1) 100%)`
                : DS.bgCard,
              animation: isSelected ? "aw-role-glow 1.5s ease infinite" : "none",
              boxShadow: isSelected ? "0 0 20px rgba(212,176,78,0.25)" : "none",
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{r.icon}</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: isSelected ? DS.goldLight : DS.cream }}>{r.label}</div>
              <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.4)", marginTop: 3, letterSpacing: "0.04em" }}>{r.sub}</div>
              {isSelected && (
                <div style={{ marginTop: "0.5rem", width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #d4b04e, #e07b18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0.5rem auto 0", animation: "aw-check-pop 0.4s ease" }}>
                  <span style={{ fontSize: "0.55rem", color: DS.bg }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form fields appearing */}
      <div style={{
        ...S.cardGold,
        padding: "1rem",
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {["Sarah Chen", "sarah@brandco.com"].map((val, i) => (
            <div key={i} style={{
              background: "rgba(245,240,230,0.04)",
              border: `0.5px solid rgba(245,240,230,0.12)`,
              borderRadius: 7,
              padding: "0.5rem 0.75rem",
              ...S.mono,
              fontSize: "0.68rem",
              color: "rgba(245,240,230,0.7)",
              opacity: phase >= 3 ? 1 : 0,
              transition: `all 0.4s ease ${i * 150}ms`,
            }}>{val}</div>
          ))}
        </div>
        <div style={{
          background: "linear-gradient(135deg, #d4b04e, #e07b18)",
          borderRadius: 8,
          padding: "0.6rem",
          textAlign: "center",
          ...S.mono,
          fontSize: "0.72rem",
          color: DS.bg,
          fontWeight: 600,
          letterSpacing: "0.04em",
          animation: phase >= 3 ? "aw-pulse-glow 2s ease infinite" : "none",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}>
          START FOR FREE
        </div>
      </div>

      {/* Success state */}
      {phase >= 4 && (
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #232220, rgba(74,222,128,0.08))",
          border: "0.5px solid rgba(74,222,128,0.35)",
          borderRadius: 10,
          padding: "0.65rem 1.4rem",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          animation: "aw-slide-in-bottom 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards",
          whiteSpace: "nowrap",
          zIndex: 15,
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</div>
          <span style={{ ...S.mono, fontSize: "0.72rem", color: DS.green }}>Account Created ✓ — Welcome, Sarah</span>
        </div>
      )}
    </div>
  );
}

// ─── SCENE 2: Connect Your Accounts ──────────────────────────────────────────
function Scene2({ active }) {
  const [phase, setPhase] = useState(0);
  const [platformVisible, setPlatformVisible] = useState([false, false, false, false]);
  const [linesDrawn, setLinesDrawn] = useState([false, false, false, false]);
  const [verified, setVerified] = useState(false);
  const timers = useRef([]);

  const platforms = [
    { name: "Instagram", icon: "📸", color: "#E1306C", followers: "2.1M", x: 18, y: 30 },
    { name: "TikTok", icon: "🎵", color: "#010101", followers: "890K", x: 18, y: 58 },
    { name: "YouTube", icon: "▶️", color: "#FF0000", followers: "340K", x: 68, y: 22 },
    { name: "Spotify", icon: "🎧", color: "#1DB954", followers: "120K", x: 68, y: 65 },
  ];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setPhase(0);
      setPlatformVisible([false, false, false, false]);
      setLinesDrawn([false, false, false, false]);
      setVerified(false);
      return;
    }
    const ts = [
      setTimeout(() => setPhase(1), 100),
    ];
    platforms.forEach((_, i) => {
      ts.push(setTimeout(() => {
        setPlatformVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 300 + i * 250));
      ts.push(setTimeout(() => {
        setLinesDrawn(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 600 + i * 250));
    });
    ts.push(setTimeout(() => setVerified(true), 1800));
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const followerCounters = [
    useCounter(2100000, active, 700, 800),
    useCounter(890000, active, 950, 800),
    useCounter(340000, active, 1100, 800),
    useCounter(120000, active, 1250, 800),
  ];

  const formatFollowers = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return Math.round(n).toString();
  };

  return (
    <div className="aw-scene-inner" style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{
        ...S.serif,
        fontSize: "1.05rem",
        fontWeight: 700,
        color: DS.cream,
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        Connect your platforms
      </div>

      {/* Connection diagram */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
        {/* Central profile */}
        <div style={{
          position: "absolute",
          left: "42%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${DS.gold}, ${DS.amber})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease",
          animation: phase >= 1 ? "aw-pulse-glow 2s ease infinite" : "none",
          flexShrink: 0,
        }}>
          <span style={{ ...S.mono, fontSize: "0.55rem", color: DS.bg, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>YOUR{"\n"}PROFILE</span>
        </div>

        {/* SVG lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}>
          {platforms.map((p, i) => {
            const fromX = `${p.x < 42 ? p.x + 6 : p.x - 2}%`;
            const fromY = `${p.y}%`;
            const toX = "42%";
            const toY = "50%";
            return linesDrawn[i] ? (
              <line
                key={i}
                x1={fromX} y1={fromY}
                x2={toX} y2={toY}
                stroke={`url(#lineGrad${i})`}
                strokeWidth="1.5"
                strokeDasharray="200"
                style={{
                  animation: `aw-line-draw 0.6s ease forwards`,
                }}
              />
            ) : null;
          })}
          <defs>
            {platforms.map((p, i) => (
              <linearGradient key={i} id={`lineGrad${i}`} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={p.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={DS.gold} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>
        </svg>

        {/* Platform icons */}
        {platforms.map((p, i) => (
          <div key={p.name} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%,-50%)",
            zIndex: 4,
            opacity: platformVisible[i] ? 1 : 0,
            transform: platformVisible[i]
              ? "translate(-50%,-50%) scale(1)"
              : `translate(-50%,-50%) scale(0.5) ${p.x < 42 ? "translateX(-20px)" : "translateX(20px)"}`,
            transition: `all 0.5s cubic-bezier(0.34,1.3,0.64,1)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${p.color}22, ${p.color}44)`,
              border: `1px solid ${p.color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}>{p.icon}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.5)", letterSpacing: "0.04em" }}>{p.name}</div>
              <div style={{ ...S.mono, fontSize: "0.62rem", ...S.goldText, fontWeight: 500 }}>
                {formatFollowers(followerCounters[i])}
              </div>
            </div>
          </div>
        ))}

        {/* Verified badge */}
        {verified && (
          <div style={{
            position: "absolute",
            right: "4%",
            top: "50%",
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, #232220, rgba(74,222,128,0.1))",
            border: "0.5px solid rgba(74,222,128,0.4)",
            borderRadius: 10,
            padding: "0.65rem 0.9rem",
            animation: "aw-slide-in-right 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards",
            zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.5rem", color: DS.green }}>✓</span>
              </div>
              <span style={{ ...S.mono, fontSize: "0.6rem", color: DS.green, letterSpacing: "0.06em" }}>VERIFIED</span>
            </div>
            <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.5)" }}>3.45M total reach</div>
            <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.5)" }}>4 platforms linked</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCENE 3: AI Match Engine ─────────────────────────────────────────────────
function Scene3({ active }) {
  const [showBrief, setShowBrief] = useState(false);
  const [particles, setParticles] = useState(false);
  const [showTalents, setShowTalents] = useState([false, false, false]);
  const [showFactors, setShowFactors] = useState(false);
  const timers = useRef([]);

  const talents = [
    { init: "JR", name: "Jordan Reeves", cat: "Athlete · Basketball", score: 97, followers: "2.1M" },
    { init: "SK", name: "Sofia Kline", cat: "Fitness Creator", score: 94, followers: "890K" },
    { init: "MD", name: "Marcus Davis", cat: "Track Athlete", score: 91, followers: "1.4M" },
  ];

  const factors = [
    { label: "Audience", val: 95 }, { label: "Engagement", val: 88 },
    { label: "Brand Safety", val: 97 }, { label: "Budget Fit", val: 92 },
    { label: "Authenticity", val: 89 }, { label: "Reach", val: 94 },
  ];

  const scoreCounters = [
    useCounter(97, active, 1100, 700),
    useCounter(94, active, 1300, 700),
    useCounter(91, active, 1500, 700),
  ];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setShowBrief(false); setParticles(false);
      setShowTalents([false, false, false]); setShowFactors(false);
      return;
    }
    const ts = [
      setTimeout(() => setShowBrief(true), 200),
      setTimeout(() => setParticles(true), 700),
    ];
    [0, 1, 2].forEach(i => {
      ts.push(setTimeout(() => {
        setShowTalents(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 900 + i * 280));
    });
    ts.push(setTimeout(() => setShowFactors(true), 2000));
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner" style={{ padding: "1.1rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Top layout */}
      <div className="aw-flex-col-mobile" style={{ display: "flex", gap: "1rem", flex: 1, minHeight: 0 }}>
        {/* Brand brief */}
        <div className="aw-w-auto" style={{
          width: "36%",
          opacity: showBrief ? 1 : 0,
          transform: showBrief ? "translateX(0)" : "translateX(-24px)",
          transition: "all 0.5s ease",
          flexShrink: 0,
        }}>
          <div style={{ ...S.cardGold, padding: "0.9rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(212,176,78,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Campaign Brief</div>
            <div style={{ ...S.serif, fontSize: "0.95rem", fontWeight: 700, color: DS.cream, lineHeight: 1.2 }}>Nike Air Max<br />Summer 2026</div>
            {[["Budget", "$80–100K"], ["Category", "Athletes"], ["Audience", "18–34 M/F"], ["Reach", "1M+ followers"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}>
                <span style={{ ...S.mono, color: "rgba(245,240,230,0.4)" }}>{k}</span>
                <span style={{ color: DS.cream }}>{v}</span>
              </div>
            ))}
            <div style={{ height: "0.5px", background: "rgba(255,248,220,0.07)" }} />
            <div style={{ ...S.mono, fontSize: "0.54rem", color: "rgba(245,240,230,0.35)", lineHeight: 1.4 }}>AI matching across<br />10 factors...</div>
          </div>
        </div>

        {/* Particle area + Talent cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", justifyContent: "center", position: "relative", minWidth: 0 }}>
          {/* Gold particles */}
          {particles && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {[...Array(8)].map((_, i) => (
                <Sparkle
                  key={i}
                  x={`${10 + i * 11}%`}
                  y={`${20 + (i % 3) * 22}%`}
                  delay={i * 100}
                  size={4 + (i % 3)}
                  color={i % 2 === 0 ? DS.gold : DS.amber}
                />
              ))}
            </div>
          )}

          {talents.map((t, i) => (
            <div key={t.name} style={{
              ...S.card,
              padding: "0.65rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              opacity: showTalents[i] ? 1 : 0,
              transform: showTalents[i] ? "translateX(0)" : "translateX(20px)",
              transition: `all 0.5s cubic-bezier(0.34,1.1,0.64,1) ${i * 0.1}s`,
              border: i === 0 ? `0.5px solid ${DS.border}` : `0.5px solid ${DS.borderFaint}`,
              background: i === 0 ? `linear-gradient(135deg, #232220, rgba(212,176,78,0.07))` : DS.bgCard,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${DS.gold}, ${DS.amber})`, display: "flex", alignItems: "center", justifyContent: "center", ...S.mono, fontSize: "0.56rem", color: DS.bg, fontWeight: 600, flexShrink: 0 }}>{t.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: DS.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.4)" }}>{t.cat} · {t.followers}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <ScoreRing score={showTalents[i] ? t.score : 0} size={42} strokeWidth={3} animDelay={1000 + i * 200} />
                <div style={{ ...S.mono, fontSize: "0.68rem", fontWeight: 600, ...S.goldText, marginTop: -28, zIndex: 5, position: "relative" }}>
                  {Math.round(scoreCounters[i])}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factor breakdown bars */}
      {showFactors && (
        <div style={{
          ...S.card,
          padding: "0.75rem",
          animation: "aw-slide-in-bottom 0.5s ease forwards",
          flexShrink: 0,
        }}>
          <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.08em", marginBottom: "0.5rem", textTransform: "uppercase" }}>10-Factor AI Analysis</div>
          <div className="aw-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.4rem 1rem" }}>
            {factors.map((f, i) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ ...S.mono, fontSize: "0.5rem", color: "rgba(245,240,230,0.4)", width: 60, flexShrink: 0 }}>{f.label}</div>
                <div style={{ flex: 1, height: 3, background: "rgba(255,248,220,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${DS.gold}, ${DS.amber})`,
                    borderRadius: 2,
                    width: `${f.val}%`,
                    transform: "scaleX(1)",
                    transformOrigin: "left",
                    animation: `aw-progress-fill 0.8s ease ${i * 80}ms both`,
                  }} />
                </div>
                <div style={{ ...S.mono, fontSize: "0.5rem", ...S.goldText, width: 24, textAlign: "right", flexShrink: 0 }}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCENE 4: Smart Outreach ──────────────────────────────────────────────────
function Scene4({ active }) {
  const [showContact, setShowContact] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const timers = useRef([]);

  const msgText = "Hi Sarah, I came across PartnerIQ and noticed your brand aligns perfectly with Jordan Reeves' fitness audience. His 2.1M Instagram followers skew 22–34F — exactly your target demo. We'd love to explore a Summer 2026 campaign. Are you open to a quick 20-minute call?";
  const typedMsg = useTyping(msgText, showMessage, 0, 22);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setShowContact(false); setShowMessage(false);
      setShowSend(false); setShowNotif(false);
      return;
    }
    const ts = [
      setTimeout(() => setShowContact(true), 200),
      setTimeout(() => setShowMessage(true), 700),
      setTimeout(() => setShowSend(true), 4200),
      setTimeout(() => setShowNotif(true), 5000),
    ];
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner" style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {/* Contact card */}
      <div style={{
        opacity: showContact ? 1 : 0,
        transform: showContact ? "translateX(0)" : "translateX(-20px)",
        transition: "all 0.5s ease",
      }}>
        <div style={{ ...S.cardGold, padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, #d4b04e, #e07b18)", display: "flex", alignItems: "center", justifyContent: "center", ...S.mono, fontSize: "0.65rem", color: DS.bg, fontWeight: 700, flexShrink: 0 }}>SC</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: DS.cream }}>Sarah Chen</div>
            <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.5)" }}>VP Marketing · Nike APAC</div>
            <div style={{ ...S.mono, fontSize: "0.54rem", color: "rgba(245,240,230,0.3)", marginTop: 2 }}>sarah.chen@nike.com</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(212,176,78,0.7)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Warm lead</div>
            <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.4)", marginTop: 2 }}>68% open rate</div>
          </div>
        </div>
      </div>

      {/* AI message composer */}
      <div style={{
        ...S.card,
        padding: "0.9rem",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
        opacity: showMessage ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.85rem" }}>🤖</span>
          <span style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.45)", letterSpacing: "0.06em" }}>AI PERSONALIZED PITCH</span>
        </div>
        <div style={{ ...S.mono, fontSize: "0.64rem", color: "rgba(245,240,230,0.75)", lineHeight: 1.65, flex: 1, overflow: "hidden" }}>
          {typedMsg}
          {showMessage && typedMsg.length < msgText.length && (
            <span style={{ animation: "aw-cursor-blink 0.7s infinite", borderLeft: "1.5px solid #d9b96a", marginLeft: 1 }}>&nbsp;</span>
          )}
        </div>
        {showSend && (
          <div style={{
            background: "linear-gradient(135deg, #d4b04e, #e07b18)",
            borderRadius: 7,
            padding: "0.5rem 1rem",
            textAlign: "center",
            ...S.mono,
            fontSize: "0.68rem",
            color: DS.bg,
            fontWeight: 600,
            letterSpacing: "0.04em",
            animation: "aw-pulse-glow 1.5s ease infinite, aw-fade-in 0.4s ease",
            cursor: "pointer",
          }}>
            SEND PITCH →
          </div>
        )}
      </div>

      {/* Response notification */}
      {showNotif && (
        <div style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "1rem",
          background: "linear-gradient(135deg, #232220, rgba(212,176,78,0.1))",
          border: `0.5px solid ${DS.border}`,
          borderRadius: 10,
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          animation: "aw-notification-in 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,176,78,0.12)",
          zIndex: 20,
          maxWidth: "80%",
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${DS.gold}, ${DS.amber})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>📬</div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 500, color: DS.cream, marginBottom: 2 }}>Response received!</div>
            <div style={{ ...S.mono, fontSize: "0.6rem", ...S.goldText }}>Sarah Chen opened your proposal</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCENE 5: Deal Pipeline ───────────────────────────────────────────────────
function Scene5({ active }) {
  const [showCols, setShowCols] = useState([false, false, false, false]);
  const [movedDeal, setMovedDeal] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timers = useRef([]);

  const pipelineValue = useCounter(1200000, active, 2000, 900);

  const columns = [
    {
      label: "Discovery", color: DS.gold,
      deals: [
        { name: "Adidas Boost", value: "$45K", hot: false },
        { name: "Puma Sprint", value: "$32K", hot: false },
      ]
    },
    {
      label: "Negotiation", color: DS.amber,
      deals: [
        { name: "Louis Vuitton", value: "$120K", hot: true },
      ]
    },
    {
      label: "Contract", color: "#a78bfa",
      deals: [
        { name: "Spotify Wrap", value: "$78K", hot: false },
        ...(!movedDeal ? [{ name: "Nike Air Max", value: "$85K", hot: true, moving: true }] : []),
      ]
    },
    {
      label: "Active", color: DS.green,
      deals: [
        { name: "Red Bull Tour", value: "$55K", hot: false },
        ...(movedDeal ? [{ name: "Nike Air Max", value: "$85K", hot: true, arrived: true }] : []),
      ]
    },
  ];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setShowCols([false, false, false, false]);
      setMovedDeal(false); setShowClosed(false); setShowConfetti(false);
      return;
    }
    const ts = [];
    [0, 1, 2, 3].forEach(i => {
      ts.push(setTimeout(() => {
        setShowCols(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 150 + i * 180));
    });
    ts.push(setTimeout(() => setMovedDeal(true), 2200));
    ts.push(setTimeout(() => setShowClosed(true), 2700));
    ts.push(setTimeout(() => setShowConfetti(true), 2800));
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner" style={{ padding: "1.1rem 1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...S.serif, fontSize: "1rem", fontWeight: 600, color: DS.cream }}>Deal Pipeline</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.06em" }}>TOTAL PIPELINE</div>
            <div style={{ ...S.serif, fontSize: "1.1rem", fontWeight: 700, ...S.goldText }}>
              ${(pipelineValue / 1000000).toFixed(2)}M
            </div>
          </div>
          <div style={{ ...S.mono, fontSize: "0.6rem", background: "linear-gradient(135deg, #d4b04e, #e07b18)", color: DS.bg, borderRadius: 5, padding: "0.25rem 0.6rem", flexShrink: 0 }}>+ New</div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="aw-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.6rem", flex: 1 }}>
        {columns.map((col, ci) => (
          <div key={col.label} style={{
            opacity: showCols[ci] ? 1 : 0,
            transform: showCols[ci] ? "translateY(0)" : "translateY(14px)",
            transition: `all 0.45s ease ${ci * 0.1}s`,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
              <span style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.label}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
              {col.deals.map((deal) => (
                <div key={deal.name} style={{
                  ...S.card,
                  padding: "0.6rem 0.7rem",
                  opacity: deal.moving ? 0.15 : 1,
                  transition: "all 0.5s ease",
                  border: deal.arrived
                    ? `0.5px solid rgba(74,222,128,0.4)`
                    : deal.hot
                    ? `0.5px solid ${DS.border}`
                    : `0.5px solid ${DS.borderFaint}`,
                  background: deal.arrived
                    ? "linear-gradient(135deg, #232220, rgba(74,222,128,0.07))"
                    : deal.hot
                    ? `linear-gradient(135deg, #232220, rgba(212,176,78,0.06))`
                    : DS.bgCard,
                  animation: deal.arrived ? "aw-card-float 0.5s ease" : "none",
                  position: "relative",
                }}>
                  <div style={{ fontSize: "0.64rem", color: deal.arrived ? DS.goldLight : DS.cream, fontWeight: deal.hot ? 500 : 400, lineHeight: 1.3 }}>{deal.name}</div>
                  <div style={{ ...S.mono, fontSize: "0.58rem", ...S.goldText, marginTop: 3 }}>{deal.value}</div>
                  {deal.arrived && (
                    <>
                      <div style={{ ...S.mono, fontSize: "0.5rem", color: DS.green, marginTop: 3 }}>✓ Active</div>
                      <ConfettiBurst show={showConfetti} x="50%" y="0%" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCENE 6: AI Contracts ────────────────────────────────────────────────────
function Scene6({ active }) {
  const [showDoc, setShowDoc] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [resolved, setResolved] = useState([false, false, false]);
  const [showStamp, setShowStamp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timers = useRef([]);

  const issues = [
    "Exclusivity clause — 90 days",
    "Payment terms unclear",
    "Usage rights missing",
  ];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setShowDoc(false); setShowSidebar(false);
      setResolved([false, false, false]); setShowStamp(false); setShowConfetti(false);
      return;
    }
    const ts = [
      setTimeout(() => setShowDoc(true), 200),
      setTimeout(() => setShowSidebar(true), 700),
    ];
    [0, 1, 2].forEach(i => {
      ts.push(setTimeout(() => {
        setResolved(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 1400 + i * 400));
    });
    ts.push(setTimeout(() => setShowStamp(true), 2700));
    ts.push(setTimeout(() => setShowConfetti(true), 2800));
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner aw-flex-col-mobile" style={{ padding: "1.25rem", height: "100%", display: "flex", gap: "1.1rem" }}>
      {/* Contract document */}
      <div className="aw-w-auto" style={{
        flex: 1,
        opacity: showDoc ? 1 : 0,
        transform: showDoc ? "translateX(0)" : "translateX(-20px)",
        transition: "all 0.5s ease",
        position: "relative",
      }}>
        <div style={{ ...S.card, padding: "1.1rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Partnership Agreement</div>
          <div style={{ ...S.serif, fontSize: "1rem", fontWeight: 700, color: DS.cream, lineHeight: 1.2 }}>Nike × Jordan Reeves<br /><span style={{ fontSize: "0.82rem", fontWeight: 400, fontStyle: "italic", color: "rgba(245,240,230,0.55)" }}>Summer Campaign 2026</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              { text: "Agreement between Nike Inc. and Jordan Reeves...", flag: false },
              { text: "Compensation: $85,000 USD upon delivery", flag: false },
              { text: "Exclusivity: 90-day clause — needs review", flag: true },
              { text: "Deliverables: 3 posts, 2 reels, 1 campaign video", flag: false },
              { text: "Payment terms: TBD — update required", flag: true },
              { text: "Usage rights — see Appendix A (missing)", flag: true },
            ].map((line, i) => (
              <div key={i} style={{
                fontSize: "0.65rem",
                color: line.flag ? DS.amber : "rgba(245,240,230,0.5)",
                background: line.flag ? "rgba(224,123,24,0.07)" : "transparent",
                borderLeft: line.flag ? "2px solid rgba(224,123,24,0.35)" : "none",
                paddingLeft: line.flag ? "0.5rem" : 0,
                borderRadius: line.flag ? "0 3px 3px 0" : 0,
                lineHeight: 1.55,
              }}>{line.text}</div>
            ))}
          </div>

          {/* Signed stamp */}
          {showStamp && (
            <div style={{
              position: "absolute",
              bottom: "1.25rem",
              right: "1.25rem",
              background: "rgba(74,222,128,0.1)",
              border: "2px solid rgba(74,222,128,0.55)",
              borderRadius: 8,
              padding: "0.5rem 0.9rem",
              transform: "rotate(-4deg)",
              animation: "aw-stamp-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
              zIndex: 10,
            }}>
              <div style={{ ...S.mono, fontSize: "0.78rem", color: DS.green, fontWeight: 600, letterSpacing: "0.08em" }}>SIGNED ✓</div>
              <ConfettiBurst show={showConfetti} x="50%" y="-10px" />
            </div>
          )}
        </div>
      </div>

      {/* Issues sidebar */}
      <div className="aw-w-auto" style={{
        width: "36%",
        flexShrink: 0,
        opacity: showSidebar ? 1 : 0,
        transform: showSidebar ? "translateX(0)" : "translateX(20px)",
        transition: "all 0.5s ease",
      }}>
        <div style={{ ...S.card, padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem" }}>🤖</span>
            <span style={{ ...S.mono, fontSize: "0.56rem", color: "rgba(245,240,230,0.55)", letterSpacing: "0.06em" }}>AI CONTRACT SCAN</span>
          </div>
          <div style={{ background: "rgba(224,123,24,0.08)", border: "0.5px solid rgba(224,123,24,0.3)", borderRadius: 6, padding: "0.5rem 0.7rem", ...S.mono, fontSize: "0.62rem", color: DS.amber }}>
            ⚠ 3 issues found
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", paddingBottom: i < 2 ? "0.5rem" : 0, borderBottom: i < 2 ? `0.5px solid ${DS.borderFaint}` : "none" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: resolved[i] ? "none" : "0.5px solid rgba(255,248,220,0.2)",
                  background: resolved[i] ? "rgba(74,222,128,0.18)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2,
                  animation: resolved[i] ? "aw-check-pop 0.4s ease" : "none",
                  transition: "background 0.3s ease",
                }}>
                  {resolved[i] && <span style={{ fontSize: "0.5rem", color: DS.green }}>✓</span>}
                  {!resolved[i] && <span style={{ fontSize: "0.5rem", color: DS.amber }}>!</span>}
                </div>
                <span style={{ fontSize: "0.64rem", color: resolved[i] ? "rgba(245,240,230,0.3)" : "rgba(245,240,230,0.65)", textDecoration: resolved[i] ? "line-through" : "none", lineHeight: 1.45, transition: "all 0.3s ease" }}>{issue}</span>
              </div>
            ))}
          </div>
          {resolved[2] && (
            <div style={{
              background: "rgba(74,222,128,0.07)",
              border: "0.5px solid rgba(74,222,128,0.3)",
              borderRadius: 6,
              padding: "0.5rem 0.7rem",
              ...S.mono,
              fontSize: "0.6rem",
              color: DS.green,
              animation: "aw-fade-in 0.4s ease",
            }}>
              ✓ All issues resolved — ready to sign
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCENE 7: Real-Time Analytics ─────────────────────────────────────────────
function Scene7({ active }) {
  const [barsReady, setBarsReady] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const timers = useRef([]);

  const revenueVal = useCounter(1200000, active, 400, 900);
  const dealsVal = useCounter(47, active, 600, 800);
  const roiVal = useCounter(340, active, 800, 800);
  const accuracyVal = useCounter(94, active, 1000, 700);

  const bars = [
    { h: 38, label: "Oct", active: false },
    { h: 52, label: "Nov", active: false },
    { h: 61, label: "Dec", active: false },
    { h: 48, label: "Jan", active: false },
    { h: 74, label: "Feb", active: false },
    { h: 100, label: "Mar", active: true },
  ];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) { setBarsReady(false); setShowNotif(false); setSparkles(false); return; }
    const ts = [
      setTimeout(() => setBarsReady(true), 250),
      setTimeout(() => setSparkles(true), 1400),
      setTimeout(() => setShowNotif(true), 2500),
    ];
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const kpis = [
    { label: "Revenue", value: `$${(revenueVal / 1000000).toFixed(2)}M` },
    { label: "Deals Closed", value: Math.round(dealsVal) },
    { label: "Avg ROI", value: `${Math.round(roiVal)}%` },
    { label: "Match Accuracy", value: `${Math.round(accuracyVal)}%` },
  ];

  return (
    <div className="aw-scene-inner" style={{ padding: "1.1rem 1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* KPI cards */}
      <div className="aw-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.6rem" }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} style={{
            ...S.card,
            padding: "0.75rem 0.85rem",
            opacity: barsReady ? 1 : 0,
            transform: barsReady ? "translateY(0)" : "translateY(10px)",
            transition: `all 0.4s ease ${i * 100}ms`,
          }}>
            <div style={{ ...S.mono, fontSize: "0.5rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ ...S.serif, fontSize: "1.2rem", fontWeight: 700, lineHeight: 1, ...S.goldText }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ ...S.card, padding: "0.85rem 1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Revenue — Last 6 Months</div>
          <div style={{ ...S.mono, fontSize: "0.55rem", color: DS.goldLight }}>↑ 34% MoM</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.55rem", flex: 1 }}>
          {bars.map((bar, i) => (
            <div key={bar.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                {/* Sparkles on highest bar */}
                {bar.active && sparkles && (
                  <>
                    <Sparkle x="-2px" y="-14px" delay={0} size={5} color={DS.gold} />
                    <Sparkle x="50%" y="-18px" delay={150} size={4} color={DS.amber} />
                    <Sparkle x="100%" y="-10px" delay={80} size={3} color={DS.goldLight} />
                  </>
                )}
                <div style={{
                  width: "100%",
                  height: `${bar.h}%`,
                  background: bar.active
                    ? `linear-gradient(180deg, ${DS.amber} 0%, ${DS.gold} 100%)`
                    : "rgba(255,248,220,0.08)",
                  borderRadius: "4px 4px 0 0",
                  transformOrigin: "bottom",
                  transform: barsReady ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.7s cubic-bezier(0.34,1.1,0.64,1) ${i * 80}ms`,
                  boxShadow: bar.active ? `0 0 14px rgba(224,123,24,0.4)` : "none",
                  position: "relative",
                }} />
              </div>
              <div style={{ ...S.mono, fontSize: "0.5rem", color: bar.active ? DS.goldLight : "rgba(245,240,230,0.3)" }}>{bar.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performer notification */}
      {showNotif && (
        <div style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "1rem",
          background: `linear-gradient(135deg, #232220, rgba(212,176,78,0.1))`,
          border: `0.5px solid ${DS.border}`,
          borderRadius: 10,
          padding: "0.7rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          animation: "aw-notification-in 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          zIndex: 20,
          maxWidth: "55%",
        }}>
          <span style={{ fontSize: "1.1rem" }}>🏆</span>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 500, color: DS.cream, marginBottom: 2 }}>Top Performer</div>
            <div style={{ ...S.mono, fontSize: "0.58rem", ...S.goldText }}>Jordan Reeves · $340K revenue</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCENE 8: Get Paid Securely ───────────────────────────────────────────────
function Scene8({ active }) {
  const [showInvoice, setShowInvoice] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [showAmount, setShowAmount] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timers = useRef([]);

  const paymentAmount = useCounter(85000, active, 2400, 700);

  const steps = ["Submitted", "Approved", "Payment Released"];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setShowInvoice(false); setProgressStep(0); setShowAmount(false);
      setShowSuccess(false); setShowConfetti(false);
      return;
    }
    const ts = [
      setTimeout(() => setShowInvoice(true), 200),
      setTimeout(() => setProgressStep(1), 1000),
      setTimeout(() => setProgressStep(2), 1700),
      setTimeout(() => setProgressStep(3), 2400),
      setTimeout(() => setShowAmount(true), 2500),
      setTimeout(() => setShowSuccess(true), 3200),
      setTimeout(() => setShowConfetti(true), 3300),
    ];
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="aw-scene-inner" style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
      {/* Invoice card */}
      <div style={{
        ...S.cardGold,
        padding: "1.25rem 1.5rem",
        width: "100%",
        maxWidth: 440,
        opacity: showInvoice ? 1 : 0,
        transform: showInvoice ? "translateY(0)" : "translateY(-16px)",
        transition: "all 0.5s cubic-bezier(0.34,1.1,0.64,1)",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Invoice #2026-0312</div>
            <div style={{ ...S.serif, fontSize: "1.05rem", fontWeight: 700, color: DS.cream }}>Nike × Jordan Reeves</div>
            <div style={{ ...S.mono, fontSize: "0.6rem", color: "rgba(245,240,230,0.45)", marginTop: 3 }}>Summer Campaign 2026 · 3 deliverables</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.06em" }}>AMOUNT</div>
            <div style={{ ...S.serif, fontSize: "1.6rem", fontWeight: 800, ...S.goldText, lineHeight: 1.1 }}>
              ${showAmount ? Math.round(paymentAmount).toLocaleString() : "0"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            {steps.map((step, i) => (
              <div key={step} style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: progressStep > i
                    ? `linear-gradient(135deg, ${DS.gold}, ${DS.amber})`
                    : "rgba(255,248,220,0.08)",
                  border: progressStep === i + 1
                    ? `2px solid ${DS.gold}`
                    : "none",
                  margin: "0 auto 4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.4s ease",
                  animation: progressStep === i + 1 ? "aw-pulse-glow 1s ease infinite" : "none",
                }}>
                  {progressStep > i && <span style={{ fontSize: "0.5rem", color: DS.bg }}>✓</span>}
                </div>
                <div style={{ ...S.mono, fontSize: "0.5rem", color: progressStep > i ? DS.goldLight : "rgba(245,240,230,0.3)", transition: "color 0.3s ease" }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: "rgba(255,248,220,0.07)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%",
              background: `linear-gradient(90deg, ${DS.gold}, ${DS.amber})`,
              borderRadius: 2,
              width: `${(progressStep / steps.length) * 100}%`,
              transition: "width 0.6s cubic-bezier(0.34,1.1,0.64,1)",
              boxShadow: `0 0 8px rgba(212,176,78,0.5)`,
            }} />
          </div>
        </div>

        {/* Escrow badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(245,240,230,0.04)", borderRadius: 6 }}>
          <span style={{ fontSize: "0.85rem" }}>🔒</span>
          <div>
            <div style={{ ...S.mono, fontSize: "0.58rem", color: "rgba(245,240,230,0.6)" }}>Escrow-protected payment</div>
            <div style={{ ...S.mono, fontSize: "0.52rem", color: "rgba(245,240,230,0.3)", marginTop: 2 }}>Funds held securely · Released on approval</div>
          </div>
        </div>
      </div>

      {/* Success state */}
      {showSuccess && (
        <div style={{
          background: `linear-gradient(135deg, #232220, rgba(74,222,128,0.1))`,
          border: "0.5px solid rgba(74,222,128,0.45)",
          borderRadius: 12,
          padding: "0.9rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.9rem",
          animation: "aw-scale-in 0.5s cubic-bezier(0.34,1.4,0.64,1) forwards",
          maxWidth: 440,
          width: "100%",
          position: "relative",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: DS.green }}>Payment Received ✓</div>
            <div style={{ ...S.mono, fontSize: "0.62rem", ...S.goldText, marginTop: 3 }}>$85,000 deposited · Nike Air Max Campaign</div>
          </div>
          <ConfettiBurst show={showConfetti} x="80%" y="50%" />
          <ConfettiBurst show={showConfetti} x="20%" y="50%" />
        </div>
      )}
    </div>
  );
}

// ─── SCENE CONFIG ─────────────────────────────────────────────────────────────
const SCENE_TABS = [
  { label: "Sign Up" },
  { label: "Connect" },
  { label: "AI Match" },
  { label: "Outreach" },
  { label: "Pipeline" },
  { label: "Contracts" },
  { label: "Analytics" },
  { label: "Get Paid" },
];

const SCENE_NARRATIONS = [
  "Pick your role. Choose your plan. Start for free.",
  "Connect your platforms. See your real stats verified instantly.",
  "Our AI analyzes 10 factors to find matches with 94% accuracy.",
  "AI writes personalized pitches. 68% response rate vs 12% cold email.",
  "Track every deal from pitch to payment in one pipeline.",
  "AI scans contracts for red flags. Sign with confidence.",
  "See your ROI in real time. Data-driven decisions, not guesswork.",
  "Escrow-protected payments. Get paid on time, every time.",
];

const SCENE_COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnimatedWalkthrough() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionState, setTransitionState] = useState("visible"); // "visible" | "out" | "in"
  const [elapsed, setElapsed] = useState(0);

  const sceneRef = useRef(0);
  const isPlayingRef = useRef(true);
  const intervalRef = useRef(null);
  const elapsedRef = useRef(null);
  const elapsedValRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
  }, []);

  const goToScene = useCallback((index) => {
    const target = ((index % TOTAL_SCENES) + TOTAL_SCENES) % TOTAL_SCENES;
    setTransitionState("out");
    setTimeout(() => {
      sceneRef.current = target;
      setCurrentScene(target);
      elapsedValRef.current = 0;
      setElapsed(0);
      setTransitionState("in");
      setTimeout(() => setTransitionState("visible"), 20);
    }, TRANSITION_MS);
  }, []);

  const advance = useCallback(() => {
    goToScene(sceneRef.current + 1);
  }, [goToScene]);

  const startPlayback = useCallback(() => {
    clearTimers();
    elapsedValRef.current = 0;
    setElapsed(0);

    elapsedRef.current = setInterval(() => {
      elapsedValRef.current = Math.min(elapsedValRef.current + TICK / SCENE_DURATION, 1);
      setElapsed(elapsedValRef.current);
    }, TICK);

    intervalRef.current = setInterval(() => {
      if (isPlayingRef.current) {
        advance();
        elapsedValRef.current = 0;
        setElapsed(0);
      }
    }, SCENE_DURATION);
  }, [clearTimers, advance]);

  useEffect(() => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    startPlayback();
    return clearTimers;
  }, []);

  const handleToggle = useCallback(() => {
    if (isPlayingRef.current) {
      clearTimers();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      startPlayback();
    }
  }, [clearTimers, startPlayback]);

  const handleTabClick = useCallback((i) => {
    clearTimers();
    goToScene(i);
    if (isPlayingRef.current) {
      // Restart playback from the new scene
      setTimeout(() => {
        elapsedValRef.current = 0;
        setElapsed(0);
        elapsedRef.current = setInterval(() => {
          elapsedValRef.current = Math.min(elapsedValRef.current + TICK / SCENE_DURATION, 1);
          setElapsed(elapsedValRef.current);
        }, TICK);
        intervalRef.current = setInterval(() => {
          if (isPlayingRef.current) {
            advance();
            elapsedValRef.current = 0;
            setElapsed(0);
          }
        }, SCENE_DURATION);
      }, TRANSITION_MS + 50);
    }
  }, [clearTimers, goToScene, advance]);

  const handlePrev = useCallback(() => {
    clearTimers();
    goToScene(sceneRef.current - 1);
    if (isPlayingRef.current) {
      setTimeout(() => {
        startPlayback();
      }, TRANSITION_MS + 50);
    }
  }, [clearTimers, goToScene, startPlayback]);

  const handleNext = useCallback(() => {
    clearTimers();
    goToScene(sceneRef.current + 1);
    if (isPlayingRef.current) {
      setTimeout(() => {
        startPlayback();
      }, TRANSITION_MS + 50);
    }
  }, [clearTimers, goToScene, startPlayback]);

  const globalProgress = (currentScene + elapsed) / TOTAL_SCENES;
  const SceneComponent = SCENE_COMPONENTS[currentScene];
  const isVisible = transitionState === "visible" || transitionState === "in";

  return (
    <>
      <style>{STYLES}</style>
      <div className="aw-container" style={S.container}>

        {/* Radial background glow */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 100%, rgba(212,176,78,0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* ── Top bar: tabs + narration ── */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, rgba(8,8,7,0.97) 70%, transparent)",
          padding: "0.6rem 1rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {/* Scene tabs */}
          <div className="aw-tab-bar" style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            {SCENE_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={(e) => { e.stopPropagation(); handleTabClick(i); }}
                style={{
                  ...S.mono,
                  fontSize: "0.52rem",
                  letterSpacing: "0.04em",
                  padding: "0.22rem 0.55rem",
                  borderRadius: 100,
                  border: "none",
                  cursor: "pointer",
                  background: i === currentScene
                    ? "linear-gradient(135deg, #d4b04e, #e07b18)"
                    : "rgba(255,248,220,0.05)",
                  color: i === currentScene ? DS.bg : "rgba(245,240,230,0.4)",
                  fontWeight: i === currentScene ? 600 : 400,
                  transition: "all 0.3s ease",
                  outline: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {i + 1}. {tab.label}
              </button>
            ))}
          </div>

          {/* Narration + dots (mobile fallback) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            {/* Dots (mobile only visible) */}
            <div style={{ display: "flex", gap: "0.28rem", flexShrink: 0 }}>
              {SCENE_TABS.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleTabClick(i); }}
                  style={{
                    width: i === currentScene ? 18 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === currentScene
                      ? `linear-gradient(90deg, ${DS.gold}, ${DS.amber})`
                      : "rgba(255,248,220,0.15)",
                    transition: "width 0.3s ease, background 0.3s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <p
              className="aw-narration-text"
              style={{
                ...S.narration,
                margin: 0,
                fontSize: "0.88rem",
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.35s ease",
              }}
            >
              {SCENE_NARRATIONS[currentScene]}
            </p>
          </div>
        </div>

        {/* ── Scene content ── */}
        <div
          className={
            transitionState === "out"
              ? "aw-scene-transition-out"
              : transitionState === "in"
              ? "aw-scene-transition-in"
              : ""
          }
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: "5.5rem",
            zIndex: 2,
          }}
        >
          <SceneComponent active={isVisible} />
        </div>

        {/* ── Bottom controls ── */}
        <div style={{
          position: "absolute",
          bottom: "0.7rem",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0 1rem",
          zIndex: 10,
        }}>
          {/* Prev button */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            style={{
              background: "rgba(10,10,9,0.7)",
              border: `0.5px solid rgba(255,248,220,0.1)`,
              borderRadius: 100,
              padding: "0.28rem 0.6rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              backdropFilter: "blur(8px)",
              outline: "none",
              flexShrink: 0,
            }}
            title="Previous scene"
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
              <path d="M7 1L1 5l6 4V1z" fill={DS.goldLight} />
            </svg>
            <span className="aw-nav-btn-label" style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.45)", letterSpacing: "0.04em" }}>Prev</span>
          </button>

          {/* Play/pause */}
          <button
            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            style={{
              background: "rgba(10,10,9,0.7)",
              border: `0.5px solid rgba(255,248,220,0.1)`,
              borderRadius: 100,
              padding: "0.28rem 0.65rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              backdropFilter: "blur(8px)",
              outline: "none",
              flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <>
                <div style={{ display: "flex", gap: "2px" }}>
                  <div style={{ width: 2.5, height: 9, background: DS.goldLight, borderRadius: 1 }} />
                  <div style={{ width: 2.5, height: 9, background: DS.goldLight, borderRadius: 1 }} />
                </div>
                <span className="aw-nav-btn-label" style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.45)", letterSpacing: "0.04em" }}>Pause</span>
              </>
            ) : (
              <>
                <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                  <path d="M1 1l7 4-7 4V1z" fill={DS.goldLight} />
                </svg>
                <span className="aw-nav-btn-label" style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.45)", letterSpacing: "0.04em" }}>Play</span>
              </>
            )}
          </button>

          {/* Progress bar (flex 1) */}
          <div
            style={{
              flex: 1,
              height: 4,
              background: "rgba(255,248,220,0.07)",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              height: "100%",
              width: `${globalProgress * 100}%`,
              background: `linear-gradient(90deg, ${DS.gold} 0%, ${DS.amber} 100%)`,
              borderRadius: 2,
              transition: `width ${TICK}ms linear`,
              boxShadow: `0 0 6px rgba(224,123,24,0.35)`,
            }} />
          </div>

          {/* Scene counter */}
          <div style={{
            ...S.mono,
            fontSize: "0.55rem",
            color: "rgba(245,240,230,0.35)",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}>
            {currentScene + 1}/{TOTAL_SCENES}
          </div>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            style={{
              background: "rgba(10,10,9,0.7)",
              border: `0.5px solid rgba(255,248,220,0.1)`,
              borderRadius: 100,
              padding: "0.28rem 0.6rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              backdropFilter: "blur(8px)",
              outline: "none",
              flexShrink: 0,
            }}
            title="Next scene"
          >
            <span className="aw-nav-btn-label" style={{ ...S.mono, fontSize: "0.55rem", color: "rgba(245,240,230,0.45)", letterSpacing: "0.04em" }}>Next</span>
            <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
              <path d="M1 1l6 4-6 4V1z" fill={DS.goldLight} />
            </svg>
          </button>
        </div>

      </div>
    </>
  );
}

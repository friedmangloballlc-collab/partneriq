/**
 * OnboardingWizard — full-screen modal wizard shown on the Dashboard
 * for users who have not yet completed onboarding.
 *
 * Steps:
 *   0 → "Complete Your Profile"
 *   1 → "Connect Your Accounts"
 *   2 → "Set Your Preferences"
 *   3 → "You're all set!"
 *
 * Props:
 *   user           - current user object (from base44.auth.me())
 *   onboardingStep - integer (0–4), initial step from user profile
 *   onComplete     - callback invoked when wizard is completed or dismissed
 *   onSkip         - optional callback for the X dismiss button (falls back to onComplete)
 */
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Music2,
  Mic2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  MapPin,
  Camera,
  ExternalLink,
  BarChart2,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { createPageUrl } from "@/utils";

// ─── Design tokens ────────────────────────────────────────────────────────────

const DS = {
  bg: "#080807",
  bgCard: "#0f0f0d",
  bgMuted: "#151513",
  border: "rgba(196,162,74,0.18)",
  borderHover: "rgba(196,162,74,0.45)",
  gold: "#c4a24a",
  goldLight: "#d4b86a",
  goldDim: "rgba(196,162,74,0.12)",
  amber: "#e07b18",
  amberDim: "rgba(224,123,24,0.12)",
  cream: "#f5f0e6",
  creamDim: "rgba(245,240,230,0.55)",
  creamMuted: "rgba(245,240,230,0.35)",
  success: "#4ade80",
  fontSerif: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'Instrument Sans', system-ui, sans-serif",
  fontMono: "'Instrument Mono', 'Fira Mono', monospace",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const SOCIAL_PLATFORMS = [
  { key: "instagram",  label: "Instagram",  Icon: Instagram, gradient: "linear-gradient(135deg,#f43f5e,#ec4899)" },
  { key: "tiktok",     label: "TikTok",     Icon: Music2,    gradient: "linear-gradient(135deg,#1c1c1c,#3f3f46)" },
  { key: "youtube",    label: "YouTube",    Icon: Youtube,   gradient: "linear-gradient(135deg,#ef4444,#dc2626)" },
  { key: "twitter",    label: "Twitter / X",Icon: Twitter,   gradient: "linear-gradient(135deg,#0ea5e9,#2563eb)" },
  { key: "spotify",    label: "Spotify",    Icon: Mic2,      gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
  { key: "linkedin",   label: "LinkedIn",   Icon: Linkedin,  gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)" },
];

const TALENT_INTERESTS = ["Fashion","Tech","Sports","Food","Beauty","Finance","Entertainment","Health"];
const BRAND_TALENT     = ["Athletes","Creators","Musicians","Speakers","Models","Actors","Podcasters","Chefs"];
const AGENCY_FOCUS     = ["Talent Management","Brand Partnerships","Campaign Execution","Full Service"];

const BUDGET_OPTIONS = [
  { label: "Under $5K",        value: "under_5k" },
  { label: "$5K – $25K",       value: "5k_25k" },
  { label: "$25K – $100K",     value: "25k_100k" },
  { label: "$100K – $500K",    value: "100k_500k" },
  { label: "$500K+",           value: "500k_plus" },
];

// ─── Confetti ─────────────────────────────────────────────────────────────────

function ConfettiPiece({ index }) {
  const colors  = [DS.gold, DS.goldLight, DS.amber, DS.cream, "#fff8e7"];
  const color   = colors[index % colors.length];
  const size    = 6 + (index % 5) * 2;
  const left    = `${(index * 7.3) % 100}%`;
  const delay   = `${(index * 0.13) % 1.4}s`;
  const dur     = `${1.8 + (index % 4) * 0.4}s`;
  const isCircle = index % 3 === 0;

  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "-20px",
        left,
        width: size,
        height: isCircle ? size : size * 0.5,
        borderRadius: isCircle ? "50%" : "2px",
        background: color,
        animation: `confettiFall ${dur} ${delay} ease-in forwards`,
        transform: `rotate(${index * 37}deg)`,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}

const confettiKeyframes = `
@keyframes confettiFall {
  0%   { transform: translateY(0)   rotate(0deg)   scale(1);   opacity: 1; }
  60%  { opacity: 1; }
  100% { transform: translateY(320px) rotate(720deg) scale(0.6); opacity: 0; }
}
@keyframes sparkleFloat {
  0%,100% { transform: translateY(0)   scale(1);   opacity: 0.7; }
  50%      { transform: translateY(-8px) scale(1.2); opacity: 1; }
}
@keyframes wizardFadeIn {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes stepSlideIn {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
`;

// ─── Shared sub-components ────────────────────────────────────────────────────

function TagButton({ label, selected, onClick, accentColor = DS.gold }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "999px",
        fontSize: "12px",
        fontFamily: DS.fontBody,
        fontWeight: 500,
        letterSpacing: "0.02em",
        border: `1px solid ${selected ? accentColor : DS.border}`,
        background: selected ? `${accentColor}18` : "transparent",
        color: selected ? accentColor : DS.creamDim,
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = DS.borderHover;
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = DS.border;
      }}
    >
      {selected && <Check size={11} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: DS.fontMono,
      fontSize: "10px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: DS.gold,
      marginBottom: "10px",
    }}>
      {children}
    </p>
  );
}

function SkipLink({ onClick, label = "Skip for now" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: DS.creamMuted,
        fontSize: "13px",
        fontFamily: DS.fontBody,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 0",
        outline: "none",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = DS.creamDim)}
      onMouseLeave={(e) => (e.currentTarget.style.color = DS.creamMuted)}
    >
      <SkipForward size={13} />
      {label}
    </button>
  );
}

function GoldButton({ onClick, disabled, children, variant = "primary" }) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 22px",
        borderRadius: "8px",
        fontFamily: DS.fontBody,
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        border: `1px solid ${isPrimary ? DS.gold : DS.border}`,
        background: isPrimary ? `linear-gradient(135deg, ${DS.gold}, ${DS.amber})` : "transparent",
        color: isPrimary ? DS.bg : DS.creamDim,
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        boxShadow: isPrimary ? `0 0 18px rgba(196,162,74,0.22)` : "none",
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 16px",
        borderRadius: "8px",
        fontFamily: DS.fontBody,
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        border: `1px solid ${DS.border}`,
        background: "transparent",
        color: DS.creamDim,
        transition: "all 0.15s ease",
        outline: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = DS.borderHover)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = DS.border)}
    >
      {children}
    </button>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? "24px" : "7px",
            height: "7px",
            borderRadius: "999px",
            background: i < current
              ? DS.gold
              : i === current
              ? `linear-gradient(90deg, ${DS.gold}, ${DS.amber})`
              : DS.border,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Complete Your Profile ───────────────────────────────────────────

function StepProfile({ user, data, onChange, onNext, onSkip }) {
  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div style={{ animation: "stepSlideIn 0.28s ease both" }}>
      {/* Welcome heading */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: DS.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: DS.amber, marginBottom: "8px" }}>
          Step 1 of 4
        </p>
        <h2 style={{ fontFamily: DS.fontSerif, fontSize: "32px", fontWeight: 600, color: DS.cream, lineHeight: 1.15, margin: 0 }}>
          Welcome, {firstName}
        </h2>
        <p style={{ fontFamily: DS.fontBody, fontSize: "14px", color: DS.creamMuted, marginTop: "8px" }}>
          Let's set up your profile so partners know exactly who you are.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Photo upload placeholder */}
        <div>
          <SectionLabel>Profile Photo</SectionLabel>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: `2px dashed ${DS.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              cursor: "pointer",
              background: DS.goldDim,
              transition: "border-color 0.15s",
            }}
            title="Upload photo"
          >
            <Camera size={20} color={DS.gold} />
            <span style={{ fontFamily: DS.fontMono, fontSize: "9px", color: DS.creamMuted, letterSpacing: "0.08em" }}>UPLOAD</span>
          </div>
        </div>

        {/* Bio */}
        <div>
          <SectionLabel>Bio</SectionLabel>
          <textarea
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Tell partners who you are and what you do best…"
            maxLength={400}
            rows={3}
            style={{
              width: "100%",
              background: DS.bgMuted,
              border: `1px solid ${DS.border}`,
              borderRadius: "8px",
              padding: "12px 14px",
              fontFamily: DS.fontBody,
              fontSize: "14px",
              color: DS.cream,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = DS.gold)}
            onBlur={(e) => (e.target.style.borderColor = DS.border)}
          />
          <p style={{ fontFamily: DS.fontMono, fontSize: "10px", color: DS.creamMuted, textAlign: "right", marginTop: "4px" }}>
            {data.bio.length}/400
          </p>
        </div>

        {/* Location */}
        <div>
          <SectionLabel>Location</SectionLabel>
          <div style={{ position: "relative" }}>
            <MapPin size={15} color={DS.creamMuted} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="City, Country"
              style={{
                width: "100%",
                background: DS.bgMuted,
                border: `1px solid ${DS.border}`,
                borderRadius: "8px",
                padding: "11px 14px 11px 38px",
                fontFamily: DS.fontBody,
                fontSize: "14px",
                color: DS.cream,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = DS.gold)}
              onBlur={(e) => (e.target.style.borderColor = DS.border)}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        <SkipLink onClick={onSkip} />
        <GoldButton onClick={onNext}>
          Continue <ChevronRight size={16} />
        </GoldButton>
      </div>
    </div>
  );
}

// ─── Step 2: Connect Your Accounts ───────────────────────────────────────────

function StepConnect({ connectedAccounts, onNext, onPrev, onSkip }) {
  return (
    <div style={{ animation: "stepSlideIn 0.28s ease both" }}>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontFamily: DS.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: DS.amber, marginBottom: "8px" }}>
          Step 2 of 4
        </p>
        <h2 style={{ fontFamily: DS.fontSerif, fontSize: "30px", fontWeight: 600, color: DS.cream, lineHeight: 1.2, margin: 0 }}>
          Connect Your Accounts
        </h2>
        <p style={{ fontFamily: DS.fontBody, fontSize: "14px", color: DS.creamMuted, marginTop: "8px" }}>
          Linking accounts verifies your reach and boosts your match score by up to 5%.
        </p>
      </div>

      {/* Platform grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {SOCIAL_PLATFORMS.map(({ key, label, Icon, gradient }) => {
          const connected = connectedAccounts?.includes(key);
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: `1px solid ${connected ? DS.goldLight + "55" : DS.border}`,
                background: connected ? DS.goldDim : DS.bgMuted,
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={16} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: DS.fontBody, fontSize: "13px", fontWeight: 600, color: DS.cream, margin: 0, truncate: true }}>{label}</p>
                {connected ? (
                  <p style={{ fontFamily: DS.fontMono, fontSize: "10px", color: DS.success, margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Check size={10} /> Connected
                  </p>
                ) : (
                  <Link
                    to={createPageUrl("ConnectAccounts")}
                    style={{
                      fontFamily: DS.fontMono,
                      fontSize: "10px",
                      color: DS.gold,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    Connect <ExternalLink size={9} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Boost note */}
      <div style={{
        padding: "12px 16px",
        borderRadius: "8px",
        background: DS.amberDim,
        border: `1px solid ${DS.amber}33`,
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        marginBottom: "8px",
      }}>
        <Zap size={14} color={DS.amber} style={{ marginTop: "2px", flexShrink: 0 }} />
        <p style={{ fontFamily: DS.fontBody, fontSize: "13px", color: DS.creamDim, margin: 0, lineHeight: 1.5 }}>
          Connecting accounts verifies your stats and boosts your match score by up to <strong style={{ color: DS.amber }}>5%</strong>
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <OutlineButton onClick={onPrev}><ChevronLeft size={15} /> Back</OutlineButton>
          <SkipLink onClick={onSkip} />
        </div>
        <GoldButton onClick={onNext}>
          Continue <ChevronRight size={16} />
        </GoldButton>
      </div>
    </div>
  );
}

// ─── Step 3: Set Your Preferences ────────────────────────────────────────────

function StepPreferences({ user, data, onChange, onNext, onPrev, onSkip }) {
  const role = user?.role || "talent";

  const checkboxItems = role === "talent"
    ? TALENT_INTERESTS
    : role === "brand"
    ? BRAND_TALENT
    : AGENCY_FOCUS;

  const questionLabel = role === "talent"
    ? "What types of brands are you interested in?"
    : role === "brand"
    ? "What types of talent are you looking for?"
    : "What's your agency's focus?";

  const toggle = (item) => {
    const prev = data.preferences || [];
    onChange({
      preferences: prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    });
  };

  return (
    <div style={{ animation: "stepSlideIn 0.28s ease both" }}>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontFamily: DS.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: DS.amber, marginBottom: "8px" }}>
          Step 3 of 4
        </p>
        <h2 style={{ fontFamily: DS.fontSerif, fontSize: "30px", fontWeight: 600, color: DS.cream, lineHeight: 1.2, margin: 0 }}>
          Set Your Preferences
        </h2>
        <p style={{ fontFamily: DS.fontBody, fontSize: "14px", color: DS.creamMuted, marginTop: "8px" }}>
          Help the AI surface the most relevant matches for you.
        </p>
      </div>

      {/* Checkboxes */}
      <div style={{ marginBottom: "28px" }}>
        <SectionLabel>{questionLabel}</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {checkboxItems.map((item) => (
            <TagButton
              key={item}
              label={item}
              selected={(data.preferences || []).includes(item)}
              onClick={() => toggle(item)}
            />
          ))}
        </div>
      </div>

      {/* Budget range */}
      <div>
        <SectionLabel>Budget Range</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {BUDGET_OPTIONS.map((opt) => (
            <TagButton
              key={opt.value}
              label={opt.label}
              selected={data.budget === opt.value}
              onClick={() => onChange({ budget: opt.value })}
              accentColor={DS.amber}
            />
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <OutlineButton onClick={onPrev}><ChevronLeft size={15} /> Back</OutlineButton>
          <SkipLink onClick={onSkip} />
        </div>
        <GoldButton onClick={onNext}>
          Continue <ChevronRight size={16} />
        </GoldButton>
      </div>
    </div>
  );
}

// ─── Step 4: You're All Set ───────────────────────────────────────────────────

function StepComplete({ onFinish, onPrev, saving }) {
  const CONFETTI_COUNT = 28;

  const quickLinks = [
    {
      label: "Browse the Marketplace",
      desc: "Discover live partnership opportunities",
      to: createPageUrl("Marketplace"),
      Icon: ShoppingBag,
    },
    {
      label: "View AI Matches",
      desc: "See your personalised partner recommendations",
      to: createPageUrl("MatchEngine"),
      Icon: Sparkles,
    },
    {
      label: "Explore Analytics",
      desc: "Track performance and deal outcomes",
      to: createPageUrl("Analytics"),
      Icon: BarChart2,
    },
  ];

  return (
    <div style={{ animation: "stepSlideIn 0.28s ease both", textAlign: "center" }}>
      {/* Confetti burst */}
      <div style={{ position: "relative", height: "64px", marginBottom: "8px", overflow: "visible" }}>
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
        {/* Sparkle icon */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "0",
          transform: "translateX(-50%)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${DS.goldDim} 0%, transparent 70%)`,
          border: `1px solid ${DS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "sparkleFloat 2.2s ease-in-out infinite",
        }}>
          <Sparkles size={26} color={DS.gold} />
        </div>
      </div>

      {/* Heading */}
      <h2 style={{ fontFamily: DS.fontSerif, fontSize: "34px", fontWeight: 600, color: DS.cream, margin: "16px 0 8px" }}>
        You're all set!
      </h2>
      <p style={{ fontFamily: DS.fontBody, fontSize: "14px", color: DS.creamMuted, marginBottom: "28px" }}>
        Your Dealstage dashboard is ready. Here's where to begin:
      </p>

      {/* Quick-start cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", textAlign: "left" }}>
        {quickLinks.map(({ label, desc, to, Icon }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 16px",
              borderRadius: "10px",
              border: `1px solid ${DS.border}`,
              background: DS.bgMuted,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DS.borderHover;
              e.currentTarget.style.background = DS.goldDim;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DS.border;
              e.currentTarget.style.background = DS.bgMuted;
            }}
          >
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: DS.goldDim,
              border: `1px solid ${DS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon size={17} color={DS.gold} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: DS.fontBody, fontSize: "14px", fontWeight: 600, color: DS.cream, margin: 0 }}>{label}</p>
              <p style={{ fontFamily: DS.fontBody, fontSize: "12px", color: DS.creamMuted, margin: 0 }}>{desc}</p>
            </div>
            <ArrowRight size={15} color={DS.creamMuted} />
          </Link>
        ))}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <OutlineButton onClick={onPrev}><ChevronLeft size={15} /> Back</OutlineButton>
        <GoldButton onClick={onFinish} disabled={saving}>
          {saving
            ? <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(8,8,7,0.3)", borderTopColor: DS.bg, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Saving…</>
            : <>Go to Dashboard <ChevronRight size={16} /></>
          }
        </GoldButton>
      </div>
    </div>
  );
}

// ─── Main: OnboardingWizard ───────────────────────────────────────────────────

export default function OnboardingWizard({ user, onboardingStep = 0, onComplete, onSkip }) {
  const initialStep = onboardingStep > 0 ? Math.min(onboardingStep, TOTAL_STEPS - 1) : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);

  // Shared form state across steps
  const [profileData, setProfileData] = useState({ bio: "", location: "" });
  const [prefData, setPrefData]       = useState({ preferences: [], budget: "" });

  // Merge partial updates into the relevant state slice
  const updateProfile = useCallback((patch) => setProfileData((p) => ({ ...p, ...patch })), []);
  const updatePref    = useCallback((patch) => setPrefData((p) => ({ ...p, ...patch })), []);

  // Persist current step to DB (non-blocking)
  const persistStep = useCallback(async (step) => {
    try {
      await base44.auth.updateMe({ onboarding_step: step });
    } catch {
      // non-blocking
    }
  }, []);

  const handleNext = useCallback(() => {
    const next = currentStep + 1;
    persistStep(next);
    setCurrentStep(next);
  }, [currentStep, persistStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // Skip advances to next step
  const handleSkip = useCallback(() => {
    const next = currentStep + 1;
    persistStep(next);
    setCurrentStep(Math.min(next, TOTAL_STEPS - 1));
  }, [currentStep, persistStep]);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        onboarding_step: TOTAL_STEPS,
        bio: profileData.bio || undefined,
        location: profileData.location || undefined,
        preferences: prefData.preferences.length ? prefData.preferences : undefined,
        budget_range: prefData.budget || undefined,
      });
    } catch {
      // proceed anyway
    } finally {
      setSaving(false);
      if (onComplete) onComplete();
    }
  }, [profileData, prefData, onComplete]);

  const handleDismiss = useCallback(() => {
    const cb = onSkip || onComplete;
    if (cb) cb();
  }, [onSkip, onComplete]);

  // Inject keyframes once
  const injectedRef = useRef(false);
  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;
    const style = document.createElement("style");
    style.textContent = confettiKeyframes + `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  // Lock body scroll while wizard is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Connected accounts — read from user object if available
  const connectedAccounts = user?.connected_accounts || [];

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(8,8,7,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "overlayFadeIn 0.3s ease both",
        }}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Onboarding wizard"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: DS.bgCard,
            border: `1px solid ${DS.border}`,
            borderRadius: "16px",
            padding: "32px 32px 28px",
            position: "relative",
            boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${DS.border}`,
            animation: "wizardFadeIn 0.32s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Dismiss (X) button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close onboarding wizard"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "30px",
              height: "30px",
              borderRadius: "6px",
              border: `1px solid ${DS.border}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.creamMuted,
              transition: "all 0.15s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DS.borderHover;
              e.currentTarget.style.color = DS.cream;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DS.border;
              e.currentTarget.style.color = DS.creamMuted;
            }}
          >
            <X size={14} />
          </button>

          {/* Progress dots */}
          <div style={{ marginBottom: "28px" }}>
            <ProgressDots current={currentStep} total={TOTAL_STEPS} />
          </div>

          {/* Step content */}
          {currentStep === 0 && (
            <StepProfile
              user={user}
              data={profileData}
              onChange={updateProfile}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 1 && (
            <StepConnect
              connectedAccounts={connectedAccounts}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && (
            <StepPreferences
              user={user}
              data={prefData}
              onChange={updatePref}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && (
            <StepComplete
              onFinish={handleFinish}
              onPrev={handlePrev}
              saving={saving}
            />
          )}

          {/* Bottom gold rule */}
          <div style={{
            marginTop: "20px",
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${DS.border}, transparent)`,
          }} />
        </div>
      </div>
    </>
  );
}

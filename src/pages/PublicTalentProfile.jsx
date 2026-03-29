import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import SEO from "@/components/SEO";
import {
  Instagram,
  Youtube,
  Globe,
  MapPin,
  CheckCircle,
  Users,
  TrendingUp,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────
   THEME — Pearl / Cream (light, public-facing)
───────────────────────────────────────────── */
const T = {
  bg:       "#faf8f3",
  bgCard:   "#ffffff",
  bgMuted:  "#f2ede3",
  gold:     "#c9a84c",
  goldDark: "#a07828",
  amber:    "#d97316",
  text:     "#1a1814",
  textMid:  "#4a4540",
  textDim:  "#8a847a",
  border:   "rgba(160,120,40,0.15)",
  borderAlt:"rgba(160,120,40,0.08)",
  verified: "#16a34a",
};

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans  = { fontFamily: "'Instrument Sans', system-ui, sans-serif" };
const mono  = { fontFamily: "'Instrument Mono', 'Courier New', monospace" };

/* ─────────────────────────────────────────────
   PLATFORM ICON MAP
───────────────────────────────────────────── */
const PLATFORM_CONFIG = {
  instagram:  { label: "Instagram",  color: "#e1306c", Icon: Instagram },
  youtube:    { label: "YouTube",    color: "#ff0000", Icon: Youtube },
  tiktok:     { label: "TikTok",     color: "#010101", Icon: Globe },
  twitter:    { label: "X / Twitter",color: "#000000", Icon: Globe },
  x:          { label: "X / Twitter",color: "#000000", Icon: Globe },
  twitch:     { label: "Twitch",     color: "#9146ff", Icon: Globe },
  linkedin:   { label: "LinkedIn",   color: "#0077b5", Icon: Globe },
  podcast:    { label: "Podcast",    color: "#9333ea", Icon: Globe },
  website:    { label: "Website",    color: T.gold,    Icon: Globe },
};

function formatFollowers(n) {
  if (!n) return "–";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
function Avatar({ src, name, size = 100 }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `3px solid ${T.border}` }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      ...sans, fontSize: size * 0.34, fontWeight: 700, color: "#fff",
      border: `3px solid rgba(201,168,76,0.3)`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, #ede8df 25%, #e5dfd4 50%, #ede8df 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      ...style,
    }} />
  );
}

/* ─────────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────────── */
function NotFound() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ ...mono, fontSize: 64, marginBottom: 20, opacity: 0.4 }}>?</div>
      <h1 style={{ ...serif, fontSize: 32, fontWeight: 700, color: T.text, marginBottom: 12 }}>Profile not found</h1>
      <p style={{ ...sans, fontSize: 16, color: T.textDim, marginBottom: 32, textAlign: "center", maxWidth: 380 }}>
        This talent profile doesn't exist or hasn't been published yet.
      </p>
      <Link
        to="/Onboarding"
        style={{ ...sans, fontSize: 14, fontWeight: 600, color: "#fff", background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "12px 24px", borderRadius: 8 }}
      >
        Create your profile
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function PublicTalentProfile() {
  const { handle } = useParams();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) { setNotFound(true); setLoading(false); return; }
    supabase
      .from("talents")
      .select("*")
      .eq("invite_code", handle)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setTalent(data);
        }
        setLoading(false);
      });
  }, [handle]);

  if (notFound) return <NotFound />;

  const name           = talent?.name || talent?.full_name || talent?.display_name || "—";
  const bio            = talent?.bio || talent?.description || "";
  const category       = talent?.category || talent?.talent_type || "";
  const location       = talent?.location || talent?.city || "";
  const photoUrl       = talent?.avatar_url || talent?.profile_image || talent?.photo_url || null;
  const isVerified     = talent?.id_verified || talent?.verified || false;
  const totalFollowers = talent?.total_followers || talent?.follower_count || 0;
  const engagementRate = talent?.engagement_rate || talent?.avg_engagement || null;
  const platforms      = talent?.platforms || talent?.social_links || {};
  const platformsCount = Object.keys(platforms).filter(k => platforms[k]).length;

  const engDisplay = engagementRate
    ? typeof engagementRate === "number"
      ? `${engagementRate.toFixed(1)}%`
      : `${engagementRate}`
    : null;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>
      <SEO
        title={loading ? "Talent Profile" : name}
        description={loading ? "" : `${name}${category ? ` · ${category}` : ""}${bio ? ` — ${bio.slice(0, 120)}` : ""}. Connect on DealStage.`}
      />
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(201,168,76,0.25); }
        a { color: inherit; }
        @media (max-width: 600px) {
          .ptp-header { flex-direction: column !important; align-items: flex-start !important; }
          .ptp-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .ptp-social { flex-direction: column !important; }
        }
      `}</style>

      {/* HEADER BAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,248,243,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ ...serif, fontSize: 17, fontWeight: 700, color: T.gold, textDecoration: "none", letterSpacing: "0.04em" }}>Dealstage</Link>
        <Link
          to="/Onboarding"
          style={{ ...sans, fontSize: 13, fontWeight: 600, color: "#fff", background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, textDecoration: "none", padding: "7px 16px", borderRadius: 6 }}
        >
          Join free
        </Link>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* PROFILE HEADER */}
        <div className="ptp-header" style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 36 }}>
          {loading ? (
            <Skeleton w={100} h={100} radius={50} />
          ) : (
            <Avatar src={photoUrl} name={name} size={100} />
          )}
          <div style={{ flex: 1 }}>
            {loading ? (
              <>
                <Skeleton w="60%" h={28} radius={6} style={{ marginBottom: 10 }} />
                <Skeleton w="40%" h={16} radius={4} style={{ marginBottom: 10 }} />
                <Skeleton w="30%" h={14} radius={4} />
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <h1 style={{ ...serif, fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{name}</h1>
                  {isVerified && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 20, padding: "3px 10px" }}>
                      <CheckCircle size={13} style={{ color: T.verified }} />
                      <span style={{ ...mono, fontSize: 10, color: T.verified, letterSpacing: "0.08em" }}>VERIFIED</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  {category && (
                    <span style={{ ...mono, fontSize: 11, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>{category}</span>
                  )}
                  {location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, ...sans, fontSize: 13, color: T.textDim }}>
                      <MapPin size={13} style={{ color: T.textDim }} />
                      {location}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* BIO */}
        {loading ? (
          <div style={{ marginBottom: 36 }}>
            <Skeleton w="100%" h={14} radius={4} style={{ marginBottom: 8 }} />
            <Skeleton w="90%" h={14} radius={4} style={{ marginBottom: 8 }} />
            <Skeleton w="70%" h={14} radius={4} />
          </div>
        ) : bio ? (
          <p style={{ ...sans, fontSize: 15, color: T.textMid, lineHeight: 1.75, marginBottom: 36, maxWidth: 600 }}>{bio}</p>
        ) : null}

        {/* STATS */}
        <div className="ptp-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { Icon: Users, label: "Total Followers", value: loading ? null : formatFollowers(totalFollowers) },
            { Icon: TrendingUp, label: "Avg. Engagement", value: loading ? null : (engDisplay || "—") },
            { Icon: Layers, label: "Platforms", value: loading ? null : (platformsCount > 0 ? platformsCount : "—") },
          ].map(({ Icon, label, value }, i) => (
            <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 18px", textAlign: "center" }}>
              <Icon size={20} style={{ color: T.gold, marginBottom: 8 }} />
              {loading ? (
                <Skeleton w="60%" h={22} radius={4} style={{ margin: "0 auto 6px" }} />
              ) : (
                <div style={{ ...serif, fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 4 }}>{value}</div>
              )}
              <div style={{ ...mono, fontSize: 10, color: T.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* SOCIAL LINKS */}
        {!loading && platformsCount > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ ...mono, fontSize: 11, color: T.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Platforms</h2>
            <div className="ptp-social" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {Object.entries(platforms).filter(([, v]) => v).map(([key, url]) => {
                const config = PLATFORM_CONFIG[key.toLowerCase()] || { label: key, color: T.gold, Icon: Globe };
                const { Icon: PlatformIcon, label: platformLabel, color } = config;
                const href = url.startsWith("http") ? url : `https://${url}`;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 16px",
                      borderRadius: 8,
                      background: T.bgCard,
                      border: `1px solid ${T.border}`,
                      textDecoration: "none",
                      transition: "border-color 0.2s, transform 0.2s",
                      ...sans, fontSize: 13, fontWeight: 500, color: T.textMid,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <PlatformIcon size={15} style={{ color }} />
                    {platformLabel}
                    <ExternalLink size={12} style={{ color: T.textDim, opacity: 0.6 }} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.08), rgba(217,115,22,0.06))`, border: `1px solid ${T.border}`, borderRadius: 16, padding: "36px 32px", textAlign: "center" }}>
          {loading ? (
            <>
              <Skeleton w="50%" h={22} radius={4} style={{ margin: "0 auto 12px" }} />
              <Skeleton w="70%" h={14} radius={4} style={{ margin: "0 auto 24px" }} />
              <Skeleton w="160px" h={42} radius={8} style={{ margin: "0 auto" }} />
            </>
          ) : (
            <>
              <h2 style={{ ...serif, fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, color: T.text, marginBottom: 12 }}>
                Work with {name.split(" ")[0]}
              </h2>
              <p style={{ ...sans, fontSize: 15, color: T.textMid, marginBottom: 28, lineHeight: 1.65, maxWidth: 380, margin: "0 auto 28px" }}>
                Connect with {name.split(" ")[0]} and other verified talent on DealStage — the brand deal platform built for real partnerships.
              </p>
              <Link
                to="/Onboarding"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 8,
                  ...sans, fontSize: 14, fontWeight: 600,
                  textDecoration: "none",
                  color: "#fff",
                  background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Get started free <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </main>

      {/* POWERED BY FOOTER */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "20px 24px", textAlign: "center" }}>
        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <span style={{ ...sans, fontSize: 12, color: T.textDim }}>Powered by</span>
          <span style={{ ...serif, fontSize: 14, fontWeight: 700, color: T.gold, letterSpacing: "0.04em" }}>Dealstage</span>
        </Link>
      </footer>
    </div>
  );
}

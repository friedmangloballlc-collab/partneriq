import React from "react";
import SEO from "@/components/SEO";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const attemptedPath = location.pathname;

  return (
    <>
    <SEO title="Page Not Found | DealStage" description="The page you're looking for doesn't exist" />
    <div style={{
      minHeight: "100vh", background: "#080807", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem", fontFamily: "'Instrument Sans', system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap');
        @keyframes float404 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .ds-404-btn { transition: all 0.2s ease; }
        .ds-404-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(196,162,74,0.15); }
        .ds-404-primary:hover { box-shadow: 0 4px 24px rgba(196,162,74,0.35); }
      `}</style>

      {/* Background glow effects */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,162,74,0.06) 0%, transparent 70%)",
        animation: "pulseGlow 4s ease-in-out infinite", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
          <img src="/brand/logos/04_logo_transparent_ondark.png" alt="DealStage" style={{ height: 48, margin: "0 auto 2.5rem" }} />
        </div>

        {/* Floating 404 */}
        <div style={{ animation: "float404 3s ease-in-out infinite", marginBottom: "1.5rem" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "9rem", fontWeight: 700,
            background: "linear-gradient(135deg, #c4a24a 0%, #e07b18 50%, #c4a24a 100%)",
            backgroundSize: "200% auto", animation: "shimmer 3s linear infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1, display: "block", letterSpacing: "-0.02em",
          }}>404</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 700,
          color: "#f5f0e6", marginBottom: "0.75rem",
          animation: "fadeInUp 0.5s ease-out 0.1s both",
        }}>Page not found</h1>

        {/* Description */}
        <p style={{
          fontSize: "0.95rem", color: "rgba(245,240,230,0.45)", lineHeight: 1.7,
          maxWidth: 380, margin: "0 auto 1rem",
          animation: "fadeInUp 0.5s ease-out 0.2s both",
        }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Attempted URL badge */}
        {attemptedPath && attemptedPath !== "/" && (
          <div style={{
            display: "inline-block", padding: "0.4rem 1rem", borderRadius: 20,
            background: "rgba(196,162,74,0.08)", border: "0.5px solid rgba(196,162,74,0.15)",
            marginBottom: "2rem", animation: "fadeInUp 0.5s ease-out 0.3s both",
          }}>
            <span style={{
              fontFamily: "'Instrument Mono', monospace", fontSize: "0.75rem",
              color: "rgba(196,162,74,0.6)", letterSpacing: "0.02em",
            }}>
              {attemptedPath}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap",
          animation: "fadeInUp 0.5s ease-out 0.4s both",
        }}>
          <button className="ds-404-btn" onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem",
            borderRadius: 10, border: "0.5px solid rgba(255,248,220,0.12)", background: "rgba(255,248,220,0.03)",
            color: "rgba(245,240,230,0.55)", fontSize: "0.85rem", cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <ArrowLeft size={16} /> Go back
          </button>

          <button className="ds-404-btn ds-404-primary" onClick={() => navigate("/")} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem",
            borderRadius: 10, border: "none", background: "linear-gradient(135deg, #c4a24a, #e07b18)",
            color: "#080807", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <Home size={16} /> Homepage
          </button>

          <button className="ds-404-btn" onClick={() => navigate("/login")} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem",
            borderRadius: 10, border: "0.5px solid rgba(255,248,220,0.12)", background: "rgba(255,248,220,0.03)",
            color: "rgba(245,240,230,0.55)", fontSize: "0.85rem", cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <Sparkles size={16} /> Sign in
          </button>
        </div>

        {/* Quick links */}
        <div style={{
          marginTop: "2.5rem", display: "flex", gap: "1.5rem", justifyContent: "center",
          animation: "fadeInUp 0.5s ease-out 0.5s both",
        }}>
          {[
            { label: "Marketplace", path: "/Marketplace" },
            { label: "Pricing", path: "/#pricing" },
            { label: "Contact", path: "/Contact" },
          ].map((link) => (
            <a key={link.path} href={link.path} style={{
              fontSize: "0.8rem", color: "rgba(196,162,74,0.45)", textDecoration: "none",
              fontFamily: "'Instrument Sans', sans-serif", transition: "color 0.2s",
            }} onMouseOver={(e) => e.target.style.color = "rgba(196,162,74,0.8)"}
               onMouseOut={(e) => e.target.style.color = "rgba(196,162,74,0.45)"}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Footer tagline */}
        <p style={{
          marginTop: "2.5rem", fontSize: "0.7rem", color: "rgba(245,240,230,0.12)",
          fontFamily: "'Instrument Mono', monospace", letterSpacing: "0.08em",
          animation: "fadeInUp 0.5s ease-out 0.6s both",
        }}>
          DEALSTAGE &middot; WHERE TALENT MEETS BRANDS
        </p>
      </div>
    </div>
    </>
  );
}

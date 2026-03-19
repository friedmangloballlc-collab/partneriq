import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", background: "#080807", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem", fontFamily: "'Instrument Sans', system-ui, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap');
        @keyframes float404 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>

      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 40, margin: "0 auto 3rem" }} />

        <div style={{ animation: "float404 3s ease-in-out infinite", marginBottom: "2rem" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "8rem", fontWeight: 700,
            background: "linear-gradient(135deg, #c4a24a, #e07b18)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1, display: "block",
          }}>404</span>
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700,
          color: "#f5f0e6", marginBottom: "0.75rem",
        }}>Page not found</h1>

        <p style={{
          fontSize: "0.9rem", color: "rgba(245,240,230,0.4)", lineHeight: 1.7,
          marginBottom: "2.5rem", maxWidth: 360, margin: "0 auto 2.5rem",
        }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem",
            borderRadius: 8, border: "0.5px solid rgba(255,248,220,0.1)", background: "none",
            color: "rgba(245,240,230,0.5)", fontSize: "0.85rem", cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <ArrowLeft size={16} /> Go back
          </button>

          <button onClick={() => navigate("/Dashboard")} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem",
            borderRadius: 8, border: "none", background: "linear-gradient(135deg, #c4a24a, #e07b18)",
            color: "#080807", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <Home size={16} /> Dashboard
          </button>

          <button onClick={() => navigate("/Marketplace")} style={{
            display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem",
            borderRadius: 8, border: "0.5px solid rgba(255,248,220,0.1)", background: "none",
            color: "rgba(245,240,230,0.5)", fontSize: "0.85rem", cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
          }}>
            <Search size={16} /> Marketplace
          </button>
        </div>

        <p style={{
          marginTop: "3rem", fontSize: "0.7rem", color: "rgba(245,240,230,0.15)",
          fontFamily: "'Instrument Mono', monospace", letterSpacing: "0.06em",
        }}>
          DEALSTAGE · TALENT MEETS BRANDS
        </p>
      </div>
    </div>
  );
}

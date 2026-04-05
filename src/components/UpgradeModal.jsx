import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, Crown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const ROLE_STARTING_PRICE = {
  talent: "$99/mo",
  manager: "$99/mo",
  brand: "$299/mo",
  agency: "$799/mo",
};

const ROLE_BENEFITS = {
  brand: [
    "AI Match Engine & smart scoring",
    "Unlimited outreach & sequences",
    "Campaign analytics & reporting",
    "Contact Finder & warm intros",
    "Data Rooms & advanced analytics",
  ],
  agency: [
    "Multi-client workspace management",
    "White-label reporting & data rooms",
    "Bulk outreach & sequence automation",
    "AI Match Engine across all clients",
    "Priority support & dedicated CSM",
  ],
  talent: [
    "AI Match Engine & smart scoring",
    "Unlimited outreach & sequences",
    "Pitch Deck Generation",
    "Data Rooms & advanced analytics",
    "Contact Finder & warm intros",
  ],
  manager: [
    "AI Match Engine & smart scoring",
    "Unlimited outreach & sequences",
    "Pitch Deck Generation",
    "Data Rooms & advanced analytics",
    "Contact Finder & warm intros",
  ],
};

export default function UpgradeModal({ isOpen, onClose, featureName, requiredTier }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role ?? "talent";
  const startingPrice = ROLE_STARTING_PRICE[role] ?? "$99/mo";
  const benefits = ROLE_BENEFITS[role] ?? ROLE_BENEFITS.talent;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0d", border: "0.5px solid rgba(255,248,220,0.13)",
          borderRadius: 16, padding: "2.5rem", maxWidth: 420, width: "90%",
          position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", color: "rgba(245,240,230,0.3)", cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "linear-gradient(135deg, #c4a24a, #e07b18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <Crown size={28} color="#080807" />
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem",
          fontWeight: 700, color: "#f5f0e6", textAlign: "center",
          marginBottom: "0.5rem", letterSpacing: "-0.02em",
        }}>{featureName ? `Upgrade to unlock ${featureName}` : "Upgrade to unlock"}</h2>

        <p style={{
          fontSize: "0.88rem", color: "rgba(245,240,230,0.45)",
          textAlign: "center", lineHeight: 1.6, marginBottom: "1.5rem",
        }}>
          <span style={{ color: "#c4a24a", fontWeight: 500 }}>{featureName || "This feature"}</span> is available on paid plans.
          {requiredTier
            ? ` This feature requires the ${requiredTier} plan or higher.`
            : " Your 7-day trial has ended — upgrade to continue using premium features."}
        </p>

        <div style={{
          background: "rgba(196,162,74,0.06)", border: "0.5px solid rgba(196,162,74,0.15)",
          borderRadius: 10, padding: "1rem", marginBottom: "1.5rem",
        }}>
          <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", color: "#c4a24a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>What you get</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {benefits.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(245,240,230,0.6)" }}>
                <Sparkles size={12} style={{ color: "#c4a24a", flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { onClose(); navigate("/SubscriptionManagement"); }}
          style={{
            width: "100%", padding: "0.85rem", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #c4a24a, #e07b18)",
            color: "#080807", fontWeight: 600, fontSize: "0.9rem",
            cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}
        >
          View plans <ArrowRight size={16} />
        </button>

        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(245,240,230,0.25)", marginTop: "0.75rem" }}>
          Plans start at {startingPrice} · Cancel anytime
        </p>
      </div>
    </div>
  );
}

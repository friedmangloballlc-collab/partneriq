import React, { useState } from "react";
import { Lock } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

export default function FeatureGate({ children, locked, featureName }) {
  const [showModal, setShowModal] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <div style={{ position: "relative" }}>
        {/* Show the content but blur/dim it */}
        <div style={{
          filter: "blur(3px)", opacity: 0.4, pointerEvents: "none",
          userSelect: "none", position: "relative",
        }}>
          {children}
        </div>
        {/* Lock overlay — accessible button */}
        <button
          onClick={() => setShowModal(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowModal(true); } }}
          aria-label={`Upgrade to unlock ${featureName || "this feature"}`}
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            background: "rgba(8,8,7,0.3)", borderRadius: 12, zIndex: 10,
            border: "none", padding: 0,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(196,162,74,0.15), rgba(224,123,24,0.15))",
            border: "0.5px solid rgba(196,162,74,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "0.75rem",
          }}>
            <Lock size={22} style={{ color: "#c4a24a" }} aria-hidden="true" />
          </div>
          <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "#f5f0e6", marginBottom: "0.25rem" }}>
            Premium Feature
          </p>
          <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", color: "rgba(245,240,230,0.35)", letterSpacing: "0.04em" }}>
            Click to upgrade
          </p>
        </button>
      </div>
      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} featureName={featureName} />
    </>
  );
}

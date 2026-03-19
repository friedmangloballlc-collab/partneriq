import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080807", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap');`}</style>

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <img src="/brand/logos/04_logo_transparent_ondark.png" alt="Dealstage" style={{ height: 48, margin: "0 auto 2.5rem" }} />

        {/* Email icon */}
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg, rgba(196,162,74,0.12), rgba(224,123,24,0.12))", border: "0.5px solid rgba(196,162,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <Mail size={32} style={{ color: "#c4a24a" }} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 700, color: "#f5f0e6", marginBottom: "0.75rem" }}>Check your email</h1>

        <p style={{ fontSize: "0.9rem", color: "rgba(245,240,230,0.5)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
          We sent a confirmation link to
        </p>
        {email && (
          <p style={{ fontSize: "1rem", color: "#c4a24a", fontWeight: 500, marginBottom: "1.5rem", fontFamily: "'Instrument Mono', monospace" }}>{email}</p>
        )}
        <p style={{ fontSize: "0.85rem", color: "rgba(245,240,230,0.35)", lineHeight: 1.7, marginBottom: "2rem" }}>
          Click the link in your email to verify your account and get started. The link expires in 24 hours.
        </p>

        {/* Steps */}
        <div style={{ background: "rgba(255,248,220,0.02)", border: "0.5px solid rgba(255,248,220,0.07)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
          {[
            { num: "1", text: "Open your email inbox", done: true },
            { num: "2", text: "Click the verification link", done: false },
            { num: "3", text: "Start using Dealstage", done: false },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < 2 ? "0.5px solid rgba(255,248,220,0.05)" : "none" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "linear-gradient(135deg, #c4a24a, #e07b18)" : "rgba(255,248,220,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 600, color: step.done ? "#080807" : "rgba(245,240,230,0.3)", fontFamily: "'Instrument Mono', monospace", flexShrink: 0 }}>
                {step.done ? <CheckCircle2 size={14} /> : step.num}
              </div>
              <span style={{ fontSize: "0.82rem", color: step.done ? "#f5f0e6" : "rgba(245,240,230,0.4)" }}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Resend button */}
        <button onClick={handleResend} disabled={resending || resent} style={{
          background: "none", border: "0.5px solid rgba(255,248,220,0.1)", borderRadius: 8,
          padding: "0.65rem 1.25rem", color: resent ? "#22c55e" : "rgba(245,240,230,0.4)",
          fontSize: "0.8rem", cursor: resending ? "wait" : "pointer", display: "inline-flex",
          alignItems: "center", gap: "0.5rem", fontFamily: "'Instrument Sans', sans-serif",
          transition: "all 0.2s", marginBottom: "1rem",
        }}>
          {resent ? <><CheckCircle2 size={14} /> Email resent!</> : resending ? <><RefreshCw size={14} className="animate-spin" /> Resending...</> : <><RefreshCw size={14} /> Resend verification email</>}
        </button>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => navigate("/login")} style={{
            background: "none", border: "none", color: "#c4a24a", fontSize: "0.8rem",
            cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif",
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
          }}>
            Go to sign in <ArrowRight size={14} />
          </button>
        </div>

        <p style={{ marginTop: "2rem", fontSize: "0.7rem", color: "rgba(245,240,230,0.2)" }}>
          Didn't receive the email? Check your spam folder or contact support@thedealstage.com
        </p>
      </div>
    </div>
  );
}

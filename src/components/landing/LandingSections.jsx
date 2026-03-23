import React, { useState } from "react";
import { Check, X, ChevronDown, Play, Shield, Lock, CreditCard, Globe, Smartphone, Bell, MessageSquare, CheckCircle2 } from "lucide-react";

// ─── FAQ SECTION ───
const FAQ_DATA = [
  { q: "Is it free to join?", a: "Yes. All three user types (Talent, Brand, Agency) can create a free account with basic features. Free accounts include limited talent searches, 1 active partnership, and basic analytics. Upgrade anytime to unlock AI matching, unlimited outreach, and advanced features." },
  { q: "What talent types are supported?", a: "Deal Stage supports 84 talent types across 11 categories: Digital Creators & Influencers, Actors & Screen Talent, Dancers & Choreographers, Variety & Live Performance, Fashion Models, Commercial Models, Music Artists, Team Sports Athletes, Individual Sports Athletes, Motorsports & Extreme Sports, and Sports Industry Professionals." },
  { q: "How do payments work?", a: "Payments are processed through Stripe with optional escrow. For standard deals, brands pay talent directly. For escrow deals, the platform holds funds and releases them automatically when milestones are completed (content posted, brand approves, etc.). Platform takes a small transaction fee." },
  { q: "Do I need an agency?", a: "No. Talent can use Deal Stage independently to discover brands, manage deals, and get paid. Agencies are a third user type that can manage multiple talent and brands simultaneously with advanced roster management, client CRM, and portfolio analytics." },
  { q: "How does AI matching work?", a: "Our Match Engine uses 10 weighted factors: audience demographic overlap (25%), niche alignment (20%), engagement quality (15%), brand safety (10%), budget fit (10%), deal history (8%), audience authenticity (5%), geographic match (4%), competitor conflicts (2%), and growth trajectory (1%). This produces a high-accuracy match score." },
  { q: "Is my data secure?", a: "Yes. Deal Stage uses 256-bit TLS encryption, Row-Level Security on all database tables, Content Security Policy headers, and GDPR-compliant data handling. Your Data Room is private by default — you control who sees your deal history. NDA-gated access is available for sharing with brands." },
];

export function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding: "6rem 2rem", maxWidth: 800, margin: "0 auto" }}>
      <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d4b04e", textTransform: "uppercase", marginBottom: "1.25rem" }}>/ Frequently asked</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.05, color: "#f5f0e6", marginBottom: "2rem" }}>
        Questions? <em style={{ fontStyle: "italic", background: "linear-gradient(90deg, #d9b96a, #f09040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Answers.</em>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {FAQ_DATA.map((item, i) => (
          <div key={i} style={{ border: "0.5px solid rgba(255,248,220,0.07)", borderRadius: 10, overflow: "hidden", background: open === i ? "#232220" : "transparent", transition: "background 0.2s" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", background: "none", border: "none", cursor: "pointer", color: "#f5f0e6", fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, textAlign: "left" }}>
              {item.q}
              <ChevronDown style={{ width: 18, height: 18, opacity: 0.4, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {open === i && (
              <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.85rem", color: "rgba(245,240,230,0.56)", lineHeight: 1.8 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPARISON TABLE ───
const COMPARE_ROWS = [
  { feature: "AI-Powered Matching", ds: true, agency: false, sheets: false },
  { feature: "84 Talent Types", ds: true, agency: "Limited", sheets: false },
  { feature: "Deal Management Pipeline", ds: true, agency: "Manual", sheets: false },
  { feature: "Escrow Payments", ds: true, agency: false, sheets: false },
  { feature: "Contract Red Flag Scanner", ds: true, agency: false, sheets: false },
  { feature: "Culture Calendar (486 Events)", ds: true, agency: false, sheets: false },
  { feature: "Data Room Intelligence", ds: true, agency: false, sheets: false },
  { feature: "50+ AI Agents", ds: true, agency: false, sheets: false },
  { feature: "Video Pitch Studio", ds: true, agency: false, sheets: false },
  { feature: "Multi-Currency Support", ds: true, agency: true, sheets: false },
];

function CompareCell({ val }) {
  if (val === true) return <Check style={{ width: 18, height: 18, color: "#d4b04e" }} />;
  if (val === false) return <X style={{ width: 18, height: 18, opacity: 0.2, color: "#f5f0e6" }} />;
  return <span style={{ fontSize: "0.75rem", color: "rgba(245,240,230,0.4)" }}>{val}</span>;
}

export function ComparisonSection() {
  return (
    <div style={{ padding: "6rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d4b04e", textTransform: "uppercase", marginBottom: "1.25rem", textAlign: "center" }}>/ Why Deal Stage</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.05, color: "#f5f0e6", marginBottom: "2.5rem", textAlign: "center" }}>
        Compare and <em style={{ fontStyle: "italic", background: "linear-gradient(90deg, #d9b96a, #f09040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decide</em>
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "1rem", fontSize: "0.75rem", color: "rgba(245,240,230,0.4)", fontFamily: "'Instrument Mono', monospace", fontWeight: 400, borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>Feature</th>
              <th style={{ textAlign: "center", padding: "1rem", fontSize: "0.8rem", fontWeight: 600, color: "#d4b04e", borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>Deal Stage</th>
              <th style={{ textAlign: "center", padding: "1rem", fontSize: "0.8rem", fontWeight: 400, color: "rgba(245,240,230,0.4)", borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>Traditional Agencies</th>
              <th style={{ textAlign: "center", padding: "1rem", fontSize: "0.8rem", fontWeight: 400, color: "rgba(245,240,230,0.4)", borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>Spreadsheets</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, i) => (
              <tr key={i} style={{ borderBottom: "0.5px solid rgba(255,248,220,0.04)" }}>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.85rem", color: "#f5f0e6" }}>{row.feature}</td>
                <td style={{ textAlign: "center", padding: "0.85rem" }}><CompareCell val={row.ds} /></td>
                <td style={{ textAlign: "center", padding: "0.85rem" }}><CompareCell val={row.agency} /></td>
                <td style={{ textAlign: "center", padding: "0.85rem" }}><CompareCell val={row.sheets} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SECURITY / TRUST BADGES ───
export function SecurityBadges() {
  const badges = [
    { icon: Shield, label: "SOC 2 Type II", desc: "Enterprise-grade compliance" },
    { icon: Lock, label: "256-bit Encryption", desc: "Data encrypted at rest & transit" },
    { icon: CreditCard, label: "Stripe Payments", desc: "PCI-compliant processing" },
    { icon: Globe, label: "GDPR Ready", desc: "Full data control & export" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", padding: "3rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      {badges.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", border: "0.5px solid rgba(255,248,220,0.07)", borderRadius: 10, background: "#232220" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, rgba(212,176,78,0.15), rgba(224,123,24,0.15))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <b.icon style={{ width: 18, height: 18, color: "#d4b04e" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "#f5f0e6" }}>{b.label}</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(245,240,230,0.4)" }}>{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VIDEO DEMO SECTION ───
export function VideoDemoSection() {
  return (
    <div style={{ padding: "6rem 2rem", textAlign: "center", borderTop: "0.5px solid rgba(255,248,220,0.07)", borderBottom: "0.5px solid rgba(255,248,220,0.07)" }}>
      <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d4b04e", textTransform: "uppercase", marginBottom: "1.25rem" }}>/ See it in action</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.05, color: "#f5f0e6", marginBottom: "1rem" }}>
        Watch Deal Stage <em style={{ fontStyle: "italic", background: "linear-gradient(90deg, #d9b96a, #f09040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>work</em>
      </h2>
      <p style={{ fontSize: "0.95rem", color: "rgba(245,240,230,0.56)", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.8 }}>See how talent, brands, and agencies use Deal Stage to discover partners, close deals, and grow revenue.</p>
      <div style={{ maxWidth: 720, margin: "0 auto", aspectRatio: "16/9", background: "#232220", border: "0.5px solid rgba(255,248,220,0.13)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,176,78,0.05), rgba(224,123,24,0.05))" }} />
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #d4b04e, #e07b18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, boxShadow: "0 8px 32px rgba(224,123,24,0.3)" }}>
          <Play style={{ width: 28, height: 28, color: "#1c1b19", marginLeft: 3 }} />
        </div>
        <span style={{ position: "absolute", bottom: 20, fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", color: "rgba(245,240,230,0.4)", letterSpacing: "0.06em" }}>2:00 · Product walkthrough</span>
      </div>
    </div>
  );
}

// ─── MOBILE APP SECTION ───
export function MobileAppSection() {
  const features = [
    { icon: Bell, title: "Deal Notifications", desc: "Instant alerts when brands reach out or deals update" },
    { icon: CheckCircle2, title: "Content Approvals", desc: "Review and approve content submissions on the go" },
    { icon: MessageSquare, title: "Deal Messaging", desc: "In-deal communication without switching apps" },
  ];
  return (
    <div style={{ padding: "6rem 2rem", maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
      <div>
        <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d4b04e", textTransform: "uppercase", marginBottom: "1.25rem" }}>/ Coming soon</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.05, color: "#f5f0e6", marginBottom: "1rem" }}>
          Deal Stage <em style={{ fontStyle: "italic", background: "linear-gradient(90deg, #d9b96a, #f09040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>on the go</em>
        </h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(245,240,230,0.56)", lineHeight: 1.8, marginBottom: "2rem" }}>Manage deals, approve content, and close partnerships from anywhere. Push notifications keep you in the loop.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(212,176,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <f.icon style={{ width: 18, height: 18, color: "#d4b04e" }} />
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "#f5f0e6", marginBottom: 2 }}>{f.title}</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(245,240,230,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ aspectRatio: "9/16", maxHeight: 500, background: "#232220", border: "0.5px solid rgba(255,248,220,0.13)", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <Smartphone style={{ width: 48, height: 48, color: "rgba(245,240,230,0.15)", marginBottom: 12 }} />
          <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: "0.6rem", color: "rgba(245,240,230,0.25)", letterSpacing: "0.08em" }}>iOS & Android<br />Coming Q3 2026</p>
        </div>
      </div>
    </div>
  );
}

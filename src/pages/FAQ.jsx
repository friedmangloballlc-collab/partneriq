import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const FAQ_DATA = [
  { q: "What is DealStage?", a: "DealStage is an AI-powered partnership intelligence platform that connects talent (creators, athletes, celebrities), brands, and agencies through data-driven matching, smart outreach, contract intelligence, and real-time deal management." },
  { q: "How much does DealStage cost?", a: "DealStage offers a free tier for all user types. Paid plans start at $99/month for Talent, $299/month for Brands, and $799/month for Agencies. Annual billing saves ~20%. Visit our Pricing page for full details." },
  { q: "How does AI matching work?", a: "Our Match Engine uses 10 weighted factors: audience demographic overlap (25%), niche alignment (20%), engagement quality (15%), brand safety (10%), budget fit (10%), deal history (8%), audience authenticity (5%), geographic match (4%), competitor conflicts (2%), and growth trajectory (1%). This produces a high-accuracy match score." },
  { q: "Is my data secure?", a: "Yes. DealStage uses 256-bit TLS encryption, Row-Level Security on all database tables, Content Security Policy headers, and GDPR-compliant data handling. Your Data Room is private by default — you control who sees your deal history." },
  { q: "Can I cancel anytime?", a: "Absolutely. No long-term contracts on monthly plans. Cancel anytime from your account settings. Your data remains accessible even after downgrading." },
  { q: "What social platforms do you support?", a: "DealStage supports verification and analytics across 88+ social platforms including Instagram, YouTube, TikTok, Twitter/X, LinkedIn, Twitch, Spotify, and many more." },
  { q: "Do I need an agency to use DealStage?", a: "No. Talent can use DealStage independently to discover brands, manage deals, and get paid. Agencies are a separate user type that can manage multiple talent and brands simultaneously with advanced roster management and portfolio analytics." },
  { q: "How do payments work?", a: "Payments are processed through Stripe with optional escrow. For standard deals, brands pay talent directly. For escrow deals, the platform holds funds and releases them automatically when milestones are completed." },
  { q: "What makes DealStage different from other influencer platforms?", a: "Unlike brand-only tools like Aspire or Grin, DealStage serves all three sides of the marketplace — talent, brands, and agencies — with a shared AI intelligence layer that gets smarter with every deal. We provide deal intelligence for talent, not just campaign management for brands." },
  { q: "How do I get started?", a: "Sign up free on our homepage. Connect your social accounts, and the AI will analyze your profile and start generating matches within minutes. No credit card required." },
];

// Generate JSON-LD for FAQPage schema
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_DATA.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a,
    },
  })),
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Inject JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div style={{ background: "#0a0a09", minHeight: "100vh", color: "#f5f0e6" }}>
      <SEO
        title="FAQ"
        description="Frequently asked questions about DealStage — AI-powered partnership intelligence for talent, brands, and agencies."
        canonical="https://www.thedealstage.com/FAQ"
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 40px" }}>
        <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: 12, letterSpacing: "0.15em", color: "#c4a24a", marginBottom: 16, textTransform: "uppercase", textAlign: "center" }}>
          FAQ
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, lineHeight: 1.15, textAlign: "center", marginBottom: 16 }}>
          Frequently asked questions
        </h1>
        <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 17, color: "rgba(245,240,230,0.6)", lineHeight: 1.6, textAlign: "center", maxWidth: 520, margin: "0 auto 48px" }}>
          Everything you need to know about DealStage.
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>
        {FAQ_DATA.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 0" }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              style={{
                width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 500,
                color: "#f5f0e6", padding: "4px 0", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              {item.q}
              <span style={{ color: "rgba(245,240,230,0.3)", fontSize: 20, flexShrink: 0, marginLeft: 16 }}>
                {openIndex === i ? "\u2212" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <p style={{
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 14,
                color: "rgba(245,240,230,0.5)", lineHeight: 1.7, marginTop: 8,
              }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
        <div style={{
          border: "1px solid rgba(196,162,74,0.18)", borderRadius: 16, padding: "48px 32px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(196,162,74,0.07) 0%, transparent 70%)",
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
            Still have questions?
          </h2>
          <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, color: "rgba(245,240,230,0.5)", marginBottom: 24 }}>
            Our team is here to help.
          </p>
          <Link to="/Contact" style={{
            display: "inline-block", padding: "10px 24px", borderRadius: 8,
            background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#0a0a09",
            fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600,
            textDecoration: "none",
          }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

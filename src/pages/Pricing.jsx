import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const PLANS = {
  talent: [
    { title: "Starter", price: "$0", annual: "$0", period: "forever", badge: null, features: ["Browse marketplace (view only)", "5 AI queries/month", "Up to 3 opportunities", "Dashboard & profile", "Basic approvals"], cta: "Get Started Free", highlight: false },
    { title: "Rising", price: "$99", annual: "$79", period: "/mo", badge: null, features: ["Everything in Starter, plus:", "Full Deal Pipeline & Calendar", "Match Engine & Contact Finder", "Outreach & Campaign Briefs", "Pitch Deck Builder", "50 AI queries/month", "AI Agents Hub (1 agent)"], cta: "Start Rising", highlight: false },
    { title: "Pro", price: "$249", annual: "$199", period: "/mo", badge: "Most Popular", features: ["Everything in Rising, plus:", "Sequences & Warm Intro Network", "Deal Analytics & Comparison", "Market Intelligence & ROI Simulator", "Data Rooms & Event Management", "Unlimited AI queries", "AI Agents Hub (3 agents)"], cta: "Start Pro", highlight: true },
    { title: "Elite", price: "$499", annual: "$399", period: "/mo", badge: null, features: ["Everything in Pro, plus:", "Teams (unlimited seats)", "Custom Reports & Integrations", "Data Import/Export & API access", "Unlimited AI Agents", "Priority support"], cta: "Start Elite", highlight: false },
  ],
  brand: [
    { title: "Explorer", price: "$0", annual: "$0", period: "forever", badge: null, features: ["Browse marketplace (view only)", "5 AI queries/month", "Up to 3 opportunities", "Dashboard & brand profile", "Basic approvals"], cta: "Get Started Free", highlight: false },
    { title: "Growth", price: "$299", annual: "$239", period: "/mo", badge: null, features: ["Everything in Explorer, plus:", "Full Deal Pipeline & Calendar", "Match Engine & Contact Finder", "Outreach & Campaign Briefs", "Talent Discovery", "50 AI queries/month", "AI Agents Hub (1 agent)"], cta: "Start Growth", highlight: false },
    { title: "Scale", price: "$699", annual: "$559", period: "/mo", badge: "Most Popular", features: ["Everything in Growth, plus:", "Sequences & Warm Intro Network", "Deal Analytics & Comparison", "Market Intelligence & ROI Simulator", "Data Rooms & Event Management", "Unlimited AI queries", "AI Agents Hub (3 agents)"], cta: "Start Scale", highlight: true },
    { title: "Enterprise", price: "$1,499", annual: "$1,199", period: "/mo", badge: null, features: ["Everything in Scale, plus:", "Teams (unlimited seats)", "Custom Reports & Integrations", "Data Import/Export & API access", "Unlimited AI Agents", "Dedicated success manager", "SSO & priority support"], cta: "Start Enterprise", highlight: false },
  ],
  agency: [
    { title: "Explorer", price: "$0", annual: "$0", period: "forever", badge: null, features: ["Browse marketplace (view only)", "5 AI queries/month", "Up to 3 opportunities", "Dashboard & agency profile", "Basic approvals"], cta: "Get Started Free", highlight: false },
    { title: "Starter", price: "$799", annual: "$639", period: "/mo", badge: null, features: ["Everything in Explorer, plus:", "Full Deal Pipeline & Calendar", "Match Engine & Contact Finder", "Outreach & Campaign Briefs", "Talent Discovery", "50 AI queries/month", "AI Agents Hub (1 agent)", "Up to 3 team seats"], cta: "Start Starter", highlight: false },
    { title: "Pro", price: "$1,799", annual: "$1,439", period: "/mo", badge: "Most Popular", features: ["Everything in Starter, plus:", "Sequences & Warm Intro Network", "Deal Analytics & Comparison", "Market Intelligence & ROI Simulator", "Data Rooms & Event Management", "Unlimited AI queries", "AI Agents Hub (3 agents)", "Up to 10 team seats"], cta: "Start Pro", highlight: true },
    { title: "Enterprise", price: "$3,499", annual: "$2,799", period: "/mo", badge: null, features: ["Everything in Pro, plus:", "Teams (unlimited seats)", "Custom Reports & Integrations", "Data Import/Export & API access", "Unlimited AI Agents", "White-label options", "Dedicated success manager", "SSO & priority support"], cta: "Start Enterprise", highlight: false },
  ],
  manager: [
    { title: "Explorer", price: "$0", annual: "$0", period: "forever", badge: null, features: ["Browse marketplace (view only)", "5 AI queries/month", "Up to 3 opportunities", "Dashboard & manager profile", "Basic approvals"], cta: "Get Started Free", highlight: false },
    { title: "Single Talent", price: "$99", annual: "$79", period: "/mo", badge: null, features: ["Everything in Explorer, plus:", "Full Deal Pipeline & Calendar", "Match Engine & Contact Finder", "Outreach & Campaign Briefs", "Talent Discovery", "50 AI queries/month", "AI Agents Hub (1 agent)"], cta: "Start Plan", highlight: false },
    { title: "Multi-Talent", price: "$249", annual: "$199", period: "/mo", badge: "Most Popular", features: ["Everything in Single Talent, plus:", "Sequences & Warm Intro Network", "Deal Analytics & Comparison", "Market Intelligence & ROI Simulator", "Data Rooms & Event Management", "Unlimited AI queries", "AI Agents Hub (3 agents)"], cta: "Start Plan", highlight: true },
    { title: "Enterprise", price: "$499", annual: "$399", period: "/mo", badge: null, features: ["Everything in Multi-Talent, plus:", "Teams (unlimited seats)", "Custom Reports & Integrations", "Data Import/Export & API access", "Unlimited AI Agents", "Priority support"], cta: "Start Enterprise", highlight: false },
  ],
};

const FAQS = [
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. When upgrading, you get immediate access to new features. When downgrading, your current plan stays active until the end of the billing period." },
  { q: "Is there a free trial?", a: "Every new account gets 7 days of full Tier 1 access — pipeline, outreach, match engine, and 50 AI queries. After 7 days, you drop to the free tier. Your data stays, you just need to upgrade to access it." },
  { q: "What are AI queries?", a: "AI queries power the AI Command Center, Match Engine, Pitch Deck Builder, and 30+ AI agents. Free tier includes 5/month, Tier 1 gets 50/month, and Tier 2+ gets unlimited." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards through Stripe. Enterprise plans can be invoiced with NET 30 terms." },
  { q: "Do you offer annual billing?", a: "Yes. Annual billing saves ~17% compared to monthly. Toggle the switch above to see annual pricing." },
  { q: "Can I cancel anytime?", a: "Absolutely. No long-term contracts on monthly plans. Cancel anytime from your account settings." },
  { q: "What happens to my data if I downgrade?", a: "Your data is never deleted. On a lower tier, some advanced features become read-only, but all your partnerships, analytics, and history remain accessible." },
];

const tabs = [
  { key: "talent", label: "Talent" },
  { key: "brand", label: "Brand" },
  { key: "agency", label: "Agency" },
  { key: "manager", label: "Manager" },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState("talent");
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const plans = PLANS[activeTab];

  return (
    <div style={{ background: "#0a0a09", minHeight: "100vh", color: "#f5f0e6" }}>
      <SEO
        title="Pricing"
        description="DealStage pricing plans for Talent, Brands, and Agencies. Start free, upgrade as you grow."
        canonical="https://www.thedealstage.com/Pricing"
      />

      {/* Header */}
      <div style={{ textAlign: "center", padding: "80px 24px 40px", maxWidth: 720, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Instrument Mono', monospace", fontSize: 12, letterSpacing: "0.15em", color: "#c4a24a", marginBottom: 16, textTransform: "uppercase" }}>
          Pricing
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600, lineHeight: 1.15, marginBottom: 16 }}>
          Plans that grow with you
        </h1>
        <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 17, color: "rgba(245,240,230,0.6)", lineHeight: 1.6 }}>
          Start free with 5 AI queries/month. Upgrade when you're ready. 7-day full trial included.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 500,
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              background: activeTab === t.key ? "rgba(196,162,74,0.15)" : "transparent",
              color: activeTab === t.key ? "#c4a24a" : "rgba(245,240,230,0.5)",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Annual Toggle */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, color: !annual ? "#f5f0e6" : "rgba(245,240,230,0.4)" }}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          aria-label={`Switch to ${annual ? "monthly" : "annual"} billing`}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "1px solid rgba(196,162,74,0.3)",
            background: annual ? "rgba(196,162,74,0.3)" : "rgba(255,255,255,0.1)",
            position: "relative", cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#c4a24a",
            position: "absolute", top: 2, left: annual ? 22 : 2, transition: "left 0.2s",
          }} />
        </button>
        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, color: annual ? "#f5f0e6" : "rgba(245,240,230,0.4)" }}>
          Annual <span style={{ color: "#c4a24a", fontSize: 12 }}>Save 20%</span>
        </span>
      </div>

      {/* Plan Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
        gap: 16, maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px",
      }}>
        {plans.map((plan, i) => (
          <div
            key={i}
            style={{
              background: plan.highlight ? "rgba(196,162,74,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${plan.highlight ? "rgba(196,162,74,0.25)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 16, padding: 32, display: "flex", flexDirection: "column",
              position: "relative",
            }}
          >
            {plan.badge && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #c4a24a, #e07b18)", color: "#0a0a09",
                fontFamily: "'Instrument Mono', monospace", fontSize: 10, fontWeight: 600,
                padding: "4px 12px", borderRadius: 20, letterSpacing: "0.05em",
              }}>
                {plan.badge}
              </div>
            )}

            <h3 style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {plan.title}
            </h3>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: "#c4a24a" }}>
                {annual ? plan.annual : plan.price}
              </span>
              <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, color: "rgba(245,240,230,0.4)", marginLeft: 4 }}>
                {plan.period}
              </span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{
                  display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10,
                  fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5,
                  color: f.startsWith("Everything") ? "rgba(245,240,230,0.5)" : "rgba(245,240,230,0.75)",
                  fontStyle: f.startsWith("Everything") ? "italic" : "normal",
                }}>
                  {!f.startsWith("Everything") && <Check size={14} style={{ color: "#c4a24a", marginTop: 2, flexShrink: 0 }} />}
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link to={plan.cta === "Contact Sales" ? "/Contact" : "/Onboarding"}>
              <button style={{
                width: "100%", padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600,
                background: plan.highlight ? "linear-gradient(135deg, #c4a24a, #e07b18)" : "rgba(255,255,255,0.08)",
                color: plan.highlight ? "#0a0a09" : "#f5f0e6",
                transition: "opacity 0.2s",
              }}>
                {plan.cta}
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 100px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, textAlign: "center", marginBottom: 40 }}>
          Frequently asked questions
        </h2>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 0",
            }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              style={{
                width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 500,
                color: "#f5f0e6", padding: "4px 0", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              {faq.q}
              <span style={{ color: "rgba(245,240,230,0.3)", fontSize: 20 }}>{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <p style={{
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 14,
                color: "rgba(245,240,230,0.5)", lineHeight: 1.6, marginTop: 8, paddingLeft: 0,
              }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

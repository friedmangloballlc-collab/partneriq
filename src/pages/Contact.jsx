import React, { useState, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import {
  Mail,
  Headphones,
  Handshake,
  MapPin,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

const COLORS = {
  bg: "#1c1b19",
  gold: "#d4b04e",
  amber: "#e07b18",
  cream: "#f5f0e6",
  surface: "#232220",
  border: "rgba(212,176,78,0.15)",
  muted: "rgba(245,240,230,0.45)",
};

const FONTS = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

const contactCards = [
  {
    icon: Mail,
    label: "Sales",
    email: "sales@thedealstage.com",
    desc: "Interested in Deal Stage for your brand or agency? Let's talk pricing, onboarding, and everything in between.",
  },
  {
    icon: Headphones,
    label: "Support",
    email: "support@thedealstage.com",
    desc: "Having trouble with the platform? Our support team typically responds within one business hour.",
  },
  {
    icon: Handshake,
    label: "Partnerships",
    email: "partnerships@thedealstage.com",
    desc: "Looking to integrate, co-market, or build on top of Deal Stage? We want to hear the idea.",
  },
];

const faqs = [
  {
    q: "How do I get started on Deal Stage?",
    a: "Getting started takes about five minutes. Sign up, select your role — Brand, Talent, or Agency — and complete the onboarding flow. You'll have access to core features immediately. Our team can schedule a guided walkthrough for enterprise accounts.",
  },
  {
    q: "Can I use Deal Stage without connecting my social accounts?",
    a: "Yes. Core features like deal management, outreach, and analytics work without social connections. However, connecting accounts unlocks verified audience metrics, AI-powered match scores, and the full Talent Discovery engine. You can connect and disconnect at any time.",
  },
  {
    q: "Do you offer custom plans for larger agencies?",
    a: "Absolutely. Agencies managing 10+ talent or running 20+ active campaigns typically qualify for our Agency Pro or Enterprise tier. Reach out to sales@thedealstage.com with a brief overview of your team size and we'll put together a custom proposal within 24 hours.",
  },
];

function useFadeIn(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(212,176,78,0.07)",
        border: `1px solid rgba(212,176,78,0.2)`,
        borderRadius: "100px",
        padding: "6px 16px",
        marginBottom: "24px",
      }}
    >
      {Icon && <Icon size={12} color={COLORS.gold} />}
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLORS.gold,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function ContactCard({ card, delay }) {
  const [ref, visible] = useFadeIn();
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, border-color 0.25s ease, box-shadow 0.25s ease`,
        background: COLORS.surface,
        border: `1px solid ${hovered ? "rgba(212,176,78,0.3)" : COLORS.border}`,
        borderRadius: "16px",
        padding: "32px",
        boxShadow: hovered ? "0 8px 40px rgba(212,176,78,0.08)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "11px",
          background: `linear-gradient(135deg, rgba(212,176,78,0.15), rgba(224,123,24,0.08))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(212,176,78,0.2)`,
        }}
      >
        <Icon size={20} color={COLORS.gold} />
      </div>

      <div>
        <p
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.muted,
            margin: "0 0 6px",
          }}
        >
          {card.label}
        </p>
        <a
          href={`mailto:${card.email}`}
          style={{
            fontFamily: FONTS.body,
            fontSize: "15px",
            fontWeight: 600,
            color: COLORS.gold,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          {card.email}
        </a>
      </div>

      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "13.5px",
          color: COLORS.muted,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {card.desc}
      </p>
    </div>
  );
}

function FaqItem({ faq, index }) {
  const [ref, visible] = useFadeIn();
  const [open, setOpen] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${index * 80}ms, transform 0.6s ease ${index * 80}ms`,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "22px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.serif,
            fontSize: "18px",
            fontWeight: 500,
            color: COLORS.cream,
            lineHeight: 1.3,
          }}
        >
          {faq.q}
        </span>
        {open ? (
          <ChevronUp size={16} color={COLORS.gold} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color={COLORS.muted} style={{ flexShrink: 0 }} />
        )}
      </button>
      <div
        style={{
          maxHeight: open ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "14px",
            color: COLORS.muted,
            lineHeight: 1.7,
            margin: "0 0 22px",
            paddingRight: "32px",
          }}
        >
          {faq.a}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: `1px solid rgba(212,176,78,0.2)`,
  borderRadius: "10px",
  padding: "13px 16px",
  fontFamily: FONTS.body,
  fontSize: "14px",
  color: COLORS.cream,
  outline: "none",
  transition: "border-color 0.2s ease",
  display: "block",
  boxSizing: "border-box",
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getFocusStyle = (field) =>
    focusedField === field ? { borderColor: "rgba(212,176,78,0.55)" } : {};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONTS.body,
      }}
    >
      <SEO title="Contact" description="Get in touch with Dealstage — sales, support, and partnership inquiries" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(212,176,78,0.25); color: #f5f0e6; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1c1b19; }
        ::-webkit-scrollbar-thumb { background: rgba(212,176,78,0.3); border-radius: 3px; }
        input::placeholder, textarea::placeholder, select::placeholder { color: rgba(245,240,230,0.28); }
        select option { background: #232220; color: #f5f0e6; }
        @media (max-width: 768px) {
          .ct-form-layout { grid-template-columns: 1fr !important; }
          .ct-field-row { grid-template-columns: 1fr !important; }
          .ct-channel-grid { grid-template-columns: 1fr !important; }
          .ct-nav-links { display: none !important; }
          .ct-nav { padding: 0 16px !important; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-150px",
          right: "-150px",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(212,176,78,0.05) 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-100px",
          left: "-100px",
          width: "450px",
          height: "450px",
          background: `radial-gradient(circle, rgba(224,123,24,0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>

        {/* Hero */}
        <div style={{ paddingTop: "104px", paddingBottom: "72px", textAlign: "center" }}>
          <FadeSection>
            <SectionLabel icon={MessageSquare}>Get in Touch</SectionLabel>
          </FadeSection>

          <FadeSection delay={80}>
            <h1
              style={{
                fontFamily: FONTS.serif,
                fontSize: "clamp(48px, 7vw, 78px)",
                fontWeight: 600,
                color: COLORS.cream,
                lineHeight: 1.07,
                margin: "0 0 20px",
                letterSpacing: "-0.01em",
              }}
            >
              Let's{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                connect
              </span>
            </h1>
          </FadeSection>

          <FadeSection delay={160}>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "18px",
                color: COLORS.muted,
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Whether you're a brand, talent, or agency — we'd love to hear from you. The right person will respond, personally.
            </p>
          </FadeSection>
        </div>

        {/* Contact Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "96px",
          }}
        >
          {contactCards.map((card, i) => (
            <ContactCard key={card.label} card={card} delay={i * 80} />
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,176,78,0.18), transparent)`,
            marginBottom: "96px",
          }}
        />

        {/* Form + Map */}
        <div
          className="ct-form-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "48px",
            alignItems: "start",
            marginBottom: "96px",
          }}
        >
          {/* Form */}
          <FadeSection>
            <SectionLabel icon={Send}>Send a Message</SectionLabel>
            <h2
              style={{
                fontFamily: FONTS.serif,
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 600,
                color: COLORS.cream,
                margin: "0 0 36px",
                lineHeight: 1.15,
              }}
            >
              Tell us what's on your mind
            </h2>

            {submitted ? (
              <div
                style={{
                  background: "rgba(212,176,78,0.05)",
                  border: `1px solid rgba(212,176,78,0.25)`,
                  borderRadius: "16px",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(212,176,78,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    border: `1px solid rgba(212,176,78,0.25)`,
                  }}
                >
                  <CheckCircle size={24} color={COLORS.gold} />
                </div>
                <h3
                  style={{
                    fontFamily: FONTS.serif,
                    fontSize: "26px",
                    fontWeight: 600,
                    color: COLORS.cream,
                    margin: "0 0 10px",
                  }}
                >
                  Message received
                </h3>
                <p
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: "14px",
                    color: COLORS.muted,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  We'll be in touch within one business day. In the meantime, feel free to explore the platform.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div className="ct-field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: COLORS.muted,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Alex Chen"
                      required
                      style={{ ...inputStyle, ...getFocusStyle("name") }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: COLORS.muted,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="alex@company.com"
                      required
                      style={{ ...inputStyle, ...getFocusStyle("email") }}
                    />
                  </div>
                </div>

                <div className="ct-field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: COLORS.muted,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      I am a…
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("role")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={{
                        ...inputStyle,
                        ...getFocusStyle("role"),
                        appearance: "none",
                        WebkitAppearance: "none",
                        cursor: "pointer",
                        color: form.role ? COLORS.cream : "rgba(245,240,230,0.28)",
                      }}
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option value="brand">Brand</option>
                      <option value="talent">Talent</option>
                      <option value="agency">Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: COLORS.muted,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Subject
                    </label>
                    <input
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Pricing inquiry"
                      required
                      style={{ ...inputStyle, ...getFocusStyle("subject") }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: COLORS.muted,
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tell us about your use case, goals, or whatever's on your mind..."
                    required
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "130px",
                      ...getFocusStyle("message"),
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                    border: "none",
                    borderRadius: "10px",
                    padding: "14px 32px",
                    fontFamily: FONTS.body,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: COLORS.bg,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    letterSpacing: "0.02em",
                    alignSelf: "flex-start",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <Send size={15} />
                  Send message
                </button>
              </form>
            )}
          </FadeSection>

          {/* Right Column: Office + Map */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <FadeSection delay={120}>
              <div
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Stylized Map Placeholder */}
                <div
                  style={{
                    height: "200px",
                    background: `
                      linear-gradient(rgba(212,176,78,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(212,176,78,0.03) 1px, transparent 1px),
                      #0a0a08
                    `,
                    backgroundSize: "32px 32px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {/* Faint city silhouette lines */}
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 380 200"
                    style={{ position: "absolute", top: 0, left: 0, opacity: 0.12 }}
                  >
                    <rect x="40" y="100" width="20" height="100" fill={COLORS.gold} />
                    <rect x="65" y="80" width="15" height="120" fill={COLORS.gold} />
                    <rect x="85" y="60" width="25" height="140" fill={COLORS.gold} />
                    <rect x="115" y="90" width="18" height="110" fill={COLORS.gold} />
                    <rect x="138" y="50" width="30" height="150" fill={COLORS.gold} />
                    <rect x="175" y="70" width="22" height="130" fill={COLORS.gold} />
                    <rect x="203" y="85" width="18" height="115" fill={COLORS.gold} />
                    <rect x="226" y="40" width="35" height="160" fill={COLORS.gold} />
                    <rect x="267" y="75" width="20" height="125" fill={COLORS.gold} />
                    <rect x="293" y="95" width="16" height="105" fill={COLORS.gold} />
                    <rect x="315" y="65" width="28" height="135" fill={COLORS.gold} />
                    <rect x="0" y="160" width="380" height="40" fill={COLORS.gold} opacity="0.6" />
                  </svg>

                  {/* Map pin */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.amber})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 24px rgba(212,176,78,0.4)`,
                      }}
                    >
                      <MapPin size={16} color={COLORS.bg} />
                    </div>
                    <div
                      style={{
                        width: 2,
                        height: 16,
                        background: `linear-gradient(${COLORS.gold}, transparent)`,
                      }}
                    />
                  </div>

                  {/* Pulse ring */}
                  <div
                    style={{
                      position: "absolute",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      border: `1px solid rgba(212,176,78,0.2)`,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -58%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: `1px solid rgba(212,176,78,0.08)`,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -55%)",
                    }}
                  />
                </div>

                {/* Office info */}
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        background: "rgba(212,176,78,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid rgba(212,176,78,0.15)`,
                      }}
                    >
                      <Building2 size={16} color={COLORS.gold} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: "14px",
                          fontWeight: 600,
                          color: COLORS.cream,
                          margin: 0,
                        }}
                      >
                        Headquartered in New York
                      </p>
                      <p
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: "11px",
                          color: COLORS.muted,
                          margin: 0,
                        }}
                      >
                        Distributed team globally
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: "13px",
                      color: COLORS.muted,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Our core team is based in Manhattan. We operate remotely across North America, Europe, and Asia-Pacific — wherever great people choose to work.
                  </p>
                </div>
              </div>
            </FadeSection>

            {/* Response time card */}
            <FadeSection delay={200}>
              <div
                style={{
                  background: "rgba(212,176,78,0.04)",
                  border: `1px solid rgba(212,176,78,0.15)`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    marginTop: "6px",
                    flexShrink: 0,
                    boxShadow: "0 0 8px rgba(34,197,94,0.5)",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.cream,
                      margin: "0 0 4px",
                    }}
                  >
                    Typical response: under 4 hours
                  </p>
                  <p
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: "12px",
                      color: COLORS.muted,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Monday – Friday, 9am – 7pm ET. We never route to a bot first.
                  </p>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,176,78,0.18), transparent)`,
            marginBottom: "72px",
          }}
        />

        {/* FAQ */}
        <FadeSection style={{ marginBottom: "16px" }}>
          <SectionLabel icon={HelpCircle}>FAQ</SectionLabel>
          <h2
            style={{
              fontFamily: FONTS.serif,
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 600,
              color: COLORS.cream,
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Common questions
          </h2>
        </FadeSection>

        <div
          style={{
            maxWidth: "720px",
            marginBottom: "96px",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          {faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

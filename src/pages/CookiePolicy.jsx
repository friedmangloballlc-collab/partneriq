import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Cookie, Shield, Settings, BarChart3, Target, ChevronDown, ChevronUp, Mail } from "lucide-react";

const COLORS = {
  bg: "#1c1b19",
  bgCard: "#0f0e0c",
  surface: "#12110e",
  border: "#1e1c18",
  borderGold: "#d4b04e",
  gold: "#d4b04e",
  goldLight: "#d4b56a",
  amber: "#e07b18",
  cream: "#f5f0e6",
  creamMuted: "#b8b0a0",
  creamDim: "#6b6459",
};

const fontStack = {
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Instrument Mono', 'Courier New', monospace",
};

const cookieTypes = [
  {
    icon: Shield,
    name: "Essential Cookies",
    key: "essential",
    color: COLORS.gold,
    canDisable: false,
    description:
      "These cookies are strictly necessary for the website to function and cannot be disabled. They are set in response to your actions such as logging in, setting privacy preferences, or completing forms.",
    examples: [
      "Authentication tokens and session identifiers",
      "Security cookies to prevent cross-site request forgery",
      "Load balancing cookies to ensure service performance",
      "User preference cookies set during your current session",
    ],
  },
  {
    icon: BarChart3,
    name: "Analytics Cookies",
    key: "analytics",
    color: "#6366f1",
    canDisable: true,
    description:
      "These cookies allow us to count visits and understand traffic sources so we can measure and improve performance. All information is aggregated and therefore anonymous.",
    examples: [
      "Page view counts and session duration tracking",
      "Navigation paths and feature usage patterns",
      "Error reporting and performance measurement",
      "A/B testing to improve platform experience",
    ],
  },
  {
    icon: Settings,
    name: "Preference Cookies",
    key: "preferences",
    color: COLORS.amber,
    canDisable: true,
    description:
      "These cookies enable enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages.",
    examples: [
      "Language and region preferences",
      "Dashboard layout and column configurations",
      "Notification preferences and display settings",
      "Recently viewed profiles and saved searches",
    ],
  },
  {
    icon: Target,
    name: "Marketing Cookies",
    key: "marketing",
    color: "#ec4899",
    canDisable: true,
    description:
      "These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites.",
    examples: [
      "Retargeting pixels for advertising campaigns",
      "Conversion tracking for paid acquisition channels",
      "Social media integration and sharing functionality",
      "Interest-based advertising personalisation",
    ],
  },
];

const cookieTable = [
  {
    name: "_ds_session",
    provider: "Dealstage",
    purpose: "Maintains your authenticated session across page loads",
    duration: "Session",
    type: "Essential",
  },
  {
    name: "_ds_csrf",
    provider: "Dealstage",
    purpose: "Prevents cross-site request forgery attacks",
    duration: "Session",
    type: "Essential",
  },
  {
    name: "_ds_prefs",
    provider: "Dealstage",
    purpose: "Stores dashboard layout and UI preferences",
    duration: "1 year",
    type: "Preference",
  },
  {
    name: "_ga",
    provider: "Google Analytics",
    purpose: "Distinguishes unique users for traffic analysis",
    duration: "2 years",
    type: "Analytics",
  },
  {
    name: "_ga_*",
    provider: "Google Analytics",
    purpose: "Maintains session state for analytics measurement",
    duration: "2 years",
    type: "Analytics",
  },
  {
    name: "__stripe_mid",
    provider: "Stripe",
    purpose: "Fraud prevention and payment security verification",
    duration: "1 year",
    type: "Essential",
  },
  {
    name: "__stripe_sid",
    provider: "Stripe",
    purpose: "Session identifier for payment processing flows",
    duration: "30 minutes",
    type: "Essential",
  },
  {
    name: "sb-auth-token",
    provider: "Supabase",
    purpose: "Secure authentication token for database access",
    duration: "1 hour",
    type: "Essential",
  },
  {
    name: "_ds_fbp",
    provider: "Meta",
    purpose: "Identifies browsers for conversion tracking",
    duration: "3 months",
    type: "Marketing",
  },
  {
    name: "_ds_utm",
    provider: "Dealstage",
    purpose: "Tracks marketing campaign attribution",
    duration: "30 days",
    type: "Analytics",
  },
];

const thirdParties = [
  {
    name: "Stripe",
    purpose: "Payment processing and fraud prevention",
    link: "https://stripe.com/privacy",
    policy: "stripe.com/privacy",
  },
  {
    name: "Google Analytics",
    purpose: "Website usage analytics and performance measurement",
    link: "https://policies.google.com/privacy",
    policy: "policies.google.com/privacy",
  },
  {
    name: "Supabase",
    purpose: "Database authentication and infrastructure",
    link: "https://supabase.com/privacy",
    policy: "supabase.com/privacy",
  },
  {
    name: "Meta (Facebook)",
    purpose: "Advertising conversion tracking and retargeting",
    link: "https://www.facebook.com/privacy/policy",
    policy: "facebook.com/privacy/policy",
  },
];

const typeColor = (type) => {
  const map = {
    Essential: COLORS.gold,
    Analytics: "#6366f1",
    Preference: COLORS.amber,
    Marketing: "#ec4899",
  };
  return map[type] || COLORS.creamDim;
};

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <span
          style={{
            fontFamily: fontStack.mono,
            fontSize: 11,
            color: COLORS.gold,
            letterSpacing: "0.12em",
            flexShrink: 0,
          }}
        >
          {String(number).padStart(2, "0")}
        </span>
        <h2
          style={{
            fontFamily: fontStack.serif,
            fontSize: 26,
            fontWeight: 400,
            color: COLORS.cream,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Para({ children, style = {} }) {
  return (
    <p
      style={{
        fontSize: 14,
        lineHeight: 1.8,
        color: COLORS.creamMuted,
        margin: "0 0 14px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export default function CookiePolicy() {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        fontFamily: fontStack.body,
        color: COLORS.cream,
      }}
    >
      <SEO title="Cookie Policy" description="How Dealstage uses cookies and how to manage your preferences" />
      <style>{`
        .ck-cookie-card:hover { border-color: #2a271f !important; }
        .ck-accordion-hd:hover { background: #141310 !important; }
        .ck-tp-row:hover td { background: #12110e !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Hero */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "80px 24px 60px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(212,176,78,0.07)",
              border: `1px solid rgba(212,176,78,0.2)`,
              borderRadius: 100,
              padding: "5px 14px",
              marginBottom: 28,
            }}
          >
            <Cookie size={12} color={COLORS.gold} />
            <span
              style={{
                fontFamily: fontStack.mono,
                fontSize: 10,
                letterSpacing: "0.14em",
                color: COLORS.gold,
                textTransform: "uppercase",
              }}
            >
              Legal Document
            </span>
          </div>

          <h1
            style={{
              fontFamily: fontStack.serif,
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: COLORS.cream,
              margin: "0 0 16px",
            }}
          >
            Cookie Policy
          </h1>

          <p
            style={{
              fontSize: 15,
              color: COLORS.creamMuted,
              margin: "0 0 24px",
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            This policy explains how Dealstage uses cookies and similar
            tracking technologies when you visit our platform. We believe in
            transparency — this document explains exactly what we use, why,
            and how you can control it.
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: COLORS.creamDim,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Effective Date
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: COLORS.cream,
                  fontWeight: 500,
                }}
              >
                March 1, 2026
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: COLORS.creamDim,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Last Reviewed
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: COLORS.cream,
                  fontWeight: 500,
                }}
              >
                March 1, 2026
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: COLORS.creamDim,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Controller
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: COLORS.cream,
                  fontWeight: 500,
                }}
              >
                DealStage LLC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Section 1 */}
        <Section number={1} title="What Are Cookies">
          <Para>
            Cookies are small text files that are stored on your device (computer,
            tablet, or mobile phone) when you visit a website. They allow the
            website to recognise your device and remember certain information about
            your visit — such as your preferred language and other settings.
          </Para>
          <Para>
            Cookies serve many functions. Some cookies are essential — without them,
            the website simply would not work. Others help us understand how our
            platform is used, allow us to remember your preferences, or enable us
            to deliver relevant advertising. We also use similar technologies such
            as pixels, web beacons, and local storage, all of which this policy
            covers collectively under the term "cookies."
          </Para>
          <Para>
            Cookies do not typically contain information that personally identifies
            you. However, personal information that we store about you may be linked
            to the information stored in and obtained from cookies. Please read this
            policy together with our Privacy Policy for a complete picture.
          </Para>
        </Section>

        {/* Section 2 */}
        <Section number={2} title="How We Use Cookies">
          <Para style={{ marginBottom: 24 }}>
            We categorise the cookies we use into four types. You can control
            which non-essential cookies are active via your browser settings or
            our cookie preference centre.
          </Para>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cookieTypes.map((ct) => {
              const Icon = ct.icon;
              const isOpen = expanded[ct.key];
              return (
                <div
                  key={ct.key}
                  className="ck-cookie-card"
                  style={{
                    background: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    className="ck-accordion-hd"
                    onClick={() => toggle(ct.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "18px 20px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${ct.color}15`,
                        border: `1px solid ${ct.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={ct.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: COLORS.cream,
                          marginBottom: 2,
                        }}
                      >
                        {ct.name}
                      </div>
                      <div
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: ct.canDisable ? COLORS.amber : COLORS.gold,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {ct.canDisable ? "Optional — can be disabled" : "Required — always active"}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} color={COLORS.creamDim} />
                    ) : (
                      <ChevronDown size={16} color={COLORS.creamDim} />
                    )}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 20px 20px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Para style={{ marginTop: 16 }}>{ct.description}</Para>
                      <div
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: COLORS.creamDim,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                          marginTop: 16,
                        }}
                      >
                        Examples
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          padding: "0 0 0 16px",
                          listStyleType: "none",
                        }}
                      >
                        {ct.examples.map((ex, ei) => (
                          <li
                            key={ei}
                            style={{
                              position: "relative",
                              fontSize: 13,
                              color: COLORS.creamMuted,
                              lineHeight: 1.65,
                              marginBottom: 6,
                              paddingLeft: 4,
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: -12,
                                color: ct.color,
                              }}
                            >
                              ›
                            </span>
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 3 — Cookie table */}
        <Section number={3} title="Cookies We Use">
          <Para style={{ marginBottom: 24 }}>
            The following table lists the specific cookies set by Dealstage and
            our service providers. This list is reviewed and updated regularly.
          </Para>

          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: COLORS.surface,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {["Cookie Name", "Provider", "Purpose", "Duration", "Type"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          fontWeight: 500,
                          color: COLORS.creamDim,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {cookieTable.map((row, i) => (
                  <tr
                    key={i}
                    className="ck-tp-row"
                    style={{
                      borderBottom:
                        i < cookieTable.length - 1
                          ? `1px solid ${COLORS.border}`
                          : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                        color: COLORS.gold,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: COLORS.creamMuted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.provider}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: COLORS.creamMuted,
                        lineHeight: 1.5,
                        minWidth: 180,
                      }}
                    >
                      {row.purpose}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: COLORS.creamDim,
                        whiteSpace: "nowrap",
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                      }}
                    >
                      {row.duration}
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: typeColor(row.type),
                          background: `${typeColor(row.type)}15`,
                          border: `1px solid ${typeColor(row.type)}30`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {row.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section 4 — Third parties */}
        <Section number={4} title="Third-Party Cookies">
          <Para style={{ marginBottom: 24 }}>
            Some cookies on our platform are set by third-party services that appear
            on our pages. We do not control these cookies. You should refer to the
            respective third-party privacy policies for information about how they
            use cookies.
          </Para>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {thirdParties.map((tp, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: fontStack.serif,
                    fontSize: 18,
                    fontWeight: 500,
                    color: COLORS.cream,
                    marginBottom: 8,
                  }}
                >
                  {tp.name}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: COLORS.creamMuted,
                    margin: "0 0 12px",
                  }}
                >
                  {tp.purpose}
                </p>
                <div
                  style={{
                    fontFamily: fontStack.mono,
                    fontSize: 11,
                    color: COLORS.gold,
                    letterSpacing: "0.04em",
                  }}
                >
                  {tp.policy}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5 — Managing cookies */}
        <Section number={5} title="Managing Your Cookies">
          <Para>
            You have the right to decide whether to accept or reject non-essential
            cookies. You can exercise your cookie preferences by adjusting your
            browser settings or by using our in-platform preference centre (available
            in your account settings under Privacy).
          </Para>
          <Para>
            Most web browsers allow you to control cookies through their settings.
            These are typically found in the "Settings," "Options," or "Preferences"
            menu of your browser. You can also delete existing cookies through these
            settings. Note that blocking or deleting cookies may impact your
            experience of our platform — some features may not function correctly
            without essential cookies.
          </Para>
          <Para>
            To opt out of being tracked by Google Analytics across all websites,
            you can install the{" "}
            <span style={{ color: COLORS.gold }}>
              Google Analytics Opt-out Browser Add-on
            </span>
            . For interest-based advertising, you can opt out via the{" "}
            <span style={{ color: COLORS.gold }}>
              Digital Advertising Alliance
            </span>{" "}
            or the{" "}
            <span style={{ color: COLORS.gold }}>
              Network Advertising Initiative
            </span>
            .
          </Para>

          <div
            style={{
              background: "rgba(212,176,78,0.06)",
              border: `1px solid rgba(212,176,78,0.2)`,
              borderRadius: 10,
              padding: "20px 24px",
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontFamily: fontStack.mono,
                fontSize: 10,
                color: COLORS.gold,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Browser-specific guides
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px 20px",
                flexWrap: "wrap",
              }}
            >
              {[
                "Chrome",
                "Firefox",
                "Safari",
                "Edge",
                "Opera",
                "iOS Safari",
              ].map((b) => (
                <span
                  key={b}
                  style={{
                    fontFamily: fontStack.mono,
                    fontSize: 12,
                    color: COLORS.creamMuted,
                    textDecoration: "underline",
                    textDecorationColor: COLORS.border,
                    cursor: "pointer",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* Section 6 — Contact */}
        <Section number={6} title="Contact Us">
          <Para>
            If you have questions about our use of cookies or this policy, please
            contact our Privacy team. We aim to respond to all privacy inquiries
            within 5 business days.
          </Para>

          <div
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(212,176,78,0.1)",
                border: `1px solid rgba(212,176,78,0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mail size={18} color={COLORS.gold} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: COLORS.creamDim,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Privacy Team
              </div>
              <a
                href="mailto:privacy@thedealstage.com"
                style={{
                  fontFamily: fontStack.serif,
                  fontSize: 18,
                  color: COLORS.gold,
                  textDecoration: "none",
                  fontWeight: 400,
                }}
              >
                privacy@thedealstage.com
              </a>
            </div>
          </div>

          <Para style={{ marginTop: 20 }}>
            <strong style={{ color: COLORS.cream }}>DealStage LLC</strong>
            <br />
            This Cookie Policy is governed by and should be read in conjunction
            with our{" "}
            <span style={{ color: COLORS.gold }}>Privacy Policy</span> and{" "}
            <span style={{ color: COLORS.gold }}>Terms of Service</span>.
            We reserve the right to update this policy at any time. Material
            changes will be communicated via email or an in-platform notice.
          </Para>
        </Section>
      </div>
    </div>
  );
}

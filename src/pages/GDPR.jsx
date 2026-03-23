import React, { useState } from "react";
import SEO from "@/components/SEO";
import {
  Shield,
  Eye,
  Edit3,
  Trash2,
  Download,
  Pause,
  XCircle,
  UserCheck,
  Lock,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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

const rights = [
  {
    icon: Eye,
    title: "Right of Access",
    article: "Art. 15 GDPR",
    color: COLORS.gold,
    description:
      "You have the right to obtain confirmation of whether we process your personal data, and if so, to access a copy of that data along with supplementary information about how it is processed.",
    howTo:
      "Submit a Subject Access Request (SAR) via your account settings or by emailing our DPO. We will respond within 30 days.",
  },
  {
    icon: Edit3,
    title: "Right to Rectification",
    article: "Art. 16 GDPR",
    color: "#6366f1",
    description:
      "You have the right to obtain rectification of inaccurate personal data we hold about you. You also have the right to have incomplete personal data completed.",
    howTo:
      "Update your profile directly in account settings, or contact us if you believe other data we hold is inaccurate.",
  },
  {
    icon: Trash2,
    title: "Right to Erasure",
    article: "Art. 17 GDPR",
    color: "#ef4444",
    description:
      "Also known as the 'right to be forgotten.' You can request deletion of your personal data where it is no longer necessary, you withdraw consent, or you object to processing.",
    howTo:
      "Request account deletion via Settings > Account > Delete Account. Data is removed within 30 days. Some data may be retained for legal obligations.",
  },
  {
    icon: Download,
    title: "Right to Portability",
    article: "Art. 20 GDPR",
    color: COLORS.amber,
    description:
      "You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.",
    howTo:
      "Request a full data export from Settings > Privacy > Export My Data. You will receive a JSON file within 72 hours.",
  },
  {
    icon: Pause,
    title: "Right to Restriction",
    article: "Art. 18 GDPR",
    color: "#8b5cf6",
    description:
      "You have the right to restrict the processing of your personal data in certain circumstances — for example, if you contest the accuracy of the data or have objected to processing.",
    howTo:
      "Contact our DPO to request restriction of processing. We will confirm the restriction in writing within 5 business days.",
  },
  {
    icon: XCircle,
    title: "Right to Object",
    article: "Art. 21 GDPR",
    color: "#ec4899",
    description:
      "You have the right to object to processing of your personal data where we rely on legitimate interests as our legal basis, and to object to processing for direct marketing purposes at any time.",
    howTo:
      "Opt out of marketing via email unsubscribe links or account notification settings. For other objections, contact our DPO.",
  },
];

const processingActivities = [
  {
    activity: "Account Registration & Authentication",
    data: "Name, email address, role, company",
    legalBasis: "Contract Performance",
    basisDetail: "Art. 6(1)(b) — Necessary to provide the service",
    retention: "Duration of account + 30 days post-deletion",
  },
  {
    activity: "Payment Processing",
    data: "Transaction records, subscription status, billing address",
    legalBasis: "Contract Performance",
    basisDetail: "Art. 6(1)(b) — Necessary to process payments",
    retention: "7 years (tax and financial regulations)",
  },
  {
    activity: "Platform Analytics & Improvement",
    data: "Usage patterns, feature interactions, performance data",
    legalBasis: "Legitimate Interests",
    basisDetail: "Art. 6(1)(f) — Improving the platform",
    retention: "26 months (aggregated after 13 months)",
  },
  {
    activity: "AI-Powered Matching & Recommendations",
    data: "Profile data, engagement history, deal preferences",
    legalBasis: "Contract Performance",
    basisDetail: "Art. 6(1)(b) — Core feature delivery",
    retention: "Duration of account",
  },
  {
    activity: "Marketing Communications",
    data: "Email address, communication preferences",
    legalBasis: "Consent",
    basisDetail: "Art. 6(1)(a) — Explicit opt-in required",
    retention: "Until consent is withdrawn",
  },
  {
    activity: "Security & Fraud Prevention",
    data: "IP addresses, login timestamps, security events",
    legalBasis: "Legitimate Interests",
    basisDetail: "Art. 6(1)(f) — Platform security",
    retention: "12 months",
  },
  {
    activity: "Legal Compliance",
    data: "Communications, transaction records",
    legalBasis: "Legal Obligation",
    basisDetail: "Art. 6(1)(c) — Applicable laws",
    retention: "As required by applicable law",
  },
];

const retentionPeriods = [
  {
    category: "Account & Profile Data",
    period: "Duration of account",
    postDeletion: "30 days",
    notes: "Deleted upon account closure request",
  },
  {
    category: "Financial & Payment Records",
    period: "7 years",
    postDeletion: "N/A",
    notes: "Required by tax and financial regulations",
  },
  {
    category: "Partnership & Deal Records",
    period: "Duration of account",
    postDeletion: "90 days",
    notes: "Retained briefly for dispute resolution",
  },
  {
    category: "Usage & Analytics Data",
    period: "13 months (identifiable)",
    postDeletion: "Aggregated indefinitely",
    notes: "Anonymised data may be retained longer",
  },
  {
    category: "Communications & Support",
    period: "3 years",
    postDeletion: "N/A",
    notes: "For service quality and compliance",
  },
  {
    category: "Security & Audit Logs",
    period: "12 months",
    postDeletion: "N/A",
    notes: "For security investigation purposes",
  },
  {
    category: "Marketing Consent Records",
    period: "Until withdrawn + 3 years",
    postDeletion: "N/A",
    notes: "Proof of consent retained for compliance",
  },
];

const legalBasisColor = (basis) => {
  const map = {
    "Contract Performance": COLORS.gold,
    "Legitimate Interests": COLORS.amber,
    Consent: "#6366f1",
    "Legal Obligation": "#22c55e",
  };
  return map[basis] || COLORS.creamDim;
};

function Section({ number, title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div
        style={{
          paddingBottom: 18,
          borderBottom: `1px solid ${COLORS.border}`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            marginBottom: subtitle ? 6 : 0,
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
        {subtitle && (
          <p
            style={{
              fontSize: 13,
              color: COLORS.creamDim,
              margin: "0 0 0 29px",
              fontWeight: 300,
            }}
          >
            {subtitle}
          </p>
        )}
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

export default function GDPR() {
  const [expandedRight, setExpandedRight] = useState(null);

  const toggleRight = (i) =>
    setExpandedRight((prev) => (prev === i ? null : i));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        fontFamily: fontStack.body,
        color: COLORS.cream,
      }}
    >
      <SEO title="GDPR Compliance" description="Your data rights and our commitment to GDPR compliance" />
      <style>{`
        .gdpr-right-btn:hover { background: #141310 !important; }
        .gdpr-table-row:hover td { background: #12110e !important; }
        .gdpr-step:hover { border-color: #2a271f !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Hero */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient orb */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,176,78,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
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
            <Shield size={12} color={COLORS.gold} />
            <span
              style={{
                fontFamily: fontStack.mono,
                fontSize: 10,
                letterSpacing: "0.14em",
                color: COLORS.gold,
                textTransform: "uppercase",
              }}
            >
              Legal Document · EU/UK GDPR
            </span>
          </div>

          <h1
            style={{
              fontFamily: fontStack.serif,
              fontSize: "clamp(40px, 6vw, 68px)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: COLORS.cream,
              margin: "0 0 12px",
            }}
          >
            GDPR Compliance
          </h1>

          <p
            style={{
              fontFamily: fontStack.serif,
              fontSize: 22,
              fontWeight: 300,
              color: COLORS.gold,
              margin: "0 0 24px",
              fontStyle: "italic",
            }}
          >
            Your data rights, our commitment.
          </p>

          <p
            style={{
              fontSize: 15,
              color: COLORS.creamMuted,
              margin: "0 0 36px",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: 620,
            }}
          >
            At Dealstage, we take our obligations under the EU General Data
            Protection Regulation (GDPR) and the UK GDPR seriously. This
            document explains how we handle your personal data, the legal
            bases for doing so, and how you can exercise your rights.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Regulation", value: "EU GDPR 2016/679 · UK GDPR" },
              { label: "Effective Date", value: "March 1, 2026" },
              { label: "Controller", value: "DealStage LLC" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: "12px 18px",
                }}
              >
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
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: COLORS.cream,
                    fontWeight: 500,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
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
        {/* Section 1 — Commitment */}
        <Section number={1} title="Our Commitment to Data Protection">
          <Para>
            DealStage LLC acts as the data controller for personal data processed
            through the Dealstage platform. We are committed to handling your
            personal data in accordance with the principles set out in Article 5
            of the GDPR: lawfulness, fairness and transparency; purpose limitation;
            data minimisation; accuracy; storage limitation; integrity and
            confidentiality; and accountability.
          </Para>
          <Para>
            We process only the personal data that is necessary to provide our
            services, improve the platform, and comply with our legal obligations.
            We do not sell your personal data to third parties, and we do not
            process your data in ways that you would not reasonably expect.
          </Para>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginTop: 24,
            }}
          >
            {[
              { icon: Shield, label: "Privacy by Design", desc: "Data protection built into every feature from the ground up" },
              { icon: Lock, label: "Data Minimisation", desc: "We collect only what is strictly necessary for each purpose" },
              { icon: UserCheck, label: "Accountability", desc: "Dedicated DPO and regular data protection impact assessments" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(212,176,78,0.1)",
                      border: `1px solid rgba(212,176,78,0.2)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Icon size={16} color={COLORS.gold} />
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: COLORS.cream,
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: COLORS.creamDim,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 2 — Rights */}
        <Section
          number={2}
          title="Your Rights Under GDPR"
          subtitle="Chapter III of the GDPR confers the following rights upon data subjects"
        >
          <Para style={{ marginBottom: 24 }}>
            As a data subject, you have significant rights regarding your personal
            data. These rights apply to all users of the Dealstage platform,
            regardless of your location, where we process data subject to GDPR.
          </Para>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rights.map((right, i) => {
              const Icon = right.icon;
              const isOpen = expandedRight === i;
              return (
                <div
                  key={i}
                  style={{
                    background: COLORS.bgCard,
                    border: `1px solid ${isOpen ? right.color + "40" : COLORS.border}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    className="gdpr-right-btn"
                    onClick={() => toggleRight(i)}
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
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: `${right.color}12`,
                        border: `1px solid ${right.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={right.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: COLORS.cream,
                          marginBottom: 2,
                        }}
                      >
                        {right.title}
                      </div>
                      <div
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: right.color,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {right.article}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={15} color={COLORS.creamDim} />
                    ) : (
                      <ChevronDown size={15} color={COLORS.creamDim} />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 20px 22px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Para style={{ marginTop: 18 }}>{right.description}</Para>
                      <div
                        style={{
                          background: `${right.color}08`,
                          border: `1px solid ${right.color}20`,
                          borderRadius: 8,
                          padding: "14px 16px",
                          marginTop: 12,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: fontStack.mono,
                            fontSize: 10,
                            color: right.color,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          How to exercise this right
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: COLORS.creamMuted,
                            margin: 0,
                            lineHeight: 1.65,
                          }}
                        >
                          {right.howTo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 3 — Processing activities */}
        <Section
          number={3}
          title="How We Process Your Data"
          subtitle="Legal basis for each processing activity under Article 6 GDPR"
        >
          <Para style={{ marginBottom: 24 }}>
            Every processing activity we carry out has a specific legal basis
            under Article 6 of the GDPR. The table below sets out our main
            processing activities and their respective legal bases.
          </Para>

          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: COLORS.surface,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {["Processing Activity", "Data Involved", "Legal Basis", "Retention"].map(
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
                {processingActivities.map((row, i) => (
                  <tr
                    key={i}
                    className="gdpr-table-row"
                    style={{
                      borderBottom:
                        i < processingActivities.length - 1
                          ? `1px solid ${COLORS.border}`
                          : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.cream,
                        fontSize: 12,
                        fontWeight: 500,
                        minWidth: 160,
                        lineHeight: 1.5,
                      }}
                    >
                      {row.activity}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.creamMuted,
                        fontSize: 11,
                        lineHeight: 1.5,
                        minWidth: 140,
                      }}
                    >
                      {row.data}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        minWidth: 130,
                        verticalAlign: "top",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: legalBasisColor(row.legalBasis),
                          background: `${legalBasisColor(row.legalBasis)}12`,
                          border: `1px solid ${legalBasisColor(row.legalBasis)}30`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          letterSpacing: "0.05em",
                          marginBottom: 4,
                        }}
                      >
                        {row.legalBasis}
                      </span>
                      <div
                        style={{
                          fontFamily: fontStack.mono,
                          fontSize: 10,
                          color: COLORS.creamDim,
                          lineHeight: 1.4,
                        }}
                      >
                        {row.basisDetail}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: COLORS.creamDim,
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                        lineHeight: 1.5,
                        minWidth: 120,
                      }}
                    >
                      {row.retention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section 4 — Retention */}
        <Section
          number={4}
          title="Data Retention Periods"
          subtitle="We retain personal data only for as long as necessary"
        >
          <Para style={{ marginBottom: 24 }}>
            We have established retention periods for each category of personal
            data, taking into account our contractual obligations, legal requirements,
            and legitimate business interests. Data that is no longer required is
            securely deleted or anonymised.
          </Para>

          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: COLORS.surface,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {["Data Category", "Retention Period", "Post-Deletion", "Notes"].map(
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
                {retentionPeriods.map((row, i) => (
                  <tr
                    key={i}
                    className="gdpr-table-row"
                    style={{
                      borderBottom:
                        i < retentionPeriods.length - 1
                          ? `1px solid ${COLORS.border}`
                          : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "13px 16px",
                        color: COLORS.cream,
                        fontWeight: 500,
                        minWidth: 150,
                        lineHeight: 1.4,
                        fontSize: 12,
                      }}
                    >
                      {row.category}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                        color: COLORS.gold,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.period}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: fontStack.mono,
                        fontSize: 11,
                        color: COLORS.creamDim,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.postDeletion}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: COLORS.creamMuted,
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section 5 — International transfers */}
        <Section number={5} title="International Data Transfers">
          <Para>
            DealStage LLC is incorporated in the United States. When personal
            data originating from the European Economic Area (EEA) or the United
            Kingdom is transferred to the United States, we ensure that appropriate
            safeguards are in place as required by Chapter V of the GDPR.
          </Para>
          <Para>
            We rely on the following transfer mechanisms to ensure that your
            personal data is protected to a standard equivalent to that in the EEA:
          </Para>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              {
                mechanism: "EU Standard Contractual Clauses (SCCs)",
                detail:
                  "We have executed the 2021 EU Standard Contractual Clauses with all relevant processors and controllers in third countries. These clauses are approved by the European Commission and provide an adequate level of protection.",
                icon: CheckCircle,
                color: COLORS.gold,
              },
              {
                mechanism: "UK International Data Transfer Agreements (IDTAs)",
                detail:
                  "For transfers of personal data subject to UK GDPR, we have entered into International Data Transfer Agreements incorporating the UK addendum to the EU SCCs, approved by the UK Information Commissioner's Office.",
                icon: CheckCircle,
                color: COLORS.gold,
              },
              {
                mechanism: "Data Processing Agreements",
                detail:
                  "All third-party processors (including Supabase, Stripe, and analytics providers) have entered into comprehensive data processing agreements that set out their obligations with respect to your personal data.",
                icon: CheckCircle,
                color: COLORS.gold,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "18px",
                    background: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                  }}
                >
                  <Icon
                    size={16}
                    color={item.color}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: COLORS.cream,
                        marginBottom: 6,
                      }}
                    >
                      {item.mechanism}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: COLORS.creamMuted,
                        margin: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: "rgba(224,123,24,0.06)",
              border: `1px solid rgba(224,123,24,0.2)`,
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              gap: 12,
            }}
          >
            <AlertCircle
              size={15}
              color={COLORS.amber}
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <p
              style={{
                fontSize: 13,
                color: COLORS.creamMuted,
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              You have the right to obtain a copy of the transfer mechanisms we
              rely upon. Contact our DPO at{" "}
              <span style={{ color: COLORS.gold }}>dpo@thedealstage.com</span>{" "}
              to request this information.
            </p>
          </div>
        </Section>

        {/* Section 6 — DPO */}
        <Section number={6} title="Data Protection Officer">
          <Para>
            In accordance with Article 37 of the GDPR, DealStage LLC has appointed
            a Data Protection Officer (DPO). The DPO is responsible for overseeing
            our data protection strategy, ensuring compliance with GDPR, and acting
            as the primary point of contact for data subjects and supervisory
            authorities.
          </Para>
          <Para>
            You have the right to contact our DPO directly regarding any matters
            relating to the processing of your personal data or the exercise of
            your rights under GDPR. All communications are treated with strict
            confidentiality.
          </Para>

          <div
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "28px",
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, rgba(212,176,78,0.2) 0%, rgba(224,123,24,0.2) 100%)",
                border: `1px solid rgba(212,176,78,0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <UserCheck size={22} color={COLORS.gold} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10,
                  color: COLORS.creamDim,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Data Protection Officer
              </div>
              <div
                style={{
                  fontFamily: fontStack.serif,
                  fontSize: 20,
                  fontWeight: 500,
                  color: COLORS.cream,
                  marginBottom: 4,
                }}
              >
                DealStage LLC
              </div>
              <a
                href="mailto:dpo@thedealstage.com"
                style={{
                  fontFamily: fontStack.serif,
                  fontSize: 18,
                  color: COLORS.gold,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Mail size={14} color={COLORS.gold} />
                dpo@thedealstage.com
              </a>
              <p
                style={{
                  fontSize: 13,
                  color: COLORS.creamDim,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Response time: within 30 days of receipt (extendable by a
                further two months where necessary, with notice). For urgent
                matters relating to data breaches, responses are provided within
                72 hours.
              </p>
            </div>
          </div>

          <Para style={{ marginTop: 20 }}>
            You also have the right to lodge a complaint with your local supervisory
            authority. In the EU, this is your national Data Protection Authority.
            In the UK, this is the Information Commissioner's Office (ICO) at{" "}
            <span style={{ color: COLORS.gold }}>ico.org.uk</span>. We encourage
            you to contact us first so we can address your concern directly.
          </Para>
        </Section>

        {/* Section 7 — How to exercise */}
        <Section number={7} title="How to Exercise Your Rights">
          <Para style={{ marginBottom: 28 }}>
            To exercise any of the rights described in Section 2, follow the
            steps below. We are required to respond without undue delay and in
            any event within one calendar month of receipt of your request.
          </Para>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              {
                step: "01",
                title: "Identify your request",
                desc: "Determine which right you wish to exercise (access, erasure, portability, etc.) and gather any relevant details that will help us locate your data accurately.",
              },
              {
                step: "02",
                title: "Submit your request",
                desc: "Send your request to dpo@thedealstage.com or via the Privacy section of your account settings. Include your full name, the email address associated with your account, and a description of your request.",
              },
              {
                step: "03",
                title: "Identity verification",
                desc: "To protect your data, we will verify your identity before processing your request. We may ask for additional information to confirm you are the account holder.",
              },
              {
                step: "04",
                title: "Processing & response",
                desc: "We will process your request and provide a response within 30 days. Complex requests may take up to 90 days — we will notify you within the initial 30-day period if an extension is required.",
              },
              {
                step: "05",
                title: "Escalation",
                desc: "If you are unsatisfied with our response, you have the right to escalate to your national supervisory authority. We will provide full cooperation with any investigation.",
              },
            ].map((item, i, arr) => (
              <div
                key={i}
                className="gdpr-step"
                style={{
                  display: "flex",
                  gap: 0,
                  position: "relative",
                }}
              >
                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 20,
                      top: 44,
                      bottom: -12,
                      width: 1,
                      background: COLORS.border,
                      zIndex: 0,
                    }}
                  />
                )}

                <div
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(212,176,78,0.1)",
                    border: `1px solid rgba(212,176,78,0.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fontStack.mono,
                    fontSize: 11,
                    color: COLORS.gold,
                    zIndex: 1,
                    marginRight: 20,
                    marginBottom: i < arr.length - 1 ? 0 : 0,
                  }}
                >
                  {item.step}
                </div>

                <div
                  style={{
                    paddingBottom: i < arr.length - 1 ? 28 : 0,
                    paddingTop: 8,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: COLORS.cream,
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: COLORS.creamMuted,
                      margin: 0,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div
            style={{
              marginTop: 36,
              background: "rgba(212,176,78,0.05)",
              border: `1px solid rgba(212,176,78,0.2)`,
              borderRadius: 12,
              padding: "24px",
            }}
          >
            <div
              style={{
                fontFamily: fontStack.mono,
                fontSize: 10,
                color: COLORS.gold,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Contact for Data Rights Requests
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
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
                  Data Protection Officer
                </div>
                <a
                  href="mailto:dpo@thedealstage.com"
                  style={{
                    fontSize: 14,
                    color: COLORS.gold,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  dpo@thedealstage.com
                </a>
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
                  General Privacy Enquiries
                </div>
                <a
                  href="mailto:privacy@thedealstage.com"
                  style={{
                    fontSize: 14,
                    color: COLORS.gold,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  privacy@thedealstage.com
                </a>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

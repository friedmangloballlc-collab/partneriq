import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Download,
  Sparkles,
  Loader2,
  CheckCircle2,
  Save,
  Eye,
  ChevronRight,
  X,
  Handshake,
} from "lucide-react";
// jsPDF dynamically imported in generatePDF to reduce bundle size

// ── Template definitions ──────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "sponsored_post",
    name: "Sponsored Post / Content Creation",
    description:
      "Single or multi-post campaign with defined deliverables, usage rights, and FTC compliance.",
    color: "from-indigo-500 to-purple-600",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    clauses: [
      "Deliverables specification (post count, format, platform)",
      "Usage rights: 30 / 60 / 90 day license",
      "Exclusivity window and category definition",
      "FTC #ad disclosure requirement",
      "Kill fee (50% of fee if brand cancels post-approval)",
      "Revision limit (up to 2 rounds)",
    ],
    template: (f) => `SPONSORED CONTENT AGREEMENT

This Sponsored Content Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

TALENT: ${f.talentName || "[TALENT NAME]"}
BRAND: ${f.brandName || "[BRAND NAME]"}

1. DELIVERABLES
Talent agrees to create and publish the following content on ${f.platform || "[PLATFORM]"}:
- Content type: Sponsored post(s) per the agreed campaign brief
- Publishing deadline: Per campaign schedule agreed by both parties

2. COMPENSATION
Brand agrees to pay Talent a flat fee of ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD.
Payment is due within 15 business days of content approval.

3. USAGE RIGHTS
Brand is granted a ${f.duration || "30"}-day non-exclusive license to repurpose the content for paid media, organic social, and internal use. All rights revert to Talent upon expiration unless extended via written amendment.

4. EXCLUSIVITY
Talent agrees not to create sponsored content for direct competitors within the ${f.exclusivityCategory || "[CATEGORY]"} category for a period of ${f.exclusivityDays || "30"} days following the last deliverable publish date.

5. FTC DISCLOSURE
All content must prominently include "#ad", "#sponsored", or equivalent FTC-compliant disclosure. Failure to disclose constitutes a material breach.

6. KILL FEE
If Brand cancels this agreement after Talent has submitted content for approval, Brand owes a kill fee equal to 50% of the contracted fee.

7. REVISIONS
Talent will provide up to 2 rounds of revisions based on Brand feedback. Additional revisions will be billed at $150/hour.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

TALENT SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[TALENT NAME]"}

BRAND SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "brand_ambassador",
    name: "Brand Ambassador / Long-Term",
    description:
      "Ongoing ambassador relationship with monthly deliverables, performance bonuses, and full image rights.",
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    clauses: [
      "Monthly deliverable schedule and content quota",
      "Full exclusivity in brand category",
      "Performance bonuses (engagement threshold triggers)",
      "90-day termination notice clause",
      "Image & likeness rights for campaign period",
      "Brand guideline compliance requirement",
    ],
    template: (f) => `BRAND AMBASSADOR AGREEMENT

This Brand Ambassador Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

AMBASSADOR: ${f.talentName || "[TALENT NAME]"}
BRAND: ${f.brandName || "[BRAND NAME]"}

1. TERM
This Agreement is effective for ${f.duration || "12 months"} from the date of execution, renewable by mutual written consent.

2. MONTHLY DELIVERABLES
Ambassador agrees to create a minimum of 4 pieces of sponsored content per month across ${f.platform || "[PLATFORM]"}, including posts, stories, and/or videos as directed by Brand's marketing calendar.

3. COMPENSATION
Monthly retainer: ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD, paid on the 1st of each month.
Performance bonus: +20% of monthly retainer if average engagement rate exceeds 5% on sponsored posts.

4. EXCLUSIVITY
Ambassador shall not engage in any paid partnership, affiliate arrangement, or ambassador role with brands in the ${f.exclusivityCategory || "[CATEGORY]"} category for the duration of this Agreement.

5. IMAGE & LIKENESS RIGHTS
Brand is granted the right to use Ambassador's name, image, likeness, and social handles in advertising and promotional materials for the duration of this Agreement. Rights expire upon termination.

6. TERMINATION
Either party may terminate this Agreement with 90 days written notice. Brand may terminate immediately for cause (material breach, conduct detrimental to brand reputation).

7. BRAND GUIDELINES
Ambassador agrees to review and comply with Brand's creative guidelines provided quarterly. Non-compliance constitutes a material breach.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

AMBASSADOR SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[TALENT NAME]"}

BRAND SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "affiliate",
    name: "Affiliate / Performance Deal",
    description:
      "Commission-based partnership with tracked links, attribution windows, and minimum payout thresholds.",
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    clauses: [
      "Commission rate and structure (flat % or tiered)",
      "Attribution window (7 / 14 / 30 days)",
      "Cookie duration specification",
      "Minimum payout threshold ($50 default)",
      "Tracking link ownership and management",
      "Clawback provision for refunded orders",
    ],
    template: (f) => `AFFILIATE PARTNERSHIP AGREEMENT

This Affiliate Partnership Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

AFFILIATE: ${f.talentName || "[TALENT NAME]"}
BRAND: ${f.brandName || "[BRAND NAME]"}

1. TERM
This Agreement is effective for ${f.duration || "12 months"} and will auto-renew unless either party provides 30-day written notice of non-renewal.

2. COMMISSION STRUCTURE
Brand agrees to pay Affiliate a commission of ${f.commissionRate || "15"}% on net sales (excluding taxes and shipping) generated through Affiliate's unique tracking link on ${f.platform || "[PLATFORM]"}.

3. ATTRIBUTION WINDOW
A sale is attributed to Affiliate if the customer completes a purchase within ${f.attributionWindow || "30"} days of clicking Affiliate's tracking link.

4. COOKIE DURATION
Affiliate tracking cookies persist for ${f.cookieDuration || "30"} days from the click date.

5. MINIMUM PAYOUT
Commissions will be paid monthly when the accrued balance exceeds $50. Amounts below this threshold roll over to the following month.

6. TRACKING LINKS
Brand will provide unique tracking links exclusively assigned to Affiliate. Affiliate may not share, sell, or transfer these links.

7. CLAWBACK
Commission on refunded, charged-back, or cancelled orders will be deducted from future payouts.

8. FEE
Base promotional fee: ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "$0 (performance-only)"} USD upon execution.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

AFFILIATE SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[TALENT NAME]"}

BRAND SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "licensing",
    name: "Licensing Agreement",
    description:
      "IP and content licensing with defined scope, geographic rights, and sublicensing restrictions.",
    color: "from-violet-500 to-purple-700",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    clauses: [
      "IP ownership retained by Talent / Creator",
      "Usage scope: digital, print, broadcast",
      "Geographic rights (US, global, or defined territory)",
      "License duration and renewal terms",
      "Sublicensing prohibition",
      "Derivative works restrictions",
    ],
    template: (f) => `CONTENT LICENSING AGREEMENT

This Content Licensing Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

LICENSOR (Talent): ${f.talentName || "[TALENT NAME]"}
LICENSEE (Brand): ${f.brandName || "[BRAND NAME]"}

1. LICENSED CONTENT
Licensor grants Licensee a limited, non-exclusive, non-transferable license to use the content specified in Exhibit A ("Licensed Content").

2. IP OWNERSHIP
Licensor retains all intellectual property rights in and to the Licensed Content. This license does not transfer ownership of any IP.

3. USAGE SCOPE
Licensed Content may be used for: digital advertising, brand social media, website, and email marketing. Use in broadcast, print, or out-of-home advertising requires a separate written amendment.

4. GEOGRAPHIC RIGHTS
This license is granted for use in ${f.territory || "the United States"} only.

5. LICENSE DURATION
License term: ${f.duration || "12 months"} from execution. License expires automatically at the end of the term unless renewed in writing.

6. LICENSE FEE
Licensee agrees to pay Licensor ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD as a one-time licensing fee due upon execution.

7. SUBLICENSING PROHIBITION
Licensee may not sublicense, assign, or transfer the rights granted herein to any third party without prior written consent from Licensor.

8. DERIVATIVE WORKS
Licensee may not create derivative works based on the Licensed Content without separate written consent and additional compensation.

9. PLATFORM
Primary use: ${f.platform || "[PLATFORM / MEDIUM]"}.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

LICENSOR SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[TALENT NAME]"}

LICENSEE SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "appearance",
    name: "Appearance / Event Contract",
    description:
      "Personal appearance agreement covering travel, cancellation policies, and event media rights.",
    color: "from-rose-500 to-pink-600",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
    clauses: [
      "Event date, location, and appearance duration",
      "Travel, accommodation, and per diem coverage",
      "48-hour cancellation policy (full fee owed)",
      "Event media rights (photography/video)",
      "Social media posting requirements",
      "Force majeure clause",
    ],
    template: (f) => `PERSONAL APPEARANCE AGREEMENT

This Personal Appearance Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

TALENT: ${f.talentName || "[TALENT NAME]"}
CLIENT (Brand): ${f.brandName || "[BRAND NAME]"}

1. EVENT DETAILS
Event Name: [EVENT NAME]
Date: [EVENT DATE]
Location: [VENUE / CITY, STATE]
Appearance Duration: ${f.duration || "2 hours"}

2. COMPENSATION
Appearance fee: ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD, paid in full no later than 5 business days before the event.

3. TRAVEL & EXPENSES
Client will cover: round-trip business class airfare, hotel accommodations (single room, up to 2 nights), and ground transportation. A per diem of $150/day will be provided for meals.

4. CANCELLATION POLICY
- Cancellation by Talent with fewer than 48 hours notice: Talent forfeits 50% of fee.
- Cancellation by Client with fewer than 48 hours notice: Full fee is immediately due.
- Cancellations with more than 7 days notice: Neither party owes a penalty.

5. MEDIA RIGHTS
Client may photograph and video Talent's appearance for promotional use on ${f.platform || "social media and website"}. Talent retains the right to share event content on personal channels.

6. SOCIAL MEDIA
Talent agrees to post a minimum of 1 story and 1 feed post on ${f.platform || "[PLATFORM]"} about the event within 24 hours.

7. EXCLUSIVITY
Talent agrees not to appear at a competing brand's event within the ${f.exclusivityCategory || "[CATEGORY]"} category within 7 days before and after this event.

8. FORCE MAJEURE
Neither party will be liable for delays or cancellations caused by circumstances beyond their reasonable control (natural disaster, illness, etc.).

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

TALENT SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[TALENT NAME]"}

CLIENT SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "podcast",
    name: "Podcast Sponsorship",
    description:
      "Episode-based podcast ad deal covering host-read vs. produced spots, skip protection, and performance bonuses.",
    color: "from-cyan-500 to-blue-600",
    badgeColor: "bg-cyan-100 text-cyan-700 border-cyan-200",
    clauses: [
      "Episode count and ad slot placement (pre/mid/post)",
      "Host-read vs. produced ad specification",
      "Exclusivity within podcast category",
      "Skip-protection: host must not instruct listeners to skip",
      "Performance bonus triggers (download milestones)",
      "Promo code and tracking requirements",
    ],
    template: (f) => `PODCAST SPONSORSHIP AGREEMENT

This Podcast Sponsorship Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

HOST / CREATOR: ${f.talentName || "[HOST / PODCAST NAME]"}
SPONSOR (Brand): ${f.brandName || "[BRAND NAME]"}

1. SPONSORSHIP DETAILS
Platform/Show: ${f.platform || "[PODCAST NAME / PLATFORM]"}
Campaign Duration: ${f.duration || "3 months"}
Episode Count: [NUMBER] episodes per month

2. AD FORMAT
- Placement: Mid-roll (primary), with optional pre-roll
- Type: Host-read, written by Host in their own voice using Brand's talking points
- Duration: ~60 seconds per episode

3. COMPENSATION
Total sponsorship fee: ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD for the full campaign, paid 50% upfront and 50% at campaign completion.
Performance bonus: +10% if total campaign episode downloads exceed 50,000.

4. EXCLUSIVITY
Host agrees not to feature a direct competitor in the ${f.exclusivityCategory || "[CATEGORY]"} category during the sponsorship period.

5. SKIP PROTECTION
Host will not instruct listeners to skip sponsorship segments, fast-forward through ads, or imply the sponsorship is unwanted.

6. PROMO CODES & TRACKING
Brand will provide Host with a unique promo code and tracking URL. Host will verbally mention the code in every sponsored episode.

7. CONTENT GUIDELINES
Host must disclose sponsored segments clearly at the start of the ad read. Brand will provide a talking-points document; Host retains editorial discretion in delivery.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

HOST SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[HOST NAME]"}

SPONSOR SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
  {
    id: "newsletter",
    name: "Newsletter Sponsorship",
    description:
      "Issue-based newsletter ad placement with subscriber guarantee, click guarantees, and exclusivity.",
    color: "from-fuchsia-500 to-pink-700",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    clauses: [
      "Issue count and placement (top, middle, footer)",
      "Full newsletter exclusivity (no competing ads per issue)",
      "Subscriber count guarantee (make-good if under threshold)",
      "Click guarantee (make-good in subsequent issues)",
      "Creative assets and copy approval process",
      "Unsubscribe list exclusion from deliverable count",
    ],
    template: (f) => `NEWSLETTER SPONSORSHIP AGREEMENT

This Newsletter Sponsorship Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} between:

PUBLISHER: ${f.talentName || "[PUBLISHER / CREATOR NAME]"}
SPONSOR (Brand): ${f.brandName || "[BRAND NAME]"}

1. SPONSORSHIP DETAILS
Newsletter/Platform: ${f.platform || "[NEWSLETTER NAME]"}
Issue Count: [NUMBER] issues over ${f.duration || "3 months"}
Placement: Top-of-newsletter primary ad unit

2. COMPENSATION
Total fee: ${f.fee ? `$${Number(f.fee).toLocaleString()}` : "[FEE]"} USD, paid 50% upon execution and 50% after final issue is sent.

3. EXCLUSIVITY
Publisher agrees that no competing brand in the ${f.exclusivityCategory || "[CATEGORY]"} category will appear in the same issue as Sponsor's ad unit.

4. SUBSCRIBER GUARANTEE
Publisher guarantees the newsletter active subscriber count is a minimum of [SUBSCRIBER COUNT] per issue. If any issue is sent to fewer subscribers, Publisher will provide a free make-good placement in the following issue.

5. CLICK GUARANTEE
Publisher guarantees a minimum of [CLICK COUNT] unique clicks per sponsored placement. If any issue falls below this threshold, Publisher will run a no-cost make-good placement.

6. CREATIVE & APPROVAL
Sponsor will provide ad copy, subject-line callout, and images at least 5 business days before the scheduled send date. Publisher may reject creative that violates their editorial standards; Sponsor will resubmit within 2 business days.

7. REPORTING
Publisher will provide open rate, click-through data, and unique click counts within 48 hours of each send.

8. UNSUBSCRIBES
Unsubscribed recipients will not count toward the subscriber guarantee.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

PUBLISHER SIGNATURE: ___________________________ Date: ____________
${f.talentName || "[PUBLISHER NAME]"}

SPONSOR SIGNATURE: ___________________________ Date: ____________
${f.brandName || "[BRAND NAME]"}`,
  },
];

// ── Utility helpers ───────────────────────────────────────────────────────────

async function generatePDF(template, fields, contractText) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 60;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;

  // Header branding
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, pageWidth, 48, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("DEAL STAGE", margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Contract Template Library", margin, 43);

  // Document title
  doc.setTextColor(30, 30, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(template.name, margin, 80);

  // Metadata line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 120);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}   |   Deal Stage — Confidential`,
    margin,
    95
  );

  // Divider
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, 102, pageWidth - margin, 102);

  // Contract body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 50);

  const lines = doc.splitTextToSize(contractText, usableWidth);
  let y = 118;

  for (const line of lines) {
    if (y > pageHeight - 60) {
      doc.addPage();
      // page header
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120, 100, 200);
      doc.text("Deal Stage — Contract Template Library (Continued)", margin, 18);
      y = 48;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 50);
    }

    // Bold clause headings (lines like "1. DELIVERABLES")
    if (/^\d+\.\s+[A-Z\s&\/]+$/.test(line.trim())) {
      doc.setFont("helvetica", "bold");
      doc.text(line, margin, y);
      doc.setFont("helvetica", "normal");
    } else {
      doc.text(line, margin, y);
    }
    y += 13;
  }

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 180);
  doc.text(
    "This contract was generated by Deal Stage. It is a template and does not constitute legal advice. Consult a licensed attorney before executing.",
    margin,
    pageHeight - 28,
    { maxWidth: usableWidth }
  );

  doc.save(`DealStage_${template.id}_${Date.now()}.pdf`);
}

// ── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({ template, onUse }) {
  return (
    <Card className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col">
      <CardHeader className="pb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
          <FileText className="w-5 h-5 text-white" />
        </div>
        <CardTitle className="text-[15px] font-semibold text-slate-800 leading-tight">
          {template.name}
        </CardTitle>
        <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{template.description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-1.5 mb-4 flex-1">
          {template.clauses.map((clause, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <span className="text-[12px] text-slate-600 leading-tight">{clause}</span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => onUse(template)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
          size="sm"
        >
          Use Template
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Template Form Dialog ──────────────────────────────────────────────────────

function TemplateFormDialog({ template, partnerships, onClose }) {
  const { toast } = useToast();
  const [fields, setFields] = useState({
    talentName: "",
    brandName: "",
    fee: "",
    duration: "",
    platform: "",
    exclusivityCategory: "",
    exclusivityDays: "30",
    commissionRate: "15",
    attributionWindow: "30",
    cookieDuration: "30",
    territory: "the United States",
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [contractText, setContractText] = useState("");
  const [step, setStep] = useState("form"); // form | preview
  const [savingToDeal, setSavingToDeal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState("");

  const set = (k, v) => setFields((prev) => ({ ...prev, [k]: v }));

  const handleAISuggest = async () => {
    setLoadingAI(true);
    try {
      const { data: result, error } = await base44.functions.invoke("ai-router", {
        prompt: `You are a talent partnership expert. Suggest realistic fill-in values for a ${template.name} contract. Return JSON with these fields:
- talentName: a realistic influencer name
- brandName: a realistic consumer brand name that would use this deal type
- fee: a realistic dollar amount (number only, no $)
- duration: deal duration (e.g. "3 months", "12 months", "2 hours")
- platform: the primary platform (e.g. "Instagram", "YouTube", "Podcast", "Newsletter")
- exclusivityCategory: the product/brand category (e.g. "Athletic Apparel", "Beauty", "Tech")
- commissionRate: percentage number if affiliate deal, else 0
- attributionWindow: days number if affiliate deal, else 30
- territory: geographic territory for licensing

Return only valid JSON with no explanation.`,
        response_json_schema: {
          type: "object",
          properties: {
            talentName: { type: "string" },
            brandName: { type: "string" },
            fee: { type: "string" },
            duration: { type: "string" },
            platform: { type: "string" },
            exclusivityCategory: { type: "string" },
            commissionRate: { type: "string" },
            attributionWindow: { type: "string" },
            territory: { type: "string" },
          },
        },
      });
      if (error) throw error;
      if (result) {
        const suggested = typeof result === "string" ? JSON.parse(result) : result;
        setFields((prev) => ({ ...prev, ...suggested }));
        toast({ title: "AI suggestions applied", description: "Fields filled with suggested values." });
      }
    } catch {
      toast({ title: "AI suggestion failed", description: "Fill in the fields manually.", variant: "destructive" });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerate = () => {
    const text = template.template(fields);
    setContractText(text);
    setStep("preview");
  };

  const handleDownloadPDF = async () => {
    await generatePDF(template, fields, contractText);
    toast({ title: "PDF downloaded", description: `${template.name} saved to your device.` });
  };

  const handleSaveToDeal = async () => {
    if (!selectedDealId) {
      toast({ title: "Select a deal", description: "Choose a partnership to attach this contract to.", variant: "destructive" });
      return;
    }
    setSavingToDeal(true);
    try {
      await supabase
        .from("partnerships")
        .update({
          contract_text: contractText,
          contract_template_id: template.id,
          contract_template_name: template.name,
          contract_generated_at: new Date().toISOString(),
        })
        .eq("id", selectedDealId);
      toast({ title: "Contract saved", description: "Attached to the selected partnership." });
      onClose();
    } catch {
      toast({ title: "Save failed", description: "Could not attach contract to deal.", variant: "destructive" });
    } finally {
      setSavingToDeal(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            {template.name}
          </DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-5 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-slate-500">Fill in the deal details or let AI suggest values.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAISuggest}
                disabled={loadingAI}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                {loadingAI ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                AI Suggest
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Talent Name</Label>
                <Input
                  placeholder="e.g. Alex Rivera"
                  value={fields.talentName}
                  onChange={(e) => set("talentName", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Brand Name</Label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={fields.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Fee (USD)</Label>
                <Input
                  placeholder="e.g. 5000"
                  type="number"
                  value={fields.fee}
                  onChange={(e) => set("fee", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Duration / Term</Label>
                <Input
                  placeholder="e.g. 3 months, 30 days"
                  value={fields.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Platform</Label>
                <Select value={fields.platform} onValueChange={(v) => set("platform", v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Instagram", "YouTube", "TikTok", "Twitter / X", "LinkedIn", "Podcast", "Newsletter", "Twitch", "Facebook"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Exclusivity Category</Label>
                <Input
                  placeholder="e.g. Athletic Apparel, Beauty"
                  value={fields.exclusivityCategory}
                  onChange={(e) => set("exclusivityCategory", e.target.value)}
                  className="text-sm"
                />
              </div>

              {template.id === "affiliate" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Commission Rate (%)</Label>
                    <Input
                      placeholder="15"
                      type="number"
                      value={fields.commissionRate}
                      onChange={(e) => set("commissionRate", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Attribution Window (days)</Label>
                    <Select value={fields.attributionWindow} onValueChange={(v) => set("attributionWindow", v)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["7", "14", "30", "60", "90"].map((d) => (
                          <SelectItem key={d} value={d}>{d} days</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {template.id === "licensing" && (
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs font-medium text-slate-700">Geographic Territory</Label>
                  <Input
                    placeholder="e.g. the United States, Global"
                    value={fields.territory}
                    onChange={(e) => set("territory", e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Generate Contract
            </Button>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStep("form")}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Edit fields
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-h-80 overflow-y-auto">
              <pre className="text-[12px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                {contractText}
              </pre>
            </div>

            {partnerships && partnerships.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-indigo-500" />
                  Save to a Partnership
                </p>
                <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select a partnership..." />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerships.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.talent_name} + {p.brand_name}
                        {p.deal_value ? ` — $${Number(p.deal_value).toLocaleString()}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveToDeal}
                  disabled={savingToDeal || !selectedDealId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  {savingToDeal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Contract to Deal
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContractTemplates() {
  const { user } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [search, setSearch] = useState("");

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships_for_contracts"],
    queryFn: () =>
      supabase
        .from("partnerships")
        .select("id, talent_name, brand_name, deal_value")
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => data || []),
  });

  const filtered = TEMPLATES.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract Template Library</h1>
          <p className="text-[14px] text-slate-500 mt-0.5">
            7 pre-approved templates — customize, AI-fill, generate, and attach to deals.
          </p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs self-start sm:self-auto">
          {TEMPLATES.length} Templates
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={(t) => setActiveTemplate(t)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates match your search.</p>
        </div>
      )}

      {/* Info footer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
        <p className="text-[12px] text-amber-800 leading-relaxed">
          These templates are starting points and do not constitute legal advice. Consult a licensed entertainment or contract attorney before executing any agreement.
        </p>
      </div>

      {/* Form dialog */}
      {activeTemplate && (
        <TemplateFormDialog
          template={activeTemplate}
          partnerships={partnerships}
          onClose={() => setActiveTemplate(null)}
        />
      )}
    </div>
  );
}

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Lock,
  CheckCircle2,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── NDA Template ─────────────────────────────────────────────────────────────

const NDA_TEXT = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of the date indicated below between the parties identified herein (collectively, "Parties").

1. PURPOSE
The Parties wish to explore a potential business relationship in connection with creator partnerships, brand deals, and campaign performance data (the "Purpose"). In connection with the Purpose, each Party may disclose to the other certain Confidential Information (as defined below).

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any data or information that is proprietary to the disclosing Party and not generally known to the public, including but not limited to: deal values, campaign performance metrics, brand partnership details, revenue data, contact information, business strategies, pricing, deliverables, and any documents marked "confidential" or reasonably understood to be confidential given the nature of the information and circumstances of disclosure.

3. OBLIGATIONS OF RECEIVING PARTY
Each Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose, copy, or reproduce Confidential Information without prior written consent; (c) use Confidential Information solely for the Purpose; (d) limit access to Confidential Information to those with a need to know; and (e) notify the disclosing Party promptly upon becoming aware of any unauthorized disclosure.

4. EXCLUSIONS
Confidential Information does not include information that: (a) is or becomes publicly available through no act or omission of the receiving Party; (b) was rightfully known to the receiving Party prior to disclosure; (c) is independently developed by the receiving Party without use of Confidential Information; or (d) is required to be disclosed by law or court order, provided the receiving Party gives prompt notice to allow the disclosing Party to seek a protective order.

5. TERM
This Agreement shall remain in effect for a period of three (3) years from the date of signing, or until the Confidential Information enters the public domain, whichever occurs first.

6. RETURN OR DESTRUCTION
Upon request, the receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.

7. NO LICENSE
Nothing in this Agreement grants the receiving Party any rights in or to the Confidential Information except as expressly set forth herein.

8. REMEDIES
The Parties acknowledge that a breach of this Agreement may cause irreparable harm and that monetary damages may be inadequate. The disclosing Party shall be entitled to seek injunctive or other equitable relief in addition to any other remedies available at law.

9. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law provisions.

10. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior discussions, representations, and agreements.

BY SIGNING BELOW, THE PARTIES AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT.`;

// ── LocalStorage helpers ──────────────────────────────────────────────────────

const LS_KEY_PREFIX = "dealstage_nda_";

function getNDAKey(ownerEmail) {
  return `${LS_KEY_PREFIX}${ownerEmail}`;
}

export function hasSignedNDA(ownerEmail) {
  if (!ownerEmail) return false;
  try {
    const raw = localStorage.getItem(getNDAKey(ownerEmail));
    if (!raw) return false;
    const sig = JSON.parse(raw);
    return !!sig?.signed_at;
  } catch {
    return false;
  }
}

export function getNDASignature(ownerEmail) {
  if (!ownerEmail) return null;
  try {
    const raw = localStorage.getItem(getNDAKey(ownerEmail));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeNDASignature(ownerEmail, { fullName, viewerEmail }) {
  const signature = {
    owner_email: ownerEmail,
    signer_name: fullName,
    signer_email: viewerEmail,
    signed_at: new Date().toISOString(),
    nda_version: "1.0",
  };
  localStorage.setItem(getNDAKey(ownerEmail), JSON.stringify(signature));
  return signature;
}

// ── NDAGate component ─────────────────────────────────────────────────────────

/**
 * Wraps data room content behind an NDA sign-off gate.
 *
 * Props:
 *  ownerEmail   {string}  - email of the data room owner (used as the NDA key)
 *  viewerEmail  {string}  - email of the current viewer (pre-filled in the form)
 *  isOwner      {boolean} - if true, the gate is bypassed entirely
 *  children     {node}    - the protected content to render after signing
 */
export default function NDAGate({ ownerEmail, viewerEmail, isOwner = false, children }) {
  const alreadySigned = isOwner || hasSignedNDA(ownerEmail);

  const [signed, setSigned] = useState(alreadySigned);
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showNDA, setShowNDA] = useState(false);
  const [error, setError] = useState("");

  const handleSign = useCallback(() => {
    if (!fullName.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the terms to proceed.");
      return;
    }
    storeNDASignature(ownerEmail, { fullName: fullName.trim(), viewerEmail });
    setSigned(true);
    setError("");
  }, [fullName, agreed, ownerEmail, viewerEmail]);

  if (signed) return <>{children}</>;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Shield icon + title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">NDA Required</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            This data room contains confidential partnership and performance information.
            Please sign the mutual NDA below to gain access.
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Mutual Non-Disclosure Agreement
              </CardTitle>
              <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs">
                v1.0
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* NDA text toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                onClick={() => setShowNDA((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Read Full NDA Terms
                </span>
                {showNDA ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showNDA && (
                <ScrollArea className="h-64 px-4 py-3 bg-white">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                    {NDA_TEXT}
                  </pre>
                </ScrollArea>
              )}
            </div>

            {/* Date field */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </Label>
                <Input
                  value={today}
                  readOnly
                  className="mt-1.5 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Your Email
                </Label>
                <Input
                  value={viewerEmail || ""}
                  readOnly
                  className="mt-1.5 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                  placeholder="viewer@example.com"
                />
              </div>
            </div>

            {/* Full name */}
            <div>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Full Legal Name *
              </Label>
              <Input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your full legal name"
                className="mt-1.5 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Typing your name acts as your electronic signature.
              </p>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  agreed
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-slate-300 group-hover:border-indigo-400"
                }`}
                onClick={() => {
                  setAgreed((v) => !v);
                  setError("");
                }}
              >
                {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-slate-700 leading-relaxed">
                I have read, understand, and agree to be legally bound by the terms of this Mutual
                Non-Disclosure Agreement. I acknowledge that violation of this agreement may result
                in legal action.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={handleSign}
              disabled={!agreed || !fullName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 text-sm font-semibold gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              Sign &amp; Access Data Room
            </Button>

            <p className="text-center text-xs text-slate-400">
              Your signature is stored locally on this device and is never shared with third parties.
              Powered by Deal Stage — dealstage.io
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

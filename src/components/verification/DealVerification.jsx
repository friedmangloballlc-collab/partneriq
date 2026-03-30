import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Link2 } from "lucide-react";

export default function DealVerification({ dealId, creatorId, brandName, requiredLinks = [] }) {
  const [postUrl, setPostUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    if (!postUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("verifyDeal", {
        dealId, creatorId, postUrl, brandName, requiredLinks,
      });
      if (res.data) {
        setResult(res.data);
      } else {
        setError("Verification returned no data.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const checks = result ? [
    {
      label: "Brand mentioned",
      passed: result.brand_mentioned,
      detail: `"${brandName}" ${result.brand_mentioned ? "found" : "not found"} in post`,
    },
    {
      label: "Required links",
      passed: result.links_correct,
      detail: requiredLinks.length > 0
        ? `${requiredLinks.length} link(s) checked`
        : "No links required",
    },
    {
      label: "Overall verification",
      passed: result.verified,
      detail: result.verified ? "All requirements met" : "Some requirements not met",
    },
  ] : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
          <Link2 className="w-4 h-4" /> Verify deliverable
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Paste the live post URL to check if the creator met deal requirements.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          type="url"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="https://instagram.com/p/..."
          onKeyDown={(e) => e.key === "Enter" && verify()}
          className="flex-1"
        />
        <Button onClick={verify} disabled={loading || !postUrl.trim()} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="space-y-2">
          {checks.map((check) => (
            <Card
              key={check.label}
              className={check.passed
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
              }
            >
              <CardContent className="py-3 flex items-center gap-3">
                {check.passed
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                }
                <div>
                  <p className={`text-sm font-medium ${check.passed ? "text-green-800" : "text-red-800"}`}>
                    {check.label}
                  </p>
                  <p className={`text-xs ${check.passed ? "text-green-600" : "text-red-600"}`}>
                    {check.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Send,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  ToggleLeft,
  ToggleRight,
  Calendar,
  TrendingUp,
  AlertCircle,
  User,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CAMPAIGN_TYPES = [
  { value: "cold_outreach", label: "Cold Outreach", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
  { value: "warm_followup", label: "Warm Follow-up", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { value: "re_engagement", label: "Re-engagement", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  { value: "upsell", label: "Upsell", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
  { value: "event_collab", label: "Event Collaboration", icon: Calendar, color: "text-rose-600", bg: "bg-rose-50" },
];

function EmailCard({ email, index, isExpanded, onToggle, showVariant, variant }) {
  const [copied, setCopied] = useState(null);

  const displayEmail = showVariant && variant ? {
    ...email,
    subject_line: variant.subject_line || email.subject_line,
    body: variant.body_changes || email.body,
  } : email;

  const handleCopy = (field) => {
    const textMap = {
      subject: displayEmail.subject_line,
      body: displayEmail.body,
      full: `Subject: ${displayEmail.subject_line}\n\n${displayEmail.body}`,
    };
    navigator.clipboard.writeText(textMap[field] || "");
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      {index > 0 && (
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500 font-medium">
            <Clock className="w-3 h-3" />
            Wait {email.send_delay_days} day{email.send_delay_days !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <Card className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Email header - always visible */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shrink-0">
            {email.email_number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {displayEmail.subject_line}
              </h4>
              {showVariant && variant && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] shrink-0">
                  B Variant
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {displayEmail.preview_text || email.preview_text}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px] text-gray-500">
              {email.purpose}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded email body */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            <div className="p-4">
              {/* Email body */}
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {displayEmail.body}
                </pre>
              </div>

              {/* CTA highlight */}
              <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
                <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-medium text-indigo-700">CTA:</span>
                <span className="text-xs text-indigo-600">{email.cta}</span>
              </div>

              {/* Personalization hooks */}
              {email.personalization_hooks && email.personalization_hooks.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Personalization Hooks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {email.personalization_hooks.map((hook, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {hook}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1.5"
                  onClick={() => handleCopy("subject")}
                >
                  {copied === "subject" ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === "subject" ? "Copied!" : "Copy Subject"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1.5"
                  onClick={() => handleCopy("body")}
                >
                  {copied === "body" ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === "body" ? "Copied!" : "Copy Body"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1.5"
                  onClick={() => handleCopy("full")}
                >
                  {copied === "full" ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === "full" ? "Copied!" : "Copy Full Email"}
                </Button>
                <div className="flex-1" />
                <Button
                  size="sm"
                  className="rounded-lg text-xs gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                >
                  <Send className="w-3 h-3" />
                  Send to Outreach
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AIOutreachBuilder() {
  const [selectedTalent, setSelectedTalent] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [expandedEmails, setExpandedEmails] = useState({});
  const [showVariants, setShowVariants] = useState({});

  const { data: talents = [] } = useQuery({
    queryKey: ["outreach-talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 200),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["outreach-brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 200),
  });

  const handleGenerate = async () => {
    if (!selectedTalent || !selectedBrand || !campaignType) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedEmails({});
    setShowVariants({});

    try {
      const response = await base44.functions.invoke("generateAIOutreach", {
        talent_id: selectedTalent,
        brand_id: selectedBrand,
        campaign_type: campaignType,
      });

      if (response.success) {
        setResult(response.outreach);
        // Auto-expand the first email
        if (response.outreach?.sequence?.length > 0) {
          setExpandedEmails({ 0: true });
        }
      } else {
        setError(response.error || "Failed to generate outreach sequence");
      }
    } catch (err) {
      setError(err?.message || "An error occurred while generating the sequence");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmail = (index) => {
    setExpandedEmails((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleVariant = (emailNumber) => {
    setShowVariants((prev) => ({ ...prev, [emailNumber]: !prev[emailNumber] }));
  };

  const getVariantForEmail = (emailNumber) => {
    return result?.a_b_variants?.find((v) => v.email_number === emailNumber);
  };

  const selectedCampaign = CAMPAIGN_TYPES.find((c) => c.value === campaignType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                AI Outreach Builder
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Generate personalized multi-email outreach sequences powered by AI
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered
          </Badge>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card className="rounded-2xl shadow-md border border-gray-100">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Talent selector */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Select Talent
              </label>
              <select
                value={selectedTalent}
                onChange={(e) => setSelectedTalent(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
              >
                <option value="">Choose a talent...</option>
                {talents.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.name || `Talent #${t.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand selector */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Select Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
              >
                <option value="">Choose a brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.company_name || b.name || `Brand #${b.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign type dropdown */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
              >
                <option value="">Choose campaign type...</option>
                {CAMPAIGN_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign type badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CAMPAIGN_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isSelected = campaignType === ct.value;
              return (
                <button
                  key={ct.value}
                  onClick={() => setCampaignType(ct.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    isSelected
                      ? `${ct.bg} ${ct.color} border-current shadow-sm`
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {ct.label}
                </button>
              );
            })}
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedTalent || !selectedBrand || !campaignType}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl shadow-md gap-2 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Sequence...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Sequence
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Generation Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Campaign strategy */}
          {result.campaign_strategy && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Campaign Strategy</h3>
                  {selectedCampaign && (
                    <Badge className={`${selectedCampaign.bg} ${selectedCampaign.color} border-0 text-[10px]`}>
                      {selectedCampaign.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {result.campaign_strategy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Metrics + Send Times row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected metrics */}
            {result.expected_metrics && (
              <Card className="rounded-2xl shadow-md border border-gray-100">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Expected Metrics</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-blue-50">
                      <p className="text-lg font-bold text-blue-700">
                        {result.expected_metrics.open_rate}
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">Open Rate</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-emerald-50">
                      <p className="text-lg font-bold text-emerald-700">
                        {result.expected_metrics.reply_rate}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Reply Rate</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-violet-50">
                      <p className="text-lg font-bold text-violet-700">
                        {result.expected_metrics.conversion_rate}
                      </p>
                      <p className="text-[10px] text-violet-600 font-medium mt-0.5">Conversion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimal send times */}
            {result.optimal_send_times && (
              <Card className="rounded-2xl shadow-md border border-gray-100">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Optimal Send Times</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        Best Days
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {result.optimal_send_times.best_days}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        Time Range
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {result.optimal_send_times.best_time_range}
                      </span>
                    </div>
                    {result.optimal_send_times.timezone_note && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          Timezone
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {result.optimal_send_times.timezone_note}
                        </span>
                      </div>
                    )}
                    {result.optimal_send_times.reasoning && (
                      <p className="text-[11px] text-gray-500 mt-1 italic">
                        {result.optimal_send_times.reasoning}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Email sequence timeline */}
          {result.sequence && result.sequence.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Email Sequence
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      {result.sequence.length} emails
                    </Badge>
                  </div>

                  {/* Sequence timeline mini-view */}
                  <div className="hidden md:flex items-center gap-1">
                    {result.sequence.map((email, idx) => (
                      <React.Fragment key={idx}>
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            expandedEmails[idx]
                              ? "bg-indigo-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          onClick={() => toggleEmail(idx)}
                        >
                          {email.email_number}
                        </div>
                        {idx < result.sequence.length - 1 && (
                          <div className="flex items-center gap-0.5">
                            <div className="w-3 h-px bg-gray-300" />
                            <span className="text-[8px] text-gray-400">
                              {result.sequence[idx + 1]?.send_delay_days}d
                            </span>
                            <div className="w-3 h-px bg-gray-300" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Email cards */}
                <div className="space-y-3">
                  {result.sequence.map((email, idx) => {
                    const variant = getVariantForEmail(email.email_number);
                    return (
                      <div key={idx}>
                        {/* A/B variant toggle */}
                        {variant && (
                          <div className="flex items-center justify-end mb-1.5">
                            <button
                              onClick={() => toggleVariant(email.email_number)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              {showVariants[email.email_number] ? (
                                <ToggleRight className="w-4 h-4 text-amber-500" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                              {showVariants[email.email_number]
                                ? "Showing B Variant"
                                : "Show A/B Variant"}
                            </button>
                          </div>
                        )}
                        <EmailCard
                          email={email}
                          index={idx}
                          isExpanded={!!expandedEmails[idx]}
                          onToggle={() => toggleEmail(idx)}
                          showVariant={!!showVariants[email.email_number]}
                          variant={variant}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up triggers */}
          {result.follow_up_triggers && result.follow_up_triggers.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Follow-up Triggers
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {result.follow_up_triggers.length} triggers
                  </Badge>
                </div>
                <div className="space-y-2">
                  {result.follow_up_triggers.map((trigger, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-700">{trigger}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

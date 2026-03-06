import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Globe,
  Languages,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Shield,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", name: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", name: "Spanish", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "fr", name: "French", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "de", name: "German", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "pt", name: "Portuguese", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "ja", name: "Japanese", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "ko", name: "Korean", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "ar", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "hi", name: "Hindi", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "zh", name: "Mandarin", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "it", name: "Italian", flag: "\u{1F1EE}\u{1F1F9}" },
];

const CONTENT_TYPES = [
  { value: "social_post", label: "Social Post" },
  { value: "email", label: "Email" },
  { value: "campaign_brief", label: "Campaign Brief" },
  { value: "pitch_deck", label: "Pitch Deck" },
  { value: "contract_terms", label: "Contract Terms" },
];

function getConfidenceColor(score) {
  if (score >= 0.85) return "bg-emerald-100 text-emerald-700";
  if (score >= 0.7) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getSeverityColor(severity) {
  const s = (severity || "").toLowerCase();
  if (s === "high" || s === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (s === "medium" || s === "moderate") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

function getRiskColor(risk) {
  const r = (risk || "").toLowerCase();
  if (r === "high" || r === "critical") return "text-red-600";
  if (r === "medium" || r === "moderate") return "text-amber-600";
  return "text-emerald-600";
}

export default function ContentLocalizer() {
  const [content, setContent] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguages, setTargetLanguages] = useState([]);
  const [contentType, setContentType] = useState("social_post");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await base44.entities.Brand.list("-created_date", 100);
        setBrands(data || []);
      } catch (_e) {
        // Brands are optional
      }
    }
    fetchBrands();
  }, []);

  const toggleLanguage = (code) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const selectAllLanguages = () => {
    const available = LANGUAGES.filter((l) => l.code !== sourceLanguage).map((l) => l.code);
    setTargetLanguages(available);
  };

  const clearAllLanguages = () => {
    setTargetLanguages([]);
  };

  const handleLocalize = async () => {
    if (!content.trim() || targetLanguages.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab(0);

    try {
      const targetNames = targetLanguages.map(
        (code) => LANGUAGES.find((l) => l.code === code)?.name || code
      );

      const response = await base44.functions.localizeContent({
        content: content.trim(),
        source_language: LANGUAGES.find((l) => l.code === sourceLanguage)?.name || sourceLanguage,
        target_languages: targetNames,
        brand_id: brandId || undefined,
        content_type: contentType,
      });

      if (response.success && response.localization) {
        setResult(response.localization);
      } else {
        setError(response.error || "Localization failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during localization.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (_e) {
      // Clipboard API not available
    }
  };

  const availableTargets = LANGUAGES.filter((l) => l.code !== sourceLanguage);
  const activeLocalization = result?.localizations?.[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Content Localizer</h2>
          <p className="text-sm text-gray-500">
            Culturally adapt your content for global markets with AI-powered localization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <div className="space-y-4">
          {/* Content Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Source Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content to localize..."
                className="w-full h-40 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white"
              />

              {/* Source Language */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Source Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => {
                    setSourceLanguage(e.target.value);
                    setTargetLanguages((prev) => prev.filter((l) => l !== e.target.value));
                  }}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Brand <span className="text-gray-400">(optional - for voice consistency)</span>
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">No brand selected</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Target Languages */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Target Languages
                </CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllLanguages}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={clearAllLanguages}
                    className="text-[10px] text-gray-400 hover:text-gray-600 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {availableTargets.map((lang) => {
                  const isSelected = targetLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium text-xs">{lang.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Localize Button */}
          <Button
            onClick={handleLocalize}
            disabled={loading || !content.trim() || targetLanguages.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-sm font-semibold shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Localizing content...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Localize Content
                {targetLanguages.length > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white border-0 text-[10px]">
                    {targetLanguages.length} language{targetLanguages.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Localized content will appear here
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Enter content and select target languages to get started
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-600 font-medium">Localizing your content...</p>
                <p className="text-xs text-gray-400 mt-1">
                  Adapting for {targetLanguages.length} market{targetLanguages.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              {/* Language Tabs */}
              {result.localizations?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      Localizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Tab Bar */}
                    <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-gray-100">
                      {result.localizations.map((loc, idx) => {
                        const lang = LANGUAGES.find(
                          (l) =>
                            l.name.toLowerCase() === (loc.language_name || loc.language || "").toLowerCase() ||
                            l.code === (loc.language || "").toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              activeTab === idx
                                ? "bg-indigo-100 text-indigo-800 shadow-sm"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <span>{lang?.flag || "\u{1F310}"}</span>
                            {loc.language_name || loc.language}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Localization */}
                    {activeLocalization && (
                      <div className="space-y-4">
                        {/* Confidence Score */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Confidence Score</span>
                          <Badge className={`text-xs ${getConfidenceColor(activeLocalization.confidence_score)}`}>
                            {Math.round((activeLocalization.confidence_score || 0) * 100)}%
                          </Badge>
                        </div>

                        {/* Translated Content */}
                        <div className="relative">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {activeLocalization.translated_content}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(activeLocalization.translated_content, activeTab)}
                            className="absolute top-2 right-2 h-7 px-2 text-gray-400 hover:text-gray-600"
                          >
                            {copiedIndex === activeTab ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                <span className="text-xs text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Cultural Adaptations */}
                        {activeLocalization.cultural_adaptations?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              Cultural Adaptations
                            </h4>
                            <ul className="space-y-1.5">
                              {activeLocalization.cultural_adaptations.map((note, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-gray-600 bg-amber-50/50 border border-amber-100 rounded-md px-3 py-2 flex items-start gap-2"
                                >
                                  <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Sensitivity Flags */}
                        {activeLocalization.sensitivity_flags?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              Sensitivity Flags
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {activeLocalization.sensitivity_flags.map((flag, i) => (
                                <Badge
                                  key={i}
                                  className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-normal px-2 py-1"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hashtag Suggestions */}
                        {activeLocalization.hashtag_suggestions?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 mb-2">
                              Hashtag Suggestions
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {activeLocalization.hashtag_suggestions.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50/50 cursor-pointer hover:bg-indigo-100"
                                  onClick={() => handleCopy(tag, `tag-${activeTab}-${i}`)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Platform Adjustments */}
                        {activeLocalization.platform_adjustments && (
                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                            <h4 className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              Platform Adjustments
                            </h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                              {activeLocalization.platform_adjustments}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cultural Risk Assessment */}
              {result.cultural_risk_assessment && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-gray-500" />
                        Cultural Risk Assessment
                      </CardTitle>
                      <span className={`text-xs font-semibold ${getRiskColor(result.cultural_risk_assessment.overall_risk)}`}>
                        {result.cultural_risk_assessment.overall_risk} Risk
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.cultural_risk_assessment.flags?.length > 0 ? (
                      <div className="space-y-2">
                        {result.cultural_risk_assessment.flags.map((flag, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border text-xs ${getSeverityColor(flag.severity)}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{flag.issue}</span>
                              <Badge className={`text-[9px] ${getSeverityColor(flag.severity)} border`}>
                                {flag.severity}
                              </Badge>
                            </div>
                            <p className="opacity-80">{flag.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No cultural risk flags identified.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Universal Elements & Market Tips */}
              <div className="grid grid-cols-1 gap-4">
                {result.universal_elements?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Universal Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {result.universal_elements.map((el, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 flex items-start gap-2 py-1"
                          >
                            <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {el}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.market_specific_tips?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-purple-500" />
                        Market-Specific Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.market_specific_tips.map((tip, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-purple-50/50 border border-purple-100 rounded-lg"
                          >
                            <span className="text-xs font-semibold text-purple-700">
                              {tip.market}
                            </span>
                            <p className="text-xs text-purple-600 mt-0.5">{tip.tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

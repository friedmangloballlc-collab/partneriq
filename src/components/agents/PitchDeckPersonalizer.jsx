import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { formatAIError } from "@/components/AILimitBanner";
import {
  Loader2,
  Presentation,
  Sparkles,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  Users,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Layers,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PitchDeckPersonalizer() {
  const [brands, setBrands] = useState([]);
  const [talents, setTalents] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedSlide, setExpandedSlide] = useState(null);
  const [showAllTalents, setShowAllTalents] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandList, talentList] = await Promise.all([
          base44.entities.Brand.list(),
          base44.entities.Talent.list(),
        ]);
        setBrands(brandList || []);
        setTalents(talentList || []);
      } catch (err) {
        setError("Failed to load brands and talents.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTalent = (id) => {
    setSelectedTalents((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!selectedBrand || selectedTalents.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke("personalizePitchDeck", {
        brand_id: selectedBrand,
        talent_ids: selectedTalents,
      });
      if (response.error) throw new Error(response.error);
      setResult(response.pitch_deck);
    } catch (err) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const visibleTalents = showAllTalents ? talents : talents.slice(0, 12);
  const brandObj = brands.find((b) => String(b.id) === String(selectedBrand));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                AI Pitch Deck Personalizer
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Generate tailored pitch decks with AI-powered talent matching,
                ROI projections, and competitive insights
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-sm font-medium px-3 py-1 border-violet-300 text-violet-700 bg-violet-50"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Agent
          </Badge>
        </CardHeader>
      </Card>

      {/* Configuration Panel */}
      <Card className="rounded-2xl shadow-md border border-gray-100">
        <CardContent className="p-6 space-y-5">
          {dataLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading brands and talents...
            </div>
          ) : (
            <>
              {/* Brand Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1.5 text-violet-500" />
                  Select Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
                >
                  <option value="">Choose a brand...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.industry ? ` — ${b.industry}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Talent Multi-select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1.5 text-violet-500" />
                  Select Talents
                  {selectedTalents.length > 0 && (
                    <Badge className="ml-2 bg-violet-100 text-violet-700 border-0 text-xs">
                      {selectedTalents.length} selected
                    </Badge>
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {visibleTalents.map((t) => {
                    const isSelected = selectedTalents.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTalent(t.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-150 ${
                          isSelected
                            ? "border-violet-400 bg-violet-50 shadow-sm"
                            : "border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-violet-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {t.platform || "—"} / {t.niche || "—"} /{" "}
                            {t.tier || "—"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {talents.length > 12 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTalents(!showAllTalents)}
                    className="mt-2 text-violet-600 hover:text-violet-800 text-xs"
                  >
                    {showAllTalents ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 mr-1" />
                        Show fewer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 mr-1" />
                        Show all {talents.length} talents
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!selectedBrand || selectedTalents.length === 0 || loading}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:opacity-90 text-white rounded-xl shadow-md py-5 text-base font-semibold gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Personalized Pitch Deck...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Personalized Pitch
                  </>
                )}
              </Button>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-700">
                Pitch deck generated for{" "}
                <span className="text-violet-600">{brandObj?.name || "brand"}</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="rounded-xl gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Export JSON
                </>
              )}
            </Button>
          </div>

          {/* Executive Summary */}
          <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Executive Summary
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.executive_summary}
              </p>
            </CardContent>
          </Card>

          {/* Brand Narrative */}
          {result.brand_narrative && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-gray-900">
                    Brand Narrative
                  </h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.brand_narrative}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ROI Projections & Competitive Edge — side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ROI Projections */}
            {result.roi_projections && (
              <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-gray-900">
                      ROI Projections
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Estimated Total Reach", value: result.roi_projections.estimated_total_reach },
                      { label: "Projected Engagement", value: result.roi_projections.projected_engagement },
                      { label: "Estimated Media Value", value: result.roi_projections.estimated_media_value },
                      { label: "Cost per Engagement", value: result.roi_projections.cost_per_engagement },
                      { label: "Expected ROI Multiplier", value: result.roi_projections.expected_roi_multiplier },
                      { label: "vs. Benchmark", value: result.roi_projections.comparison_to_benchmark },
                      { label: "Timeline", value: result.roi_projections.timeline },
                    ].map((item, idx) =>
                      item.value ? (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-800 font-medium text-right max-w-[60%]">
                            {item.value}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitive Edge */}
            {result.competitive_edge && (
              <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-gray-900">
                      Competitive Edge
                    </h3>
                  </div>
                  {result.competitive_edge.market_position && (
                    <p className="text-sm text-gray-700 mb-3">
                      {result.competitive_edge.market_position}
                    </p>
                  )}
                  {result.competitive_edge.differentiators?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        Differentiators
                      </span>
                      <ul className="mt-1.5 space-y-1">
                        {result.competitive_edge.differentiators.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <ArrowRight className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.competitive_edge.competitor_gaps?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">
                        Competitor Gaps
                      </span>
                      <ul className="mt-1.5 space-y-1">
                        {result.competitive_edge.competitor_gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <Target className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.competitive_edge.strategic_advantage && (
                    <p className="mt-3 text-xs text-gray-600 bg-white/60 rounded-lg p-2 border border-blue-100">
                      <span className="font-semibold text-blue-700">Strategy: </span>
                      {result.competitive_edge.strategic_advantage}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Talent Showcase */}
          {result.talent_showcase?.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-violet-500" />
                  <h3 className="text-base font-bold text-gray-900">
                    Talent Showcase
                  </h3>
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-xs ml-auto">
                    {result.talent_showcase.length} creators
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.talent_showcase.map((talent, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-900">
                          {talent.talent_name}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {talent.platform && (
                            <Badge variant="outline" className="text-[10px]">
                              {talent.platform}
                            </Badge>
                          )}
                          {talent.match_score && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                              {talent.match_score} match
                            </Badge>
                          )}
                        </div>
                      </div>
                      {talent.match_reasoning && (
                        <p className="text-xs text-gray-600 mb-2">
                          {talent.match_reasoning}
                        </p>
                      )}
                      <div className="space-y-1 text-[11px]">
                        {talent.audience_alignment && (
                          <div className="text-gray-500">
                            <span className="font-medium text-gray-700">Audience: </span>
                            {talent.audience_alignment}
                          </div>
                        )}
                        {talent.content_synergy && (
                          <div className="text-gray-500">
                            <span className="font-medium text-gray-700">Content: </span>
                            {talent.content_synergy}
                          </div>
                        )}
                        {talent.recommended_deliverables && (
                          <div className="text-gray-500">
                            <span className="font-medium text-gray-700">Deliverables: </span>
                            {talent.recommended_deliverables}
                          </div>
                        )}
                        {talent.estimated_reach && (
                          <div className="text-gray-500">
                            <span className="font-medium text-gray-700">Est. Reach: </span>
                            {talent.estimated_reach}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          {result.risk_assessment && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-bold text-gray-900">
                    Risk Assessment
                  </h3>
                  {result.risk_assessment.overall_risk_level && (
                    <Badge
                      className={`ml-auto border-0 text-xs ${
                        result.risk_assessment.overall_risk_level.toLowerCase().includes("low")
                          ? "bg-green-100 text-green-700"
                          : result.risk_assessment.overall_risk_level.toLowerCase().includes("high")
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {result.risk_assessment.overall_risk_level}
                    </Badge>
                  )}
                </div>
                {result.risk_assessment.brand_safety_summary && (
                  <p className="text-sm text-gray-700 mb-3">
                    {result.risk_assessment.brand_safety_summary}
                  </p>
                )}
                {result.risk_assessment.risk_factors?.length > 0 && (
                  <div className="space-y-2">
                    {result.risk_assessment.risk_factors.map((rf, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50"
                      >
                        <AlertTriangle
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            rf.severity?.toLowerCase().includes("high")
                              ? "text-red-500"
                              : rf.severity?.toLowerCase().includes("low")
                              ? "text-green-500"
                              : "text-amber-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-800">
                              {rf.risk}
                            </span>
                            {rf.severity && (
                              <Badge variant="outline" className="text-[10px]">
                                {rf.severity}
                              </Badge>
                            )}
                          </div>
                          {rf.mitigation && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {rf.mitigation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Trend Alignment */}
          {result.trend_alignment?.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-gray-900">
                    Trend Alignment Opportunities
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {result.trend_alignment.map((ta, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
                    >
                      <h4 className="text-xs font-bold text-indigo-800 mb-1">
                        {ta.trend}
                      </h4>
                      {ta.relevance && (
                        <p className="text-[11px] text-gray-600 mb-1">
                          {ta.relevance}
                        </p>
                      )}
                      {ta.activation_idea && (
                        <p className="text-[11px] text-indigo-600">
                          <span className="font-medium">Activation: </span>
                          {ta.activation_idea}
                        </p>
                      )}
                      {ta.timing && (
                        <Badge
                          variant="outline"
                          className="mt-1.5 text-[10px] border-indigo-200 text-indigo-600"
                        >
                          {ta.timing}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {result.call_to_action && (
            <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-r from-violet-500 to-fuchsia-600">
              <CardContent className="p-5">
                <p className="text-white text-sm font-medium leading-relaxed text-center">
                  {result.call_to_action}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Slide-by-Slide Outline */}
          {result.slide_outline?.length > 0 && (
            <Card className="rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-violet-500" />
                  <h3 className="text-base font-bold text-gray-900">
                    Slide-by-Slide Preview
                  </h3>
                  <Badge className="bg-gray-100 text-gray-600 border-0 text-xs ml-auto">
                    {result.slide_outline.length} slides
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {result.slide_outline.map((slide, idx) => {
                    const isExpanded = expandedSlide === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedSlide(isExpanded ? null : idx)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 text-xs font-bold shrink-0">
                            {slide.slide_number || idx + 1}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 flex-1">
                            {slide.title}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 space-y-2">
                            <p className="text-sm text-gray-700 leading-relaxed pl-11">
                              {slide.content}
                            </p>
                            {slide.visual_suggestion && (
                              <div className="ml-11 flex items-start gap-1.5 text-[11px] text-violet-600 bg-violet-50 rounded-lg p-2 border border-violet-100">
                                <Presentation className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>
                                  <span className="font-medium">Visual: </span>
                                  {slide.visual_suggestion}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

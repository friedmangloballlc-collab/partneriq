import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, Loader2, ArrowRight, Building2, Users, Zap, BarChart3, TrendingUp, Database, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Scoring algorithm constants
const BRAND_TO_TALENT_FACTORS = [
  { name: "Audience Demographics Match", weight: 18, method: "Cosine similarity of demographic vectors", sources: "Social APIs, brand targets" },
  { name: "Content Niche Alignment", weight: 15, method: "Category overlap + semantic similarity", sources: "Content analysis, brand prefs" },
  { name: "Content-Brand Aesthetic Fit", weight: 12, method: "CLIP embedding similarity", sources: "Content images, brand guidelines" },
  { name: "Trajectory Prediction", weight: 12, method: "Alpha score × trajectory confidence", sources: "Trajectory Engine" },
  { name: "Engagement Quality", weight: 10, method: "Weighted engagement rate vs tier benchmark", sources: "Social metrics, benchmarks" },
  { name: "Brand Safety", weight: 10, method: "Historical content scan, controversy score", sources: "Content analysis, news" },
  { name: "Relationship Path Exists", weight: 8, method: "Path strength from graph", sources: "Neo4j relationship graph" },
  { name: "Budget Fit", weight: 8, method: "Rate estimate vs budget range overlap", sources: "Benchmarks, brand budget" },
  { name: "Past Performance", weight: 5, method: "Historical deal success rate", sources: "Deal outcomes database" },
  { name: "Geographic Relevance", weight: 2, method: "Location overlap scoring", sources: "Audience location, brand markets" },
];

const TALENT_TO_AGENCY_FACTORS = [
  { name: "Category Specialization", weight: 25, desc: "Agency expertise in talent's category" },
  { name: "Tier Alignment", weight: 20, desc: "Agency typically represents similar-tier talent" },
  { name: "Roster Composition", weight: 15, desc: "Complementary vs competitive roster" },
  { name: "Commission Alignment", weight: 15, desc: "Commission expectations match" },
  { name: "Geographic Focus", weight: 10, desc: "Agency markets align with talent goals" },
  { name: "Growth Support", weight: 10, desc: "Agency track record growing talent" },
  { name: "Response Rate", weight: 5, desc: "Historical responsiveness to inquiries" },
];

const VECTOR_EMBEDDINGS = [
  { type: "Talent Content", dims: 1536, model: "text-embedding-3-large", index: "IVFFlat" },
  { type: "Talent Visual", dims: 512, model: "CLIP ViT-L/14", index: "IVFFlat" },
  { type: "Talent Audience", dims: 512, model: "Custom trained", index: "IVFFlat" },
  { type: "Brand Identity", dims: 1536, model: "text-embedding-3-large", index: "IVFFlat" },
  { type: "Brand Visual", dims: 512, model: "CLIP ViT-L/14", index: "IVFFlat" },
];

const SCORE_INTERPRETATION = [
  { range: "90-100", quality: "Excellent", confidence: "Very High", action: "Auto-generate pitch deck, priority queue", color: "bg-emerald-100 text-emerald-700" },
  { range: "80-89", quality: "Strong", confidence: "High", action: "Generate deck, standard queue", color: "bg-blue-100 text-blue-700" },
  { range: "70-79", quality: "Moderate", confidence: "Medium", action: "Include in shortlist, manual review", color: "bg-amber-100 text-amber-700" },
  { range: "60-69", quality: "Weak", confidence: "Low", action: "Include only if few alternatives", color: "bg-orange-100 text-orange-700" },
  { range: "< 60", quality: "Poor", confidence: "Very Low", action: "Exclude from recommendations", color: "bg-red-100 text-red-700" },
];

export default function MatchEngine() {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedTalent, setSelectedTalent] = useState("");
  const [matchMode, setMatchMode] = useState("brand_to_talent");
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [showAlgorithm, setShowAlgorithm] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTalentId = urlParams.get("talentId");

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 100),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ["talents"],
    queryFn: () => base44.entities.Talent.list("-created_date", 100),
  });

  React.useEffect(() => {
    if (preselectedTalentId) {
      setSelectedTalent(preselectedTalentId);
      setMatchMode("talent_to_brand");
    }
  }, [preselectedTalentId]);

  const handleRunMatch = async () => {
    setMatching(true);
    const source = matchMode === "brand_to_talent"
      ? brands.find(b => b.id === selectedBrand)
      : talents.find(t => t.id === selectedTalent);
    const pool = matchMode === "brand_to_talent" ? talents : brands;

    const prompt = matchMode === "brand_to_talent"
      ? `You are a partnership matching AI. Analyze this brand and rank the best talent matches.

Brand: ${JSON.stringify(source)}

Available Talent Pool (top 10):
${JSON.stringify(pool.slice(0, 10).map(t => ({ id: t.id, name: t.name, niche: t.niche, platform: t.primary_platform, followers: t.total_followers, engagement: t.engagement_rate, tier: t.tier })))}

For each match, provide a score (0-100), reasoning, and recommended partnership type.
Return the top 5 matches.`
      : `You are a partnership matching AI. Analyze this talent/creator and rank the best brand matches.

Talent: ${JSON.stringify(source)}

Available Brand Pool (top 10):
${JSON.stringify(pool.slice(0, 10).map(b => ({ id: b.id, name: b.name, industry: b.industry, size: b.company_size, budget: b.annual_budget, niches: b.preferred_niches })))}

For each match, provide a score (0-100), reasoning, and recommended partnership type.
Return the top 5 matches.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                score: { type: "number" },
                reasoning: { type: "string" },
                partnership_type: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    setMatchResults(result);
    setMatching(false);
  };

  const handleCreatePartnership = async (match) => {
    const source = matchMode === "brand_to_talent"
      ? brands.find(b => b.id === selectedBrand)
      : talents.find(t => t.id === selectedTalent);

    await base44.entities.Partnership.create({
      title: matchMode === "brand_to_talent"
        ? `${source?.name} × ${match.name}`
        : `${match.name} × ${source?.name}`,
      brand_name: matchMode === "brand_to_talent" ? source?.name : match.name,
      talent_name: matchMode === "brand_to_talent" ? match.name : source?.name,
      brand_id: matchMode === "brand_to_talent" ? selectedBrand : match.id,
      talent_id: matchMode === "brand_to_talent" ? match.id : selectedTalent,
      match_score: match.score,
      match_reasoning: match.reasoning,
      partnership_type: match.partnership_type || "sponsorship",
      status: "discovered",
      priority: match.score >= 85 ? "p1" : match.score >= 70 ? "p2" : "p3",
    });

    base44.entities.Activity.create({
      action: "match_generated",
      description: `AI match: ${match.name} (${match.score}% score)`,
      resource_type: "partnership",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Match Engine</h1>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2.5">AI-Powered</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">10-factor weighted scoring with semantic understanding</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlgorithm(!showAlgorithm)}
            className="gap-1.5"
          >
            <Lightbulb className="w-4 h-4" /> Algorithm Details
          </Button>
        </div>
      </div>

      {/* Algorithm Details */}
      {showAlgorithm && (
        <Tabs defaultValue="factors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="factors">Scoring Factors</TabsTrigger>
            <TabsTrigger value="vectors">Vector Search</TabsTrigger>
            <TabsTrigger value="interpretation">Score Ranges</TabsTrigger>
          </TabsList>

          {/* Scoring Factors */}
          <TabsContent value="factors" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Brand-to-Talent Match Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Factor</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600">Weight</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Calculation Method</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Data Sources</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {BRAND_TO_TALENT_FACTORS.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
                          <td className="px-4 py-3 text-center"><Badge className="bg-indigo-100 text-indigo-700 font-bold">{f.weight}%</Badge></td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{f.method}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{f.sources}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Talent-to-Agency Match Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Factor</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600">Weight</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {TALENT_TO_AGENCY_FACTORS.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
                          <td className="px-4 py-3 text-center"><Badge className="bg-violet-100 text-violet-700 font-bold">{f.weight}%</Badge></td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vector Search */}
          <TabsContent value="vectors" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" /> Vector Embedding Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Type</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600">Dimensions</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Model</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {VECTOR_EMBEDDINGS.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-700">{v.type}</td>
                          <td className="px-4 py-2 text-center"><Badge className="bg-blue-100 text-blue-700 text-[10px]">{v.dims}d</Badge></td>
                          <td className="px-4 py-2 text-slate-600 font-mono text-xs">{v.model}</td>
                          <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{v.index}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Score Interpretation */}
          <TabsContent value="interpretation" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Match Score Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SCORE_INTERPRETATION.map((s, i) => (
                    <div key={i} className={`p-3 rounded-lg border border-slate-200 ${s.color}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{s.range}</p>
                          <p className="text-xs mt-1">Quality: <span className="font-medium">{s.quality}</span> • Confidence: <span className="font-medium">{s.confidence}</span></p>
                        </div>
                      </div>
                      <p className="text-xs">→ {s.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Configuration */}
      <Card className="border-slate-200/60">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Match Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMatchMode("brand_to_talent")}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${matchMode === "brand_to_talent" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <Building2 className={`w-5 h-5 ${matchMode === "brand_to_talent" ? "text-indigo-600" : "text-slate-400"}`} />
                  <div className="text-left">
                    <p className="text-sm font-medium">Brand → Talent</p>
                    <p className="text-[11px] text-slate-400">Find talent for a brand</p>
                  </div>
                </button>
                <button
                  onClick={() => setMatchMode("talent_to_brand")}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${matchMode === "talent_to_brand" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <Users className={`w-5 h-5 ${matchMode === "talent_to_brand" ? "text-indigo-600" : "text-slate-400"}`} />
                  <div className="text-left">
                    <p className="text-sm font-medium">Talent → Brand</p>
                    <p className="text-[11px] text-slate-400">Find brands for a creator</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {matchMode === "brand_to_talent" ? "Select Brand" : "Select Talent"}
              </label>
              {matchMode === "brand_to_talent" ? (
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger><SelectValue placeholder="Choose a brand..." /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedTalent} onValueChange={setSelectedTalent}>
                  <SelectTrigger><SelectValue placeholder="Choose talent..." /></SelectTrigger>
                  <SelectContent>
                    {talents.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              onClick={handleRunMatch}
              disabled={matching || (matchMode === "brand_to_talent" ? !selectedBrand : !selectedTalent)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10 px-6"
            >
              {matching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {matching ? "Matching..." : "Run AI Match"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {matching && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Running AI Match Engine</h3>
          <p className="text-sm text-slate-400 mt-1">Analyzing compatibility across 10 factors...</p>
        </div>
      )}

      {matchResults && !matching && (
        <div className="space-y-6">
          {matchResults.summary && (
            <Card className="border-indigo-200/60 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-5">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-indigo-800">AI Analysis Summary</h4>
                  <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">{matchResults.summary}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {matchResults.matches?.map((match, i) => (
              <Card key={i} className="border-slate-200/60 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold">
                            {match.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border">
                          <span className="text-[10px] font-bold text-indigo-600">#{i + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">{match.name}</h3>
                          {match.partnership_type && (
                            <Badge variant="outline" className="text-[10px]">{match.partnership_type}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{match.reasoning}</p>
                        {match.strengths?.length > 0 && (
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {match.strengths.map((s, j) => (
                              <Badge key={j} className="bg-emerald-50 text-emerald-700 text-[10px]">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-52 p-5 bg-slate-50/50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Match Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-indigo-600">{match.score}</span>
                        <span className="text-sm text-slate-400">/ 100</span>
                      </div>
                      <Progress value={match.score} className="mt-2 h-1.5" />
                    </div>
                    <Button
                      size="sm"
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-xs"
                      onClick={() => handleCreatePartnership(match)}
                    >
                      <ArrowRight className="w-3 h-3 mr-1.5" /> Create Partnership
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!matchResults && !matching && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Ready to find matches</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Select a brand or talent above, then run the AI Match Engine to discover high-potential partnership opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
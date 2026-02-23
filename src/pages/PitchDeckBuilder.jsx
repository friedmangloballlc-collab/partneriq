import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Layers, Sparkles, Loader2, Download, ChevronLeft, ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import CustomizationPanel, { DEFAULT_OPTIONS } from "@/components/pitchdeck/CustomizationPanel";

const DECK_SECTIONS = [
  { id: "executive_summary", title: "Executive Summary", icon: "📋" },
  { id: "partnership_overview", title: "Partnership Overview", icon: "🤝" },
  { id: "talent_profile", title: "Talent Profile", icon: "⭐" },
  { id: "audience_analysis", title: "Audience Analysis", icon: "👥" },
  { id: "content_strategy", title: "Content Strategy", icon: "🎯" },
  { id: "brand_alignment", title: "Brand Alignment", icon: "🧭" },
  { id: "performance_metrics", title: "Performance Metrics", icon: "📊" },
  { id: "roi_projection", title: "ROI Projection", icon: "💰" },
  { id: "deliverables", title: "Deliverables & Timeline", icon: "📅" },
  { id: "pricing_terms", title: "Pricing & Terms", icon: "💼" },
  { id: "case_studies", title: "Comparable Case Studies", icon: "🏆" },
  { id: "next_steps", title: "Next Steps & CTA", icon: "🚀" },
];

function SlidePreview({ section, content, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isActive ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{section.icon}</span>
        <span className="text-xs font-semibold text-slate-700 truncate">{section.title}</span>
        {content ? <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-auto" /> : null}
      </div>
      {content ? (
        <p className="text-[10px] text-slate-400 line-clamp-2">{content.substring(0, 80)}...</p>
      ) : (
        <p className="text-[10px] text-slate-300 italic">Not generated</p>
      )}
    </button>
  );
}

export default function PitchDeckBuilder() {
  const [selectedPartnership, setSelectedPartnership] = useState("none");
  const [slides, setSlides] = useState({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingSlide, setGeneratingSlide] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [editingContent, setEditingContent] = useState({});
  const [progress, setProgress] = useState(0);

  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => base44.entities.Partnership.list("-created_date", 100),
  });

  const selectedDeal = partnerships.find(p => p.id === selectedPartnership);

  const generateSlide = async (sectionId) => {
    if (!selectedDeal) return;
    setGeneratingSlide(sectionId);
    const section = DECK_SECTIONS.find(s => s.id === sectionId);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate the "${section.title}" slide content for a partnership pitch deck.

Partnership: ${selectedDeal.title}
Brand: ${selectedDeal.brand_name || "N/A"}
Talent: ${selectedDeal.talent_name || "N/A"}
Type: ${selectedDeal.partnership_type?.replace(/_/g, " ") || "partnership"}
Deal Value: ${selectedDeal.deal_value ? `$${selectedDeal.deal_value}` : "TBD"}
Match Score: ${selectedDeal.match_score || "N/A"}%
Notes: ${selectedDeal.notes || "N/A"}

Write compelling, specific slide content for the "${section.title}" section. 
Be concise, data-driven, and persuasive. Use bullet points where appropriate.
Under 200 words.`,
      response_json_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          content: { type: "string" },
          key_points: { type: "array", items: { type: "string" } }
        }
      }
    });
    setSlides(prev => ({ ...prev, [sectionId]: result }));
    setGeneratingSlide(null);
  };

  const generateAll = async () => {
    if (!selectedDeal) return;
    setGeneratingAll(true);
    setProgress(0);
    for (let i = 0; i < DECK_SECTIONS.length; i++) {
      await generateSlide(DECK_SECTIONS[i].id);
      setProgress(Math.round(((i + 1) / DECK_SECTIONS.length) * 100));
    }
    setGeneratingAll(false);
  };

  const currentSection = DECK_SECTIONS[activeSlide];
  const currentSlide = slides[currentSection?.id];
  const generatedCount = Object.keys(slides).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pitch Deck Generation System</h1>
          <p className="text-sm text-slate-500 mt-1">Automatically generates custom pitch decks for every qualified match. Always routes to approval queue — never sent without human review.</p>
        </div>
        {generatedCount > 0 && (
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Deck
          </Button>
        )}
      </div>

      {/* Deal selector */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <Label className="text-xs text-slate-500 mb-1 block">Select Partnership Deal</Label>
              <Select value={selectedPartnership} onValueChange={setSelectedPartnership}>
                <SelectTrigger><SelectValue placeholder="Choose a deal to generate a pitch deck for..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Select a deal —</SelectItem>
                  {partnerships.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} {p.brand_name ? `· ${p.brand_name}` : ""} {p.talent_name ? `× ${p.talent_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 shrink-0"
              onClick={generateAll}
              disabled={!selectedDeal || generatingAll}
            >
              {generatingAll
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating {progress}%</>
                : <><Sparkles className="w-4 h-4" /> Generate Full Deck</>}
            </Button>
          </div>
          {generatingAll && <Progress value={progress} className="mt-3 h-1.5" />}
          {generatedCount > 0 && !generatingAll && (
            <p className="text-xs text-emerald-600 mt-2">{generatedCount}/{DECK_SECTIONS.length} slides generated</p>
          )}
        </CardContent>
      </Card>

      {!selectedDeal ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl">
          <Layers className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-500">Select a Partnership</h3>
          <p className="text-sm text-slate-400 mt-1">Choose a deal above to start building your pitch deck</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slide navigator */}
          <div className="lg:col-span-1 space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {DECK_SECTIONS.map((section, i) => (
              <SlidePreview
                key={section.id}
                section={section}
                content={typeof slides[section.id] === "object" ? slides[section.id]?.content : slides[section.id]}
                isActive={activeSlide === i}
                onClick={() => setActiveSlide(i)}
              />
            ))}
          </div>

          {/* Slide view */}
          <div className="lg:col-span-3">
            <Card className="border-slate-200/60 min-h-[500px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentSection.icon}</span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Slide {activeSlide + 1} of {DECK_SECTIONS.length}</p>
                    <h2 className="text-base font-semibold text-slate-800">{currentSection.title}</h2>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5"
                    onClick={() => generateSlide(currentSection.id)}
                    disabled={generatingSlide === currentSection.id || generatingAll}>
                    {generatingSlide === currentSection.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Sparkles className="w-3 h-3 text-purple-500" />}
                    {currentSlide ? "Regenerate" : "Generate"}
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {generatingSlide === currentSection.id ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-400">Generating slide content...</p>
                  </div>
                ) : currentSlide ? (
                  <div className="space-y-4">
                    {currentSlide.headline && (
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Headline</p>
                        <h3 className="text-lg font-bold">{currentSlide.headline}</h3>
                      </div>
                    )}

                    {currentSlide.content && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {editingContent[currentSection.id] !== undefined
                            ? editingContent[currentSection.id]
                            : currentSlide.content}
                        </p>
                        <Textarea
                          className="mt-3 text-xs min-h-[120px]"
                          placeholder="Edit content..."
                          value={editingContent[currentSection.id] ?? currentSlide.content}
                          onChange={e => setEditingContent(prev => ({ ...prev, [currentSection.id]: e.target.value }))}
                        />
                      </div>
                    )}

                    {currentSlide.key_points?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Points</p>
                        <ul className="space-y-2">
                          {currentSlide.key_points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Layers className="w-10 h-10 text-slate-200" />
                    <p className="text-sm text-slate-400">Click "Generate" to create this slide with AI</p>
                  </div>
                )}
              </CardContent>

              {/* Nav */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={activeSlide === 0} onClick={() => setActiveSlide(a => a - 1)}>
                  <ChevronLeft className="w-3 h-3" /> Previous
                </Button>
                <span className="text-xs text-slate-400">{activeSlide + 1} / {DECK_SECTIONS.length}</span>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={activeSlide === DECK_SECTIONS.length - 1} onClick={() => setActiveSlide(a => a + 1)}>
                  Next <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
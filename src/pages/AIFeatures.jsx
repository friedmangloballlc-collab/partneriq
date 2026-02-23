import React, { useState } from "react";
import {
  Zap, TrendingUp, Mic, BarChart3, Network, DollarSign,
  Lightbulb, Eye, Shield, CheckCircle2, AlertTriangle,
  Brain, Target, Layers, GitBranch, Activity, FileText, Palette, Clock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Section 8: Trajectory Engine ─────────────────────────────────────────────
const EARLY_SIGNALS = [
  { signal: "Content Velocity",      detect: "Posting frequency acceleration",         sources: "Platform APIs, historical data",        value: "Strong" },
  { signal: "Engagement Inflection", detect: "Sudden engagement rate increases",        sources: "Comments, shares, saves trends",        value: "Strong" },
  { signal: "Cross-Platform Migration", detect: "Expansion to new platforms",           sources: "New account detection",                value: "High" },
  { signal: "Niche Timing",          detect: "Entry into trending categories",          sources: "Content analysis, trend data",          value: "High" },
  { signal: "Network Effects",       detect: "Collaborations with larger creators",     sources: "Mention detection, collabs",           value: "High" },
  { signal: "Audience Quality Shift",detect: "Improvement in follower authenticity",    sources: "Bot detection, engagement depth",       value: "Medium" },
  { signal: "Brand Interest Signals",detect: "Increased brand mentions/tags",           sources: "Content analysis",                     value: "Medium" },
  { signal: "Viral Precursors",      detect: "Content patterns before viral hits",      sources: "Historical viral analysis",             value: "Strong" },
];

const TRAJECTORIES = [
  { cls: "🚀 Rocket",         criteria: "10x+ growth predicted",        timeframe: "6-12 months",  accuracy: "72%", action: "Immediate priority outreach",    color: "bg-red-100 text-red-700 border-red-200" },
  { cls: "⭐ Rising Star",    criteria: "3-5x growth predicted",        timeframe: "12-18 months", accuracy: "81%", action: "Add to watch list, early contact", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { cls: "📈 Steady Climber", criteria: "50-100% growth annually",      timeframe: "Ongoing",      accuracy: "85%", action: "Standard evaluation process",    color: "bg-blue-100 text-blue-700 border-blue-200" },
  { cls: "📊 Plateauing",     criteria: "Growth stalling, < 10%",       timeframe: "Next 6 months",accuracy: "79%", action: "Evaluate current value only",    color: "bg-slate-100 text-slate-600 border-slate-200" },
  { cls: "📉 Declining",      criteria: "Negative trajectory",          timeframe: "Next 6 months",accuracy: "83%", action: "Caution, reassess existing deals",color: "bg-rose-100 text-rose-700 border-rose-200" },
];

const ALPHA_SCORES = [
  { range: "> 5.0",    interp: "Exceptional opportunity", opp: "5x+ ROI potential",     action: "Immediate priority outreach, lock in rates",  color: "bg-emerald-500" },
  { range: "3.0 – 5.0",interp: "High alpha",             opp: "3-5x ROI potential",    action: "Add to priority shortlist, quick engagement", color: "bg-teal-500" },
  { range: "1.5 – 3.0",interp: "Moderate alpha",         opp: "Reasonable upside",      action: "Standard evaluation, monitor trajectory",     color: "bg-blue-500" },
  { range: "1.0 – 1.5",interp: "Fairly priced",          opp: "Market rate",            action: "Proceed if fit is strong",                    color: "bg-slate-400" },
  { range: "< 1.0",    interp: "Overpriced",             opp: "Below-market ROI likely",action: "Negotiate aggressively or pass",              color: "bg-red-500" },
];

const ML_MODELS = [
  { component: "Time Series Model",       tech: "LSTM + Transformer",     features: "Historical metrics, seasonality",        update: "Weekly retrain" },
  { component: "Growth Pattern Classifier",tech: "XGBoost ensemble",      features: "Growth patterns, benchmarks",            update: "Monthly retrain" },
  { component: "Viral Predictor",         tech: "CNN on content features", features: "Visual, audio, text features",           update: "Weekly retrain" },
  { component: "Network Effect Model",    tech: "Graph Neural Network",    features: "Collaboration graph, influence",         update: "Weekly update" },
  { component: "Ensemble Aggregator",     tech: "Weighted voting",         features: "All model outputs",                     update: "Real-time" },
];

// ── Section 9: Negotiation Co-Pilot ──────────────────────────────────────────
const COPILOT_FEATURES = [
  { feature: "Audio Transcription",  how: "Real-time speech-to-text via Whisper",          display: "Live transcript panel",         latency: "< 2s" },
  { feature: "Speaker Detection",    how: "Voice fingerprinting identifies speakers",       display: "Color-coded transcript",        latency: "< 1s" },
  { feature: "Context Engine",       how: "Pulls comparable deals, rates, history",         display: "Side panel reference cards",    latency: "Pre-loaded" },
  { feature: "Counter-Offer Calc",   how: "Calculates optimal counter based on comps",      display: "Whisper notification",          latency: "< 3s" },
  { feature: "Sentiment Analysis",   how: "Detects flexibility/firmness cues",              display: "Color indicators on text",      latency: "Real-time" },
  { feature: "Key Term Extraction",  how: "Highlights important terms mentioned",           display: "Bold in transcript",            latency: "Real-time" },
  { feature: "Walk-Away Alert",      how: "Warns when terms exceed limits",                 display: "Red alert banner",              latency: "< 1s" },
  { feature: "Talking Points",       how: "Suggests responses to objections",               display: "Expandable cards",             latency: "< 2s" },
  { feature: "Post-Call Memo",       how: "Auto-generates deal summary",                    display: "One-click generation",          latency: "< 30s" },
];

const WHISPER_NOTIFS = [
  { notif: "Rate Alert",       trigger: "They mention a rate",              content: "Compare to benchmark: '$X is 20% above market for this tier'", color: "bg-amber-50 border-amber-200" },
  { notif: "Counter Suggestion",trigger: "They make an offer",             content: "Suggested counter: '$Y based on [comparable deal]'",           color: "bg-indigo-50 border-indigo-200" },
  { notif: "Flexibility Cue",  trigger: "Language suggests flexibility",    content: "'They used hedge words - may have room to negotiate'",          color: "bg-emerald-50 border-emerald-200" },
  { notif: "Firmness Alert",   trigger: "Language suggests firm position",  content: "'Strong language detected - this may be final'",               color: "bg-red-50 border-red-200" },
  { notif: "Term Extraction",  trigger: "Key term mentioned",               content: "'Exclusivity mentioned - current scope: [details]'",           color: "bg-blue-50 border-blue-200" },
  { notif: "Walk-Away Warning",trigger: "Terms exceed limits",              content: "'This exceeds your $X budget limit'",                          color: "bg-red-50 border-red-200" },
  { notif: "Talking Point",    trigger: "Common objection detected",        content: "Suggested response to '[objection type]'",                     color: "bg-violet-50 border-violet-200" },
];

// ── Section 10: Simulation Engine ────────────────────────────────────────────
const SIM_METHODOLOGY = [
  { component: "Audience Modeling",   method: "Synthetic population generation",  inputs: "Follower demographics, interests",    outputs: "Simulated audience segments" },
  { component: "Content Performance", method: "Historical pattern matching",       inputs: "Past content metrics, timing",        outputs: "Expected reach, engagement" },
  { component: "Brand Lift",          method: "Regression on past campaigns",      inputs: "Brand awareness baselines",           outputs: "Predicted awareness delta" },
  { component: "Sales Attribution",   method: "Marketing mix modeling",            inputs: "Historical conversion data",          outputs: "Estimated conversions, revenue" },
  { component: "Risk Scenarios",      method: "Tail event simulation",             inputs: "Historical crisis data",              outputs: "Probability of negative outcomes" },
  { component: "Scenario Aggregation",method: "Monte Carlo (10K runs)",            inputs: "All component outputs",               outputs: "P10/P50/P90 distributions" },
];

// ── Section 11: Graph Intelligence ───────────────────────────────────────────
const GRAPH_NODES = [
  { type: "Talent",  count: "10M+",  props: "Name, tier, category, platforms", update: "Daily" },
  { type: "Brand",   count: "500K+", props: "Name, industry, size, budget",    update: "Weekly" },
  { type: "Agency",  count: "50K+",  props: "Name, type, roster size, specializations", update: "Weekly" },
  { type: "Contact", count: "2M+",   props: "Name, title, company, email",     update: "Weekly" },
  { type: "Company", count: "1M+",   props: "Name, industry, size, location",  update: "Monthly" },
];

const GRAPH_EDGES = [
  { edge: "REPRESENTED_BY",   desc: "Agent/manager relationship",       weight: 0.9, decay: "10%/yr" },
  { edge: "WORKED_WITH",      desc: "Past brand deal together",          weight: 0.7, decay: "15%/yr" },
  { edge: "COLLABORATED_WITH",desc: "Content collaboration",             weight: 0.6, decay: "20%/yr" },
  { edge: "CONNECTED_TO",     desc: "LinkedIn/social connection",        weight: 0.3, decay: "25%/yr" },
  { edge: "INTRODUCED_BY",    desc: "Historical intro made",             weight: 0.8, decay: "10%/yr" },
  { edge: "EMPLOYED_BY",      desc: "Current employment",                weight: 0.8, decay: "5%/yr" },
  { edge: "PREVIOUSLY_AT",    desc: "Past employment",                   weight: 0.4, decay: "20%/yr" },
  { edge: "INVESTED_IN",      desc: "Investment relationship",           weight: 0.7, decay: "10%/yr" },
];

// ── Section 13: Deal Structure Lab ───────────────────────────────────────────
const DEAL_STRUCTURES = [
  { structure: "Hybrid Equity + Cash",       desc: "Lower upfront cash, equity upside in brand",        best: "Startups, high-growth brands",    lift: "+28%", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { structure: "Performance Floor + Upside", desc: "Guaranteed minimum, bonus for KPI beats",           best: "Risk-averse talent",              lift: "+35%", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { structure: "Revenue Share",              desc: "Percentage of attributed sales",                    best: "E-commerce, DTC brands",          lift: "+22%", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { structure: "Cross-Promo Swap",           desc: "Mutual promotion, no cash exchange",                best: "Similar-sized creators",          lift: "+40%", color: "bg-violet-50 border-violet-200 text-violet-700" },
  { structure: "Graduated Exclusivity",      desc: "Exclusivity scope expands with spend",              best: "Testing relationships",           lift: "+31%", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { structure: "Option-to-Extend",           desc: "Initial term with renewal option at fixed rate",    best: "Uncertain fit",                   lift: "+25%", color: "bg-teal-50 border-teal-200 text-teal-700" },
  { structure: "Content Bank",               desc: "Pre-pay for content library, use over time",        best: "Brands needing flexibility",      lift: "+18%", color: "bg-rose-50 border-rose-200 text-rose-700" },
  { structure: "Milestone-Based",            desc: "Payments tied to deliverable milestones",           best: "Complex campaigns",               lift: "+20%", color: "bg-orange-50 border-orange-200 text-orange-700" },
];

// ── Section 14: Content-Brand Fit ─────────────────────────────────────────────
const FIT_DIMENSIONS = [
  { dim: "Visual Style",        method: "CLIP embeddings, color analysis, composition",          output: "Style compatibility %, aesthetic match" },
  { dim: "Tone / Voice",        method: "NLP sentiment, humor classification, formality scoring",output: "Tone alignment %, humor compatibility" },
  { dim: "Themes",              method: "Topic modeling, value extraction, lifestyle analysis",  output: "Thematic overlap score, value alignment" },
  { dim: "Production Quality",  method: "Resolution, editing sophistication, audio quality",     output: "Quality tier (A/B/C), consistency score" },
  { dim: "Audience Interaction",method: "Comment analysis, response patterns, community vibe",  output: "Interaction style match, community health" },
  { dim: "Brand Safety",        method: "Historical content scan, controversy detection",        output: "Risk probability, incident history" },
];

// ── Section 15: Autonomous Mode ───────────────────────────────────────────────
const AUTONOMOUS_ACTIONS = [
  { action: "Identify matches",        autonomous: "Always autonomous",          human: "Never requires review",                 autoColor: "text-emerald-600" },
  { action: "Generate pitch deck",     autonomous: "Always autonomous",          human: "Never requires review",                 autoColor: "text-emerald-600" },
  { action: "Send initial outreach",   autonomous: "Deal value < threshold",     human: "Deal value ≥ threshold",                autoColor: "text-blue-600" },
  { action: "Send follow-ups",         autonomous: "Original was autonomous",    human: "Original required review",              autoColor: "text-blue-600" },
  { action: "Negotiate terms",         autonomous: "Within guardrails",          human: "Any term outside guardrails",           autoColor: "text-amber-600" },
  { action: "Accept counter-offer",    autonomous: "Within guardrails",          human: "Any deviation from guardrails",         autoColor: "text-amber-600" },
  { action: "Close deal",              autonomous: "Value < threshold, std terms",human: "Value ≥ threshold OR non-standard",   autoColor: "text-amber-600" },
  { action: "Generate contract",       autonomous: "Standard template sufficient",human: "Custom terms required",               autoColor: "text-amber-600" },
];

// ── Shared ────────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, title, subtitle }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${color} mb-4`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {subtitle && <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function DataTable({ headers, rows, renderRow }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
}

export default function AIFeatures() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-500" />
          Advanced AI Features
        </h1>
        <p className="text-sm text-slate-500 mt-1">ML systems, real-time intelligence, and autonomous deal execution powering PartnerIQ</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Trajectory Engine",   icon: TrendingUp,  color: "text-indigo-600 bg-indigo-50",  desc: "78% accuracy at 12 months" },
          { label: "Negotiation Co-Pilot",icon: Mic,         color: "text-violet-600 bg-violet-50",  desc: "Real-time deal assistance" },
          { label: "Simulation Engine",   icon: BarChart3,   color: "text-blue-600 bg-blue-50",      desc: "10,000 Monte Carlo runs" },
          { label: "Graph Intelligence",  icon: Network,     color: "text-emerald-600 bg-emerald-50",desc: "14M+ nodes mapped" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-slate-200/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{c.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="trajectory">
        <TabsList className="bg-slate-100 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="trajectory">Trajectory Engine</TabsTrigger>
          <TabsTrigger value="copilot">Negotiation Co-Pilot</TabsTrigger>
          <TabsTrigger value="simulation">Simulation Engine</TabsTrigger>
          <TabsTrigger value="graph">Graph Intelligence</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Optimizer</TabsTrigger>
          <TabsTrigger value="deallab">Deal Structure Lab</TabsTrigger>
          <TabsTrigger value="contentfit">Content-Brand Fit</TabsTrigger>
          <TabsTrigger value="autonomous">Autonomous Mode</TabsTrigger>
        </TabsList>

        {/* ── Trajectory Engine ── */}
        <TabsContent value="trajectory" className="mt-4 space-y-5">
          <SectionHeader icon={TrendingUp} color="bg-indigo-50 border-indigo-200 text-indigo-700" title="Predictive Talent Trajectory Engine" subtitle="ML models predict creator growth 6–18 months out with 78% accuracy at 12 months" />

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Early Signal Detection</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Signal Type","What We Detect","Data Sources","Predictive Value"]}
                rows={EARLY_SIGNALS}
                renderRow={(r) => (
                  <tr key={r.signal} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.signal}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.detect}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.sources}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${r.value === "Strong" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{r.value}</Badge>
                    </td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Trajectory Classifications</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TRAJECTORIES.map(t => (
                  <div key={t.cls} className={`flex items-center gap-3 p-3 rounded-lg border ${t.color}`}>
                    <p className="text-sm font-bold w-36 flex-shrink-0">{t.cls}</p>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px]">
                      <span>{t.criteria}</span>
                      <span className="font-mono">{t.timeframe}</span>
                      <span>{t.action}</span>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0">{t.accuracy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Discovery Alpha Score</CardTitle>
              <p className="text-[11px] text-slate-400 mt-1 font-normal">Formula: <code className="bg-slate-100 px-1 rounded text-indigo-700">Alpha = (Predicted Future Value / Current Rate) × Trajectory Confidence</code></p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ALPHA_SCORES.map(a => (
                  <div key={a.range} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${a.color}`} />
                    <div className="w-20 flex-shrink-0">
                      <span className="text-sm font-bold text-slate-800">{a.range}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{a.interp}</p>
                      <p className="text-[11px] text-slate-500">{a.opp}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 hidden sm:block text-right max-w-[200px]">{a.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Model Architecture</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Component","Technology","Features Used","Update Frequency"]}
                rows={ML_MODELS}
                renderRow={(r) => (
                  <tr key={r.component} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.component}</td>
                    <td className="px-4 py-3"><code className="text-xs font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">{r.tech}</code></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.features}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{r.update}</Badge></td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Negotiation Co-Pilot ── */}
        <TabsContent value="copilot" className="mt-4 space-y-5">
          <SectionHeader icon={Mic} color="bg-violet-50 border-violet-200 text-violet-700" title="Live Negotiation Co-Pilot" subtitle="Real-time AI assistance during deal calls. Human controls all responses—AI only suggests. Never speaks or acts autonomously." />

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Real-Time Capabilities</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Feature","How It Works","Display Method","Latency"]}
                rows={COPILOT_FEATURES}
                renderRow={(r) => (
                  <tr key={r.feature} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.feature}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.how}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.display}</td>
                    <td className="px-4 py-3"><code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{r.latency}</code></td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Whisper Notification Types</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WHISPER_NOTIFS.map(w => (
                  <div key={w.notif} className={`p-3 rounded-lg border ${w.color}`}>
                    <p className="text-xs font-bold text-slate-800 mb-1">{w.notif}</p>
                    <p className="text-[11px] text-slate-500 mb-1.5"><span className="font-medium">Trigger:</span> {w.trigger}</p>
                    <p className="text-[11px] text-slate-600 italic">{w.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Supported Platforms</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { platform: "Zoom",            method: "Browser extension", features: "Full audio, transcript, screen share detection", icon: "💻" },
                  { platform: "Google Meet",      method: "Browser extension", features: "Full audio, transcript",                         icon: "💻" },
                  { platform: "Microsoft Teams",  method: "Browser extension", features: "Full audio, transcript",                         icon: "💻" },
                  { platform: "Phone Calls",      method: "Mobile app",        features: "Audio only, transcript, whisper mode",            icon: "📱" },
                  { platform: "In-Person",        method: "Mobile app",        features: "Audio capture, transcript, discreet mode",        icon: "📱" },
                ].map(p => (
                  <div key={p.platform} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{p.icon}</span>
                      <p className="text-xs font-semibold text-slate-800">{p.platform}</p>
                      <Badge variant="secondary" className="text-[10px] ml-auto">{p.method}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">{p.features}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Simulation Engine ── */}
        <TabsContent value="simulation" className="mt-4 space-y-5">
          <SectionHeader icon={BarChart3} color="bg-blue-50 border-blue-200 text-blue-700" title="Partnership Simulation Engine" subtitle="Monte Carlo modeling with 10,000 scenarios predicts campaign outcomes. Reduces failed campaigns by 40%+." />

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Simulation Methodology</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Component","Method","Inputs","Outputs"]}
                rows={SIM_METHODOLOGY}
                renderRow={(r) => (
                  <tr key={r.component} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.component}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.method}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.inputs}</td>
                    <td className="px-4 py-3 text-xs text-indigo-700">{r.outputs}</td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Pre-Deal Report Sections</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { section: "Executive Summary",    contents: "One-page overview: expected ROI, confidence, top risks",              icon: "📋" },
                  { section: "Audience Analysis",     contents: "Overlap analysis, demographic fit, reach projections",                icon: "👥" },
                  { section: "Performance Projections",contents: "Detailed P10/P50/P90 for all KPIs",                                 icon: "📈" },
                  { section: "Comparable Campaigns",  contents: "3-5 similar past campaigns with actual results",                     icon: "🔍" },
                  { section: "Risk Assessment",       contents: "Top 5 risks with probability and mitigation strategies",             icon: "⚠️" },
                  { section: "Optimal Structure",     contents: "Recommended deal structure, timing, deliverables",                   icon: "🏗️" },
                  { section: "Sensitivity Analysis",  contents: "How results change with budget, timing, content variations",         icon: "🎛️" },
                ].map(s => (
                  <div key={s.section} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-lg flex-shrink-0">{s.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{s.section}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.contents}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Graph Intelligence ── */}
        <TabsContent value="graph" className="mt-4 space-y-5">
          <SectionHeader icon={Network} color="bg-emerald-50 border-emerald-200 text-emerald-700" title="Relationship Graph Intelligence" subtitle="Neo4j graph database maps industry relationships for warm intro paths. 'Six degrees to any deal.'" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Node Types</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {GRAPH_NODES.map(n => (
                    <div key={n.type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="w-16 flex-shrink-0">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{n.type}</Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">{n.count}</p>
                        <p className="text-[11px] text-slate-500 truncate">{n.props}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{n.update}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Edge Types (Relationships)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {GRAPH_EDGES.map(e => {
                    const wColor = e.weight >= 0.8 ? "text-emerald-700 bg-emerald-50" : e.weight >= 0.6 ? "text-blue-700 bg-blue-50" : "text-slate-600 bg-slate-100";
                    return (
                      <div key={e.edge} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <code className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded flex-shrink-0">{e.edge}</code>
                        <p className="text-[11px] text-slate-600 flex-1 min-w-0">{e.desc}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wColor}`}>{e.weight}</span>
                          <span className="text-[10px] text-slate-400">{e.decay}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Pathfinding Algorithms</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Algorithm","Use Case","Output","Complexity"]}
                rows={[
                  { algo: "Shortest Path",    use: "Minimum hops to target",                  out: "Fewest intermediaries needed",                  cx: "O(V + E)" },
                  { algo: "Strongest Path",   use: "Highest relationship strength product",    out: "Best chance of successful intro",               cx: "O(V² log V)" },
                  { algo: "Multiple Paths",   use: "Redundancy if one path fails",             out: "Top 3-5 alternative routes",                    cx: "O(K × V × E)" },
                  { algo: "Influence Score",  use: "Who has most connections to target",       out: "Ranked list of potential intros",               cx: "O(V + E)" },
                  { algo: "Mutual Connections",use: "Shared connections with target",          out: "Common contacts for credibility",               cx: "O(E)" },
                ]}
                renderRow={(r) => (
                  <tr key={r.algo} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.algo}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.use}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.out}</td>
                    <td className="px-4 py-3"><code className="text-xs font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">{r.cx}</code></td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Revenue Optimizer ── */}
        <TabsContent value="revenue" className="mt-4 space-y-5">
          <SectionHeader icon={DollarSign} color="bg-amber-50 border-amber-200 text-amber-700" title="Creator Revenue Optimizer" subtitle="Analyzes creator revenue mix vs category benchmarks. First platform that genuinely serves creator economics." />

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Revenue Stream Analysis</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Revenue Stream","Typical Mix","Top Performer Mix","Optimization Opportunity"]}
                rows={[
                  { stream: "Sponsored Content",         typ: "40-60%", top: "30-40%", opp: "Rate optimization, better targeting" },
                  { stream: "Brand Ambassadorships",      typ: "15-25%", top: "20-30%", opp: "Convert one-offs to long-term" },
                  { stream: "Merchandise",               typ: "5-15%",  top: "15-25%", opp: "Launch/expand product lines" },
                  { stream: "Licensing",                 typ: "5-10%",  top: "10-20%", opp: "Often underutilized, high margin" },
                  { stream: "Courses/Education",         typ: "5-10%",  top: "10-15%", opp: "Knowledge monetization" },
                  { stream: "Memberships/Subscriptions", typ: "5-15%",  top: "15-25%", opp: "Recurring revenue stability" },
                  { stream: "Affiliate/Commission",      typ: "5-10%",  top: "10-15%", opp: "Passive income stream" },
                  { stream: "Events/Appearances",        typ: "5-10%",  top: "5-10%",  opp: "Premium pricing opportunities" },
                ]}
                renderRow={(r) => (
                  <tr key={r.stream} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.stream}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{r.typ}</td>
                    <td className="px-4 py-3 text-xs font-mono text-emerald-700 font-semibold">{r.top}</td>
                    <td className="px-4 py-3 text-xs text-indigo-700">{r.opp}</td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Exclusivity Optimization</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { issue: "Overly broad exclusivity",        detect: "Contract term analysis",        rec: "Negotiate category-specific vs industry-wide" },
                  { issue: "Below-market exclusivity premium",detect: "Rate comparison",               rec: "Request 2-3x premium for exclusivity" },
                  { issue: "Conflicting exclusivities",       detect: "Contract overlap detection",    rec: "Flag before signing new deals" },
                  { issue: "Exclusivity blocking better deals",detect:"Opportunity cost calculation",  rec: "Quantify missed revenue" },
                  { issue: "Unused exclusivity carve-outs",   detect: "Activity analysis",            rec: "Identify monetizable carve-outs" },
                ].map(e => (
                  <div key={e.issue} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-800">{e.issue}</p>
                    <p className="text-[11px] text-slate-500"><span className="font-medium">Detection:</span> {e.detect}</p>
                    <p className="text-[11px] text-indigo-700">{e.rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Deal Structure Lab ── */}
        <TabsContent value="deallab" className="mt-4 space-y-5">
          <SectionHeader icon={Lightbulb} color="bg-orange-50 border-orange-200 text-orange-700" title="Deal Structure Innovation Lab" subtitle="AI proposes novel deal structures that increase close rates. Learns from successful deals across the platform." />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEAL_STRUCTURES.map(d => (
              <div key={d.structure} className={`p-4 rounded-xl border ${d.color}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold">{d.structure}</p>
                  <span className="text-sm font-bold flex-shrink-0">{d.lift}</span>
                </div>
                <p className="text-[11px] opacity-80 mb-1">{d.desc}</p>
                <p className="text-[10px] opacity-60">Best for: {d.best}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Content-Brand Fit ── */}
        <TabsContent value="contentfit" className="mt-4 space-y-5">
          <SectionHeader icon={Eye} color="bg-teal-50 border-teal-200 text-teal-700" title="Content-Brand Fit Predictor" subtitle="Analyzes actual content—visual style, tone, themes—not just vanity metrics. Predicts brand safety and aesthetic alignment." />

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Analysis Dimensions</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                headers={["Dimension","Analysis Method","Output Metrics"]}
                rows={FIT_DIMENSIONS}
                renderRow={(r) => (
                  <tr key={r.dim} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{r.dim}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.method}</td>
                    <td className="px-4 py-3 text-xs text-teal-700">{r.output}</td>
                  </tr>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Example Output: Creator X + Brand Y</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Humor Compatibility",  score: 87, note: "Both use self-deprecating, observational humor",           color: "bg-emerald-500" },
                  { label: "Visual Style Match",    score: 72, note: "Creator is more saturated, brand prefers muted tones",     color: "bg-blue-500" },
                  { label: "Tone Alignment",        score: 91, note: "Both casual, authentic, avoid corporate speak",            color: "bg-emerald-500" },
                  { label: "Thematic Overlap",      score: 68, note: "Shared tech & lifestyle; creator covers gaming which brand avoids", color: "bg-amber-500" },
                  { label: "Brand Safety",          score: 94, note: "2 mildly edgy posts in 24 months, no major incidents",    color: "bg-emerald-500" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-800">{s.label}</p>
                      <span className="text-xs font-bold text-slate-700">{s.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                      <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500">{s.note}</p>
                  </div>
                ))}
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-800">Overall Fit Score: 82%</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Strong match with minor visual style adjustment needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Autonomous Mode ── */}
        <TabsContent value="autonomous" className="mt-4 space-y-5">
          <SectionHeader icon={Zap} color="bg-rose-50 border-rose-200 text-rose-700" title="Autonomous Deal Execution Mode" subtitle="For pre-approved parameters, system operates autonomously within guardrails. Human reviews only exceptions and high-value deals." />

          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-700"><span className="font-bold">Global Kill Switch:</span> Instantly pause all autonomous operations with one click. Full audit trail maintained for all autonomous actions.</p>
          </div>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Autonomous vs Human Review Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AUTONOMOUS_ACTIONS.map(a => (
                  <div key={a.action} className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 items-center">
                    <p className="text-xs font-semibold text-slate-800">{a.action}</p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${a.autoColor}`} />
                      <p className={`text-[11px] ${a.autoColor}`}>{a.autonomous}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <p className="text-[11px] text-slate-500">{a.human}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-700">Configurable Guardrails</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { cat: "Budget Limits",       opts: "Max per deal ($), monthly total ($), quarterly total ($)", trigger: "Any deal exceeding any limit" },
                  { cat: "Talent Tiers",        opts: "Allowed tiers (nano/micro/mid/macro/mega)",               trigger: "Talent outside allowed tiers" },
                  { cat: "Categories",          opts: "Whitelist categories, blacklist categories",               trigger: "Category match required" },
                  { cat: "Brand Safety",        opts: "Minimum safety score (0-100)",                            trigger: "Score below threshold" },
                  { cat: "Deal Terms",          opts: "Allowed structures, max exclusivity, max duration",        trigger: "Non-standard terms" },
                  { cat: "Approval Threshold",  opts: "Deal value requiring human review ($)",                   trigger: "Above threshold → queue" },
                  { cat: "Content Types",       opts: "Allowed deliverable types",                               trigger: "Unusual content requests" },
                  { cat: "Geographic Scope",    opts: "Allowed regions/countries",                               trigger: "Outside approved regions" },
                ].map(g => (
                  <div key={g.cat} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-800 mb-1">{g.cat}</p>
                    <p className="text-[11px] text-slate-600 mb-1">{g.opts}</p>
                    <p className="text-[11px] text-red-600"><span className="font-medium">Override:</span> {g.trigger}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
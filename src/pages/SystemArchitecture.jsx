import React, { useState } from "react";
import {
  Server, Zap, Database, Cpu, MemoryStick,
  GitBranch, Network, Activity,
  Layers, Shield, RefreshCw, AlertTriangle, CheckCircle2,
  Lock, Timer, Bell, HardDrive, RotateCcw, XCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AGENTS = [
  { name: "Data Scraper Agent",     instances: 10, parallelism: "50 concurrent API calls", memory: "2GB",  cpu: "2 CPU",    color: "bg-blue-500" },
  { name: "Profile Builder Agent",  instances: 5,  parallelism: "20 concurrent profiles",  memory: "4GB",  cpu: "2 CPU",    color: "bg-violet-500" },
  { name: "Embedding Generator",    instances: 3,  parallelism: "Batch of 100",             memory: "8GB",  cpu: "1 GPU",    color: "bg-indigo-500" },
  { name: "Trajectory Predictor",   instances: 3,  parallelism: "Batch of 50",              memory: "16GB", cpu: "1 GPU",    color: "bg-purple-500" },
  { name: "Scoring Agent",          instances: 5,  parallelism: "100 concurrent scores",    memory: "4GB",  cpu: "2 CPU",    color: "bg-emerald-500" },
  { name: "Match Agent",            instances: 5,  parallelism: "20 concurrent queries",    memory: "8GB",  cpu: "2 CPU",    color: "bg-teal-500" },
  { name: "Simulation Agent",       instances: 3,  parallelism: "5 concurrent sims",        memory: "16GB", cpu: "1 GPU",    color: "bg-amber-500" },
  { name: "Graph Agent",            instances: 3,  parallelism: "50 concurrent queries",    memory: "8GB",  cpu: "4 CPU",    color: "bg-orange-500" },
  { name: "Pitch Deck Agent",       instances: 5,  parallelism: "10 concurrent decks",      memory: "4GB",  cpu: "2 CPU",    color: "bg-rose-500" },
  { name: "Outreach Agent",         instances: 5,  parallelism: "20 concurrent messages",   memory: "2GB",  cpu: "1 CPU",    color: "bg-pink-500" },
  { name: "Intel Agent",            instances: 3,  parallelism: "30 concurrent sources",    memory: "4GB",  cpu: "2 CPU",    color: "bg-cyan-500" },
  { name: "Alert Agent",            instances: 2,  parallelism: "100 concurrent alerts",    memory: "2GB",  cpu: "1 CPU",    color: "bg-red-500" },
  { name: "Approval Router",        instances: 3,  parallelism: "50 concurrent items",      memory: "2GB",  cpu: "1 CPU",    color: "bg-slate-500" },
  { name: "Send Agent",             instances: 3,  parallelism: "Rate limited per channel", memory: "2GB",  cpu: "1 CPU",    color: "bg-lime-600" },
];

const TOPICS = [
  { topic: "raw-social-data",      producer: "Data Scraper",           consumer: "Profile Builder",            partitions: 20, retention: "7 days" },
  { topic: "profile-updates",      producer: "Profile Builder",        consumer: "Scoring, Trajectory, Graph",  partitions: 10, retention: "3 days" },
  { topic: "embedding-requests",   producer: "Profile Builder",        consumer: "Embedding Generator",         partitions: 10, retention: "1 day" },
  { topic: "embedding-results",    producer: "Embedding Generator",    consumer: "Profile Builder, Match",      partitions: 10, retention: "3 days" },
  { topic: "trajectory-requests",  producer: "Scoring Agent",          consumer: "Trajectory Predictor",        partitions: 5,  retention: "1 day" },
  { topic: "trajectory-results",   producer: "Trajectory Predictor",   consumer: "Scoring, Match",              partitions: 5,  retention: "3 days" },
  { topic: "match-requests",       producer: "API, Triggers",          consumer: "Match Agent",                 partitions: 10, retention: "1 day" },
  { topic: "match-results",        producer: "Match Agent",            consumer: "Simulation, Pitch Deck",      partitions: 10, retention: "3 days" },
  { topic: "simulation-requests",  producer: "Match Agent, API",       consumer: "Simulation Agent",            partitions: 5,  retention: "1 day" },
  { topic: "simulation-results",   producer: "Simulation Agent",       consumer: "Pitch Deck, API",             partitions: 5,  retention: "3 days" },
  { topic: "graph-requests",       producer: "Match Agent",            consumer: "Graph Agent",                 partitions: 5,  retention: "1 day" },
  { topic: "graph-results",        producer: "Graph Agent",            consumer: "Match Agent, Pitch Deck",     partitions: 5,  retention: "3 days" },
  { topic: "pitch-deck-requests",  producer: "Match Agent, API",       consumer: "Pitch Deck Agent",            partitions: 10, retention: "1 day" },
  { topic: "outreach-requests",    producer: "Pitch Deck Agent",       consumer: "Outreach Agent",              partitions: 10, retention: "1 day" },
  { topic: "approval-queue",       producer: "Pitch Deck, Outreach",   consumer: "Approval Router",             partitions: 5,  retention: "30 days" },
  { topic: "approved-items",       producer: "Approval Router",        consumer: "Send Agent",                  partitions: 5,  retention: "30 days" },
  { topic: "intel-events",         producer: "Intel Agent",            consumer: "Alert Agent, API",            partitions: 5,  retention: "7 days" },
  { topic: "alerts",               producer: "Alert Agent",            consumer: "Notification Service",        partitions: 3,  retention: "7 days" },
  { topic: "dead-letter",          producer: "All Agents",             consumer: "Ops Team",                    partitions: 1,  retention: "90 days", isDLQ: true },
];

const MSG_SCHEMA = [
  { field: "message_id",      type: "UUID",     required: true,  desc: "Unique identifier for idempotency checking" },
  { field: "correlation_id",  type: "UUID",     required: true,  desc: "Tracks related messages across entire workflow" },
  { field: "causation_id",    type: "UUID",     required: false, desc: "ID of message that caused this one" },
  { field: "timestamp",       type: "ISO8601",  required: true,  desc: "Message creation time (UTC)" },
  { field: "source_agent",    type: "String",   required: true,  desc: "Which agent produced this message" },
  { field: "source_instance", type: "String",   required: true,  desc: "Specific instance ID for debugging" },
  { field: "event_type",      type: "String",   required: true,  desc: "Type of event (e.g., 'match.completed')" },
  { field: "event_version",   type: "String",   required: true,  desc: "Schema version (e.g., 'v1.2')" },
  { field: "payload",         type: "JSON",     required: true,  desc: "Event-specific data" },
  { field: "retry_count",     type: "Integer",  required: true,  desc: "Number of processing attempts (starts at 0)" },
  { field: "max_retries",     type: "Integer",  required: true,  desc: "Maximum allowed retries for this message" },
  { field: "trace_id",        type: "UUID",     required: true,  desc: "Distributed tracing identifier (OpenTelemetry)" },
  { field: "priority",        type: "Integer",  required: false, desc: "Processing priority (1=highest, 5=lowest)" },
];

const PRINCIPLES = [
  { title: "Event-Driven",          icon: Zap,         desc: "All agents communicate via Kafka topics, not direct calls",     benefit: "Decoupled, scalable, auditable",      color: "text-indigo-500 bg-indigo-50" },
  { title: "Stateless Agents",      icon: Server,      desc: "Agent state stored in Redis, not in memory",                    benefit: "Any instance can pick up any task",    color: "text-violet-500 bg-violet-50" },
  { title: "Idempotent Operations", icon: RefreshCw,   desc: "Every operation can be safely retried with same result",        benefit: "No duplicate side effects on retry",  color: "text-blue-500 bg-blue-50" },
  { title: "Circuit Breakers",      icon: Shield,      desc: "Automatic disable of failing dependencies",                     benefit: "Prevents cascade failures",            color: "text-emerald-500 bg-emerald-50" },
  { title: "Dead Letter Queues",    icon: AlertTriangle,desc: "Failed messages preserved for analysis",                       benefit: "No data loss, fully debuggable",       color: "text-amber-500 bg-amber-50" },
  { title: "Health Checks",         icon: Activity,    desc: "Every agent reports health every 10 seconds",                   benefit: "Fast failure detection",               color: "text-rose-500 bg-rose-50" },
  { title: "Graceful Degradation",  icon: CheckCircle2,desc: "System continues with reduced functionality",                   benefit: "Partial outages don't stop platform",  color: "text-teal-500 bg-teal-50" },
  { title: "Distributed Tracing",   icon: GitBranch,   desc: "Correlation IDs track requests across agents",                  benefit: "End-to-end debugging",                 color: "text-cyan-500 bg-cyan-50" },
];

const totalInstances = AGENTS.reduce((s, a) => s + a.instances, 0);

function AgentCard({ agent }) {
  const isGPU = agent.cpu.includes("GPU");
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
      <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${agent.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{agent.name}</p>
          <Badge variant="secondary" className="text-[10px] flex-shrink-0">{agent.instances}x</Badge>
        </div>
        <p className="text-xs text-slate-500 mb-2">{agent.parallelism}</p>
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            <MemoryStick className="w-2.5 h-2.5" />{agent.memory}
          </span>
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${isGPU ? "bg-violet-100 text-violet-700" : "bg-blue-50 text-blue-600"}`}>
            <Cpu className="w-2.5 h-2.5" />{agent.cpu}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SystemArchitecture() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-500" />
          System Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1">Event-driven multi-agent architecture with Apache Kafka at its core</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Agent Types",      value: AGENTS.length,    icon: Cpu,       color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Instances",  value: totalInstances,   icon: Server,    color: "text-violet-600 bg-violet-50" },
          { label: "Kafka Topics",     value: TOPICS.length,    icon: Layers,    color: "text-blue-600 bg-blue-50" },
          { label: "Core Principles",  value: PRINCIPLES.length,icon: Shield,    color: "text-emerald-600 bg-emerald-50" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-slate-200/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="agents">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="topics">Kafka Topics</TabsTrigger>
          <TabsTrigger value="schema">Message Schema</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
        </TabsList>

        {/* Agents tab */}
        <TabsContent value="agents" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{AGENTS.length} agent types · {totalInstances} total instances</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 text-[11px]">
                <Cpu className="w-3 h-3 mr-1" />GPU Accelerated
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[11px]">
                <Cpu className="w-3 h-3 mr-1" />CPU Only
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {AGENTS.map(agent => <AgentCard key={agent.name} agent={agent} />)}
          </div>
        </TabsContent>

        {/* Topics tab */}
        <TabsContent value="topics" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Consumer</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Partitions</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOPICS.map(t => (
                  <tr key={t.topic} className={`hover:bg-slate-50 transition-colors ${t.isDLQ ? "bg-red-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className={`text-xs font-mono px-2 py-0.5 rounded ${t.isDLQ ? "bg-red-100 text-red-700" : "bg-indigo-50 text-indigo-700"}`}>
                          {t.topic}
                        </code>
                        {t.isDLQ && <Badge variant="outline" className="text-red-600 border-red-200 text-[10px]">DLQ</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{t.producer}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{t.consumer}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{t.partitions}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.retention === "90 days" ? "bg-red-100 text-red-700" :
                        t.retention === "30 days" ? "bg-amber-100 text-amber-700" :
                        t.retention === "7 days"  ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{t.retention}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Message Schema tab */}
        <TabsContent value="schema" className="mt-4">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Standard Message Envelope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Field</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Required</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MSG_SCHEMA.map(f => (
                      <tr key={f.field} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{f.field}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded">{f.type}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {f.required
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            : <span className="text-xs text-slate-400">optional</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Principles tab */}
        <TabsContent value="principles" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(p => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="border-slate-200/60">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.desc}</p>
                      <p className="text-xs font-medium text-indigo-600 mt-1.5">→ {p.benefit}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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

// ── Fault Tolerance ──────────────────────────────────────────────────────────
const RETRY_STRATEGIES = [
  { type: "Network timeout",      detection: "Connection timeout",     strategy: "Exponential backoff",        maxRetries: 5,  backoff: "1s, 2s, 4s, 8s, 16s",           color: "bg-amber-500" },
  { type: "HTTP 5xx",             detection: "Server error response",  strategy: "Exponential backoff",        maxRetries: 5,  backoff: "1s, 2s, 4s, 8s, 16s",           color: "bg-orange-500" },
  { type: "Rate limited (429)",   detection: "Too many requests",      strategy: "Fixed delay",                maxRetries: 10, backoff: "Wait for Retry-After header",    color: "bg-yellow-500" },
  { type: "Connection refused",   detection: "Service unavailable",    strategy: "Circuit breaker + retry",    maxRetries: 3,  backoff: "30s between attempts",           color: "bg-red-500" },
  { type: "Timeout",              detection: "Processing too slow",    strategy: "Immediate retry once",       maxRetries: 2,  backoff: "No backoff",                     color: "bg-rose-500" },
  { type: "Invalid response",     detection: "Parse error",            strategy: "No retry, log + DLQ",        maxRetries: 0,  backoff: "N/A",                            color: "bg-slate-400" },
  { type: "Business logic error", detection: "Validation failure",     strategy: "No retry, send to DLQ",      maxRetries: 0,  backoff: "N/A",                            color: "bg-slate-400" },
  { type: "Authentication error", detection: "401/403 response",       strategy: "Refresh token, retry once",  maxRetries: 1,  backoff: "Immediate after refresh",        color: "bg-blue-500" },
];

const CIRCUIT_BREAKERS = [
  { dep: "YouTube API",        threshold: "5 in 60s", recovery: "120s", check: "GET /channels?part=id",  fallback: "Return cached data, queue retry",  color: "text-red-600" },
  { dep: "Instagram API",      threshold: "5 in 60s", recovery: "120s", check: "GET /me",                fallback: "Return cached data, queue retry",  color: "text-pink-600" },
  { dep: "TikTok API",         threshold: "5 in 60s", recovery: "120s", check: "GET /user/info",         fallback: "Return cached data, queue retry",  color: "text-slate-700" },
  { dep: "Twitch API",         threshold: "5 in 60s", recovery: "120s", check: "GET /users",             fallback: "Return cached data, queue retry",  color: "text-violet-600" },
  { dep: "Claude API",         threshold: "3 in 30s", recovery: "60s",  check: "Models list endpoint",   fallback: "Queue request, alert ops",         color: "text-amber-700" },
  { dep: "OpenAI API",         threshold: "3 in 30s", recovery: "60s",  check: "Models list endpoint",   fallback: "Use Claude as fallback",           color: "text-emerald-700" },
  { dep: "PostgreSQL Primary", threshold: "3 in 10s", recovery: "30s",  check: "SELECT 1",               fallback: "Failover to read replica",         color: "text-blue-600" },
  { dep: "PostgreSQL Replica", threshold: "5 in 10s", recovery: "15s",  check: "SELECT 1",               fallback: "Use another replica",             color: "text-blue-500" },
  { dep: "Redis Primary",      threshold: "5 in 10s", recovery: "15s",  check: "PING",                   fallback: "Direct DB queries (degraded)",     color: "text-red-500" },
  { dep: "Elasticsearch",      threshold: "5 in 30s", recovery: "60s",  check: "Cluster health",         fallback: "DB queries (slower search)",       color: "text-yellow-600" },
  { dep: "Neo4j",              threshold: "3 in 30s", recovery: "60s",  check: "RETURN 1",               fallback: "Skip graph enrichment",            color: "text-emerald-600" },
  { dep: "S3",                 threshold: "3 in 30s", recovery: "60s",  check: "HEAD bucket",            fallback: "Queue upload, retry later",        color: "text-orange-600" },
];

const DLQ_EVENTS = [
  { event: "Message lands in DLQ",       auto: "Alert to ops Slack channel",         human: "Investigate root cause",         sla: "4 hours",    severity: "medium" },
  { event: "Same message_id 3x in DLQ",  auto: "Escalate to on-call engineer",       human: "Root cause analysis required",   sla: "2 hours",    severity: "high" },
  { event: "> 100 DLQ messages/hour",    auto: "Page on-call, pause affected agent", human: "Immediate investigation",         sla: "30 minutes", severity: "critical" },
  { event: "> 500 DLQ messages/hour",    auto: "Auto-pause all related agents",      human: "Incident declared",              sla: "Immediate",  severity: "critical" },
  { event: "DLQ message > 24 hours old", auto: "Daily digest to team lead",          human: "Resolve or archive decision",    sla: "48 hours",   severity: "low" },
  { event: "DLQ message > 7 days old",   auto: "Auto-archive with full context",     human: "Review archived items weekly",   sla: "Weekly",     severity: "low" },
];

// ── Concurrency ───────────────────────────────────────────────────────────────
const PARALLEL_PATTERNS = [
  { pattern: "Fan-Out",             useCase: "One trigger → multiple parallel tasks",  impl: "Kafka topic with multiple consumer groups", example: "New profile → scoring + embedding + graph" },
  { pattern: "Fan-In",              useCase: "Multiple results → single aggregation",  impl: "Correlation ID joins in aggregator",         example: "Simulation + graph → combined match result" },
  { pattern: "Scatter-Gather",      useCase: "Query multiple sources, combine",        impl: "Async calls with timeout, partial OK",       example: "Search across all social platforms" },
  { pattern: "Pipeline",            useCase: "Sequential processing stages",           impl: "Chained topics with ordering",               example: "Scrape → parse → validate → store" },
  { pattern: "Competing Consumers", useCase: "Load balance across instances",          impl: "Kafka consumer groups",                      example: "10 scraper instances share platform load" },
  { pattern: "Saga",                useCase: "Distributed transaction",                impl: "Choreography with compensating actions",     example: "Deal creation across multiple services" },
];

const REDIS_LOCKS = [
  { lock: "profile:update:{talent_id}",       ttl: "30s",    retry: "3x / 100ms delay", purpose: "Prevent concurrent profile writes" },
  { lock: "deck:generate:{match_id}",         ttl: "5 min",  retry: "No retry",         purpose: "One deck generation per match" },
  { lock: "outreach:send:{talent_id}:{type}", ttl: "1 hour", retry: "No retry",         purpose: "Rate limit outreach to same talent" },
  { lock: "approval:process:{item_id}",       ttl: "60s",    retry: "3x / 500ms delay", purpose: "Single approval processing" },
  { lock: "scrape:platform:{platform}:{id}",  ttl: "10 min", retry: "No retry",         purpose: "Prevent duplicate API calls" },
  { lock: "embedding:generate:{talent_id}",   ttl: "15 min", retry: "No retry",         purpose: "Prevent duplicate embeddings" },
  { lock: "simulation:run:{match_id}",        ttl: "30 min", retry: "No retry",         purpose: "Prevent duplicate simulations" },
];

// ── Health & Monitoring ───────────────────────────────────────────────────────
const HEALTH_CHECKS = [
  { type: "Liveness",           freq: "Every 10s",  timeout: "5s",   threshold: "3 consecutive",  action: "Restart container" },
  { type: "Readiness",          freq: "Every 5s",   timeout: "3s",   threshold: "2 consecutive",  action: "Remove from load balancer" },
  { type: "Startup",            freq: "Every 5s",   timeout: "60s",  threshold: "12 checks",      action: "Kill and reschedule pod" },
  { type: "Dependency Health",  freq: "Every 30s",  timeout: "10s",  threshold: "2 consecutive",  action: "Open circuit breaker" },
  { type: "Queue Depth",        freq: "Every 10s",  timeout: "N/A",  threshold: "> threshold",    action: "Scale up consumers" },
  { type: "Processing Latency", freq: "Per message",timeout: "N/A",  threshold: "p99 > SLA",      action: "Alert and investigate" },
  { type: "Memory Usage",       freq: "Every 30s",  timeout: "N/A",  threshold: "> 85% limit",    action: "Alert, prepare for OOM" },
  { type: "Error Rate",         freq: "Every 60s",  timeout: "N/A",  threshold: "> 5%",           action: "Alert, investigate" },
];

const ALERT_RULES = [
  { alert: "AgentDown",           condition: "No heartbeat 30s",     severity: "Critical", channels: "PagerDuty, Slack", response: "Auto-restart, page on-call" },
  { alert: "HighErrorRate",       condition: "> 5% failing",         severity: "High",     channels: "Slack, Email",     response: "Investigate DLQ" },
  { alert: "QueueBackup",         condition: "> 10K messages",       severity: "Medium",   channels: "Slack",            response: "Scale up consumers" },
  { alert: "CircuitOpen",         condition: "Open > 5 min",         severity: "High",     channels: "Slack, Email",     response: "Check dependency" },
  { alert: "SlowProcessing",      condition: "p99 > SLA",            severity: "Medium",   channels: "Slack",            response: "Profile and optimize" },
  { alert: "DLQGrowing",          condition: "> 100 in DLQ",         severity: "High",     channels: "Slack, Email",     response: "Manual investigation" },
  { alert: "MemoryHigh",          condition: "> 85% memory",         severity: "Medium",   channels: "Slack",            response: "Monitor for OOM" },
  { alert: "DependencyDegraded",  condition: "Fallback active",      severity: "Low",      channels: "Slack",            response: "Monitor recovery" },
];

// ── State & Recovery ──────────────────────────────────────────────────────────
const STATE_STORAGE = [
  { type: "Agent task state",    storage: "Redis",      ttl: "1 hour",    consistency: "Eventual",         backup: "None (ephemeral)" },
  { type: "Idempotency keys",    storage: "Redis",      ttl: "24 hours",  consistency: "Strong (SETNX)",   backup: "None (ephemeral)" },
  { type: "Distributed locks",   storage: "Redis",      ttl: "Varies",    consistency: "Strong (Redlock)", backup: "None (ephemeral)" },
  { type: "Rate limit counters", storage: "Redis",      ttl: "Per window",consistency: "Strong (INCR)",    backup: "None (ephemeral)" },
  { type: "Session data",        storage: "Redis",      ttl: "30 min",    consistency: "Eventual",         backup: "None (ephemeral)" },
  { type: "Processing results",  storage: "PostgreSQL", ttl: "Permanent", consistency: "Strong (ACID)",    backup: "Daily + WAL" },
  { type: "Audit logs",          storage: "PostgreSQL", ttl: "7 years",   consistency: "Strong (ACID)",    backup: "Daily + WAL" },
  { type: "Message history",     storage: "Kafka",      ttl: "Per topic", consistency: "Strong (ordered)", backup: "3x replication" },
  { type: "Embeddings",          storage: "pgvector",   ttl: "Permanent", consistency: "Strong",           backup: "Daily + WAL" },
  { type: "Graph data",          storage: "Neo4j",      ttl: "Permanent", consistency: "Causal",           backup: "Daily snapshot" },
];

const DR_SCENARIOS = [
  { scenario: "Single agent crash",       rto: "< 30s",   rpo: "0",       detection: "Heartbeat timeout",      recovery: "K8s auto-restart, task reassigned",         severity: "low" },
  { scenario: "Agent type all down",      rto: "< 2 min", rpo: "0",       detection: "No consumers for topic", recovery: "K8s reschedule, alert ops",                 severity: "medium" },
  { scenario: "PostgreSQL primary down",  rto: "< 1 min", rpo: "< 1s",    detection: "Connection failures",    recovery: "Auto-promote replica, update DNS",          severity: "high" },
  { scenario: "Redis cluster failure",    rto: "< 5 min", rpo: "N/A",     detection: "Connection timeouts",    recovery: "Failover to backup, degraded mode",         severity: "high" },
  { scenario: "Kafka broker failure",     rto: "< 1 min", rpo: "0",       detection: "Consumer rebalance",     recovery: "Automatic rebalance to other brokers",      severity: "medium" },
  { scenario: "Single AZ outage",         rto: "< 5 min", rpo: "< 1 min", detection: "Health check failures",  recovery: "Auto-failover to other AZs",               severity: "high" },
  { scenario: "Full region outage",       rto: "< 30 min",rpo: "< 5 min", detection: "External monitoring",    recovery: "DNS failover to DR region",                severity: "critical" },
];

const CONSISTENCY_GUARANTEES = [
  { op: "Profile update",          guarantee: "Exactly-once",             mechanism: "Idempotency key + optimistic locking",    color: "bg-emerald-100 text-emerald-700" },
  { op: "Match calculation",       guarantee: "At-least-once, idempotent",mechanism: "Cached results for same inputs",          color: "bg-blue-100 text-blue-700" },
  { op: "Pitch deck generation",   guarantee: "Exactly-once per match",   mechanism: "Distributed lock + idempotency",          color: "bg-emerald-100 text-emerald-700" },
  { op: "Approval processing",     guarantee: "Exactly-once",             mechanism: "DB transaction with row lock",            color: "bg-emerald-100 text-emerald-700" },
  { op: "Email sending",           guarantee: "At-most-once",             mechanism: "Deduplication before send",               color: "bg-violet-100 text-violet-700" },
  { op: "Metrics update",          guarantee: "Eventually consistent",    mechanism: "Last-write-wins with timestamps",          color: "bg-amber-100 text-amber-700" },
  { op: "Graph update",            guarantee: "Eventually consistent",    mechanism: "Conflict resolution by timestamp",         color: "bg-amber-100 text-amber-700" },
];

// ── Four-Phase Framework ──────────────────────────────────────────────────
const PHASES = [
  {
    name: "SETUP",
    step: "Step 1",
    automation: "One-Time",
    description: "API connections to 50+ platforms (Phyllo, social APIs, integrations)",
    tasks: [
      "Connect Phyllo for unified social API access",
      "Configure direct platform APIs (YouTube, Twitch, LinkedIn)",
      "Set up CRM integrations (Salesforce, HubSpot)",
      "Configure email/calendar connections",
      "Set approval workflow rules and guardrails",
    ],
    color: "bg-blue-50 border-blue-200 text-blue-900",
    icon: Settings,
  },
  {
    name: "PIPELINE",
    step: "Steps 2-5",
    automation: "100% Automated",
    description: "Scrape → Parse → Validate → Enrich → Embed → Score",
    tasks: [
      "Data Collection: Pull metrics from all connected platforms",
      "Processing: Parse, validate, deduplicate, enrich",
      "AI Enhancement: Generate embeddings, run trajectory models",
      "Graph Update: Refresh relationship connections",
      "Opportunity Detection: Identify triggers (awards, viral, expirations)",
    ],
    color: "bg-violet-50 border-violet-200 text-violet-900",
    icon: RefreshCw,
  },
  {
    name: "AI ACTIONS",
    step: "Steps 6-7",
    automation: "Auto-Generate → Human Approve",
    description: "AI creates content → Queued for review → Human approves/rejects",
    tasks: [
      "Content Generation: Pitch decks, outreach emails, follow-ups auto-created",
      "Approval Queue: ALL generated content routed to human reviewers",
      "Human Decision: Approve / Edit / Reject / Schedule",
      "Enforcement: Nothing goes outbound without human approval",
    ],
    color: "bg-indigo-50 border-indigo-200 text-indigo-900",
    icon: CheckCircle2,
  },
  {
    name: "FEEDBACK",
    step: "Step 8",
    automation: "Continuous Loop",
    description: "Track outcomes → Retrain models → Optimize performance",
    tasks: [
      "Track Outcomes: Open rates, replies, meetings, deals closed",
      "Learn from Rejections: AI adjusts based on rejection reason codes",
      "Model Retraining: Weekly trajectory updates, monthly benchmarks",
      "A/B Testing: Continuously test subject lines, CTAs, timing",
    ],
    color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: TrendingUp,
  },
];

// ── Pipeline Stages ──────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { stage: 1, process: "Collection", automation: "100% automated", output: "Raw JSON data", desc: "API calls to 50+ platforms via Phyllo + direct" },
  { stage: 2, process: "Parsing", automation: "100% automated", output: "Parsed records", desc: "Extract structured data from responses" },
  { stage: 3, process: "Validation", automation: "100% automated", output: "Validated records", desc: "Data quality checks, deduplication" },
  { stage: 4, process: "Enrichment", automation: "100% automated", output: "Enriched profiles", desc: "Add derived fields, classifications" },
  { stage: 5, process: "Embedding", automation: "100% automated", output: "1536d/512d vectors", desc: "Generate vector embeddings" },
  { stage: 6, process: "Trajectory", automation: "100% automated", output: "Trajectory scores", desc: "Run prediction models" },
  { stage: 7, process: "Scoring", automation: "100% automated", output: "Match scores", desc: "Calculate match scores" },
  { stage: 8, process: "Graph Update", automation: "100% automated", output: "Graph edges", desc: "Update relationship graph" },
  { stage: 9, process: "Opportunity Detection", automation: "100% automated", output: "Opportunity alerts", desc: "Identify triggers and opportunities" },
  { stage: 10, process: "Content Generation", automation: "100% automated", output: "Draft content", desc: "Generate decks, outreach" },
  { stage: 11, process: "Approval Queue", automation: "100% automated", output: "Queue items", desc: "Queue for human review" },
  { stage: 12, process: "Human Approval", automation: "MANUAL", output: "Approved items", desc: "Review, edit, approve/reject" },
  { stage: 13, process: "Send", automation: "100% automated", output: "Sent confirmations", desc: "Deliver approved content" },
  { stage: 14, process: "Track", automation: "100% automated", output: "Performance data", desc: "Monitor responses, outcomes" },
];

// ── Platform API Coverage ──────────────────────────────────────────────
const PLATFORM_APIS = [
  { platform: "YouTube", method: "YouTube Data API v3", rateLimit: "10,000/day", dataPoints: "Subs, views, engagement, demographics", freshness: "< 24hr" },
  { platform: "Instagram", method: "Phyllo + Graph API", rateLimit: "200/hour", dataPoints: "Followers, engagement, stories, reels", freshness: "< 24hr" },
  { platform: "TikTok", method: "Phyllo + Research API", rateLimit: "1,000/day", dataPoints: "Followers, views, engagement, sounds", freshness: "< 24hr" },
  { platform: "Twitch", method: "Helix API", rateLimit: "800/minute", dataPoints: "Followers, subs, watch time, clips", freshness: "Real-time" },
  { platform: "Twitter/X", method: "API v2", rateLimit: "500/15min", dataPoints: "Followers, engagement, impressions", freshness: "< 24hr" },
  { platform: "LinkedIn", method: "Marketing API", rateLimit: "100/day", dataPoints: "Connections, engagement, company", freshness: "< 1 week" },
  { platform: "Facebook", method: "Graph API", rateLimit: "200/hour", dataPoints: "Page followers, engagement", freshness: "< 24hr" },
  { platform: "Snapchat", method: "Marketing API", rateLimit: "Limited", dataPoints: "Story views, subscribers", freshness: "< 1 week" },
  { platform: "Pinterest", method: "API v5", rateLimit: "1,000/hour", dataPoints: "Followers, pins, engagement", freshness: "< 1 week" },
];

// ── Data Freshness Targets ──────────────────────────────────────────────
const FRESHNESS_TARGETS = [
  { dataType: "Follower counts", freshness: "< 24 hours", trigger: "Daily batch + on-demand", alert: "> 48 hours" },
  { dataType: "Engagement metrics", freshness: "< 24 hours", trigger: "Daily batch", alert: "> 48 hours" },
  { dataType: "Content posts", freshness: "< 2 hours", trigger: "Webhook + polling", alert: "> 6 hours" },
  { dataType: "Viral moments", freshness: "< 30 minutes", trigger: "Real-time monitoring", alert: "> 2 hours" },
  { dataType: "Deal announcements", freshness: "< 4 hours", trigger: "News monitoring + social", alert: "> 12 hours" },
  { dataType: "Profile changes", freshness: "< 24 hours", trigger: "Daily comparison", alert: "> 48 hours" },
  { dataType: "Rate benchmarks", freshness: "< 1 week", trigger: "Weekly aggregation", alert: "> 2 weeks" },
  { dataType: "Trajectory predictions", freshness: "< 1 week", trigger: "Weekly model run", alert: "> 2 weeks" },
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
          { label: "Agent Types",       value: AGENTS.length,           icon: Cpu,    color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Instances",   value: totalInstances,          icon: Server, color: "text-violet-600 bg-violet-50" },
          { label: "Kafka Topics",      value: TOPICS.length,           icon: Layers, color: "text-blue-600 bg-blue-50" },
          { label: "Circuit Breakers",  value: CIRCUIT_BREAKERS.length, icon: Shield, color: "text-emerald-600 bg-emerald-50" },
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

      <Tabs defaultValue="phases">
        <TabsList className="bg-slate-100 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="phases">4-Phase Framework</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
          <TabsTrigger value="platforms">Platform APIs</TabsTrigger>
          <TabsTrigger value="freshness">Data Freshness</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="topics">Kafka Topics</TabsTrigger>
          <TabsTrigger value="schema">Message Schema</TabsTrigger>
          <TabsTrigger value="fault">Fault Tolerance</TabsTrigger>
          <TabsTrigger value="concurrency">Concurrency</TabsTrigger>
          <TabsTrigger value="health">Health & Alerts</TabsTrigger>
          <TabsTrigger value="state">State & Recovery</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
        </TabsList>

        {/* 4-Phase Framework */}
        <TabsContent value="phases" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <Card key={phase.name} className={`border-2 ${phase.color}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold">{phase.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">{phase.step} • {phase.automation}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${phase.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{phase.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {phase.tasks.map((task, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-slate-400 flex-shrink-0">•</span>
                        <span className="text-slate-700">{task}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Pipeline Stages */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="space-y-3">
            {PIPELINE_STAGES.map((p, idx) => (
              <div key={p.stage} className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-700">{p.stage}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-800">{p.process}</h4>
                    <Badge className={`${p.automation === "MANUAL" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"} text-[10px]`}>
                      {p.automation}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">{p.desc}</p>
                  <div className="flex gap-3 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Output: {p.output}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Platform APIs */}
        <TabsContent value="platforms" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Platform", "API Method", "Rate Limit", "Data Points", "Freshness"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PLATFORM_APIS.map(p => (
                  <tr key={p.platform} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{p.platform}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">{p.rateLimit}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.dataPoints}</td>
                    <td className="px-4 py-3"><Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{p.freshness}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Data Freshness */}
        <TabsContent value="freshness" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Data Type", "Target Freshness", "Update Trigger", "Staleness Alert"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FRESHNESS_TARGETS.map(f => (
                  <tr key={f.dataType} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{f.dataType}</td>
                    <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-700 text-[10px]">{f.freshness}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{f.trigger}</td>
                    <td className="px-4 py-3"><Badge className="bg-red-100 text-red-700 text-[10px]">{f.alert}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

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

        {/* Fault Tolerance tab */}
        <TabsContent value="fault" className="mt-4 space-y-6">
          {/* Retry Strategies */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" /> Retry Strategy by Failure Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Failure Type","Detection","Strategy","Max Retries","Backoff"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RETRY_STRATEGIES.map(r => (
                      <tr key={r.type} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.color}`} />
                            <span className="text-xs font-medium text-slate-800">{r.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{r.detection}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{r.strategy}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.maxRetries === 0 ? "bg-slate-100 text-slate-500" : "bg-indigo-100 text-indigo-700"}`}>{r.maxRetries}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{r.backoff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Circuit Breakers */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Circuit Breaker Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Dependency","Failure Threshold","Recovery","Health Check","Fallback Behavior"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CIRCUIT_BREAKERS.map(cb => (
                      <tr key={cb.dep} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${cb.color}`}>{cb.dep}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-mono">{cb.threshold}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{cb.recovery}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{cb.check}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{cb.fallback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* DLQ */}
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" /> Dead Letter Queue Handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DLQ_EVENTS.map(d => {
                  const sev = { critical: "bg-red-100 text-red-700 border-red-200", high: "bg-orange-100 text-orange-700 border-orange-200", medium: "bg-amber-100 text-amber-700 border-amber-200", low: "bg-slate-100 text-slate-600 border-slate-200" }[d.severity];
                  return (
                    <div key={d.event} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 mb-1">{d.event}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          <p className="text-[11px] text-slate-500"><span className="font-medium text-slate-600">Auto:</span> {d.auto}</p>
                          <p className="text-[11px] text-slate-500"><span className="font-medium text-slate-600">Human:</span> {d.human}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${sev}`}>{d.severity}</Badge>
                        <span className="text-[10px] text-slate-400 font-mono">{d.sla}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Concurrency tab */}
        <TabsContent value="concurrency" className="mt-4 space-y-6">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" /> Parallel Processing Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PARALLEL_PATTERNS.map((p, i) => {
                  const colors = ["bg-indigo-50 border-indigo-200","bg-violet-50 border-violet-200","bg-blue-50 border-blue-200","bg-emerald-50 border-emerald-200","bg-amber-50 border-amber-200","bg-rose-50 border-rose-200"];
                  const textColors = ["text-indigo-700","text-violet-700","text-blue-700","text-emerald-700","text-amber-700","text-rose-700"];
                  return (
                    <div key={p.pattern} className={`p-4 rounded-xl border ${colors[i % colors.length]}`}>
                      <p className={`text-sm font-bold mb-1 ${textColors[i % textColors.length]}`}>{p.pattern}</p>
                      <p className="text-xs text-slate-600 mb-2">{p.useCase}</p>
                      <p className="text-[11px] text-slate-500 mb-1"><span className="font-medium">Impl:</span> {p.impl}</p>
                      <p className="text-[11px] text-slate-500 italic">{p.example}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" /> Distributed Locking (Redis Redlock)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Lock Pattern","TTL","Retry","Purpose"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {REDIS_LOCKS.map(l => (
                      <tr key={l.lock} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3"><code className="text-xs font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">{l.lock}</code></td>
                        <td className="px-4 py-3"><span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{l.ttl}</span></td>
                        <td className="px-4 py-3 text-xs text-slate-600">{l.retry}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{l.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health & Alerts tab */}
        <TabsContent value="health" className="mt-4 space-y-6">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Health Check Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Check Type","Frequency","Timeout","Failure Threshold","Action on Failure"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {HEALTH_CHECKS.map(h => (
                      <tr key={h.type} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">{h.type}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{h.freq}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{h.timeout}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{h.threshold}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{h.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-500" /> Alerting Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ALERT_RULES.map(a => {
                  const sevColor = { Critical: "bg-red-100 text-red-700 border-red-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-slate-100 text-slate-600 border-slate-200" }[a.severity];
                  return (
                    <div key={a.alert} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <code className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded w-40 flex-shrink-0">{a.alert}</code>
                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <p className="text-[11px] text-slate-600">{a.condition}</p>
                        <p className="text-[11px] text-slate-500">{a.channels}</p>
                        <p className="text-[11px] text-slate-600">{a.response}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${sevColor}`}>{a.severity}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* State & Recovery tab */}
        <TabsContent value="state" className="mt-4 space-y-6">
          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" /> State Storage Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["State Type","Storage","TTL","Consistency","Backup"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {STATE_STORAGE.map(s => {
                      const storageColor = { Redis: "bg-red-50 text-red-700", PostgreSQL: "bg-blue-50 text-blue-700", Kafka: "bg-slate-100 text-slate-700", pgvector: "bg-indigo-50 text-indigo-700", Neo4j: "bg-emerald-50 text-emerald-700" }[s.storage] || "bg-slate-100 text-slate-600";
                      return (
                        <tr key={s.type} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-800">{s.type}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${storageColor}`}>{s.storage}</span></td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">{s.ttl}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{s.consistency}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{s.backup}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Timer className="w-4 h-4 text-violet-500" /> Disaster Recovery Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DR_SCENARIOS.map(d => {
                  const sevColor = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-amber-100 text-amber-700", low: "bg-slate-100 text-slate-500" }[d.severity];
                  return (
                    <div key={d.scenario} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-800">{d.scenario}</p>
                        <Badge variant="outline" className={`text-[10px] ${sevColor}`}>{d.severity}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div><p className="text-[10px] text-slate-400 uppercase font-semibold">RTO</p><p className="text-xs font-mono text-emerald-700">{d.rto}</p></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-semibold">RPO</p><p className="text-xs font-mono text-blue-700">{d.rpo}</p></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-semibold">Detection</p><p className="text-xs text-slate-600">{d.detection}</p></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-semibold">Recovery</p><p className="text-xs text-slate-600">{d.recovery}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Consistency Guarantees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONSISTENCY_GUARANTEES.map(c => (
                  <div key={c.op} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-800">{c.op}</p>
                      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${c.color}`}>{c.guarantee}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">{c.mechanism}</p>
                  </div>
                ))}
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
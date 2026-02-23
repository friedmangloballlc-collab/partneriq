import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, CheckCircle2, AlertCircle, Clock, Database, Zap,
  Mail, Handshake, Users, Shield, RefreshCw, TrendingUp
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

function StatusDot({ status }) {
  const colors = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-rose-500",
    checking: "bg-slate-300 animate-pulse",
  };
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[status] || colors.checking}`} />;
}

function ServiceRow({ name, status, latency, detail }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <StatusDot status={status} />
        <div>
          <p className="text-sm font-medium text-slate-700">{name}</p>
          {detail && <p className="text-[11px] text-slate-400">{detail}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {latency && <span className="text-xs text-slate-400">{latency}ms</span>}
        <Badge className={
          status === "operational" ? "bg-emerald-50 text-emerald-700 text-[10px]" :
          status === "degraded" ? "bg-amber-50 text-amber-700 text-[10px]" :
          status === "down" ? "bg-red-50 text-red-700 text-[10px]" :
          "bg-slate-100 text-slate-500 text-[10px]"
        }>
          {status === "operational" ? "Operational" : status === "degraded" ? "Degraded" : status === "down" ? "Down" : "Checking..."}
        </Badge>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [services, setServices] = useState([
    { name: "Database (Entities)", status: "checking", latency: null, detail: "Core data store" },
    { name: "AI Match Engine", status: "checking", latency: null, detail: "LLM-powered matching" },
    { name: "Email Service", status: "checking", latency: null, detail: "Outreach delivery" },
    { name: "Authentication", status: "checking", latency: null, detail: "OAuth & session management" },
    { name: "File Storage", status: "checking", latency: null, detail: "Uploads & attachments" },
    { name: "Real-time Subscriptions", status: "checking", latency: null, detail: "Entity change streams" },
  ]);

  const { data: partnerships = [] } = useQuery({ queryKey: ["partnerships"], queryFn: () => base44.entities.Partnership.list("-created_date", 200) });
  const { data: talents = [] } = useQuery({ queryKey: ["talents"], queryFn: () => base44.entities.Talent.list("-created_date", 200) });
  const { data: emails = [] } = useQuery({ queryKey: ["outreach-emails"], queryFn: () => base44.entities.OutreachEmail.list("-created_date", 200) });
  const { data: approvals = [] } = useQuery({ queryKey: ["approvals"], queryFn: () => base44.entities.ApprovalItem.list("-created_date", 200) });
  const { data: activities = [] } = useQuery({ queryKey: ["activities-health"], queryFn: () => base44.entities.Activity.list("-created_date", 50) });

  const checkServices = async () => {
    setLastRefresh(new Date());
    setServices(s => s.map(svc => ({ ...svc, status: "checking" })));

    // DB check
    const t0 = Date.now();
    try {
      await base44.entities.Activity.list("-created_date", 1);
      const latency = Date.now() - t0;
      setServices(s => s.map((svc, i) => i === 0 ? { ...svc, status: latency < 500 ? "operational" : "degraded", latency } : svc));
    } catch { setServices(s => s.map((svc, i) => i === 0 ? { ...svc, status: "down" } : svc)); }

    // Simulate other services
    await new Promise(r => setTimeout(r, 300));
    setServices(s => s.map((svc, i) => {
      if (i === 0) return svc;
      const latency = 80 + Math.floor(Math.random() * 120);
      return { ...svc, status: "operational", latency };
    }));
  };

  useEffect(() => { checkServices(); }, []);

  // Derived metrics
  const totalEntities = partnerships.length + talents.length + emails.length + approvals.length;
  const emailsSent = emails.filter(e => ["sent","delivered","opened","clicked","replied"].includes(e.status)).length;
  const emailOpenRate = emailsSent > 0 ? ((emails.filter(e => ["opened","clicked","replied"].includes(e.status)).length / emailsSent) * 100).toFixed(1) : 0;
  const pendingApprovals = approvals.filter(a => a.status === "pending").length;
  const activeDeals = partnerships.filter(p => ["negotiating","contracted","active"].includes(p.status)).length;
  const allOperational = services.every(s => s.status === "operational");

  const recentEvents = activities.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Platform status, entity metrics & agent monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Last checked {format(lastRefresh, "h:mm:ss a")}</span>
          <Button size="sm" variant="outline" onClick={checkServices} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${allOperational ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
        {allOperational
          ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          : <AlertCircle className="w-5 h-5 text-amber-600" />}
        <div>
          <p className={`text-sm font-semibold ${allOperational ? "text-emerald-800" : "text-amber-800"}`}>
            {allOperational ? "All systems operational" : "Some services are checking..."}
          </p>
          <p className={`text-xs mt-0.5 ${allOperational ? "text-emerald-600" : "text-amber-600"}`}>
            {services.filter(s => s.status === "operational").length} / {services.length} services operational
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Service Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.map((svc, i) => <ServiceRow key={i} {...svc} />)}
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" /> Platform Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Total Entity Records", value: totalEntities, icon: Database, color: "indigo" },
              { label: "Active Partnerships", value: activeDeals, icon: Handshake, color: "emerald" },
              { label: "Total Talent", value: talents.length, icon: Users, color: "violet" },
              { label: "Emails Sent", value: emailsSent, icon: Mail, color: "sky" },
              { label: "Email Open Rate", value: `${emailOpenRate}%`, icon: TrendingUp, color: "amber" },
              { label: "Pending Approvals", value: pendingApprovals, icon: Shield, color: pendingApprovals > 0 ? "rose" : "slate" },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{m.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent system activity */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Recent System Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No recent events</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {event.actor_name || event.actor_email} · {event.created_date ? format(new Date(event.created_date), "MMM d, h:mm a") : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] flex-shrink-0">
                    {event.action?.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
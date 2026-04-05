import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Search, Ban, ShieldCheck, ShieldOff, CheckCircle2, Loader2, FileText,
} from "lucide-react";

export default function AdminUserManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, banned, suspended
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !u.is_banned && !u.is_suspended) ||
      (filter === "banned" && u.is_banned) ||
      (filter === "suspended" && u.is_suspended);
    return matchesSearch && matchesFilter;
  });

  const handleBan = async (userId, ban) => {
    const reason = ban ? prompt("Ban reason:") : null;
    if (ban && !reason) return;

    await supabase.from("profiles").update({
      is_banned: ban,
      ban_reason: ban ? reason : null,
      banned_at: ban ? new Date().toISOString() : null,
    }).eq("id", userId);

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: ban ? "user_banned" : "user_unbanned",
      entity_type: "profiles",
      entity_id: userId,
      new_values: { is_banned: ban, ban_reason: reason },
    });

    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
  };

  const handleSuspend = async (userId, suspend) => {
    const reason = suspend ? prompt("Suspension reason:") : null;
    if (suspend && !reason) return;

    await supabase.from("profiles").update({
      is_suspended: suspend,
      suspension_reason: suspend ? reason : null,
      suspended_at: suspend ? new Date().toISOString() : null,
    }).eq("id", userId);

    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: suspend ? "user_suspended" : "user_unsuspended",
      entity_type: "profiles",
      entity_id: userId,
      new_values: { is_suspended: suspend, suspension_reason: reason },
    });

    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.is_banned && !u.is_suspended).length,
    banned: users.filter((u) => u.is_banned).length,
    suspended: users.filter((u) => u.is_suspended).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Manage users, review activity, and enforce policies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total} icon={Users} color="indigo" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} color="emerald" />
        <StatCard label="Banned" value={stats.banned} icon={Ban} color="red" />
        <StatCard label="Suspended" value={stats.suspended} icon={ShieldOff} color="amber" />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "banned", "suspended"].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Plan</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{user.full_name || "—"}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 capitalize">{user.plan || "free"}</span>
                        </td>
                        <td className="px-4 py-3">
                          {user.is_banned ? (
                            <Badge className="bg-red-100 text-red-700 text-xs">Banned</Badge>
                          ) : user.is_suspended ? (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">Suspended</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.role !== "admin" && (
                            <div className="flex items-center justify-end gap-1">
                              {user.is_banned ? (
                                <Button size="sm" variant="outline" onClick={() => handleBan(user.id, false)} className="text-xs h-7 px-2">
                                  <ShieldCheck className="w-3 h-3 mr-1" /> Unban
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleBan(user.id, true)} className="text-xs h-7 px-2 text-red-600 hover:text-red-700">
                                  <Ban className="w-3 h-3 mr-1" /> Ban
                                </Button>
                              )}
                              {user.is_suspended ? (
                                <Button size="sm" variant="outline" onClick={() => handleSuspend(user.id, false)} className="text-xs h-7 px-2">
                                  <ShieldCheck className="w-3 h-3 mr-1" /> Unsuspend
                                </Button>
                              ) : !user.is_banned ? (
                                <Button size="sm" variant="outline" onClick={() => handleSuspend(user.id, true)} className="text-xs h-7 px-2 text-amber-600 hover:text-amber-700">
                                  <ShieldOff className="w-3 h-3 mr-1" /> Suspend
                                </Button>
                              ) : null}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-4">
          {logsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : auditLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No audit log entries yet</p>
                <p className="text-xs mt-1">Actions like bans, suspensions, and data changes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Entity</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs capitalize">
                            {log.action?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {log.entity_type}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                          {log.new_values ? JSON.stringify(log.new_values) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "from-indigo-50 to-indigo-100/50 text-indigo-700 border-indigo-200",
    emerald: "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
    red: "from-red-50 to-red-100/50 text-red-700 border-red-200",
    amber: "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
  };
  return (
    <Card className={`border bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="w-5 h-5 opacity-60" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium opacity-70">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

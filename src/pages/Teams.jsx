import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Crown, Shield, Eye, Trash2, Mail, MoreHorizontal,
  UserPlus, ChevronRight, CheckCircle2, UserX, Briefcase, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import TeamAnalytics from "@/components/teams/TeamAnalytics";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TEAM_ROLES,
  PERMISSION_LABELS,
  getTeamRoleLabel,
  getTeamRoleColor,
  getAvailableRoles,
} from "@/lib/teamPermissions";

// Map team role key → lucide icon
const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  deal_manager: Briefcase,
  viewer: Eye,
  talent_rep: Star,
  client_view: Eye,
  // legacy fallbacks
  member: Users,
};

export default function Teams() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(null); // member id
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [invite, setInvite] = useState({ member_email: "", member_name: "", role: "deal_manager" });
  const [activeTab, setActiveTab] = useState("members");

  // User provided by AuthContext (replaces redundant base44.auth.me call)

  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => base44.entities.Team.list("-created_date", 50),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team-members", selectedTeam?.id],
    queryFn: () => selectedTeam
      ? base44.entities.TeamMember.filter({ team_id: selectedTeam.id })
      : Promise.resolve([]),
    enabled: !!selectedTeam,
  });

  const createTeamMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      base44.entities.TeamMember.create({
        team_id: team.id,
        team_name: team.name,
        member_email: user?.email,
        member_name: user?.full_name,
        role: "owner",
        status: "active",
      });
      setShowCreateTeam(false);
      setNewTeam({ name: "", description: "" });
      setSelectedTeam(team);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", selectedTeam?.id] });
      setShowInvite(false);
      setInvite({ member_email: "", member_name: "", role: "deal_manager" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", selectedTeam?.id] });
      setShowChangeRole(null);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members", selectedTeam?.id] }),
  });

  const handleCreateTeam = () => {
    createTeamMutation.mutate({ ...newTeam, owner_email: user?.email });
  };

  const handleInvite = () => {
    inviteMutation.mutate({
      ...invite,
      team_id: selectedTeam.id,
      team_name: selectedTeam.name,
      status: "invited",
    });
  };

  // Determine current user's team role (to gatekeep Change Role option)
  const myMembership = members.find(m => m.member_email === user?.email);
  const isOwnerOrAdmin = myMembership?.role === "owner" || myMembership?.role === "admin" || user?.role === "admin";

  // Available roles for the invite dialog, scoped by platform role
  const availableRoles = getAvailableRoles(user?.role ?? "brand");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teams</h1>
          <p className="text-sm text-slate-500 mt-1">Collaborate on deals and manage team permissions</p>
        </div>
        <Button onClick={() => setShowCreateTeam(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams list */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Teams</h2>
          {loadingTeams ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-4 h-4 rounded" />
                </div>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <EmptyState
                icon={<Users />}
                title="No teams yet"
                description="Create a team to start collaborating on deals with colleagues."
                action={{ label: "Create your first team", onClick: () => setShowCreateTeam(true) }}
                compact
              />
            </Card>
          ) : (
            teams.map(team => (
              <button
                key={team.id}
                onClick={() => { setSelectedTeam(team); setActiveTab("members"); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTeam?.id === team.id ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{team.name}</p>
                    {team.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{team.description}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Team detail */}
        <div className="lg:col-span-2">
          {!selectedTeam ? (
            <Card className="border-slate-200/60 min-h-[300px] flex items-center justify-center">
              <EmptyState
                icon={<Users />}
                title="Select a team"
                description="Choose a team from the list on the left to view members, permissions, and analytics."
                compact
              />
            </Card>
          ) : (
            <Card className="border-slate-200/60">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTeam.name}</CardTitle>
                    {selectedTeam.description && <p className="text-sm text-slate-400 mt-0.5">{selectedTeam.description}</p>}
                  </div>
                  <Button size="sm" onClick={() => setShowInvite(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-2" /> Invite
                  </Button>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 mt-3">
                  {["members", "permissions", "analytics"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${activeTab === tab ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-5">
                {/* ── Members tab ──────────────────────────────────────── */}
                {activeTab === "members" && (
                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <EmptyState
                        icon={<UserX />}
                        title="No members yet"
                        description="Invite colleagues to collaborate on deals and track partnerships together."
                        action={{ label: "Invite someone", onClick: () => setShowInvite(true), icon: <UserPlus className="w-4 h-4" /> }}
                        compact
                      />
                    ) : (
                      members.map(member => {
                        const roleKey = member.role ?? "viewer";
                        const roleColor = getTeamRoleColor(roleKey);
                        const roleLabel = getTeamRoleLabel(roleKey);
                        const RoleIcon = ROLE_ICONS[roleKey] ?? Users;
                        const initials = member.member_name?.split(" ").map(n => n[0]).join("").toUpperCase()
                          || member.member_email?.[0]?.toUpperCase() || "?";
                        return (
                          <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{member.member_name || member.member_email}</p>
                              <p className="text-xs text-slate-400">{member.member_email}</p>
                            </div>
                            {/* Role badge */}
                            <Badge variant="outline" className={`text-[10px] ${roleColor}`}>
                              <RoleIcon className="w-2.5 h-2.5 mr-1" />{roleLabel}
                            </Badge>
                            {member.status === "invited" && (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Invited</Badge>
                            )}
                            {/* Actions dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-slate-300 hover:text-slate-500">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {isOwnerOrAdmin && (
                                  <>
                                    <DropdownMenuItem onClick={() => setShowChangeRole(member.id)}>
                                      <Shield className="w-3 h-3 mr-2" /> Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-600"
                                  onClick={() => deleteMemberMutation.mutate(member.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-2" /> Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ── Permissions tab ───────────────────────────────────── */}
                {activeTab === "permissions" && (
                  <div className="space-y-4">
                    {Object.entries(TEAM_ROLES).map(([roleKey, config]) => {
                      const Icon = ROLE_ICONS[roleKey] ?? Users;
                      return (
                        <div key={roleKey} className="p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${config.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-slate-800">{config.label}</span>
                              <p className="text-[11px] text-slate-400">{config.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 mt-3">
                            {config.permissions.map(perm => (
                              <div key={perm} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                {PERMISSION_LABELS[perm] ?? perm}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Analytics tab ─────────────────────────────────────── */}
                {activeTab === "analytics" && (
                  <TeamAnalytics teamId={selectedTeam.id} members={members} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Create Team Dialog ───────────────────────────────────────────────── */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Team Name *</Label>
              <Input value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} placeholder="e.g. Brand Partnerships Team" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newTeam.description} onChange={e => setNewTeam({ ...newTeam, description: e.target.value })} placeholder="What does this team work on?" rows={2} />
            </div>
            <Button onClick={handleCreateTeam} disabled={!newTeam.name || createTeamMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Invite Member Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Invite to {selectedTeam?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name</Label>
              <Input value={invite.member_name} onChange={e => setInvite({ ...invite, member_name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={invite.member_email} onChange={e => setInvite({ ...invite, member_email: e.target.value })} placeholder="colleague@company.com" />
            </div>
            <div>
              <Label>Team Role</Label>
              <Select value={invite.role} onValueChange={v => setInvite({ ...invite, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      <span className="font-medium">{r.label}</span>
                      <span className="text-slate-400 ml-1 text-xs">— {r.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {invite.role && TEAM_ROLES[invite.role] && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {TEAM_ROLES[invite.role].permissions.map(p => (
                    <Badge key={p} variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100">
                      {PERMISSION_LABELS[p] ?? p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleInvite} disabled={!invite.member_email || inviteMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Mail className="w-4 h-4 mr-2" /> Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Change Role Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!showChangeRole} onOpenChange={open => !open && setShowChangeRole(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-slate-500">Select a new role for this team member.</p>
            {Object.entries(TEAM_ROLES).map(([roleKey, config]) => {
              const Icon = ROLE_ICONS[roleKey] ?? Users;
              const targetMember = members.find(m => m.id === showChangeRole);
              const isCurrent = targetMember?.role === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => updateMemberMutation.mutate({ id: showChangeRole, data: { role: roleKey } })}
                  disabled={isCurrent || updateMemberMutation.isPending}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isCurrent ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slateigo-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{config.label}</p>
                    <p className="text-[11px] text-slate-400">{config.description}</p>
                  </div>
                  {isCurrent && <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] self-center">Current</Badge>}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

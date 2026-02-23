import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Crown, Shield, Eye, Trash2, Mail, MoreHorizontal,
  UserPlus, Settings, ChevronRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import TeamAnalytics from "@/components/teams/TeamAnalytics";

const roleConfig = {
  admin: { label: "Admin", icon: Shield, color: "bg-red-50 text-red-700 border-red-200" },
  member: { label: "Member", icon: Users, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const rolePermissions = {
  admin: ["Create deals", "Edit deals", "Delete deals", "Manage members", "View analytics", "Invite users", "Approve outreach"],
  member: ["Create deals", "Edit deals", "Add notes", "View analytics", "Compose outreach"],
  viewer: ["View deals", "View analytics", "View outreach"],
};

export default function Teams() {
  const [user, setUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [invite, setInvite] = useState({ member_email: "", member_name: "", role: "member" });
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

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
      // Add creator as admin member
      base44.entities.TeamMember.create({
        team_id: team.id,
        team_name: team.name,
        member_email: user?.email,
        member_name: user?.full_name,
        role: "admin",
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
      setInvite({ member_email: "", member_name: "", role: "member" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members", selectedTeam?.id] }),
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
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="bg-white border rounded-xl p-4 animate-pulse h-16" />)}</div>
          ) : teams.length === 0 ? (
            <Card className="border-dashed border-slate-200 p-6 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No teams yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowCreateTeam(true)}>Create your first team</Button>
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
            <Card className="border-slate-200/60 h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Select a team to manage</p>
              </div>
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
                {activeTab === "members" && (
                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No members yet. Invite someone!</p>
                    ) : (
                      members.map(member => {
                        const rc = roleConfig[member.role] || roleConfig.member;
                        const RoleIcon = rc.icon;
                        const initials = member.member_name?.split(" ").map(n => n[0]).join("").toUpperCase() || member.member_email?.[0]?.toUpperCase() || "?";
                        return (
                          <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{member.member_name || member.member_email}</p>
                              <p className="text-xs text-slate-400">{member.member_email}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${rc.color}`}>
                              <RoleIcon className="w-2.5 h-2.5 mr-1" />{rc.label}
                            </Badge>
                            {member.status === "invited" && (
                              <Badge className="bg-amber-50 text-amber-700 text-[10px]">Invited</Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateMemberMutation.mutate({ id: member.id, data: { role: "admin" } })}>
                                  <Shield className="w-3 h-3 mr-2" /> Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateMemberMutation.mutate({ id: member.id, data: { role: "member" } })}>
                                  <Users className="w-3 h-3 mr-2" /> Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateMemberMutation.mutate({ id: member.id, data: { role: "viewer" } })}>
                                  <Eye className="w-3 h-3 mr-2" /> Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={() => deleteMemberMutation.mutate(member.id)}>
                                  <Trash2 className="w-3 h-3 mr-2" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === "permissions" && (
                  <div className="space-y-4">
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const Icon = config.icon;
                      return (
                        <div key={role} className="p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-7 h-7 rounded-lg ${config.color} flex items-center justify-center`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-sm text-slate-800">{config.label}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {rolePermissions[role].map(perm => (
                              <div key={perm} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {perm}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "analytics" && (
                  <TeamAnalytics teamId={selectedTeam.id} members={members} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Team Name *</Label><Input value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} placeholder="e.g. Brand Partnerships Team" /></div>
            <div><Label>Description</Label><Textarea value={newTeam.description} onChange={e => setNewTeam({...newTeam, description: e.target.value})} placeholder="What does this team work on?" rows={2} /></div>
            <Button onClick={handleCreateTeam} disabled={!newTeam.name || createTeamMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">Create Team</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Invite to {selectedTeam?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Name</Label><Input value={invite.member_name} onChange={e => setInvite({...invite, member_name: e.target.value})} placeholder="Full name" /></div>
            <div><Label>Email *</Label><Input value={invite.member_email} onChange={e => setInvite({...invite, member_email: e.target.value})} placeholder="colleague@company.com" /></div>
            <div>
              <Label>Role</Label>
              <Select value={invite.role} onValueChange={v => setInvite({...invite, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — Full access + manage members</SelectItem>
                  <SelectItem value="member">Member — Create & edit deals</SelectItem>
                  <SelectItem value="viewer">Viewer — Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={!invite.member_email || inviteMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Mail className="w-4 h-4 mr-2" /> Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
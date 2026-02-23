import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus, Circle, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AssigneeSelector from "@/components/partnerships/AssigneeSelector";
import { format } from "date-fns";

const statusIcons = {
  todo: { icon: Circle, color: "text-slate-400" },
  in_progress: { icon: Clock, color: "text-blue-500" },
  done: { icon: CheckCircle2, color: "text-emerald-500" },
  blocked: { icon: AlertCircle, color: "text-red-500" },
};

const priorityColors = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-orange-50 text-orange-600",
  urgent: "bg-red-50 text-red-600",
};

export default function TasksPanel({ partnershipId, outreachEmailId, contextLabel }) {
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assigned_to_email: "", priority: "medium" });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();
  const filterKey = partnershipId ? { partnership_id: partnershipId } : { outreach_email_id: outreachEmailId };
  const cacheKey = partnershipId ? ["tasks", "deal", partnershipId] : ["tasks", "outreach", outreachEmailId];

  const { data: tasks = [] } = useQuery({
    queryKey: cacheKey,
    queryFn: () => base44.entities.Task.filter(filterKey, "-created_date"),
    enabled: !!(partnershipId || outreachEmailId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowAdd(false);
      setNewTask({ title: "", assigned_to_email: "", priority: "medium" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    const members = base44.entities.TeamMember;
    createMutation.mutate({
      ...newTask,
      partnership_id: partnershipId || undefined,
      outreach_email_id: outreachEmailId || undefined,
      context_label: contextLabel,
      assigned_by_email: user?.email,
      assigned_to_name: newTask.assigned_to_email ? newTask.assigned_to_email.split("@")[0] : "",
      status: "todo",
    });
  };

  const cycleStatus = (task) => {
    const order = ["todo", "in_progress", "done", "blocked"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    updateMutation.mutate({ id: task.id, data: { status: next } });
  };

  const open = tasks.filter(t => t.status !== "done").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Tasks</span>
          {open > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">{open} open</span>}
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      {showAdd && (
        <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-3 space-y-2">
          <Input
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            placeholder="Task title..."
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <AssigneeSelector
              value={newTask.assigned_to_email}
              onChange={v => setNewTask({...newTask, assigned_to_email: v})}
            />
            <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
              <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["low","medium","high","urgent"].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className="text-xs h-7 flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={!newTask.title.trim()}>Create</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {tasks.length === 0 && !showAdd ? (
          <p className="text-xs text-slate-400 text-center py-4">No tasks yet</p>
        ) : (
          tasks.map(task => {
            const sc = statusIcons[task.status] || statusIcons.todo;
            const Icon = sc.icon;
            return (
              <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group ${task.status === "done" ? "opacity-60" : ""}`}>
                <button onClick={() => cycleStatus(task)} className="flex-shrink-0">
                  <Icon className={`w-4 h-4 ${sc.color} hover:scale-110 transition-transform`} />
                </button>
                <span className={`text-xs flex-1 ${task.status === "done" ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title}</span>
                <Badge className={`text-[9px] px-1.5 py-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                {task.assigned_to_email && (
                  <Avatar className="w-5 h-5 flex-shrink-0">
                    <AvatarFallback className="text-[8px] bg-indigo-400 text-white">
                      {task.assigned_to_email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
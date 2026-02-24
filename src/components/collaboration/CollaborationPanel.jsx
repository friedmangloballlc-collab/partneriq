import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistance } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, CheckSquare, Send, Plus, Circle, CheckCircle2,
  AlertCircle, Clock, StickyNote, Lightbulb, AlertTriangle, CheckSquare2,
  AtSign, Users, X
} from "lucide-react";

const NOTE_TYPES = {
  note:     { icon: StickyNote,    color: "bg-slate-100 text-slate-600",  label: "Comment" },
  update:   { icon: CheckSquare2,  color: "bg-blue-50 text-blue-600",     label: "Update" },
  decision: { icon: Lightbulb,     color: "bg-amber-50 text-amber-600",   label: "Decision" },
  blocker:  { icon: AlertTriangle, color: "bg-red-50 text-red-600",       label: "Blocker" },
};

const TASK_STATUS = {
  todo:        { icon: Circle,       color: "text-slate-400",   label: "To-do" },
  in_progress: { icon: Clock,        color: "text-blue-500",    label: "In Progress" },
  done:        { icon: CheckCircle2, color: "text-emerald-500", label: "Done" },
  blocked:     { icon: AlertCircle,  color: "text-red-500",     label: "Blocked" },
};

const PRIORITY_COLORS = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-blue-50 text-blue-600",
  high:   "bg-orange-50 text-orange-600",
  urgent: "bg-red-50 text-red-600",
};

function Avatar2({ name, size = "w-7 h-7", textSize = "text-[10px]" }) {
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <Avatar className={`${size} flex-shrink-0`}>
      <AvatarFallback className={`bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold ${textSize}`}>{initials}</AvatarFallback>
    </Avatar>
  );
}

// ── Mention picker ────────────────────────────────────────────────────────────
function MentionInput({ value, onChange, members = [], placeholder, rows = 3 }) {
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    const lastAt = v.lastIndexOf("@");
    if (lastAt !== -1 && lastAt === v.length - 1) {
      setShowPicker(true);
      setQuery("");
    } else if (lastAt !== -1 && v.slice(lastAt + 1).match(/^\w*$/)) {
      setQuery(v.slice(lastAt + 1));
      setShowPicker(true);
    } else {
      setShowPicker(false);
    }
  };

  const insertMention = (member) => {
    const lastAt = value.lastIndexOf("@");
    const newVal = value.slice(0, lastAt) + `@${member.member_name || member.member_email.split("@")[0]} `;
    onChange(newVal);
    setShowPicker(false);
    ref.current?.focus();
  };

  const filtered = members.filter(m =>
    query === "" ||
    m.member_name?.toLowerCase().includes(query.toLowerCase()) ||
    m.member_email?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="text-sm resize-none pr-8"
      />
      <button
        type="button"
        onClick={() => { onChange(value + "@"); setShowPicker(true); setQuery(""); ref.current?.focus(); }}
        className="absolute right-2 top-2 text-slate-400 hover:text-indigo-500 transition-colors"
        title="Mention a team member"
      >
        <AtSign className="w-4 h-4" />
      </button>
      {showPicker && filtered.length > 0 && (
        <div className="absolute z-20 left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider border-b">Mention</div>
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => insertMention(m)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 text-left transition-colors"
            >
              <Avatar2 name={m.member_name || m.member_email} size="w-6 h-6" textSize="text-[9px]" />
              <div>
                <p className="text-xs font-medium text-slate-700">{m.member_name || m.member_email.split("@")[0]}</p>
                <p className="text-[10px] text-slate-400">{m.member_email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comments tab ──────────────────────────────────────────────────────────────
function CommentsTab({ partnershipId, resourceLabel, members }) {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("note");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();
  const { data: notes = [] } = useQuery({
    queryKey: ["deal-notes", partnershipId],
    queryFn: () => base44.entities.DealNote.filter({ partnership_id: partnershipId }, "-created_date"),
    enabled: !!partnershipId,
    refetchInterval: 15000, // real-time-ish polling
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!partnershipId) return;
    const unsub = base44.entities.DealNote.subscribe((event) => {
      if (event.data?.partnership_id === partnershipId) {
        queryClient.invalidateQueries({ queryKey: ["deal-notes", partnershipId] });
      }
    });
    return unsub;
  }, [partnershipId, queryClient]);

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.DealNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-notes", partnershipId] });
      setContent("");
    },
  });

  const handleAdd = () => {
    if (!content.trim()) return;
    addMutation.mutate({
      partnership_id: partnershipId,
      content: content.trim(),
      note_type: noteType,
      author_email: user?.email,
      author_name: user?.full_name || user?.email,
    });
  };

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="space-y-2">
        <MentionInput
          value={content}
          onChange={setContent}
          members={members}
          placeholder={`Comment on ${resourceLabel}… Use @ to mention teammates`}
        />
        <div className="flex items-center gap-2">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(NOTE_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={!content.trim() || addMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs ml-auto">
            <Send className="w-3 h-3 mr-1.5" /> Post
          </Button>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No comments yet. Start the conversation!</p>
        ) : notes.map(note => {
          const cfg = NOTE_TYPES[note.note_type] || NOTE_TYPES.note;
          const Icon = cfg.icon;
          // Highlight @mentions
          const parts = note.content?.split(/(@\w+)/g) || [];
          return (
            <div key={note.id} className="flex gap-2.5">
              <Avatar2 name={note.author_name} />
              <div className="flex-1 min-w-0 bg-slate-50 rounded-xl rounded-tl-none px-3 py-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-slate-700">{note.author_name || "Teammate"}</span>
                  <Badge className={`text-[9px] px-1.5 py-0 ${cfg.color} flex items-center gap-0.5`}>
                    <Icon className="w-2.5 h-2.5" />{cfg.label}
                  </Badge>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {note.created_date ? formatDistance(new Date(note.created_date), new Date(), { addSuffix: true }) : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {parts.map((part, i) =>
                    part.startsWith("@")
                      ? <span key={i} className="text-indigo-600 font-semibold">{part}</span>
                      : part
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tasks tab ─────────────────────────────────────────────────────────────────
function TasksTab({ partnershipId, outreachEmailId, approvalItemId, contextLabel, members }) {
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assigned_to_email: "", priority: "medium", due_date: "" });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();
  const filterKey = partnershipId
    ? { partnership_id: partnershipId }
    : outreachEmailId
    ? { outreach_email_id: outreachEmailId }
    : {};

  const cacheKey = partnershipId
    ? ["tasks", "deal", partnershipId]
    : outreachEmailId
    ? ["tasks", "outreach", outreachEmailId]
    : ["tasks", "approval", approvalItemId];

  const { data: tasks = [] } = useQuery({
    queryKey: cacheKey,
    queryFn: () => base44.entities.Task.filter(filterKey, "-created_date"),
    enabled: !!(partnershipId || outreachEmailId),
    refetchInterval: 20000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
      setShowAdd(false);
      setNewTask({ title: "", assigned_to_email: "", priority: "medium", due_date: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cacheKey }),
  });

  const cycleStatus = (task) => {
    const order = ["todo", "in_progress", "done", "blocked"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    updateMutation.mutate({ id: task.id, data: { status: next } });
  };

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    const assigneeName = members.find(m => m.member_email === newTask.assigned_to_email)?.member_name
      || newTask.assigned_to_email?.split("@")[0] || "";
    createMutation.mutate({
      title: newTask.title,
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
      assigned_to_email: newTask.assigned_to_email || undefined,
      assigned_to_name: assigneeName,
      assigned_by_email: user?.email,
      partnership_id: partnershipId || undefined,
      outreach_email_id: outreachEmailId || undefined,
      context_label: contextLabel,
      status: "todo",
    });
  };

  const open = tasks.filter(t => t.status !== "done").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {open > 0 && <Badge className="text-[10px] bg-indigo-100 text-indigo-700">{open} open</Badge>}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-indigo-600 border-indigo-200"
          onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3" /> Assign Task
        </Button>
      </div>

      {showAdd && (
        <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-3 space-y-2">
          <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task title…" className="h-8 text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <Select value={newTask.assigned_to_email} onValueChange={v => setNewTask({ ...newTask, assigned_to_email: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assign to…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Unassigned</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.member_email}>
                    {m.member_name || m.member_email.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["low", "medium", "high", "urgent"].map(p => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
            className="h-8 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className="text-xs h-7 flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreate} disabled={!newTask.title.trim() || createMutation.isPending}>
              Create & Assign
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {tasks.length === 0 && !showAdd ? (
          <p className="text-xs text-slate-400 text-center py-6">No tasks assigned yet</p>
        ) : tasks.map(task => {
          const sc = TASK_STATUS[task.status] || TASK_STATUS.todo;
          const Icon = sc.icon;
          const assignee = members.find(m => m.member_email === task.assigned_to_email);
          return (
            <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group ${task.status === "done" ? "opacity-60" : ""}`}>
              <button onClick={() => cycleStatus(task)} title={`Status: ${sc.label}`} className="flex-shrink-0">
                <Icon className={`w-4 h-4 ${sc.color} hover:scale-110 transition-transform`} />
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${task.status === "done" ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    due {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
              </div>
              <Badge className={`text-[9px] px-1.5 py-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
              {task.assigned_to_email ? (
                <div title={task.assigned_to_email}>
                  <Avatar2 name={assignee?.member_name || task.assigned_to_email} size="w-5 h-5" textSize="text-[8px]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center" title="Unassigned">
                  <Users className="w-3 h-3 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main CollaborationPanel ───────────────────────────────────────────────────
export default function CollaborationPanel({
  partnershipId,
  outreachEmailId,
  approvalItemId,
  resourceLabel = "this item",
}) {
  const [tab, setTab] = useState("comments");

  // Load team members from ALL teams (flattened)
  const { data: members = [] } = useQuery({
    queryKey: ["team-members-collab"],
    queryFn: () => base44.entities.TeamMember.filter({ status: "active" }),
    staleTime: 60000,
  });

  const tabs = [
    { key: "comments", label: "Comments", icon: MessageSquare },
    { key: "tasks",    label: "Tasks",    icon: CheckSquare },
  ];

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
        {members.length > 0 && (
          <div className="flex items-center gap-1 px-2 ml-2 border-l border-slate-200">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">{members.length} members</span>
          </div>
        )}
      </div>

      {tab === "comments" && (
        <CommentsTab
          partnershipId={partnershipId}
          resourceLabel={resourceLabel}
          members={members}
        />
      )}
      {tab === "tasks" && (
        <TasksTab
          partnershipId={partnershipId}
          outreachEmailId={outreachEmailId}
          approvalItemId={approvalItemId}
          contextLabel={resourceLabel}
          members={members}
        />
      )}
    </div>
  );
}
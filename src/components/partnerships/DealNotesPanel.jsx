import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, AlertTriangle, Lightbulb, CheckSquare2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const noteTypeConfig = {
  note: { icon: StickyNote, color: "bg-slate-100 text-slate-600", label: "Note" },
  update: { icon: CheckSquare2, color: "bg-blue-50 text-blue-600", label: "Update" },
  decision: { icon: Lightbulb, color: "bg-amber-50 text-amber-600", label: "Decision" },
  blocker: { icon: AlertTriangle, color: "bg-red-50 text-red-600", label: "Blocker" },
};

export default function DealNotesPanel({ partnershipId }) {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("note");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["deal-notes", partnershipId],
    queryFn: () => base44.entities.DealNote.filter({ partnership_id: partnershipId }, "-created_date"),
    enabled: !!partnershipId,
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.DealNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-notes", partnershipId] });
      setContent("");
    },
  });

  const handleAdd = () => {
    if (!content.trim()) return;
    addNoteMutation.mutate({
      partnership_id: partnershipId,
      content: content.trim(),
      note_type: noteType,
      author_email: user?.email,
      author_name: user?.full_name || user?.email,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Deal Notes</span>
        <span className="text-xs text-slate-400">({notes.length})</span>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add a note, update, or flag a blocker..."
          rows={3}
          className="text-sm resize-none"
        />
        <div className="flex gap-2">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(noteTypeConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={!content.trim() || addNoteMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
            <Send className="w-3 h-3 mr-1.5" /> Add Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No notes yet. Add the first one above.</p>
        ) : (
          notes.map(note => {
            const cfg = noteTypeConfig[note.note_type] || noteTypeConfig.note;
            const Icon = cfg.icon;
            const initials = note.author_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
            return (
              <div key={note.id} className="flex gap-3">
                <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-700">{note.author_name || "Team member"}</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${cfg.color} flex items-center gap-0.5`}>
                      <Icon className="w-2.5 h-2.5" />{cfg.label}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {note.created_date ? format(new Date(note.created_date), "MMM d, h:mm a") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{note.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
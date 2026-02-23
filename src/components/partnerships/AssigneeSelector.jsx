import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck } from "lucide-react";

export default function AssigneeSelector({ value, onChange, placeholder = "Assign to..." }) {
  const { data: members = [] } = useQuery({
    queryKey: ["all-team-members"],
    queryFn: () => base44.entities.TeamMember.list("-created_date", 200),
  });

  // Deduplicate by email
  const uniqueMembers = members.filter((m, i, arr) =>
    arr.findIndex(x => x.member_email === m.member_email) === i && m.member_email
  );

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <div className="flex items-center gap-1.5">
          {value ? (
            <>
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[8px] bg-indigo-500 text-white">
                  {value.split("@")[0]?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{uniqueMembers.find(m => m.member_email === value)?.member_name || value.split("@")[0]}</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{placeholder}</span>
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>Unassigned</SelectItem>
        {uniqueMembers.map(m => (
          <SelectItem key={m.member_email} value={m.member_email}>
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[9px] bg-indigo-400 text-white">
                  {m.member_name?.[0]?.toUpperCase() || m.member_email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{m.member_name || m.member_email}</span>
              <span className="text-[10px] text-slate-400">{m.role}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
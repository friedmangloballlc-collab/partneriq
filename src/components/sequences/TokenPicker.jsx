import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Code2 } from "lucide-react";

const TOKENS = [
  { token: "{{first_name}}", label: "First Name", example: "John" },
  { token: "{{last_name}}", label: "Last Name", example: "Doe" },
  { token: "{{full_name}}", label: "Full Name", example: "John Doe" },
  { token: "{{company}}", label: "Company", example: "Acme Corp" },
  { token: "{{role}}", label: "Job Title", example: "Head of Marketing" },
  { token: "{{platform}}", label: "Platform", example: "Instagram" },
  { token: "{{niche}}", label: "Niche", example: "fitness" },
  { token: "{{followers}}", label: "Followers", example: "250K" },
  { token: "{{your_name}}", label: "Your Name", example: "Jane Smith" },
  { token: "{{your_company}}", label: "Your Company", example: "PartnerIQ" },
  { token: "{{campaign_name}}", label: "Campaign Name", example: "Summer 2025" },
  { token: "{{date}}", label: "Today's Date", example: "Feb 24, 2026" },
];

export default function TokenPicker({ onInsert }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <Code2 className="w-3 h-3" /> Insert Token
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Personalization Tokens</p>
        <div className="space-y-0.5 max-h-60 overflow-y-auto">
          {TOKENS.map(t => (
            <button
              key={t.token}
              onClick={() => { onInsert(t.token); setOpen(false); }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-mono text-indigo-600">{t.token}</span>
                <span className="text-[10px] text-slate-400 ml-2">{t.label}</span>
              </div>
              <span className="text-[10px] text-slate-300">{t.example}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
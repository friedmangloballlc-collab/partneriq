import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CHANGELOG = [
  {
    date: "2026-03-29",
    title: "AI Match Engine Improvements",
    description: "10-factor scoring now includes brand safety and trajectory prediction.",
  },
  {
    date: "2026-03-28",
    title: "Security Hardened",
    description: "RLS policies, role protection, and escrow authorization added.",
  },
  {
    date: "2026-03-27",
    title: "Pearl Theme",
    description: "New light cream theme with warm ivory background and gold accents.",
  },
  {
    date: "2026-03-23",
    title: "Manager Role",
    description: "Personal managers can now sign up with dedicated pricing and talent profile management.",
  },
  {
    date: "2026-03-22",
    title: "Performance Boost",
    description: "34% smaller bundle, deferred fonts, hover prefetch navigation.",
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function WhatsNewButton({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="What's New"
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${className}`}
      >
        <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
        <span className="hidden sm:inline">What's New</span>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                What's New
              </SheetTitle>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close changelog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Recent updates and improvements to PartnerIQ.</p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {CHANGELOG.map((entry, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-1 rounded-full bg-amber-400/40 self-stretch" aria-hidden="true" />
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-amber-300/60 text-amber-700 bg-amber-50"
                    >
                      {formatDate(entry.date)}
                    </Badge>
                    {idx === 0 && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white border-0">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-sm"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

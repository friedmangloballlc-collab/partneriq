import React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }) {
  return (
    <kbd className={cn(
      "inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
      className
    )}>
      {children}
    </kbd>
  );
}

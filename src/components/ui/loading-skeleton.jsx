import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingSkeleton — a set of composable skeleton layouts for common page shapes.
 *
 * Named exports:
 *   CardGridSkeleton      — NxM grid of card placeholders (default 6 cards, 3 cols)
 *   ListSkeleton          — Vertical list of row placeholders (default 5 rows)
 *   KanbanSkeleton        — Horizontal kanban column placeholders (default 4 cols)
 *   StatCardsSkeleton     — Row of stat summary boxes (default 4 cards)
 *   NotificationSkeleton  — Vertical stack styled for notification rows
 *   TableSkeleton         — Table rows with column cells
 */

// ─── Card Grid ────────────────────────────────────────────────────────────────

export function CardGridSkeleton({
  count = 6,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  className,
}) {
  return (
    <div className={cn("grid gap-4", columns, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── List Rows ────────────────────────────────────────────────────────────────

export function ListSkeleton({ count = 5, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/60 p-4 flex items-center gap-4"
        >
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Kanban Columns ───────────────────────────────────────────────────────────

export function KanbanSkeleton({ cols = 4, cardsPerCol = 2, className }) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {Array.from({ length: cols }).map((_, ci) => (
        <div key={ci} className="min-w-[280px] max-w-[300px] flex-shrink-0 space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
          {Array.from({ length: cardsPerCol }).map((_, ri) => (
            <div
              key={ri}
              className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-3"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

export function StatCardsSkeleton({ count = 4, className }) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ─── Notification Rows ────────────────────────────────────────────────────────

export function NotificationSkeleton({ count = 5, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/60 p-4 flex gap-4"
        >
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 6, cols = 5, className }) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200/60 overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className={cn(
            "px-4 py-3 flex gap-4 items-center",
            ri < rows - 1 && "border-b border-slate-50"
          )}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton
              key={ci}
              className={cn("h-4 flex-1", ci === 0 && "max-w-[160px]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

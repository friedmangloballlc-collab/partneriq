import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * EmptyState — a consistent zero-data placeholder.
 *
 * Props:
 *   icon        — React element, e.g. <Search className="w-8 h-8" />
 *   title       — string, bold headline
 *   description — string, secondary help text
 *   action      — optional { label: string, onClick: fn, variant?: string, icon?: ReactElement }
 *   className   — extra classes for the wrapper
 *   compact     — boolean, smaller padding / icons for tight containers
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "py-16 px-6",
        className
      )}
    >
      {icon && (
        <div
          role="img"
          aria-label={title ? `${title} icon` : "Empty state icon"}
          className={cn(
            "rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4",
            compact ? "w-12 h-12" : "w-16 h-16",
            "[&_svg]:text-slate-400",
            compact ? "[&_svg]:w-5 [&_svg]:h-5" : "[&_svg]:w-7 [&_svg]:h-7"
          )}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon, { "aria-hidden": true })
            : icon}
        </div>
      )}

      {title && (
        <h3
          className={cn(
            "font-semibold text-slate-700",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={cn(
            "text-slate-400 mt-1 max-w-xs",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant ?? "outline"}
          size={compact ? "sm" : "default"}
          onClick={action.onClick}
          aria-label={action.label}
          className="mt-4 gap-1.5"
        >
          {action.icon && React.isValidElement(action.icon)
            ? React.cloneElement(action.icon, { "aria-hidden": true })
            : action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}

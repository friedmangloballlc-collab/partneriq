import React, { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";

const TIP_DISMISS_KEY = "partneriq_tip_dismissed";

/**
 * ContextualTip - shows a dismissable tip bubble on a specific page/feature.
 * Props:
 *   tipId: string - unique ID for this tip (used to persist dismissed state)
 *   title: string
 *   description: string
 *   link?: { label: string, href: string }
 *   position?: "top-right" | "bottom-right" | "bottom-left" | "inline"
 *   icon?: ReactNode
 *   color?: "indigo" | "emerald" | "amber" | "rose"
 */
export default function ContextualTip({
  tipId,
  title,
  description,
  link,
  position = "inline",
  color = "indigo",
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIP_DISMISS_KEY);
      const dismissed_tips = raw ? JSON.parse(raw) : {};
      setDismissed(!!dismissed_tips[tipId]);
    } catch {
      setDismissed(false);
    }
  }, [tipId]);

  const dismiss = () => {
    setDismissed(true);
    try {
      const raw = localStorage.getItem(TIP_DISMISS_KEY);
      const dismissed_tips = raw ? JSON.parse(raw) : {};
      dismissed_tips[tipId] = true;
      localStorage.setItem(TIP_DISMISS_KEY, JSON.stringify(dismissed_tips));
    } catch {}
  };

  if (dismissed) return null;

  const colors = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-500", title: "text-indigo-800", text: "text-indigo-700", link: "text-indigo-600" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", title: "text-emerald-800", text: "text-emerald-700", link: "text-emerald-600" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", title: "text-amber-800", text: "text-amber-700", link: "text-amber-600" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-500", title: "text-rose-800", text: "text-rose-700", link: "text-rose-600" },
  };
  const c = colors[color] || colors.indigo;

  const positionClass = {
    "top-right": "fixed top-20 right-6 z-50 w-80 shadow-lg",
    "bottom-right": "fixed bottom-6 right-6 z-50 w-80 shadow-lg",
    "bottom-left": "fixed bottom-6 left-72 z-50 w-80 shadow-lg",
    inline: "w-full",
  }[position];

  return (
    <div className={`${positionClass} ${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3 animate-fade-in-up`}>
      <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.icon}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.title}`}>{title}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${c.text}`}>{description}</p>
        {link && (
          <a href={link.href} className={`inline-flex items-center gap-1 text-xs font-medium mt-1.5 ${c.link} hover:underline`}>
            {link.label} <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>
      <button onClick={dismiss} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-0.5 rounded hover:bg-white/50 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
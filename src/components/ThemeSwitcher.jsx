import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { Check, Moon, Sparkles } from "lucide-react";

export default function ThemeSwitcher({ compact = false }) {
  const { themeKey, setTheme, themes } = useTheme();

  const options = [
    { key: "dark", icon: Moon, preview: { bg: "#080807", accent: "#c4a24a", text: "#f5f0e6" } },
    { key: "gradient", icon: Sparkles, preview: { bg: "linear-gradient(135deg, #c4a24a, #e07b18)", accent: "#1a1a18", text: "#1a1a18" } },
  ];

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        {options.map(opt => {
          const active = themeKey === opt.key;
          return (
            <button key={opt.key} onClick={() => setTheme(opt.key)} title={themes[opt.key].label}
              style={{
                width: 28, height: 28, borderRadius: 6, border: active ? "2px solid #c4a24a" : "1px solid rgba(255,248,220,0.15)",
                background: opt.preview.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", transform: active ? "scale(1.1)" : "scale(1)",
              }}>
              {active && <Check size={12} style={{ color: opt.preview.accent }} />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {options.map(opt => {
        const active = themeKey === opt.key;
        const Icon = opt.icon;
        return (
          <button key={opt.key} onClick={() => setTheme(opt.key)}
            style={{
              flex: 1, padding: "1rem", borderRadius: 10, cursor: "pointer",
              border: active ? "1.5px solid #c4a24a" : "0.5px solid rgba(255,248,220,0.1)",
              background: active ? "rgba(196,162,74,0.08)" : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "all 0.2s",
            }}>
            {/* Preview mini card */}
            <div style={{
              width: "100%", height: 48, borderRadius: 6, background: opt.preview.bg,
              border: "0.5px solid rgba(128,128,128,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{ width: "40%", height: 4, borderRadius: 2, background: opt.preview.accent }} />
              {active && (
                <div style={{
                  position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%",
                  background: "#c4a24a", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={10} color="#080807" />
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={14} style={{ color: active ? "#c4a24a" : "rgba(245,240,230,0.4)" }} />
              <span style={{
                fontSize: "0.75rem", fontWeight: active ? 500 : 400,
                color: active ? "#f5f0e6" : "rgba(245,240,230,0.4)",
                fontFamily: "'Instrument Sans', sans-serif",
              }}>{themes[opt.key].label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

import { useState, useEffect } from "react";

const THEMES = {
  dark: {
    key: "dark",
    label: "Primary Dark",
    logo: "/brand/logos/04_logo_transparent_ondark.png",
    mark: "/brand/marks/10_mark_transparent.png",
    bg: "#1c1b19",
    bg2: "#232220",
    bg3: "#2a2826",
    surface: "rgba(255,248,220,0.05)",
    border: "rgba(255,248,220,0.09)",
    border2: "rgba(255,248,220,0.15)",
    text: "#f5f0e6",
    textMuted: "rgba(245,240,230,0.60)",
    textDim: "rgba(245,240,230,0.28)",
    gold: "#d4b04e",
    amber: "#e07b18",
    goldDim: "rgba(212,176,78,0.13)",
    sidebar: "#121110",
    sidebarText: "#f5f0e6",
    cardBg: "rgba(255,248,220,0.05)",
    inputBg: "rgba(255,248,220,0.05)",
    inputBorder: "rgba(255,248,220,0.12)",
  },
  gradient: {
    key: "gradient",
    label: "On Gradient",
    logo: "/brand/logos/03_logo_gradient.png",
    mark: "/brand/marks/09_mark_gradient.png",
    bg: "linear-gradient(135deg, #c4a24a 0%, #e07b18 100%)",
    bg2: "linear-gradient(135deg, #b39340 0%, #d07015 100%)",
    bg3: "rgba(0,0,0,0.1)",
    surface: "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.18)",
    border2: "rgba(255,255,255,0.28)",
    text: "#1a1a18",
    textMuted: "rgba(26,26,24,0.65)",
    textDim: "rgba(26,26,24,0.4)",
    gold: "#1a1a18",
    amber: "#3d2800",
    goldDim: "rgba(0,0,0,0.08)",
    sidebar: "rgba(0,0,0,0.85)",
    sidebarText: "#f5f0e6",
    cardBg: "rgba(255,255,255,0.15)",
    inputBg: "rgba(255,255,255,0.2)",
    inputBorder: "rgba(255,255,255,0.3)",
  },
};

export function useTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    try { return localStorage.getItem("ds-theme") || "dark"; } catch { return "dark"; }
  });

  const theme = THEMES[themeKey] || THEMES.dark;

  useEffect(() => {
    try { localStorage.setItem("ds-theme", themeKey); } catch {}
    // Apply theme to body for global CSS vars
    const root = document.documentElement;
    root.style.setProperty("--ds-theme-bg", theme.bg.startsWith("linear") ? "#1c1b19" : theme.bg);
    root.style.setProperty("--ds-theme-text", theme.text);
    root.style.setProperty("--ds-theme-gold", theme.gold);
  }, [themeKey, theme]);

  const setTheme = (key) => {
    if (THEMES[key]) setThemeKey(key);
  };

  return { theme, themeKey, setTheme, themes: THEMES };
}

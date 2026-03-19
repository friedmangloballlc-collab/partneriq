import { useState, useEffect } from "react";

const THEMES = {
  dark: {
    key: "dark",
    label: "Primary Dark",
    logo: "/brand/logos/04_logo_transparent_ondark.png",
    mark: "/brand/marks/10_mark_transparent.png",
    bg: "#080807",
    bg2: "#0f0f0d",
    bg3: "#161613",
    surface: "rgba(255,248,220,0.03)",
    border: "rgba(255,248,220,0.07)",
    border2: "rgba(255,248,220,0.13)",
    text: "#f5f0e6",
    textMuted: "rgba(245,240,230,0.56)",
    textDim: "rgba(245,240,230,0.28)",
    gold: "#c4a24a",
    amber: "#e07b18",
    goldDim: "rgba(196,162,74,0.11)",
    sidebar: "#0a0a09",
    sidebarText: "#f5f0e6",
    cardBg: "rgba(255,248,220,0.03)",
    inputBg: "rgba(255,248,220,0.03)",
    inputBorder: "rgba(255,248,220,0.1)",
  },
  light: {
    key: "light",
    label: "On Light",
    logo: "/brand/logos/05_logo_transparent_onlight.png",
    mark: "/brand/marks/07_mark_dark.png",
    bg: "#f5f0e6",
    bg2: "#ede8dc",
    bg3: "#e5e0d4",
    surface: "rgba(0,0,0,0.03)",
    border: "rgba(0,0,0,0.08)",
    border2: "rgba(0,0,0,0.14)",
    text: "#1a1a18",
    textMuted: "rgba(26,26,24,0.6)",
    textDim: "rgba(26,26,24,0.35)",
    gold: "#a08630",
    amber: "#c46a10",
    goldDim: "rgba(160,134,48,0.1)",
    sidebar: "#1a1a18",
    sidebarText: "#f5f0e6",
    cardBg: "rgba(255,255,255,0.7)",
    inputBg: "rgba(255,255,255,0.8)",
    inputBorder: "rgba(0,0,0,0.12)",
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
    root.style.setProperty("--ds-theme-bg", theme.bg.startsWith("linear") ? "#080807" : theme.bg);
    root.style.setProperty("--ds-theme-text", theme.text);
    root.style.setProperty("--ds-theme-gold", theme.gold);
  }, [themeKey, theme]);

  const setTheme = (key) => {
    if (THEMES[key]) setThemeKey(key);
  };

  return { theme, themeKey, setTheme, themes: THEMES };
}

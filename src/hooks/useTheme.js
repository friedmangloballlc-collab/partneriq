import { useState, useEffect } from "react";

const THEMES = {
  dark: {
    key: "dark",
    label: "Pearl",
    logo: "/brand/logos/05_logo_transparent_onlight.png",
    mark: "/brand/marks/07_mark_dark.png",
    bg: "#faf5eb",
    bg2: "#ffffff",
    bg3: "#f3ede0",
    surface: "rgba(180,160,120,0.06)",
    border: "rgba(180,160,120,0.15)",
    border2: "rgba(180,160,120,0.25)",
    text: "#1c1b19",
    textMuted: "rgba(28,27,25,0.55)",
    textDim: "rgba(28,27,25,0.30)",
    gold: "#d4b04e",
    amber: "#e07b18",
    goldDim: "rgba(212,176,78,0.12)",
    sidebar: "#1c1b19",
    sidebarText: "#f5f0e6",
    cardBg: "#ffffff",
    inputBg: "#ffffff",
    inputBorder: "rgba(180,160,120,0.20)",
  },
  pearl: {
    key: "pearl",
    label: "Pearl",
    logo: "/brand/logos/05_logo_transparent_onlight.png",
    mark: "/brand/marks/07_mark_dark.png",
    bg: "#faf5eb",
    bg2: "#ffffff",
    bg3: "#f3ede0",
    surface: "rgba(180,160,120,0.06)",
    border: "rgba(180,160,120,0.15)",
    border2: "rgba(180,160,120,0.25)",
    text: "#1c1b19",
    textMuted: "rgba(28,27,25,0.55)",
    textDim: "rgba(28,27,25,0.30)",
    gold: "#d4b04e",
    amber: "#e07b18",
    goldDim: "rgba(212,176,78,0.12)",
    sidebar: "#1c1b19",
    sidebarText: "#f5f0e6",
    cardBg: "#ffffff",
    inputBg: "#ffffff",
    inputBorder: "rgba(180,160,120,0.20)",
  },
};

export function useTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    try { return localStorage.getItem("ds-theme") || "dark"; } catch { return "dark"; }
  });

  const theme = THEMES[themeKey] || THEMES.dark;

  useEffect(() => {
    try { localStorage.setItem("ds-theme", themeKey); } catch {}
    const root = document.documentElement;
    // Always remove dark class — both themes are light
    root.classList.remove("dark");
    // Apply theme to body for global CSS vars
    root.style.setProperty("--ds-theme-bg", theme.bg);
    root.style.setProperty("--ds-theme-text", theme.text);
    root.style.setProperty("--ds-theme-gold", theme.gold);
  }, [themeKey, theme]);

  const setTheme = (key) => {
    if (THEMES[key]) setThemeKey(key);
  };

  return { theme, themeKey, setTheme, themes: THEMES };
}

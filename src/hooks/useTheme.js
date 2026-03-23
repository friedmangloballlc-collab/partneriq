import { useState, useEffect } from "react";

const THEMES = {
  dark: {
    key: "dark",
    label: "Dark",
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
    sidebar: "#121110",
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
    // Toggle Tailwind dark mode class
    if (themeKey === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
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

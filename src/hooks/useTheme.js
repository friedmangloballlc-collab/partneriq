import { useState, useEffect } from "react";

const THEME = {
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
};

const THEMES = {
  dark: THEME,
  pearl: THEME,
};

export function useTheme() {
  const [themeKey, setThemeKey] = useState("pearl");

  useEffect(() => {
    const root = document.documentElement;
    // Always light — remove dark class
    root.classList.remove("dark");
    root.style.setProperty("--ds-theme-bg", THEME.bg);
    root.style.setProperty("--ds-theme-text", THEME.text);
    root.style.setProperty("--ds-theme-gold", THEME.gold);
  }, []);

  const setTheme = () => {};

  return { theme: THEME, themeKey: "pearl", setTheme, themes: THEMES };
}

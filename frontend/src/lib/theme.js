import { getTheme } from "./storage";

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove("dark");

  if (theme === "dark") root.classList.add("dark");
  if (theme === "system") {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    if (prefersDark) root.classList.add("dark");
  }
}

export function initTheme() {
  applyTheme(getTheme());
}


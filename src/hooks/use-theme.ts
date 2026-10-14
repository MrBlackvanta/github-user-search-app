"use client";

import {
  DARK_SCHEME_QUERY,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function readServerTheme(): Theme {
  return "light";
}

function hasStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
  listeners.forEach((onChange) => onChange());
}

function subscribe(onChange: () => void) {
  const systemScheme = matchMedia(DARK_SCHEME_QUERY);

  function followSystem({ matches }: MediaQueryListEvent) {
    if (!hasStoredTheme()) applyTheme(matches ? "dark" : "light");
  }

  listeners.add(onChange);
  systemScheme.addEventListener("change", followSystem);
  return () => {
    listeners.delete(onChange);
    systemScheme.removeEventListener("change", followSystem);
  };
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function useTheme() {
  return useSyncExternalStore(subscribe, readTheme, readServerTheme);
}

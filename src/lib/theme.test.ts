import { setMediaMatch } from "@/test/media";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyStoredTheme,
  DARK_SCHEME_QUERY,
  THEME_STORAGE_KEY,
} from "./theme";

function runPrePaintScript() {
  new Function(applyStoredTheme)();
}

function themeColor() {
  return document
    .querySelector('meta[name="theme-color"]')
    ?.getAttribute("content");
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
  document.head.innerHTML = "";
});

describe("applyStoredTheme", () => {
  it.each([
    { stored: "dark", systemDark: false, theme: "dark", color: "#141d2f" },
    { stored: "light", systemDark: true, theme: "light", color: "#f6f8ff" },
    { stored: null, systemDark: true, theme: "dark", color: "#141d2f" },
    { stored: null, systemDark: false, theme: "light", color: "#f6f8ff" },
    { stored: "sepia", systemDark: true, theme: "dark", color: "#141d2f" },
  ])(
    "stored $stored with a dark system $systemDark paints $theme",
    ({ stored, systemDark, theme, color }) => {
      if (stored) localStorage.setItem(THEME_STORAGE_KEY, stored);
      setMediaMatch(DARK_SCHEME_QUERY, systemDark);

      runPrePaintScript();

      expect(document.documentElement.dataset.theme).toBe(theme);
      expect(themeColor()).toBe(color);
    },
  );

  it("falls back to the system scheme when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    setMediaMatch(DARK_SCHEME_QUERY, true);

    runPrePaintScript();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(themeColor()).toBe("#141d2f");
  });
});

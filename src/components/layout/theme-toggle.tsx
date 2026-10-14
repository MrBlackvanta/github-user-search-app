"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { setTheme, useTheme } from "@/hooks/use-theme";
import { withThemeSweep } from "@/lib/view-transition";
import type { MouseEvent } from "react";

export default function ThemeToggle() {
  const isDark = useTheme() === "dark";

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const origin = { x: left + width / 2, y: top + height / 2 };

    withThemeSweep(() => setTheme(isDark ? "light" : "dark"), origin, !isDark);
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Light theme" : "Dark theme"}
      onClick={toggle}
      className="text-muted hover:text-toggle-hover -my-2 flex items-center gap-3.5 py-2 transition-[color] ease-out"
    >
      <span className="text-label tracking-toggle font-bold uppercase">
        <span className="dark:hidden">Dark</span>
        <span className="hidden dark:inline">Light</span>
      </span>
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}

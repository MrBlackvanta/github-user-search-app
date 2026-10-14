import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from "@/lib/theme";
import { mediaListenerCount, setMediaMatch } from "@/test/media";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "./theme-toggle";

function paintedTheme() {
  return document.documentElement.dataset.theme;
}

function themeColor() {
  return document
    .querySelector('meta[name="theme-color"]')
    ?.getAttribute("content");
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '<meta name="theme-color" content="#f6f8ff">';
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("ThemeToggle", () => {
  it("names the theme it switches to, and switches on click", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Dark theme" }));

    expect(paintedTheme()).toBe("dark");
    expect(themeColor()).toBe("#141d2f");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Light theme" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Light theme" }));

    expect(paintedTheme()).toBe("light");
    expect(themeColor()).toBe("#f6f8ff");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("starts from the theme the pre-paint script chose", () => {
    document.documentElement.dataset.theme = "dark";

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Light theme" })).toBeVisible();
  });

  it("follows the system scheme until a theme is chosen", async () => {
    render(<ThemeToggle />);

    act(() => setMediaMatch(DARK_SCHEME_QUERY, true));

    expect(paintedTheme()).toBe("dark");
    expect(themeColor()).toBe("#141d2f");
    expect(screen.getByRole("button", { name: "Light theme" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Light theme" }));
    act(() => setMediaMatch(DARK_SCHEME_QUERY, false));
    act(() => setMediaMatch(DARK_SCHEME_QUERY, true));

    expect(paintedTheme()).toBe("light");
    expect(screen.getByRole("button", { name: "Dark theme" })).toBeVisible();
  });

  it("stops listening to the system scheme on unmount", () => {
    const { unmount } = render(<ThemeToggle />);
    expect(mediaListenerCount(DARK_SCHEME_QUERY)).toBe(1);

    unmount();

    expect(mediaListenerCount(DARK_SCHEME_QUERY)).toBe(0);
  });

  it("still switches when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Dark theme" }));

    expect(paintedTheme()).toBe("dark");
    expect(screen.getByRole("button", { name: "Light theme" })).toBeVisible();
  });
});

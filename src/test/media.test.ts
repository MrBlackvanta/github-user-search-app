import { describe, expect, it, vi } from "vitest";
import { mediaListenerCount, setMediaMatch } from "./media";

const DARK = "(prefers-color-scheme: dark)";

describe("matchMedia stub", () => {
  it("reports the current match and notifies subscribers when it flips", () => {
    const query = window.matchMedia(DARK);
    const listener = vi.fn();
    query.addEventListener("change", listener);

    expect(query.matches).toBe(false);
    setMediaMatch(DARK, true);

    expect(query.matches).toBe(true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ matches: true, media: DARK }),
    );
  });

  it("stops notifying a listener once it is removed", () => {
    const query = window.matchMedia(DARK);
    const listener = vi.fn();
    query.addEventListener("change", listener);
    query.removeEventListener("change", listener);

    setMediaMatch(DARK, true);

    expect(listener).not.toHaveBeenCalled();
    expect(mediaListenerCount(DARK)).toBe(0);
  });
});

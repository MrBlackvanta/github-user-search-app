import { setMediaMatch } from "@/test/media";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REDUCED_MOTION_QUERY, withThemeSweep } from "./view-transition";

const VIEWPORT = { width: 1000, height: 600 };

const TOP_RIGHT = { x: 1000, y: 0 };
const CENTRE = { x: 500, y: 300 };

function root() {
  return document.documentElement;
}

function sweepProperty(name: string) {
  return Number.parseFloat(root().style.getPropertyValue(name));
}

function stubViewport() {
  for (const [property, value] of [
    ["clientWidth", VIEWPORT.width],
    ["clientHeight", VIEWPORT.height],
  ] as const) {
    Object.defineProperty(root(), property, { configurable: true, value });
  }
}

function settleable() {
  const settle = Promise.withResolvers<void>();
  settle.promise.catch(() => {});
  return settle;
}

function stubViewTransition() {
  const ready = settleable();
  const finished = settleable();
  const start = vi.fn((update: () => void) => {
    update();
    return { ready: ready.promise, finished: finished.promise };
  });

  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: start,
  });

  return { start, ready, finished };
}

beforeEach(stubViewport);

afterEach(() => {
  Reflect.deleteProperty(document, "startViewTransition");
  Reflect.deleteProperty(root(), "clientWidth");
  Reflect.deleteProperty(root(), "clientHeight");
  root().removeAttribute("style");
  delete root().dataset.sweep;
});

describe("without view transitions", () => {
  it("still applies the change and marks nothing", () => {
    const update = vi.fn();

    withThemeSweep(update, CENTRE, false);

    expect(update).toHaveBeenCalledOnce();
    expect(root().dataset.sweep).toBeUndefined();
    expect(root().style.getPropertyValue("--sweep-r")).toBe("");
  });
});

describe("when motion is not wanted", () => {
  it("applies the change without starting a transition", () => {
    const { start } = stubViewTransition();
    setMediaMatch(REDUCED_MOTION_QUERY, true);
    const update = vi.fn();

    withThemeSweep(update, CENTRE, false);

    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    expect(root().dataset.sweep).toBeUndefined();
  });
});

describe("the sweep", () => {
  it("runs the change inside the transition rather than before it", () => {
    const order: string[] = [];
    const { start } = stubViewTransition();
    start.mockImplementation((update) => {
      order.push("transition started");
      update();
      return { ready: new Promise(() => {}), finished: new Promise(() => {}) };
    });

    withThemeSweep(() => order.push("theme painted"), CENTRE, false);

    expect(order).toEqual(["transition started", "theme painted"]);
  });

  it("opens outward when the new theme arrives underneath", () => {
    stubViewTransition();

    withThemeSweep(() => {}, CENTRE, false);

    expect(root().dataset.sweep).toBe("in");
  });

  it("closes inward when the old theme is what peels away", () => {
    stubViewTransition();

    withThemeSweep(() => {}, CENTRE, true);

    expect(root().dataset.sweep).toBe("out");
  });

  it("centres the circle on the button", () => {
    stubViewTransition();

    withThemeSweep(() => {}, TOP_RIGHT, false);

    expect(sweepProperty("--sweep-x")).toBeCloseTo(100, 5);
    expect(sweepProperty("--sweep-y")).toBeCloseTo(0, 5);
  });

  it("grows only as far as the furthest corner", () => {
    stubViewTransition();

    withThemeSweep(() => {}, TOP_RIGHT, false);
    expect(sweepProperty("--sweep-r")).toBeCloseTo(100 * Math.SQRT2, 5);

    withThemeSweep(() => {}, CENTRE, false);
    expect(sweepProperty("--sweep-r")).toBeCloseTo((100 * Math.SQRT2) / 2, 5);
  });
});

describe("after the sweep", () => {
  it("unmarks the document once the transition finishes", async () => {
    const { finished } = stubViewTransition();

    withThemeSweep(() => {}, CENTRE, false);
    finished.resolve();

    await vi.waitFor(() => expect(root().dataset.sweep).toBeUndefined());
  });

  it("unmarks it when the transition is skipped", async () => {
    const { finished } = stubViewTransition();

    withThemeSweep(() => {}, CENTRE, true);
    finished.reject(new DOMException("Skipped", "AbortError"));

    await vi.waitFor(() => expect(root().dataset.sweep).toBeUndefined());
  });

  it("unmarks it when the transition never becomes ready", async () => {
    const { ready } = stubViewTransition();

    withThemeSweep(() => {}, CENTRE, false);
    ready.reject(new DOMException("Aborted", "AbortError"));

    await vi.waitFor(() => expect(root().dataset.sweep).toBeUndefined());
  });
});

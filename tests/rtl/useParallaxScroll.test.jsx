// @vitest-environment jsdom
/* tests · RTL — useParallaxScroll hook (Wave 9 z-axis scroll parallax).

   Surface: the hook attaches a window-level scroll listener on mount,
   schedules its first compute via requestAnimationFrame, writes a
   translate3d transform on its ref host, and clears the inline
   transform + removes the listener on unmount. reduced-motion +
   speed=0 + enabled=false all short-circuit so no listener is added. */

import React, { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useParallaxScroll } from "../../src/components/util/useParallaxScroll.js";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
  // Coalesce rAF to a synchronous microtask so we can assert the
  // initial compute() write inline.
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    Promise.resolve().then(() => cb(0));
    return 1;
  });
});

function Host({ opts }) {
  const ref = useRef(null);
  useParallaxScroll(ref, opts);
  return <span ref={ref} data-testid="px-host">S</span>;
}

describe("useParallaxScroll (RTL · jsdom)", () => {
  test("mount attaches a window scroll listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<Host />);
    const scrollAdd = addSpy.mock.calls.find((c) => c[0] === "scroll");
    expect(scrollAdd).toBeTruthy();
  });

  test("mount attaches a window resize listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<Host />);
    const resizeAdd = addSpy.mock.calls.find((c) => c[0] === "resize");
    expect(resizeAdd).toBeTruthy();
  });

  test("unmount removes scroll + resize listeners and clears transform", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { getByTestId, unmount } = render(<Host />);
    const host = getByTestId("px-host");
    host.style.transform = "translate3d(0, 12px, 0)";
    unmount();
    const scrollRem = removeSpy.mock.calls.find((c) => c[0] === "scroll");
    const resizeRem = removeSpy.mock.calls.find((c) => c[0] === "resize");
    expect(scrollRem).toBeTruthy();
    expect(resizeRem).toBeTruthy();
    expect(host.style.transform).toBe("");
  });

  test("writes a translate3d transform on the y-axis by default", async () => {
    const { getByTestId } = render(<Host />);
    const host = getByTestId("px-host");
    host.getBoundingClientRect = () => ({ left: 0, top: 200, width: 100, height: 100, right: 100, bottom: 300 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 400 });
    // Trigger rAF flush.
    await Promise.resolve();
    expect(host.style.transform).toMatch(/translate3d\(0,\s*-?\d/);
  });

  test("axis=x writes a translate3d on the x-axis", async () => {
    const { getByTestId } = render(<Host opts={{ speed: 0.5, axis: "x" }} />);
    const host = getByTestId("px-host");
    host.getBoundingClientRect = () => ({ left: 200, top: 0, width: 100, height: 100, right: 300, bottom: 100 });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 400 });
    await Promise.resolve();
    expect(host.style.transform).toMatch(/translate3d\(-?\d.+px,\s*0,\s*0\)/);
  });

  test("prefers-reduced-motion: reduce → no scroll listener attached", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(prefers-reduced-motion: reduce)",
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<Host />);
    const scrollAdd = addSpy.mock.calls.find((c) => c[0] === "scroll");
    expect(scrollAdd).toBeFalsy();
  });

  test("speed=0 → no scroll listener attached", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<Host opts={{ speed: 0 }} />);
    const scrollAdd = addSpy.mock.calls.find((c) => c[0] === "scroll");
    expect(scrollAdd).toBeFalsy();
  });

  test("enabled=false → no scroll listener attached", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<Host opts={{ enabled: false }} />);
    const scrollAdd = addSpy.mock.calls.find((c) => c[0] === "scroll");
    expect(scrollAdd).toBeFalsy();
  });
});

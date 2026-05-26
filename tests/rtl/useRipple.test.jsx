// @vitest-environment jsdom
/* tests · RTL — useRipple hook (Wave 7 W7-A motion + microinteractions).

   Surface: pointerdown on the host injects a `.rx-ripple-fx` span,
   sized + positioned via inline style. After 700ms a setTimeout cleans
   the node up. We drive that timer with vi.useFakeTimers. */

import React, { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useRipple } from "../../src/components/util/useRipple.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
});

function Host() {
  const ref = useRef(null);
  useRipple(ref);
  return <button ref={ref} className="rx-ripple" data-testid="r">go</button>;
}

describe("useRipple (RTL · jsdom)", () => {
  test("pointerdown injects a .rx-ripple-fx element on the host", () => {
    const { getByTestId } = render(<Host />);
    const host = getByTestId("r");
    expect(host.querySelector(".rx-ripple-fx")).toBeNull();
    fireEvent.pointerDown(host, { clientX: 10, clientY: 10 });
    const fx = host.querySelector(".rx-ripple-fx");
    expect(fx).toBeTruthy();
  });

  test("ripple element is positioned (width/height set, equal)", () => {
    const { getByTestId } = render(<Host />);
    const host = getByTestId("r");
    fireEvent.pointerDown(host, { clientX: 10, clientY: 10 });
    const fx = host.querySelector(".rx-ripple-fx");
    // jsdom returns zeros from getBoundingClientRect so width and
    // height are both "0px" — but the contract under test is that
    // they're explicitly written and are equal (a circular ripple).
    expect(fx.style.width).toBe("0px");
    expect(fx.style.height).toBe(fx.style.width);
  });

  test("ripple auto-removes after 700ms (fake timers)", () => {
    vi.useFakeTimers();
    const { getByTestId } = render(<Host />);
    const host = getByTestId("r");
    fireEvent.pointerDown(host, { clientX: 5, clientY: 5 });
    expect(host.querySelector(".rx-ripple-fx")).toBeTruthy();
    vi.advanceTimersByTime(699);
    expect(host.querySelector(".rx-ripple-fx")).toBeTruthy();
    vi.advanceTimersByTime(2);
    expect(host.querySelector(".rx-ripple-fx")).toBeNull();
  });

  test("multiple rapid pointerdowns stack ripples then drain", () => {
    vi.useFakeTimers();
    const { getByTestId } = render(<Host />);
    const host = getByTestId("r");
    fireEvent.pointerDown(host, { clientX: 1, clientY: 1 });
    fireEvent.pointerDown(host, { clientX: 2, clientY: 2 });
    fireEvent.pointerDown(host, { clientX: 3, clientY: 3 });
    expect(host.querySelectorAll(".rx-ripple-fx").length).toBe(3);
    vi.advanceTimersByTime(800);
    expect(host.querySelectorAll(".rx-ripple-fx").length).toBe(0);
  });

  test("prefers-reduced-motion: reduce → pointerdown does NOT inject a ripple", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(prefers-reduced-motion: reduce)",
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { getByTestId } = render(<Host />);
    const host = getByTestId("r");
    fireEvent.pointerDown(host, { clientX: 10, clientY: 10 });
    expect(host.querySelector(".rx-ripple-fx")).toBeNull();
  });

  test("unmount removes the pointerdown listener", () => {
    const { getByTestId, unmount } = render(<Host />);
    const host = getByTestId("r");
    const removeSpy = vi.spyOn(host, "removeEventListener");
    unmount();
    const removed = removeSpy.mock.calls.find((c) => c[0] === "pointerdown");
    expect(removed).toBeTruthy();
    removeSpy.mockRestore();
  });
});

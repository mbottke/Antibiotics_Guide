// @vitest-environment jsdom
/* tests · RTL — ScrollHeader condensing wrapper (Wave 7 W7-A).

   Surface verified here:
     1. Children render verbatim inside the <header>.
     2. At scrollY = 0, the `is-scrolled` class is NOT applied.
     3. Past the threshold, a scroll event flips `is-scrolled` on.
     4. `showProgress={false}` removes the bottom progress bar.
     5. Custom className composes cleanly with the base class.

   jsdom does not invoke requestAnimationFrame on its own here, so we
   stub it with an immediate callback to drive the hook's rAF coalescing
   pass synchronously. We also override `window.scrollY` via
   `Object.defineProperty` (jsdom's default getter is read-only). */

import React from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ScrollHeader } from "../../src/components/ScrollHeader.jsx";

// React 18+ act() expects this flag to be set in test environments.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let rafSpy;
let cafSpy;

beforeEach(() => {
  // Drive rAF callbacks synchronously so scroll handler updates land
  // inside the same act() pass.
  rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 1;
  });
  cafSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

  // Reset to top of page each test.
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value: 0,
  });
});

afterEach(() => {
  cleanup();
  rafSpy.mockRestore();
  cafSpy.mockRestore();
});

function setScrollY(value) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value,
  });
}

describe("ScrollHeader (RTL · jsdom)", () => {
  test("renders children verbatim inside the <header>", () => {
    render(
      <ScrollHeader>
        <span data-testid="child-a">A</span>
        <span data-testid="child-b">B</span>
      </ScrollHeader>
    );
    expect(screen.getByTestId("child-a").textContent).toBe("A");
    expect(screen.getByTestId("child-b").textContent).toBe("B");
    // Sanity check: the root is a <header>.
    expect(screen.getByTestId("child-a").closest("header")).toBeTruthy();
  });

  test("at scrollY = 0, the is-scrolled class is NOT applied", () => {
    const { container } = render(
      <ScrollHeader>
        <span>x</span>
      </ScrollHeader>
    );
    const header = container.querySelector("header");
    expect(header).toBeTruthy();
    expect(header.classList.contains("rx-scroll-header")).toBe(true);
    expect(header.classList.contains("is-scrolled")).toBe(false);
  });

  test("after firing a scroll event past threshold, is-scrolled IS applied", () => {
    const { container } = render(
      <ScrollHeader threshold={64}>
        <span>x</span>
      </ScrollHeader>
    );
    const header = container.querySelector("header");
    expect(header.classList.contains("is-scrolled")).toBe(false);

    act(() => {
      setScrollY(200);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header.classList.contains("is-scrolled")).toBe(true);
  });

  test("showProgress = false hides the progress bar", () => {
    const { container, rerender } = render(
      <ScrollHeader showProgress>
        <span>x</span>
      </ScrollHeader>
    );
    expect(container.querySelector('[data-testid="rx-scroll-progress"]')).toBeTruthy();

    rerender(
      <ScrollHeader showProgress={false}>
        <span>x</span>
      </ScrollHeader>
    );
    expect(container.querySelector('[data-testid="rx-scroll-progress"]')).toBeNull();
  });

  test("custom className composes with the base class", () => {
    const { container } = render(
      <ScrollHeader className="custom-extra">
        <span>x</span>
      </ScrollHeader>
    );
    const header = container.querySelector("header");
    expect(header.classList.contains("rx-scroll-header")).toBe(true);
    expect(header.classList.contains("custom-extra")).toBe(true);
  });
});

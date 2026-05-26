// @vitest-environment jsdom
/* tests · RTL — useScrollProgress hook (Wave 7 W7-A).

   Verifies the hook's invariants under jsdom:
     1. On mount with no scroll, returns { scrolled: false, progress: 0 }.
     2. After a scroll event past threshold, `scrolled` flips true and
        `progress` is a finite number in the [0, 1] interval. */

import React from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useScrollProgress } from "../../src/components/util/useScrollProgress.js";

// React 18+ act() expects this flag to be set in test environments.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let rafSpy;
let cafSpy;

beforeEach(() => {
  rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 1;
  });
  cafSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

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

function Probe({ threshold, onState }) {
  const state = useScrollProgress(threshold);
  onState(state);
  return null;
}

describe("useScrollProgress (RTL · jsdom)", () => {
  test("returns { scrolled: false, progress: 0 } at mount with no scroll", () => {
    let captured = null;
    render(<Probe threshold={64} onState={(s) => { captured = s; }} />);
    expect(captured).toEqual({ scrolled: false, progress: 0 });
  });

  test("scroll past threshold flips `scrolled` true; progress stays in [0, 1]", () => {
    let captured = null;
    render(<Probe threshold={64} onState={(s) => { captured = s; }} />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        writable: true,
        value: 250,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(captured.scrolled).toBe(true);
    expect(typeof captured.progress).toBe("number");
    expect(captured.progress).toBeGreaterThanOrEqual(0);
    expect(captured.progress).toBeLessThanOrEqual(1);
  });
});

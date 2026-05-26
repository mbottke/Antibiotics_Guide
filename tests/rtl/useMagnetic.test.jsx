// @vitest-environment jsdom
/* tests · RTL — useMagnetic hook (Wave 7 W7-A motion + microinteractions).

   Surface: mounting the hook attaches a document-level mousemove listener
   and an element-level mouseleave listener; unmounting cleans both up
   plus clears the inline transform.

   jsdom returns zeros from getBoundingClientRect so we deliberately do
   NOT assert the per-pixel translate math — the hook contract is the
   listener lifecycle + transform clear on cleanup. */

import React, { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useMagnetic } from "../../src/components/util/useMagnetic.js";

afterEach(() => { cleanup(); });

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

function Host({ opts }) {
  const ref = useRef(null);
  useMagnetic(ref, opts);
  return <button ref={ref} className="rx-magnetic" data-testid="m">go</button>;
}

describe("useMagnetic (RTL · jsdom)", () => {
  test("mount + unmount cleans up document mousemove listener", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Host />);
    // mousemove on document should be added on mount.
    const added = addSpy.mock.calls.find((c) => c[0] === "mousemove");
    expect(added).toBeTruthy();
    unmount();
    const removed = removeSpy.mock.calls.find((c) => c[0] === "mousemove");
    expect(removed).toBeTruthy();
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test("unmount clears the inline transform on the host", () => {
    const { getByTestId, unmount } = render(<Host />);
    const host = getByTestId("m");
    host.style.transform = "translate3d(5px, 5px, 0)";
    unmount();
    // After cleanup the inline transform is reset to "".
    expect(host.style.transform).toBe("");
  });

  test("prefers-reduced-motion: reduce → no mousemove listener attached", () => {
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
    const addSpy = vi.spyOn(document, "addEventListener");
    render(<Host />);
    const added = addSpy.mock.calls.find((c) => c[0] === "mousemove");
    expect(added).toBeFalsy();
    addSpy.mockRestore();
  });

  test("pointer: coarse → no mousemove listener attached", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(pointer: coarse)",
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const addSpy = vi.spyOn(document, "addEventListener");
    render(<Host />);
    const added = addSpy.mock.calls.find((c) => c[0] === "mousemove");
    expect(added).toBeFalsy();
    addSpy.mockRestore();
  });

  test("renders the magnetic host element", () => {
    const { getByTestId } = render(<Host opts={{ strength: 0.4, range: 100 }} />);
    const host = getByTestId("m");
    expect(host).toBeTruthy();
    expect(host.className).toContain("rx-magnetic");
  });
});

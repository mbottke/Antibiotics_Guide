// @vitest-environment jsdom
/* tests · RTL — useTilt hook (Wave 9 cursor 3D motion).

   Surface: the hook writes inline `transform`, `transformStyle` and
   `transition` on its ref host while mounted; mouseleave writes a flat
   reset transform; unmount clears the inline properties; reduced-motion
   and coarse-pointer queries both short-circuit so no listeners attach.

   jsdom returns zeros for getBoundingClientRect so we exercise the
   listener wiring + lifecycle and the documented reset behavior rather
   than per-pixel rotation math. */

import React, { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useTilt } from "../../src/components/util/useTilt.js";

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
  useTilt(ref, opts);
  return <div ref={ref} data-testid="tilt-host">tilt</div>;
}

describe("useTilt (RTL · jsdom)", () => {
  test("mount installs transform-style + transition inline on the host", () => {
    const { getByTestId } = render(<Host />);
    const host = getByTestId("tilt-host");
    expect(host.style.transformStyle).toBe("preserve-3d");
    expect(host.style.transition).toContain("transform");
  });

  test("mouseleave issues a perspective reset transform", () => {
    const { getByTestId } = render(<Host opts={{ perspective: 800 }} />);
    const host = getByTestId("tilt-host");
    // Give the bounding rect a positive size so onMove doesn't bail.
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 });
    fireEvent.mouseMove(host, { clientX: 100, clientY: 50 });
    fireEvent.mouseLeave(host);
    expect(host.style.transform).toContain("perspective(800px)");
    expect(host.style.transform).toContain("rotateX(0deg)");
    expect(host.style.transform).toContain("rotateY(0deg)");
  });

  test("mousemove writes a perspective + rotate transform", () => {
    const { getByTestId } = render(<Host opts={{ intensity: 10 }} />);
    const host = getByTestId("tilt-host");
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 });
    fireEvent.mouseMove(host, { clientX: 100, clientY: 0 });
    // cursor at top-right corner → rotateY = +5deg, rotateX = +5deg
    expect(host.style.transform).toContain("perspective(1000px)");
    expect(host.style.transform).toContain("rotateX");
    expect(host.style.transform).toContain("rotateY");
  });

  test("unmount clears transform / transformStyle / transition", () => {
    const { getByTestId, unmount } = render(<Host />);
    const host = getByTestId("tilt-host");
    host.style.transform = "perspective(1000px) rotateX(2deg) rotateY(1deg)";
    unmount();
    expect(host.style.transform).toBe("");
    expect(host.style.transformStyle).toBe("");
    expect(host.style.transition).toBe("");
  });

  test("prefers-reduced-motion: reduce → no listeners, no inline transform-style", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(prefers-reduced-motion: reduce)",
      media: q,
      onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { getByTestId } = render(<Host />);
    const host = getByTestId("tilt-host");
    expect(host.style.transformStyle).toBe("");
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 });
    fireEvent.mouseMove(host, { clientX: 50, clientY: 50 });
    expect(host.style.transform).toBe("");
  });

  test("pointer: coarse → no listeners, no inline transform-style", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(pointer: coarse)",
      media: q,
      onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { getByTestId } = render(<Host />);
    const host = getByTestId("tilt-host");
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 });
    fireEvent.mouseMove(host, { clientX: 50, clientY: 50 });
    expect(host.style.transform).toBe("");
  });

  test("enabled={false} → no listeners attached", () => {
    const { getByTestId } = render(<Host opts={{ enabled: false }} />);
    const host = getByTestId("tilt-host");
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 });
    fireEvent.mouseMove(host, { clientX: 50, clientY: 50 });
    expect(host.style.transform).toBe("");
  });

  test("zero-size bounding rect skips transform write", () => {
    const { getByTestId } = render(<Host />);
    const host = getByTestId("tilt-host");
    // Default jsdom rect is all zeros → onMove early-returns and leaves
    // the transform untouched.
    fireEvent.mouseMove(host, { clientX: 50, clientY: 50 });
    expect(host.style.transform).toBe("");
  });
});

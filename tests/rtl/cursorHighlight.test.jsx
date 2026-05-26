// @vitest-environment jsdom
/* tests · RTL — CursorHighlight wrapper + useCursorHighlight hook
   (Wave 6 W6-B aesthetic).

   Structural surface: verbatim children render, host carries
   position: relative + the CSS custom properties, custom color +
   radius props plumb through, mousemove updates --cursor-x /
   --cursor-y / --cursor-active, mouseleave drops --cursor-active
   back to 0.

   jsdom returns zeros from getBoundingClientRect, so we assert that
   the listener fires + the property is written, not the exact pixel
   value of x/y. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CursorHighlight } from "../../src/components/util/CursorHighlight.jsx";

afterEach(() => { cleanup(); });

beforeEach(() => {
  // jsdom does not implement matchMedia by default — provide a stub
  // that returns "no match" for every query so the hook installs its
  // listeners. (We override per-test for the reduced-motion case.)
  if(!window.matchMedia) {
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
  } else {
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
  }
});

describe("CursorHighlight (RTL · jsdom)", () => {
  test("renders children verbatim", () => {
    const { container } = render(
      <CursorHighlight><span>inner</span></CursorHighlight>,
    );
    expect(container.textContent).toBe("inner");
    // Inner SPAN should be present somewhere in the subtree.
    expect(container.querySelector("span")).toBeTruthy();
    expect(container.querySelector("span").textContent).toBe("inner");
  });

  test("outer host has position: relative inline style", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    expect(host.style.position).toBe("relative");
    expect(host.style.overflow).toBe("hidden");
  });

  test("outer host initializes --cursor-x / --cursor-y / --cursor-active", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-x")).toBe("50%");
    expect(host.style.getPropertyValue("--cursor-y")).toBe("50%");
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("default color and radius surface as CSS custom properties", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-color"))
      .toBe("rgba(122, 27, 30, 0.10)");
    expect(host.style.getPropertyValue("--cursor-highlight-radius"))
      .toBe("120px");
  });

  test("custom color prop sets --cursor-highlight-color", () => {
    const { container } = render(
      <CursorHighlight color="rgba(0, 128, 255, 0.20)">hi</CursorHighlight>,
    );
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-color"))
      .toBe("rgba(0, 128, 255, 0.20)");
  });

  test("custom radius prop sets --cursor-highlight-radius in px", () => {
    const { container } = render(
      <CursorHighlight radius={200}>hi</CursorHighlight>,
    );
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-radius"))
      .toBe("200px");
  });

  test("custom className is appended to the rx-cursor-highlight base", () => {
    const { container } = render(
      <CursorHighlight className="rx-card">hi</CursorHighlight>,
    );
    const host = container.firstChild;
    expect(host.className).toContain("rx-cursor-highlight");
    expect(host.className).toContain("rx-card");
  });

  test("additional HTML props pass through to the host", () => {
    const { container } = render(
      <CursorHighlight data-testid="glow" aria-label="card">hi</CursorHighlight>,
    );
    const host = container.firstChild;
    expect(host.getAttribute("data-testid")).toBe("glow");
    expect(host.getAttribute("aria-label")).toBe("card");
  });

  test("overlay is aria-hidden and has pointer-events: none", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    // First child of host is the overlay div.
    const overlay = host.children[0];
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
    expect(overlay.style.pointerEvents).toBe("none");
    expect(overlay.style.position).toBe("absolute");
  });

  test("mousemove updates --cursor-x / --cursor-y / --cursor-active", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    // Pre-mousemove sanity.
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
    fireEvent.mouseMove(host, { clientX: 42, clientY: 17 });
    // jsdom getBoundingClientRect returns zeros, so x = clientX - 0.
    expect(host.style.getPropertyValue("--cursor-x")).toBe("42px");
    expect(host.style.getPropertyValue("--cursor-y")).toBe("17px");
    expect(host.style.getPropertyValue("--cursor-active")).toBe("1");
  });

  test("mouseleave resets --cursor-active to 0", () => {
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 10, clientY: 10 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("1");
    fireEvent.mouseLeave(host);
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("prefers-reduced-motion: reduce → mousemove does NOT activate the glow", () => {
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
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 42, clientY: 17 });
    // Listener never attached → --cursor-active never flips.
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("pointer: coarse → mousemove does NOT activate the glow", () => {
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
    const { container } = render(<CursorHighlight>hi</CursorHighlight>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 42, clientY: 17 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("enabled={false} → mousemove does NOT activate the glow", () => {
    const { container } = render(
      <CursorHighlight enabled={false}>hi</CursorHighlight>,
    );
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 42, clientY: 17 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("additional style props merge with the host inline style", () => {
    const { container } = render(
      <CursorHighlight style={{ padding: 12, borderRadius: 8 }}>hi</CursorHighlight>,
    );
    const host = container.firstChild;
    expect(host.style.padding).toBe("12px");
    expect(host.style.borderRadius).toBe("8px");
    // Base props still present.
    expect(host.style.position).toBe("relative");
  });
});

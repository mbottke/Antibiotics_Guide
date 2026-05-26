// @vitest-environment jsdom
/* tests · RTL — SpotlightCard wrapper (Wave 9 cursor + 3D tilt).

   Surface: renders children verbatim, host carries the cursor CSS
   custom properties + the spotlight radial gradient overlay, variant
   prop selects the gradient color, tilt prop gates the 3D tilt hook,
   intensity scales the spotlight radius, and reduced-motion / coarse-
   pointer + enabled=false all keep the spotlight invisible. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { SpotlightCard } from "../../src/components/decor/SpotlightCard.jsx";

afterEach(() => { cleanup(); });

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("SpotlightCard (RTL · jsdom)", () => {
  test("renders children verbatim", () => {
    const { container } = render(
      <SpotlightCard><span>inner</span></SpotlightCard>
    );
    expect(container.textContent).toBe("inner");
    expect(container.querySelector("span").textContent).toBe("inner");
  });

  test("outer host has position: relative + initializes cursor vars", () => {
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.style.position).toBe("relative");
    expect(host.style.overflow).toBe("hidden");
    expect(host.style.getPropertyValue("--cursor-x")).toBe("50%");
    expect(host.style.getPropertyValue("--cursor-y")).toBe("50%");
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("default variant=cyan sets a neon-cyan tinted color", () => {
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-color"))
      .toContain("neon-cyan");
    expect(host.getAttribute("data-spotlight-variant")).toBe("cyan");
  });

  test("variant=magenta sets the hot-magenta tinted color", () => {
    const { container } = render(<SpotlightCard variant="magenta">hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-color"))
      .toContain("hot-magenta");
  });

  test("variant=lime sets the fluo-lime tinted color", () => {
    const { container } = render(<SpotlightCard variant="lime">hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.style.getPropertyValue("--cursor-highlight-color"))
      .toContain("fluo-lime");
  });

  test("intensity scales the spotlight radius", () => {
    const { container } = render(<SpotlightCard intensity={10}>hi</SpotlightCard>);
    const host = container.firstChild;
    // intensity 10 → 160 + 10*16 = 320px
    expect(host.style.getPropertyValue("--cursor-highlight-radius")).toBe("320px");
  });

  test("intensity clamps below 1 and above 10", () => {
    const { container, rerender } = render(<SpotlightCard intensity={-5}>hi</SpotlightCard>);
    let host = container.firstChild;
    // intensity clamped to 1 → 160 + 16 = 176px
    expect(host.style.getPropertyValue("--cursor-highlight-radius")).toBe("176px");
    rerender(<SpotlightCard intensity={99}>hi</SpotlightCard>);
    host = container.firstChild;
    // intensity clamped to 10 → 320px
    expect(host.style.getPropertyValue("--cursor-highlight-radius")).toBe("320px");
  });

  test("tilt={false} marks the data attribute false", () => {
    const { container } = render(<SpotlightCard tilt={false}>hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.getAttribute("data-spotlight-tilt")).toBe("false");
  });

  test("tilt={true} default marks the data attribute true", () => {
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.getAttribute("data-spotlight-tilt")).toBe("true");
  });

  test("mousemove activates the spotlight (writes --cursor-active=1)", () => {
    const { container } = render(<SpotlightCard tilt={false}>hi</SpotlightCard>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 50, clientY: 25 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("1");
    expect(host.style.getPropertyValue("--cursor-x")).toBe("50px");
    expect(host.style.getPropertyValue("--cursor-y")).toBe("25px");
  });

  test("mouseleave drops the spotlight (--cursor-active=0)", () => {
    const { container } = render(<SpotlightCard tilt={false}>hi</SpotlightCard>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 10, clientY: 10 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("1");
    fireEvent.mouseLeave(host);
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("prefers-reduced-motion: reduce keeps the spotlight off", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(prefers-reduced-motion: reduce)",
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 30, clientY: 30 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("pointer: coarse keeps the spotlight off", () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === "(pointer: coarse)",
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 30, clientY: 30 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("enabled=false keeps the spotlight off", () => {
    const { container } = render(<SpotlightCard enabled={false}>hi</SpotlightCard>);
    const host = container.firstChild;
    fireEvent.mouseMove(host, { clientX: 30, clientY: 30 });
    expect(host.style.getPropertyValue("--cursor-active")).toBe("0");
  });

  test("custom className is appended to rx-spotlight-card base", () => {
    const { container } = render(<SpotlightCard className="rx-card">hi</SpotlightCard>);
    const host = container.firstChild;
    expect(host.className).toContain("rx-spotlight-card");
    expect(host.className).toContain("rx-card");
  });

  test("style prop merges with the host inline style", () => {
    const { container } = render(
      <SpotlightCard style={{ padding: 12, borderRadius: 16 }}>hi</SpotlightCard>
    );
    const host = container.firstChild;
    expect(host.style.padding).toBe("12px");
    expect(host.style.borderRadius).toBe("16px");
    expect(host.style.position).toBe("relative");
  });

  test("overlay child is aria-hidden + pointer-events:none", () => {
    const { container } = render(<SpotlightCard>hi</SpotlightCard>);
    const host = container.firstChild;
    const overlay = host.children[0];
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
    expect(overlay.style.pointerEvents).toBe("none");
  });
});

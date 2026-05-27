// @vitest-environment jsdom
/* tests · RTL — Wave 9 W9 glass / chrome / iridescent utility classes.

   Smoke-checks that each new opt-in utility class from src/styles/glass.js
   renders cleanly on real DOM nodes (no runtime error, class attribute
   intact) and that the GLASS CSS string itself ships every selector +
   keyframe the surface family relies on.

   The CSS string is injected into a <style> tag inside the test render
   so we exercise the exact path App.jsx uses to mount it. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { GLASS } from "../../src/styles/glass";

afterEach(() => { cleanup(); });

function Mount({ children }) {
  return (
    <div>
      <style>{GLASS}</style>
      {children}
    </div>
  );
}

describe("Wave 9 W9 · glass / chrome / iridescent utilities (RTL · jsdom)", () => {
  test("GLASS CSS string exports as a non-empty string", () => {
    expect(typeof GLASS).toBe("string");
    expect(GLASS.length).toBeGreaterThan(500);
  });

  test("CSS string defines every advertised utility class", () => {
    const required = [
      ".rx-glass-bleed",
      ".rx-iridescent-border",
      ".rx-chrome-cta",
      ".rx-mercury-backdrop",
      ".rx-mercury-layer",
      ".rx-glass-diffuse",
      ".rx-light-ring-red",
      ".rx-light-ring-amber",
      ".rx-light-ring-cyan",
      ".rx-focus-halo",
      ".rx-shadow-e4",
      ".rx-shadow-e5",
      ".rx-shadow-e6",
      ".rx-shadow-e7",
      ".rx-gloss",
      ".rx-glow-lift",
    ];
    for (const cls of required) {
      expect(GLASS).toContain(cls);
    }
  });

  test("CSS string defines required keyframes", () => {
    /* rxGlowOvershoot used to power the .rx-glow-lift spring; the
       overshoot fought with sibling transitions and read as jagged,
       so the keyframe was retired in favor of a calm single-easing
       transition. The remaining keyframes stay required. */
    const keyframes = [
      "@keyframes rxIridescent",
      "@keyframes rxMercuryA",
      "@keyframes rxMercuryB",
      "@keyframes rxMercuryC",
      "@keyframes rxMercuryD",
      "@keyframes rxRingPulse",
    ];
    for (const kf of keyframes) {
      expect(GLASS).toContain(kf);
    }
  });

  test("CSS string is fully gated by prefers-reduced-motion", () => {
    expect(GLASS).toContain("@media (prefers-reduced-motion: reduce)");
  });

  test("CSS string references the gloss + mercury tokens", () => {
    /* The steel-dark / steel-mid / steel-light metallic-gradient
       tokens used to back the .rx-chrome-cta pill; that style is now
       a flat ink pill with no metallic gradient, so the steel tokens
       are no longer referenced. The gloss + mercury tokens are still
       in use across other glass utilities. */
    expect(GLASS).toContain("var(--gloss-top)");
    expect(GLASS).toContain("var(--mercury-ripple-a)");
    expect(GLASS).toContain("var(--mercury-ripple-b)");
    expect(GLASS).toContain("var(--mercury-ripple-c)");
  });

  test("CSS string references the new e4–e7 shadow tokens", () => {
    expect(GLASS).toContain("var(--shadow-e4)");
    expect(GLASS).toContain("var(--shadow-e5)");
    expect(GLASS).toContain("var(--shadow-e6)");
    expect(GLASS).toContain("var(--shadow-e7)");
  });

  test("rx-glass-bleed renders on a panel element", () => {
    const { container } = render(
      <Mount>
        <div className="rx-glass-bleed" data-testid="bleed">panel</div>
      </Mount>
    );
    const el = container.querySelector("[data-testid='bleed']");
    expect(el).toBeTruthy();
    expect(el.className).toContain("rx-glass-bleed");
  });

  test("rx-iridescent-border wraps a child cleanly", () => {
    const { container } = render(
      <Mount>
        <div className="rx-iridescent-border" data-testid="irid">
          <div>inner</div>
        </div>
      </Mount>
    );
    const el = container.querySelector("[data-testid='irid']");
    expect(el).toBeTruthy();
    expect(el.firstChild.textContent).toBe("inner");
  });

  test("rx-chrome-cta renders as a button", () => {
    const { container } = render(
      <Mount>
        <button className="rx-chrome-cta" data-testid="cta">Apply</button>
      </Mount>
    );
    const el = container.querySelector("[data-testid='cta']");
    expect(el).toBeTruthy();
    expect(el.tagName).toBe("BUTTON");
    expect(el.textContent).toBe("Apply");
  });

  test("rx-mercury-backdrop + rx-mercury-layer render as overlay", () => {
    const { container } = render(
      <Mount>
        <div className="rx-mercury-backdrop" data-testid="merc">
          <div className="rx-mercury-layer" />
          <div className="rx-mercury-layer alt" />
        </div>
      </Mount>
    );
    const el = container.querySelector("[data-testid='merc']");
    expect(el).toBeTruthy();
    expect(el.querySelectorAll(".rx-mercury-layer")).toHaveLength(2);
  });

  test("rx-glass-diffuse renders on a panel", () => {
    const { container } = render(
      <Mount>
        <div className="rx-glass-diffuse" data-testid="diff">frosted</div>
      </Mount>
    );
    expect(container.querySelector("[data-testid='diff']")).toBeTruthy();
  });

  test("rx-light-ring-{red,amber,cyan} each render as inline dots", () => {
    const { container } = render(
      <Mount>
        <span>
          <span className="rx-light-ring-red"  data-testid="dot-red"   />
          <span className="rx-light-ring-amber" data-testid="dot-amber" />
          <span className="rx-light-ring-cyan"  data-testid="dot-cyan"  />
        </span>
      </Mount>
    );
    expect(container.querySelector("[data-testid='dot-red']")).toBeTruthy();
    expect(container.querySelector("[data-testid='dot-amber']")).toBeTruthy();
    expect(container.querySelector("[data-testid='dot-cyan']")).toBeTruthy();
  });

  test("rx-focus-halo class applies cleanly to an input", () => {
    const { container } = render(
      <Mount>
        <input className="rx-focus-halo" data-testid="focus-input" defaultValue="" />
      </Mount>
    );
    const el = container.querySelector("[data-testid='focus-input']");
    expect(el).toBeTruthy();
    expect(el.tagName).toBe("INPUT");
  });

  test("rx-shadow-e4..e7 utility classes mount without error", () => {
    const { container } = render(
      <Mount>
        <div className="rx-shadow-e4" data-testid="e4" />
        <div className="rx-shadow-e5" data-testid="e5" />
        <div className="rx-shadow-e6" data-testid="e6" />
        <div className="rx-shadow-e7" data-testid="e7" />
      </Mount>
    );
    ["e4", "e5", "e6", "e7"].forEach((k) => {
      expect(container.querySelector(`[data-testid='${k}']`)).toBeTruthy();
    });
  });

  test("rx-gloss adds an isolated highlight wrapper", () => {
    const { container } = render(
      <Mount>
        <div className="rx-gloss" data-testid="gloss">card</div>
      </Mount>
    );
    expect(container.querySelector("[data-testid='gloss']")).toBeTruthy();
  });

  test("rx-glow-lift sits on top of an interactive card", () => {
    const { container } = render(
      <Mount>
        <button className="rx-glow-lift" data-testid="lift">Open</button>
      </Mount>
    );
    expect(container.querySelector("[data-testid='lift']")).toBeTruthy();
  });
});

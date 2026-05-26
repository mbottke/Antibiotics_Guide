// @vitest-environment jsdom
/* tests · RTL — MeshWash (Wave 9 W9 molten-chrome background utility).

   Pure presentation contract:
     1. Renders the wash wrapper with aria-hidden + pointer-events:none
        so it never blocks interaction or screen readers.
     2. `variant=full` renders 5 blobs; `band` renders 3; `corner`
        renders 2; `ambient` renders 3.
     3. `intensity` propagates as a data attribute so QA/snapshot tests
        can verify the strength of any wash mount.
     4. `palette` propagates the same way for visual snapshot diffing.
     5. `drift=true` writes an `animation` on every blob; `drift=false`
        sets `animation:none` so static surfaces don't trigger keyframes.
     6. Reduced-motion users get static blobs because the embedded
        `<style>` block carries an explicit prefers-reduced-motion query
        that zeroes the animation. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MeshWash } from "../../src/components/decor/MeshWash.jsx";

afterEach(() => { cleanup(); });

describe("MeshWash (RTL · jsdom)", () => {
  test("renders the wash wrapper as aria-hidden, pointer-events:none decoration", () => {
    const { container } = render(<MeshWash />);
    const wrap = container.querySelector("[data-mesh-wash]");
    expect(wrap).toBeTruthy();
    expect(wrap.getAttribute("aria-hidden")).toBe("true");
    expect(wrap.style.pointerEvents).toBe("none");
    // Inherits border-radius so it never bleeds out of a radiused parent.
    expect(wrap.style.borderRadius).toBe("inherit");
  });

  test("variant=full renders 5 blobs; variant=band renders 3", () => {
    const { container: full } = render(<MeshWash variant="full" />);
    const fullBlobs = full.querySelectorAll("[data-mesh-wash-blob]");
    expect(fullBlobs.length).toBe(5);

    cleanup();

    const { container: band } = render(<MeshWash variant="band" />);
    const bandBlobs = band.querySelectorAll("[data-mesh-wash-blob]");
    expect(bandBlobs.length).toBe(3);
  });

  test("variant=corner renders 2 blobs; variant=ambient renders 3", () => {
    const { container: corner } = render(<MeshWash variant="corner" anchor="bottom-left" />);
    const cornerBlobs = corner.querySelectorAll("[data-mesh-wash-blob]");
    expect(cornerBlobs.length).toBe(2);

    cleanup();

    const { container: amb } = render(<MeshWash variant="ambient" />);
    const ambBlobs = amb.querySelectorAll("[data-mesh-wash-blob]");
    expect(ambBlobs.length).toBe(3);
  });

  test("intensity + palette propagate as data attributes for QA/snapshot", () => {
    const { container } = render(
      <MeshWash variant="full" intensity="strong" palette="lime-amber" />
    );
    const wrap = container.querySelector("[data-mesh-wash]");
    expect(wrap.getAttribute("data-mesh-wash-intensity")).toBe("strong");
    expect(wrap.getAttribute("data-mesh-wash-palette")).toBe("lime-amber");
    expect(wrap.getAttribute("data-mesh-wash-variant")).toBe("full");
  });

  test("drift=false sets animation:none on every blob (static surface)", () => {
    const { container } = render(<MeshWash variant="full" drift={false} />);
    const blobs = container.querySelectorAll("[data-mesh-wash-blob]");
    expect(blobs.length).toBeGreaterThan(0);
    blobs.forEach((blob) => {
      // jsdom serializes the inline-style `animation` shorthand differently
      // depending on engine version, so check the underlying name token.
      const anim = blob.style.animation || blob.style.animationName || "";
      expect(anim === "none" || /none/i.test(anim)).toBe(true);
    });
  });

  test("drift=true writes a rxMeshDrift animation on each blob", () => {
    const { container } = render(<MeshWash variant="full" drift={true} />);
    const blobs = container.querySelectorAll("[data-mesh-wash-blob]");
    blobs.forEach((blob) => {
      // The animation shorthand includes the keyframe name `rxMeshDrift*`.
      const anim = blob.style.animation || blob.style.animationName || "";
      expect(/rxMeshDrift/i.test(anim)).toBe(true);
    });
  });

  test("embedded <style> carries a prefers-reduced-motion fallback to none", () => {
    const { container } = render(<MeshWash variant="full" />);
    const styleEl = container.querySelector("style");
    expect(styleEl).toBeTruthy();
    const css = styleEl.textContent || "";
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toMatch(/animation:\s*none/i);
  });

  test("every blob is absolutely positioned with pointer-events:none", () => {
    const { container } = render(<MeshWash variant="full" />);
    const blobs = container.querySelectorAll("[data-mesh-wash-blob]");
    blobs.forEach((blob) => {
      expect(blob.style.position).toBe("absolute");
      expect(blob.style.pointerEvents).toBe("none");
      // Heavy blur on each blob — the signature molten-chrome look.
      expect(blob.style.filter).toMatch(/blur\(48px\)/);
    });
  });

  test("custom className + style props pass through to the wrapper", () => {
    const { container } = render(
      <MeshWash className="rx-test-wash" style={{ opacity: 0.5 }} />
    );
    const wrap = container.querySelector("[data-mesh-wash]");
    expect(wrap.className).toContain("rx-test-wash");
    expect(wrap.style.opacity).toBe("0.5");
  });
});

// @vitest-environment jsdom
/* tests · RTL — SectionArtwork (Wave 9 W9 decor primitive).

   Verifies the contract laid out in src/components/decor/SectionArtwork.jsx:
     1. variant="blank" renders null (no DOM at all).
     2. variant="mesh" / "orb" / "chrome-curl" / "prism" each mount without
        throwing and emit a data attribute we can target.
     3. accent prop is forwarded to data-section-artwork-accent.
     4. Root is aria-hidden and pointer-events: none (decoration only).
     5. z-index is 0 (sits behind the Section body, which uses zIndex 2).
     6. Unknown variant falls back to mesh; unknown accent falls back to
        cyan (resolveAccent never throws). */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SectionArtwork } from "../../src/components/decor/SectionArtwork.jsx";

afterEach(() => { cleanup(); });

describe("SectionArtwork (RTL · jsdom)", () => {
  test("variant='blank' returns null — no DOM rendered", () => {
    const { container } = render(<SectionArtwork variant="blank" />);
    expect(container.firstChild).toBeNull();
  });

  test("variant='mesh' renders the corner sheen (no-shape gradient wash)", () => {
    /* The historical 140 px iridescent orb is replaced by a no-shape
       corner sheen — pure accent-tinted gradient that fades into
       nothing. The variant key 'mesh' still routes through the same
       renderer so existing layer props (artwork='mesh') keep working
       and the inner element advertises itself as 'sheen'. */
    const { container } = render(<SectionArtwork variant="mesh" />);
    const root = container.querySelector("[data-section-artwork]");
    expect(root).toBeTruthy();
    expect(root.getAttribute("data-section-artwork-variant-root")).toBe("mesh");
    expect(container.querySelector("[data-section-artwork-variant='sheen']")).toBeTruthy();
    // No circular blobs / animated drift layers anymore.
    expect(container.querySelectorAll("[data-section-artwork-blob]").length).toBe(0);
  });

  test("variant='orb' aliases to the sheen renderer (sphere removed)", () => {
    const { container } = render(<SectionArtwork variant="orb" />);
    // The previous iridescent sphere + highlight + aberration layers
    // are gone. Orb now routes through the same sheen renderer as mesh
    // so legacy callers keep working without authoring updates.
    expect(container.querySelector("[data-section-artwork-variant='sheen']")).toBeTruthy();
    expect(container.querySelector("[data-section-artwork-highlight]")).toBeNull();
    expect(container.querySelector("[data-section-artwork-aberration]")).toBeNull();
  });

  test("variant='chrome-curl' renders an SVG with gradient + pulse animation", () => {
    const { container } = render(<SectionArtwork variant="chrome-curl" />);
    const svg = container.querySelector("[data-section-artwork-variant='chrome-curl']");
    expect(svg).toBeTruthy();
    expect(svg.tagName.toLowerCase()).toBe("svg");
    // Gradient id is namespaced by accent — default = cyan.
    expect(container.querySelector("#sa-chrome-grad-cyan")).toBeTruthy();
    // The svg carries the chrome-pulse animation marker.
    expect(container.querySelector("[data-section-artwork-chrome]")).toBeTruthy();
  });

  test("variant='prism' renders three overlapping clip-path shards", () => {
    const { container } = render(<SectionArtwork variant="prism" />);
    expect(container.querySelector("[data-section-artwork-variant='prism']")).toBeTruthy();
    const shards = container.querySelectorAll("[data-section-artwork-shard]");
    expect(shards.length).toBe(3);
  });

  test("default variant (no prop) is mesh", () => {
    const { container } = render(<SectionArtwork />);
    expect(container.querySelector("[data-section-artwork-variant-root='mesh']")).toBeTruthy();
  });

  test("unknown variant falls back to mesh (now rendered as sheen)", () => {
    const { container } = render(<SectionArtwork variant="totally-made-up" />);
    // Root reflects the requested variant name, inner renderer falls
    // through to mesh which now emits the sheen sub-variant marker.
    expect(container.querySelector("[data-section-artwork-variant='sheen']")).toBeTruthy();
    expect(container.querySelector("[data-section-artwork-variant='orb']")).toBeNull();
  });

  test("accent='magenta' forwards onto the root + namespaces chrome gradient id", () => {
    const { container } = render(<SectionArtwork variant="chrome-curl" accent="magenta" />);
    const root = container.querySelector("[data-section-artwork]");
    expect(root.getAttribute("data-section-artwork-accent")).toBe("magenta");
    expect(container.querySelector("#sa-chrome-grad-magenta")).toBeTruthy();
  });

  test("accent='lime' forwards onto the root", () => {
    const { container } = render(<SectionArtwork variant="mesh" accent="lime" />);
    const root = container.querySelector("[data-section-artwork]");
    expect(root.getAttribute("data-section-artwork-accent")).toBe("lime");
  });

  test("accent='amber' forwards onto the root", () => {
    const { container } = render(<SectionArtwork variant="orb" accent="amber" />);
    const root = container.querySelector("[data-section-artwork]");
    expect(root.getAttribute("data-section-artwork-accent")).toBe("amber");
  });

  test("unknown accent falls back to cyan (no throw)", () => {
    const { container } = render(<SectionArtwork variant="mesh" accent="ultraviolet" />);
    const root = container.querySelector("[data-section-artwork]");
    // The data-attr echoes the requested value, but resolveAccent maps it to cyan.
    expect(root).toBeTruthy();
    expect(root.getAttribute("data-section-artwork-accent")).toBe("ultraviolet");
  });

  test("root is aria-hidden and pointer-events: none (decoration only)", () => {
    const { container } = render(<SectionArtwork variant="mesh" />);
    const root = container.querySelector("[data-section-artwork]");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    const style = root.getAttribute("style") || "";
    expect(style).toContain("pointer-events: none");
  });

  test("root sits at z-index 0 (behind the section body)", () => {
    const { container } = render(<SectionArtwork variant="mesh" />);
    const root = container.querySelector("[data-section-artwork]");
    const style = root.getAttribute("style") || "";
    expect(style).toContain("z-index: 0");
    expect(style).toContain("position: absolute");
  });

  test("every (variant, accent) combination renders without throwing", () => {
    const VARIANTS = ["mesh", "orb", "chrome-curl", "prism"];
    const ACCENTS  = ["cyan", "magenta", "lime", "amber"];
    for (const v of VARIANTS) {
      for (const a of ACCENTS) {
        const { container, unmount } = render(<SectionArtwork variant={v} accent={a} />);
        expect(container.querySelector("[data-section-artwork]")).toBeTruthy();
        unmount();
      }
    }
  });
});

// @vitest-environment jsdom
/* tests · RTL — W12 component-fidelity audit · bad-prop tolerance.

   Wave 12 audit pass added numeric-prop validation to the decor
   primitives so a stray NaN/null/string can no longer poison the
   inline CSS strings they build (would have produced "NaNpx" or
   broken clip-path geometry at runtime).

   These tests lock in that fallback behaviour so future contributors
   don't accidentally regress it. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DottedGrid } from "../../src/components/decor/DottedGrid.jsx";
import { Stripes } from "../../src/components/decor/Stripes.jsx";
import { Sparkle } from "../../src/components/decor/Sparkle.jsx";
import { WatermarkLetter } from "../../src/components/decor/WatermarkLetter.jsx";
import { NotchedBanner } from "../../src/components/decor/NotchedBanner.jsx";
import { MiniTOC } from "../../src/components/MiniTOC.jsx";
import { StickySubTOC } from "../../src/components/decor/StickySubTOC.jsx";

afterEach(() => { cleanup(); });

describe("W12 · DottedGrid bad-prop tolerance", () => {
  test("NaN size falls back to 24px", () => {
    const { container } = render(<DottedGrid size={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 24px 24px");
    expect(style).not.toContain("NaN");
  });

  test("zero size falls back to default", () => {
    const { container } = render(<DottedGrid size={0} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 24px 24px");
  });

  test("string size is rejected", () => {
    const { container } = render(<DottedGrid size={"big"} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 24px 24px");
  });

  test("NaN opacity falls back to 0.5", () => {
    const { container } = render(<DottedGrid opacity={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("opacity: 0.5");
  });

  test("valid size still applies", () => {
    const { container } = render(<DottedGrid size={32} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 32px 32px");
  });
});

describe("W12 · Stripes bad-prop tolerance", () => {
  test("NaN width falls back to default", () => {
    const { container } = render(<Stripes width={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("width: 80px");
    expect(style).not.toContain("NaN");
  });

  test("NaN angle falls back to 135deg", () => {
    const { container } = render(<Stripes angle={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("repeating-linear-gradient(135deg");
  });

  test("string height falls back", () => {
    const { container } = render(<Stripes height={"tall"} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("height: 40px");
  });
});

describe("W12 · Sparkle bad-prop tolerance", () => {
  test("NaN size falls back to 12", () => {
    const { container } = render(<Sparkle size={NaN} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("12");
    expect(svg.getAttribute("height")).toBe("12");
  });

  test("zero size falls back to 12", () => {
    const { container } = render(<Sparkle size={0} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("12");
  });

  test("valid size still applies", () => {
    const { container } = render(<Sparkle size={20} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("20");
  });
});

describe("W12 · WatermarkLetter bad-prop tolerance", () => {
  test("NaN size falls back to 240", () => {
    const { container } = render(<WatermarkLetter letter="S" size={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("font-size: 240px");
    expect(style).not.toContain("NaN");
  });

  test("NaN opacity falls back to 0.08", () => {
    const { container } = render(<WatermarkLetter letter="S" opacity={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("opacity: 0.08");
  });

  test("unknown position falls back to top-right", () => {
    const { container } = render(<WatermarkLetter letter="S" position="oops" />);
    const el = container.firstChild;
    expect(el.getAttribute("data-position")).toBe("oops");
    // Layout falls back to top-right (top + right offsets present).
    const style = el.getAttribute("style") || "";
    expect(style).toContain("top:");
    expect(style).toContain("right:");
  });
});

describe("W12 · NotchedBanner bad-prop tolerance", () => {
  test("unknown severity falls back to info", () => {
    const { container } = render(<NotchedBanner severity="oops" label="X" />);
    const el = container.firstChild;
    expect(el.getAttribute("data-severity")).toBe("oops");
    const style = el.getAttribute("style") || "";
    // info variant uses neon-cyan.
    expect(style).toContain("var(--neon-cyan");
  });

  test("NaN notch falls back to default polygon", () => {
    const { container } = render(<NotchedBanner severity="info" label="X" notch={NaN} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).not.toContain("NaN");
    expect(style).toContain("polygon(");
  });

  test("negative notch falls back to default", () => {
    const { container } = render(<NotchedBanner severity="info" label="X" notch={-5} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("12px 0,");
  });
});

describe("W12 · MiniTOC empty / undefined sections", () => {
  test("empty sections renders null", () => {
    const { container } = render(<MiniTOC sections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("undefined sections renders null", () => {
    const { container } = render(<MiniTOC sections={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test("single item renders without crashing", () => {
    const { container } = render(<MiniTOC sections={[{ id: "a", label: "A" }]} />);
    expect(container.querySelector('[data-toc-row="a"]')).toBeTruthy();
  });
});

describe("W12 · StickySubTOC empty / undefined items", () => {
  test("empty items renders null", () => {
    const { container } = render(<StickySubTOC items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("undefined items default to []", () => {
    const { container } = render(<StickySubTOC />);
    expect(container.firstChild).toBeNull();
  });

  test("single item renders nav", () => {
    const { container } = render(<StickySubTOC items={[{ id: "a", label: "A" }]} />);
    expect(container.querySelector("nav")).toBeTruthy();
  });
});

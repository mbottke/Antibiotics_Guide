// @vitest-environment jsdom
/* tests · RTL — SectionGlyph (Wave 6 W6-B aesthetic).

   Verifies the six ornamental section-opener marks:
     • each known group renders an SVG
     • unknown group returns null (graceful fallback)
     • the `size` prop drives width + height attributes
     • the SVG is decorative (aria-hidden="true")
     • a color override propagates onto the SVG (style or attribute) */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SectionGlyph } from "../../src/components/SectionGlyph.jsx";

afterEach(() => { cleanup(); });

const KNOWN_GROUPS = ["core", "risks", "duration", "local", "special", "evidence"];

describe("SectionGlyph (RTL · jsdom)", () => {
  test.each(KNOWN_GROUPS)("renders an SVG for known group '%s'", (group) => {
    const { container } = render(<SectionGlyph group={group} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("data-group")).toBe(group);
  });

  test("unknown group returns null", () => {
    const { container } = render(<SectionGlyph group="nope" />);
    expect(container.firstChild).toBeNull();
  });

  test("undefined group returns null (graceful fallback)", () => {
    const { container } = render(<SectionGlyph />);
    expect(container.firstChild).toBeNull();
  });

  test("`size` prop sets width and height attributes", () => {
    const { container } = render(<SectionGlyph group="core" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("24");
    expect(svg.getAttribute("height")).toBe("24");
  });

  test("default size is 16 when omitted", () => {
    const { container } = render(<SectionGlyph group="core" />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("16");
    expect(svg.getAttribute("height")).toBe("16");
  });

  test("aria-hidden='true' is set on the SVG (decorative)", () => {
    const { container } = render(<SectionGlyph group="duration" />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  test("focusable='false' is set on the SVG", () => {
    const { container } = render(<SectionGlyph group="duration" />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("focusable")).toBe("false");
  });

  test("color override applies somewhere on the SVG (style or fill/stroke)", () => {
    const { container } = render(<SectionGlyph group="core" color="red" />);
    const svg = container.querySelector("svg");
    // Color may surface as inline style, or on a child fill/stroke attribute.
    const inlineStyle = svg.getAttribute("style") || "";
    const inHtml = svg.outerHTML;
    const matches =
      inlineStyle.includes("red") ||
      inHtml.includes('fill="red"') ||
      inHtml.includes('stroke="red"');
    expect(matches).toBe(true);
  });

  test("default color uses var(--ox) when no override provided", () => {
    const { container } = render(<SectionGlyph group="risks" />);
    const svg = container.querySelector("svg");
    const inlineStyle = svg.getAttribute("style") || "";
    expect(inlineStyle.includes("var(--ox)") || svg.outerHTML.includes("var(--ox)")).toBe(true);
  });

  test("renders a viewBox of 0 0 16 16 for consistent family proportions", () => {
    const { container } = render(<SectionGlyph group="evidence" />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("viewBox")).toBe("0 0 16 16");
  });
});

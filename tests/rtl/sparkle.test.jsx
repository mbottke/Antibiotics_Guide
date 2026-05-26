// @vitest-environment jsdom
/* tests · RTL — Sparkle (Wave 7 W7-A decor).

   Verifies: SVG renders with 0 0 24 24 viewBox, default + custom size
   drive width/height attributes, fill colour passes through, and the
   element stays out of the accessibility tree. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Sparkle } from "../../src/components/decor/Sparkle.jsx";

afterEach(() => { cleanup(); });

describe("Sparkle (RTL · jsdom)", () => {
  test("renders an SVG with the canonical 0 0 24 24 viewBox", () => {
    const { container } = render(<Sparkle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  test("default size is 12 (width + height attributes)", () => {
    const { container } = render(<Sparkle />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("12");
    expect(svg.getAttribute("height")).toBe("12");
  });

  test("size prop drives width + height", () => {
    const { container } = render(<Sparkle size={24} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("24");
    expect(svg.getAttribute("height")).toBe("24");
  });

  test("is decorative (aria-hidden=true, focusable=false)", () => {
    const { container } = render(<Sparkle />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
  });

  test("default color uses var(--neon-cyan, var(--ox)) fill", () => {
    const { container } = render(<Sparkle />);
    const path = container.querySelector("path");
    expect(path).toBeTruthy();
    expect(path.getAttribute("fill")).toContain("var(--neon-cyan");
  });

  test("color prop applies to the path fill", () => {
    const { container } = render(<Sparkle color="red" />);
    const path = container.querySelector("path");
    expect(path.getAttribute("fill")).toBe("red");
  });

  test("renders a single closed path (the 4-point sparkle)", () => {
    const { container } = render(<Sparkle />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(1);
    const d = paths[0].getAttribute("d") || "";
    expect(d).toContain("Z");
    expect(d).toContain("M12 2");
  });
});

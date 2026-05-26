// @vitest-environment jsdom
/* tests · RTL — DottedGrid (Wave 7 W7-A decor).

   Verifies: aria-hidden + pointer-events on the decorative backdrop,
   that the `size` prop drives backgroundSize, that the `color` prop
   threads into the radial-gradient, and that `opacity` applies. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DottedGrid } from "../../src/components/decor/DottedGrid.jsx";

afterEach(() => { cleanup(); });

describe("DottedGrid (RTL · jsdom)", () => {
  test("renders an aria-hidden decorative div", () => {
    const { container } = render(<DottedGrid />);
    const el = container.firstChild;
    expect(el).toBeTruthy();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  test("is pointer-events: none and absolutely positioned inset 0", () => {
    const { container } = render(<DottedGrid />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("pointer-events: none");
    expect(style).toContain("position: absolute");
    expect(style).toContain("inset: 0");
  });

  test("default size 24 produces backgroundSize 24px 24px", () => {
    const { container } = render(<DottedGrid />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 24px 24px");
  });

  test("size prop drives backgroundSize", () => {
    const { container } = render(<DottedGrid size={40} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("background-size: 40px 40px");
  });

  test("color prop appears inside the radial-gradient declaration", () => {
    const { container } = render(<DottedGrid color="rgb(0, 200, 255)" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("radial-gradient");
    expect(style).toContain("rgb(0, 200, 255)");
  });

  test("default color uses var(--line)", () => {
    const { container } = render(<DottedGrid />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--line)");
  });

  test("opacity prop applies", () => {
    const { container } = render(<DottedGrid opacity={0.2} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("opacity: 0.2");
  });
});

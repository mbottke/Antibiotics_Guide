// @vitest-environment jsdom
/* tests · RTL — Stripes (Wave 7 W7-A decor).

   Verifies: aria-hidden, dimensions, that each variant injects the
   correct accent token into the repeating-linear-gradient, and that
   the angle prop is reflected in the gradient declaration. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Stripes } from "../../src/components/decor/Stripes.jsx";

afterEach(() => { cleanup(); });

describe("Stripes (RTL · jsdom)", () => {
  test("renders an aria-hidden decorative div", () => {
    const { container } = render(<Stripes />);
    const el = container.firstChild;
    expect(el).toBeTruthy();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  test("default variant is cyan and uses var(--neon-cyan)", () => {
    const { container } = render(<Stripes />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--neon-cyan");
    expect(container.firstChild.getAttribute("data-variant")).toBe("cyan");
  });

  test("variant=magenta uses var(--hot-magenta)", () => {
    const { container } = render(<Stripes variant="magenta" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--hot-magenta");
  });

  test("variant=lime uses var(--electric-lime)", () => {
    const { container } = render(<Stripes variant="lime" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--electric-lime");
  });

  test("variant=neutral uses var(--line)", () => {
    const { container } = render(<Stripes variant="neutral" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--line)");
  });

  test("default dimensions are 80x40", () => {
    const { container } = render(<Stripes />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("width: 80px");
    expect(style).toContain("height: 40px");
  });

  test("width / height props apply", () => {
    const { container } = render(<Stripes width={120} height={24} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("width: 120px");
    expect(style).toContain("height: 24px");
  });

  test("angle prop appears in the repeating-linear-gradient", () => {
    const { container } = render(<Stripes angle={45} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("repeating-linear-gradient(45deg");
  });

  test("default angle is 135deg", () => {
    const { container } = render(<Stripes />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("repeating-linear-gradient(135deg");
  });

  test("unknown variant falls back to cyan", () => {
    const { container } = render(<Stripes variant="nope" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--neon-cyan");
  });
});

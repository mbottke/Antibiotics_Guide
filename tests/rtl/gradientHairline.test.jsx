// @vitest-environment jsdom
/* tests · RTL — GradientHairline (Wave 7 W7-A decor).

   Verifies: default + variant background gradients, the optional dot,
   the decorative aria-hidden contract, and pass-through styling. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { GradientHairline } from "../../src/components/decor/GradientHairline.jsx";

afterEach(() => { cleanup(); });

describe("GradientHairline (RTL · jsdom)", () => {
  test("renders a separator role with aria-hidden", () => {
    const { container } = render(<GradientHairline />);
    const el = container.firstChild;
    expect(el).toBeTruthy();
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  test("default variant uses the neutral --line gradient", () => {
    const { container } = render(<GradientHairline />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--line)");
    expect(container.firstChild.getAttribute("data-variant")).toBe("default");
  });

  test("cyan-blue variant applies neon-cyan + electric-blue stops", () => {
    const { container } = render(<GradientHairline variant="cyan-blue" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--neon-cyan");
    expect(style).toContain("var(--electric-blue");
  });

  test("blue-magenta variant applies electric-blue + hot-magenta stops", () => {
    const { container } = render(<GradientHairline variant="blue-magenta" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--electric-blue");
    expect(style).toContain("var(--hot-magenta");
  });

  test("magenta-lime variant applies hot-magenta + electric-lime stops", () => {
    const { container } = render(<GradientHairline variant="magenta-lime" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--hot-magenta");
    expect(style).toContain("var(--electric-lime");
  });

  test("withDot=false (default) renders no dot", () => {
    const { container } = render(<GradientHairline />);
    expect(container.querySelector("[data-testid='gradient-hairline-dot']")).toBeNull();
  });

  test("withDot=true renders the dot child", () => {
    const { container } = render(<GradientHairline withDot />);
    const dot = container.querySelector("[data-testid='gradient-hairline-dot']");
    expect(dot).toBeTruthy();
    const style = dot.getAttribute("style") || "";
    expect(style).toContain("border-radius: 50%");
  });

  test("style prop passes through and can override margin", () => {
    const { container } = render(<GradientHairline style={{ margin: "32px 0" }} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("32px 0");
  });

  test("unknown variant falls back to the default gradient", () => {
    const { container } = render(<GradientHairline variant="nope" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--line)");
  });
});

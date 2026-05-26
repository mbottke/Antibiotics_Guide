// @vitest-environment jsdom
/* tests · RTL — WatermarkLetter (Wave 7 W7-A decor).

   Verifies: the letter prop renders as text, the position prop maps
   to the documented CSS coordinate pair, default size/opacity apply,
   colour passes through, and the element is decorative + un-selectable. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WatermarkLetter } from "../../src/components/decor/WatermarkLetter.jsx";

afterEach(() => { cleanup(); });

describe("WatermarkLetter (RTL · jsdom)", () => {
  test("renders the letter prop as text content", () => {
    render(<WatermarkLetter letter="S" />);
    expect(screen.getByText("S")).toBeTruthy();
  });

  test("is decorative (aria-hidden + pointer-events none + user-select none)", () => {
    const { container } = render(<WatermarkLetter letter="A" />);
    const el = container.firstChild;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    const style = el.getAttribute("style") || "";
    expect(style).toContain("pointer-events: none");
    expect(style).toContain("user-select: none");
  });

  test("default position top-right applies top + right coords", () => {
    const { container } = render(<WatermarkLetter letter="X" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("right: -16px");
    expect(container.firstChild.getAttribute("data-position")).toBe("top-right");
  });

  test("position=top-left applies top + left coords", () => {
    const { container } = render(<WatermarkLetter letter="X" position="top-left" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -16px");
  });

  test("position=bottom-right applies bottom + right coords", () => {
    const { container } = render(<WatermarkLetter letter="X" position="bottom-right" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("bottom: -32px");
    expect(style).toContain("right: -16px");
  });

  test("position=bottom-left applies bottom + left coords", () => {
    const { container } = render(<WatermarkLetter letter="X" position="bottom-left" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("bottom: -32px");
    expect(style).toContain("left: -16px");
  });

  test("default size 240 and opacity 0.08 apply", () => {
    const { container } = render(<WatermarkLetter letter="S" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("font-size: 240px");
    expect(style).toContain("opacity: 0.08");
  });

  test("size / opacity / color props override defaults", () => {
    const { container } = render(
      <WatermarkLetter letter="R" size={320} opacity={0.15} color="rgb(10, 20, 30)" />
    );
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("font-size: 320px");
    expect(style).toContain("opacity: 0.15");
    expect(style).toContain("rgb(10, 20, 30)");
  });

  test("uses the serif typography token", () => {
    const { container } = render(<WatermarkLetter letter="E" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--serif)");
    expect(style).toContain("font-style: italic");
  });

  test("unknown position falls back to top-right", () => {
    const { container } = render(<WatermarkLetter letter="X" position="nope" />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("right: -16px");
  });
});

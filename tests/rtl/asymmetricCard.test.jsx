// @vitest-environment jsdom
/* tests · RTL — AsymmetricCard (Wave 7 W7-A decor).

   Verifies that each `pattern` prop value maps to the documented
   border-radius string, that the elevation prop drives the shadow
   token, that children render, and that consumer style overrides
   pass through. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AsymmetricCard } from "../../src/components/decor/AsymmetricCard.jsx";

afterEach(() => { cleanup(); });

describe("AsymmetricCard (RTL · jsdom)", () => {
  test("renders children", () => {
    render(<AsymmetricCard><span>Inside</span></AsymmetricCard>);
    expect(screen.getByText("Inside")).toBeTruthy();
  });

  test("default pattern tl-br produces 4px / 16px alternating corners", () => {
    const { container } = render(<AsymmetricCard>x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("border-radius: 4px 16px 4px 16px");
    expect(container.firstChild.getAttribute("data-pattern")).toBe("tl-br");
  });

  test("pattern=tr-bl produces the mirror corners 16/4/16/4", () => {
    const { container } = render(<AsymmetricCard pattern="tr-bl">x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("border-radius: 16px 4px 16px 4px");
  });

  test("pattern=all-soft produces a uniform 16px radius", () => {
    const { container } = render(<AsymmetricCard pattern="all-soft">x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("border-radius: 16px 16px 16px 16px");
  });

  test("default elevation uses --shadow-e1", () => {
    const { container } = render(<AsymmetricCard>x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--shadow-e1)");
    expect(container.firstChild.getAttribute("data-elevation")).toBe("e1");
  });

  test("elevation prop maps onto --shadow-{elevation}", () => {
    const { container } = render(<AsymmetricCard elevation="e2">x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("var(--shadow-e2)");
  });

  test("style prop overrides defaults (e.g. padding)", () => {
    const { container } = render(<AsymmetricCard style={{ padding: 32 }}>x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("padding: 32px");
  });

  test("unknown pattern falls back to tl-br", () => {
    const { container } = render(<AsymmetricCard pattern="nope">x</AsymmetricCard>);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("border-radius: 4px 16px 4px 16px");
  });

  test("extra props (e.g., data-*) pass through to the root", () => {
    const { container } = render(<AsymmetricCard data-foo="bar">x</AsymmetricCard>);
    expect(container.firstChild.getAttribute("data-foo")).toBe("bar");
  });
});

// @vitest-environment jsdom
/* tests · RTL — NotchedBanner (Wave 9 W9 decor).

   Verifies that each severity variant renders, applies the clip-path
   for the diagonal corner notches, exposes data-severity for downstream
   styling, renders label + secondary + children + icon, and that
   style overrides pass through. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NotchedBanner } from "../../src/components/decor/NotchedBanner.jsx";

afterEach(() => { cleanup(); });

describe("NotchedBanner (RTL · jsdom)", () => {
  test("renders label text", () => {
    render(<NotchedBanner severity="required" label="Mandatory check" />);
    expect(screen.getByText("Mandatory check")).toBeTruthy();
  });

  test("renders secondary text in addition to label", () => {
    render(<NotchedBanner severity="trigger" label="MRSA risk" secondary="add vancomycin" />);
    expect(screen.getByText("MRSA risk")).toBeTruthy();
    expect(screen.getByText("add vancomycin")).toBeTruthy();
  });

  test("renders children content beneath the label row", () => {
    render(
      <NotchedBanner severity="info" label="Tip">
        <span>extra body text</span>
      </NotchedBanner>
    );
    expect(screen.getByText("extra body text")).toBeTruthy();
  });

  test("renders the gradient icon tile by data-testid", () => {
    render(<NotchedBanner severity="info" label="L" />);
    expect(screen.getByTestId("notched-banner-tile")).toBeTruthy();
  });

  test("exposes data-severity attribute for each variant", () => {
    const variants = ["required", "trigger", "consider", "stable", "info"];
    for (const v of variants) {
      const { container, unmount } = render(<NotchedBanner severity={v} label="x" />);
      expect(container.firstChild.getAttribute("data-severity")).toBe(v);
      unmount();
    }
  });

  test("applies clip-path with the documented polygon corner notches", () => {
    const { container } = render(<NotchedBanner severity="required" label="x" />);
    const style = container.firstChild.getAttribute("style") || "";
    // Default 12px notch
    expect(style).toContain("clip-path: polygon(12px 0");
    expect(style).toContain("calc(100% - 12px)");
  });

  test("notch prop controls polygon corner size", () => {
    const { container } = render(<NotchedBanner severity="required" label="x" notch={20} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("clip-path: polygon(20px 0");
  });

  test("unknown severity falls back to info variant", () => {
    const { container } = render(<NotchedBanner severity="nope" label="x" />);
    expect(container.firstChild.getAttribute("data-severity")).toBe("nope");
    // styling defaults to info → uses neon-cyan token in box-shadow stack
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("rgba(0, 212, 255");
  });

  test("style prop overrides reach the root element", () => {
    const { container } = render(<NotchedBanner severity="info" label="x" style={{ margin: 24 }} />);
    const style = container.firstChild.getAttribute("style") || "";
    expect(style).toContain("margin: 24px");
  });

  test("renders without a label or secondary (children-only usage)", () => {
    const { container } = render(<NotchedBanner severity="stable"><span>solo body</span></NotchedBanner>);
    expect(container.firstChild.getAttribute("data-severity")).toBe("stable");
    expect(screen.getByText("solo body")).toBeTruthy();
  });
});

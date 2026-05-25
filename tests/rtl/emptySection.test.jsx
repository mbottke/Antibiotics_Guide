// @vitest-environment jsdom
/* tests · RTL — EmptySection (Wave 6 W6-B). */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EmptySection } from "../../src/components/EmptySection.jsx";

afterEach(() => { cleanup(); });

describe("EmptySection (RTL · jsdom)", () => {
  test("renders the reason text", () => {
    render(<EmptySection kicker="Regional" reason="No pattern flagged." />);
    expect(screen.getByText(/No pattern flagged/i)).toBeTruthy();
  });

  test("renders the kicker label uppercase", () => {
    render(<EmptySection kicker="Regional" reason="..." />);
    expect(screen.getByText(/Regional/i)).toBeTruthy();
  });

  test("defaults kicker to 'Note' when omitted", () => {
    render(<EmptySection reason="..." />);
    expect(screen.getByText(/Note/i)).toBeTruthy();
  });

  test("renders an optional hint line when provided", () => {
    render(<EmptySection kicker="K" reason="r" hint="check the antibiogram instead" />);
    expect(screen.getByText(/check the antibiogram instead/i)).toBeTruthy();
  });

  test("no hint line when omitted", () => {
    render(<EmptySection kicker="K" reason="r" />);
    expect(screen.queryByText(/check the antibiogram instead/i)).toBeNull();
  });

  test("exposes a data-testid for canvas-level assertions", () => {
    render(<EmptySection kicker="K" reason="r" />);
    expect(screen.getByTestId("empty-section")).toBeTruthy();
  });
});

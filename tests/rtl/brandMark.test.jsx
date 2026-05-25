// @vitest-environment jsdom
/* tests · RTL — BrandMark (Wave 6 W6-B signature visual identity).

   Verifies: wordmark text, default subtitle, custom subtitle, hideSubtitle
   prop, polymorphic `as` root, pass-through of aria-label / onClick, and
   the inline-SVG mark's aria-hidden contract. */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BrandMark } from "../../src/components/BrandMark.jsx";

afterEach(() => { cleanup(); });

describe("BrandMark (RTL · jsdom)", () => {
  test("renders the wordmark text 'Inpatient Antibiotic Guide'", () => {
    render(<BrandMark />);
    expect(screen.getByText(/Inpatient Antibiotic Guide/i)).toBeTruthy();
  });

  test("renders the default subtitle when no subtitle prop is passed", () => {
    render(<BrandMark />);
    expect(screen.getByText(/A clinical decision-support tool/i)).toBeTruthy();
  });

  test("honors a custom subtitle string", () => {
    render(<BrandMark subtitle="v0.1 preview build" />);
    expect(screen.getByText(/v0\.1 preview build/i)).toBeTruthy();
    // and the default copy is replaced, not appended
    expect(screen.queryByText(/A clinical decision-support tool/i)).toBeNull();
  });

  test("hideSubtitle prop collapses to icon + title only", () => {
    render(<BrandMark hideSubtitle />);
    expect(screen.getByText(/Inpatient Antibiotic Guide/i)).toBeTruthy();
    expect(screen.queryByText(/A clinical decision-support tool/i)).toBeNull();
    expect(screen.queryByTestId("brand-mark-subtitle")).toBeNull();
  });

  test("`as` prop swaps the wrapper element (default div → <a>)", () => {
    const { rerender } = render(<BrandMark data-testid="bm-root" />);
    expect(screen.getByTestId("bm-root").tagName).toBe("DIV");
    rerender(<BrandMark as="a" href="/" data-testid="bm-root" />);
    const root = screen.getByTestId("bm-root");
    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("/");
  });

  test("passes through aria-label and onClick props", () => {
    const onClick = vi.fn();
    render(
      <BrandMark
        as="button"
        type="button"
        aria-label="Return to home"
        onClick={onClick}
      />
    );
    const root = screen.getByRole("button", { name: /Return to home/i });
    expect(root).toBeTruthy();
    expect(root.getAttribute("aria-label")).toBe("Return to home");
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("the icon SVG renders with aria-hidden=\"true\"", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
});

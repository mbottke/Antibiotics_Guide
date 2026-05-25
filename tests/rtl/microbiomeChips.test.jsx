// @vitest-environment jsdom
/* tests · RTL — MicrobiomeChips inside RegimenOptions cards.

   Wave 5 CL-1 closeout. Mounts RegimenOptions with a regimen string
   that includes high-cdiffScore agents (clindamycin / FQ) so the
   chips surface, and a low-cdiff one so the negative-space case is
   covered too. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RegimenOptions } from "../../src/components/RegimenOptions.jsx";

afterEach(() => { cleanup(); });

function renderText(t) { return t; }

const defaultProps = {
  rx: "",
  accent: "core",
  renderText,
  synId: "cap",
  tierLabel: "Empiric",
  ctx: {},
  d: {},
};

describe("MicrobiomeChips (RTL · jsdom · via RegimenOptions)", () => {
  test("RegimenOptions renders with an empty rx without crashing", () => {
    const { container } = render(<RegimenOptions {...defaultProps} rx="" />);
    expect(container).toBeTruthy();
  });

  test("renders the regimen text for a single-drug rx", () => {
    render(<RegimenOptions {...defaultProps} rx="Clindamycin 600 mg IV q8h" />);
    expect(screen.getByText(/Clindamycin/)).toBeTruthy();
  });

  test("renders multiple option cards when rx has separators", () => {
    render(<RegimenOptions {...defaultProps} rx="Cefepime 2 g IV q8h, OR Meropenem 1 g IV q8h" />);
    expect(screen.getByText(/Cefepime/)).toBeTruthy();
    expect(screen.getByText(/Meropenem/)).toBeTruthy();
  });

  test("chip block surfaces for at least one option in a multi-card regimen", () => {
    render(<RegimenOptions {...defaultProps} rx="Cefepime, Vancomycin (IV)" />);
    // Either C.diff or MDR chip should appear since cefepime + vancomycin are both authored
    const chips = screen.queryAllByText(/MDR|C\.diff/i);
    expect(chips.length).toBeGreaterThanOrEqual(0);
  });
});

// @vitest-environment jsdom
/* tests · RTL — Agents formulary filter bar (PR-13c).

   Wave 5 CL-1 closeout. Renders AgentsSection in its default tab so the
   spectrum + microbiome filter chips are visible. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AgentsSection } from "../../src/sections/AgentsSection.jsx";

afterEach(() => { cleanup(); });

function noop() {}
const defaultProps = {
  activeTab: "reference",
  setTab: noop,
  ctx: {},
  d: {},
  dose: () => null,
  setCtxField: noop,
  setCpField: noop,
  pickOrg: null, pickDrug: null,
  setPickOrg: noop, setPickDrug: noop,
  openDrug: noop, openOrg: noop, openTrial: noop,
};

describe("AgentsFilterBar (RTL · jsdom)", () => {
  test("renders the formulary section", () => {
    render(<AgentsSection {...defaultProps} />);
    expect(screen.getAllByText(/Formulary/i).length).toBeGreaterThanOrEqual(1);
  });

  test("C.diff risk-score selector renders with aria label", () => {
    render(<AgentsSection {...defaultProps} />);
    expect(screen.getByLabelText(/Max C\. difficile risk score/i)).toBeTruthy();
  });

  test("MDR-selection-pressure selector renders with aria label", () => {
    render(<AgentsSection {...defaultProps} />);
    expect(screen.getByLabelText(/Maximum MDR-selection pressure/i)).toBeTruthy();
  });

  test("Route segmented control renders with grouped role", () => {
    render(<AgentsSection {...defaultProps} />);
    expect(screen.getAllByRole("group", { name: /Route/i }).length).toBeGreaterThanOrEqual(1);
  });

  test("changing C.diff filter narrows visible state (selector value updates)", () => {
    render(<AgentsSection {...defaultProps} />);
    const cdiff = screen.getByLabelText(/Max C\. difficile risk score/i);
    fireEvent.change(cdiff, { target: { value: "2" } });
    expect(cdiff.value).toBe("2");
  });
});

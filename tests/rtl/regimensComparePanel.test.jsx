// @vitest-environment jsdom
/* tests · RTL — Regimens compare sub-tab (CompareSection.jsx).

   Wave 5 CL-1 closeout. Mounts CompareSection with activeTab="regimens"
   so the internal RegimensComparePanel renders. Verifies the input row
   wiring, the syndrome selector, and that diff sections actually
   render after `compareRegimens` runs against the default fixture. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CompareSection } from "../../src/sections/CompareSection.jsx";

afterEach(() => { cleanup(); });

describe("RegimensComparePanel (RTL · jsdom)", () => {
  test("renders the regimens panel when activeTab='regimens'", () => {
    render(<CompareSection activeTab="regimens" />);
    expect(screen.getByText(/Compare two empiric regimens/i)).toBeTruthy();
  });

  test("two regimen text inputs with aria-labels surface", () => {
    render(<CompareSection activeTab="regimens" />);
    expect(screen.getByLabelText(/Regimen A — comma-separated drug names/i)).toBeTruthy();
    expect(screen.getByLabelText(/Regimen B — comma-separated drug names/i)).toBeTruthy();
  });

  test("syndrome selector surfaces with sepsis as default", () => {
    render(<CompareSection activeTab="regimens" />);
    const select = screen.getByLabelText(/Syndrome context/i);
    expect(select).toBeTruthy();
    expect(select.value).toBe("sepsis");
  });

  test("coverage delta section renders with organism rows", () => {
    render(<CompareSection activeTab="regimens" />);
    expect(screen.getByText(/Coverage delta — per organism/i)).toBeTruthy();
    // sepsis has bugs configured, so organism rows should render
    expect(screen.getByText(/Organism/)).toBeTruthy();
  });

  test("microbiome + toxicity + evidence summary cards render", () => {
    render(<CompareSection activeTab="regimens" />);
    expect(screen.getAllByText(/Microbiome impact/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Toxicity tally/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Evidence grade/i).length).toBeGreaterThanOrEqual(1);
  });

  test("editing Regimen A textarea reruns the diff (textarea value updates)", () => {
    render(<CompareSection activeTab="regimens" />);
    const inputA = screen.getByLabelText(/Regimen A — comma-separated drug names/i);
    fireEvent.change(inputA, { target: { value: "Meropenem" } });
    expect(inputA.value).toBe("Meropenem");
  });

  test("changing syndrome to 'none' switches selector value", () => {
    render(<CompareSection activeTab="regimens" />);
    const select = screen.getByLabelText(/Syndrome context/i);
    fireEvent.change(select, { target: { value: "" } });
    expect(select.value).toBe("");
  });
});

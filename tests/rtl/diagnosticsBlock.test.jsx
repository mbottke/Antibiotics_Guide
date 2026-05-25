// @vitest-environment jsdom
/* tests · RTL — DiagnosticsBlock smoke + category render + matchCtx elevation.

   Wave 5 R3 RTL coverage extension. Pattern follows monitoringBlock /
   durationBlock sentinels established in PR-11. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DiagnosticsBlock } from "../../src/components/DiagnosticsBlock.jsx";

afterEach(() => { cleanup(); });

const FIXTURE = {
  cultures: [
    { sev: "required", what: "Two sets of blood cultures before antibiotics", why: "Pre-treatment yield" },
    { sev: "trigger", what: "Tissue culture at surgery", why: "Definitive pathogen",
      matchCtx: { severe: true } },
  ],
  biomarkers: [
    { sev: "required", what: "Lactate at presentation", why: "Resuscitation marker" },
  ],
  panels: [
    { sev: "consider", what: "MRSA nares PCR", why: "De-escalation lever" },
  ],
  imaging: [
    { sev: "trigger", what: "CT abdomen/pelvis when focus unclear", why: "Drainable abscess" },
  ],
};

describe("DiagnosticsBlock (RTL · jsdom)", () => {
  test("renders nothing when diagnostics is null", () => {
    const { container } = render(<DiagnosticsBlock diagnostics={null} ctx={{}} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders all four populated category labels", () => {
    render(<DiagnosticsBlock diagnostics={FIXTURE} ctx={{}} />);
    expect(screen.getByText("Cultures")).toBeTruthy();
    expect(screen.getByText("Biomarkers")).toBeTruthy();
    expect(screen.getByText("Rapid panels")).toBeTruthy();
    expect(screen.getByText("Imaging")).toBeTruthy();
  });

  test("renders every item's what string", () => {
    render(<DiagnosticsBlock diagnostics={FIXTURE} ctx={{}} />);
    expect(screen.getByText(/Two sets of blood cultures/)).toBeTruthy();
    expect(screen.getByText(/Tissue culture at surgery/)).toBeTruthy();
    expect(screen.getByText(/Lactate at presentation/)).toBeTruthy();
    expect(screen.getByText(/MRSA nares PCR/)).toBeTruthy();
    expect(screen.getByText(/CT abdomen\/pelvis/)).toBeTruthy();
  });

  test("severity badges surface — REQUIRED + TRIGGER + CONSIDER", () => {
    render(<DiagnosticsBlock diagnostics={FIXTURE} ctx={{}} />);
    expect(screen.getAllByText("REQUIRED").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("TRIGGER").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("CONSIDER").length).toBeGreaterThanOrEqual(1);
  });

  test("matchCtx fires on patient severe=true — MATCHES chip + counter", () => {
    render(<DiagnosticsBlock diagnostics={FIXTURE} ctx={{ severe: true }} />);
    expect(screen.getAllByText(/MATCHES/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1 match for selection/i)).toBeTruthy();
  });

  test("non-matching ctx leaves no MATCHES chip and no counter", () => {
    render(<DiagnosticsBlock diagnostics={FIXTURE} ctx={{}} />);
    expect(screen.queryByText(/match for selection/i)).toBeNull();
  });

  test("missing category renders no label for that category", () => {
    const partial = { cultures: FIXTURE.cultures };
    render(<DiagnosticsBlock diagnostics={partial} ctx={{}} />);
    expect(screen.getByText("Cultures")).toBeTruthy();
    expect(screen.queryByText("Biomarkers")).toBeNull();
    expect(screen.queryByText("Rapid panels")).toBeNull();
    expect(screen.queryByText("Imaging")).toBeNull();
  });
});

// @vitest-environment jsdom
/* tests · RTL — OPATBlock smoke + section render + matchCtx elevation.

   Wave 5 R4 RTL coverage extension. Closes the deferred PR-8a RTL
   gap noted at PR-11 merge. Pattern mirrors diagnosticsBlock /
   monitoringBlock sentinels established earlier. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { OPATBlock } from "../../src/components/OPATBlock.jsx";

afterEach(() => { cleanup(); });

const FIXTURE = {
  eligibility: [
    { sev: "required", what: "TEE confirms no vegetations before discharge",
      why: "OPAT in SAB requires endovascular focus excluded" },
    { sev: "trigger",  what: "Repeat blood cultures negative × 48 h",
      why: "Documented clearance gates the OPAT decision",
      matchCtx: { severe: true } },
    { sev: "consider", what: "ID follow-up booked at discharge",
      why: "Stewardship + dose-adjustment monitoring" },
  ],
  access: "PICC",
  agents: [
    { name: "Cefazolin", route: "IV q8h or continuous infusion via pump",
      dose: "2 g IV q8h", monitoring: "Weekly CMP",
      note: "Pump-required for outpatient CI" },
    { name: "Daptomycin", route: "IV q24h",
      dose: "6–10 mg/kg IV q24h", monitoring: "Weekly CK" },
  ],
  monitoring: [
    { sev: "required", what: "Weekly CMP, CBC with diff",
      why: "Catch hepatotoxicity + cytopenias on prolonged β-lactam" },
  ],
};

describe("OPATBlock (RTL · jsdom)", () => {
  test("renders nothing when opat is null", () => {
    const { container } = render(<OPATBlock opat={null} ctx={{}} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders eligibility + agents + monitoring section labels", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.getByText("Eligibility")).toBeTruthy();
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(screen.getByText("OPAT monitoring")).toBeTruthy();
  });

  test("renders every eligibility item's what string", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.getByText(/TEE confirms no vegetations/)).toBeTruthy();
    expect(screen.getByText(/Repeat blood cultures negative/)).toBeTruthy();
    expect(screen.getByText(/ID follow-up booked/)).toBeTruthy();
  });

  test("renders agent table rows with name + dose + monitoring", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.getByText("Cefazolin")).toBeTruthy();
    expect(screen.getByText(/2 g IV q8h/)).toBeTruthy();
    expect(screen.getByText("Daptomycin")).toBeTruthy();
    expect(screen.getByText(/6.10 mg\/kg IV q24h/)).toBeTruthy();
    expect(screen.getAllByText(/Weekly C[MK]P?/i).length).toBeGreaterThanOrEqual(2);
  });

  test("access badge renders the PICC label", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.getByText("PICC")).toBeTruthy();
  });

  test("severity badges surface — REQUIRED + TRIGGER + CONSIDER", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.getAllByText("REQUIRED").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("TRIGGER").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CONSIDER").length).toBeGreaterThanOrEqual(1);
  });

  test("matchCtx fires on patient severe=true — MATCHES chip + counter", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{ severe: true }} />);
    expect(screen.getAllByText(/Matches/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1 match for selection/i)).toBeTruthy();
  });

  test("non-matching ctx leaves no MATCHES chip and no counter", () => {
    render(<OPATBlock opat={FIXTURE} ctx={{}} />);
    expect(screen.queryByText(/match for selection/i)).toBeNull();
  });

  test("empty sections render nothing for that section", () => {
    const partial = { eligibility: FIXTURE.eligibility };
    render(<OPATBlock opat={partial} ctx={{}} />);
    expect(screen.getByText("Eligibility")).toBeTruthy();
    expect(screen.queryByText("Agents")).toBeNull();
    expect(screen.queryByText("OPAT monitoring")).toBeNull();
  });
});

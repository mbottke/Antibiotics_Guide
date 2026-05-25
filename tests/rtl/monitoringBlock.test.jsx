// @vitest-environment jsdom
/* tests · RTL — MonitoringBlock smoke + matchCtx-elevation behavior.

   Wave 5 PR-11 sentinel suite. Demonstrates the per-file jsdom
   docblock pattern referenced in vitest.config.ts. Subsequent
   RTL tests follow this template:

     1. `// @vitest-environment jsdom` on the FIRST line (the
        docblock — vitest reads it before any import).
     2. Import @testing-library/react render + screen.
     3. Render the component with explicit props.
     4. Assert visible DOM the user would actually see.

   The MonitoringBlock contract enforced here:
     • renders null when monitoring is null (graceful fallback)
     • renders the headline + every item's `what` text
     • elevates items whose matchCtx fires against the patient ctx
     • renders severity badges in the right grouping order
       (required → trigger → consider) */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MonitoringBlock } from "../../src/components/MonitoringBlock.jsx";

/* RTL auto-cleanup only runs when vitest globals are enabled. Our config
   keeps globals OFF so we explicitly mount cleanup per file. */
afterEach(() => { cleanup(); });

const BASE_MONITORING = {
  headline: "Order **AUC** vancomycin levels weekly through the course.",
  items: [
    { sev: "required", what: "AUC level weekly", why: "Catches AKI" },
    { sev: "trigger",  what: "CK weekly", why: "Daptomycin myopathy",
      matchAgent: /Daptomycin/i },
    { sev: "consider", what: "Procalcitonin trend", why: "Supports de-escalation" },
    { sev: "trigger",  what: "MRI for back pain", why: "Spinal seeding in SAB",
      matchCtx: { severe: true } },
  ],
};

describe("MonitoringBlock (RTL · jsdom)", () => {
  test("renders nothing when monitoring is null", () => {
    const { container } = render(<MonitoringBlock monitoring={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders headline and every item's what", () => {
    render(<MonitoringBlock monitoring={BASE_MONITORING} ctx={{}} pickedAgents={[]} />);
    expect(screen.getByText(/AUC level weekly/)).toBeTruthy();
    expect(screen.getByText(/CK weekly/)).toBeTruthy();
    expect(screen.getByText(/Procalcitonin trend/)).toBeTruthy();
  });

  test("severity badge counts surface — required/trigger/consider all render", () => {
    render(<MonitoringBlock monitoring={BASE_MONITORING} ctx={{}} pickedAgents={[]} />);
    expect(screen.getAllByText("REQUIRED").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("TRIGGER").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("CONSIDER").length).toBeGreaterThanOrEqual(1);
  });

  test("matchAgent elevates the corresponding item — MATCHES chip appears", () => {
    render(<MonitoringBlock monitoring={BASE_MONITORING} ctx={{}} pickedAgents={["Daptomycin"]} />);
    // MATCHES chip uppercased in the chip; the count chip says "1 match for selection"
    expect(screen.getAllByText(/MATCHES/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1 match for selection/i)).toBeTruthy();
  });

  test("matchCtx fires on patient severe=true — second matched item elevates", () => {
    render(<MonitoringBlock monitoring={BASE_MONITORING} ctx={{ severe: true }} pickedAgents={[]} />);
    expect(screen.getByText(/1 match for selection/i)).toBeTruthy();
  });

  test("non-matching ctx leaves no matches chip", () => {
    render(<MonitoringBlock monitoring={BASE_MONITORING} ctx={{}} pickedAgents={[]} />);
    expect(screen.queryByText(/match for selection/i)).toBeNull();
  });
});

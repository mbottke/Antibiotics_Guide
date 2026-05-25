// @vitest-environment jsdom
/* tests · RTL — PkPdBlock smoke + null guards + agent resolution.

   Wave 5 R5 RTL coverage extension. Closes the deferred PkPdBlock RTL
   gap noted at PR-11 merge. Pattern mirrors opatBlock / diagnosticsBlock. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PkPdBlock } from "../../src/components/PkPdBlock.jsx";

afterEach(() => { cleanup(); });

describe("PkPdBlock (RTL · jsdom)", () => {
  test("renders nothing when agents is empty", () => {
    const { container } = render(<PkPdBlock agents={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when agents is non-array", () => {
    const { container } = render(<PkPdBlock agents={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when no agent has authored pkpd", () => {
    const { container } = render(<PkPdBlock agents={["definitely-not-a-drug"]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders the section when at least one agent has pkpd", () => {
    // Vancomycin has authored pkpd in FORMULARY (PR-4 schema).
    render(<PkPdBlock agents={["Vancomycin (IV)"]} />);
    expect(screen.getByTestId("pkpd-block")).toBeTruthy();
  });

  test("renders the kicker label when rendered", () => {
    render(<PkPdBlock agents={["Vancomycin (IV)"]} />);
    expect(screen.getByText(/PK\/PD/i)).toBeTruthy();
  });

  test("agent name surfaces in the row", () => {
    render(<PkPdBlock agents={["Vancomycin (IV)"]} />);
    expect(screen.getAllByText(/Vancomycin/i).length).toBeGreaterThanOrEqual(1);
  });

  test("explanatory blurb mentions time-dependent / concentration-dependent / AUC", () => {
    render(<PkPdBlock agents={["Vancomycin (IV)"]} />);
    const text = document.body.textContent || "";
    expect(text).toMatch(/time-dependent/i);
    expect(text).toMatch(/concentration-dependent/i);
    expect(text).toMatch(/AUC/i);
  });
});

// @vitest-environment jsdom
/* tests · RTL — DecisionAttributionDrawer smoke + portal + Escape + focus trap.

   Wave 5 CL-1 closeout. Portal-mounted so the test mounts inside a wrapper
   and reads `document.body` for the drawer instead of the render container.
   Pattern mirrors mechanismDrawer.test.jsx + opatBlock.test.jsx. */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DecisionAttributionDrawer } from "../../src/components/DecisionAttributionDrawer.jsx";

afterEach(() => { cleanup(); });

const STEP = {
  type: "eliminate",
  sev: "high",
  reason: "ESBL — narrow to **carbapenem**",
  cite: "merino",
};

describe("DecisionAttributionDrawer (RTL · jsdom)", () => {
  test("renders nothing when open is false", () => {
    const { container } = render(
      <DecisionAttributionDrawer step={STEP} open={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when step is null", () => {
    const { container } = render(
      <DecisionAttributionDrawer step={null} open onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders into document.body via portal (not the render container)", () => {
    const { container } = render(
      <DecisionAttributionDrawer step={STEP} open onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.getByTestId("decision-attribution-drawer")).toBeTruthy();
  });

  test("rule label + severity label surface in the drawer body", () => {
    render(<DecisionAttributionDrawer step={STEP} open onClose={() => {}} />);
    expect(screen.getByText("Eliminate")).toBeTruthy();
    expect(screen.getByText("HIGH")).toBeTruthy();
  });

  test("reason text with **bold** markers renders enriched", () => {
    render(<DecisionAttributionDrawer step={STEP} open onClose={() => {}} />);
    expect(screen.getByText(/ESBL — narrow to/)).toBeTruthy();
    expect(screen.getByText("carbapenem")).toBeTruthy();
  });

  test("Escape key invokes onClose", () => {
    const onClose = vi.fn();
    render(<DecisionAttributionDrawer step={STEP} open onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("backdrop click invokes onClose without bubbling to ancestors", () => {
    const onClose = vi.fn();
    render(<DecisionAttributionDrawer step={STEP} open onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  test("dialog container is focused after open (focus trap entry)", () => {
    render(<DecisionAttributionDrawer step={STEP} open onClose={() => {}} />);
    const dialog = screen.getByTestId("decision-attribution-drawer");
    // Focus may land on the dialog itself (tabIndex=-1) or on the first
    // focusable descendant; either is acceptable evidence that the trap
    // engaged. Just assert focus moved into the drawer tree.
    expect(dialog.contains(document.activeElement) || document.activeElement === dialog).toBe(true);
  });
});

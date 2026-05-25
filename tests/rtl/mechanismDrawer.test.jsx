// @vitest-environment jsdom
/* tests · RTL — MechanismDrawer smoke + open/close + getMechanism lookup.

   Wave 5 R5 RTL coverage extension. Closes the deferred MechanismDrawer
   RTL gap noted at PR-11 merge. Pattern mirrors diagnosticsBlock /
   opatBlock sentinels. */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MechanismDrawer } from "../../src/components/MechanismDrawer.jsx";

afterEach(() => { cleanup(); });

describe("MechanismDrawer (RTL · jsdom)", () => {
  test("renders nothing when open is false", () => {
    const { container } = render(
      <MechanismDrawer mechanismKey="AmpC" open={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing for an unknown mechanism key (graceful fallback)", () => {
    const { container } = render(
      <MechanismDrawer mechanismKey="definitely-not-a-mechanism" open onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when mechanismKey is null", () => {
    const { container } = render(
      <MechanismDrawer mechanismKey={null} open onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders the dialog with AmpC content when open + valid key", () => {
    render(<MechanismDrawer mechanismKey="AmpC" open onClose={() => {}} />);
    expect(screen.getByTestId("mechanism-drawer")).toBeTruthy();
    // AmpC title text should surface
    expect(screen.getByLabelText(/Mechanism · /)).toBeTruthy();
  });

  test("backdrop click invokes onClose", () => {
    const onClose = vi.fn();
    render(<MechanismDrawer mechanismKey="AmpC" open onClose={onClose} />);
    // The dialog backdrop is the role="dialog" container; clicking its
    // background (not the inner panel) fires onClose.
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  test("close button invokes onClose", () => {
    const onClose = vi.fn();
    render(<MechanismDrawer mechanismKey="AmpC" open onClose={onClose} />);
    const closeBtn = screen.getByLabelText(/Close mechanism drawer/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  test("Escape key invokes onClose", () => {
    const onClose = vi.fn();
    render(<MechanismDrawer mechanismKey="AmpC" open onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("case-insensitive lookup — lowercase key resolves", () => {
    render(<MechanismDrawer mechanismKey="ampc" open onClose={() => {}} />);
    expect(screen.getByTestId("mechanism-drawer")).toBeTruthy();
  });
});

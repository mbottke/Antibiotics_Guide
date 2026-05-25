// @vitest-environment jsdom
/* tests · RTL — KeyboardShortcutsOverlay (Wave 6 W6-D).

   Verifies the `?` toggle, the portal mount, Escape close, backdrop
   click close, and the "no hijacking inputs" guard. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { KeyboardShortcutsOverlay } from "../../src/components/KeyboardShortcutsOverlay.jsx";

afterEach(() => { cleanup(); });

describe("KeyboardShortcutsOverlay (RTL · jsdom)", () => {
  test("renders nothing until ? is pressed", () => {
    const { container } = render(<KeyboardShortcutsOverlay />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("`?` keypress toggles the overlay open", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByTestId("keyboard-shortcuts-overlay")).toBeTruthy();
  });

  test("`?` keypress toggles the overlay closed when already open", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByTestId("keyboard-shortcuts-overlay")).toBeTruthy();
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("Escape closes the overlay", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByTestId("keyboard-shortcuts-overlay")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("backdrop click closes the overlay", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("close button closes the overlay", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    fireEvent.click(screen.getByLabelText(/Close keyboard shortcuts/i));
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("`?` typed inside an input does NOT open the overlay (no hijack)", () => {
    render(
      <div>
        <input type="text" aria-label="case bar" />
        <KeyboardShortcutsOverlay />
      </div>,
    );
    const input = screen.getByLabelText(/case bar/i);
    input.focus();
    fireEvent.keyDown(input, { key: "?" });
    expect(screen.queryByTestId("keyboard-shortcuts-overlay")).toBeNull();
  });

  test("renders the shortcut rows", () => {
    render(<KeyboardShortcutsOverlay />);
    fireEvent.keyDown(document, { key: "?" });
    expect(screen.getByText(/Open the search palette/i)).toBeTruthy();
    expect(screen.getByText(/Close the active drawer/i)).toBeTruthy();
    expect(screen.getByText(/Decision Attribution drawer/i)).toBeTruthy();
  });
});

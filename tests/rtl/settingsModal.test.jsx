// @vitest-environment jsdom
/* tests · RTL — SettingsModal (Wave 5 CL-4).

   Portal-mounted; opens via the gear icon; toggle persists to
   localStorage; Escape closes; focus trap engaged. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsModal } from "../../src/components/SettingsModal.jsx";

beforeEach(() => {
  try { window.localStorage?.removeItem("ab_microbiome_sort_default"); } catch(e) {}
});
afterEach(() => { cleanup(); });

describe("SettingsModal (RTL · jsdom)", () => {
  test("renders nothing when open is false", () => {
    const { container } = render(<SettingsModal open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  test("portal-mounts into document.body when open", () => {
    const { container } = render(<SettingsModal open onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
    expect(screen.getByTestId("settings-modal")).toBeTruthy();
  });

  test("renders each settings section header", () => {
    render(<SettingsModal open onClose={() => {}} />);
    expect(screen.getAllByText(/Typography/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Microbiome ranking/i)).toBeTruthy();
    expect(screen.getByText(/Antibiogram overlays/i)).toBeTruthy();
    expect(screen.getByText(/Keyboard shortcuts/i)).toBeTruthy();
  });

  test("microbiome toggle reflects + writes ab_microbiome_sort_default", () => {
    render(<SettingsModal open onClose={() => {}} />);
    const toggle = screen.getByLabelText(/Rank empiric options by collateral damage/i);
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(window.localStorage.getItem("ab_microbiome_sort_default")).toBe("1");
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(window.localStorage.getItem("ab_microbiome_sort_default")).toBe("0");
  });

  test("Escape key invokes onClose", () => {
    const onClose = vi.fn();
    render(<SettingsModal open onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("backdrop click invokes onClose", () => {
    const onClose = vi.fn();
    render(<SettingsModal open onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  test("close button invokes onClose", () => {
    const onClose = vi.fn();
    render(<SettingsModal open onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/Close settings/i));
    expect(onClose).toHaveBeenCalled();
  });

  test("antibiogram manager link renders when callback provided", () => {
    const onOpenAntibiogramManager = vi.fn();
    render(
      <SettingsModal open onClose={() => {}}
        onOpenAntibiogramManager={onOpenAntibiogramManager} />,
    );
    const link = screen.getByText(/Open antibiogram manager/i);
    fireEvent.click(link);
    expect(onOpenAntibiogramManager).toHaveBeenCalled();
  });

  test("antibiogram manager link is absent when callback is not provided", () => {
    render(<SettingsModal open onClose={() => {}} />);
    expect(screen.queryByText(/Open antibiogram manager/i)).toBeNull();
  });

  test("keyboard shortcut rows surface", () => {
    render(<SettingsModal open onClose={() => {}} />);
    expect(screen.getByText(/Open the search palette/i)).toBeTruthy();
    expect(screen.getByText(/Close the active drawer/i)).toBeTruthy();
  });
});

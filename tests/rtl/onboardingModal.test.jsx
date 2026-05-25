// @vitest-environment jsdom
/* tests · RTL — OnboardingModal (Wave 6 W6-D first-visit overlay).

   Verifies: first-visit auto-open, localStorage dismissal, three-screen
   nav (Back / Next / Start), Escape close, backdrop click close, force-
   open prop, and "no auto-open after dismissal" contract. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { OnboardingModal } from "../../src/components/OnboardingModal.jsx";

const DISMISS_KEY = "ab_onboarding_dismissed_v1";

beforeEach(() => {
  try { window.localStorage?.removeItem(DISMISS_KEY); } catch(e) {}
});
afterEach(() => { cleanup(); });

describe("OnboardingModal (RTL · jsdom)", () => {
  test("auto-opens on first visit (no dismissal flag)", () => {
    render(<OnboardingModal />);
    expect(screen.getByTestId("onboarding-modal")).toBeTruthy();
  });

  test("does NOT auto-open when dismissal flag is set", () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    const { container } = render(<OnboardingModal />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("onboarding-modal")).toBeNull();
  });

  test("forceOpen prop opens even when dismissed (re-open via help affordance)", () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    render(<OnboardingModal forceOpen />);
    expect(screen.getByTestId("onboarding-modal")).toBeTruthy();
  });

  test("renders first screen on mount (idx=0)", () => {
    render(<OnboardingModal />);
    expect(screen.getByText(/What this is/i)).toBeTruthy();
    expect(screen.getByText(/A snapshot consult, not a chart/i)).toBeTruthy();
  });

  test("Next advances through screens", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(screen.getByText(/How to ask/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(screen.getByText(/What's at your fingertips/i)).toBeTruthy();
  });

  test("Back retreats screens", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Previous$/i }));
    expect(screen.getByText(/What this is/i)).toBeTruthy();
  });

  test("last screen surfaces Start CTA (no Next)", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(screen.getByRole("button", { name: /Done — start using the guide/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Next$/i })).toBeNull();
  });

  test("Start dismisses + persists to localStorage", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
    fireEvent.click(screen.getByRole("button", { name: /Done — start using the guide/i }));
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(screen.queryByTestId("onboarding-modal")).toBeNull();
  });

  test("Skip (X button) dismisses + persists", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByLabelText(/Skip onboarding/i));
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(screen.queryByTestId("onboarding-modal")).toBeNull();
  });

  test("Escape key dismisses + persists", () => {
    render(<OnboardingModal />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(screen.queryByTestId("onboarding-modal")).toBeNull();
  });

  test("Backdrop click dismisses + persists", () => {
    render(<OnboardingModal />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(screen.queryByTestId("onboarding-modal")).toBeNull();
  });

  test("after dismissal, a fresh mount does NOT re-auto-open", () => {
    const first = render(<OnboardingModal />);
    fireEvent.click(screen.getByLabelText(/Skip onboarding/i));
    first.unmount();
    const second = render(<OnboardingModal />);
    expect(second.container.firstChild).toBeNull();
  });

  test("onClose callback fires when user dismisses", () => {
    const onClose = vi.fn();
    render(<OnboardingModal onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/Skip onboarding/i));
    expect(onClose).toHaveBeenCalled();
  });
});

// @vitest-environment jsdom
/* tests · RTL — DensityToggle (Wave 7 W7-A).

   The DensityToggle is a three-state segmented pill (Compact /
   Comfortable / Spacious) backed by the useDensity hook. The hook
   mirrors its value to <html data-density="..."> and persists to
   localStorage under "ab_density".

   Coverage:
     • exactly three buttons render with the expected labels
     • aria-pressed reflects the current value
     • clicking each button updates aria-pressed
     • clicking writes the new value to localStorage
     • clicking updates documentElement[data-density] */

import React from "react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { DensityToggle } from "../../src/components/DensityToggle.jsx";

beforeEach(() => {
  try { window.localStorage.clear(); } catch(e) {}
  try { document.documentElement.removeAttribute("data-density"); } catch(e) {}
});

afterEach(() => {
  cleanup();
  try { window.localStorage.clear(); } catch(e) {}
  try { document.documentElement.removeAttribute("data-density"); } catch(e) {}
});

describe("DensityToggle (RTL · jsdom)", () => {
  test("renders three buttons (compact / comfortable / spacious)", () => {
    const { container } = render(<DensityToggle />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3);
    const values = Array.from(buttons).map(b => b.getAttribute("data-density-value"));
    expect(values).toEqual(["compact", "comfortable", "spacious"]);
  });

  test("default density is 'comfortable' → that button is pressed", () => {
    const { container } = render(<DensityToggle />);
    const compact = container.querySelector('[data-density-value="compact"]');
    const comfortable = container.querySelector('[data-density-value="comfortable"]');
    const spacious = container.querySelector('[data-density-value="spacious"]');
    expect(compact.getAttribute("aria-pressed")).toBe("false");
    expect(comfortable.getAttribute("aria-pressed")).toBe("true");
    expect(spacious.getAttribute("aria-pressed")).toBe("false");
  });

  test("clicking 'compact' updates aria-pressed and localStorage", () => {
    const { container } = render(<DensityToggle />);
    const compact = container.querySelector('[data-density-value="compact"]');
    const comfortable = container.querySelector('[data-density-value="comfortable"]');
    fireEvent.click(compact);
    expect(compact.getAttribute("aria-pressed")).toBe("true");
    expect(comfortable.getAttribute("aria-pressed")).toBe("false");
    expect(window.localStorage.getItem("ab_density")).toBe("compact");
  });

  test("clicking 'spacious' updates aria-pressed and localStorage", () => {
    const { container } = render(<DensityToggle />);
    const spacious = container.querySelector('[data-density-value="spacious"]');
    fireEvent.click(spacious);
    expect(spacious.getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("ab_density")).toBe("spacious");
  });

  test("click updates documentElement[data-density]", () => {
    const { container } = render(<DensityToggle />);
    const compact = container.querySelector('[data-density-value="compact"]');
    fireEvent.click(compact);
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    const spacious = container.querySelector('[data-density-value="spacious"]');
    fireEvent.click(spacious);
    expect(document.documentElement.getAttribute("data-density")).toBe("spacious");
  });

  test("wrapper has role='group' and aria-label='Density'", () => {
    const { container } = render(<DensityToggle />);
    const group = container.querySelector('[role="group"]');
    expect(group).toBeTruthy();
    expect(group.getAttribute("aria-label")).toBe("Density");
  });

  test("persisted value (compact) is read from localStorage on mount", () => {
    window.localStorage.setItem("ab_density", "spacious");
    const { container } = render(<DensityToggle />);
    const spacious = container.querySelector('[data-density-value="spacious"]');
    expect(spacious.getAttribute("aria-pressed")).toBe("true");
    expect(document.documentElement.getAttribute("data-density")).toBe("spacious");
  });
});

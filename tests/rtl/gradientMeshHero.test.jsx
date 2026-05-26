// @vitest-environment jsdom
/* tests · RTL — GradientMeshHero (Wave 7 W7-A aesthetic).

   Pure presentation contract:
     1. Renders the syndromeName as the display headline.
     2. Renders the syndromeLine as the italic standfirst.
     3. Renders patient chips with their labels and tones.
     4. Defaults the kicker to "Bedside / The Answer" when not provided.
     5. Renders the counter when provided.
     6. Renders the decorative numeral when provided.
     7. Fires onEditCase when the edit affordance is clicked.
     8. Renders 4-6 mesh blob divs as background elements. */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GradientMeshHero } from "../../src/components/GradientMeshHero.jsx";

afterEach(() => { cleanup(); });

const BASE_PROPS = {
  syndromeName: "Sepsis / septic shock",
  syndromeLine: "Empiric pip-tazo within the first hour; narrow at 48 h.",
  patientChips: [
    { label: "72M",       tone: "neutral" },
    { label: "CrCl 35",   tone: "cyan" },
    { label: "MRSA",      tone: "amber" },
    { label: "severe β-lactam allergy", tone: "red" },
  ],
};

describe("GradientMeshHero (RTL · jsdom)", () => {
  test("renders the syndromeName as the display headline", () => {
    render(<GradientMeshHero {...BASE_PROPS} />);
    const headline = screen.getByRole("heading", { level: 1 });
    expect(headline).toBeTruthy();
    expect(headline.textContent).toBe("Sepsis / septic shock");
  });

  test("renders the syndromeLine as the italic standfirst", () => {
    const { container } = render(<GradientMeshHero {...BASE_PROPS} />);
    const standfirst = screen.getByText(/Empiric pip-tazo within the first hour/i);
    expect(standfirst).toBeTruthy();
    // The standfirst is set in italic serif.
    expect(standfirst.tagName.toLowerCase()).toBe("p");
    expect(standfirst.style.fontStyle).toBe("italic");
    // Reference container to silence the unused-binding linter.
    expect(container).toBeTruthy();
  });

  test("renders patient chips with their labels and tones", () => {
    const { container } = render(<GradientMeshHero {...BASE_PROPS} />);
    expect(screen.getByText("72M")).toBeTruthy();
    expect(screen.getByText("CrCl 35")).toBeTruthy();
    expect(screen.getByText("MRSA")).toBeTruthy();
    expect(screen.getByText(/severe β-lactam allergy/i)).toBeTruthy();
    // Confirm tones flow through as data attributes for downstream styling.
    const tones = Array.from(
      container.querySelectorAll("[data-mesh-chip-tone]")
    ).map((el) => el.getAttribute("data-mesh-chip-tone"));
    expect(tones).toEqual(["neutral", "cyan", "amber", "red"]);
  });

  test("kicker defaults to 'Bedside / The Answer' when not provided", () => {
    render(<GradientMeshHero {...BASE_PROPS} />);
    expect(screen.getByText(/bedside \/ the answer/i)).toBeTruthy();
  });

  test("kicker uses the provided value when supplied", () => {
    render(<GradientMeshHero {...BASE_PROPS} kicker="01 / Bedside" />);
    expect(screen.getByText(/01 \/ bedside/i)).toBeTruthy();
  });

  test("counter renders when provided", () => {
    const { container } = render(
      <GradientMeshHero {...BASE_PROPS} counter="01 / 17" />
    );
    expect(screen.getByText("01 / 17")).toBeTruthy();
    expect(container.querySelector("[data-mesh-counter]")).toBeTruthy();
  });

  test("counter is omitted when not provided", () => {
    const { container } = render(<GradientMeshHero {...BASE_PROPS} />);
    expect(container.querySelector("[data-mesh-counter]")).toBeNull();
  });

  test("decorativeNumber renders when provided", () => {
    const { container } = render(
      <GradientMeshHero {...BASE_PROPS} decorativeNumber="1" />
    );
    const numeral = container.querySelector("[data-mesh-decorative-numeral]");
    expect(numeral).toBeTruthy();
    expect(numeral.textContent).toBe("1");
    // The decorative numeral is aria-hidden (pure ornament).
    expect(numeral.getAttribute("aria-hidden")).toBe("true");
  });

  test("decorativeNumber is omitted when not provided", () => {
    const { container } = render(<GradientMeshHero {...BASE_PROPS} />);
    expect(container.querySelector("[data-mesh-decorative-numeral]")).toBeNull();
  });

  test("fires onEditCase when the edit affordance is clicked", () => {
    const onEdit = vi.fn();
    render(<GradientMeshHero {...BASE_PROPS} onEditCase={onEdit} />);
    const btn = screen.getByRole("button", { name: /edit case/i });
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test("omits the edit button when onEditCase is absent", () => {
    render(<GradientMeshHero {...BASE_PROPS} />);
    expect(screen.queryByRole("button", { name: /edit case/i })).toBeNull();
  });

  test("renders 4-6 mesh blob background elements", () => {
    const { container } = render(<GradientMeshHero {...BASE_PROPS} />);
    const blobs = container.querySelectorAll("[data-mesh-blob]");
    expect(blobs.length).toBeGreaterThanOrEqual(4);
    expect(blobs.length).toBeLessThanOrEqual(6);
    // Every blob is absolutely positioned and pointer-events disabled
    // so it never intercepts clicks intended for the typography layer.
    blobs.forEach((blob) => {
      expect(blob.style.position).toBe("absolute");
      expect(blob.style.pointerEvents).toBe("none");
    });
  });
});

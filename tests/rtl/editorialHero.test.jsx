// @vitest-environment jsdom
/* tests · RTL — EditorialHero (Wave 6 W6-B aesthetic).

   Pure presentation contract:
     1. Renders the syndrome name as the display headline.
     2. Renders the syndrome line as the italic standfirst.
     3. Renders patient chips with their labels.
     4. Fires onEditCase when the edit affordance is clicked.
     5. Omits the edit button when no callback is provided.
     6. Always renders the mono kicker "THE ANSWER · BEDSIDE". */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EditorialHero } from "../../src/components/EditorialHero.jsx";

afterEach(() => { cleanup(); });

const BASE_PROPS = {
  syndromeName: "Sepsis / septic shock",
  syndromeLine: "Empiric pip-tazo within the first hour; narrow at 48 h.",
  patientChips: [
    { label: "72M",       tone: "neutral" },
    { label: "CrCl 35",   tone: "ox" },
    { label: "MRSA",      tone: "amber" },
    { label: "severe β-lactam allergy", tone: "red" },
  ],
  riskLabels: ["MRSA", "Pseudomonas"],
};

describe("EditorialHero (RTL · jsdom)", () => {
  test("renders the syndrome name as the display headline", () => {
    render(<EditorialHero {...BASE_PROPS} />);
    const headline = screen.getByRole("heading", { level: 1 });
    expect(headline).toBeTruthy();
    expect(headline.textContent).toBe("Sepsis / septic shock");
  });

  test("renders the syndrome line as the standfirst", () => {
    render(<EditorialHero {...BASE_PROPS} />);
    expect(
      screen.getByText(/Empiric pip-tazo within the first hour/i)
    ).toBeTruthy();
  });

  test("renders every patient chip with its label", () => {
    render(<EditorialHero {...BASE_PROPS} />);
    expect(screen.getByText("72M")).toBeTruthy();
    expect(screen.getByText("CrCl 35")).toBeTruthy();
    expect(screen.getByText("MRSA")).toBeTruthy();
    expect(screen.getByText(/severe β-lactam allergy/i)).toBeTruthy();
  });

  test("fires onEditCase when the edit affordance is clicked", () => {
    const onEdit = vi.fn();
    render(<EditorialHero {...BASE_PROPS} onEditCase={onEdit} />);
    const btn = screen.getByRole("button", { name: /edit case/i });
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test("omits the edit button when onEditCase is absent", () => {
    render(<EditorialHero {...BASE_PROPS} />);
    expect(screen.queryByRole("button", { name: /edit case/i })).toBeNull();
  });

  test("renders the mono kicker 'The Answer · Bedside'", () => {
    render(<EditorialHero {...BASE_PROPS} />);
    // The kicker is rendered in title case in the DOM and visually upper-
    // cased via CSS text-transform. We assert the underlying text.
    expect(screen.getByText(/the answer · bedside/i)).toBeTruthy();
  });
});

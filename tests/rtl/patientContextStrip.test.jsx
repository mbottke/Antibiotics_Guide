// @vitest-environment jsdom
/* tests · RTL — PatientContextStrip (Wave 6 W6-B aesthetic).

   Covers the kinetic chip-strip contract:
     1. Each chip's label renders.
     2. data-tone attribute matches the supplied tone (or "neutral" by
        default).
     3. When chips is empty AND hideEmpty=true → nothing renders.
     4. Default eyebrow renders; eyebrow={null} suppresses it.
     5. Icon component renders inside the chip when provided.
     6. data-testid="patient-context-strip" is present on the container. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PatientContextStrip } from "../../src/components/PatientContextStrip.jsx";

afterEach(() => { cleanup(); });

/* Minimal lucide-like stub: a component that renders a recognizable SVG
   so we can assert it's inside the chip. Keeps the test free of
   lucide-react implementation details. */
function StubIcon(props) {
  return <svg data-testid="stub-icon" width={props.size || 11} height={props.size || 11} aria-hidden={props["aria-hidden"]} />;
}

describe("PatientContextStrip (RTL · jsdom)", () => {
  test("renders each chip's label", () => {
    render(
      <PatientContextStrip
        chips={[
          { label: "72M", tone: "primary" },
          { label: "CrCl 35", tone: "caution" },
          { label: "MRSA", tone: "alert" },
        ]}
      />,
    );
    expect(screen.getByText("72M")).toBeTruthy();
    expect(screen.getByText("CrCl 35")).toBeTruthy();
    expect(screen.getByText("MRSA")).toBeTruthy();
  });

  test("each chip carries the supplied data-tone attribute", () => {
    const { container } = render(
      <PatientContextStrip
        chips={[
          { label: "72M",          tone: "primary" },
          { label: "CrCl 35",      tone: "caution" },
          { label: "Severe",       tone: "alert" },
          { label: "Note",         tone: "neutral" },
          { label: "Cite",         tone: "info" },
        ]}
      />,
    );
    const chips = container.querySelectorAll("[data-pcs-chip]");
    expect(chips.length).toBe(5);
    expect(chips[0].getAttribute("data-tone")).toBe("primary");
    expect(chips[1].getAttribute("data-tone")).toBe("caution");
    expect(chips[2].getAttribute("data-tone")).toBe("alert");
    expect(chips[3].getAttribute("data-tone")).toBe("neutral");
    expect(chips[4].getAttribute("data-tone")).toBe("info");
  });

  test("defaults a chip without a tone to data-tone=\"neutral\"", () => {
    const { container } = render(
      <PatientContextStrip chips={[{ label: "untoned" }]} />,
    );
    const chip = container.querySelector("[data-pcs-chip]");
    expect(chip).toBeTruthy();
    expect(chip.getAttribute("data-tone")).toBe("neutral");
  });

  test("renders nothing when chips is empty AND hideEmpty is true", () => {
    const { container } = render(
      <PatientContextStrip chips={[]} hideEmpty />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("patient-context-strip")).toBeNull();
  });

  test("still renders the container when chips is empty and hideEmpty is false (default)", () => {
    render(<PatientContextStrip chips={[]} />);
    expect(screen.getByTestId("patient-context-strip")).toBeTruthy();
  });

  test("eyebrow label renders by default (\"Patient\")", () => {
    render(<PatientContextStrip chips={[{ label: "72M" }]} />);
    expect(screen.getByText("Patient")).toBeTruthy();
  });

  test("eyebrow={null} suppresses the eyebrow", () => {
    render(<PatientContextStrip chips={[{ label: "72M" }]} eyebrow={null} />);
    expect(screen.queryByText("Patient")).toBeNull();
    expect(screen.queryByTestId("patient-context-eyebrow")).toBeNull();
  });

  test("custom eyebrow renders when provided", () => {
    render(<PatientContextStrip chips={[{ label: "x" }]} eyebrow="Case" />);
    expect(screen.getByText("Case")).toBeTruthy();
  });

  test("icon component renders inside the chip when provided", () => {
    const { container } = render(
      <PatientContextStrip
        chips={[{ label: "CrCl 35", tone: "caution", icon: StubIcon }]}
      />,
    );
    const chip = container.querySelector("[data-pcs-chip]");
    expect(chip).toBeTruthy();
    const icon = chip.querySelector('[data-testid="stub-icon"]');
    expect(icon).toBeTruthy();
  });

  test("no icon node when chip.icon is omitted", () => {
    const { container } = render(
      <PatientContextStrip chips={[{ label: "72M", tone: "primary" }]} />,
    );
    const chip = container.querySelector("[data-pcs-chip]");
    expect(chip.querySelector('[data-testid="stub-icon"]')).toBeNull();
  });

  test("data-testid=\"patient-context-strip\" is present on the container", () => {
    render(<PatientContextStrip chips={[{ label: "x" }]} />);
    expect(screen.getByTestId("patient-context-strip")).toBeTruthy();
  });
});

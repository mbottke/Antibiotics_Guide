// @vitest-environment jsdom
/* tests · RTL — DurationBlock smoke + branch-click behavior.

   Wave 5 PR-11 sentinel suite continued. Verifies the structured
   duration block:
     • renders nothing when duration is null (graceful fallback)
     • renders headline + every branch label
     • emits onBranchSelect with the clicked branch label
     • stopWhen + extendIf items render as bulleted lists

   Pattern mirrors monitoringBlock.test.jsx — `// @vitest-environment
   jsdom` docblock + explicit cleanup. */

import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DurationBlock } from "../../src/components/DurationBlock.jsx";

afterEach(() => { cleanup(); });

const BASE_DURATION = {
  headline: "7 days after source control unless complicated.",
  evidence: "BALANCE 2024 — 7 vs 14 d non-inferior in controlled-source GNR BSI.",
  branches: [
    { label: "Uncomplicated", days: "7 d",
      detail: "Day 1 is the first negative blood culture." },
    { label: "Complicated",   days: "14 d",
      detail: "Endovascular focus, undrained source, or persistent BCx." },
  ],
  stopWhen: [
    "Afebrile ≥ 48 h",
    "Source controlled",
    "Off pressors",
  ],
  extendIf: [
    "Persistent BCx > 72 h",
    "New metastatic focus",
  ],
};

describe("DurationBlock (RTL · jsdom)", () => {
  test("renders nothing when duration is null", () => {
    const { container } = render(<DurationBlock duration={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders headline + both branch labels + days chips", () => {
    render(<DurationBlock duration={BASE_DURATION} />);
    expect(screen.getByText(/non-inferior/i)).toBeTruthy();
    expect(screen.getByText("Uncomplicated")).toBeTruthy();
    expect(screen.getByText("Complicated")).toBeTruthy();
    expect(screen.getByText("7 d")).toBeTruthy();
    expect(screen.getByText("14 d")).toBeTruthy();
  });

  test("renders stopWhen + extendIf bullets", () => {
    render(<DurationBlock duration={BASE_DURATION} />);
    expect(screen.getByText(/Afebrile ≥ 48 h/)).toBeTruthy();
    expect(screen.getByText(/Persistent BCx > 72 h/)).toBeTruthy();
  });

  test("clicking a branch fires onBranchSelect with that label", () => {
    const onSelect = vi.fn();
    render(<DurationBlock duration={BASE_DURATION} onBranchSelect={onSelect} />);
    const branchBtn = screen.getByText("Complicated").closest("button");
    expect(branchBtn).toBeTruthy();
    fireEvent.click(branchBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Branch select fires with the canonical label
    expect(onSelect.mock.calls[0][0]).toBe("Complicated");
  });
});

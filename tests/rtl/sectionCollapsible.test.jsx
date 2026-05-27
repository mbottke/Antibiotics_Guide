// @vitest-environment jsdom
/* tests · RTL — Section collapsible chevron (Wave 14).

   Verifies the per-panel minimize / expand affordance threaded into
   `Section` for every layer:
     • collapsible Section defaults to expanded (body visible,
       chevron aria-expanded="true")
     • clicking the chevron collapses the panel (body `hidden`,
       chevron aria-expanded="false") and writes "1" to sessionStorage
     • a pre-seeded sessionStorage entry of "1" makes the panel start
       collapsed
     • switching the `persistKey` prop re-syncs state from the new key
       (the new key's value wins, not the previous mount's state)

   The state lives in sessionStorage ONLY — NOT localStorage, NOT URL
   hash. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { Section } from "../../src/components/Section.jsx";

beforeEach(() => {
  try { window.sessionStorage.clear(); } catch (_e) { /* noop */ }
});

afterEach(() => {
  cleanup();
  try { window.sessionStorage.clear(); } catch (_e) { /* noop */ }
});

describe("Section collapsible (RTL · jsdom)", () => {
  test("defaults to expanded when no sessionStorage value present", () => {
    const { container } = render(
      <Section kicker="Test panel" id="ans-test" collapsible persistKey="ab_collapsed_cap_ans-test">
        <p data-testid="body">body content</p>
      </Section>,
    );
    const btn = container.querySelector("[data-section-collapse-toggle]");
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    const body = container.querySelector("[id='ans-test-body']");
    expect(body).toBeTruthy();
    expect(body.hasAttribute("hidden")).toBe(false);
  });

  test("clicking the chevron collapses the panel (body hidden, aria-expanded false)", () => {
    const { container } = render(
      <Section kicker="Test panel" id="ans-test" collapsible persistKey="ab_collapsed_cap_ans-test">
        <p>body content</p>
      </Section>,
    );
    const btn = container.querySelector("[data-section-collapse-toggle]");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    const body = container.querySelector("[id='ans-test-body']");
    expect(body.hasAttribute("hidden")).toBe(true);
    expect(window.sessionStorage.getItem("ab_collapsed_cap_ans-test")).toBe("1");
  });

  test("sessionStorage value of '1' makes the panel start collapsed", () => {
    window.sessionStorage.setItem("ab_collapsed_cap_ans-test", "1");
    const { container } = render(
      <Section kicker="Test panel" id="ans-test" collapsible persistKey="ab_collapsed_cap_ans-test">
        <p>body content</p>
      </Section>,
    );
    const btn = container.querySelector("[data-section-collapse-toggle]");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    const body = container.querySelector("[id='ans-test-body']");
    expect(body.hasAttribute("hidden")).toBe(true);
  });

  test("switching persistKey re-reads state from the new key", () => {
    // Key A = collapsed, key B = expanded.
    window.sessionStorage.setItem("ab_collapsed_capA_ans-test", "1");
    const { container, rerender } = render(
      <Section kicker="Test panel" id="ans-test" collapsible persistKey="ab_collapsed_capA_ans-test">
        <p>body content</p>
      </Section>,
    );
    let btn = container.querySelector("[data-section-collapse-toggle]");
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    // Switching to key B — no entry, so the panel should now be expanded.
    rerender(
      <Section kicker="Test panel" id="ans-test" collapsible persistKey="ab_collapsed_capB_ans-test">
        <p>body content</p>
      </Section>,
    );
    btn = container.querySelector("[data-section-collapse-toggle]");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    const body = container.querySelector("[id='ans-test-body']");
    expect(body.hasAttribute("hidden")).toBe(false);
  });
});

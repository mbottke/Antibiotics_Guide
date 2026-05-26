// @vitest-environment jsdom
/* tests · RTL — MiniTOC (Wave 7 W7-A).

   The MiniTOC component is a right-rail vertical list that auto-highlights
   the section currently in viewport (via IntersectionObserver) and lets the
   user click to smooth-scroll to a section.

   Coverage here:
     • renders one row per entry in `sections`
     • each row exposes its id via data-toc-row
     • the first row is active by default → bolder font weight + cyan ink
     • clicking another row calls scrollIntoView on the target element
     • reduced-motion → behavior is "auto" not "smooth", transitions = "none"
     • IntersectionObserver missing → renders without throwing */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { MiniTOC } from "../../src/components/MiniTOC.jsx";

const SECTIONS = [
  { id: "alpha",   label: "Alpha" },
  { id: "bravo",   label: "Bravo" },
  { id: "charlie", label: "Charlie" },
];

/* mountTargets — adds plain id-bearing divs to the document body so
   MiniTOC's IntersectionObserver setup + scrollIntoView click handler
   have something to chew on. */
function mountTargets() {
  const wrap = document.createElement("div");
  wrap.className = "rx-bedside-container";
  SECTIONS.forEach((s) => {
    const el = document.createElement("div");
    el.setAttribute("data-toc-section", s.id);
    el.id = s.id;
    wrap.appendChild(el);
  });
  document.body.appendChild(wrap);
  return wrap;
}

let observerInstances;
let origObserver;

beforeEach(() => {
  observerInstances = [];
  origObserver = global.IntersectionObserver;
  /* jsdom has no IntersectionObserver — provide a benign stub that
     records calls but never fires. Individual tests can opt in to
     dispatching observer callbacks via observerInstances[i].trigger(). */
  global.IntersectionObserver = class {
    constructor(cb, opts) {
      this.cb = cb;
      this.opts = opts;
      this.observed = [];
      observerInstances.push(this);
    }
    observe(el) { this.observed.push(el); }
    unobserve() {}
    disconnect() {}
    trigger(entries) { this.cb(entries); }
  };
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  global.IntersectionObserver = origObserver;
});

describe("MiniTOC (RTL · jsdom)", () => {
  test("renders one row per section", () => {
    mountTargets();
    const { container } = render(<MiniTOC sections={SECTIONS} />);
    const rows = container.querySelectorAll("[data-toc-row]");
    expect(rows.length).toBe(SECTIONS.length);
    SECTIONS.forEach((s, i) => {
      expect(rows[i].getAttribute("data-toc-row")).toBe(s.id);
      expect(rows[i].textContent).toContain(s.label);
    });
  });

  test("first section is active by default (bolder + cyan)", () => {
    mountTargets();
    const { container } = render(<MiniTOC sections={SECTIONS} />);
    const rows = container.querySelectorAll("[data-toc-row]");
    expect(rows[0].getAttribute("data-active")).toBe("true");
    expect(rows[0].style.fontWeight).toBe("700");
    expect(rows[1].getAttribute("data-active")).toBe("false");
    expect(rows[1].style.fontWeight).toBe("500");
  });

  test("clicking a row calls scrollIntoView on the target element", () => {
    const wrap = mountTargets();
    const target = wrap.querySelector('[data-toc-section="bravo"]');
    const spy = vi.fn();
    target.scrollIntoView = spy;

    const { container } = render(<MiniTOC sections={SECTIONS} />);
    const bravoRow = container.querySelector('[data-toc-row="bravo"]');
    fireEvent.click(bravoRow);

    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    expect(arg).toMatchObject({ behavior: "smooth", block: "start" });
  });

  test("click marks the clicked row active", () => {
    mountTargets();
    const target = document.querySelector('[data-toc-section="charlie"]');
    target.scrollIntoView = () => {};

    const { container } = render(<MiniTOC sections={SECTIONS} />);
    const charlieRow = container.querySelector('[data-toc-row="charlie"]');
    fireEvent.click(charlieRow);
    expect(charlieRow.getAttribute("data-active")).toBe("true");
  });

  test("respects prefers-reduced-motion → scroll behavior auto + no transition", () => {
    /* override matchMedia to claim the user prefers reduced motion */
    const origMM = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: q.indexOf("reduce") !== -1,
      media: q, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {},
      dispatchEvent: () => false,
    });

    try {
      mountTargets();
      const target = document.querySelector('[data-toc-section="bravo"]');
      const spy = vi.fn();
      target.scrollIntoView = spy;

      const { container } = render(<MiniTOC sections={SECTIONS} />);
      const bravoRow = container.querySelector('[data-toc-row="bravo"]');
      fireEvent.click(bravoRow);

      expect(spy.mock.calls[0][0]).toMatchObject({ behavior: "auto" });
      /* row transition is suppressed */
      expect(bravoRow.style.transition).toBe("none");
    } finally {
      window.matchMedia = origMM;
    }
  });

  test("renders gracefully when IntersectionObserver is undefined", () => {
    global.IntersectionObserver = undefined;
    mountTargets();
    const { container } = render(<MiniTOC sections={SECTIONS} />);
    expect(container.querySelectorAll("[data-toc-row]").length).toBe(SECTIONS.length);
  });

  test("returns null when sections list is empty", () => {
    const { container } = render(<MiniTOC sections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("nav has aria-label='On this page'", () => {
    mountTargets();
    const { container } = render(<MiniTOC sections={SECTIONS} />);
    const nav = container.querySelector("nav");
    expect(nav).toBeTruthy();
    expect(nav.getAttribute("aria-label")).toBe("On this page");
  });
});

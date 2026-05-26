// @vitest-environment jsdom
/* tests · RTL — StickySubTOC (Wave 9 W9 in-section navigation).

   Verifies the horizontal pill row + rail variants render every item,
   the first item is initially active, click-to-jump invokes
   scrollIntoView on the matching anchor, the data-active attribute
   flips on click, and the sticky top offset prop reaches the style. */

import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import { StickySubTOC } from "../../src/components/decor/StickySubTOC.jsx";

// Polyfill IntersectionObserver for the test environment so the hook
// effect doesn't blow up. We don't fire entries — the component's
// initial active = items[0].id is sufficient for the assertions below.
class MockIO {
  constructor(cb, opts) { this.cb = cb; this.opts = opts; this.observed = []; }
  observe(el) { this.observed.push(el); }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  // @ts-expect-error patch JSDOM
  global.IntersectionObserver = MockIO;
  // @ts-expect-error patch JSDOM
  window.IntersectionObserver = MockIO;
});
afterEach(() => { cleanup(); });

const ITEMS = [
  { id: "alpha",   label: "Alpha"   },
  { id: "bravo",   label: "Bravo"   },
  { id: "charlie", label: "Charlie" },
];

function renderWithAnchors(extraProps = {}) {
  return render(
    <div>
      <StickySubTOC items={ITEMS} {...extraProps} />
      <div id="alpha"  style={{ height: 200 }}>A</div>
      <div id="bravo"  style={{ height: 200 }}>B</div>
      <div id="charlie" style={{ height: 200 }}>C</div>
    </div>
  );
}

describe("StickySubTOC (RTL · jsdom)", () => {
  test("renders nothing when items is empty", () => {
    const { container } = render(<StickySubTOC items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders every item label in horizontal variant", () => {
    renderWithAnchors();
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Bravo")).toBeTruthy();
    expect(screen.getByText("Charlie")).toBeTruthy();
  });

  test("first item is active on mount", () => {
    renderWithAnchors();
    const alphaLink = screen.getByText("Alpha").closest("a");
    expect(alphaLink && alphaLink.getAttribute("data-active")).toBe("true");
  });

  test("clicking an item flips data-active to it", () => {
    // jsdom: stub scrollIntoView so the navigation step doesn't throw.
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    renderWithAnchors();
    const bravoLink = screen.getByText("Bravo").closest("a");
    fireEvent.click(bravoLink);
    expect(bravoLink.getAttribute("data-active")).toBe("true");
    expect(spy).toHaveBeenCalled();
  });

  test("uses default top offset of 88px", () => {
    const { container } = renderWithAnchors();
    const nav = container.querySelector("[data-sticky-subtoc]");
    const style = nav.getAttribute("style") || "";
    expect(style).toContain("top: 88px");
  });

  test("topOffset prop overrides the sticky top value", () => {
    const { container } = renderWithAnchors({ topOffset: 120 });
    const nav = container.querySelector("[data-sticky-subtoc]");
    const style = nav.getAttribute("style") || "";
    expect(style).toContain("top: 120px");
  });

  test("rail variant renders with data-sticky-subtoc=rail", () => {
    const { container } = render(
      <div>
        <StickySubTOC items={ITEMS} variant="rail" />
      </div>
    );
    const nav = container.querySelector("[data-sticky-subtoc='rail']");
    expect(nav).toBeTruthy();
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  test("uses the provided ariaLabel", () => {
    const { container } = renderWithAnchors({ ariaLabel: "Section navigation" });
    const nav = container.querySelector("[data-sticky-subtoc]");
    expect(nav.getAttribute("aria-label")).toBe("Section navigation");
  });

  test("horizontal variant marks itself with data-sticky-subtoc=horizontal", () => {
    const { container } = renderWithAnchors();
    expect(container.querySelector("[data-sticky-subtoc='horizontal']")).toBeTruthy();
  });
});

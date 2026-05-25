// @vitest-environment jsdom
/* tests · RTL — FocusReveal wrapper (Wave 6 W6-B).

   Tiny structural surface — assert the right class lands, the
   delay shows up as inline animationDelay, polymorphic `as` works,
   and additional props pass through. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FocusReveal } from "../../src/components/util/FocusReveal.jsx";

afterEach(() => { cleanup(); });

describe("FocusReveal (RTL · jsdom)", () => {
  test("default variant applies rx-reveal class", () => {
    const { container } = render(<FocusReveal>hi</FocusReveal>);
    expect(container.firstChild.className).toContain("rx-reveal");
    expect(container.firstChild.className).not.toContain("rx-reveal-fast");
  });

  test("variant='fast' applies rx-reveal-fast class", () => {
    const { container } = render(<FocusReveal variant="fast">hi</FocusReveal>);
    expect(container.firstChild.className).toContain("rx-reveal-fast");
  });

  test("variant='fade' applies rx-fade class", () => {
    const { container } = render(<FocusReveal variant="fade">hi</FocusReveal>);
    expect(container.firstChild.className).toContain("rx-fade");
  });

  test("delay prop surfaces as animationDelay inline style", () => {
    const { container } = render(<FocusReveal delay={150}>hi</FocusReveal>);
    expect(container.firstChild.style.animationDelay).toBe("150ms");
  });

  test("no delay → no animationDelay inline style", () => {
    const { container } = render(<FocusReveal>hi</FocusReveal>);
    expect(container.firstChild.style.animationDelay).toBe("");
  });

  test("polymorphic `as` prop swaps the rendered element", () => {
    const { container } = render(<FocusReveal as="section">hi</FocusReveal>);
    expect(container.firstChild.tagName).toBe("SECTION");
  });

  test("additional style props merge with animationDelay", () => {
    const { container } = render(
      <FocusReveal delay={80} style={{ padding: 12 }}>hi</FocusReveal>,
    );
    expect(container.firstChild.style.animationDelay).toBe("80ms");
    expect(container.firstChild.style.padding).toBe("12px");
  });

  test("additional HTML props pass through", () => {
    const { container } = render(
      <FocusReveal data-testid="my-reveal" aria-label="reveal">hi</FocusReveal>,
    );
    expect(container.firstChild.getAttribute("data-testid")).toBe("my-reveal");
    expect(container.firstChild.getAttribute("aria-label")).toBe("reveal");
  });

  test("renders children verbatim", () => {
    const { container } = render(<FocusReveal><span>inner</span></FocusReveal>);
    expect(container.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.textContent).toBe("inner");
  });
});

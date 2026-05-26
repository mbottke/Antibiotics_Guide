// @vitest-environment jsdom
/* tests · RTL — SceneBreak (Wave 12 W12 hierarchical breathing rooms).

   Surface contract:
     · all four variants mount and emit a [data-scene-break] root
     · the non-minimal variants render two flanking hairlines + a
       central mark element
     · the central mark renders the variant-appropriate testid
     · the minimal variant emits no central mark — just the hairline
     · the unknown-variant fallback degrades to "phrase"
     · the SceneBreak is decoration: role="presentation" + aria-hidden
     · pass-through className + style props are honoured. */

import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SceneBreak } from "../../src/components/decor/SceneBreak.jsx";

afterEach(() => { cleanup(); });

describe("SceneBreak (RTL · jsdom)", () => {
  test("renders a presentation root with aria-hidden", () => {
    const { container } = render(<SceneBreak variant="phrase" mark="on de-escalation" />);
    const root = container.querySelector("[data-scene-break]");
    expect(root).toBeTruthy();
    expect(root.getAttribute("role")).toBe("presentation");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  test("numeral variant renders the italic-serif numeral mark", () => {
    const { container } = render(<SceneBreak variant="numeral" mark="02" />);
    const root = container.querySelector("[data-scene-break]");
    expect(root.getAttribute("data-variant")).toBe("numeral");
    const numeral = container.querySelector("[data-testid='scene-break-mark-numeral']");
    expect(numeral).toBeTruthy();
    expect(numeral.textContent).toBe("02");
  });

  test("phrase variant renders the italic-serif phrase mark", () => {
    const { container } = render(<SceneBreak variant="phrase" mark="evidence overlay" />);
    const phrase = container.querySelector("[data-testid='scene-break-mark-phrase']");
    expect(phrase).toBeTruthy();
    expect(phrase.textContent).toContain("evidence overlay");
  });

  test("phrase variant honours an optional kicker", () => {
    const { container } = render(
      <SceneBreak variant="phrase" mark="evidence overlay" kicker="Chapter" />,
    );
    const phrase = container.querySelector("[data-testid='scene-break-mark-phrase']");
    expect(phrase.textContent).toContain("Chapter");
    expect(phrase.textContent).toContain("evidence overlay");
  });

  test("ornament variant renders the SVG fleuron mark", () => {
    const { container } = render(<SceneBreak variant="ornament" />);
    const ornament = container.querySelector("[data-testid='scene-break-mark-ornament']");
    expect(ornament).toBeTruthy();
    expect(ornament.tagName.toLowerCase()).toBe("svg");
  });

  test("minimal variant renders just the hairline (no central mark)", () => {
    const { container } = render(<SceneBreak variant="minimal" />);
    const root = container.querySelector("[data-scene-break]");
    expect(root.getAttribute("data-variant")).toBe("minimal");
    expect(container.querySelector("[data-testid='scene-break-mark-numeral']")).toBeNull();
    expect(container.querySelector("[data-testid='scene-break-mark-phrase']")).toBeNull();
    expect(container.querySelector("[data-testid='scene-break-mark-ornament']")).toBeNull();
    // The minimal variant still has the data-scene-break-mark hairline child.
    expect(root.querySelector("[data-scene-break-mark]")).toBeTruthy();
  });

  test("unknown variant falls back to the phrase variant", () => {
    const { container } = render(<SceneBreak variant="bogus" mark="hi" />);
    const root = container.querySelector("[data-scene-break]");
    expect(root.getAttribute("data-variant")).toBe("phrase");
    expect(container.querySelector("[data-testid='scene-break-mark-phrase']")).toBeTruthy();
  });

  test("className + style props pass through", () => {
    const { container } = render(
      <SceneBreak variant="numeral" mark="03" className="rx-test-class" style={{ marginTop: 99 }} />,
    );
    const root = container.querySelector("[data-scene-break]");
    expect(root.className).toContain("rx-test-class");
    expect((root.getAttribute("style") || "").replace(/\s+/g, "")).toContain("margin-top:99px");
  });

  test("injects the reduced-motion-gated style block exactly once", () => {
    render(<SceneBreak variant="phrase" mark="a" />);
    render(<SceneBreak variant="ornament" />);
    const styles = document.head.querySelectorAll("style[data-scene-break-styles]");
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain("prefers-reduced-motion");
  });

  test("numeral variant flanks the mark with two hairlines", () => {
    const { container } = render(<SceneBreak variant="numeral" mark="01" />);
    const root = container.querySelector("[data-scene-break]");
    // The two flanking hairlines are direct <span> children with the
    // gradient backgrounds; the mark sits between them.
    const children = root.children;
    expect(children.length).toBe(3);
  });
});

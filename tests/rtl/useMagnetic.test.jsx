// @vitest-environment jsdom
/* tests · RTL — useMagnetic hook.

   The cursor-magnetic pull on buttons added a document-level mousemove
   listener per hook instance — N magnetic buttons = N listeners
   sharing the global pointer stream, which caused jagged pop / settle
   behavior on the bedside surface. The hook was reduced to a no-op so
   the `.rx-magnetic` className and ref pattern at call sites keep
   working; this suite locks in the no-op contract. */

import React, { useRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useMagnetic } from "../../src/components/util/useMagnetic.js";

afterEach(() => { cleanup(); });

function Host({ opts }) {
  const ref = useRef(null);
  useMagnetic(ref, opts);
  return <button ref={ref} className="rx-magnetic" data-testid="m">go</button>;
}

describe("useMagnetic (RTL · jsdom · no-op)", () => {
  test("mount does not attach a document mousemove listener", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    render(<Host />);
    const added = addSpy.mock.calls.find((c) => c[0] === "mousemove");
    expect(added).toBeFalsy();
    addSpy.mockRestore();
  });

  test("mount does not write an inline transform on the host", () => {
    const { getByTestId } = render(<Host opts={{ strength: 0.4, range: 100 }} />);
    const host = getByTestId("m");
    expect(host.style.transform).toBe("");
  });

  test("renders the magnetic host element with the className intact", () => {
    const { getByTestId } = render(<Host opts={{ strength: 0.4, range: 100 }} />);
    const host = getByTestId("m");
    expect(host).toBeTruthy();
    expect(host.className).toContain("rx-magnetic");
  });

  test("unmount completes cleanly", () => {
    const { unmount } = render(<Host />);
    expect(() => unmount()).not.toThrow();
  });
});

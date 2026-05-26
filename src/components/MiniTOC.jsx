/* component · MiniTOC (Wave 7 W7-A) — right-rail mini table-of-contents.

   A sticky vertical list of section dots + labels that auto-highlights
   the entry whose section is currently in the viewport. The user can
   click an entry to smooth-scroll there.

   Each row is a small filled circle + a mono uppercase label. The active
   row's dot grows from 8 → 10 px, picks up the neon-cyan glow, and the
   label flips to bold cyan. A thin line on the left of the rail ties the
   entries together visually.

   Sections are discovered via IntersectionObserver — the component walks
   the DOM under `rootSelector` (default ".rx-bedside-container") looking
   for elements that match `data-toc-section="<id>"` (or whose id matches
   one in the passed-in `sections` array). When IntersectionObserver isn't
   available (jsdom, very old browsers) the observer is silently skipped
   and the rail still renders — just without active-section tracking.

   The component carries no integration logic — it's a leaf the integrator
   drops into the bedside layout when desired.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "./util/useReducedMotion.js";

function MiniTOC({
  sections,
  rootSelector = ".rx-bedside-container",
  className,
  style,
}) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(() => {
    return sections && sections.length ? sections[0].id : null;
  });
  /* visibility ratios keyed by id; we recompute the best candidate
     whenever the observer fires. */
  const ratiosRef = useRef({});

  const ids = useMemo(
    () => (sections || []).map(s => s.id),
    [sections],
  );

  useEffect(() => {
    if(typeof document === "undefined") return undefined;
    if(typeof IntersectionObserver === "undefined") return undefined;
    if(!ids.length) return undefined;

    const root = rootSelector ? document.querySelector(rootSelector) : null;
    /* Collect both the elements that explicitly tag themselves with
       data-toc-section AND any plain elements by id from `sections`.
       We do the union so the component is friendly to integrators who
       only have plain id="..." headings to point at. */
    const scope = root || document;
    const seen = new Set();
    const elements = [];
    ids.forEach((id) => {
      const byAttr = scope.querySelector('[data-toc-section="' + id + '"]');
      if(byAttr && !seen.has(byAttr)) { seen.add(byAttr); elements.push({ el: byAttr, id }); }
      const byId = scope.querySelector('#' + (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id));
      if(byId && !seen.has(byId)) { seen.add(byId); elements.push({ el: byId, id }); }
    });

    if(!elements.length) return undefined;

    ratiosRef.current = {};

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-toc-section")
          || entry.target.id;
        if(!id) return;
        ratiosRef.current[id] = entry.isIntersecting
          ? entry.intersectionRatio
          : 0;
      });
      /* Pick the id whose element is highest in the viewport — i.e.,
         the one with the largest intersectionRatio. Fall back to the
         first id with any visibility. */
      let best = null;
      let bestRatio = 0;
      ids.forEach((id) => {
        const r = ratiosRef.current[id] || 0;
        if(r > bestRatio) { bestRatio = r; best = id; }
      });
      if(best) setActiveId(best);
    }, {
      root: null,
      rootMargin: "-80px 0px -60% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    });

    elements.forEach(({ el }) => { try { obs.observe(el); } catch(e) {} });
    return () => { try { obs.disconnect(); } catch(e) {} };
  }, [ids, rootSelector]);

  function onClickRow(e, id) {
    e.preventDefault();
    if(typeof document === "undefined") return;
    const scope = (rootSelector ? document.querySelector(rootSelector) : null) || document;
    const target = scope.querySelector('[data-toc-section="' + id + '"]')
      || (typeof CSS !== "undefined" && CSS.escape
            ? scope.querySelector('#' + CSS.escape(id))
            : scope.querySelector('#' + id));
    if(!target || typeof target.scrollIntoView !== "function") {
      setActiveId(id);
      return;
    }
    try {
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    } catch(e) {
      target.scrollIntoView();
    }
    setActiveId(id);
  }

  if(!sections || !sections.length) return null;

  const transition = reducedMotion
    ? "none"
    : "transform var(--duration-fast, 120ms) var(--ease-out, ease-out), color var(--duration-fast, 120ms) var(--ease-out, ease-out)";
  const dotTransition = reducedMotion
    ? "none"
    : "all var(--duration-fast, 120ms) var(--ease-out, ease-out)";

  return (
    <nav
      aria-label="On this page"
      data-testid="mini-toc"
      className={className}
      style={{
        position: "sticky",
        top: 100,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingLeft: 12,
        borderLeft: "1px solid var(--line)",
        fontFamily: "var(--mono)",
        fontSize: 10,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        ...(style || {}),
      }}>
      {sections.map((s) => {
        const active = s.id === activeId;
        return (
          <a
            key={s.id}
            href={"#" + s.id}
            data-toc-row={s.id}
            data-active={active ? "true" : "false"}
            onClick={(e) => onClickRow(e, s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 0",
              color: active ? "var(--neon-cyan, var(--ox))" : "var(--ink2)",
              fontWeight: active ? 700 : 500,
              textDecoration: "none",
              transition,
              transform: active ? "translateX(2px)" : "translateX(0)",
            }}>
            <span aria-hidden="true" style={{
              width: active ? 10 : 8,
              height: active ? 10 : 8,
              borderRadius: "50%",
              flex: "0 0 auto",
              background: active ? "var(--neon-cyan, var(--ox))" : "var(--line)",
              boxShadow: active ? "var(--neon-cyan-glow, 0 0 0 transparent)" : "none",
              transition: dotTransition,
            }} />
            <span>{s.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export { MiniTOC };
export default MiniTOC;

/* component · StickySubTOC — Wave 9 W9 in-section navigation.

   A compact sticky sub-table-of-contents that lives INSIDE a section
   panel. Renders a horizontal pill row of sub-section labels with the
   active one highlighted. Optional left-rail variant for wider
   viewports (≥1100px) shows a vertical dotted list.

   Behaviour
     • Sticky at `top: 88px` so it clears the global ScrollHeader.
     • Active item is determined by IntersectionObserver on the
       referenced sub-section anchors (id="sub-…").
     • Click → smooth-scroll to the target (auto when reduced-motion).

   USAGE
     <StickySubTOC items={[
       { id: "duration", label: "Duration" },
       { id: "opat",     label: "OPAT" },
       { id: "ivpo",     label: "IV → PO" },
     ]} />

   The consumer is responsible for rendering anchors that match
   each item.id (e.g. `<div id="duration">…`). The component does NOT
   inject anchors — it only observes and navigates.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import React, { useEffect, useState, useRef } from "react";

const W9_GLASS_BG     = "rgba(252, 251, 248, 0.92)";
const W9_GLASS_BORDER = "var(--w7-glass-border, var(--line, #E6E0D8))";
const CYAN_BRIGHT     = "var(--neon-cyan, var(--w7-neon, var(--ox, #0F4C81)))";
const CYAN_SOFT       = "var(--neon-cyan-soft, rgba(0, 212, 255, 0.10))";
const CYAN_LINE       = "var(--neon-cyan-line, rgba(0, 212, 255, 0.32))";

export function StickySubTOC({
  items = [],
  variant = "horizontal",   // "horizontal" | "rail"
  topOffset = 88,
  ariaLabel = "Sub-section navigation",
  className,
  style,
}) {
  const [active, setActive] = useState(items[0]?.id || null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!items.length) return undefined;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return undefined;

    // Track visibility ratio per id; on each batch, pick the most-
    // visible candidate. Using rootMargin to bias toward the top of
    // the viewport (the sticky TOC sits at ~88px down).
    const visibility = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visibility.set(e.target.id, e.intersectionRatio);
        }
        let best = null;
        let bestRatio = 0;
        for (const id of visibility.keys()) {
          const r = visibility.get(id) || 0;
          if (r > bestRatio) { bestRatio = r; best = id; }
        }
        if (best && bestRatio > 0) setActive(best);
      },
      {
        rootMargin: `-${topOffset + 16}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );
    observerRef.current = obs;

    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    }
    return () => { obs.disconnect(); observerRef.current = null; };
  }, [items, topOffset]);

  const onJump = (e, id) => {
    e.preventDefault();
    const el = (typeof document !== "undefined") ? document.getElementById(id) : null;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  if (!items.length) return null;

  if (variant === "rail") {
    return (
      <nav
        data-sticky-subtoc="rail"
        aria-label={ariaLabel}
        className={className}
        style={{
          position: "sticky",
          top: topOffset,
          background: W9_GLASS_BG,
          backdropFilter: "saturate(140%) blur(12px)",
          WebkitBackdropFilter: "saturate(140%) blur(12px)",
          border: "1px solid " + W9_GLASS_BORDER,
          borderRadius: "12px 3px 12px 3px",
          padding: "10px 12px",
          width: 188,
          ...style,
        }}
      >
        <div style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted, #6E675E)",
          marginBottom: 8,
        }}>On this page</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
          {items.map((it) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a
                  href={"#" + it.id}
                  data-active={on ? "true" : "false"}
                  onClick={(e) => onJump(e, it.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 6px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: on ? 700 : 500,
                    color: on ? CYAN_BRIGHT : "var(--ink2, #4a4a4a)",
                    background: on ? CYAN_SOFT : "transparent",
                    border: on ? "1px solid " + CYAN_LINE : "1px solid transparent",
                    textDecoration: "none",
                    transition: "color var(--duration-fast, .12s) var(--ease-out, ease), background var(--duration-fast, .12s) var(--ease-out, ease)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: on ? CYAN_BRIGHT : "var(--line, #d8d4cc)",
                      boxShadow: on ? "0 0 6px " + CYAN_BRIGHT : "none",
                      flex: "0 0 auto",
                    }}
                  />
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  // Horizontal variant (default)
  return (
    <nav
      data-sticky-subtoc="horizontal"
      aria-label={ariaLabel}
      className={className}
      style={{
        position: "sticky",
        top: topOffset,
        zIndex: 6,
        background: W9_GLASS_BG,
        backdropFilter: "saturate(140%) blur(12px)",
        WebkitBackdropFilter: "saturate(140%) blur(12px)",
        border: "1px solid " + W9_GLASS_BORDER,
        borderRadius: "12px 3px 12px 3px",
        padding: "8px 10px",
        margin: "12px 0 16px",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.08)",
        display: "flex",
        gap: 6,
        overflowX: "auto",
        maxWidth: "100%",
        minWidth: 0,
        WebkitOverflowScrolling: "touch",
        alignItems: "center",
        ...style,
      }}
    >
      <span style={{
        flex: "0 0 auto",
        fontFamily: "var(--mono)",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted, #6E675E)",
        paddingRight: 6,
        borderRight: "1px solid " + W9_GLASS_BORDER,
        marginRight: 4,
      }}>Jump</span>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <a
            key={it.id}
            href={"#" + it.id}
            data-active={on ? "true" : "false"}
            onClick={(e) => onJump(e, it.id)}
            style={{
              flex: "0 0 auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: on ? 700 : 600,
              color: on ? "#fff" : "var(--ink2, #4a4a4a)",
              background: on
                ? "linear-gradient(135deg, var(--electric-blue, var(--ox, #0F4C81)), " + CYAN_BRIGHT + ")"
                : "transparent",
              border: on ? "1px solid " + CYAN_LINE : "1px solid " + W9_GLASS_BORDER,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "color var(--duration-fast, .12s) var(--ease-out, ease), background var(--duration-fast, .12s) var(--ease-out, ease), border-color var(--duration-fast, .12s) var(--ease-out, ease)",
              boxShadow: on ? "0 0 14px -4px " + CYAN_BRIGHT : "none",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: on ? "#fff" : CYAN_BRIGHT,
                opacity: on ? 0.9 : 0.6,
              }}
            />
            {it.label}
          </a>
        );
      })}
    </nav>
  );
}

export default StickySubTOC;

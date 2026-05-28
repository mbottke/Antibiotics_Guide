/* component · SectionNav — Phase B1 of the Wave 2 reference restructure.
   Wave 8 W8 chrome pass — converted the flat tablist into a chips-rail
   with asymmetric 8/3 corners, a cyan-gradient active state, a soft
   neon glow under the active chip, and a 2px gradient progress strip
   that slides under the active tab.

   The 5-section primary nav that replaces the flat 11-tab bar. Sits
   ABOVE the section-scoped tab sub-nav so the user picks the question
   class first ("Am I looking up a syndrome? An agent? An organism?")
   and then narrows inside the section.

   Mobile (< 760 px): the row scrolls horizontally rather than wrapping,
   so the nav stays compact on phones. Keyboard: Tab through, Enter or
   Space to select. ⌘K palette indexes section names too (Phase B7).

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { SECTIONS } from "../data/sections.js";
import { SectionInkTrail } from "./SectionTransitions.jsx";

/* Cyan progress-strip gradient — matches the bedside scroll header so
   every chrome surface speaks the same accent language. */
const STRIP_GRADIENT =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

/* Active-chip background — cyan-deep → cyan-bright diagonal so the
   active tab reads as a "lit" element rather than a flat fill. */
const ACTIVE_BG =
  "linear-gradient(135deg," +
  " var(--ox-deep, #0B0F14) 0%," +
  " var(--ox, #1F2937) 45%," +
  " var(--neon-cyan, #00D4FF) 240%)";

function NavChip({ s, active, onClick, registerRef, pulse, returning }) {
  const Icon = s.icon;
  const [hover, setHover] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if(registerRef) registerRef(s.id, ref.current);
  }, [s.id, registerRef]);

  const lifted = hover && !active;

  return (
    <button
      ref={ref}
      key={s.id}
      type="button"
      aria-pressed={active}
      title={s.hint}
      onClick={() => onClick && onClick(s.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="rx-magnetic rx-focus-halo"
      data-section-chip={s.id}
      data-w12-pulse={pulse ? "true" : undefined}
      data-w12-returning={returning ? "true" : undefined}
      style={{
        flex: "0 0 auto",
        position: "relative",
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--sans)", fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? "#fff" : (lifted ? "var(--ink)" : "var(--ink2)"),
        background: active ? ACTIVE_BG : "var(--paper)",
        border: "1px solid " + (active
          ? "var(--neon-cyan, var(--ox))"
          : lifted ? "var(--neon-cyan-line, var(--ox-line))" : "var(--line)"),
        /* Asymmetric 8/3 corner pair — the defining shape of every
            chrome chip in W8 chrome. */
        borderRadius: "8px 3px 8px 3px",
        padding: "7px 14px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        /* Hover budget is translateY(-1px) (PR #151 calm-motion reset);
            active sits flat but carries a permanent cyan glow. */
        transform: lifted ? "translateY(-1px)" : "translateY(0)",
        boxShadow: active
          ? "0 6px 18px -4px rgba(0, 212, 255, 0.45), 0 1px 0 rgba(255,255,255,.10) inset"
          : (lifted ? "0 4px 14px -6px rgba(0, 212, 255, 0.30)" : "none"),
        transition:
          "background var(--duration-base, .18s) var(--ease-out, ease-out)," +
          " color var(--duration-base, .18s) var(--ease-out, ease-out)," +
          " border-color var(--duration-base, .18s) var(--ease-out, ease-out)," +
          " box-shadow var(--duration-base, .18s) var(--ease-out, ease-out)," +
          " transform var(--duration-base, .18s) var(--ease-out, ease-out)",
      }}>
      <Icon size={14} aria-hidden /> {s.label}
    </button>
  );
}

const SectionNav = forwardRef(function SectionNav({ section, onSection, pulseId, isReturning, visited, trail, onOpenSettings }, navRef) {
  /* The bar is a navigation, not a strict tablist — section "panels" in
     App.jsx don't carry 1:1 ids because each section contains multiple
     tab panels. aria-pressed communicates active state cleanly; matches
     the SurfaceBar pattern above and avoids the axe-core
     aria-valid-attr-value violation that a tablist/aria-controls combo
     would trip when the controlled element doesn't exist. */
  const chipRefs = useRef({});
  const containerRef = useRef(null);
  /* W12 — expose the container element to the parent so the
     transition layer can compute ink-trail anchor rects against the
     chips. Forwarded ref is optional; if absent the nav still works
     identically to W8. */
  useEffect(() => {
    if(!navRef) return;
    if(typeof navRef === "function") navRef(containerRef.current);
    else navRef.current = containerRef.current;
  }, [navRef]);
  const [strip, setStrip] = useState({ left: 0, width: 0, visible: false });

  const register = (id, node) => {
    if(node) chipRefs.current[id] = node;
  };

  /* Recompute the strip's left/width after every paint where the
      active section changes — and also on resize, since the chips reflow
      on narrow viewports. */
  useEffect(() => {
    const recompute = () => {
      const node = chipRefs.current[section];
      const wrap = containerRef.current;
      if(!node || !wrap) {
        setStrip(s => ({ ...s, visible: false }));
        return;
      }
      const nr = node.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      setStrip({
        left:  nr.left - wr.left + wrap.scrollLeft,
        width: nr.width,
        visible: true,
      });
    };
    /* Defer one frame so the chip refs have laid out. */
    const raf = requestAnimationFrame(recompute);
    if(typeof window !== "undefined") {
      window.addEventListener("resize", recompute, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      if(typeof window !== "undefined") {
        window.removeEventListener("resize", recompute);
      }
    };
  }, [section]);

  return (
    <nav
      aria-label="Reference sections"
      data-testid="section-nav"
      style={{
        background: "var(--paper)",
        borderBottom: "1px solid var(--line)",
        position: "relative",
      }}>
      <div
        ref={containerRef}
        className="rx-section-nav-row"
        style={{
          maxWidth: 1180, margin: "0 auto",
          padding: "12px 22px 10px",
          display: "flex", alignItems: "center", gap: 8,
          overflowX: "auto",
          scrollbarWidth: "thin",
          position: "relative",
        }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--muted)", fontWeight: 600,
          flex: "0 0 auto", marginRight: 4,
        }}>Section</span>
        {SECTIONS.map(s => (
          <NavChip
            key={s.id}
            s={s}
            active={section === s.id}
            onClick={onSection}
            registerRef={register}
            pulse={pulseId === s.id}
            returning={!!(visited && visited.has(s.id) && section === s.id && isReturning)}
          />
        ))}
        {/* Wave 14 — gear/Settings affordance lives at the right edge
            of the section row (per user feedback to move it out of the
            global header strip). The flex spacer pushes it to the far
            right at all viewports; it sits inside the same horizontally
            scrollable container so it doesn't crowd the chips on narrow
            screens. Renders only when an onOpenSettings handler is
            wired, so isolated test mounts of SectionNav don't break. */}
        {onOpenSettings && (
          <>
            <span style={{ flex: "1 1 auto", minWidth: 0 }} />
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Settings"
              title="Settings"
              className="rx-focus-halo"
              style={{
                flex: "0 0 auto",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30,
                background: "rgba(255,255,255,.55)",
                border: "1px solid var(--line)",
                borderRadius: "6px 2px 6px 2px",
                color: "var(--ink2)",
                cursor: "pointer",
                padding: 0,
                transition:
                  "color var(--duration-base, .18s) var(--ease-out, ease)," +
                  " border-color var(--duration-base, .18s) var(--ease-out, ease)," +
                  " background var(--duration-base, .18s) var(--ease-out, ease)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ox)";
                e.currentTarget.style.borderColor = "var(--ox-line)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink2)";
                e.currentTarget.style.borderColor = "var(--line)";
              }}
            >
              <SettingsIcon size={15} aria-hidden />
            </button>
          </>
        )}
        {/* W12 · ink-trail overlay — paints a brief cyan brushstroke
            across the bar from the previous chip to the entering one
            on every section change. The component mounts inside the
            container so the trail's absolute coordinates inherit the
            same coordinate system the strip uses. */}
        <SectionInkTrail trail={trail} />
        {/* The 2px gradient progress strip that rides under the active
            chip. Anchored to the container so it can slide smoothly
            between chips with a single CSS transition on left+width. */}
        <span
          aria-hidden="true"
          data-testid="section-nav-active-strip"
          style={{
            position: "absolute",
            left: strip.left,
            width: strip.width,
            bottom: 4,
            height: 2,
            background: STRIP_GRADIENT,
            opacity: strip.visible ? 0.85 : 0,
            borderRadius: 2,
            pointerEvents: "none",
            transition:
              "left var(--duration-slow, .26s) var(--ease-out, ease-out)," +
              " width var(--duration-slow, .26s) var(--ease-out, ease-out)," +
              " opacity var(--duration-base, .18s) var(--ease-out, ease-out)",
            boxShadow: "0 0 10px rgba(0, 212, 255, 0.55)",
          }}
        />
      </div>
    </nav>
  );
});

export { SectionNav };

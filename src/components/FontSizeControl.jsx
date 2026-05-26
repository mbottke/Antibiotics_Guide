/* component · FontSizeControl — Phase D2 global text-size adjuster.
   Renders a compact - / 100% / + chip group that scales the entire
   app via CSS `zoom` on document.documentElement. The choice of
   `zoom` (over root font-size) is deliberate: the app uses pixel
   font sizes throughout, so a root font-size change would not
   propagate. `zoom` scales everything — text, padding, gaps,
   icons — proportionally, which is what bedside users want when
   they bump the size.

   Fine control: 5% steps from 80% to 150%. The current scale
   persists in localStorage so the choice survives reloads.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useEffect, useCallback } from "react";
import { Minus, Plus, Type } from "lucide-react";

const KEY = "rx-font-scale";
const MIN = 0.80;
const MAX = 1.50;
const STEP = 0.05;

function _clamp(n) { return Math.max(MIN, Math.min(MAX, n)); }
function _round(n) { return Math.round(n * 100) / 100; }

function _readStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if(!raw) return 1;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? _clamp(n) : 1;
  } catch { return 1; }
}

function FontSizeControl() {
  const [scale, setScale] = useState(_readStored);

  /* Apply scale to the document root. `zoom` is well-supported in
     all modern browsers (Chrome, Safari, Firefox 126+). Persist
     the value so reload preserves it. */
  useEffect(() => {
    document.documentElement.style.zoom = String(scale);
    try { localStorage.setItem(KEY, String(scale)); } catch {}
  }, [scale]);

  const dec = useCallback(() => setScale(s => _clamp(_round(s - STEP))), []);
  const inc = useCallback(() => setScale(s => _clamp(_round(s + STEP))), []);
  const reset = useCallback(() => setScale(1), []);

  const atMin = scale <= MIN + 0.001;
  const atMax = scale >= MAX - 0.001;
  const atDefault = Math.abs(scale - 1) < 0.001;

  /* W10 · cyan-accent spinner buttons + italic-serif tabular numeric
     display for the current %. The +/- buttons pick up var(--neon-cyan)
     on hover; the centre value uses var(--serif) italic-mega to match
     the kinetic-type vocabulary. */
  const btnStyle = (disabled) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 24, height: 24,
    background: "transparent",
    border: "none",
    /* Wave 11 — disabled state unified to the canvas-wide vocabulary:
       color var(--faint) + opacity 0.5 + cursor not-allowed. */
    color: disabled ? "var(--faint, var(--muted))" : "var(--ink2)",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    opacity: disabled ? 0.5 : 1,
    borderRadius: 999,
    transition: "color var(--duration-fast, .12s) var(--ease-out, ease), background var(--duration-fast, .12s) var(--ease-out, ease)",
  });

  return (
    <div
      role="group"
      aria-label="Text size"
      style={{
        display: "inline-flex", alignItems: "center",
        background: "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(245,250,253,0.55) 100%)",
        backdropFilter: "blur(12px) saturate(160%)",
        WebkitBackdropFilter: "blur(12px) saturate(160%)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "2px 4px",
        gap: 1,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(11,15,20,.05)",
      }}>
      <Type size={11} aria-hidden style={{ color:"var(--muted)", marginLeft: 5, marginRight: 4 }} />
      <button type="button"
        onClick={dec}
        disabled={atMin}
        aria-label="Decrease text size"
        title="Decrease text size"
        style={btnStyle(atMin)}
        onMouseEnter={(e) => { if(!atMin) e.currentTarget.style.color = "var(--neon-cyan, var(--ox))"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = atMin ? "var(--faint, var(--muted))" : "var(--ink2)"; }}>
        <Minus size={12} aria-hidden />
      </button>
      <button type="button"
        onClick={reset}
        disabled={atDefault}
        aria-label={`Reset text size (currently ${Math.round(scale*100)} percent)`}
        title="Reset to 100%"
        style={{
          minWidth: 38, height: 24,
          /* W10 · italic-serif tabular-numeric display, cyan when off-default. */
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 12,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          color: atDefault ? "var(--muted)" : "var(--ox)",
          background: "transparent", border: "none",
          padding: "0 4px",
          cursor: atDefault ? "default" : "pointer",
          letterSpacing: "-.01em",
          transition: "color var(--duration-base, .18s) var(--ease-out, ease)",
        }}>
        {Math.round(scale*100)}%
      </button>
      <button type="button"
        onClick={inc}
        disabled={atMax}
        aria-label="Increase text size"
        title="Increase text size"
        style={btnStyle(atMax)}
        onMouseEnter={(e) => { if(!atMax) e.currentTarget.style.color = "var(--neon-cyan, var(--ox))"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = atMax ? "var(--faint, var(--muted))" : "var(--ink2)"; }}>
        <Plus size={12} aria-hidden />
      </button>
    </div>
  );
}

export { FontSizeControl };

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

  const btnStyle = (disabled) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 24, height: 24,
    background: "transparent",
    border: "none",
    color: disabled ? "var(--muted)" : "var(--ink2)",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    opacity: disabled ? 0.4 : 1,
  });

  return (
    <div
      role="group"
      aria-label="Text size"
      style={{
        display: "inline-flex", alignItems: "center",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "2px 4px",
        gap: 1,
      }}>
      <Type size={11} aria-hidden style={{ color:"var(--muted)", marginLeft: 5, marginRight: 4 }} />
      <button type="button"
        onClick={dec}
        disabled={atMin}
        aria-label="Decrease text size"
        title="Decrease text size"
        style={btnStyle(atMin)}>
        <Minus size={12} aria-hidden />
      </button>
      <button type="button"
        onClick={reset}
        disabled={atDefault}
        aria-label={`Reset text size (currently ${Math.round(scale*100)} percent)`}
        title="Reset to 100%"
        style={{
          minWidth: 38, height: 24,
          fontFamily:"var(--mono)", fontSize:10.5, fontWeight:600,
          color: atDefault ? "var(--muted)" : "var(--ink2)",
          background: "transparent", border: "none",
          padding: "0 4px",
          cursor: atDefault ? "default" : "pointer",
          letterSpacing: ".02em",
        }}>
        {Math.round(scale*100)}%
      </button>
      <button type="button"
        onClick={inc}
        disabled={atMax}
        aria-label="Increase text size"
        title="Increase text size"
        style={btnStyle(atMax)}>
        <Plus size={12} aria-hidden />
      </button>
    </div>
  );
}

export { FontSizeControl };

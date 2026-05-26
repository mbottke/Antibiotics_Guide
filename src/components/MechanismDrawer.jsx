/* component · MechanismDrawer — Wave 5 PR-7 foundational-science drawer.
   Wave 8 W8 chrome pass — converted from a centered modal box into a
   right-side "full takeover" drawer with:
     • 80vw width on desktop, full-screen on mobile (≤768px)
     • backdrop-filter blur(20px) on the overlay
     • Asymmetric 24/4 corner radius on the panel
     • 4px cyan-gradient top-strip
     • 1px gradient hairline along the bottom of the header
     • Large mono kicker + 36–48px italic-serif drawer title
     • Pill close button with cyan accent + ripple

   Renders an authored MECHANISMS entry as a structured drawer:
   summary header + keypoints bullets + bedside "why it matters" +
   foundational biochemistry expand-on-demand + papers tail. Opens
   from ClassChip onClick (wired in PR-7b) and resistance-term
   chips. Returns null when the key has no authored entry — the
   graceful-fallback contract.

   The drawer is modal-style — overlay + Escape closes — to give
   it presence without consuming canvas vertical real-estate.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, X } from "lucide-react";
import { getMechanism } from "../data/mechanisms.js";
import { RichText } from "./util/richText.jsx";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";

/* Cyan-gradient strip painted along the top of every W8 drawer panel.
   Reads as a 4px "tab" of the chrome accent. */
const TOP_STRIP_BG =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

/* Hairline gradient — soft cyan→magenta at low alpha. */
const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.45) 18%," +
  " rgba(61, 122, 255, 0.45) 50%," +
  " rgba(255, 61, 188, 0.30) 82%," +
  " transparent 100%)";

function FamilyBadge({ family }) {
  const isRes = family === "resistance";
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
      letterSpacing: ".08em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 4,
      color: isRes ? "var(--red)" : "var(--ox)",
      background: isRes ? "var(--red-soft)" : "rgba(0, 212, 255, 0.08)",
      border: "1px solid " + (isRes ? "var(--red-line)" : "var(--neon-cyan-line, var(--ox-line))"),
    }}>
      {isRes ? "Resistance" : "Class"}
    </span>
  );
}

function CloseButton({ onClose, label }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label={label}
      className="rx-magnetic rx-shine-sweep rx-ripple"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "rgba(0, 212, 255, 0.06)",
        border: "1px solid var(--neon-cyan-line, var(--ox-line))",
        /* Asymmetric corners on the close pill — matches the panel itself. */
        borderRadius: "999px",
        padding: "5px 12px 5px 10px", cursor: "pointer",
        color: "var(--ink)",
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        transition: "background .18s, color .18s, border-color .18s",
      }}
    >
      <X size={12} aria-hidden /> Close
    </button>
  );
}

function MechanismDrawer({ mechanismKey, open, onClose }) {
  const [foundationalOpen, setFoundationalOpen] = useState(false);
  const entry = mechanismKey ? getMechanism(mechanismKey) : null;
  const dialogRef = useRef(null);

  /* Escape closes; reset foundational expand state when the drawer
     re-opens against a new key. */
  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if(open) setFoundationalOpen(false); }, [open, mechanismKey]);

  // WCAG 2.4.3 / 2.1.2 — trap focus inside open dialog, restore on close.
  useFocusTrap(dialogRef, open && !!entry);

  if(!open || !entry) return null;

  const accent = "var(--neon-cyan, var(--ox))";
  const accentBg = "rgba(0, 212, 255, 0.08)";

  /* Responsive panel sizing — full-screen on mobile (≤768px), 80vw on
     desktop. The maxWidth caps the panel at 960px on ultra-wide so
     the editorial measure stays readable. */
  const panelStyle = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    /* Asymmetric 24/4 corner pair — the defining shape of every W8
        drawer + modal. */
    borderRadius: "24px 4px 24px 4px",
    width: "min(80vw, 960px)",
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "26px 28px 24px",
    boxShadow: "var(--shadow-drawer)",
    outline: "none",
    position: "relative",
  };

  return (
    <div
      role="dialog"
      aria-label={`Mechanism · ${entry.title}`}
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.42)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "4vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
        data-testid="mechanism-drawer"
        className="rx-drawer-panel"
      >
        {/* 4px cyan-gradient top strip — anchors the drawer visually
            and signals "this is part of the chrome system." */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0, right: 0, top: 0,
            height: 4,
            background: TOP_STRIP_BG,
            borderTopLeftRadius: 24,
            pointerEvents: "none",
          }}
        />
        {/* Header — mono kicker on top, italic-serif drawer title beneath. */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          paddingBottom: 14,
          position: "relative",
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BookOpen size={14} color={accent} aria-hidden />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>
                Mechanism
              </span>
              <FamilyBadge family={entry.family} />
            </div>
            <h2 style={{
              /* The big editorial title — italic serif, 32–48px,
                  carries the editorial voice the W8 chrome inherits
                  from the BrandMark subtitle. */
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: "clamp(28px, 3.6vw, 48px)",
              fontWeight: 500,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.012em",
              lineHeight: 1.08,
            }}>
              {entry.title}
            </h2>
          </div>
          <CloseButton onClose={onClose} label="Close mechanism drawer" />
        </div>
        {/* Hairline gradient bottom border under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "0 0 20px",
          }}
        />

        {/* Summary */}
        {entry.summary && (
          <div style={{
            background: accentBg,
            border: "1px solid var(--neon-cyan-line, var(--ox-line))",
            /* Internal asymmetric blocks pick a smaller 12/3 pair so the
                hierarchy reads (panel = big asymmetric, block = small). */
            borderRadius: "12px 3px 12px 3px",
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
              <RichText text={entry.summary} accentColor={accent} />
            </div>
          </div>
        )}

        {/* Keypoints */}
        {Array.isArray(entry.keypoints) && entry.keypoints.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Keypoints
            </div>
            <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0, display: "grid", gap: 5 }}>
              {entry.keypoints.map((kp, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
                  <RichText text={kp} accentColor={accent} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bedside */}
        {entry.bedside && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Why it matters at the bedside
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
              <RichText text={entry.bedside} accentColor={accent} />
            </div>
          </div>
        )}

        {/* Foundational — collapsible */}
        {entry.foundational && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setFoundationalOpen((v) => !v)}
              aria-expanded={foundationalOpen}
              className="rx-magnetic"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", padding: 0,
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".12em",
                textTransform: "uppercase", cursor: "pointer",
                marginBottom: 8,
              }}
            >
              {foundationalOpen
                ? <ChevronDown size={12} aria-hidden />
                : <ChevronRight size={12} aria-hidden />}
              The biochemistry
            </button>
            {foundationalOpen && (
              <div style={{
                fontSize: 12.5, lineHeight: 1.6, color: "var(--ink2)",
                padding: "10px 12px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderRadius: "12px 3px 12px 3px",
              }}>
                <RichText text={entry.foundational} accentColor={accent} />
              </div>
            )}
          </div>
        )}

        {/* Papers */}
        {Array.isArray(entry.papers) && entry.papers.length > 0 && (
          <div>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Evidence
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 7 }}>
              {entry.papers.map((p, i) => (
                <li key={i} style={{
                  fontSize: 12, lineHeight: 1.5, color: "var(--ink)",
                  padding: "7px 10px",
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px 3px 8px 3px",
                }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  {p.year ? <span style={{ color: "var(--ink2)" }}> · {p.year}</span> : null}
                  {p.finding ? <span> — {p.finding}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export { MechanismDrawer };

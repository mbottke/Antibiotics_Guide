/* component · MechanismDrawer — Wave 5 PR-7 foundational-science drawer.

   Renders an authored MECHANISMS entry as a structured drawer:
   summary header + keypoints bullets + bedside "why it matters" +
   foundational biochemistry expand-on-demand + papers tail. Opens
   from ClassChip onClick (wired in PR-7b) and resistance-term
   chips. Returns null when the key has no authored entry — the
   graceful-fallback contract.

   Visual language matches the rest of the Answer Canvas:
     • Section chrome + kicker style (var(--ox) accent)
     • **bold** parser shared with DurationBlock / MonitoringBlock
     • Family badge: "class" or "resistance" in the header

   The drawer is modal-style — overlay + Escape closes — to give
   it presence without consuming canvas vertical real-estate.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, X } from "lucide-react";
import { getMechanism } from "../data/mechanisms.js";

/* Bold-callout parser — shared shape with MonitoringBlock /
   DurationBlock / RegimenOptions. */
function parseBold(text) {
  if(!text) return [];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while((m = re.exec(text)) !== null) {
    if(m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts;
}

function RichText({ text, accentColor }) {
  return (
    <>
      {parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{ fontWeight: 700, color: accentColor || "inherit" }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}

function FamilyBadge({ family }) {
  const isRes = family === "resistance";
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
      letterSpacing: ".08em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 4,
      color: isRes ? "#b91c1c" : "var(--ox)",
      background: isRes ? "rgba(185, 28, 28, 0.08)" : "rgba(15, 76, 129, 0.08)",
      border: "1px solid " + (isRes ? "rgba(185, 28, 28, 0.25)" : "var(--ox-line)"),
    }}>
      {isRes ? "Resistance" : "Class"}
    </span>
  );
}

function MechanismDrawer({ mechanismKey, open, onClose }) {
  const [foundationalOpen, setFoundationalOpen] = useState(false);
  const entry = mechanismKey ? getMechanism(mechanismKey) : null;

  /* Escape closes; reset foundational expand state when the drawer
     re-opens against a new key. */
  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if(open) setFoundationalOpen(false); }, [open, mechanismKey]);

  if(!open || !entry) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <div
      role="dialog"
      aria-label={`Mechanism · ${entry.title}`}
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "5vh 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          width: "min(720px, 100%)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "0 24px 48px -16px rgba(15, 23, 42, 0.35)",
        }}
        data-testid="mechanism-drawer"
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <BookOpen size={14} color={accent} aria-hidden />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".1em",
                textTransform: "uppercase",
              }}>
                Mechanism
              </span>
              <FamilyBadge family={entry.family} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              {entry.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mechanism drawer"
            style={{
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: 4, cursor: "pointer",
              color: "var(--ink2)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Summary */}
        {entry.summary && (
          <div style={{
            background: accentBg, border: "1px solid var(--ox-line)",
            borderRadius: 7, padding: "10px 12px", marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
              <RichText text={entry.summary} accentColor={accent} />
            </div>
          </div>
        )}

        {/* Keypoints */}
        {Array.isArray(entry.keypoints) && entry.keypoints.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".08em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Keypoints
            </div>
            <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0, display: "grid", gap: 4 }}>
              {entry.keypoints.map((kp, i) => (
                <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink)" }}>
                  <RichText text={kp} accentColor={accent} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bedside */}
        {entry.bedside && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".08em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Why it matters at the bedside
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.55, color: "var(--ink)" }}>
              <RichText text={entry.bedside} accentColor={accent} />
            </div>
          </div>
        )}

        {/* Foundational — collapsible */}
        {entry.foundational && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => setFoundationalOpen((v) => !v)}
              aria-expanded={foundationalOpen}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", padding: 0,
                fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".08em",
                textTransform: "uppercase", cursor: "pointer",
                marginBottom: 6,
              }}
            >
              {foundationalOpen
                ? <ChevronDown size={11} aria-hidden />
                : <ChevronRight size={11} aria-hidden />}
              The biochemistry
            </button>
            {foundationalOpen && (
              <div style={{
                fontSize: 11.5, lineHeight: 1.55, color: "var(--ink2)",
                padding: "8px 10px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderRadius: 6,
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
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".08em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Evidence
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
              {entry.papers.map((p, i) => (
                <li key={i} style={{
                  fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)",
                  padding: "6px 8px",
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: 5,
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

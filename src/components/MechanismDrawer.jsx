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

   Wave 10 W10 atomized internals pass — every section inside the drawer
   becomes a `.rx-glass-diffuse` panel with 14/4 asymmetric corners; section
   headers gain a 28×28 cyan-gradient icon tile + mono kicker; inter-section
   <GradientHairline variant="cyan-blue"> divides the editorial flow;
   paper citations get the chrome year-chip treatment (italic-serif cyan
   year + mono journal); keypoint bullets are chip-rows with a cyan
   light-ring leading dot; the foundational toggle is promoted to a
   chrome-cta; overlay scrim swapped to .rx-mercury-backdrop; panel
   slides in on a soft .rx-glow-trail (reduced-motion gated).

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
import { Beaker, BookOpen, ChevronDown, ChevronRight, GitBranch, Sparkles, X } from "lucide-react";
import { getMechanism } from "../data/mechanisms.js";
import { RichText } from "./util/richText.jsx";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { MeshWash } from "./decor/MeshWash.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";

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

/* 28×28 cyan-gradient icon tile — anchors every internal section header.
   Inherits the drawer's chrome vocabulary: small asymmetric 8/2 corners
   so it reads as a tile-of-a-tile, deep→bright cyan gradient with a
   soft inner highlight for the "pressed metal" sheen. */
function SectionTile({ Icon }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "0 0 auto",
        width: 28, height: 28,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "8px 2px 8px 2px",
        background:
          "linear-gradient(135deg," +
          " var(--ox-deep, #0B0F14) 0%," +
          " var(--electric-blue, var(--ox)) 45%," +
          " var(--neon-cyan, #00D4FF) 100%)",
        color: "#fff",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.35)," +
          " 0 2px 8px -2px rgba(0,212,255,.45)",
      }}
    >
      {Icon ? <Icon size={14} aria-hidden /> : null}
    </span>
  );
}

/* Mono kicker + 28×28 tile — used as the visual anchor at the top of
   every section panel inside the drawer. */
function SectionHeader({ Icon, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
    }}>
      <SectionTile Icon={Icon} />
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
        color: "var(--ink2)", letterSpacing: ".14em",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

/* Internal section panel — every editorial slice inside the drawer
   (summary, keypoints, bedside, foundational, papers) wears the same
   .rx-glass-diffuse + 14/4 asymmetric corners + 18px inner padding so
   the body reads as five interlocking glass cards rather than a wall
   of running text. */
function SectionPanel({ children, style }) {
  return (
    <section
      className="rx-glass-diffuse"
      style={{
        position: "relative",
        borderRadius: "14px 4px 14px 4px",
        padding: "16px 18px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* Paper citation row — italic-serif cyan year, mono uppercase journal/
   source, body finding text on a calm line below. Reads like a slim
   editorial bibliography card rather than a flat list item. */
function PaperRow({ paper }) {
  return (
    <li style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 12,
      alignItems: "baseline",
      padding: "8px 10px",
      background: "rgba(255, 255, 255, 0.45)",
      border: "1px solid var(--line)",
      borderLeft: "2px solid var(--neon-cyan, var(--ox))",
      borderRadius: "10px 3px 10px 3px",
    }}>
      <span aria-hidden style={{
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontSize: 18,
        fontWeight: 500,
        lineHeight: 1,
        color: "var(--neon-cyan, var(--ox))",
        letterSpacing: "-0.02em",
        textShadow: "0 0 12px rgba(0,212,255,.25)",
        minWidth: 38,
      }}>
        {paper.year || "·"}
      </span>
      <span style={{
        fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)",
      }}>
        <span style={{
          display: "inline",
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--ink2)",
          marginRight: 8,
        }}>
          {paper.name}
        </span>
        {paper.finding ? <span>— {paper.finding}</span> : null}
      </span>
    </li>
  );
}

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
      className="rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
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

/* Foundational toggle — promoted to a chrome-cta-styled pill so the
   "open the biochemistry" affordance reads as a deliberate CTA rather
   than a bare mono kicker with a chevron. Stays accessible — same
   aria-expanded contract, same icon-led label. */
function FoundationalToggle({ open, onToggle }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: open
          ? "linear-gradient(135deg, var(--ox-deep, #0B0F14) 0%, var(--ox, #1F2937) 55%, var(--neon-cyan, #00D4FF) 240%)"
          : "rgba(0, 212, 255, 0.08)",
        color: open ? "#fff" : "var(--ink)",
        border: "1px solid " + (open ? "var(--neon-cyan, var(--ox))" : "var(--neon-cyan-line, var(--ox-line))"),
        borderRadius: "10px 3px 10px 3px",
        padding: "7px 13px", cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
        letterSpacing: ".10em", textTransform: "uppercase",
        boxShadow: open
          ? "0 6px 18px -4px rgba(0,212,255,.50), inset 0 1px 0 rgba(255,255,255,.18)"
          : "none",
        transition: "background .2s, color .2s, border-color .2s, box-shadow .2s",
      }}
    >
      {open
        ? <ChevronDown size={12} aria-hidden />
        : <ChevronRight size={12} aria-hidden />}
      The biochemistry
    </button>
  );
}

function MechanismDrawer({ mechanismKey, open, onClose }) {
  const [foundationalOpen, setFoundationalOpen] = useState(false);
  const entry = mechanismKey ? getMechanism(mechanismKey) : null;
  const dialogRef = useRef(null);
  const reducedMotion = useReducedMotion();

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
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
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
        className={"rx-drawer-panel" + (reducedMotion ? "" : " rx-glow-trail rx-fade-in-up")}
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
        {/* Wave 9 W9 · molten-chrome band behind the drawer header. The
            wash sits in the top 80px of the panel; the header content
            below (mono kicker + italic title) rides on z-index 1 so it
            sits cleanly above the band. */}
        <MeshWash
          variant="band"
          intensity="normal"
          palette="cyan-magenta-lime"
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
          zIndex: 1,
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

        {/* Section · Summary — glass-diffuse panel with the cyan tile,
            "Summary" kicker, and serif-running body text. */}
        {entry.summary && (
          <>
            <SectionPanel>
              <SectionHeader Icon={BookOpen} label="Summary" />
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
                <RichText text={entry.summary} accentColor={accent} />
              </div>
            </SectionPanel>
            <GradientHairline variant="cyan-blue" style={{ margin: "22px 0" }} />
          </>
        )}

        {/* Section · Keypoints — each bullet is a chip-row with a leading
            cyan light-ring (8px equivalent via .rx-light-ring-cyan) so the
            bullet list reads as a panel of clinical pearls. */}
        {Array.isArray(entry.keypoints) && entry.keypoints.length > 0 && (
          <>
            <SectionPanel>
              <SectionHeader Icon={GitBranch} label="Keypoints" />
              <ul style={{
                listStyle: "none",
                padding: 0, margin: 0,
                display: "grid", gap: 7,
              }}>
                {entry.keypoints.map((kp, i) => (
                  <li key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 10,
                    alignItems: "start",
                    padding: "8px 10px",
                    background: "rgba(255, 255, 255, 0.45)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px 2px 8px 2px",
                  }}>
                    <span
                      aria-hidden
                      className="rx-light-ring-cyan"
                      style={{ marginTop: 5 }}
                    />
                    <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
                      <RichText text={kp} accentColor={accent} />
                    </span>
                  </li>
                ))}
              </ul>
            </SectionPanel>
            <GradientHairline variant="cyan-blue" style={{ margin: "22px 0" }} />
          </>
        )}

        {/* Section · Bedside — flagged with the beaker icon so the bedside
            voice reads distinct from the academic Keypoints + Foundational. */}
        {entry.bedside && (
          <>
            <SectionPanel>
              <SectionHeader Icon={Beaker} label="Why it matters at the bedside" />
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
                <RichText text={entry.bedside} accentColor={accent} />
              </div>
            </SectionPanel>
            <GradientHairline variant="cyan-blue" style={{ margin: "22px 0" }} />
          </>
        )}

        {/* Section · Foundational — collapsible, hidden behind a chrome-cta
            toggle. Body content remains in a small glass-diffuse card with
            mono-leaning small type so it reads as "academic reference"
            rather than primary editorial. */}
        {entry.foundational && (
          <>
            <SectionPanel>
              <SectionHeader Icon={Sparkles} label="The biochemistry" />
              <FoundationalToggle
                open={foundationalOpen}
                onToggle={() => setFoundationalOpen((v) => !v)}
              />
              {foundationalOpen && (
                <div style={{
                  marginTop: 12,
                  fontSize: 12.5, lineHeight: 1.6, color: "var(--ink2)",
                  padding: "12px 14px",
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "10px 3px 10px 3px",
                }}>
                  <RichText text={entry.foundational} accentColor={accent} />
                </div>
              )}
            </SectionPanel>
            <GradientHairline variant="cyan-blue" style={{ margin: "22px 0" }} />
          </>
        )}

        {/* Section · Evidence (papers) — each paper rendered as a chrome
            year-chip row (italic-serif cyan year + mono journal). */}
        {Array.isArray(entry.papers) && entry.papers.length > 0 && (
          <SectionPanel>
            <SectionHeader Icon={BookOpen} label="Evidence" />
            <ul style={{
              listStyle: "none", padding: 0, margin: 0,
              display: "grid", gap: 7,
            }}>
              {entry.papers.map((p, i) => (
                <PaperRow key={i} paper={p} />
              ))}
            </ul>
          </SectionPanel>
        )}
      </div>
    </div>
  );
}

export { MechanismDrawer };

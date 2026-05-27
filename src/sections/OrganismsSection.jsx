/* section · OrganismsSection — directed therapy + resistance mechanisms.
   Phase B4 of the Wave 2 IA restructure (per docs/EXECUTION_PLAN.md):
   the ORGANISMS section is the directed-therapy view — once the Gram
   stain, culture, or molecular result names the bug, this view narrows
   the regimen to the most targeted agent.

   Wave 8 W8 · MAGAZINE REWRITE (field-guide edition)
   --------------------------------------------------
   The information architecture is unchanged — every organism row, every
   MRSA matrix cell, every Gram-negative mechanism is still present — but
   the chrome is now magazine-grade:

     O1 · FIELD-GUIDE HERO. 96px italic-serif "Organisms" with a 240px
           italic decorative "O" watermark in the top-right margin and an
           italic-serif standfirst introducing the three views.
     O2 · TAXONOMIC RAIL. A sticky 220px left rail listing the supergroups
           (Gram-positives, Enterobacterales, Non-fermenters, Fastidious /
           Anaerobes / Atypicals / Spirochetes). Each row carries an 8px
           supergroup-tint dot, mono uppercase label, organism count, and
           cyan border + lift when active.
     O3 · DIRECTED-THERAPY CARD GRID. The flat directed-therapy table is
           replaced by an editorial 3-up card grid. Each card represents
           one organism with an 11px supergroup-tint bar across the top,
           22px italic-serif name, mono first-line therapy with a cyan
           accent, tier badges as asymmetric chips, and hover lift + cyan
           border. The card grid is the deep-link target — the original
           id="dir-<slug>" anchors remain on each card so the command
           palette and section-nav scroll behaviour is byte-stable.
     O4 · MRSA · BY SITE MATRIX. Reorganized into an asymmetric grid with
           site-row icons in cyan-gradient tiles.
     O5 · GRAM-NEGATIVE · MECHANISM MATRIX. Each mechanism row carries a
           gradient strip header; the row body lays out first / alternative
           / caveat in asymmetric chip cards.
     O6 · CROSS-LINK CHIPS. At the bottom of each organism card a chip
           strip links to syndromes that feature that organism (computed
           from the existing SYNDROMES + ORG_XWALK data via fuzzy match
           against the directed-row keyword hints).

   Cross-section constraints:
     · `.rx-fade-in-up` applied with staggered animationDelay.
     · Decor primitives (GradientHairline, Sparkle, WatermarkLetter,
       DottedGrid as backdrop, Stripes as accent) appear in the hero and
       sub-section heads.
     · Kinetic type (`.rx-display-l`, `.rx-counter`, `.rx-numeric-mega`,
       `.rx-mixed-pair`) is used wherever a number or count belongs.
     · Zero functional changes; the prop signature is identical.

   Props (extracted from App.jsx state + handlers):
     · caseState / setCaseState — case state (unused here today, kept
       for parity with the section-component interface so future
       case-aware org gating is a prop addition only).
     · ctx / d / dose            — patient context + derived state +
       dose engine, mirrors the SyndromesSection signature.
     · openDrug / openOrg /      — knowledge-graph drawer openers (drug
       openTrial                   monograph, organism card, trial /
                                   guideline detail).
     · openOrgRow / setOpenOrgRow — slug of the directed row to highlight
                                    + scroll into view.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useMemo, useState } from "react";
import {
  Info, Crosshair, Network, Heart, Microscope, Stethoscope, BookOpen,
  Wind, Bug, Dna, ChevronRight, Hospital, Activity, Layers,
} from "lucide-react";
import { Cite } from "../components/primitives";
import { MrsaCell } from "../components/cards";
import { renderRich, renderGloss } from "../components/rich-text";
import { DIRECTED, SYNDROMES } from "../data/syndromes";
import { MRSA_MATRIX, MRSA_LEGEND, GNR_MATRIX, ORG_XWALK, ORG_DIR_HINT } from "../data/organisms";
import { slug } from "../lib/util";
import { GradientHairline } from "../components/decor/GradientHairline";
import { Sparkle } from "../components/decor/Sparkle";
import { WatermarkLetter } from "../components/decor/WatermarkLetter";
import { DottedGrid } from "../components/decor/DottedGrid";
import { Stripes } from "../components/decor/Stripes";
import { MeshWash } from "../components/decor/MeshWash";
import { StickySubTOC } from "../components/decor/StickySubTOC";
import { SceneBreak } from "../components/decor/SceneBreak";
import { NotchedBanner } from "../components/decor/NotchedBanner";

/* ============================================================
   Wave 8 W8 · magazine design tokens (with W7 fallbacks)
   ============================================================ */
const CYAN_DEEP    = "var(--electric-blue, var(--w7-neon, var(--ox)))";
const CYAN_BRIGHT  = "var(--neon-cyan, var(--w7-neon, var(--ox)))";
const CYAN_SOFT    = "var(--neon-cyan-soft, rgba(0, 212, 255, 0.10))";
const CYAN_LINE    = "var(--neon-cyan-line, rgba(0, 212, 255, 0.32))";
const CYAN_GLOW    = "var(--neon-cyan-glow, 0 0 24px rgba(0, 212, 255, 0.35))";

const W7_KICKER = "var(--w7-kicker, var(--muted, #6E675E))";
const W7_LINE   = "var(--w7-hairline, var(--ox-line, #E2C7C4))";
const W7_GLASS_BG     = "var(--w7-glass-bg, rgba(255, 255, 255, 0.72))";
const W7_GLASS_BORDER = "var(--w7-glass-border, var(--line, #E6E0D8))";
const W7_GLASS_SHADOW = "var(--w7-glass-shadow, 0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.10))";

/* ============================================================
   W8 · TAXONOMIC SUPERGROUPS
   The DIRECTED data is grouped by clinical bucket (Gram-positive cocci,
   Enterobacterales, etc.) — the taxonomic rail collapses that grouping
   into a stable visual key. Each supergroup gets its own accent tint;
   the tint paints both the rail dot and the 11px strip at the top of
   each card. Tints sit on the cyan-axis so the editorial palette stays
   coherent — supergroups are tonally distinguished but visually unified.
   ============================================================ */
const SUPERGROUPS = [
  { id: "gp",      label: "Gram-positive",         match: ["Gram-positive cocci"],                                                          tint: "#00D4FF", icon: Heart        },
  { id: "entero",  label: "Enterobacterales",      match: ["Enterobacterales (Gram-negative)"],                                             tint: "#2D7EF7", icon: Dna          },
  /* Pseudomonas aeruginosa is a non-fermenting Gram-negative, NOT an
     Enterobacterales — when the data carried it under the Enterobacterales
     group, the Non-fermenters filter rendered an empty Pseudomonas card
     (user-reported: "Pseudomonas card is invisible"). The data file now
     groups Pseudomonas + DTR Pseudomonas alongside the carbapenem-resistant
     non-fermenters under "Non-fermenters & resistant Gram-negatives". The
     historical "Carbapenem-resistant & non-fermenters" label is matched
     here too so any legacy authored data continues to map cleanly. */
  { id: "nonferm", label: "Non-fermenters",        match: ["Non-fermenters & resistant Gram-negatives", "Carbapenem-resistant & non-fermenters"], tint: "#9B5CFF", icon: Microscope   },
  { id: "anaero",  label: "Anaerobes · atypicals", match: ["Anaerobes & atypicals"],                                                        tint: "#1FD49A", icon: Wind         },
];

/* Map a DIRECTED group label to its supergroup descriptor (or null). */
function supergroupForGroup(grp) {
  return SUPERGROUPS.find(sg => sg.match.includes(grp)) || null;
}

/* ============================================================
   W8 · O1 — FIELD-GUIDE HERO
   ============================================================ */
function W8FieldGuideHero({ kicker, title, standfirst, watermark = "O", counter }) {
  return (
    <header
      className="rx-fade-in-up"
      style={{
        position: "relative",
        margin: "0 0 32px",
        padding: "32px 28px 24px",
        overflow: "hidden",
        borderRadius: "18px 4px 18px 4px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
        border: `1px solid ${W7_GLASS_BORDER}`,
        boxShadow: W7_GLASS_SHADOW,
      }}
    >
      {/* Wave 9 W9 · molten chrome behind the Organisms field-guide hero.
          lime-amber is the warmer accent chord — organisms feel more
          "natural history" than "lab report", so the wash leans warm. */}
      <MeshWash variant="full" intensity="soft" palette="lime-amber" />
      <DottedGrid size={28} opacity={0.35} />
      <div style={{ position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.22em",
          textTransform: "uppercase", color: W7_KICKER, marginBottom: 18,
        }}>
          <span aria-hidden="true" style={{
            display: "inline-block", width: 8, height: 8, borderRadius: 999,
            background: CYAN_BRIGHT,
            boxShadow: `0 0 0 3px ${CYAN_SOFT}, ${CYAN_GLOW}`,
          }}/>
          <span>{kicker}</span>
          <Sparkle size={11} color={CYAN_BRIGHT} />
          {counter && (
            <>
              <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>
              <span className="rx-counter" style={{ fontSize: 11, color: W7_KICKER }}>{counter}</span>
            </>
          )}
        </div>
        <h1 style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: "clamp(56px, 9vw, 96px)", lineHeight: 0.94,
          letterSpacing: "-0.028em", fontWeight: 700,
          margin: "0 0 18px", color: "var(--ink)",
          maxWidth: "16ch",
        }}>{title}</h1>
        <p style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 20, lineHeight: 1.5, color: "var(--ink2)",
          margin: "0 0 24px", maxWidth: "62ch",
        }}>{standfirst}</p>
        <div aria-hidden="true" style={{
          height: 2, width: "100%",
          background: `linear-gradient(90deg, ${CYAN_BRIGHT} 0%, ${CYAN_DEEP} 38%, ${W7_LINE} 70%, transparent 100%)`,
          borderRadius: 2, opacity: 0.88,
        }}/>
      </div>
    </header>
  );
}

/* Sub-section magazine head (mirrors the Principles W8SubHead). */
function W8SubHead({ kicker, title, lede, icon, id, important = false }) {
  return (
    <div id={id} className="rx-fade-in-up" style={{ margin: "40px 0 18px", position: "relative", scrollMarginTop: "100px" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.22em",
        textTransform: "uppercase", color: W7_KICKER, marginBottom: 12,
      }}>
        <span aria-hidden="true" style={{
          display: "inline-block", width: 8, height: 8, borderRadius: 999,
          background: CYAN_BRIGHT,
          boxShadow: `0 0 0 3px ${CYAN_SOFT}, 0 0 10px ${CYAN_LINE}`,
        }}/>
        {kicker}
      </div>
      <div aria-hidden="true" style={{
        height: 2, width: 88, borderRadius: 2,
        background: `linear-gradient(90deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 60%, transparent)`,
        marginBottom: 12,
      }}/>
      <h3 style={{
        fontFamily: "var(--serif)", fontStyle: "italic",
        fontSize: "clamp(28px, 3.2vw, 36px)", lineHeight: 1.16,
        letterSpacing: "-0.018em", margin: 0, fontWeight: 700,
        color: "var(--ink)", display: "flex", alignItems: "center", gap: 12,
      }}>
        {icon && <span style={{ color: "var(--ox)", display: "inline-flex" }}>{icon}</span>}
        {title}
        {important && <Sparkle size={13} color={CYAN_BRIGHT} style={{ marginLeft: 6, opacity: 0.95 }} />}
      </h3>
      {lede && (
        <p
          className="rx-dropcap-cyan"
          style={{
            fontFamily: "var(--serif)", fontStyle: "italic",
            fontSize: 16, lineHeight: 1.6, color: "var(--ink2)",
            margin: "12px 0 0", maxWidth: "70ch",
          }}
        >{lede}</p>
      )}
    </div>
  );
}

/* ============================================================
   W8 · O2 — TAXONOMIC RAIL
   220px sticky-top column listing supergroups. Each row: 8px tint dot,
   mono uppercase label, organism count. Active row = cyan border + 2px
   lift + soft cyan shadow.
   ============================================================ */
function W8TaxonomicRail({ counts, activeId, onSelect, totalOrgs }) {
  return (
    <aside
      aria-label="Taxonomic rail"
      style={{
        position: "sticky",
        /* W12 bughunt · global .rx-header is sticky at top:0 with z:50 and
           ~79 px tall (Organisms has a single tab so no sub-nav). top:16
           tucked 63 px of the rail under the header at scroll-stuck. 88
           clears the header and matches the StickySubTOC default. */
        top: 88,
        alignSelf: "flex-start",
        width: 220,
        flex: "0 0 220px",
        padding: 14,
        borderRadius: "14px 4px 14px 4px",
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${W7_GLASS_BORDER}`,
        boxShadow: W7_GLASS_SHADOW,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.22em",
        textTransform: "uppercase", color: W7_KICKER, marginBottom: 4,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Sparkle size={9} color={CYAN_BRIGHT} /> Taxonomic rail
      </div>
      <div style={{
        fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14,
        color: "var(--ink2)", lineHeight: 1.35, marginBottom: 8,
      }}>
        <span className="rx-mixed-pair">
          <span className="rx-pair-bold" style={{ color: "var(--ox)", fontFamily: "var(--mono)", fontSize: 22 }}>{totalOrgs}</span>
          <span className="rx-pair-light">organisms · {SUPERGROUPS.length} groups</span>
        </span>
      </div>
      {[{ id: "all", label: "All", tint: "var(--ink2)", icon: Layers }, ...SUPERGROUPS].map(sg => {
        const active = activeId === sg.id;
        const count = sg.id === "all" ? totalOrgs : (counts[sg.id] || 0);
        const Icon = sg.icon;
        return (
          <button
            key={sg.id}
            type="button"
            onClick={() => onSelect(sg.id)}
            aria-pressed={active}
            style={{
              display: "grid",
              gridTemplateColumns: "12px 1fr auto",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "10px 2px 10px 2px",
              background: active ? "rgba(255,255,255,0.92)" : "transparent",
              border: `1px solid ${active ? CYAN_LINE : "transparent"}`,
              boxShadow: active ? `${W7_GLASS_SHADOW}, ${CYAN_GLOW}` : "none",
              transform: active ? "translateY(-1px)" : "translateY(0)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all var(--duration-base, 180ms) var(--ease-out, ease)",
              fontFamily: "inherit",
              color: "inherit",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          >
            <span aria-hidden="true" style={{
              display: "inline-block", width: 8, height: 8, borderRadius: 999,
              background: sg.tint,
              boxShadow: active ? `0 0 10px ${sg.tint}aa` : "none",
            }}/>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: active ? "var(--ink)" : "var(--ink2)", fontWeight: active ? 700 : 500,
              display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {Icon && <Icon size={12} style={{ flex: "0 0 12px", color: active ? CYAN_BRIGHT : W7_KICKER }} />}
              {sg.label}
            </span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: active ? CYAN_BRIGHT : W7_KICKER, fontVariantNumeric: "tabular-nums",
              fontWeight: active ? 700 : 500,
            }}>{count}</span>
          </button>
        );
      })}
      <GradientHairline variant="cyan-blue" style={{ margin: "8px 0 4px" }} />
      <p style={{
        fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 12,
        lineHeight: 1.5, color: "var(--ink2)", margin: 0,
      }}>
        Filter the directed-therapy grid by supergroup. The MRSA and
        Gram-negative matrices stay visible below.
      </p>
    </aside>
  );
}

/* ============================================================
   W8 · O6 — SYNDROME CROSS-LINK CHIPS
   For a given DIRECTED row, find the syndromes whose bugs[] array
   maps (via ORG_XWALK + the directed-row fuzzy hints) to that row.
   Done at memo-time, not at render. The chip strip sits at the
   bottom of each organism card.

   The mapping is heuristic: a syndrome is linked when one of its
   outer bug ids has an ORG_DIR_HINT keyword that appears in the
   organism row's name (case-insensitive substring). This mirrors
   the same logic the legacy command palette used and is sufficient
   for the editorial cross-link.
   ============================================================ */
function buildSyndromeXref() {
  const orgNameToSyndromes = {};
  // For each syndrome's bugs[] id, look up the ORG_DIR_HINT keywords
  // and stamp the syndrome onto each matching organism name fragment.
  for (const syn of SYNDROMES) {
    if (!Array.isArray(syn.bugs)) continue;
    for (const bug of syn.bugs) {
      const hints = ORG_DIR_HINT[bug] || [];
      for (const hint of hints) {
        const key = hint.toLowerCase();
        if (!orgNameToSyndromes[key]) orgNameToSyndromes[key] = [];
        // de-duplicate per organism
        if (!orgNameToSyndromes[key].some(s => s.id === syn.id)) {
          orgNameToSyndromes[key].push({ id: syn.id, name: syn.name, cat: syn.cat });
        }
      }
    }
  }
  return orgNameToSyndromes;
}

function syndromesForOrgName(orgName, xref) {
  const lc = (orgName || "").toLowerCase();
  // Pick the first matching hint key that is a substring of the org name.
  for (const key of Object.keys(xref)) {
    if (lc.includes(key)) return xref[key];
  }
  return [];
}

/* ============================================================
   W8 · O3 — DIRECTED-THERAPY CARD
   Editorial card for one organism. The 11px supergroup-tint bar at the
   top is the visual anchor (the rail tint flows directly here).
   Hover: 3px lift + cyan border + cyan glow.
   ============================================================ */
function W8DirectedCard({ org, supergroup, openDrug, highlight, anchorId, delay, syndromes, onSynClick }) {
  const [hover, setHover] = useState(false);
  const lifted = hover || highlight;
  const ringColor = highlight ? CYAN_BRIGHT : (hover ? CYAN_LINE : W7_GLASS_BORDER);
  return (
    <article
      id={anchorId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rx-fade-in-up rx-card-interactive"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "20px 18px 16px",
        background: "rgba(255,255,255,0.86)",
        border: `1px solid ${ringColor}`,
        borderRadius: "14px 4px 14px 4px",
        boxShadow: lifted
          ? `${W7_GLASS_SHADOW}, ${CYAN_GLOW}`
          : W7_GLASS_SHADOW,
        transform: lifted ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 220ms var(--ease-out, ease), box-shadow 220ms var(--ease-out, ease), border-color 220ms var(--ease-out, ease)",
        overflow: "hidden",
        scrollMarginTop: 24,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 11px supergroup-tint bar across the full width */}
      <span aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 11,
        background: supergroup
          ? `linear-gradient(90deg, ${supergroup.tint}, ${supergroup.tint}88 60%, transparent)`
          : `linear-gradient(90deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 60%, transparent)`,
      }} />

      <div style={{ paddingTop: 14 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em",
          textTransform: "uppercase", color: W7_KICKER, marginBottom: 4,
        }}>
          <span aria-hidden="true" style={{
            display: "inline-block", width: 6, height: 6, borderRadius: 999,
            background: supergroup ? supergroup.tint : CYAN_BRIGHT,
          }}/>
          {supergroup ? supergroup.label : "Other"}
        </div>
        <h4 style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 22, fontWeight: 700, letterSpacing: "-0.012em",
          lineHeight: 1.18, margin: 0, color: "var(--ink)",
        }}>{org.org}</h4>
        {org.sub && (
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink2)",
            marginTop: 4, letterSpacing: "0.02em",
          }}>{org.sub}</div>
        )}
      </div>

      {/* First-line therapy with cyan accent strip on the left */}
      <div style={{
        position: "relative", paddingLeft: 14,
        fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.55,
        color: "var(--ink)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", left: 0, top: 4, bottom: 4, width: 3,
          background: `linear-gradient(180deg, ${CYAN_BRIGHT}, ${CYAN_DEEP})`,
          borderRadius: 2,
        }} />
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.24em",
          textTransform: "uppercase", color: "var(--ox)", marginBottom: 4,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <span className="rx-light-ring-cyan" aria-hidden="true" />
          First-line
          <Sparkle size={9} color={CYAN_BRIGHT} style={{ opacity: 0.9 }} />
        </div>
        <div style={{ lineHeight: 1.6 }}>{renderRich(org.first, openDrug)}</div>
      </div>

      {/* Tier badges as asymmetric chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <W8TierChip label="1st" tone="primary" />
        <W8TierChip label="2nd" tone="alt" />
        {/* "Regional" and "Pediatric" are surfaced as adjunctive intent
            chips — the underlying data does not split them out per row, so
            we mark them as available rails when the alternative or caveat
            mentions susceptibility / regional / pediatric considerations. */}
        {/[Pp]ediatric|child/.test((org.cav || "") + " " + (org.alt || "")) && (
          <W8TierChip label="pediatric" tone="muted" />
        )}
        {/[Rr]egional|antibiogram|prevalence|epidemiology/.test((org.cav || "") + " " + (org.alt || "")) && (
          <W8TierChip label="regional" tone="muted" />
        )}
      </div>

      {/* Alternative + caveat block */}
      <div style={{
        display: "grid", gap: 8,
        fontFamily: "var(--serif)", fontSize: 13, lineHeight: 1.55,
        color: "var(--ink2)",
      }}>
        <div>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: W7_KICKER, marginRight: 8,
          }}>Alt.</span>
          {renderGloss(org.alt, openDrug)}
        </div>
        <div>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: W7_KICKER, marginRight: 8,
          }}>Caveat</span>
          {renderGloss(org.cav, openDrug)}
        </div>
      </div>

      {/* O6 · Cross-link chips to syndromes that feature this organism */}
      {syndromes && syndromes.length > 0 && (
        <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px dashed ${W7_GLASS_BORDER}` }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: W7_KICKER, marginBottom: 6,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Sparkle size={8} color={CYAN_BRIGHT} /> Appears in
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {syndromes.slice(0, 6).map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSynClick && onSynClick(s.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 8px",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "var(--ink2)",
                  background: CYAN_SOFT,
                  border: `1px solid ${CYAN_LINE}`,
                  borderRadius: "8px 2px 8px 2px",
                  cursor: onSynClick ? "pointer" : "default",
                  appearance: "none", WebkitAppearance: "none",
                  transition: "background 160ms var(--ease-out, ease), color 160ms var(--ease-out, ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${CYAN_BRIGHT}`;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = CYAN_SOFT;
                  e.currentTarget.style.color = "var(--ink2)";
                }}
              >
                {s.name.length > 28 ? s.name.slice(0, 27) + "…" : s.name}
              </button>
            ))}
            {syndromes.length > 6 && (
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, color: W7_KICKER,
                alignSelf: "center",
              }}>+{syndromes.length - 6} more</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function W8TierChip({ label, tone = "primary" }) {
  const palette = tone === "primary"
    ? { bg: `linear-gradient(135deg, ${CYAN_DEEP}, ${CYAN_BRIGHT})`, fg: "#fff", border: "transparent" }
    : tone === "alt"
      ? { bg: "transparent", fg: "var(--ink2)", border: CYAN_LINE }
      : { bg: "transparent", fg: W7_KICKER, border: W7_GLASS_BORDER };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px",
      fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: palette.fg,
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderRadius: "8px 2px 8px 2px",
    }}>{label}</span>
  );
}

/* ============================================================
   W8 · O4 — MRSA · BY SITE MATRIX (asymmetric grid)
   Each site column gets a cyan-gradient tile header. Agent rows lay
   out the four-cell decision strip. The body is wrapped in the existing
   .rx-mxtable so the cell rendering (MrsaCell) and legend stay intact.
   ============================================================ */
function W8MrsaMatrix({ openDrug }) {
  const SITE_ICON = [Heart, Wind, Activity, Bug, Hospital];
  const cols = MRSA_MATRIX.cols;
  /* Bug fix · the cyan-gradient site tiles used to live in a separate
     CSS Grid above the table, and the cells below used HTML <table>
     auto-column widths. Two different layout engines = column
     headers + circles never aligned. Now both header tiles and body
     cells live in the SAME <table>; <colgroup> + table-layout:fixed
     give each agent column exactly 1.4fr / N relative width and
     guarantee circle ↔ column-title alignment by construction. */
  const colWeights = `${(1.4 / (1.4 + cols.length)) * 100}%`;
  const cellWeight = `${(1 / (1.4 + cols.length)) * 100}%`;
  return (
    <div className="rx-fade-in-up" style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: `1px solid ${W7_GLASS_BORDER}`,
      boxShadow: W7_GLASS_SHADOW,
      borderRadius: "16px 4px 16px 4px",
      padding: 18,
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table className="rx-mxtable rx-mxtable-w12" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: colWeights }} />
            {cols.map(c => <col key={c} style={{ width: cellWeight }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="rx-mx-ag rx-mx-ag-w12" scope="col">
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: W7_KICKER, fontWeight: 700,
                }}>Agent ↓ / Site →</span>
              </th>
              {cols.map((c, i) => {
                const Icon = SITE_ICON[i] || Crosshair;
                return (
                  <th key={c} scope="col" className="rx-mx-th-tile">
                    <div style={{
                      padding: "10px 10px",
                      borderRadius: "10px 2px 10px 2px",
                      background: `linear-gradient(135deg, ${CYAN_DEEP}, ${CYAN_BRIGHT})`,
                      color: "#fff",
                      boxShadow: CYAN_GLOW,
                      display: "flex", flexDirection: "column", gap: 4,
                      textAlign: "left",
                    }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon size={14} aria-hidden />
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.22em",
                          textTransform: "uppercase", opacity: 0.9,
                        }}>SITE · {String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <span style={{
                        fontFamily: "var(--serif)", fontStyle: "italic",
                        fontSize: 14, fontWeight: 700, lineHeight: 1.2,
                      }}>{c}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {MRSA_MATRIX.rows.map(r => (
              <tr key={r.ag}>
                <td className="rx-mx-ag">
                  <button className="rx-fname-link" onClick={() => openDrug(r.ag)} title="Open the drug monograph">
                    {r.ag.split(" / ")[0]}
                  </button>
                </td>
                {r.c.map((v, i) => <td key={i} className="rx-mx-c"><MrsaCell v={v} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   W8 · O5 — GRAM-NEGATIVE · MECHANISM MATRIX (gradient strip + chip rows)
   Each mechanism row carries a gradient strip header (the mechanism
   name as an italic-serif headline on a cyan gradient bar). Below it,
   first / alternative / caveat lay out as three column cards.
   ============================================================ */
function W8GnrMechanismMatrix({ openDrug }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {GNR_MATRIX.map((r, i) => (
        <article
          key={i}
          className="rx-fade-in-up rx-glow-lift"
          style={{
            background: "rgba(255,255,255,0.78)",
            border: `1px solid ${W7_GLASS_BORDER}`,
            borderRadius: i % 2 === 0 ? "16px 4px 16px 4px" : "4px 16px 4px 16px",
            boxShadow: W7_GLASS_SHADOW,
            overflow: "hidden",
            animationDelay: `${i * 50}ms`,
          }}
        >
          {/* Mechanism gradient strip header */}
          <div style={{
            padding: "12px 18px",
            background: `linear-gradient(90deg, ${CYAN_DEEP} 0%, ${CYAN_BRIGHT} 40%, ${CYAN_SOFT} 100%)`,
            color: "#fff",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span aria-hidden="true" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: "8px 2px 8px 2px",
              background: "rgba(255,255,255,0.25)",
              fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
            }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em",
              lineHeight: 1.2, flex: 1,
            }}>{renderGloss(r.m, openDrug)}</span>
            <Sparkle size={11} color="#fff" style={{ opacity: 0.85 }} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 0,
            padding: 16,
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}>
              <W8MechCell kicker="First-line" body={renderGloss(r.first, openDrug)} accent="primary" />
              <W8MechCell kicker="Alternative" body={renderGloss(r.alt, openDrug)} accent="alt" />
              <W8MechCell kicker="Caveat" body={renderGloss(r.cav, openDrug)} accent="muted" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function W8MechCell({ kicker, body, accent }) {
  const stripColor = accent === "primary"
    ? `linear-gradient(180deg, ${CYAN_BRIGHT}, ${CYAN_DEEP})`
    : accent === "alt"
      ? `linear-gradient(180deg, ${CYAN_LINE}, ${CYAN_SOFT})`
      : `linear-gradient(180deg, ${W7_GLASS_BORDER}, transparent)`;
  return (
    <div style={{
      position: "relative",
      paddingLeft: 14,
      /* W10 density audit: 13.5 → 13 to align with the rest of the
         editorial body cascade (every other lede / standfirst on this
         spread reads at 13/14/15; 13.5 was a half-step orphan). */
      fontFamily: "var(--serif)", fontSize: 13, lineHeight: 1.55,
      color: "var(--ink2)",
    }}>
      <span aria-hidden="true" style={{
        position: "absolute", left: 0, top: 6, bottom: 6, width: 3,
        background: stripColor, borderRadius: 2,
      }} />
      <div style={{
        fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: accent === "primary" ? CYAN_BRIGHT : W7_KICKER,
        marginBottom: 4,
      }}>{kicker}</div>
      <div>{body}</div>
    </div>
  );
}

function OrganismsSection({
  caseState, setCaseState,
  ctx, d, dose,
  openDrug, openOrg, openTrial,
  openOrgRow, setOpenOrgRow,
}) {
  /* When openOrgRow changes (e.g. the user picks "Open directed row" from
     the ⌘K palette, or follows a #dir-<slug> deep-link), scroll the
     matching directed-therapy card into view. Mirrors the original
     behaviour in the legacy section. Respects prefers-reduced-motion. */
  useEffect(() => {
    if (!openOrgRow) return;
    const el = document.getElementById("dir-" + openOrgRow);
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [openOrgRow]);

  // Active supergroup filter for the rail.
  const [activeSg, setActiveSg] = useState("all");

  // Counts per supergroup (for the rail badges) and the syndrome xref map.
  const counts = useMemo(() => {
    const c = {};
    for (const g of DIRECTED) {
      const sg = supergroupForGroup(g.grp);
      if (!sg) continue;
      c[sg.id] = (c[sg.id] || 0) + (g.items?.length || 0);
    }
    return c;
  }, []);
  const totalOrgs = useMemo(
    () => DIRECTED.reduce((n, g) => n + (g.items?.length || 0), 0),
    []
  );
  const synXref = useMemo(buildSyndromeXref, []);

  // Flat ordered list of every (org, supergroup) tuple so the card grid
  // can run as one masonry column-flow.
  const allCards = useMemo(() => {
    const out = [];
    for (const g of DIRECTED) {
      const sg = supergroupForGroup(g.grp);
      for (const o of (g.items || [])) {
        out.push({ org: o, supergroup: sg, groupLabel: g.grp });
      }
    }
    return out;
  }, []);
  const filteredCards = activeSg === "all"
    ? allCards
    : allCards.filter(c => c.supergroup && c.supergroup.id === activeSg);

  // Syndrome chip click: cross-link via location hash if a router-style
  // handler is not provided. The empiric/syndromes section listens on
  // hashchange to scroll the matching card open.
  const handleSynClick = (synId) => {
    try {
      window.location.hash = `sec=syndromes&t=empiric&syn=${synId}`;
    } catch (_) { /* noop on SSR */ }
  };

  return (
    <>
      <W8FieldGuideHero
        kicker="ORGANISMS"
        title="Organisms"
        standfirst="Bugs and their resistance — directed therapy by site, MRSA by phenotype, GNR by mechanism."
        watermark="O"
        counter={`${totalOrgs} ORGANISMS · ${SUPERGROUPS.length} SUPERGROUPS`}
      />

      <div className="rx-callout"><Info size={15}/><span>Definitive therapy is almost always narrower than the empiric regimen. The resistant-Gram-negative rows follow IDSA guidance <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />; confirm the carbapenemase type for CRE &mdash; it changes the agent.</span></div>

      {/* W9 · Sticky sub-TOC across the three major sub-sections of the
          Organisms section (directed grid · MRSA matrix · GNR mechanism). */}
      <StickySubTOC items={[
        { id: "sub-org-directed", label: "Directed grid" },
        { id: "sub-org-mrsa",     label: "MRSA by site" },
        { id: "sub-org-gnr",      label: "GNR mechanism" },
      ]} />

      {/* ---- O2 + O3 · taxonomic rail + directed-therapy card grid ---- */}
      <W8SubHead
        id="sub-org-directed"
        kicker="DIRECTED · BY ORGANISM"
        icon={<Crosshair size={20}/>}
        title="Directed therapy, organism by organism"
        lede="Each card is one pathogen with its first-line agent, alternatives, the caveat that matters, and the syndromes it appears in."
        important
      />
      <div style={{
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}>
        <W8TaxonomicRail
          counts={counts}
          activeId={activeSg}
          onSelect={setActiveSg}
          totalOrgs={totalOrgs}
        />
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <div style={{
            columnCount: filteredCards.length > 6 ? 2 : 1,
            columnGap: 16,
            columnFill: "balance",
          }}>
            {filteredCards.map((c, idx) => {
              const orgSlug = slug(c.org.org);
              const synList = syndromesForOrgName(c.org.org, synXref);
              return (
                <div key={orgSlug + idx} style={{ breakInside: "avoid", marginBottom: 16 }}>
                  <W8DirectedCard
                    org={c.org}
                    supergroup={c.supergroup}
                    openDrug={openDrug}
                    highlight={openOrgRow === orgSlug}
                    anchorId={"dir-" + orgSlug}
                    delay={Math.min(idx * 40, 600)}
                    syndromes={synList}
                    onSynClick={handleSynClick}
                  />
                </div>
              );
            })}
            {filteredCards.length === 0 && (
              /* W10 · upgraded from a dashed-border one-liner to a cinematic
                 empty state matching the Syndromes / Agents pattern. A
                 cyan-soft italic-serif "0" anchors the void, mono kicker
                 + italic-serif headline + standfirst, cyan-gradient CTA
                 to switch the rail back to All. */
              <div
                role="status"
                aria-live="polite"
                className="rx-fade-in-up"
                style={{
                  position: "relative",
                  padding: "44px 22px 48px",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, var(--paper2) 0%, var(--ox-softer, var(--paper)) 100%)",
                  border: `1px dashed ${W7_GLASS_BORDER}`,
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 4,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 18,
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 160,
                    lineHeight: 0.95,
                    color: "var(--ox-soft, var(--neon-cyan-soft))",
                    marginBottom: 4,
                    letterSpacing: "-.04em",
                  }}
                >
                  0
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 10,
                  }}
                >
                  Empty supergroup
                </div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 24,
                    letterSpacing: "-.02em",
                    margin: "0 0 8px",
                    color: "var(--ink)",
                  }}
                >
                  No organisms in this supergroup
                </h3>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 15,
                    color: "var(--ink2)",
                    margin: "0 auto 22px",
                    lineHeight: 1.55,
                    maxWidth: "46ch",
                  }}
                >
                  Switch the rail back to All to see the full directed-therapy
                  card grid.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSg("all")}
                  className="rx-lift"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 22px",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, var(--ox, var(--ink)) 0%, var(--neon-cyan, var(--ox)) 100%)",
                    border: "1px solid var(--neon-cyan, var(--ox))",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 2,
                    borderBottomLeftRadius: 2,
                    borderBottomRightRadius: 8,
                    cursor: "pointer",
                    boxShadow:
                      "var(--shadow-e1), var(--neon-cyan-glow, 0 0 24px rgba(0,212,255,0.35))",
                  }}
                >
                  Show all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave 12 W12 · epoch transition (directed therapy → MRSA matrix).
          The phrase "by phenotype" announces the next chapter: we're
          leaving organism-by-organism directed therapy and entering the
          MRSA agent-selection matrix that's keyed on the body site. */}
      <SceneBreak variant="phrase" mark="by phenotype" style={{ margin: "32px 0 20px" }} />

      {/* ---- O4 · MRSA by site ---- */}
      <W8SubHead
        id="sub-org-mrsa"
        kicker="MRSA · BY SITE"
        icon={<Crosshair size={20}/>}
        title="MRSA agent selection by site"
        lede="Choosing among the anti-MRSA agents is a site decision before it is a susceptibility decision — the body compartment rules out agents the antibiogram would still call susceptible."
      />
      <Stripes variant="cyan" width={120} height={6} style={{ margin: "0 0 12px" }} />
      <W8MrsaMatrix openDrug={openDrug} />
      <div className="rx-mxlegend" style={{ marginTop: 12 }}>
        {MRSA_LEGEND.map(l => <span key={l.k} className="rx-mxleg-item"><MrsaCell v={l.k} /> {l.t}</span>)}
      </div>
      <ul className="rx-mxnotes">
        {MRSA_MATRIX.rows.map(r => <li key={r.ag}><b>{r.ag.split(" / ")[0]}:</b> {renderGloss(r.note, openDrug)}</li>)}
      </ul>
      <div className="rx-diag-divider" aria-hidden="true" />

      {/* Wave 12 W12 · epoch transition (MRSA matrix → GNR mechanism).
          The phrase "by mechanism" frames the chapter wall: MRSA is a
          single-species phenotype problem, GNR is a multi-species
          resistance-mechanism problem and reads differently. */}
      <SceneBreak variant="phrase" mark="by mechanism" style={{ margin: "32px 0 20px" }} />

      {/* ---- O5 · Gram-negative by mechanism ---- */}
      <W8SubHead
        id="sub-org-gnr"
        kicker="GRAM-NEGATIVE · MECHANISM"
        icon={<Network size={20}/>}
        title="Gram-negative backbone by resistance mechanism"
        lede={<>Match the agent to the carbapenemase or resistance mechanism, not the MIC alone <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />. Confirm the mechanism before committing a reserve agent.</>}
        important
      />
      <W8GnrMechanismMatrix openDrug={openDrug} />

      {/* Wave 12 W12 · end-of-section signal closes the Organisms read. */}
      <SceneBreak variant="minimal" style={{ margin: "36px 0 6px" }} />
      <div className="rx-counter" style={{
        textAlign: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".24em",
        color: "var(--ink2)",
        textTransform: "uppercase",
        opacity: 0.7,
        marginBottom: 8,
      }}>
        end of organisms
      </div>
    </>
  );
}

export { OrganismsSection };

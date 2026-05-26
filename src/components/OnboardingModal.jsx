/* component · OnboardingModal — Wave 6 W6-D first-visit overlay.
   Wave 8 W8 chrome pass — converted from a small modal box to a
   slide overlay with:
     • 240px italic-decorative numeral painted behind each step
     • Asymmetric 24/4 corner radius on the panel
     • 4px cyan-gradient top strip + gradient hairline
     • Cyan-gradient pill CTAs (Skip + Next + Start) with ripple + shine
     • Italic-serif step title + mono kicker
     • Larger 600px card width to give the editorial title room

   Gated on a localStorage flag so it auto-shows on the very first
   visit and never again (unless the user clears site data or
   explicitly re-opens it via the help affordance).

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Crosshair, Layers, Sparkles, X,
} from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { MeshWash } from "./decor/MeshWash.jsx";
import { SpotlightCard } from "./decor/SpotlightCard.jsx";

/* Wave 9 W9 · per-step MeshWash palette. Each onboarding step gets a
   distinct molten chrome so the three screens feel like three separate
   surfaces rather than three views of the same canvas. The palette
   sequence matches the section palette taxonomy used elsewhere. */
const STEP_PALETTES = ["cyan-magenta-lime", "cyan-blue", "lime-amber"];

const DISMISS_KEY = "ab_onboarding_dismissed_v1";

const TOP_STRIP_BG =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.45) 18%," +
  " rgba(61, 122, 255, 0.45) 50%," +
  " rgba(255, 61, 188, 0.30) 82%," +
  " transparent 100%)";

/* Wave 10 W10 · the primary CTA now ships as `.rx-chrome-cta` (steel
   vertical gradient + sheen + hover shimmer) — the inline CTA_PILL_BG
   constant has been retired. Secondary CTAs remain as ghost outlined
   pills (see CtaPill below). */

function _readDismissed() {
  try {
    if(typeof window === "undefined") return false;
    return window.localStorage?.getItem(DISMISS_KEY) === "1";
  } catch(e) { return false; }
}

function _writeDismissed() {
  try {
    if(typeof window === "undefined") return;
    window.localStorage?.setItem(DISMISS_KEY, "1");
  } catch(e) {}
}

const SCREENS = [
  {
    icon: Sparkles,
    kicker: "What this is",
    title: "A snapshot consult, not a chart.",
    body:
      "Describe the case once — free text or chips — and the Answer Canvas " +
      "composes the empiric regimen, refinements, monitoring, duration, and " +
      "evidence. Nothing persists between visits. The page is yours; close " +
      "the tab and it forgets.",
  },
  {
    icon: Crosshair,
    kicker: "How to ask",
    title: "Describe the patient in one line.",
    body:
      "\"72M HAP prior MRSA CrCl 35\" is enough. The parser extracts age, sex, " +
      "syndrome, host factors, organism risks, and renal function; the engine " +
      "composes the regimen + refinements. Add or correct any field in the " +
      "Case Bar — the answer recomposes immediately.",
  },
  {
    icon: Layers,
    kicker: "What's at your fingertips",
    title: "Drill from chip to mechanism.",
    body:
      "Every drug-class and resistance-term chip opens an inline popover; the " +
      "popover offers \"Read the mechanism\" when there's biochemistry behind " +
      "the choice. Footnote markers next to refinement steps open the rule + " +
      "evidence behind that step. Press ? any time for the keyboard cheat-sheet.",
  },
];

function CtaPill({ onClick, label, ariaLabel, leadingIcon, trailingIcon, variant = "primary" }) {
  const ref = useRef(null);
  useRipple(ref);

  const primary = variant === "primary";
  const Leading = leadingIcon;
  const Trailing = trailingIcon;

  /* Primary → rx-chrome-cta (steel-vertical gradient, sheen, hover shimmer)
     plus magnetic + shine-sweep + ripple + focus-halo. Secondary → ghost
     outlined pill that stays visually subordinate to the primary CTA. */
  if (primary) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || label}
        className="rx-chrome-cta rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
        style={{
          fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
          letterSpacing: ".10em", textTransform: "uppercase",
          padding: "8px 16px",
          borderRadius: "12px 3px 12px 3px",
          gap: 7,
        }}
      >
        {Leading && <Leading size={11} aria-hidden />}
        <span>{label}</span>
        {Trailing && <Trailing size={11} aria-hidden />}
      </button>
    );
  }

  /* Secondary — ghost outlined pill. */
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className="rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "7px 16px",
        cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        color: "var(--ink2)",
        display: "inline-flex", alignItems: "center", gap: 6,
        boxShadow: "none",
        transition: "background var(--duration-base, .18s) var(--ease-out, ease), color var(--duration-base, .18s) var(--ease-out, ease), border-color var(--duration-base, .18s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease), transform var(--duration-base, .18s) var(--ease-out, ease)",
      }}
    >
      {Leading && <Leading size={11} aria-hidden />}
      <span>{label}</span>
      {Trailing && <Trailing size={11} aria-hidden />}
    </button>
  );
}

function OnboardingModal({ forceOpen = false, onClose }) {
  const [open, setOpen] = useState(forceOpen || !_readDismissed());
  const [idx, setIdx] = useState(0);
  const dialogRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if(forceOpen) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") _dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useFocusTrap(dialogRef, open);

  const _dismiss = () => {
    _writeDismissed();
    setOpen(false);
    setIdx(0);
    if(onClose) onClose();
  };

  if(!open) return null;

  const screen = SCREENS[idx];
  const Icon = screen.icon;
  const isLast = idx === SCREENS.length - 1;

  const panelStyle = {
    position: "relative",
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "saturate(180%) blur(16px)",
    WebkitBackdropFilter: "saturate(180%) blur(16px)",
    border: "1px solid var(--line)",
    /* Asymmetric 24/4 corners — shared with drawers. */
    borderRadius: "24px 4px 24px 4px",
    width: "min(600px, 100%)",
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "30px 32px 26px",
    boxShadow: "var(--shadow-drawer)",
    outline: "none",
  };

  const tree = (
    <div
      role="dialog"
      aria-label="Welcome to the Inpatient Antibiotic Guide"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); _dismiss(); }}
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "5vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="onboarding-modal"
        className={reducedMotion ? "" : "rx-glow-trail rx-fade-in-up"}
        style={panelStyle}
      >
        {/* 4px cyan-gradient top strip. */}
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

        {/* Wave 9 W9 · per-step molten-chrome MeshWash. Each onboarding
            step picks a distinct palette so the step transitions feel
            like distinct surfaces. Intensity stays at `normal` so the
            wash carries presence without competing with the 240px
            watermark numeral. */}
        <MeshWash
          variant="full"
          intensity="normal"
          palette={STEP_PALETTES[idx % STEP_PALETTES.length]}
        />

        {/* 240px italic decorative numeral painted behind the step body.
            Sits at very low alpha so it reads as a watermark rather than
            a content element. Positioned absolutely so it never disturbs
            the flow of the editorial copy. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 36,
            right: -10,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 240,
            fontWeight: 500,
            lineHeight: 1,
            color: "rgba(0, 212, 255, 0.07)",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "-0.04em",
          }}
        >
          {idx + 1}
        </span>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 14, position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={16} aria-hidden color="var(--neon-cyan, var(--ox))" />
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".14em",
              textTransform: "uppercase",
            }}>
              {screen.kicker}
            </span>
          </div>
          <CtaPill
            onClick={_dismiss}
            label="Skip"
            ariaLabel="Skip onboarding"
            variant="secondary"
            leadingIcon={X}
          />
        </div>

        {/* Hairline gradient under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "0 0 18px",
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* Body — wrapped in a SpotlightCard so the editorial body sits
            inside the chrome with cursor-tracked spotlight + subtle 3D
            tilt for parallax depth. Tilt + spotlight are reduced-motion
            gated inside the SpotlightCard hooks themselves. */}
        <SpotlightCard
          variant="cyan"
          tilt={true}
          intensity={4}
          style={{
            position: "relative",
            zIndex: 1,
            borderRadius: "14px 4px 14px 4px",
            padding: "18px 20px",
            background: "rgba(255, 255, 255, 0.42)",
            border: "1px solid var(--neon-cyan-line, var(--ox-line))",
            boxShadow: "0 8px 22px -8px rgba(0,212,255,.24)",
          }}
        >
          <h2
            className="rx-display-l"
            style={{
              /* Spec: headline uses .rx-display-l (sans 48px bold). Override
                  the size with a fluid clamp so the modal stays comfortable
                  on small viewports. */
              fontSize: "clamp(26px, 3.4vw, 40px)",
              margin: "0 0 14px",
              lineHeight: 1.06,
              color: "var(--ink)",
            }}
          >
            {screen.title}
          </h2>
          {/* Body — italic-serif standfirst. */}
          <p style={{
            fontSize: 15, lineHeight: 1.65, color: "var(--ink2)",
            margin: 0, maxWidth: "58ch",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
          }}>
            {screen.body}
          </p>
        </SpotlightCard>

        {/* Footer · progress dots + nav */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 28, paddingTop: 18,
          position: "relative", zIndex: 1,
        }}>
          {/* Gradient hairline above the footer. */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0, right: 0, top: 0,
              height: 1,
              background: HAIRLINE_BG,
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
          <div role="presentation" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {SCREENS.map((_, i) => (
              i === idx ? (
                /* Active dot — full neon light-ring (10px) so the
                    "you are here" beat reads as a chrome indicator. */
                <span key={i} aria-hidden className="rx-light-ring-cyan" style={{
                  width: 12, height: 12,
                }} />
              ) : (
                /* Muted dot — 6px paper-toned token, no glow. */
                <span key={i} aria-hidden style={{
                  width: 6, height: 6,
                  background: "var(--line)",
                  borderRadius: 999,
                  display: "inline-block",
                  transition: "background .22s var(--ease-out, ease-out)",
                }} />
              )
            ))}
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
              color: "var(--muted)", marginLeft: 10, letterSpacing: ".08em",
            }}>
              {idx + 1} / {SCREENS.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {idx > 0 && (
              <CtaPill
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                label="Back"
                ariaLabel="Previous"
                variant="secondary"
                leadingIcon={ArrowLeft}
              />
            )}
            {!isLast && (
              <CtaPill
                onClick={() => setIdx(i => Math.min(SCREENS.length - 1, i + 1))}
                label="Next"
                ariaLabel="Next"
                variant="primary"
                trailingIcon={ArrowRight}
              />
            )}
            {isLast && (
              <CtaPill
                onClick={_dismiss}
                label="Start"
                ariaLabel="Done — start using the guide"
                variant="primary"
                leadingIcon={BookOpen}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if(typeof document === "undefined") return tree;
  return createPortal(tree, document.body);
}

export { OnboardingModal };

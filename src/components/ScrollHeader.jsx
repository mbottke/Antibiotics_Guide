/* component · ScrollHeader — Wave 7 W7-A condensing chrome.

   A wrap-around `<header>` that responds to vertical page scroll:

     • Starts at scrollY = 0 with a transparent background and no shadow.
     • Once the user scrolls past `threshold` pixels (default 64), the
       header flips into its "scrolled" state — a frosted-glass tint
       (saturate(180%) blur(20px) over a 72% `--paper` wash), a hairline
       bottom border, and the elevation-1 box-shadow.
     • A thin 2px progress strip along the bottom edge fills horizontally
       from left → right as the user scrolls through the page, painted
       with a neon cyan → electric blue → hot magenta gradient (with a
       graceful fallback to `--ox` for branches that don't yet ship the
       neon tokens).

   The component is *purely* a wrapper. It accepts any children — typically
   the BrandMark, a nav bar, action buttons — and adds the scroll-driven
   chrome around them. Consumers retain full control over the header's
   internal layout.

   POSITIONING

   Rendered with `position: sticky; top: 0; z-index: 50`. The sticky
   positioning is intentional: it keeps the header pinned within its
   scroll container while preserving normal document flow above and
   below it. For full-bleed page chrome, mount it as a direct child of
   the body / app root.

   REDUCED MOTION

   The CSS-driven cross-fade between transparent and frosted states
   uses CSS transitions tied to `--duration-base`. The global stylesheet
   already collapses every transition to 0.01ms under
   `prefers-reduced-motion: reduce`, so the visual change still happens
   — it just snaps instantly instead of cross-fading.

   USAGE

     <ScrollHeader>
       <BrandMark />
       <SiteNav />
     </ScrollHeader>

     <ScrollHeader threshold={120} showProgress={false}>
       …
     </ScrollHeader>

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { useScrollProgress } from "./util/useScrollProgress.js";

// Neon palette with graceful fallback to oxblood (--ox). The nested
// var(name, fallback) syntax means: use --neon-cyan if defined,
// otherwise fall back to --ox. This keeps the bar visible on branches
// that haven't merged the neon token rename yet.
const PROGRESS_GRADIENT =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

const TRANSITION =
  "background var(--duration-base) var(--ease-out)," +
  " backdrop-filter var(--duration-base) var(--ease-out)," +
  " -webkit-backdrop-filter var(--duration-base) var(--ease-out)," +
  " box-shadow var(--duration-base) var(--ease-out)," +
  " border-bottom-color var(--duration-base) var(--ease-out)";

export function ScrollHeader({
  threshold = 64,
  showProgress = true,
  children,
  className,
  style,
  ...rest
}) {
  const { scrolled, progress } = useScrollProgress(threshold);

  const blur = "saturate(180%) blur(20px)";

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: scrolled
      ? "color-mix(in srgb, var(--paper) 72%, transparent)"
      : "transparent",
    backdropFilter: scrolled ? blur : "none",
    WebkitBackdropFilter: scrolled ? blur : "none",
    borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
    boxShadow: scrolled ? "var(--shadow-e1)" : "none",
    transition: TRANSITION,
    ...style,
  };

  const classes =
    "rx-scroll-header" +
    (scrolled ? " is-scrolled" : "") +
    (className ? " " + className : "");

  return (
    <header className={classes} style={headerStyle} {...rest}>
      {children}
      {showProgress && (
        <div
          aria-hidden="true"
          data-testid="rx-scroll-progress"
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 2,
            width: (progress * 100) + "%",
            background: PROGRESS_GRADIENT,
            opacity: scrolled ? 0.7 : 0,
            pointerEvents: "none",
            transition:
              "opacity var(--duration-base) var(--ease-out)," +
              " width 60ms linear",
          }}
        />
      )}
    </header>
  );
}

export default ScrollHeader;

/* layer · ans-source-control — leads the answer when the syndrome
   demands surgical drainage / device removal / mechanical control.
   Surfaceless (no spine chip); pure banner above ans-start.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 10 W10 — promotes the lede banner to a NotchedBanner (severity
   "required") so the "do the procedure first" instruction reads with
   the same industrial-label gravity the rest of the answer-canvas
   gives REQUIRED severity rows. The clip-path notches signal "this
   is a hard precondition, not advice" at first glance. */

import React from "react";
import { Crosshair } from "lucide-react";
import { NotchedBanner } from "../decor/NotchedBanner.jsx";

export const sourceControlLayer = {
  id: "ans-source-control",
  group: "core",
  spineLabel: null,
  when: (shared) => !!shared.ans.sourceControl,
  render: (shared) => {
    const { ans } = shared;
    if (!ans.sourceControl) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <NotchedBanner
          severity="required"
          label="Source control is the therapy; antibiotics are adjunctive"
          icon={<Crosshair size={14} aria-hidden />}
        >
          <span style={{ color: "var(--ox-deep)" }}>{ans.sourceControl}</span>
        </NotchedBanner>
      </div>
    );
  },
};

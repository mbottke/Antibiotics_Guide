/* layer · ans-duration (legacy fallback) — narrative duration section
   used when the syndrome has no structured DurationBlock content
   authored. Suppressed when the structured block fires (duration.jsx);
   the two predicates are mutually exclusive.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — adopts the rail/numeral/counter chrome via Section
   props. Single-column (no aside) because the legacy fallback has no
   structured metadata to surface in the narrow column. */

import React from "react";
import { Clock } from "lucide-react";
import { Section } from "../Section.jsx";
import { Cite, Ev } from "../primitives.jsx";

export const durationLegacyLayer = {
  id: "ans-duration",
  group: "duration",
  spineLabel: "Duration",
  when: (shared) => !shared._duration,
  render: (shared) => {
    const { s, ans, onCite, _layerIndex, _layerTotal } = shared;
    return (
      <Section
        kicker="Duration"
        kineticKicker
        icon={Clock}
        glyph="duration"
        id="ans-duration"
        rail="DURATION"
        accent="cyan"
        artwork="mesh"
        index={_layerIndex}
        total={_layerTotal}
      >
        <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>
          <span className="rx-numeric-mega" style={{
            fontSize: 28, lineHeight: 1, marginRight: 6,
            color: "var(--neon-cyan, var(--ox))",
          }}>
            {s.duration}
          </span>
          {ans.evidence && (
            <span style={{ marginLeft: 8 }}>
              {ans.evidence.ev && <Ev kind={ans.evidence.ev} />}{" "}
              <Cite id={ans.evidence.ref} onClick={(cid) => onCite && onCite(cid)} />
            </span>
          )}
        </div>
      </Section>
    );
  },
};

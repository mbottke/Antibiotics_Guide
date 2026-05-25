/* layer · ans-duration (legacy fallback) — narrative duration section
   used when the syndrome has no structured DurationBlock content
   authored. Suppressed when the structured block fires (duration.jsx);
   the two predicates are mutually exclusive.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

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
    const { s, ans, onCite } = shared;
    return (
      <Section kicker="Duration" icon={Clock} id="ans-duration">
        <div style={{ fontSize:13.5, color:"var(--ink)", lineHeight:1.55 }}>
          {s.duration}
          {ans.evidence && (
            <span style={{ marginLeft:8 }}>
              {ans.evidence.ev && <Ev kind={ans.evidence.ev} />}{" "}
              <Cite id={ans.evidence.ref} onClick={(cid) => onCite && onCite(cid)} />
            </span>
          )}
        </div>
      </Section>
    );
  },
};

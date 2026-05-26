/* layer · ans-pearls — short, scannable bullets at the end of the answer.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — section now carries the rail label + decorative numeral
   chrome via Section's reframe props. */

import React from "react";
import { Activity } from "lucide-react";
import { Section } from "../Section.jsx";

export const pearlsLayer = {
  id: "ans-pearls",
  group: "evidence",
  spineLabel: "Pearls",
  when: (shared) => shared.ans.pearls.length > 0,
  render: (shared) => {
    const { _layerIndex, _layerTotal } = shared;
    return (
      <Section
        kicker="Pearls"
        kineticKicker
        icon={Activity}
        glyph="evidence"
        id="ans-pearls"
        rail="PEARLS"
        accent="lime"
        artwork="mesh"
        index={_layerIndex}
        total={_layerTotal}
      >
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.6 }}>
          {shared.ans.pearls.map((p, i) => (
            <li
              key={i}
              style={{ marginBottom: 5 }}
              dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }}
            />
          ))}
        </ul>
      </Section>
    );
  },
};

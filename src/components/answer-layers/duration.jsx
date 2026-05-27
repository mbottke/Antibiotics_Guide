/* layer · ans-duration (structured) — DurationBlock with branches, stopWhen,
   extendIf, and the bidirectional source-controlled bridge.

   Fires when getSyndromeDuration returned a structured object; the
   legacy narrative fallback (duration-legacy.jsx) covers the case
   when this is absent.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — wrapped in a Section that supplies the editorial chrome
   (rail label, decorative italic numeral, section counter) and the
   65/35 split with a branches-summary aside. The DurationBlock keeps
   its rich interactive chrome (it's already a self-contained surface). */

import React from "react";
import { Clock } from "lucide-react";
import { Section } from "../Section.jsx";
import { DurationBlock } from "../DurationBlock.jsx";

export const durationLayer = {
  id: "ans-duration",
  group: "duration",
  spineLabel: "Duration",
  when: (shared) => !!shared._duration,
  render: (shared) => {
    const {
      ans, _duration, pickedAgents, effectiveBranch, handleBranchSelect,
      startDate, setStartDate, _layerIndex, _layerTotal,
    } = shared;

    const branches = Array.isArray(_duration?.branches) ? _duration.branches : [];
    const aside = (
      <div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5,
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--ox)", fontWeight: 700,
          marginBottom: 8,
        }}>
          Decision branches
        </div>
        <div className="rx-mixed-pair" style={{ alignItems: "baseline", marginBottom: 12 }}>
          <span
            className="rx-numeric-mega"
            style={{ fontSize: 48, lineHeight: 1, color: "var(--ox)" }}
          >
            {branches.length || 1}
          </span>
          <span className="rx-pair-light" style={{ fontSize: 13 }}>
            {branches.length === 1 ? "path" : "paths"}
          </span>
        </div>
        {effectiveBranch && (
          <div style={{
            padding: "6px 10px", borderRadius: "10px 3px 10px 3px",
            background: "var(--ox-softer)", border: "1px solid var(--ox-line)",
            fontSize: 11, color: "var(--ox-deep)", lineHeight: 1.45,
          }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9,
              letterSpacing: ".14em", textTransform: "uppercase",
              fontWeight: 700, marginBottom: 3,
            }}>
              Active path
            </div>
            {effectiveBranch}
          </div>
        )}
      </div>
    );

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
        split
        aside={aside}
      >
        <DurationBlock
          duration={_duration}
          pickedAgents={pickedAgents}
          pickedBranch={effectiveBranch}
          onBranchSelect={handleBranchSelect}
          startDate={startDate}
          onStartDateChange={setStartDate}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </Section>
    );
  },
};

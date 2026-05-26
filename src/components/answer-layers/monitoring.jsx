/* layer · ans-monitoring — what to check (BCx, lactate, AUC, etc.).

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — wraps the MonitoringBlock inside a Section that
   declares the rail label, decorative numeral, and section counter,
   then defers the rich monitoring chrome to the block itself via
   `flatPanel`. The 65/35 split surfaces an evidence-tier sidebar
   when the underlying monitoring object exposes a `tier` or count. */

import React from "react";
import { Activity } from "lucide-react";
import { Section } from "../Section.jsx";
import { MonitoringBlock } from "../MonitoringBlock.jsx";

export const monitoringLayer = {
  id: "ans-monitoring",
  group: "duration",
  spineLabel: "Monitor",
  when: (shared) => !!shared._monitoring,
  render: (shared) => {
    const {
      ans, _monitoring, pickedAgents, effectiveBranch,
      _layerIndex, _layerTotal,
    } = shared;

    /* Aside metadata: surface an itemized count of monitoring items
       (BCx, lactate, AUC, drug levels). The exact shape of
       _monitoring varies by syndrome — we count items defensively. */
    const items = Array.isArray(_monitoring?.items) ? _monitoring.items : [];
    const aside = items.length > 0 ? (
      <div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5,
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--ox)", fontWeight: 700,
          marginBottom: 8,
        }}>
          Reassess targets
        </div>
        <div className="rx-mixed-pair" style={{ alignItems: "baseline", marginBottom: 8 }}>
          <span
            className="rx-numeric-mega"
            style={{ fontSize: 48, lineHeight: 1, color: "var(--ox)" }}
          >
            {items.length}
          </span>
          <span className="rx-pair-light" style={{ fontSize: 13 }}>
            {items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
          Each item below is gated by the picked regimen + effective
          duration branch — only what actually applies surfaces.
        </div>
      </div>
    ) : null;

    return (
      <Section
        kicker="Monitor"
        kineticKicker
        icon={Activity}
        glyph="duration"
        id="ans-monitoring"
        rail="MONITORING"
        accent="cyan"
        artwork="mesh"
        index={_layerIndex}
        total={_layerTotal}
        split={!!aside}
        aside={aside}
        flatPanel
      >
        <MonitoringBlock
          monitoring={_monitoring}
          pickedAgents={pickedAgents}
          pickedBranch={effectiveBranch}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </Section>
    );
  },
};

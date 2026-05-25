/* layer · ans-pkpd — kinetic-class visualization for the current regimen.

   Wave 5 PR-9. Module shape documented in _index.js. Consumes
   FORMULARY.pkpd from PR-4 — returns null when no agent in the
   regimen has authored kinetic data (graceful-fallback contract).

   Agent resolution (Codex review #107 fix):
   `shared.pickedAgents` is populated by RegimenOptions.onSelectionChange
   with `options[i].text` — option PROSE fragments, NOT canonical
   FORMULARY drug names (e.g., "Cefepime 2 g IV q8h" rather than
   "Cefepime"). Passing that raw to PkPdBlock would miss every entry.
   This layer scans each picked option through AGENT_RX (the same
   registry the regimen engine uses) to extract canonical names,
   falling back to ans.empiricAgents when no picks resolve.

   The `when` predicate mirrors the block's null check so the spine
   never emits a chip for an empty section (architectural-cohesion
   audit finding). */

import React from "react";
import { AGENT_RX, DRUG_ALIASES, FORMULARY } from "../../data/drugs.js";
import { PkPdBlock } from "../PkPdBlock.jsx";

/* FORMULARY lookup with alias fallback — built once at module load. */
const _DRUG_BY_NAME = (() => {
  const m = {};
  FORMULARY.forEach(c => c.drugs.forEach(d => { m[d.name] = d; }));
  return m;
})();

function _findFormularyDrug(name) {
  if(_DRUG_BY_NAME[name]) return _DRUG_BY_NAME[name];
  const reverse = Object.keys(DRUG_ALIASES).find(k => DRUG_ALIASES[k] === name);
  return reverse ? _DRUG_BY_NAME[reverse] : null;
}

/* Normalize free-text option fragments → canonical FORMULARY names.
   Scans each input through AGENT_RX (specific-first order) so a
   prose option ("Cefepime 2 g IV q8h or piperacillin-tazobactam")
   yields ["Cefepime", "Piperacillin-tazobactam"]. Empty input → []. */
function _normalizeAgents(inputs) {
  if(!Array.isArray(inputs) || inputs.length === 0) return [];
  const out = [];
  inputs.forEach((text) => {
    if(typeof text !== "string" || !text) return;
    // Already a canonical name? Keep as-is.
    const exact = AGENT_RX.find(a => a.canon === text);
    if(exact) { if(!out.includes(exact.canon)) out.push(exact.canon); return; }
    // Otherwise, harvest every AGENT_RX match in the text.
    AGENT_RX.forEach(({ rx, canon }) => {
      if(rx.test(text) && !out.includes(canon)) out.push(canon);
    });
  });
  return out;
}

function _agentsForBlock(shared) {
  const { pickedAgents, ans } = shared;
  /* Try picked-options text first, normalized through AGENT_RX. If
     normalization yields zero hits (option text contained nothing that
     resolves — fragments like "vancomycin trough 15-20"), fall back to
     ans.empiricAgents which are already canonical (composeAnswer
     populates from regimenAgents). */
  const normalized = _normalizeAgents(pickedAgents);
  if(normalized.length > 0) return normalized;
  return Array.isArray(ans?.empiricAgents) ? ans.empiricAgents : [];
}

export const pkpdLayer = {
  id: "ans-pkpd",
  group: "evidence",
  spineLabel: "PK/PD",
  when: (shared) => {
    /* Mirror PkPdBlock's render contract — show the spine chip only
       when AT LEAST ONE resolved agent carries authored pkpd. Without
       this, the spine emits an empty "PK/PD" chip pointing nowhere
       when none of the selected drugs have pkpd metadata. */
    const agents = _agentsForBlock(shared);
    if(!agents.length) return false;
    return agents.some((name) => {
      const drug = _findFormularyDrug(name);
      return !!(drug && drug.pkpd);
    });
  },
  render: (shared) => {
    const agents = _agentsForBlock(shared);
    return (
      <div id="ans-pkpd" style={{ scrollMarginTop: 96 }}>
        <PkPdBlock agents={agents} />
      </div>
    );
  },
};

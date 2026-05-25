/* component · answer-layers/_index — per-layer module aggregator.

   Wave 5 PR-3 Stage 2 anchor refactor. Every depth layer rendered by
   AnswerCanvas lives in its own file under `src/components/answer-layers/`.
   Each module exports a `<id>Layer` const of shape:

     {
       id          DOM id of the section; also used as the spine
                   onClick scroll target. Two layers share id
                   "ans-duration" by design — the structured
                   DurationBlock and the legacy narrative fallback —
                   with mutually exclusive `when` predicates.
       group       Core | Risks | Duration | Local | Special | Evidence.
                   Reserved for PR-12's layer-group tab strip.
       spineLabel  Chip text for the sticky Canvas spine. String, OR
                   function(shared) → string for labels that flip on
                   ctx (ans-pedspreg), OR null for a surfaceless
                   layer that renders content but no spine chip
                   (ans-source-control).
       when(shared)→ boolean. Gates spine visibility AND agrees with
                   the visibility of the layer's content. The
                   single-source-of-truth contract: any change to
                   what the render function emits MUST be mirrored
                   in this predicate.
       render(shared)→ JSX. Pure transformation from the shared bag
                   to React elements. No closures over external
                   state; everything required must be in `shared`.
     }

   The aggregator imports each layer module explicitly. Adding a new
   layer = creating a new file under this directory + adding one
   import + one entry in LAYERS. Removing a layer = deleting one file
   + two lines here. The shape mirrors the per-syndrome content
   modules in `src/data/syndromes/_index.js` from PR-1 / PR-2 — the
   same architectural pattern applied at the UI layer.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { sourceControlLayer } from "./source-control.jsx";
import { diagnosticsLayer } from "./diagnostics.jsx";
import { startLayer } from "./start.jsx";
import { coversLayer } from "./covers.jsx";
import { deescLayer } from "./deesc.jsx";
import { risksLayer } from "./risks.jsx";
import { rationaleLayer } from "./rationale.jsx";
import { objectionsLayer } from "./objections.jsx";
import { durationLayer } from "./duration.jsx";
import { monitoringLayer } from "./monitoring.jsx";
import { antibiogramLayer } from "./antibiogram.jsx";
import { regionalLayer } from "./regional.jsx";
import { novelLayer } from "./novel.jsx";
import { surgeLayer } from "./surge.jsx";
import { pedsPregLayer } from "./pedspreg.jsx";
import { depthLayer } from "./depth.jsx";
import { stateLayer } from "./state.jsx";
import { durationLegacyLayer } from "./duration-legacy.jsx";
import { pearlsLayer } from "./pearls.jsx";

/* Ordered render sequence. Order is the contract — changing the
   sequence here changes the on-screen order of every Decide answer.
   The two "ans-duration" entries are deliberately positioned in
   their natural reading slots: the structured DurationBlock sits
   between ans-objections and ans-monitoring; the legacy fallback
   sits between ans-state and ans-pearls. */
export const LAYERS = [
  sourceControlLayer,
  diagnosticsLayer,
  startLayer,
  coversLayer,
  deescLayer,
  risksLayer,
  rationaleLayer,
  objectionsLayer,
  durationLayer,
  monitoringLayer,
  antibiogramLayer,
  regionalLayer,
  novelLayer,
  surgeLayer,
  pedsPregLayer,
  depthLayer,
  stateLayer,
  durationLegacyLayer,
  pearlsLayer,
];

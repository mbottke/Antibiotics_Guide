/* engine · ctxMatch — Phase D3.4 patient-state-aware predicate
   evaluator. The runtime that turns declarative `matchCtx` predicates
   on content items into ctx-driven visual elevation.

   Predicates are JSON-serializable plain objects (not functions) so
   content authors can hand-write them without importing helpers, the
   linter/audit can scan for malformed shapes, and the per-syndrome
   content modules planned for the streamlined authoring layer can
   carry them safely across module boundaries.

   PREDICATE SHAPE
   ---------------
   matchCtx is an object whose KEYS are ctx fields and whose VALUES
   are either:

   - a constant (boolean / string) — exact-equality test
       hd: true                  → ctx.hd === true
       blAllergy: "severe"       → ctx.blAllergy === "severe"

   - a numeric comparator object with one of:
       { lt: N }                 → ctx.field < N
       { lte: N }                → ctx.field <= N
       { gt: N }                 → ctx.field > N
       { gte: N }                → ctx.field >= N
       { eq: N }                 → ctx.field === N
       { between: [low, high] }  → low <= ctx.field <= high (inclusive)

   - a string-set test:
       { in: ["a", "b"] }        → ctx.field is one of these

   Multiple keys in one object are AND-ed (every condition must hold).
   To express OR, ship multiple matchCtx-bearing items or wrap with
   the { any: [...] } convenience form (each entry evaluated as its
   own matchCtx; ANY match → true).

       matchCtx: { any: [ { crcl: { lt: 30 } }, { hd: true } ] }
       → "ctx.crcl < 30  OR  ctx.hd === true"

   FIELDS RECOGNIZED
   -----------------
   The evaluator reads from ctx.* directly. Common fields populated
   by the case parser:
     crcl, age, weight, scr, sex, hd, severe,
     mrsaRisk, pseudoRisk, esblRisk, blAllergy, hepStage, pregnancy,
     concurrentMeds (D3.9 future)

   Unknown fields → predicate fails safely (returns false) rather
   than throwing. This is the safety contract: a misnamed field in
   authored content silently no-ops at runtime; the content-audit
   gate catches such issues at CI time.

   USAGE
   -----
     import { matchesCtx } from "../engines/ctxMatch.js";
     const fires = matchesCtx(item.matchCtx, ctx);  // boolean

   Inpatient Antibiotic Guide — module graph documented in README.md. */

/* Evaluate a single comparator object ({ lt, gte, between, in, etc. })
   against a ctx-field value. Returns true when the comparator
   conditions are satisfied, false otherwise. Unknown comparator
   keys are ignored (forgiving — content authors won't crash the
   bedside surface from a typo). */
function _evalComparator(value, comparator) {
  if(comparator == null) return false;
  // Constant equality short-circuit (string / boolean predicates)
  if(typeof comparator !== "object" || Array.isArray(comparator)) {
    return value === comparator;
  }
  // Numeric comparators
  if("lt"  in comparator && !(value <  comparator.lt))   return false;
  if("lte" in comparator && !(value <= comparator.lte))  return false;
  if("gt"  in comparator && !(value >  comparator.gt))   return false;
  if("gte" in comparator && !(value >= comparator.gte))  return false;
  if("eq"  in comparator && !(value === comparator.eq))  return false;
  // Range — inclusive on both ends
  if("between" in comparator) {
    const r = comparator.between;
    if(!Array.isArray(r) || r.length !== 2) return false;
    if(!(value >= r[0] && value <= r[1])) return false;
  }
  // Set membership
  if("in" in comparator) {
    if(!Array.isArray(comparator.in)) return false;
    if(!comparator.in.includes(value)) return false;
  }
  // If we never short-circuited false, predicate held. Empty object
  // {} returns true — interpreted as "field exists" / unconditional;
  // authors should not use {} (use `true` instead) but it's defined.
  return true;
}

/* Evaluate a full matchCtx predicate against a ctx object. Returns
   true when ALL conditions hold (AND-semantics across keys). The
   special `any` key inverts to OR-semantics across its array entries
   (each entry is itself a full matchCtx predicate, recursively
   evaluated). */
function matchesCtx(predicate, ctx) {
  if(!predicate || typeof predicate !== "object") return false;
  if(!ctx) return false;

  for(const key of Object.keys(predicate)) {
    const cmp = predicate[key];

    // OR-semantics convenience: { any: [pred, pred, ...] }
    if(key === "any") {
      if(!Array.isArray(cmp) || cmp.length === 0) return false;
      const orHits = cmp.some(p => matchesCtx(p, ctx));
      if(!orHits) return false;
      continue;
    }

    // Regular key: read from ctx, evaluate comparator
    const value = ctx[key];
    if(value === undefined || value === null) return false;
    if(!_evalComparator(value, cmp)) return false;
  }

  return true;
}

export { matchesCtx };

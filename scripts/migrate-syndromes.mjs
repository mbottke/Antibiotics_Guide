#!/usr/bin/env node
/* Wave 5 PR-2 — mass-migrate remaining syndromes into per-syndrome modules.

   For each top-level key in REGIMEN_CONTENT_INLINE + SYNDROME_DECISION_INLINE
   that is not already migrated:
     1. Extract the leading slash-star header comment block (if any) and the
        full bracket-bounded entry body from each monolith.
     2. Write `src/data/syndromes/<id>.js` exporting
        `{ id, regimen, decision }` — mirroring the sentinel pattern that
        cystitis / sepsis / cap established in PR-1.
     3. Delete the extracted blocks from both monoliths.
     4. Update `src/data/syndromes/_index.js` to import and register every
        syndrome module.

   Determinism contract: this script preserves text byte-for-byte. The
   merged dictionaries that come out the other side must be identical to
   what would be produced if the entries had remained inline. The audit
   test will catch any divergence. */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DECISION_PATH = join(ROOT, "src/data/syndromeDecision.js");
const REGIMEN_PATH = join(ROOT, "src/data/regimenContent.js");
const SYNDROMES_DIR = join(ROOT, "src/data/syndromes");
const INDEX_PATH = join(SYNDROMES_DIR, "_index.js");

const TOP_KEY_RE = /^  (?:"([a-zA-Z0-9_-]+)"|([a-zA-Z][a-zA-Z0-9_-]*)): \{$/;
const TOP_CLOSE_RE = /^  \},$/;

/* Extract a map: key → { commentLines: string[], bodyLines: string[],
   startLine, endLine } for every top-level entry in a monolith file. */
function parseMonolith(src) {
  const lines = src.split("\n");
  const entries = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TOP_KEY_RE);
    if (!m) continue;
    const key = m[1] || m[2];
    // Walk forward until matching close at same indent.
    let close = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (TOP_CLOSE_RE.test(lines[j])) { close = j; break; }
    }
    if (close === -1) throw new Error(`unterminated entry for ${key} at line ${i + 1}`);
    // Walk backward to gather preceding comment block (immediately above,
    // possibly preceded by a single blank line — we skip that blank).
    let commentEnd = i - 1;
    while (commentEnd >= 0 && lines[commentEnd] === "") commentEnd--;
    let commentStart = commentEnd;
    if (commentEnd >= 0 && lines[commentEnd].includes("*/")) {
      while (commentStart > 0 && !lines[commentStart].trimStart().startsWith("/*")) {
        commentStart--;
      }
    } else {
      commentStart = commentEnd + 1; // no comment
    }
    const commentLines = commentStart <= commentEnd
      ? lines.slice(commentStart, commentEnd + 1)
      : [];
    const bodyLines = lines.slice(i, close + 1);
    entries.set(key, { commentLines, bodyLines, startLine: i, endLine: close });
  }
  return { lines, entries };
}

/* Render the body of an entry as the inner content of a top-level const.
   The original was `  KEY: { ... },` — strip the leading `  KEY: ` from
   the first line, the trailing `,` from the last line, and outdent every
   line by two spaces so the closing brace lands at column 0. The result
   is suitable for `const regimen = { ... };`. */
function reindentEntry(bodyLines, keyAsWritten) {
  const first = bodyLines[0];
  const innerFirst = first.replace(`  ${keyAsWritten}: `, "");
  const last = bodyLines[bodyLines.length - 1].replace(/^  /, "").replace(/,$/, "");
  const middle = bodyLines.slice(1, -1).map((l) => l.startsWith("  ") ? l.slice(2) : l);
  return [innerFirst, ...middle, last].join("\n");
}

function keyAsWritten(key) {
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key) && !key.includes("-")
    ? key
    : `"${key}"`;
}

function idLiteral(key) {
  return JSON.stringify(key);
}

/* Hyphens are not valid in JS identifiers, so a key like "sepsis-hcaq"
   needs a non-hyphenated import name. We use camelCase: sepsisHcaq. */
function importIdentifier(key) {
  return key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function syndromeModule(key, decisionEntry, regimenEntry) {
  // Use a single header per module. Prefer the syndromeDecision.js comment
  // (which tends to carry the richer multi-line description); fall back to
  // the regimenContent.js comment if decision is absent. Outdent the source
  // comment by 2 spaces so it sits at column 0 like the rest of the module.
  const sourceComment = (decisionEntry?.commentLines.length
    ? decisionEntry.commentLines
    : regimenEntry?.commentLines || []
  ).join("\n").replace(/^  /gm, "");
  const header = sourceComment
    || `/* data · syndromes/${key} — migrated from regimenContent.js +\n   syndromeDecision.js in Wave 5 PR-2 (mass migration). Module shape\n   documented in cystitis.js. */`;

  const parts = [header, ""];

  if (regimenEntry) {
    parts.push(`const regimen = ${reindentEntry(regimenEntry.bodyLines, keyAsWritten(key))};`);
    parts.push("");
  }
  if (decisionEntry) {
    parts.push(`const decision = ${reindentEntry(decisionEntry.bodyLines, keyAsWritten(key))};`);
    parts.push("");
  }

  const exportFields = ["id: " + idLiteral(key)];
  if (regimenEntry) exportFields.push("regimen");
  if (decisionEntry) exportFields.push("decision");

  parts.push(`export default { ${exportFields.join(", ")} };`);
  parts.push("");
  return parts.join("\n");
}

function removeEntries(src, entries, keys) {
  // Build a sorted list of [start, end] line ranges to delete, including
  // the leading comment block (if any) AND the single trailing blank line
  // that follows the closing `},`.
  const ranges = [];
  for (const key of keys) {
    const e = entries.get(key);
    if (!e) continue;
    const start = e.commentLines.length ? e.startLine - e.commentLines.length : e.startLine;
    let end = e.endLine;
    const allLines = src.split("\n");
    if (allLines[end + 1] === "") end = end + 1;
    ranges.push([start, end]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  // Validate no overlap.
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i][0] <= ranges[i - 1][1]) {
      throw new Error(`overlapping ranges: ${JSON.stringify(ranges[i - 1])} vs ${JSON.stringify(ranges[i])}`);
    }
  }
  const lines = src.split("\n");
  const out = [];
  let cursor = 0;
  for (const [a, b] of ranges) {
    out.push(...lines.slice(cursor, a));
    cursor = b + 1;
  }
  out.push(...lines.slice(cursor));
  return out.join("\n");
}

function buildIndex(syndromeKeys) {
  const sorted = [...syndromeKeys].sort();
  const imports = sorted.map((k) => `import ${importIdentifier(k)} from "./${k}.js";`).join("\n");
  const entries = sorted.map((k) => k === importIdentifier(k) ? `  ${k}` : `  ${idLiteral(k)}: ${importIdentifier(k)}`).join(",\n");
  return `/* data · syndromes/_index — per-syndrome module aggregator.

   Wave 5 PR-1 + PR-2 anchor refactor. Each \`src/data/syndromes/<id>.js\`
   exports a default object:
       { id, regimen?, decision? }
   Either content key is optional — a module may carry only \`regimen\`
   while leaving \`decision\` to be authored in a later tranche, or
   vice-versa.

   Imports are explicit (no \`import.meta.glob\`). The list below is
   generated by \`scripts/migrate-syndromes.mjs\`; new syndromes added
   by hand should be inserted in alphabetical order and the test suite
   re-run.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

${imports}

const SYNDROME_MODULES = {
${entries},
};

/* Verify module integrity once at module-load. A module that ships
   a mismatched \`id\` field is a copy-paste bug we want to catch
   loudly during test or first dev-server load, not silently lose
   to a key collision in the merged dictionary. */
for (const [key, mod] of Object.entries(SYNDROME_MODULES)) {
  if (!mod || mod.id !== key) {
    throw new Error(
      \`syndromes/_index: module key "\${key}" does not match its default-export id "\${mod && mod.id}"\`
    );
  }
}

const REGIMEN_PARTIALS = Object.fromEntries(
  Object.entries(SYNDROME_MODULES)
    .filter(([, m]) => m && m.regimen)
    .map(([id, m]) => [id, m.regimen])
);

const DECISION_PARTIALS = Object.fromEntries(
  Object.entries(SYNDROME_MODULES)
    .filter(([, m]) => m && m.decision)
    .map(([id, m]) => [id, m.decision])
);

export { SYNDROME_MODULES, REGIMEN_PARTIALS, DECISION_PARTIALS };
`;
}

function main() {
  const decisionSrc = readFileSync(DECISION_PATH, "utf8");
  const regimenSrc = readFileSync(REGIMEN_PATH, "utf8");
  const decision = parseMonolith(decisionSrc);
  const regimen = parseMonolith(regimenSrc);

  const alreadyMigrated = new Set(
    readdirSync(SYNDROMES_DIR)
      .filter((f) => f.endsWith(".js") && f !== "_index.js")
      .map((f) => f.slice(0, -3))
  );

  const allKeys = new Set([...decision.entries.keys(), ...regimen.entries.keys()]);
  const toMigrate = [...allKeys].filter((k) => !alreadyMigrated.has(k));
  toMigrate.sort();

  console.log(`Already migrated: ${[...alreadyMigrated].sort().join(", ")}`);
  console.log(`Decision keys: ${decision.entries.size}, Regimen keys: ${regimen.entries.size}`);
  console.log(`Will migrate ${toMigrate.length} syndromes.`);

  let writtenCount = 0;
  for (const key of toMigrate) {
    const decisionEntry = decision.entries.get(key);
    const regimenEntry = regimen.entries.get(key);
    const out = syndromeModule(key, decisionEntry, regimenEntry);
    const path = join(SYNDROMES_DIR, `${key}.js`);
    if (existsSync(path)) {
      throw new Error(`module already exists: ${path}`);
    }
    writeFileSync(path, out);
    writtenCount++;
  }
  console.log(`Wrote ${writtenCount} syndrome modules.`);

  // Delete the migrated entries from both monoliths.
  const newDecisionSrc = removeEntries(decisionSrc, decision.entries, toMigrate);
  const newRegimenSrc = removeEntries(regimenSrc, regimen.entries, toMigrate);
  writeFileSync(DECISION_PATH, newDecisionSrc);
  writeFileSync(REGIMEN_PATH, newRegimenSrc);

  // Regenerate _index.js with the union of already-migrated + newly-migrated.
  const allSyndromeKeys = [...alreadyMigrated, ...toMigrate];
  writeFileSync(INDEX_PATH, buildIndex(allSyndromeKeys));
  console.log(`Updated _index.js with ${allSyndromeKeys.length} syndromes.`);
}

main();

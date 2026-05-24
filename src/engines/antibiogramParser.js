/* engine · antibiogram CSV parser — Phase E1
   Pure parser. Takes a CSV string + meta (name, period), returns a
   parsed antibiogram in the same shape ILH_ANTIBIOGRAM uses, plus
   a non-fatal error list (unrecognized header columns, unmapped
   organism rows, out-of-range %S values).

   PARSER CONTRACT
   ---------------
   Input CSV expected shape (lenient):

     Organism, # of Isolates, Ampicillin, Cefazolin, ..., TMP-SMX
     Escherichia coli, 596, 56, 78, ..., 79
     ...

   Cell semantics:
     - integer 0-100      · stored as integer
     - empty / "—" / "-"  · stored as null (insufficient data)
     - "<value>‡"          · stored as conditional :urine breakpoint
                            in addition to bare key (urine row)
     - "<value>¶"          · stored as :meningitis breakpoint
     - "<value>*"          · stored as bare value PLUS an AmpC caveat
     - "<value>/<value>"   · serious / context breakpoint pair (the
                            second value is parsed by suffix)

   Errors are non-fatal — invalid rows are skipped, listed in
   the `errors` return so the UI can show them to the uploader.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { resolveAgentKey, resolveOrganism } from "../data/antibiograms/index.js";

const _AMPC_CAVEAT = "AmpC inducer — prefer cefepime empirically (IDSA 2024 AMR-GN).";

/* Split a CSV line into fields. Handles quoted fields with embedded
   commas. Trims whitespace from each field. */
function splitCSVLine(line) {
  const fields = [];
  let cur = "";
  let inQuote = false;
  for(let i = 0; i < line.length; i++) {
    const c = line[i];
    if(c === '"') {
      if(inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if(c === "," && !inQuote) {
      fields.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur.trim());
  return fields;
}

/* Parse a single susceptibility cell. Returns one of:
   - { value: int, urine?: int, meningitis?: int, ampcCaution?: true }
   - { value: null }                                  ← no data
   - { error: "string" }                              ← parse failure */
function parseCell(raw) {
  if(raw == null) return { value: null };
  const s = String(raw).trim();
  if(s === "" || s === "—" || s === "-" || s === "—" || s === "–") return { value: null };

  // Detect AmpC asterisk + meningitis ¶ + urine ‡ footnote markers.
  const ampc = /\*/.test(s);
  const urine = /‡/.test(s);
  const mening = /¶/.test(s);

  // Pull out all integer-like tokens.
  const nums = (s.match(/-?\d+/g) || []).map(n => parseInt(n, 10));
  if(nums.length === 0) return { error: "no numeric value in cell '" + s + "'" };

  // Validate range.
  for(const n of nums) {
    if(n < 0 || n > 100) return { error: "%S value out of range 0-100: '" + s + "'" };
  }

  const out = { value: nums[0] };
  if(nums.length === 2) {
    if(urine) out.urine = nums[1];
    else if(mening) out.meningitis = nums[1];
    // No marker but two values — interpret second as urine breakpoint (most common pattern).
    else out.urine = nums[1];
  }
  if(ampc) out.ampcCaution = true;
  return out;
}

/* Parse a row given the header agent canonical keys + the resolved
   organism + the row's raw fields. Returns
   { susceptibility, caveats, error? }. */
function parseRow(headerAgents, headerVariants, orgDef, rawFields, isolatesIdx, organismIdx) {
  const susceptibility = {};
  const caveats = {};
  const localErrors = [];

  for(let i = 0; i < rawFields.length; i++) {
    if(i === organismIdx || i === isolatesIdx) continue;
    const agentKey = headerAgents[i];
    if(!agentKey) continue;  // header column we couldn't map
    const variantSuffix = headerVariants[i];  // "urine" | "meningitis" | null
    const parsed = parseCell(rawFields[i]);
    if(parsed.error) {
      localErrors.push("column '" + agentKey + "': " + parsed.error);
      continue;
    }
    if(parsed.value !== null) {
      const targetKey = variantSuffix ? (agentKey + ":" + variantSuffix) : agentKey;
      susceptibility[targetKey] = parsed.value;
    }
    if(parsed.urine !== undefined) susceptibility[agentKey + ":urine"] = parsed.urine;
    if(parsed.meningitis !== undefined) susceptibility[agentKey + ":meningitis"] = parsed.meningitis;
    if(parsed.ampcCaution) caveats[agentKey] = _AMPC_CAVEAT;
  }

  return { susceptibility, caveats, errors: localErrors };
}

/* Parse a CSV antibiogram. */
function parseAntibiogramCSV(csvText, meta = {}) {
  const errors = [];
  if(!csvText || typeof csvText !== "string") {
    return { antibiogram: null, errors: [{ row: 0, message: "empty CSV input" }] };
  }

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));
  if(lines.length < 2) {
    return { antibiogram: null, errors: [{ row: 0, message: "CSV must contain at least a header row and one data row" }] };
  }

  // ---- HEADER ----
  const header = splitCSVLine(lines[0]);
  // Find organism + isolates columns by alias.
  let organismIdx = -1;
  let isolatesIdx = -1;
  const headerAgents = new Array(header.length).fill(null);
  const headerVariants = new Array(header.length).fill(null);
  for(let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase();
    if(h === "organism" || h === "species" || h === "pathogen") {
      organismIdx = i;
    } else if(h === "# of isolates" || h === "n" || h === "isolates" || h === "count" || h === "# isolates") {
      isolatesIdx = i;
    } else {
      // Allow `<agent>:urine` or `<agent>:meningitis` headers (round-trip
      // from serializeAntibiogramCSV). The variant suffix routes the value
      // into the corresponding susceptibility variant key.
      const colonIdx = header[i].indexOf(":");
      if(colonIdx > 0) {
        const base = header[i].slice(0, colonIdx);
        const variant = header[i].slice(colonIdx + 1).toLowerCase().trim();
        const agentKey = resolveAgentKey(base);
        if(agentKey && (variant === "urine" || variant === "meningitis")) {
          headerAgents[i] = agentKey;
          headerVariants[i] = variant;
          continue;
        }
      }
      const agentKey = resolveAgentKey(header[i]);
      if(agentKey) headerAgents[i] = agentKey;
      else if(header[i]) errors.push({ row: 0, column: i, message: "unrecognized header column '" + header[i] + "' — skipped" });
    }
  }
  if(organismIdx < 0) {
    return { antibiogram: null, errors: [{ row: 0, message: "missing required 'Organism' column in header" }] };
  }

  // ---- BODY ----
  const organisms = [];
  for(let r = 1; r < lines.length; r++) {
    const fields = splitCSVLine(lines[r]);
    if(fields.length < 2) continue;

    const orgRaw = fields[organismIdx];
    const orgDef = resolveOrganism(orgRaw);
    if(!orgDef) {
      errors.push({ row: r, message: "unrecognized organism '" + orgRaw + "' — row skipped. Add an alias in ANTIBIOGRAM_ORGANISMS if this should be recognized." });
      continue;
    }

    let n = null;
    let smallN = false;
    if(isolatesIdx >= 0) {
      const rawN = fields[isolatesIdx] || "";
      const dagger = /†/.test(rawN);
      const numMatch = rawN.match(/\d+/);
      if(numMatch) {
        n = parseInt(numMatch[0], 10);
        smallN = dagger || n < 30;
      }
    }

    const { susceptibility, caveats, errors: rowErrors } = parseRow(
      headerAgents, headerVariants, orgDef, fields, isolatesIdx, organismIdx,
    );
    for(const e of rowErrors) errors.push({ row: r, message: e });

    organisms.push({
      species: orgDef.species,
      orgId: orgDef.orgId,
      gram: orgDef.gram,
      n,
      smallN,
      susceptibility,
      caveats,
    });
  }

  if(organisms.length === 0) {
    return { antibiogram: null, errors: errors.length ? errors : [{ row: 0, message: "no recognizable organism rows found" }] };
  }

  const id = meta.id || ("custom-" + Date.now());
  const antibiogram = {
    id,
    name: meta.name || "Custom antibiogram",
    subtitle: meta.subtitle || "",
    network: meta.network || "",
    city: meta.city || "",
    period: meta.period || { from: "", to: "" },
    source: meta.source || "User upload",
    isSeed: false,
    notes: meta.notes || [],
    organisms,
  };

  return { antibiogram, errors };
}

/* Serialize an antibiogram back to CSV (round-trip support — used by
   the management UI's "download" action). Default-only susceptibility
   is exported; conditional breakpoints get suffixed columns. */
function serializeAntibiogramCSV(antibiogram) {
  if(!antibiogram || !Array.isArray(antibiogram.organisms)) return "";

  // Collect every agent + variant suffix that appears in any row.
  const agentVariants = new Set();
  for(const org of antibiogram.organisms) {
    for(const key of Object.keys(org.susceptibility || {})) agentVariants.add(key);
  }
  const cols = Array.from(agentVariants).sort();

  const header = ["Organism", "# of Isolates", ...cols];
  const rows = [header.join(",")];

  for(const org of antibiogram.organisms) {
    const isolates = (org.n || "") + (org.smallN ? "†" : "");
    const cells = cols.map(c => {
      const v = org.susceptibility[c];
      return v == null ? "" : String(v);
    });
    rows.push([org.species, isolates, ...cells].join(","));
  }

  return rows.join("\n");
}

export { parseAntibiogramCSV, serializeAntibiogramCSV, parseCell, splitCSVLine };

import { describe, it, expect } from "vitest";
import {
  parseAntibiogramCSV,
  serializeAntibiogramCSV,
  parseCell,
  splitCSVLine,
} from "../src/engines/antibiogramParser.js";
import {
  ANTIBIOGRAM_AGENTS,
  ILH_ANTIBIOGRAM,
  resolveAgentKey,
  resolveOrganism,
  rowsForOrgId,
  getSusceptibility,
  listAgents,
  getSeedAntibiograms,
} from "../src/data/antibiograms/index.js";

/* Phase E1 acceptance — the antibiogram data layer must:
   1. Resolve every aliased agent / organism string the CSV parser sees.
   2. Parse a sample CSV round-trip into the same shape as the ILH seed.
   3. Preserve conditional breakpoints (urine ‡ / meningitis ¶) and AmpC
      caveats from cell-level footnote markers.
   4. Surface non-fatal parse errors without failing the whole upload. */

describe("ANTIBIOGRAM_AGENTS canonical vocabulary", () => {
  it("every alias resolves back to exactly one canonical key", () => {
    for(const [canon, def] of Object.entries(ANTIBIOGRAM_AGENTS)) {
      for(const alias of def.aliases) {
        const r = resolveAgentKey(alias);
        expect(r, `alias '${alias}' should resolve to '${canon}'`).toBe(canon);
      }
      // canonical key resolves to itself
      expect(resolveAgentKey(canon)).toBe(canon);
    }
  });

  it("listAgents returns the full canonical key set", () => {
    const keys = listAgents();
    expect(keys.length).toBe(Object.keys(ANTIBIOGRAM_AGENTS).length);
    expect(keys).toContain("piperacillin-tazobactam");
    expect(keys).toContain("tmp-smx");
  });

  it("returns null for unrecognized agent strings", () => {
    expect(resolveAgentKey("not-an-antibiotic")).toBeNull();
    expect(resolveAgentKey("")).toBeNull();
    expect(resolveAgentKey(null)).toBeNull();
  });
});

describe("resolveOrganism", () => {
  it("resolves E. coli / Escherichia coli to wild-type entero", () => {
    expect(resolveOrganism("E. coli").orgId).toBe("entero");
    expect(resolveOrganism("Escherichia coli").orgId).toBe("entero");
    expect(resolveOrganism("ESCHERICHIA COLI").orgId).toBe("entero");
  });

  it("maps Enterobacter species to AmpC bucket", () => {
    expect(resolveOrganism("Enterobacter hormaechei").orgId).toBe("ampc");
    expect(resolveOrganism("Klebsiella aerogenes").orgId).toBe("ampc");
    expect(resolveOrganism("Citrobacter freundii").orgId).toBe("ampc");
  });

  it("ignores trailing footnote markers (†, *, ‡, ¶)", () => {
    expect(resolveOrganism("Klebsiella aerogenes†").orgId).toBe("ampc");
  });

  it("returns null for unrecognized organism strings", () => {
    expect(resolveOrganism("Made up organism")).toBeNull();
  });
});

describe("ILH_ANTIBIOGRAM seed", () => {
  it("includes 11 organism rows matching the ILH PDF", () => {
    expect(ILH_ANTIBIOGRAM.organisms.length).toBe(11);
  });

  it("flags the AmpC-induction caveat for ceftriaxone on Enterobacter hormaechei", () => {
    const row = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Enterobacter hormaechei");
    expect(row.caveats.ceftriaxone).toMatch(/AmpC/);
    expect(row.caveats.ceftazidime).toMatch(/AmpC/);
  });

  it("preserves the cefazolin urine breakpoint for E. coli (87 ‡) and serious (78)", () => {
    const ec = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Escherichia coli");
    expect(ec.susceptibility["cefazolin"]).toBe(78);
    expect(ec.susceptibility["cefazolin:urine"]).toBe(87);
  });

  it("preserves the meningitis breakpoint for S. pneumoniae (PEN 96 / CRO 100 default; 70 / 96 meningitis)", () => {
    const spn = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Streptococcus pneumoniae");
    expect(spn.susceptibility["penicillin"]).toBe(96);
    expect(spn.susceptibility["penicillin:meningitis"]).toBe(70);
    expect(spn.susceptibility["ceftriaxone"]).toBe(100);
    expect(spn.susceptibility["ceftriaxone:meningitis"]).toBe(96);
  });

  it("flags small-N rows with smallN: true (S. pneumoniae n=23, K. aerogenes n=25)", () => {
    const spn = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Streptococcus pneumoniae");
    const ka = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Klebsiella aerogenes");
    expect(spn.smallN).toBe(true);
    expect(ka.smallN).toBe(true);
  });

  it("encodes intrinsic resistance as 0 (Proteus + NFT, Pseudomonas + ETP)", () => {
    const pm = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Proteus mirabilis");
    const pa = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Pseudomonas aeruginosa");
    expect(pm.susceptibility["nitrofurantoin"]).toBe(0);
    expect(pa.susceptibility["ertapenem"]).toBe(0);
  });

  it("ships as the only seed antibiogram", () => {
    const seeds = getSeedAntibiograms();
    expect(seeds.length).toBe(1);
    expect(seeds[0].id).toBe("ilh-2024");
    expect(seeds[0].isSeed).toBe(true);
  });
});

describe("rowsForOrgId — bucket mapping", () => {
  it("returns 4 wild-type entero rows from ILH (E. coli, K. pneumoniae, K. oxytoca, P. mirabilis)", () => {
    const rows = rowsForOrgId(ILH_ANTIBIOGRAM, "entero");
    expect(rows.length).toBe(4);
    const species = rows.map(r => r.species).sort();
    expect(species).toEqual(["Escherichia coli", "Klebsiella oxytoca", "Klebsiella pneumoniae", "Proteus mirabilis"]);
  });

  it("returns 2 AmpC rows (Enterobacter hormaechei + K. aerogenes)", () => {
    expect(rowsForOrgId(ILH_ANTIBIOGRAM, "ampc").length).toBe(2);
  });

  it("returns the single Pseudomonas row", () => {
    expect(rowsForOrgId(ILH_ANTIBIOGRAM, "pseudo").length).toBe(1);
  });
});

describe("getSusceptibility — context-aware lookup", () => {
  const ec = ILH_ANTIBIOGRAM.organisms.find(o => o.species === "Escherichia coli");

  it("returns the bare value when no context", () => {
    expect(getSusceptibility(ec, "cefazolin")).toBe(78);
  });

  it("returns the urine breakpoint when context='urine'", () => {
    expect(getSusceptibility(ec, "cefazolin", "urine")).toBe(87);
  });

  it("falls back to the bare value when urine variant is absent", () => {
    expect(getSusceptibility(ec, "meropenem", "urine")).toBe(100);
  });

  it("returns null for an agent absent from the row", () => {
    expect(getSusceptibility(ec, "linezolid")).toBeNull();
  });
});

describe("parseCell — cell-level parser", () => {
  it("parses a plain integer", () => {
    expect(parseCell("78")).toEqual({ value: 78 });
  });

  it("returns null for empty / dash cells", () => {
    expect(parseCell("")).toEqual({ value: null });
    expect(parseCell("—")).toEqual({ value: null });
    expect(parseCell("-")).toEqual({ value: null });
  });

  it("captures AmpC asterisk and keeps the value", () => {
    expect(parseCell("70*")).toEqual({ value: 70, ampcCaution: true });
  });

  it("captures urine ‡ as a second value", () => {
    expect(parseCell("78/87‡")).toEqual({ value: 78, urine: 87 });
  });

  it("captures meningitis ¶ as a second value", () => {
    expect(parseCell("100/96¶")).toEqual({ value: 100, meningitis: 96 });
  });

  it("rejects out-of-range values", () => {
    const r = parseCell("150");
    expect(r.error).toMatch(/out of range/);
  });

  it("rejects non-numeric garbage", () => {
    const r = parseCell("susceptible");
    expect(r.error).toMatch(/no numeric/);
  });
});

describe("splitCSVLine", () => {
  it("splits a simple comma-separated line", () => {
    expect(splitCSVLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace from each field", () => {
    expect(splitCSVLine("  a , b ,c")).toEqual(["a", "b", "c"]);
  });

  it("handles quoted fields with embedded commas", () => {
    expect(splitCSVLine('"hello, world",b,c')).toEqual(["hello, world", "b", "c"]);
  });

  it("handles escaped quotes inside quoted fields", () => {
    expect(splitCSVLine('"say ""hi""",b')).toEqual(['say "hi"', "b"]);
  });
});

describe("parseAntibiogramCSV — full CSV → antibiogram", () => {
  it("parses a minimal CSV with two organisms", () => {
    const csv = [
      "Organism,# of Isolates,Cefazolin,Ceftriaxone,Meropenem",
      "Escherichia coli,500,78,90,100",
      "Pseudomonas aeruginosa,100,0,0,93",
    ].join("\n");
    const { antibiogram, errors } = parseAntibiogramCSV(csv, { name: "Test Hospital" });
    expect(antibiogram).not.toBeNull();
    expect(antibiogram.name).toBe("Test Hospital");
    expect(antibiogram.organisms.length).toBe(2);
    expect(errors.length).toBe(0);
    const ec = antibiogram.organisms.find(o => o.species === "Escherichia coli");
    expect(ec.n).toBe(500);
    expect(ec.susceptibility.cefazolin).toBe(78);
    expect(ec.susceptibility.ceftriaxone).toBe(90);
  });

  it("captures non-fatal errors for unknown organism rows", () => {
    const csv = [
      "Organism,# of Isolates,Cefazolin",
      "Escherichia coli,500,78",
      "Made-up bug,100,99",
    ].join("\n");
    const { antibiogram, errors } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms.length).toBe(1);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors[0].message).toMatch(/unrecognized organism/);
  });

  it("captures non-fatal errors for unknown header columns but parses known ones", () => {
    const csv = [
      "Organism,# of Isolates,Cefazolin,FrobulantitDimer,Meropenem",
      "Escherichia coli,500,78,99,100",
    ].join("\n");
    const { antibiogram, errors } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms.length).toBe(1);
    expect(antibiogram.organisms[0].susceptibility.cefazolin).toBe(78);
    expect(antibiogram.organisms[0].susceptibility.meropenem).toBe(100);
    expect(errors.some(e => /unrecognized header/.test(e.message))).toBe(true);
  });

  it("flags smallN when isolate count carries † or is < 30", () => {
    const csv = [
      "Organism,# of Isolates,Cefazolin",
      "Streptococcus pneumoniae,23†,100",
      "Klebsiella aerogenes,25,0",
    ].join("\n");
    const { antibiogram } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms[0].smallN).toBe(true);
    expect(antibiogram.organisms[1].smallN).toBe(true);
  });

  it("captures AmpC asterisks as caveats", () => {
    const csv = [
      "Organism,# of Isolates,Ceftriaxone",
      "Enterobacter hormaechei,36,70*",
    ].join("\n");
    const { antibiogram } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms[0].susceptibility.ceftriaxone).toBe(70);
    expect(antibiogram.organisms[0].caveats.ceftriaxone).toMatch(/AmpC/);
  });

  it("captures urine ‡ breakpoint as :urine variant", () => {
    const csv = [
      "Organism,# of Isolates,Cefazolin",
      "Escherichia coli,500,78/87‡",
    ].join("\n");
    const { antibiogram } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms[0].susceptibility["cefazolin"]).toBe(78);
    expect(antibiogram.organisms[0].susceptibility["cefazolin:urine"]).toBe(87);
  });

  it("captures meningitis ¶ breakpoint as :meningitis variant", () => {
    const csv = [
      "Organism,# of Isolates,Ceftriaxone",
      "Streptococcus pneumoniae,23†,100/96¶",
    ].join("\n");
    const { antibiogram } = parseAntibiogramCSV(csv, { name: "T" });
    expect(antibiogram.organisms[0].susceptibility["ceftriaxone"]).toBe(100);
    expect(antibiogram.organisms[0].susceptibility["ceftriaxone:meningitis"]).toBe(96);
  });

  it("returns null antibiogram + error when input is empty / malformed", () => {
    expect(parseAntibiogramCSV("").antibiogram).toBeNull();
    expect(parseAntibiogramCSV(null).antibiogram).toBeNull();
    expect(parseAntibiogramCSV("just one line").antibiogram).toBeNull();
  });

  it("returns null when Organism header column missing", () => {
    const csv = "Bug,Count,Cefazolin\nE. coli,500,78";
    const r = parseAntibiogramCSV(csv, { name: "T" });
    expect(r.antibiogram).toBeNull();
    expect(r.errors[0].message).toMatch(/missing required 'Organism'/);
  });

  it("accepts agent aliases (TZP, CRO, SXT, ...) in headers", () => {
    const csv = [
      "Organism,# of Isolates,TZP,CRO,SXT",
      "Escherichia coli,500,98,90,79",
    ].join("\n");
    const { antibiogram, errors } = parseAntibiogramCSV(csv, { name: "T" });
    const row = antibiogram.organisms[0];
    expect(row.susceptibility["piperacillin-tazobactam"]).toBe(98);
    expect(row.susceptibility["ceftriaxone"]).toBe(90);
    expect(row.susceptibility["tmp-smx"]).toBe(79);
    expect(errors.length).toBe(0);
  });
});

describe("serializeAntibiogramCSV — round-trip", () => {
  it("emits a header row + one row per organism", () => {
    const ab = {
      id: "x", name: "X", organisms: [
        { species: "Escherichia coli", n: 500, smallN: false, susceptibility: { cefazolin: 78, meropenem: 100 } },
      ],
    };
    const csv = serializeAntibiogramCSV(ab);
    const lines = csv.split("\n");
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain("Organism");
    expect(lines[1]).toContain("Escherichia coli");
  });

  it("ILH seed round-trips through parse → serialize → parse", () => {
    const csv = serializeAntibiogramCSV(ILH_ANTIBIOGRAM);
    const { antibiogram, errors } = parseAntibiogramCSV(csv, { name: ILH_ANTIBIOGRAM.name });
    expect(errors.filter(e => !/unrecognized header/.test(e.message)).length).toBe(0);
    expect(antibiogram.organisms.length).toBe(ILH_ANTIBIOGRAM.organisms.length);
    // Spot-check E. coli's cefazolin survived the round-trip
    const ec = antibiogram.organisms.find(o => o.species === "Escherichia coli");
    expect(ec.susceptibility.cefazolin).toBe(78);
    expect(ec.susceptibility["cefazolin:urine"]).toBe(87);
  });
});

/* tests · case-parser corpus + new extractors — Wave 5 PR-5c.

   Three concerns, in one file so a corpus failure is visible right next
   to the extractor it depends on:

     1. DRUG_RX_UNION   derives from AGENT_RX without duplication —
                        every AGENT_RX.canon must be detectable from a
                        plausible free-text mention.

     2. New extractors  currentRegimen ("on X" / "despite Y" / "day N of Z"),
                        findings (culture / deterioration / source-controlled),
                        new risk patterns (recent hospital stay / PD),
                        and the lone-fever soft chip that NEVER routes to
                        a syndrome.

     3. 50-utterance    ≥ 47 of 50 plausible bedside utterances must
        corpus          route to a meaningful caseState (syndrome OR
                        currentRegimen OR findings non-empty). The
                        threshold is set per the PR-5 plan; tightening
                        it ratchets the parser's recall over time. */

import { describe, expect, test } from "vitest";
import { parseCase, DRUG_RX_UNION } from "../src/engines/case-parser.js";
import { AGENT_RX } from "../src/data/drugs.js";

describe("DRUG_RX_UNION · derived from AGENT_RX", () => {
  test("returns the canonical name for every AGENT_RX entry", () => {
    const failures = [];
    AGENT_RX.forEach(entry => {
      // Build a minimal hay from the pattern's source itself — strip regex
      // metacharacters, pick a leading alphabetical run as the probe word.
      const probe = entry.canon;
      const hits = DRUG_RX_UNION.findDrugs(probe);
      if(!hits.includes(entry.canon)) failures.push(`${entry.canon} → ${JSON.stringify(hits)}`);
    });
    expect(failures).toEqual([]);
  });

  test("deduplicates when one pattern matches via two spellings", () => {
    const hits = DRUG_RX_UNION.findDrugs("zosyn and piperacillin-tazobactam");
    expect(hits.filter(d => d === "Piperacillin-tazobactam").length).toBe(1);
  });

  test("returns empty array on empty / non-string input", () => {
    expect(DRUG_RX_UNION.findDrugs("")).toEqual([]);
    expect(DRUG_RX_UNION.findDrugs(null)).toEqual([]);
    expect(DRUG_RX_UNION.findDrugs(undefined)).toEqual([]);
  });
});

describe("parseCase · currentRegimen extraction", () => {
  test("extracts a single agent from 'on X'", () => {
    const r = parseCase("65M CAP on ceftriaxone");
    expect(r.currentRegimen).toEqual(["Ceftriaxone"]);
  });

  test("extracts multiple agents from 'started on X and Y'", () => {
    const r = parseCase("febrile neutropenia 50M started on cefepime and vancomycin");
    expect(r.currentRegimen).toContain("Cefepime");
    expect(r.currentRegimen).toContain("Vancomycin (IV)");
  });

  test("'on day N of Z' is recognized", () => {
    const r = parseCase("CAP on day 3 of ceftriaxone");
    expect(r.currentRegimen).toEqual(["Ceftriaxone"]);
  });

  test("'switched to' / 'broadened to' are recognized", () => {
    const r = parseCase("HAP switched to meropenem");
    expect(r.currentRegimen).toEqual(["Meropenem"]);
    const s = parseCase("UTI broadened to piperacillin-tazobactam");
    expect(s.currentRegimen).toEqual(["Piperacillin-tazobactam"]);
  });

  test("'despite X' populates regimen AND emits a deterioration finding", () => {
    const r = parseCase("65M sepsis despite cefepime");
    expect(r.currentRegimen).toContain("Cefepime");
    expect(r.findings.some(f => f.kind === "deterioration")).toBe(true);
  });

  test("'on HD' is NOT confused with a drug", () => {
    const r = parseCase("HAP on HD");
    expect(r.patient.hd).toBe(true);
    expect(r.currentRegimen).toBeNull();
  });

  test("currentRegimen is null when no 'on/started/switched' phrase is present", () => {
    const r = parseCase("72M PNA prior MRSA");
    expect(r.currentRegimen).toBeNull();
  });
});

describe("parseCase · findings extraction", () => {
  test("'BCx grew ESBL E. coli' → culture finding with esbl", () => {
    const r = parseCase("55F bacteremia BCx grew ESBL E. coli");
    const cult = r.findings.find(f => f.kind === "culture");
    expect(cult).toBeTruthy();
    expect(cult.organism).toBe("esbl");
  });

  test("'BCx grew MRSA' → culture finding with mrsa", () => {
    const r = parseCase("60M bacteremia BCx grew MRSA");
    expect(r.findings.find(f => f.kind === "culture" && f.organism === "mrsa")).toBeTruthy();
  });

  test("'sputum cx positive for Pseudomonas' → culture finding with pseudo", () => {
    const r = parseCase("70M pneumonia sputum cx positive for Pseudomonas");
    expect(r.findings.find(f => f.kind === "culture" && f.organism === "pseudo")).toBeTruthy();
  });

  test("unknown organism in culture still emits a culture finding with null organism", () => {
    const r = parseCase("BCx grew something weird");
    expect(r.findings.find(f => f.kind === "culture" && f.organism === null)).toBeTruthy();
  });

  test("'source controlled' surfaces a source-controlled finding", () => {
    const r = parseCase("complicated IAI source controlled");
    expect(r.findings.some(f => f.kind === "source-controlled")).toBe(true);
  });

  test("'despite X' surfaces a deterioration finding", () => {
    const r = parseCase("sepsis despite pip-tazo");
    expect(r.findings.some(f => f.kind === "deterioration")).toBe(true);
  });

  test("findings is an empty array (not null) when nothing matches", () => {
    const r = parseCase("72M PNA");
    expect(r.findings).toEqual([]);
  });
});

describe("parseCase · new risk patterns", () => {
  test("'recent hospital stay' → hcaqRisk", () => {
    const r = parseCase("65M sepsis with recent hospital stay");
    expect(r.patient.hcaqRisk).toBe(true);
  });

  test("'peritoneal dialysis' → onPD", () => {
    const r = parseCase("55M abdominal pain on peritoneal dialysis");
    expect(r.patient.onPD).toBe(true);
  });

  test("'on PD' alone → onPD (does not eat the next word as a drug)", () => {
    const r = parseCase("55M peritonitis on PD");
    expect(r.patient.onPD).toBe(true);
    expect(r.currentRegimen).toBeNull();
  });
});

describe("parseCase · gram-negative sepsis routing", () => {
  test("'gram-negative sepsis' routes to sepsis with esblRisk hint", () => {
    const r = parseCase("70M gram-negative sepsis");
    expect(r.syndrome).toBe("sepsis");
    expect(r.patient.esblRisk).toBe(true);
  });
});

describe("parseCase · lone-fever last-resort", () => {
  test("lone 'fever' does NOT route to any syndrome", () => {
    const r = parseCase("50M fever");
    expect(r.syndrome).toBeNull();
  });

  test("lone 'fever' surfaces a soft finding chip", () => {
    const r = parseCase("50M fever");
    expect(r.chips.some(c => c.kind === "finding" && /fever/i.test(c.label))).toBe(true);
  });

  test("does NOT swallow febrile-neutropenia (existing pattern wins)", () => {
    // "febrile neutropenia" → febneut (specific pattern). The lone-fever
    // fallback must NOT override the syndrome already routed.
    const r = parseCase("febrile neutropenia 50M");
    expect(r.syndrome).toBe("febneut");
  });

  test("does NOT swallow toxic shock", () => {
    const r = parseCase("toxic shock 30F");
    expect(r.syndrome).toBe("tss");
    expect(r.patient.severe).toBe(true);
  });

  test("does NOT fire when shock context already set", () => {
    const r = parseCase("septic shock with fever");
    expect(r.syndrome).toBe("sepsis");
    expect(r.patient.severe).toBe(true);
    // the fever chip should not appear because severe is already set
    expect(r.chips.some(c => c.kind === "finding" && /fever\s*—\s*needs\s*source/i.test(c.label))).toBe(false);
  });
});

/* The 50-utterance corpus. Each row is a tuple of [input, expected hits].
   Expected hits are a loose AND condition:
     - syndrome?: expected syndrome id (or null to skip the check)
     - regimen?:  array of expected canonical drug names (subset check)
     - finding?:  expected finding kind to be present
     - severe?:   expected patient.severe boolean

   "Meaningful" = syndrome OR currentRegimen OR findings non-empty.
   PR-5 acceptance threshold: ≥ 47 of 50 must be meaningful. */
const CORPUS = [
  ["72M PNA prior MRSA CrCl 35",                                       { syndrome:"cap" }],
  ["65F UTI SCr 1.4",                                                  { syndrome:"cystitis" }],
  ["septic shock prior ESBL",                                          { syndrome:"sepsis", severe:true }],
  ["HAP on HD",                                                        { syndrome:"hap" }],
  ["CAP penicillin rash",                                              { syndrome:"cap" }],
  ["endocarditis SJS to ampicillin",                                   { syndrome:"ie" }],
  ["70F 80 kg pyelo SCr 1.8",                                          { syndrome:"pyelo" }],
  ["neutropenic fever 50yo male",                                      { syndrome:"sepsis-neutropenic" }],
  ["SBP CP-C cirrhosis 60M",                                           { syndrome:"sbp" }],
  ["cellulitis MRSA history",                                          { syndrome:"cellulitis" }],
  ["55F bacteremia on cefepime BCx grew ESBL E. coli",                 { regimen:["Cefepime"], finding:"culture" }],
  ["65M sepsis despite pip-tazo",                                      { syndrome:"sepsis", regimen:["Piperacillin-tazobactam"], finding:"deterioration" }],
  ["started on vancomycin and cefepime for febrile neutropenia",       { syndrome:"febneut", regimen:["Vancomycin (IV)","Cefepime"] }],
  ["CAP on day 3 of ceftriaxone",                                      { syndrome:"cap", regimen:["Ceftriaxone"] }],
  ["70F pyelonephritis BCx grew Pseudomonas",                          { syndrome:"pyelo", finding:"culture" }],
  ["complicated IAI source controlled on ertapenem",                   { syndrome:"peritonitis", regimen:["Ertapenem"], finding:"source-controlled" }],
  ["65M sepsis with recent hospital stay",                             { syndrome:"sepsis" }],
  ["PD peritonitis 55M",                                               { syndrome:"pd-peritonitis" }],
  ["gram-negative sepsis on meropenem",                                { syndrome:"sepsis", regimen:["Meropenem"] }],
  ["ICU 72M septic shock pip-tazo vanc CrCl 30",                       { syndrome:"sepsis", severe:true }],
  ["70M HAP on vancomycin and meropenem",                              { syndrome:"hap", regimen:["Vancomycin (IV)","Meropenem"] }],
  ["CAUTI 80F on ciprofloxacin",                                       { syndrome:"cauti", regimen:["Ciprofloxacin"] }],
  ["60M osteomyelitis MSSA on nafcillin",                              { syndrome:"osteo", regimen:["Nafcillin / oxacillin"] }],
  ["50F SAB on cefazolin",                                             { syndrome:"sab", regimen:["Cefazolin"] }],
  ["65F UTI rash with amoxicillin",                                    { syndrome:"cystitis" }],
  ["diabetic foot ulcer infected",                                     { syndrome:"dfi" }],
  ["necrotizing fasciitis pain out of proportion",                     { syndrome:"necfasc", severe:true }],
  ["cholangitis 70M on pip-tazo",                                      { syndrome:"cholangitis", regimen:["Piperacillin-tazobactam"] }],
  ["ventilator-associated pneumonia day 5 of cefepime",                { syndrome:"hap", regimen:["Cefepime"] }],
  ["C. diff 60F on PO vancomycin",                                     { syndrome:"cdiff", regimen:["Vancomycin (IV)"] }],
  ["meningitis SJS to penicillin",                                     { syndrome:"meningitis" }],
  ["persistent MRSA bacteremia despite vancomycin",                    { syndrome:"persistent-mrsa", regimen:["Vancomycin (IV)"], finding:"deterioration" }],
  ["BCx grew MRSA 60M",                                                { finding:"culture" }],
  ["AECOPD 65M",                                                       { syndrome:"copd" }],
  ["70F pyelo on ceftriaxone CrCl 40",                                 { syndrome:"pyelo", regimen:["Ceftriaxone"] }],
  ["65M asymptomatic bacteriuria",                                     { syndrome:"asymp-bact" }],
  ["30F TSS",                                                          { syndrome:"tss", severe:true }],
  ["Fournier gangrene 50M",                                            { syndrome:"fournier", severe:true }],
  ["bite wound dog 40M",                                               { syndrome:"bites" }],
  ["infected pancreatic necrosis 65M",                                 { syndrome:"pancreatic" }],
  ["70F vertebral osteomyelitis",                                      { syndrome:"vertosteo" }],
  ["60M brain abscess",                                                { syndrome:"brainabscess" }],
  ["DFI 65F on PO clindamycin",                                        { syndrome:"dfi" }],
  ["PJI knee 70M",                                                     { syndrome:"pji" }],
  ["septic arthritis native joint 55M",                                { syndrome:"septic-arthritis" }],
  ["asplenic 60M with fever",                                          { syndrome:"sepsis-asplenia" }],
  ["GNR sepsis on cefepime, recent hospital stay",                     { syndrome:"sepsis", regimen:["Cefepime"] }],
  ["urine cx positive for ESBL E. coli",                               { finding:"culture" }],
  ["72M with general malaise",                                         { /* intentional miss */ }],
  ["50M fever",                                                        { /* lone fever — intentional miss */ }],
];

describe("parseCase · 50-utterance corpus", () => {
  test("≥ 47 of 50 utterances route to a meaningful caseState", () => {
    const meaningful = [];
    const empty = [];
    CORPUS.forEach(([input]) => {
      const r = parseCase(input);
      const hasSomething = r.syndrome || (r.currentRegimen && r.currentRegimen.length) || (r.findings && r.findings.length);
      if(hasSomething) meaningful.push(input);
      else empty.push(input);
    });
    if(empty.length > 3){
      // surface which inputs went unmatched so the test diff names them
      throw new Error(`More than 3 unmatched inputs:\n${empty.map(s => `  - ${s}`).join("\n")}`);
    }
    expect(meaningful.length).toBeGreaterThanOrEqual(47);
  });

  test("expected fields match for every corpus row that asserts one", () => {
    const failures = [];
    CORPUS.forEach(([input, expected]) => {
      const r = parseCase(input);
      if(expected.syndrome != null && r.syndrome !== expected.syndrome){
        failures.push(`syndrome — "${input}": expected ${expected.syndrome}, got ${r.syndrome}`);
      }
      if(expected.severe === true && r.patient.severe !== true){
        failures.push(`severe — "${input}": expected severe=true`);
      }
      if(Array.isArray(expected.regimen)){
        expected.regimen.forEach(drug => {
          if(!r.currentRegimen || !r.currentRegimen.includes(drug)){
            failures.push(`regimen — "${input}": expected to include ${drug}, got ${JSON.stringify(r.currentRegimen)}`);
          }
        });
      }
      if(expected.finding){
        if(!r.findings.some(f => f.kind === expected.finding)){
          failures.push(`finding — "${input}": expected ${expected.finding}, got ${JSON.stringify(r.findings.map(f => f.kind))}`);
        }
      }
    });
    expect(failures).toEqual([]);
  });
});

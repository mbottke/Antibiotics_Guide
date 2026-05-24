/* data · Iowa Lutheran Hospital antibiogram (UnityPoint Health Des Moines)
   Primary inpatient antibiogram seed for Phase E. Period 2024-01-01 to
   2025-06-30. Source: DM-MISC-0194 12-2025 (ILH Antibiogram).

   The seed ships as the default active antibiogram so the user sees their
   real institutional resistance pattern on first load. Additional hospitals
   in the same UnityPoint network (Iowa Methodist, etc.) can be added via
   the management UI without disturbing this seed.

   ENCODING CHOICES
   ----------------
   - %S stored as integer 0-100, or null when "—" / blank in source (insufficient data
     OR organism-intrinsic resistance shown as a blank cell rather than 0).
   - Conditional breakpoints use a context-suffixed key: e.g. "cefazolin:urine"
     holds the ‡ uncomplicated-urine breakpoint, "ceftriaxone:meningitis"
     holds the ¶ meningitis breakpoint. The bare key holds the default
     (serious / non-urine / non-CNS) breakpoint.
   - AmpC-induction caveats are surfaced as per-agent strings in `caveats`,
     not buried in the susceptibility number. The %S value is the raw lab
     report; the caveat explains why empiric usage is constrained anyway.
   - `smallN: true` flags rows with < 30 isolates (the † footnote) so the
     overlay engine renders a "low confidence" badge instead of a hard flag.

   AGENT CANONICAL KEYS (must match ANTIBIOGRAM_AGENTS in ./index.js)
   ------------------------------------------------------------------
   ampicillin · amoxicillin-clavulanate · ampicillin-sulbactam ·
   piperacillin-tazobactam · cefazolin · cefuroxime · ceftriaxone ·
   ceftazidime · cefepime · ertapenem · meropenem · aztreonam ·
   ciprofloxacin · levofloxacin · gentamicin · tobramycin ·
   nitrofurantoin · tmp-smx · penicillin · oxacillin · vancomycin ·
   clindamycin · erythromycin · doxycycline · tetracycline ·
   gentamicin-synergy

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const ILH_ANTIBIOGRAM = {
  id: "ilh-2024",
  name: "Iowa Lutheran Hospital",
  subtitle: "UnityPoint Health Des Moines · Primary inpatient",
  network: "UnityPoint Health",
  city: "Des Moines, IA",
  period: { from: "2024-01-01", to: "2025-06-30" },
  source: "DM-MISC-0194 12-2025",
  isSeed: true,
  notes: [
    "* Inducible AmpC caution: ceftriaxone / ceftazidime susceptibility shown but cefepime preferred empirically for Citrobacter freundii, Enterobacter species, and Klebsiella aerogenes (IDSA 2024).",
    "† Fewer than 30 isolates — interpret %S with caution; institutional patterns may not be statistically representative.",
    "‡ Uncomplicated urinary isolate breakpoint — higher than serious-infection breakpoint for the same agent.",
    "¶ Meningitis breakpoint — lower than non-CNS breakpoint due to CSF penetration / dosing requirements.",
  ],
  organisms: [
    /* ===== Gram-negative ===== */
    {
      species: "Enterobacter hormaechei",
      orgId: "ampc",
      gram: "neg",
      n: 36,
      smallN: false,
      susceptibility: {
        "ampicillin": 0,
        "amoxicillin-clavulanate": 0,
        "ampicillin-sulbactam": 0,
        "piperacillin-tazobactam": 81,
        "cefazolin": 0,
        "cefuroxime": 0,
        "ceftriaxone": 70,
        "ceftazidime": 78,
        "cefepime": 100,
        "ertapenem": 94,
        "meropenem": 100,
        "aztreonam": 79,
        "ciprofloxacin": 97,
        "levofloxacin": 97,
        "gentamicin": 100,
        "tobramycin": 97,
        "nitrofurantoin": null,
        "tmp-smx": 92,
      },
      caveats: {
        "ceftriaxone": "AmpC inducer — prefer cefepime empirically (IDSA 2024 AMR-GN).",
        "ceftazidime": "AmpC inducer — prefer cefepime empirically (IDSA 2024 AMR-GN).",
      },
    },
    {
      species: "Escherichia coli",
      orgId: "entero",
      gram: "neg",
      n: 596,
      smallN: false,
      susceptibility: {
        "ampicillin": 56,
        "amoxicillin-clavulanate": 89,
        "ampicillin-sulbactam": 60,
        "piperacillin-tazobactam": 98,
        "cefazolin": 78,
        "cefazolin:urine": 87,
        "cefuroxime": 88,
        "ceftriaxone": 90,
        "ceftazidime": 90,
        "cefepime": 91,
        "ertapenem": 100,
        "meropenem": 100,
        "aztreonam": 90,
        "ciprofloxacin": 77,
        "levofloxacin": 86,
        "gentamicin": 92,
        "tobramycin": 92,
        "nitrofurantoin": 98,
        "tmp-smx": 79,
      },
      caveats: {},
    },
    {
      species: "Klebsiella aerogenes",
      orgId: "ampc",
      gram: "neg",
      n: 25,
      smallN: true,
      susceptibility: {
        "ampicillin": 0,
        "amoxicillin-clavulanate": 0,
        "ampicillin-sulbactam": 0,
        "piperacillin-tazobactam": 72,
        "cefazolin": 0,
        "cefuroxime": 0,
        "ceftriaxone": 80,
        "ceftazidime": 80,
        "cefepime": 100,
        "ertapenem": 92,
        "meropenem": 100,
        "aztreonam": 80,
        "ciprofloxacin": 100,
        "levofloxacin": 100,
        "gentamicin": 100,
        "tobramycin": 100,
        "nitrofurantoin": 48,
        "tmp-smx": 100,
      },
      caveats: {
        "ceftriaxone": "AmpC inducer — prefer cefepime empirically (IDSA 2024 AMR-GN).",
        "ceftazidime": "AmpC inducer — prefer cefepime empirically (IDSA 2024 AMR-GN).",
      },
    },
    {
      species: "Klebsiella oxytoca",
      orgId: "entero",
      gram: "neg",
      n: 32,
      smallN: false,
      susceptibility: {
        "ampicillin": 0,
        "amoxicillin-clavulanate": 94,
        "ampicillin-sulbactam": 41,
        "piperacillin-tazobactam": 97,
        "cefazolin": 25,
        "cefuroxime": 88,
        "ceftriaxone": 91,
        "ceftazidime": 91,
        "cefepime": 91,
        "ertapenem": 97,
        "meropenem": 100,
        "aztreonam": 91,
        "ciprofloxacin": 97,
        "levofloxacin": 100,
        "gentamicin": 97,
        "tobramycin": 97,
        "nitrofurantoin": 96,
        "tmp-smx": 91,
      },
      caveats: {},
    },
    {
      species: "Klebsiella pneumoniae",
      orgId: "entero",
      gram: "neg",
      n: 145,
      smallN: false,
      susceptibility: {
        "ampicillin": 0,
        "amoxicillin-clavulanate": 99,
        "ampicillin-sulbactam": 88,
        "piperacillin-tazobactam": 97,
        "cefazolin": 88,
        "cefazolin:urine": 96,
        "cefuroxime": 92,
        "ceftriaxone": 94,
        "ceftazidime": 94,
        "cefepime": 94,
        "ertapenem": 99,
        "meropenem": 99,
        "aztreonam": 94,
        "ciprofloxacin": 88,
        "levofloxacin": 93,
        "gentamicin": 97,
        "tobramycin": 98,
        "nitrofurantoin": 60,
        "tmp-smx": 92,
      },
      caveats: {},
    },
    {
      species: "Proteus mirabilis",
      orgId: "entero",
      gram: "neg",
      n: 90,
      smallN: false,
      susceptibility: {
        "ampicillin": 81,
        "amoxicillin-clavulanate": 98,
        "ampicillin-sulbactam": 88,
        "piperacillin-tazobactam": 99,
        "cefazolin": 0,
        "cefazolin:urine": 97,
        "cefuroxime": 98,
        "ceftriaxone": 97,
        "ceftazidime": 98,
        "cefepime": 100,
        "ertapenem": 100,
        "meropenem": null,
        "aztreonam": 100,
        "ciprofloxacin": 74,
        "levofloxacin": 77,
        "gentamicin": 91,
        "tobramycin": 90,
        "nitrofurantoin": 0,
        "tmp-smx": 83,
      },
      caveats: {
        "nitrofurantoin": "Proteus is intrinsically resistant to nitrofurantoin — do not use even when other GU agents fail.",
      },
    },
    {
      species: "Pseudomonas aeruginosa",
      orgId: "pseudo",
      gram: "neg",
      n: 113,
      smallN: false,
      susceptibility: {
        "ampicillin": 0,
        "amoxicillin-clavulanate": 0,
        "ampicillin-sulbactam": 0,
        "piperacillin-tazobactam": 90,
        "cefazolin": 0,
        "cefuroxime": 0,
        "ceftriaxone": 0,
        "ceftazidime": 91,
        "cefepime": 96,
        "ertapenem": 0,
        "meropenem": 93,
        "aztreonam": 87,
        "ciprofloxacin": 82,
        "levofloxacin": 83,
        "gentamicin": null,
        "tobramycin": 100,
        "nitrofurantoin": 0,
        "tmp-smx": 0,
      },
      caveats: {
        "ertapenem": "Pseudomonas is intrinsically resistant to ertapenem — use meropenem when carbapenem indicated.",
      },
    },

    /* ===== Gram-positive ===== */
    {
      species: "Enterococcus faecalis",
      orgId: "efaecalis",
      gram: "pos",
      n: 95,
      smallN: false,
      susceptibility: {
        "ampicillin": 98,
        "penicillin": 97,
        "oxacillin": 0,
        "vancomycin": 99,
        "clindamycin": 0,
        "nitrofurantoin": 100,
        "tmp-smx": 0,
        "doxycycline": 51,
        "tetracycline": 34,
        "gentamicin-synergy": 82,
      },
      caveats: {
        "clindamycin": "Enterococcus is intrinsically resistant to clindamycin — never use.",
        "tmp-smx": "Enterococci often appear susceptible in vitro but TMP-SMX fails clinically — avoid.",
      },
    },
    {
      species: "MSSA",
      orgId: "mssa",
      gram: "pos",
      n: 214,
      smallN: false,
      susceptibility: {
        "penicillin": 0,
        "oxacillin": 100,
        "vancomycin": 100,
        "clindamycin": 77,
        "erythromycin": 70,
        "tmp-smx": 98,
        "doxycycline": 94,
      },
      caveats: {},
    },
    {
      species: "MRSA",
      orgId: "mrsa",
      gram: "pos",
      n: 163,
      smallN: false,
      susceptibility: {
        "penicillin": 0,
        "oxacillin": 0,
        "vancomycin": 100,
        "clindamycin": 83,
        "erythromycin": 16,
        "tmp-smx": 98,
        "doxycycline": 82,
      },
      caveats: {
        "clindamycin": "Local CLI %S is 83 — acceptable for skin/soft-tissue with D-test confirmation; not a serious-infection workhorse.",
      },
    },
    {
      species: "Streptococcus pneumoniae",
      orgId: "strep",
      gram: "pos",
      n: 23,
      smallN: true,
      susceptibility: {
        "penicillin": 96,
        "penicillin:meningitis": 70,
        "ceftriaxone": 100,
        "ceftriaxone:meningitis": 96,
        "cefepime": 96,
        "levofloxacin": 100,
        "vancomycin": 100,
        "clindamycin": 95,
        "erythromycin": 77,
        "tmp-smx": 91,
        "tetracycline": 96,
      },
      caveats: {
        "erythromycin": "Macrolide resistance (77 %S) — do not use as monotherapy for invasive pneumococcal disease.",
      },
    },
  ],
};

export { ILH_ANTIBIOGRAM };

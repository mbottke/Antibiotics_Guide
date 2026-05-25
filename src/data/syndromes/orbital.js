/* ===========================================================
   ORBITAL CELLULITIS — post-septal infection; sinusitis source;
   emergent imaging + IV antibiotics + surgical consideration. */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*ceftriaxone|ampicillin-?sulbactam|metronidazole/i,
      pickIf: "Orbital cellulitis (vs preseptal) — proptosis, ophthalmoplegia, pain on EOM.",
      whyPick: [
        "**Vancomycin + ceftriaxone (or amp-sulbactam) + metronidazole**",
        "**Emergent CT orbits** — define abscess + sinus source",
        "**ENT consult** for sinus drainage — ethmoid sinusitis classic origin",
        "**Ophthalmology** for vision monitoring + management",
      ],
      watchOut: [
        { sev: "stop", text: "**Vision loss / cavernous sinus extension** — surgical emergency; serial cranial-nerve exam q4h" },
        { sev: "warn", text: "**Pediatric S. pneumoniae / H. flu / S. aureus** dominate; adult adds MRSA, anaerobes, polymicrobial" },
        { sev: "note", text: "Distinguish from preseptal (no proptosis, no EOM pain) — preseptal needs less aggressive therapy" },
      ],
    },
  ],
  "Severe / intracranial extension": [
    {
      rx: /vancomycin.*meropenem/i,
      pickIf: "Orbital infection with intracranial extension or abscess.",
      whyPick: [
        "**Vancomycin + meropenem** (CNS dosing — full strength, no renal reduction for site)",
        "**Emergent ophthalmology + ENT + neurosurgery** consults — all three within hours",
        "**MRI brain + orbits + venogram** — define cavernous sinus involvement + intracranial abscess",
        "Surgical drainage often required — orbital + paranasal sinus + neurosurgical depending on extent",
      ],
      watchOut: [
        { sev: "stop", text: "**Mucormycosis** in diabetic / immunocompromised → amphotericin B + emergent debridement; missed = death" },
        { sev: "warn", text: "**Cavernous sinus thrombosis** complication — anticoagulation decision case-by-case (clot vs bleed)" },
        { sev: "note", text: "Steroid use only for definite mass effect / herniation; otherwise avoid (worsens fungal disease risk)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14–21 d IV → PO; ENT + ophtho consult; CT orbits at presentation; surgery for abscess / vision compromise.",
    evidence: "Society consensus — post-septal infection sight + life-threatening; sinusitis dominant source; multidisciplinary",
    branches: [
      { label: "Orbital cellulitis (Chandler II) no abscess", days: "14 d IV → PO",
        detail: "Ampicillin-sulbactam or ceftriaxone + metronidazole; oral step-down on clinical response",
        matchAgent: /ampicillin-?sulbactam|ceftriaxone/i },
      { label: "Subperiosteal abscess (Chandler III)", days: "14–21 d + drainage",
        detail: "IV broad-spectrum + ENT drainage for > 10 mm, age > 9 yr, or vision compromise" },
      { label: "Orbital abscess / cavernous sinus thrombosis", days: "21 d + surgery",
        detail: "Surgical decompression + extended IV + anticoagulation for CST",
        matchAgent: /meropenem/i },
      { label: "MRSA-confirmed", days: "14–21 d",
        detail: "Vancomycin + ceftriaxone or meropenem; ID-driven; AUC monitoring",
        matchAgent: /vancomycin/i },
      { label: "Fungal (post-DKA, neutropenic, mucor / aspergillus)", days: "Per IFI + surgery",
        detail: "Mucor → liposomal amphotericin + emergent ENT surgery; aspergillus → vori; ID + ENT",
        matchAgent: /amphotericin|voriconazole|isavuconazole/i },
    ],
    stopWhen: [
      "Proptosis + ophthalmoplegia resolved",
      "Vision stable or improving",
      "Sinusitis source addressed (surgical / medical)",
      "Imaging shows resolution",
      "Minimum 14–21 d completed",
    ],
    extendIf: [
      { text: "**Cavernous sinus thrombosis** — extend + anticoagulation",
        matchCtx: { severe: true } },
      "Intracranial extension — per brain abscess bands",
      "Fungal pathogen — per IFI bands (weeks–months)",
      "Inadequate drainage — surgical revision",
    ],
  },
  monitoring: {
    headline: "Emergent CT orbits + sinuses; ophtho + ENT + ID consult; vision check q4h; surgery for compromise.",
    items: [
      { sev: "required", what: "**Emergent CT orbits + sinuses with contrast**",
        why: "Differentiates pre-septal vs orbital; identifies abscess + sinusitis source + intracranial extension" },
      { sev: "required", what: "**Ophthalmology + ENT consult** at presentation",
        why: "Multidisciplinary care drives outcome; ENT for sinus drainage, ophtho for visual monitoring" },
      { sev: "required", what: "**Vision check q4h** — visual acuity, color, RAPD",
        why: "Vision loss drives emergent surgical decompression; standard monitoring" },
      { sev: "trigger", what: "**Surgical drainage** for subperiosteal abscess > 10 mm or vision compromise",
        why: "Source control accelerates resolution; ENT-driven decision" },
      { sev: "trigger", what: "**MRI brain + venogram** if CST suspected (chemosis, cranial nerve palsy, bilateral)",
        why: "Cavernous sinus thrombosis high mortality; anticoagulation + extended therapy" },
      { sev: "trigger", what: "**Cover MRSA** if community MRSA prevalent or post-trauma",
        why: "Polymicrobial substrate; standard part of empiric in U.S." },
      { sev: "trigger", what: "**Mucor workup** in DKA, neutropenic, or post-tx hosts",
        why: "Rhino-orbital-cerebral mucormycosis — emergent surgical + amphotericin" },
      { sev: "consider", what: "**Steroids contested** — not standard; case-by-case",
        why: "May reduce inflammation but risks immunosuppression; ophtho + ID decision" },
    ],
  },
  rationale: {
    driver: "Orbital (post-septal) cellulitis is sight-threatening: sinusitis is the dominant source via the lamina papyracea, and Chandler staging (1970) drives intervention — subperiosteal abscess > 10 mm, age > 9 yr, or any visual compromise mandates ENT drainage. Empiric coverage is ampicillin-sulbactam or ceftriaxone + metronidazole for community-onset disease (Brook IJPO 2009); vancomycin is added where community-acquired MRSA is prevalent or after trauma. CT orbits with contrast at presentation, ophtho + ENT consult, and q4h visual acuity / color / RAPD are mandatory. Rhino-orbital mucormycosis screening (KOH + biopsy + emergent ENT) is non-negotiable in DKA, neutropenic, or post-transplant hosts — missing it is uniformly fatal.",
    guideline: "ssti",
    rejected: "Treating presumed post-septal cellulitis without urgent CT orbits + sinuses was deliberately rejected — pre-septal mimics post-septal at the bedside, and Chandler staging cannot be assigned without imaging that defines the abscess and intracranial extension. Antibiotic-only management of subperiosteal abscess > 10 mm with visual change was tempered: AAO + Brook show non-response inside 24–48 h drives permanent vision loss, and surgical drainage is part of the standard, not an escalation. Routine high-dose steroids for inflammation were rejected — evidence is limited and immunosuppression complicates an undiagnosed mucor / orbital abscess." },
  objections: [
    { q: "Why surgery for subperiosteal abscess > 10 mm — antibiotics aren't enough?",
      a: "Chandler staging (Laryngoscope 1970) plus AAO 2023 anchor ENT drainage for subperiosteal abscess > 10 mm, age > 9 yr, or any visual compromise because non-response inside 24–48 h drives permanent vision loss [cite:ssti]. Antibiotic-only management succeeds in small (< 10 mm) Chandler III lesions in younger children with intact vision, but the threshold above mandates source control — the drainage is part of the standard, not an escalation when antibiotics fail." },
    { q: "Why add MRSA cover when community MRSA is < 30% locally?",
      a: "Orbital cellulitis is polymicrobial sinus-source disease with S. aureus contribution; Brook IJPO 2009 documents post-trauma and CA-MRSA-prevalent regions as the substrate where empiric vancomycin is added to ampicillin-sulbactam or ceftriaxone + metronidazole [cite:ssti]. Missing MRSA in the 24–72 h before species ID risks vision loss in a sight-threatening syndrome; de-escalation to MSSA-targeted therapy is trivial once cultures return." },
    { q: "Why mucor workup in DKA — bacterial is far more common?",
      a: "Rhino-orbital-cerebral mucormycosis is uniformly fatal without emergent ENT surgical debridement plus liposomal amphotericin B per Brook + AAO guidance [cite:ssti]. DKA and neutropenia / post-transplant substrate raise the pretest probability sharply enough that KOH plus tissue biopsy is non-negotiable — bacterial orbital cellulitis mortality is < 5% with timely antibiotics; mucor approaches 50–80% without emergent surgery, so the screen is mandatory even with lower prior probability." },
  ],
  research: {
    headline: "Chandler staging drives surgery; vision check q4h is core monitoring; MRI for cavernous sinus thrombosis suspicion.",
    trials: [
      { name: "Chandler Laryngoscope 1970",
        n: "Cohort",
        question: "Orbital cellulitis staging (Chandler classification)",
        finding: "Stages I–V drive intervention: III (subperiosteal abscess) → surgery if > 10 mm or visual compromise; IV–V emergent decompression",
        bias: "Pre-modern imaging; replicated principle" },
      { name: "Brook IJPO 2009",
        n: "Cohort review",
        question: "Pediatric orbital cellulitis modern management",
        finding: "Sinusitis dominant source; ENT + ophtho early consultation; mucormycosis workup in DKA / neutropenic / post-tx",
        bias: "Pediatric-specific; principles apply to adults" },
    ],
    guidelines: [
      { society: "AAO",
        year: 2023,
        topic: "Orbital cellulitis management",
        keypoint: "Emergent CT orbits + sinuses; ENT + ophtho consult; vision check q4h; surgery for compromise" },
    ],
    openQuestions: [
      "Optimal surgical timing for subperiosteal abscess — > 10 mm threshold",
      "Steroid use — limited evidence; case-by-case",
      "Mucormycosis empiric coverage threshold — DKA + neutropenic + post-tx high-risk",
    ],
  },
};

export default { id: "orbital", regimen, decision };

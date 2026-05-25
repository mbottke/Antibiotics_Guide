/* ===========================================================
   TETANUS — wound-acquired; immunoglobulin + spasm control +
   wound debridement; antibiotics for organism eradication. == */

const regimen = {
  "Antimicrobial (adjunct)": [
    {
      rx: /metronidazole/i,
      pickIf: "Clinical tetanus — antibiotics are adjunctive.",
      whyPick: [
        "**Metronidazole 500 mg IV q8h × 7–10 d** — preferred over penicillin (penicillin antagonizes GABA, worsening spasm)",
        "**Tetanus immune globulin (TIG) 500 IU IM** + **tetanus toxoid** vaccine are primary",
        "**Wound debridement** essential — remove necrotic tissue + spore reservoir",
        "ICU for autonomic + muscular control — diazepam / magnesium / paralytics PRN",
      ],
      watchOut: [
        { sev: "warn", text: "**Penicillin → worsened spasm** (GABA-antagonist effect at high doses) — avoid in established tetanus" },
        { sev: "warn", text: "**Autonomic instability** kills more than spasm — ICU monitoring + cautious vasopressor titration" },
        { sev: "note", text: "Vaccinate post-recovery — tetanus disease does NOT confer immunity; 3-dose primary series needed" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Metronidazole 7–10 d + tetanus IG + wound debridement + spasm control + ICU support.",
    evidence: "WHO + CDC — metronidazole preferred over penicillin (GABA antagonism risk); IG neutralizes circulating toxin only",
    branches: [
      { label: "Generalized tetanus (suspected or confirmed)", days: "7–10 d",
        detail: "Metronidazole 500 mg IV q6h; tetanus IG 3000–6000 units IM; wound debridement",
        matchAgent: /metronidazole/i },
      { label: "Neonatal tetanus", days: "10–14 d",
        detail: "Metronidazole + IG + ICU support; high mortality; resource setting drives prognosis" },
      { label: "Localized tetanus (limb)", days: "7–10 d",
        detail: "Same regimen; may progress to generalized; observe closely" },
      { label: "Cephalic tetanus (head wound, cranial nerve)", days: "7–10 d",
        detail: "Same regimen + airway management; cranial nerve VII involvement common" },
    ],
    stopWhen: [
      "Spasms resolved + neurologic recovery",
      "Tetanus IG administered",
      "Wound debrided + healing",
      "Active immunization series initiated (disease does NOT confer immunity)",
      "Minimum 7–10 d completed",
    ],
    extendIf: [
      { text: "**Persistent spasms** or autonomic instability — extend supportive care",
        matchCtx: { severe: true } },
      "Inadequate wound debridement — re-explore",
      "Co-infection — per pathogen + source",
      "ICU course prolonged — extend per response",
    ],
  },
  monitoring: {
    headline: "IG neutralizes circulating toxin; metronidazole eradicates organism; ICU for spasm + autonomic control.",
    items: [
      { sev: "required", what: "**Tetanus IG 3000–6000 units IM** at presentation",
        why: "Neutralizes circulating toxin; does NOT affect bound toxin; give early" },
      { sev: "required", what: "**Wound debridement** — remove devitalized tissue + FB",
        why: "Eradicates organism + spores; source control alongside antibiotics" },
      { sev: "required", what: "**ICU admission** + benzodiazepine for spasm control",
        why: "Autonomic instability + respiratory failure common; airway often needed" },
      { sev: "required", what: "**Active immunization series** (disease does NOT confer immunity)",
        why: "Tdap or Td series at presentation + 4 wk + 6 mo; lifelong protection requires vaccination" },
      { sev: "trigger", what: "**Magnesium infusion** for autonomic instability",
        why: "Adjunct for sympathetic storm; titrate to clinical effect" },
      { sev: "trigger", what: "**Airway / mechanical ventilation** for laryngospasm or respiratory failure",
        why: "Spasms can cause sudden airway obstruction; early intubation safer" },
      { sev: "trigger", what: "**Avoid penicillin** if benzo-resistant spasms (GABA antagonism)",
        why: "Metronidazole preferred; penicillin may worsen spasms in severe cases" },
      { sev: "consider", what: "**Quiet, dark room** to reduce trigger-evoked spasms",
        why: "Stimulus reduction reduces spasm frequency; supportive measure" },
    ],
  },
  rationale: {
    driver: "Tetanus is a toxin-mediated disease — C. tetani in a contaminated wound elaborates tetanospasmin, which is retrograde-transported to the spinal cord and cleaves synaptobrevin in inhibitory interneurons, abolishing GABA/glycine release and producing tonic spasms and autonomic storm. Therapy is multi-modal: human tetanus immune globulin 3000–6000 units IM (neutralizes circulating, unbound toxin only) + wound debridement (eradicates the organism and any spore reservoir) + metronidazole 500 mg IV q6h × 7–10 d + ICU-level benzodiazepine + magnesium for spasm and autonomic control. The disease does NOT confer immunity, so an active Tdap series is mandatory at presentation.",
    guideline: "cdc_abx",
    rejected: "Penicillin G as the antibacterial backbone was deliberately rejected — penicillin is a GABA-A receptor antagonist at high doses and may worsen tetanic spasms; Ahmadsyah (BMJ 1985) showed metronidazole produced shorter ICU stay and lower mortality, and WHO now endorses metronidazole as preferred. Relying on TIG or active vaccination alone was rejected: TIG cannot reach toxin already internalized at the synapse, and vaccination produces antibody too slowly for the acute episode — only the multi-modal bundle changes outcome." },
  objections: [
    { q: "Why metronidazole over penicillin — penicillin covers tetani?",
      a: "Penicillin is a structural GABA-A receptor antagonist — in the setting of tetanospasmin-driven loss of inhibitory glycinergic / GABAergic tone, it can worsen spasms and seizures. Ahmadsyah (BMJ 1985, n=97) showed metronidazole superior to penicillin in tetanus: shorter ICU stay and lower mortality; WHO + CDC endorse metronidazole as first-line antibiotic [cite:cdc_abx]. Penicillin is acceptable only when metronidazole is unavailable, with aggressive benzodiazepine spasm control." },
    { q: "Why tetanus IG if we're already treating the organism?",
      a: "Antibiotics eradicate Clostridium tetani but do nothing for circulating tetanospasmin — the toxin binds presynaptic SNARE proteins (synaptobrevin) at inhibitory neurons and is irreversible once internalized. Human tetanus immunoglobulin (TIG) 3000-6000 units IM neutralizes only the unbound, circulating fraction; earlier administration captures more toxin before binding [cite:cdc_abx]. Without TIG, debridement and metronidazole leave the bound toxin to drive spasm + autonomic storm for weeks." },
    { q: "Why active vaccination if the patient just had the disease?",
      a: "Tetanus does NOT confer immunity — the lethal dose of toxin is below the threshold needed to mount a protective antibody response. CDC + WHO mandate initiating the active Tdap / Td series at presentation (then 4 wk and 6 mo), independent of TIG administration [cite:cdc_abx]. Patients who recover without vaccination remain fully susceptible to recurrent tetanus on any subsequent wound. Skip this step and the next event is preventable but not prevented." },
    { q: "Why debride a small wound — it looks clean now?",
      a: "Clostridium tetani requires the anaerobic micro-environment of devitalized tissue or foreign material to germinate and elaborate toxin — even a small puncture or splinter can harbor ongoing toxin production. WHO guidance [cite:cdc_abx] mandates wound exploration + debridement + foreign-body removal as source control alongside metronidazole and TIG. Cosmetic minimalism here means residual spore germination and continued toxin output despite antibiotic + IG therapy." },
  ],
  research: {
    headline: "Tetanus IG + metronidazole + wound debridement + ICU; lifetime vaccination required (disease does NOT confer immunity).",
    trials: [
      { name: "Thwaites Lancet 2014",
        n: "Cohort review",
        question: "Modern tetanus management + mortality",
        finding: "ICU + magnesium + benzodiazepine spasm control + metronidazole reduce mortality; respiratory failure drives outcomes",
        bias: "Resource-limited setting underrepresented; modern ICU drives reductions" },
      { name: "Ahmadsyah BMJ 1985",
        n: "97",
        question: "Metronidazole vs penicillin in tetanus",
        finding: "Metronidazole superior — shorter ICU stay + lower mortality; PCN may worsen spasms via GABA antagonism",
        bias: "Older trial; principle replicated by smaller studies" },
    ],
    guidelines: [
      { society: "WHO",
        year: 2017,
        topic: "Tetanus management guidance",
        keypoint: "Metronidazole + tetanus IG + ICU + active immunization; disease does NOT confer immunity" },
      { society: "CDC",
        year: 2024,
        topic: "Tetanus prevention",
        keypoint: "Tdap every 10 yr; standby Tdap for tetanus-prone wounds" },
    ],
    openQuestions: [
      "Magnesium dosing — variable institutional protocols",
      "IG dose — 3000–6000 units IM standard",
      "Optimal sedation strategy — benzo + propofol typical",
    ],
  },
};

export default { id: "tetanus", regimen, decision };

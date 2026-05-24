/* data · 5-section IA (Phase B1 of the Wave 2 reference restructure).
   Replaces the flat 11-tab navigation with a coarser 5-section grouping
   so the user picks "what kind of question am I answering?" first, then
   drills into the specific tab. The tab nav becomes a section-scoped
   sub-nav inside each section.

   The mapping was settled by the multi-agent strategic analysis: each
   tab lands in exactly one section, with no orphans and no duplicates.
   Old #t=... bookmarks continue to work because the section is derived
   from the active tab via TAB_TO_SECTION.

   Section order is the order the nav renders left-to-right:
   Syndromes (start here for empiric) → Agents (the formulary) →
   Organisms (directed therapy) → Compare (matrices) → Principles
   (approach, course, evidence). It mirrors the reading flow for an
   empiric → directed → escalation case workup.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { BookOpen, Bug, LayoutGrid, Pill, Stethoscope } from "lucide-react";

const SECTIONS = [
  {
    id: "syndromes",
    label: "Syndromes",
    icon: Stethoscope,
    hint: "All 108 syndromes with empiric regimens, refinements, durations, and evidence layers",
    tabs: ["empiric"],
  },
  {
    id: "agents",
    label: "Agents",
    icon: Pill,
    hint: "Drug formulary, patient-specific dosing tables, and toxicity surveillance",
    tabs: ["reference", "dose", "safety"],
  },
  {
    id: "organisms",
    label: "Organisms",
    icon: Bug,
    hint: "Directed therapy for 49 organisms with resistance trends and de-escalation paths",
    tabs: ["directed"],
  },
  {
    id: "compare",
    label: "Compare",
    icon: LayoutGrid,
    hint: "Spectrum × penetration × mechanism matrices and drug-vs-drug picker",
    tabs: ["spectrum", "penetration", "mechanisms"],
  },
  {
    id: "principles",
    label: "Principles",
    icon: BookOpen,
    hint: "Clinical approach, PK/PD, course planning, adjuncts, and the primary-evidence library",
    tabs: ["approach", "course", "adjuncts"],
  },
];

/* Reverse index — tabId → sectionId. Used to redirect legacy #t=... hash
   bookmarks into the correct section, and to compute the default section
   on first paint when only a tab is known. */
const TAB_TO_SECTION = (() => {
  const m = {};
  SECTIONS.forEach(s => s.tabs.forEach(t => { m[t] = s.id; }));
  return m;
})();

/* Section lookup helpers. */
const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
function sectionForTab(tabId) {
  return TAB_TO_SECTION[tabId] || "principles";
}
function firstTabOfSection(sectionId) {
  const s = SECTION_BY_ID[sectionId];
  return s ? s.tabs[0] : "approach";
}

export { SECTIONS, SECTION_BY_ID, TAB_TO_SECTION, sectionForTab, firstTabOfSection };

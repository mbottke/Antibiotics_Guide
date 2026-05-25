/* data · icon maps + tab definitions (lucide-backed).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { Activity, AlertTriangle, ArrowLeftRight, Beaker, Bone, Brain, Calculator, Clock, Crosshair, Droplets, Flame, FlaskConical, GitBranch, HeartPulse, LayoutGrid, ListChecks, Microscope, Network, Pill, ShieldAlert, ShieldCheck, Slice, Soup, Stethoscope, Syringe, TrendingDown, Wind } from "lucide-react";

/* ===================== ICON MAPS + PRIMITIVES ===================== */
const CAT_ICONS = { pulse:Activity, lung:Wind, heart:HeartPulse, drop:Droplets, soup:Soup, slice:Slice, bone:Bone, brain:Brain, flame:Flame, shield:ShieldCheck };

const SYN_ICON = { pulse:Activity, lung:Wind, heart:HeartPulse, drop:Droplets, soup:Soup, slice:Slice, bone:Bone, brain:Brain, flame:Flame, shield:ShieldCheck };

const FORM_ICON = { pill:Pill, shield:ShieldCheck, micro:Microscope, flask:FlaskConical, syringe:Syringe, beaker:Beaker };

const TREE_ICON = { GitBranch:GitBranch, Slice:Slice, Wind:Wind, Brain:Brain };

/* ===================== MAIN COMPONENT ===================== */
const TABS = [
  { id:"approach", label:"Approach", icon:ListChecks },
  { id:"empiric", label:"Empiric", icon:Stethoscope },
  { id:"directed", label:"Directed", icon:Crosshair },
  { id:"reference", label:"Formulary", icon:LayoutGrid },
  { id:"spectrum", label:"Spectrum", icon:Microscope },
  { id:"penetration", label:"Penetration", icon:Droplets },
  { id:"mechanisms", label:"Mechanisms", icon:Network },
  { id:"regimens", label:"Regimens", icon:ArrowLeftRight },
  { id:"dose", label:"Dose", icon:Calculator },
  { id:"course", label:"Course", icon:Clock },
  { id:"safety", label:"Safety", icon:AlertTriangle },
  { id:"adjuncts", label:"Adjuncts & Evidence", icon:ShieldAlert },
];

const RDX_ICON = { Microscope, FlaskConical, TrendingDown };

export { CAT_ICONS, SYN_ICON, FORM_ICON, TREE_ICON, RDX_ICON, TABS };

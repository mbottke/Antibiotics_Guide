/* component/util · severityStyle — shared severity → icon/color mapping.

   Single source of truth for the required / trigger / consider severity
   palette used by MonitoringBlock, DiagnosticsBlock, OPATBlock, and any
   future content layer that adopts the same grammar. Extracted in Wave 5
   R2 consolidation — the function was previously triplicated byte-
   identically across the three blocks.

   USAGE
     import { severityStyle } from "./util/severityStyle.js";
     const sty = severityStyle(item.sev);   // → { Icon, label, color, bg, line }

   Three exported tiers, plus an explicit fallback for items without a
   recognized sev (renders `consider` styling — neutral, never silent).

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export function severityStyle(sev) {
  if(sev === "required") return {
    Icon: CheckCircle2,
    label: "REQUIRED",
    color: "var(--red)",
    bg: "var(--red-soft)",
    line: "var(--red-line)",
  };
  if(sev === "trigger") return {
    Icon: AlertTriangle,
    label: "TRIGGER",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {
    Icon: Info,
    label: "CONSIDER",
    color: "var(--ink2)",
    bg: "var(--paper2)",
    line: "var(--line)",
  };
}

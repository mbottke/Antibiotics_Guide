/* component · SitePenetrationBlock — Phase L drug penetration matrix.
   Surfaces site-specific drug penetration profiles that drive oral
   step-down decisions, agent choice for sequestered sites (CNS, bone,
   abscess, prostate, vitreous), and dose intensification.

   Each card lists drugs ranked by penetration with a clinical note,
   plus bedside pearls.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Crosshair, CheckCircle2, MinusCircle, XCircle, AlertCircle } from "lucide-react";
import { Section } from "./Section.jsx";

function penIcon(level) {
  if(level === "excellent" || (typeof level === "string" && level.startsWith("excellent"))) {
    return { Icon: CheckCircle2, color: "#15803d", label: "EXCELLENT" };
  }
  if(level === "good") return { Icon: CheckCircle2, color: "var(--ox)", label: "GOOD" };
  if(level === "modest") return { Icon: AlertCircle, color: "var(--amber)", label: "MODEST" };
  return { Icon: XCircle, color: "#b91c1c", label: "POOR" };
}

function DrugRow({ d }) {
  const { Icon, color, label } = penIcon(d.penetration);
  return (
    <li style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 8, alignItems: "flex-start",
      padding: "5px 8px",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 64, paddingTop: 2 }}>
        <Icon size={13} color={color} aria-hidden />
        <span style={{
          fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700,
          color: color, letterSpacing: ".06em",
          whiteSpace: "nowrap",
        }}>{label}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>{d.agent}</div>
        {d.note && (
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--ink2)", marginTop: 1 }}>{d.note}</div>
        )}
      </div>
    </li>
  );
}

function SiteCard({ site }) {
  const accent = "var(--ox)";
  return (
    <li style={{
      display: "grid",
      gap: 6,
      padding: "10px 12px",
      background: "var(--paper2)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + accent,
      borderRadius: 6,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.005em" }}>
          {site.site}
        </div>
        {site.description && (
          <div style={{ fontSize: 11, color: "var(--ink2)", marginTop: 2, fontStyle: "italic", lineHeight: 1.4 }}>
            {site.description}
          </div>
        )}
      </div>

      {site.drugs && site.drugs.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, background: "var(--paper)", borderRadius: 4, border: "1px solid var(--line)" }}>
          {site.drugs.map((d, i) => <DrugRow key={"d-"+i} d={d} />)}
        </ul>
      )}

      {site.pearls && site.pearls.length > 0 && (
        <div style={{
          fontSize: 11, lineHeight: 1.5,
          padding: "5px 8px",
          background: "rgba(15, 76, 129, 0.06)",
          borderRadius: 4,
          border: "1px dashed var(--ox-line)",
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
            color: accent, letterSpacing: ".06em",
            textTransform: "uppercase", marginBottom: 3,
          }}>bedside pearls</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink)" }}>
            {site.pearls.map((p, i) => <li key={"pr-"+i} style={{ marginBottom: 2 }}>{p}</li>)}
          </ul>
        </div>
      )}
    </li>
  );
}

function SitePenetrationBlock({ entries }) {
  if(!entries || entries.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <Section kicker="Drug penetration · Site-specific PK" icon={Crosshair} testId="site-penetration-block">
      <div style={{
        background: accentBg,
        border: "1px solid var(--ox-line)",
        borderRadius: 7,
        padding: "8px 11px",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500 }}>
          Does this drug reach the site? Penetration profile by anatomic compartment — informs <b>oral step-down</b>, agent choice for sequestered sites, and dose intensification.
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {entries.map((s, i) => <SiteCard key={"site-"+i} site={s} />)}
      </ul>
    </Section>
  );
}

export { SitePenetrationBlock };

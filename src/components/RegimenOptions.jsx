/* component · RegimenOptions — Phase D1.5 multi-option presentation
   with per-card decision content. Each card carries:
     * route badge + drug fragment + selection state
     * a one-line "Pick if" verdict — the 5-second elevator pitch
     * "Why pick" bullets (strengths, with **bold** killer facts)
     * "Watch out" bullets with severity icons (stop / warn / note)
     * per-card dose-adjustment chips (renal / hepatic / synergy)
       computed against THIS option only, so selecting nitrofurantoin
       doesn't surface fosfomycin's renal banding.

   The card layout is bulleted/scannable rather than paragraph-style:
   three cards side-by-side at 1100px width have to function as a
   comparison table, and bullets compress the same factual density
   into 30% less vertical space while making the deltas between
   options visually instant.

   Selection emits via onSelectionChange so the wider Answer Canvas
   can narrow downstream sections (e.g. duration block, refinements)
   to the picked drug.

   Bold callout parsing: any `**text**` in pickIf / whyPick bullets
   / watchOut bullets renders as an accented span (orange for whyPick
   / pickIf, the severity color for watchOut). One pass, regex-driven,
   no markdown library — the content layer is plain JS strings.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Check, Info, Pill, Syringe, XCircle, Zap } from "lucide-react";
import { splitRegimenOptions } from "../engines/regimenOptions.js";
import { lookupOptionContent } from "../data/regimenContent.js";
import { doseAdjustments } from "../engines/dosing.js";
import { matchesCtx } from "../engines/ctxMatch.js";

/* Bold-callout parser. Splits a string on **…** segments and returns
   an array of { text, bold } chunks. The renderer wraps bold chunks
   in an accented span keyed to the calling context. */
function parseBold(text) {
  if(!text) return [];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while((m = re.exec(text)) !== null) {
    if(m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts;
}

function RichText({ text, accentColor, accentBg }) {
  return (
    <>
      {parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{
          fontWeight: 700,
          color: accentColor,
          background: accentBg || "transparent",
          padding: accentBg ? "0 3px" : 0,
          borderRadius: accentBg ? 3 : 0,
        }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}

function RouteBadge({ route }) {
  if(!route) return null;
  const parts = route.split(",");
  return (
    <span style={{ display:"inline-flex", gap:4 }}>
      {parts.map((r, i) => {
        const Icon = r === "iv" ? Syringe : Pill;
        return (
          <span key={i} title={"Route: " + r.toUpperCase()} style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700,
            color: r === "iv" ? "var(--ox)" : "var(--ink2)",
            background: r === "iv" ? "var(--ox-soft)" : "var(--paper2)",
            border:"1px solid " + (r === "iv" ? "var(--ox-line)" : "var(--line)"),
            borderRadius:4, padding:"1px 5px",
          }}>
            <Icon size={9} aria-hidden /> {r}
          </span>
        );
      })}
    </span>
  );
}

/* Severity-specific bullet icon + color for watchOut entries. */
function severityStyle(sev) {
  if(sev === "stop") return {
    Icon: XCircle,
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.25)",
  };
  if(sev === "warn") return {
    Icon: AlertTriangle,
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {  // note
    Icon: Info,
    color: "var(--ink2)",
    bg: "transparent",
    line: "transparent",
  };
}

/* Decision content block — bullets + severity icons. Replaces the
   prior paragraph-style layout. Renders nothing if the option has no
   authored content (the card then shows just the drug fragment +
   route + dose chips). */
function DecisionContent({ content, accent, ctx }) {
  if(!content) return null;
  const hasAny = content.pickIf || content.whyPick?.length || content.watchOut?.length;
  if(!hasAny) return null;
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentBg    = accent === "add" ? "rgba(217, 119, 6, 0.10)" : "rgba(15, 76, 129, 0.08)";

  return (
    <div style={{ marginTop: 9, display:"grid", gap:9 }}>
      {/* Pick-if verdict — the 5-second elevator pitch */}
      {content.pickIf && (
        <div style={{
          fontSize:11.5, lineHeight:1.45, color:"var(--ink)",
          fontStyle:"italic", fontWeight:500,
          background: accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)",
          border: "1px solid " + (accent === "add" ? "var(--amber-line)" : "var(--ox-line)"),
          borderRadius: 6, padding: "5px 8px",
          display:"flex", alignItems:"flex-start", gap:6,
        }}>
          <Zap size={11} aria-hidden style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
          <span><span style={{
            fontFamily:"var(--mono)", fontStyle:"normal", fontWeight:700,
            fontSize:9, letterSpacing:".1em", textTransform:"uppercase",
            color: accentColor, marginRight: 5,
          }}>Pick if</span>
          <RichText text={content.pickIf} accentColor={accentColor} /></span>
        </div>
      )}

      {/* Why-pick bullets — strengths */}
      {content.whyPick?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color: accentColor, marginBottom: 4,
          }}>Why pick</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.whyPick.map((b, i) => (
              <li key={i} style={{
                display:"flex", alignItems:"flex-start", gap:6,
                fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
              }}>
                <span aria-hidden style={{
                  flexShrink: 0, marginTop: 6,
                  width: 4, height: 4, borderRadius: "50%",
                  background: accentColor,
                }} />
                <span><RichText text={b} accentColor={accentColor} accentBg={accentBg} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch-out bullets — cautions with severity icons. Phase D3.4:
          bullets carrying a matchCtx predicate that fires against the
          current patient ctx get elevated — left accent stripe in the
          bullet's severity color, the bullet's own background nudged
          toward that color, and a "FIRES NOW" chip pinned to the row.
          The visual cue is the same vocabulary as MATCHES (D2/D3.2) so
          the entire app speaks one elevation grammar. Never hides
          non-matching bullets — safety contract. */}
      {content.watchOut?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color:"var(--amber)", marginBottom: 4,
          }}>Watch out</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.watchOut.map((b, i) => {
              const sty = severityStyle(b.sev || "note");
              const ctxFires = !!(b.matchCtx && matchesCtx(b.matchCtx, ctx));
              return (
                <li key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:6,
                  fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                  padding: ctxFires ? "3px 6px" : 0,
                  background: ctxFires
                    ? (sty.bg !== "transparent" ? sty.bg : "var(--paper2)")
                    : "transparent",
                  border: ctxFires ? "1px solid " + sty.line : "none",
                  borderLeft: ctxFires ? "3px solid " + sty.color : "none",
                  borderRadius: ctxFires ? 5 : 0,
                  transition: "background .12s, border-color .12s",
                }}>
                  <sty.Icon size={11} aria-hidden style={{ color: sty.color, flexShrink: 0, marginTop: 3 }} />
                  <span style={{ flex: 1 }}>
                    <RichText text={b.text} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
                  </span>
                  {ctxFires && (
                    <span style={{
                      flex: "0 0 auto",
                      fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
                      color:"#fff", background: sty.color,
                      padding: "2px 5px", borderRadius: 3,
                      letterSpacing:".06em", textTransform:"uppercase",
                      whiteSpace:"nowrap",
                    }}>Fires now</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Per-card dose-adjustment chips. Computed against the OPTION text,
   not the whole tier — selecting one card narrows renal / hepatic /
   synergy adjustments to that drug. */
function PerOptionDoseChips({ optionText, ctx, d, synId }) {
  if(!ctx || !ctx.on) return null;
  const adj = doseAdjustments(optionText, ctx, d, synId);
  if(!adj.length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop: 9 }}>
      {adj.map((a, i) => (
        <span key={i} style={{
          display:"inline-flex", alignItems:"center", gap:4,
          fontSize:10.5, fontWeight:500, padding:"3px 7px", borderRadius:5,
          background:"var(--decision-adjusted-bg)", color:"var(--decision-adjusted)",
          border:"1px solid var(--decision-adjusted-line)",
          fontFamily:"var(--mono)", letterSpacing:".01em",
        }}>
          <span style={{ opacity:.75, fontSize:9, letterSpacing:".08em", textTransform:"uppercase" }}>
            {a.kind === "renal" ? "renal" : a.kind === "weight" ? "weight" : a.kind === "hepatic" ? "hepatic" : a.kind === "hd" ? "HD" : a.kind}
          </span>
          <span style={{ fontWeight:600, color:"var(--ink)" }}>{(a.agent || "").split(" / ")[0].replace(/\s*\(IV\)/i, "")}</span>
          <span style={{ opacity:.6 }}>→</span>
          <span style={{ fontWeight:600 }}>{a.value}</span>
        </span>
      ))}
    </div>
  );
}

/* Title-case the first ASCII letter of an option's text. The splitter
   produces "fosfomycin 3 g PO × 1" for the second/third entries in a
   tier (it just slices after the comma+or), so card titles otherwise
   render with a lowercase leading drug-name letter. Skips non-ASCII
   leads (Greek β, etc.) so "β-lactam..." stays as authored. */
function titleCaseFirst(s) {
  if(!s) return s;
  const c = s.charAt(0);
  if(c >= "a" && c <= "z") return c.toUpperCase() + s.slice(1);
  return s;
}

/* β-lactam detection regex used by Phase D3.3 allergy-driven card
   deprecation. Catches penicillins, cephalosporins, carbapenems, and
   the generic class noun — but DOES NOT include aztreonam (monobactam,
   negligible cross-reactivity with PCN anaphylaxis per IDSA and the
   2022 AAAAI practice parameter). Aztreonam-containing cards therefore
   remain safe even when the patient has documented β-lactam anaphylaxis.
   The regex stays generous (cef\w+ covers all cephalosporin generations
   incl. cefiderocol, ceftolozane-tazobactam, ceftaroline) so new
   members ship safely without code changes. */
const BETA_LACTAM_RX = /\b(?:penicillin|amoxicillin|ampicillin|dicloxacillin|oxacillin|nafcillin|piperacillin|amp-?sulbactam|amox-?clav|augmentin|pip-?tazo|pip-?taz|cef\w+|carbapenem|meropenem|imipenem|ertapenem|doripenem|β-?lactam|cephalosporin|cephamycin)\b/i;

function OptionCard({ option, selected, primary, onSelect, renderText, accent, content, ctx, d, synId }) {
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentSoft  = accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)";
  const accentLine  = accent === "add" ? "var(--amber-line)" : "var(--ox-line)";

  /* Phase D3.3 allergy-driven card deprecation. When the patient has
     documented β-lactam anaphylaxis AND this card contains a β-lactam
     agent (penicillin, cephalosporin, or carbapenem — not aztreonam),
     surface a red top banner across the card. The card stays
     clickable (clinician may know history is unreliable, or plan
     desensitization) but the visual cue is unmissable at bedside.
     Cards containing aztreonam are not flagged because the monobactam
     does not cross-react. */
  const anaphylaxis = ctx?.blAllergy === "severe";
  const containsBetaLactam = BETA_LACTAM_RX.test(option.text);
  const showAllergyBanner = anaphylaxis && containsBetaLactam;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-describedby={showAllergyBanner ? `allergy-warn-${synId}-${option.text.slice(0,20).replace(/\W+/g,"-")}` : undefined}
      onClick={onSelect}
      style={{
        textAlign:"left",
        background: selected
          ? (showAllergyBanner ? "rgba(185,28,28,0.06)" : accentSoft)
          : "var(--panel)",
        border: "1px solid " + (selected
          ? (showAllergyBanner ? "rgba(185,28,28,0.35)" : accentLine)
          : (showAllergyBanner ? "rgba(185,28,28,0.25)" : "var(--line)")),
        borderRadius:10,
        padding:"11px 12px 12px",
        cursor:"pointer",
        transition:"background .12s, border-color .12s, transform .08s",
        boxShadow: selected ? "inset 0 0 0 1px " + accentLine : "none",
        opacity: selected ? 1 : 0.94,
      }}>
      {/* Allergy warning banner — D3.3. Spans the full card width with
          negative margins to reach the card border. Reads as a chart
          alert (red strip, white serif uppercase) so it leaps out even
          when the rest of the card content is dense. */}
      {showAllergyBanner && (
        <div
          id={`allergy-warn-${synId}-${option.text.slice(0,20).replace(/\W+/g,"-")}`}
          style={{
            background:"#b91c1c", color:"#fff",
            margin:"-11px -12px 8px",
            padding:"4px 10px",
            borderRadius:"10px 10px 0 0",
            fontFamily:"var(--mono)", fontSize:10, fontWeight:700,
            letterSpacing:".06em", textTransform:"uppercase",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}>
          <span aria-hidden>⚠</span>
          β-lactam anaphylaxis on file — confirm history before use
        </div>
      )}

      {/* Top metadata strip: route badge(s) on the left, Recommended chip
          inline next to them (instead of an absolute-positioned tab that
          overlapped the card border on prior iterations), and the
          Selected indicator anchored on the right. The Recommended chip
          renders as a fully-bordered pill so it reads as a deliberate
          badge rather than a stuck-on label. */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom: 6 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <RouteBadge route={option.route} />
          {primary && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:3,
              fontFamily:"var(--mono)", fontSize:9, letterSpacing:".08em",
              textTransform:"uppercase", fontWeight:700,
              color:"#fff", background: accentColor,
              border: "1px solid " + accentColor,
              borderRadius: 4, padding:"2px 6px",
              whiteSpace:"nowrap",
            }}>Recommended</span>
          )}
        </div>
        {selected && (
          <span style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700, color: accentColor,
          }}>
            <Check size={10} aria-hidden /> Selected
          </span>
        )}
      </div>
      <div style={{ fontSize:15, lineHeight:1.45, color:"var(--ink)", fontWeight: selected ? 700 : 600, letterSpacing:"-.005em" }}>
        {renderText ? renderText(titleCaseFirst(option.text)) : titleCaseFirst(option.text)}
      </div>
      <DecisionContent content={content} accent={accent} ctx={ctx} />
      <PerOptionDoseChips optionText={option.text} ctx={ctx} d={d} synId={synId} />
    </button>
  );
}

function RegimenOptions({ rx, accent = "core", renderText, synId, tierLabel, ctx, d, onSelectionChange }) {
  const options = useMemo(() => splitRegimenOptions(rx), [rx]);

  /* Phase D3.3 recommended-card auto-deflect: when the patient has
     β-lactam anaphylaxis on file and the would-be-recommended (first)
     card contains a β-lactam, shift the Recommended badge to the
     first non-β-lactam card. The badge should never sit on a card
     the patient can't safely receive without affirmative action
     (desensitization, history re-review). Falls back to index 0 when
     no safe option exists (e.g., every card contains a β-lactam —
     in that case the allergy banners on every card make the
     situation visible regardless). */
  const recommendedIdx = useMemo(() => {
    if(ctx?.blAllergy !== "severe") return 0;
    const firstSafe = options.findIndex(o => !BETA_LACTAM_RX.test(o.text));
    return firstSafe >= 0 ? firstSafe : 0;
  }, [options, ctx]);

  const [pickedIdx, setPickedIdx] = useState(recommendedIdx);

  // When the rx changes (new tier) OR the recommendation deflects
  // (allergy state changes), reset the picked card to the new
  // recommendation so the initial visual is coherent.
  useEffect(() => { setPickedIdx(recommendedIdx); }, [rx, recommendedIdx]);

  /* Fire onSelectionChange only when the USER explicitly clicks a
     card — not on initial mount. Without this guard, multi-tier
     syndromes (e.g. SAB with MSSA + MRSA tiers) would race their
     "default to first card" useEffects and whichever instance
     mounted last would silently set pickedAgent in AnswerCanvas
     to a card the clinician never picked, lighting downstream
     monitoring items as MATCHES under false pretenses. The
     "selected" visual state of the first card remains as a
     recommendation cue, but the cross-section signal stays null
     until a real click. */
  const userPicked = (i) => {
    setPickedIdx(i);
    onSelectionChange?.(options[i]?.text || null);
  };

  const contentFor = (text) => lookupOptionContent(synId, tierLabel, text);

  if(options.length === 0) return null;

  // 1 option → single card; 2 → side-by-side; 3+ → auto-fit grid.
  // Bedside mobile (.rx-bedside) collapses to one column via the
  // existing media query. The minmax floor is generous enough that
  // bulleted content doesn't reflow into illegible columns.
  const cols = options.length === 1 ? "1fr"
             : options.length === 2 ? "repeat(2, 1fr)"
             : options.length === 3 ? "repeat(auto-fit, minmax(240px, 1fr))"
             :                        "repeat(auto-fit, minmax(220px, 1fr))";

  return (
    <div
      role={options.length > 1 ? "radiogroup" : undefined}
      aria-label={options.length > 1 ? "Regimen options" : undefined}
      data-testid="regimen-options"
      style={{
        display:"grid",
        gap:11,
        gridTemplateColumns: cols,
        marginTop: 4,
      }}>
      {options.map((opt, i) => (
        <OptionCard key={i}
          option={opt}
          selected={i === pickedIdx}
          primary={options.length > 1 && i === recommendedIdx}
          accent={accent}
          onSelect={() => userPicked(i)}
          renderText={renderText}
          content={contentFor(opt.text)}
          ctx={ctx}
          d={d}
          synId={synId} />
      ))}
    </div>
  );
}

export { RegimenOptions };

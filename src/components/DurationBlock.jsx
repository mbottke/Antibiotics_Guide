/* component · DurationBlock — Phase D2 structured duration content.
   Renders the syndrome-level "when to stop" decision below the
   regimen options in the Answer Canvas. Wraps the existing Section
   component so its kicker, icon, and chrome match every other
   section on the page (no internal title strip — formatting
   consistency contract).

   Content:
     1. Headline + evidence anchor — the bottom line at a glance
     2. Clinical-state branches grid (clickable; bidirectional with
        the Source-controlled chip in ReassessmentPanel)
     3. Start date input + computed Stop date strip — duration math
        used to live in ReassessmentPanel but a stop date is purely
        a duration calc, so it belongs here
     4. Stop-when checklist + Extend-if triggers — the discharge
        checklist as a two-column scan

   Renders nothing when the syndrome has no authored content; the
   legacy duration clock falls through ReassessmentPanel from the
   `syndrome.duration` string parser as before.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Clock, Check, AlertTriangle, ArrowUpRight, Calendar } from "lucide-react";
import { Section } from "./Section.jsx";
import { matchesCtx } from "../engines/ctxMatch.js";

/* Bold-callout parser. Same as RegimenOptions — splits a string on
   **…** segments and returns chunks the renderer can accent. */
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

function SubLabel({ icon: Icon, text, color = "var(--ink2)" }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5, marginBottom:6,
      fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
      textTransform:"uppercase", fontWeight:700, color,
    }}>
      {Icon && <Icon size={11} aria-hidden />}
      <span>{text}</span>
    </div>
  );
}

/* Parse the first integer from a branch.days string ("14 d",
   "28–42 d", "≥ 42 d", "1 dose"). Returns null for "Indefinite"
   or any string with no digits. Used to compute the stop date. */
function parseFirstInt(days) {
  if(!days || typeof days !== "string") return null;
  if(/indefinite/i.test(days)) return null;
  const m = days.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/* Add n days to an ISO date string (YYYY-MM-DD); returns the same
   shape so the <input type="date"> roundtrip is clean. */
function addDaysIso(iso, n) {
  if(!iso || n == null) return null;
  const d = new Date(iso + "T00:00:00");
  if(Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function DurationBlock({ duration, pickedAgents = [], pickedBranch, onBranchSelect, startDate, onStartDateChange, ctx }) {
  if(!duration) return null;
  const { headline, evidence, branches = [], stopWhen = [], extendIf = [] } = duration;
  if(!headline && branches.length === 0 && stopWhen.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  /* Branch is "active" when the user explicitly picked it (pickedBranch
     matches the label) OR ANY agent picked across tiers matches the
     branch's matchAgent regex. Per Phase D3.1 multi-tier aggregation:
     the active branch is derived from the UNION of picks, not just
     the latest single pick. Effective-branch derivation in AnswerCanvas
     mirrors this; both stay in sync. */
  const branchIsActive = (b) => {
    if(pickedBranch === b.label) return true;
    if(!pickedBranch && b.matchAgent && pickedAgents.some(a => b.matchAgent.test(a))) return true;
    return false;
  };

  /* Stop-date computation: pull the integer day count from the
     active branch (explicit pick wins over auto-derived) and add
     to startDate. Ranges like "5–7 d" use the lower bound for the
     date — clinicians extend per evolution. */
  const activeBranch = branches.find(b => branchIsActive(b)) || null;
  const activeDays = activeBranch ? parseFirstInt(activeBranch.days) : null;
  const stopDate = startDate && activeDays != null ? addDaysIso(startDate, activeDays) : null;
  const indefinite = activeBranch && /indefinite/i.test(activeBranch.days);

  return (
    <Section kicker="Duration · When to stop" icon={Clock}>
      {/* Headline + evidence */}
      {headline && (
        <div style={{
          background: accentBg,
          border: "1px solid var(--ox-line)",
          borderRadius: 7,
          padding: "8px 11px",
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", fontWeight: 600 }}>
            <RichText text={headline} accentColor={accent} />
          </div>
          {evidence && (
            <div style={{ fontSize: 11, lineHeight: 1.45, color: "var(--ink2)", marginTop: 4, fontStyle: "italic" }}>
              <RichText text={evidence} accentColor={accent} />
            </div>
          )}
        </div>
      )}

      {/* Branches — clinical-state grid. Each branch is clickable; the
          selected branch propagates to MonitoringBlock so matched items
          can highlight AND to the sourceControlled chip in the Current
          State section (bidirectional sync). Selection persists until
          cleared (clicking the same branch again clears it). The day
          chip carries explicit units from the data — never inferred —
          because a unit-less number is a real safety hazard (fosfomycin
          1 dose vs 1 day). */}
      {branches.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SubLabel text="Course by clinical state — click to filter monitoring + sync chips" color={accent} />
          <div
            data-testid="duration-branches"
            style={{
              display:"grid",
              gap:7,
              gridTemplateColumns: branches.length === 1 ? "1fr"
                : branches.length === 2 ? "repeat(2, 1fr)"
                : branches.length <= 4 ? "repeat(auto-fit, minmax(180px, 1fr))"
                :                         "repeat(auto-fit, minmax(160px, 1fr))",
            }}>
            {branches.map((b, i) => {
              const active = branchIsActive(b);
              const interactive = !!onBranchSelect;
              const toggle = () => onBranchSelect && onBranchSelect(pickedBranch === b.label ? null : b.label);
              const Tag = interactive ? "button" : "div";
              return (
                <Tag key={i}
                  type={interactive ? "button" : undefined}
                  onClick={interactive ? toggle : undefined}
                  aria-pressed={interactive ? active : undefined}
                  style={{
                    textAlign: "left",
                    background: active ? accentBg : "var(--paper2)",
                    border: "1px solid " + (active ? "var(--ox-line)" : "var(--line)"),
                    borderLeft: "3px solid " + (active ? accent : "transparent"),
                    borderRadius: 7,
                    padding: "8px 10px 8px 9px",
                    display:"flex", flexDirection:"column", gap:4,
                    cursor: interactive ? "pointer" : "default",
                    transition: "background .12s, border-color .12s",
                    boxShadow: active ? "inset 0 0 0 1px var(--ox-line)" : "none",
                  }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, justifyContent:"space-between" }}>
                    <span style={{ fontSize:11.5, fontWeight: active ? 700 : 600, color:"var(--ink)", lineHeight:1.35 }}>
                      {b.label}
                    </span>
                    <span style={{
                      fontFamily:"var(--mono)", fontSize:14, fontWeight:700,
                      color: accent, background: accentBg,
                      padding: "1px 7px", borderRadius: 5, whiteSpace:"nowrap",
                      border: "1px solid var(--ox-line)",
                    }}>
                      {b.days}
                    </span>
                  </div>
                  {b.detail && (
                    <div style={{ fontSize: 11, color: "var(--ink2)", lineHeight: 1.45 }}>
                      <RichText text={b.detail} accentColor={accent} accentBg={accentBg} />
                    </div>
                  )}
                </Tag>
              );
            })}
          </div>
        </div>
      )}

      {/* Start-date input + computed Stop-date. Lives here because
          stop date = startDate + branch-days arithmetic. Was in
          ReassessmentPanel; moved as part of the D2 consolidation
          (start date is a duration concern, not a current-state one). */}
      {onStartDateChange && branches.length > 0 && (
        <div style={{
          display:"grid",
          gridTemplateColumns: "minmax(220px, auto) 1fr",
          gap: 12, alignItems:"center",
          padding: "8px 10px",
          background: "var(--paper2)",
          border: "1px solid var(--line)",
          borderRadius: 7,
          marginBottom: stopWhen.length || extendIf.length ? 12 : 0,
        }}>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:11.5, color:"var(--ink2)" }}>
            <Calendar size={11} aria-hidden style={{ color: accent }} />
            <span style={{
              fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".08em",
              textTransform:"uppercase", fontWeight:700, color: "var(--ink2)",
            }}>First effective dose</span>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange(e.target.value || null)}
              style={{
                fontFamily:"var(--mono)", fontSize:12,
                padding:"3px 6px", borderRadius:4,
                border:"1px solid var(--line)", background:"var(--panel)",
                color:"var(--ink)",
              }} />
          </label>
          <div style={{ fontSize: 12, color: "var(--ink2)", textAlign: "right" }}>
            {!startDate ? (
              <span style={{ fontStyle:"italic" }}>
                Pick the first-effective-dose date to compute a stop date from the {activeBranch ? "selected" : "active"} branch.
              </span>
            ) : indefinite ? (
              <span>
                Branch is <b>Indefinite</b> — no fixed stop date. Long-term suppression per ID.
              </span>
            ) : stopDate ? (
              <span>
                Stop on <b style={{ fontFamily:"var(--mono)", color: accent }}>{stopDate}</b>
                {activeBranch && (
                  <> · <span style={{ color:"var(--muted)" }}>{activeBranch.days} from start, branch "{activeBranch.label}"</span></>
                )}
              </span>
            ) : (
              <span style={{ fontStyle: "italic" }}>
                Click a branch above to bind the duration; range branches use the lower bound.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stop-when + Extend-if — two columns */}
      {(stopWhen.length || extendIf.length) > 0 && (
        <div style={{
          display:"grid",
          gridTemplateColumns: stopWhen.length && extendIf.length ? "1fr 1fr" : "1fr",
          gap: 14,
        }}>
          {stopWhen.length > 0 && (
            <div>
              <SubLabel icon={Check} text="Stop when (ALL of)" color="#0f7a3b" />
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:4 }}>
                {stopWhen.map((s, i) => (
                  <li key={i} style={{
                    display:"flex", alignItems:"flex-start", gap:6,
                    fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                  }}>
                    <Check size={11} aria-hidden style={{ color:"#0f7a3b", flexShrink: 0, marginTop: 3 }} />
                    <span><RichText text={s} accentColor="#0f7a3b" accentBg="rgba(15, 122, 59, 0.08)" /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {extendIf.length > 0 && (
            <div>
              <SubLabel icon={ArrowUpRight} text="Extend if" color="var(--amber)" />
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:4 }}>
                {extendIf.map((entry, i) => {
                  /* Phase D3.4: extendIf entries can be plain strings
                     (legacy / simple) OR { text, matchCtx? } objects.
                     The object form lets authors tag entries with a
                     ctx predicate so the row elevates when the
                     patient's state matches the trigger. */
                  const isObj = entry && typeof entry === "object";
                  const text = isObj ? entry.text : entry;
                  const ctxFires = !!(isObj && entry.matchCtx && matchesCtx(entry.matchCtx, ctx));
                  return (
                    <li key={i} style={{
                      display:"flex", alignItems:"flex-start", gap:6,
                      fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                      padding: ctxFires ? "3px 6px" : 0,
                      background: ctxFires ? "var(--amber-soft)" : "transparent",
                      border: ctxFires ? "1px solid var(--amber-line)" : "none",
                      borderLeft: ctxFires ? "3px solid var(--amber)" : "none",
                      borderRadius: ctxFires ? 5 : 0,
                      transition: "background .12s, border-color .12s",
                    }}>
                      <AlertTriangle size={11} aria-hidden style={{ color:"var(--amber)", flexShrink: 0, marginTop: 3 }} />
                      <span style={{ flex: 1 }}>
                        <RichText text={text} accentColor="var(--amber)" accentBg="var(--amber-soft)" />
                      </span>
                      {ctxFires && (
                        <span style={{
                          flex: "0 0 auto",
                          fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
                          color:"#fff", background: "var(--amber)",
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
      )}
    </Section>
  );
}

export { DurationBlock };

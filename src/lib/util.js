/* lib · pure string/token/route utilities — zero app dependencies (DAG layer 0).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* Some agents are systemic only by one route. Oral/enteral vancomycin (C. diff)
   is not absorbed — weight loading, renal banding, and HD redosing do NOT apply.
   Detect the enteral context around a vancomycin mention and suppress those. */
function _vancoIsEnteral(text, synId){
  if(synId === "cdiff") return true; // C. diff: vancomycin is always oral/enteral, never systemic
  if(typeof text !== "string") return false;
  const low = text.toLowerCase();
  const i = low.indexOf("vancomycin");
  if(i === -1) return false;
  // look at a window before the agent for an oral/enteral cue
  const win = low.slice(Math.max(0, i - 28), i + 12);
  return /\b(oral|po|ng|enteral|rectal|tapered|pulsed)\b|\/ng\b|oral\/ng/.test(win);
}

/* Stable anchor id from an organism label — used to scroll-to a directed row. */
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* String normalization + token helpers (used by lookups, matching, glossary). */
const _normd  = s => String(s || "").toLowerCase();

const _coretok = s => (_normd(s).split(/[\s/(,\-]+/).filter(Boolean)[0] || "");

function _agentMatchTokens(name){
  const base = _normd(name).replace(/\([^)]*\)/g, "").trim();   // drop "(IV)" etc.
  return base.split("/").map(s => s.trim()).filter(Boolean);     // slash alternates
}

const _escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const _gloWrap = k => /^[\w-]+$/.test(k) ? "\\b" + _escRe(k) + "s?\\b" : _escRe(k);

const _cmpActive = lv => lv === "first" || lv === "sec" || lv === "var";

export { _normd, _coretok, _escRe, _gloWrap, slug, _cmpActive, _vancoIsEnteral, _agentMatchTokens };

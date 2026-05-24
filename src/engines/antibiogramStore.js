/* engine · antibiogram localStorage store — Phase E4
   Persists user-uploaded antibiograms + the currently-active selection
   across sessions. Seed antibiograms (ILH today; other UnityPoint
   sites later) are NOT persisted — they always re-load from code so
   ship-time updates reach the user even if they've previously saved
   a custom antibiogram. Only user uploads land in localStorage.

   STORAGE KEYS (versioned)
   ------------------------
   abxguide_antibiograms_v1     · JSON array of user-uploaded antibiograms
   abxguide_antibiogram_active_v1 · string id of currently-active antibiogram

   FAILURE MODES (graceful)
   ------------------------
   - window.localStorage unavailable (SSR / private browsing / disabled)
     → loaders return [] / null; savers no-op + return false.
   - Quota exceeded → save returns false; existing entries unchanged.
   - Malformed JSON → load returns [] (corrupted entries are dropped
     rather than rethrown so the app boots).
   - Schema mismatch on load → entry is dropped silently; valid entries
     still load.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { getSeedAntibiograms, getSeedAntibiogram } from "../data/antibiograms/index.js";

const _STORE_KEY = "abxguide_antibiograms_v1";
const _ACTIVE_KEY = "abxguide_antibiogram_active_v1";

/* Has window.localStorage at all? (false in SSR / blocked / disabled.) */
function _hasStorage() {
  try {
    return typeof window !== "undefined"
      && !!window.localStorage
      && typeof window.localStorage.getItem === "function";
  } catch(e) {
    return false;
  }
}

/* Validate an antibiogram object has the minimum shape we'd render. */
function _isValidAntibiogram(x) {
  if(!x || typeof x !== "object") return false;
  if(typeof x.id !== "string" || !x.id) return false;
  if(typeof x.name !== "string") return false;
  if(!Array.isArray(x.organisms)) return false;
  for(const o of x.organisms) {
    if(!o || typeof o !== "object") return false;
    if(typeof o.species !== "string") return false;
    if(!o.susceptibility || typeof o.susceptibility !== "object") return false;
  }
  return true;
}

/* Read all user-saved (non-seed) antibiograms from localStorage. */
function loadUserAntibiograms() {
  if(!_hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(_STORE_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    if(!Array.isArray(arr)) return [];
    return arr.filter(_isValidAntibiogram);
  } catch(e) {
    return [];
  }
}

/* Persist the user antibiograms array (replaces wholesale). */
function _writeUserAntibiograms(arr) {
  if(!_hasStorage()) return false;
  try {
    const valid = arr.filter(_isValidAntibiogram);
    window.localStorage.setItem(_STORE_KEY, JSON.stringify(valid));
    return true;
  } catch(e) {
    return false;
  }
}

/* Save or update a single user antibiogram. If an entry with the same
   id exists, it is replaced. Returns true on success, false on quota /
   storage / validation failure. */
function saveUserAntibiogram(ab) {
  if(!_isValidAntibiogram(ab)) return false;
  if(ab.isSeed) return false;  // seed antibiograms are not persisted
  const existing = loadUserAntibiograms();
  const next = [...existing.filter(x => x.id !== ab.id), ab];
  return _writeUserAntibiograms(next);
}

/* Delete a user antibiogram by id. Returns true if it was deleted,
   false if it wasn't present or storage is unavailable. */
function deleteUserAntibiogram(id) {
  if(!_hasStorage()) return false;
  const existing = loadUserAntibiograms();
  if(!existing.some(x => x.id === id)) return false;
  const next = existing.filter(x => x.id !== id);
  return _writeUserAntibiograms(next);
}

/* Read the persisted active-antibiogram id. */
function loadActiveId() {
  if(!_hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(_ACTIVE_KEY);
    if(!raw) return null;
    return typeof raw === "string" ? raw : null;
  } catch(e) {
    return null;
  }
}

/* Persist the active-antibiogram id. */
function saveActiveId(id) {
  if(!_hasStorage()) return false;
  try {
    if(id == null) window.localStorage.removeItem(_ACTIVE_KEY);
    else window.localStorage.setItem(_ACTIVE_KEY, String(id));
    return true;
  } catch(e) {
    return false;
  }
}

/* Merged list of all antibiograms — seeds + user uploads. User uploads
   win on id collision (so a user could theoretically override a seed
   by saving with the same id; this is intentional — clinical override
   is a feature, not a bug). */
function getAllAntibiograms() {
  const seeds = getSeedAntibiograms();
  const user = loadUserAntibiograms();
  const userIds = new Set(user.map(u => u.id));
  return [
    ...seeds.filter(s => !userIds.has(s.id)),
    ...user,
  ];
}

/* Resolve the currently-active antibiogram. Falls back to the first
   seed (ILH today) if no active id is persisted OR the persisted id
   no longer exists. Returns null only when no antibiograms are
   available at all (which should be impossible while a seed ships). */
function getActiveAntibiogram() {
  const list = getAllAntibiograms();
  if(list.length === 0) return null;
  const activeId = loadActiveId();
  if(activeId) {
    const found = list.find(a => a.id === activeId);
    if(found) return found;
  }
  return list[0];
}

/* Reset storage to a clean state (testing + "restore defaults" UI). */
function clearAntibiogramStore() {
  if(!_hasStorage()) return false;
  try {
    window.localStorage.removeItem(_STORE_KEY);
    window.localStorage.removeItem(_ACTIVE_KEY);
    return true;
  } catch(e) {
    return false;
  }
}

export {
  loadUserAntibiograms,
  saveUserAntibiogram,
  deleteUserAntibiogram,
  loadActiveId,
  saveActiveId,
  getAllAntibiograms,
  getActiveAntibiogram,
  clearAntibiogramStore,
  _STORE_KEY,
  _ACTIVE_KEY,
};

// Re-export of seed helpers so callers can import everything they need
// from a single antibiogram store rather than reaching across modules.
export { getSeedAntibiograms, getSeedAntibiogram };

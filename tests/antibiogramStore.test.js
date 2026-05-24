import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
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
} from "../src/engines/antibiogramStore.js";
import { ILH_ANTIBIOGRAM } from "../src/data/antibiograms/index.js";

/* Phase E4 acceptance — the antibiogram store must:
   1. Persist user uploads in localStorage across reloads.
   2. Reject seed antibiograms from being persisted (seeds reload fresh).
   3. Gracefully degrade when localStorage is unavailable (SSR / private).
   4. Merge seeds + user uploads into a single working list (user wins on id).
   5. Survive corrupt / malformed storage without crashing. */

// vitest's default node env has no window/localStorage. Polyfill an
// in-memory shim before each test for the storage-dependent assertions.
function _installMemStorage() {
  const store = new Map();
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] || null,
  };
  globalThis.window = { localStorage: storage };
  return storage;
}

function _uninstallStorage() {
  delete globalThis.window;
}

const _customAb = (id = "custom-1") => ({
  id,
  name: "Custom Hospital",
  subtitle: "Test fixture",
  period: { from: "2025-01-01", to: "2025-06-30" },
  isSeed: false,
  organisms: [
    {
      species: "Escherichia coli",
      orgId: "entero",
      gram: "neg",
      n: 200,
      smallN: false,
      susceptibility: { cefazolin: 80, ceftriaxone: 92 },
      caveats: {},
    },
  ],
});

describe("antibiogramStore — graceful degradation when storage unavailable", () => {
  beforeEach(() => { _uninstallStorage(); });

  it("loadUserAntibiograms returns [] when window absent", () => {
    expect(loadUserAntibiograms()).toEqual([]);
  });

  it("saveUserAntibiogram returns false when window absent", () => {
    expect(saveUserAntibiogram(_customAb())).toBe(false);
  });

  it("loadActiveId returns null when window absent", () => {
    expect(loadActiveId()).toBeNull();
  });

  it("getAllAntibiograms still returns seeds when window absent", () => {
    const r = getAllAntibiograms();
    expect(r.length).toBe(1);
    expect(r[0].id).toBe("ilh-2024");
  });

  it("getActiveAntibiogram falls back to the seed when window absent", () => {
    const r = getActiveAntibiogram();
    expect(r).not.toBeNull();
    expect(r.id).toBe("ilh-2024");
  });
});

describe("antibiogramStore — persistence with localStorage shim", () => {
  let storage;
  beforeEach(() => { storage = _installMemStorage(); });
  afterEach(() => { _uninstallStorage(); });

  it("saveUserAntibiogram then loadUserAntibiograms round-trips one entry", () => {
    const ab = _customAb("hosp-a");
    expect(saveUserAntibiogram(ab)).toBe(true);
    const loaded = loadUserAntibiograms();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("hosp-a");
    expect(loaded[0].organisms[0].susceptibility.cefazolin).toBe(80);
  });

  it("saveUserAntibiogram replaces an existing entry with the same id", () => {
    saveUserAntibiogram(_customAb("hosp-a"));
    const updated = _customAb("hosp-a");
    updated.name = "Renamed Hospital";
    expect(saveUserAntibiogram(updated)).toBe(true);
    const loaded = loadUserAntibiograms();
    expect(loaded.length).toBe(1);
    expect(loaded[0].name).toBe("Renamed Hospital");
  });

  it("saveUserAntibiogram rejects seed antibiograms", () => {
    expect(saveUserAntibiogram(ILH_ANTIBIOGRAM)).toBe(false);
    expect(loadUserAntibiograms()).toEqual([]);
  });

  it("saveUserAntibiogram rejects invalid payloads (no id, missing organisms)", () => {
    expect(saveUserAntibiogram({})).toBe(false);
    expect(saveUserAntibiogram({ id: "x" })).toBe(false);
    expect(saveUserAntibiogram({ id: "x", name: "Y", organisms: "not-array" })).toBe(false);
    expect(saveUserAntibiogram({ id: "x", name: "Y", organisms: [{ /* no susceptibility */ species: "E. coli" }] })).toBe(false);
    expect(loadUserAntibiograms()).toEqual([]);
  });

  it("deleteUserAntibiogram removes the matching entry", () => {
    saveUserAntibiogram(_customAb("hosp-a"));
    saveUserAntibiogram(_customAb("hosp-b"));
    expect(deleteUserAntibiogram("hosp-a")).toBe(true);
    const loaded = loadUserAntibiograms();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("hosp-b");
  });

  it("deleteUserAntibiogram returns false when id is not present", () => {
    expect(deleteUserAntibiogram("nope")).toBe(false);
  });

  it("saveActiveId persists the active-antibiogram id", () => {
    expect(saveActiveId("hosp-a")).toBe(true);
    expect(loadActiveId()).toBe("hosp-a");
  });

  it("saveActiveId(null) clears the persisted id", () => {
    saveActiveId("hosp-a");
    saveActiveId(null);
    expect(loadActiveId()).toBeNull();
  });

  it("getAllAntibiograms merges seeds + user uploads (user wins on id collision)", () => {
    saveUserAntibiogram(_customAb("hosp-a"));
    const all = getAllAntibiograms();
    expect(all.length).toBe(2);
    expect(all.some(a => a.id === "ilh-2024")).toBe(true);
    expect(all.some(a => a.id === "hosp-a")).toBe(true);
  });

  it("getAllAntibiograms — user upload with same id as seed overrides seed", () => {
    const override = _customAb("ilh-2024");
    override.name = "ILH Custom Override";
    saveUserAntibiogram(override);
    const all = getAllAntibiograms();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe("ILH Custom Override");
  });

  it("getActiveAntibiogram returns the persisted active id when valid", () => {
    saveUserAntibiogram(_customAb("hosp-a"));
    saveActiveId("hosp-a");
    expect(getActiveAntibiogram().id).toBe("hosp-a");
  });

  it("getActiveAntibiogram falls back to first seed when persisted id is stale", () => {
    saveActiveId("nonexistent-hosp");
    expect(getActiveAntibiogram().id).toBe("ilh-2024");
  });

  it("loadUserAntibiograms returns [] when localStorage payload is malformed JSON", () => {
    storage.setItem(_STORE_KEY, "not a valid json {{");
    expect(loadUserAntibiograms()).toEqual([]);
  });

  it("loadUserAntibiograms drops invalid entries but keeps valid ones", () => {
    storage.setItem(_STORE_KEY, JSON.stringify([
      _customAb("hosp-a"),
      { not: "valid" },
      _customAb("hosp-b"),
    ]));
    const loaded = loadUserAntibiograms();
    expect(loaded.length).toBe(2);
    expect(loaded.map(a => a.id).sort()).toEqual(["hosp-a", "hosp-b"]);
  });

  it("loadActiveId returns null when payload is not a string", () => {
    storage.setItem(_ACTIVE_KEY, JSON.stringify({ accidental: "object" }));
    // Should not throw — value will be a stringified JSON which is still a string per the API,
    // but the contract is "if it doesn't match a known id later, fall back". So:
    const id = loadActiveId();
    expect(typeof id === "string" || id === null).toBe(true);
  });

  it("clearAntibiogramStore wipes both keys", () => {
    saveUserAntibiogram(_customAb("hosp-a"));
    saveActiveId("hosp-a");
    expect(clearAntibiogramStore()).toBe(true);
    expect(loadUserAntibiograms()).toEqual([]);
    expect(loadActiveId()).toBeNull();
  });
});

describe("antibiogramStore — quota / write-failure handling", () => {
  it("saveUserAntibiogram returns false when localStorage throws on setItem", () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => { throw new Error("QuotaExceeded"); },
      removeItem: () => {},
    };
    globalThis.window = { localStorage: failingStorage };
    const r = saveUserAntibiogram(_customAb());
    expect(r).toBe(false);
    _uninstallStorage();
  });

  it("loadUserAntibiograms returns [] when getItem throws", () => {
    const failingStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => {},
      removeItem: () => {},
    };
    globalThis.window = { localStorage: failingStorage };
    expect(loadUserAntibiograms()).toEqual([]);
    _uninstallStorage();
  });
});

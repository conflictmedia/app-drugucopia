import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { DoseLog } from "../types";
import { useReminderStore } from "./reminder-store";

const STORAGE_KEY = "drugucopia-dose-logs";
const DELETED_KEY = "drugucopia-deleted-ids";

interface DoseStore {
  doses: DoseLog[];
  activeDoses: DoseLog[];
  deletedIds: Set<string>;
  isLoaded: boolean;

  initialize: () => (() => void) | void;
  addDose: (dose: DoseLog) => void;
  addDoses: (newDoses: DoseLog[]) => void;
  replaceDoses: (newDoses: DoseLog[]) => void;
  updateDose: (dose: DoseLog) => void;
  deleteDose: (id: string) => void;
  clearAllDoses: () => void;
  setDosesFromSync: (doses: DoseLog[], deletedIds: Set<string>) => void;
}

const timestampMs = (dose: DoseLog) => Date.parse(dose.timestamp) || 0;

const sortByTime = (doses: DoseLog[]) =>
  [...doses].sort((a, b) => timestampMs(b) - timestampMs(a));

/** Insert into the store's newest-first array without sorting the whole history. */
function insertByTime(doses: DoseLog[], dose: DoseLog): DoseLog[] {
  const time = timestampMs(dose);
  let low = 0;
  let high = doses.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (timestampMs(doses[middle]) >= time) low = middle + 1;
    else high = middle;
  }
  return [...doses.slice(0, low), dose, ...doses.slice(low)];
}

// ─── Debounced localStorage persistence ───────────────────────────────────
// Avoid blocking the main thread with synchronous JSON.stringify on every
// mutation. The state update itself happens synchronously (so the UI stays
// responsive), but the localStorage write is deferred to the next idle slot.
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const PERSIST_DEBOUNCE_MS = 300;

function persistDoses(doses: DoseLog[]) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doses));
    } catch (e) {
      console.error("Failed to persist doses to localStorage", e);
    }
    persistTimer = null;
  }, PERSIST_DEBOUNCE_MS);
}

function persistDeletedIds(deletedIds: Set<string>) {
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...deletedIds]));
  } catch (e) {
    console.error("Failed to persist deleted IDs to localStorage", e);
  }
}

// ─── Active-doses computation ──────────────────────────────────────────────
// "Active" = doses within their declared duration window (plus a safety
// buffer). This lets the Active Session tab subscribe to a tiny array instead
// of the full history, drastically reducing computeGroups work.
const ACTIVE_DOSE_BUFFER_MINS = 60; // keep doses up to 1h after their declared end

function parseDurationToMinutes(total?: string): number {
  if (!total) return 0;
  const normalized = total.toLowerCase().replace(/[\u2013\u2014]/g, "-");
  const range = normalized.match(
    /([\d.]+)\s*-\s*([\d.]+)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)/,
  );
  const single = normalized.match(
    /([\d.]+)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)/,
  );
  const value = range
    ? (Number(range[1]) + Number(range[2])) / 2
    : single
      ? Number(single[1])
      : 0;
  const unit = range?.[3] ?? single?.[2] ?? "";
  if (!Number.isFinite(value)) return 0;
  if (unit.startsWith("h")) return value * 60;
  if (unit.startsWith("s")) return value / 60;
  return value;
}

function computeActiveDoses(doses: DoseLog[]): DoseLog[] {
  const now = Date.now();
  const bufferMs = ACTIVE_DOSE_BUFFER_MINS * 60_000;
  const result: DoseLog[] = [];
  for (const dose of doses) {
    if (!dose.duration) continue;
    const elapsed = now - timestampMs(dose);
    const totalMins = parseDurationToMinutes(dose.duration.total);
    if (totalMins <= 0) continue;
    const activeWindowMs = Math.max(totalMins * 2, 24 * 60) * 60_000;
    if (elapsed >= 0 && elapsed < activeWindowMs + bufferMs) result.push(dose);
  }
  return result;
}

export const useDoses = () => useDoseStore((state) => state.doses);
export const useDeletedIds = () => useDoseStore((state) => state.deletedIds);
export const useDoseStore = create<DoseStore>()(
  subscribeWithSelector((set, get) => ({
    doses: [],
    activeDoses: [],
    deletedIds: new Set(),
    isLoaded: false,

    initialize: () => {
      // Guard: only run once
      if (get().isLoaded) return;

      try {
        const localDoses: DoseLog[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]",
        );
        const localDeleted = new Set<string>(
          JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"),
        );
        const sorted = sortByTime(localDoses);
        set({
          doses: sorted,
          activeDoses: computeActiveDoses(sorted),
          deletedIds: localDeleted,
          isLoaded: true,
        });
      } catch (e) {
        console.error("Failed to parse local storage", e);
        set({ isLoaded: true });
      }

      // Single, stable storage listener — kept for cross-tab sync.
      // Returns a cleanup fn so callers (e.g. React effects) can unsubscribe.
      const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue !== null) {
          try {
            const sorted = sortByTime(JSON.parse(e.newValue));
            set({ doses: sorted, activeDoses: computeActiveDoses(sorted) });
          } catch {}
        }
        if (e.key === DELETED_KEY && e.newValue !== null) {
          try {
            set({ deletedIds: new Set(JSON.parse(e.newValue)) });
          } catch {}
        }
      };

      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },

    addDose: (dose) => {
      set((state) => {
        const updated = insertByTime(state.doses, dose);
        const updatedDeleted = new Set(state.deletedIds);
        updatedDeleted.delete(dose.id);
        persistDoses(updated);
        persistDeletedIds(updatedDeleted);
        return {
          doses: updated,
          activeDoses: computeActiveDoses(updated),
          deletedIds: updatedDeleted,
        };
      });

      // Trigger reminder system — auto-start a timer if this substance has a schedule
      try {
        const reminderStore = useReminderStore.getState();
        if (reminderStore.autoStartEnabled) {
          reminderStore.startTimer(dose);
        }
      } catch {
        // Reminder store may not be initialized yet — silently skip
      }
    },

    updateDose: (updatedDose) => {
      set((state) => {
        const updated = sortByTime(
          state.doses.map((d) => (d.id === updatedDose.id ? updatedDose : d)),
        );
        persistDoses(updated);
        return { doses: updated, activeDoses: computeActiveDoses(updated) };
      });
    },

    deleteDose: (id) => {
      set((state) => {
        const updatedDoses = state.doses.filter((d) => d.id !== id);
        const updatedDeleted = new Set(state.deletedIds).add(id);
        persistDoses(updatedDoses);
        persistDeletedIds(updatedDeleted);
        return {
          doses: updatedDoses,
          activeDoses: computeActiveDoses(updatedDoses),
          deletedIds: updatedDeleted,
        };
      });
    },

    // Bulk add — single state update for multiple doses (e.g. import).
    // Coalesces into one state update + one debounced localStorage write.
    addDoses: (newDoses) => {
      set((state) => {
        const updated = sortByTime([...newDoses, ...state.doses]);
        const newIds = new Set(newDoses.map((d) => d.id));
        const updatedDeleted = new Set(state.deletedIds);
        newIds.forEach((id) => updatedDeleted.delete(id));
        persistDoses(updated);
        persistDeletedIds(updatedDeleted);
        return {
          doses: updated,
          activeDoses: computeActiveDoses(updated),
          deletedIds: updatedDeleted,
        };
      });
    },

    // Replace all doses — used for import with overwrite strategy.
    // Removes any existing doses with IDs in the new set, then adds them.
    replaceDoses: (newDoses) => {
      set((state) => {
        const newIds = new Set(newDoses.map((d) => d.id));
        const kept = state.doses.filter((d) => !newIds.has(d.id));
        const updated = sortByTime([...newDoses, ...kept]);
        const updatedDeleted = new Set(state.deletedIds);
        newIds.forEach((id) => updatedDeleted.delete(id));
        persistDoses(updated);
        persistDeletedIds(updatedDeleted);
        return {
          doses: updated,
          activeDoses: computeActiveDoses(updated),
          deletedIds: updatedDeleted,
        };
      });
    },

    // Clear all doses — single state update instead of N individual deletes.
    clearAllDoses: () => {
      set((state) => {
        const allIds = [...state.doses.map((d) => d.id), ...state.deletedIds];
        const updatedDeleted = new Set(state.deletedIds);
        allIds.forEach((id) => updatedDeleted.add(id));
        persistDoses([]);
        persistDeletedIds(updatedDeleted);
        return { doses: [], activeDoses: [], deletedIds: updatedDeleted };
      });
    },

    setDosesFromSync: (doses, deletedIds) => {
      const sorted = sortByTime(doses);
      persistDoses(sorted);
      persistDeletedIds(deletedIds);
      set({
        doses: sorted,
        activeDoses: computeActiveDoses(sorted),
        deletedIds,
      });
    },
  })),
);

import { create } from 'zustand';

export type MedicationType = 
  | 'SSRI' 
  | 'SNRI' 
  | 'MAOI' 
  | 'TCA' 
  | 'Benzodiazepine' 
  | 'Antipsychotic' 
  | 'Mood Stabilizer' 
  | 'Stimulant' 
  | 'Opioid'
  | 'Beta Blocker'
  | 'Other';

export const MEDICATION_TYPES: MedicationType[] = [
  'SSRI', 'SNRI', 'MAOI', 'TCA', 
  'Benzodiazepine', 'Antipsychotic', 'Mood Stabilizer', 'Stimulant', 'Opioid',
  'Beta Blocker', 'Other'
];

export const MEDICATION_TYPE_TO_SUBSTANCE_CLASS: Record<MedicationType, string> = {
  'SSRI': 'SSRI',
  'SNRI': 'SNRI',
  'MAOI': 'MAOI',
  'TCA': 'TCA',
  'Benzodiazepine': 'Benzodiazepine',
  'Antipsychotic': 'Antipsychotic',
  'Mood Stabilizer': 'Mood Stabilizer',
  'Stimulant': 'Stimulant',
  'Opioid': 'Opioid',
  'Beta Blocker': 'Beta Blocker',
  'Other': 'Other',
};

/**
 * Reverse map: substance class → MedicationType.
 * Used to auto-fill the medicationType field when a user picks a substance
 * whose `class` matches a known psychiatric medication class.
 */
export const SUBSTANCE_CLASS_TO_MEDICATION_TYPE: Record<string, MedicationType> = {
  'SSRI': 'SSRI',
  'SNRI': 'SNRI',
  'MAOI': 'MAOI',
  'TCA': 'TCA',
  'Tricyclic Antidepressant': 'TCA',
  'Benzodiazepine': 'Benzodiazepine',
  'Antipsychotic': 'Antipsychotic',
  'Mood Stabilizer': 'Mood Stabilizer',
  'Stimulant': 'Stimulant',
  'Opioid': 'Opioid',
  'Beta Blocker': 'Beta Blocker',
};

export interface UserMedication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedFor?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  medicationType?: MedicationType;
  /**
   * Optional link to a substance in the built-in substance database
   * (e.g. "sertraline", "fluoxetine"). When present, the medication
   * inherits interaction data, dose ranges, and class info from the
   * linked substance, while keeping its user-specific dosage/frequency.
   */
  linkedSubstanceId?: string;
}

export interface Contraindication {
  medicationId: string;
  medicationName: string;
  substanceName: string;
  substanceId: string;
  severity: 'dangerous' | 'unsafe' | 'caution';
  description: string;
  source: 'tripsit' | 'substance-data' | 'manual';
}

interface MedicationState {
  medications: UserMedication[];
  deletedIds: Set<string>;
  contraindications: Contraindication[];
  loaded: boolean;
  
  initialize: () => void;
  addMedication: (med: UserMedication) => void;
  updateMedication: (id: string, patch: Partial<UserMedication>) => void;
  deleteMedication: (id: string) => void;
  setMedicationsFromSync: (medications: UserMedication[], deletedIds: Set<string>) => void;
  checkContraindications: (substanceIds: string[]) => void;
}

const KEY = 'drugucopia-user-medications';
const DELETED_KEY = 'drugucopia-deleted-user-medications';

function load(): UserMedication[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function loadDeleted(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')); } catch { return new Set(); }
}

function save(list: UserMedication[], deletedIds?: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    if (deletedIds) localStorage.setItem(DELETED_KEY, JSON.stringify([...deletedIds]));
  } catch {}
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  deletedIds: new Set(),
  contraindications: [],
  loaded: false,

  initialize: () => {
    if (get().loaded) return;
    set({ medications: load(), deletedIds: loadDeleted(), loaded: true });
  },

  addMedication: (med) => {
    const deletedIds = new Set(get().deletedIds);
    deletedIds.delete(med.id);
    const next = [...get().medications.filter((item) => item.id !== med.id), med];
    save(next, deletedIds);
    set({ medications: next, deletedIds });
  },

  updateMedication: (id, patch) => {
    const next = get().medications.map(m => m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m);
    save(next);
    set({ medications: next });
  },

  deleteMedication: (id) => {
    const next = get().medications.filter(m => m.id !== id);
    const deletedIds = new Set(get().deletedIds).add(id);
    save(next, deletedIds);
    set({ medications: next, deletedIds });
  },

  setMedicationsFromSync: (medications, deletedIds) => {
    save(medications, deletedIds);
    set({ medications, deletedIds, loaded: true });
  },

  checkContraindications: (substanceIds) => {
    // The substance DB + interaction checker are multi-MB chunks that must
    // stay out of the shell bundle (this store is imported by sync-context),
    // so the checker loads on demand from '@/lib/medication-substances' and
    // the result lands in state.contraindications. No current caller relies
    // on the previous synchronous return value.
    void import('@/lib/medication-substances').then(({ checkContraindications }) => {
      const warnings = checkContraindications(substanceIds);
      set({ contraindications: warnings });
    });
  },
}));

// ─── MEDICATION ↔ SUBSTANCE CONVERSION HELPERS ───────────────────────────────

/**
 * Prefix used to namespace medication IDs when they appear alongside
 * regular substance IDs (e.g. in the dose logger's substance selector
 * or the interaction checker). This prevents ID collisions between a
 * built-in substance named "sertraline" and a user medication whose
 * `linkedSubstanceId` happens to be "sertraline".
 */
export const MEDICATION_ID_PREFIX = 'med-';

/** Build a namespaced selector ID from a medication's UUID. */
export function toMedicationSelectorId(medId: string): string {
  return `${MEDICATION_ID_PREFIX}${medId}`;
}

/** Returns true if the given selector ID refers to a user medication. */
export function isMedicationSelectorId(id: string): boolean {
  return id.startsWith(MEDICATION_ID_PREFIX);
}

/** Extract the raw medication UUID from a namespaced selector ID. */
export function fromMedicationSelectorId(id: string): string {
  return id.slice(MEDICATION_ID_PREFIX.length);
}

/**
 * Returns the raw UserMedication behind a namespaced selector ID.
 * Useful when the caller needs the original dosage/frequency fields.
 */
export function getMedicationBySelectorId(selectorId: string): UserMedication | undefined {
  if (!isMedicationSelectorId(selectorId)) return undefined;
  const medId = fromMedicationSelectorId(selectorId);
  const state = useMedicationStore.getState();
  if (!state.loaded) state.initialize();
  return state.medications.find(m => m.id === medId);
}

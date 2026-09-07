// Substance-dependent medication helpers.
//
// These live OUTSIDE medication-store.ts on purpose: the store is part of
// the app shell (sync-context imports it), and a static substances import
// there pulled the multi-megabyte substance DB + interaction checker into
// every page's bundle. This module is only reached from route/modal chunks
// (dose logger, medications page), which load those chunks anyway.
import * as substancesIndex from '@/lib/substances/index';
import { checkInteractions } from '@/lib/interaction-checker';
import type { Substance } from '@/lib/substances/types';
import {
  useMedicationStore,
  MEDICATION_TYPE_TO_SUBSTANCE_CLASS,
  toMedicationSelectorId,
  isMedicationSelectorId,
  fromMedicationSelectorId,
  type UserMedication,
  type Contraindication,
} from '@/store/medication-store';

/**
 * Defensive resolver: prefer `getSubstanceByIdAll` (which includes the
 * medications category) when the substances submodule exposes it; fall
 * back to `getSubstanceById` for older submodule versions that don't
 * ship the medications category yet. Either way the function signature
 * is `(id: string) => Substance | undefined`.
 */
const getSubstanceByIdAll: (id: string) => Substance | undefined =
  (substancesIndex as any).getSubstanceByIdAll ?? substancesIndex.getSubstanceById;

/** Check the user's active medications against the given substance ids/names. */
export function checkContraindications(substanceIds: string[]): Contraindication[] {
  const meds = useMedicationStore.getState().medications.filter(m => m.isActive);
  const substanceNames = substanceIds
    .map(id => getSubstanceByIdAll(id)?.name.toLowerCase())
    .filter(Boolean) as string[];

  if (substanceNames.length === 0) return [];

  // Include each medication's generic name (when set) so brand-name entries
  // like "Prozac" still resolve against the substance database via
  // "fluoxetine". Previously only `m.name` was fed to the checker, so
  // brand-only medications contributed zero interaction pairs.
  const medNames = meds.flatMap(m => {
    const names = [m.name.toLowerCase()];
    if (m.genericName && m.genericName.toLowerCase() !== m.name.toLowerCase()) {
      names.push(m.genericName.toLowerCase());
    }
    return names;
  });
  const medTypeClasses = meds
    .filter(m => m.medicationType)
    .map(m => MEDICATION_TYPE_TO_SUBSTANCE_CLASS[m.medicationType!].toLowerCase());
  const allNames = [...substanceNames, ...medNames, ...medTypeClasses];
  const results = checkInteractions(allNames);

  const warnings: Contraindication[] = [];
  for (const pair of results.pairs) {
    const isMedA = medNames.includes(pair.substanceA.toLowerCase()) || medTypeClasses.includes(pair.substanceA.toLowerCase());
    const isMedB = medNames.includes(pair.substanceB.toLowerCase()) || medTypeClasses.includes(pair.substanceB.toLowerCase());

    if ((isMedA || isMedB) && pair.severity !== 'low-risk') {
      const medName = isMedA ? pair.substanceA : pair.substanceB;
      const subName = isMedA ? pair.substanceB : pair.substanceA;
      const med = meds.find(m =>
        m.name.toLowerCase() === medName.toLowerCase() ||
        m.genericName?.toLowerCase() === medName.toLowerCase() ||
        (m.medicationType && MEDICATION_TYPE_TO_SUBSTANCE_CLASS[m.medicationType].toLowerCase() === medName.toLowerCase())
      );

      if (med) {
        const subId = substanceIds.find(id =>
          getSubstanceByIdAll(id)?.name.toLowerCase() === subName.toLowerCase()
        ) || '';

        // Map to a valid Contraindication['source']. The interaction engine
        // emits either 'tripsit' or substance ids/names in `sources` — the
        // latter are NOT valid members of the union and previously slipped
        // through via an unchecked cast.
        const source: Contraindication['source'] = pair.sources.includes('tripsit')
          ? 'tripsit'
          : 'substance-data';

        warnings.push({
          medicationId: med.id,
          medicationName: med.name,
          substanceName: subName,
          substanceId: subId,
          severity: pair.severity,
          description: pair.description || pair.matchedTerms.join(', '),
          source,
        });
      }
    }
  }
  return warnings;
}

/**
 * Convert a UserMedication into a Substance-shaped object so that the
 * existing interaction-checker pipeline (which expects Substance[]) can
 * reason about it. If the medication has a `linkedSubstanceId`, we
 * inherit the linked substance's `interactions`, `class`, and
 * `routeData` so the medication behaves exactly like the underlying
 * drug for interaction purposes. Otherwise we synthesize a minimal
 * Substance using the medication's `medicationType` as the class so
 * that TripSit class-based combos (e.g. "SSRI × MDMA") still match.
 */
export function medicationToSubstance(med: UserMedication): Substance {
  const linked = med.linkedSubstanceId
    ? getSubstanceByIdAll(med.linkedSubstanceId)
    : undefined;

  if (linked) {
    // Inherit interaction data from the linked substance, but keep the
    // user-facing name/dosage from the medication so warnings read
    // "Prozac" instead of "Fluoxetine" when the user typed Prozac.
    return {
      ...linked,
      id: toMedicationSelectorId(med.id),
      name: med.name,
      commonNames: Array.from(new Set([
        med.name,
        ...(linked.commonNames || []),
        ...(med.genericName ? [med.genericName] : []),
      ])),
      aliases: Array.from(new Set([
        med.name,
        ...(linked.aliases || []),
        ...(med.genericName ? [med.genericName] : []),
      ])),
      categories: ['medications' as any, ...(linked.categories || [])],
    };
  }

  // No linked substance — synthesize a minimal Substance whose `class`
  // is the medication type (e.g. "SSRI"). TripSit combo lookups will
  // resolve this through resolveTripsitClasses(), which maps class
  // names to TripSit combo keys.
  const cls = med.medicationType
    ? MEDICATION_TYPE_TO_SUBSTANCE_CLASS[med.medicationType]
    : 'Other';

  return {
    id: toMedicationSelectorId(med.id),
    name: med.name,
    commonNames: med.genericName ? [med.genericName] : [],
    categories: ['medications'],
    class: cls,
    description: med.notes || `User medication (${med.medicationType || 'unclassified'})`,
    effects: { positive: [], neutral: [], negative: [] },
    interactions: { dangerous: [], unsafe: [], uncertain: [], crossTolerances: [] },
    harmReduction: [],
    legality: 'unknown',
    chemistry: { formula: '', molecularWeight: '', class: cls },
    history: null,
    afterEffects: '',
    riskLevel: 'none',
    aliases: med.genericName ? [med.genericName] : [],
    ...(med.route ? { routes: [med.route] } : {}),
  };
}

/**
 * Convert all (or all active) medications to Substance[] for use in
 * interaction checks. Used by the dose logger modal and the
 * interactions page.
 */
export function getMedicationsAsSubstances(opts?: { onlyActive?: boolean }): Substance[] {
  const state = useMedicationStore.getState();
  if (!state.loaded) state.initialize();
  const meds = opts?.onlyActive
    ? state.medications.filter(m => m.isActive)
    : state.medications;
  return meds.map(medicationToSubstance);
}

/**
 * Look up a single medication-derived substance by its namespaced
 * selector ID (i.e. one that starts with MEDICATION_ID_PREFIX).
 */
export function getMedicationSubstanceById(selectorId: string): Substance | undefined {
  if (!isMedicationSelectorId(selectorId)) return undefined;
  const medId = fromMedicationSelectorId(selectorId);
  const state = useMedicationStore.getState();
  if (!state.loaded) state.initialize();
  const med = state.medications.find(m => m.id === medId);
  return med ? medicationToSubstance(med) : undefined;
}

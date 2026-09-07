// The substance DB and the harm-reduction corpus are the two largest data
// chunks in the app. They're only needed when the user actually searches or
// opens the Library — not on every cold start — so the shell loads them on
// demand through this module. Route pages (Library, harm reduction, …) get
// them via their own route chunks; search surfaces (SubstanceSearch,
// CommandPalette) go through these loaders on first query.

export type SubstancesModule = typeof import('@/lib/substances/index')
export type HarmReductionModule = typeof import('@/lib/harm-reduction-data')

let substancesPromise: Promise<SubstancesModule> | null = null

export function loadSubstances(): Promise<SubstancesModule> {
  if (!substancesPromise) {
    substancesPromise = import('@/lib/substances/index')
  }
  return substancesPromise
}

let guidesPromise: Promise<HarmReductionModule> | null = null

export function loadHarmReductionGuides(): Promise<HarmReductionModule> {
  if (!guidesPromise) {
    guidesPromise = import('@/lib/harm-reduction-data')
  }
  return guidesPromise
}

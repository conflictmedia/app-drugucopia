// ─── Active Timeline view preference ────────────────────────────────────────
// Shared module for the "Cards | Combined" timeline layout preference.
//
// Used in two places:
//   - src/components/intensity-timeline-chart.tsx (the /dose-log chart itself,
//     which also has a toolbar toggle for quick in-context switching)
//   - src/components/timeline-view-settings.tsx (the Settings page card)
//
// Both stay in sync through localStorage + a window CustomEvent: writing the
// preference dispatches the event so any mounted consumer updates instantly
// without needing a reload. A `storage` listener covers cross-tab sync too.

export type TimelineViewMode = 'cards' | 'combined'

export const TIMELINE_VIEW_STORAGE_KEY = 'drugucopia:intensity-view'

export const TIMELINE_VIEW_CHANGE_EVENT = 'drugucopia:timeline-view-changed'

/** Read the persisted view mode. Defaults to 'cards' when unset or when
 *  storage is unavailable (SSR, private browsing, disabled storage). */
export function readTimelineViewPreference(): TimelineViewMode {
  if (typeof window === 'undefined') return 'cards'
  try {
    return window.localStorage.getItem(TIMELINE_VIEW_STORAGE_KEY) === 'combined'
      ? 'combined'
      : 'cards'
  } catch {
    // private-mode / blocked storage — fall back to the original layout
    return 'cards'
  }
}

/** Persist the view mode and notify all listeners (same tab + other tabs). */
export function writeTimelineViewPreference(mode: TimelineViewMode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TIMELINE_VIEW_STORAGE_KEY, mode)
  } catch {
    /* storage unavailable — the change still applies for this session */
  }
  try {
    window.dispatchEvent(
      new CustomEvent<TimelineViewMode>(TIMELINE_VIEW_CHANGE_EVENT, { detail: mode })
    )
  } catch {
    /* CustomEvent unsupported — same-tab consumers won't live-update */
  }
}

/** Subscribe to preference changes from anywhere (Settings page, another
 *  component instance, or another browser tab via the `storage` event).
 *  Returns an unsubscribe function. Safe to call during SSR. */
export function subscribeToTimelineViewChanges(
  callback: (mode: TimelineViewMode) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const onCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent<TimelineViewMode>).detail
    callback(detail === 'combined' ? 'combined' : 'cards')
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key !== TIMELINE_VIEW_STORAGE_KEY) return
    callback(e.newValue === 'combined' ? 'combined' : 'cards')
  }

  window.addEventListener(TIMELINE_VIEW_CHANGE_EVENT, onCustomEvent)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(TIMELINE_VIEW_CHANGE_EVENT, onCustomEvent)
    window.removeEventListener('storage', onStorage)
  }
}

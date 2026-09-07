'use client'

import { useSyncExternalStore } from 'react'

// One module-level 1 Hz clock shared by every countdown surface (reminder
// items, etc). Previously each reminder item ran its own setInterval —
// with several timers visible that meant several intervals and wakeups per
// second. Subscribers still re-render individually (useSyncExternalStore),
// so per-item isolation is preserved; the timer itself stops when the last
// subscriber unmounts.

const TICK_MS = 1_000

let intervalId: ReturnType<typeof setInterval> | null = null
let now = Date.now()
const listeners = new Set<() => void>()

function ensureTicking() {
  if (intervalId !== null) return
  intervalId = setInterval(() => {
    now = Date.now()
    for (const listener of listeners) listener()
  }, TICK_MS)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  ensureTicking()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

function getSnapshot() {
  return now
}

/** Current wall-clock time, re-rendering the subscriber once per second. */
export function useNowClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

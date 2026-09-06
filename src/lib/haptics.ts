/**
 * Native Android haptics wrapper using @tauri-apps/plugin-haptics
 * Falls back to no-op on non-Android platforms
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

interface HapticsModule {
  light: () => Promise<void>
  medium: () => Promise<void>
  heavy: () => Promise<void>
  selection: () => Promise<void>
  success: () => Promise<void>
  warning: () => Promise<void>
  error: () => Promise<void>
  isAvailable: () => Promise<boolean>
}

let hapticsModule: HapticsModule | null = null
let initPromise: Promise<void> | null = null

async function initHaptics(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      // Only load on client side
      if (typeof window === 'undefined') return

      // Check if Tauri is available. Tauri v2 builds run with
      // withGlobalTauri=false, so only __TAURI_INTERNALS__ exists on window —
      // the '__TAURI__' check previously used never matched and haptics were
      // permanently a no-op. (tauri-bridge.ts uses the same check.)
      const isTauri = '__TAURI_INTERNALS__' in window

      if (!isTauri) {
        // Not in Tauri - create no-op module
        hapticsModule = createNoopModule()
        return
      }

      // Dynamic import of Tauri haptics plugin.
      // NOTE: the plugin's real API is impactFeedback / notificationFeedback /
      // selectionFeedback (plus vibrate). The previously-used `haptic` export
      // does not exist, so every call threw `TypeError: Cannot read properties
      // of undefined` and haptics silently never worked on Android.
      const { impactFeedback, notificationFeedback, selectionFeedback } =
        await import('@tauri-apps/plugin-haptics')

      // Fire-and-forget: a rejected invoke (permission gap, plugin
      // unavailable mid-session) must surface as silence, never as an
      // unhandled rejection in whatever UI action triggered the buzz.
      const settle = (p: Promise<unknown>): Promise<void> =>
        p.then(() => undefined, () => undefined)

      hapticsModule = {
        light: () => settle(impactFeedback('light')),
        medium: () => settle(impactFeedback('medium')),
        heavy: () => settle(impactFeedback('heavy')),
        selection: () => settle(selectionFeedback()),
        success: () => settle(notificationFeedback('success')),
        warning: () => settle(notificationFeedback('warning')),
        error: () => settle(notificationFeedback('error')),
        isAvailable: async () => true,
      }

      // Expose to window for PullToRefresh to use
      ;(window as any).__TAURI_HAPTICS__ = hapticsModule
    } catch (error) {
      console.warn('Failed to initialize Tauri haptics:', error)
      hapticsModule = createNoopModule()
    }
  })()

  return initPromise
}

function createNoopModule(): HapticsModule {
  const noop = async () => {}
  return {
    light: noop,
    medium: noop,
    heavy: noop,
    selection: noop,
    success: noop,
    warning: noop,
    error: noop,
    isAvailable: async () => false,
  }
}

export async function getHaptics(): Promise<HapticsModule> {
  if (!hapticsModule) {
    await initHaptics()
  }
  return hapticsModule!
}

// Convenience functions
export async function hapticLight() {
  const h = await getHaptics()
  return h.light()
}

export async function hapticMedium() {
  const h = await getHaptics()
  return h.medium()
}

export async function hapticHeavy() {
  const h = await getHaptics()
  return h.heavy()
}

export async function hapticSelection() {
  const h = await getHaptics()
  return h.selection()
}

export async function hapticSuccess() {
  const h = await getHaptics()
  return h.success()
}

export async function hapticWarning() {
  const h = await getHaptics()
  return h.warning()
}

export async function hapticError() {
  const h = await getHaptics()
  return h.error()
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initHaptics()
}
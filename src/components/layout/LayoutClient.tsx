'use client'

import { AlertTriangle } from 'lucide-react'
import { useState, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { Toaster } from '@/components/ui/toaster'
import { VisualizerControls } from '@/components/visualizer-controls'
import { MilkdropBackgroundWrapper } from '@/components/milkdrop-background-wrapper'
import { SyncProvider } from '@/contexts/sync-context'
import { ReminderProvider } from '@/components/reminder-provider'
import { CommandPalette } from '@/components/command-palette'
import { OnboardingTour } from '@/components/onboarding-tour'
import { UpdateCheckPopupWrapper } from '@/components/update-check-popup-wrapper'
import { ErrorBoundary } from '@/components/error-boundary'
import { useBackClose } from '@/hooks/use-back-close'
import { useUIStore } from '@/store/ui-store'

// Keep the logger out of the shell while closed. The module is warmed during
// idle time below so the first deliberate open is normally instant.
const loadDoseLogger = () => import('@/components/dose-logger-modal').then((mod) => mod.DoseLoggerModal)
const DoseLoggerModal = dynamic(loadDoseLogger, { ssr: false, loading: () => null })

interface LayoutClientProps {
  children: ReactNode
}

const DRAWER_ID = 'app-shell-drawer'

export function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('drugucopia-sidebar-expanded') === 'true'
  })
  // Subscribe to individual UI store slices instead of the whole store.
  // Previously `useUIStore()` (no selector) returned the entire store object,
  // so toggling a favorite (an unrelated slice) would re-render the entire
  // layout shell — including AppSidebar, TopBar, BottomNav, MilkdropBackground
  // wrapper, and the page content children — even though nothing in the shell
  // actually depends on `favoriteSubstances`.
  const doseLoggerOpen = useUIStore((s) => s.doseLoggerOpen)
  const doseLoggerPreselect = useUIStore((s) => s.doseLoggerPreselect)
  const closeDoseLogger = useUIStore((s) => s.closeDoseLogger)
  const showOnboardingTour = useUIStore((s) => s.showOnboardingTour)
  const setOnboardingCompleted = useUIStore((s) => s.setOnboardingCompleted)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Warm the chunk without mounting its large form, effects, or store
  // subscriptions. requestIdleCallback is unavailable in some WebViews.
  useEffect(() => {
    const warm = () => { void loadDoseLogger() }
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(warm, { timeout: 2500 })
      return () => idleWindow.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(warm, 1200)
    return () => window.clearTimeout(id)
  }, [])

  // Onboarding tour: auto-open on first visit (when the localStorage
  // flag `drugucopia-tour-complete` is unset). Re-triggerable via the
  // `showOnboardingTour()` store action (Ctrl+Shift+O shortcut below),
  // which sets `showOnboarding` directly inside its keydown handler.
  useEffect(() => {
    try {
      const done = window.localStorage.getItem('drugucopia-tour-complete') === 'true'
      setOnboardingCompleted(done)
      if (!done) {
        const t = window.setTimeout(() => setShowOnboarding(true), 1200)
        return () => window.clearTimeout(t)
      }
    } catch {
      /* ignore */
    }
  }, [setOnboardingCompleted])

  // Ctrl+Shift+O keyboard shortcut to re-open the onboarding tour.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault()
        showOnboardingTour()
        setShowOnboarding(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showOnboardingTour])

  useEffect(() => {
    // matchMedia fires only when the breakpoint is crossed — a resize
    // listener re-rendered the whole shell on every pixel of rotation.
    const mq = window.matchMedia('(max-width: 767px)')
    const checkMobile = () => setIsMobile(mq.matches)
    checkMobile()
    mq.addEventListener('change', checkMobile)
    return () => mq.removeEventListener('change', checkMobile)
  }, [])

  // ── Soft-keyboard height → --kb-height CSS variable ──
  // With enableEdgeToEdge the Android WebView does not resize for the
  // keyboard, so fixed bottom-anchored surfaces (bottom sheets, modal
  // footers) would sit underneath it. visualViewport.height shrinks by
  // exactly the occluded height in that mode. When the window DOES resize
  // (adjustResize), innerHeight shrinks with it and the measured gap is 0 —
  // so surfaces never double-compensate, whichever mode the device uses.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height)
      document.documentElement.style.setProperty('--kb-height', `${Math.round(kb)}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.setProperty('--kb-height', '0px')
    }
  }, [])

  // ── Android back button: close drawer / dose logger / onboarding tour ──
  // Each surface pushes its own history entry when opened (useBackClose),
  // so back dismisses topmost-first and closing via the UI pops the entry
  // instead of leaving stale ones that swallow later back presses.
  useBackClose(drawerOpen, () => setDrawerOpen(false))
  useBackClose(doseLoggerOpen, closeDoseLogger)
  useBackClose(showOnboarding, () => {
    setShowOnboarding(false)
    setOnboardingCompleted(true)
  })

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-transparent">
        <div className="flex h-[100dvh] items-center justify-center">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    )
  }

  const toggleSidebar = () => {
    const next = !sidebarExpanded
    setSidebarExpanded(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('drugucopia-sidebar-expanded', String(next))
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  return (
    <SyncProvider>
      <ReminderProvider>
        <div className="h-[100dvh] overflow-hidden bg-transparent">
          <MilkdropBackgroundWrapper />

          {isMobile ? (
            <div className="drawer h-[100dvh] overflow-hidden">
              <input
                id={DRAWER_ID}
                type="checkbox"
                className="drawer-toggle"
                checked={drawerOpen}
                onChange={(event) => setDrawerOpen(event.target.checked)}
              />

              <div className="drawer-content flex min-h-[100dvh] flex-col">
                <TopBar
                  onMenuClick={() => setDrawerOpen(true)}
                />

                <main className="relative flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+64px)]">
                  {/* Keyed by pathname: an error in one page shows the
                      fallback, and simply navigating away remounts a fresh
                      boundary instead of being stuck in the error state. */}
                  <ErrorBoundary key={pathname} name="Page">
                    {children}
                  </ErrorBoundary>
                </main>

                <BottomNav onMoreClick={() => setDrawerOpen(true)} />
              </div>

              <div className="drawer-side z-40 pb-[calc(env(safe-area-inset-bottom,0px)+64px)]">
                {/* Click overlay closes drawer — using a div instead of
                    a <label> so we have full control and can also prevent
                    the click from toggling the checkbox unexpectedly */}
                <div
                  aria-label="close navigation"
                  className="drawer-overlay"
                  onClick={closeDrawer}
                  onKeyDown={(e) => { if (e.key === 'Escape') closeDrawer() }}
                  role="button"
                  tabIndex={-1}
                />
                <AppSidebar
                  expanded
                  onNavigate={closeDrawer}
                  onToggle={toggleSidebar}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[100dvh]">
              <AppSidebar
                expanded={sidebarExpanded}
                onNavigate={() => { }} // no-op for desktop, but keeps prop consistent
                onToggle={toggleSidebar}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <TopBar
                  onMenuClick={() => setDrawerOpen(true)}
                />
                <main className="relative flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
                  <ErrorBoundary key={pathname} name="Page">
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </div>
          )}

          {!isMobile && (
            <div
              className={[
                'pointer-events-none fixed bottom-0 right-0 z-30 hidden border-t border-warning/20 bg-base-100/95 backdrop-blur-sm md:block',
                sidebarExpanded ? 'left-60' : 'left-16',
              ].join(' ')}
            >
              <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs text-warning">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Educational and harm reduction purposes only. Always consult medical professionals.</span>
              </div>
            </div>
          )}

          {doseLoggerOpen && (
            <DoseLoggerModal
              open
              onOpenChange={(open) => !open && closeDoseLogger()}
              preselectedSubstanceId={doseLoggerPreselect?.substanceId}
              preselectedSubstanceName={doseLoggerPreselect?.substanceName}
              preselectedCategory={doseLoggerPreselect?.category}
              preselectedRoute={doseLoggerPreselect?.route}
            />
          )}
          <CommandPalette />
          {!isMobile && <VisualizerControls />}
          <Toaster />
          <OnboardingTour
            isOpen={showOnboarding}
            onClose={() => {
              setShowOnboarding(false)
              setOnboardingCompleted(true)
            }}
          />
          <UpdateCheckPopupWrapper />
        </div>
      </ReminderProvider>
    </SyncProvider>
  )
}

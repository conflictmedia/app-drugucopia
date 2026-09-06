'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Activity, ExternalLink, Info, Layers } from 'lucide-react'
import {
  readTimelineViewPreference,
  writeTimelineViewPreference,
  subscribeToTimelineViewChanges,
  type TimelineViewMode,
} from '@/lib/timeline-view-preference'

// ─── Settings card: default Active Timeline layout ──────────────────────────
// Lets the user pick how the /dose-log → Active Session section renders:
//   - Cards:    one chart card per substance (original layout)
//   - Combined: every active substance's intensity curve overlaid on ONE
//               shared timeline
//
// The preference is shared with the chart itself via
// src/lib/timeline-view-preference.ts, so this card updates when the user
// flips the in-chart toolbar toggle (and vice versa) without a reload.
export function TimelineViewSettings() {
  const [viewMode, setViewMode] = useState<TimelineViewMode>(() =>
    readTimelineViewPreference()
  )

  // Keep this card in sync with the toolbar toggle on /dose-log
  // (same-tab CustomEvent) and other browser tabs (storage event).
  useEffect(
    () => subscribeToTimelineViewChanges(mode => setViewMode(mode)),
    []
  )

  const options: Array<{
    mode: TimelineViewMode
    label: string
    icon: typeof Layers
    title: string
    description: string
  }> = [
    {
      mode: 'cards',
      label: 'Cards',
      icon: Layers,
      title: 'One chart card per substance',
      description:
        'Each active substance gets its own timeline card with per-route and per-dose curves',
    },
    {
      mode: 'combined',
      label: 'Combined',
      icon: Activity,
      title: 'All active substances on one shared timeline',
      description:
        'Every substance’s intensity curve is overlaid on a single time axis so you can compare them side by side',
    },
  ]

  return (
    <Card className="py-3 gap-2">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Active Timeline Layout
        </CardTitle>
        <CardDescription>
          How intensity graphs are shown while doses are active
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Cards | Combined selector ── */}
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Default timeline layout"
        >
          {options.map(opt => {
            const selected = viewMode === opt.mode
            const Icon = opt.icon
            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setViewMode(opt.mode)
                  // Persist + notify the chart on /dose-log (and other tabs).
                  writeTimelineViewPreference(opt.mode)
                }}
                aria-pressed={selected}
                title={opt.title}
                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-base-300/80 hover:bg-base-200/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={`h-4 w-4 ${selected ? 'text-primary' : 'text-neutral-content'}`}
                  />
                  <span
                    className={`text-sm font-semibold ${selected ? 'text-primary' : ''}`}
                  >
                    {opt.label}
                  </span>
                </span>
                <span className="text-xs text-neutral-content leading-snug">
                  {opt.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Where to find it ── */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-base-200/50">
          <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
          <div className="text-xs text-base-content/80 space-y-1">
            <p className="flex items-center flex-wrap gap-x-1 gap-y-0.5">
              Applies to <strong>Dose Log</strong> →{' '}
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Active Session
              </span>{' '}
              — takes effect immediately.
            </p>
            <p className="text-neutral-content/70">
              You can still switch layouts at any time with the{' '}
              <strong>Cards | Combined</strong> toggle above the charts; this only
              controls which one you start with.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

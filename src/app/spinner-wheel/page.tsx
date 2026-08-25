'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { useDoseStore } from '@/store/dose-store'
import { SpinnerWheel } from '@/components/spinner-wheel/SpinnerWheel'
import { buildWheelSegments, type WheelSegment } from '@/lib/spinner-wheel'
import { categoryDotColors } from '@/components/home/home-constants'
import type { SubstanceCategory } from '@/lib/substances/index'
import { cn } from '@/lib/utils'

/**
 * Spinner Wheel — randomly selects a substance from the user's most
 * frequently used substances (their dose history). With no history the
 * wheel falls back to a curated list of commonly used substances.
 */
export default function SpinnerWheelPage() {
  // Same initialization pattern as the calculators: the dose store lazily
  // hydrates from localStorage on first mount.
  useEffect(() => {
    useDoseStore.getState().initialize()
  }, [])

  const doses = useDoseStore((state) => state.doses)
  const isLoaded = useDoseStore((state) => state.isLoaded)

  const { segments, source } = useMemo(() => buildWheelSegments(doses), [doses])

  const dotClass = (category: string) =>
    categoryDotColors[category as SubstanceCategory] ?? 'bg-zinc-500'

  return (
    <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-10">
      {/* ── Header ── */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold lg:text-4xl">Spinner Wheel</h1>
        <p className="mt-2 text-base-content/70">
          Can&apos;t decide? Let the wheel pick for you. It&apos;s loaded with the
          substances you log most often — every spin is a fair random draw.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* ── Wheel column ── */}
        <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
          {isLoaded ? (
            <SpinnerWheel segments={segments} />
          ) : (
            <div
              className="flex aspect-square w-full max-w-[420px] items-center justify-center"
              role="status"
            >
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
        </div>

        {/* ── Sidebar: what's on the wheel ── */}
        <aside className="space-y-4">
          {source === 'fallback' && (
            <div role="alert" className="alert alert-info items-start text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">No dose history yet</p>
                <p className="mt-1 text-base-content/70">
                  The wheel is loaded with commonly used substances. Log doses in{' '}
                  <Link href="/dose-log" className="link link-primary">
                    Track
                  </Link>{' '}
                  to personalize it with what you actually use.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-content">
              On the wheel
            </h2>
            <p className="mb-3 text-xs text-base-content/60">
              {source === 'history'
                ? 'Ranked by how often you log each substance.'
                : 'Commonly used substances — log doses to personalize the wheel.'}
            </p>
            {isLoaded ? (
              <ul className="space-y-1.5">
                {segments.map((segment: WheelSegment, index: number) => (
                  <li
                    key={`${segment.substanceId ?? segment.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-base-200"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'h-2.5 w-2.5 shrink-0 rounded-full',
                          dotClass(segment.category),
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-medium">{segment.name}</span>
                    </span>
                    {segment.fromHistory ? (
                      <span className="shrink-0 badge badge-sm badge-ghost">
                        ×{segment.count}
                      </span>
                    ) : (
                      <span className="shrink-0 badge badge-sm badge-ghost">common</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center py-6" role="status">
                <span className="loading loading-spinner text-primary" />
              </div>
            )}
          </div>

          <p className="px-2 text-xs leading-relaxed text-base-content/50">
            The spinner draws uniformly at random — it doesn&apos;t weight slices by
            usage. It&apos;s a fun decision aid, not medical guidance; whatever the
            wheel lands on, the usual harm-reduction rules still apply.
          </p>
        </aside>
      </div>
    </div>
  )
}

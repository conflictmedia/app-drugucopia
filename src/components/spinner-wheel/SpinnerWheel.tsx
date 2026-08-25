'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, RotateCcw, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { hapticSelection, hapticSuccess } from '@/lib/haptics'
import {
  type WheelSegment,
  computeSpinRotation,
  getIndexAtRotation,
  pickWinnerIndex,
  truncateLabel,
} from '@/lib/spinner-wheel'

// ─── Geometry ────────────────────────────────────────────────────────────────

const VIEW = 420
const CENTER = VIEW / 2
const WHEEL_RADIUS = 196
const LABEL_RADIUS = WHEEL_RADIUS * 0.62
const HUB_RADIUS = 56

const SPIN_DURATION_MS = 4600
const SPIN_EASING = 'cubic-bezier(0.12, 0.8, 0.16, 1)'

/** Point on the circle for an angle measured clockwise from 12 o'clock. */
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) }
}

/** SVG path for one pie sector between two clockwise angles. */
function sectorPath(startAngle: number, endAngle: number, radius: number): string {
  const start = polar(startAngle, radius)
  const end = polar(endAngle, radius)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`
}

// ─── Sector colors ───────────────────────────────────────────────────────────
// Solid Tailwind palette hexes matching the app's per-category accents
// (see categoryDotColors in home-constants.ts). When neighbouring slices
// share the same category, the 600 shade (`alt`) alternates with the base
// fill; the 400 shade (`light`) breaks odd wrap-around collisions. White
// labels stay readable on all of these mid tones.

const CATEGORY_FILLS: Record<string, { fill: string; alt: string; light: string }> = {
  stimulants: { fill: '#f59e0b', alt: '#d97706', light: '#fbbf24' },
  depressants: { fill: '#6366f1', alt: '#4f46e5', light: '#818cf8' },
  hallucinogens: { fill: '#a855f7', alt: '#9333ea', light: '#c084fc' },
  dissociatives: { fill: '#06b6d4', alt: '#0891b2', light: '#22d3ee' },
  empathogens: { fill: '#ec4899', alt: '#db2777', light: '#f472b6' },
  cannabinoids: { fill: '#22c55e', alt: '#16a34a', light: '#4ade80' },
  opioids: { fill: '#ef4444', alt: '#dc2626', light: '#f87171' },
  deliriants: { fill: '#64748b', alt: '#475569', light: '#94a3b8' },
  nootropics: { fill: '#14b8a6', alt: '#0d9488', light: '#2dd4bf' },
  medications: { fill: '#3b82f6', alt: '#2563eb', light: '#60a5fa' },
  other: { fill: '#71717a', alt: '#52525b', light: '#a1a1aa' },
}
const DEFAULT_FILL = { fill: '#71717a', alt: '#52525b', light: '#a1a1aa' }

// ─── Tick sound (WebAudio, no assets needed) ─────────────────────────────────

let audioContext: AudioContext | null = null

function playTick() {
  try {
    if (typeof window === 'undefined') return
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    if (!audioContext) audioContext = new Ctx()
    if (audioContext.state === 'suspended') void audioContext.resume()
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.type = 'square'
    osc.frequency.value = 1150
    gain.gain.setValueAtTime(0.03, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.start()
    osc.stop(audioContext.currentTime + 0.06)
  } catch {
    // Audio is a nicety — never let it break the spin.
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SpinnerWheelProps {
  /** Ordered segments; index 0 starts at the top spoke and fills clockwise. */
  segments: WheelSegment[]
  /** Optional analytics hooks. */
  onSpinStart?: () => void
  onSpinEnd?: (winner: WheelSegment) => void
}

type Phase = 'idle' | 'spinning' | 'result'

export function SpinnerWheel({ segments, onSpinStart, onSpinEnd }: SpinnerWheelProps) {
  const router = useRouter()
  const wheelRef = useRef<SVGGElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [winner, setWinner] = useState<WheelSegment | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const segmentCount = segments.length
  const spinDuration = prefersReducedMotion ? 700 : SPIN_DURATION_MS

  // Respect prefers-reduced-motion: shorten the animation drastically and
  // skip per-tick feedback so the spin stays comfortable to watch.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Clean up the rAF tick loop + fallback timer on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    }
  }, [])

  const finishSpin = useCallback(
    (finalWinner: WheelSegment) => {
      setPhase('result')
      setWinner(finalWinner)
      onSpinEnd?.(finalWinner)
      void hapticSuccess()
    },
    [onSpinEnd],
  )

  // rAF loop: watch the animated rotation so each sector passing the pointer
  // fires a tick sound + selection haptic — the classic wheel-of-fortune feel.
  const startTickLoop = useCallback(
    (segmentTotal: number) => {
      if (typeof window === 'undefined' || prefersReducedMotion || segmentTotal <= 1) return
      const el = wheelRef.current
      if (!el || typeof getComputedStyle !== 'function') return
      let lastIndex = -1
      const loop = () => {
        try {
          const transform = getComputedStyle(el).transform
          if (transform && transform !== 'none') {
            const matrix = new DOMMatrixReadOnly(transform)
            const deg = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
            const index = getIndexAtRotation(deg, segmentTotal)
            if (index !== lastIndex) {
              lastIndex = index
              playTick()
              void hapticSelection()
            }
          }
        } catch {
          // Ignore transform parsing issues — animation still completes.
        }
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    },
    [prefersReducedMotion],
  )

  const stopTickLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || segmentCount === 0) return
    const index = pickWinnerIndex(segmentCount)
    const target = computeSpinRotation(rotation, index, segmentCount)
    const nextWinner = segments[index] ?? null

    setWinner(null)
    setPhase('spinning')
    onSpinStart?.()
    setRotation(target)

    if (nextWinner) {
      startTickLoop(segmentCount)
      // transitionend is the primary signal; the timer is a safety net for
      // environments where the transition event never fires (e.g. the tab
      // was backgrounded mid-spin).
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = setTimeout(() => {
        stopTickLoop()
        finishSpin(nextWinner)
      }, spinDuration + 400)
    }
  }, [
    phase,
    segmentCount,
    rotation,
    segments,
    onSpinStart,
    startTickLoop,
    stopTickLoop,
    finishSpin,
    spinDuration,
  ])

  const handleTransitionEnd = useCallback(
    (event: React.TransitionEvent<SVGGElement>) => {
      if (event.propertyName !== 'transform' || phase !== 'spinning') return
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
      stopTickLoop()
      // Derive the winner straight from the final rotation — guaranteed to
      // agree with the index we spun to, and robust against tiny float drift.
      const index = getIndexAtRotation(rotation, segmentCount)
      const finalWinner = segments[index] ?? null
      if (finalWinner) {
        finishSpin(finalWinner)
      } else {
        setPhase('idle')
      }
    },
    [phase, rotation, segmentCount, segments, stopTickLoop, finishSpin],
  )

  const viewSubstance = useCallback(
    (segment: WheelSegment) => {
      if (!segment.substanceId) return
      router.push(`/?substance=${encodeURIComponent(segment.substanceId)}`)
    },
    [router],
  )

  // ─── Wheel geometry (memoized) ─────────────────────────────────────────────

  const sectorAngle = segmentCount > 0 ? 360 / segmentCount : 360

  const sectors = useMemo(() => {
    // Pre-pass — pick each slice's fill so same-category neighbours alternate
    // (fill → alt → fill …) instead of blending into one another.
    const fills: string[] = []
    let lastUsedFill: string | null = null
    for (const segment of segments) {
      const palette = CATEGORY_FILLS[segment.category] ?? DEFAULT_FILL
      const fill =
        segmentCount > 1 && palette.fill === lastUsedFill ? palette.alt : palette.fill
      fills.push(fill)
      lastUsedFill = fill
    }
    // Wrap-around: the last slice is also adjacent to the first across the
    // 12 o'clock boundary. If it would blend into slice 0, fall back to the
    // lighter shade — guaranteed distinct from both of its neighbours,
    // which covers odd runs like [stim, other, stim, stim].
    if (fills.length > 2 && fills[fills.length - 1] === fills[0]) {
      const lastPalette =
        CATEGORY_FILLS[segments[segments.length - 1].category] ?? DEFAULT_FILL
      fills[fills.length - 1] = lastPalette.light
    }

    return segments.map((segment, index) => {
      const start = index * sectorAngle
      const end = start + sectorAngle
      const mid = start + sectorAngle / 2
      const anchor = polar(mid, LABEL_RADIUS)
      return {
        key: `${segment.substanceId ?? segment.name}-${index}`,
        path: sectorPath(start, end, WHEEL_RADIUS),
        isCircle: segmentCount === 1,
        fill: fills[index],
        label: truncateLabel(segment.name, 14),
        anchor,
        // Radial labels: rotate so the baseline runs from the hub outward
        // (reads outward at every angle, wheel-of-names style).
        labelRotation: mid - 90,
      }
    })
  }, [segments, sectorAngle, segmentCount])

  const fontSize = segmentCount <= 8 ? 17 : segmentCount <= 12 ? 14 : 12

  const canSpin = segmentCount > 0 && phase !== 'spinning'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ── The wheel ── */}
      <div className="relative mx-auto aspect-square w-full max-w-[420px] select-none">
        {/* Pointer — sits above the wheel and never rotates. */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
          aria-hidden="true"
        >
          <svg width="34" height="42" viewBox="0 0 34 42">
            <path
              d="M17 40 L4 8 Q17 -2 30 8 Z"
              className="fill-primary stroke-base-100"
              strokeWidth={3}
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="h-full w-full drop-shadow-xl"
          role="img"
          aria-label={
            segmentCount > 0
              ? `Spinner wheel with ${segmentCount} substances`
              : 'Empty spinner wheel'
          }
        >
          {/* Outer rim */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={WHEEL_RADIUS + 10}
            className="fill-base-200 stroke-base-300"
            strokeWidth={4}
          />

          {/* Rotating wheel body */}
          <g
            ref={wheelRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CENTER}px ${CENTER}px`,
              transition: `transform ${spinDuration}ms ${SPIN_EASING}`,
              willChange: 'transform',
            }}
          >
            {sectors.map((sector) =>
              sector.isCircle ? (
                <circle
                  key={sector.key}
                  cx={CENTER}
                  cy={CENTER}
                  r={WHEEL_RADIUS}
                  fill={sector.fill}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={2}
                />
              ) : (
                <path
                  key={sector.key}
                  d={sector.path}
                  fill={sector.fill}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={2}
                />
              ),
            )}

            {/* Radial labels */}
            {sectors.map((sector) => (
              <text
                key={`label-${sector.key}`}
                x={sector.anchor.x}
                y={sector.anchor.y}
                transform={`rotate(${sector.labelRotation} ${sector.anchor.x} ${sector.anchor.y})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight={700}
                fill="#ffffff"
                stroke="rgba(0,0,0,0.28)"
                strokeWidth={0.8}
                paintOrder="stroke"
                style={{ letterSpacing: '0.02em' }}
              >
                {sector.label}
              </text>
            ))}

            {/* Pegs at the sector boundaries on the rim */}
            {segmentCount > 1 &&
              segments.map((segment, index) => {
                const p = polar(index * sectorAngle, WHEEL_RADIUS - 10)
                return (
                  <circle
                    key={`peg-${segment.substanceId ?? segment.name}-${index}`}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill="rgba(255,255,255,0.75)"
                  />
                )
              })}
          </g>

          {/* Static hub plate under the SPIN button */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={HUB_RADIUS + 6}
            className="fill-base-100 stroke-base-300"
            strokeWidth={3}
          />
        </svg>

        {/* SPIN button — HTML overlay for a comfortable tap target */}
        <button
          type="button"
          disabled={!canSpin}
          onClick={handleSpin}
          aria-label="Spin the wheel"
          className={cn(
            'absolute left-1/2 top-1/2 z-10 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border-4 border-base-100 bg-primary text-primary-content shadow-lg transition-transform active:scale-95',
            !canSpin && 'opacity-80',
          )}
        >
          <Dices className="h-6 w-6" aria-hidden="true" />
          <span className="text-sm font-extrabold tracking-widest">
            {phase === 'spinning' ? '···' : 'SPIN'}
          </span>
        </button>
      </div>

      {/* Screen-reader announcement of the result */}
      <div aria-live="polite" className="sr-only">
        {phase === 'result' && winner
          ? `The wheel selected ${winner.name}`
          : phase === 'spinning'
            ? 'Spinning the wheel'
            : ''}
      </div>

      {/* ── Result card ── */}
      <AnimatePresence mode="wait">
        {phase === 'result' && winner && (
          <motion.div
            key={winner.name}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-md"
          >
            <div className="rounded-box border border-base-300 bg-base-100 p-5 text-center shadow-md">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-content">
                The wheel chose
              </p>
              <h3 className="mt-1 text-2xl font-bold text-base-content">{winner.name}</h3>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {winner.category.replace(/-/g, ' ')}
                </Badge>
                {winner.fromHistory ? (
                  <Badge variant="secondary">
                    logged {winner.count} {winner.count === 1 ? 'time' : 'times'}
                  </Badge>
                ) : (
                  <Badge variant="outline">common pick</Badge>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {winner.substanceId && (
                  <Button size="sm" onClick={() => viewSubstance(winner)}>
                    View substance
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleSpin} disabled={!canSpin}>
                  <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
                  Spin again
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

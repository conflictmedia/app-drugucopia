// ─────────────────────────────────────────────────────────────────────────────
// Spinner Wheel — unit tests for the pure logic module
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  buildWheelSegments,
  computeSpinRotation,
  getFallbackSegments,
  getFrequentlyUsedSubstances,
  getIndexAtRotation,
  mod,
  normalizeSubstanceName,
  pickWinnerIndex,
  truncateLabel,
} from './spinner-wheel'
import type { Substance } from '@/lib/substances'
import type { DoseLog } from '@/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

let seq = 0
function dose(
  name: string,
  opts: { id?: string; cats?: string[]; ts?: string } = {},
): DoseLog {
  return {
    id: `dose-${seq++}`,
    substanceId: opts.id,
    substanceName: name,
    categories: opts.cats ?? [],
    amount: 1,
    unit: 'mg',
    route: 'oral',
    timestamp: opts.ts ?? '2026-01-01T00:00:00.000Z',
    duration: null,
    notes: null,
    mood: null,
    setting: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function sub(id: string, name: string, categories: string[]): Substance {
  return {
    id,
    name,
    commonNames: [],
    categories,
    class: '',
    description: '',
    effects: { positive: [], neutral: [], negative: [] },
    interactions: {
      dangerous: [],
      unsafe: [],
      uncertain: [],
      crossTolerances: [],
    },
    harmReduction: [],
    legality: '',
    chemistry: { formula: '', molecularWeight: '', class: '' },
    history: null,
    afterEffects: '',
    riskLevel: 'low',
  } as Substance
}

const LIBRARY: Substance[] = [
  sub('cannabis', 'Cannabis', ['cannabinoids']),
  sub('alcohol', 'Alcohol', ['depressants']),
  sub('caffeine', 'Caffeine', ['stimulants']),
  sub('nicotine', 'Nicotine', ['depressants']),
  sub('mdma', 'MDMA', ['empathogens']),
  sub('lsd', 'LSD', ['hallucinogens']),
  sub('psilocybin-mushrooms', 'Psilocybin mushrooms', ['hallucinogens']),
  sub('ketamine', 'Ketamine', ['dissociatives']),
  sub('custom-1', 'Homebrew Blend', ['other']),
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe('mod', () => {
  it('returns positive values for negative inputs', () => {
    expect(mod(-30, 360)).toBe(330)
    expect(mod(-360, 360)).toBe(0)
    expect(mod(-720, 360)).toBe(0)
  })

  it('wraps values larger than the modulus', () => {
    expect(mod(390, 360)).toBe(30)
    expect(mod(1080, 360)).toBe(0)
  })
})

describe('normalizeSubstanceName', () => {
  it('lowercases and folds dashes to spaces', () => {
    expect(normalizeSubstanceName('Psilocybin-Mushrooms')).toBe('psilocybin mushrooms')
    expect(normalizeSubstanceName('  4-ACO-DMT ')).toBe('4 aco dmt')
  })

  it('collapses repeated whitespace and underscores', () => {
    expect(normalizeSubstanceName('ethyl   alcohol')).toBe('ethyl alcohol')
    expect(normalizeSubstanceName('home_brew')).toBe('home brew')
  })
})

describe('getFrequentlyUsedSubstances', () => {
  it('counts and ranks substances by usage', () => {
    const doses = [
      dose('Cannabis'),
      dose('Cannabis'),
      dose('Alcohol'),
      dose('Cannabis'),
      dose('Alcohol'),
      dose('LSD'),
    ]
    const result = getFrequentlyUsedSubstances(doses)
    expect(result.map((s) => s.name)).toEqual(['Cannabis', 'Alcohol', 'LSD'])
    expect(result[0].count).toBe(3)
    expect(result[0].fromHistory).toBe(true)
  })

  it('merges case and dash variants of the same substance', () => {
    const doses = [
      dose('Psilocybin mushrooms'),
      dose('psilocybin-mushrooms'),
      dose('PSILOCYBIN MUSHROOMS'),
    ]
    const result = getFrequentlyUsedSubstances(doses)
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(3)
  })

  it('breaks count ties by most recent use', () => {
    const doses = [
      dose('Alcohol', { ts: '2026-01-01T00:00:00.000Z' }),
      dose('Cannabis', { ts: '2026-05-01T00:00:00.000Z' }),
      dose('Alcohol', { ts: '2026-02-01T00:00:00.000Z' }),
      dose('Cannabis', { ts: '2026-06-01T00:00:00.000Z' }),
    ]
    // Both have count 2 → Cannabis wins: its most recent dose is newer.
    const result = getFrequentlyUsedSubstances(doses)
    expect(result[0].name).toBe('Cannabis')
  })

  it('respects the limit', () => {
    const doses = [1, 2, 3, 4, 5].map((n) => dose(`Substance ${n}`))
    expect(getFrequentlyUsedSubstances(doses, 3)).toHaveLength(3)
    expect(getFrequentlyUsedSubstances(doses, 0)).toHaveLength(0)
  })

  it('skips doses without a substance name', () => {
    const doses = [dose(''), dose('   '), dose('Cannabis')]
    const result = getFrequentlyUsedSubstances(doses)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Cannabis')
  })

  it('keeps substances that are not in the library', () => {
    const result = getFrequentlyUsedSubstances([dose('Mystery Drug')])
    expect(result).toHaveLength(1)
    expect(result[0].substanceId).toBeNull()
    expect(result[0].category).toBe('other')
  })
})

describe('buildWheelSegments', () => {
  it('falls back to common substances when there is no history', () => {
    const { segments, source } = buildWheelSegments([], { allSubstances: LIBRARY })
    expect(source).toBe('fallback')
    expect(segments.length).toBeGreaterThan(0)
    expect(segments.length).toBeLessThanOrEqual(8)
    for (const segment of segments) {
      expect(segment.fromHistory).toBe(false)
      expect(segment.count).toBe(0)
      expect(segment.substanceId).not.toBeNull()
    }
    // Curated order is preserved: cannabis first.
    expect(segments[0].name).toBe('Cannabis')
  })

  it('uses only history when there is any at all', () => {
    const doses = ['Cannabis', 'Cannabis', 'Alcohol', 'Caffeine'].map((name) =>
      dose(name, { id: name.toLowerCase() }),
    )
    const { segments, source } = buildWheelSegments(doses, { allSubstances: LIBRARY })
    expect(source).toBe('history')
    expect(segments.map((s) => s.name)).toEqual(['Cannabis', 'Alcohol', 'Caffeine'])
  })

  it('enriches history entries with library metadata', () => {
    // Logged by name only (no substanceId), with a sloppy category on the dose.
    const doses = [dose('psilocybin mushrooms'), dose('psilocybin mushrooms')]
    const { segments } = buildWheelSegments(doses, { allSubstances: LIBRARY })
    expect(segments).toHaveLength(1)
    expect(segments[0].substanceId).toBe('psilocybin-mushrooms')
    expect(segments[0].name).toBe('Psilocybin mushrooms')
    expect(segments[0].category).toBe('hallucinogens')
    expect(segments[0].count).toBe(2)
  })

  it('keeps a short history honest — no padding with unused substances', () => {
    const doses = [dose('Cannabis'), dose('Cannabis')]
    const { segments, source } = buildWheelSegments(doses, { allSubstances: LIBRARY })
    expect(source).toBe('history')
    expect(segments).toHaveLength(1)
    expect(segments[0]).toMatchObject({ name: 'Cannabis', count: 2, fromHistory: true })
  })

  it('matches custom substances from the injected library', () => {
    const doses = [dose('Homebrew Blend'), dose('Homebrew Blend')]
    const { segments } = buildWheelSegments(doses, { allSubstances: LIBRARY })
    expect(segments[0]).toMatchObject({
      substanceId: 'custom-1',
      category: 'other',
    })
  })

  it('honours a custom limit', () => {
    const doses = [1, 2, 3, 4, 5].map((n) => dose(`Substance ${n}`))
    const { segments } = buildWheelSegments(doses, {
      allSubstances: LIBRARY,
      limit: 4,
    })
    expect(segments).toHaveLength(4)
  })
})

describe('getFallbackSegments', () => {
  it('skips ids missing from the library', () => {
    const tinyLibrary = [sub('cannabis', 'Cannabis', ['cannabinoids'])]
    const segments = getFallbackSegments(tinyLibrary, 8)
    expect(segments).toHaveLength(1)
    expect(segments[0].name).toBe('Cannabis')
  })

  it('never exceeds the limit', () => {
    expect(getFallbackSegments(LIBRARY, 3)).toHaveLength(3)
    expect(getFallbackSegments(LIBRARY, 0)).toHaveLength(0)
  })
})

describe('pickWinnerIndex', () => {
  it('returns -1 when there are no segments', () => {
    expect(pickWinnerIndex(0)).toBe(-1)
  })

  it('stays in range', () => {
    for (let i = 0; i < 500; i++) {
      const index = pickWinnerIndex(8)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(8)
      expect(Number.isInteger(index)).toBe(true)
    }
  })

  it('uses the injected RNG deterministically', () => {
    expect(pickWinnerIndex(8, () => 0.5)).toBe(4)
    expect(pickWinnerIndex(8, () => 0.999)).toBe(7)
    expect(pickWinnerIndex(8, () => 0)).toBe(0)
  })
})

describe('getIndexAtRotation', () => {
  it('returns -1 for an empty wheel', () => {
    expect(getIndexAtRotation(0, 0)).toBe(-1)
  })

  it('reads the top sector at zero rotation', () => {
    expect(getIndexAtRotation(0, 4)).toBe(0)
  })

  it('wraps around after a full turn', () => {
    expect(getIndexAtRotation(360, 4)).toBe(0)
    expect(getIndexAtRotation(720, 4)).toBe(0)
  })

  it('advances backwards through sectors as the wheel turns clockwise', () => {
    // 4 sectors of 90°: rotating clockwise by 45° brings sector 3 under the
    // top pointer (sector 0 now covers screen angles 45°–135°).
    expect(getIndexAtRotation(45, 4)).toBe(3)
    expect(getIndexAtRotation(135, 4)).toBe(2)
    expect(getIndexAtRotation(225, 4)).toBe(1)
    expect(getIndexAtRotation(315, 4)).toBe(0)
  })

  it('handles negative rotations', () => {
    // Counter-clockwise 45°: sector 0 now straddles the top pointer.
    expect(getIndexAtRotation(-45, 4)).toBe(0)
    // Counter-clockwise 135°: sector 1 (90°–180°) moves to cover the top.
    expect(getIndexAtRotation(-135, 4)).toBe(1)
  })
})

describe('computeSpinRotation', () => {
  it('returns the current rotation unchanged for an empty wheel', () => {
    expect(computeSpinRotation(120, 0, 0)).toBe(120)
  })

  it('always spins strictly forward', () => {
    const random = () => 0.42
    for (const current of [0, 90, 360, 1080, 1234.5, -720]) {
      const next = computeSpinRotation(current, 3, 8, { random, turns: 4 })
      expect(next).toBeGreaterThan(current)
    }
  })

  it('lands exactly on the winner sector', () => {
    // Deterministic RNG: always lands at the centre of the jitter range.
    const random = () => 0.5
    for (let n = 2; n <= 12; n++) {
      for (let winner = 0; winner < n; winner++) {
        for (const current of [0, 137.2, 720, 2520.9]) {
          const rotation = computeSpinRotation(current, winner, n, { random })
          expect(getIndexAtRotation(rotation, n)).toBe(winner)
        }
      }
    }
  })

  it('keeps the pointer off sector borders even at extreme jitter', () => {
    // random()=1 → maximum positive jitter; the winner must still be exact.
    const random = () => 1
    for (let n = 2; n <= 12; n++) {
      const rotation = computeSpinRotation(0, (n - 1) / 2 | 0, n, { random })
      const index = getIndexAtRotation(rotation, n)
      expect(index).toBe((n - 1) / 2 | 0)
    }
  })

  it('is monotonic across consecutive spins', () => {
    let rotation = 0
    let prev = -Infinity
    for (let i = 0; i < 20; i++) {
      rotation = computeSpinRotation(rotation, i % 8, 8, { random: () => 0.3 })
      expect(rotation).toBeGreaterThan(prev)
      prev = rotation
    }
  })

  it('is deterministic for identical inputs', () => {
    const a = computeSpinRotation(500, 2, 8, { random: () => 0.7, turns: 3 })
    const b = computeSpinRotation(500, 2, 8, { random: () => 0.7, turns: 3 })
    expect(a).toBe(b)
  })

  it('enforces at least one full turn', () => {
    expect(computeSpinRotation(0, 0, 4, { random: () => 0.5, turns: 0 })).toBeGreaterThanOrEqual(
      360,
    )
  })
})

describe('truncateLabel', () => {
  it('leaves short names untouched', () => {
    expect(truncateLabel('LSD')).toBe('LSD')
    expect(truncateLabel('Ketamine')).toBe('Ketamine')
  })

  it('truncates long names with an ellipsis and respects the budget', () => {
    const out = truncateLabel('Psilocybin mushrooms', 14)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBeLessThanOrEqual(14)
    expect(out.startsWith('Psilocybin')).toBe(true)
  })
})

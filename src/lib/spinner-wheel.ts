// ─────────────────────────────────────────────────────────────────────────────
// Spinner Wheel — pure logic
//
// The spinner wheel ("Random Picker") randomly selects a substance from the
// user's most frequently used substances (derived from their dose history).
// When no history exists it falls back to a curated list of commonly used
// substances so the wheel is never empty.
//
// This module is intentionally framework-free so the aggregation and the
// spin math can be unit-tested without React (see spinner-wheel.test.ts).
// ─────────────────────────────────────────────────────────────────────────────

import { getAllSubstances, type Substance } from "@/lib/substances";
import type { DoseLog } from "@/types";

/** A single slice of the wheel. */
export interface WheelSegment {
  /** Library substance id (built-in or custom) when a match was found. */
  substanceId: string | null;
  /** Display name shown on the wheel. */
  name: string;
  /** Primary category id — drives the sector color. */
  category: string;
  /** How many times the substance appears in the dose log (0 for fallback). */
  count: number;
  /** Whether this segment came from the user's dose history. */
  fromHistory: boolean;
}

/** Where the wheel's segments came from — used for the page's empty state. */
export type WheelSource = "history" | "fallback";

export interface WheelData {
  segments: WheelSegment[];
  source: WheelSource;
}

export interface BuildWheelOptions {
  /** Maximum number of segments on the wheel. */
  limit?: number;
  /** All known substances (built-ins + custom). Injected for tests. */
  allSubstances?: Substance[];
}

/** Default number of wheel segments. 8 reads well at phone sizes. */
export const DEFAULT_WHEEL_LIMIT = 8;

/**
 * Curated fallback substances (by library id) used when the user has no dose
 * history yet — a spread of commonly used substances across categories.
 * Order matters: earlier entries are used first when padding.
 */
export const COMMON_SUBSTANCE_IDS = [
  "cannabis",
  "alcohol",
  "caffeine",
  "nicotine",
  "mdma",
  "lsd",
  "psilocybin-mushrooms",
  "ketamine",
  "cocaine",
  "amphetamine",
  "dextromethorphan",
  "gabapentin",
] as const;

// ─── History aggregation ─────────────────────────────────────────────────────

interface UsageAggregate {
  name: string;
  normalizedName: string;
  count: number;
  lastUsedMs: number;
  substanceId?: string;
  categories: string[];
}

const timestampMs = (dose: DoseLog): number => Date.parse(dose.timestamp) || 0;

/**
 * Aggregate the dose log into per-substance usage counts.
 *
 * Substances are keyed by normalized name (case-insensitive, dashes/spaces
 * folded) so "Psilocybin mushrooms" and "psilocybin-mushrooms" merge into a
 * single wheel segment. Doses without a substanceName are skipped.
 */
export function getFrequentlyUsedSubstances(
  doses: DoseLog[],
  limit = DEFAULT_WHEEL_LIMIT,
): WheelSegment[] {
  if (limit <= 0) return [];

  const aggregates = new Map<string, UsageAggregate>();
  for (const dose of doses) {
    const name = dose.substanceName?.trim();
    if (!name) continue;
    const key = normalizeSubstanceName(name);
    const existing = aggregates.get(key);
    const ts = timestampMs(dose);
    if (existing) {
      existing.count += 1;
      if (ts > existing.lastUsedMs) existing.lastUsedMs = ts;
      // Prefer an id if we learn it later
      if (!existing.substanceId && dose.substanceId) existing.substanceId = dose.substanceId;
    } else {
      aggregates.set(key, {
        name,
        normalizedName: key,
        count: 1,
        lastUsedMs: ts,
        substanceId: dose.substanceId || undefined,
        categories: Array.isArray(dose.categories) ? [...dose.categories] : [],
      });
    }
  }

  // Rank by usage count (desc), then most recently used, then name — a
  // stable ordering so the wheel doesn't reshuffle between renders.
  const ranked = [...aggregates.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.lastUsedMs !== a.lastUsedMs) return b.lastUsedMs - a.lastUsedMs;
    return a.name.localeCompare(b.name);
  });

  return ranked.slice(0, limit).map((agg) => ({
    substanceId: agg.substanceId ?? null,
    name: agg.name,
    category: agg.categories[0] ?? "other",
    count: agg.count,
    fromHistory: true,
  }));
}

/** Lowercase + fold dashes/underscores to spaces + collapse whitespace. */
export function normalizeSubstanceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Wheel assembly ──────────────────────────────────────────────────────────

/**
 * Build the wheel's segments from the dose history: the user's most
 * frequently used substances, up to `limit` slices. When there is no
 * history at all the wheel falls back to a curated list of commonly used
 * substances so it's never empty.
 *
 * Every history segment is enriched with its library record (when one
 * matches by id or name) so the category color and the "View substance"
 * deep-link work even for doses logged before the library entry existed.
 */
export function buildWheelSegments(
  doses: DoseLog[],
  options: BuildWheelOptions = {},
): WheelData {
  const limit = options.limit ?? DEFAULT_WHEEL_LIMIT;
  const allSubstances = options.allSubstances ?? getAllSubstances();

  if (limit <= 0) return { segments: [], source: "fallback" };

  const history = getFrequentlyUsedSubstances(doses, limit).map((segment) =>
    enrichWithLibrary(segment, allSubstances),
  );

  if (history.length === 0) {
    return { segments: getFallbackSegments(allSubstances, limit), source: "fallback" };
  }

  return { segments: history, source: "history" };
}

/** Attach library metadata (id + category) to a history-derived segment. */
function enrichWithLibrary(
  segment: WheelSegment,
  allSubstances: Substance[],
): WheelSegment {
  const match = findSubstance(segment, allSubstances);
  if (!match) return segment;
  return {
    ...segment,
    substanceId: match.id,
    // Prefer the canonical library name for display.
    name: match.name || segment.name,
    category: match.categories[0] ?? segment.category,
  };
}

function findSubstance(
  segment: WheelSegment,
  allSubstances: Substance[],
): Substance | undefined {
  if (segment.substanceId) {
    const byId = allSubstances.find((s) => s.id === segment.substanceId);
    if (byId) return byId;
  }
  const key = normalizeSubstanceName(segment.name);
  return allSubstances.find((s) => normalizeSubstanceName(s.name) === key);
}

/**
 * Curated fallback segments: the first `limit` COMMON_SUBSTANCE_IDS that
 * exist in the library. Count stays 0 and `fromHistory` stays false.
 */
export function getFallbackSegments(
  allSubstances: Substance[],
  limit: number,
): WheelSegment[] {
  if (limit <= 0) return [];
  const segments: WheelSegment[] = [];
  for (const id of COMMON_SUBSTANCE_IDS) {
    if (segments.length >= limit) break;
    const substance = allSubstances.find((s) => s.id === id);
    if (substance) {
      segments.push({
        substanceId: substance.id,
        name: substance.name,
        category: substance.categories[0] ?? "other",
        count: 0,
        fromHistory: false,
      });
    }
  }
  return segments;
}

// ─── Spin math ───────────────────────────────────────────────────────────────
//
// Sector layout: segment i spans wheel angles [i·A, (i+1)·A) where A =
// 360/N, measured clockwise from the top (12 o'clock) spoke of the wheel.
// The pointer sits at the top of the screen. After rotating the wheel
// clockwise by R degrees, the wheel angle under the pointer is
// (360 − R mod 360) mod 360.

/** Which segment index sits under the top pointer for a given rotation. */
export function getIndexAtRotation(rotation: number, segmentCount: number): number {
  if (segmentCount <= 0) return -1;
  const sectorAngle = 360 / segmentCount;
  const wheelAngle = mod(360 - mod(rotation, 360), 360);
  return Math.floor(mod(wheelAngle / sectorAngle, segmentCount));
}

/**
 * Uniformly random winner index in [0, segmentCount).
 * Accepts an injected RNG for deterministic tests.
 */
export function pickWinnerIndex(segmentCount: number, random: () => number = Math.random): number {
  if (segmentCount <= 0) return -1;
  return Math.floor(random() * segmentCount);
}

export interface SpinOptions {
  /** Full revolutions added on top of the aligned final angle. */
  turns?: number;
  /**
   * How far the landing point may wander from the sector centre, as a
   * fraction of the sector's angular half-width. Clamped to [0, 0.9] so
   * the pointer can never land exactly on a sector border.
   */
  jitterRatio?: number;
  /** Injected RNG for deterministic tests. */
  random?: () => number;
}

/**
 * Compute the final cumulative rotation that lands the pointer on the
 * winner segment.
 *
 * The result is always strictly greater than `currentRotation` (the wheel
 * only ever spins forward) and monotonically increases across consecutive
 * spins so CSS transitions animate the full distance instead of taking a
 * shortcut backwards.
 */
export function computeSpinRotation(
  currentRotation: number,
  winnerIndex: number,
  segmentCount: number,
  options: SpinOptions = {},
): number {
  if (segmentCount <= 0) return currentRotation;
  const turns = Math.max(1, Math.floor(options.turns ?? 5));
  const random = options.random ?? Math.random;
  const jitterRatio = clamp(options.jitterRatio ?? 0.7, 0, 0.9);

  const sectorAngle = 360 / segmentCount;
  const winner = mod(winnerIndex, segmentCount);

  // Random offset inside the winner sector, clear of both borders.
  const halfWidth = (sectorAngle / 2) * jitterRatio;
  const jitter = (random() * 2 - 1) * halfWidth;
  const targetWheelAngle = winner * sectorAngle + sectorAngle / 2 + jitter;

  // Screen rotation R that puts targetWheelAngle under the top pointer.
  const targetMod = mod(360 - targetWheelAngle, 360);
  const currentMod = mod(currentRotation, 360);
  const delta = mod(targetMod - currentMod, 360);

  return currentRotation + turns * 360 + delta;
}

// ─── Small math helpers ──────────────────────────────────────────────────────

/** True modulo that always returns a value in [0, n). */
export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Truncate long names so wheel labels stay readable. */
export function truncateLabel(name: string, maxLength = 14): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 1).trimEnd()}…`;
}

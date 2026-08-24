'use client'

import { useState, useMemo } from 'react'
import { Wine, Scale, Beaker, Info, ArrowRightLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  SHOT_SIZES,
  BEVERAGE_PRESETS,
  STANDARD_DRINKS,
  shotsToGrams,
  getShotSize,
  getBeveragePreset,
  roundTo,
  ETHANOL_DENSITY_G_PER_ML,
} from '@/lib/calculators/alcohol'

interface AlcoholCalculatorFieldsProps {
  /** Current amount entered by user (drinks/shots) */
  amount: string
  /** Callback to update the form's amount (with grams) */
  onAmountChange: (amount: string) => void
  /** Callback to update the form's unit */
  onUnitChange: (unit: string) => void
  /** Callback fired when conversion happens (drinks -> grams) */
  onConverted?: (drinks: number, unit: 'shots' | 'drinks', grams: number) => void
}

/**
 * Inline alcohol-to-gram calculator for the dose logger modal.
 * Appears when the user selects "Alcohol" as the substance.
 *
 * Converts drinks/shots to grams of pure ethanol using the same
 * calculation logic as the full alcohol calculator.
 */
export function AlcoholCalculatorFields({
  amount,
  onAmountChange,
  onUnitChange,
  onConverted,
}: AlcoholCalculatorFieldsProps) {
  // ─── Calculator state ───────────────────────────────────────────────────────
  const [beverageId, setBeverageId] = useState('spirits')
  const [shotSizeId, setShotSizeId] = useState('us-single')
  const [drinkCount, setDrinkCount] = useState(() => amount ? parseFloat(amount) || 2 : 2)
  const [drinkUnit, setDrinkUnit] = useState<'shots' | 'drinks'>('shots')

  // ─── Derived values ────────────────────────────────────────────────────────
  const beveragePreset = useMemo(() => getBeveragePreset(beverageId), [beverageId])
  const shotSize = useMemo(() => getShotSize(shotSizeId), [shotSizeId])

  // Standard serving volumes (mL) used when the unit toggle is "drinks".
  // Previously "drinks" mode computed with the SHOT volume for every
  // beverage, so "1 drink of beer" came out as 44 mL × 5% ≈ 1.75 g instead
  // of a real 12 oz can ≈ 14 g — an ~8× underestimate.
  const DRINK_SERVING_ML: Record<string, number> = {
    beer: 355,          // 12 fl oz can/bottle
    'beer-strong': 355,
    cider: 355,
    wine: 150,          // 5 fl oz glass
    'wine-fortified': 90, // 3 fl oz glass
    sake: 180,          // 1 go
    // spirits-* fall back to the selected shot size
  }

  const effectiveVolumeMl = useMemo(() => {
    if (drinkUnit === 'drinks') {
      return DRINK_SERVING_ML[beverageId] ?? shotSize?.volumeMl ?? 44.36
    }
    return shotSize?.volumeMl ?? 44.36
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drinkUnit, beverageId, shotSizeId, shotSize])

  // Calculate grams of ethanol
  const conversionResult = useMemo(() => {
    const abv = beveragePreset?.abv ?? 40
    return shotsToGrams({ shots: drinkCount, shotVolumeMl: effectiveVolumeMl, abv })
  }, [drinkCount, effectiveVolumeMl, beveragePreset])

  // NOTE: a useEffect here used to push the conversion to the parent on
  // MOUNT (with the default "2 US shots of spirits"). The parent only
  // renders this component while the unit is shot/drink, so that immediate
  // onUnitChange('g') unmounted the whole calculator within one frame —
  // its controls were unreachable and the amount was silently overwritten
  // with the default conversion. Conversions are now pushed ONLY from
  // user-initiated handlers below.

  /** Push the current conversion up to the dose-logger form. */
  const pushConversion = (result: ReturnType<typeof shotsToGrams>, count: number) => {
    if (result) {
      const roundedGrams = roundTo(result.ethanolGrams, 2)
      onAmountChange(String(roundedGrams))
      onUnitChange('g')
      onConverted?.(count, drinkUnit, roundedGrams)
    }
  }

  // ─── Handle drink count change ────────────────────────────────────────────
  const handleDrinkCountChange = (value: number) => {
    setDrinkCount(value)
    const abv = beveragePreset?.abv ?? 40
    const result = shotsToGrams({ shots: value, shotVolumeMl: effectiveVolumeMl, abv })
    pushConversion(result, value)
  }

  // ─── Handle beverage type change ──────────────────────────────────────────
  const handleBeverageChange = (id: string) => {
    setBeverageId(id)
    const preset = getBeveragePreset(id)
    if (preset) {
      const volumeMl = drinkUnit === 'drinks'
        ? (DRINK_SERVING_ML[id] ?? shotSize?.volumeMl ?? 44.36)
        : (shotSize?.volumeMl ?? 44.36)
      const result = shotsToGrams({ shots: drinkCount, shotVolumeMl: volumeMl, abv: preset.abv })
      pushConversion(result, drinkCount)
    }
  }

  // ─── Handle shot size change ───────────────────────────────────────────────
  const handleShotSizeChange = (id: string) => {
    setShotSizeId(id)
    const size = getShotSize(id)
    if (size) {
      const abv = beveragePreset?.abv ?? 40
      const volumeMl = drinkUnit === 'drinks'
        ? (DRINK_SERVING_ML[beverageId] ?? size.volumeMl)
        : size.volumeMl
      const result = shotsToGrams({ shots: drinkCount, shotVolumeMl: volumeMl, abv })
      pushConversion(result, drinkCount)
    }
  }

  // ─── Handle drink unit toggle ──────────────────────────────────────────────
  const handleDrinkUnitToggle = (newUnit: 'shots' | 'drinks') => {
    setDrinkUnit(newUnit)
    // The serving volume differs between modes — recompute and re-push so
    // the parent's grams match the newly-selected unit.
    const abv = beveragePreset?.abv ?? 40
    const volumeMl = newUnit === 'drinks'
      ? (DRINK_SERVING_ML[beverageId] ?? shotSize?.volumeMl ?? 44.36)
      : (shotSize?.volumeMl ?? 44.36)
    const result = shotsToGrams({ shots: drinkCount, shotVolumeMl: volumeMl, abv })
    if (result) {
      const roundedGrams = roundTo(result.ethanolGrams, 2)
      onAmountChange(String(roundedGrams))
      onUnitChange('g')
      onConverted?.(drinkCount, newUnit, roundedGrams)
    }
  }

  // Get the appropriate drink size label based on beverage type
  const getDrinkSizeLabel = () => {
    switch (drinkUnit) {
      case 'shots':
        return shotSize?.label ?? 'US shot (1.5 fl oz)'
      case 'drinks':
        // Different beverages have different "drink" definitions.
        // (Ids fixed to match BEVERAGE_PRESETS — the previous
        // 'fortified-wine'/'high-proof' ids never existed, so those branches
        // were dead.)
        if (beverageId === 'beer' || beverageId === 'beer-strong' || beverageId === 'cider') return '12 fl oz can/bottle'
        if (beverageId === 'wine') return '5 fl oz glass'
        if (beverageId === 'wine-fortified') return '3 fl oz glass'
        if (beverageId === 'sake') return '1 go (180 mL)'
        if (beverageId.startsWith('spirits')) return shotSize?.label ?? 'US shot (1.5 fl oz)'
        return 'Standard serving'
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wine className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Alcohol → Grams Calculator</span>
        <span className="text-xs text-neutral-content/60 ml-auto">
          <a
            href="/calculators/alcohol"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Full calculator
          </a>
        </span>
      </div>

      {/* Beverage & Drink Size selectors */}
      <div className="grid grid-cols-2 gap-3">
        {/* Beverage Type */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs">
            <Wine className="h-3.5 w-3.5" />
            Beverage
          </Label>
          <Select
            value={beverageId}
            onChange={(e) => handleBeverageChange(e.target.value)}
            className="text-sm"
          >
            {BEVERAGE_PRESETS.filter(b => b.id !== 'custom').map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} ({b.abv}%)
              </option>
            ))}
          </Select>
        </div>

        {/* Drink Size */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs">
            <Beaker className="h-3.5 w-3.5" />
            Drink Size
          </Label>
          <Select
            value={shotSizeId}
            onChange={(e) => handleShotSizeChange(e.target.value)}
            className="text-sm"
          >
            {SHOT_SIZES.filter(s => s.id !== 'custom').map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Drink count input */}
      <div className="space-y-1.5">
        <Label className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs">
            <Scale className="h-3.5 w-3.5" />
            Number of {drinkUnit}
          </span>
          <div className="flex rounded-lg border border-base-300 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => handleDrinkUnitToggle('shots')}
              className={`px-2 py-0.5 transition-colors ${
                drinkUnit === 'shots'
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-200'
              }`}
            >
              Shots
            </button>
            <button
              type="button"
              onClick={() => handleDrinkUnitToggle('drinks')}
              className={`px-2 py-0.5 transition-colors ${
                drinkUnit === 'drinks'
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-200'
              }`}
            >
              Drinks
            </button>
          </div>
        </Label>
        <Input
          type="number"
          min="0"
          step="0.5"
          value={drinkCount}
          onChange={(e) => handleDrinkCountChange(parseFloat(e.target.value) || 0)}
          placeholder="How many?"
          className="text-base"
        />
        <p className="text-[10px] text-neutral-content/60">
          {getDrinkSizeLabel()}
        </p>
      </div>

      {/* Result display */}
      {conversionResult && drinkCount > 0 && (
        <div className="rounded-lg bg-base-200/50 p-3 space-y-2">
          {/* Main result */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-base-content/70">
              {drinkCount} {drinkUnit}
            </span>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold text-primary">
              {roundTo(conversionResult.ethanolGrams, 2)} g
            </span>
          </div>
          <p className="text-center text-[10px] text-neutral-content/60">
            of pure ethanol
          </p>

          {/* Standard drink equivalents */}
          <div className="pt-2 border-t border-base-300/50">
            <p className="text-[10px] text-neutral-content/60 mb-1">Standard drinks:</p>
            <div className="flex flex-wrap gap-1">
              {STANDARD_DRINKS.map((def) => {
                const equiv = conversionResult.standardDrinks[def.id]
                if (!equiv || equiv < 0.01) return null
                return (
                  <span
                    key={def.id}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-base-100 border border-base-300"
                  >
                    {roundTo(equiv, 1)}× {def.label.replace(' standard drink', '').replace(' unit', '')}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 text-[10px] text-neutral-content/60">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <p>
          Pure ethanol is tracked in grams. Formula: drinks × volume × (ABV ÷ 100) × {ETHANOL_DENSITY_G_PER_ML} g/mL.
          One US standard drink ≈ 14g.
        </p>
      </div>
    </div>
  )
}
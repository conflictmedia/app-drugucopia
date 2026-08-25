'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, BellRing, Clock, Timer, X, Coffee, AlarmClock } from 'lucide-react'
import { useReminderStore } from '@/store/reminder-store'
import { formatRemainingTime } from '@/lib/notification-utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActiveReminder } from '@/types'

// ActiveReminders - displays running countdown timers and fired notifications.
// Shows above/below the ActiveDosesTimeline in the sidebar and in the mobile timeline tab.
//
// Performance notes:
//   - Each RunningReminderItem / SnoozedReminderItem owns its own 1s interval
//     so the parent only re-renders when the reminder LIST changes (add/remove/
//     status change), not on every tick. Previously a single parent-level tick
//     re-rendered the entire card (and every motion.div inside it) every second,
//     even fired reminders that don't have a live countdown.
//   - FiredReminderItem is fully memoized - it only depends on the reminder +
//     schedule + stable callbacks, so it never re-renders on the per-second tick.
//   - Each item carries a "reminder-item" class that gets CSS `contain: layout
//     style paint` so the per-second reflow of one countdown bar doesn't cause
//     sibling reflows.

interface ItemCallbacks {
  onDismiss: (id: string) => void
  onSnooze?: (id: string, minutes: number) => void
}

interface FiredReminderItemProps extends ItemCallbacks {
  reminder: ActiveReminder
  customMessage?: string
}

const FiredReminderItem = memo(function FiredReminderItem({
  reminder, customMessage, onDismiss, onSnooze,
}: FiredReminderItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="reminder-item rounded-lg border border-amber-500/40 bg-amber-500/10 p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <AlarmClock className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-medium text-sm">{reminder.substanceName}</span>
          </div>
          <p className="text-xs text-neutral-content mt-1">
            {customMessage || `Time for your next dose of ${reminder.substanceName}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="tap-sm h-7 w-7 shrink-0 min-h-0 p-0"
          onClick={() => onDismiss(reminder.id)}
          aria-label="Dismiss reminder"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="tap-sm h-7 min-h-0 text-xs gap-1 px-2"
          onClick={() => onDismiss(reminder.id)}
        >
          <Bell className="h-3 w-3" />
          Dismiss
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="tap-sm h-7 min-h-0 text-xs gap-1 px-2"
          onClick={() => onSnooze?.(reminder.id, 15)}
        >
          <Coffee className="h-3 w-3" />
          Snooze 15m
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="tap-sm h-7 min-h-0 text-xs gap-1 px-2"
          onClick={() => onSnooze?.(reminder.id, 60)}
        >
          <Timer className="h-3 w-3" />
          Snooze 1h
        </Button>
      </div>
    </motion.div>
  )
})

interface RunningReminderItemProps extends ItemCallbacks {
  reminder: ActiveReminder
}

const RunningReminderItem = memo(function RunningReminderItem({
  reminder, onDismiss,
}: RunningReminderItemProps) {
  // Each running reminder owns its own 1s tick - the parent doesn't tick at all.
  // This means a 20-reminder list won't cascade 20 re-renders every second; only
  // each item re-renders itself, and fired/snoozed siblings stay untouched.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  const remaining = new Date(reminder.firesAt).getTime() - now
  const progress = Math.max(
    0,
    Math.min(100, ((reminder.intervalMs - remaining) / reminder.intervalMs) * 100),
  )
  const isUrgent = remaining > 0 && remaining < 5 * 60_000 // < 5 min

  const clockColor = isUrgent ? 'text-amber-500' : 'text-blue-500'
  const timeColor = isUrgent ? 'text-amber-500 font-bold' : 'text-neutral-content'
  const barColor = isUrgent ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="reminder-item rounded-lg border border-base-300 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className={'h-4 w-4 shrink-0 ' + clockColor} />
          <span className="font-medium text-sm truncate">{reminder.substanceName}</span>
        </div>
        <span className={'text-sm font-mono tabular-nums shrink-0 ' + timeColor}>
          {formatRemainingTime(remaining)}
        </span>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-base-200 overflow-hidden">
        <div
          className={'h-full rounded-full transition-all duration-1000 ' + barColor}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-neutral-content">
          Started{' '}
          {new Date(reminder.startedAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="tap-sm h-6 min-h-0 text-xs text-neutral-content hover:text-error px-1"
          onClick={() => onDismiss(reminder.id)}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  )
})

interface SnoozedReminderItemProps extends ItemCallbacks {
  reminder: ActiveReminder
}

const SnoozedReminderItem = memo(function SnoozedReminderItem({
  reminder, onDismiss,
}: SnoozedReminderItemProps) {
  // Owns its own 1s tick so the parent doesn't have to.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  const remaining = reminder.snoozedUntil
    ? new Date(reminder.snoozedUntil).getTime() - now
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="reminder-item rounded-lg border border-purple-500/30 bg-purple-500/5 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Coffee className="h-4 w-4 text-purple-500 shrink-0" />
          <span className="font-medium text-sm truncate">{reminder.substanceName}</span>
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
            Snoozed
          </Badge>
        </div>
        <span className="text-sm font-mono tabular-nums text-purple-400 shrink-0">
          {formatRemainingTime(remaining)}
        </span>
      </div>
      <div className="flex items-center justify-end mt-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="tap-sm h-6 min-h-0 text-xs text-neutral-content hover:text-error px-1"
          onClick={() => onDismiss(reminder.id)}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  )
})

// --- Parent component ---

export function ActiveReminders() {
  const activeReminders = useReminderStore((s) => s.activeReminders)
  const schedules = useReminderStore((s) => s.schedules)
  const dismissReminder = useReminderStore((s) => s.dismissReminder)
  const snoozeReminder = useReminderStore((s) => s.snoozeReminder)
  const dismissAllFired = useReminderStore((s) => s.dismissAllFired)

  // The parent no longer has its own 1s `now` state - each running/snoozed
  // item ticks itself. The parent only re-renders when the reminder list
  // actually changes (new reminder added, dismissed, status flipped).

  const running = useMemo(
    () => activeReminders.filter((r) => r.status === 'running'),
    [activeReminders],
  )
  const snoozed = useMemo(
    () => activeReminders.filter((r) => r.status === 'snoozed'),
    [activeReminders],
  )
  const fired = useMemo(
    () => activeReminders.filter((r) => r.status === 'fired'),
    [activeReminders],
  )
  const schedulesById = useMemo(
    () => new Map(schedules.map((schedule) => [schedule.id, schedule])),
    [schedules],
  )

  if (activeReminders.length === 0) return null

  return (
    <Card className="py-3 gap-2">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <BellRing className="h-5 w-5 text-amber-500" />
          Dose Reminders
          {fired.length > 0 && (
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
              {fired.length} due
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {running.length + snoozed.length} timer{running.length + snoozed.length !== 1 ? 's' : ''} active
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {fired.map((r) => {
            const schedule = schedulesById.get(r.scheduleId)
            return (
              <FiredReminderItem
                key={r.id}
                reminder={r}
                customMessage={schedule?.customMessage}
                onDismiss={dismissReminder}
                onSnooze={snoozeReminder}
              />
            )
          })}

          {running.map((r) => (
            <RunningReminderItem
              key={r.id}
              reminder={r}
              onDismiss={dismissReminder}
            />
          ))}

          {snoozed.map((r) => (
            <SnoozedReminderItem
              key={r.id}
              reminder={r}
              onDismiss={dismissReminder}
            />
          ))}
        </AnimatePresence>

        {fired.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-neutral-content"
            onClick={dismissAllFired}
          >
            Dismiss All ({fired.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// --- Mobile version (compact, for bottom nav timeline tab) ---

const MobileRunningReminderItem = memo(function MobileRunningReminderItem({
  reminder, onDismiss,
}: RunningReminderItemProps) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  const remaining = new Date(reminder.firesAt).getTime() - now
  const progress = Math.max(
    0,
    Math.min(100, ((reminder.intervalMs - remaining) / reminder.intervalMs) * 100),
  )
  const isUrgent = remaining > 0 && remaining < 5 * 60_000

  const clockColor = isUrgent ? 'text-amber-500' : 'text-blue-500'
  const timeColor = isUrgent ? 'text-amber-500 font-bold' : 'text-neutral-content'
  const barColor = isUrgent ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <div className="reminder-item rounded-lg border border-base-300 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className={'h-4 w-4 shrink-0 ' + clockColor} />
          <span className="font-medium text-sm truncate">{reminder.substanceName}</span>
        </div>
        <span className={'text-sm font-mono tabular-nums shrink-0 ' + timeColor}>
          {formatRemainingTime(remaining)}
        </span>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-base-200 overflow-hidden">
        <div
          className={'h-full rounded-full transition-all duration-1000 ' + barColor}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-neutral-content">
          Started{' '}
          {new Date(reminder.startedAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="tap-sm h-6 min-h-0 text-xs text-neutral-content hover:text-error px-1"
          onClick={() => onDismiss(reminder.id)}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
})

const MobileSnoozedReminderItem = memo(function MobileSnoozedReminderItem({
  reminder, onDismiss,
}: SnoozedReminderItemProps) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  const remaining = reminder.snoozedUntil
    ? new Date(reminder.snoozedUntil).getTime() - now
    : 0

  return (
    <div className="reminder-item rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Coffee className="h-4 w-4 text-purple-500 shrink-0" />
          <span className="font-medium text-sm truncate">{reminder.substanceName}</span>
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
            Snoozed
          </Badge>
        </div>
        <span className="text-sm font-mono tabular-nums text-purple-400 shrink-0">
          {formatRemainingTime(remaining)}
        </span>
      </div>
      <div className="flex items-center justify-end mt-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="tap-sm h-6 min-h-0 text-xs text-neutral-content hover:text-error px-1"
          onClick={() => onDismiss(reminder.id)}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
})

export function MobileActiveReminders() {
  const activeReminders = useReminderStore((s) => s.activeReminders)
  const schedules = useReminderStore((s) => s.schedules)
  const dismissReminder = useReminderStore((s) => s.dismissReminder)
  const snoozeReminder = useReminderStore((s) => s.snoozeReminder)

  // No parent-level tick - each running/snoozed item ticks itself.

  if (activeReminders.length === 0) return null

  const fired = activeReminders.filter((r) => r.status === 'fired')
  const running = activeReminders.filter((r) => r.status === 'running')
  const snoozed = activeReminders.filter((r) => r.status === 'snoozed')

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <BellRing className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Reminders</h3>
        {fired.length > 0 && (
          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
            {fired.length} due
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Fired reminders */}
        {fired.map((r) => (
          <div
            key={r.id}
            className="reminder-item rounded-lg border border-amber-500/40 bg-amber-500/10 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlarmClock className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="font-medium text-sm truncate">{r.substanceName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="tap-sm h-7 min-h-0 text-xs shrink-0 px-2"
                onClick={() => dismissReminder(r.id)}
              >
                Dismiss
              </Button>
            </div>
            <p className="text-xs text-neutral-content mt-1">
              {schedules.find((s) => s.id === r.scheduleId)?.customMessage ||
                `Time for your next dose of ${r.substanceName}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="tap-sm h-7 min-h-0 text-xs gap-1 px-2"
                onClick={() => snoozeReminder(r.id, 15)}
              >
                <Coffee className="h-3 w-3" />
                Snooze 15m
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="tap-sm h-7 min-h-0 text-xs gap-1 px-2"
                onClick={() => snoozeReminder(r.id, 60)}
              >
                <Timer className="h-3 w-3" />
                Snooze 1h
              </Button>
            </div>
          </div>
        ))}

        {/* Running timers (with progress bar + urgency) */}
        {running.map((r) => (
          <MobileRunningReminderItem
            key={r.id}
            reminder={r}
            onDismiss={dismissReminder}
          />
        ))}

        {/* Snoozed timers */}
        {snoozed.map((r) => (
          <MobileSnoozedReminderItem
            key={r.id}
            reminder={r}
            onDismiss={dismissReminder}
          />
        ))}
      </div>
    </div>
  )
}

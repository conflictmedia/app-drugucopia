import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readTimelineViewPreference,
  writeTimelineViewPreference,
  subscribeToTimelineViewChanges,
  TIMELINE_VIEW_STORAGE_KEY,
  TIMELINE_VIEW_CHANGE_EVENT,
} from './timeline-view-preference'

describe('timeline-view-preference', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  describe('readTimelineViewPreference', () => {
    it('defaults to cards when nothing is stored', () => {
      expect(readTimelineViewPreference()).toBe('cards')
    })

    it('returns combined when persisted as combined', () => {
      window.localStorage.setItem(TIMELINE_VIEW_STORAGE_KEY, 'combined')
      expect(readTimelineViewPreference()).toBe('combined')
    })

    it('returns cards when persisted value is anything else', () => {
      window.localStorage.setItem(TIMELINE_VIEW_STORAGE_KEY, 'bogus')
      expect(readTimelineViewPreference()).toBe('cards')
    })

    it('falls back to cards when localStorage throws (private mode)', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      expect(readTimelineViewPreference()).toBe('cards')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('writeTimelineViewPreference', () => {
    it('persists the mode to localStorage', () => {
      writeTimelineViewPreference('combined')
      expect(window.localStorage.getItem(TIMELINE_VIEW_STORAGE_KEY)).toBe('combined')

      writeTimelineViewPreference('cards')
      expect(window.localStorage.getItem(TIMELINE_VIEW_STORAGE_KEY)).toBe('cards')
    })

    it('dispatches a change event with the new mode as detail', () => {
      const listener = vi.fn()
      window.addEventListener(TIMELINE_VIEW_CHANGE_EVENT, listener)
      writeTimelineViewPreference('combined')
      expect(listener).toHaveBeenCalledTimes(1)

      const detail = (listener.mock.calls[0][0] as CustomEvent).detail
      expect(detail).toBe('combined')
      window.removeEventListener(TIMELINE_VIEW_CHANGE_EVENT, listener)
    })

    it('does not throw when storage is blocked but still notifies listeners', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      const listener = vi.fn()
      const unsub = subscribeToTimelineViewChanges(listener)
      writeTimelineViewPreference('combined')
      expect(listener).toHaveBeenCalledWith('combined')
      unsub()
    })
  })

  describe('subscribeToTimelineViewChanges', () => {
    it('notifies subscribers when the preference is written', () => {
      const listener = vi.fn()
      const unsub = subscribeToTimelineViewChanges(listener)
      writeTimelineViewPreference('combined')
      expect(listener).toHaveBeenCalledWith('combined')
      writeTimelineViewPreference('cards')
      expect(listener).toHaveBeenCalledWith('cards')
      expect(listener).toHaveBeenCalledTimes(2)
      unsub()
    })

    it('stops notifying after unsubscribe', () => {
      const listener = vi.fn()
      const unsub = subscribeToTimelineViewChanges(listener)
      unsub()
      writeTimelineViewPreference('combined')
      expect(listener).not.toHaveBeenCalled()
    })

    it('normalizes invalid storage updates back to cards (storage event path)', () => {
      const listener = vi.fn()
      const unsub = subscribeToTimelineViewChanges(listener)

      // Simulate another tab writing an unexpected value
      window.dispatchEvent(
        Object.assign(new Event('storage'), {
          key: TIMELINE_VIEW_STORAGE_KEY,
          newValue: 'garbage',
        }) as StorageEvent
      )
      expect(listener).toHaveBeenCalledWith('cards')
      unsub()
    })

    it('ignores storage events for unrelated keys', () => {
      const listener = vi.fn()
      const unsub = subscribeToTimelineViewChanges(listener)

      window.dispatchEvent(
        Object.assign(new Event('storage'), {
          key: 'something:else',
          newValue: 'combined',
        }) as StorageEvent
      )
      expect(listener).not.toHaveBeenCalled()
      unsub()
    })
  })
})

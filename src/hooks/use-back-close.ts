'use client'

import { useEffect, useRef } from 'react'

/**
 * Android back-button support for modal surfaces (drawer, dose logger,
 * dialogs, popups, command palette).
 *
 * Behavior:
 * - Opening pushes a history entry (state `{ bc: id }` merged with whatever
 *   state the router keeps, so Next.js still recognizes the entry).
 * - A back press pops that entry; only the surface whose entry was popped
 *   closes, so stacked modals dismiss top-first.
 * - Closing through the UI pops the pushed entry — without this, every
 *   open/close cycle left a dead same-URL entry that silently swallowed the
 *   next back press.
 * - If a router navigation landed on top of our pushed entry before the
 *   surface closes, we leave the entry alone: `history.back()` there would
 *   navigate away from the new page. The entry's URL matches the page the
 *   user came from, so back still behaves sanely.
 * - Unmounting while an entry is still pushed (parent force-closes the
 *   surface) pops it as cleanup.
 */
export function useBackClose(isOpen: boolean, onClose: () => void) {
  const idRef = useRef(`bc-${Math.random().toString(36).slice(2)}`)
  const pushedRef = useRef(false)

  // Push when opening.
  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      window.history.pushState(
        { ...(window.history.state as Record<string, unknown> | null), bc: idRef.current },
        '',
      )
      pushedRef.current = true
    }
  }, [isOpen])

  // UI-initiated close: pop the entry we pushed, but only while it is still
  // the current one (see doc comment for the router-navigation case).
  useEffect(() => {
    if (!isOpen && pushedRef.current) {
      pushedRef.current = false
      const state = window.history.state as { bc?: string } | null
      if (state?.bc === idRef.current) {
        window.history.back()
      }
    }
  }, [isOpen])

  // Re-registered per onClose change — cheap, and keeps the handler honest
  // without the "latest ref" pattern (which writes to a ref during render).
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (pushedRef.current && (e.state as { bc?: string } | null)?.bc === idRef.current) {
        pushedRef.current = false
        onClose()
      }
    }
    // Don't pop during page teardown (backgrounded/killed webview).
    const onPageHide = () => {
      pushedRef.current = false
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('pagehide', onPageHide)
      if (pushedRef.current) {
        pushedRef.current = false
        window.history.back()
      }
    }
  }, [onClose])
}

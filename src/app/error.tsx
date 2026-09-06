'use client'

import { useEffect } from 'react'

/**
 * Route-segment error boundary (Next.js App Router).
 *
 * The static export bakes this into every page, so a render error in any
 * route shows this UI instead of whitescreening the WebView — there is no
 * browser refresh button to recover with on Android.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[route error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm opacity-70">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
        Try again
      </button>
    </div>
  )
}

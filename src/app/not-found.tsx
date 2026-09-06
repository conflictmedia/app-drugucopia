import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="max-w-md text-sm opacity-70">
        The page you were looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn btn-primary btn-sm">
        Back to Library
      </Link>
    </div>
  )
}

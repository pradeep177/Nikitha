import { Link } from 'react-router'
import FloatingDecorations from '@/components/FloatingDecorations'
import Planet from '@/components/illustrations/Planet'

/** Centered, on-brand frame for the login and password pages. */
export default function AdminAuthShell({ title, subtitle, children }) {
  return (
    <div className="relative grid min-h-dvh place-items-center px-4 py-10">
      <FloatingDecorations />
      <main className="relative z-10 w-full max-w-md">
        <div className="card-paper px-6 py-8 sm:px-8">
          <div className="mb-6 text-center">
            <Planet className="mx-auto size-16" />
            <h1 className="mt-3 font-hand text-4xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {children}
        </div>
        <p className="mt-6 text-center">
          <Link to="/" className="btn btn-ghost text-sm">
            ← Back to the website
          </Link>
        </p>
      </main>
    </div>
  )
}

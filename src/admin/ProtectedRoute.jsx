import { Navigate, Outlet, useLocation } from 'react-router'
import { LogOut, ShieldAlert } from 'lucide-react'
import AdminAuthShell from './AdminAuthShell'
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import { useAuth } from '@/hooks/useAuth'

/**
 * Guards every /admin page. This only controls what the UI shows — every
 * write is independently checked by the database's RLS policies, so hiding or
 * bypassing this component grants nothing.
 */
export default function ProtectedRoute() {
  const { ready, user, isAdmin, roleError, retryRole, signOut } = useAuth()
  const location = useLocation()

  if (!ready) return <LoadingState fullPage message="Checking your access…" />
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />

  if (roleError) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <ErrorState
          title="Couldn't check your access"
          message="The database didn't answer. Make sure the SQL migration has been run, then try again."
          onRetry={retryRole}
        />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <AdminAuthShell title="No admin access" subtitle={`Signed in as ${user.email}`}>
        <p className="mb-4 flex items-start gap-2 rounded-2xl bg-lavender/70 px-4 py-3 text-sm text-ink">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
          This account can't manage the website.
        </p>
        <button type="button" onClick={() => signOut().catch(() => {})} className="btn btn-soft w-full">
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
      </AdminAuthShell>
    )
  }

  return <Outlet />
}

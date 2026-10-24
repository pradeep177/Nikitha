import { Navigate, useLocation } from 'react-router'
import { FlaskConical, LogOut, ShieldAlert } from 'lucide-react'
import AdminAuthShell from './AdminAuthShell'
import SignInForm from '@/components/auth/SignInForm'
import LoadingState from '@/components/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function AdminLoginPage() {
  usePageTitle('Admin sign in')
  const { ready, user, isAdmin, isDemo, roleError, signOut, enterDemoAdmin } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname?.startsWith('/admin') ? location.state.from.pathname : '/admin'

  if (isAdmin) return <Navigate to={from} replace />
  if (!ready) return <LoadingState fullPage message="Checking your session…" />

  if (isDemo) {
    return (
      <AdminAuthShell title="Admin room" subtitle="Supabase isn't connected yet, so the site is in demo mode.">
        <div className="space-y-4 text-sm text-ink-soft">
          <p className="flex items-start gap-2 rounded-2xl bg-lavender/70 px-4 py-3 text-ink">
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
            You can explore a <strong>read-only preview</strong> of the dashboard. Nothing can be saved until you add your Supabase
            keys to <code>.env.local</code> (see the README).
          </p>
          <button type="button" onClick={enterDemoAdmin} className="btn btn-primary w-full">
            Preview the admin (demo)
          </button>
        </div>
      </AdminAuthShell>
    )
  }

  if (user && !isAdmin) {
    return (
      <AdminAuthShell title="Not an admin account" subtitle={`Signed in as ${user.email}`}>
        <div className="space-y-4 text-center">
          <p className="flex items-start gap-2 rounded-2xl bg-lavender/70 px-4 py-3 text-left text-sm text-ink">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
            {roleError
              ? "We couldn't check this account's permissions. Has the database migration been run?"
              : "This account doesn't have admin access. Admin access can only be granted from the Supabase SQL editor."}
          </p>
          <button type="button" onClick={() => signOut().catch(() => {})} className="btn btn-soft w-full">
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </AdminAuthShell>
    )
  }

  return (
    <AdminAuthShell title="Admin room" subtitle="Sign in to look after our little universe.">
      <SignInForm submitLabel="Sign in" />
    </AdminAuthShell>
  )
}

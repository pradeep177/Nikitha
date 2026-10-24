import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import AdminAuthShell from './AdminAuthShell'
import LoadingState from '@/components/LoadingState'
import { friendlyAuthError, updatePassword } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { inputClass } from '@/utils/ui'

/**
 * Landing page for the password-reset email link. Supabase signs the user in
 * from the link (a short-lived recovery session); here they choose a new password.
 */
export default function ResetPasswordPage() {
  usePageTitle('Choose a new password')
  const { ready, user, isAdmin, isDemo } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  if (!ready) return <LoadingState fullPage message="Opening your reset link…" />

  if (isDemo || !user) {
    return (
      <AdminAuthShell title="Link expired" subtitle="This reset link is invalid or has expired.">
        <Link to="/admin/login" className="btn btn-primary w-full">
          Request a new link
        </Link>
      </AdminAuthShell>
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    if (password.length < 8) return setError('Please use at least 8 characters.')
    if (password !== confirm) return setError("The two passwords don't match.")
    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AdminAuthShell title="All set ♡" subtitle="Your password has been updated.">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto size-10 text-berry" aria-hidden="true" />
          <Link to={isAdmin ? '/admin' : '/'} className="btn btn-primary w-full">
            {isAdmin ? 'Go to the dashboard' : 'Back to our little universe'}
          </Link>
        </div>
      </AdminAuthShell>
    )
  }

  return (
    <AdminAuthShell title="New password" subtitle={`For ${user.email}`}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-sm font-extrabold text-ink">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-ink-soft">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-extrabold text-ink">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-lavender px-4 py-2.5 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Save new password
        </button>
      </form>
    </AdminAuthShell>
  )
}

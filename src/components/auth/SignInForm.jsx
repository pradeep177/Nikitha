import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, LogIn, MailCheck } from 'lucide-react'
import { friendlyAuthError, sendPasswordReset } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { inputClass } from '@/utils/ui'

/**
 * Email + password sign-in with a "forgot password" mode.
 * There is intentionally no sign-up: accounts are created by the admin.
 */
export default function SignInForm({ onSuccess, submitLabel = 'Sign in' }) {
  const { signIn } = useAuth()
  const id = useId()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (mode === 'signin' && !password) {
      setError('Please enter your password.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        setPassword('')
        onSuccess?.()
      } else {
        await sendPasswordReset(email)
        setResetSent(true)
      }
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setResetSent(false)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 text-left">
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-extrabold text-ink">
          Email
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
        />
      </div>

      {mode === 'signin' && (
        <div>
          <label htmlFor={`${id}-password`} className="mb-1.5 block text-sm font-extrabold text-ink">
            Password
          </label>
          <div className="relative">
            <input
              id={`${id}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:text-berry-deep"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="rounded-2xl bg-lavender px-4 py-2.5 text-sm font-bold text-ink"
          >
            {error}
          </motion.p>
        )}
        {resetSent && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" className="flex items-start gap-2 rounded-2xl bg-butter px-4 py-2.5 text-sm text-ink">
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            If that email has an account, a reset link is on its way. Check your inbox (and spam folder).
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        {busy ? 'One moment…' : mode === 'signin' ? submitLabel : 'Send reset link'}
      </button>

      <p className="text-center text-sm">
        {mode === 'signin' ? (
          <button type="button" onClick={() => switchMode('reset')} className="font-bold text-berry-deep underline-offset-4 hover:underline">
            Forgot your password?
          </button>
        ) : (
          <button type="button" onClick={() => switchMode('signin')} className="font-bold text-berry-deep underline-offset-4 hover:underline">
            Back to sign in
          </button>
        )}
      </p>
    </form>
  )
}

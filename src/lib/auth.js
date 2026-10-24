import { supabase, isDemoMode } from './supabase'

/** Turns Supabase auth errors into friendly, non-technical messages. */
export function friendlyAuthError(error) {
  const msg = (error?.message || '').toLowerCase()
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('invalid login credentials')) return "That email and password don't match. Please try again."
  if (msg.includes('email not confirmed')) return 'This email address has not been confirmed yet.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Too many attempts — please wait a minute and try again.'
  if (msg.includes('password should be') || msg.includes('weak')) return 'Please choose a stronger password (at least 8 characters).'
  if (msg.includes('same password') || msg.includes('different from the old')) return 'Please choose a password different from your current one.'
  if (msg.includes('failed to fetch') || msg.includes('network')) return "Couldn't reach the server. Check your connection and try again."
  if (msg.includes('auth session missing') || msg.includes('expired')) return 'This link has expired. Please request a new password-reset email.'
  return error.message
}

function requireClient() {
  if (isDemoMode || !supabase) throw new Error('Supabase is not configured (demo mode).')
  return supabase
}

export async function signInWithPassword(email, password) {
  const { data, error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function sendPasswordReset(email) {
  const { error } = await requireClient().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(password) {
  const { error } = await requireClient().auth.updateUser({ password })
  if (error) throw error
}

/** Reads the signed-in user's role from the database ('admin' | 'viewer' | null). */
export async function fetchMyRole() {
  const { data, error } = await requireClient().rpc('my_role')
  if (error) throw error
  return data ?? null
}

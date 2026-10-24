import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { supabase, isDemoMode } from '@/lib/supabase'
import { fetchMyRole, signInWithPassword, signOut as supabaseSignOut } from '@/lib/auth'
import { invalidateContent } from '@/hooks/useContent'

const DEMO_KEY = 'olu:demo-admin'

/**
 * Tracks the Supabase session and the user's role from public.user_roles.
 * Role checks here only shape the UI — the database enforces the real rules (RLS).
 */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(isDemoMode)
  const [roleState, setRoleState] = useState({ userId: null, role: null, error: null })
  const [roleNonce, setRoleNonce] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [demoAdmin, setDemoAdmin] = useState(() => isDemoMode && sessionStorage.getItem(DEMO_KEY) === '1')

  useEffect(() => {
    if (isDemoMode) return undefined
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  // Whenever the signed-in user changes, cached content must be refetched
  // because the database returns different rows for different roles.
  const [lastUserId, setLastUserId] = useState(userId)
  if (lastUserId !== userId) {
    setLastUserId(userId)
    invalidateContent()
    setEpoch((e) => e + 1)
  }

  useEffect(() => {
    if (isDemoMode || !userId) return undefined
    let cancelled = false
    fetchMyRole().then(
      (role) => !cancelled && setRoleState({ userId, role, error: null }),
      (error) => !cancelled && setRoleState({ userId, role: null, error }),
    )
    return () => {
      cancelled = true
    }
  }, [userId, roleNonce])

  const roleLoaded = !userId || roleState.userId === userId
  const role = isDemoMode ? (demoAdmin ? 'admin' : null) : roleLoaded && userId ? roleState.role : null

  const signIn = useCallback((email, password) => signInWithPassword(email, password), [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      sessionStorage.removeItem(DEMO_KEY)
      setDemoAdmin(false)
      return
    }
    await supabaseSignOut()
  }, [])

  const enterDemoAdmin = useCallback(() => {
    if (!isDemoMode) return
    sessionStorage.setItem(DEMO_KEY, '1')
    setDemoAdmin(true)
  }, [])

  const value = useMemo(
    () => ({
      ready: sessionReady && roleLoaded,
      user: isDemoMode ? (demoAdmin ? { id: 'demo', email: 'demo preview' } : null) : (session?.user ?? null),
      role,
      roleError: roleLoaded && userId ? roleState.error : null,
      isAdmin: role === 'admin',
      isViewer: role === 'admin' || role === 'viewer',
      isDemo: isDemoMode,
      epoch,
      signIn,
      signOut,
      enterDemoAdmin,
      retryRole: () => setRoleNonce((n) => n + 1),
    }),
    [sessionReady, roleLoaded, demoAdmin, session, role, userId, roleState.error, epoch, signIn, signOut, enterDemoAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

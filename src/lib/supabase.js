import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim()

export const SUPABASE_URL = url?.replace(/\/+$/, '')
export const SUPABASE_KEY = anonKey

const looksLikePlaceholder = !url || !anonKey || url.includes('your-project-ref') || anonKey.startsWith('your-')

/** True when real Supabase credentials are present. */
export const isSupabaseConfigured = !looksLikePlaceholder

/**
 * Demo mode: the app runs with clearly-labelled placeholder content and
 * every write is disabled, so demo data can never reach a real database.
 */
export const isDemoMode = !isSupabaseConfigured

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

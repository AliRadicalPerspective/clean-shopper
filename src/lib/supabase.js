/**
 * Supabase client and anonymous session.
 *
 * The brief rules out accounts and authentication as user-facing features, but
 * the cart still has to survive a session. Supabase's anonymous sign-in threads
 * that needle: the browser silently gets a real auth.users row, so `auth.uid()`
 * exists and row-level security can key on it, with no signup UI anywhere.
 *
 * Configuration is optional on purpose. With no env vars set the app falls back
 * to the localStorage-only behavior it had before, so a fresh clone still runs
 * without credentials.
 */

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        // The anonymous session *is* the user's identity here, so it has to
        // outlive the tab — losing it would orphan their cart.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

let sessionPromise = null

/**
 * Resolve to the current user's id, signing in anonymously the first time.
 * Returns `null` when Supabase is unconfigured or the sign-in fails, which
 * callers treat as "stay local-only" rather than as an error.
 */
export function ensureSession() {
  if (!supabase) return Promise.resolve(null)
  // Memoised so concurrent callers on first paint share one sign-in.
  if (sessionPromise) return sessionPromise

  sessionPromise = (async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      warnOnce(error)
      return null
    }
    if (data.session) return data.session.user.id

    const signIn = await supabase.auth.signInAnonymously()
    if (signIn.error) {
      warnOnce(signIn.error)
      return null
    }
    return signIn.data.user?.id ?? null
  })()

  return sessionPromise
}

let warned = false

function warnOnce(error) {
  if (warned) return
  warned = true
  console.warn(
    '[clean-shopper] Supabase unavailable, continuing with local storage only.',
    'If this is an "Anonymous sign-ins are disabled" error, enable them under',
    'Authentication → Sign In / Providers in the Supabase dashboard.',
    error,
  )
}

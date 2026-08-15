/**
 * Persistence layer.
 *
 * Local-first. localStorage stays the synchronous read path so the app paints
 * with the user's cart already in it and keeps working offline; Supabase is a
 * write-through sync layer behind it, giving the cart and preferences a life
 * beyond one browser profile. Everything that touches storage still goes
 * through this module.
 *
 * With Supabase unconfigured (no env vars) this degrades to exactly the
 * localStorage-only behavior it had before.
 */

import { ensureSession, isConfigured, supabase } from './supabase.js'

const PREFIX = 'clean-shopper:'

/** How long to coalesce local writes before pushing one upsert. */
const FLUSH_DELAY_MS = 600

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    // Private browsing, disabled storage, or corrupt JSON — degrade to
    // in-memory for this session rather than taking the app down.
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* no-op */
  }
}

export const DEFAULT_PREFERENCES = {
  avoidedFamilies: [],
  trustedBrands: [],
  requiredCertifications: [],
}

/* ------------------------------------------------------------------ *
 * Remote sync
 * ------------------------------------------------------------------ */

let flushTimer = null
let userId = null

/** True once sync() has decided whether local or remote wins. */
let ready = false
/** True when a local write is waiting to go up. */
let pending = false

/**
 * Captured at import, before React mounts. App.jsx persists preferences, cart,
 * and history from effects that also run on mount, so by the time sync() runs
 * the live stamp has already been bumped to "now" and would always beat the
 * remote row. This is the stamp as it stood when the page loaded.
 */
const initialStamp = read('updatedAt', null)

/** Local mirror of the row, so a flush always pushes a complete document. */
function localSnapshot() {
  return {
    preferences: { ...DEFAULT_PREFERENCES, ...read('preferences', {}) },
    cart: asArray(read('cart', [])),
    history: asArray(read('history', [])),
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function applySnapshot(snapshot) {
  write('preferences', snapshot.preferences)
  write('cart', snapshot.cart)
  write('history', snapshot.history)
}

/** Stamped on every local write so sync can tell which side is newer. */
function touchLocal() {
  write('updatedAt', new Date().toISOString())
}

async function flush() {
  flushTimer = null
  if (!ready || !pending || !supabase || !userId) return
  pending = false

  const { error } = await supabase.from('user_state').upsert(
    { user_id: userId, ...localSnapshot(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  if (error) {
    pending = true // leave it queued for the next write to retry
    console.warn('[clean-shopper] Failed to sync to Supabase.', error)
  }
}

/**
 * Queue a push of the whole row. Writes are coalesced because App.jsx saves
 * preferences, cart, and history from three separate effects, and a single
 * interaction can touch more than one of them.
 */
function schedulePush() {
  touchLocal()
  if (!isConfigured) return
  pending = true
  // Before sync() has settled we do not yet know whether local or remote is
  // authoritative, so hold the write rather than clobbering a newer row.
  if (!ready) return
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, FLUSH_DELAY_MS)
}

export const storage = {
  loadPreferences() {
    return { ...DEFAULT_PREFERENCES, ...read('preferences', {}) }
  },
  savePreferences(prefs) {
    write('preferences', prefs)
    schedulePush()
  },

  /** Cart entries are `{ productId, qty }`. */
  loadCart() {
    return asArray(read('cart', []))
  },
  saveCart(cart) {
    write('cart', cart)
    schedulePush()
  },

  loadHistory() {
    return asArray(read('history', []))
  },
  saveHistory(history) {
    write('history', history.slice(0, 8))
    schedulePush()
  },

  /**
   * Reconcile the local cache with Supabase once, on mount.
   *
   * Resolves to a snapshot when the remote row is newer than anything held
   * locally — the caller should adopt it — and to `null` when local already
   * wins or Supabase is unavailable, in which case the local state is pushed
   * up instead. Last-write-wins on the whole document is coarse, but these are
   * small single-user documents and the alternative is merge UI the brief
   * does not ask for.
   */
  async sync() {
    if (!isConfigured) return null

    userId = await ensureSession()
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_state')
      .select('preferences, cart, history, updated_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[clean-shopper] Failed to read state from Supabase.', error)
      return null
    }

    // No row yet, or ours is newer: local wins and gets pushed up.
    if (!data || (initialStamp && initialStamp > data.updated_at)) {
      ready = true
      pending = true
      flushTimer = setTimeout(flush, FLUSH_DELAY_MS)
      return null
    }

    const snapshot = {
      preferences: { ...DEFAULT_PREFERENCES, ...(data.preferences ?? {}) },
      cart: asArray(data.cart),
      history: asArray(data.history),
    }
    applySnapshot(snapshot)
    write('updatedAt', data.updated_at)
    // Remote won, so anything queued from mount-time effects is stale echo.
    ready = true
    pending = false
    return snapshot
  },

  clear() {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    pending = false
    ;['preferences', 'cart', 'history', 'updatedAt'].forEach((key) => {
      try {
        window.localStorage.removeItem(PREFIX + key)
      } catch {
        /* no-op */
      }
    })
    if (supabase && userId) {
      supabase
        .from('user_state')
        .delete()
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) {
            console.warn('[clean-shopper] Failed to clear remote state.', error)
          }
        })
    }
  },
}

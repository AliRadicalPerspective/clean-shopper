/**
 * The shop assistant, client side.
 *
 * Talks to the `chat` Edge Function, which holds the Anthropic key. Until that
 * function is deployed it falls back to the deterministic engine in
 * research.js, so the widget is usable from the first run rather than being
 * dead until infrastructure exists.
 *
 * The two modes are reported, never blurred: `mode` comes back on every reply
 * and the panel says which one answered. A scripted fallback quietly
 * impersonating a language model is how a demo goes wrong in front of an
 * audience.
 */

import { isConfigured, supabase } from './supabase.js'
import { product as findProduct } from './catalog.js'
import { evaluateProduct } from './evaluate.js'
import { research } from './research.js'

export const MODE = { live: 'live', local: 'local' }

/** Cached so a missing deployment costs one failed request, not one per turn. */
let liveAvailable = null

function endpoint() {
  const url = import.meta.env.VITE_SUPABASE_URL
  return url ? `${url}/functions/v1/chat` : null
}

/**
 * @param {{role: 'user'|'assistant', content: string}[]} messages
 * @param {object} prefs
 * @returns {Promise<{reply: string, products: object[], preferences: object[], mode: string, error?: string}>}
 */
export async function ask(messages, prefs) {
  if (isConfigured && liveAvailable !== false) {
    try {
      const live = await askLive(messages, prefs)
      liveAvailable = true
      return live
    } catch (error) {
      // Only give up on live for the session if the function is genuinely not
      // there. A one-off network blip should not downgrade the rest of the
      // conversation silently.
      if (error?.notDeployed) liveAvailable = false
      else console.warn('[clean-shopper] Assistant request failed.', error)
    }
  }

  return askLocal(messages, prefs)
}

async function askLive(messages, prefs) {
  const url = endpoint()
  if (!url) throw Object.assign(new Error('Not configured'), { notDeployed: true })

  const { data: session } = await supabase.auth.getSession()
  const token =
    session?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, preferences: prefs }),
  })

  if (response.status === 404) {
    throw Object.assign(new Error('Function not deployed'), {
      notDeployed: true,
    })
  }
  if (!response.ok) throw new Error(await response.text())

  const body = await response.json()
  if (body.error) throw new Error(body.error)

  return {
    reply: body.reply,
    products: (body.productIds ?? [])
      .map(findProduct)
      .filter(Boolean)
      .map((p) => evaluateProduct(p, prefs)),
    preferences: body.preferences ?? [],
    mode: MODE.live,
  }
}

/**
 * Deterministic fallback. Runs the same research engine the Research page uses
 * and narrates the result — no clarifying questions, because it cannot ask one
 * it was not scripted for.
 */
async function askLocal(messages, prefs) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const result = await research(lastUser?.content ?? '', prefs, null)

  if (result.empty || !result.pick) {
    return {
      reply:
        'We do not stock anything that matches that. Clean Shopper carries household cleaning supplies only — sprays and degreasers, bathroom and glass, floor, laundry, dishwashing and hand soap.',
      products: [],
      preferences: [],
      mode: MODE.local,
    }
  }

  const { pick } = result
  const against = pick.concerns.find(
    (i) => i.level === 'high' || i.level === 'moderate',
  )

  const lines = [
    `${pick.product.brand} ${pick.product.name} — $${pick.product.price}, ${pick.product.size}.`,
    pick.product.summary,
  ]
  if (pick.certs.length) {
    lines.push(
      `Reviewed by ${pick.certs.map((c) => c.body).join(' and ')}, not just by the brand.`,
    )
  }
  if (against) lines.push(`Worth knowing: ${against.name} is present. ${against.why}`)
  if (result.skipped.length) {
    lines.push(
      `Set aside: ${result.skipped.map((s) => `${s.product.brand} — ${s.reason.toLowerCase()}`).join(' ')}`,
    )
  }

  return {
    reply: lines.join('\n\n'),
    products: [pick, ...result.alternates],
    preferences: [],
    mode: MODE.local,
  }
}

/** Turn the assistant's preference writes into a preferences object. */
export function applyPreferenceWrites(prefs, writes) {
  const next = {
    avoidedFamilies: [...(prefs.avoidedFamilies ?? [])],
    trustedBrands: [...(prefs.trustedBrands ?? [])],
    requiredCertifications: [...(prefs.requiredCertifications ?? [])],
  }

  const key = {
    avoid_family: 'avoidedFamilies',
    trust_brand: 'trustedBrands',
    require_certification: 'requiredCertifications',
  }

  writes.forEach((write) => {
    const field = key[write.kind]
    if (field && write.value && !next[field].includes(write.value)) {
      next[field].push(write.value)
    }
  })

  return next
}

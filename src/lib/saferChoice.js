/**
 * EPA Safer Choice lookups.
 *
 * Read-only, and read-only by construction rather than by convention: the table
 * grants select to anon and has no write policy at all, so nothing here can
 * mutate it. Rows arrive via scripts/seed-safer-choice.js.
 *
 * This is the one place in the app where a certification claim is backed by
 * something outside the codebase. `safer-choice` in src/data/certifications.js
 * describes what the mark means; this module answers whether a *specific*
 * product actually carries it. Keeping those separate matters — the description
 * is editorial, the lookup is evidence.
 *
 * Every function degrades to an empty result when Supabase is unconfigured or
 * unreachable, matching src/lib/storage.js: a missing certification is rendered
 * as "unknown", never as "not certified". Absence of evidence is not a claim.
 */

import { isConfigured, supabase } from './supabase.js'

const TABLE = 'safer_choice_products'

/** Columns worth pulling for display. Excludes the bookkeeping ones. */
const FIELDS =
  'product_name, company_name, program, epa_sectors, categories, subcategories, ' +
  'audiences, upc, partner_since, fragrance_free, in_good_standing, product_url'

export const isSaferChoiceAvailable = isConfigured

/**
 * Normalize a barcode the same way the importer does.
 *
 * The EPA publishes UPCs as integers, so a UPC-A starting with zero loses it in
 * transit and is stored padded back to 12. A scan or a hand-typed code has to
 * go through the identical padding or it will miss every time.
 */
export function normalizeUpc(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return null
  return digits.length < 12 ? digits.padStart(12, '0') : digits
}

async function query(build) {
  if (!supabase) return []
  const { data, error } = await build(supabase.from(TABLE).select(FIELDS))
  if (error) {
    console.warn('[clean-shopper] Safer Choice lookup failed.', error)
    return []
  }
  return data ?? []
}

/**
 * Find a certified product by barcode. Resolves to the product or null.
 *
 * Null means "the EPA has no record of this barcode", which is genuinely
 * different from "this product is not safe" — callers should say so.
 *
 * Unlike the browse queries this does not filter to consumer products. If
 * someone has a barcode in hand the honest answer is whether the EPA certified
 * that product, not whether we would have merchandised it.
 */
export async function lookupByUpc(value) {
  const upc = normalizeUpc(value)
  if (!upc) return null
  const rows = await query((q) => q.eq('upc', upc).limit(1))
  return rows[0] ?? null
}

/**
 * Search certified products by name or company.
 *
 * `category` filters on the mapped app categories from src/data/products.js.
 * Products certified across several sectors match any of them, which is why
 * this is a containment test rather than equality.
 */
export async function searchSaferChoice(
  term,
  { category = null, audience = 'consumer', limit = 20 } = {},
) {
  const needle = term?.trim()
  return query((q) => {
    let next = q
    if (needle) {
      // Escaped so a stray comma or paren in a product name cannot break out
      // of PostgREST's filter grammar.
      const safe = needle.replace(/[%,()]/g, ' ')
      next = next.or(`product_name.ilike.%${safe}%,company_name.ilike.%${safe}%`)
    }
    if (category) next = next.contains('categories', [category])
    if (audience) next = next.contains('audiences', [audience])
    return next.order('product_name').limit(limit)
  })
}

/**
 * Certified products in one of the app's categories, e.g. 'laundry'.
 *
 * Consumer-only by default. Pass `audience: null` to include the janitorial
 * and industrial half of the registry, which is certified but not purchasable.
 */
export async function listByCategory(category, { audience = 'consumer', limit = 50 } = {}) {
  if (!category) return []
  return query((q) => {
    let next = q.contains('categories', [category])
    if (audience) next = next.contains('audiences', [audience])
    return next.order('product_name').limit(limit)
  })
}

/**
 * Whether a brand has anything certified, for scoring trusted brands.
 *
 * Matches on the EPA's `company_name`, which is the legal entity ("Reckitt
 * Benckiser LLC") and often not the name on the bottle ("Lysol"). Treat a false
 * here as "no match found", not as evidence against the brand.
 */
export async function isCompanyCertified(companyName) {
  const name = companyName?.trim()
  if (!name || !supabase) return false

  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .ilike('company_name', `%${name.replace(/[%,()]/g, ' ')}%`)

  if (error) {
    console.warn('[clean-shopper] Safer Choice company lookup failed.', error)
    return false
  }
  return (count ?? 0) > 0
}

/** Total certified products, mainly so the UI can prove the table is loaded. */
export async function countSaferChoice() {
  if (!supabase) return 0
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
  if (error) {
    console.warn('[clean-shopper] Safer Choice count failed.', error)
    return 0
  }
  return count ?? 0
}

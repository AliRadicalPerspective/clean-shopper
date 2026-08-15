/**
 * The catalog, loaded from Supabase.
 *
 * Every consumer imports its collections and lookups from here rather than
 * from src/data/*.js. Those modules are still the seed — `npm run gen:catalog`
 * turns them into supabase/catalog.sql — but at runtime this module is the
 * source of truth.
 *
 * The exported collections are `let` bindings reassigned once by loadCatalog().
 * ES module live bindings mean importers see the loaded data without anything
 * being threaded through props or context.
 *
 * PHOTOGRAPHY STAYS LOCAL. `image` is a slot name resolved against
 * src/assets/images/index.js, so the pictures ship in the bundle and the
 * database stores a short string. Nothing is uploaded to storage.
 *
 * Bundled data is the fallback, and the fallback is always visible: `source`
 * reports which one is live and the UI says so. An app that silently serves
 * stale bundled data while appearing to be database-backed is worse than one
 * that fails loudly.
 */

import { isConfigured, supabase } from './supabase.js'
import { CATEGORIES as SEED_CATEGORIES, PRODUCTS as SEED_PRODUCTS } from '../data/products.js'
import { INGREDIENT_LIST as SEED_INGREDIENTS } from '../data/ingredients.js'
import { CERT_LIST as SEED_CERTS } from '../data/certifications.js'
import { ARTICLES as SEED_ARTICLES } from '../data/articles.js'

export const SOURCE = { bundled: 'bundled', supabase: 'supabase' }

export let CATEGORIES = SEED_CATEGORIES
export let PRODUCTS = SEED_PRODUCTS
export let INGREDIENT_LIST = SEED_INGREDIENTS
export let CERT_LIST = SEED_CERTS
export let ARTICLES = SEED_ARTICLES
export let VERIFIABLE_CERTS = SEED_CERTS.filter((c) => c.rigor === 'third-party')

export let source = SOURCE.bundled
export let loadError = null

let ingredientsById = new Map(SEED_INGREDIENTS.map((i) => [i.id, i]))
let certificationsById = new Map(SEED_CERTS.map((c) => [c.id, c]))
let productsById = new Map(SEED_PRODUCTS.map((p) => [p.id, p]))
let articlesBySlug = new Map(SEED_ARTICLES.map((a) => [a.slug, a]))

function reindex() {
  ingredientsById = new Map(INGREDIENT_LIST.map((i) => [i.id, i]))
  certificationsById = new Map(CERT_LIST.map((c) => [c.id, c]))
  productsById = new Map(PRODUCTS.map((p) => [p.id, p]))
  articlesBySlug = new Map(ARTICLES.map((a) => [a.slug, a]))
  VERIFIABLE_CERTS = CERT_LIST.filter((c) => c.rigor === 'third-party')
}

export function ingredient(id) {
  return ingredientsById.get(id)
}

export function certification(id) {
  return certificationsById.get(id)
}

export function product(id) {
  return productsById.get(id)
}

export function article(slug) {
  return articlesBySlug.get(slug)
}

export function familyMembers(family) {
  return INGREDIENT_LIST.filter((i) => i.family === family)
}

/**
 * Articles worth putting under an answer: matched on the concerns that answer
 * actually raised, so the reading is relevant rather than generic.
 */
export function articlesFor({ families = [], subcategory = null } = {}) {
  const wanted = new Set(families)
  return ARTICLES.filter(
    (a) =>
      (a.tags?.families ?? []).some((f) => wanted.has(f)) ||
      (subcategory && (a.tags?.subcategories ?? []).includes(subcategory)),
  ).slice(0, 2)
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

/** Map database rows back onto the shapes the app already reasons about. */
function productFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category_id,
    subcategory: row.subcategory,
    tags: row.tags ?? [],
    price: Number(row.price),
    size: row.size,
    ingredients: row.ingredient_ids ?? [],
    certifications: row.certification_ids ?? [],
    claims: row.claim_ids ?? [],
    image: row.image,
    summary: row.summary,
  }
}

function articleFromRow(row) {
  return {
    slug: row.slug,
    kicker: row.kicker,
    title: row.title,
    dek: row.dek,
    author: row.author,
    role: row.role,
    date: row.date_label,
    readingTime: row.reading_time,
    hero: row.hero,
    pullQuote: row.pull_quote,
    tags: {
      families: row.tag_families ?? [],
      subcategories: row.tag_subcategories ?? [],
    },
    body: row.body ?? [],
  }
}

let loading = null

/**
 * Load once. Resolves to the source that ended up live, never rejects — a
 * catalog that fails to load falls back to bundled data rather than taking the
 * store down, and says which one it is.
 */
export function loadCatalog() {
  if (loading) return loading

  loading = (async () => {
    if (!isConfigured) {
      loadError = 'Supabase is not configured.'
      return SOURCE.bundled
    }

    try {
      const [categories, ingredients, certifications, products, articles] =
        await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('ingredients').select('*'),
          supabase.from('certifications').select('*'),
          supabase.from('products').select('*'),
          supabase.from('articles').select('*').order('sort_order'),
        ])

      const failed = [categories, ingredients, certifications, products, articles]
        .map((r) => r.error)
        .find(Boolean)
      if (failed) throw failed

      if (!products.data?.length) {
        throw new Error('The catalog tables are empty.')
      }

      CATEGORIES = categories.data.map((row) => ({
        id: row.id,
        name: row.name,
        subcategories: row.subcategories ?? [],
      }))
      INGREDIENT_LIST = ingredients.data
      CERT_LIST = certifications.data
      PRODUCTS = products.data.map(productFromRow)
      ARTICLES = articles.data.map(articleFromRow)
      reindex()

      source = SOURCE.supabase
      loadError = null
      return SOURCE.supabase
    } catch (error) {
      // PGRST205 is "table not in the schema cache" — i.e. the SQL has not
      // been run. Worth naming precisely, because the fix is one paste.
      const missing = error?.code === 'PGRST205'
      loadError = missing
        ? 'The catalog tables do not exist yet. Run supabase/catalog.sql.'
        : (error?.message ?? String(error))
      console.warn('[clean-shopper] Catalog fell back to bundled data.', error)
      return SOURCE.bundled
    }
  })()

  return loading
}

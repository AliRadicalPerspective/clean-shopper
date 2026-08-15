import { PRODUCTS, CATEGORIES, INGREDIENT_LIST, articlesFor } from './catalog.js'
import { evaluateProduct, exclusionReason, DISPOSITION } from './evaluate.js'

/**
 * The research service.
 *
 * Mock data behind an async interface, on purpose: the shape here is what a
 * real Claude call would return, so wiring one in later means replacing the
 * body of `research()` and nothing above it.
 *
 * The result is verdict-first — one pick, a couple of alternates, and the
 * products that were set aside with the reason why. Showing the discards is
 * what makes the shortlist believable.
 *
 * Turns are threaded: `context` carries the previous answer's category, the
 * avoidances accumulated so far, and what was picked, so a follow-up like
 * "something cheaper" or "without fragrance" resolves against the last answer
 * instead of starting from nothing.
 */

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'best', 'but', 'by', 'can', 'find',
  'for', 'from', 'get', 'good', 'has', 'have', 'i', 'in', 'is', 'it', 'looking',
  'me', 'my', 'need', 'of', 'on', 'or', 'our', 'show', 'some', 'something',
  'that', 'the', 'to', 'want', 'was', 'we', 'what', 'which', 'with', 'you',
  'your',
])

const NEGATIONS = ['without', 'no', 'free', 'avoid', 'not', 'skip', 'minus']

/** Phrases that only make sense as a follow-up to a previous answer. */
const FOLLOW_UP =
  /\b(cheaper|less expensive|budget|affordable|another|other one|alternative|alternatives|instead|something else|anything else|different|what about|how about)\b/i

/** A question that opens with an exclusion is refining what came before. */
const NEGATION_LED = /^\s*(without|no|not|avoid|skip)\b/i

const CHEAPER = /\b(cheaper|less expensive|budget|affordable|lower price)\b/i
const ANOTHER =
  /\b(another|other one|alternative|alternatives|instead|something else|anything else|different)\b/i

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/**
 * Reads avoidance out of the question itself — "dish soap without sulfates"
 * should behave like the sulfate preference is switched on, just for this
 * search. Detected families are returned separately so the UI can show that
 * they came from the query and not from saved settings.
 */
function familiesFromQuery(query) {
  const text = query.toLowerCase()
  const found = new Set()

  INGREDIENT_LIST.forEach((i) => {
    const names = [i.name, ...i.aliases, i.family]
    names.forEach((name) => {
      const needle = name.toLowerCase()
      const at = text.indexOf(needle)
      if (at === -1) return
      // Only treat it as avoidance if a negation sits near the mention.
      const window = text.slice(Math.max(0, at - 24), at + needle.length + 12)
      if (NEGATIONS.some((n) => window.includes(n))) found.add(i.family)
    })
  })

  return [...found]
}

function relevance(product, tokens) {
  let score = 0
  const category = CATEGORIES.find((c) => c.id === product.category)

  tokens.forEach((token) => {
    if (product.subcategory.includes(token)) score += 6
    if (product.tags.some((tag) => tag.includes(token))) score += 4
    if (product.brand.toLowerCase().includes(token)) score += 4
    if (product.name.toLowerCase().includes(token)) score += 3
    if (category?.name.toLowerCase().includes(token)) score += 2
    if (product.summary.toLowerCase().includes(token)) score += 1
  })

  return score
}

function interpret(product) {
  const category = CATEGORIES.find((c) => c.id === product.category)
  return `${category?.name ?? product.category} · ${product.subcategory}`
}

export const SUGGESTIONS = [
  'An all-purpose spray with no fragrance',
  'Laundry detergent gentle enough for a newborn',
  'Something for grease that will not gas out the kitchen',
  'A bathroom cleaner without bleach',
  'Dish soap that will not wreck my hands',
  'Glass cleaner without ammonia',
]

/** Offered under an answer so follow-ups are discoverable, not guessed at. */
export function followUpsFor(result) {
  if (!result?.pick) return []
  const prompts = ['Something cheaper', 'Show me another option']

  // Only offer to drop a family we would actually argue about. Suggesting a
  // shopper avoid a low-concern ingredient manufactures a worry.
  const worthAvoiding = result.pick.concerns.find(
    (i) => i.level === 'high' || i.level === 'moderate',
  )
  if (worthAvoiding) prompts.push(`Without ${worthAvoiding.family}`)

  return prompts
}

/**
 * @returns {Promise<object>} the answer, plus `nextContext` for the turn after.
 */
export async function research(query, prefs, context = null) {
  // Deliberate latency. Research that returns instantly does not read as
  // research, and the loading state is part of the experience.
  await new Promise((resolve) => setTimeout(resolve, 900))

  const tokens = tokenize(query)
  const queryFamilies = familiesFromQuery(query)

  let ranked = PRODUCTS.map((product) => ({
    product,
    relevance: relevance(product, tokens),
  }))
    .filter((entry) => entry.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)

  const isFollowUp = Boolean(
    context &&
      (FOLLOW_UP.test(query) || NEGATION_LED.test(query) || !ranked.length),
  )

  if (isFollowUp) {
    ranked = PRODUCTS.filter(
      (p) => p.subcategory === context.subcategory,
    ).map((product) => ({ product, relevance: 1 }))
  }

  // Avoidances accumulate down the thread: ask for dish soap without sulfates,
  // then say "and without fragrance", and both hold.
  const carried = isFollowUp ? (context.families ?? []) : []
  const activeFamilies = [...new Set([...carried, ...queryFamilies])]

  const effectivePrefs = {
    ...prefs,
    avoidedFamilies: [
      ...new Set([...(prefs.avoidedFamilies ?? []), ...activeFamilies]),
    ],
  }

  if (!ranked.length) {
    return {
      query,
      interpreted: null,
      isFollowUp,
      queryFamilies: activeFamilies,
      pick: null,
      alternates: [],
      skipped: [],
      reading: [],
      appliedPreferences: describePreferences(prefs, activeFamilies),
      empty: true,
      nextContext: context,
    }
  }

  // Stay inside the category the top hit landed in — a question about dish
  // soap should not surface a floor cleaner because both are "unscented".
  const topCategory = ranked[0].product.category
  const topSub = ranked[0].product.subcategory
  const inSub = ranked.filter((e) => e.product.subcategory === topSub)
  const pool = (inSub.length > 1 ? inSub : ranked).filter(
    (e) => e.product.category === topCategory,
  )

  const evaluated = pool
    .map((entry) => ({
      ...evaluateProduct(entry.product, effectivePrefs),
      relevance: entry.relevance,
    }))
    .sort((a, b) => b.score - a.score)

  let viable = evaluated.filter((e) => e.disposition !== DISPOSITION.excluded)
  const excluded = evaluated.filter(
    (e) => e.disposition === DISPOSITION.excluded,
  )

  if (CHEAPER.test(query)) {
    viable = [...viable].sort((a, b) => a.product.price - b.product.price)
  }

  // "Show me another" demotes what was already recommended rather than
  // hiding it — it is still a legitimate option, just not the answer again.
  if (ANOTHER.test(query) && context?.pickId) {
    const previous = viable.filter((e) => e.product.id === context.pickId)
    viable = [
      ...viable.filter((e) => e.product.id !== context.pickId),
      ...previous,
    ]
  }

  const pick = viable[0] ?? null

  // A follow-up that lands on the same product has to say so. Silently
  // re-serving the previous answer reads as though the question was ignored.
  let note = null
  if (isFollowUp && !pick) {
    note = 'Nothing in this category clears your constraints now.'
  } else if (isFollowUp && pick && context?.pickId === pick.product.id) {
    if (CHEAPER.test(query)) {
      note = 'Nothing cheaper clears your constraints — still the pick.'
    } else if (ANOTHER.test(query)) {
      note = 'No other option here clears your constraints — still the pick.'
    } else {
      note = 'Still the pick after that change.'
    }
  }

  // Reading is matched to the concerns this answer actually raised, so the
  // Journal shows up where it explains something, not as a generic footer.
  const raisedFamilies = [
    ...new Set([
      ...activeFamilies,
      ...(pick?.concerns ?? []).map((i) => i.family),
      ...excluded.flatMap((e) => e.concerns.map((i) => i.family)),
    ]),
  ]
  const reading = articlesFor({
    families: raisedFamilies,
    subcategory: topSub,
  })

  return {
    query,
    interpreted: interpret(ranked[0].product),
    isFollowUp,
    note,
    reading,
    queryFamilies: activeFamilies,
    pick,
    alternates: viable.slice(1, 3),
    skipped: excluded.slice(0, 3).map((evaluation) => ({
      ...evaluation,
      reason: exclusionReason(evaluation),
    })),
    appliedPreferences: describePreferences(prefs, activeFamilies),
    empty: false,
    nextContext: {
      category: topCategory,
      subcategory: topSub,
      families: activeFamilies,
      pickId: pick?.product.id ?? null,
    },
  }
}

function describePreferences(prefs, queryFamilies) {
  const lines = []
  const avoided = prefs.avoidedFamilies ?? []
  const trusted = prefs.trustedBrands ?? []
  const required = prefs.requiredCertifications ?? []

  if (avoided.length) lines.push(`Avoiding ${avoided.join(', ')}`)
  if (queryFamilies.length)
    lines.push(`Avoiding ${queryFamilies.join(', ')} — from this conversation`)
  if (required.length)
    lines.push(
      `Requiring ${required.length} certification${required.length > 1 ? 's' : ''}`,
    )
  if (trusted.length) lines.push(`Favoring ${trusted.join(', ')}`)
  if (!lines.length) lines.push('No saved preferences applied yet')

  return lines
}

/** Side-by-side comparison, same evaluation logic, no ranking hidden from view. */
export async function compare(products, prefs) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const evaluated = products.map((p) => evaluateProduct(p, prefs))
  const viable = evaluated.filter((e) => e.disposition !== DISPOSITION.excluded)
  const winner = [...viable].sort((a, b) => b.score - a.score)[0] ?? null
  return { evaluated, winner }
}

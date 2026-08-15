import { LEVELS } from '../data/ingredients.js'
import { ingredient, certification } from './catalog.js'

/**
 * Scores one product against one shopper's saved preferences.
 *
 * Two things this deliberately does not do: reduce a product to a single
 * number shown to the user, and treat a self-declared marketing claim as
 * evidence of anything. Both are how the category currently misleads people.
 */

export const DISPOSITION = {
  clear: 'clear',
  caution: 'caution',
  excluded: 'excluded',
}

export function evaluateProduct(product, prefs) {
  const avoided = new Set(prefs.avoidedFamilies ?? [])
  const required = prefs.requiredCertifications ?? []
  const trusted = (prefs.trustedBrands ?? []).map((b) => b.toLowerCase())

  const resolved = product.ingredients.map(ingredient).filter(Boolean)

  const concerns = resolved
    .filter((i) => i.level !== 'clear')
    .sort((a, b) => LEVELS[b.level].rank - LEVELS[a.level].rank)

  const cleared = resolved.filter((i) => i.level === 'clear')

  // The avoidance match is on family, never on the literal name the shopper
  // typed — "no parabens" has to catch butylparaben without them knowing it.
  const flagged = resolved.filter((i) => avoided.has(i.family))

  const certs = product.certifications.map(certification).filter(Boolean)
  const unverifiedClaims = product.claims.map(certification).filter(Boolean)

  const matchedCerts = required.filter((id) =>
    product.certifications.includes(id),
  )
  const missingCerts = required.filter(
    (id) => !product.certifications.includes(id),
  )

  const trustedBrand = trusted.includes(product.brand.toLowerCase())

  let score = 100
  flagged.forEach(() => (score -= 22))
  concerns.forEach((i) => (score -= LEVELS[i.level].rank * 6))
  missingCerts.forEach(() => (score -= 10))
  unverifiedClaims.forEach(() => (score -= 4))
  score += Math.min(certs.length * 6, 18)
  if (trustedBrand) score += 8
  score = Math.max(0, Math.min(100, score))

  let disposition = DISPOSITION.clear
  if (flagged.length || missingCerts.length) {
    disposition = DISPOSITION.excluded
  } else if (concerns.some((i) => i.level === 'high')) {
    disposition = DISPOSITION.caution
  }

  return {
    product,
    resolved,
    concerns,
    cleared,
    flagged,
    certs,
    unverifiedClaims,
    matchedCerts,
    missingCerts,
    trustedBrand,
    score,
    disposition,
    highestConcern: concerns[0]?.level ?? 'clear',
  }
}

/** One sentence explaining why a product was set aside. */
export function exclusionReason(evaluation) {
  const { flagged, missingCerts } = evaluation
  if (flagged.length) {
    const names = flagged.map((i) => i.name).join(', ')
    const families = [...new Set(flagged.map((i) => i.family))]
    // Avoid "Contains Fragrance — you're avoiding fragrance."
    if (families.length === 1 && names.toLowerCase() === families[0]) {
      return `Contains ${names}, which you're avoiding.`
    }
    return `Contains ${names} — you're avoiding ${families.join(' and ')}.`
  }
  if (missingCerts.length) {
    const names = missingCerts
      .map((id) => certification(id)?.name)
      .filter(Boolean)
      .join(', ')
    return `Not certified ${names}, which you've set as required.`
  }
  return 'Set aside on your preferences.'
}

/**
 * The case for a recommendation, as short declarative lines.
 * Positives first, then the caveat — a recommendation that hides its caveat
 * is worth nothing the first time the shopper finds it themselves.
 */
export function reasoning(evaluation) {
  const lines = []
  const { product, concerns, cleared, certs, trustedBrand, matchedCerts } =
    evaluation

  if (!concerns.length) {
    lines.push({
      kind: 'for',
      text: `Every one of the ${cleared.length} ingredients is disclosed and carries no known concern.`,
    })
  } else {
    const worst = concerns[0]
    lines.push({
      kind: 'for',
      text: `${cleared.length} of ${evaluation.resolved.length} ingredients are clear; the rest sit at ${LEVELS[worst.level].label.toLowerCase()} or below.`,
    })
  }

  if (trustedBrand) {
    lines.push({ kind: 'for', text: `${product.brand} is a brand you trust.` })
  }

  if (matchedCerts.length) {
    lines.push({
      kind: 'for',
      text: `Carries ${matchedCerts.map((id) => certification(id)?.name).join(' and ')} — the certification you asked for.`,
    })
  } else if (certs.length) {
    lines.push({
      kind: 'for',
      text: `Reviewed by ${certs.map((c) => c.body).join(' and ')}, not just by the brand.`,
    })
  }

  if (!certs.length) {
    lines.push({
      kind: 'against',
      text: 'No third-party certification — this assessment rests on the ingredient list alone.',
    })
  }

  concerns
    .filter((i) => i.level === 'high' || i.level === 'moderate')
    .slice(0, 2)
    .forEach((i) =>
      lines.push({
        kind: 'against',
        text: `${i.name} is present. ${i.why}`,
      }),
    )

  return lines
}

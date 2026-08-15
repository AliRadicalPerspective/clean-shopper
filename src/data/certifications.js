/**
 * Certifications, treated as what they actually are: delegated trust.
 *
 * `rigor` is the point of this file. A mark backed by an audit and a phrase a
 * brand printed on its own bottle are different objects, and a shopper who
 * cannot tell them apart is the shopper this store exists for. They are never
 * rendered in the same list.
 */

export const CERTIFICATIONS = {
  'safer-choice': {
    id: 'safer-choice',
    name: 'EPA Safer Choice',
    body: 'US Environmental Protection Agency',
    rigor: 'third-party',
    covers: 'ingredients',
    what: 'Every ingredient reviewed by EPA scientists against safer-chemistry criteria, with full disclosure required. The most relevant mark there is for household cleaning.',
  },
  'green-seal': {
    id: 'green-seal',
    name: 'Green Seal',
    body: 'Green Seal, Inc.',
    rigor: 'third-party',
    covers: 'ingredients and performance',
    what: 'Sets limits on toxicity and VOCs, and — unusually — requires the product to prove it actually cleans before it can carry the mark.',
  },
  'ewg-verified': {
    id: 'ewg-verified',
    name: 'EWG Verified',
    body: 'Environmental Working Group',
    rigor: 'third-party',
    covers: 'ingredients',
    what: 'Full ingredient disclosure required, including what is inside any fragrance, and nothing on EWG’s restricted list. Reviewed annually.',
  },
  'made-safe': {
    id: 'made-safe',
    name: 'MADE SAFE',
    body: 'Nontoxic Certified',
    rigor: 'third-party',
    covers: 'ingredients',
    what: 'Screens every ingredient against a banned-substances list running to several thousand entries.',
  },
  'cradle-to-cradle': {
    id: 'cradle-to-cradle',
    name: 'Cradle to Cradle Certified',
    body: 'Cradle to Cradle Products Innovation Institute',
    rigor: 'third-party',
    covers: 'materials and packaging',
    what: 'Assesses material health, water stewardship and packaging circularity. Says as much about the bottle as about what is in it.',
  },
  'eu-ecolabel': {
    id: 'eu-ecolabel',
    name: 'EU Ecolabel',
    body: 'European Commission',
    rigor: 'third-party',
    covers: 'lifecycle',
    what: 'Caps aquatic toxicity and requires biodegradability across the whole product lifecycle, verified by an accredited body.',
  },
  rspo: {
    id: 'rspo',
    name: 'RSPO Certified',
    body: 'Roundtable on Sustainable Palm Oil',
    rigor: 'third-party',
    covers: 'sourcing',
    what: 'Traces palm-derived surfactants to plantations meeting no-deforestation criteria. Chain-of-custody models vary in strength.',
  },
  'leaping-bunny': {
    id: 'leaping-bunny',
    name: 'Leaping Bunny',
    body: 'Cruelty Free International',
    rigor: 'third-party',
    covers: 'animal welfare',
    what: 'No animal testing at any stage, verified by supply-chain audit. Unrelated to ingredient safety.',
  },
  'b-corp': {
    id: 'b-corp',
    name: 'B Corp',
    body: 'B Lab',
    rigor: 'third-party',
    covers: 'the company',
    what: 'Audits the business — governance, workers, environment. Says nothing whatsoever about what is in the bottle.',
  },

  // Marketing language, cataloged so it can be named as such.
  'clean-claim': {
    id: 'clean-claim',
    name: '“Clean”',
    body: 'The brand itself',
    rigor: 'self-declared',
    covers: 'nothing',
    what: 'No legal definition, no certifying body, no test to fail. Anyone may print it on anything.',
  },
  'natural-claim': {
    id: 'natural-claim',
    name: '“All natural”',
    body: 'The brand itself',
    rigor: 'self-declared',
    covers: 'nothing',
    what: 'Unregulated outside of meat and poultry labeling. Carries no verifiable meaning on a cleaning product.',
  },
  'plant-based-claim': {
    id: 'plant-based-claim',
    name: '“Plant-based”',
    body: 'The brand itself',
    rigor: 'self-declared',
    covers: 'nothing',
    what: 'Describes where a molecule started, not what it does. A harsh surfactant derived from coconut is still a harsh surfactant, and the claim survives if a single ingredient qualifies.',
  },
  'nontoxic-claim': {
    id: 'nontoxic-claim',
    name: '“Non-toxic”',
    body: 'The brand itself',
    rigor: 'self-declared',
    covers: 'nothing',
    what: 'Has a narrow legal meaning under federal hazard labeling and a much broader marketing one. On a front label it is the marketing meaning.',
  },
  'eco-claim': {
    id: 'eco-claim',
    name: '“Eco-friendly”',
    body: 'The brand itself',
    rigor: 'self-declared',
    covers: 'nothing',
    what: 'The FTC’s Green Guides discourage unqualified environmental claims precisely because they cannot be substantiated. Widely used anyway.',
  },
}

export const CERT_LIST = Object.values(CERTIFICATIONS)

/** The ones worth offering as a saved preference — marketing language excluded. */
export const VERIFIABLE_CERTS = CERT_LIST.filter(
  (c) => c.rigor === 'third-party',
)

export function certification(id) {
  return CERTIFICATIONS[id]
}

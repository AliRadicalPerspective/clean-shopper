/**
 * Ingredient reference library for household cleaning products.
 *
 * `aliases` exists because the ingredient a shopper wants to avoid is rarely
 * printed under the name they know. "No quats" has to catch benzalkonium
 * chloride without the shopper naming it — so avoidance is matched on
 * `family`, never on a literal string.
 *
 * `level` is a coarse, honest scale. `confidence` travels with it on purpose:
 * much of this evidence is contested, and a verdict without its confidence is
 * a lie of precision.
 *
 * `dimension` separates the two ways a cleaning ingredient can be a problem —
 * what it does to the person using it, and what it does downstream once it
 * goes down the drain. They are not the same question.
 */

export const LEVELS = {
  high: { label: 'High concern', rank: 3 },
  moderate: { label: 'Moderate concern', rank: 2 },
  low: { label: 'Low concern', rank: 1 },
  clear: { label: 'No known concern', rank: 0 },
}

export const CONFIDENCE = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
}

const RAW = [
  // ——— Surfactants
  {
    id: 'sls',
    name: 'Sodium lauryl sulfate',
    aliases: ['SLS', 'sodium dodecyl sulfate'],
    family: 'sulfates',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'A strong detergent surfactant that cuts grease well and strips skin just as efficiently. Well documented as a skin and eye irritant at the concentrations used in dish liquid.',
  },
  {
    id: 'sles',
    name: 'Sodium laureth sulfate',
    aliases: ['SLES', 'sodium lauryl ether sulfate'],
    family: 'sulfates',
    level: 'moderate',
    dimension: 'health',
    confidence: 'moderate',
    why: 'Milder on skin than SLS, but made by ethoxylation, which can leave trace 1,4-dioxane behind unless the manufacturer strips it. Purity depends entirely on process disclosure.',
  },
  {
    id: 'als',
    name: 'Ammonium lauryl sulfate',
    aliases: ['ALS'],
    family: 'sulfates',
    level: 'moderate',
    dimension: 'health',
    confidence: 'moderate',
    why: 'The same irritation profile as other sulfate surfactants, used where a denser, longer-lasting foam is wanted.',
  },
  {
    id: 'coco-glucoside',
    name: 'Coco-glucoside',
    aliases: ['coco glucoside', 'decyl glucoside'],
    family: 'sugar surfactants',
    level: 'clear',
    dimension: 'health',
    confidence: 'moderate',
    why: 'Sugar surfactant made from coconut and corn, used as the sulfate replacement in most fragrance-free formulas. Readily biodegradable, no meaningful irritation signal.',
  },
  {
    id: 'alcohol-ethoxylates',
    name: 'Alcohol ethoxylates',
    aliases: ['C12-16 pareth', 'laureth-7'],
    family: 'ethoxylates',
    level: 'low',
    dimension: 'health',
    confidence: 'moderate',
    why: 'Workhorse non-ionic surfactants in all-purpose sprays. Low concern in themselves; as with any ethoxylated ingredient, the open question is residual 1,4-dioxane from manufacturing.',
  },
  {
    id: 'npe',
    name: 'Nonylphenol ethoxylates',
    aliases: ['NPE', 'nonoxynol'],
    family: 'ethoxylates',
    level: 'high',
    dimension: 'both',
    confidence: 'strong',
    why: 'Break down in water into nonylphenol, which is persistent and hormonally active in fish at very low concentrations. Phased out across the EU and voluntarily abandoned by most US manufacturers — its presence signals an old formula.',
  },

  // ——— Preservatives
  {
    id: 'mit',
    name: 'Methylisothiazolinone',
    aliases: ['MIT', 'MI'],
    family: 'isothiazolinones',
    level: 'high',
    dimension: 'health',
    confidence: 'strong',
    why: 'A potent contact allergen. Sensitization rates climbed sharply after it replaced parabens across household and rinse-off products, to the point that dermatology bodies called it an epidemic. Restricted in leave-on products in the EU.',
  },
  {
    id: 'bit',
    name: 'Benzisothiazolinone',
    aliases: ['BIT'],
    family: 'isothiazolinones',
    level: 'moderate',
    dimension: 'health',
    confidence: 'moderate',
    why: 'The same chemical family as MIT and a recognized contact allergen, though sensitization appears less frequent. Common in laundry liquids and pods.',
  },
  {
    id: 'methylparaben',
    name: 'Methylparaben',
    aliases: ['methyl paraben'],
    family: 'parabens',
    level: 'moderate',
    dimension: 'health',
    confidence: 'moderate',
    why: 'The shortest-chain paraben and the least hormonally active. An effective preservative; the endocrine signal weakens considerably at this chain length.',
  },
  {
    id: 'propylparaben',
    name: 'Propylparaben',
    aliases: ['propyl paraben'],
    family: 'parabens',
    level: 'high',
    dimension: 'health',
    confidence: 'moderate',
    why: 'A longer-chain paraben with measurable estrogenic activity in laboratory studies. Restricted in some jurisdictions; the human-exposure picture is still debated.',
  },
  {
    id: 'butylparaben',
    name: 'Butylparaben',
    aliases: ['butyl paraben'],
    family: 'parabens',
    level: 'high',
    dimension: 'health',
    confidence: 'moderate',
    why: 'The most hormonally active of the common parabens in laboratory assays. Increasingly reformulated out even where it remains legal.',
  },
  {
    id: 'dmdm-hydantoin',
    name: 'DMDM hydantoin',
    aliases: ['DMDM'],
    family: 'formaldehyde releasers',
    level: 'high',
    dimension: 'health',
    confidence: 'strong',
    why: 'Preserves by slowly releasing formaldehyde, a recognized human carcinogen by inhalation. The releasing mechanism is not in dispute; the exposure level is.',
  },
  {
    id: 'quaternium-15',
    name: 'Quaternium-15',
    aliases: [],
    family: 'formaldehyde releasers',
    level: 'high',
    dimension: 'health',
    confidence: 'strong',
    why: 'Another formaldehyde-releasing preservative, and among the more common causes of preservative contact allergy.',
  },
  {
    id: 'phenoxyethanol',
    name: 'Phenoxyethanol',
    aliases: [],
    family: 'glycol ethers',
    level: 'low',
    dimension: 'health',
    confidence: 'moderate',
    why: 'A broad-spectrum preservative capped at 1% in most markets and generally well tolerated at that limit. Worth knowing it is there; rarely worth avoiding.',
  },

  // ——— Disinfectants and antibacterials
  {
    id: 'sodium-hypochlorite',
    name: 'Sodium hypochlorite',
    aliases: ['chlorine bleach', 'bleach'],
    family: 'chlorine bleach',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'Genuinely effective disinfection, and the reason bleach still has a place. Irritating to airways in use, and forms chloramine gas if it meets ammonia — a handling risk rather than a residue risk.',
  },
  {
    id: 'benzalkonium-chloride',
    name: 'Benzalkonium chloride',
    aliases: ['quats', 'quaternary ammonium compounds', 'ADBAC'],
    family: 'quats',
    level: 'high',
    dimension: 'both',
    confidence: 'moderate',
    why: 'The disinfectant in most "kills 99.9%" sprays. Repeated occupational exposure is linked to asthma, and heavy household use is implicated in bacterial resistance. Persists on surfaces long after the spray has dried.',
  },
  {
    id: 'triclosan',
    name: 'Triclosan',
    aliases: [],
    family: 'antibacterials',
    level: 'high',
    dimension: 'both',
    confidence: 'strong',
    why: 'Banned from consumer hand soap by the FDA in 2016 after manufacturers failed to show it beat plain soap and water. Persistent in waterways and implicated in resistance. Still turns up in some surface products.',
  },
  {
    id: 'hydrogen-peroxide',
    name: 'Hydrogen peroxide',
    aliases: [],
    family: 'oxygen bleach',
    level: 'low',
    dimension: 'health',
    confidence: 'strong',
    why: 'Disinfects and whitens, then breaks down into water and oxygen. Irritating at high concentration, unremarkable at household strength.',
  },

  // ——— Solvents and caustics
  {
    id: 'butoxyethanol',
    name: '2-Butoxyethanol',
    aliases: ['butyl cellosolve', 'ethylene glycol monobutyl ether'],
    family: 'glycol ethers',
    level: 'high',
    dimension: 'health',
    confidence: 'strong',
    why: 'The solvent that makes heavy-duty degreasers work. Absorbed through skin as well as inhaled, and associated with blood-cell effects at occupational exposures. Ventilation is not optional with this one.',
  },
  {
    id: 'ammonia',
    name: 'Ammonia',
    aliases: ['ammonium hydroxide'],
    family: 'ammonia',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'Cuts grease and dries without streaking, which is why it persists in glass cleaner. A sharp respiratory irritant, and produces toxic chloramine gas if it meets bleach.',
  },
  {
    id: 'sodium-hydroxide',
    name: 'Sodium hydroxide',
    aliases: ['caustic soda', 'lye'],
    family: 'caustics',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'Strongly caustic, and the active in oven and drain products. Causes burns on contact at working strength; used at a fraction of a percent elsewhere as a pH adjuster, where it is unremarkable.',
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    aliases: ['alcohol', 'ethyl alcohol'],
    family: 'alcohols',
    level: 'low',
    dimension: 'health',
    confidence: 'strong',
    why: 'Evaporates clean and leaves no film, which is what a glass cleaner needs. Flammable in concentrate; no residue concern.',
  },

  // ——— Fragrance
  {
    id: 'fragrance',
    name: 'Fragrance',
    aliases: ['parfum', 'perfume', 'aroma', 'fragrance (parfum)'],
    family: 'fragrance',
    level: 'high',
    dimension: 'health',
    confidence: 'moderate',
    why: 'Not one ingredient — a trade-secret blend that can hold dozens of undisclosed components, including phthalates and known allergens. The concern is the non-disclosure itself: this ingredient cannot be evaluated, only trusted.',
  },
  {
    id: 'essential-oils',
    name: 'Essential oil blend',
    aliases: ['essential oils', 'botanical extracts'],
    family: 'botanical fragrance',
    level: 'low',
    dimension: 'health',
    confidence: 'limited',
    why: 'Disclosed botanicals, which is a real improvement on a trade-secret blend — you can at least see what is in it. Still fragrance, though, and still capable of triggering a reaction in people who are sensitized.',
  },
  {
    id: 'limonene',
    name: 'Limonene',
    aliases: ['d-limonene'],
    family: 'fragrance allergens',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'The citrus note in most kitchen sprays, and a capable degreaser in its own right. Oxidizes on contact with air into a recognized contact allergen, which is why EU rules require it to be named.',
  },
  {
    id: 'linalool',
    name: 'Linalool',
    aliases: [],
    family: 'fragrance allergens',
    level: 'moderate',
    dimension: 'health',
    confidence: 'strong',
    why: 'A floral note with the same oxidation-to-allergen behavior as limonene, and declared under the same EU rules.',
  },

  // ——— Builders, chelators and additives
  {
    id: 'phosphates',
    name: 'Phosphates',
    aliases: ['sodium tripolyphosphate', 'STPP'],
    family: 'phosphates',
    level: 'moderate',
    dimension: 'environment',
    confidence: 'strong',
    why: 'Excellent water softeners with no meaningful health concern, and a serious downstream one: they drive algal blooms and oxygen collapse in freshwater. Restricted in laundry and dish detergents across many states and markets.',
  },
  {
    id: 'edta',
    name: 'EDTA',
    aliases: ['tetrasodium EDTA', 'disodium EDTA'],
    family: 'chelators',
    level: 'moderate',
    dimension: 'environment',
    confidence: 'moderate',
    why: 'Binds hard-water minerals so surfactants can work. Biodegrades poorly and can remobilize heavy metals already settled in sediment. Citrate and gluconate do the same job and break down.',
  },
  {
    id: 'optical-brighteners',
    name: 'Optical brighteners',
    aliases: ['fluorescent whitening agents', 'stilbene'],
    family: 'optical brighteners',
    level: 'moderate',
    dimension: 'both',
    confidence: 'moderate',
    why: 'Do not clean anything. They deposit on fabric and fluoresce under daylight so whites read whiter, then persist in waterways. A cosmetic additive sold as cleaning performance.',
  },
  {
    id: 'enzymes',
    name: 'Enzymes',
    aliases: ['protease', 'amylase', 'lipase', 'subtilisin'],
    family: 'enzymes',
    level: 'low',
    dimension: 'health',
    confidence: 'moderate',
    why: 'Digest protein, starch and grease stains at low temperatures, which is how a cold wash gets clean. Respiratory sensitizers as an airborne dust in manufacturing; encapsulated in finished liquids, the risk is small.',
  },
  {
    id: 'pfas',
    name: 'PFAS',
    aliases: ['PTFE', 'perfluorinated compounds', 'fluorosurfactants'],
    family: 'pfas',
    level: 'high',
    dimension: 'both',
    confidence: 'strong',
    why: 'Used for water- and stain-repellency. They do not meaningfully break down, and accumulate in blood and drinking water. The persistence is beyond dispute.',
  },
  {
    id: 'palm-oil',
    name: 'Palm-derived surfactants',
    aliases: ['elaeis guineensis', 'palm kernel oil', 'sodium palmate'],
    family: 'palm derivatives',
    level: 'moderate',
    dimension: 'environment',
    confidence: 'strong',
    why: 'No health concern at all. The issue is upstream: uncertified palm is a leading driver of tropical deforestation. RSPO certification changes this assessment materially.',
  },

  // ——— Unremarkable, and worth saying so
  {
    id: 'citric-acid',
    name: 'Citric acid',
    aliases: [],
    family: 'acids',
    level: 'clear',
    dimension: 'health',
    confidence: 'strong',
    why: 'Dissolves limescale and soap scum, adjusts pH, and biodegrades completely. No concern.',
  },
  {
    id: 'sodium-bicarbonate',
    name: 'Sodium bicarbonate',
    aliases: ['baking soda'],
    family: 'mineral salts',
    level: 'clear',
    dimension: 'health',
    confidence: 'strong',
    why: 'A mild alkaline abrasive and deodorizer. No concern at use concentrations.',
  },
  {
    id: 'sodium-carbonate',
    name: 'Sodium carbonate',
    aliases: ['washing soda', 'soda ash'],
    family: 'mineral salts',
    level: 'clear',
    dimension: 'health',
    confidence: 'strong',
    why: 'Softens water and lifts grease in laundry and dishwasher formulas. Alkaline enough to warrant gloves in concentrate, unremarkable in use.',
  },
  {
    id: 'glycerin',
    name: 'Glycerin',
    aliases: ['glycerol', 'vegetable glycerin'],
    family: 'humectants',
    level: 'clear',
    dimension: 'health',
    confidence: 'strong',
    why: 'Keeps hand soap from drying skin and stops a formula separating. No concern; sourcing — palm or vegetable — is the only open question.',
  },
]

export const INGREDIENTS = Object.fromEntries(RAW.map((i) => [i.id, i]))

export const INGREDIENT_LIST = RAW

export const FAMILIES = [...new Set(RAW.map((i) => i.family))].sort()

/**
 * The families a shopper is plausibly trying to avoid, ordered the way someone
 * would actually think about them rather than alphabetically.
 */
export const AVOIDABLE_FAMILIES = [
  'fragrance',
  'isothiazolinones',
  'quats',
  'chlorine bleach',
  'ammonia',
  'glycol ethers',
  'sulfates',
  'formaldehyde releasers',
  'parabens',
  'antibacterials',
  'phosphates',
  'optical brighteners',
  'chelators',
  'ethoxylates',
  'pfas',
  'palm derivatives',
  'fragrance allergens',
  'botanical fragrance',
]

export function ingredient(id) {
  return INGREDIENTS[id]
}

/** Members of a family, used to show a shopper what a single toggle catches. */
export function familyMembers(family) {
  return RAW.filter((i) => i.family === family)
}

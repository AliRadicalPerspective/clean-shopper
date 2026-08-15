/**
 * The catalog: green household cleaning supplies.
 *
 * Every brand here is invented. Making a safety claim about a real product
 * from mock data would be the exact failure this store exists to fight, so the
 * ingredients and certifications are real reference concepts and the products
 * carrying them are not.
 *
 * `image` is a slot name from src/assets/images/index.js, or null — an unfilled
 * slot renders as a captioned frame rather than collapsing the layout.
 */

export const CATEGORIES = [
  {
    id: 'surfaces',
    name: 'Surfaces',
    subcategories: ['all-purpose', 'kitchen', 'bathroom', 'glass', 'floor'],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    subcategories: ['detergent', 'pods', 'stain remover'],
  },
  {
    id: 'dishwashing',
    name: 'Dishwashing',
    subcategories: ['dish liquid', 'dishwasher'],
  },
  {
    id: 'hands',
    name: 'Hands',
    subcategories: ['hand soap'],
  },
]

export const PRODUCTS = [
  // ——————————————————————— Surfaces
  {
    id: 'vessel-vine-all-purpose',
    name: 'Everyday All-Purpose Spray',
    brand: 'Vessel & Vine',
    category: 'surfaces',
    subcategory: 'all-purpose',
    tags: ['spray', 'counters', 'kitchen', 'bathroom', 'surface', 'unscented', 'fragrance-free', 'everyday'],
    price: 9,
    size: '25 fl oz',
    ingredients: ['coco-glucoside', 'citric-acid', 'sodium-bicarbonate'],
    certifications: ['safer-choice', 'b-corp'],
    claims: [],
    image: 'spray-lavender',
    summary:
      'Three working ingredients, all named on the bottle, and no fragrance of any kind. The EPA has reviewed every one of them.',
  },
  {
    id: 'northlight-multisurface',
    name: 'Multi-Surface Spray, Meadow',
    brand: 'Northlight',
    category: 'surfaces',
    subcategory: 'all-purpose',
    tags: ['spray', 'counters', 'kitchen', 'surface', 'scented', 'everyday'],
    price: 6,
    size: '25 fl oz',
    ingredients: ['coco-glucoside', 'fragrance', 'mit', 'citric-acid'],
    certifications: [],
    claims: ['natural-claim', 'clean-claim'],
    image: 'spray-blue-marble',
    summary:
      'A sound plant-derived surfactant base, undone by an undisclosed fragrance blend and the preservative dermatologists spent a decade warning about.',
  },
  {
    id: 'purecraft-disinfecting',
    name: 'Disinfecting Surface Spray',
    brand: 'Purecraft',
    category: 'surfaces',
    subcategory: 'all-purpose',
    tags: ['spray', 'disinfect', 'antibacterial', 'kitchen', 'bathroom', 'surface', 'germs'],
    price: 7,
    size: '32 fl oz',
    ingredients: ['benzalkonium-chloride', 'fragrance'],
    certifications: [],
    claims: ['nontoxic-claim'],
    image: 'shelf-spray-mint',
    summary:
      'Real disinfection, and a quat that stays on the counter long after the spray has dried. Worth reaching for during a stomach bug, not on a Tuesday.',
  },
  {
    id: 'ember-ash-degreaser',
    name: 'Kitchen Degreaser',
    brand: 'Ember & Ash',
    category: 'surfaces',
    subcategory: 'kitchen',
    tags: ['degreaser', 'grease', 'kitchen', 'stovetop', 'hob', 'oven', 'range'],
    price: 12,
    size: '25 fl oz',
    ingredients: ['alcohol-ethoxylates', 'sodium-carbonate', 'citric-acid', 'essential-oils'],
    certifications: ['safer-choice', 'green-seal'],
    claims: [],
    image: 'shelf-amber-bottles',
    summary:
      'Cuts baked-on grease without a glycol ether doing the work. Scented with a disclosed botanical blend rather than a trade secret.',
  },
  {
    id: 'cinder-degreaser',
    name: 'Heavy-Duty Degreaser',
    brand: 'Cinder',
    category: 'surfaces',
    subcategory: 'kitchen',
    tags: ['degreaser', 'grease', 'kitchen', 'oven', 'heavy duty', 'industrial'],
    price: 7,
    size: '32 fl oz',
    ingredients: ['butoxyethanol', 'fragrance', 'npe'],
    certifications: [],
    claims: ['plant-based-claim'],
    image: 'spray-amber-brush',
    summary:
      'The strongest degreaser in the catalog and the one we would most like you to open a window for. Sold as plant-based; the solvent doing the work is not the plant part.',
  },
  {
    id: 'slate-stem-bathroom',
    name: 'Bathroom Cleaner, Fragrance-Free',
    brand: 'Slate & Stem',
    category: 'surfaces',
    subcategory: 'bathroom',
    tags: ['bathroom', 'shower', 'tub', 'tile', 'limescale', 'soap scum', 'fragrance-free', 'unscented'],
    price: 11,
    size: '25 fl oz',
    ingredients: ['citric-acid', 'coco-glucoside', 'hydrogen-peroxide'],
    certifications: ['ewg-verified', 'safer-choice', 'leaping-bunny'],
    claims: [],
    image: 'bowl-droppers-lavender',
    summary:
      'Citric acid for the limescale, peroxide for the rest. Nothing here lingers in the air of a small room with the door shut.',
  },
  {
    id: 'halcyon-tub-tile',
    name: 'Tub & Tile Spray, Eucalyptus',
    brand: 'Halcyon',
    category: 'surfaces',
    subcategory: 'bathroom',
    tags: ['bathroom', 'shower', 'tub', 'tile', 'mold', 'mildew', 'scented', 'bleach'],
    price: 8,
    size: '32 fl oz',
    ingredients: ['sodium-hypochlorite', 'fragrance', 'sodium-hydroxide'],
    certifications: [],
    claims: ['eco-claim'],
    image: 'flatlay-mint-lemon',
    summary:
      'Genuinely effective on mildew, with the handling rules chlorine bleach always carries. The eucalyptus is doing reassurance work the formula has not earned.',
  },
  {
    id: 'clearwater-glass',
    name: 'Glass & Mirror Cleaner',
    brand: 'Clearwater',
    category: 'surfaces',
    subcategory: 'glass',
    tags: ['glass', 'mirror', 'window', 'streak-free', 'shine', 'fragrance-free'],
    price: 8,
    size: '25 fl oz',
    ingredients: ['ethanol', 'citric-acid', 'coco-glucoside'],
    certifications: ['safer-choice', 'cradle-to-cradle'],
    claims: [],
    image: 'bottle-green-rain',
    summary:
      'Alcohol flashes off before it can leave a film, which is the whole trick. No ammonia, so it can share a cupboard with bleach safely.',
  },
  {
    id: 'brightline-glass',
    name: 'Streak-Free Glass Cleaner',
    brand: 'Brightline',
    category: 'surfaces',
    subcategory: 'glass',
    tags: ['glass', 'mirror', 'window', 'streak-free', 'shine', 'ammonia'],
    price: 5,
    size: '32 fl oz',
    ingredients: ['ammonia', 'fragrance', 'limonene'],
    certifications: [],
    claims: ['clean-claim'],
    image: 'spray-blue-lime',
    summary:
      'The blue bottle your parents used, in quieter packaging. Never store it near chlorine bleach.',
  },
  {
    id: 'fieldhouse-floor',
    name: 'Floor Cleaner Concentrate',
    brand: 'Fieldhouse',
    category: 'surfaces',
    subcategory: 'floor',
    tags: ['floor', 'mop', 'hardwood', 'tile', 'laminate', 'concentrate', 'refill'],
    price: 16,
    size: '16 fl oz — makes 8 gallons',
    ingredients: ['coco-glucoside', 'citric-acid', 'glycerin', 'essential-oils'],
    certifications: ['green-seal', 'eu-ecolabel', 'b-corp'],
    claims: [],
    image: 'bottles-herb-infused',
    summary:
      'A capful to a bucket, so you ship water once instead of eight times. Green Seal is the only mark here that also tests whether it cleans.',
  },

  // ——————————————————————— Laundry
  {
    id: 'meadowrun-laundry',
    name: 'Concentrated Laundry Liquid, Unscented',
    brand: 'Meadowrun',
    category: 'laundry',
    subcategory: 'detergent',
    tags: ['laundry', 'detergent', 'washing', 'clothes', 'unscented', 'fragrance-free', 'sensitive', 'baby', 'newborn'],
    price: 18,
    size: '50 fl oz — 64 loads',
    ingredients: ['coco-glucoside', 'enzymes', 'citric-acid', 'glycerin'],
    certifications: ['safer-choice', 'made-safe', 'leaping-bunny'],
    claims: [],
    image: 'dropper-towels',
    summary:
      'No fragrance, no optical brighteners, no phosphates. Enzymes do the lifting, which is why it works in a cold wash.',
  },
  {
    id: 'brightfold-pods',
    name: 'Laundry Pods, Linen Breeze',
    brand: 'Brightfold',
    category: 'laundry',
    subcategory: 'pods',
    tags: ['laundry', 'detergent', 'pods', 'capsules', 'washing', 'clothes', 'scented'],
    price: 14,
    size: '42 pods',
    ingredients: ['als', 'fragrance', 'bit', 'phosphates', 'optical-brighteners', 'limonene'],
    certifications: [],
    claims: ['clean-claim'],
    image: 'basket-pods-linen',
    summary:
      'Marketed as clean, and carrying an undisclosed fragrance blend, a declared allergen, a sensitizing preservative, phosphates, and brighteners that only make whites look washed.',
  },
  {
    id: 'tallgrass-stain',
    name: 'Enzyme Stain Remover',
    brand: 'Tallgrass',
    category: 'laundry',
    subcategory: 'stain remover',
    tags: ['stain', 'spot', 'pre-treat', 'laundry', 'grass', 'wine', 'protein', 'fragrance-free'],
    price: 10,
    size: '16 fl oz',
    ingredients: ['enzymes', 'coco-glucoside', 'sodium-carbonate'],
    certifications: ['safer-choice'],
    claims: [],
    image: 'pump-fern',
    summary:
      'Three ingredients aimed squarely at protein stains. Nothing added to make it smell like it worked.',
  },

  // ——————————————————————— Dishwashing
  {
    id: 'basin-dish',
    name: 'Dish Liquid No. 1, Unscented',
    brand: 'Basin',
    category: 'dishwashing',
    subcategory: 'dish liquid',
    tags: ['dish', 'dishes', 'washing up', 'kitchen', 'sink', 'unscented', 'fragrance-free', 'hands'],
    price: 7,
    size: '18 fl oz',
    ingredients: ['coco-glucoside', 'glycerin', 'citric-acid', 'palm-oil'],
    certifications: ['safer-choice', 'rspo'],
    claims: [],
    image: 'hand-pump-amber',
    summary:
      'Clear on health grounds, and honest about the palm derivatives — certified through a no-deforestation chain of custody rather than left unmentioned.',
  },
  {
    id: 'lathermore-dish',
    name: 'Ultra Dish Soap, Green Apple',
    brand: 'Lathermore',
    category: 'dishwashing',
    subcategory: 'dish liquid',
    tags: ['dish', 'dishes', 'washing up', 'kitchen', 'sink', 'scented', 'suds', 'foam'],
    price: 4,
    size: '22 fl oz',
    ingredients: ['sls', 'fragrance', 'limonene', 'palm-oil'],
    certifications: [],
    claims: ['natural-claim'],
    image: 'bottle-citrus',
    summary:
      'The cheapest thing here per ounce, and the ingredient list explains why. Enormous suds, which is a marketing decision rather than a cleaning one.',
  },
  {
    id: 'corvid-dishwasher',
    name: 'Dishwasher Tablets, Unscented',
    brand: 'Corvid',
    category: 'dishwashing',
    subcategory: 'dishwasher',
    tags: ['dishwasher', 'tablets', 'tabs', 'machine', 'dishes', 'unscented', 'fragrance-free'],
    price: 15,
    size: '60 tablets',
    ingredients: ['sodium-carbonate', 'enzymes', 'citric-acid'],
    certifications: ['safer-choice', 'eu-ecolabel'],
    claims: [],
    image: 'jar-tablets-gel',
    summary:
      'Enzymes and washing soda, no chlorine and no phosphates. Wrapper dissolves; there is no plastic film to peel.',
  },
  {
    id: 'sunhill-dishwasher',
    name: 'Dishwasher Gel, Lavender',
    brand: 'Sunhill',
    category: 'dishwashing',
    subcategory: 'dishwasher',
    tags: ['dishwasher', 'gel', 'liquid', 'machine', 'dishes', 'scented', 'lavender'],
    price: 6,
    size: '75 fl oz',
    ingredients: ['sodium-hypochlorite', 'phosphates', 'fragrance', 'edta'],
    certifications: [],
    claims: ['eco-claim'],
    image: 'bottle-lavender-basket',
    summary:
      'Chlorine for the tea stains, phosphates for hard water, and an eco-friendly claim doing a great deal of unsupported work on the front label.',
  },

  // ——————————————————————— Hands
  {
    id: 'marrow-moss-handsoap',
    name: 'Hand Soap, Bare',
    brand: 'Marrow & Moss',
    category: 'hands',
    subcategory: 'hand soap',
    tags: ['hand soap', 'hands', 'sink', 'washing', 'fragrance-free', 'unscented', 'sensitive', 'dry skin'],
    price: 12,
    size: '12 fl oz',
    ingredients: ['coco-glucoside', 'glycerin', 'citric-acid', 'phenoxyethanol'],
    certifications: ['ewg-verified', 'b-corp'],
    claims: [],
    image: 'hand-lemons-moss',
    summary:
      'Four ingredients, one of them a preservative at the standard limit. Glycerin is why twenty washes a day does not leave your hands cracked.',
  },
  {
    id: 'ledger-handsoap',
    name: 'Foaming Hand Soap, Cedar',
    brand: 'Ledger',
    category: 'hands',
    subcategory: 'hand soap',
    tags: ['hand soap', 'hands', 'foaming', 'sink', 'washing', 'scented', 'antibacterial'],
    price: 6,
    size: '10 fl oz',
    ingredients: ['sles', 'fragrance', 'methylparaben', 'triclosan', 'linalool'],
    certifications: [],
    claims: ['nontoxic-claim'],
    image: 'foaming-pump-lemon',
    summary:
      'Carries an antibacterial the FDA removed from consumer hand soap in 2016, after manufacturers could not show it beat plain soap and water.',
  },
]

export function product(id) {
  return PRODUCTS.find((p) => p.id === id)
}

/**
 * The Journal — Clean Shopper's research desk.
 *
 * These pieces exist so the recommendations have something to stand on. When
 * an answer says a fragrance blend cannot be evaluated, there is a page here
 * explaining why, and the answer links to it.
 *
 * `tags.families` and `tags.subcategories` are how an article finds its way
 * into a relevant answer. All of it is written for this demo — the reporting
 * is invented, though the chemistry and the regulatory history are not.
 */

export const ARTICLES = [
  {
    slug: 'fragrance-is-not-an-ingredient',
    kicker: 'Ingredients',
    title: 'Fragrance is not an ingredient',
    dek: 'It is a legal container for up to several hundred of them, and none have to be named.',
    author: 'Della Marchetti',
    role: 'Research desk',
    date: 'March 2026',
    readingTime: '5 min',
    hero: 'editorial-journal',
    pullQuote:
      'Every other line on the label is a claim you can check. This one is a claim you have to take on trust.',
    tags: {
      families: ['fragrance', 'fragrance allergens', 'botanical fragrance'],
      subcategories: [],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'Read the back of almost any cleaning product and you will find a list of specific, checkable chemistry — then one word doing the work of a filing cabinet. Fragrance. Parfum, if the brand is feeling continental.',
          'That single word is permitted to stand in for a blend of dozens, occasionally hundreds, of separate compounds. Trade-secret protections mean none of them has to be disclosed. The label is not being evasive by accident; it is using a provision written into the rules.',
        ],
      },
      {
        heading: 'Why the exemption exists',
        paragraphs: [
          'The reasoning is old and not unreasonable on its face. A perfume house that spent years developing an accord did not want a competitor reading the recipe off a bottle. The protection was designed for perfume, where scent is the product.',
          'It was then inherited by the cleaning aisle, where scent is not the product at all. A surface spray does not need to smell like a meadow to work. The exemption survives there because nobody ever went back and asked whether it should.',
        ],
      },
      {
        heading: 'What can be inside',
        paragraphs: [
          'Phthalates, used to make a scent last longer on a surface. Synthetic musks, which accumulate. And a set of compounds the EU decided were significant enough to require by name — limonene and linalool among them — precisely because they oxidize in contact with air into recognized contact allergens.',
          'Those two are worth dwelling on. When you do see limonene printed on a label, that is not the manufacturer being unusually forthcoming. It is a disclosure rule catching one component of a blend that is otherwise invisible.',
        ],
      },
      {
        heading: 'The honest version',
        paragraphs: [
          'A disclosed botanical blend is a real improvement. If a bottle names the oils it used, you can look them up, and someone who reacts to one of them can avoid it. It is still fragrance, and it can still trigger a reaction — but it can be evaluated, and that is the whole difference.',
          'The strongest signal remains the simplest: a product with no fragrance at all has nothing to hide on this line, and nothing you need to trust it about.',
        ],
      },
      {
        heading: 'How we treat it',
        paragraphs: [
          'We flag undisclosed fragrance as high concern. Not because we know something bad is in a given bottle, but because the ingredient is structurally unassessable, and an assessment we cannot make is not one we will imply.',
        ],
      },
    ],
  },

  {
    slug: 'the-preservative-that-replaced-parabens',
    kicker: 'Ingredients',
    title: 'The preservative that replaced parabens',
    dek: 'Methylisothiazolinone was the answer to a consumer campaign. Then dermatologists started counting.',
    author: 'Della Marchetti',
    role: 'Research desk',
    date: 'February 2026',
    readingTime: '4 min',
    hero: null,
    pullQuote:
      'The substitution was not a conspiracy. It was a reformulation that answered the question being asked and missed the one that mattered.',
    tags: {
      families: ['isothiazolinones', 'parabens'],
      subcategories: [],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'In the late 2000s, parabens became the ingredient shoppers had heard of. Brands responded the way brands do: paraben-free went on the front of the bottle, and something else went into it.',
          'Very often that something else was methylisothiazolinone — MIT. It is a capable preservative, effective at low concentration, and it had a clean regulatory record at the time.',
        ],
      },
      {
        heading: 'What happened next',
        paragraphs: [
          'Contact dermatitis clinics across Europe and North America began recording a sharp climb in patients reacting to it. Within a few years, professional dermatology bodies were describing the rise in sensitization as an epidemic — an unusually strong word from an unusually cautious profession.',
          'Regulators followed. MIT was restricted in leave-on products in the EU and its permitted concentration in rinse-off products was cut. It remains legal in household cleaning products in much of the world.',
        ],
      },
      {
        heading: 'The part worth learning',
        paragraphs: [
          'Sensitization is not like irritation. Irritation is a dose response — enough of something bothers anyone. Sensitization is a switch. You can use a product for years with no trouble, cross a threshold, and then react to trace amounts of that compound anywhere you meet it, permanently.',
          'That is why a preservative allergen in a product you use weekly is a different proposition to one in a product you use once.',
        ],
      },
      {
        heading: 'How we treat it',
        paragraphs: [
          'MIT is high concern here and its relative benzisothiazolinone is moderate. Neither is an emergency. Both are avoidable, and in a category where alternatives exist and work, avoidable is the relevant fact.',
          'The wider lesson has outlived the ingredient: "free from" tells you what was taken out and nothing at all about what went in.',
        ],
      },
    ],
  },

  {
    slug: 'what-plant-based-does-not-tell-you',
    kicker: 'Claims',
    title: 'What “plant-based” does not tell you',
    dek: 'It describes where a molecule started. It says nothing about what the molecule does.',
    author: 'Rowan Ellis',
    role: 'Standards',
    date: 'February 2026',
    readingTime: '4 min',
    hero: null,
    pullQuote:
      'A harsh surfactant derived from coconut is still a harsh surfactant. The coconut is not the active part.',
    tags: {
      families: [],
      subcategories: [],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'Of all the phrases on a cleaning label, plant-based is the one that sounds most like a fact. It has the shape of a technical statement. It refers to something real and traceable — feedstock, the raw material a chemical was synthesized from.',
          'It is also almost entirely uninformative about the finished product, and it is not defined by anyone but the company printing it.',
        ],
      },
      {
        heading: 'Feedstock is not behavior',
        paragraphs: [
          'Sodium lauryl sulfate is routinely made from coconut or palm oil. It is plant-based by any reading of the phrase, and it is a strong detergent that strips skin. Petroleum-derived alcohol ethoxylates sit lower on most concern scales.',
          'Origin and effect are separate questions. The label answers the first and lets you assume it has answered the second.',
        ],
      },
      {
        heading: 'The threshold problem',
        paragraphs: [
          'There is no rule about how much of a formula must be plant-derived before the claim is allowed. Water usually makes up the bulk of a cleaning product, and water is generally counted. Once you do that, a great many products qualify.',
          'Some brands qualify the claim honestly — "97% plant-derived ingredients" is a real statement you can interrogate. An unqualified plant-based on the front of a bottle is not.',
        ],
      },
      {
        heading: 'Its cousins',
        paragraphs: [
          'Non-toxic has a narrow legal meaning under federal hazard labeling and a much broader marketing one; on a front label you are reading the marketing one. Eco-friendly is the kind of unqualified environmental claim the FTC\'s Green Guides discourage, on the grounds that it cannot be substantiated. Clean has no definition at all.',
          'None of these are lies exactly. They are claims constructed so that they cannot be wrong.',
        ],
      },
      {
        heading: 'How we treat them',
        paragraphs: [
          'We list them, and we list them separately from certifications, under a heading that says the brand said this. That separation is the entire product. A mark backed by an audit and a phrase a marketing team approved should never appear in the same row of badges.',
        ],
      },
    ],
  },

  {
    slug: 'bleach-has-a-place',
    kicker: 'Method',
    title: 'Bleach has a place. It is smaller than you think.',
    dek: 'Disinfecting and cleaning are different jobs. Most days you only need one of them.',
    author: 'Rowan Ellis',
    role: 'Standards',
    date: 'January 2026',
    readingTime: '5 min',
    hero: null,
    pullQuote:
      'Soap does not kill much of anything. It lifts it off the surface and sends it down the drain, which is usually the entire goal.',
    tags: {
      families: ['chlorine bleach', 'quats', 'antibacterials'],
      subcategories: ['all-purpose', 'bathroom'],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'Cleaning removes soil and the microbes living in it. Disinfecting kills microbes where they sit. The aisle has spent thirty years blurring the two, because the second one sounds more thorough.',
          'For a kitchen counter on an ordinary evening, removal is the goal, and a surfactant and a cloth accomplish it.',
        ],
      },
      {
        heading: 'When disinfection earns its place',
        paragraphs: [
          'After raw chicken. During a stomach bug. On a bathroom surface someone unwell has used. In those situations a disinfectant is the right tool, and reaching for one is not paranoia.',
          'The rest of the week, it is doing nothing that soap was not already doing, while leaving residue behind.',
        ],
      },
      {
        heading: 'Chlorine bleach, fairly',
        paragraphs: [
          'Sodium hypochlorite works, it is cheap, and it breaks down into salt water. Its problems are problems of handling rather than residue: it irritates airways in a small room, it ruins fabric, and combined with ammonia it produces chloramine gas.',
          'That last one is not a theoretical risk. It is the reason a glass cleaner containing ammonia should never share a job — or a poorly ventilated cupboard — with a bleach spray.',
        ],
      },
      {
        heading: 'The quiet alternative nobody examines',
        paragraphs: [
          'Most sprays advertising 99.9% do not use bleach. They use quaternary ammonium compounds — quats, usually benzalkonium chloride. Quats are odorless, which is why they feel gentler.',
          'They also persist on the surface long after the spray has dried, which is precisely what makes them effective. Repeated occupational exposure is associated with asthma, and sustained household use is implicated in bacterial resistance. Odorless is not the same as absent.',
        ],
      },
      {
        heading: 'What we recommend',
        paragraphs: [
          'Keep one disinfectant. Use it for the handful of jobs that call for it, on a surface you have already cleaned, and leave it wet for the contact time on the label — most people wipe it off long before it has done anything.',
          'For everything else, a fragrance-free surfactant and a cloth.',
        ],
      },
    ],
  },

  {
    slug: 'reading-a-label-at-aisle-speed',
    kicker: 'Method',
    title: 'Reading a label at aisle speed',
    dek: 'Nobody has four minutes and a search engine in front of the shelf. Here is what to scan for.',
    author: 'Della Marchetti',
    role: 'Research desk',
    date: 'January 2026',
    readingTime: '4 min',
    hero: null,
    pullQuote:
      'The ingredient you are trying to avoid is almost never printed under the name you know it by.',
    tags: {
      families: [],
      subcategories: [],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'The people who read labels best are not chemists. They are parents managing a child\'s allergy, and they do it in a supermarket aisle in about forty seconds, holding a toddler.',
          'What they have that most shoppers do not is an alias list — the knowledge that one thing they are avoiding travels under six names.',
        ],
      },
      {
        heading: 'Learn families, not names',
        paragraphs: [
          'Avoiding parabens means nothing if you are scanning for the word paraben and the bottle says butylparaben. Avoiding quats means nothing if the label says benzalkonium chloride, which it will.',
          'Four families cover most of what people are actually trying to dodge in this aisle: fragrance, isothiazolinones, quats, and formaldehyde releasers. Learn the members of those four and you have covered most of the ground.',
        ],
      },
      {
        heading: 'Read the order',
        paragraphs: [
          'Ingredients are listed by quantity, descending. Something in the last three positions is present in trace amounts. Something in the first three is most of what you are buying.',
          'This is why a preservative near the end is a smaller conversation than a solvent near the beginning.',
        ],
      },
      {
        heading: 'Count the list',
        paragraphs: [
          'A short list is not automatically safer, but it is always more legible, and legibility is what you have time for. Three ingredients you can read beats twenty you cannot.',
          'And if a product declines to publish its ingredients at all — still legal for many cleaning products — that is itself the finding.',
        ],
      },
      {
        heading: 'The shortcut',
        paragraphs: [
          'Ignore the front of the bottle entirely. Every word on it was written to sell. Turn it around, and if the back is as confident as the front, you are probably fine.',
        ],
      },
    ],
  },

  {
    slug: 'what-the-certifications-certify',
    kicker: 'Standards',
    title: 'What the certifications actually certify',
    dek: 'Six marks, six different questions answered. Only one of them tests whether the product cleans.',
    author: 'Rowan Ellis',
    role: 'Standards',
    date: 'December 2025',
    readingTime: '6 min',
    hero: null,
    pullQuote:
      'A B Corp mark on a bottle of degreaser tells you about the company that made it. It tells you nothing about the degreaser.',
    tags: {
      families: [],
      subcategories: [],
    },
    body: [
      {
        heading: null,
        paragraphs: [
          'Certification is delegated trust. You cannot inspect a supply chain, so you rely on somebody who can. That works exactly as well as your understanding of what each body actually inspected.',
          'The marks in this store answer six different questions, and shoppers routinely read all of them as answering the same one.',
        ],
      },
      {
        heading: 'EPA Safer Choice — the ingredients',
        paragraphs: [
          'Government scientists review every ingredient in the formula against safer-chemistry criteria, and full disclosure is a condition of carrying the mark. For household cleaning specifically, this is the most directly relevant certification available.',
        ],
      },
      {
        heading: 'Green Seal — the ingredients and the job',
        paragraphs: [
          'Sets limits on toxicity and volatile organic compounds, and then does something almost no other mark does: requires the product to demonstrate that it actually cleans before it can be certified.',
          'That matters more than it sounds. A green product that does not work gets used twice as heavily, or gets replaced by something worse.',
        ],
      },
      {
        heading: 'EWG Verified and MADE SAFE — the restricted lists',
        paragraphs: [
          'Both screen formulas against banned-substances lists and require disclosure, including of fragrance components. They are stricter than the regulatory floor, which is the point of them.',
        ],
      },
      {
        heading: 'EU Ecolabel and Cradle to Cradle — downstream',
        paragraphs: [
          'Ecolabel caps aquatic toxicity and requires biodegradability across the lifecycle. Cradle to Cradle looks at material health and packaging circularity — it has as much to say about the bottle as its contents.',
        ],
      },
      {
        heading: 'Leaping Bunny and B Corp — neither is about the formula',
        paragraphs: [
          'Leaping Bunny verifies no animal testing anywhere in the supply chain. B Corp audits the company\'s governance, workers and environmental practice.',
          'Both are meaningful commitments. Neither tells you a single thing about what is in the bottle, and both are frequently displayed as though they do.',
        ],
      },
      {
        heading: 'And the rest',
        paragraphs: [
          'Clean, natural, plant-based, non-toxic, eco-friendly. No body, no audit, no criteria, no way to fail. We record them, because knowing a brand chose to say it is worth something — but we never file them next to a certification.',
        ],
      },
    ],
  },
]

export function article(slug) {
  return ARTICLES.find((a) => a.slug === slug)
}

/**
 * Articles worth putting under an answer: matched on the concerns actually
 * raised by that recommendation, so the reading is relevant rather than
 * generic. Capped at two — a reading list is not a recommendation.
 */
export function articlesFor({ families = [], subcategory = null } = {}) {
  const wanted = new Set(families)
  return ARTICLES.filter(
    (a) =>
      a.tags.families.some((f) => wanted.has(f)) ||
      (subcategory && a.tags.subcategories.includes(subcategory)),
  ).slice(0, 2)
}

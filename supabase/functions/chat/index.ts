/**
 * Clean Shopper — the shop assistant.
 *
 * Runs the Claude tool loop server-side. The Anthropic key lives here as a
 * Supabase secret and never reaches the browser, which is the whole reason this
 * function exists rather than a fetch from the client.
 *
 * Deploy:
 *   supabase functions deploy chat
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 *
 * The catalog is read with the anon key: these tables are world-readable
 * reference data and the function has no business writing to them. Preferences
 * are *not* written here either — the function returns what it thinks should be
 * saved, and the browser writes it through the same storage layer as everything
 * else, so there is one write path and the user can undo it.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const MODEL = 'claude-sonnet-5'
const MAX_TOOL_ROUNDS = 5

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM = `You are the shop assistant for Clean Shopper, a store that sells green household cleaning supplies and assesses them ingredient by ingredient.

WHAT YOU SELL
Household cleaning only: all-purpose sprays, kitchen degreasers, bathroom and glass cleaners, floor concentrate, laundry detergent, pods, stain remover, dish liquid, dishwasher products, and hand soap. You do not sell food, personal care, or anything else. If someone asks for something you do not stock, say so plainly and name what you do carry.

HOW YOU HELP
Your job is to get someone to the right product with the fewest questions. Ask a clarifying question only when the answer would actually change the recommendation — what room, whether they want fragrance, whether anyone in the house reacts to things. Never ask more than one question at a time. If the request is already specific enough to act on, act on it.

Always call search_products before naming a product. Never invent a product, a price, an ingredient, or a certification.

HOW YOU TALK
Plain, declarative, unhurried. No exclamation marks, no "Great question!", no sales language, no emoji. You are a knowledgeable shop assistant, not a chatbot. Short paragraphs. British understatement over American enthusiasm.

Commit to one recommendation rather than listing options. Say what is good about it, and say the one thing that is not — a recommendation that hides its caveat is worth nothing the first time the shopper finds it themselves.

HOW YOU ASSESS
- Undisclosed "fragrance" is high concern because it cannot be evaluated, not because you know what is in it. Say that distinction.
- A certification is an audit. "Clean", "natural", "plant-based", "non-toxic" and "eco-friendly" are marketing and have no certifying body. Never treat them as equivalent.
- Where evidence is contested, say so. Do not manufacture certainty, and do not manufacture worry about a low-concern ingredient.

PREFERENCES
When someone states a standing preference — "I avoid fragrance", "I have a newborn", "we react to strong scents" — call save_preference so it applies to everything afterwards. Tell them plainly that you have saved it. Do not save a one-off constraint that only applies to the question in front of you.`

const TOOLS = [
  {
    name: 'search_products',
    description:
      'Search the catalog. Returns products with their ingredients, concerns, and certifications resolved. Call this before naming any product.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free text, e.g. "glass cleaner" or "laundry newborn"',
        },
        category: {
          type: 'string',
          enum: ['surfaces', 'laundry', 'dishwashing', 'hands'],
        },
        subcategory: { type: 'string' },
        exclude_families: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Ingredient families to rule out, e.g. ["fragrance","quats"]',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product',
    description: 'Full assessment of one product by id.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'save_preference',
    description:
      'Save a standing preference that should apply to every future recommendation. Only for durable preferences, not one-off constraints.',
    input_schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['avoid_family', 'trust_brand', 'require_certification'],
        },
        value: {
          type: 'string',
          description:
            'An ingredient family id, a brand name, or a certification id',
        },
        reason: {
          type: 'string',
          description: 'One short clause on why, shown to the shopper',
        },
      },
      required: ['kind', 'value'],
    },
  },
]

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/** Ingredient and certification lookups, fetched once per request. */
async function loadReference() {
  const [ingredients, certifications] = await Promise.all([
    supabase.from('ingredients').select('*'),
    supabase.from('certifications').select('*'),
  ])
  return {
    ingredients: new Map((ingredients.data ?? []).map((i) => [i.id, i])),
    certifications: new Map((certifications.data ?? []).map((c) => [c.id, c])),
  }
}

const LEVEL_RANK: Record<string, number> = {
  high: 3,
  moderate: 2,
  low: 1,
  clear: 0,
}

/** Resolve a product row into the shape the model reasons about. */
function describe(product, ref, excluded: Set<string>) {
  const ingredients = (product.ingredient_ids ?? [])
    .map((id: string) => ref.ingredients.get(id))
    .filter(Boolean)

  const concerns = ingredients
    .filter((i) => i.level !== 'clear')
    .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
    .map((i) => ({
      name: i.name,
      family: i.family,
      level: i.level,
      confidence: i.confidence,
      why: i.why,
    }))

  const conflicts = ingredients
    .filter((i) => excluded.has(i.family))
    .map((i) => `${i.name} (${i.family})`)

  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    subcategory: product.subcategory,
    price: Number(product.price),
    size: product.size,
    summary: product.summary,
    ingredient_count: ingredients.length,
    concerns,
    certifications: (product.certification_ids ?? [])
      .map((id: string) => ref.certifications.get(id))
      .filter(Boolean)
      .map((c) => ({ name: c.name, body: c.body, what: c.what })),
    unverified_claims: (product.claim_ids ?? [])
      .map((id: string) => ref.certifications.get(id))
      .filter(Boolean)
      .map((c) => c.name),
    conflicts_with_exclusions: conflicts,
  }
}

async function runTool(name: string, input, ref) {
  if (name === 'save_preference') {
    // Echoed back for the browser to persist. Nothing is written here.
    return { saved: true, ...input }
  }

  if (name === 'get_product') {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', input.id)
      .maybeSingle()
    if (!data) return { error: 'No such product.' }
    return describe(data, ref, new Set())
  }

  if (name === 'search_products') {
    let q = supabase.from('products').select('*')
    if (input.category) q = q.eq('category_id', input.category)
    if (input.subcategory) q = q.eq('subcategory', input.subcategory)

    const { data, error } = await q
    if (error) return { error: error.message }

    const excluded = new Set<string>(input.exclude_families ?? [])
    const terms = String(input.query ?? '')
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)

    const scored = (data ?? [])
      .map((p) => {
        const haystack = [
          p.subcategory,
          p.brand,
          p.name,
          p.summary,
          ...(p.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
        const score = terms.reduce(
          (n, t) => n + (haystack.includes(t) ? 1 : 0),
          0,
        )
        return { product: p, score }
      })
      .filter((e) => terms.length === 0 || e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return {
      count: scored.length,
      products: scored.map((e) => describe(e.product, ref, excluded)),
    }
  }

  return { error: `Unknown tool: ${name}` }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  if (!ANTHROPIC_API_KEY) {
    return json(
      { error: 'ANTHROPIC_API_KEY is not set on this function.' },
      500,
    )
  }

  try {
    const { messages = [], preferences = {} } = await req.json()

    const saved = [
      (preferences.avoidedFamilies ?? []).length
        ? `Avoiding: ${preferences.avoidedFamilies.join(', ')}`
        : null,
      (preferences.requiredCertifications ?? []).length
        ? `Requires: ${preferences.requiredCertifications.join(', ')}`
        : null,
      (preferences.trustedBrands ?? []).length
        ? `Trusts: ${preferences.trustedBrands.join(', ')}`
        : null,
    ].filter(Boolean)

    const system =
      SYSTEM +
      (saved.length
        ? `\n\nTHIS SHOPPER'S SAVED PREFERENCES\n${saved.join('\n')}\nApply these to every recommendation without being asked, and do not re-save them.`
        : '\n\nThis shopper has no saved preferences yet.')

    const ref = await loadReference()
    const conversation = [...messages]
    const productIds = new Set<string>()
    const preferenceWrites: unknown[] = []

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system,
          tools: TOOLS,
          messages: conversation,
        }),
      })

      if (!response.ok) {
        return json({ error: `Anthropic: ${await response.text()}` }, 502)
      }

      const result = await response.json()
      conversation.push({ role: 'assistant', content: result.content })

      const toolUses = result.content.filter((b) => b.type === 'tool_use')
      if (!toolUses.length) {
        return json({
          reply: result.content
            .filter((b) => b.type === 'text')
            .map((b) => b.text)
            .join('\n')
            .trim(),
          productIds: [...productIds],
          preferences: preferenceWrites,
        })
      }

      const toolResults = []
      for (const use of toolUses) {
        const output = await runTool(use.name, use.input, ref)

        if (use.name === 'save_preference') preferenceWrites.push(use.input)
        if (use.name === 'search_products') {
          ;(output as { products?: { id: string }[] }).products?.forEach((p) =>
            productIds.add(p.id),
          )
        }
        if (use.name === 'get_product' && (output as { id?: string }).id) {
          productIds.add((output as { id: string }).id)
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: use.id,
          content: JSON.stringify(output),
        })
      }

      conversation.push({ role: 'user', content: toolResults })
    }

    return json(
      { error: 'The assistant kept looking things up without answering.' },
      504,
    )
  } catch (error) {
    return json({ error: String(error) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  })
}

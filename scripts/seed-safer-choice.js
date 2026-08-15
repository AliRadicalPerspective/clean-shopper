/**
 * Import EPA Safer Choice / DfE certified products into Supabase.
 *
 *   node scripts/seed-safer-choice.js --dry-run   # fetch and report, write nothing
 *   node scripts/seed-safer-choice.js             # fetch and upsert
 *
 * Run this from a terminal, never from the browser: the upsert needs the
 * service_role key to get past row-level security, and that key must never
 * reach a client bundle. It belongs in .env as SUPABASE_SERVICE_ROLE_KEY —
 * unprefixed, so Vite will not expose it even by accident.
 *
 * Re-running is safe. Rows are keyed on (product_name, company_name, upc) via
 * the generated source_key column, so a second run updates in place rather than
 * duplicating. The EPA refreshes this dataset a few times a year; re-running
 * after a refresh is the whole update story.
 */

import { createClient } from '@supabase/supabase-js'

const SOURCE_URL =
  'https://data.epa.gov/efservice/t_safer_choice_and_design_for_the_environment/JSON'

/** The full table is ~2.3 MB and Envirofacts routinely takes 40s to build it. */
const FETCH_TIMEOUT_MS = 180_000

/** Rows per upsert request. Small enough to keep payloads and errors legible. */
const CHUNK_SIZE = 500

/**
 * EPA sector → this app's catalog shape, mirroring CATEGORIES in
 * src/data/products.js.
 *
 * Only consumer sectors that genuinely belong in a household catalog are
 * mapped. Marine cleaners, deicers, septic treatments and the like import with
 * a null category: still queryable, still certified, just not merchandised.
 * Mapping them into `surfaces` to inflate the catalog would misrepresent what
 * the EPA actually certified them for.
 */
const SECTOR_MAP = {
  'All-Purpose Cleaners': ['surfaces', 'all-purpose'],
  'Kitchen/Countertop Cleaners': ['surfaces', 'kitchen'],
  'Appliance Cleaners': ['surfaces', 'kitchen'],
  'Oven/Grill/Barbeque Cleaners': ['surfaces', 'kitchen'],
  'Stainless Steel Cleaners': ['surfaces', 'kitchen'],
  'Toilet Bowl Cleaners': ['surfaces', 'bathroom'],
  'Tub/Tile Cleaners': ['surfaces', 'bathroom'],
  Descalers: ['surfaces', 'bathroom'],
  'Window/Glass Cleaners': ['surfaces', 'glass'],
  'Floor Care Products : Floor Cleaners': ['surfaces', 'floor'],
  'Floor Care Products : Floor Finishes': ['surfaces', 'floor'],
  'Granite/Stone Cleaners': ['surfaces', null],
  'Brick and Masonry Cleaners': ['surfaces', null],
  'Wood Cleaners': ['surfaces', null],
  'Metal Cleaner/Polishes': ['surfaces', null],
  Degreasers: ['surfaces', null],

  'Laundry Products : Laundry Detergents': ['laundry', 'detergent'],
  'Laundry Products : Pre-Treaters': ['laundry', 'stain remover'],
  'Laundry Products : Boosters': ['laundry', null],
  'Laundry Products : Fabric Softeners': ['laundry', null],

  'Dish Soaps': ['dishwashing', 'dish liquid'],
  'Automatic Dishwasher Products': ['dishwashing', 'dishwasher'],
  'Rinse Aids': ['dishwashing', 'dishwasher'],

  'Hand Soaps': ['hands', 'hand soap'],
}

/* ------------------------------------------------------------------ *
 * Environment
 * ------------------------------------------------------------------ */

for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file)
  } catch {
    // Missing file is fine — real environment variables work too.
  }
}

const dryRun = process.argv.includes('--dry-run')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!dryRun && (!url || !serviceKey)) {
  console.error(
    'Missing credentials.\n\n' +
      '  VITE_SUPABASE_URL             ' + (url ? 'ok' : 'MISSING') + '\n' +
      '  SUPABASE_SERVICE_ROLE_KEY     ' + (serviceKey ? 'ok' : 'MISSING') + '\n\n' +
      'Add the service_role key to .env (Supabase dashboard → Project Settings →\n' +
      'API Keys → service_role). Do NOT prefix it with VITE_, and do not commit it.\n\n' +
      'Or preview the import without credentials:\n' +
      '  node scripts/seed-safer-choice.js --dry-run',
  )
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

/**
 * Envirofacts serves barcodes as JSON *integers*, so a UPC-A beginning with a
 * zero arrives 11 digits long with the zero already gone. Left-padding back to
 * the canonical width is what makes these codes match a real scan.
 */
function normalizeBarcode(value, width) {
  if (value === null || value === undefined || value === '') return null
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return null
  return digits.length < width ? digits.padStart(width, '0') : digits
}

function text(value) {
  const trimmed = typeof value === 'string' ? value.trim() : value
  return trimmed === '' || trimmed === undefined ? null : trimmed
}

function normalize(row) {
  return {
    product_name: text(row.product_name),
    company_name: text(row.company_name),
    program: text(row.program) ?? 'Safer Choice',
    sector: text(row.sector),
    upc: normalizeBarcode(row.upcs, 12),
    gtin: normalizeBarcode(row.gtins, 14),
    mpn: text(row.mpns),
    partner_since: Number.isInteger(row.partner_since) ? row.partner_since : null,
    fragrance_free: typeof row.fragrance_free === 'boolean' ? row.fragrance_free : null,
    outdoor_use: typeof row.outdoor_use === 'boolean' ? row.outdoor_use : null,
    in_good_standing:
      typeof row.company_in_good_standing === 'boolean'
        ? row.company_in_good_standing
        : null,
    product_url: text(row.product_url),
  }
}

/** Must match the generated source_key column in supabase/safer_choice.sql. */
function sourceKey(row) {
  return `${row.product_name.toLowerCase()}|${row.company_name.toLowerCase()}|${row.upc ?? ''}`
}

/**
 * Fold the EPA's one-row-per-(product × sector) export into one row per
 * product.
 *
 * Only sector, gtin and mpn actually vary inside a group — every other field
 * (program, dates, the boolean flags, the product URL) is identical across a
 * product's rows, verified against the full export — so those collapse safely
 * while the three that vary become arrays.
 */
function fold(rows) {
  const byKey = new Map()

  for (const row of rows) {
    const key = sourceKey(row)
    let entry = byKey.get(key)

    if (!entry) {
      // Dropped from the scalar fields — these three are the only ones that
      // vary within a group, and they are re-added below as arrays.
      const { sector: _sector, gtin: _gtin, mpn: _mpn, ...rest } = row
      entry = {
        ...rest,
        epa_sectors: new Set(),
        categories: new Set(),
        subcategories: new Set(),
        gtins: new Set(),
        mpns: new Set(),
      }
      byKey.set(key, entry)
    }

    if (row.sector) {
      entry.epa_sectors.add(row.sector)
      const [category, subcategory] = SECTOR_MAP[row.sector] ?? []
      if (category) entry.categories.add(category)
      if (subcategory) entry.subcategories.add(subcategory)
    }
    if (row.gtin) entry.gtins.add(row.gtin)
    if (row.mpn) entry.mpns.add(row.mpn)
  }

  return [...byKey.values()].map((entry) => ({
    ...entry,
    epa_sectors: [...entry.epa_sectors].sort(),
    categories: [...entry.categories].sort(),
    subcategories: [...entry.subcategories].sort(),
    gtins: [...entry.gtins].sort(),
    mpns: [...entry.mpns].sort(),
  }))
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

async function main() {
  console.log(`Fetching ${SOURCE_URL}`)
  console.log('This usually takes 30–60s — the EPA builds the export on demand.')

  const started = Date.now()
  const response = await fetch(SOURCE_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`EPA responded ${response.status} ${response.statusText}`)
  }

  const raw = await response.json()
  if (!Array.isArray(raw)) {
    throw new Error('Expected a JSON array from Envirofacts.')
  }
  console.log(`Fetched ${raw.length} rows in ${Math.round((Date.now() - started) / 1000)}s`)

  // A row with no name or company cannot be identified, shown, or folded.
  const usable = raw.map(normalize).filter((row) => row.product_name && row.company_name)

  // Folding is also what keeps the upsert legal: Postgres refuses to let one
  // INSERT ... ON CONFLICT touch the same row twice, and the raw export has
  // thousands of rows sharing a source_key.
  const rows = fold(usable)

  report(raw, usable, rows)

  if (dryRun) {
    console.log('\nDry run — nothing written.')
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log(`\nUpserting ${rows.length} rows in chunks of ${CHUNK_SIZE}…`)
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    const { error } = await supabase
      .from('safer_choice_products')
      .upsert(chunk, { onConflict: 'source_key' })

    if (error) {
      console.error(`\nFailed on rows ${i}–${i + chunk.length - 1}:`, error.message)
      if (error.message.includes('does not exist')) {
        console.error(
          '\nThe table is missing. Run supabase/safer_choice.sql in the Supabase\n' +
            'dashboard (SQL Editor → New query → paste → Run) and try again.',
        )
      }
      process.exit(1)
    }
    process.stdout.write(`  ${Math.min(i + CHUNK_SIZE, rows.length)}/${rows.length}\r`)
  }

  console.log(`\nDone. ${rows.length} certified products in safer_choice_products.`)
}

function report(raw, usable, rows) {
  const merchandised = rows.filter((row) => row.categories.length > 0)
  const withUpc = rows.filter((row) => row.upc)
  const multiSector = rows.filter((row) => row.epa_sectors.length > 1)

  console.log('')
  console.log(`  fetched              ${raw.length}`)
  console.log(`  usable               ${usable.length}`)
  console.log(`  products after fold  ${rows.length}`)
  console.log(`  spanning >1 sector   ${multiSector.length}`)
  console.log(`  in an app category   ${merchandised.length}`)
  console.log(`  with a UPC           ${withUpc.length}`)

  const byCategory = new Map()
  for (const row of merchandised) {
    for (const category of row.categories) {
      byCategory.set(category, (byCategory.get(category) ?? 0) + 1)
    }
  }
  console.log('\n  category breakdown (a product may appear in more than one)')
  for (const [category, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(5)}  ${category}`)
  }

  const unmapped = new Map()
  for (const row of rows) {
    if (row.categories.length) continue
    for (const sector of row.epa_sectors) {
      unmapped.set(sector, (unmapped.get(sector) ?? 0) + 1)
    }
  }
  const top = [...unmapped].sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (top.length) {
    console.log('\n  largest unmapped sectors (imported, no app category)')
    for (const [sector, n] of top) console.log(`    ${String(n).padStart(5)}  ${sector}`)
  }
}

main().catch((error) => {
  console.error('\nImport failed:', error.message)
  process.exit(1)
})

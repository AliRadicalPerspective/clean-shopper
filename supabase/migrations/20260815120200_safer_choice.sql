-- Clean Shopper — EPA Safer Choice / DfE certified products
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It is idempotent, so re-running it is safe. Run supabase/migrations/20260815120000_user_state.sql first if
-- you have not already; the two files are independent, but that one carries the
-- user_state table the app needs to boot.
--
-- This is reference data, not user data. Every row comes from the EPA's public
-- Envirofacts export and is identical for every visitor, so unlike user_state
-- it is world-readable and is never written from the browser —
-- scripts/seed-safer-choice.js loads it with the service_role key.
--
-- Why mirror instead of calling the EPA per request: the Envirofacts endpoint
-- returns the entire table or nothing, has no per-product query, and takes tens
-- of seconds. The whole dataset is a few thousand products, so mirroring it is
-- both faster and kinder to a public service.
--
-- One row here is one product. The EPA export is one row per product *per
-- sector*, so an all-purpose cleaner certified for sixteen sectors arrives as
-- sixteen near-identical rows; the seed script folds those into a single row
-- with sectors as an array. Collapsing them to a single scalar sector instead
-- would file that cleaner under whichever sector happened to sort last.

create table if not exists public.safer_choice_products (
  id               bigint generated always as identity primary key,

  product_name     text not null,
  company_name     text not null,

  -- 'Safer Choice' or 'DfE'. Design for the Environment is the antimicrobial
  -- sibling program; both are EPA marks but they certify different things, so
  -- the distinction is kept rather than flattened.
  program          text not null,

  -- The EPA's own sector strings, verbatim, e.g. 'Laundry Products : Laundry
  -- Detergents'. Kept alongside the mapped categories so a mapping mistake is
  -- always recoverable without re-importing.
  epa_sectors      text[] not null default '{}',

  -- Mapped onto the app's CATEGORIES in src/data/products.js. Empty means no
  -- sector on this product has a home in this catalog (marine cleaners,
  -- deicers, septic treatments) — those rows still import, they just are not
  -- merchandised. A product can legitimately belong to more than one.
  categories       text[] not null default '{}',
  subcategories    text[] not null default '{}',

  -- 'consumer', 'institutional', or both. Nearly half the EPA registry is
  -- janitorial and industrial supply — drum concentrates, dilution-control
  -- systems — which a shopper cannot buy and should not meet next to dish
  -- soap. An array because 471 products are genuinely listed as both.
  audiences        text[] not null default '{}',

  -- Zero-padded to 12 characters. The EPA serves UPCs as JSON integers, which
  -- silently eats the leading zero on most UPC-A codes; storing text and
  -- padding on the way in is what makes barcode lookup work at all.
  upc              text,
  gtins            text[] not null default '{}',
  mpns             text[] not null default '{}',

  partner_since    smallint,

  -- Tri-state on purpose. Null means the EPA did not flag it, which is not the
  -- same claim as false, and rendering "not fragrance free" from missing data
  -- would be exactly the overreach this app exists to avoid.
  fragrance_free   boolean,
  outdoor_use      boolean,
  in_good_standing boolean,

  product_url      text,

  imported_at      timestamptz not null default now(),

  -- The EPA export has no stable primary key, so identity is the natural key.
  -- Generated rather than passed in so the seed script cannot drift from it.
  source_key       text generated always as (
    lower(product_name) || '|' || lower(company_name) || '|' || coalesce(upc, '')
  ) stored
);

create unique index if not exists safer_choice_products_source_key_idx
  on public.safer_choice_products (source_key);

-- Barcode lookup is the one access path that has to be fast and exact.
create index if not exists safer_choice_products_upc_idx
  on public.safer_choice_products (upc)
  where upc is not null;

-- Backs `.contains('categories', ['surfaces'])` from the browser.
create index if not exists safer_choice_products_categories_idx
  on public.safer_choice_products using gin (categories);

create index if not exists safer_choice_products_sectors_idx
  on public.safer_choice_products using gin (epa_sectors);

-- Backs the consumer-only filter that every shopper-facing query applies.
create index if not exists safer_choice_products_audiences_idx
  on public.safer_choice_products using gin (audiences);

-- Backs the "is this brand certified at all?" question behind trusted brands.
create index if not exists safer_choice_products_company_idx
  on public.safer_choice_products (lower(company_name));

-- Deliberately no index for name search. At a few thousand rows an ILIKE scan
-- is well under a millisecond, and a trigram index would mean depending on
-- pg_trgm for no measurable gain. Revisit if this ever joins a real catalog.

alter table public.safer_choice_products enable row level security;

-- Public reference data: anyone may read, nobody may write. There is no insert
-- or update policy by design — the seed script uses the service_role key, which
-- bypasses RLS, so the browser bundle has no path to mutating this table even
-- if the anon key leaks (and the anon key is meant to be public anyway).
drop policy if exists "safer choice: public read" on public.safer_choice_products;
create policy "safer choice: public read"
  on public.safer_choice_products for select
  to anon, authenticated
  using (true);

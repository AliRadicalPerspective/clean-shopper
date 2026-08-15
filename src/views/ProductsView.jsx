import { useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { PRODUCTS, CATEGORIES } from '../lib/catalog.js'
import { evaluateProduct, exclusionReason, DISPOSITION } from '../lib/evaluate.js'

/**
 * The catalog.
 *
 * Filtering is by category and subcategory only — the filter rail is a column
 * of links, not a panel of controls, and every state is a real URL you can
 * link to.
 *
 * Saved preferences are applied here the same way they are applied to an
 * answer: products that conflict drop to a "set aside" section with the
 * reason, rather than vanishing. Silently hiding results would teach the
 * shopper nothing, so the filter can also be switched off.
 */
export default function ProductsView({
  route,
  prefs,
  onNavigate,
  onOpen,
  onAdd,
  cartIds,
}) {
  const [applyPrefs, setApplyPrefs] = useState(true)

  const { category, subcategory } = route
  const activeCategory = CATEGORIES.find((c) => c.id === category) ?? null

  const filtered = PRODUCTS.filter((product) => {
    if (category && product.category !== category) return false
    if (subcategory && product.subcategory !== subcategory) return false
    return true
  })

  const evaluated = filtered
    .map((product) => evaluateProduct(product, prefs))
    .sort((a, b) => b.score - a.score)

  const hasPrefs =
    (prefs.avoidedFamilies ?? []).length > 0 ||
    (prefs.requiredCertifications ?? []).length > 0

  const showing = applyPrefs && hasPrefs
  const clear = showing
    ? evaluated.filter((e) => e.disposition !== DISPOSITION.excluded)
    : evaluated
  const setAside = showing
    ? evaluated.filter((e) => e.disposition === DISPOSITION.excluded)
    : []

  function go(next) {
    onNavigate({ name: 'products', ...next })
  }

  return (
    <div className="products">
      <aside className="filters">
        <span className="label">Browse</span>

        <ul className="filters__list">
          <li>
            <button
              className={`filters__item${!category ? ' is-current' : ''}`}
              onClick={() => go({})}
            >
              All products
            </button>
          </li>

          {CATEGORIES.map((entry) => (
            <li key={entry.id}>
              <button
                className={`filters__item${
                  category === entry.id && !subcategory ? ' is-current' : ''
                }`}
                onClick={() => go({ category: entry.id })}
              >
                {entry.name}
              </button>

              {category === entry.id && (
                <ul className="filters__sub">
                  {entry.subcategories.map((sub) => (
                    <li key={sub}>
                      <button
                        className={`filters__item${
                          subcategory === sub ? ' is-current' : ''
                        }`}
                        onClick={() =>
                          go({ category: entry.id, subcategory: sub })
                        }
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {hasPrefs && (
          <div className="filters__prefs">
            <label className="option__control">
              <input
                type="checkbox"
                checked={applyPrefs}
                onChange={() => setApplyPrefs((on) => !on)}
              />
              <span className="option__box" aria-hidden="true" />
              <span className="option__name">Apply my preferences</span>
            </label>
            <p className="option__detail">
              Avoiding {(prefs.avoidedFamilies ?? []).join(', ') || 'nothing'}
            </p>
          </div>
        )}
      </aside>

      <div className="products__main">
        <div className="products__head">
          <span className="label">
            {subcategory ?? activeCategory?.name ?? 'All products'}
          </span>
          <span className="label label--stone">
            {clear.length} of {filtered.length}
            {showing && setAside.length > 0 && ` · ${setAside.length} set aside`}
          </span>
        </div>

        {clear.length === 0 ? (
          <p className="muted">
            Nothing here matches your preferences. Switch the preference filter
            off to see what was set aside and why.
          </p>
        ) : (
          <div className="grid grid--3">
            {clear.map((evaluation) => (
              <ProductCard
                key={evaluation.product.id}
                evaluation={evaluation}
                onOpen={onOpen}
                onAdd={onAdd}
                inCart={cartIds.includes(evaluation.product.id)}
              />
            ))}
          </div>
        )}

        {setAside.length > 0 && (
          <section className="section">
            <span className="label">Set aside on your preferences</span>
            <ul className="skipped">
              {setAside.map((evaluation) => (
                <li key={evaluation.product.id} className="skipped__row">
                  <button
                    className="skipped__title"
                    onClick={() => onOpen(evaluation.product.id)}
                  >
                    <span>{evaluation.product.brand}</span>
                    <span className="muted">{evaluation.product.name}</span>
                  </button>
                  <p className="skipped__reason">
                    {exclusionReason(evaluation)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

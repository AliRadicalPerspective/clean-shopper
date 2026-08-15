import ImageSlot from '../components/ImageSlot.jsx'
import { LEVELS } from '../data/ingredients.js'
import { DISPOSITION, exclusionReason } from '../lib/evaluate.js'

/**
 * Side by side, ending in a recommendation rather than a scoreboard.
 * The comparison is only useful if it commits to an answer.
 */
export default function CompareView({ comparison, onBack, onOpen, onAdd, cartIds }) {
  if (!comparison) return null
  const { evaluated, winner } = comparison

  const rows = [
    {
      label: 'Price',
      cell: (e) => `$${e.product.price}`,
    },
    {
      label: 'Size',
      cell: (e) => e.product.size,
    },
    {
      label: 'Ingredients disclosed',
      cell: (e) => String(e.resolved.length),
    },
    {
      label: 'Of concern',
      cell: (e) =>
        e.concerns.length === 0 ? 'None' : String(e.concerns.length),
    },
    {
      label: 'Highest concern',
      cell: (e) => LEVELS[e.highestConcern].label,
    },
    {
      label: 'Fragrance',
      cell: (e) =>
        e.resolved.some((i) => i.family === 'fragrance')
          ? 'Undisclosed blend'
          : 'None',
    },
    {
      label: 'Third-party certified',
      cell: (e) =>
        e.certs.length ? e.certs.map((c) => c.name).join(', ') : 'No',
    },
    {
      label: 'Brand claims',
      cell: (e) =>
        e.unverifiedClaims.length
          ? e.unverifiedClaims.map((c) => c.name).join(', ')
          : 'None',
    },
    {
      label: 'On your preferences',
      cell: (e) =>
        e.disposition === DISPOSITION.excluded
          ? exclusionReason(e)
          : e.disposition === DISPOSITION.caution
            ? 'Clear, with a caveat'
            : 'Clear',
    },
  ]

  return (
    <div className="compare">
      <button className="link" onClick={onBack}>
        Back
      </button>

      <span className="label compare__label">Side by side</span>

      <div
        className="compare__scroll"
        style={{ '--compare-columns': evaluated.length }}
      >
        <div className="compare__grid">
          <div className="compare__corner" />
          {evaluated.map((e) => (
            <div key={e.product.id} className="compare__header">
              <ImageSlot slot={e.product.image} alt="" />
              <button
                className="compare__title"
                onClick={() => onOpen(e.product.id)}
              >
                <span>{e.product.brand}</span>
                <span className="muted">{e.product.name}</span>
              </button>
              {winner?.product.id === e.product.id && (
                <span className="label">Recommended</span>
              )}
            </div>
          ))}

          {rows.map((row) => (
            <div key={row.label} className="compare__row">
              <div className="compare__rowlabel">
                <span className="label label--stone">{row.label}</span>
              </div>
              {evaluated.map((e) => (
                <div key={e.product.id} className="compare__cell">
                  {row.cell(e)}
                </div>
              ))}
            </div>
          ))}

          <div className="compare__row">
            <div className="compare__rowlabel" />
            {evaluated.map((e) => (
              <div key={e.product.id} className="compare__cell">
                <button className="button" onClick={() => onAdd(e.product.id)}>
                  {cartIds.includes(e.product.id) ? 'In cart' : 'Add to cart'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {winner && (
        <section className="compare__verdict">
          <span className="label">The recommendation</span>
          <p className="compare__verdict-text">
            <strong>
              {winner.product.brand} {winner.product.name}
            </strong>
            . {winner.product.summary}
          </p>
        </section>
      )}
    </div>
  )
}

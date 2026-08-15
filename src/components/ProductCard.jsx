import ImageSlot from './ImageSlot.jsx'

export default function ProductCard({
  evaluation,
  onOpen,
  onAdd,
  inCart,
  eyebrow,
}) {
  const { product, concerns, certs } = evaluation

  return (
    <article className="card">
      {eyebrow && <span className="label card__eyebrow">{eyebrow}</span>}

      <button
        className="card__image"
        onClick={() => onOpen(product.id)}
        aria-label={`Open ${product.brand} ${product.name}`}
      >
        <ImageSlot slot={product.image} alt={`${product.brand} ${product.name}`} />
      </button>

      <div className="card__body">
        <button className="card__title" onClick={() => onOpen(product.id)}>
          <span className="card__brand">{product.brand}</span>
          <span className="card__name">{product.name}</span>
        </button>

        <p className="card__meta">
          {product.size} · ${product.price}
        </p>

        <p className="card__summary">{product.summary}</p>

        <p className="card__signal">
          {concerns.length === 0
            ? 'No ingredients of concern'
            : `${concerns.length} ingredient${concerns.length > 1 ? 's' : ''} of concern`}
          {certs.length > 0 && ` · ${certs.length} certification${certs.length > 1 ? 's' : ''}`}
        </p>

        <div className="card__actions">
          <button className="button" onClick={() => onAdd(product.id)}>
            {inCart ? 'In cart' : 'Add to cart'}
          </button>
          <button className="link" onClick={() => onOpen(product.id)}>
            Full assessment
          </button>
        </div>
      </div>
    </article>
  )
}

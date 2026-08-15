import ImageSlot from '../components/ImageSlot.jsx'
import { LEVELS } from '../data/ingredients.js'
import { DISPOSITION } from '../lib/evaluate.js'

export default function CartView({
  entries,
  onOpen,
  onRemove,
  onQty,
  onCompare,
  onNavigate,
}) {
  const total = entries.reduce(
    (sum, entry) => sum + entry.evaluation.product.price * entry.qty,
    0,
  )

  const comparable = entries.length >= 2

  if (!entries.length) {
    return (
      <div className="cart cart--empty">
        <div>
          <span className="label">Cart</span>
          <p className="cart__lead">Nothing saved yet.</p>
          <button className="link" onClick={() => onNavigate({ name: 'ask' })}>
            Start researching
          </button>
        </div>
        <ImageSlot slot="editorial-cart" alt="" />
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart__head">
        <span className="label">Cart</span>
        {comparable && (
          <button
            className="link"
            onClick={() => onCompare(entries.map((e) => e.evaluation.product.id))}
          >
            Compare all {entries.length}
          </button>
        )}
      </div>

      <ul className="cart__list">
        {entries.map(({ evaluation, qty }) => {
          const { product } = evaluation
          return (
            <li key={product.id} className="cart__item">
              <button
                className="cart__image"
                onClick={() => onOpen(product.id)}
                aria-label={`Open ${product.brand} ${product.name}`}
              >
                <ImageSlot slot={product.image} alt="" />
              </button>

              <div className="cart__detail">
                <button
                  className="cart__title"
                  onClick={() => onOpen(product.id)}
                >
                  <span>{product.brand}</span>
                  <span className="muted">{product.name}</span>
                </button>
                <p className="muted">{product.size}</p>
                <p className="cart__signal">
                  {evaluation.disposition === DISPOSITION.excluded
                    ? 'Conflicts with your current preferences'
                    : evaluation.concerns.length === 0
                      ? 'No ingredients of concern'
                      : `Highest concern: ${LEVELS[evaluation.highestConcern].label.toLowerCase()}`}
                </p>
              </div>

              <div className="cart__qty">
                <button
                  className="qty"
                  onClick={() => onQty(product.id, qty - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  className="qty"
                  onClick={() => onQty(product.id, qty + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="cart__price">
                <span>${product.price * qty}</span>
                <button className="link" onClick={() => onRemove(product.id)}>
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="cart__foot">
        <span className="label">Subtotal</span>
        <span className="cart__total">${total}</span>
      </div>
      <p className="muted cart__note">
        Checkout is not live yet. Your cart is a saved shortlist, kept on this
        device and re-checked against your preferences each time you open it.
      </p>
    </div>
  )
}

import ImageSlot from '../components/ImageSlot.jsx'
import ConcernList from '../components/ConcernList.jsx'
import CertList from '../components/CertList.jsx'
import { reasoning, exclusionReason, DISPOSITION } from '../lib/evaluate.js'

const DISPOSITION_LABEL = {
  [DISPOSITION.clear]: 'Clear on your preferences',
  [DISPOSITION.caution]: 'Clear on your preferences, with a caveat',
  [DISPOSITION.excluded]: 'Set aside on your preferences',
}

export default function ProductView({
  evaluation,
  onAdd,
  onBack,
  inCart,
}) {
  const { product } = evaluation

  return (
    <article className="detail">
      <button className="link detail__back" onClick={onBack}>
        Back
      </button>

      <div className="detail__spread">
        <div className="detail__image">
          <ImageSlot
            slot={product.image}
            alt={`${product.brand} ${product.name}`}
          />
        </div>

        <div className="detail__body">
          <span className="label">{DISPOSITION_LABEL[evaluation.disposition]}</span>

          <h2 className="detail__brand">{product.brand}</h2>
          <p className="detail__name">{product.name}</p>
          <p className="detail__meta">
            {product.size} · ${product.price}
          </p>

          <p className="detail__summary">{product.summary}</p>

          {evaluation.disposition === DISPOSITION.excluded && (
            <p className="detail__excluded">{exclusionReason(evaluation)}</p>
          )}

          <ul className="reasons">
            {reasoning(evaluation).map((line) => (
              <li key={line.text} className={`reason reason--${line.kind}`}>
                <span className="reason__mark">
                  {line.kind === 'for' ? 'For' : 'Against'}
                </span>
                <span className="reason__text">{line.text}</span>
              </li>
            ))}
          </ul>

          <div className="detail__actions">
            <button className="button" onClick={() => onAdd(product.id)}>
              {inCart ? 'In cart' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail__columns">
        <ConcernList evaluation={evaluation} />
        <CertList evaluation={evaluation} />
      </div>
    </article>
  )
}

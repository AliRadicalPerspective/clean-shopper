import ImageSlot from './ImageSlot.jsx'
import ProductCard from './ProductCard.jsx'
import ConcernList from './ConcernList.jsx'
import { reasoning } from '../lib/evaluate.js'
import { followUpsFor } from '../lib/research.js'

/**
 * One turn of the conversation, rendered as an editorial spread.
 *
 * Verdict first and singular: one pick at full page weight, two alternates,
 * then what was set aside and why. A shopper who arrived overwhelmed is not
 * helped by a well-organized grid of twelve options — and showing the
 * discards is what makes the shortlist believable.
 */
export default function Answer({
  result,
  onAsk,
  onOpen,
  onAdd,
  onCompare,
  onOpenArticle,
  cartIds,
}) {
  const { pick, alternates, skipped, interpreted, query, appliedPreferences } =
    result

  return (
    <article className="turn">
      <header className="turn__question">
        <span className="label">
          {result.isFollowUp ? 'Following on' : 'You asked'}
        </span>
        <p className="turn__query">{query}</p>
        <p className="turn__read">
          {interpreted ?? 'No category matched'}
          {appliedPreferences.length > 0 && ` · ${appliedPreferences.join(' · ')}`}
        </p>
        {result.note && <p className="turn__note">{result.note}</p>}
      </header>

      {result.empty && (
        <section className="empty">
          <p className="empty__lead">
            We do not stock anything that matches that.
          </p>
          <p className="muted">
            Clean Shopper carries household cleaning supplies only — all-purpose
            sprays, kitchen degreasers, bathroom and glass cleaners, floor
            concentrate, laundry, dishwashing and hand soap. Try one of those,
            or browse the shop.
          </p>
        </section>
      )}

      {pick && (
        <section className="verdict">
          <div className="verdict__image">
            <ImageSlot
              slot={pick.product.image}
              alt={`${pick.product.brand} ${pick.product.name}`}
            />
          </div>

          <div className="verdict__detail">
            <span className="label">The pick</span>

            <h2 className="verdict__brand">{pick.product.brand}</h2>
            <p className="verdict__name">{pick.product.name}</p>
            <p className="verdict__meta">
              {pick.product.size} · ${pick.product.price}
            </p>

            <p className="verdict__summary">{pick.product.summary}</p>

            <ul className="reasons">
              {reasoning(pick).map((line) => (
                <li key={line.text} className={`reason reason--${line.kind}`}>
                  <span className="reason__mark">
                    {line.kind === 'for' ? 'For' : 'Against'}
                  </span>
                  <span className="reason__text">{line.text}</span>
                </li>
              ))}
            </ul>

            <div className="verdict__actions">
              <button className="button" onClick={() => onAdd(pick.product.id)}>
                {cartIds.includes(pick.product.id) ? 'In cart' : 'Add to cart'}
              </button>
              <button className="link" onClick={() => onOpen(pick.product.id)}>
                Full assessment
              </button>
            </div>

            <ConcernList evaluation={pick} dense />
          </div>
        </section>
      )}

      {alternates.length > 0 && (
        <section className="section">
          <div className="section__head">
            <span className="label">Also worth considering</span>
            <button
              className="link"
              onClick={() =>
                onCompare([pick, ...alternates].map((e) => e.product.id))
              }
            >
              Compare all {alternates.length + 1}
            </button>
          </div>

          <div className="grid grid--2">
            {alternates.map((evaluation) => (
              <ProductCard
                key={evaluation.product.id}
                evaluation={evaluation}
                onOpen={onOpen}
                onAdd={onAdd}
                inCart={cartIds.includes(evaluation.product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {skipped.length > 0 && (
        <section className="section">
          <span className="label">Set aside</span>
          <ul className="skipped">
            {skipped.map((evaluation) => (
              <li key={evaluation.product.id} className="skipped__row">
                <button
                  className="skipped__title"
                  onClick={() => onOpen(evaluation.product.id)}
                >
                  <span>{evaluation.product.brand}</span>
                  <span className="muted">{evaluation.product.name}</span>
                </button>
                <p className="skipped__reason">{evaluation.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Matched to the concerns this answer raised, so the Journal appears
          where it explains something rather than as a standing footer. */}
      {result.reading?.length > 0 && (
        <section className="reading">
          <span className="label">From the Journal</span>
          <ul>
            {result.reading.map((piece) => (
              <li key={piece.slug}>
                <button
                  className="reading__title"
                  onClick={() => onOpenArticle(piece.slug)}
                >
                  {piece.title}
                </button>
                <p className="reading__dek">{piece.dek}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Follow-ups are offered rather than left to be guessed at — the
          field understands them, but nothing on screen would say so. */}
      {followUpsFor(result).length > 0 && (
        <section className="follow-ups">
          <span className="label label--stone">Ask next</span>
          <ul>
            {followUpsFor(result).map((prompt) => (
              <li key={prompt}>
                <button className="link" onClick={() => onAsk(prompt)}>
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

import ImageSlot from '../components/ImageSlot.jsx'
import { ARTICLES } from '../lib/catalog.js'

/**
 * The Journal index.
 *
 * The lead piece takes a full editorial spread; the rest run as a hairline-
 * ruled index. Ranked by editorial judgment rather than date — the pieces that
 * explain the most sit highest.
 */
export default function JournalView({ onOpenArticle }) {
  const [lead, ...rest] = ARTICLES

  return (
    <div className="journal">
      <header className="journal__masthead">
        <span className="label">The Journal</span>
        <p className="journal__standfirst">
          Why we assess what we assess. Written for people who would rather
          understand a label than memorize a list.
        </p>
      </header>

      <article className="journal__lead">
        <button
          className="journal__lead-image"
          onClick={() => onOpenArticle(lead.slug)}
          aria-label={`Read ${lead.title}`}
        >
          <ImageSlot slot={lead.hero} alt="" />
        </button>

        <div className="journal__lead-body">
          <span className="label label--stone">{lead.kicker}</span>
          <button
            className="journal__lead-title"
            onClick={() => onOpenArticle(lead.slug)}
          >
            {lead.title}
          </button>
          <p className="journal__dek">{lead.dek}</p>
          <p className="journal__byline">
            {lead.author} · {lead.date} · {lead.readingTime}
          </p>
        </div>
      </article>

      <ul className="journal__index">
        {rest.map((piece) => (
          <li key={piece.slug} className="journal__row">
            <span className="label label--stone">{piece.kicker}</span>
            <div className="journal__row-body">
              <button
                className="journal__row-title"
                onClick={() => onOpenArticle(piece.slug)}
              >
                {piece.title}
              </button>
              <p className="journal__dek">{piece.dek}</p>
            </div>
            <p className="journal__byline">
              {piece.author} · {piece.date} · {piece.readingTime}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

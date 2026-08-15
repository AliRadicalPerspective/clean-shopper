import ImageSlot from '../components/ImageSlot.jsx'
import { ARTICLES } from '../lib/catalog.js'

/**
 * A single piece.
 *
 * Set in one narrow measure with generous rule work and no sidebar — the
 * reading experience of a printed page rather than a content page.
 */
export default function ArticleView({ piece, onOpenArticle, onBack }) {
  if (!piece) {
    return <p className="muted">That piece is no longer here.</p>
  }

  const more = ARTICLES.filter((a) => a.slug !== piece.slug).slice(0, 3)

  return (
    <article className="article">
      <button className="link article__back" onClick={onBack}>
        Back
      </button>

      <header className="article__head">
        <span className="label label--stone">{piece.kicker}</span>
        <h1 className="article__title">{piece.title}</h1>
        <p className="article__dek">{piece.dek}</p>
        <p className="article__byline">
          {piece.author}, {piece.role} · {piece.date} · {piece.readingTime}
        </p>
      </header>

      {piece.hero && (
        <div className="article__hero">
          <ImageSlot slot={piece.hero} alt="" />
        </div>
      )}

      <div className="article__body">
        {piece.body.map((section, index) => (
          <section key={section.heading ?? `section-${index}`}>
            {section.heading && (
              <h2 className="article__heading">{section.heading}</h2>
            )}
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      {piece.pullQuote && (
        <blockquote className="article__quote">{piece.pullQuote}</blockquote>
      )}

      <section className="article__more">
        <span className="label">More from the Journal</span>
        <ul>
          {more.map((other) => (
            <li key={other.slug}>
              <button
                className="link"
                onClick={() => onOpenArticle(other.slug)}
              >
                {other.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

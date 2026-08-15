import { LEVELS, CONFIDENCE } from '../data/ingredients.js'

/**
 * The ingredient list, ordered by severity.
 *
 * There is no color here by design. Severity is carried by order, by the
 * uppercase label, and by ink-versus-stone contrast — cleared ingredients
 * recede to grey, concerns hold the black. Every concern shows its evidence
 * and how confident that evidence is, because a verdict without its
 * confidence is a lie of precision about genuinely contested science.
 */

const RANK = { flagged: 4, high: 3, moderate: 2, low: 1, clear: 0 }

export default function ConcernList({ evaluation, dense = false }) {
  const flaggedIds = new Set(evaluation.flagged.map((i) => i.id))

  const rows = [...evaluation.resolved].sort((a, b) => {
    const rank = (i) => (flaggedIds.has(i.id) ? RANK.flagged : RANK[i.level])
    return rank(b) - rank(a)
  })

  return (
    <div className="concerns">
      <div className="concerns__head">
        <span className="label">Ingredients</span>
        <span className="label label--stone">{rows.length} disclosed</span>
      </div>

      <ul className="concerns__list">
        {rows.map((item) => {
          const isFlagged = flaggedIds.has(item.id)
          const isClear = item.level === 'clear'
          return (
            <li
              key={item.id}
              className={`concern${isClear ? ' concern--clear' : ''}${
                isFlagged ? ' concern--flagged' : ''
              }`}
            >
              <div className="concern__row">
                <span className="concern__name">{item.name}</span>
                <span className="concern__level">
                  {isFlagged ? 'Avoiding' : LEVELS[item.level].label}
                </span>
              </div>

              {!isClear && !dense && (
                <p className="concern__why">
                  {item.why}{' '}
                  <span className="concern__confidence">
                    {CONFIDENCE[item.confidence]}.
                  </span>
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

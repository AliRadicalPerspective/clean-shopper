import AskField from '../components/AskField.jsx'
import ImageSlot from '../components/ImageSlot.jsx'
import { SUGGESTIONS } from '../lib/research.js'

/**
 * Entry screen: asymmetric split, form column left, editorial photograph right.
 * No headline, no value proposition, no marketing — the field is the product.
 */
export default function AskView({ onAsk, history, prefsSummary, onNavigate }) {
  return (
    <div className="ask">
      <div className="ask__column">
        <AskField
          onSubmit={onAsk}
          label={
            <>
              What are<span className="ask-field__break"> </span>you cleaning?
            </>
          }
          display
        />

        {/* Says what the store sells, subordinate to the question now that the
            question carries the page. */}
        <p className="ask__positioning">
          Green cleaning supplies, assessed ingredient by ingredient.
        </p>

        <div className="ask__suggestions">
          <span className="label">Or start here</span>
          <ul>
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button className="link" onClick={() => onAsk(suggestion)}>
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {history.length > 0 && (
          <div className="ask__history">
            <span className="label">Recently researched</span>
            <ul>
              {history.map((entry) => (
                <li key={entry}>
                  <button className="link" onClick={() => onAsk(entry)}>
                    {entry}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ask__prefs">
          <span className="label">Applied to every answer</span>
          <p className="muted">{prefsSummary}</p>
          <button
            className="link"
            onClick={() => onNavigate({ name: 'preferences' })}
          >
            Edit preferences
          </button>
        </div>
      </div>

      <div className="ask__editorial">
        <ImageSlot slot="editorial-entry" alt="" fill />
      </div>
    </div>
  )
}

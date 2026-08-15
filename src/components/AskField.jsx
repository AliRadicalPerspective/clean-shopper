import { useState } from 'react'

/**
 * The entire input surface of the product.
 *
 * One field with a hairline underneath it — the bottom border is the
 * affordance, there is no focus ring and no filled button. The conversation
 * is the navigation, so this is also the only navigation that matters.
 */
export default function AskField({
  onSubmit,
  label = 'What are you looking for',
  initial = '',
  compact = false,
  // Entry screen only: renders the prompt as display type rather than a form
  // label, and enlarges the field to match.
  display = false,
  busy = false,
  clearOnSubmit = false,
}) {
  const [value, setValue] = useState(initial)

  function submit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || busy) return
    onSubmit(trimmed)
    if (clearOnSubmit) setValue('')
  }

  return (
    <form
      className={`ask-field${compact ? ' ask-field--compact' : ''}${
        display ? ' ask-field--display' : ''
      }`}
      onSubmit={submit}
    >
      <label
        className={display ? 'ask-field__question' : 'label'}
        htmlFor="ask-input"
      >
        {label}
      </label>

      <div className="ask-field__row">
        <input
          id="ask-input"
          className="ask-field__input"
          type="text"
          value={value}
          autoComplete="off"
          placeholder="An all-purpose spray with no fragrance"
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Researching' : 'Research'}
        </button>
      </div>
    </form>
  )
}

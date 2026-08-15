import { useEffect, useRef, useState } from 'react'
import ImageSlot from './ImageSlot.jsx'
import { MODE, ask, applyPreferenceWrites } from '../lib/assistant.js'

/**
 * The shop assistant, docked on every page.
 *
 * Not a floating bubble: a rounded, shadowed pill would break three rules of
 * this design system at once. It is a hairline-bounded tab that expands into a
 * flat column — the same rule work as everything else, just anchored.
 *
 * Preferences the assistant saves are written through the same state the
 * Preferences page edits, and each one is confirmed in the transcript with an
 * undo. Nothing is saved to a shopper's profile without them seeing it happen.
 */

const OPENER =
  'Tell me what you need to clean, and anything you would rather avoid.'

export default function ChatDock({ prefs, onChangePrefs, onOpenProduct, onAdd, cartIds }) {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState(null)

  const end = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    if (open) {
      end.current?.scrollIntoView({ block: 'end' })
      input.current?.focus()
    }
  }, [open, turns.length, busy])

  async function send(text) {
    const question = text.trim()
    if (!question || busy) return

    const history = [...turns, { role: 'user', content: question }]
    setTurns(history)
    setDraft('')
    setBusy(true)

    const answer = await ask(
      history.map(({ role, content }) => ({ role, content })),
      prefs,
    )
    setMode(answer.mode)

    if (answer.preferences?.length) {
      onChangePrefs(applyPreferenceWrites(prefs, answer.preferences))
    }

    setTurns((current) => [
      ...current,
      {
        role: 'assistant',
        content: answer.reply,
        products: answer.products ?? [],
        saved: answer.preferences ?? [],
      },
    ])
    setBusy(false)
  }

  function undo(write) {
    const key = {
      avoid_family: 'avoidedFamilies',
      trust_brand: 'trustedBrands',
      require_certification: 'requiredCertifications',
    }[write.kind]
    if (!key) return
    onChangePrefs({
      ...prefs,
      [key]: (prefs[key] ?? []).filter((v) => v !== write.value),
    })
  }

  if (!open) {
    return (
      <button className="dock-tab" onClick={() => setOpen(true)}>
        Ask the shop
      </button>
    )
  }

  return (
    <aside className="dock" aria-label="Shop assistant">
      <header className="dock__head">
        <span className="label">Ask the shop</span>
        <button className="link" onClick={() => setOpen(false)}>
          Close
        </button>
      </header>

      <div className="dock__body">
        {turns.length === 0 && <p className="dock__opener">{OPENER}</p>}

        {turns.map((turn, index) => (
          <div key={index} className={`dock__turn dock__turn--${turn.role}`}>
            <span className="label label--stone">
              {turn.role === 'user' ? 'You' : 'Clean Shopper'}
            </span>

            {turn.content.split('\n\n').map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}

            {turn.saved?.map((write) => (
              <p key={write.kind + write.value} className="dock__saved">
                Saved — {write.kind.replace(/_/g, ' ')}: {write.value}.{' '}
                <button className="link" onClick={() => undo(write)}>
                  Undo
                </button>
              </p>
            ))}

            {turn.products?.length > 0 && (
              <ul className="dock__products">
                {turn.products.slice(0, 3).map((evaluation) => (
                  <li key={evaluation.product.id}>
                    <button
                      className="dock__product-image"
                      onClick={() => onOpenProduct(evaluation.product.id)}
                      aria-label={`Open ${evaluation.product.brand} ${evaluation.product.name}`}
                    >
                      <ImageSlot slot={evaluation.product.image} alt="" />
                    </button>
                    <div className="dock__product-body">
                      <button
                        className="dock__product-title"
                        onClick={() => onOpenProduct(evaluation.product.id)}
                      >
                        <span>{evaluation.product.brand}</span>
                        <span className="muted">{evaluation.product.name}</span>
                      </button>
                      <p className="muted">
                        {evaluation.product.size} · ${evaluation.product.price}
                      </p>
                      <button
                        className="link"
                        onClick={() => onAdd(evaluation.product.id)}
                      >
                        {cartIds.includes(evaluation.product.id)
                          ? 'In cart'
                          : 'Add to cart'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {busy && (
          <p className="dock__thinking label label--stone">Looking…</p>
        )}
        <div ref={end} />
      </div>

      <form
        className="dock__form"
        onSubmit={(event) => {
          event.preventDefault()
          send(draft)
        }}
      >
        <input
          ref={input}
          className="ask-field__input"
          type="text"
          value={draft}
          placeholder="Something for grease"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="button" type="submit" disabled={busy}>
          Send
        </button>
      </form>

      {/* Which engine answered is stated, never implied. */}
      {mode && (
        <p className="dock__mode">
          {mode === MODE.live
            ? 'Answering with Claude'
            : 'Offline mode — scripted matching, no clarifying questions'}
        </p>
      )}
    </aside>
  )
}

import { useEffect, useRef } from 'react'
import AskField from '../components/AskField.jsx'
import Answer from '../components/Answer.jsx'
import Researching from '../components/Researching.jsx'

/**
 * The conversation.
 *
 * Turns stack down the page oldest-first and stay readable, so the thread
 * reads as a record of the reasoning rather than a single answer that keeps
 * being replaced. The field docks at the bottom, where the next question
 * belongs.
 */
export default function ResearchView({
  thread,
  onAsk,
  onOpen,
  onAdd,
  onCompare,
  onOpenArticle,
  cartIds,
  busy,
}) {
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [thread.length, busy])

  return (
    <div className="research">
      <div className="thread">
        {thread.length === 0 && (
          <p className="muted">Ask a question to start.</p>
        )}

        {thread.map((turn) =>
          turn.status === 'pending' ? (
            <Researching key={turn.id} query={turn.query} />
          ) : (
            <Answer
              key={turn.id}
              result={turn.result}
              onAsk={onAsk}
              onOpen={onOpen}
              onAdd={onAdd}
              onCompare={onCompare}
              onOpenArticle={onOpenArticle}
              cartIds={cartIds}
            />
          ),
        )}
        <div ref={end} />
      </div>

      <div className="ask-dock">
        <AskField
          onSubmit={onAsk}
          label={
            thread.length
              ? 'Follow up, or ask something else'
              : 'What are you looking for'
          }
          clearOnSubmit
          compact
          busy={busy}
        />
      </div>
    </div>
  )
}

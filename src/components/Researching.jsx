import { useEffect, useState } from 'react'

const STEPS = [
  'Reading the question',
  'Pulling candidates from the shelf',
  'Resolving ingredient names and their aliases',
  'Checking each one against the safety record',
  'Separating audited certifications from brand claims',
  'Applying your saved preferences',
  'Writing the recommendation',
]

/**
 * The loading state shows its working. Research that arrives instantly and
 * unexplained is indistinguishable from a guess.
 */
export default function Researching({ query }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    setStep(0)
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      160,
    )
    return () => clearInterval(timer)
  }, [query])

  return (
    <div className="researching">
      <span className="label">Researching</span>
      <p className="researching__query">{query}</p>
      <ul className="researching__steps">
        {STEPS.map((text, index) => (
          <li
            key={text}
            className={index <= step ? 'is-done' : undefined}
            aria-hidden={index > step}
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

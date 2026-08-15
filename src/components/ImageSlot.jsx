import { imageFor, ratioFor } from '../assets/images/index.js'

/**
 * A photography slot.
 *
 * The layouts are built at the image weight the design system asks for, so an
 * unfilled slot holds its space rather than collapsing. It captions itself
 * with the id and ratio to add, which is the whole handover instruction.
 */
export default function ImageSlot({ slot, alt = '', className = '' }) {
  const src = imageFor(slot)
  const ratio = ratioFor(slot)

  if (src) {
    return (
      <img
        className={`image-slot ${className}`}
        style={{ aspectRatio: ratio }}
        src={src}
        alt={alt}
      />
    )
  }

  // A product with no slot assigned yet captions itself in words; one with a
  // named slot captions itself with the id, which is the handover instruction.
  const caption = slot || 'No photograph yet'

  return (
    <div
      className={`image-slot image-slot--empty ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={alt || `Image placeholder: ${caption}`}
    >
      <span className="image-slot__id">{caption}</span>
      <span className="image-slot__ratio">{ratio.replace(/\s/g, '')}</span>
    </div>
  )
}

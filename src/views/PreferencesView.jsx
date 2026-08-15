import { useState } from 'react'
import ImageSlot from '../components/ImageSlot.jsx'
import { AVOIDABLE_FAMILIES } from '../data/ingredients.js'
import { familyMembers, VERIFIABLE_CERTS, PRODUCTS } from '../lib/catalog.js'

/**
 * Preferences are stored as families, not as strings.
 *
 * Each toggle shows exactly which ingredient names it catches, because the
 * ingredient a shopper is trying to avoid is almost never printed under the
 * name they know it by. That disclosure is the feature.
 */
export default function PreferencesView({ prefs, onChange, onClear }) {
  const [brandDraft, setBrandDraft] = useState('')
  // Computed in render, not at module scope: the catalog loads after import.
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort()

  function toggle(key, value) {
    const current = prefs[key] ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...prefs, [key]: next })
  }

  function addBrand(event) {
    event.preventDefault()
    const name = brandDraft.trim()
    if (!name) return
    const current = prefs.trustedBrands ?? []
    if (!current.some((b) => b.toLowerCase() === name.toLowerCase())) {
      onChange({ ...prefs, trustedBrands: [...current, name] })
    }
    setBrandDraft('')
  }

  return (
    <div className="prefs">
      <div className="prefs__intro">
        <div>
          <span className="label">Preferences</span>
          <p className="prefs__lead">
            Everything here is applied to every answer, automatically, without
            being asked again.
          </p>
        </div>
        <ImageSlot slot="editorial-preferences" alt="" />
      </div>

      <div className="prefs__columns">
        <section className="prefs__section">
          <span className="label">Ingredients to avoid</span>
          <p className="muted prefs__note">
            Saved by family, so a single choice catches every name it is sold
            under.
          </p>

          <ul className="options">
            {AVOIDABLE_FAMILIES.map((family) => {
              const checked = (prefs.avoidedFamilies ?? []).includes(family)
              const members = familyMembers(family)
              return (
                <li key={family} className="option">
                  <label className="option__control">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle('avoidedFamilies', family)}
                    />
                    <span className="option__box" aria-hidden="true" />
                    <span className="option__name">{family}</span>
                  </label>
                  {/* Only worth saying when the family catches names the
                      shopper would not have thought to type. */}
                  {members.some(
                    (m) => m.name.toLowerCase() !== family,
                  ) && (
                    <p className="option__detail">
                      Catches {members.map((m) => m.name).join(', ')}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="prefs__section">
          <span className="label">Certifications that matter</span>
          <p className="muted prefs__note">
            Only third-party audited marks are listed. Phrases a brand prints on
            its own packaging are not certifications and cannot be saved here.
          </p>

          <ul className="options">
            {VERIFIABLE_CERTS.map((cert) => {
              const checked = (prefs.requiredCertifications ?? []).includes(
                cert.id,
              )
              return (
                <li key={cert.id} className="option">
                  <label className="option__control">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle('requiredCertifications', cert.id)}
                    />
                    <span className="option__box" aria-hidden="true" />
                    <span className="option__name">{cert.name}</span>
                  </label>
                  <p className="option__detail">
                    {cert.body}. {cert.what}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="prefs__section">
          <span className="label">Brands you trust</span>
          <p className="muted prefs__note">
            Favored when the assessment is otherwise close.
          </p>

          <form className="prefs__add" onSubmit={addBrand}>
            <input
              className="ask-field__input"
              type="text"
              value={brandDraft}
              list="brand-suggestions"
              placeholder="Add a brand"
              onChange={(event) => setBrandDraft(event.target.value)}
            />
            <datalist id="brand-suggestions">
              {brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            <button className="button" type="submit">
              Add
            </button>
          </form>

          <ul className="chips">
            {(prefs.trustedBrands ?? []).map((brand) => (
              <li key={brand}>
                <span>{brand}</span>
                <button
                  className="link"
                  onClick={() => toggle('trustedBrands', brand)}
                  aria-label={`Remove ${brand}`}
                >
                  Remove
                </button>
              </li>
            ))}
            {(prefs.trustedBrands ?? []).length === 0 && (
              <li className="muted">None saved yet</li>
            )}
          </ul>

          <button className="link prefs__clear" onClick={onClear}>
            Clear everything saved on this device
          </button>
        </section>
      </div>
    </div>
  )
}

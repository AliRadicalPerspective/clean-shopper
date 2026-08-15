/**
 * Certifications and claims, kept visibly separate.
 *
 * An audited third-party mark and a phrase the brand printed on its own
 * bottle are different objects, and collapsing them into one row of badges is
 * how shoppers get misled. So they sit under different headings, and the
 * self-declared ones are named as self-declared.
 */
export default function CertList({ evaluation }) {
  const { certs, unverifiedClaims } = evaluation

  return (
    <div className="certs">
      <div className="certs__group">
        <span className="label">Verified by others</span>
        {certs.length ? (
          <ul>
            {certs.map((c) => (
              <li key={c.id}>
                <span className="certs__name">{c.name}</span>
                <span className="certs__body">{c.body}</span>
                <p className="certs__what">{c.what}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="certs__none">
            None. This assessment rests on the ingredient list alone.
          </p>
        )}
      </div>

      {unverifiedClaims.length > 0 && (
        <div className="certs__group">
          <span className="label">Claimed by the brand</span>
          <ul>
            {unverifiedClaims.map((c) => (
              <li key={c.id}>
                <span className="certs__name">{c.name}</span>
                <span className="certs__body">Self-declared</span>
                <p className="certs__what">{c.what}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

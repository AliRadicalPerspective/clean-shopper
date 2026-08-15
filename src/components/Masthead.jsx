const NAV = [
  { name: 'research', label: 'Research' },
  { name: 'products', label: 'Shop' },
  { name: 'journal', label: 'Journal' },
  { name: 'preferences', label: 'Preferences' },
  { name: 'cart', label: 'Cart' },
]

export default function Masthead({ route, onNavigate, cartCount, bare }) {
  return (
    <header className={`masthead${bare ? ' masthead--bare' : ''}`}>
      <button
        className="wordmark"
        onClick={() => onNavigate({ name: 'ask' })}
        aria-label="Clean Shopper — home"
      >
        Clean Shopper
      </button>

      <nav className="nav" aria-label="Primary">
        {NAV.map((item) => {
          const current = route === item.name
          return (
            <button
              key={item.name}
              className={`nav__item${current ? ' is-current' : ''}`}
              aria-current={current ? 'page' : undefined}
              onClick={() => onNavigate({ name: item.name })}
            >
              {item.label}
              {item.name === 'cart' && cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
          )
        })}
      </nav>
    </header>
  )
}

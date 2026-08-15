import { useEffect, useRef, useState } from 'react'
import Masthead from './components/Masthead.jsx'
import Researching from './components/Researching.jsx'
import ChatDock from './components/ChatDock.jsx'
import AskView from './views/AskView.jsx'
import ResearchView from './views/ResearchView.jsx'
import ProductsView from './views/ProductsView.jsx'
import ProductView from './views/ProductView.jsx'
import CompareView from './views/CompareView.jsx'
import PreferencesView from './views/PreferencesView.jsx'
import CartView from './views/CartView.jsx'
import JournalView from './views/JournalView.jsx'
import ArticleView from './views/ArticleView.jsx'
import {
  product as findProduct,
  article as findArticle,
  loadCatalog,
  SOURCE,
} from './lib/catalog.js'
import { evaluateProduct } from './lib/evaluate.js'
import { research, compare } from './lib/research.js'
import { storage, DEFAULT_PREFERENCES } from './lib/storage.js'
import { useHashRoute } from './lib/router.js'
import './App.css'

export default function App() {
  const [route, navigate] = useHashRoute()

  const [prefs, setPrefs] = useState(() => storage.loadPreferences())
  const [cart, setCart] = useState(() => storage.loadCart())
  const [history, setHistory] = useState(() => storage.loadHistory())

  // Nothing renders until the catalog resolves. Painting the bundled seed and
  // then swapping it for the database a moment later would change prices and
  // products under the reader's eyes.
  const [catalogSource, setCatalogSource] = useState(null)

  const [thread, setThread] = useState([])
  const [busy, setBusy] = useState(false)
  const [comparison, setComparison] = useState(null)

  const turnId = useRef(0)
  const contextRef = useRef(null)
  const threadRef = useRef(thread)

  useEffect(() => {
    loadCatalog().then(setCatalogSource)
  }, [])

  useEffect(() => storage.savePreferences(prefs), [prefs])
  useEffect(() => storage.saveCart(cart), [cart])
  useEffect(() => storage.saveHistory(history), [history])

  // The synchronous reads above paint immediately from the local cache; this
  // reconciles against Supabase once and adopts the remote state if it is the
  // newer of the two. Resolves to null when local already wins or Supabase is
  // unconfigured, in which case the view stays exactly as it painted.
  useEffect(() => {
    let cancelled = false
    storage.sync().then((remote) => {
      if (cancelled || !remote) return
      setPrefs(remote.preferences)
      setCart(remote.cart)
      setHistory(remote.history)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    threadRef.current = thread
  }, [thread])

  // Changing route keeps the old scroll position otherwise — leaving you
  // halfway down a short page after a long thread. Research is exempt: it
  // scrolls itself to the newest turn.
  useEffect(() => {
    if (route.name !== 'research') window.scrollTo(0, 0)
  }, [route.name])

  async function handleAsk(query) {
    const id = (turnId.current += 1)
    const contextIn = contextRef.current

    setHistory((current) =>
      [query, ...current.filter((q) => q !== query)].slice(0, 5),
    )
    setThread((current) => [
      ...current,
      { id, query, contextIn, status: 'pending', result: null },
    ])
    navigate({ name: 'research' })
    setBusy(true)

    const result = await research(query, prefs, contextIn)
    contextRef.current = result.nextContext

    setThread((current) =>
      current.map((turn) =>
        turn.id === id ? { ...turn, status: 'done', result } : turn,
      ),
    )
    setBusy(false)
  }

  // Saved preferences apply to every subsequent recommendation, so changing
  // them re-runs the most recent question in place rather than leaving a
  // stale answer at the bottom of the thread.
  const prefsKey = JSON.stringify(prefs)
  const lastPrefsKey = useRef(prefsKey)
  useEffect(() => {
    if (lastPrefsKey.current === prefsKey) return
    lastPrefsKey.current = prefsKey

    const current = threadRef.current
    const last = current[current.length - 1]
    if (!last || last.status !== 'done') return

    let cancelled = false
    setBusy(true)
    research(last.query, JSON.parse(prefsKey), last.contextIn).then((result) => {
      if (cancelled) return
      contextRef.current = result.nextContext
      setThread((turns) =>
        turns.map((turn) => (turn.id === last.id ? { ...turn, result } : turn)),
      )
      setBusy(false)
    })
    return () => {
      cancelled = true
    }
  }, [prefsKey])

  const compareKey = route.name === 'compare' ? route.ids.join(',') : ''
  useEffect(() => {
    if (!compareKey) {
      setComparison(null)
      return
    }
    let cancelled = false
    setComparison(null)
    const products = compareKey.split(',').map(findProduct).filter(Boolean)
    compare(products, JSON.parse(prefsKey)).then((result) => {
      if (!cancelled) setComparison(result)
    })
    return () => {
      cancelled = true
    }
  }, [compareKey, prefsKey])

  function handleOpen(productId) {
    navigate({ name: 'product', productId })
  }

  function handleOpenArticle(slug) {
    navigate({ name: 'article', slug })
  }

  function handleCompare(productIds) {
    navigate({ name: 'compare', ids: productIds })
  }

  function handleAdd(productId) {
    setCart((current) =>
      current.some((entry) => entry.productId === productId)
        ? current
        : [...current, { productId, qty: 1 }],
    )
  }

  function handleQty(productId, qty) {
    if (qty < 1) return handleRemove(productId)
    setCart((current) =>
      current.map((entry) =>
        entry.productId === productId ? { ...entry, qty } : entry,
      ),
    )
  }

  function handleRemove(productId) {
    setCart((current) =>
      current.filter((entry) => entry.productId !== productId),
    )
  }

  function handleClear() {
    storage.clear()
    setPrefs(DEFAULT_PREFERENCES)
    setCart([])
    setHistory([])
  }

  function goBack() {
    window.history.back()
  }

  const cartIds = cart.map((entry) => entry.productId)
  const cartEntries = cart
    .map((entry) => {
      const item = findProduct(entry.productId)
      return item
        ? { evaluation: evaluateProduct(item, prefs), qty: entry.qty }
        : null
    })
    .filter(Boolean)

  if (!catalogSource) {
    return (
      <div className="shell boot">
        <span className="label">Clean Shopper</span>
        <p className="muted">Loading the catalog…</p>
      </div>
    )
  }

  return (
    <div className="shell">
      <Masthead
        route={route.name}
        onNavigate={navigate}
        cartCount={cart.length}
        bare={route.name === 'ask'}
      />

      <main className="page">
        {route.name === 'ask' && (
          <AskView
            onAsk={handleAsk}
            history={history}
            prefsSummary={summarise(prefs)}
            onNavigate={navigate}
          />
        )}

        {route.name === 'research' && (
          <ResearchView
            thread={thread}
            onAsk={handleAsk}
            onOpen={handleOpen}
            onAdd={handleAdd}
            onCompare={handleCompare}
            onOpenArticle={handleOpenArticle}
            cartIds={cartIds}
            busy={busy}
          />
        )}

        {route.name === 'journal' && (
          <JournalView onOpenArticle={handleOpenArticle} />
        )}

        {route.name === 'article' && (
          <ArticleView
            piece={findArticle(route.slug)}
            onOpenArticle={handleOpenArticle}
            onBack={goBack}
          />
        )}

        {route.name === 'products' && (
          <ProductsView
            route={route}
            prefs={prefs}
            onNavigate={navigate}
            onOpen={handleOpen}
            onAdd={handleAdd}
            cartIds={cartIds}
          />
        )}

        {route.name === 'product' &&
          (() => {
            const item = findProduct(route.productId)
            if (!item) {
              return <p className="muted">That product no longer exists.</p>
            }
            return (
              <ProductView
                evaluation={evaluateProduct(item, prefs)}
                onAdd={handleAdd}
                onBack={goBack}
                inCart={cartIds.includes(item.id)}
              />
            )
          })()}

        {route.name === 'compare' &&
          (comparison ? (
            <CompareView
              comparison={comparison}
              onBack={goBack}
              onOpen={handleOpen}
              onAdd={handleAdd}
              cartIds={cartIds}
            />
          ) : (
            <Researching query="Comparing" />
          ))}

        {route.name === 'preferences' && (
          <PreferencesView
            prefs={prefs}
            onChange={setPrefs}
            onClear={handleClear}
          />
        )}

        {route.name === 'cart' && (
          <CartView
            entries={cartEntries}
            onOpen={handleOpen}
            onRemove={handleRemove}
            onQty={handleQty}
            onCompare={handleCompare}
            onNavigate={navigate}
          />
        )}
      </main>

      {catalogSource === SOURCE.bundled && (
        <p className="fallback-note">
          Showing bundled catalog data — not connected to Supabase.
        </p>
      )}

      <ChatDock
        prefs={prefs}
        onChangePrefs={setPrefs}
        onOpenProduct={handleOpen}
        onAdd={handleAdd}
        cartIds={cartIds}
      />
    </div>
  )
}

function summarise(prefs) {
  const parts = []
  const avoided = prefs.avoidedFamilies ?? []
  const certs = prefs.requiredCertifications ?? []
  const brands = prefs.trustedBrands ?? []

  if (avoided.length) parts.push(`avoiding ${avoided.join(', ')}`)
  if (certs.length)
    parts.push(
      `requiring ${certs.length} certification${certs.length > 1 ? 's' : ''}`,
    )
  if (brands.length) parts.push(`favoring ${brands.join(', ')}`)

  if (!parts.length) return 'No preferences saved yet.'
  return `Currently ${parts.join('; ')}.`
}

import { useCallback, useEffect, useState } from 'react'

/**
 * Hash routing, no dependency.
 *
 * Views were React state until now, which meant nothing had a URL — you could
 * not link to a product, a filtered catalog, or a comparison. Every screen
 * is addressable from here on.
 */

export function parseHash(raw) {
  const hash = (raw || '').replace(/^#/, '') || '/'
  const [path, search] = hash.split('?')
  const params = new URLSearchParams(search ?? '')
  const parts = path.split('/').filter(Boolean)

  switch (parts[0]) {
    case undefined:
      return { name: 'ask' }
    case 'research':
      return { name: 'research' }
    case 'products':
      return {
        name: 'products',
        category: params.get('category') || null,
        subcategory: params.get('subcategory') || null,
      }
    case 'product':
      return parts[1] ? { name: 'product', productId: parts[1] } : { name: 'ask' }
    case 'compare':
      return {
        name: 'compare',
        ids: (params.get('ids') || '').split(',').filter(Boolean),
      }
    case 'journal':
      return parts[1]
        ? { name: 'article', slug: parts[1] }
        : { name: 'journal' }
    case 'preferences':
      return { name: 'preferences' }
    case 'cart':
      return { name: 'cart' }
    default:
      return { name: 'ask' }
  }
}

export function buildHash(route) {
  switch (route.name) {
    case 'research':
      return '#/research'
    case 'products': {
      const params = new URLSearchParams()
      if (route.category) params.set('category', route.category)
      if (route.subcategory) params.set('subcategory', route.subcategory)
      const search = params.toString()
      return search ? `#/products?${search}` : '#/products'
    }
    case 'product':
      return `#/product/${route.productId}`
    case 'compare':
      return `#/compare?ids=${route.ids.join(',')}`
    case 'journal':
      return '#/journal'
    case 'article':
      return `#/journal/${route.slug}`
    case 'preferences':
      return '#/preferences'
    case 'cart':
      return '#/cart'
    default:
      return '#/'
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next) => {
    const hash = buildHash(next)
    if (hash === (window.location.hash || '#/')) {
      setRoute(parseHash(hash))
    } else {
      window.location.hash = hash
    }
  }, [])

  return [route, navigate]
}

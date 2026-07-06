import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '@/data/products'

const SITE_URL = 'https://luxe2026.github.io/luxe-fashion-store'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(
    `meta[${attr}="${key}"]`,
  ) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id: string, data: unknown) {
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  const el = document.createElement('script')
  el.id = id
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify(data)
  document.head.appendChild(el)
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove()
}

/** Redirect legacy hash URLs (/#/shop) to history URLs (/shop). */
export function useHashRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#/')) {
      const path = hash.slice(1)
      window.history.replaceState(null, '', path)
      navigate(path, { replace: true })
    }
  }, [navigate])
}

/** Dynamically update SEO meta based on the current route. */
export function useSEO() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const slugMatch = path.match(/^\/product\/(.+)$/)
    const slug = slugMatch?.[1]
    const product = slug ? getProductBySlug(slug) : undefined

    let title = 'Aurelia — Curated Fashion'
    let description =
      'Aurelia — Curated fashion for the modern woman. Shop premium dresses, sets, and bottoms with worldwide shipping.'
    let ogImage = product?.images[0] || `${SITE_URL}/favicon.svg`
    let ogType = 'website'

    if (product) {
      title = `${product.name} | Aurelia`
      description =
        product.description.length > 160
          ? product.description.slice(0, 157) + '...'
          : product.description
      ogType = 'product'
      setJsonLd('ld-product', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.slug,
        category: product.category,
        brand: { '@type': 'Brand', name: 'Aurelia' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `${SITE_URL}/product/${product.slug}`,
        },
      })
    } else {
      removeJsonLd('ld-product')
      if (path === '/shop') {
        title = 'Shop All | Aurelia — Curated Fashion'
        description =
          'Browse the full Aurelia collection — dresses, sets, denim, jumpsuits and more. Free worldwide shipping over $150.'
      } else if (path === '/') {
        title = 'Aurelia — Curated Fashion for the Modern Woman'
        description =
          'Discover Aurelia: curated dresses, sets, and bottoms for the modern woman. Premium quality, worldwide shipping, hassle-free returns.'
      }
    }

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:url', SITE_URL + path)
    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:site_name', 'Aurelia')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)
    upsertLink('canonical', SITE_URL + path)
  }, [location])
}

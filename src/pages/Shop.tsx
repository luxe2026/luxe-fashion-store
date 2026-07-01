import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useI18nStore } from '../store/i18nStore'
import { products, categories } from '../data/products'
import ProductCard from '../components/ProductCard'
import type { ProductCategory } from '../types'

type SortOption = 'featured' | 'priceLow' | 'priceHigh' | 'newest' | 'rating'

export default function Shop() {
  const { t, language } = useI18nStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'all'
  const query = searchParams.get('q') || ''
  const filter = searchParams.get('filter') || ''

  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category !== 'all' ? [category] : [])
  const [showFilters, setShowFilters] = useState(false)

  // Sync category from URL
  useEffect(() => {
    if (category !== 'all') {
      setSelectedCategories([category])
    } else {
      setSelectedCategories([])
    }
  }, [category])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category))
    }

    // Search filter
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }

    // New filter
    if (filter === 'new') {
      result = result.filter((p) => p.isNew)
    }

    // Price filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    switch (sortBy) {
      case 'priceLow':
        result.sort((a, b) => a.price - b.price)
        break
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Featured - best sellers first, then new
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
    }

    return result
  }, [selectedCategories, query, filter, priceRange, sortBy])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      // Update URL
      if (next.length === 1) {
        setSearchParams({ category: next[0] })
      } else if (next.length === 0) {
        setSearchParams({})
      }
      return next
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 500])
    setSortBy('featured')
    setSearchParams({})
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'featured', label: t('sort.featured') },
    { value: 'priceLow', label: t('sort.priceLow') },
    { value: 'priceHigh', label: t('sort.priceHigh') },
    { value: 'newest', label: t('sort.newest') },
    { value: 'rating', label: t('sort.rating') },
  ]

  // Breadcrumb
  const currentCategory = categories.find((c) => c.key === category)
  const pageTitle = currentCategory
    ? language === 'en'
      ? currentCategory.labelEn
      : currentCategory.labelZh
    : query
    ? `"${query}"`
    : t('shop.title')

  return (
    <div>
      {/* Page Header */}
      <div className="bg-stone-light py-12 md:py-16">
        <div className="container-luxe text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
            <Link to="/" className="hover:text-accent">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-accent">{t('nav.shop')}</Link>
            {currentCategory && (
              <>
                <span>/</span>
                <span className="text-primary">{pageTitle}</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif font-light">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {filteredProducts.length} {t('shop.results')}
          </p>
        </div>
      </div>

      <div className="container-luxe py-8 md:py-12">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('shop.filterBy')}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-300 px-3 py-2"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium tracking-widest uppercase mb-4 pb-2 border-b">
                  {t('shop.category')}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategories([]); setSearchParams({}) }}
                    className={`block text-sm w-full text-left py-1 hover:text-accent transition-colors ${
                      selectedCategories.length === 0 ? 'text-accent font-medium' : 'text-gray-600'
                    }`}
                  >
                    {t('shop.allProducts')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => toggleCategory(cat.key)}
                      className={`block text-sm w-full text-left py-1 hover:text-accent transition-colors ${
                        selectedCategories.includes(cat.key) ? 'text-accent font-medium' : 'text-gray-600'
                      }`}
                    >
                      {language === 'en' ? cat.labelEn : cat.labelZh}
                      <span className="text-gray-400 ml-2 text-xs">
                        ({products.filter((p) => p.category === cat.key).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium tracking-widest uppercase mb-4 pb-2 border-b">
                  {t('shop.priceRange')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-accent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Min</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full text-sm border border-gray-300 px-2 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full text-sm border border-gray-300 px-2 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-accent underline underline-offset-4"
              >
                {t('shop.clearFilters')}
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length} {t('shop.results')}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">{t('shop.sortBy')}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg text-gray-500 mb-2">{t('shop.noResults')}</p>
                <button onClick={clearFilters} className="btn-outline mt-4">{t('shop.clearFilters')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

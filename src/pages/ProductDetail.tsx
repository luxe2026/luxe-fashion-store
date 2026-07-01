import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useI18nStore } from '../store/i18nStore'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import { getProductBySlug, products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const product = slug ? getProductBySlug(slug) : undefined

  const { t, formatPrice, language } = useI18nStore()
  const { addItem } = useCartStore()
  const { toggleWishlist, isInWishlist } = useUserStore()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description')
  const [showNotification, setShowNotification] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSelectedImage(0)
    setSelectedSize('')
    setSelectedColor(product?.colors[0]?.name || '')
    setQuantity(1)
    setActiveTab('description')
    window.scrollTo(0, 0)
  }, [slug])

  if (!product) {
    return (
      <div className="container-luxe py-20 text-center">
        <h1 className="text-2xl font-serif mb-4">{language === 'en' ? 'Product Not Found' : '产品未找到'}</h1>
        <Link to="/shop" className="btn-primary">{t('nav.shop')}</Link>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const stockStatus =
    product.stock > 20 ? t('product.inStock') : product.stock > 0 ? t('product.lowStock') : t('product.outOfStock')

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 1) {
      setError(t('product.selectSize'))
      return
    }
    if (!selectedColor) {
      setError(t('product.selectColor'))
      return
    }
    const size = selectedSize || product.sizes[0]
    addItem(product.id, size, selectedColor, quantity)
    setError('')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes.length > 1) {
      setError(t('product.selectSize'))
      return
    }
    if (!selectedColor) {
      setError(t('product.selectColor'))
      return
    }
    const size = selectedSize || product.sizes[0]
    addItem(product.id, size, selectedColor, quantity)
    navigate('/checkout')
  }

  // Mock reviews
  const reviews = [
    { name: 'Emma R.', rating: 5, date: '2025-06-15', comment: language === 'en' ? 'Absolutely love this! The quality exceeded my expectations. Will definitely buy again.' : '非常喜欢!质量超出了我的期望。一定会回购。' },
    { name: 'James L.', rating: 5, date: '2025-06-10', comment: language === 'en' ? 'Perfect fit and beautiful material. Highly recommend.' : '版型完美,材质漂亮。强烈推荐。' },
    { name: 'Sofia M.', rating: 4, date: '2025-06-02', comment: language === 'en' ? 'Great product, runs slightly large so consider sizing down.' : '很好的产品,偏大一点,建议选小一码。' },
  ]

  return (
    <div>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-3 text-sm shadow-xl animate-slide-up">
          ✓ {t('product.addedToCart')}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container-luxe py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-accent">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-accent">{t('nav.shop')}</Link>
            <span>/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-accent capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-primary">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Main */}
      <div className="container-luxe py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-28 border-2 overflow-hidden ${
                    selectedImage === idx ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1">
              <div className="relative product-card-image aspect-[3/4]">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                {(product.isNew || product.isBestSeller) && (
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {product.isNew && (
                      <span className="bg-primary text-white text-[10px] tracking-widest px-2.5 py-1 uppercase">
                        {t('product.new')}
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-accent text-white text-[10px] tracking-widest px-2.5 py-1 uppercase">
                        {t('product.bestseller')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'text-accent fill-current' : 'text-gray-300 fill-current'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 1l2.598 5.262L18 7.27l-4 3.9.944 5.506L10 14.5l-4.944 2.176L6 11.17l-4-3.9 5.402-.008L10 1z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} · {product.reviewCount} {t('product.reviews')}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-light mb-3">{product.name}</h1>
            <p className="text-2xl font-medium text-primary mb-4">{formatPrice(product.price)}</p>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">{stockStatus}</span>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="label">{t('product.color')}: <span className="text-primary normal-case font-medium">{selectedColor}</span></label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">{t('product.size')}</label>
                <button className="text-xs text-gray-500 hover:text-accent underline underline-offset-4">
                  {t('product.sizeGuide')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] px-4 py-2.5 text-sm border transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="label">{t('product.quantity')}</label>
              <div className="flex items-center border border-gray-300 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-lg hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-3 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 text-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} className="btn-primary flex-1">{t('product.addToCart')}</button>
              <button onClick={handleBuyNow} className="btn-accent flex-1">{t('product.buyNow')}</button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn-outline px-4"
                aria-label={t('common.addToWishlist')}
              >
                <svg
                  className={`w-5 h-5 ${inWishlist ? 'fill-red-500 stroke-red-500' : 'fill-none'}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Free Shipping Note */}
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4 border-t border-gray-100">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {t('product.freeShippingNote')}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {([
              { key: 'description', label: t('product.description') },
              { key: 'details', label: t('product.details') },
              { key: 'reviews', label: `${t('product.reviews')} (${product.reviewCount})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm tracking-wide border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key ? 'border-accent text-primary font-medium' : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-sm text-gray-600 leading-relaxed animate-fade-in">
                <p>{product.description}</p>
                <p className="mt-4">
                  {language === 'en'
                    ? 'Each piece in our collection is crafted with meticulous attention to detail, using only the finest materials. We believe in creating fashion that lasts — both in quality and style.'
                    : '我们系列中的每一件单品都经过精心制作,只使用最优质的材料。我们坚信创造持久的时尚 — 无论在品质还是风格上。'}
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <ul className="space-y-3 animate-fade-in">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                {/* Review Summary */}
                <div className="flex items-center gap-8 mb-8 p-6 bg-stone-light">
                  <div className="text-center">
                    <p className="text-4xl font-serif text-accent">{product.rating}</p>
                    <div className="flex justify-center my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-accent fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M10 1l2.598 5.262L18 7.27l-4 3.9.944 5.506L10 14.5l-4.944 2.176L6 11.17l-4-3.9 5.402-.008L10 1z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{product.reviewCount} {t('product.reviews')}</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{star}</span>
                        <svg className="w-3 h-3 text-accent fill-current" viewBox="0 0 20 20"><path d="M10 1l2.598 5.262L18 7.27l-4 3.9.944 5.506L10 14.5l-4.944 2.176L6 11.17l-4-3.9 5.402-.008L10 1z" /></svg>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${star === 5 ? 75 : star === 4 ? 18 : star === 3 ? 5 : 1}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="pb-6 border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.name}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-accent fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20"><path d="M10 1l2.598 5.262L18 7.27l-4 3.9.944 5.506L10 14.5l-4.944 2.176L6 11.17l-4-3.9 5.402-.008L10 1z" /></svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="section-title">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

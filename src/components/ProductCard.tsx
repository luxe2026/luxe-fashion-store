import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Product } from '../types'
import { useI18nStore } from '../store/i18nStore'
import { useUserStore } from '../store/userStore'
import { useCartStore } from '../store/cartStore'

export default function ProductCard({ product }: { product: Product }) {
  const { t, formatPrice } = useI18nStore()
  const { toggleWishlist, isInWishlist } = useUserStore()
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const inWishlist = isInWishlist(product.id)
  const stockStatus = product.stock > 20 ? t('product.inStock') : product.stock > 0 ? t('product.lowStock') : t('product.outOfStock')

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sizes.length === 1) {
      addItem(product.id, product.sizes[0], product.colors[0].name, 1)
    } else {
      // Navigate to product page for size selection
      navigate(`/product/${product.slug}`)
    }
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="product-card-image relative">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-primary text-white text-[10px] tracking-widest px-2.5 py-1 uppercase font-medium">
              {t('product.new')}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-accent text-white text-[10px] tracking-widest px-2.5 py-1 uppercase font-medium">
              {t('product.bestseller')}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          aria-label={inWishlist ? t('common.removeFromWishlist') : t('common.addToWishlist')}
        >
          <svg
            className={`w-4 h-4 ${inWishlist ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-700'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick Add Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-white/95 transition-transform duration-300 ${
            hovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 text-xs tracking-widest uppercase border border-primary hover:bg-primary hover:text-white transition-colors"
          >
            {t('product.addToCart')}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 text-center">
        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <svg className="w-3 h-3 text-accent fill-current" viewBox="0 0 20 20">
            <path d="M10 1l2.598 5.262L18 7.27l-4 3.9.944 5.506L10 14.5l-4.944 2.176L6 11.17l-4-3.9 5.402-.008L10 1z" />
          </svg>
          <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
        </div>

        <h3 className="text-sm font-medium text-gray-800 group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Colors */}
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        <p className="text-sm font-medium text-primary mt-2">{formatPrice(product.price)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{stockStatus}</p>
      </div>
    </Link>
  )
}

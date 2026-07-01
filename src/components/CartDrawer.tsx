import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useI18nStore } from '../store/i18nStore'
import { getProductById } from '../data/products'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const { t, formatPrice, language } = useI18nStore()
  const subtotal = getSubtotal()
  const FREE_SHIPPING_THRESHOLD = 150
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-serif">{t('cart.title')} ({items.length})</h2>
          <button onClick={closeCart} className="p-1 hover:text-accent" aria-label={t('common.close')}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-stone-light text-xs text-center">
            {remaining > 0 ? (
              <p>{t('cart.freeShippingProgress', { amount: formatPrice(remaining) })}</p>
            ) : (
              <p className="text-accent font-medium">{t('cart.freeShippingEarned')}</p>
            )}
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-1">{t('cart.empty')}</p>
              <p className="text-sm text-gray-400 mb-6">{t('cart.emptyText')}</p>
              <button onClick={closeCart} className="btn-outline">{t('cart.continueShopping')}</button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {items.map((item, idx) => {
                const product = getProductById(item.productId)
                if (!product) return null
                return (
                  <div key={`${item.productId}-${item.size}-${item.color}-${idx}`} className="flex gap-4">
                    {/* Image */}
                    <Link to={`/product/${product.slug}`} onClick={closeCart} className="flex-shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-20 h-24 object-cover bg-stone-light" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product.slug}`} onClick={closeCart} className="text-sm font-medium hover:text-accent line-clamp-1">
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('cart.color')}: {item.color} | {t('cart.size')}: {item.size}
                      </p>
                      <p className="text-sm font-medium text-accent mt-1">{formatPrice(product.price)}</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="px-2 py-1 text-sm hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="px-2 py-1 text-sm hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.subtotal')}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.shipping')}</span>
              <span className="text-gray-600">{t('cart.shippingCalc')}</span>
            </div>
            <Link
              to="/cart"
              onClick={closeCart}
              className="btn-outline w-full"
            >
              {language === 'en' ? 'View Cart' : '查看购物车'}
            </Link>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full"
            >
              {t('cart.checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

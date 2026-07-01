import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useI18nStore } from '../store/i18nStore'
import { getProductById } from '../data/products'

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const { t, formatPrice, language } = useI18nStore()
  const subtotal = getSubtotal()
  const FREE_SHIPPING_THRESHOLD = 150
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  if (items.length === 0) {
    return (
      <div className="container-luxe py-20 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="text-2xl font-serif mb-2">{t('cart.empty')}</h1>
        <p className="text-sm text-gray-400 mb-8">{t('cart.emptyText')}</p>
        <Link to="/shop" className="btn-primary">{t('cart.continueShopping')}</Link>
      </div>
    )
  }

  return (
    <div className="container-luxe py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-accent">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-primary">{t('cart.title')}</span>
      </nav>

      <h1 className="text-3xl font-serif font-light mb-8">{t('cart.title')}</h1>

      {/* Free Shipping Progress */}
      {remaining > 0 ? (
        <div className="bg-stone-light p-4 mb-6 text-sm text-center">
          {t('cart.freeShippingProgress', { amount: formatPrice(remaining) })}
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }} />
          </div>
        </div>
      ) : (
        <div className="bg-accent/10 p-4 mb-6 text-sm text-center text-accent font-medium">
          {t('cart.freeShippingEarned')}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="border border-gray-100">
            {items.map((item, idx) => {
              const product = getProductById(item.productId)
              if (!product) return null
              return (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                  className="flex gap-4 p-6 border-b border-gray-100 last:border-0"
                >
                  {/* Image */}
                  <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                    <img src={product.images[0]} alt={product.name} className="w-24 h-32 md:w-32 md:h-40 object-cover bg-stone-light" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <div>
                        <Link to={`/product/${product.slug}`} className="text-sm md:text-base font-medium hover:text-accent">
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('cart.color')}: {item.color} | {t('cart.size')}: {item.size}
                        </p>
                      </div>
                      <p className="text-sm md:text-base font-medium text-primary">{formatPrice(product.price * item.quantity)}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-3 py-1.5 text-sm hover:bg-gray-100"
                        >−</button>
                        <span className="px-4 py-1.5 text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-3 py-1.5 text-sm hover:bg-gray-100"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continue Shopping */}
          <Link to="/shop" className="inline-flex items-center gap-2 mt-6 text-sm text-gray-600 hover:text-accent">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('cart.continueShopping')}
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-light p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-serif mb-4">{t('checkout.orderSummary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')} ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span className="font-medium">{shipping === 0 ? t('cart.free') : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.tax')} (8%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between text-base">
                <span className="font-medium">{t('cart.total')}</span>
                <span className="font-serif font-bold text-accent text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full mt-6">
              {t('cart.checkout')}
            </Link>

            {/* Payment Icons */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {['VISA', 'MC', 'AMEX', 'PAYPAL'].map((p) => (
                <span key={p} className="text-[9px] font-bold border border-gray-300 px-1.5 py-1 text-gray-500">{p}</span>
              ))}
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {language === 'en' ? 'Secure SSL Encrypted Checkout' : 'SSL 安全加密结算'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

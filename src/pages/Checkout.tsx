import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useI18nStore } from '../store/i18nStore'
import { useUserStore } from '../store/userStore'
import { getProductById } from '../data/products'
import type { Order } from '../types'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getSubtotal, clearCart } = useCartStore()
  const { t, formatPrice, language } = useI18nStore()
  const { user, addOrder } = useUserStore()

  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: language === 'zh' ? 'China' : 'United States',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })

  const subtotal = getSubtotal()
  const FREE_SHIPPING_THRESHOLD = 150
  const shippingCost =
    shippingMethod === 'express' ? 25 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container-luxe py-20 text-center">
        <h1 className="text-2xl font-serif mb-4">{t('cart.empty')}</h1>
        <Link to="/shop" className="btn-primary">{t('cart.continueShopping')}</Link>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newOrderId = `LX-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`
    const order: Order = {
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      total,
      currency: 'USD',
      items: items.map((item) => {
        const product = getProductById(item.productId)
        return {
          name: product?.name || '',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: product?.price || 0,
        }
      }),
      shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`,
    }
    addOrder(order)
    setOrderId(newOrderId)
    setOrderPlaced(true)
    clearCart()
    window.scrollTo(0, 0)
  }

  // Success Page
  if (orderPlaced) {
    return (
      <div className="container-luxe py-20 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif mb-3">{t('checkout.success')}</h1>
        <p className="text-gray-600 mb-6">{t('checkout.successText')}</p>
        <div className="bg-stone-light p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">{t('checkout.orderNumber')}</p>
          <p className="text-xl font-serif font-medium text-accent">{orderId}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/shop" className="btn-primary">{t('checkout.continueShopping')}</Link>
          <Link to="/account" className="btn-outline">{t('account.orders')}</Link>
        </div>
      </div>
    )
  }

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'South Korea', 'Singapore', 'Other']

  return (
    <div className="container-luxe py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link to="/cart" className="hover:text-accent">{t('cart.title')}</Link>
        <span>/</span>
        <span className="text-primary">{t('checkout.title')}</span>
      </nav>

      <h1 className="text-3xl font-serif font-light mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            <section>
              <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary text-white text-sm flex items-center justify-center rounded-full">1</span>
                {t('checkout.contact')}
              </h2>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleInputChange}
                placeholder={t('checkout.email')}
                className="input"
              />
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary text-white text-sm flex items-center justify-center rounded-full">2</span>
                {t('checkout.shipping')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('checkout.firstName')}</label>
                  <input name="firstName" required value={form.firstName} onChange={handleInputChange} className="input" />
                </div>
                <div>
                  <label className="label">{t('checkout.lastName')}</label>
                  <input name="lastName" required value={form.lastName} onChange={handleInputChange} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">{t('checkout.address')}</label>
                  <input name="address" required value={form.address} onChange={handleInputChange} className="input" />
                </div>
                <div>
                  <label className="label">{t('checkout.city')}</label>
                  <input name="city" required value={form.city} onChange={handleInputChange} className="input" />
                </div>
                <div>
                  <label className="label">{t('checkout.state')}</label>
                  <input name="state" required value={form.state} onChange={handleInputChange} className="input" />
                </div>
                <div>
                  <label className="label">{t('checkout.zip')}</label>
                  <input name="zip" required value={form.zip} onChange={handleInputChange} className="input" />
                </div>
                <div>
                  <label className="label">{t('checkout.country')}</label>
                  <select name="country" value={form.country} onChange={handleInputChange} className="input">
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">{t('checkout.phone')}</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleInputChange} className="input" />
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary text-white text-sm flex items-center justify-center rounded-full">3</span>
                {t('checkout.shippingMethod')}
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shippingMethod" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="accent-accent" />
                    <div>
                      <p className="text-sm font-medium">{t('checkout.standard')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? t('checkout.free') : formatPrice(15)}
                  </span>
                </label>
                <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shippingMethod" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="accent-accent" />
                    <div>
                      <p className="text-sm font-medium">{t('checkout.express')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(25)}</span>
                </label>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary text-white text-sm flex items-center justify-center rounded-full">4</span>
                {t('checkout.payment')}
              </h2>
              <div className="space-y-3 mb-4">
                <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-accent" />
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <span className="text-sm font-medium">{t('checkout.payWithCard')}</span>
                </label>
                <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-accent" />
                  <span className="text-sm font-bold text-blue-600">PayPal</span>
                  <span className="text-sm text-gray-500">{t('checkout.payWithPaypal')}</span>
                </label>
              </div>

              {/* Card Fields */}
              {paymentMethod === 'card' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="col-span-2">
                    <label className="label">{t('checkout.cardNumber')}</label>
                    <input
                      name="cardNumber"
                      required
                      value={form.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="input"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">{t('checkout.cardName')}</label>
                    <input name="cardName" required value={form.cardName} onChange={handleInputChange} className="input" />
                  </div>
                  <div>
                    <label className="label">{t('checkout.expiry')}</label>
                    <input name="expiry" required value={form.expiry} onChange={handleInputChange} placeholder="MM/YY" maxLength={5} className="input" />
                  </div>
                  <div>
                    <label className="label">{t('checkout.cvv')}</label>
                    <input name="cvv" required value={form.cvv} onChange={handleInputChange} placeholder="123" maxLength={4} className="input" />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-4 bg-blue-50 text-sm text-gray-600 text-center animate-fade-in">
                  {language === 'en' ? 'You will be redirected to PayPal to complete your payment.' : '您将被重定向到 PayPal 完成支付。'}
                </div>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-light p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-serif mb-4">{t('checkout.orderSummary')}</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item, idx) => {
                  const product = getProductById(item.productId)
                  if (!product) return null
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img src={product.images[0]} alt="" className="w-14 h-16 object-cover" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{item.color} / {item.size}</p>
                        <p className="text-xs font-medium text-accent mt-1">{formatPrice(product.price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-300 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.shipping')}</span>
                  <span>{shippingCost === 0 ? t('cart.free') : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-medium border-t border-gray-300 pt-2 mt-2">
                  <span>{t('cart.total')}</span>
                  <span className="text-accent font-serif text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                {t('checkout.placeOrder')}
              </button>

              <Link to="/cart" className="block text-center text-sm text-gray-500 hover:text-accent mt-4">
                {t('checkout.backToCart')}
              </Link>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {language === 'en' ? 'Your information is secure' : '您的信息安全有保障'}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

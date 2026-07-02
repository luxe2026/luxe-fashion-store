import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useI18nStore } from '../store/i18nStore'
import { useUserStore } from '../store/userStore'
import { getProductById } from '../data/products'
import {
  buildWhatsAppOrderLink,
  generateOrderId,
  buildOrderRecord,
  WHATSAPP_NUMBER,
} from '../utils/whatsappOrder'
import type { Order } from '../types'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getSubtotal, clearCart } = useCartStore()
  const { t, formatPrice, language } = useI18nStore()
  const { user, addOrder } = useUserStore()

  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'card' | 'paypal'>('whatsapp')

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
    notes: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newOrderId = generateOrderId()

    const totals = {
      subtotal,
      shipping: shippingCost,
      tax,
      total,
      shippingMethod,
    }

    const order: Order = buildOrderRecord(newOrderId, items, form, totals)
    addOrder(order)

    if (paymentMethod === 'whatsapp' || paymentMethod === 'paypal') {
      const link = buildWhatsAppOrderLink(items, form, totals, newOrderId, language)
      setWhatsappLink(link)
      setOrderId(newOrderId)
      setOrderPlaced(true)
      clearCart()
      window.open(link, '_blank')
      window.scrollTo(0, 0)
      return
    }

    setOrderId(newOrderId)
    setOrderPlaced(true)
    clearCart()
    window.scrollTo(0, 0)
  }

  if (orderPlaced && (paymentMethod === 'whatsapp' || paymentMethod === 'paypal')) {
    return (
      <div className="container-luxe py-20 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif mb-3">{t('checkout.whatsappSuccess')}</h1>
        <p className="text-gray-600 mb-6">{t('checkout.whatsappSuccessText')}</p>
        <div className="bg-stone-light p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">{t('checkout.orderNumber')}</p>
          <p className="text-xl font-serif font-medium text-accent">{orderId}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 mb-8 text-sm text-amber-800">
          {t('checkout.whatsappOpenManually')}
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('checkout.openWhatsapp')}
          </a>
          <Link to="/shop" className="btn-outline">{t('checkout.continueShopping')}</Link>
          <Link to="/account" className="btn-outline">{t('account.orders')}</Link>
        </div>
      </div>
    )
  }

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
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link to="/cart" className="hover:text-accent">{t('cart.title')}</Link>
        <span>/</span>
        <span className="text-primary">{t('checkout.title')}</span>
      </nav>

      <h1 className="text-3xl font-serif font-light mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: t('checkout.trustGuarantee') },
          { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', text: t('checkout.trustShipping') },
          { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: t('checkout.trustSecure') },
          { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M15 12a3 3 0 11-6 0 3 3 0 016 0z', text: t('checkout.trustSupport') },
        ].map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center text-center gap-2 p-3 bg-stone-light">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={badge.icon} />
            </svg>
            <span className="text-[11px] text-gray-600 leading-tight">{badge.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                  <input name="phone" type="tel" required value={form.phone} onChange={handleInputChange} className="input" />
                </div>
              </div>
            </section>

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

            <section>
              <label className="label">{t('checkout.orderNotes')}</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder={t('checkout.orderNotesPlaceholder')}
                rows={3}
                className="input resize-none"
              />
            </section>

            <section>
              <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary text-white text-sm flex items-center justify-center rounded-full">4</span>
                {t('checkout.payment')}
              </h2>
              <div className="space-y-3 mb-4">
                <label className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} className="mt-1 accent-green-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-sm font-bold text-green-700">{t('checkout.payWithWhatsapp')}</span>
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">{language === 'en' ? 'Recommended' : '推荐'}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{t('checkout.payWithWhatsappDesc')}</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border cursor-not-allowed opacity-60 bg-gray-50`}>
                  <input type="radio" name="paymentMethod" disabled className="accent-accent" />
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t('checkout.payWithCard')}</span>
                      <span className="text-[10px] bg-gray-400 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">{t('checkout.comingSoon')}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t('checkout.payWithCardDesc')}</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-blue-600" />
                  <span className="text-sm font-bold text-[#003087]">PayPal</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">PayPal</span>
                      <span className="text-[10px] bg-[#003087] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">{language === 'en' ? 'Secure' : '安全'}</span>
                    </div>
                    <p className="text-xs text-gray-600">{t('checkout.payWithPaypalDesc')}</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-stone-light p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-serif mb-4">{t('checkout.orderSummary')}</h2>

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

              <button type="submit" className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2">
                {paymentMethod === 'whatsapp' ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t('checkout.placeOrderWhatsapp')}
                  </>
                ) : (
                  t('checkout.placeOrderCard')
                )}
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

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useI18nStore } from '../store/i18nStore'
import { getProductById, products } from '../data/products'
import ProductCard from '../components/ProductCard'
import type { Order } from '../types'

type Tab = 'orders' | 'wishlist' | 'profile'

export default function Account() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, wishlist, orders, toggleWishlist, updateProfile } = useUserStore()
  const { t, formatPrice, language } = useI18nStore()

  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
    setProfileName(user?.name || '')
    setProfileEmail(user?.email || '')
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(profileName, profileEmail)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const statusColors: Record<Order['status'], string> = {
    processing: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const wishlistProducts = wishlist.map((id) => getProductById(id)).filter(Boolean)

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'orders', label: t('account.orders'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { key: 'wishlist', label: t('account.wishlist'), icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { key: 'profile', label: t('account.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]

  return (
    <div className="container-luxe py-8 md:py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-stone-light p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-accent text-white text-3xl font-serif flex items-center justify-center mx-auto mb-3">
              {user.name[0]?.toUpperCase()}
            </div>
            <h2 className="text-lg font-serif">{t('account.welcome')} {user.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            <p className="text-xs text-gray-400 mt-2">
              {t('account.memberSince')}: {user.createdAt}
            </p>
          </div>

          {/* Navigation */}
          <nav className="mt-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                  activeTab === tab.key ? 'bg-primary text-white' : 'hover:bg-stone-light text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.key === 'wishlist' && wishlist.length > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-accent text-white'}`}>
                    {wishlist.length}
                  </span>
                )}
                {tab.key === 'orders' && orders.length > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-accent text-white'}`}>
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('auth.logout')}
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-serif font-light mb-6">{t('account.orders')}</h1>

              {orders.length === 0 ? (
                <div className="text-center py-20 bg-stone-light">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg text-gray-500 mb-1">{t('account.noOrders')}</p>
                  <p className="text-sm text-gray-400 mb-6">{t('account.noOrdersText')}</p>
                  <Link to="/shop" className="btn-primary">{t('nav.shop')}</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100">
                      {/* Order Header */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-stone-light transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-sm font-medium">{t('account.orderId')}: {order.id}</p>
                            <p className="text-xs text-gray-500">{t('account.orderDate')}: {order.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                            {t(`status.${order.status}` as any)}
                          </span>
                          <span className="text-sm font-medium text-accent">{formatPrice(order.total)}</span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Order Details */}
                      {expandedOrder === order.id && (
                        <div className="border-t border-gray-100 p-4 animate-fade-in">
                          <div className="space-y-3">
                            {order.items.map((item, idx) => {
                              const product = products?.find((p) => p.name === item.name)
                              return (
                                <div key={idx} className="flex gap-3 items-center">
                                  {product && (
                                    <img src={product.images[0]} alt="" className="w-14 h-16 object-cover" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {t('cart.color')}: {item.color} | {t('cart.size')}: {item.size} | ×{item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              )
                            })}
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                            <p><strong>{t('checkout.shipping')}:</strong> {order.shippingAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              <h1 className="text-2xl font-serif font-light mb-6">{t('account.wishlist')}</h1>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 bg-stone-light">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-lg text-gray-500 mb-1">{t('account.noWishlist')}</p>
                  <Link to="/shop" className="btn-primary mt-4">{t('nav.shop')}</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {wishlistProducts.map((product) => (
                    product && <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl font-serif font-light mb-6">{t('account.personalInfo')}</h1>
              <form onSubmit={handleSaveProfile} className="max-w-lg space-y-5">
                {profileSaved && (
                  <div className="bg-green-50 text-green-600 text-sm px-4 py-3 border border-green-100">
                    ✓ {t('account.changesSaved')}
                  </div>
                )}
                <div>
                  <label className="label">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t('account.memberSince')}</label>
                  <input
                    type="text"
                    value={user.createdAt}
                    disabled
                    className="input bg-gray-50 text-gray-400"
                  />
                </div>
                <button type="submit" className="btn-primary">{t('account.saveChanges')}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

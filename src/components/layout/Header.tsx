import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useUserStore } from '../../store/userStore'
import { useI18nStore } from '../../store/i18nStore'
import { currencies } from '../../data/products'
import type { Language } from '../../types'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { items, openCart } = useCartStore()
  const { isAuthenticated } = useUserStore()
  const { language, currencyCode, setLanguage, setCurrency, t } = useI18nStore()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/shop?category=women', label: t('nav.women') },
    { to: '/shop?category=men', label: t('nav.men') },
    { to: '/shop?category=accessories', label: t('nav.accessories') },
    { to: '/shop?category=footwear', label: t('nav.footwear') },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-white text-xs tracking-widest text-center py-2 px-4">
        {language === 'en'
          ? '✦ FREE WORLDWIDE SHIPPING ON ORDERS OVER $150 ✦'
          : '✦ 满 $150 全球免运费 ✦'}
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container-luxe">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.menu')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <span className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-primary">
                LUXE
              </span>
              <span className="hidden sm:inline text-xs tracking-[0.3em] text-accent uppercase mt-1">
                Fashion
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm tracking-wide text-gray-700 hover:text-accent transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:absolute lg:right-8">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-accent transition-colors" aria-label={t('nav.search')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Language & Currency */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 text-sm hover:text-accent transition-colors flex items-center gap-1"
                >
                  <span className="font-medium">{language.toUpperCase()}</span>
                  <span className="text-gray-400">|</span>
                  <span>{currencyCode}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl border border-gray-100 py-4 z-50">
                    <div className="px-4 mb-2">
                      <p className="label">{t('common.language')}</p>
                      <div className="flex gap-2">
                        {(['en', 'zh'] as Language[]).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => { setLanguage(lang); }}
                            className={`px-3 py-1 text-xs border transition-colors ${
                              language === lang ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {lang === 'en' ? 'English' : '中文'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="px-4">
                      <p className="label">{t('common.currency')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {currencies.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => { setCurrency(c.code); setLangMenuOpen(false); }}
                            className={`px-2 py-1 text-xs border transition-colors ${
                              currencyCode === c.code ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {c.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account */}
              <Link to={isAuthenticated ? '/account' : '/login'} className="p-2 hover:text-accent transition-colors" aria-label={t('nav.account')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Cart */}
              <button onClick={openCart} className="p-2 hover:text-accent transition-colors relative" aria-label={t('nav.cart')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-4 animate-fade-in">
            <div className="container-luxe">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search')}
                  className="flex-1 px-4 py-3 text-sm border border-gray-300 focus:border-primary focus:outline-none"
                />
                <button type="submit" className="btn-primary">{t('nav.search')}</button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in">
            <nav className="container-luxe py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="py-3 text-sm border-b border-gray-100 text-gray-700 hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-4 pt-4">
                <div className="flex-1">
                  <p className="label">{t('common.language')}</p>
                  <div className="flex gap-2">
                    {(['en', 'zh'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 text-xs border ${language === lang ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}
                      >
                        {lang === 'en' ? 'English' : '中文'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="label">{t('common.currency')}</p>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs border border-gray-300 px-2 py-1"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

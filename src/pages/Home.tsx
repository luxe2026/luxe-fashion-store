import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18nStore } from '../store/i18nStore'
import { heroBanners, categories, products, getNewArrivals, getBestSellers } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { t, language } = useI18nStore()
  const [currentSlide, setCurrentSlide] = useState(0)
  const newArrivals = getNewArrivals()
  const bestSellers = getBestSellers()
  const featured = products.slice(0, 8)

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const hero = heroBanners[currentSlide]

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        {heroBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={banner.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/80 animate-fade-in">
              {language === 'en' ? hero.subtitleEn : hero.subtitleZh}
            </p>
            <h1 className="text-hero font-serif font-light mb-8 animate-slide-up">
              {language === 'en' ? hero.titleEn : hero.titleZh}
            </h1>
            <Link
              to={hero.link}
              className="inline-flex items-center px-8 py-4 bg-white text-primary text-sm tracking-widest uppercase font-medium hover:bg-accent hover:text-white transition-colors duration-300"
            >
              {language === 'en' ? hero.ctaEn : hero.ctaZh}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all duration-300 rounded-full ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`${t('hero.slide')} ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-gray-100">
        <div className="container-luxe py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {[
              { icon: 'M3 7h18M3 12h18M3 17h18', title: t('home.freeShipping'), text: t('home.freeShippingText') },
              { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: t('home.easyReturns'), text: t('home.easyReturnsText') },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: t('home.securePayment'), text: t('home.securePaymentText') },
              { icon: 'M5 13l4 4L19 7', title: t('home.qualityGuarantee'), text: t('home.qualityGuaranteeText') },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-medium">{feature.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <h2 className="section-title">{t('home.shopByCategory')}</h2>
          <p className="section-subtitle">{t('home.shopByCategorySub')}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                to={`/shop?category=${cat.key}`}
                className="group relative overflow-hidden aspect-[3/4] block"
              >
                <img
                  src={cat.image}
                  alt={language === 'en' ? cat.labelEn : cat.labelZh}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-center text-white">
                  <h3 className="text-lg md:text-xl font-serif mb-1">
                    {language === 'en' ? cat.labelEn : cat.labelZh}
                  </h3>
                  <span className="text-[10px] md:text-xs tracking-widest uppercase border-b border-white/50 pb-0.5 group-hover:border-accent transition-colors">
                    {t('home.shopAll')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.newArrivals')}</h2>
            <p className="section-subtitle">{t('home.newArrivalsSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop?filter=new" className="btn-outline">{t('common.viewAll')}</Link>
          </div>
        </div>
      </section>

      {/* Brand Story / Editorial */}
      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative">
              <img
             https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/d7a34a50a32e41d0bc5d1b26ab9818bb~tplv-o3syd03w52-origin-jpeg.jpeg?dr=15568&from=520841845&idc=my&ps=933b5bde&shcp=2c1af732&shp=1f0b6a75&t=555f072d
                alt="Brand Story"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-accent text-white p-6 md:p-8 hidden md:block">
                <p className="text-4xl font-serif font-light">100%</p>
                <p className="text-xs tracking-widest uppercase mt-1">{language === 'en' ? 'Curated with Care' : '用心精选'}</p>
              </div>
          
            </div
              <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">{t('home.brandStory')}</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">{t('home.brandStoryTitle')}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{t('home.brandStoryText')}</p>
             <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center border-r border-gray-200 last:border-0">
                  <p className="text-lg font-serif text-accent">{language === 'en' ? 'Curated' : '精选'}</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'en' ? 'Handpicked pieces' : '用心挑选'}</p>
                </div>
                <div className="text-center border-r border-gray-200 last:border-0">
                  <p className="text-lg font-serif text-accent">{language === 'en' ? 'Global' : '全球'}</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'en' ? 'Shipped worldwide' : '全球配送'}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-serif text-accent">{language === 'en' ? 'Trusted' : '信赖'}</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'en' ? 'Secure checkout' : '安全支付'}</p>
                </div>
              </div>
              <Link to="/about" className="btn-primary">{t('home.brandStoryCta')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 md:py-24 bg-stone-light">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.bestSellers')}</h2>
            <p className="section-subtitle">{t('home.bestSellersSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-outline">{t('common.viewAll')}</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <h2 className="section-title">{language === 'en' ? 'Featured Collection' : '精选系列'}</h2>
            <p className="section-subtitle">{language === 'en' ? 'Handpicked just for you' : '为您精心挑选'}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative h-[50vh] overflow-hidden">
        <img
          https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/2b6abd11b43f4dcfadf8b9683436356e~tplv-o3syd03w52-origin-jpeg.jpeg?dr=15568&from=520841845&idc=my&ps=933b5bde&shcp=2c1af732&shp=1f0b6a75&t=555f072d
          alt="Editorial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center text-white px-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-serif font-light mb-4">
              {language === 'en' ? 'Style That Speaks' : '风格 自有声' }
            </h2>
            <p className="text-sm md:text-base text-white/80 mb-8">
              {language === 'en'
                ? 'Discover pieces that tell your story. Every garment is a conversation.'
                : '发现讲述你故事的单品。每一件服饰都是一场对话。'}
            </p>
            <Link to="/shop" className="inline-flex items-center px-8 py-4 border border-white text-white text-sm tracking-widest uppercase hover:bg-white hover:text-primary transition-colors duration-300">
              {t('home.shopAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container-luxe text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">{t('home.newsletter')}</h2>
          <p className="text-sm text-white/60 mb-8">{t('home.newsletterText')}</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}

function NewsletterForm() {
  const { t } = useI18nStore()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('home.newsletterPlaceholder')}
        className="flex-1 px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
      />
      <button type="submit" className="btn-accent">
        {submitted ? t('home.newsletterSuccess') : t('home.newsletterSubscribe')}
      </button>
    </form>
  )
}

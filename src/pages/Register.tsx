import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useI18nStore } from '../store/i18nStore'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useUserStore()
  const { t } = useI18nStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    const result = register(name, email, password)
    if (result.success) {
      navigate('/account')
    } else {
      setError(result.message || '')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif font-bold text-primary">LUXE</Link>
          <h1 className="text-2xl font-serif font-light mt-6 mb-2">{t('auth.joinUs')}</h1>
          <p className="text-sm text-gray-500">{t('auth.joinText')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="label">{t('auth.name')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="label">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {t('auth.registerButton')}
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-6 space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Faster checkout experience</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Order history & tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Save favorites to wishlist</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Exclusive member offers</span>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            {t('auth.signInHere')}
          </Link>
        </div>
      </div>
    </div>
  )
}

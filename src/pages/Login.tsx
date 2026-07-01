import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useI18nStore } from '../store/i18nStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useUserStore()
  const { t, language } = useI18nStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = login(email, password)
    if (result.success) {
      navigate('/account')
    } else {
      setError(result.message || t('auth.invalidCredentials'))
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif font-bold text-primary">LUXE</Link>
          <h1 className="text-2xl font-serif font-light mt-6 mb-2">{t('auth.welcomeBack')}</h1>
          <p className="text-sm text-gray-500">{t('auth.welcomeText')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

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
            <div className="flex justify-between items-center mb-2">
              <label className="label mb-0">{t('auth.password')}</label>
              <button type="button" className="text-xs text-gray-500 hover:text-accent">
                {t('auth.forgotPassword')}
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {t('auth.loginButton')}
          </button>
        </form>

        {/* Demo Account Hint */}
        <div className="mt-6 p-4 bg-stone-light text-xs text-gray-600 text-center">
          <p className="font-medium mb-1">
            {language === 'en' ? 'Demo Account:' : '演示账号:'}
          </p>
          <p>demo@luxe.com / demo123</p>
          <p className="mt-1 text-gray-400">
            {language === 'en' ? 'Or enter any email/password to try.' : '或输入任意邮箱/密码体验。'}
          </p>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            {t('auth.signUpHere')}
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link to="/shop" className="text-xs text-gray-400 hover:text-accent">
            {t('auth.guestCheckout')} →
          </Link>
        </div>
      </div>
    </div>
  )
}

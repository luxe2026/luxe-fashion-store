import { Link } from 'react-router-dom'
import { useI18nStore } from '../store/i18nStore'

export default function NotFound() {
  const { t, language } = useI18nStore()
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-serif font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-2">
        {language === 'en' ? 'Page Not Found' : '页面未找到'}
      </p>
      <p className="text-sm text-gray-400 mb-8">
        {language === 'en'
          ? 'The page you are looking for does not exist or has been moved.'
          : '您访问的页面不存在或已被移动。'}
      </p>
      <Link to="/" className="btn-primary">{t('nav.home')}</Link>
    </div>
  )
}

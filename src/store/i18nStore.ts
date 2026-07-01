import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '../types'
import { currencies } from '../data/products'
import { translate, type TranslationKey } from '../i18n/translations'

interface I18nState {
  language: Language
  currencyCode: string
  setLanguage: (lang: Language) => void
  setCurrency: (code: string) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  formatPrice: (usdPrice: number) => string
  getCurrencyRate: () => number
  convertPrice: (usdPrice: number) => number
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'en',
      currencyCode: 'USD',

      setLanguage: (lang) => set({ language: lang }),
      setCurrency: (code) => set({ currencyCode: code }),

      t: (key, params) => translate(get().language, key, params),

      getCurrencyRate: () => {
        const currency = currencies.find((c) => c.code === get().currencyCode)
        return currency ? currency.rate : 1
      },

      convertPrice: (usdPrice) => {
        return usdPrice * get().getCurrencyRate()
      },

      formatPrice: (usdPrice) => {
        const currency = currencies.find((c) => c.code === get().currencyCode)
        if (!currency) return `$${usdPrice.toFixed(2)}`
        const converted = usdPrice * currency.rate
        // JPY doesn't use decimals
        if (currency.code === 'JPY') {
          return `${currency.symbol}${Math.round(converted).toLocaleString()}`
        }
        return `${currency.symbol}${converted.toFixed(2)}`
      },
    }),
    {
      name: 'luxe-i18n',
    }
  )
)

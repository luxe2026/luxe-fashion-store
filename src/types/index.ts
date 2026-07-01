export interface Product {
  id: number
  slug: string
  name: string
  category: ProductCategory
  price: number // base price in USD
  description: string
  details: string[]
  images: string[]
  colors: { name: string; hex: string }[]
  sizes: string[]
  rating: number
  reviewCount: number
  isNew?: boolean
  isBestSeller?: boolean
  stock: number
}

export type ProductCategory = 'women' | 'men' | 'accessories' | 'footwear'

export interface CartItem {
  productId: number
  quantity: number
  size: string
  color: string
}

export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface Order {
  id: string
  date: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  items: { name: string; quantity: number; size: string; color: string; price: number }[]
  shippingAddress: string
}

export interface Currency {
  code: string
  symbol: string
  rate: number // exchange rate from USD
  label: string
}

export type Language = 'en' | 'zh'

export interface CategoryInfo {
  key: ProductCategory
  labelEn: string
  labelZh: string
  image: string
}

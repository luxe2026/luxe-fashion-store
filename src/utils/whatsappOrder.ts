import type { CartItem, Order } from '../types'
import { getProductById } from '../data/products'

// Seller's WhatsApp number (country code + number, no + or spaces)
export const WHATSAPP_NUMBER = '8618320272130'

// Seller's PayPal.Me link for receiving payments (no trailing slash)
export const PAYPAL_ME_LINK = 'https://paypal.me/luxe26official'

export interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  notes?: string
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingMethod: 'standard' | 'express'
}

export function buildWhatsAppOrderLink(
  items: CartItem[],
  form: CheckoutForm,
  totals: OrderTotals,
  orderId: string,
  language: 'en' | 'zh' = 'en'
): string {
  const lines: string[] = []

  if (language === 'zh') {
    lines.push(`*新订单 ${orderId}*`)
    lines.push('')
    lines.push('*商品清单*')
    items.forEach((item, idx) => {
      const product = getProductById(item.productId)
      if (!product) return
      lines.push(`${idx + 1}. ${product.name}`)
      lines.push(`   颜色: ${item.color} | 尺码: ${item.size} | 数量: ${item.quantity}`)
      lines.push(`   单价: $${product.price.toFixed(2)} | 小计: $${(product.price * item.quantity).toFixed(2)}`)
    })
    lines.push('')
    lines.push('*订单金额*')
    lines.push(`商品小计: $${totals.subtotal.toFixed(2)}`)
    lines.push(`运费 (${totals.shippingMethod === 'express' ? '加急' : '标准'}): ${totals.shipping === 0 ? '免运费' : '$' + totals.shipping.toFixed(2)}`)
    lines.push(`税费: $${totals.tax.toFixed(2)}`)
    lines.push(`*订单总额: $${totals.total.toFixed(2)}*`)
    lines.push('')
    lines.push('*收货信息*')
    lines.push(`姓名: ${form.firstName} ${form.lastName}`)
    lines.push(`地址: ${form.address}`)
    lines.push(`城市: ${form.city}, ${form.state} ${form.zip}`)
    lines.push(`国家: ${form.country}`)
    lines.push(`电话: ${form.phone}`)
    lines.push(`邮箱: ${form.email}`)
    if (form.notes) {
      lines.push(`备注: ${form.notes}`)
    }
    lines.push('')
    lines.push('*付款方式*')
    lines.push(`请通过 PayPal 付款: ${PAYPAL_ME_LINK}/${totals.total.toFixed(2)}`)
    lines.push('付款完成后请截图发送给我,我将立即为您发货。')
  } else {
    lines.push(`*New Order ${orderId}*`)
    lines.push('')
    lines.push('*Order Items*')
    items.forEach((item, idx) => {
      const product = getProductById(item.productId)
      if (!product) return
      lines.push(`${idx + 1}. ${product.name}`)
      lines.push(`   Color: ${item.color} | Size: ${item.size} | Qty: ${item.quantity}`)
      lines.push(`   Price: $${product.price.toFixed(2)} | Subtotal: $${(product.price * item.quantity).toFixed(2)}`)
    })
    lines.push('')
    lines.push('*Order Summary*')
    lines.push(`Subtotal: $${totals.subtotal.toFixed(2)}`)
    lines.push(`Shipping (${totals.shippingMethod === 'express' ? 'Express' : 'Standard'}): ${totals.shipping === 0 ? 'Free' : '$' + totals.shipping.toFixed(2)}`)
    lines.push(`Tax: $${totals.tax.toFixed(2)}`)
    lines.push(`*Total: $${totals.total.toFixed(2)}*`)
    lines.push('')
    lines.push('*Shipping Address*')
    lines.push(`Name: ${form.firstName} ${form.lastName}`)
    lines.push(`Address: ${form.address}`)
    lines.push(`City: ${form.city}, ${form.state} ${form.zip}`)
    lines.push(`Country: ${form.country}`)
    lines.push(`Phone: ${form.phone}`)
    lines.push(`Email: ${form.email}`)
    if (form.notes) {
      lines.push(`Notes: ${form.notes}`)
    }
    lines.push('')
    lines.push('*Payment*')
    lines.push(`Please pay via PayPal: ${PAYPAL_ME_LINK}/${totals.total.toFixed(2)}`)
    lines.push('After payment, please send me a screenshot and I will ship your order immediately.')
  }

  const message = lines.join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function generateOrderId(): string {
  return `LX-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`
}

export function buildOrderRecord(
  orderId: string,
  items: CartItem[],
  form: CheckoutForm,
  totals: OrderTotals
): Order {
  return {
    id: orderId,
    date: new Date().toISOString().split('T')[0],
    status: 'processing',
    total: totals.total,
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
}

export function buildProductInquiryLink(
  productName: string,
  productPrice: number,
  slug: string
): string {
  const message = `Hello! I am interested in this product: ${productName} ($${productPrice.toFixed(2)}). Is it available?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

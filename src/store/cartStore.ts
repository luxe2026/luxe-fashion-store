import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'
import { getProductById } from '../data/products'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (productId: number, size: string, color: string, quantity?: number) => void
  removeItem: (productId: number, size: string, color: string) => void
  updateQuantity: (productId: number, size: string, color: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (productId, size, color, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === productId && item.size === size && item.color === color
          )
          if (existing) {
            return {
              items: state.items.map((item) =>
                item === existing ? { ...item, quantity: item.quantity + quantity } : item
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, { productId, size, color, quantity }],
            isOpen: true,
          }
        })
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size && item.color === color)
          ),
        }))
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const product = getProductById(item.productId)
          return total + (product ? product.price * item.quantity : 0)
        }, 0)
      },
    }),
    {
      name: 'luxe-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

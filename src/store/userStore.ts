import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Order } from '../types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  wishlist: number[] // product IDs
  orders: Order[]
  login: (email: string, password: string) => { success: boolean; message?: string }
  register: (name: string, email: string, password: string) => { success: boolean; message?: string }
  logout: () => void
  toggleWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  addOrder: (order: Order) => void
  updateProfile: (name: string, email: string) => void
}

// Simulated user database (in production this would be a real backend)
const mockUsers: { email: string; password: string; name: string }[] = [
  { email: 'demo@luxe.com', password: 'demo123', name: 'Demo User' },
]

// Generate mock orders for demo user
const mockOrders: Order[] = [
  {
    id: 'LX-2025-00123',
    date: '2025-06-15',
    status: 'delivered',
    total: 348,
    currency: 'USD',
    items: [
      { name: 'Silk Wrap Dress', quantity: 1, size: 'S', color: 'Black', price: 189 },
      { name: 'Pleated Midi Skirt', quantity: 1, size: 'M', color: 'Emerald', price: 129 },
    ],
    shippingAddress: '123 Fashion Ave, New York, NY 10001, USA',
  },
  {
    id: 'LX-2025-00156',
    date: '2025-06-28',
    status: 'shipped',
    total: 169,
    currency: 'USD',
    items: [
      { name: 'Premium White Sneakers', quantity: 1, size: '42', color: 'White', price: 169 },
    ],
    shippingAddress: '123 Fashion Ave, New York, NY 10001, USA',
  },
]

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      wishlist: [],
      orders: [],

      login: (email, password) => {
        const found = mockUsers.find((u) => u.email === email && u.password === password)
        if (found) {
          const newUser: User = {
            id: 1,
            name: found.name,
            email: found.email,
            createdAt: '2025-01-01',
          }
          set({
            user: newUser,
            isAuthenticated: true,
            orders: found.email === 'demo@luxe.com' ? mockOrders : [],
          })
          return { success: true }
        }
        // For demo: accept any login
        const newUser: User = {
          id: Date.now(),
          name: email.split('@')[0],
          email,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set({ user: newUser, isAuthenticated: true, orders: [] })
        return { success: true }
      },

      register: (name, email, password) => {
        if (password.length < 6) {
          return { success: false, message: 'Password must be at least 6 characters' }
        }
        const newUser: User = {
          id: Date.now(),
          name,
          email,
          createdAt: new Date().toISOString().split('T')[0],
        }
        mockUsers.push({ email, password, name })
        set({ user: newUser, isAuthenticated: true, orders: [] })
        return { success: true }
      },

      logout: () => set({ user: null, isAuthenticated: false }),
      toggleWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        }))
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateProfile: (name, email) =>
        set((state) => ({
          user: state.user ? { ...state.user, name, email } : null,
        })),
    }),
    {
      name: 'luxe-user',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        wishlist: state.wishlist,
        orders: state.orders,
      }),
    }
  )
)

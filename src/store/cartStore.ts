'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalCartItem, Product } from '@/types'

interface CartStore {
  items: LocalCartItem[]
  addItem: (product: Product, size: number, quantity?: number) => void
  removeItem: (product_id: string, size: number) => void
  updateQuantity: (product_id: string, size: number, quantity: number) => void
  setItems: (items: LocalCartItem[]) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product_id === product.id && item.size === size
          )
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { product_id: product.id, quantity, size, product },
            ],
          }
        })
      },

      removeItem: (product_id, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === product_id && item.size === size)
          ),
        }))
      },

      updateQuantity: (product_id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(product_id, size)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === product_id && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      setItems: (newItems) => set({ items: newItems }),

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
    }),
    {
      name: 'shoe-mart-cart',
    }
  )
)

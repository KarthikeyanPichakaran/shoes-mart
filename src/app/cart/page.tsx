'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-32 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-400 text-sm mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">
        Shopping Cart
        <span className="ml-3 text-base font-normal text-gray-400">
          ({items.length} {items.length === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem
              key={`${item.product_id}-${item.size}`}
              item={item}
            />
          ))}
        </div>

        {/* Summary */}
        <div>
          <CartSummary
            subtotal={getSubtotal()}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface CartSummaryProps {
  subtotal: number
  isAuthenticated: boolean
}

export default function CartSummary({ subtotal, isAuthenticated }: CartSummaryProps) {
  const shippingAmount = calculateShipping(subtotal)
  const total = subtotal + shippingAmount
  const router = useRouter()

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout')
    } else {
      router.push('/auth/login?redirect=/checkout')
    }
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span className="font-medium text-gray-900">
            {shippingAmount === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(SHIPPING_FEE)
            )}
          </span>
        </div>

        {shippingAmount > 0 && (
          <p className="text-xs text-gray-400 bg-white rounded-lg p-2 border border-gray-100">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </p>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900 text-base">{formatPrice(total)}</span>
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleCheckout}
        className="mt-6"
      >
        {isAuthenticated ? 'Proceed to Checkout' : 'Log in to Checkout'}
      </Button>

      <Link
        href="/products"
        className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors mt-4"
      >
        Continue shopping
      </Link>
    </div>
  )
}

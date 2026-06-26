'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import type { LocalCartItem } from '@/types'

interface CartItemProps {
  item: LocalCartItem
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()
  const { product, size, quantity } = item

  const categorySlug = product.categories?.slug ?? 'products'
  const href = `/products/${categorySlug}/${product.slug}`

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link href={href} className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-200 text-2xl">
            👟
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={href} className="font-semibold text-sm text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
          {product.name}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">UK Size {size}</p>
        <p className="text-sm font-bold text-gray-900 mt-1">
          {formatPrice(product.price * quantity)}
        </p>

        {/* Quantity + remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => updateQuantity(product.id, size, quantity - 1)}
              className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, size, quantity + 1)}
              className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => removeItem(product.id, size)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

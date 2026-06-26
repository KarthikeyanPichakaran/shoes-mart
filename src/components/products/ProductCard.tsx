import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const categorySlug = product.categories?.slug ?? 'products'
  const href = `/products/${categorySlug}/${product.slug}`

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div>
        {product.categories && (
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-0.5">
            {product.categories.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-base font-bold text-gray-900">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}

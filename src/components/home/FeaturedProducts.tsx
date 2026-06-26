import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/types'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2">
            Hand-picked
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Featured Styles
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-semibold text-red-600"
        >
          View all shoes &rarr;
        </Link>
      </div>
    </section>
  )
}

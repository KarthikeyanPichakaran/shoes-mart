import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  emptyMessage = 'No products found.',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-5xl mb-4">👟</p>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

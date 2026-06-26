'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SizeSelector from './SizeSelector'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
  inStock: boolean
}

export default function AddToCartButton({ product, inStock }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()

  const handleAdd = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!inStock) {
    return (
      <div className="space-y-4">
        <SizeSelector
          availableSizes={[]}
          selectedSize={null}
          onSelect={() => {}}
        />
        <Button fullWidth size="lg" disabled>
          Out of Stock
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SizeSelector
        availableSizes={product.available_sizes}
        selectedSize={selectedSize}
        onSelect={setSelectedSize}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          fullWidth
          size="lg"
          onClick={handleAdd}
          disabled={!selectedSize}
          className={added ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {added
            ? '✓ Added to Cart'
            : selectedSize
            ? 'Add to Cart'
            : 'Select a Size'}
        </Button>

        {added && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/cart')}
          >
            View Cart
          </Button>
        )}
      </div>
    </div>
  )
}

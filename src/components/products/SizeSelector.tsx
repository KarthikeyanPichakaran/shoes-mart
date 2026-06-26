'use client'

import { cn } from '@/lib/utils'

const UK_SIZES = [6, 7, 8, 9, 10, 11]

interface SizeSelectorProps {
  availableSizes?: number[]
  selectedSize: number | null
  onSelect: (size: number) => void
}

export default function SizeSelector({
  availableSizes = UK_SIZES,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">Size (UK)</p>
        <a
          href="#"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          Size guide
        </a>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {UK_SIZES.map((size) => {
          const isAvailable = availableSizes.includes(size)
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelect(size)}
              className={cn(
                'h-10 rounded-lg text-sm font-medium border transition-all',
                isSelected
                  ? 'bg-red-600 border-red-600 text-white shadow-sm'
                  : isAvailable
                  ? 'border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-600 bg-white'
                  : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}

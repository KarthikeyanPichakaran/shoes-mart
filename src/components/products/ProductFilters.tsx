'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
]

const CATEGORY_OPTIONS = [
  { label: 'All Shoes', value: '' },
  { label: 'Sneakers', value: 'sneakers' },
  { label: 'Running Shoes', value: 'running-shoes' },
  { label: 'Boots', value: 'boots' },
]

interface ProductFiltersProps {
  totalCount: number
  showCategoryFilter?: boolean
  activeCategory?: string
}

export default function ProductFilters({
  totalCount,
  showCategoryFilter = true,
  activeCategory = '',
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') ?? 'newest'

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleCategoryChange = (value: string) => {
    if (value === '') {
      router.push('/products')
    } else {
      router.push(`/products/${value}`)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <p className="text-sm text-gray-500 font-medium">
        {totalCount} {totalCount === 1 ? 'product' : 'products'}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {showCategoryFilter && (
          <select
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-full px-4 py-2 bg-white text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={currentSort}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="text-sm border border-gray-200 rounded-full px-4 py-2 bg-white text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

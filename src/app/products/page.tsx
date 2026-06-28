import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Shoes',
  description: 'Browse our complete collection of sneakers, running shoes, and boots.',
}

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const sortMap: Record<
  SortKey,
  { column: string; ascending: boolean }
> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  name_asc: { column: 'name', ascending: true },
}

interface PageProps {
  searchParams: { sort?: string }
}

export default async function AllProductsPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const sortKey = (searchParams.sort as SortKey) ?? 'newest'
  const { column, ascending } = sortMap[sortKey] ?? sortMap.newest

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .order(column, { ascending })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">All Shoes</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Sneakers, running shoes, and boots in one place.
        </p>
      </div>

      <Suspense fallback={null}>
        <ProductFilters
          totalCount={products?.length ?? 0}
          showCategoryFilter
          activeCategory=""
        />
      </Suspense>

      <ProductGrid products={products ?? []} />
    </div>
  )
}

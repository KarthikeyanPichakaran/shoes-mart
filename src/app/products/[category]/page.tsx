import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import type { Metadata } from 'next'

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const sortMap: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  name_asc: { column: 'name', ascending: true },
}

interface PageProps {
  params: { category: string }
  searchParams: { sort?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', params.category)
    .single()

  if (!category) return { title: 'Category Not Found' }

  return {
    title: category.name,
    description: category.description ?? `Shop all ${category.name} at Kickd.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = createClient()
  const sortKey = (searchParams.sort as SortKey) ?? 'newest'
  const { column, ascending } = sortMap[sortKey] ?? sortMap.newest

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('category_id', category.id)
    .order(column, { ascending })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2">
          Category
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 mt-2 text-sm max-w-lg">
            {category.description}
          </p>
        )}
      </div>

      <Suspense fallback={null}>
        <ProductFilters
          totalCount={products?.length ?? 0}
          showCategoryFilter
          activeCategory={params.category}
        />
      </Suspense>

      <ProductGrid
        products={products ?? []}
        emptyMessage={`No ${category.name.toLowerCase()} available right now.`}
      />
    </div>
  )
}

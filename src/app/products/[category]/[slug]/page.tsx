import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import AddToCartButton from '@/components/products/AddToCartButton'
import Badge from '@/components/ui/Badge'
import type { Metadata } from 'next'

interface PageProps {
  params: { category: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.name,
    description: product.description ?? `Buy ${product.name} at Kickd.`,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const inStock = product.stock_quantity > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-600">Shoes</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link
              href={`/products/${product.categories.slug}`}
              className="hover:text-gray-600"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-200">
              <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.categories && (
            <Link
              href={`/products/${product.categories.slug}`}
              className="text-xs font-semibold text-red-600 uppercase tracking-widest hover:underline mb-2 inline-block"
            >
              {product.categories.name}
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {inStock ? (
              <Badge variant="success">In Stock</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* Add to cart — client component */}
          <AddToCartButton product={product} inStock={inStock} />

          {/* Delivery info */}
          <div className="mt-8 space-y-3 border-t border-gray-100 pt-8">
            <div className="flex items-start gap-3">
              <span className="text-lg">🚚</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Flat ₹99 shipping</p>
                <p className="text-xs text-gray-400">Free on orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure payments</p>
                <p className="text-xs text-gray-400">Powered by Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

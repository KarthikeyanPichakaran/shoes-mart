import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Metadata } from 'next'
import type { Order } from '@/types'

export const metadata: Metadata = { title: 'Order Details' }

const statusVariant: Record<
  Order['status'],
  'default' | 'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  paid: 'success',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
}

const STATUS_STEPS: Order['status'][] = [
  'paid', 'processing', 'shipped', 'delivered',
]

interface PageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url, slug, categories(slug)))')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const currentStatusIndex = STATUS_STEPS.indexOf(order.status as Order['status'])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/orders"
        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        &larr; Back to orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Order #{order.id.split('-')[0].toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={statusVariant[order.status as Order['status']] ?? 'default'}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStatusIndex >= idx
              return (
                <div key={step} className="relative flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-gray-200 bg-white text-gray-300'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs text-gray-500 text-center capitalize leading-tight">
                    {step}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Items</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                {item.products?.image_url ? (
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-200">
                    👟
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {item.products?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  UK Size {item.size} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formatPrice(item.price_at_purchase * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>
                {order.shipping_amount === 0 ? 'Free' : formatPrice(order.shipping_amount)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {order.shipping_address && (
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
            <address className="text-sm text-gray-600 not-italic leading-relaxed">
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 && (
                <><br />{order.shipping_address.line2}</>
              )}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.pincode}
              <br />
              {order.shipping_address.phone}
            </address>
          </div>
        )}
      </div>
    </div>
  )
}

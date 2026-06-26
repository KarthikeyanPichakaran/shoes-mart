import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
}

interface PageProps {
  searchParams: { order_id?: string }
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { order_id } = searchParams
  if (!order_id) redirect('/')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('id', order_id)
    .eq('user_id', user.id)
    .single()

  if (!order) redirect('/')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-400 text-sm mb-8">
        Your payment was successful. We&apos;ll process your order shortly.
      </p>

      <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
            <p className="text-sm font-mono font-semibold text-gray-700">
              {order.id.split('-')[0].toUpperCase()}
            </p>
          </div>
          <Badge variant="success">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.products?.name}</p>
                <p className="text-xs text-gray-400">
                  UK {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatPrice(item.price_at_purchase * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>
              {order.shipping_amount === 0
                ? 'Free'
                : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1">
            <span>Total Paid</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        {order.shipping_address && (
          <div className="border-t border-gray-200 mt-4 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Delivery to
            </p>
            <p className="text-sm text-gray-700">
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.pincode}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/orders"
          className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center border border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-600 font-semibold px-8 py-3 rounded-full text-sm transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

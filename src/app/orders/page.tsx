import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Metadata } from 'next'
import type { Order } from '@/types'

export const metadata: Metadata = {
  title: 'My Orders',
}

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

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

      {!orders?.length ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400 text-sm mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-700 mb-2">
                    #{order.id.split('-')[0].toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(order.order_items as { id: string }[])?.length ?? 0} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900 mb-2">
                    {formatPrice(order.total_amount)}
                  </p>
                  <Badge variant={statusVariant[order.status as Order['status']] ?? 'default'}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

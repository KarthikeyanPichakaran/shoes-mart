import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ items: [] })

    const admin = getAdminClient()
    const { data } = await admin
      .from('cart_items')
      .select('quantity, size, products(*, categories(*))')
      .eq('user_id', user.id)

    const items = (data ?? [])
      .map((row: any) => ({
        product_id: row.products?.id,
        quantity: row.quantity,
        size: row.size,
        product: row.products,
      }))
      .filter((item: any) => item.product_id)

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await request.json()

    const admin = getAdminClient()
    await admin.from('cart_items').delete().eq('user_id', user.id)

    if (Array.isArray(items) && items.length > 0) {
      await admin.from('cart_items').insert(
        items.map((item: any) => ({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
        }))
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}

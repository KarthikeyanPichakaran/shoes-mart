import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function makeClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
}

export async function GET() {
  try {
    const supabase = makeClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ items: [] })

    const { data } = await supabase
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
    const supabase = makeClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await request.json()

    await supabase.from('cart_items').delete().eq('user_id', user.id)

    if (Array.isArray(items) && items.length > 0) {
      await supabase.from('cart_items').insert(
        items.map((item: any) => ({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
        }))
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

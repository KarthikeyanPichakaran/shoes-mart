import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getRazorpay } from '@/lib/razorpay'
import { calculateShipping } from '@/lib/utils'

interface CartItemInput {
  product_id: string
  quantity: number
  size: number
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cart_items }: { cart_items: CartItemInput[] } = await request.json()
    if (!cart_items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Fetch current prices from DB (never trust client-side prices)
    const productIds = cart_items.map((i) => i.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock_quantity, is_active')
      .in('id', productIds)

    if (productsError || !products?.length) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const priceMap = Object.fromEntries(products.map((p) => [p.id, p]))

    let subtotal = 0
    for (const item of cart_items) {
      const product = priceMap[item.product_id]
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: `Product ${item.product_id} is unavailable` },
          { status: 400 }
        )
      }
      subtotal += product.price * item.quantity
    }

    const shippingAmount = calculateShipping(subtotal)
    const totalAmount = subtotal + shippingAmount

    // Create Razorpay order (amount in paise)
    const order = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    return NextResponse.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      subtotal,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
    })
  } catch (err) {
    console.error('create-order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { calculateShipping } from '@/lib/utils'
import { sendOrderConfirmation } from '@/lib/email'
import type { ShippingAddress } from '@/types'

interface CartItemInput {
  product_id: string
  quantity: number
  size: number
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()

    // Auth check via cookie session
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart_items,
      shipping_address,
    }: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      cart_items: CartItemInput[]
      shipping_address: ShippingAddress
    } = await request.json()

    // Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Admin client to bypass RLS for order creation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Re-fetch prices server-side
    const productIds = cart_items.map((i) => i.product_id)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, price, name')
      .in('id', productIds)

    if (!products?.length) {
      return NextResponse.json({ error: 'Products not found' }, { status: 400 })
    }

    const priceMap = Object.fromEntries(products.map((p) => [p.id, p.price]))
    const nameMap = Object.fromEntries(products.map((p) => [p.id, p.name]))

    let subtotal = 0
    for (const item of cart_items) {
      subtotal += (priceMap[item.product_id] ?? 0) * item.quantity
    }
    const shippingAmount = calculateShipping(subtotal)
    const totalAmount = subtotal + shippingAmount

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'paid',
        subtotal,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        shipping_address,
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items
    const orderItems = cart_items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      size: item.size,
      price_at_purchase: priceMap[item.product_id] ?? 0,
    }))

    await supabaseAdmin.from('order_items').insert(orderItems)

    // Clear DB cart for this user (best-effort)
    await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id)

    // Send order confirmation email (best-effort — never block the response)
    sendOrderConfirmation({
      to: user.email!,
      orderId: order.id,
      orderItems,
      productNames: nameMap,
      shippingAddress: shipping_address,
      subtotal,
      shippingAmount,
      totalAmount,
    }).catch((err) => console.error('Email send failed:', err))

    return NextResponse.json({ order_id: order.id })
  } catch (err) {
    console.error('verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

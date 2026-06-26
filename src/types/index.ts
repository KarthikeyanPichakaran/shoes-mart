export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock_quantity: number
  available_sizes: number[]
  image_url: string
  images: string[]
  is_active: boolean
  created_at: string
  categories?: Category
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  phone: string
  is_default: boolean
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  size: number
  created_at: string
  products?: Product
}

export interface LocalCartItem {
  product_id: string
  quantity: number
  size: number
  product: Product
}

export interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_amount: number
  total_amount: number
  shipping_address: ShippingAddress
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  size: number
  price_at_purchase: number
  products?: Product
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

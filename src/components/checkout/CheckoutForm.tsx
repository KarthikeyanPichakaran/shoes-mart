'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { MapPin, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, calculateShipping, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ShippingAddress, RazorpayOptions } from '@/types'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface SavedAddress {
  id: string
  full_name: string
  line1: string
  line2?: string | null
  city: string
  state: string
  pincode: string
  phone: string
  is_default: boolean
}

interface CheckoutFormProps {
  userEmail: string
  userName: string
  savedAddresses: SavedAddress[]
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

const blank: ShippingAddress = { full_name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '' }

export default function CheckoutForm({ userEmail, userName, savedAddresses }: CheckoutFormProps) {
  const defaultAddr = savedAddresses.find(a => a.is_default) ?? savedAddresses[0]

  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(defaultAddr?.id ?? null)
  const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0)
  const [address, setAddress] = useState<ShippingAddress>(
    defaultAddr
      ? { full_name: defaultAddr.full_name, line1: defaultAddr.line1, line2: defaultAddr.line2 ?? '', city: defaultAddr.city, state: defaultAddr.state, pincode: defaultAddr.pincode, phone: defaultAddr.phone }
      : { ...blank, full_name: userName }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const clearCart = useCartStore((state) => state.clearCart)

  const subtotal = getSubtotal()
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping

  const handleSelectSaved = (addr: SavedAddress) => {
    setSelectedSavedId(addr.id)
    setUseNewAddress(false)
    setAddress({ full_name: addr.full_name, line1: addr.line1, line2: addr.line2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode, phone: addr.phone })
  }

  const handleUseNew = () => {
    setUseNewAddress(true)
    setSelectedSavedId(null)
    setAddress({ ...blank, full_name: userName })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!scriptLoaded || !window.Razorpay) {
      setError('Payment system is loading. Please try again in a moment.')
      return
    }
    if (items.length === 0) { setError('Your cart is empty.'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create order')

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: 'Shoe-Mart',
        description: `${items.length} item(s)`,
        order_id: data.razorpay_order_id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cart_items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size })),
                shipping_address: address,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error ?? 'Payment verification failed')
            clearCart()
            router.push(`/checkout/success?order_id=${verifyData.order_id}`)
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed')
            setLoading(false)
          }
        },
        prefill: { name: address.full_name, email: userEmail, contact: address.phone },
        theme: { color: '#DC2626' },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptLoaded(true)} />

      <form onSubmit={handlePay} className="space-y-6">

        {/* Saved addresses picker */}
        {savedAddresses.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h2>

            <div className="space-y-2 mb-3">
              {savedAddresses.map(addr => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectSaved(addr)}
                  className={`w-full text-left border rounded-xl px-4 py-3 transition-all ${selectedSavedId === addr.id && !useNewAddress ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-red-400 text-red-400" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={handleUseNew}
                className={`w-full text-left border rounded-xl px-4 py-3 transition-all ${useNewAddress ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="text-sm font-medium text-gray-700">+ Use a different address</span>
              </button>
            </div>
          </div>
        )}

        {/* Address form — shown for new address or no saved addresses */}
        {(useNewAddress || savedAddresses.length === 0) && (
          <div className="space-y-4">
            {savedAddresses.length > 0 && (
              <h3 className="text-sm font-semibold text-gray-700">Enter new address</h3>
            )}
            {savedAddresses.length === 0 && (
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input name="full_name" type="text" required value={address.full_name} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input name="phone" type="tel" required value={address.phone} onChange={handleChange}
                pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address line 1</label>
              <input name="line1" type="text" required value={address.line1} onChange={handleChange}
                placeholder="House/Flat no., Street name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address line 2 <span className="text-gray-400">(optional)</span>
              </label>
              <input name="line2" type="text" value={address.line2 ?? ''} onChange={handleChange}
                placeholder="Area, Locality"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input name="city" type="text" required value={address.city} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                <input name="pincode" type="text" required value={address.pincode} onChange={handleChange}
                  pattern="[1-9][0-9]{5}" placeholder="6-digit pincode"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select name="state" required value={address.state} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white">
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">
          <h3 className="font-bold text-gray-900">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-gray-600">
                <span className="truncate mr-2">{item.product.name} × {item.quantity} (UK {item.size})</span>
                <span className="font-medium whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(SHIPPING_FEE)}</span>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-gray-400">Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</p>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={loading || items.length === 0}>
          {loading ? (
            <span className="flex items-center gap-2"><LoadingSpinner size="sm" /> Processing…</span>
          ) : (
            `Pay ${formatPrice(total)} with Razorpay`
          )}
        </Button>
      </form>
    </>
  )
}

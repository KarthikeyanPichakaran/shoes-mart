'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export interface AddressData {
  id?: string
  full_name: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  phone: string
  is_default: boolean
}

interface Props {
  initial?: AddressData | null
  onClose: () => void
  onSaved: (address: AddressData) => void
}

const empty: AddressData = {
  full_name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', is_default: false,
}

export default function AddressFormModal({ initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<AddressData>(initial ?? empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initial ?? empty)
  }, [initial])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const url = form.id ? `/api/addresses/${form.id}` : '/api/addresses'
    const method = form.id ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-base font-bold text-gray-900">
            {form.id ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input name="full_name" type="text" required value={form.full_name} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
              pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address line 1</label>
            <input name="line1" type="text" required value={form.line1} onChange={handleChange}
              placeholder="House/Flat no., Street name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address line 2 <span className="text-gray-400">(optional)</span>
            </label>
            <input name="line2" type="text" value={form.line2} onChange={handleChange}
              placeholder="Area, Locality"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input name="city" type="text" required value={form.city} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
              <input name="pincode" type="text" required value={form.pincode} onChange={handleChange}
                pattern="[1-9][0-9]{5}" placeholder="6-digit"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <select name="state" required value={form.state} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_default" checked={form.is_default}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="flex gap-3 pt-2 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving…' : 'Save Address'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

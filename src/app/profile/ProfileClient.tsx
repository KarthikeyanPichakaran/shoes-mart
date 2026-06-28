'use client'

import { useState } from 'react'
import { User, MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import AddressFormModal from '@/components/profile/AddressFormModal'
import type { AddressData } from '@/components/profile/AddressFormModal'

interface Props {
  email: string
  initialProfile: { full_name: string; phone: string }
  initialAddresses: AddressData[]
}

export default function ProfileClient({ email, initialProfile, initialAddresses }: Props) {
  // --- Personal info state ---
  const [profile, setProfile] = useState(initialProfile)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // --- Address state ---
  const [addresses, setAddresses] = useState<AddressData[]>(initialAddresses)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AddressData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // --- Handlers: profile ---
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setProfileSaving(false)
    setProfileMsg(res.ok
      ? { ok: true, text: 'Profile updated successfully.' }
      : { ok: false, text: 'Failed to update profile.' })
  }

  // --- Handlers: addresses ---
  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (addr: AddressData) => { setEditTarget(addr); setModalOpen(true) }

  const handleSaved = (saved: AddressData) => {
    setAddresses(prev => {
      const updated = saved.is_default
        ? prev.map(a => ({ ...a, is_default: false }))
        : [...prev]
      const idx = updated.findIndex(a => a.id === saved.id)
      if (idx >= 0) { updated[idx] = saved; return updated }
      return [saved, ...updated]
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return
    setDeletingId(id)
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) setAddresses(prev => prev.filter(a => a.id !== id))
    setDeletingId(null)
  }

  const handleSetDefault = async (addr: AddressData) => {
    const res = await fetch(`/api/addresses/${addr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addr, is_default: true }),
    })
    if (res.ok) {
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addr.id })))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <h1 className="text-3xl font-black text-gray-900">My Profile</h1>

      {/* ── Personal Details ── */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
            <User className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Personal Details</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="10-digit mobile number"
              pattern="[6-9][0-9]{9}"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {profileMsg && (
            <p className={`text-sm ${profileMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
              {profileMsg.text}
            </p>
          )}

          <Button type="submit" disabled={profileSaving} size="lg">
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </section>

      {/* ── Saved Addresses ── */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Saved Addresses</h2>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">No saved addresses yet.</p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              <Plus className="h-4 w-4" /> Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id}
                className={`relative border rounded-xl p-4 transition-colors ${addr.is_default ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                {addr.is_default && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-red-400 text-red-400" /> Default
                  </span>
                )}
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{addr.full_name}</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                  {addr.city}, {addr.state} — {addr.pincode}<br />
                  {addr.phone}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Star className="h-3.5 w-3.5" /> Set default
                    </button>
                  )}
                  <button onClick={() => handleDelete(addr.id!)}
                    disabled={deletingId === addr.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors ml-auto">
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === addr.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <AddressFormModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

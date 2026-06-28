'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import type { LocalCartItem } from '@/types'

export default function CartSyncer() {
  const setItems = useCartStore((state) => state.setItems)
  const items = useCartStore((state) => state.items)
  const isLoggedIn = useRef(false)
  const hasLoaded = useRef(false)
  const syncTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const supabase = createClient()

    const loadAndMerge = async () => {
      if (hasLoaded.current) return
      hasLoaded.current = true

      try {
        const res = await fetch('/api/cart')
        if (!res.ok) return
        const { items: dbItems } = await res.json()

        const local = useCartStore.getState().items
        const merged = [...dbItems] as LocalCartItem[]

        for (const loc of local) {
          const idx = merged.findIndex(
            (d) => d.product_id === loc.product_id && d.size === loc.size
          )
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              quantity: Math.max(merged[idx].quantity, loc.quantity),
            }
          } else {
            merged.push(loc)
          }
        }

        setItems(merged)

        // Save merged cart back to DB
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: merged }),
        })
      } catch {
        // ignore network errors during sync
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        isLoggedIn.current = true
        await loadAndMerge()
      } else if (event === 'SIGNED_OUT') {
        isLoggedIn.current = false
        hasLoaded.current = false
        useCartStore.getState().clearCart()
      }
    })

    return () => subscription.unsubscribe()
  }, [setItems])

  // Debounced sync to DB whenever cart changes while logged in
  useEffect(() => {
    if (!isLoggedIn.current) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    }, 1500)
    return () => clearTimeout(syncTimer.current)
  }, [items])

  return null
}

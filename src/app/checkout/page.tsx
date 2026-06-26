import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default async function CheckoutPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/checkout')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>
      <CheckoutForm
        userEmail={user.email ?? ''}
        userName={profile?.full_name ?? ''}
      />
    </div>
  )
}

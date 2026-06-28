import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/profile')

  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
    supabase.from('addresses').select('*').eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  return (
    <ProfileClient
      email={user.email ?? ''}
      initialProfile={{ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' }}
      initialAddresses={addresses ?? []}
    />
  )
}

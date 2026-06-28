import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import GuestWelcome from '@/components/home/GuestWelcome'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: { user } }, { data: products }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('categories').select('*').order('name'),
  ])

  return (
    <>
      <Hero />
      {!user && <GuestWelcome />}
      <FeaturedProducts products={products ?? []} />
      <CategoryShowcase categories={categories ?? []} />
    </>
  )
}

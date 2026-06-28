import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: Request) {
  try {
    // Verify identity with the user's session
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, phone } = await request.json()

    // Use service-role client so RLS never blocks the upsert
    const admin = getAdminClient()
    const { error } = await admin
      .from('profiles')
      .upsert(
        { id: user.id, full_name: full_name?.trim() || null, phone: phone?.trim() || null },
        { onConflict: 'id' }
      )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}

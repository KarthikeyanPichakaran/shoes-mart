import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS. Only use server-side after verifying user identity separately.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client with the service role key.
 * 
 * ⚠️  SECURITY: ONLY use this in trusted server-side contexts (API routes, server actions).
 * NEVER import or use this client-side. It bypasses ALL Row Level Security.
 */
export const createServiceRoleClient = <T = Database>() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials. Ensure SUPABASE_SERVICE_ROLE_KEY is set.')
  }
  
  return createClient<T>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

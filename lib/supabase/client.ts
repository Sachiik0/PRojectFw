import { createBrowserClient } from '@supabase/ssr'

// Create and export the supabase client directly
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Also export as createClient for compatibility
export function createClient() {
  return supabase
}
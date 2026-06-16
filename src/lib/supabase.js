import { createClient } from '@supabase/supabase-js'

// Publishable URL/key are public client credentials (RLS protects data).
// Env vars override these defaults for local/other environments.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rxbmsrcvvgvtulcbdwwg.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_tuoo-a6kZUGSu8oxqnbNGw_ld_1-Bs9'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * SERVER-ONLY Supabase admin client.
 * Uses SUPABASE_SERVICE_ROLE_KEY — never expose to the browser.
 *
 * URL: set VITE_SUPABASE_URL on Netlify (same as the client).
 * Do not add a separate SUPABASE_URL env var — Netlify secret scanning
 * flags duplicate values in the build output.
 */
import { createClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function verifyUserToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', user: null }
  }

  const token = authHeader.slice(7)
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return { error: 'Invalid or expired session', user: null }
  }

  return { error: null, user: data.user }
}

export async function getTodayScanCount(supabase, userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { count, error } = await supabase
    .from('ai_scan_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('log_date', today)

  if (error) throw error
  return count ?? 0
}

export const MAX_AI_SCANS_PER_DAY = 6

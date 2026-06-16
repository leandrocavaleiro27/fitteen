import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve('.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

const { data, error } = await supabase.from('profiles').select('id').limit(1)

if (error) {
  console.error('Supabase check failed:', error.message)
  if (error.message.includes('does not exist') || error.code === '42P01') {
    console.error('\n→ Run supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor first.')
  }
  process.exit(1)
}

console.log('Supabase connected. profiles table exists.')
console.log('URL:', url)

import { useState } from 'react'
import { Zap, AlertCircle } from 'lucide-react'
import { APP_NAME } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { signInWithGoogle, isConfigured } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/15 neon-glow-lime">
            <Zap className="h-8 w-8 text-lime-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">{APP_NAME}</h1>
          <p className="text-slate-400">
            Train hard. Log fast. Track macros, sleep, and PRs — built for teen athletes.
          </p>
        </div>

        {!isConfigured && (
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              Supabase is not connected yet. Add <code className="text-amber-100">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
            </p>
          </div>
        )}

        <button
          type="button"
          className="btn-primary w-full text-lg neon-glow-lime"
          onClick={handleGoogle}
          disabled={loading || !isConfigured}
        >
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <p className="text-center text-xs text-slate-600">
          By continuing you agree to log your own data securely. No public profile — sharing never includes your name.
        </p>
      </div>
    </div>
  )
}

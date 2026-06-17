import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Zap, AlertCircle } from 'lucide-react'
import { APP_NAME, GOOGLE_CLIENT_ID } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signInWithGoogleToken, signInWithGoogleRedirect, isConfigured } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const usePopup = Boolean(GOOGLE_CLIENT_ID)

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google did not return a sign-in token')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogleToken(credentialResponse.credential)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRedirectFallback = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogleRedirect()
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
              Supabase is not connected yet. Add{' '}
              <code className="text-amber-100">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code>{' '}
              {import.meta.env.PROD
                ? 'in Netlify → Environment variables, then redeploy.'
                : 'to .env.local.'}
            </p>
          </div>
        )}

        {usePopup && isConfigured ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-full overflow-hidden rounded-xl [&>div]:!w-full [&>div]:!flex [&>div]:!justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed')}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="320"
              />
            </div>
            <p className="text-center text-xs text-slate-500">
              Sign in stays on {APP_NAME} — Google popup only, no redirect to Supabase.
            </p>
          </div>
        ) : (
          <>
            {!GOOGLE_CLIENT_ID && isConfigured && (
              <p className="text-center text-xs text-amber-200/90">
                Add <code className="text-amber-100">VITE_GOOGLE_CLIENT_ID</code> in Netlify for
                a cleaner Google popup (recommended).
              </p>
            )}
            <button
              type="button"
              className="btn-primary w-full text-lg neon-glow-lime"
              onClick={handleRedirectFallback}
              disabled={loading || !isConfigured}
            >
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
          </>
        )}

        {loading && usePopup && (
          <p className="text-center text-sm text-slate-400">Signing you in…</p>
        )}

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <p className="text-center text-xs text-slate-600">
          By continuing you agree to our{' '}
          <a href="/privacy" className="text-cyan-500 hover:text-cyan-400">
            Privacy Policy
          </a>
          . No public profile — sharing never includes your name.
        </p>
      </div>
    </div>
  )
}

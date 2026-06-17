import { Link } from 'react-router-dom'
import { APP_NAME } from '../lib/constants'

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-10 text-slate-300">
      <Link to="/auth" className="text-sm text-cyan-400 hover:text-cyan-300">
        ← Back to {APP_NAME}
      </Link>

      <h1 className="mt-6 text-3xl font-black text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white">What {APP_NAME} collects</h2>
          <p className="mt-2">
            When you sign in with Google, we receive your account identifier and email via Supabase
            Auth so you can access your private log. We store the fitness data you enter: meals,
            macros, sleep, workouts, and notes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">How we use it</h2>
          <p className="mt-2">
            Data is used only to show your personal dashboard and analytics. We do not sell your
            data. Sharing features never include your name or email — only stats you choose to
            share.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">Third parties</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Supabase — authentication and database</li>
            <li>Google — sign-in (optional)</li>
            <li>Netlify — hosting</li>
            <li>Google Gemini — meal photo analysis (mobile only, if you use AI scan)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">Your choices</h2>
          <p className="mt-2">
            You can sign out at any time. To delete your account and data, contact the app
            operator or delete your user from Supabase project settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">Contact</h2>
          <p className="mt-2">
            Questions: use the support email listed on the Google OAuth consent screen for Fit Teen.
          </p>
        </section>
      </div>
    </div>
  )
}

import { Link2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { APP_NAME, INVITE_URL } from '../lib/constants'

export default function InviteFriends() {
  const [copied, setCopied] = useState(false)
  const inviteUrl = INVITE_URL || window.location.origin

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy this invite link:', inviteUrl)
    }
  }

  const shareInvite = async () => {
    const text = `Join me on ${APP_NAME} — track workouts, macros, and PRs. ${inviteUrl}`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${APP_NAME} Invite`, text, url: inviteUrl })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    copyLink()
  }

  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Invite Friends</h2>
      </div>

      <p className="text-sm text-slate-400">
        Send the app link — friends sign in with Google and start their own private log.
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 break-all">
        {inviteUrl}
      </div>

      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={copyLink}>
          {copied ? <Check className="h-5 w-5 text-lime-400" /> : <Copy className="h-5 w-5" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button type="button" className="btn-primary flex-1" onClick={shareInvite}>
          Share invite
        </button>
      </div>
    </section>
  )
}

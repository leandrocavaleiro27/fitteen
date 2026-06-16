import { Share2 } from 'lucide-react'
import { APP_NAME } from '../lib/constants'

/**
 * Shares workout/milestone stats WITHOUT any user PII (no display name, no email).
 */
export default function ShareButton({ title, lines = [], className = '' }) {
  const text = [
    title,
    ...lines.filter(Boolean),
    `Tracked on ${APP_NAME}.`,
  ].join('\n')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: APP_NAME, text })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch {
      alert(text)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-400 transition hover:bg-lime-400/20 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  )
}

export function buildWorkoutShareLines(workout, proteinToday) {
  const lines = [`🔥 Just crushed ${workout.routine_name}!`]

  for (const ex of workout.exercises || []) {
    const sets = ex.exercise_sets || []
    const best = sets.reduce(
      (max, s) => {
        const w = Number(s.weight_kg)
        return w > max.weight ? { weight: w, reps: s.reps } : max
      },
      { weight: 0, reps: 0 }
    )
    if (best.weight > 0) {
      lines.push(`${ex.exercise_name}: ${best.weight} kg × ${best.reps}`)
    }
  }

  if (proteinToday > 0) {
    lines.push(`Hit ${Math.round(proteinToday)}g of protein today.`)
  }

  return lines
}

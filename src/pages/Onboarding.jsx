import { useState } from 'react'
import { Target } from 'lucide-react'
import { DEFAULT_TARGETS } from '../lib/constants'

export default function OnboardingPage({ onComplete, loading }) {
  const [displayName, setDisplayName] = useState('')
  const [skipMacros, setSkipMacros] = useState(false)
  const [macros, setMacros] = useState({ ...DEFAULT_TARGETS })

  const handleMacroChange = (key, value) => {
    setMacros((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const submit = (e) => {
    e.preventDefault()
    onComplete({ displayName, macros, skipMacros })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      <form onSubmit={submit} className="card-athletic space-y-6 p-6">
        <div className="space-y-2 text-center">
          <Target className="mx-auto h-10 w-10 text-lime-400" />
          <h1 className="text-2xl font-black text-white">Quick setup</h1>
          <p className="text-sm text-slate-400">Optional display name — never shown when you share stats.</p>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase text-slate-500">Display name (optional)</span>
          <input
            className="input-athletic"
            placeholder="e.g. Leo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 p-4">
            <input
              type="checkbox"
              checked={skipMacros}
              onChange={(e) => setSkipMacros(e.target.checked)}
              className="h-5 w-5 rounded accent-lime-400"
            />
            <div>
              <p className="font-medium text-white">Set macros later</p>
              <p className="text-xs text-slate-500">Uses standard athlete defaults for now</p>
            </div>
          </label>

          {!skipMacros && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ['target_calories', 'Calories'],
                ['target_protein', 'Protein (g)'],
                ['target_carbs', 'Carbs (g)'],
                ['target_fat', 'Fat (g)'],
              ].map(([key, label]) => (
                <label key={key} className="block space-y-1">
                  <span className="text-xs uppercase text-slate-500">{label}</span>
                  <input
                    type="number"
                    min="0"
                    className="input-athletic"
                    value={macros[key]}
                    onChange={(e) => handleMacroChange(key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Start tracking'}
        </button>
      </form>
    </div>
  )
}

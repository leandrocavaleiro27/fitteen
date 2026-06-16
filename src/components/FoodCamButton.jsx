import { useRef, useState } from 'react'
import { Camera, Loader2, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isMobileDevice, fileToBase64 } from '../lib/device'
import { MAX_AI_SCANS_PER_DAY } from '../lib/constants'

export default function FoodCamButton({ scansUsed, onAnalyzed, onConfirm, confirming }) {
  const inputRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const mobile = isMobileDevice()

  const scansRemaining = MAX_AI_SCANS_PER_DAY - (scansUsed ?? 0)

  const handleFile = async (file) => {
    if (!file) return
    setError(null)
    setScanning(true)
    setDraft(null)

    try {
      const { base64, mimeType } = await fileToBase64(file)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) throw new Error('Not signed in')

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Scan failed')

      setDraft(payload)
      onAnalyzed?.(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (!mobile) {
    return (
      <section className="card-athletic space-y-3 p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <Smartphone className="h-5 w-5" />
          <h2 className="text-lg font-bold text-slate-300">AI Food Cam</h2>
        </div>
        <p className="text-sm text-slate-500">
          Food photo scan is available on mobile only. Open Fit Teen on your phone to snap meals.
        </p>
      </section>
    )
  }

  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">AI Food Cam</h2>
        <span className="text-xs text-slate-500">
          {scansRemaining}/{MAX_AI_SCANS_PER_DAY} scans left
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!scanning && !draft && (
        <button
          type="button"
          className="btn-primary w-full neon-glow-lime"
          disabled={scansRemaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-5 w-5" />
          Scan meal photo
        </button>
      )}

      {scanning && (
        <div className="space-y-3 rounded-xl border border-cyan-500/30 bg-slate-900/80 p-4 animate-pulse-glow">
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-semibold">AI Scanning Meal…</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 rounded bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-800" />
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      )}

      {draft && !scanning && (
        <div className="space-y-4">
          <p className="text-sm text-lime-400">Scan complete — edit if needed, then confirm to add to today.</p>

          <label className="block space-y-1">
            <span className="text-xs uppercase text-slate-500">Food</span>
            <input
              className="input-athletic"
              value={draft.food_name}
              onChange={(e) => setDraft({ ...draft, food_name: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['calories', 'Calories'],
              ['protein', 'Protein (g)'],
              ['carbs', 'Carbs (g)'],
              ['fat', 'Fat (g)'],
            ].map(([key, label]) => (
              <label key={key} className="block space-y-1">
                <span className="text-xs uppercase text-slate-500">{label}</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input-athletic"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-ghost flex-1" onClick={() => setDraft(null)}>
              Discard
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={confirming}
              onClick={() => onConfirm(draft, () => setDraft(null))}
            >
              {confirming ? 'Logging…' : 'Confirm log'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  )
}

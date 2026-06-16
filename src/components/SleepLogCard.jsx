import { Moon } from 'lucide-react'

export default function SleepLogCard({ value, onChange, onSave, saving }) {
  const hours = value ?? 7

  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Sleep</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-black text-lime-400">{hours.toFixed(1)}h</span>
          <span className="text-sm text-slate-500">Last night</span>
        </div>

        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={hours}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-lime-400"
        />

        <div className="flex justify-between text-xs text-slate-600">
          <span>0h</span>
          <span>12h</span>
        </div>
      </div>

      <button type="button" className="btn-ghost w-full" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save sleep'}
      </button>
    </section>
  )
}

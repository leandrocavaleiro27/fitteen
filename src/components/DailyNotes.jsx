import { StickyNote } from 'lucide-react'

export default function DailyNotes({ value, onChange, onSave, saving }) {
  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center gap-2">
        <StickyNote className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-bold text-white">Daily Notes</h2>
      </div>

      <textarea
        className="input-athletic min-h-[120px] resize-y"
        placeholder="Focus, wins, how you felt today…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <button type="button" className="btn-ghost w-full" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save notes'}
      </button>
    </section>
  )
}

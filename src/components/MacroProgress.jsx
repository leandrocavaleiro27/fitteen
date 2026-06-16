import { macroProgress, isNearOrAtTarget, isAtTarget } from '../lib/constants'

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'bg-lime-400', glow: 'neon-glow-lime' },
  { key: 'protein', label: 'Protein', unit: 'g', color: 'bg-cyan-400', glow: 'neon-glow-cyan' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'bg-orange-400', glow: '' },
  { key: 'fat', label: 'Fat', unit: 'g', color: 'bg-violet-400', glow: '' },
]

export default function MacroProgress({ actual, targets }) {
  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Macro Progress</h2>
        <span className="text-xs uppercase tracking-wide text-slate-500">Target vs today</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MACRO_CONFIG.map(({ key, label, unit, color, glow }) => {
          const current = actual[key] ?? 0
          const target = targets[`target_${key}`] ?? 0
          const pct = macroProgress(current, target)
          const hit = isAtTarget(current, target)
          const near = isNearOrAtTarget(current, target)

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className={`text-xs font-semibold ${hit ? 'text-lime-400' : near ? 'text-cyan-300' : 'text-slate-500'}`}>
                  {pct}%
                </span>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color} ${hit ? glow : near ? 'opacity-90' : 'opacity-75'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">{Math.round(current)}</span>
                <span className="text-slate-600"> / </span>
                <span>{Math.round(target)} {unit}</span>
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

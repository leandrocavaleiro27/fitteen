import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import AppShell from '../components/layout/AppShell'
import ShareButton from '../components/ShareButton'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useAnalytics } from '../hooks/useAnalytics'
import { buildExerciseVolumeHistory, maxVolumePR, formatVolume } from '../lib/volume'
import { EXERCISE_PRESETS, CARDIO_EXERCISE_PRESETS, isCardioExercise } from '../lib/constants'

const PERIODS = ['week', 'month', 'year']

const chartTooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#f1f5f9',
}

function formatDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AnalyticsPage() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const [period, setPeriod] = useState('week')
  const [exerciseFilter, setExerciseFilter] = useState(EXERCISE_PRESETS[0])

  const {
    isLoading,
    calorieChartData,
    sleepChartData,
    workouts,
    todayTotals,
  } = useAnalytics(user?.id, period, profile)

  const volumeHistory = useMemo(() => buildExerciseVolumeHistory(workouts), [workouts])
  const exerciseNames = useMemo(
    () => Object.keys(volumeHistory).sort() || EXERCISE_PRESETS,
    [volumeHistory]
  )
  const selectedHistory = volumeHistory[exerciseFilter] || []
  const pr = maxVolumePR(selectedHistory)
  const filterIsCardio = isCardioExercise(exerciseFilter)

  const prShareLines = pr
    ? [
        filterIsCardio
          ? `New ${exerciseFilter} distance PR: ${formatVolume(pr.volume, true)}`
          : `New ${exerciseFilter} volume PR: ${formatVolume(pr.volume)}`,
        `Date: ${pr.date}`,
      ]
    : []

  return (
    <AppShell onSignOut={signOut}>
      <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
              period === p
                ? 'bg-lime-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card-athletic h-48 animate-pulse p-5" />
      ) : (
        <>
          <section className="card-athletic space-y-4 p-5">
            <h2 className="text-lg font-bold text-white">Calories vs target</h2>
            {calorieChartData.length === 0 ? (
              <p className="text-sm text-slate-500">Log meals to see calorie trends.</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={calorieChartData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={formatDateLabel} />
                    <Legend />
                    <Bar dataKey="actual" name="Actual" fill="#a3e635" radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="card-athletic space-y-4 p-5">
            <h2 className="text-lg font-bold text-white">Sleep trend</h2>
            {sleepChartData.length === 0 ? (
              <p className="text-sm text-slate-500">Log sleep on the dashboard to see trends.</p>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sleepChartData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 12]} stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={formatDateLabel} />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name="Hours"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={{ fill: '#22d3ee', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="card-athletic space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">PR Board</h2>
              {pr && (
                <ShareButton
                  title="🔥 Strength milestone!"
                  lines={prShareLines}
                />
              )}
            </div>

            <p className="text-xs text-slate-500">
              Strength: Σ(kg × reps). Running/cardio: total distance (km) per session.
            </p>

            <select
              className="input-athletic"
              value={exerciseFilter}
              onChange={(e) => setExerciseFilter(e.target.value)}
            >
              {[...new Set([...EXERCISE_PRESETS, ...CARDIO_EXERCISE_PRESETS, ...exerciseNames])].map(
                (name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                )
              )}
            </select>

            {selectedHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No logged sets for {exerciseFilter} yet.</p>
            ) : (
              <>
                {pr && (
                  <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3">
                    <p className="text-xs uppercase text-lime-400/80">
                      {filterIsCardio ? 'Best session distance' : 'Best session volume'}
                    </p>
                    <p className="text-2xl font-black text-lime-400">
                      {formatVolume(pr.volume, filterIsCardio)}
                    </p>
                    <p className="text-xs text-slate-400">{pr.date}</p>
                  </div>
                )}

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedHistory}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelFormatter={formatDateLabel}
                        formatter={(v) => [
                          formatVolume(v, filterIsCardio),
                          filterIsCardio ? 'Distance' : 'Volume',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        name={filterIsCardio ? 'Distance (km)' : 'Volume (kg·reps)'}
                        stroke="#fb923c"
                        strokeWidth={3}
                        dot={{ fill: '#fb923c', r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </section>

          {todayTotals.protein > 0 && (
            <div className="flex justify-center">
              <ShareButton
                title="🔥 Nutrition win today!"
                lines={[`Hit ${Math.round(todayTotals.protein)}g of protein today.`]}
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}

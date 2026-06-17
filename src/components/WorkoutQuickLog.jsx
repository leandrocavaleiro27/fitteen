import { useState } from 'react'
import { Dumbbell, Plus, Trash2 } from 'lucide-react'
import {
  ROUTINE_PRESETS,
  EXERCISE_PRESETS,
  CARDIO_EXERCISE_PRESETS,
  isCardioExercise,
} from '../lib/constants'

function emptyStrengthSet() {
  return { weight_kg: '', reps: '' }
}

function emptyCardioSet() {
  return { distance_km: '', duration_min: '' }
}

function emptyExercise() {
  return { exerciseName: '', sets: [emptyStrengthSet()] }
}

function setsForExercise(name) {
  return isCardioExercise(name) ? [emptyCardioSet()] : [emptyStrengthSet()]
}

export default function WorkoutQuickLog({ onSave, saving }) {
  const [routineName, setRoutineName] = useState(ROUTINE_PRESETS[0])
  const [exercises, setExercises] = useState([emptyExercise()])

  const updateExercise = (idx, patch) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== idx) return ex
        const next = { ...ex, ...patch }
        if (patch.exerciseName !== undefined) {
          const wasCardio = isCardioExercise(ex.exerciseName)
          const nowCardio = isCardioExercise(patch.exerciseName)
          if (wasCardio !== nowCardio) {
            next.sets = setsForExercise(patch.exerciseName)
          }
        }
        return next
      })
    )
  }

  const updateSet = (exIdx, setIdx, patch) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        return {
          ...ex,
          sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)),
        }
      })
    )
  }

  const addSet = (exIdx) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const blank = isCardioExercise(ex.exerciseName) ? emptyCardioSet() : emptyStrengthSet()
        return { ...ex, sets: [...ex.sets, blank] }
      })
    )
  }

  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()])

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    onSave({ routineName, exerciseRows: exercises }, () => {
      setRoutineName(ROUTINE_PRESETS[0])
      setExercises([emptyExercise()])
    })
  }

  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-bold text-white">Workout Quick-Log</h2>
      </div>

      <label className="block space-y-1">
        <span className="text-xs uppercase text-slate-500">Session</span>
        <select
          className="input-athletic"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
        >
          {ROUTINE_PRESETS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const cardio = isCardioExercise(ex.exerciseName)

          return (
            <div
              key={exIdx}
              className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="flex gap-2">
                <input
                  list={`exercise-presets-${exIdx}`}
                  className="input-athletic flex-1"
                  placeholder={cardio ? 'e.g. Running' : 'Exercise name'}
                  value={ex.exerciseName}
                  onChange={(e) => updateExercise(exIdx, { exerciseName: e.target.value })}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    className="rounded-xl border border-slate-700 px-3 text-slate-500 hover:text-red-400"
                    onClick={() => removeExercise(exIdx)}
                    aria-label="Remove exercise"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <datalist id={`exercise-presets-${exIdx}`}>
                {(cardio ? CARDIO_EXERCISE_PRESETS : EXERCISE_PRESETS).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              {cardio && (
                <p className="text-xs text-cyan-400/90">Cardio mode — log distance & time</p>
              )}

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs uppercase text-slate-500">
                  {cardio ? (
                    <>
                      <span>Distance (km)</span>
                      <span>Time (min)</span>
                    </>
                  ) : (
                    <>
                      <span>Weight (kg)</span>
                      <span>Reps</span>
                    </>
                  )}
                  <span className="w-10" />
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    {cardio ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-athletic !min-h-[44px] !py-2"
                          placeholder="km"
                          value={set.distance_km ?? ''}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, { distance_km: e.target.value })
                          }
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="input-athletic !min-h-[44px] !py-2"
                          placeholder="min"
                          value={set.duration_min ?? ''}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, { duration_min: e.target.value })
                          }
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="input-athletic !min-h-[44px] !py-2"
                          placeholder="kg"
                          value={set.weight_kg ?? ''}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, { weight_kg: e.target.value })
                          }
                        />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="input-athletic !min-h-[44px] !py-2"
                          placeholder="reps"
                          value={set.reps ?? ''}
                          onChange={(e) => updateSet(exIdx, setIdx, { reps: e.target.value })}
                        />
                      </>
                    )}
                    <div className="w-10" />
                  </div>
                ))}

                <button
                  type="button"
                  className="text-sm font-medium text-cyan-400"
                  onClick={() => addSet(exIdx)}
                >
                  + Add {cardio ? 'interval' : 'set'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn-ghost w-full" onClick={addExercise}>
        <Plus className="h-5 w-5" />
        Add exercise
      </button>

      <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving workout…' : 'Save workout'}
      </button>
    </section>
  )
}

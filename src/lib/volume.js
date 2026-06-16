/** Total volume for an exercise session: Σ(weight_kg × reps). Ignores empty/invalid sets. */
export function setVolume(weightKg, reps) {
  const w = Number(weightKg)
  const r = Number(reps)
  if (!w || !r || w <= 0 || r <= 0) return 0
  return w * r
}

export function exerciseSessionVolume(sets) {
  if (!sets?.length) return 0
  return sets.reduce((total, s) => total + setVolume(s.weight_kg, s.reps), 0)
}

/** Best session volume per exercise name for PR tracking */
export function buildExerciseVolumeHistory(workouts) {
  const byExercise = {}

  for (const workout of workouts) {
    for (const exercise of workout.exercises || []) {
      const name = exercise.exercise_name?.trim()
      if (!name) continue

      const volume = exerciseSessionVolume(exercise.exercise_sets)
      if (volume <= 0) continue

      const point = {
        date: workout.log_date,
        volume,
        workoutId: workout.id,
      }

      if (!byExercise[name]) {
        byExercise[name] = []
      }

      const existing = byExercise[name].find((p) => p.date === point.date)
      if (existing) {
        existing.volume = Math.max(existing.volume, volume)
      } else {
        byExercise[name].push(point)
      }
    }
  }

  for (const name of Object.keys(byExercise)) {
    byExercise[name].sort((a, b) => a.date.localeCompare(b.date))
  }

  return byExercise
}

export function maxVolumePR(history) {
  if (!history?.length) return null
  return history.reduce((max, p) => (p.volume > max.volume ? p : max), history[0])
}

export function formatVolume(kg) {
  if (!kg) return '0'
  return `${Math.round(kg).toLocaleString()} kg·reps`
}

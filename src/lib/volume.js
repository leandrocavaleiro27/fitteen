import { isCardioExercise } from './constants'

/** Strength: Σ(weight_kg × reps). Cardio: Σ(distance_km). */
export function setVolume(weightKg, reps) {
  const w = Number(weightKg)
  const r = Number(reps)
  if (!w || !r || w <= 0 || r <= 0) return 0
  return w * r
}

export function setCardioDistance(distanceKm) {
  const d = Number(distanceKm)
  if (!d || d <= 0) return 0
  return d
}

export function exerciseSessionVolume(sets, exerciseName) {
  if (!sets?.length) return 0
  if (isCardioExercise(exerciseName)) {
    return sets.reduce((total, s) => total + setCardioDistance(s.distance_km), 0)
  }
  return sets.reduce((total, s) => total + setVolume(s.weight_kg, s.reps), 0)
}

/** Best session metric per exercise name for PR tracking */
export function buildExerciseVolumeHistory(workouts) {
  const byExercise = {}

  for (const workout of workouts) {
    for (const exercise of workout.exercises || []) {
      const name = exercise.exercise_name?.trim()
      if (!name) continue

      const volume = exerciseSessionVolume(exercise.exercise_sets, name)
      if (volume <= 0) continue

      const point = {
        date: workout.log_date,
        volume,
        workoutId: workout.id,
        isCardio: isCardioExercise(name),
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

export function formatVolume(value, isCardio = false) {
  if (!value) return '0'
  if (isCardio) {
    const km = Number(value)
    return km >= 1 ? `${km.toFixed(2)} km` : `${(km * 1000).toFixed(0)} m`
  }
  return `${Math.round(value).toLocaleString()} kg·reps`
}

export function formatCardioSet(set) {
  const km = Number(set.distance_km)
  const min = Number(set.duration_min)
  if (!km || !min) return null
  return `${km} km in ${min} min`
}

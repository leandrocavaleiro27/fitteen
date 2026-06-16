export const APP_NAME = 'Fit Teen'

export const DEFAULT_TARGETS = {
  target_calories: 2500,
  target_protein: 150,
  target_carbs: 250,
  target_fat: 70,
}

export const MAX_AI_SCANS_PER_DAY = 6

export const INVITE_URL =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://fit-teen.netlify.app')

export const ROUTINE_PRESETS = [
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Cardio',
  'Sport Practice',
]

export const EXERCISE_PRESETS = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Lat Pulldown',
  'Romanian Deadlift',
  'Leg Press',
  'Bicep Curl',
]

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function sumMacros(meals) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + Number(m.calories || 0),
      protein: acc.protein + Number(m.protein || 0),
      carbs: acc.carbs + Number(m.carbs || 0),
      fat: acc.fat + Number(m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function macroProgress(actual, target) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.round((actual / target) * 100))
}

export function isNearOrAtTarget(actual, target) {
  return macroProgress(actual, target) >= 90
}

export function isAtTarget(actual, target) {
  return macroProgress(actual, target) >= 100
}

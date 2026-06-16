import { useMemo } from 'react'
import { useMealsRange } from './useMeals'
import { useCheckinsRange } from './useDailyCheckin'
import { useWorkoutsRange } from './useWorkouts'
import { sumMacros } from '../lib/constants'

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

function addDays(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getDateRange(period, reference = new Date()) {
  const end = reference.toISOString().slice(0, 10)

  if (period === 'week') {
    const start = startOfWeek(reference)
    return { start, end: addDays(start, 6) }
  }

  if (period === 'month') {
    const d = new Date(reference.getFullYear(), reference.getMonth(), 1)
    const start = d.toISOString().slice(0, 10)
    const last = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
    return { start, end: last.toISOString().slice(0, 10) }
  }

  const start = `${reference.getFullYear()}-01-01`
  const endYear = `${reference.getFullYear()}-12-31`
  return { start, end: endYear }
}

export function useAnalytics(userId, period, profile) {
  const { start, end } = useMemo(() => getDateRange(period), [period])

  const meals = useMealsRange(userId, start, end)
  const checkins = useCheckinsRange(userId, start, end)
  const workouts = useWorkoutsRange(userId, start, end)

  const calorieChartData = useMemo(() => {
    const byDate = {}

    for (const meal of meals.data || []) {
      if (!byDate[meal.log_date]) {
        byDate[meal.log_date] = { date: meal.log_date, actual: 0, target: profile?.target_calories ?? 0 }
      }
      byDate[meal.log_date].actual += Number(meal.calories || 0)
    }

    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }, [meals.data, profile?.target_calories])

  const sleepChartData = useMemo(() => {
    return (checkins.data || [])
      .filter((c) => c.sleep_hours != null && c.sleep_hours !== '')
      .map((c) => ({ date: c.log_date, hours: Number(c.sleep_hours) }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [checkins.data])

  const dailyMacroTotals = useMemo(() => {
    const byDate = {}
    for (const meal of meals.data || []) {
      if (!byDate[meal.log_date]) {
        byDate[meal.log_date] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }
      const t = byDate[meal.log_date]
      t.calories += Number(meal.calories || 0)
      t.protein += Number(meal.protein || 0)
      t.carbs += Number(meal.carbs || 0)
      t.fat += Number(meal.fat || 0)
    }
    return byDate
  }, [meals.data])

  return {
    start,
    end,
    isLoading: meals.isLoading || checkins.isLoading || workouts.isLoading,
    calorieChartData,
    sleepChartData,
    dailyMacroTotals,
    workouts: workouts.data || [],
    todayTotals: sumMacros(
      (meals.data || []).filter((m) => m.log_date === new Date().toISOString().slice(0, 10))
    ),
  }
}

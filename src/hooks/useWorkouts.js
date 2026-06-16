import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/constants'

const WORKOUT_SELECT = `
  id,
  log_date,
  routine_name,
  created_at,
  exercises (
    id,
    exercise_name,
    exercise_sets (
      id,
      weight_kg,
      reps,
      set_order
    )
  )
`

export function useWorkouts(userId, date = todayISO()) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['workouts', userId, date],
    enabled: Boolean(userId && supabase),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(WORKOUT_SELECT)
        .eq('user_id', userId)
        .eq('log_date', date)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const saveWorkout = useMutation({
    mutationFn: async ({ routineName, exerciseRows }) => {
      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert({ user_id: userId, log_date: date, routine_name: routineName })
        .select()
        .single()
      if (wErr) throw wErr

      for (const row of exerciseRows) {
        const name = row.exerciseName?.trim()
        if (!name) continue

        const validSets = (row.sets || []).filter(
          (s) => s.weight_kg && s.reps && Number(s.weight_kg) > 0 && Number(s.reps) > 0
        )
        if (!validSets.length) continue

        const { data: exercise, error: eErr } = await supabase
          .from('exercises')
          .insert({ workout_id: workout.id, exercise_name: name })
          .select()
          .single()
        if (eErr) throw eErr

        const setsPayload = validSets.map((s, i) => ({
          exercise_id: exercise.id,
          weight_kg: Number(s.weight_kg),
          reps: Number(s.reps),
          set_order: i + 1,
        }))

        const { error: sErr } = await supabase.from('exercise_sets').insert(setsPayload)
        if (sErr) throw sErr
      }

      return workout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', userId, date] })
      queryClient.invalidateQueries({ queryKey: ['workouts-range'] })
    },
  })

  return { ...query, saveWorkout }
}

export function useWorkoutsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['workouts-range', userId, startDate, endDate],
    enabled: Boolean(userId && supabase && startDate && endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(WORKOUT_SELECT)
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useAiScanCount(userId) {
  return useQuery({
    queryKey: ['ai-scans', userId, todayISO()],
    enabled: Boolean(userId && supabase),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('ai_scans_today_count', {
        p_user_id: userId,
      })
      if (error) throw error
      return data ?? 0
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/constants'

export function useMeals(userId, date = todayISO()) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['meals', userId, date],
    enabled: Boolean(userId && supabase),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const addMeal = useMutation({
    mutationFn: async (meal) => {
      const { data, error } = await supabase
        .from('meal_entries')
        .insert({ ...meal, user_id: userId, log_date: date })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', userId, date] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })

  return { ...query, addMeal }
}

export function useMealsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['meals-range', userId, startDate, endDate],
    enabled: Boolean(userId && supabase && startDate && endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

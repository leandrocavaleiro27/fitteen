import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/constants'

export function useDailyCheckin(userId, date = todayISO()) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['checkin', userId, date],
    enabled: Boolean(userId && supabase),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  const upsertCheckin = useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert(
          { user_id: userId, log_date: date, ...fields },
          { onConflict: 'user_id,log_date' }
        )
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['checkin', userId, date], data)
      queryClient.invalidateQueries({ queryKey: ['checkins-range'] })
    },
  })

  return { ...query, upsertCheckin }
}

export function useCheckinsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['checkins-range', userId, startDate, endDate],
    enabled: Boolean(userId && supabase && startDate && endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins')
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DEFAULT_TARGETS } from '../lib/constants'

export function useProfile(userId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId && supabase),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data)
    },
  })

  const completeOnboarding = useMutation({
    mutationFn: async ({ displayName, macros, skipMacros }) => {
      const payload = {
        display_name: displayName?.trim() || null,
        onboarding_complete: true,
        macros_configured: !skipMacros,
        ...(skipMacros ? DEFAULT_TARGETS : macros),
      }
      return updateProfile.mutateAsync(payload)
    },
  })

  return { ...query, updateProfile, completeOnboarding }
}

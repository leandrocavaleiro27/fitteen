import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import AuthPage from './pages/Auth'
import OnboardingPage from './pages/Onboarding'
import DashboardPage from './pages/Dashboard'
import AnalyticsPage from './pages/Analytics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth()

  if (!isConfigured) {
    // Production must never expose dashboard without Supabase configured
    if (import.meta.env.PROD) {
      return <Navigate to="/auth" replace />
    }
    return children
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function OnboardingGate({ children }) {
  const { user, isConfigured } = useAuth()
  const { data: profile, isLoading, completeOnboarding } = useProfile(user?.id)

  if (!isConfigured || !user) {
    return children
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-400">
        Loading profile…
      </div>
    )
  }

  if (profile && !profile.onboarding_complete) {
    return (
      <OnboardingPage
        loading={completeOnboarding.isPending}
        onComplete={(payload) => completeOnboarding.mutate(payload)}
      />
    )
  }

  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <DashboardPage />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <AnalyticsPage />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

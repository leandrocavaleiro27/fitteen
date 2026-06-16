import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import MacroProgress from '../components/MacroProgress'
import SleepLogCard from '../components/SleepLogCard'
import FoodCamButton from '../components/FoodCamButton'
import ManualMealLog from '../components/ManualMealLog'
import WorkoutQuickLog from '../components/WorkoutQuickLog'
import DailyNotes from '../components/DailyNotes'
import InviteFriends from '../components/InviteFriends'
import ShareButton, { buildWorkoutShareLines } from '../components/ShareButton'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useMeals } from '../hooks/useMeals'
import { useDailyCheckin } from '../hooks/useDailyCheckin'
import { useWorkouts, useAiScanCount } from '../hooks/useWorkouts'
import { sumMacros, todayISO } from '../lib/constants'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: meals = [], addMeal } = useMeals(user?.id)
  const { data: checkin, upsertCheckin } = useDailyCheckin(user?.id)
  const { data: workouts = [], saveWorkout } = useWorkouts(user?.id)
  const { data: scansUsed = 0, refetch: refetchScans } = useAiScanCount(user?.id)

  const [sleepHours, setSleepHours] = useState(7)
  const [notes, setNotes] = useState('')
  const [mealSaving, setMealSaving] = useState(false)
  const [sleepSaving, setSleepSaving] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)
  const [workoutSaving, setWorkoutSaving] = useState(false)

  useEffect(() => {
    if (checkin?.sleep_hours != null) setSleepHours(Number(checkin.sleep_hours))
    if (checkin?.notes != null) setNotes(checkin.notes)
  }, [checkin])

  const actual = useMemo(() => sumMacros(meals), [meals])
  const targets = profile || {}

  const confirmMeal = async (draft, clearDraft) => {
    setMealSaving(true)
    try {
      await addMeal.mutateAsync({
        food_name: draft.food_name,
        calories: Number(draft.calories),
        protein: Number(draft.protein),
        carbs: Number(draft.carbs),
        fat: Number(draft.fat),
        source: 'ai',
      })
      clearDraft()
      refetchScans()
    } finally {
      setMealSaving(false)
    }
  }

  const saveSleep = async () => {
    setSleepSaving(true)
    try {
      await upsertCheckin.mutateAsync({ sleep_hours: sleepHours })
    } finally {
      setSleepSaving(false)
    }
  }

  const saveNotes = async () => {
    setNotesSaving(true)
    try {
      await upsertCheckin.mutateAsync({ notes })
    } finally {
      setNotesSaving(false)
    }
  }

  const handleWorkoutSave = async (payload, reset) => {
    setWorkoutSaving(true)
    try {
      await saveWorkout.mutateAsync(payload)
      reset()
    } finally {
      setWorkoutSaving(false)
    }
  }

  return (
    <AppShell onSignOut={signOut}>
      <MacroProgress actual={actual} targets={targets} />

      <SleepLogCard
        value={sleepHours}
        onChange={setSleepHours}
        onSave={saveSleep}
        saving={sleepSaving}
      />

      <FoodCamButton
        scansUsed={scansUsed}
        onConfirm={confirmMeal}
        confirming={mealSaving}
      />

      <ManualMealLog
        saving={mealSaving}
        onSave={async (meal, reset) => {
          setMealSaving(true)
          try {
            await addMeal.mutateAsync(meal)
            reset()
          } finally {
            setMealSaving(false)
          }
        }}
      />

      <WorkoutQuickLog onSave={handleWorkoutSave} saving={workoutSaving} />

      {workouts.length > 0 && (
        <section className="card-athletic space-y-3 p-5">
          <h2 className="text-lg font-bold text-white">Today&apos;s sessions</h2>
          {workouts.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div>
                <p className="font-semibold text-white">{w.routine_name}</p>
                <p className="text-xs text-slate-500">
                  {(w.exercises || []).length} exercise(s)
                </p>
              </div>
              <ShareButton
                title="🔥 Workout logged!"
                lines={buildWorkoutShareLines(w, actual.protein)}
              />
            </div>
          ))}
        </section>
      )}

      <DailyNotes value={notes} onChange={setNotes} onSave={saveNotes} saving={notesSaving} />

      <InviteFriends />

      <p className="pb-4 text-center text-xs text-slate-600">{todayISO()}</p>
    </AppShell>
  )
}

import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

export default function ManualMealLog({ onSave, saving }) {
  const [form, setForm] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    onSave(
      {
        food_name: form.food_name || 'Meal',
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        source: 'manual',
      },
      () =>
        setForm({
          food_name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
        })
    )
  }

  return (
    <section className="card-athletic space-y-4 p-5">
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-5 w-5 text-lime-400" />
        <h2 className="text-lg font-bold text-white">Manual meal</h2>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="input-athletic"
          placeholder="What did you eat?"
          value={form.food_name}
          onChange={(e) => update('food_name', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          {[
            ['calories', 'Calories'],
            ['protein', 'Protein (g)'],
            ['carbs', 'Carbs (g)'],
            ['fat', 'Fat (g)'],
          ].map(([key, label]) => (
            <input
              key={key}
              type="number"
              min="0"
              step="0.1"
              className="input-athletic"
              placeholder={label}
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
            />
          ))}
        </div>

        <button type="submit" className="btn-ghost w-full" disabled={saving}>
          {saving ? 'Adding…' : 'Add meal entry'}
        </button>
      </form>
    </section>
  )
}

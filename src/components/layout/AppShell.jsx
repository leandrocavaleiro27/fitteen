import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3, LogOut } from 'lucide-react'
import { APP_NAME } from '../../lib/constants'

export default function AppShell({ children, onSignOut }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-cyan-400">Athlete mode</p>
          <h1 className="text-2xl font-black tracking-tight text-white neon-text-lime">{APP_NAME}</h1>
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-xl border border-slate-700 p-3 text-slate-400 hover:border-slate-500 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </header>

      <main className="flex-1 space-y-6">{children}</main>

      <BottomNav />
    </div>
  )
}

function BottomNav() {
  const linkClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition ${
      isActive ? 'text-lime-400' : 'text-slate-500 hover:text-slate-300'
    }`

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="h-6 w-6" />
          Log
        </NavLink>
        <NavLink to="/analytics" className={linkClass}>
          <BarChart3 className="h-6 w-6" />
          Stats
        </NavLink>
      </div>
    </nav>
  )
}

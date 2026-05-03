import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-xl px-4 py-3 text-sm font-medium transition',
    isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-white hover:text-slate-900',
  ].join(' ')

export function Sidebar() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Menu</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Smart Lost and Found</h2>
      </div>
      <nav className="space-y-2">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/lost-items" className={linkClass}>Lost items</NavLink>
        <NavLink to="/found-items" className={linkClass}>Found items</NavLink>
        <NavLink to="/matches" className={linkClass}>Matches</NavLink>
        <NavLink to="/claims" className={linkClass}>Claims</NavLink>
        <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
      </nav>
    </aside>
  )
}

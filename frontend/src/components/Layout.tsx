import { Link, NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900',
  ].join(' ')

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
        <div>
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Smart Lost and Found
          </Link>
          <p className="text-sm text-slate-500">Frontend connected to the Laravel API</p>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur">
        <Outlet />
      </main>
    </div>
  )
}
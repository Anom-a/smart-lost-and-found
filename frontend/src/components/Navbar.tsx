import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Search, ShieldQuestion } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchNotifications } from '../lib/apiData'
import { NotificationBell } from './NotificationBell'

export function Navbar() {
  const { user, logout } = useAuth()
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
  })

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="hidden h-12 max-w-2xl flex-1 items-center gap-3 rounded-full bg-[#f3f3fe] px-5 text-[#737686] shadow-[0_4px_12px_rgba(0,0,0,0.04)] md:flex">
        <Search className="h-5 w-5" />
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-base text-[#191b23] outline-none placeholder:text-[#737686]"
          placeholder="Search for items, claims, or reports..."
          type="search"
        />
      </label>

      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-lg font-bold text-[#003fb1] lg:hidden">FoundTrust</Link>
        <NotificationBell notifications={notifications} />
        <Link
          to="/notifications"
          className="hidden h-10 w-10 items-center justify-center rounded-full text-[#191b23] transition hover:bg-[#f3f3fe] sm:flex"
          aria-label="Help"
        >
          <ShieldQuestion className="h-5 w-5" />
        </Link>
        {user ? (
          <div className="flex items-center gap-3 border-l border-[#e2e1ed] pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#191b23]">{user.name}</p>
              <p className="text-xs text-[#737686]">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a] transition hover:bg-[#ffc8c1]"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="rounded-lg bg-[#003fb1] px-4 py-2 text-sm font-semibold text-white">Sign in</Link>
        )}
      </div>
    </div>
  )
}

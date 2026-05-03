import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
      <nav className="flex items-center gap-2">
        <Link to="/dashboard" className="text-sm font-medium text-slate-700">Dashboard</Link>
        <Link to="/lost-items" className="ml-3 text-sm font-medium text-slate-700">Lost</Link>
        <Link to="/found-items" className="ml-3 text-sm font-medium text-slate-700">Found</Link>
        <Link to="/matches" className="ml-3 text-sm font-medium text-slate-700">Matches</Link>
      </nav>

      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">{user.name}</span>
            <button onClick={logout} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">Sign out</button>
          </div>
        ) : (
          <Link to="/login" className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white">Sign in</Link>
        )}
      </div>
    </div>
  )
}

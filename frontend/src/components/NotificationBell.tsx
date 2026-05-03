import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AppNotification } from '../types/models'

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Link to="/notifications" className="relative inline-flex items-center">
      <Bell className="h-5 w-5 text-slate-700" />
      {unread > 0 ? (
        <span className="absolute -top-1 -right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">{unread}</span>
      ) : null}
    </Link>
  )
}

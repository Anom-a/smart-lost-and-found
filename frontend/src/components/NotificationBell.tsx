import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AppNotification } from '../types/models'

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Link to="/notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#191b23] dark:text-white transition hover:bg-[#f3f3fe] dark:hover:bg-gray-800">
      <Bell className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-semibold text-white">{unread}</span>
      ) : null}
    </Link>
  )
}

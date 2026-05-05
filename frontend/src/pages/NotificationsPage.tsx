import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { fetchNotifications } from '../lib/apiData'

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  if (isLoading) return <LoadingState message="Loading notifications..." />
  if (isError) return <ErrorState description="Unable to load notifications from the API." />

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
          <BellRing className="h-4 w-4" />
          System activity
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Notifications</h1>
        <p className="mt-2 text-[#434654]">Read match updates, claim updates, and system notices.</p>
      </div>
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notification) => (
          <article key={notification.id} className={`rounded-2xl border p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${notification.read ? 'border-[#e2e1ed] bg-white' : 'border-[#82f5c1] bg-[#f0fff7]'}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#191b23]">{notification.title}</h2>
              <span className="text-xs font-medium text-[#737686]">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#434654]">{notification.message}</p>
          </article>
        )) : <EmptyState title="No notifications" description="New updates will appear here." />}
      </div>
    </section>
  )
}

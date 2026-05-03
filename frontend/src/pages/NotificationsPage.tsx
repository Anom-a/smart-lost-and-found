import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
        <p className="text-slate-600">Read match updates, claim updates, and system notices.</p>
      </div>
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notification) => (
          <article key={notification.id} className={`rounded-2xl border p-4 shadow-sm ${notification.read ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{notification.title}</h2>
              <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
          </article>
        )) : <EmptyState title="No notifications" description="New updates will appear here." />}
      </div>
    </section>
  )
}

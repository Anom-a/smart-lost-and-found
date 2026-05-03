import { formatDistanceToNow } from 'date-fns'
import { notifications } from '../lib/mockData'

export function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
        <p className="text-slate-600">Read match updates, claim updates, and system notices.</p>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <article key={notification.id} className={`rounded-2xl border p-4 shadow-sm ${notification.read ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{notification.title}</h2>
              <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

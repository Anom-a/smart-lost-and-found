import { EmptyState } from '../components/ui/EmptyState'

export function NotificationsPage() {
  return (
    <section className="page-stack">
      <p className="eyebrow">Updates</p>
      <h1>Notifications</h1>
      <EmptyState title="No notifications" message="Match, claim, and system updates will appear here." />
    </section>
  )
}

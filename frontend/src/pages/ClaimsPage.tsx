import { EmptyState } from '../components/ui/EmptyState'

export function ClaimsPage() {
  return (
    <section className="page-stack">
      <p className="eyebrow">Requests</p>
      <h1>Claims</h1>
      <EmptyState title="No claim requests" message="Ownership claims will appear here for review." />
    </section>
  )
}

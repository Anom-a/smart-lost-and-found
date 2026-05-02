import { EmptyState } from '../components/ui/EmptyState'

export function MatchesPage() {
  return (
    <section className="page-stack">
      <p className="eyebrow">Matching</p>
      <h1>Matches</h1>
      <EmptyState title="No matches yet" message="Potential lost and found item matches will appear here." />
    </section>
  )
}
